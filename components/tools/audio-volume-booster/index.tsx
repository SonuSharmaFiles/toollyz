"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AudioLines,
  Cpu,
  Download,
  Gauge,
  Headphones,
  Loader2,
  Music,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  analyzeBuffer,
  bufferToWavBlob,
  downsamplePeaks,
  formatDb,
  formatDuration,
  formatFileSize,
  predictClipping,
  renderBoosted,
  type AudioAnalysis,
  type BoostOptions,
} from "@/lib/tools/audio-booster/audio";

const SUPPORTED_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/x-m4a", "audio/m4a", "audio/x-wav"];
const SUPPORTED_EXT_HINT = ".mp3, .wav, .ogg, .m4a, .aac";
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

const BOOST_PRESETS = [
  { label: "100%", value: 1.0 },
  { label: "125%", value: 1.25 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2.0 },
  { label: "300%", value: 3.0 },
  { label: "400%", value: 4.0 },
];

interface LoadedFile {
  name: string;
  size: number;
  type: string;
  buffer: AudioBuffer;
  analysis: AudioAnalysis;
}

export default function AudioVolumeBooster() {
  const [file, setFile] = React.useState<LoadedFile | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Boost + enhancement state
  const [gain, setGain] = React.useState(2.0); // 200%
  const [normalize, setNormalize] = React.useState(false);
  const [softClip, setSoftClip] = React.useState(true);
  const [bassEnhance, setBassEnhance] = React.useState(false);
  const [voiceClarity, setVoiceClarity] = React.useState(false);
  const [stereoBoost, setStereoBoost] = React.useState(false);

  // Playback state
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const startedAtRef = React.useRef<number>(0);
  const seekOffsetRef = React.useRef<number>(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [previewBoosted, setPreviewBoosted] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(0);

  // Export
  const [isRendering, setIsRendering] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const waveCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // Stop playback on unmount
  React.useEffect(() => {
    return () => {
      stopPlayback();
      audioCtxRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live time updater
  React.useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const ctx = audioCtxRef.current;
      if (!ctx || !file) return;
      const elapsed = seekOffsetRef.current + (ctx.currentTime - startedAtRef.current);
      if (elapsed >= file.analysis.durationSec) {
        setIsPlaying(false);
        setCurrentTime(file.analysis.durationSec);
        seekOffsetRef.current = 0;
      } else {
        setCurrentTime(elapsed);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [isPlaying, file]);

  // Sync live gain
  React.useEffect(() => {
    const node = gainNodeRef.current;
    if (node) {
      node.gain.value = previewBoosted ? gain : 1;
    }
  }, [gain, previewBoosted]);

  // Redraw waveform on file/time change
  React.useEffect(() => {
    if (!file || !waveCanvasRef.current) return;
    drawWaveform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, currentTime, gain, previewBoosted]);

  function drawWaveform() {
    const canvas = waveCanvasRef.current;
    if (!canvas || !file) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const pixels = Math.max(1, Math.floor(cssWidth));
    const { min, max } = downsamplePeaks(file.buffer, pixels);
    const midY = cssHeight / 2;
    const renderGain = previewBoosted ? gain : 1;

    const progress = file.analysis.durationSec
      ? currentTime / file.analysis.durationSec
      : 0;

    const style = getComputedStyle(canvas);
    const primary = style.getPropertyValue("--primary").trim() || "#6366f1";
    const muted = style.getPropertyValue("--muted-foreground").trim() || "#94a3b8";

    for (let x = 0; x < cssWidth; x++) {
      const i = Math.min(pixels - 1, Math.floor((x / cssWidth) * pixels));
      const hi = Math.max(-1, Math.min(1, max[i] * renderGain));
      const lo = Math.max(-1, Math.min(1, min[i] * renderGain));
      const yTop = midY - hi * (cssHeight / 2 - 1);
      const yBot = midY - lo * (cssHeight / 2 - 1);
      const isPast = x / cssWidth <= progress;
      ctx.fillStyle = isPast
        ? `color-mix(in oklch, oklch(${primary}) 100%, transparent)`
        : `color-mix(in oklch, oklch(${muted}) 50%, transparent)`;
      ctx.fillRect(x, Math.min(yTop, yBot), 1, Math.max(1, Math.abs(yBot - yTop)));
    }

    // Clipping indicator line
    if (renderGain * file.analysis.peak >= 1) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(cssWidth, 1);
      ctx.moveTo(0, cssHeight - 1);
      ctx.lineTo(cssWidth, cssHeight - 1);
      ctx.stroke();
    }
  }

  React.useEffect(() => {
    const onResize = () => drawWaveform();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, currentTime, gain, previewBoosted]);

  async function loadFile(rawFile: File) {
    setError(null);
    if (rawFile.size > MAX_FILE_BYTES) {
      setError(`File is too large. Max ${formatFileSize(MAX_FILE_BYTES)}.`);
      return;
    }
    setIsLoading(true);
    try {
      stopPlayback();
      const Ctx = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = audioCtxRef.current ?? new Ctx();
      audioCtxRef.current = ctx;
      const arrayBuffer = await rawFile.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const analysis = analyzeBuffer(buffer);
      setFile({
        name: rawFile.name,
        size: rawFile.size,
        type: rawFile.type,
        buffer,
        analysis,
      });
      setCurrentTime(0);
      seekOffsetRef.current = 0;
      toast.success(`Loaded ${rawFile.name}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "This file couldn't be decoded. Try MP3, WAV, OGG or M4A.";
      setError(msg);
      toast.error("Could not decode audio");
    } finally {
      setIsLoading(false);
    }
  }

  function clearFile() {
    stopPlayback();
    setFile(null);
    setCurrentTime(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function startPlayback(fromTime?: number) {
    const ctx = audioCtxRef.current;
    if (!ctx || !file) return;
    stopPlayback();
    const src = ctx.createBufferSource();
    src.buffer = file.buffer;
    const g = ctx.createGain();
    g.gain.value = previewBoosted ? gain : 1;
    src.connect(g);
    g.connect(ctx.destination);
    const offset = fromTime ?? seekOffsetRef.current;
    seekOffsetRef.current = offset;
    startedAtRef.current = ctx.currentTime;
    src.start(0, offset);
    src.onended = () => {
      // natural end
    };
    sourceRef.current = src;
    gainNodeRef.current = g;
    if (ctx.state === "suspended") ctx.resume();
    setIsPlaying(true);
  }

  function stopPlayback() {
    try {
      sourceRef.current?.stop();
    } catch {
      /* noop */
    }
    sourceRef.current?.disconnect();
    gainNodeRef.current?.disconnect();
    sourceRef.current = null;
    gainNodeRef.current = null;
    setIsPlaying(false);
  }

  function togglePlay() {
    if (!file) return;
    if (isPlaying) {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const elapsed = seekOffsetRef.current + (ctx.currentTime - startedAtRef.current);
      seekOffsetRef.current = Math.min(elapsed, file.analysis.durationSec);
      stopPlayback();
    } else {
      const start =
        seekOffsetRef.current >= file.analysis.durationSec - 0.05
          ? 0
          : seekOffsetRef.current;
      seekOffsetRef.current = start;
      setCurrentTime(start);
      startPlayback(start);
    }
  }

  function onSeek(ratio: number) {
    if (!file) return;
    const target = Math.max(0, Math.min(file.analysis.durationSec, ratio * file.analysis.durationSec));
    seekOffsetRef.current = target;
    setCurrentTime(target);
    if (isPlaying) startPlayback(target);
  }

  async function exportWav() {
    if (!file || isRendering) return;
    setIsRendering(true);
    try {
      const opts: BoostOptions = {
        gain,
        normalize,
        softClip,
        bassEnhance,
        voiceClarity,
        stereoBoost,
      };
      const rendered = await renderBoosted(file.buffer, opts);
      const blob = bufferToWavBlob(rendered);
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}-boosted-${Math.round(gain * 100)}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Boosted WAV downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to render boosted audio");
    } finally {
      setIsRendering(false);
    }
  }

  function reset() {
    setGain(2.0);
    setNormalize(false);
    setSoftClip(true);
    setBassEnhance(false);
    setVoiceClarity(false);
    setStereoBoost(false);
    setPreviewBoosted(true);
    toast.info("Settings reset");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void loadFile(f);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void loadFile(f);
  }

  const clipping = file
    ? predictClipping(file.analysis, { gain, softClip, normalize })
    : null;

  return (
    <div className="space-y-6">
      {/* Privacy banner */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-sm"
      >
        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" />
        </span>
        <p className="text-foreground/90">
          <span className="font-medium">Your audio stays on your device.</span>{" "}
          <span className="text-foreground/70">
            Files are processed entirely in your browser using the Web Audio API.
            Nothing is uploaded, transmitted or stored on any server.
          </span>
        </p>
      </div>

      {/* Upload zone */}
      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-card/40 p-12 text-center transition-colors",
            isDragging
              ? "border-primary/60 bg-primary/5"
              : "border-border hover:border-primary/40",
          )}
        >
          <span
            aria-hidden="true"
            className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Upload className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-semibold">Drop an audio file here</p>
            <p className="text-sm text-muted-foreground">
              or click to browse — {SUPPORTED_EXT_HINT} · up to {formatFileSize(MAX_FILE_BYTES)}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Decoding…
              </>
            ) : (
              <>
                <Music className="size-4" />
                Choose audio file
              </>
            )}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
            onChange={onFileChange}
            className="hidden"
          />
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Loaded file UI */}
      {file && (
        <div className="space-y-6">
          {/* File card */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <AudioLines className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {formatDuration(file.analysis.durationSec)} ·{" "}
                  {file.analysis.channels === 1 ? "Mono" : "Stereo"} ·{" "}
                  {file.analysis.sampleRate.toLocaleString()} Hz
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
                <X className="size-3.5" />
                Remove
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Waveform + transport */}
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
            <button
              type="button"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                onSeek(ratio);
              }}
              className="block w-full rounded-xl bg-background/50 ring-1 ring-border/60"
              aria-label="Seek"
            >
              <canvas
                ref={waveCanvasRef}
                className="block h-32 w-full sm:h-40"
              />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isPlaying ? "secondary" : "default"}
                  size="icon"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDuration(currentTime)} /{" "}
                  {formatDuration(file.analysis.durationSec)}
                </span>
              </div>

              <div
                className="inline-flex items-center rounded-full border border-border bg-background p-0.5 text-xs font-medium"
                role="group"
                aria-label="Preview mode"
              >
                <button
                  type="button"
                  onClick={() => setPreviewBoosted(false)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    !previewBoosted
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBoosted(true)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    previewBoosted
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Boosted
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Boost controls */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <Label htmlFor="audio-gain" className="flex items-center gap-1.5">
                    <Volume2 className="size-3.5" />
                    Boost —{" "}
                    <span className="font-mono text-foreground tabular-nums">
                      {Math.round(gain * 100)}%
                    </span>
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDb(20 * Math.log10(gain))}
                  </span>
                </div>
                <Slider
                  id="audio-gain"
                  value={[Math.round(gain * 100)]}
                  onValueChange={(v) =>
                    setGain((Array.isArray(v) ? v[0] : v) / 100)
                  }
                  min={50}
                  max={500}
                  step={5}
                />
                <div className="flex flex-wrap gap-1">
                  {BOOST_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setGain(p.value)}
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                        Math.abs(gain - p.value) < 0.01
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {clipping && <ClippingCard clipping={clipping} />}

              <div className="space-y-2">
                <Label>Enhancements</Label>
                <div className="flex flex-wrap gap-2">
                  <ToggleChip
                    active={normalize}
                    onClick={() => setNormalize((v) => !v)}
                    label="Normalize"
                  />
                  <ToggleChip
                    active={softClip}
                    onClick={() => setSoftClip((v) => !v)}
                    label="Reduce clipping (soft limiter)"
                  />
                  <ToggleChip
                    active={bassEnhance}
                    onClick={() => setBassEnhance((v) => !v)}
                    label="Bass enhancement"
                  />
                  <ToggleChip
                    active={voiceClarity}
                    onClick={() => setVoiceClarity((v) => !v)}
                    label="Voice clarity"
                  />
                  <ToggleChip
                    active={stereoBoost}
                    onClick={() => setStereoBoost((v) => !v)}
                    label="Stereo width"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={exportWav}
                  disabled={isRendering}
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Rendering…
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Download WAV
                    </>
                  )}
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={reset}>
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Exports as lossless WAV. The current preview, including all
                enhancements, is baked into the downloaded file.
              </p>
            </div>

            {/* Metrics panel */}
            <MetricsPanel analysis={file.analysis} gain={gain} clipping={clipping} />
          </div>
        </div>
      )}

      <SecurityTips />
    </div>
  );
}

// ─── Metrics panel ────────────────────────────────────────────────────────

function MetricsPanel({
  analysis,
  gain,
  clipping,
}: {
  analysis: AudioAnalysis;
  gain: number;
  clipping: ReturnType<typeof predictClipping> | null;
}) {
  return (
    <section
      aria-label="Audio metrics"
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Gauge className="size-4 text-primary" />
        Loudness metrics
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Metric
          label="Original peak"
          value={formatDb(analysis.peakDb)}
          icon={<AudioLines className="size-3.5" />}
        />
        <Metric
          label="Original RMS"
          value={formatDb(analysis.rmsDb)}
          icon={<Waves className="size-3.5" />}
        />
        <Metric
          label="Boost"
          value={`+${formatDb(20 * Math.log10(gain)).replace("+", "")}`}
          icon={<Volume2 className="size-3.5" />}
        />
        <Metric
          label="Predicted post-peak"
          value={clipping ? formatDb(clipping.postPeakDb) : "—"}
          icon={<Cpu className="size-3.5" />}
          highlight={
            clipping?.risk === "high"
              ? "destructive"
              : clipping?.risk === "medium"
                ? "amber"
                : "primary"
          }
        />
      </dl>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: "primary" | "amber" | "destructive";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-mono text-base font-semibold tabular-nums",
          highlight === "destructive" && "text-destructive",
          highlight === "amber" && "text-amber-500",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

// ─── Clipping warning card ────────────────────────────────────────────────

function ClippingCard({
  clipping,
}: {
  clipping: ReturnType<typeof predictClipping>;
}) {
  if (clipping.risk === "safe") {
    return (
      <motion.div
        layout
        className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm"
      >
        <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
        <span className="text-foreground/90">
          <span className="font-medium">Safe boost.</span>{" "}
          <span className="text-foreground/70">
            Predicted peak{" "}
            <span className="font-mono">{formatDb(clipping.postPeakDb)}</span> — no clipping expected.
          </span>
        </span>
      </motion.div>
    );
  }
  if (clipping.risk === "medium") {
    return (
      <motion.div
        layout
        className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm"
      >
        <AlertTriangle className="size-4 shrink-0 text-amber-500" />
        <span className="text-foreground/90">
          <span className="font-medium">Approaching headroom.</span>{" "}
          <span className="text-foreground/70">
            Predicted peak{" "}
            <span className="font-mono">{formatDb(clipping.postPeakDb)}</span> — enable the soft limiter to stay clean.
          </span>
        </span>
      </motion.div>
    );
  }
  return (
    <motion.div
      layout
      className="flex items-center gap-2.5 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm"
    >
      <AlertTriangle className="size-4 shrink-0 text-destructive" />
      <span className="text-foreground/90">
        <span className="font-medium text-destructive">Clipping ahead.</span>{" "}
        <span className="text-foreground/70">
          Predicted peak{" "}
          <span className="font-mono">{formatDb(clipping.postPeakDb)}</span> — turn down the boost or enable Reduce clipping.
        </span>
      </span>
    </motion.div>
  );
}

// ─── Toggle chip ──────────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-1.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted-foreground/40",
        )}
      />
      {label}
    </button>
  );
}

// ─── Security / usage tips ────────────────────────────────────────────────

function SecurityTips() {
  const tips = [
    {
      icon: ShieldCheck,
      title: "Everything stays local",
      body: "Audio decoding, processing and export all happen with the Web Audio API in your browser. No file ever leaves your device.",
    },
    {
      icon: AlertTriangle,
      title: "Watch the clipping meter",
      body: "Going past 0 dBFS distorts the signal. The soft limiter (Reduce clipping) tames peaks gracefully — keep it on for any boost above 150%.",
    },
    {
      icon: Headphones,
      title: "Boost quiet voice recordings",
      body: "For speech, +6 dB (200%) plus Voice clarity is usually the sweet spot. Heavy boosts amplify room noise — add a quiet ambience pass afterwards.",
    },
    {
      icon: Waves,
      title: "Normalize before boosting",
      body: "Normalize first to bring peaks to a known reference (~−0.5 dB), then apply your boost. You get more headroom and a cleaner sound.",
    },
  ];
  return (
    <section
      aria-labelledby="audio-tips-heading"
      className="rounded-2xl border border-border/70 bg-card/40 p-5"
    >
      <h3
        id="audio-tips-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Headphones className="size-4 text-primary" />
        Audio tips
      </h3>
      <ul className="mt-4 grid gap-3 list-none sm:grid-cols-2">
        {tips.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3 rounded-xl border border-border/60 bg-background p-4"
          >
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="space-y-1">
              <div className="text-sm font-semibold tracking-tight">{title}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
