"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Heart,
  HeartHandshake,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "toollyz:love-input";

interface State {
  nameA: string;
  nameB: string;
}

const DEFAULT_STATE: State = {
  nameA: "Romeo",
  nameB: "Juliet",
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);
type FlamesId = "F" | "L" | "A" | "M" | "E" | "S";
const FLAMES_DEFS: { id: FlamesId; label: string; meaning: string; color: string }[] = [
  { id: "F", label: "Friends", meaning: "Easy banter, low stakes — great as a chosen-family pair.", color: "text-sky-700 dark:text-sky-400" },
  { id: "L", label: "Lovers", meaning: "Romantic spark; chemistry runs hot.", color: "text-rose-700 dark:text-rose-400" },
  { id: "A", label: "Affectionate", meaning: "Warm, supportive, big-hug energy.", color: "text-amber-700 dark:text-amber-400" },
  { id: "M", label: "Marriage", meaning: "Long-haul, build-a-life vibes.", color: "text-emerald-700 dark:text-emerald-400" },
  { id: "E", label: "Enemies", meaning: "Tense — opposites that grind rather than complete.", color: "text-rose-700 dark:text-rose-400" },
  { id: "S", label: "Siblings", meaning: "Family-like care without the romance.", color: "text-indigo-700 dark:text-indigo-400" },
];

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

function flames(a: string, b: string): FlamesId | null {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return null;
  const aArr = na.split("");
  const bArr = nb.split("");
  for (let i = aArr.length - 1; i >= 0; i--) {
    const idx = bArr.indexOf(aArr[i]);
    if (idx >= 0) {
      aArr.splice(i, 1);
      bArr.splice(idx, 1);
    }
  }
  const remaining = aArr.length + bArr.length;
  if (remaining === 0) return null;
  const seq: FlamesId[] = ["F", "L", "A", "M", "E", "S"];
  let n = remaining;
  while (seq.length > 1) {
    const idx = ((n - 1) % seq.length + seq.length) % seq.length;
    seq.splice(idx, 1);
    n = idx;
  }
  return seq[0];
}

/** Deterministic FNV-1a 32-bit hash → 0..1. Order-insensitive when both names
 * are sorted before hashing. */
function vibeHash(a: string, b: string): number {
  const pair = [normalize(a), normalize(b)].sort().join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < pair.length; i++) {
    h ^= pair.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h % 10000) / 10000;
}

interface Score {
  overall: number;
  letterOverlap: number;
  vowelHarmony: number;
  lengthHarmony: number;
  cosmic: number;
  flames: ReturnType<typeof flames>;
  sharedLetters: string[];
}

function compute(state: State): Score | null {
  const a = normalize(state.nameA);
  const b = normalize(state.nameB);
  if (!a || !b) return null;
  const setA = new Set(a);
  const setB = new Set(b);
  const union = new Set([...setA, ...setB]);
  const intersection = [...setA].filter((c) => setB.has(c));
  const letterOverlap = union.size > 0 ? intersection.length / union.size : 0;
  const vowelsA = [...setA].filter((c) => VOWELS.has(c)).length;
  const vowelsB = [...setB].filter((c) => VOWELS.has(c)).length;
  const vowelHarmony = vowelsA === 0 && vowelsB === 0 ? 0.5 : 1 - Math.abs(vowelsA - vowelsB) / Math.max(vowelsA + vowelsB, 1);
  const lengthHarmony = 1 - Math.abs(a.length - b.length) / Math.max(a.length, b.length, 1);
  const cosmic = vibeHash(state.nameA, state.nameB);
  // Weighted blend — letter overlap is the biggest cue, cosmic adds noise.
  const overall = 0.4 * letterOverlap + 0.2 * vowelHarmony + 0.15 * lengthHarmony + 0.25 * cosmic;
  return {
    overall: Math.round(overall * 100),
    letterOverlap: Math.round(letterOverlap * 100),
    vowelHarmony: Math.round(vowelHarmony * 100),
    lengthHarmony: Math.round(lengthHarmony * 100),
    cosmic: Math.round(cosmic * 100),
    flames: flames(state.nameA, state.nameB),
    sharedLetters: intersection.sort(),
  };
}

function band(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: "Soulmate vibes", color: "text-rose-600 dark:text-rose-400", emoji: "💖" };
  if (score >= 70) return { label: "Strong match", color: "text-emerald-600 dark:text-emerald-400", emoji: "💞" };
  if (score >= 50) return { label: "Promising spark", color: "text-amber-600 dark:text-amber-400", emoji: "💛" };
  if (score >= 30) return { label: "Mixed signals", color: "text-indigo-600 dark:text-indigo-400", emoji: "💙" };
  return { label: "Friend zone, probably", color: "text-muted-foreground", emoji: "🩶" };
}

export default function LoveCompatibilityCalculator() {
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
  const verdict = result ? band(result.overall) : null;
  const flamesDef = result?.flames ? FLAMES_DEFS.find((f) => f.id === result.flames) ?? null : null;

  function swap() {
    setState((s) => ({ nameA: s.nameB, nameB: s.nameA }));
  }

  async function copySummary() {
    if (!result || !verdict) return;
    const lines = [
      `${state.nameA} × ${state.nameB} → ${result.overall}% ${verdict.label} ${verdict.emoji}`,
      flamesDef ? `FLAMES: ${flamesDef.label} — ${flamesDef.meaning}` : "",
      `Letter overlap ${result.letterOverlap}% · vowel harmony ${result.vowelHarmony}% · length harmony ${result.lengthHarmony}% · cosmic vibe ${result.cosmic}%`,
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
        aria-label="Compatibility score"
        className="relative overflow-hidden rounded-3xl border border-rose-400/30 bg-gradient-to-br from-[#0b1020] via-[#0b1020] to-rose-900/30 p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(236,72,153,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="text-xs uppercase tracking-wider text-rose-200/80">For entertainment only</div>
          <div className="font-heading text-6xl font-bold tabular-nums text-rose-50 sm:text-7xl">
            {result ? `${result.overall}%` : "—"}
          </div>
          {verdict && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={cn("rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold", verdict.color)}>{verdict.label}</span>
              <span className="text-2xl" aria-hidden>{verdict.emoji}</span>
              {flamesDef && (
                <span className={cn("rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-mono font-semibold", flamesDef.color)}>FLAMES → {flamesDef.label}</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Field label="Name one">
            <Input
              value={state.nameA}
              onChange={(e) => setState((s) => ({ ...s, nameA: e.target.value }))}
              placeholder="Romeo"
              className="text-lg"
            />
          </Field>
          <div className="flex justify-center pb-1.5">
            <Heart className="size-6 text-rose-500" />
          </div>
          <Field label="Name two">
            <Input
              value={state.nameB}
              onChange={(e) => setState((s) => ({ ...s, nameB: e.target.value }))}
              placeholder="Juliet"
              className="text-lg"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={swap}>
            <HeartHandshake className="size-3.5" />
            Swap
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={copySummary} disabled={!result}>
            <Copy className="size-3.5" />
            Copy result
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      {/* Breakdown */}
      {result && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Wand2 className="size-4 text-rose-500" />
            How we got there
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Row label="Letter overlap (Jaccard)" value={result.letterOverlap} />
            <Row label="Vowel harmony" value={result.vowelHarmony} />
            <Row label="Length harmony" value={result.lengthHarmony} />
            <Row label="Cosmic vibe (FNV-1a hash)" value={result.cosmic} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Shared letters: <span className="font-mono">{result.sharedLetters.length > 0 ? result.sharedLetters.join(" ") : "(none)"}</span>
          </p>
          {flamesDef && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
              <div className={cn("font-semibold", flamesDef.color)}>FLAMES — {flamesDef.label}</div>
              <div className="text-xs text-muted-foreground">{flamesDef.meaning}</div>
            </div>
          )}
        </section>
      )}

      {/* Caveats */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          Just for laughs
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Heart className="mt-0.5 size-3.5 shrink-0" />The percentage is a <strong>deterministic combination</strong> of letter overlap, vowel ratio match, name length and a name-based hash. Same names → same result every time.</li>
          <li className="flex items-start gap-1.5"><Heart className="mt-0.5 size-3.5 shrink-0" />It is <strong>not</strong> a measure of real-life compatibility. Real relationships are built on values, communication, respect and effort.</li>
          <li className="flex items-start gap-1.5"><Heart className="mt-0.5 size-3.5 shrink-0" />FLAMES is a 1980s school-playground game — fun to revisit, definitely not science.</li>
          <li className="flex items-start gap-1.5"><Heart className="mt-0.5 size-3.5 shrink-0" />Please don&apos;t make life decisions based on a number a calculator pulled out of two letter strings.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Letter overlap = Jaccard similarity of the two normalised name letter sets (intersection ÷ union).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Vowel harmony rewards similar vowel counts; length harmony rewards similar string lengths.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Cosmic vibe is a deterministic FNV-1a hash of the sorted pair → 0–100. Same pair, same number, always.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Names save to localStorage on this device only.</li>
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

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="w-44 shrink-0 text-muted-foreground">{label}</div>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-400 to-pink-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <div className="w-12 shrink-0 text-right font-mono">{value}%</div>
    </div>
  );
}
