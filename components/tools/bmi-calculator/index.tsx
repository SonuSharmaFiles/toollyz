"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  HeartPulse,
  Info,
  Lock,
  RefreshCcw,
  Ruler,
  Scale,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  CATEGORIES,
  compute,
  kgToLb,
  lbToKg,
  type CategoryId,
  type UnitSystem,
} from "@/lib/tools/health/bmi";

const STORAGE_KEY = "toollyz:bmi-input";

interface State {
  unitSystem: UnitSystem;
  weight: number;
  height: number;
  /** imperial only: feet portion (in addition to inches in `height`). */
  feet: number;
  inches: number;
}

const DEFAULT_STATE: State = {
  unitSystem: "metric",
  weight: 70,
  height: 175,
  feet: 5,
  inches: 9,
};

const CATEGORY_COLOR: Record<CategoryId, string> = {
  "severe-thin": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "moderate-thin": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "mild-thin": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  normal: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  overweight: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "obese-1": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "obese-2": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "obese-3": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export default function BmiCalculator() {
  const reduceMotion = useReducedMotion();
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

  // Combine feet+inches into the imperial `height` (total inches) on the fly.
  const totalInches = state.feet * 12 + state.inches;
  const effectiveHeight = state.unitSystem === "imperial" ? totalInches : state.height;

  const result = React.useMemo(
    () =>
      compute({
        unitSystem: state.unitSystem,
        weight: state.weight,
        height: effectiveHeight,
      }),
    [state.unitSystem, state.weight, effectiveHeight],
  );

  function switchTo(unit: UnitSystem) {
    if (unit === state.unitSystem) return;
    setState((s) => {
      if (unit === "imperial") {
        const inches = s.height / 2.54;
        const feet = Math.floor(inches / 12);
        const rest = Math.round(inches - feet * 12);
        return {
          ...s,
          unitSystem: "imperial",
          weight: Math.round(kgToLb(s.weight) * 10) / 10,
          feet,
          inches: rest,
        };
      }
      const cm = (s.feet * 12 + s.inches) * 2.54;
      return {
        ...s,
        unitSystem: "metric",
        weight: Math.round(lbToKg(s.weight) * 10) / 10,
        height: Math.round(cm),
      };
    });
  }

  async function copySummary() {
    if (!result) return;
    const idealMin = state.unitSystem === "imperial" ? `${(kgToLb(result.idealWeightKgMin)).toFixed(1)} lb` : `${result.idealWeightKgMin} kg`;
    const idealMax = state.unitSystem === "imperial" ? `${(kgToLb(result.idealWeightKgMax)).toFixed(1)} lb` : `${result.idealWeightKgMax} kg`;
    const lines = [
      `BMI: ${result.bmi}`,
      `Category: ${result.category.label} (${result.bmi}; ${result.category.note})`,
      `BMI prime: ${result.bmiPrime} (1.0 = upper end of healthy)`,
      `Ideal weight range at your height: ${idealMin} – ${idealMax}`,
    ];
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
        aria-label="BMI result"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-indigo-300/70">Body Mass Index</div>
            <div className="font-heading text-6xl font-bold tabular-nums text-indigo-50 sm:text-7xl">
              <AnimatedNumber value={result?.bmi ?? 0} reduceMotion={!!reduceMotion} decimals={1} />
            </div>
            {result && (
              <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold", CATEGORY_COLOR[result.category.id])}>
                {result.category.label}
              </span>
            )}
          </div>
          {result && (
            <div className="space-y-3">
              <BmiScale value={result.bmi} />
              <p className="text-[11px] text-indigo-200/80">{result.category.note}</p>
            </div>
          )}
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <Tabs value={state.unitSystem} onValueChange={(v) => v && switchTo(v as UnitSystem)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
            <TabsTrigger value="metric">Metric (kg, cm)</TabsTrigger>
            <TabsTrigger value="imperial">Imperial (lb, ft+in)</TabsTrigger>
          </TabsList>
          <TabsContent value="metric" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field icon={<Scale className="size-3.5 text-primary" />} label="Weight (kg)">
                <Input
                  type="number"
                  min={0}
                  max={400}
                  step="0.1"
                  value={state.weight}
                  onChange={(e) => setState((s) => ({ ...s, weight: Math.max(0, Number(e.target.value) || 0) }))}
                  className="font-mono text-lg"
                />
              </Field>
              <Field icon={<Ruler className="size-3.5 text-primary" />} label="Height (cm)">
                <Input
                  type="number"
                  min={0}
                  max={272}
                  step="1"
                  value={state.height}
                  onChange={(e) => setState((s) => ({ ...s, height: Math.max(0, Number(e.target.value) || 0) }))}
                  className="font-mono text-lg"
                />
              </Field>
            </div>
          </TabsContent>
          <TabsContent value="imperial" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
              <Field icon={<Scale className="size-3.5 text-primary" />} label="Weight (lb)">
                <Input
                  type="number"
                  min={0}
                  max={900}
                  step="0.1"
                  value={state.weight}
                  onChange={(e) => setState((s) => ({ ...s, weight: Math.max(0, Number(e.target.value) || 0) }))}
                  className="font-mono text-lg"
                />
              </Field>
              <Field icon={<Ruler className="size-3.5 text-primary" />} label="Height ft">
                <Input
                  type="number"
                  min={0}
                  max={8}
                  step="1"
                  value={state.feet}
                  onChange={(e) => setState((s) => ({ ...s, feet: Math.max(0, Math.min(8, Number(e.target.value) || 0)) }))}
                  className="font-mono text-lg"
                />
              </Field>
              <Field icon={<Ruler className="size-3.5 text-primary" />} label="Height in">
                <Input
                  type="number"
                  min={0}
                  max={11}
                  step="1"
                  value={state.inches}
                  onChange={(e) => setState((s) => ({ ...s, inches: Math.max(0, Math.min(11, Number(e.target.value) || 0)) }))}
                  className="font-mono text-lg"
                />
              </Field>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex flex-wrap gap-1.5">
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

      {/* Ideal range + stats */}
      {result && (
        <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
          <Stat
            label="Ideal weight range"
            value={
              state.unitSystem === "imperial"
                ? `${kgToLb(result.idealWeightKgMin).toFixed(1)}–${kgToLb(result.idealWeightKgMax).toFixed(1)} lb`
                : `${result.idealWeightKgMin}–${result.idealWeightKgMax} kg`
            }
            note="BMI 18.5–24.9 at your height"
            accent="text-emerald-700 dark:text-emerald-400"
          />
          <Stat label="BMI prime" value={result.bmiPrime.toFixed(2)} note="BMI ÷ 25 — 1.0 is the upper end of healthy" />
          <Stat label="Ponderal index" value={`${result.ponderalIndex.toFixed(1)} kg/m³`} note="Less sensitive to height than BMI" />
        </section>
      )}

      {/* Category table */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          WHO categories
        </h2>
        <ul className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 list-none">
          {CATEGORIES.map((cat) => {
            const active = result?.category.id === cat.id;
            return (
              <li
                key={cat.id}
                className={cn(
                  "rounded-lg border p-2",
                  active ? "border-primary bg-primary/5 font-semibold" : "border-border/60 bg-background",
                )}
              >
                <div className="text-foreground">{cat.label}</div>
                <div className="font-mono text-muted-foreground">
                  {cat.min}–{cat.max === Infinity ? "+" : cat.max}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Caveats */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          What BMI isn&apos;t
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><HeartPulse className="mt-0.5 size-3.5 shrink-0" />BMI is a <strong>population statistic</strong>, not a diagnostic. It doesn&apos;t measure body fat, muscle mass or fat distribution.</li>
          <li className="flex items-start gap-1.5"><HeartPulse className="mt-0.5 size-3.5 shrink-0" />Athletes with lots of muscle often land in the &quot;overweight&quot; band despite low body-fat percentages.</li>
          <li className="flex items-start gap-1.5"><HeartPulse className="mt-0.5 size-3.5 shrink-0" />Pregnant people, growing children and adolescents need specialised charts (BMI percentile) — adult BMI doesn&apos;t apply.</li>
          <li className="flex items-start gap-1.5"><HeartPulse className="mt-0.5 size-3.5 shrink-0" />For a real health picture, also look at waist-to-height ratio, body-fat percentage, blood markers and your doctor&apos;s advice.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />BMI = weight (kg) ÷ height (m)². Imperial inputs are converted with 1 lb = 0.45359237 kg and 1 in = 0.0254 m.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Categories follow the World Health Organization adult classification (≥ 20 years old).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Ideal-weight range = BMI 18.5–24.9 × height². It&apos;s a rough rectangle around the &quot;healthy&quot; band.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Your weight, height and unit choice save to localStorage on this device only.</li>
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

function BmiScale({ value }: { value: number }) {
  // Visualise BMI on a 12–40 range with three coloured bands.
  const min = 12;
  const max = 40;
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  return (
    <div className="space-y-1">
      <div className="relative h-2.5 overflow-hidden rounded-full">
        <div className="absolute inset-0 flex">
          <div className="bg-sky-500/70" style={{ width: `${((18.5 - min) / (max - min)) * 100}%` }} />
          <div className="bg-emerald-500/70" style={{ width: `${((25 - 18.5) / (max - min)) * 100}%` }} />
          <div className="bg-amber-500/70" style={{ width: `${((30 - 25) / (max - min)) * 100}%` }} />
          <div className="bg-rose-500/80 flex-1" />
        </div>
        <div
          className="absolute top-0 h-full w-0.5 bg-white"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between text-[10px] text-indigo-200/60">
        <span>12</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40+</span>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

function Stat({ label, value, note, accent }: { label: string; value: string; note?: string; accent?: string }) {
  return (
    <div className="space-y-0.5 rounded-lg border border-border/60 bg-background p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-lg font-semibold tabular-nums", accent ?? "text-foreground")}>{value}</div>
      {note && <div className="text-[10px] text-muted-foreground">{note}</div>}
    </div>
  );
}
