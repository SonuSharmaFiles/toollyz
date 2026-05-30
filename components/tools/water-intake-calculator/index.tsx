"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Droplet,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "toollyz:water-intake";

type UnitSystem = "metric" | "imperial";
type Climate = "temperate" | "hot" | "very-hot";
type Pregnancy = "none" | "pregnant" | "breastfeeding";

interface State {
  unitSystem: UnitSystem;
  weight: number; // kg or lb
  exerciseMinutes: number;
  climate: Climate;
  pregnancy: Pregnancy;
  hoursAwake: number;
  glassSizeMl: number; // ml in one glass for schedule
}

const DEFAULT_STATE: State = {
  unitSystem: "metric",
  weight: 70,
  exerciseMinutes: 30,
  climate: "temperate",
  pregnancy: "none",
  hoursAwake: 16,
  glassSizeMl: 250,
};

const LB_TO_KG = 0.45359237;
const ML_PER_OZ = 29.5735;
const ML_PER_KG_BASELINE = 30; // common rule of thumb
const ML_PER_30MIN_EXERCISE = 350;

const CLIMATE_DELTA_ML: Record<Climate, number> = {
  temperate: 0,
  hot: 500,
  "very-hot": 1000,
};

const PREGNANCY_DELTA_ML: Record<Pregnancy, number> = {
  none: 0,
  pregnant: 300,
  breastfeeding: 700,
};

interface Result {
  baselineMl: number;
  exerciseMl: number;
  climateMl: number;
  pregnancyMl: number;
  totalMl: number;
}

function compute(state: State): Result {
  const weightKg = state.unitSystem === "metric" ? state.weight : state.weight * LB_TO_KG;
  const baselineMl = Math.max(0, weightKg) * ML_PER_KG_BASELINE;
  const exerciseMl = Math.max(0, state.exerciseMinutes) * (ML_PER_30MIN_EXERCISE / 30);
  const climateMl = CLIMATE_DELTA_ML[state.climate];
  const pregnancyMl = PREGNANCY_DELTA_ML[state.pregnancy];
  return {
    baselineMl,
    exerciseMl,
    climateMl,
    pregnancyMl,
    totalMl: baselineMl + exerciseMl + climateMl + pregnancyMl,
  };
}

function formatMl(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  return `${Math.round(ml)} ml`;
}

export default function WaterIntakeCalculator() {
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

  const result = React.useMemo(() => compute(state), [state]);

  function switchTo(unit: UnitSystem) {
    if (unit === state.unitSystem) return;
    setState((s) => {
      if (unit === "imperial") return { ...s, unitSystem: "imperial", weight: Math.round((s.weight / LB_TO_KG) * 10) / 10 };
      return { ...s, unitSystem: "metric", weight: Math.round(s.weight * LB_TO_KG * 10) / 10 };
    });
  }

  async function copySummary() {
    const glasses = Math.round(result.totalMl / state.glassSizeMl);
    const bottles = Math.round(result.totalMl / 500);
    const lines = [
      `Daily water intake: ${formatMl(result.totalMl)} (${(result.totalMl / ML_PER_OZ).toFixed(1)} fl oz US)`,
      `≈ ${glasses} × ${state.glassSizeMl} ml glass, or ${bottles} × 500 ml bottle`,
      `Baseline (${ML_PER_KG_BASELINE} ml/kg × body weight): ${formatMl(result.baselineMl)}`,
      result.exerciseMl > 0 ? `Exercise (+${state.exerciseMinutes} min): ${formatMl(result.exerciseMl)}` : "",
      result.climateMl > 0 ? `Climate (${state.climate.replace("-", " ")}): ${formatMl(result.climateMl)}` : "",
      result.pregnancyMl > 0 ? `Pregnancy / breastfeeding: ${formatMl(result.pregnancyMl)}` : "",
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

  const glasses = Math.round(result.totalMl / state.glassSizeMl);
  const perHour = state.hoursAwake > 0 ? Math.round(result.totalMl / state.hoursAwake) : 0;

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
        aria-label="Daily water intake"
        className="relative overflow-hidden rounded-3xl border border-sky-400/30 bg-gradient-to-br from-[#0b1020] via-[#0b1020] to-sky-900/40 p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-sky-300/80">Daily water target</div>
            <div className="font-heading text-5xl font-bold tabular-nums text-sky-50 sm:text-6xl">{formatMl(result.totalMl)}</div>
            <div className="text-xs text-sky-100/80">
              {(result.totalMl / ML_PER_OZ).toFixed(1)} fl oz · ≈ {glasses} × {state.glassSizeMl} ml glasses
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Per hour" value={`${perHour} ml`} note={`${state.hoursAwake} h awake`} />
            <Stat label="500 ml bottles" value={`${Math.round(result.totalMl / 500)}`} note="Half-litre bottles per day" />
            <Stat label="Cups (~240 ml)" value={`${Math.round(result.totalMl / 240)}`} note="US cup ≈ 240 ml" />
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <Tabs value={state.unitSystem} onValueChange={(v) => v && switchTo(v as UnitSystem)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
            <TabsTrigger value="metric">Metric (kg)</TabsTrigger>
            <TabsTrigger value="imperial">Imperial (lb)</TabsTrigger>
          </TabsList>
          <TabsContent value="metric" className="mt-4">
            <Field label="Body weight (kg)">
              <Input
                type="number"
                min={1}
                max={400}
                step="0.1"
                value={state.weight}
                onChange={(e) => setState((s) => ({ ...s, weight: Math.max(1, Number(e.target.value) || 0) }))}
                className="font-mono text-lg"
              />
            </Field>
          </TabsContent>
          <TabsContent value="imperial" className="mt-4">
            <Field label="Body weight (lb)">
              <Input
                type="number"
                min={1}
                max={900}
                step="0.1"
                value={state.weight}
                onChange={(e) => setState((s) => ({ ...s, weight: Math.max(1, Number(e.target.value) || 0) }))}
                className="font-mono text-lg"
              />
            </Field>
          </TabsContent>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Exercise (min / day)">
            <Input
              type="number"
              min={0}
              max={600}
              step="5"
              value={state.exerciseMinutes}
              onChange={(e) => setState((s) => ({ ...s, exerciseMinutes: Math.max(0, Math.min(600, Number(e.target.value) || 0)) }))}
              className="font-mono"
            />
          </Field>
          <Field label="Climate">
            <Select value={state.climate} onValueChange={(v) => v && setState((s) => ({ ...s, climate: v as Climate }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperate">Temperate (no extra)</SelectItem>
                <SelectItem value="hot">Hot (+500 ml)</SelectItem>
                <SelectItem value="very-hot">Very hot / desert (+1 L)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Pregnancy / breastfeeding">
            <Select value={state.pregnancy} onValueChange={(v) => v && setState((s) => ({ ...s, pregnancy: v as Pregnancy }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="pregnant">Pregnant (+300 ml)</SelectItem>
                <SelectItem value="breastfeeding">Breastfeeding (+700 ml)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Awake hours per day">
            <Input
              type="number"
              min={6}
              max={24}
              value={state.hoursAwake}
              onChange={(e) => setState((s) => ({ ...s, hoursAwake: Math.max(6, Math.min(24, Number(e.target.value) || 16)) }))}
              className="font-mono"
            />
          </Field>
          <Field label="Glass size (ml) for schedule">
            <Input
              type="number"
              min={100}
              max={1000}
              step="10"
              value={state.glassSizeMl}
              onChange={(e) => setState((s) => ({ ...s, glassSizeMl: Math.max(100, Math.min(1000, Number(e.target.value) || 250)) }))}
              className="font-mono"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={copySummary}>
            <Copy className="size-3.5" />
            Copy summary
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      {/* Breakdown bar */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Where the litres come from
        </h2>
        <div className="space-y-1">
          {[
            { id: "baseline", label: `${ML_PER_KG_BASELINE} ml/kg baseline`, ml: result.baselineMl, color: "bg-sky-500" },
            { id: "exercise", label: `Exercise (${state.exerciseMinutes} min)`, ml: result.exerciseMl, color: "bg-emerald-500" },
            { id: "climate", label: `Climate (${state.climate.replace("-", " ")})`, ml: result.climateMl, color: "bg-amber-500" },
            { id: "pregnancy", label: `Pregnancy / breastfeeding`, ml: result.pregnancyMl, color: "bg-rose-500" },
          ].map((row) => {
            if (row.ml <= 0) return null;
            const pct = result.totalMl > 0 ? (row.ml / result.totalMl) * 100 : 0;
            return (
              <div key={row.id} className="flex items-center gap-3 text-xs">
                <div className="w-44 shrink-0 text-muted-foreground">{row.label}</div>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn("absolute inset-y-0 left-0", row.color)} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-24 shrink-0 text-right font-mono">{formatMl(row.ml)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Droplet className="size-4 text-sky-500" />
          Suggested daily schedule
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Across {state.hoursAwake} awake hours, that&apos;s about <strong>{Math.max(1, glasses)} × {state.glassSizeMl} ml glasses</strong> — roughly one every <strong>{glasses > 0 ? Math.round((state.hoursAwake * 60) / glasses) : 0} minutes</strong>. Front-load early so you&apos;re not chugging at bedtime.
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {Array.from({ length: Math.max(1, Math.min(24, glasses)) }).map((_, i) => (
            <div
              key={i}
              className="grid place-items-center rounded-md border border-sky-500/30 bg-sky-500/5 p-1.5 text-center text-[10px] text-sky-700 dark:text-sky-300"
            >
              <Droplet className="mx-auto size-3" />
              <span className="font-mono">{state.glassSizeMl} ml</span>
            </div>
          ))}
        </div>
      </section>

      {/* Caveats */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          Not a medical prescription
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0" />Individual needs vary widely — kidney function, sodium intake, medications and climate all matter more than weight alone.</li>
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0" />Food (fruits, vegetables, soup) provides ~20% of daily water in a typical diet — the calculator doesn&apos;t subtract that.</li>
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0" />Drinking dramatically more than your body needs can cause hyponatraemia (low sodium). Trust thirst as a guide, not just a target.</li>
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0" />Pregnancy / kidney disease / heart failure / certain medications need a doctor&apos;s advice, not a calculator.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0 text-primary" />Baseline: 30 ml/kg of body weight — a common evidence-based rule of thumb for healthy adults.</li>
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0 text-primary" />Exercise: +350 ml per 30 minutes of activity.</li>
          <li className="flex items-start gap-1.5"><Droplet className="mt-0.5 size-3.5 shrink-0 text-primary" />Climate: +500 ml hot, +1 L very hot. Pregnancy +300 ml, breastfeeding +700 ml.</li>
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
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="space-y-0.5 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-sky-200/70">{label}</div>
      <div className="font-mono text-lg font-bold tabular-nums text-sky-50">{value}</div>
      {note && <div className="text-[10px] text-sky-200/70">{note}</div>}
    </div>
  );
}
