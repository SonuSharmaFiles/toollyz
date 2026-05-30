"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Flag,
  Info,
  Lock,
  Pause,
  Play,
  RefreshCcw,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "toollyz:stopwatch-laps";

interface Lap {
  id: number;
  elapsed: number; // ms from start
  split: number; // ms since previous lap
}

function format(ms: number): { hh: string; mm: string; ss: string; cs: string } {
  const total = Math.max(0, Math.floor(ms));
  const cs = String(Math.floor((total % 1000) / 10)).padStart(2, "0");
  const seconds = Math.floor(total / 1000);
  const ss = String(seconds % 60).padStart(2, "0");
  const minutes = Math.floor(seconds / 60);
  const mm = String(minutes % 60).padStart(2, "0");
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  return { hh, mm, ss, cs };
}

function formatString(ms: number): string {
  const { hh, mm, ss, cs } = format(ms);
  return hh === "00" ? `${mm}:${ss}.${cs}` : `${hh}:${mm}:${ss}.${cs}`;
}

export default function Stopwatch() {
  const [mounted, setMounted] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [laps, setLaps] = React.useState<Lap[]>([]);
  const startedAtRef = React.useRef<number | null>(null);
  const baseRef = React.useRef(0); // accumulated time when paused
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { laps: Lap[]; elapsed: number };
        if (parsed && Array.isArray(parsed.laps)) {
          setLaps(parsed.laps);
          if (typeof parsed.elapsed === "number") {
            setElapsed(parsed.elapsed);
            baseRef.current = parsed.elapsed;
          }
        }
      }
    } catch {
      /* noop */
    }
  }, []);

  // Persist laps + paused elapsed.
  React.useEffect(() => {
    if (!mounted) return;
    if (running) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ laps, elapsed }));
    } catch {
      /* noop */
    }
  }, [laps, elapsed, running, mounted]);

  // Animation frame loop while running
  React.useEffect(() => {
    if (!running) return;
    startedAtRef.current = performance.now();
    const tick = () => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      setElapsed(baseRef.current + (performance.now() - startedAt));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const startedAt = startedAtRef.current;
      if (startedAt !== null) {
        baseRef.current += performance.now() - startedAt;
      }
      startedAtRef.current = null;
    };
  }, [running]);

  function startStop() {
    setRunning((r) => !r);
  }

  function lap() {
    if (!running && elapsed === 0) return;
    const previous = laps[0]?.elapsed ?? 0;
    const split = elapsed - previous;
    setLaps((prev) => [{ id: prev.length + 1, elapsed, split }, ...prev].slice(0, 200));
    toast.success(`Lap ${laps.length + 1}: ${formatString(split)}`);
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    baseRef.current = 0;
    startedAtRef.current = null;
  }

  // Keyboard shortcuts: Space toggles, L laps, R resets
  React.useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        startStop();
      } else if (e.key === "l" || e.key === "L") {
        if (running) lap();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, running, elapsed, laps]);

  async function copyLaps() {
    if (laps.length === 0) return;
    const lines = ["Lap\tSplit\tElapsed"];
    const total = laps.length;
    for (const lap of laps) {
      lines.push(`${total - laps.indexOf(lap) + 0}\t${formatString(lap.split)}\t${formatString(lap.elapsed)}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Laps copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function downloadLaps() {
    if (laps.length === 0) return;
    const lines = ["lap,split_ms,split,elapsed_ms,elapsed"];
    const total = laps.length;
    for (const lap of laps) {
      const lapNumber = total - laps.indexOf(lap);
      lines.push(`${lapNumber},${lap.split},${formatString(lap.split)},${lap.elapsed},${formatString(lap.elapsed)}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stopwatch-laps.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded stopwatch-laps.csv");
  }

  const { hh, mm, ss, cs } = format(elapsed);
  const fastest = laps.length > 0 ? laps.reduce((min, cur) => (cur.split < min.split ? cur : min), laps[0]) : null;
  const slowest = laps.length > 0 ? laps.reduce((max, cur) => (cur.split > max.split ? cur : max), laps[0]) : null;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Big display */}
      <section
        aria-label="Stopwatch"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="font-mono tabular-nums text-indigo-50">
            <span className={cn("text-5xl font-bold sm:text-7xl", running ? "text-emerald-300" : "text-indigo-100")}>
              {hh !== "00" ? `${hh}:` : ""}{mm}:{ss}
            </span>
            <span className="ml-1 text-3xl font-semibold text-indigo-300/80 sm:text-4xl">.{cs}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Button
              type="button"
              size="lg"
              onClick={startStop}
              className={cn("min-w-32", running ? "bg-amber-500/90 hover:bg-amber-500 text-white" : "bg-emerald-500/90 hover:bg-emerald-500 text-white")}
            >
              {running ? <><Pause className="size-4" /> Stop</> : <><Play className="size-4" /> {elapsed > 0 ? "Resume" : "Start"}</>}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={lap} disabled={!running && elapsed === 0}>
              <Flag className="size-4" />
              Lap
            </Button>
            <Button type="button" size="lg" variant="ghost" onClick={reset} className="text-white">
              <RefreshCcw className="size-4" />
              Reset
            </Button>
          </div>
          <p className="text-[11px] text-indigo-200/70">
            Shortcuts: <span className="font-mono">Space</span> start/stop · <span className="font-mono">L</span> lap · <span className="font-mono">R</span> reset
          </p>
        </div>
      </section>

      {/* Lap summary */}
      {laps.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Sparkles className="size-4 text-primary" />
              Laps ({laps.length})
            </h2>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={copyLaps}>
                <Copy className="size-3.5" />
                Copy
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={downloadLaps}>
                <Download className="size-3.5" />
                CSV
              </Button>
            </div>
          </div>
          {fastest && slowest && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2">
                <div className="font-medium text-emerald-700 dark:text-emerald-400">Fastest split</div>
                <div className="font-mono">{formatString(fastest.split)}</div>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
                <div className="font-medium text-amber-700 dark:text-amber-400">Slowest split</div>
                <div className="font-mono">{formatString(slowest.split)}</div>
              </div>
            </div>
          )}
          <ul className="space-y-1 list-none">
            {laps.map((lap, idx) => {
              const number = laps.length - idx;
              const isFastest = fastest && lap.id === fastest.id;
              const isSlowest = slowest && lap.id === slowest.id;
              return (
                <li
                  key={lap.id}
                  className={cn(
                    "grid grid-cols-[60px_1fr_1fr] items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs",
                    isFastest && "border-emerald-500/40 bg-emerald-500/5",
                    isSlowest && "border-amber-500/40 bg-amber-500/5",
                  )}
                >
                  <span className="font-mono text-muted-foreground">#{number}</span>
                  <span className="font-mono">{formatString(lap.split)}</span>
                  <span className="font-mono text-muted-foreground">{formatString(lap.elapsed)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this stopwatch
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Timer className="mt-0.5 size-3.5 shrink-0 text-primary" />Uses <code className="font-mono">performance.now()</code> + requestAnimationFrame for sub-millisecond accuracy at the browser&apos;s refresh rate.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Resume picks up exactly where you left off — the accumulated elapsed time is stored between starts.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Background-tab throttling can cause the display to freeze while the tab isn&apos;t focused, but the elapsed time is recalculated from `performance.now()` on the next frame so it&apos;s still accurate.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — laps and the paused elapsed time save to localStorage when the timer is stopped.</li>
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
