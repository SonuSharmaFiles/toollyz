"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lock, MousePointer, Mouse, MoveDiagonal, RotateCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";

const BUTTON_NAMES: Record<number, string> = { 0: "Left", 1: "Middle", 2: "Right", 3: "Back", 4: "Forward" };
const TONE: Record<number, string> = { 0: "from-indigo-400 to-sky-400", 1: "from-amber-400 to-yellow-400", 2: "from-fuchsia-400 to-pink-400", 3: "from-emerald-400 to-teal-400", 4: "from-rose-400 to-orange-400" };

interface ClickEvent { button: number; x: number; y: number; ts: number; dbl?: boolean }
interface Ripple { id: number; x: number; y: number; button: number }

export default function MouseClickTester() {
  const reduceMotion = useReducedMotion();
  const [counts, setCounts] = React.useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
  const [down, setDown] = React.useState<Set<number>>(new Set());
  const [last, setLast] = React.useState<ClickEvent | null>(null);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const [recent, setRecent] = React.useState<number[]>([]); // click timestamps for CPS
  const [cps, setCps] = React.useState(0);
  const [wheel, setWheel] = React.useState({ x: 0, y: 0, count: 0 });
  const [moves, setMoves] = React.useState<{ x: number; y: number } | null>(null);
  const areaRef = React.useRef<HTMLDivElement>(null);
  const rippleSeq = React.useRef(0);
  const dblTimer = React.useRef<number | null>(null);

  // CPS rolling window (5s)
  React.useEffect(() => {
    const id = window.setInterval(() => {
      const cutoff = Date.now() - 5000;
      setRecent((prev) => prev.filter((t) => t > cutoff));
      setCps((prev) => {
        const recentCount = recent.filter((t) => t > Date.now() - 1000).length;
        return recentCount > prev ? recentCount : Math.max(0, prev - 1);
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [recent]);

  function localCoords(e: { clientX: number; clientY: number }) {
    const r = areaRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) };
  }

  function addRipple(pos: { x: number; y: number }, button: number) {
    const id = ++rippleSeq.current;
    setRipples((prev) => [...prev, { id, x: pos.x, y: pos.y, button }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDown((prev) => new Set(prev).add(e.button));
    const pos = localCoords(e);
    setCounts((prev) => ({ ...prev, [e.button]: (prev[e.button] ?? 0) + 1 }));
    const now = Date.now();
    setRecent((prev) => [...prev, now]);
    const click: ClickEvent = { button: e.button, x: pos.x, y: pos.y, ts: now };
    setLast(click);
    addRipple(pos, e.button);
    if (dblTimer.current) {
      window.clearTimeout(dblTimer.current);
      dblTimer.current = null;
      setLast({ ...click, dbl: true });
    } else {
      dblTimer.current = window.setTimeout(() => { dblTimer.current = null; }, 350);
    }
  }
  function onPointerUp(e: React.PointerEvent) { setDown((prev) => { const s = new Set(prev); s.delete(e.button); return s; }); }
  function onContextMenu(e: React.MouseEvent) { e.preventDefault(); }
  function onWheel(e: React.WheelEvent) { setWheel((prev) => ({ x: prev.x + e.deltaX, y: prev.y + e.deltaY, count: prev.count + 1 })); }
  function onMove(e: React.PointerEvent) { setMoves(localCoords(e)); }

  function reset() {
    setCounts({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
    setDown(new Set());
    setLast(null);
    setRipples([]);
    setRecent([]);
    setCps(0);
    setWheel({ x: 0, y: 0, count: 0 });
    setMoves(null);
    toast.success("Reset");
  }

  const total = counts[0] + counts[1] + counts[2] + counts[3] + counts[4];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Click stats" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-3 gap-4 sm:grid-cols-6">
          <Stat label="Total" value={total} primary />
          <Stat label="Left" value={counts[0]} />
          <Stat label="Right" value={counts[2]} />
          <Stat label="Middle" value={counts[1]} />
          <Stat label="Back" value={counts[3]} />
          <Stat label="Forward" value={counts[4]} />
        </div>
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-300"><Zap className="size-3.5" />CPS: <span className="font-mono">{cps}</span></span>
          <span className="flex items-center gap-1.5 text-indigo-300"><MoveDiagonal className="size-3.5" />Wheel ticks: <span className="font-mono">{wheel.count}</span></span>
          {moves && <span className="font-mono text-indigo-300/70">cursor {moves.x},{moves.y}</span>}
        </div>
      </section>

      {/* Test area */}
      <div
        ref={areaRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onContextMenu={onContextMenu}
        onWheel={onWheel}
        onPointerMove={onMove}
        className="relative h-72 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card/60 sm:h-96"
        style={{ touchAction: "none", cursor: "crosshair" }}
        aria-label="Mouse click test area"
      >
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          Click anywhere here — left, right, middle, back/forward, scroll, double-click.
        </div>
        {moves && (
          <div className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/40" style={{ left: moves.x, top: moves.y }} />
        )}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              className={cn("pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-80 mix-blend-screen", TONE[r.button] ?? TONE[0])}
              style={{ left: r.x, top: r.y, width: 24, height: 24 }}
              initial={{ scale: 0.5, opacity: reduceMotion ? 0.5 : 0.9 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
        {last && (
          <div className="pointer-events-none absolute" style={{ left: last.x + 8, top: last.y + 8 }}>
            <div className="rounded bg-card/90 px-1.5 py-0.5 text-[10px] font-mono shadow">{BUTTON_NAMES[last.button] ?? `btn ${last.button}`}{last.dbl ? " ×2" : ""}</div>
          </div>
        )}
      </div>

      {/* Button states */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Mouse className="size-4 text-primary" />Buttons</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {[0, 2, 1, 3, 4].map((b) => (
            <div key={b} className={cn("rounded-xl border p-2 text-center text-xs transition-colors", down.has(b) ? "border-primary bg-primary/10" : counts[b] > 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/60 bg-background")}>
              <div className="text-foreground/80">{BUTTON_NAMES[b]}</div>
              <div className="mt-0.5 font-heading text-base font-bold tabular-nums"><AnimatedNumber value={counts[b]} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Last event + actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card label="Last button">{last ? BUTTON_NAMES[last.button] ?? `btn ${last.button}` : "—"}</Card>
        <Card label="Last position">{last ? `${last.x}, ${last.y}` : "—"}</Card>
        <Card label="Double-click">{last?.dbl ? "Detected ✓" : "—"}</Card>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <Button type="button" size="sm" variant="outline" onClick={reset}><RotateCw className="size-4" />Reset</Button>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Clicks stay in your browser — Toollyz has no server.</span>
      </div>
    </div>
  );
}

function Stat({ label, value, primary }: { label: string; value: number; primary?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading font-bold tabular-nums text-indigo-50", primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}><AnimatedNumber value={value} /></div>
    </div>
  );
}
function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-heading text-xl font-bold">{children}</div>
    </section>
  );
}
