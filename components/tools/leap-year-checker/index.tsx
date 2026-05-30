"use client";

import * as React from "react";
import {
  Calendar,
  Cake,
  CheckCircle2,
  Copy,
  Info,
  Lock,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isLeap } from "@/lib/tools/datetime/diff";

const STORAGE_KEY = "toollyz:leap-year-input";

interface State {
  year: number;
  rangeStart: number;
  rangeEnd: number;
  birthdayYearFrom: number;
  birthdayYearTo: number;
}

function currentYear(): number {
  return new Date().getFullYear();
}

const DEFAULT: State = {
  year: currentYear(),
  rangeStart: currentYear() - 5,
  rangeEnd: currentYear() + 10,
  birthdayYearFrom: 2000,
  birthdayYearTo: currentYear(),
};

interface RuleBreakdown {
  divBy4: boolean;
  divBy100: boolean;
  divBy400: boolean;
  isLeap: boolean;
}

function breakdown(year: number): RuleBreakdown {
  const divBy4 = year % 4 === 0;
  const divBy100 = year % 100 === 0;
  const divBy400 = year % 400 === 0;
  return { divBy4, divBy100, divBy400, isLeap: isLeap(year) };
}

function leapsInRange(start: number, end: number): number[] {
  const [a, b] = start <= end ? [start, end] : [end, start];
  const out: number[] = [];
  for (let y = a; y <= b; y++) if (isLeap(y)) out.push(y);
  return out;
}

function nextNLeapYears(from: number, n: number): number[] {
  const out: number[] = [];
  let y = from + 1;
  while (out.length < n) {
    if (isLeap(y)) out.push(y);
    y += 1;
    if (y > from + 600) break;
  }
  return out;
}

function previousNLeapYears(from: number, n: number): number[] {
  const out: number[] = [];
  let y = from - 1;
  while (out.length < n) {
    if (isLeap(y)) out.push(y);
    y -= 1;
    if (y < from - 600) break;
  }
  return out;
}

export default function LeapYearChecker() {
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

  const rules = React.useMemo(() => breakdown(state.year), [state.year]);
  const range = React.useMemo(() => leapsInRange(state.rangeStart, state.rangeEnd), [state.rangeStart, state.rangeEnd]);
  const previous = React.useMemo(() => previousNLeapYears(state.year, 10), [state.year]);
  const upcoming = React.useMemo(() => nextNLeapYears(state.year, 10), [state.year]);

  const birthdayWindow = React.useMemo(() => {
    const a = Math.min(state.birthdayYearFrom, state.birthdayYearTo);
    const b = Math.max(state.birthdayYearFrom, state.birthdayYearTo);
    const leaps = leapsInRange(a, b);
    return { count: leaps.length, span: b - a + 1, leaps };
  }, [state.birthdayYearFrom, state.birthdayYearTo]);

  async function copyExplanation() {
    const lines = [
      `${state.year} is ${rules.isLeap ? "a leap year" : "not a leap year"}.`,
      `Divisible by 4? ${rules.divBy4 ? "yes" : "no"}`,
      `Divisible by 100? ${rules.divBy100 ? "yes" : "no"}`,
      `Divisible by 400? ${rules.divBy400 ? "yes" : "no"}`,
      "",
      `Rule: a Gregorian year is a leap year if it's divisible by 4, unless it's divisible by 100, except when it's also divisible by 400.`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Explanation copied");
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
      {/* Hero answer */}
      <section
        aria-label="Leap year answer"
        className={cn(
          "relative overflow-hidden rounded-3xl border p-5 sm:p-6",
          rules.isLeap ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5",
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          {rules.isLeap ? (
            <CheckCircle2 className="size-16 text-emerald-500" />
          ) : (
            <XCircle className="size-16 text-rose-500" />
          )}
          <div className="flex-1">
            <div className={cn("text-xs uppercase tracking-wider", rules.isLeap ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
              {rules.isLeap ? "Yes — a leap year" : "Not a leap year"}
            </div>
            <h1 className="font-heading text-4xl font-bold tabular-nums sm:text-5xl">{state.year}</h1>
            <p className="text-xs text-muted-foreground">
              {rules.isLeap
                ? "February has 29 days. The year has 366 days."
                : "February has 28 days. The year has 365 days."}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={copyExplanation}>
              <Copy className="size-3.5" />
              Copy explanation
            </Button>
          </div>
        </div>
      </section>

      {/* Year input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <Label htmlFor="year" className="text-xs font-medium">Year</Label>
        <Input
          id="year"
          type="number"
          min={1}
          max={9999}
          value={state.year}
          onChange={(e) => setState((s) => ({ ...s, year: Math.max(1, Math.min(9999, Number(e.target.value) || currentYear())) }))}
          className="w-40 font-mono text-xl"
        />
        <div className="flex flex-wrap gap-1.5">
          {[currentYear() - 4, currentYear(), currentYear() + 4, 2000, 1900, 1582].map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setState((s) => ({ ...s, year: y }))}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs hover:bg-muted"
            >
              {y}
            </button>
          ))}
        </div>
      </section>

      {/* Rule breakdown */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          The Gregorian rule, step by step
        </h2>
        <p className="text-xs text-muted-foreground">
          A year is a leap year when it&apos;s divisible by 4, <em>unless</em> it&apos;s divisible by 100 — <em>unless</em> it&apos;s also divisible by 400.
        </p>
        <ol className="space-y-1.5 list-decimal pl-4 text-xs">
          <RuleStep ok={rules.divBy4} label={`Is ${state.year} divisible by 4?`} answer={rules.divBy4 ? "Yes" : "No"} />
          <RuleStep
            ok={!rules.divBy100}
            label={`Is ${state.year} divisible by 100 (a century year)?`}
            answer={rules.divBy100 ? "Yes — common year unless rule 3 saves it" : "No"}
            invertGoodPath
          />
          <RuleStep
            ok={rules.divBy400}
            label={`Is ${state.year} divisible by 400?`}
            answer={rules.divBy400 ? "Yes — leap year regardless" : rules.divBy100 ? "No — common year" : "Not relevant when rule 2 already said no"}
          />
        </ol>
      </section>

      {/* Surrounding leap years */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Previous 10 leap years</h3>
          <div className="flex flex-wrap gap-1.5">
            {previous.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setState((s) => ({ ...s, year: y }))}
                className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs hover:bg-muted"
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next 10 leap years</h3>
          <div className="flex flex-wrap gap-1.5">
            {upcoming.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setState((s) => ({ ...s, year: y }))}
                className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs hover:bg-muted"
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Range list */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Calendar className="size-4 text-primary" />
          Leap years in a range
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
          <div className="space-y-1.5">
            <Label htmlFor="rangeStart" className="text-xs font-medium">From</Label>
            <Input
              id="rangeStart"
              type="number"
              min={1}
              max={9999}
              value={state.rangeStart}
              onChange={(e) => setState((s) => ({ ...s, rangeStart: Number(e.target.value) || 2000 }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rangeEnd" className="text-xs font-medium">To</Label>
            <Input
              id="rangeEnd"
              type="number"
              min={1}
              max={9999}
              value={state.rangeEnd}
              onChange={(e) => setState((s) => ({ ...s, rangeEnd: Number(e.target.value) || 2100 }))}
              className="font-mono"
            />
          </div>
          <div className="rounded-lg border border-border/60 bg-background p-2.5 text-xs">
            <div className="font-mono">{range.length} leap year{range.length === 1 ? "" : "s"} in that range</div>
            <div className="mt-1 flex max-h-32 flex-wrap gap-1 overflow-auto text-[11px]">
              {range.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, year: y }))}
                  className="rounded border border-border/60 bg-card px-1.5 font-mono hover:bg-muted"
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feb 29 birthday counter */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Cake className="size-4 text-primary" />
          February 29 birthday counter
        </h2>
        <p className="text-xs text-muted-foreground">
          If your birthday is on Feb 29, your true birthday only lands every leap year. Pick a range to see how many real birthdays you&apos;ve had.
        </p>
        <div className="grid items-end gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="bdayFrom" className="text-xs font-medium">Born in</Label>
            <Input
              id="bdayFrom"
              type="number"
              value={state.birthdayYearFrom}
              onChange={(e) => setState((s) => ({ ...s, birthdayYearFrom: Number(e.target.value) || 2000 }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bdayTo" className="text-xs font-medium">Up to</Label>
            <Input
              id="bdayTo"
              type="number"
              value={state.birthdayYearTo}
              onChange={(e) => setState((s) => ({ ...s, birthdayYearTo: Number(e.target.value) || currentYear() }))}
              className="font-mono"
            />
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
            <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Real birthdays</div>
            <div className="font-heading text-3xl font-bold tabular-nums">{birthdayWindow.count}</div>
            <div className="text-[11px] text-muted-foreground">across {birthdayWindow.span} year{birthdayWindow.span === 1 ? "" : "s"}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Calendar className="mt-0.5 size-3.5 shrink-0 text-primary" />The Gregorian calendar was introduced by Pope Gregory XIII in October 1582. Years before that should use the Julian rule (every 4 years, no century exception).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Notable century years: 1600 and 2000 were leap years (divisible by 400); 1700, 1800 and 1900 weren&apos;t (divisible by 100 but not 400).</li>
          <li className="flex items-start gap-1.5"><Cake className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />A person born on Feb 29, 1992 has had {leapsInRange(1992, currentYear()).length} real birthdays as of {currentYear()}.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every check runs in your browser. Settings save to localStorage.</li>
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

function RuleStep({ ok, label, answer, invertGoodPath }: { ok: boolean; label: string; answer: string; invertGoodPath?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className={cn("size-4 shrink-0", invertGoodPath ? "text-emerald-500" : "text-emerald-500")} />
      ) : (
        <X className="size-4 shrink-0 text-rose-500" />
      )}
      <span>{label} <strong>{answer}</strong></span>
    </li>
  );
}
