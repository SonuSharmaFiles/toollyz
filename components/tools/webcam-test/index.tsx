"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { AlertTriangle, Camera, Download, FlipHorizontal, Loader2, Lock, Square, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";

type Status = "idle" | "requesting" | "live" | "denied" | "error" | "unsupported";

interface VideoFrameMeta { presentedFrames?: number }

export default function WebcamTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = React.useState<string | undefined>(undefined);
  const [res, setRes] = React.useState({ w: 0, h: 0 });
  const [fps, setFps] = React.useState(0);
  const [snapshots, setSnapshots] = React.useState<string[]>([]);
  const [recording, setRecording] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [mirror, setMirror] = React.useState(true);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const lastFrameAt = React.useRef(0);
  const frameCount = React.useRef(0);

  React.useEffect(() => {
    setMounted(true);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) setStatus("unsupported");
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    try { recorderRef.current?.state !== "inactive" && recorderRef.current?.stop(); } catch { /* noop */ }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    frameCount.current = 0;
    setFps(0);
  }

  async function start() {
    if (status === "unsupported") return;
    setStatus("requesting"); setError(null);
    try {
      const constraints: MediaStreamConstraints = { video: deviceId ? { deviceId: { exact: deviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      setRes({ w: settings.width ?? 0, h: settings.height ?? 0 });
      setStatus("live");
      hookFrameRate();
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list.filter((d) => d.kind === "videoinput"));
        if (!deviceId) setDeviceId(settings.deviceId);
      } catch { /* noop */ }
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError" || err.name === "SecurityError") { setStatus("denied"); setError("Camera access was denied."); }
      else if (err.name === "NotFoundError") { setStatus("error"); setError("No camera was found on this device."); }
      else { setStatus("error"); setError(err.message || "Couldn't access the camera."); }
    }
  }

  function hookFrameRate() {
    const video = videoRef.current;
    if (!video) return;
    const v = video as unknown as { requestVideoFrameCallback?: (cb: (now: number, meta: VideoFrameMeta) => void) => number };
    if (v.requestVideoFrameCallback) {
      const tick = (now: number) => {
        frameCount.current++;
        if (lastFrameAt.current === 0) lastFrameAt.current = now;
        if (now - lastFrameAt.current >= 500) {
          setFps(Math.round((frameCount.current / (now - lastFrameAt.current)) * 1000));
          frameCount.current = 0;
          lastFrameAt.current = now;
        }
        if (streamRef.current && v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick);
      };
      v.requestVideoFrameCallback(tick);
    } else {
      const id = window.setInterval(() => {
        const track = streamRef.current?.getVideoTracks()[0];
        const settings = track?.getSettings();
        if (settings?.frameRate) setFps(Math.round(settings.frameRate));
      }, 1000);
      return () => window.clearInterval(id);
    }
  }

  function stop() { stopAll(); setStatus("idle"); }
  async function switchDevice(id: string) { setDeviceId(id); if (status === "live") { stopAll(); await new Promise((r) => setTimeout(r, 80)); await start(); } }

  function snapshot() {
    const video = videoRef.current;
    if (!video || res.w === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || res.w;
    canvas.height = video.videoHeight || res.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (mirror) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setSnapshots((prev) => [canvas.toDataURL("image/png"), ...prev].slice(0, 4));
    toast.success("Snapshot taken");
  }

  function startRecording() {
    if (!streamRef.current) return;
    try {
      chunksRef.current = [];
      const rec = new MediaRecorder(streamRef.current, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(URL.createObjectURL(blob));
        setRecording(false);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Recording failed"); }
  }
  function stopRecording() { try { recorderRef.current?.stop(); } catch { /* noop */ } }

  function downloadSnapshot(dataUrl: string, i: number) {
    const a = document.createElement("a"); a.href = dataUrl; a.download = `snapshot-${Date.now()}-${i}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success("Downloaded");
  }

  if (!mounted) return <div className="h-72 animate-pulse rounded-3xl bg-muted" aria-hidden="true" />;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Webcam summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Resolution" value={res.w > 0 ? `${res.w}×${res.h}` : "—"} />
          <NumStat label="FPS" value={fps} reduceMotion={!!reduceMotion} />
          <NumStat label="Snapshots" value={snapshots.length} reduceMotion={!!reduceMotion} />
          <Stat label="Status" value={status === "live" ? "Live" : status === "requesting" ? "Connecting" : status === "denied" ? "Denied" : status === "unsupported" ? "Unsupported" : "Idle"} accent={status === "live" ? "text-emerald-300" : status === "denied" ? "text-rose-300" : undefined} />
        </div>
      </section>

      {/* Preview */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-black" style={{ aspectRatio: res.w && res.h ? `${res.w}/${res.h}` : "16/9" }}>
          <video ref={videoRef} playsInline muted className={cn("h-full w-full object-cover", mirror && "scale-x-[-1]")} />
          {status !== "live" && (
            <div className="absolute inset-0 grid place-items-center text-center text-sm text-white/70">
              {status === "unsupported" ? <span className="flex items-center gap-2"><VideoOff className="size-5" />Camera access isn&apos;t available in this browser.</span>
                : status === "denied" ? <span className="flex items-center gap-2"><VideoOff className="size-5" />Camera access was denied. Click the lock icon in the address bar to allow it.</span>
                : status === "error" && error ? <span className="flex items-center gap-2"><AlertTriangle className="size-5" />{error}</span>
                : <span className="flex flex-col items-center gap-2"><Video className="size-8" />Click Start camera and grant permission to see your webcam.</span>}
            </div>
          )}
          {recording && <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-rose-600 px-2 py-1 text-[11px] font-medium text-white"><span className="block size-2 rounded-full bg-white animate-pulse" />REC</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status !== "live" ? (
            <Button type="button" onClick={start} disabled={status === "requesting" || status === "unsupported"}>{status === "requesting" ? <><Loader2 className="size-4 animate-spin" />Requesting…</> : <><Video className="size-4" />Start camera</>}</Button>
          ) : (
            <Button type="button" variant="outline" onClick={stop}><Square className="size-4" />Stop camera</Button>
          )}
          {devices.length > 0 && (
            <select value={deviceId} onChange={(e) => switchDevice(e.target.value)} className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm" aria-label="Camera device">
              {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 6)}…`}</option>)}
            </select>
          )}
          <Button type="button" size="sm" variant="outline" onClick={() => setMirror((m) => !m)}><FlipHorizontal className="size-4" />{mirror ? "Un-mirror" : "Mirror"}</Button>
          {status === "live" && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={snapshot}><Camera className="size-4" />Snapshot</Button>
              {!recording ? <Button type="button" size="sm" variant="outline" onClick={startRecording}><Video className="size-4" />Record</Button> : <Button type="button" size="sm" variant="outline" onClick={stopRecording}><Square className="size-4" />Stop recording</Button>}
            </>
          )}
        </div>
      </section>

      {/* Snapshots */}
      {snapshots.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Camera className="size-4 text-primary" />Snapshots</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {snapshots.map((s, i) => (
              <div key={i} className="space-y-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s} alt={`Snapshot ${i + 1}`} className="aspect-video w-full rounded-lg border border-border/60 object-cover" />
                <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => downloadSnapshot(s, i)}><Download className="size-4" />PNG</Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recorded video */}
      {videoUrl && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Video className="size-4 text-primary" />Recording</h2>
          <video src={videoUrl} controls className="w-full rounded-lg border border-border/60" />
          <a href={videoUrl} download="webcam-recording.webm" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><Download className="size-4" />Download .webm</a>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Video is processed in your browser — nothing is uploaded. Recorded clips and snapshots are discarded when you leave or reload.</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (<div className="space-y-1"><div className="text-xs font-medium text-indigo-300/70">{label}</div><div className={cn("font-heading text-xl font-bold tabular-nums sm:text-2xl break-all", accent ?? "text-indigo-50")}>{value}</div></div>);
}
function NumStat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (<div className="space-y-1"><div className="text-xs font-medium text-indigo-300/70">{label}</div><div className="font-heading text-2xl font-bold tabular-nums text-indigo-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div></div>);
}
