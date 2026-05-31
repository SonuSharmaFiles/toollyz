"use client";

import * as React from "react";
import { Check, Copy, Lock, Play, ShieldCheck, Sparkle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type AnimationState,
  type Direction,
  type Timing,
  DEFAULT_STATE,
  PRESETS,
  buildCss,
} from "@/lib/tools/css/css-animation";

const KEY = "toollyz:css-animation";

const TIMINGS: Timing[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "cubic-bezier(.34,1.56,.64,1)",
  "cubic-bezier(.5,0,.5,1)",
];

export default function CssAnimationGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<AnimationState>(DEFAULT_STATE);
  const [playKey, setPlayKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AnimationState>;
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

  const css = React.useMemo(() => buildCss(state), [state]);

  function update(patch: Partial<AnimationState>) {
    setState((s) => ({ ...s, ...patch }));
    setPlayKey((k) => k + 1);
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

  const iter = state.iteration === -1 ? "infinite" : String(state.iteration);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes ${state.name}-preview {
${[...state.stops]
  .sort((a, b) => a.pct - b.pct)
  .map(
    (st) =>
      `          ${st.pct}% { transform: translate(${st.tx}px, ${st.ty}px) scale(${st.scale.toFixed(
        2,
      )}) rotate(${st.rotate}deg); opacity: ${st.opacity.toFixed(2)}; }`,
  )
  .join("\n")}
        }
      `}</style>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-100 via-rose-100 to-amber-100 p-6 dark:from-indigo-950 dark:via-rose-950 dark:to-amber-950">
        <div className="flex min-h-[280px] items-center justify-center">
          <div
            key={playKey}
            className="size-24 rounded-2xl bg-primary shadow-lg"
            style={{
              animationName: `${state.name}-preview`,
              animationDuration: `${state.duration}ms`,
              animationTimingFunction: state.timing,
              animationDelay: `${state.delay}ms`,
              animationIterationCount: iter,
              animationDirection: state.direction,
              animationFillMode: "both",
            }}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <Button type="button" size="sm" variant="outline" onClick={() => setPlayKey((k) => k + 1)}>
            <Play className="size-3.5" />
            Replay
          </Button>
        </div>
      </section>

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
                state.name === p.state.name
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
          <div className="font-medium text-muted-foreground">Animation name</div>
          <Input
            value={state.name}
            onChange={(e) => update({ name: e.target.value.replace(/[^A-Za-z0-9_-]/g, "") })}
            className="h-9 font-mono text-xs"
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Timing function</div>
          <select
            value={state.timing}
            onChange={(e) => update({ timing: e.target.value as Timing })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            {TIMINGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Direction</div>
          <select
            value={state.direction}
            onChange={(e) => update({ direction: e.target.value as Direction })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option>normal</option>
            <option>reverse</option>
            <option>alternate</option>
            <option>alternate-reverse</option>
          </select>
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Iterations</div>
          <select
            value={state.iteration}
            onChange={(e) => update({ iteration: parseInt(e.target.value, 10) })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={-1}>infinite</option>
          </select>
        </label>
        <Slider
          label={`Duration (${state.duration}ms)`}
          value={state.duration}
          min={100}
          max={3000}
          step={50}
          onChange={(v) => update({ duration: v })}
        />
        <Slider
          label={`Delay (${state.delay}ms)`}
          value={state.delay}
          min={0}
          max={2000}
          step={50}
          onChange={(v) => update({ delay: v })}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold tracking-tight">Keyframes ({state.stops.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 text-left">%</th>
                <th className="px-2 py-1.5 text-right">X</th>
                <th className="px-2 py-1.5 text-right">Y</th>
                <th className="px-2 py-1.5 text-right">Scale</th>
                <th className="px-2 py-1.5 text-right">Rotate</th>
                <th className="px-2 py-1.5 text-right">Opacity</th>
              </tr>
            </thead>
            <tbody>
              {state.stops.map((st, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td className="px-2 py-1 font-mono">{st.pct}</td>
                  <td className="px-2 py-1 text-right font-mono">{st.tx}</td>
                  <td className="px-2 py-1 text-right font-mono">{st.ty}</td>
                  <td className="px-2 py-1 text-right font-mono">{st.scale}</td>
                  <td className="px-2 py-1 text-right font-mono">{st.rotate}°</td>
                  <td className="px-2 py-1 text-right font-mono">{st.opacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Pick a preset and tweak the timing controls above. For full keyframe editing, paste the generated CSS into your own stylesheet and adjust by hand.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkle className="size-4 text-primary" />
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
