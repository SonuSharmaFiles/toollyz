"use client";

import * as React from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Copy,
  HeartHandshake,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  WESTERN,
  chineseFromDate,
  westernFromDate,
} from "@/lib/tools/zodiac/zodiac";

const STORAGE_KEY = "toollyz:zodiac-date";

interface State {
  birthDate: string;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATE: State = { birthDate: "1990-04-15" };

const ELEMENT_TINT: Record<string, string> = {
  Fire: "from-rose-500/20 to-amber-500/15",
  Earth: "from-emerald-500/20 to-amber-500/15",
  Air: "from-sky-500/20 to-indigo-500/15",
  Water: "from-sky-500/20 to-indigo-500/15",
  Metal: "from-slate-400/20 to-zinc-400/15",
  Wood: "from-emerald-500/20 to-emerald-700/15",
};

export default function ZodiacSignFinder() {
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

  const date = React.useMemo(() => {
    const parts = state.birthDate.split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [state.birthDate]);

  const western = date ? westernFromDate(date) : null;
  const chinese = date ? chineseFromDate(date) : null;

  async function copySummary() {
    if (!western || !chinese) return;
    const lines = [
      `${state.birthDate}`,
      `Western: ${western.symbol} ${western.name} (${western.element}, ${western.modality}; ruled by ${western.rulingPlanet})`,
      `Traits: ${western.traits.join(", ")}`,
      `Compatible: ${western.compatibleWith.join(", ")}`,
      "",
      `Chinese: ${chinese.animal.symbol} ${chinese.animal.animal} (${chinese.polarity} ${chinese.element})`,
      `Traits: ${chinese.animal.traits.join(", ")}`,
      `Compatible: ${chinese.animal.compatibleWith.join(", ")}`,
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

  function setToToday() {
    setState({ birthDate: todayISO() });
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
      {/* Hero: two signs */}
      <section className="grid gap-4 sm:grid-cols-2">
        {western && (
          <article className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5 sm:p-6", ELEMENT_TINT[western.element] ?? "from-indigo-500/20 to-violet-500/15", "bg-[#0b1020]")}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(255,255,255,0.08),transparent_55%)]" />
            <div className="relative space-y-2">
              <div className="text-xs uppercase tracking-wider text-white/60">Western (Tropical)</div>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{western.symbol}</span>
                <div>
                  <div className="font-heading text-3xl font-bold text-white">{western.name}</div>
                  <div className="text-xs text-white/70">{western.element} · {western.modality} · ruled by {western.rulingPlanet}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {western.traits.map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/90">{t}</span>
                ))}
              </div>
              <div className="text-[11px] text-white/70">
                Compatible with <strong>{western.compatibleWith.join(", ")}</strong>
              </div>
            </div>
          </article>
        )}
        {chinese && (
          <article className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5 sm:p-6", ELEMENT_TINT[chinese.element] ?? "from-amber-500/20 to-rose-500/15", "bg-[#0b1020]")}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(255,255,255,0.08),transparent_55%)]" />
            <div className="relative space-y-2">
              <div className="text-xs uppercase tracking-wider text-white/60">Chinese (Lunisolar)</div>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{chinese.animal.symbol}</span>
                <div>
                  <div className="font-heading text-3xl font-bold text-white">{chinese.animal.animal}</div>
                  <div className="text-xs text-white/70">{chinese.polarity} {chinese.element} · Year {chinese.year}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {chinese.animal.traits.map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/90">{t}</span>
                ))}
              </div>
              <div className="text-[11px] text-white/70">
                Compatible with <strong>{chinese.animal.compatibleWith.join(", ")}</strong>
              </div>
              <div className="text-[10px] text-white/60">
                Chinese New Year for {chinese.year}: {String(chinese.newYear.month).padStart(2, "0")}/{String(chinese.newYear.day).padStart(2, "0")}
                {chinese.newYear.approximate && " (approximate — outside 1900–2050 lookup)"}
              </div>
            </div>
          </article>
        )}
      </section>

      {/* Input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <Label htmlFor="dob" className="text-xs font-medium">Date of birth</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="dob"
            type="date"
            value={state.birthDate}
            onChange={(e) => setState((s) => ({ ...s, birthDate: e.target.value }))}
            className="w-full max-w-xs font-mono"
          />
          <Button type="button" size="sm" variant="outline" onClick={setToToday}>
            <CalendarDays className="size-3.5" />
            Today
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={copySummary} disabled={!western || !chinese}>
            <Copy className="size-3.5" />
            Copy summary
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      {/* Western signs table */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Star className="size-4 text-primary" />
          The 12 Western signs
        </h2>
        <ul className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-4 list-none">
          {WESTERN.map((sign) => {
            const active = western?.id === sign.id;
            return (
              <li
                key={sign.id}
                className={cn(
                  "rounded-lg border p-2",
                  active ? "border-primary bg-primary/5" : "border-border/60 bg-background",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sign.symbol}</span>
                  <span className={cn("font-semibold", active && "text-primary")}>{sign.name}</span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {sign.start[0]}/{sign.start[1]} – {sign.end[0]}/{sign.end[1]}
                </div>
                <div className="text-[10px] text-muted-foreground">{sign.element} · {sign.modality}</div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Caveats */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          For fun, not forecasting
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><HeartHandshake className="mt-0.5 size-3.5 shrink-0" />Astrology is a cultural tradition, not a predictive science — there&apos;s no peer-reviewed evidence that birth date determines personality.</li>
          <li className="flex items-start gap-1.5"><HeartHandshake className="mt-0.5 size-3.5 shrink-0" />Sun-sign dates vary by ±1 day each year because the tropical year isn&apos;t exactly 365 days. Toollyz uses the most common boundary dates.</li>
          <li className="flex items-start gap-1.5"><HeartHandshake className="mt-0.5 size-3.5 shrink-0" />Chinese zodiac uses the lunisolar Chinese New Year boundary, not the Gregorian Jan 1. Toollyz ships a lookup table for 1900–2050; outside that range the date is approximated as Feb 4.</li>
          <li className="flex items-start gap-1.5"><HeartHandshake className="mt-0.5 size-3.5 shrink-0" />&quot;Compatible signs&quot; are popular astrological traditions, not relationship advice.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Western: tropical sun sign matched against the standard 12 ranges (Capricorn wraps Dec 22 → Jan 19).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Chinese: animal from (year − 4) mod 12. Element from year mod 10 (Wood / Fire / Earth / Metal / Water). Polarity from year mod 2.</li>
          <li className="flex items-start gap-1.5"><CalendarDays className="mt-0.5 size-3.5 shrink-0 text-primary" />Chinese New Year lookup table covers 1900–2050; pre-CNY dates use the previous year&apos;s animal.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Birth date saves to localStorage on this device only.</li>
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
