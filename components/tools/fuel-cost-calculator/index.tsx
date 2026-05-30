"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Fuel,
  Info,
  Lock,
  RefreshCcw,
  Repeat,
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
import { cn } from "@/lib/utils";
import { CURRENCY_OPTIONS, formatMoney, formatNumber } from "@/lib/tools/finance/money";

const STORAGE_KEY = "toollyz:fuel-cost-input";

type DistanceUnit = "km" | "mi";
type EfficiencyUnit = "kmpl" | "lp100" | "mpg-us" | "mpg-uk";
type FuelUnit = "L" | "gal-us" | "gal-uk";

interface State {
  distance: number;
  distanceUnit: DistanceUnit;
  efficiency: number;
  efficiencyUnit: EfficiencyUnit;
  fuelPrice: number;
  fuelUnit: FuelUnit;
  currency: string;
  roundtrip: boolean;
  tripsPerWeek: number;
}

const DEFAULT_STATE: State = {
  distance: 100,
  distanceUnit: "km",
  efficiency: 15,
  efficiencyUnit: "kmpl",
  fuelPrice: 1.6,
  fuelUnit: "L",
  currency: "USD",
  roundtrip: false,
  tripsPerWeek: 5,
};

const MI_TO_KM = 1.609344;
const US_GAL_TO_L = 3.785411784;
const UK_GAL_TO_L = 4.54609;

function distanceInKm(value: number, unit: DistanceUnit): number {
  return unit === "mi" ? value * MI_TO_KM : value;
}

/** Fuel efficiency expressed as litres consumed per kilometre. */
function litresPerKm(value: number, unit: EfficiencyUnit): number {
  if (value <= 0) return Infinity;
  switch (unit) {
    case "kmpl":
      return 1 / value;
    case "lp100":
      return value / 100;
    case "mpg-us": {
      // km / L = mpg × MI_TO_KM / US_GAL_TO_L
      const kmPerL = (value * MI_TO_KM) / US_GAL_TO_L;
      return 1 / kmPerL;
    }
    case "mpg-uk": {
      const kmPerL = (value * MI_TO_KM) / UK_GAL_TO_L;
      return 1 / kmPerL;
    }
  }
}

function fuelPricePerLitre(price: number, unit: FuelUnit): number {
  if (unit === "L") return price;
  if (unit === "gal-us") return price / US_GAL_TO_L;
  return price / UK_GAL_TO_L;
}

function compute(state: State) {
  const oneWayKm = distanceInKm(state.distance, state.distanceUnit);
  const tripKm = state.roundtrip ? oneWayKm * 2 : oneWayKm;
  const lpkm = litresPerKm(state.efficiency, state.efficiencyUnit);
  const litresPerTrip = tripKm * lpkm;
  const litresOneWay = oneWayKm * lpkm;
  const pricePerL = fuelPricePerLitre(state.fuelPrice, state.fuelUnit);
  const costPerTrip = litresPerTrip * pricePerL;
  const tripsPerWeek = Math.max(0, state.tripsPerWeek);
  const costWeekly = costPerTrip * tripsPerWeek;
  const costMonthly = costWeekly * (52 / 12);
  const costYearly = costWeekly * 52;
  return {
    tripKm,
    oneWayKm,
    litresOneWay,
    litresPerTrip,
    pricePerL,
    costPerTrip,
    costWeekly,
    costMonthly,
    costYearly,
  };
}

export default function FuelCostCalculator() {
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

  async function copySummary() {
    const lines = [
      `Distance: ${state.distance} ${state.distanceUnit}${state.roundtrip ? " each way (round-trip)" : ""}`,
      `Efficiency: ${state.efficiency} ${labelEfficiency(state.efficiencyUnit)}`,
      `Fuel price: ${formatMoney(state.fuelPrice, state.currency)} per ${labelFuelUnit(state.fuelUnit)}`,
      "",
      `Fuel per trip: ${formatNumber(result.litresPerTrip, 2)} L`,
      `Cost per trip: ${formatMoney(result.costPerTrip, state.currency)}`,
      state.tripsPerWeek > 0
        ? `${state.tripsPerWeek} trips/week → ${formatMoney(result.costWeekly, state.currency)}/wk · ${formatMoney(result.costMonthly, state.currency)}/mo · ${formatMoney(result.costYearly, state.currency)}/yr`
        : "",
    ];
    try {
      await navigator.clipboard.writeText(lines.filter(Boolean).join("\n"));
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
        aria-label="Fuel cost summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(245,158,11,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Cell label="Fuel / trip" value={`${formatNumber(result.litresPerTrip, 2)} L`} accent="text-amber-300" />
          <Cell label="Cost / trip" value={formatMoney(result.costPerTrip, state.currency)} accent="text-emerald-300" emphasis />
          <Cell label="Weekly" value={formatMoney(result.costWeekly, state.currency)} accent="text-indigo-50" />
          <Cell label="Monthly" value={formatMoney(result.costMonthly, state.currency)} accent="text-indigo-100" />
        </div>
        <p className="relative mt-4 text-[11px] text-indigo-200/80">
          {state.roundtrip ? `${formatNumber(result.tripKm, 0)} km round trip · ` : `${formatNumber(result.oneWayKm, 0)} km one way · `}
          Fuel @ {formatMoney(result.pricePerL, state.currency)} / litre · {state.tripsPerWeek} trips per week
        </p>
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        {/* Distance */}
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <div className="space-y-1.5">
            <Label htmlFor="distance" className="text-xs font-medium">Distance</Label>
            <Input
              id="distance"
              type="number"
              min={0}
              step="0.01"
              value={state.distance}
              onChange={(e) => setState((s) => ({ ...s, distance: Math.max(0, Number(e.target.value) || 0) }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Unit</Label>
            <Select value={state.distanceUnit} onValueChange={(v) => v && setState((s) => ({ ...s, distanceUnit: v as DistanceUnit }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">Kilometres</SelectItem>
                <SelectItem value="mi">Miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={state.roundtrip}
            onChange={(e) => setState((s) => ({ ...s, roundtrip: e.target.checked }))}
            className="size-4 rounded border-border accent-primary"
          />
          <Repeat className="size-3.5" />
          Round-trip (multiply distance by 2)
        </label>

        {/* Efficiency */}
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="space-y-1.5">
            <Label htmlFor="efficiency" className="text-xs font-medium">Fuel efficiency</Label>
            <Input
              id="efficiency"
              type="number"
              min={0}
              step="0.01"
              value={state.efficiency}
              onChange={(e) => setState((s) => ({ ...s, efficiency: Math.max(0, Number(e.target.value) || 0) }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Unit</Label>
            <Select value={state.efficiencyUnit} onValueChange={(v) => v && setState((s) => ({ ...s, efficiencyUnit: v as EfficiencyUnit }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kmpl">km per litre</SelectItem>
                <SelectItem value="lp100">L per 100 km</SelectItem>
                <SelectItem value="mpg-us">miles per US gallon</SelectItem>
                <SelectItem value="mpg-uk">miles per UK gallon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price */}
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-medium">Fuel price</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              value={state.fuelPrice}
              onChange={(e) => setState((s) => ({ ...s, fuelPrice: Math.max(0, Number(e.target.value) || 0) }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Per</Label>
            <Select value={state.fuelUnit} onValueChange={(v) => v && setState((s) => ({ ...s, fuelUnit: v as FuelUnit }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Litre</SelectItem>
                <SelectItem value="gal-us">US gallon</SelectItem>
                <SelectItem value="gal-uk">UK gallon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Currency</Label>
            <Select value={state.currency} onValueChange={(v) => v && setState((s) => ({ ...s, currency: v }))}>
              <SelectTrigger className="w-full justify-between font-mono">
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

        {/* Trips */}
        <div className="space-y-1.5">
          <Label htmlFor="trips" className="text-xs font-medium">Trips per week (optional)</Label>
          <Input
            id="trips"
            type="number"
            min={0}
            max={50}
            value={state.tripsPerWeek}
            onChange={(e) => setState((s) => ({ ...s, tripsPerWeek: Math.max(0, Math.min(50, Number(e.target.value) || 0)) }))}
            className="font-mono w-40"
          />
          <p className="text-[10px] text-muted-foreground">Drives the weekly / monthly / yearly cost lines below.</p>
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

      {/* Conversions panel */}
      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <Stat label="km per litre (km/L)" value={(state.efficiencyUnit === "kmpl" ? state.efficiency : 1 / litresPerKm(state.efficiency, state.efficiencyUnit)).toFixed(2)} />
        <Stat label="L per 100 km" value={(litresPerKm(state.efficiency, state.efficiencyUnit) * 100).toFixed(2)} />
        <Stat label="mpg (US)" value={(state.efficiencyUnit === "mpg-us" ? state.efficiency : (1 / litresPerKm(state.efficiency, state.efficiencyUnit)) * US_GAL_TO_L / MI_TO_KM).toFixed(2)} />
        <Stat label="mpg (UK)" value={(state.efficiencyUnit === "mpg-uk" ? state.efficiency : (1 / litresPerKm(state.efficiency, state.efficiencyUnit)) * UK_GAL_TO_L / MI_TO_KM).toFixed(2)} />
        <Stat label="Fuel @ per litre" value={formatMoney(result.pricePerL, state.currency)} />
        <Stat label="Yearly cost (52 weeks)" value={formatMoney(result.costYearly, state.currency)} accent="text-emerald-700 dark:text-emerald-400" />
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Fuel className="mt-0.5 size-3.5 shrink-0 text-primary" />Conversions: 1 mile = 1.609344 km, 1 US gallon = 3.785411784 L, 1 UK gallon = 4.54609 L. Toollyz uses these exact constants.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Monthly cost = weekly × (52 ÷ 12). Yearly = weekly × 52. Both assume a constant trip pattern — not realistic for holidays or seasonal commutes.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Real-world fuel use varies with traffic, weather, payload and driving style. Manufacturer figures (MPG / kmpl) are usually optimistic by 10–20%.</li>
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="space-y-0.5 rounded-lg border border-border/60 bg-background p-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-sm font-semibold tabular-nums", accent ?? "text-foreground")}>{value}</div>
    </div>
  );
}

function labelEfficiency(unit: EfficiencyUnit): string {
  switch (unit) {
    case "kmpl":
      return "km/L";
    case "lp100":
      return "L/100km";
    case "mpg-us":
      return "mpg (US)";
    case "mpg-uk":
      return "mpg (UK)";
  }
}

function labelFuelUnit(unit: FuelUnit): string {
  if (unit === "gal-us") return "US gallon";
  if (unit === "gal-uk") return "UK gallon";
  return "litre";
}
