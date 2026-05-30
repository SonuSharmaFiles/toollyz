"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Info,
  Landmark,
  Lock,
  RefreshCcw,
  Sparkles,
  Wallet,
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
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { CURRENCY_OPTIONS, downloadCsv, formatMoney } from "@/lib/tools/finance/money";
import { amortizationSchedule, loanSummary, type AmortizationRow } from "@/lib/tools/finance/loan";

const STORAGE_KEY = "toollyz:emi-input";

interface State {
  principal: number;
  annualRatePct: number;
  termYears: number;
  currency: string;
}

const DEFAULT_STATE: State = {
  principal: 25_00_000,
  annualRatePct: 8.5,
  termYears: 15,
  currency: "INR",
};

export default function EmiCalculator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<State>) });
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

  const summary = React.useMemo(
    () => loanSummary({ principal: state.principal, annualRatePct: state.annualRatePct, termYears: state.termYears, frequency: "monthly" }),
    [state],
  );
  const schedule = React.useMemo(
    () => amortizationSchedule({ principal: state.principal, annualRatePct: state.annualRatePct, termYears: state.termYears, frequency: "monthly" }),
    [state],
  );

  const principalPct = summary.totalPaid > 0 ? Math.round((state.principal / summary.totalPaid) * 100) : 0;
  const interestPct = 100 - principalPct;

  async function copySummary() {
    const lines = [
      `Loan: ${formatMoney(state.principal, state.currency)} @ ${state.annualRatePct}% for ${state.termYears} years`,
      `EMI: ${formatMoney(summary.payment, state.currency)}`,
      `Total interest: ${formatMoney(summary.totalInterest, state.currency)}`,
      `Total paid: ${formatMoney(summary.totalPaid, state.currency)}`,
      `Principal share: ${principalPct}%; interest share: ${interestPct}%.`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Summary copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function exportCsv() {
    const rows = ["month,opening_balance,emi,principal,interest,closing_balance"];
    schedule.forEach((r) => {
      rows.push(
        [
          r.period,
          r.openingBalance.toFixed(2),
          r.payment.toFixed(2),
          r.principal.toFixed(2),
          r.interest.toFixed(2),
          r.closingBalance.toFixed(2),
        ].join(","),
      );
    });
    downloadCsv(rows, `toollyz-emi-${state.principal}-${state.annualRatePct}-${state.termYears}.csv`);
    toast.success("Schedule exported");
  }

  function reset() {
    setState(DEFAULT_STATE);
    toast.success("Reset to defaults");
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
        aria-label="EMI summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Monthly EMI" value={summary.payment} currency={state.currency} reduceMotion={!!reduceMotion} accent="text-emerald-300" highlight />
          <Stat label="Total interest" value={summary.totalInterest} currency={state.currency} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Total payable" value={summary.totalPaid} currency={state.currency} reduceMotion={!!reduceMotion} />
          <Stat label="Tenure" value={Math.round(state.termYears * 12)} suffix=" mo" reduceMotion={!!reduceMotion} accent="text-indigo-300" />
        </div>
        <div className="relative mt-4 space-y-1.5">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="flex h-full">
              <div className="bg-emerald-400" style={{ width: `${principalPct}%` }} />
              <div className="bg-amber-400" style={{ width: `${interestPct}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-indigo-200/80">
            <span><span className="inline-block size-2 align-middle bg-emerald-400 mr-1" /> Principal {principalPct}%</span>
            <span><span className="inline-block size-2 align-middle bg-amber-400 mr-1" /> Interest {interestPct}%</span>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Wallet className="size-4 text-primary" />
          Loan details
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Loan amount">
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step="any"
                value={state.principal}
                onChange={(e) => setState((s) => ({ ...s, principal: Math.max(0, Number(e.target.value) || 0) }))}
                className="font-mono"
              />
              <Select value={state.currency} onValueChange={(v) => v && setState((s) => ({ ...s, currency: v }))}>
                <SelectTrigger className="w-32 justify-between font-mono">
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
            </div>
            <Slider value={[state.principal]} onValueChange={(v) => setState((s) => ({ ...s, principal: Array.isArray(v) ? v[0] : (v as number) }))} min={10_000} max={5_00_00_000} step={10_000} />
          </Field>
          <Field label={`Annual interest rate · ${state.annualRatePct.toFixed(2)}%`}>
            <Input
              type="number"
              min={0}
              max={50}
              step="0.01"
              value={state.annualRatePct}
              onChange={(e) => setState((s) => ({ ...s, annualRatePct: Math.max(0, Number(e.target.value) || 0) }))}
              className="font-mono"
            />
            <Slider value={[state.annualRatePct]} onValueChange={(v) => setState((s) => ({ ...s, annualRatePct: Array.isArray(v) ? v[0] : (v as number) }))} min={0} max={20} step={0.05} />
          </Field>
          <Field label={`Tenure · ${state.termYears} year${state.termYears === 1 ? "" : "s"} (${Math.round(state.termYears * 12)} months)`}>
            <Input
              type="number"
              min={1}
              max={40}
              step="1"
              value={state.termYears}
              onChange={(e) => setState((s) => ({ ...s, termYears: Math.max(1, Math.min(40, Number(e.target.value) || 1)) }))}
              className="font-mono"
            />
            <Slider value={[state.termYears]} onValueChange={(v) => setState((s) => ({ ...s, termYears: Math.round(Array.isArray(v) ? v[0] : (v as number)) }))} min={1} max={30} step={1} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={copySummary}>
            <Copy className="size-3.5" />
            Copy summary
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={exportCsv}>
            <Download className="size-3.5" />
            Export amortisation (CSV)
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Landmark className="size-4 text-primary" />
            Amortisation schedule
            <span className="ml-2 text-[10px] text-muted-foreground">{schedule.length} month{schedule.length === 1 ? "" : "s"}</span>
          </h2>
          {schedule.length > 12 && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show first 12 only" : `Show all ${schedule.length}`}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Month</th>
                <th className="p-2 text-right">Opening</th>
                <th className="p-2 text-right">EMI</th>
                <th className="p-2 text-right">Principal</th>
                <th className="p-2 text-right">Interest</th>
                <th className="p-2 text-right">Closing</th>
              </tr>
            </thead>
            <tbody>
              {(showAll ? schedule : schedule.slice(0, 12)).map((r) => (
                <Row key={r.period} row={r} currency={state.currency} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />EMI formula: <code className="font-mono">P × r × (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)</code>, where r is the monthly rate and n is the total number of months.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />The schedule assumes a fixed interest rate and equal monthly payments — variable-rate loans (floating EMI) will differ over time.</li>
          <li className="flex items-start gap-1.5"><Landmark className="mt-0.5 size-3.5 shrink-0 text-primary" />Banks may charge processing fees, GST on interest or insurance — none of those are included here.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Inputs save to localStorage on this device only.</li>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  currency,
  suffix,
  reduceMotion,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  currency?: string;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading tabular-nums", highlight ? "text-3xl font-bold sm:text-4xl" : "text-xl font-semibold sm:text-2xl", accent ?? "text-indigo-50")}>
        {currency ? (
          formatMoney(value, currency)
        ) : (
          <>
            <AnimatedNumber value={value} reduceMotion={reduceMotion} />
            {suffix ?? ""}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ row, currency }: { row: AmortizationRow; currency: string }) {
  return (
    <tr className="border-b border-border/30 last:border-b-0">
      <td className="p-2 font-mono">{row.period}</td>
      <td className="p-2 text-right font-mono">{formatMoney(row.openingBalance, currency)}</td>
      <td className="p-2 text-right font-mono font-semibold">{formatMoney(row.payment, currency)}</td>
      <td className="p-2 text-right font-mono text-emerald-700 dark:text-emerald-400">{formatMoney(row.principal, currency)}</td>
      <td className="p-2 text-right font-mono text-amber-700 dark:text-amber-400">{formatMoney(row.interest, currency)}</td>
      <td className="p-2 text-right font-mono">{formatMoney(row.closingBalance, currency)}</td>
    </tr>
  );
}
