"use client";

import * as React from "react";
import { Check, Copy, Eraser, Lock, Plus, Shapes, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STATE,
  type MeshState,
  type MeshStop,
  PRESETS,
  newStop,
  toCss,
} from "@/lib/tools/css/gradient-mesh";

const KEY = "toollyz:gradient-mesh";

export default function GradientMeshGenerator() {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<MeshState>(DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<MeshState>;
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

  const previewStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties & Record<string, string> = {};
    for (const line of css.split(";")) {
      const m = /^\s*([a-z-]+)\s*:\s*([\s\S]+?)\s*$/.exec(line);
      if (!m) continue;
      const prop = m[1];
      const val = m[2].trim();
      if (prop === "background-color") style.backgroundColor = val;
      else if (prop === "background-image") style.backgroundImage = val;
    }
    return style;
  }, [css]);

  function updateStop(id: string, patch: Partial<MeshStop>) {
    setState((s) => ({ ...s, stops: s.stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)) }));
  }
  function removeStop(id: string) {
    setState((s) => ({ ...s, stops: s.stops.filter((stop) => stop.id !== id) }));
  }
  function addStop() {
    setState((s) => ({ ...s, stops: [...s.stops, newStop({ x: 50, y: 50, color: "#fbbf24" })] }));
  }

  function handlePointerDown(id: string, e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    setActiveId(id);
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    const move = (ev: PointerEvent) => {
      const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100));
      setState((s) => ({
        ...s,
        stops: s.stops.map((st) => (st.id === id ? { ...st, x: Math.round(x), y: Math.round(y) } : st)),
      }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setActiveId(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
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
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70" style={previewStyle}>
        <div ref={stageRef} className="relative mx-auto aspect-video w-full max-w-[640px]">
          {state.stops.map((stop) => (
            <button
              key={stop.id}
              type="button"
              onPointerDown={(e) => handlePointerDown(stop.id, e)}
              aria-label={`Move stop`}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-transform",
                activeId === stop.id ? "size-6 scale-110" : "size-5 hover:scale-110",
              )}
              style={{
                left: `${stop.x}%`,
                top: `${stop.y}%`,
                background: stop.color,
                touchAction: "none",
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setState({
                  base: p.state.base,
                  stops: p.state.stops.map((s) => ({ ...s, id: newStop().id })),
                })
              }
              className="rounded-xl border-2 border-transparent p-1.5 hover:scale-105 transition-transform"
            >
              <div
                className="h-10 w-20 rounded-lg shadow-inner"
                style={(() => {
                  const layers = p.state.stops
                    .map((s) => `radial-gradient(circle at ${s.x}% ${s.y}%, ${s.color} 0%, transparent ${s.size}%)`)
                    .join(", ");
                  return { background: `${layers}, ${p.state.base}` };
                })()}
                aria-hidden
              />
              <div className="mt-1 text-[10px] font-medium">{p.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Stops ({state.stops.length})</h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={addStop}>
              <Plus className="size-3.5" />
              Add stop
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setState((s) => ({ ...s, stops: [] }))}>
              <Eraser className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Base colour</div>
          <Input
            type="color"
            value={state.base}
            onChange={(e) => setState((s) => ({ ...s, base: e.target.value }))}
            className="h-9 w-32 cursor-pointer"
          />
        </label>
      </section>

      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        {state.stops.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
            No stops. Click 'Add stop' or pick a preset.
          </p>
        )}
        {state.stops.map((stop, i) => (
          <div key={stop.id} className="grid items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-3 text-xs sm:grid-cols-6">
            <div className="font-medium text-muted-foreground">Stop {i + 1}</div>
            <Input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(stop.id, { color: e.target.value })}
              className="h-8 cursor-pointer"
            />
            <Slider label={`X ${stop.x}%`} value={stop.x} min={0} max={100} onChange={(v) => updateStop(stop.id, { x: v })} />
            <Slider label={`Y ${stop.y}%`} value={stop.y} min={0} max={100} onChange={(v) => updateStop(stop.id, { y: v })} />
            <Slider label={`Size ${stop.size}%`} value={stop.size} min={10} max={100} onChange={(v) => updateStop(stop.id, { size: v })} />
            <button
              type="button"
              onClick={() => removeStop(stop.id)}
              className="ml-auto rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500"
              aria-label="Remove stop"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Shapes className="size-4 text-primary" />
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
        Drag the dots in the preview to reposition stops — pure CSS output, no SVG, no images.
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
    <label className="space-y-0.5 text-[11px]">
      <div className="text-muted-foreground">{label}</div>
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
