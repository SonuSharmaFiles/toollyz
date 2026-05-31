"use client";

import * as React from "react";
import { Check, Copy, Download, Image as ImageIcon, Lock, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STATE,
  type NoiseMode,
  type NoiseState,
  buildCssFromDataUrl,
  buildSvg,
  renderNoiseToCanvas,
} from "@/lib/tools/css/noise-texture";

const KEY = "toollyz:noise-texture";

const PREVIEW_BACKGROUNDS = [
  { label: "Sunset", value: "linear-gradient(135deg, #fb923c, #db2777)" },
  { label: "Ocean", value: "linear-gradient(135deg, #0ea5e9, #14b8a6)" },
  { label: "Forest", value: "linear-gradient(135deg, #22c55e, #f59e0b)" },
  { label: "Midnight", value: "linear-gradient(135deg, #0f172a, #6366f1)" },
  { label: "Frost", value: "linear-gradient(135deg, #f1f5f9, #e0e7ff)" },
];

const BLEND_MODES = ["normal", "overlay", "multiply", "screen", "soft-light"] as const;

export default function NoiseTextureGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<NoiseState>(DEFAULT_STATE);
  const [bgIdx, setBgIdx] = React.useState(3);
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NoiseState>;
        setState({ ...DEFAULT_STATE, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    if (state.mode === "canvas") {
      const c = canvasRef.current;
      if (!c) return;
      renderNoiseToCanvas(c, state);
      setDataUrl(c.toDataURL("image/png"));
    } else {
      const svg = buildSvg(state);
      // Base64-encode for data URL (safer than encodeURIComponent for blend mode previews).
      const b64 = typeof btoa !== "undefined" ? btoa(unescape(encodeURIComponent(svg))) : "";
      setDataUrl(`data:image/svg+xml;base64,${b64}`);
    }
  }, [state, mounted]);

  const css = React.useMemo(
    () => (dataUrl ? buildCssFromDataUrl(dataUrl, state) : "(rendering…)"),
    [dataUrl, state],
  );

  function update(patch: Partial<NoiseState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("CSS copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function downloadPng() {
    if (state.mode === "svg") {
      // Render SVG to a canvas then download.
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = state.size;
        c.height = state.size;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        c.toBlob((blob) => {
          if (!blob) return;
          downloadBlob(blob, `noise-${state.size}.png`);
        }, "image/png");
      };
      img.src = dataUrl;
      return;
    }
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `noise-${state.size}.png`);
    }, "image/png");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const bg = PREVIEW_BACKGROUNDS[bgIdx];

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-3xl border border-border/70"
        style={{ background: bg.value, minHeight: 320 }}
      >
        {dataUrl && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${dataUrl}")`,
              backgroundSize: `${state.size}px ${state.size}px`,
              backgroundRepeat: "repeat",
              opacity: state.opacity / 100,
              mixBlendMode: state.blendMode as React.CSSProperties["mixBlendMode"],
            }}
          />
        )}
        <div className="relative flex h-full min-h-[320px] items-center justify-center">
          <div className="text-center font-heading text-white drop-shadow">
            <div className="text-xs uppercase tracking-widest opacity-80">Toollyz</div>
            <div className="mt-1 text-2xl font-bold">Noise overlay</div>
          </div>
        </div>
      </section>

      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Engine</h2>
        <div className="flex flex-wrap gap-1.5">
          {(["canvas", "svg"] as NoiseMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ mode: m })}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium capitalize",
                state.mode === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
              )}
            >
              {m === "canvas" ? "Canvas PNG" : "SVG turbulence"}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <Slider label={`Size (${state.size}px)`} value={state.size} min={32} max={768} step={32} onChange={(v) => update({ size: v })} />
        <Slider label={`Contrast (${state.contrast}%)`} value={state.contrast} min={10} max={100} onChange={(v) => update({ contrast: v })} />
        <Slider label={`Opacity (${state.opacity}%)`} value={state.opacity} min={5} max={100} onChange={(v) => update({ opacity: v })} />
        {state.mode === "svg" && (
          <Slider
            label={`Frequency (${state.frequency.toFixed(2)})`}
            value={Math.round(state.frequency * 100)}
            min={5}
            max={300}
            onChange={(v) => update({ frequency: v / 100 })}
          />
        )}
        <label className="space-y-1 text-xs">
          <div className="font-medium text-muted-foreground">Blend mode</div>
          <select
            value={state.blendMode}
            onChange={(e) => update({ blendMode: e.target.value as NoiseState["blendMode"] })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            {BLEND_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 text-xs">
          <input
            type="checkbox"
            checked={state.monochrome}
            onChange={(e) => update({ monochrome: e.target.checked })}
            className="size-4 rounded border-input"
          />
          Monochrome (greyscale grain)
        </label>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Preview background</h2>
        <div className="flex flex-wrap gap-2">
          {PREVIEW_BACKGROUNDS.map((b, i) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setBgIdx(i)}
              className={cn(
                "rounded-xl border-2 p-1.5 transition-all",
                bgIdx === i ? "border-primary scale-105" : "border-transparent hover:scale-105",
              )}
              aria-pressed={bgIdx === i}
            >
              <div className="h-8 w-16 rounded-lg shadow-inner" style={{ background: b.value }} aria-hidden />
              <div className="mt-1 text-[10px] font-medium">{b.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Waves className="size-4 text-primary" />
            CSS
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy CSS
            </Button>
            <Button type="button" size="sm" onClick={downloadPng}>
              <Download className="size-3.5" />
              Download PNG
            </Button>
          </div>
        </div>
        <pre className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px]">
          {css}
        </pre>
        <p className="text-[11px] text-muted-foreground">
          <ImageIcon className="inline size-3 mr-1" />
          The data URL embeds the texture — no extra HTTP request, but increases CSS size. Use Download PNG and host as a static asset for production.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Noise generation runs entirely in your browser — Toollyz has no server.
        <Sparkles className="ml-auto size-3" />
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="space-y-1 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full"
      />
    </label>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
