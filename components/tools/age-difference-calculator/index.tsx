"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Cake,
  CheckCircle2,
  Copy,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { diff, formatDateInput, nextAnniversary } from "@/lib/tools/datetime/diff";

const STORAGE_KEY = "toollyz:age-diff-input";

interface State {
  from: string;
  to: string;
  liveNow: boolean; // when true, the "to" field follows the current time
}

function isoNow(): string {
  return formatDateInput(new Date());
}

const DEFAULT_STATE: State = {
  from: "1995-06-15T08:30",
  to: isoNow(),
  liveNow: true,
};

export default function AgeDifferenceCalculator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({ ...DEFAULT_STATE, ...parsed, to: parsed.liveNow ?? true ? isoNow() : (parsed.to ?? DEFAULT_STATE.to) });
      } else {
        setState((s) => ({ ...s, to: isoNow() }));
      }
    } catch {
      setState((s) => ({ ...s, to: isoNow() }));
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  // Live update the "to" field once per second while liveNow is on.
  React.useEffect(() => {
    if (!mounted || !state.liveNow) return;
    const id = window.setInterval(() => {
      setState((s) => ({ ...s, to: isoNow() }));
      setTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [mounted, state.liveNow]);

  // tick is intentionally read to re-render when liveNow stops, but we don't
  // act on it directly.
  void tick;

  const result = React.useMemo(() => {
    const a = new Date(state.from);
    const b = new Date(state.to);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    return diff(a, b);
  }, [state.from, state.to]);

  const anniversary = React.useMemo(() => {
    const a = new Date(state.from);
    if (Number.isNaN(a.getTime())) return null;
    const now = new Date();
    const next = nextAnniversary(a, now);
    const untilDays = Math.ceil((next.getTime() - now.getTime()) / 86400000);
    return { next, untilDays };
  }, [state.from]);

  function swap() {
    setState((s) => ({ ...s, from: s.to, to: s.from, liveNow: false }));
  }

  function reset() {
    setState({ ...DEFAULT_STATE, to: isoNow() });
    toast.success("Reset to defaults");
  }

  async function copySummary() {
    if (!result) return;
    const { breakdown, totals } = result;
    const text = [
      `From ${state.from.replace("T", " ")} to ${state.to.replace("T", " ")}`,
      `Breakdown: ${breakdown.years}y ${breakdown.months}mo ${breakdown.days}d ${breakdown.hours}h ${breakdown.minutes}m ${breakdown.seconds}s`,
      `Totals: ${totals.totalYears.toFixed(3)}y · ${totals.totalMonths}mo · ${totals.totalWeeks}w · ${totals.totalDays}d · ${totals.totalHours}h · ${totals.totalMinutes}m · ${totals.totalSeconds}s`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Summary copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

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
        aria-label="Age breakdown"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-6">
          <Stat label="Years" value={result?.breakdown.years ?? 0} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Months" value={result?.breakdown.months ?? 0} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Days" value={result?.breakdown.days ?? 0} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Hours" value={result?.breakdown.hours ?? 0} reduceMotion={!!reduceMotion} />
          <Stat label="Minutes" value={result?.breakdown.minutes ?? 0} reduceMotion={!!reduceMotion} />
          <Stat label="Seconds" value={result?.breakdown.seconds ?? 0} reduceMotion={!!reduceMotion} />
        </div>
        {result?.reversed && (
          <p className="relative mt-3 text-[11px] text-amber-300/80">From is later than To — values shown are the absolute difference.</p>
        )}
      </section>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs font-medium">From</Label>
            <Input
              id="from"
              type="datetime-local"
              value={state.from}
              onChange={(e) => setState((s) => ({ ...s, from: e.target.value }))}
              className="font-mono"
            />
          </div>
          <div className="flex justify-center pb-1.5">
            <Button type="button" size="icon" variant="outline" onClick={swap} aria-label="Swap dates">
              <ArrowLeftRight className="size-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs font-medium">To</Label>
            <Input
              id="to"
              type="datetime-local"
              value={state.to}
              onChange={(e) => setState((s) => ({ ...s, to: e.target.value, liveNow: false }))}
              className="font-mono"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.liveNow}
              onChange={(e) => setState((s) => ({ ...s, liveNow: e.target.checked, to: e.target.checked ? isoNow() : s.to }))}
              className="size-4 rounded border-border accent-primary"
            />
            Update <strong>To</strong> live to now
          </label>
          <Button type="button" size="sm" variant="outline" onClick={copySummary} disabled={!result}>
            <Copy className="size-3.5" />
            Copy summary
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      {/* Totals table */}
      {result && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Totals in each unit
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <TotalCell label="Years (decimal)" value={result.totals.totalYears.toFixed(3)} />
            <TotalCell label="Months" value={result.totals.totalMonths.toLocaleString()} />
            <TotalCell label="Weeks" value={result.totals.totalWeeks.toLocaleString()} />
            <TotalCell label="Days" value={result.totals.totalDays.toLocaleString()} />
            <TotalCell label="Hours" value={result.totals.totalHours.toLocaleString()} />
            <TotalCell label="Minutes" value={result.totals.totalMinutes.toLocaleString()} />
            <TotalCell label="Seconds" value={result.totals.totalSeconds.toLocaleString()} />
            <TotalCell label="Milliseconds" value={result.totals.totalMilliseconds.toLocaleString()} />
          </div>
        </section>
      )}

      {/* Anniversary */}
      {anniversary && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Cake className="size-4 text-primary" />
            Next anniversary
          </h2>
          <p className="text-sm">
            <strong>{anniversary.next.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> — in {anniversary.untilDays} day{anniversary.untilDays === 1 ? "" : "s"}.
          </p>
          <p className="text-[11px] text-muted-foreground">
            For Feb 29 birthdays in non-leap years, the anniversary lands on Feb 28 of that year and bumps back to Feb 29 in the next leap year.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Cake className="mt-0.5 size-3.5 shrink-0 text-primary" />Calendar-correct subtraction: 30 Jan + 1 month = 28 Feb (or 29 in a leap year). Same convention as Day.js&apos;s <code className="font-mono">.diff</code>.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Decimal years use the Gregorian mean of 365.2425 days per year.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Live mode updates the &quot;To&quot; field every second so the age breakdown counts up in real time.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — dates stay in your browser. The current pair saves to localStorage.</li>
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
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function TotalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5 rounded-lg border border-border/60 bg-background p-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
