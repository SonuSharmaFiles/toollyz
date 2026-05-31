"use client";

import * as React from "react";
import { Check, Copy, Download, Lock, Shapes, Shuffle, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type BlobFill,
  type BlobOptions,
  DEFAULT_OPTIONS,
  FILL_PRESETS,
  buildSvg,
} from "@/lib/tools/css/svg-blob";

const KEY = "toollyz:svg-blob";

interface Saved {
  options: BlobOptions;
  fill: BlobFill;
}

const DEFAULTS: Saved = {
  options: DEFAULT_OPTIONS,
  fill: FILL_PRESETS[0].fill,
};

export default function SvgBlobGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [s, setS] = React.useState<Saved>(DEFAULTS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Saved>;
        setS({
          options: { ...DEFAULTS.options, ...(parsed.options ?? {}) },
          fill: { ...DEFAULTS.fill, ...(parsed.fill ?? {}) },
        });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* noop */
    }
  }, [s, mounted]);

  const svg = React.useMemo(() => buildSvg(s.options, s.fill), [s.options, s.fill]);

  function updateOpt(patch: Partial<BlobOptions>) {
    setS((prev) => ({ ...prev, options: { ...prev.options, ...patch } }));
  }
  function updateFill(patch: Partial<BlobFill>) {
    setS((prev) => ({ ...prev, fill: { ...prev.fill, ...patch } }));
  }
  function randomize() {
    updateOpt({ seed: Math.floor(Math.random() * 1_000_000) });
  }

  async function copyMarkup() {
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("SVG markup copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function download() {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blob-${s.options.seed}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-muted/30 p-6">
        <div
          className="mx-auto aspect-square w-full max-w-[420px]"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <Slider
          label={`Complexity (${s.options.complexity} points)`}
          value={s.options.complexity}
          min={4}
          max={20}
          onChange={(v) => updateOpt({ complexity: v })}
        />
        <Slider
          label={`Contrast (${s.options.contrast}%)`}
          value={s.options.contrast}
          min={5}
          max={80}
          onChange={(v) => updateOpt({ contrast: v })}
        />
        <label className="space-y-1 text-xs">
          <div className="font-medium text-muted-foreground">Seed</div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={s.options.seed}
              onChange={(e) => updateOpt({ seed: parseInt(e.target.value || "0", 10) })}
              className="h-9 font-mono text-xs"
            />
            <Button type="button" size="sm" variant="outline" onClick={randomize}>
              <Shuffle className="size-3.5" />
              Random
            </Button>
          </div>
        </label>
        <Slider
          label={`Fill angle (${s.fill.angle}°)`}
          value={s.fill.angle}
          min={0}
          max={360}
          onChange={(v) => updateFill({ angle: v })}
        />
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Fill palette</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {FILL_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => updateFill(p.fill)}
              className={cn(
                "rounded-xl border-2 p-1.5 transition-all",
                s.fill.color1 === p.fill.color1 && s.fill.color2 === p.fill.color2
                  ? "border-primary scale-105"
                  : "border-transparent hover:scale-105",
              )}
              aria-pressed={s.fill.color1 === p.fill.color1 && s.fill.color2 === p.fill.color2}
            >
              <div
                className="h-8 w-16 rounded-lg shadow-inner"
                style={{
                  background:
                    p.fill.type === "gradient"
                      ? `linear-gradient(${p.fill.angle}deg, ${p.fill.color1}, ${p.fill.color2})`
                      : p.fill.color1,
                }}
                aria-hidden
              />
              <div className="mt-1 text-[10px] font-medium">{p.label}</div>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-xs">
            <div className="font-medium text-muted-foreground">Type</div>
            <div className="flex gap-1.5">
              {(["gradient", "solid"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateFill({ type: t })}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium capitalize",
                    s.fill.type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </label>
          <label className="space-y-1 text-xs">
            <div className="font-medium text-muted-foreground">Colour 1</div>
            <Input
              type="color"
              value={s.fill.color1}
              onChange={(e) => updateFill({ color1: e.target.value })}
              className="h-9 w-full cursor-pointer"
            />
          </label>
          {s.fill.type === "gradient" && (
            <label className="space-y-1 text-xs">
              <div className="font-medium text-muted-foreground">Colour 2</div>
              <Input
                type="color"
                value={s.fill.color2}
                onChange={(e) => updateFill({ color2: e.target.value })}
                className="h-9 w-full cursor-pointer"
              />
            </label>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Shapes className="size-4 text-primary" />
            SVG markup
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copyMarkup}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy SVG
            </Button>
            <Button type="button" size="sm" onClick={download}>
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </div>
        <pre className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px]">
          {svg}
        </pre>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Path generation and rendering run entirely in your browser — same seed always reproduces the same blob.
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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="space-y-1 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full"
      />
    </label>
  );
}
