"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  DollarSign,
  Info,
  Lock,
  Minus,
  Plus,
  RefreshCcw,
  Sparkles,
  Users,
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
import { CURRENCY_OPTIONS, formatMoney } from "@/lib/tools/finance/money";

const STORAGE_KEY = "toollyz:tip-input";

type RoundMode = "off" | "nearest-1" | "nearest-5" | "nearest-10" | "round-up";

interface State {
  bill: number;
  tipPct: number;
  people: number;
  roundMode: RoundMode;
  currency: string;
  tipOnGross: boolean; // tip on pre-tax (net) vs the total bill (gross)
}

const DEFAULT_STATE: State = {
  bill: 50,
  tipPct: 18,
  people: 2,
  roundMode: "nearest-1",
  currency: "USD",
  tipOnGross: true,
};

function roundAmount(amount: number, mode: RoundMode): number {
  if (!Number.isFinite(amount)) return amount;
  switch (mode) {
    case "nearest-1":
      return Math.round(amount);
    case "nearest-5":
      return Math.round(amount / 5) * 5;
    case "nearest-10":
      return Math.round(amount / 10) * 10;
    case "round-up":
      return Math.ceil(amount);
    case "off":
    default:
      return amount;
  }
}

export default function TipCalculator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);

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

  const result = React.useMemo(() => {
    const tipRaw = (state.tipPct / 100) * state.bill;
    const totalRaw = state.bill + tipRaw;
    const total = roundAmount(totalRaw, state.roundMode);
    const tip = total - state.bill;
    const perPerson = state.people > 0 ? total / state.people : total;
    return {
      tipRaw,
      tip,
      total,
      perPerson,
    };
  }, [state.bill, state.tipPct, state.roundMode, state.people]);

  async function copySummary() {
    const lines = [
      `Bill: ${formatMoney(state.bill, state.currency)}`,
      `Tip: ${formatMoney(result.tip, state.currency)} (${state.tipPct}%)`,
      `Total: ${formatMoney(result.total, state.currency)}`,
      state.people > 1 ? `Per person (${state.people}): ${formatMoney(result.perPerson, state.currency)}` : "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Summary copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function reset() {
    setState(DEFAULT_STATE);
    toast.success("Reset");
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
        aria-label="Tip summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Cell label="Bill" value={formatMoney(state.bill, state.currency)} accent="text-indigo-50" />
          <Cell label={`Tip · ${state.tipPct}%`} value={formatMoney(result.tip, state.currency)} accent="text-amber-300" />
          <Cell label="Total" value={formatMoney(result.total, state.currency)} accent="text-emerald-300" emphasis />
          <Cell label={`Per person · ${state.people}`} value={formatMoney(result.perPerson, state.currency)} accent="text-emerald-200" emphasis={state.people > 1} />
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="bill" className="text-xs font-medium">Bill amount</Label>
            <div className="flex gap-2">
              <Input
                id="bill"
                type="number"
                min={0}
                step="0.01"
                value={state.bill}
                onChange={(e) => setState((s) => ({ ...s, bill: Math.max(0, Number(e.target.value) || 0) }))}
                className="font-mono text-lg"
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="people" className="flex items-center gap-1.5 text-xs font-medium">
              <Users className="size-3.5 text-primary" />
              Split between (people)
            </Label>
            <div className="flex items-center gap-2">
              <Button type="button" size="icon" variant="outline" onClick={() => setState((s) => ({ ...s, people: Math.max(1, s.people - 1) }))} aria-label="Fewer people">
                <Minus className="size-3.5" />
              </Button>
              <Input
                id="people"
                type="number"
                min={1}
                max={100}
                value={state.people}
                onChange={(e) => setState((s) => ({ ...s, people: Math.max(1, Math.min(100, Number(e.target.value) || 1)) }))}
                className="font-mono text-center text-lg"
              />
              <Button type="button" size="icon" variant="outline" onClick={() => setState((s) => ({ ...s, people: Math.min(100, s.people + 1) }))} aria-label="More people">
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tip" className="text-xs font-medium">Tip · {state.tipPct}%</Label>
          <Slider value={[state.tipPct]} onValueChange={(v) => setState((s) => ({ ...s, tipPct: Array.isArray(v) ? v[0] : (v as number) }))} min={0} max={40} step={0.5} />
          <div className="flex flex-wrap gap-1.5">
            {[0, 5, 10, 15, 18, 20, 22, 25, 30].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setState((s) => ({ ...s, tipPct: p }))}
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-xs",
                  state.tipPct === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted",
                )}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="round" className="text-xs font-medium">Rounding</Label>
            <Select value={state.roundMode} onValueChange={(v) => v && setState((s) => ({ ...s, roundMode: v as RoundMode }))}>
              <SelectTrigger id="round" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">No rounding</SelectItem>
                <SelectItem value="nearest-1">Round total to nearest 1</SelectItem>
                <SelectItem value="nearest-5">Round total to nearest 5</SelectItem>
                <SelectItem value="nearest-10">Round total to nearest 10</SelectItem>
                <SelectItem value="round-up">Always round up</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              When rounding is on the displayed Tip is the difference between the rounded total and the original bill (it absorbs the rounding).
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={copySummary}>
              <Copy className="size-3.5" />
              Copy summary
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Tipping notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><DollarSign className="mt-0.5 size-3.5 shrink-0 text-primary" />US restaurants: 15% is standard, 18–20% for good service, 20%+ for excellent. Quick-service tipping is increasingly expected but optional.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Europe: a service charge (servizio, couvert, gratuité) is usually included; round up or leave 5–10% extra for great service.</li>
          <li className="flex items-start gap-1.5"><Users className="mt-0.5 size-3.5 shrink-0 text-primary" />Asia (Japan, Korea): tipping is not customary and can be considered rude — rounding up to the nearest small bill is enough.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — the math runs in your browser. Last bill, tip and split save to localStorage on this device only.</li>
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

function Cell({ label, value, accent, emphasis }: { label: string; value: string; accent: string; emphasis?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading tabular-nums", emphasis ? "text-3xl font-bold sm:text-4xl" : "text-xl font-semibold sm:text-2xl", accent)}>
        {value}
      </div>
    </div>
  );
}
