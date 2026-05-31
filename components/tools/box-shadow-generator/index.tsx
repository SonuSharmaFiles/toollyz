"use client";

import * as React from "react";
import {
  Box,
  Check,
  Copy,
  Eraser,
  Layers,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PRESETS,
  TARGET_PRESETS,
  type ShadowLayer,
  type TargetId,
  newLayer,
  toCss,
} from "@/lib/tools/css/box-shadow";

const KEY = "toollyz:box-shadow";

interface Saved {
  layers: ShadowLayer[];
  targetId: TargetId;
  bg: string;
}

const DEFAULTS: Saved = {
  layers: PRESETS[1].layers, // Elevated
  targetId: "card",
  bg: "#f1f5f9",
};

export default function BoxShadowGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<Saved>(DEFAULTS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Saved>;
        setState({ ...DEFAULTS, ...parsed });
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

  const target = React.useMemo(
    () => TARGET_PRESETS.find((t) => t.id === state.targetId) ?? TARGET_PRESETS[0],
    [state.targetId],
  );

  const css = React.useMemo(() => toCss(state.layers), [state.layers]);

  function update(id: string, patch: Partial<ShadowLayer>) {
    setState((s) => ({ ...s, layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }
  function remove(id: string) {
    setState((s) => ({ ...s, layers: s.layers.filter((l) => l.id !== id) }));
  }
  function add() {
    setState((s) => ({ ...s, layers: [...s.layers, newLayer()] }));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`box-shadow: ${css};`);
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
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 p-6" style={{ background: state.bg }}>
        <div className="flex min-h-[280px] items-center justify-center">
          <div
            style={{
              width: target.w,
              height: target.h,
              borderRadius: target.radius,
              background: target.bg,
              boxShadow: css,
            }}
          />
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <Field label="Preview shape">
          <div className="flex flex-wrap gap-1">
            {TARGET_PRESETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setState((s) => ({ ...s, targetId: t.id }))}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs font-medium",
                  state.targetId === t.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Stage background">
          <Input
            type="color"
            value={state.bg.startsWith("#") ? state.bg : "#f1f5f9"}
            onChange={(e) => setState((s) => ({ ...s, bg: e.target.value }))}
            className="h-9 w-full cursor-pointer"
          />
        </Field>
        <Field label="Presets">
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    layers: p.layers.map((l) => ({ ...l, id: newLayer().id })),
                  }))
                }
                className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Layers className="size-4 text-primary" />
            Layers ({state.layers.length})
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={add}>
              <Plus className="size-3.5" />
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setState((s) => ({ ...s, layers: [] }))}
            >
              <Eraser className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>

        {state.layers.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
            No layers. Add one to start shaping a shadow.
          </p>
        )}

        <div className="space-y-2">
          {state.layers.map((l, idx) => (
            <div key={l.id} className="space-y-2 rounded-xl border border-border/60 bg-background/50 p-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Layer {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={l.inset}
                      onChange={(e) => update(l.id, { inset: e.target.checked })}
                      className="size-3.5 rounded border-input"
                    />
                    inset
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500"
                    aria-label="Remove layer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Slider label="X offset" value={l.x} min={-60} max={60} onChange={(v) => update(l.id, { x: v })} />
                <Slider label="Y offset" value={l.y} min={-60} max={60} onChange={(v) => update(l.id, { y: v })} />
                <Slider label="Blur" value={l.blur} min={0} max={80} onChange={(v) => update(l.id, { blur: v })} />
                <Slider label="Spread" value={l.spread} min={-30} max={30} onChange={(v) => update(l.id, { spread: v })} />
                <ColorField value={l.color} onChange={(c) => update(l.id, { color: c })} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Box className="size-4 text-primary" />
            CSS
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy CSS
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs">
          {`box-shadow: ${css};`}
        </pre>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Sparkles and pixels — everything renders in your browser. Toollyz has no server.
        <Sparkles className="ml-auto size-3" />
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
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
      <div className="flex justify-between text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
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

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hex, alpha] = React.useMemo(() => parseRgba(value), [value]);
  return (
    <label className="space-y-1 text-xs">
      <div className="text-muted-foreground">Color</div>
      <div className="flex gap-1">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(rgbaFromHex(e.target.value, alpha))}
          className="h-7 w-9 cursor-pointer rounded border border-input bg-background"
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
  return ["#000000", 0.2];
}

function rgbaFromHex(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}
