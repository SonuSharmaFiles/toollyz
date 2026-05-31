"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BookOpenText,
  Check,
  Copy,
  Eraser,
  Lock,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  ROMAN_MAX,
  ROMAN_REFERENCE,
  ROMAN_RULES,
  intToRoman,
  romanToInt,
} from "@/lib/tools/text/roman";

const VALUE_KEY = "toollyz:roman-value";
const MODE_KEY = "toollyz:roman-mode";

export default function RomanNumeralConverter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"to-roman" | "to-int">("to-roman");
  const [value, setValue] = React.useState("1947");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setValue(localStorage.getItem(VALUE_KEY) ?? "1947");
      const m = localStorage.getItem(MODE_KEY);
      if (m === "to-int" || m === "to-roman") setMode(m);
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(VALUE_KEY, value);
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [value, mode, mounted]);

  const toRoman = React.useMemo(() => {
    const n = parseInt(value.replace(/\s+/g, "").replace(/[,.]/g, ""), 10);
    if (!Number.isFinite(n)) return intToRoman(0);
    return intToRoman(n);
  }, [value]);
  const toInt = React.useMemo(() => romanToInt(value), [value]);

  const activeResult = mode === "to-roman" ? toRoman : toInt;
  const output = mode === "to-roman" ? toRoman.roman : toInt.ok ? String(toInt.value) : "";

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function swap() {
    setMode((m) => (m === "to-roman" ? "to-int" : "to-roman"));
    if (output) setValue(output);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Roman summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(245,158,11,0.16),transparent_55%)]" />
        <div className="relative space-y-2">
          <div className="text-xs font-medium text-sky-300/70">Result</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="break-all rounded-lg bg-black/30 px-3 py-2 font-heading text-3xl tabular-nums text-emerald-300 sm:text-4xl">
              {output || "—"}
            </code>
            <Button type="button" size="sm" onClick={copy} disabled={!output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <Stat
              label="Decimal"
              value={toRoman.ok ? parseInt(value.replace(/[^\d-]/g, ""), 10) || 0 : toInt.ok ? toInt.value : 0}
              reduceMotion={!!reduceMotion}
              accent="text-emerald-300"
            />
            <div className="space-y-1">
              <div className="text-xs font-medium text-sky-300/70">Status</div>
              <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", activeResult.ok ? "text-emerald-300" : "text-rose-300")}>
                {activeResult.ok ? "Valid" : "Invalid"}
              </div>
            </div>
            <div className="space-y-1 col-span-2">
              <div className="text-xs font-medium text-sky-300/70">Range</div>
              <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">
                1 – {ROMAN_MAX.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode + input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group">
            <Seg active={mode === "to-roman"} onClick={() => setMode("to-roman")} label="Number → Roman" />
            <Seg active={mode === "to-int"} onClick={() => setMode("to-int")} label="Roman → Number" />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={swap}>
            <RefreshCcw className="size-3.5" />
            Swap
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setValue("")}
          >
            <Eraser className="size-3.5" />
            Clear
          </Button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">
            {mode === "to-roman" ? "Decimal number" : "Roman numeral"}
          </label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === "to-roman" ? "Type any number 1–3 999 999" : "Type a Roman numeral (e.g. MCMXLVII)"}
            className={cn(
              "font-mono text-xl",
              !activeResult.ok && value.trim() !== "" && "border-rose-500/60",
            )}
            inputMode={mode === "to-roman" ? "numeric" : "text"}
          />
        </div>
        {!activeResult.ok && value.trim() !== "" && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {(mode === "to-roman" ? toRoman.error : toInt.error) ?? "Invalid input"}
          </div>
        )}
        {mode === "to-roman" && toRoman.ok && toRoman.notes.length > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 text-xs text-amber-700 dark:text-amber-300">
            {toRoman.notes.map((n, i) => (
              <div key={i}>{n}</div>
            ))}
          </div>
        )}
        {mode === "to-int" && toInt.ok && toInt.hasVinculum && (
          <div className="text-[11px] text-muted-foreground">
            Detected vinculum (overline) — multiplier × 1 000 applied.
          </div>
        )}
      </section>

      {/* Reference */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <BookOpenText className="size-4 text-primary" />
          Reference
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ROMAN_REFERENCE.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (mode === "to-roman") setValue(String(r.value));
                else setValue(r.symbol);
              }}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2 text-left transition-colors hover:bg-muted"
            >
              <span className="grid w-16 shrink-0 place-items-center rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm text-primary">
                {r.value.toLocaleString()}
              </span>
              <span className="font-mono text-base font-semibold">{r.symbol}</span>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
          <h3 className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">Rules</h3>
          <ul className="space-y-1 text-foreground/80 list-disc pl-5 list-inside">
            {ROMAN_RULES.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <BookOpenText className="size-3" />
        Conversion runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function Seg({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
