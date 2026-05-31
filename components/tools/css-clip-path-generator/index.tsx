"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Lock,
  Plus,
  Scissors,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type ClipKind,
  type ClipPoint,
  type ClipState,
  DEFAULT_STATE,
  PRESETS,
  toCss,
} from "@/lib/tools/css/clip-path";

const KEY = "toollyz:clip-path";

const PREVIEW_BACKGROUNDS = [
  { label: "Sunset", value: "linear-gradient(135deg, #fb923c, #db2777)" },
  { label: "Ocean", value: "linear-gradient(135deg, #0ea5e9, #14b8a6)" },
  { label: "Forest", value: "linear-gradient(135deg, #22c55e, #f59e0b)" },
  { label: "Midnight", value: "linear-gradient(135deg, #0f172a, #6366f1)" },
  { label: "Plain", value: "#0ea5e9" },
];

export default function CssClipPathGenerator() {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<ClipState>(DEFAULT_STATE);
  const [bgIdx, setBgIdx] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ClipState>;
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
  const bg = PREVIEW_BACKGROUNDS[bgIdx];

  function setPoints(points: ClipPoint[]) {
    setState((s) => ({ ...s, points }));
  }

  function handlePointerDown(idx: number, e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    setActiveIdx(idx);
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    const move = (ev: PointerEvent) => {
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      const xPct = Math.max(0, Math.min(100, Math.round(x * 100) / 100));
      const yPct = Math.max(0, Math.min(100, Math.round(y * 100) / 100));
      setState((s) => ({
        ...s,
        points: s.points.map((p, i) => (i === idx ? { xPct, yPct } : p)),
      }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setActiveIdx(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`clip-path: ${css};`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("CSS copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function addPoint(idx: number) {
    setState((s) => {
      const a = s.points[idx];
      const b = s.points[(idx + 1) % s.points.length];
      const mid = { xPct: (a.xPct + b.xPct) / 2, yPct: (a.yPct + b.yPct) / 2 };
      return { ...s, points: [...s.points.slice(0, idx + 1), mid, ...s.points.slice(idx + 1)] };
    });
  }
  function removePoint(idx: number) {
    setState((s) => (s.points.length <= 3 ? s : { ...s, points: s.points.filter((_, i) => i !== idx) }));
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
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Shape mode</h2>
          <div className="flex gap-1.5">
            {(["polygon", "inset"] as ClipKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setState((s) => ({ ...s, kind: k }))}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium capitalize",
                  state.kind === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {state.kind === "polygon" && (
          <>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">Presets</h3>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPoints(p.points)}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        {state.kind === "inset" && (
          <div className="grid gap-2 sm:grid-cols-5">
            {(["t", "r", "b", "l"] as const).map((k) => (
              <Slider
                key={k}
                label={`${k.toUpperCase()} (${state.inset[k]}%)`}
                value={state.inset[k]}
                min={0}
                max={50}
                onChange={(v) =>
                  setState((s) => ({ ...s, inset: { ...s.inset, [k]: v } as ClipState["inset"] }))
                }
              />
            ))}
            <Slider
              label={`Radius (${state.inset.radius}px)`}
              value={state.inset.radius}
              min={0}
              max={64}
              onChange={(v) => setState((s) => ({ ...s, inset: { ...s.inset, radius: v } }))}
            />
          </div>
        )}
      </section>

      <section
        className="relative overflow-hidden rounded-3xl border border-border/70"
        style={{ background: bg.value, padding: 0 }}
      >
        <div
          ref={stageRef}
          className="relative mx-auto aspect-square w-full max-w-[480px]"
        >
          {/* The clipped element. */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #ffffff, #f8fafc)",
              clipPath: css,
            }}
          />
          {/* Drag handles (polygon only). */}
          {state.kind === "polygon" &&
            state.points.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onDoubleClick={() => removePoint(idx)}
                aria-label={`Point ${idx + 1}`}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform",
                  activeIdx === idx
                    ? "size-5 border-primary bg-primary scale-110"
                    : "size-4 border-white bg-primary/80 hover:scale-110",
                )}
                style={{ left: `${p.xPct}%`, top: `${p.yPct}%`, touchAction: "none" }}
              />
            ))}
          {/* Mid-point add buttons. */}
          {state.kind === "polygon" &&
            state.points.map((p, idx) => {
              const b = state.points[(idx + 1) % state.points.length];
              const mx = (p.xPct + b.xPct) / 2;
              const my = (p.yPct + b.yPct) / 2;
              return (
                <button
                  key={`add-${idx}`}
                  type="button"
                  onClick={() => addPoint(idx)}
                  aria-label={`Insert point after ${idx + 1}`}
                  className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/40 backdrop-blur transition-all hover:size-4 hover:bg-white"
                  style={{ left: `${mx}%`, top: `${my}%` }}
                />
              );
            })}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xs font-medium text-muted-foreground">Stage background</h2>
          <div className="flex flex-wrap gap-1.5">
            {PREVIEW_BACKGROUNDS.map((b, i) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setBgIdx(i)}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs font-medium",
                  bgIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        {state.kind === "polygon" && (
          <div className="flex flex-wrap items-end justify-end gap-2 text-xs">
            <span className="text-muted-foreground">
              <Plus className="inline size-3" /> click between dots to add &middot;{" "}
              <Trash2 className="inline size-3" /> double-click a dot to remove ({state.points.length} points)
            </span>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Scissors className="size-4 text-primary" />
            CSS
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy CSS
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs">
          {`clip-path: ${css};\n-webkit-clip-path: ${css};`}
        </pre>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Polygon editing and CSS generation run entirely in your browser — Toollyz has no server.
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
