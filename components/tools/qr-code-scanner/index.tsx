"use client";

import * as React from "react";
import jsQR from "jsqr";
import {
  Camera,
  CameraOff,
  Copy,
  Eraser,
  ExternalLink,
  Image as ImageIcon,
  Lock,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HISTORY_KEY = "toollyz:qr-scan-history";
const HISTORY_CAP = 24;

interface Scan {
  text: string;
  at: number;
  source: "camera" | "file";
}

export default function QrCodeScanner() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [latest, setLatest] = React.useState<Scan | null>(null);
  const [history, setHistory] = React.useState<Scan[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Scan[];
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, HISTORY_CAP));
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_CAP)));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  React.useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) return;
      v.srcObject = stream;
      await v.play();
      setScanning(true);
      tick();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera failed to start.";
      setError(msg);
      toast.error(msg);
    }
  }

  function recordScan(text: string, source: "camera" | "file") {
    const scan: Scan = { text, at: Date.now(), source };
    setLatest(scan);
    setHistory((h) => {
      // Dedupe consecutive same-text scans.
      if (h[0]?.text === text) return h;
      return [scan, ...h].slice(0, HISTORY_CAP);
    });
  }

  function tick() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !streamRef.current) return;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      const w = v.videoWidth;
      const h = v.videoHeight;
      if (w > 0 && h > 0) {
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h);
          const code = jsQR(data.data, w, h, { inversionAttempts: "dontInvert" });
          if (code && code.data) {
            recordScan(code.data, "camera");
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function handleFile(file: File) {
    setError(null);
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = canvasRef.current ?? document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(data.data, c.width, c.height);
      URL.revokeObjectURL(url);
      if (code && code.data) {
        recordScan(code.data, "file");
        toast.success("QR decoded");
      } else {
        toast.error("No QR code found in image");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read image");
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 overflow-hidden rounded-3xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Camera className="size-4 text-primary" />
            Live camera scan
          </h2>
          <div className="flex gap-2">
            {!scanning ? (
              <Button type="button" size="sm" onClick={startCamera}>
                <Camera className="size-3.5" />
                Start camera
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
                <CameraOff className="size-3.5" />
                Stop
              </Button>
            )}
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-2xl border border-border/60 bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn("h-full w-full object-cover", !scanning && "opacity-30")}
          />
          {!scanning && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
              <ScanLine className="size-12 opacity-70" />
              <p className="mt-2 text-sm">Tap 'Start camera' to scan a QR</p>
            </div>
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-3/5 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
            {error} — most likely a permissions denial. Reload and grant camera access, or use the file upload below.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ImageIcon className="size-4 text-primary" />
          Decode from an image file
        </h2>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/50 p-4 text-xs">
          <Upload className="size-4 text-primary" />
          <span className="flex-1">
            Drop a PNG / JPG containing a QR code, or click to pick one — the bytes never leave your browser.
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </label>
      </section>

      {latest && (
        <section className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
              Latest scan ({latest.source})
            </h2>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => copyText(latest.text)}>
                <Copy className="size-3.5" />
                Copy
              </Button>
              {/^https?:\/\//i.test(latest.text) && (
                <a
                  href={latest.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium hover:bg-muted"
                >
                  <ExternalLink className="size-3.5" />
                  Open
                </a>
              )}
            </div>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/50 p-3 font-mono text-xs whitespace-pre-wrap break-all">
            {latest.text}
          </pre>
        </section>
      )}

      {history.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">History ({history.length})</h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setHistory([])}>
              <Eraser className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1 list-none">
            {history.map((s, i) => (
              <li key={`${s.at}-${i}`} className="flex items-baseline justify-between gap-2 rounded-lg border border-border/40 bg-background/40 p-2 text-xs">
                <span className="break-all font-mono">{s.text}</span>
                <span className="shrink-0 font-mono text-muted-foreground">
                  {new Date(s.at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Camera frames and uploaded files are decoded entirely in your browser via jsQR — nothing is uploaded.
        <Sparkles className="ml-auto size-3" />
      </p>
    </div>
  );
}
