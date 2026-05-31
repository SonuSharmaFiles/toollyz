"use client";

import * as React from "react";
import { Check, Copy, Grid3X3, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STATE,
  type PatternKind,
  type PatternState,
  PRESETS,
  toCss,
} from "@/lib/tools/css/pattern-bg";

const KEY = "toollyz:pattern-bg";

export default function PatternBackgroundGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<PatternState>(DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PatternState>;
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

  // Convert CSS string to a React inline style by parsing background-color,
  // background-image, background-size, background-position lines.
  const previewStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties & Record<string, string> = {};
    for (const line of css.split(";")) {
      const m = /^\s*([a-z-]+)\s*:\s*([\s\S]+?)\s*$/.exec(line);
      if (!m) continue;
      const prop = m[1];
      const val = m[2].trim();
      if (prop === "background-color") style.backgroundColor = val;
      else if (prop === "background-image") style.backgroundImage = val;
      else if (prop === "background-size") style.backgroundSize = val;
      else if (prop === "background-position") style.backgroundPosition = val;
    }
    return style;
  }, [css]);

  function update(patch: Partial<PatternState>) {
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
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl border border-border/70"
        style={{ ...previewStyle, minHeight: 320 }}
      />

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Presets</h2>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update(p.state)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium",
                state.kind === p.state.kind
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Pattern</div>
          <select
            value={state.kind}
            onChange={(e) => update({ kind: e.target.value as PatternKind })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="stripes-diagonal">Diagonal stripes</option>
            <option value="stripes-horizontal">Horizontal stripes</option>
            <option value="stripes-vertical">Vertical stripes</option>
            <option value="checks">Checks</option>
            <option value="grid">Grid</option>
            <option value="dots">Dots</option>
            <option value="polka">Polka dots</option>
            <option value="diagonal-cross">Cross-hatch</option>
          </select>
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Foreground</div>
          <Input type="color" value={state.color1} onChange={(e) => update({ color1: e.target.value })} className="h-9 w-full cursor-pointer" />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Background</div>
          <Input type="color" value={state.color2} onChange={(e) => update({ color2: e.target.value })} className="h-9 w-full cursor-pointer" />
        </label>
        <Slider label={`Tile size (${state.size}px)`} value={state.size} min={4} max={96} onChange={(v) => update({ size: v })} />
        <Slider label={`Thickness (${state.thickness}%)`} value={state.thickness} min={2} max={80} onChange={(v) => update({ thickness: v })} />
        {state.kind === "stripes-diagonal" && (
          <Slider label={`Angle (${state.angle}°)`} value={state.angle} min={0} max={180} onChange={(v) => update({ angle: v })} />
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Grid3X3 className="size-4 text-primary" />
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

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Pure-CSS pattern — no images, no SVG, just gradients. Renders in your browser.
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
