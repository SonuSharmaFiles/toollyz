"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  Info,
  Lock,
  Plus,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  WEEKDAYS,
  addBusinessDays,
  countBusinessDays,
  formatDateOnly,
  parseHolidays,
} from "@/lib/tools/datetime/business";

const STORAGE_KEY = "toollyz:business-days-input";

interface State {
  from: string;
  to: string;
  skipWeekends: boolean;
  weekendSat: boolean;
  weekendSun: boolean;
  holidays: string;
  addStart: string;
  addCount: number;
}

function todayISO(): string {
  return formatDateOnly(new Date());
}

const DEFAULT: State = {
  from: todayISO(),
  to: (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return formatDateOnly(d);
  })(),
  skipWeekends: true,
  weekendSat: true,
  weekendSun: true,
  holidays: "# One date per line, ISO format YYYY-MM-DD.\n# Append a comment after #.\n2026-01-01 # New Year's Day\n2026-12-25 # Christmas",
  addStart: todayISO(),
  addCount: 10,
};

export default function BusinessDaysCalculator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT, ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* noop */
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

  const holidays = React.useMemo(() => parseHolidays(state.holidays), [state.holidays]);
  const weekendDays = React.useMemo(() => {
    const days: number[] = [];
    if (state.weekendSun) days.push(0);
    if (state.weekendSat) days.push(6);
    return days;
  }, [state.weekendSat, state.weekendSun]);

  const breakdown = React.useMemo(() => {
    const a = new Date(state.from);
    const b = new Date(state.to);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    return countBusinessDays(a, b, {
      skipWeekends: state.skipWeekends,
      holidays: holidays.dates,
      weekendDays,
    });
  }, [state.from, state.to, state.skipWeekends, holidays.dates, weekendDays]);

  const addedDate = React.useMemo(() => {
    const start = new Date(state.addStart);
    if (Number.isNaN(start.getTime())) return null;
    return addBusinessDays(start, state.addCount, {
      skipWeekends: state.skipWeekends,
      holidays: holidays.dates,
      weekendDays,
    });
  }, [state.addStart, state.addCount, state.skipWeekends, holidays.dates, weekendDays]);

  function swap() {
    setState((s) => ({ ...s, from: s.to, to: s.from }));
  }

  function reset() {
    setState(DEFAULT);
    toast.success("Reset to defaults");
  }

  async function copySummary() {
    if (!breakdown) return;
    const text = [
      `${state.from} → ${state.to}`,
      `${breakdown.totalDays} calendar days · ${breakdown.businessDays} business days`,
      `Weekends: ${breakdown.weekendDays} · Holidays excluded: ${breakdown.holidayCount}`,
      `Per weekday: ${WEEKDAYS.map((w, i) => `${w} ${breakdown.perWeekday[i]}`).join(" · ")}`,
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
      {/* Hero stats */}
      <section
        aria-label="Business days summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Calendar days" value={breakdown?.totalDays ?? 0} reduceMotion={!!reduceMotion} />
          <Stat label="Business days" value={breakdown?.businessDays ?? 0} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Weekend days" value={breakdown?.weekendDays ?? 0} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Holidays excluded" value={breakdown?.holidayCount ?? 0} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
        </div>
      </section>

      <Tabs defaultValue="count" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
          <TabsTrigger value="count">Count between dates</TabsTrigger>
          <TabsTrigger value="add">Add business days</TabsTrigger>
        </TabsList>

        {/* COUNT MODE */}
        <TabsContent value="count" className="mt-4 space-y-3">
          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-1.5">
                <Label htmlFor="from" className="text-xs font-medium">From</Label>
                <Input id="from" type="date" value={state.from} onChange={(e) => setState((s) => ({ ...s, from: e.target.value }))} className="font-mono" />
              </div>
              <div className="flex justify-center pb-1.5">
                <Button type="button" size="icon" variant="outline" onClick={swap} aria-label="Swap dates">
                  <ArrowLeftRight className="size-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to" className="text-xs font-medium">To</Label>
                <Input id="to" type="date" value={state.to} onChange={(e) => setState((s) => ({ ...s, to: e.target.value }))} className="font-mono" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Both dates are included in the count. Reverse them — the result is the same.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={copySummary} disabled={!breakdown}>
                <Copy className="size-3.5" />
                Copy summary
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                <RefreshCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </section>

          {/* Weekday breakdown */}
          {breakdown && (
            <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <CalendarDays className="size-4 text-primary" />
                Per weekday
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((w, i) => {
                  const isWeekend = weekendDays.includes(i);
                  return (
                    <div
                      key={w}
                      className={cn(
                        "rounded-lg border bg-background p-2 text-center text-xs",
                        isWeekend && "border-amber-500/30 bg-amber-500/5",
                      )}
                    >
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{w}</div>
                      <div className="font-mono text-lg font-semibold tabular-nums">{breakdown.perWeekday[i]}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </TabsContent>

        {/* ADD MODE */}
        <TabsContent value="add" className="mt-4 space-y-3">
          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_180px]">
              <div className="space-y-1.5">
                <Label htmlFor="addStart" className="text-xs font-medium">Start date</Label>
                <Input id="addStart" type="date" value={state.addStart} onChange={(e) => setState((s) => ({ ...s, addStart: e.target.value }))} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addCount" className="text-xs font-medium">Business days to add</Label>
                <Input
                  id="addCount"
                  type="number"
                  min={-365}
                  max={365}
                  value={state.addCount}
                  onChange={(e) => setState((s) => ({ ...s, addCount: Number(e.target.value) || 0 }))}
                  className="font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Negative numbers go backwards. Holidays in the list and the selected weekend days are skipped.
            </p>
            {addedDate && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Lands on</div>
                <div className="font-mono text-lg font-semibold">
                  {addedDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
                <div className="text-[11px] text-muted-foreground">ISO {formatDateOnly(addedDate)}</div>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {/* Settings: weekends + holidays */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Weekends &amp; holidays
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.skipWeekends}
              onChange={(e) => setState((s) => ({ ...s, skipWeekends: e.target.checked }))}
              className="size-4 rounded border-border accent-primary"
            />
            Skip weekend days
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.weekendSat}
              onChange={(e) => setState((s) => ({ ...s, weekendSat: e.target.checked }))}
              className="size-4 rounded border-border accent-primary"
              disabled={!state.skipWeekends}
            />
            Saturday is a weekend day
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.weekendSun}
              onChange={(e) => setState((s) => ({ ...s, weekendSun: e.target.checked }))}
              className="size-4 rounded border-border accent-primary"
              disabled={!state.skipWeekends}
            />
            Sunday is a weekend day
          </label>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="holidays" className="text-xs font-medium">Holidays (one ISO date per line; <code className="font-mono">#</code> starts a comment)</Label>
          <Textarea
            id="holidays"
            value={state.holidays}
            onChange={(e) => setState((s) => ({ ...s, holidays: e.target.value }))}
            placeholder={`2026-01-01 # New Year's Day\n2026-12-25 # Christmas`}
            className="min-h-[140px] font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Parsed {holidays.dates.size} valid date{holidays.dates.size === 1 ? "" : "s"}{holidays.invalid.length > 0 ? ` · ${holidays.invalid.length} couldn't be parsed` : ""}.
          </p>
          {holidays.invalid.length > 0 && (
            <ul className="space-y-1 list-none">
              {holidays.invalid.slice(0, 5).map((line, i) => (
                <li key={i} className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                  <span className="font-mono">{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><CalendarDays className="mt-0.5 size-3.5 shrink-0 text-primary" />Both dates are inclusive — From and To are each counted as one day if they aren&apos;t weekends or holidays.</li>
          <li className="flex items-start gap-1.5"><Plus className="mt-0.5 size-3.5 shrink-0 text-primary" />The Add mode lands on the next non-weekend, non-holiday day relative to the start, so adding zero business days from a holiday returns the next workday.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />The default weekend is Sat + Sun; turn either off for regions where Sunday or Saturday is a working day (e.g. parts of the Middle East).</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — dates, weekends and holidays save to localStorage on this device only.</li>
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
