"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Flame,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
  Target,
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
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  ACTIVITY_LABEL,
  GOALS,
  compute,
  type ActivityLevel,
  type GoalId,
  type Sex,
} from "@/lib/tools/health/calories";

const STORAGE_KEY = "toollyz:calorie-input";

type UnitSystem = "metric" | "imperial";

interface State {
  unitSystem: UnitSystem;
  sex: Sex;
  ageYears: number;
  weight: number; // kg or lb
  height: number; // cm or total inches
  feet: number;
  inches: number;
  activity: ActivityLevel;
  goal: GoalId;
}

const DEFAULT_STATE: State = {
  unitSystem: "metric",
  sex: "male",
  ageYears: 30,
  weight: 75,
  height: 178,
  feet: 5,
  inches: 10,
  activity: "moderate",
  goal: "maintain",
};

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

export default function CalorieCalculator() {
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

  const heightCm = state.unitSystem === "metric" ? state.height : (state.feet * 12 + state.inches) * IN_TO_CM;
  const weightKg = state.unitSystem === "metric" ? state.weight : state.weight * LB_TO_KG;

  const result = React.useMemo(
    () =>
      compute({
        sex: state.sex,
        ageYears: state.ageYears,
        weightKg,
        heightCm,
        activity: state.activity,
        goal: state.goal,
      }),
    [state.sex, state.ageYears, weightKg, heightCm, state.activity, state.goal],
  );

  function switchTo(unit: UnitSystem) {
    if (unit === state.unitSystem) return;
    setState((s) => {
      if (unit === "imperial") {
        const inches = s.height / IN_TO_CM;
        const feet = Math.floor(inches / 12);
        const rest = Math.round(inches - feet * 12);
        return {
          ...s,
          unitSystem: "imperial",
          weight: Math.round((s.weight / LB_TO_KG) * 10) / 10,
          feet,
          inches: rest,
        };
      }
      const cm = (s.feet * 12 + s.inches) * IN_TO_CM;
      return {
        ...s,
        unitSystem: "metric",
        weight: Math.round(s.weight * LB_TO_KG * 10) / 10,
        height: Math.round(cm),
      };
    });
  }

  async function copySummary() {
    if (!result) return;
    const goal = GOALS.find((g) => g.id === state.goal);
    const lines = [
      `BMR (Mifflin–St Jeor): ${result.bmr} kcal/day`,
      `TDEE (×${ACTIVITY_LABEL[state.activity].match(/×([\d.]+)/)?.[1]}): ${result.tdee} kcal/day`,
      `Goal: ${goal?.label ?? "Maintain"} (${result.goalDeltaKcal >= 0 ? "+" : ""}${result.goalDeltaKcal} kcal)`,
      `Target intake: ${result.targetCalories} kcal/day`,
      `Macros: ${result.protein_g}g protein · ${result.fat_g}g fat · ${result.carbs_g}g carbs`,
      `Expected weekly change: ${result.weeklyDeltaKg >= 0 ? "+" : ""}${result.weeklyDeltaKg} kg`,
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
        aria-label="Calorie summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(245,158,11,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Cell label="BMR" value={result?.bmr ?? 0} suffix=" kcal" reduceMotion={!!reduceMotion} accent="text-indigo-200" />
          <Cell label="TDEE" value={result?.tdee ?? 0} suffix=" kcal" reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Cell label="Target intake" value={result?.targetCalories ?? 0} suffix=" kcal" reduceMotion={!!reduceMotion} accent="text-emerald-300" emphasis />
          <Cell label="Weekly change" value={Math.abs(result?.weeklyDeltaKg ?? 0)} suffix={` kg ${(result?.weeklyDeltaKg ?? 0) >= 0 ? "gain" : "loss"}`} decimals={2} reduceMotion={!!reduceMotion} accent={result && result.weeklyDeltaKg < 0 ? "text-rose-300" : "text-indigo-300"} />
        </div>
        {result && (
          <p className="relative mt-3 text-[11px] text-indigo-200/80">
            Target = TDEE ({result.tdee}) {result.goalDeltaKcal >= 0 ? "+" : "−"} {Math.abs(result.goalDeltaKcal)} kcal · suggested macros: <strong>{result.protein_g}g protein</strong> · {result.fat_g}g fat · {result.carbs_g}g carbs
          </p>
        )}
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <Tabs value={state.unitSystem} onValueChange={(v) => v && switchTo(v as UnitSystem)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
            <TabsTrigger value="metric">Metric (kg, cm)</TabsTrigger>
            <TabsTrigger value="imperial">Imperial (lb, ft+in)</TabsTrigger>
          </TabsList>
          <TabsContent value="metric" className="mt-4 grid gap-3 sm:grid-cols-4">
            <FieldRow label="Sex">
              <Select value={state.sex} onValueChange={(v) => v && setState((s) => ({ ...s, sex: v as Sex }))}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Age (years)">
              <Input
                type="number"
                min={1}
                max={120}
                value={state.ageYears}
                onChange={(e) => setState((s) => ({ ...s, ageYears: Math.max(1, Math.min(120, Number(e.target.value) || 0)) }))}
                className="font-mono"
              />
            </FieldRow>
            <FieldRow label="Weight (kg)">
              <Input
                type="number"
                min={1}
                max={400}
                step="0.1"
                value={state.weight}
                onChange={(e) => setState((s) => ({ ...s, weight: Math.max(1, Number(e.target.value) || 0) }))}
                className="font-mono"
              />
            </FieldRow>
            <FieldRow label="Height (cm)">
              <Input
                type="number"
                min={1}
                max={272}
                value={state.height}
                onChange={(e) => setState((s) => ({ ...s, height: Math.max(1, Number(e.target.value) || 0) }))}
                className="font-mono"
              />
            </FieldRow>
          </TabsContent>
          <TabsContent value="imperial" className="mt-4 grid gap-3 sm:grid-cols-5">
            <FieldRow label="Sex">
              <Select value={state.sex} onValueChange={(v) => v && setState((s) => ({ ...s, sex: v as Sex }))}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Age (years)">
              <Input
                type="number"
                min={1}
                max={120}
                value={state.ageYears}
                onChange={(e) => setState((s) => ({ ...s, ageYears: Math.max(1, Math.min(120, Number(e.target.value) || 0)) }))}
                className="font-mono"
              />
            </FieldRow>
            <FieldRow label="Weight (lb)">
              <Input
                type="number"
                min={1}
                max={900}
                step="0.1"
                value={state.weight}
                onChange={(e) => setState((s) => ({ ...s, weight: Math.max(1, Number(e.target.value) || 0) }))}
                className="font-mono"
              />
            </FieldRow>
            <FieldRow label="Height ft">
              <Input
                type="number"
                min={0}
                max={8}
                value={state.feet}
                onChange={(e) => setState((s) => ({ ...s, feet: Math.max(0, Math.min(8, Number(e.target.value) || 0)) }))}
                className="font-mono"
              />
            </FieldRow>
            <FieldRow label="Height in">
              <Input
                type="number"
                min={0}
                max={11}
                value={state.inches}
                onChange={(e) => setState((s) => ({ ...s, inches: Math.max(0, Math.min(11, Number(e.target.value) || 0)) }))}
                className="font-mono"
              />
            </FieldRow>
          </TabsContent>
        </Tabs>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="Activity level">
            <Select value={state.activity} onValueChange={(v) => v && setState((s) => ({ ...s, activity: v as ActivityLevel }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACTIVITY_LABEL) as ActivityLevel[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {ACTIVITY_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Goal">
            <Select value={state.goal} onValueChange={(v) => v && setState((s) => ({ ...s, goal: v as GoalId }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label} — {g.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
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

      {/* Macros + goal breakdown */}
      {result && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Target className="size-4 text-primary" />
            Daily macros
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Macro label="Protein" grams={result.protein_g} kcal={result.protein_g * 4} accent="text-emerald-600 dark:text-emerald-400" />
            <Macro label="Fat" grams={result.fat_g} kcal={result.fat_g * 9} accent="text-amber-600 dark:text-amber-400" />
            <Macro label="Carbohydrates" grams={result.carbs_g} kcal={result.carbs_g * 4} accent="text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Suggested split: 1.8 g protein per kg body weight, 25% of calories from fat, the rest from carbs. Adjust based on personal preference, allergies and your doctor&apos;s advice.
          </p>
        </section>
      )}

      {/* Caveats */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          Not medical advice
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Flame className="mt-0.5 size-3.5 shrink-0" />Mifflin–St Jeor estimates BMR for a healthy adult population — individuals vary by ±10–15%.</li>
          <li className="flex items-start gap-1.5"><Flame className="mt-0.5 size-3.5 shrink-0" />Activity multipliers are deliberately conservative — heavy training plus a manual job can push TDEE higher than the &quot;extra active&quot; preset.</li>
          <li className="flex items-start gap-1.5"><Flame className="mt-0.5 size-3.5 shrink-0" />Weekly weight change assumes 7,700 kcal per kg of fat — water weight, glycogen and muscle changes ignore that rule.</li>
          <li className="flex items-start gap-1.5"><Flame className="mt-0.5 size-3.5 shrink-0" />Talk to a doctor or dietitian before cutting calories aggressively or for pregnancy / nursing / medical conditions.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />BMR via Mifflin–St Jeor (1990) — the Academy of Nutrition and Dietetics&apos;s preferred equation for healthy adults.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />TDEE = BMR × activity factor (1.2 sedentary → 1.9 extra active).</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Weekly delta uses 7,700 kcal per kg of body fat — a rule of thumb, not a precise constant.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Your inputs save to localStorage on this device only.</li>
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

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Cell({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
  decimals,
  emphasis,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
  decimals?: number;
  emphasis?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading tabular-nums", emphasis ? "text-3xl font-bold sm:text-4xl" : "text-xl font-semibold sm:text-2xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} decimals={decimals} suffix={suffix} />
      </div>
    </div>
  );
}

function Macro({ label, grams, kcal, accent }: { label: string; grams: number; kcal: number; accent: string }) {
  return (
    <div className="space-y-1 rounded-lg border border-border/60 bg-background p-3">
      <div className={cn("text-[10px] font-semibold uppercase tracking-wider", accent)}>{label}</div>
      <div className="font-mono text-xl font-bold tabular-nums">{grams} g</div>
      <div className="font-mono text-[11px] text-muted-foreground">{kcal} kcal</div>
    </div>
  );
}
