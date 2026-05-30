"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Info,
  Landmark,
  Lock,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CURRENCY_OPTIONS, formatMoney } from "@/lib/tools/finance/money";
import {
  loanSummary,
  periodsPerYear,
  type Frequency,
  type LoanInput,
} from "@/lib/tools/finance/loan";

const STORAGE_KEY = "toollyz:loan-scenarios";

interface Scenario {
  id: string;
  label: string;
  principal: number;
  annualRatePct: number;
  termYears: number;
  frequency: Frequency;
  extraPerPeriod: number;
}

interface State {
  scenarios: Scenario[];
  currency: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function defaultScenario(partial: Partial<Scenario>): Scenario {
  return {
    id: uid(),
    label: "Scenario",
    principal: 250_000,
    annualRatePct: 7.5,
    termYears: 25,
    frequency: "monthly",
    extraPerPeriod: 0,
    ...partial,
  };
}

const DEFAULT_STATE: State = {
  currency: "USD",
  scenarios: [
    defaultScenario({ label: "30 yr fixed", termYears: 30, annualRatePct: 7.5 }),
    defaultScenario({ label: "15 yr fixed", termYears: 15, annualRatePct: 6.5 }),
    defaultScenario({ label: "30 yr + $200 extra", termYears: 30, annualRatePct: 7.5, extraPerPeriod: 200 }),
  ],
};

const FREQUENCY_OPTIONS: { id: Frequency; label: string }[] = [
  { id: "monthly", label: "Monthly (12 / yr)" },
  { id: "biweekly", label: "Biweekly (26 / yr)" },
  { id: "weekly", label: "Weekly (52 / yr)" },
];

export default function LoanCalculator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        if (parsed && Array.isArray(parsed.scenarios) && parsed.scenarios.length > 0) {
          setState({ ...DEFAULT_STATE, ...parsed });
        }
      }
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

  function update(id: string, patch: Partial<Scenario>) {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
    }));
  }

  function add() {
    if (state.scenarios.length >= 4) {
      toast.error("Max 4 scenarios — remove one to add another.");
      return;
    }
    setState((s) => ({ ...s, scenarios: [...s.scenarios, defaultScenario({ label: `Scenario ${s.scenarios.length + 1}` })] }));
  }

  function remove(id: string) {
    if (state.scenarios.length <= 1) {
      toast.error("Keep at least one scenario.");
      return;
    }
    setState((s) => ({ ...s, scenarios: s.scenarios.filter((sc) => sc.id !== id) }));
  }

  function reset() {
    setState(DEFAULT_STATE);
    toast.success("Reset to defaults");
  }

  const computed = React.useMemo(() => {
    return state.scenarios.map((sc) => {
      const input: LoanInput = {
        principal: sc.principal,
        annualRatePct: sc.annualRatePct,
        termYears: sc.termYears,
        frequency: sc.frequency,
        extraPerPeriod: sc.extraPerPeriod,
      };
      return { scenario: sc, summary: loanSummary(input) };
    });
  }, [state.scenarios]);

  async function copySummary() {
    const lines = computed.map(({ scenario, summary }) => {
      const ppy = periodsPerYear(scenario.frequency);
      return [
        `${scenario.label}: ${formatMoney(scenario.principal, state.currency)} @ ${scenario.annualRatePct}% × ${scenario.termYears}y · ${scenario.frequency}`,
        `Payment: ${formatMoney(summary.payment, state.currency)}/${scenario.frequency.replace("ly", "")} (${ppy}/yr)`,
        `Total interest: ${formatMoney(summary.totalInterest, state.currency)} · Total paid: ${formatMoney(summary.totalPaid, state.currency)}`,
        scenario.extraPerPeriod > 0
          ? `Extra ${formatMoney(scenario.extraPerPeriod, state.currency)}/period saves ~${Math.round(summary.payoffMonthsSaved)} mo`
          : "",
      ].filter(Boolean).join("\n");
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n\n"));
      toast.success("Comparison copied");
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

  // Identify the best scenario by total interest paid (lowest wins).
  let bestId: string | null = null;
  let bestInterest = Infinity;
  for (const { scenario, summary } of computed) {
    if (summary.totalInterest < bestInterest) {
      bestInterest = summary.totalInterest;
      bestId = scenario.id;
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Loan comparison"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300/70">Compare up to 4 scenarios</div>
            <h1 className="font-heading text-2xl font-bold text-indigo-50 sm:text-3xl">Loan Calculator</h1>
            <p className="text-xs text-indigo-200/80">Vary tenure, interest rate, payment frequency or prepayment — see total interest side-by-side.</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={state.currency} onValueChange={(v) => v && setState((s) => ({ ...s, currency: v }))}>
              <SelectTrigger className="w-32 justify-between bg-white/5 font-mono text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" variant="outline" onClick={add} className="bg-white/5 text-white" disabled={state.scenarios.length >= 4}>
              <Plus className="size-3.5" />
              Scenario
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={copySummary} className="text-white">
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white">
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {computed.map(({ scenario, summary }) => {
          const isBest = scenario.id === bestId && computed.length > 1;
          const ppy = periodsPerYear(scenario.frequency);
          return (
            <article
              key={scenario.id}
              className={cn(
                "space-y-3 rounded-2xl border bg-card p-4",
                isBest ? "border-emerald-500/40 ring-1 ring-emerald-500/30" : "border-border/70",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <Input
                  value={scenario.label}
                  onChange={(e) => update(scenario.id, { label: e.target.value })}
                  className="font-semibold"
                />
                {isBest && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    <TrendingDown className="size-3" />
                    Lowest interest
                  </span>
                )}
                {state.scenarios.length > 1 && (
                  <Button type="button" size="icon-xs" variant="ghost" onClick={() => remove(scenario.id)} aria-label="Remove scenario">
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow label="Principal">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={scenario.principal}
                    onChange={(e) => update(scenario.id, { principal: Math.max(0, Number(e.target.value) || 0) })}
                    className="font-mono"
                  />
                </FieldRow>
                <FieldRow label="Rate %">
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    step="0.01"
                    value={scenario.annualRatePct}
                    onChange={(e) => update(scenario.id, { annualRatePct: Math.max(0, Number(e.target.value) || 0) })}
                    className="font-mono"
                  />
                </FieldRow>
                <FieldRow label="Years">
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    step="1"
                    value={scenario.termYears}
                    onChange={(e) => update(scenario.id, { termYears: Math.max(1, Math.min(40, Number(e.target.value) || 1)) })}
                    className="font-mono"
                  />
                </FieldRow>
                <FieldRow label="Frequency">
                  <Select value={scenario.frequency} onValueChange={(v) => v && update(scenario.id, { frequency: v as Frequency })}>
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Extra / period" full>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={scenario.extraPerPeriod}
                    onChange={(e) => update(scenario.id, { extraPerPeriod: Math.max(0, Number(e.target.value) || 0) })}
                    className="font-mono"
                  />
                </FieldRow>
              </div>
              <div className="space-y-1 rounded-lg border border-border/60 bg-background p-3">
                <Row label="Payment" value={`${formatMoney(summary.payment, state.currency)} / ${freqShort(scenario.frequency)}`} emphasis />
                <Row label="Periods" value={`${summary.periods} (${ppy} / yr)`} />
                <Row label="Total interest" value={formatMoney(summary.totalInterest, state.currency)} accent="text-amber-700 dark:text-amber-400" />
                <Row label="Total paid" value={formatMoney(summary.totalPaid, state.currency)} />
                {scenario.extraPerPeriod > 0 && (
                  <Row
                    label="Time saved"
                    value={summary.payoffMonthsSaved > 0 ? `~${Math.round(summary.payoffMonthsSaved)} mo earlier` : "—"}
                    accent="text-emerald-700 dark:text-emerald-400"
                  />
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Standard amortising payment: P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where r is per-period rate and n is total periods.</li>
          <li className="flex items-start gap-1.5"><Landmark className="mt-0.5 size-3.5 shrink-0 text-primary" />Biweekly and weekly payments use 26 and 52 periods per year, computed by simulating the schedule including any extra payment.</li>
          <li className="flex items-start gap-1.5"><TrendingDown className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Extra-payment scenarios assume the same fixed payment is applied every period — they don&apos;t model one-off lumps.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Scenarios save to localStorage on this device only.</li>
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

function FieldRow({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1", full && "col-span-2")}>
      <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value, accent, emphasis }: { label: string; value: string; accent?: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono tabular-nums", accent ?? "text-foreground", emphasis && "font-semibold")}>{value}</span>
    </div>
  );
}

function freqShort(f: Frequency): string {
  if (f === "biweekly") return "biweekly";
  if (f === "weekly") return "week";
  return "month";
}
