"use client";

import * as React from "react";
import {
  CheckCircle2,
  History as HistoryIcon,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
  SquareAsterisk,
  Timer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DURATIONS,
  bestFor,
  loadHistory,
  rate,
  saveHistory,
  type Duration,
  type Phase,
  type RunRecord,
} from "@/lib/tools/games/clicker";

const STORAGE = { key: "toollyz:spacebar-history" };

export default function SpacebarCounter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [duration, setDuration] = React.useState<Duration>(5);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [count, setCount] = React.useState(0);
  const [autoRepeats, setAutoRepeats] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [history, setHistory] = React.useState<RunRecord[]>([]);
  const startRef = React.useRef<number | null>(null);
  const padRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setHistory(loadHistory(STORAGE));
  }, []);

  React.useEffect(() => {
    saveHistory(STORAGE, history);
  }, [history]);

  React.useEffect(() => {
    if (phase !== "running" || startRef.current === null) return;
    let raf = 0;
    const tick = () => {
      const e = (performance.now() - (startRef.current ?? 0)) / 1000;
      setElapsed(e);
      if (e >= duration) {
        finishRun(e);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, duration]);

  const onKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.code !== "Space" && e.key !== " ") return;
    e.preventDefault(); // stop scroll
    if (phase === "done") return;
    if (e.repeat) {
      setAutoRepeats((n) => n + 1);
      return;
    }
    if (phase === "idle") {
      startRef.current = performance.now();
      setPhase("running");
      setCount(1);
      setElapsed(0);
      setAutoRepeats(0);
      return;
    }
    setCount((c) => c + 1);
  }, [phase]);

  React.useEffect(() => {
    if (!mounted) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onKeyDown]);

  function finishRun(seconds: number) {
    const final = rate(count, duration);
    const record: RunRecord = { ts: Date.now(), duration, count, cps: final };
    setHistory((prev) => [record, ...prev].slice(0, 30));
    setPhase("done");
    setElapsed(Math.min(duration, seconds));
    toast.success(`${count} space presses in ${duration}s · ${final} per second`);
  }

  function reset() {
    setPhase("idle");
    setCount(0);
    setAutoRepeats(0);
    setElapsed(0);
    startRef.current = null;
    padRef.current?.focus();
  }

  function clearHistory() {
    setHistory([]);
  }

  const remaining = Math.max(0, duration - elapsed);
  const liveCps = elapsed > 0 ? Math.round((count / Math.max(elapsed, 0.001)) * 100) / 100 : 0;
  const best = bestFor(history, duration);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Spacebar stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Presses" value={count} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Per sec." value={liveCps} reduceMotion={!!reduceMotion} accent="text-indigo-300" decimals={2} />
          <Stat label="Time left" value={Math.ceil(remaining)} suffix="s" reduceMotion={!!reduceMotion} />
          <Stat label={`Best at ${duration}s`} value={best?.count ?? 0} reduceMotion={!!reduceMotion} accent="text-amber-300" />
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-emerald-400 transition-all" style={{ width: `${Math.min(100, (elapsed / duration) * 100)}%` }} />
        </div>
        {autoRepeats > 0 && (
          <p className="relative mt-3 text-[11px] text-amber-300/80">
            {autoRepeats} OS auto-repeat{autoRepeats === 1 ? "" : "s"} ignored — only fresh keydowns count.
          </p>
        )}
      </section>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-xs font-medium">Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => v && (reset(), setDuration(Number(v) as Duration))}>
              <SelectTrigger id="duration" className="w-full justify-between sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} second{d === 1 ? "" : "s"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {phase === "idle" && "Click the spacebar pad below (so the page captures keypresses), then start hitting Space."}
          {phase === "running" && "Tap space as fast as you can!"}
          {phase === "done" && "Click Reset for another go."}
        </p>
      </section>

      {/* Spacebar pad */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <div
          ref={padRef}
          tabIndex={0}
          role="button"
          aria-label="Press Space to count"
          onClick={() => padRef.current?.focus()}
          onKeyDown={(e) => {
            // Element-level handler is redundant with window listener but
            // also blocks default scroll for keyboards that bubble.
            if (e.code === "Space" || e.key === " ") e.preventDefault();
          }}
          className="grid h-56 w-full select-none place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/40 px-4 text-center transition-colors focus:border-emerald-400/60 focus:bg-emerald-500/5 focus:outline-none sm:h-64"
        >
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {phase === "idle" && "Click here, then press Space"}
              {phase === "running" && "TAP SPACE"}
              {phase === "done" && "Done"}
            </div>
            <div className="font-heading text-6xl font-bold tabular-nums text-foreground sm:text-7xl">{count}</div>
            <div className="text-xs text-muted-foreground">
              {phase === "done" ? `${rate(count, duration)} per second over ${duration}s` : `${liveCps} per sec · ${Math.ceil(remaining)}s left`}
            </div>
            <div className="mt-2 flex justify-center">
              {/* Visual spacebar */}
              <div
                className={cn(
                  "inline-flex h-9 w-48 items-center justify-center rounded-md border-2 border-border bg-card text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-all sm:w-64",
                  phase === "running" && "border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                )}
              >
                Space
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <HistoryIcon className="size-4 text-primary" />
              History ({history.length})
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1.5 list-none">
            {history.map((h, i) => (
              <li key={i} className="grid grid-cols-[60px_60px_70px_1fr] items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
                <span className="font-mono text-muted-foreground">{h.duration}s</span>
                <span className="font-mono font-semibold text-foreground">{h.count}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{h.cps} /s</span>
                <span className="truncate text-[10px] text-muted-foreground">{new Date(h.ts).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this counter
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><SquareAsterisk className="mt-0.5 size-3.5 shrink-0 text-primary" />Only <strong>fresh</strong> Space keydowns count. OS-level auto-repeats (when you hold Space) are detected via <code className="font-mono">event.repeat</code> and skipped.</li>
          <li className="flex items-start gap-1.5"><Timer className="mt-0.5 size-3.5 shrink-0 text-primary" />Five duration windows (1 / 5 / 10 / 30 / 60 s). The rAF-based timer auto-stops at zero.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />The page consumes the Space keypress to prevent scroll while you tap. Click the pad first so the window has focus.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every press stays in your browser. The 30 most recent runs save to localStorage.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Runs entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
  decimals,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
  decimals?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} decimals={decimals} />
      </div>
    </div>
  );
}
