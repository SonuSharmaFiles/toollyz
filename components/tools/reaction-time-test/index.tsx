"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  History as HistoryIcon,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
  Timer,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";

const STORAGE_KEY = "toollyz:reaction-history";
const MIN_WAIT_MS = 1500;
const MAX_WAIT_MS = 5000;
const MAX_HISTORY = 30;

type Phase = "idle" | "waiting" | "signal" | "result" | "early";

interface RunRecord {
  ts: number;
  ms: number;
}

function loadHistory(): RunRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RunRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history: RunRecord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    /* noop */
  }
}

function categorise(ms: number): { label: string; color: string } {
  if (ms < 180) return { label: "Lightning", color: "text-amber-300" };
  if (ms < 220) return { label: "Excellent", color: "text-emerald-300" };
  if (ms < 280) return { label: "Quick", color: "text-emerald-300" };
  if (ms < 340) return { label: "Average", color: "text-indigo-300" };
  if (ms < 420) return { label: "Slow", color: "text-amber-300" };
  return { label: "Sluggish", color: "text-rose-300" };
}

export default function ReactionTimeTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [history, setHistory] = React.useState<RunRecord[]>([]);
  const [latestMs, setLatestMs] = React.useState<number | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const signalAtRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setHistory(loadHistory());
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    saveHistory(history);
  }, [history]);

  function arm() {
    setLatestMs(null);
    setPhase("waiting");
    const wait = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    timeoutRef.current = window.setTimeout(() => {
      signalAtRef.current = performance.now();
      setPhase("signal");
    }, wait);
  }

  function clearPending() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function onPadClick() {
    if (phase === "idle" || phase === "result" || phase === "early") {
      arm();
      return;
    }
    if (phase === "waiting") {
      clearPending();
      setPhase("early");
      return;
    }
    if (phase === "signal" && signalAtRef.current !== null) {
      const ms = Math.round(performance.now() - signalAtRef.current);
      const record: RunRecord = { ts: Date.now(), ms };
      setLatestMs(ms);
      setHistory((prev) => [record, ...prev].slice(0, MAX_HISTORY));
      setPhase("result");
      toast.success(`${ms} ms — ${categorise(ms).label}`);
    }
  }

  function reset() {
    clearPending();
    setPhase("idle");
    setLatestMs(null);
  }

  function clearHistory() {
    setHistory([]);
    toast.success("History cleared");
  }

  const last5 = history.slice(0, 5);
  const avg5 = last5.length > 0 ? Math.round(last5.reduce((s, h) => s + h.ms, 0) / last5.length) : 0;
  const best = history.length > 0 ? Math.min(...history.map((h) => h.ms)) : 0;
  const median = history.length > 0
    ? (() => {
        const sorted = [...history].map((h) => h.ms).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
      })()
    : 0;
  const cat = latestMs !== null ? categorise(latestMs) : null;

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
      {/* Hero stats */}
      <section
        aria-label="Reaction stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Latest" value={latestMs ?? 0} suffix=" ms" reduceMotion={!!reduceMotion} accent={cat?.color ?? undefined} />
          <Stat label="Best ever" value={best} suffix=" ms" reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Avg (last 5)" value={avg5} suffix=" ms" reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Median" value={median} suffix=" ms" reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Pad */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <button
          type="button"
          onClick={onPadClick}
          className={cn(
            "grid h-72 w-full select-none place-items-center rounded-2xl text-center transition-colors sm:h-80",
            phase === "idle" && "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
            phase === "waiting" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            phase === "signal" && "bg-emerald-500 text-white",
            phase === "result" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            phase === "early" && "bg-rose-500/15 text-rose-700 dark:text-rose-300",
          )}
        >
          <div className="space-y-2">
            {phase === "idle" && (
              <>
                <Zap className="mx-auto size-10" />
                <div className="text-2xl font-semibold sm:text-3xl">Click to start</div>
                <div className="text-xs opacity-70">When the screen turns green, click as fast as you can.</div>
              </>
            )}
            {phase === "waiting" && (
              <>
                <Timer className="mx-auto size-10" />
                <div className="text-2xl font-semibold sm:text-3xl">Wait for green…</div>
                <div className="text-xs opacity-70">Don&apos;t click yet.</div>
              </>
            )}
            {phase === "signal" && (
              <>
                <div className="text-3xl font-bold sm:text-5xl">CLICK!</div>
                <div className="text-xs opacity-80">Go go go.</div>
              </>
            )}
            {phase === "result" && latestMs !== null && (
              <>
                <CheckCircle2 className="mx-auto size-10" />
                <div className="font-heading text-5xl font-bold tabular-nums sm:text-7xl">{latestMs} ms</div>
                <div className="text-sm">{categorise(latestMs).label}</div>
                <div className="text-xs opacity-70">Click anywhere for another go.</div>
              </>
            )}
            {phase === "early" && (
              <>
                <AlertTriangle className="mx-auto size-10" />
                <div className="text-2xl font-semibold sm:text-3xl">Too soon!</div>
                <div className="text-xs opacity-70">Click again to retry.</div>
              </>
            )}
          </div>
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>Random delay between {MIN_WAIT_MS / 1000} s and {MAX_WAIT_MS / 1000} s before the signal.</span>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
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
            {history.map((h, i) => {
              const c = categorise(h.ms);
              return (
                <li key={i} className="grid grid-cols-[60px_80px_1fr] items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
                  <span className="font-mono text-muted-foreground">#{history.length - i}</span>
                  <span className="font-mono font-semibold text-foreground">{h.ms} ms</span>
                  <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={cn("rounded-full px-1.5 py-0.5 font-medium", c.color)}>{c.label}</span>
                    <span className="ml-auto">{new Date(h.ts).toLocaleString()}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this test
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Timer className="mt-0.5 size-3.5 shrink-0 text-primary" />Uses <code className="font-mono">performance.now()</code> for sub-millisecond elapsed time — accurate to whatever your browser exposes (typically 0.1–1 ms).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Random delay between {MIN_WAIT_MS / 1000} s and {MAX_WAIT_MS / 1000} s prevents anticipating the signal.</li>
          <li className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />Average simple human visual reaction time is ~250 ms. Sub-200 ms means you anticipated; sub-150 ms is biologically unlikely.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every measurement stays in your browser. The 30 most recent runs save to localStorage.</li>
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
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}
