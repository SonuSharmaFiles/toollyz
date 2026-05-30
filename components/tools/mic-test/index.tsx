"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Loader2, Lock, Mic, MicOff, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";

type Status = "idle" | "requesting" | "live" | "denied" | "error" | "unsupported";

export default function MicTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [level, setLevel] = React.useState(0); // 0..1 RMS
  const [peak, setPeak] = React.useState(0);
  const [dbfs, setDbfs] = React.useState<number>(-Infinity);
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = React.useState<string | undefined>(undefined);
  const [recording, setRecording] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);

  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const rafRef = React.useRef<number>(0);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) setStatus("unsupported");
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    cancelAnimationFrame(rafRef.current);
    try { recorderRef.current?.state !== "inactive" && recorderRef.current?.stop(); } catch { /* noop */ }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") { audioCtxRef.current.close().catch(() => {}); }
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevel(0); setPeak(0); setDbfs(-Infinity);
  }

  async function start() {
    if (status === "unsupported") return;
    setStatus("requesting"); setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true });
      streamRef.current = stream;
      const AC = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new AC();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      setStatus("live");
      tick();
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list.filter((d) => d.kind === "audioinput"));
        if (!deviceId) setDeviceId(stream.getAudioTracks()[0]?.getSettings()?.deviceId);
      } catch { /* noop */ }
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError" || err.name === "SecurityError") { setStatus("denied"); setError("Microphone access was denied."); }
      else if (err.name === "NotFoundError") { setStatus("error"); setError("No microphone was found on this device."); }
      else { setStatus("error"); setError(err.message || "Couldn't access the microphone."); }
    }
  }

  function stop() { stopAll(); setStatus("idle"); }

  function tick() {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser) return;
    const len = analyser.fftSize;
    const buf = new Uint8Array(len);
    analyser.getByteTimeDomainData(buf);
    // RMS for level
    let sum = 0;
    for (let i = 0; i < len; i++) { const v = buf[i] - 128; sum += v * v; }
    const rms = Math.sqrt(sum / len) / 128;
    setLevel(rms);
    setPeak((prev) => Math.max(prev * 0.95, rms));
    setDbfs(20 * Math.log10(rms + 1e-9));
    // Draw waveform
    if (canvas) {
      const ctx2d = canvas.getContext("2d");
      if (ctx2d) {
        const W = canvas.width;
        const H = canvas.height;
        ctx2d.clearRect(0, 0, W, H);
        const grad = ctx2d.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, "#6366f1");
        grad.addColorStop(1, "#10b981");
        ctx2d.strokeStyle = grad;
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        const step = W / len;
        for (let i = 0; i < len; i++) {
          const x = i * step;
          const y = (buf[i] / 255) * H;
          if (i === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function switchDevice(id: string) {
    setDeviceId(id);
    if (status === "live") { stopAll(); await new Promise((r) => setTimeout(r, 80)); setStatus("requesting"); await start(); }
  }

  function startRecording() {
    if (!streamRef.current) return;
    try {
      chunksRef.current = [];
      const rec = new MediaRecorder(streamRef.current);
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setRecording(false);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Recording failed"); }
  }
  function stopRecording() { try { recorderRef.current?.stop(); } catch { /* noop */ } }

  if (!mounted) return <div className="h-72 animate-pulse rounded-3xl bg-muted" aria-hidden="true" />;

  const pct = Math.min(100, Math.round(level * 100 * 1.6));
  const peakPct = Math.min(100, Math.round(peak * 100 * 1.6));
  const tone = pct < 5 ? "from-slate-500 to-slate-600" : pct < 60 ? "from-emerald-400 to-emerald-500" : pct < 85 ? "from-amber-400 to-amber-500" : "from-rose-400 to-rose-500";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Mic level" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(16,185,129,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300/70">{status === "live" ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}Microphone</span>
            <span className="ml-auto font-mono text-xs text-emerald-300/70">{Number.isFinite(dbfs) ? `${dbfs.toFixed(1)} dBFS` : "—"}</span>
          </div>
          <div className="font-heading text-5xl font-bold tabular-nums text-emerald-50 sm:text-7xl">
            <AnimatedNumber value={pct} reduceMotion={!!reduceMotion} suffix="%" />
          </div>
          {/* meter */}
          <div className="relative h-5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div className={cn("h-full rounded-full bg-gradient-to-r", tone)} initial={false} animate={{ width: `${pct}%` }} transition={{ duration: reduceMotion ? 0 : 0.12 }} />
            <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/70" style={{ left: `${peakPct}%` }} />
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        {status === "unsupported" ? (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />Microphone access isn&apos;t available in this browser.</p>
        ) : status === "denied" ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">Microphone access was denied. Click the lock icon in your address bar to allow it, then press Start again.</p>
        ) : status === "error" && error ? (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{error}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {status !== "live" ? (
            <Button type="button" onClick={start} disabled={status === "requesting" || status === "unsupported"}>{status === "requesting" ? <><Loader2 className="size-4 animate-spin" />Requesting…</> : <><Mic className="size-4" />Start mic</>}</Button>
          ) : (
            <Button type="button" variant="outline" onClick={stop}><Square className="size-4" />Stop mic</Button>
          )}
          {devices.length > 0 && (
            <select value={deviceId} onChange={(e) => switchDevice(e.target.value)} className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm" aria-label="Microphone device">
              {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 6)}…`}</option>)}
            </select>
          )}
          <span className="text-xs text-muted-foreground">{status === "live" ? "Speak into your microphone to see the level." : "Click Start mic and grant permission to begin."}</span>
        </div>
      </section>

      {/* Waveform */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Volume2 className="size-4 text-primary" />Live waveform</h2>
        <canvas ref={canvasRef} width={1200} height={140} className="w-full rounded-lg border border-border/60 bg-background" />
        <p className="mt-2 text-[11px] text-muted-foreground">A flat line means silence. Talk into the mic and you should see a clear, varied wave.</p>
      </section>

      {/* Record & playback */}
      {status === "live" && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Play className="size-4 text-primary" />Record & play back</h2>
          <div className="flex flex-wrap items-center gap-2">
            {!recording ? (
              <Button type="button" size="sm" onClick={startRecording}><Mic className="size-4" />Start recording</Button>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={stopRecording}><Square className="size-4" />Stop recording</Button>
            )}
            {audioUrl && <audio src={audioUrl} controls className="flex-1" />}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Recorded audio stays in your browser — it's never uploaded. The clip is discarded when you leave or reload.</p>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Mic audio is processed in your browser via the Web Audio API — Toollyz has no server.</p>
    </div>
  );
}
