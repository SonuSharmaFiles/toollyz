"use client";

import * as React from "react";
import { Check, Copy, Layers2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BACKGROUNDS,
  DEFAULT_STATE,
  type GlassState,
  toCss,
} from "@/lib/tools/css/glassmorphism";

const KEY = "toollyz:glassmorphism";

interface Saved {
  state: GlassState;
  backgroundId: string;
}

const DEFAULTS: Saved = {
  state: DEFAULT_STATE,
  backgroundId: BACKGROUNDS[0].id,
};

export default function GlassmorphismGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [s, setS] = React.useState<Saved>(DEFAULTS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Saved>;
        setS({ ...DEFAULTS, ...parsed, state: { ...DEFAULTS.state, ...(parsed.state ?? {}) } });
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

  const bg = React.useMemo(
    () => BACKGROUNDS.find((b) => b.id === s.backgroundId) ?? BACKGROUNDS[0],
    [s.backgroundId],
  );
  const css = React.useMemo(() => toCss(s.state), [s.state]);

  function update(patch: Partial<GlassState>) {
    setS((prev) => ({ ...prev, state: { ...prev.state, ...patch } }));
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
      <section
        className="relative overflow-hidden rounded-3xl border border-border/70 p-6"
        style={{ background: bg.background, minHeight: 360 }}
      >
        <div className="flex h-full min-h-[320px] items-center justify-center">
          <div
            style={{
              background: s.state.background,
              backdropFilter: `blur(${s.state.blur}px) saturate(${s.state.saturation})`,
              WebkitBackdropFilter: `blur(${s.state.blur}px) saturate(${s.state.saturation})`,
              border: `${s.state.borderWidth}px solid ${s.state.border}`,
              borderRadius: s.state.radius,
              boxShadow: `0 8px 32px rgba(0, 0, 0, ${s.state.shadow.toFixed(2)})`,
              padding: "32px 40px",
              minWidth: 260,
            }}
          >
            <div className="text-center font-heading text-white">
              <div className="text-xs uppercase tracking-widest opacity-80">Toollyz</div>
              <div className="mt-1 text-2xl font-bold">Glass card</div>
              <div className="mt-3 text-xs opacity-90">Editable below ↓</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Background</h2>
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setS((prev) => ({ ...prev, backgroundId: b.id }))}
              className={cn(
                "rounded-xl border-2 p-1.5 transition-all",
                s.backgroundId === b.id ? "border-primary scale-105" : "border-transparent hover:scale-105",
              )}
              aria-pressed={s.backgroundId === b.id}
            >
              <div
                className="h-10 w-20 rounded-lg shadow-inner"
                style={{ background: b.background }}
                aria-hidden
              />
              <div className="mt-1 text-[10px] font-medium">{b.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <Slider
          label={`Blur (${s.state.blur}px)`}
          value={s.state.blur}
          min={0}
          max={40}
          onChange={(v) => update({ blur: v })}
        />
        <Slider
          label={`Saturation (×${s.state.saturation.toFixed(2)})`}
          value={Math.round(s.state.saturation * 100)}
          min={50}
          max={300}
          onChange={(v) => update({ saturation: v / 100 })}
        />
        <Slider
          label={`Radius (${s.state.radius}px)`}
          value={s.state.radius}
          min={0}
          max={64}
          onChange={(v) => update({ radius: v })}
        />
        <Slider
          label={`Border (${s.state.borderWidth}px)`}
          value={s.state.borderWidth}
          min={0}
          max={6}
          onChange={(v) => update({ borderWidth: v })}
        />
        <Slider
          label={`Shadow (${Math.round(s.state.shadow * 100)}%)`}
          value={Math.round(s.state.shadow * 100)}
          min={0}
          max={100}
          onChange={(v) => update({ shadow: v / 100 })}
        />
        <ColorAlpha
          label="Tint"
          value={s.state.background}
          onChange={(v) => update({ background: v })}
        />
        <ColorAlpha
          label="Border colour"
          value={s.state.border}
          onChange={(v) => update({ border: v })}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Layers2 className="size-4 text-primary" />
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
          Glassmorphism only works on backgrounds that have something to blur. Place the card over a vivid gradient, photo or video — over plain white the blur is invisible. <code className="font-mono">backdrop-filter</code> is supported in all evergreen browsers; Safari needs <code className="font-mono">-webkit-backdrop-filter</code>.
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

function ColorAlpha({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [hex, alpha] = React.useMemo(() => parseRgba(value), [value]);
  return (
    <label className="space-y-1 text-xs">
      <div className="font-medium text-muted-foreground">
        {label} <span className="font-mono">({Math.round(alpha * 100)}%)</span>
      </div>
      <div className="flex gap-1">
        <Input
          type="color"
          value={hex}
          onChange={(e) => onChange(rgbaFromHex(e.target.value, alpha))}
          className="h-8 w-12 cursor-pointer p-1"
        />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(alpha * 100)}
          onChange={(e) => onChange(rgbaFromHex(hex, parseInt(e.target.value, 10) / 100))}
          className="w-full"
        />
      </div>
    </label>
  );
}

function parseRgba(v: string): [string, number] {
  const m = /^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\)/i.exec(v.trim());
  if (m) {
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    return [`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`, a];
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(v.trim());
  if (hex) return [`#${hex[1]}`, 1];
  return ["#ffffff", 0.2];
}

function rgbaFromHex(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}
