"use client";

import * as React from "react";
import { Check, Copy, Download, Lock, Shapes, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STYLE,
  SHAPES,
  type ShapeFill,
  type ShapeKind,
  type ShapeStyle,
  buildSvg,
} from "@/lib/tools/css/svg-shapes";

const KEY = "toollyz:svg-shapes";

interface Saved {
  kind: ShapeKind;
  style: ShapeStyle;
}

const DEFAULTS: Saved = {
  kind: "star",
  style: DEFAULT_STYLE,
};

export default function SvgShapeGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [s, setS] = React.useState<Saved>(DEFAULTS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Saved>;
        setS({
          kind: (parsed.kind as ShapeKind) ?? DEFAULTS.kind,
          style: { ...DEFAULTS.style, ...(parsed.style ?? {}), fill: { ...DEFAULTS.style.fill, ...(parsed.style?.fill ?? {}) } },
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

  const svg = React.useMemo(() => buildSvg(s.kind, s.style), [s.kind, s.style]);

  function updateStyle(patch: Partial<ShapeStyle>) {
    setS((prev) => ({ ...prev, style: { ...prev.style, ...patch } }));
  }
  function updateFill(patch: Partial<ShapeFill>) {
    setS((prev) => ({ ...prev, style: { ...prev.style, fill: { ...prev.style.fill, ...patch } } }));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("SVG copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function download() {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.kind}.svg`;
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

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Shape ({SHAPES.length})</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SHAPES.map((sh) => {
            const previewSvg = buildSvg(sh.id, { ...s.style, size: 80 });
            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => setS((prev) => ({ ...prev, kind: sh.id }))}
                className={cn(
                  "rounded-xl border-2 p-1 transition-all",
                  s.kind === sh.id ? "border-primary scale-105" : "border-transparent hover:scale-105",
                )}
                aria-pressed={s.kind === sh.id}
              >
                <div className="size-16" dangerouslySetInnerHTML={{ __html: previewSvg }} aria-hidden />
                <div className="mt-1 text-center text-[10px] font-medium">{sh.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <label className="space-y-1 text-xs">
          <div className="font-medium text-muted-foreground">Fill</div>
          <div className="flex gap-1.5">
            {(["gradient", "solid"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateFill({ type: t })}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-medium capitalize",
                  s.style.fill.type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </label>
        <label className="space-y-1 text-xs">
          <div className="font-medium text-muted-foreground">Colour 1</div>
          <Input type="color" value={s.style.fill.color1} onChange={(e) => updateFill({ color1: e.target.value })} className="h-9 w-full cursor-pointer" />
        </label>
        {s.style.fill.type === "gradient" && (
          <label className="space-y-1 text-xs">
            <div className="font-medium text-muted-foreground">Colour 2</div>
            <Input type="color" value={s.style.fill.color2} onChange={(e) => updateFill({ color2: e.target.value })} className="h-9 w-full cursor-pointer" />
          </label>
        )}
        {s.style.fill.type === "gradient" && (
          <Slider label={`Angle (${s.style.fill.angle}°)`} value={s.style.fill.angle} min={0} max={360} onChange={(v) => updateFill({ angle: v })} />
        )}
        <Slider label={`Stroke width (${s.style.strokeWidth}px)`} value={s.style.strokeWidth} min={0} max={20} onChange={(v) => updateStyle({ strokeWidth: v })} />
        {s.style.strokeWidth > 0 && (
          <label className="space-y-1 text-xs">
            <div className="font-medium text-muted-foreground">Stroke</div>
            <Input type="color" value={s.style.stroke} onChange={(e) => updateStyle({ stroke: e.target.value })} className="h-9 w-full cursor-pointer" />
          </label>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Shapes className="size-4 text-primary" />
            SVG markup
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy SVG
            </Button>
            <Button type="button" size="sm" onClick={download}>
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </div>
        <pre className="max-h-56 overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px]">
          {svg}
        </pre>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Shape building and SVG export run entirely in your browser — Toollyz has no server.
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
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} className="w-full" />
    </label>
  );
}
