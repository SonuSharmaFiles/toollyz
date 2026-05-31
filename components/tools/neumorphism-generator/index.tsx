"use client";

import * as React from "react";
import { Check, Copy, Layers3, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STATE,
  type NeumorphState,
  PRESETS,
  toBackground,
  toBoxShadow,
  toCss,
} from "@/lib/tools/css/neumorphism";

const KEY = "toollyz:neumorphism";

export default function NeumorphismGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<NeumorphState>(DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NeumorphState>;
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

  const css = React.useMemo(() => toCss(state), [state]);
  const bg = toBackground(state);
  const shadow = toBoxShadow(state);

  function update(patch: Partial<NeumorphState>) {
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

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 p-6" style={{ background: state.base }}>
        <div className="flex min-h-[280px] items-center justify-center gap-8">
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: state.radius,
              background: bg,
              boxShadow: shadow,
            }}
          />
          <div
            style={{
              padding: "16px 32px",
              borderRadius: 999,
              background: bg,
              boxShadow: shadow,
              fontWeight: 600,
              color: darken(state.base, 60),
            }}
          >
            Click me
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Presets</h2>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setState((s) => ({ ...s, ...p.state }))}
              className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Variant</h2>
        <div className="flex flex-wrap gap-1.5">
          {(["flat", "convex", "concave", "pressed"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => update({ variant: v })}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium capitalize",
                state.variant === v ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Surface colour</div>
          <Input
            type="color"
            value={state.base}
            onChange={(e) => update({ base: e.target.value })}
            className="h-10 w-full cursor-pointer"
          />
        </label>
        <Slider label={`Distance (${state.distance}px)`} value={state.distance} min={2} max={32} onChange={(v) => update({ distance: v, blur: v * 2 })} />
        <Slider label={`Blur (${state.blur}px)`} value={state.blur} min={4} max={64} onChange={(v) => update({ blur: v })} />
        <Slider label={`Intensity (${state.intensity}%)`} value={state.intensity} min={4} max={50} onChange={(v) => update({ intensity: v })} />
        <Slider label={`Radius (${state.radius}px)`} value={state.radius} min={0} max={80} onChange={(v) => update({ radius: v })} />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Layers3 className="size-4 text-primary" />
            CSS
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy CSS
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs">
          {css}
        </pre>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground">Heads-up</div>
        <p className="mt-1">
          Neumorphism only reads correctly when the page background <em>matches</em> the surface colour — the entire effect comes from the two diagonal shadows. Drop the surface inside a container that uses the same base colour. Avoid below 15% intensity (looks flat) or above 35% (looks fake). Pressed variant is ideal for active buttons.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Preview and CSS generation run entirely in your browser — Toollyz has no server.
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

function darken(hex: string, pct: number): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex);
  if (!m) return "#374151";
  const r = parseInt(m[1], 16) * (1 - pct / 100);
  const g = parseInt(m[2], 16) * (1 - pct / 100);
  const b = parseInt(m[3], 16) * (1 - pct / 100);
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
