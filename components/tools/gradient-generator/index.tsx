"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRightLeft,
  Brush,
  CheckCircle2,
  Code,
  Copy,
  Download,
  Info,
  Lock,
  Plus,
  Shuffle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DEFAULT_GRADIENT,
  PRESETS,
  makeStop,
  randomGradient,
  toCssDeclaration,
  toCssFunction,
  toCssShorthand,
  toSvg,
  toTailwindClass,
  type Gradient,
  type GradientType,
  type RadialShape,
  type Stop,
} from "@/lib/tools/image/gradient";

const STORAGE_KEY = "toollyz:gradient";
const HISTORY_KEY = "toollyz:gradient-history";

export default function GradientGenerator() {
  const reduceMotion = useReducedMotion();
  void reduceMotion;
  const [mounted, setMounted] = React.useState(false);
  const [gradient, setGradient] = React.useState<Gradient>(DEFAULT_GRADIENT);
  const [history, setHistory] = React.useState<Gradient[]>([]);
  const [activeStopId, setActiveStopId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setGradient({ ...DEFAULT_GRADIENT, ...(JSON.parse(raw) as Partial<Gradient>) });
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as Gradient[]);
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gradient));
    } catch {
      /* noop */
    }
  }, [gradient, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  const cssFunction = toCssFunction(gradient);
  const cssDeclaration = toCssDeclaration(gradient);
  const cssShorthand = toCssShorthand(gradient);
  const tailwind = toTailwindClass(gradient);

  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);

  function updateStop(id: string, patch: Partial<Stop>) {
    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function addStopAt(position: number) {
    const sorted = sortedStops;
    let color = "#ffffff";
    // Pick a sensible color based on the two neighbours
    if (sorted.length >= 2) {
      let prev = sorted[0];
      let next = sorted[sorted.length - 1];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].position <= position && sorted[i + 1].position >= position) {
          prev = sorted[i];
          next = sorted[i + 1];
          break;
        }
      }
      color = mixHex(prev.color, next.color, prev.position === next.position ? 0.5 : (position - prev.position) / (next.position - prev.position));
    }
    const newStop = makeStop(color, position);
    setGradient((g) => ({ ...g, stops: [...g.stops, newStop] }));
    setActiveStopId(newStop.id);
  }

  function removeStop(id: string) {
    if (gradient.stops.length <= 2) {
      toast.error("Need at least 2 color stops");
      return;
    }
    setGradient((g) => ({ ...g, stops: g.stops.filter((s) => s.id !== id) }));
    if (activeStopId === id) setActiveStopId(null);
  }

  function reverseStops() {
    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) => ({ ...s, position: 100 - s.position })),
    }));
  }

  function shuffle() {
    const next = randomGradient(gradient.type);
    setGradient(next);
    pushHistory(next);
  }

  function pushHistory(g: Gradient) {
    setHistory((prev) => [g, ...prev.filter((h) => toCssFunction(h) !== toCssFunction(g))].slice(0, 12));
  }

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setGradient(p.gradient);
    pushHistory(p.gradient);
  }

  async function copy(text: string, what = "CSS") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function downloadSvg() {
    const svg = toSvg(gradient, 1200, 600);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gradient.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded gradient.svg");
  }

  // Bar interaction — handle drag of an existing stop position
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef<string | null>(null);

  function barPositionFromEvent(e: { clientX: number }): number {
    const el = barRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.max(rect.left, Math.min(rect.right, e.clientX));
    return Math.round(((x - rect.left) / rect.width) * 100);
  }

  function onBarPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const pos = barPositionFromEvent(e);
    addStopAt(pos);
  }

  function onStopPointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
    e.stopPropagation();
    e.preventDefault();
    setActiveStopId(id);
    draggingRef.current = id;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }
  function onStopPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const pos = barPositionFromEvent(e);
    updateStop(draggingRef.current, { position: pos });
  }
  function onStopPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = null;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    pushHistory(gradient);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const activeStop = gradient.stops.find((s) => s.id === activeStopId) ?? null;

  return (
    <div className="space-y-6">
      {/* Big preview */}
      <section
        aria-label="Gradient preview"
        className="relative overflow-hidden rounded-3xl border border-white/10 p-1"
      >
        <div
          className="h-64 rounded-[1.4rem] sm:h-80"
          style={{ backgroundImage: cssFunction }}
          role="img"
          aria-label="Gradient preview"
        />
      </section>

      {/* Stops bar */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Brush className="size-4 text-primary" />
            Color stops
          </h2>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={reverseStops}>
              <ArrowRightLeft className="size-3.5" />
              Reverse
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={shuffle}>
              <Shuffle className="size-3.5" />
              Random
            </Button>
          </div>
        </div>

        {/* Color bar with draggable stops */}
        <div className="space-y-2">
          <div
            ref={barRef}
            onPointerDown={onBarPointerDown}
            className="relative h-10 cursor-copy rounded-lg border border-border/60"
            style={{ backgroundImage: cssFunction }}
            role="application"
            aria-label="Gradient bar — click to add a stop"
          >
            {sortedStops.map((s) => (
              <div
                key={s.id}
                onPointerDown={(e) => onStopPointerDown(e, s.id)}
                onPointerMove={onStopPointerMove}
                onPointerUp={onStopPointerUp}
                onPointerCancel={onStopPointerUp}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStopId(s.id);
                }}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={s.position}
                aria-label={`Stop at ${s.position}%`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") updateStop(s.id, { position: Math.max(0, s.position - 1) });
                  if (e.key === "ArrowRight") updateStop(s.id, { position: Math.min(100, s.position + 1) });
                  if (e.key === "Delete" || e.key === "Backspace") removeStop(s.id);
                }}
                className={cn(
                  "absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 shadow-md ring-offset-background active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary",
                  activeStopId === s.id ? "border-white scale-110" : "border-white/80",
                )}
                style={{ left: `${s.position}%`, backgroundColor: s.color }}
                title={`${s.color} · ${s.position}%`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Click the bar to add a stop. Drag a stop to move it. Use arrow keys for fine control, Delete to remove.
          </p>
        </div>

        {/* Active stop editor */}
        {activeStop && (
          <div className="grid items-end gap-3 rounded-lg border border-border/60 bg-background p-3 sm:grid-cols-[auto_1fr_1fr_auto]">
            <input
              type="color"
              value={normalizeHex(activeStop.color)}
              onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-background p-1"
              aria-label="Stop color"
            />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Hex</Label>
              <Input
                value={activeStop.color}
                onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Position (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={activeStop.position}
                onChange={(e) => updateStop(activeStop.id, { position: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                className="font-mono"
              />
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={() => removeStop(activeStop.id)}>
              <X className="size-3.5" />
              Remove
            </Button>
          </div>
        )}

        {/* Stop list */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sortedStops.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStopId(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background p-2 text-left text-xs",
                activeStopId === s.id ? "border-primary ring-2 ring-primary/30" : "border-border/60 hover:bg-muted/40",
              )}
            >
              <span className="size-6 shrink-0 rounded-md border border-border" style={{ backgroundColor: s.color }} />
              <span className="font-mono">{s.color.toUpperCase()}</span>
              <span className="ml-auto font-mono text-muted-foreground">{s.position}%</span>
            </button>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addStopAt(50)}
            className="justify-start"
          >
            <Plus className="size-3.5" />
            Add stop
          </Button>
        </div>
      </section>

      {/* Type + geometry controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Gradient type
        </h2>
        <Tabs value={gradient.type} onValueChange={(v) => v && setGradient((g) => ({ ...g, type: v as GradientType }))} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="linear">Linear</TabsTrigger>
            <TabsTrigger value="radial">Radial</TabsTrigger>
            <TabsTrigger value="conic">Conic</TabsTrigger>
          </TabsList>
          <TabsContent value="linear" className="space-y-3">
            <SliderRow
              label="Angle"
              value={gradient.angle}
              max={360}
              suffix="°"
              onChange={(v) => setGradient((g) => ({ ...g, angle: v }))}
            />
            <div className="flex flex-wrap gap-1.5">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setGradient((g) => ({ ...g, angle: a }))}
                  className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs hover:bg-muted"
                >
                  {a}°
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="radial" className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Shape</Label>
              <Select value={gradient.shape} onValueChange={(v) => v && setGradient((g) => ({ ...g, shape: v as RadialShape }))}>
                <SelectTrigger className="w-full sm:w-48 justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ellipse">Ellipse</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SliderRow
              label="Center X"
              value={gradient.radialPositionX}
              max={100}
              suffix="%"
              onChange={(v) => setGradient((g) => ({ ...g, radialPositionX: v }))}
            />
            <SliderRow
              label="Center Y"
              value={gradient.radialPositionY}
              max={100}
              suffix="%"
              onChange={(v) => setGradient((g) => ({ ...g, radialPositionY: v }))}
            />
          </TabsContent>
          <TabsContent value="conic" className="space-y-3">
            <SliderRow
              label="From angle"
              value={gradient.conicFromAngle}
              max={360}
              suffix="°"
              onChange={(v) => setGradient((g) => ({ ...g, conicFromAngle: v }))}
            />
            <SliderRow
              label="Center X"
              value={gradient.conicPositionX}
              max={100}
              suffix="%"
              onChange={(v) => setGradient((g) => ({ ...g, conicPositionX: v }))}
            />
            <SliderRow
              label="Center Y"
              value={gradient.conicPositionY}
              max={100}
              suffix="%"
              onChange={(v) => setGradient((g) => ({ ...g, conicPositionY: v }))}
            />
          </TabsContent>
        </Tabs>

        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={gradient.repeating}
            onChange={(e) => setGradient((g) => ({ ...g, repeating: e.target.checked }))}
            className="size-4 rounded border-border accent-primary"
          />
          <span>Repeating gradient (tile the stops)</span>
        </label>
      </section>

      {/* Presets */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Presets
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="overflow-hidden rounded-lg border border-border ring-offset-background hover:ring-2 hover:ring-primary"
              title={p.label}
            >
              <div className="h-14" style={{ backgroundImage: toCssFunction(p.gradient) }} />
              <div className="px-2 py-1 text-xs font-medium">{p.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* CSS output */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Code className="size-4 text-primary" />
            Generated CSS
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={downloadSvg}>
            <Download className="size-4" />
            Download SVG
          </Button>
        </div>
        <CodeRow label="Function" code={cssFunction} onCopy={() => copy(cssFunction)} />
        <CodeRow label="Property" code={cssDeclaration} onCopy={() => copy(cssDeclaration)} />
        <CodeRow label="Shorthand" code={cssShorthand} onCopy={() => copy(cssShorthand, "CSS shorthand")} multiline />
        <CodeRow label="Tailwind" code={tailwind} onCopy={() => copy(tailwind, "Tailwind class")} />
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Sparkles className="size-4 text-primary" />
              Recent
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setHistory([])}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {history.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGradient(g)}
                className="h-10 rounded-md border border-border ring-offset-background hover:ring-2 hover:ring-primary"
                style={{ backgroundImage: toCssFunction(g) }}
                title={toCssFunction(g)}
                aria-label="Use recent gradient"
              />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About these gradients
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Linear, radial and conic gradient functions all match CSS Color Level 4 — no vendor prefixes needed in modern browsers (≥ 2022).</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />SVG export covers linear and radial; conic isn&apos;t in the SVG spec yet, so the export falls back to a flat color.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Stops accept any CSS color — HEX, RGB, HSL, OKLCH and color keywords. Modern browsers interpolate in OKLab when both stops use it.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — the editor, presets and downloads run entirely in your browser. Last gradient + recent history saved to localStorage.</li>
        </ul>
      </section>
    </div>
  );
}

function SliderRow({
  label,
  value,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <Label className="font-medium">{label}</Label>
        <span className="font-mono tabular-nums">{Math.round(value)}{suffix}</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))} min={0} max={max} step={1} />
    </div>
  );
}

function CodeRow({
  label,
  code,
  onCopy,
  multiline,
}: {
  label: string;
  code: string;
  onCopy: () => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Copy className="size-3.5" />
          Copy
        </button>
      </div>
      {multiline ? (
        <pre className="overflow-auto rounded-lg border border-border/60 bg-background p-2 text-[11px] leading-relaxed">
          <code className="font-mono">{code}</code>
        </pre>
      ) : (
        <code className="block break-all rounded-lg border border-border/60 bg-background p-2 text-[11px] font-mono">
          {code}
        </code>
      )}
    </div>
  );
}

function normalizeHex(s: string): string {
  let v = s.trim();
  if (!v.startsWith("#")) v = "#" + v;
  const m = v.match(/^#([0-9a-fA-F]{3,8})$/);
  if (!m) return "#000000";
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return "#000000";
  return "#" + h.toLowerCase();
}

function mixHex(a: string, b: string, t: number): string {
  const ah = normalizeHex(a).slice(1);
  const bh = normalizeHex(b).slice(1);
  const ar = parseInt(ah.slice(0, 2), 16);
  const ag = parseInt(ah.slice(2, 4), 16);
  const ab = parseInt(ah.slice(4, 6), 16);
  const br = parseInt(bh.slice(0, 2), 16);
  const bg = parseInt(bh.slice(2, 4), 16);
  const bb = parseInt(bh.slice(4, 6), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`.toUpperCase();
}
