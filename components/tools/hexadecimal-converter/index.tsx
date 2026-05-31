"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Eraser,
  Hash,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  BASES,
  convertAll,
  decimalToBaseSteps,
  parseValue,
  type Base,
} from "@/lib/tools/text/base-convert";

const VALUE_KEY = "toollyz:basecv-value";
const BASE_KEY = "toollyz:basecv-base";
const OPT_KEY = "toollyz:basecv-opts";

interface ViewOptions {
  uppercase: boolean;
  group: boolean;
  showSteps: boolean;
}

const DEFAULT_VIEW: ViewOptions = { uppercase: true, group: true, showSteps: false };

const PRESETS = [
  { label: "255 (0xFF)", value: "255" },
  { label: "1024 (1 KiB)", value: "1024" },
  { label: "0xDEADBEEF", value: "0xDEADBEEF" },
  { label: "0b101010 (42)", value: "0b101010" },
  { label: "0o755 (rwx)", value: "0o755" },
];

export default function HexadecimalConverter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("0xDEADBEEF");
  const [hintBase, setHintBase] = React.useState<Base | "auto">("auto");
  const [view, setView] = React.useState<ViewOptions>(DEFAULT_VIEW);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(VALUE_KEY) ?? "0xDEADBEEF");
      const b = localStorage.getItem(BASE_KEY);
      if (b === "auto" || b === "2" || b === "8" || b === "10" || b === "16") {
        setHintBase(b === "auto" ? "auto" : (Number(b) as Base));
      }
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setView({ ...DEFAULT_VIEW, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(VALUE_KEY, text);
      localStorage.setItem(BASE_KEY, hintBase === "auto" ? "auto" : String(hintBase));
      localStorage.setItem(OPT_KEY, JSON.stringify(view));
    } catch {
      /* noop */
    }
  }, [text, hintBase, view, mounted]);

  const parsed = React.useMemo(() => parseValue(text, hintBase === "auto" ? undefined : hintBase), [text, hintBase]);
  const all = React.useMemo(
    () => (parsed.ok ? convertAll(parsed.value, { uppercase: view.uppercase, group: view.group }) : null),
    [parsed, view.uppercase, view.group],
  );
  const steps = React.useMemo(() => {
    if (!parsed.ok || !view.showSteps) return [];
    return decimalToBaseSteps(parsed.value, 16);
  }, [parsed, view.showSteps]);

  async function copy(value: string | undefined, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Base summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Bit length" value={all?.bitLength ?? 0} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Detected base" value={parsed.detectedBase} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Fits u32?</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", all?.fitsU32 ? "text-emerald-300" : "text-amber-300")}>
              {all?.fitsU32 ? "Yes" : "No"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Fits i64?</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", all?.fitsI64 ? "text-emerald-300" : "text-rose-300")}>
              {all?.fitsI64 ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </section>

      {/* Input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Hash className="size-4 text-primary" />
          Value
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Number</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 0xDEADBEEF, 0b1010, 0o755, 255"
              className="font-mono text-lg"
              spellCheck={false}
            />
            <p className="text-[10px] text-muted-foreground">
              Prefix the input with <code className="font-mono">0x</code> / <code className="font-mono">0o</code> /{" "}
              <code className="font-mono">0b</code> to override the base hint. Underscores, commas and spaces are ignored.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Source base hint</Label>
            <select
              value={hintBase === "auto" ? "auto" : String(hintBase)}
              onChange={(e) => setHintBase(e.target.value === "auto" ? "auto" : (Number(e.target.value) as Base))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="auto">Auto-detect</option>
              <option value="2">Binary (2)</option>
              <option value="8">Octal (8)</option>
              <option value="10">Decimal (10)</option>
              <option value="16">Hex (16)</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setText(p.value)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              <Sparkles className="size-3" />
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Eraser className="size-3" />
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={view.uppercase}
            onChange={(v) => setView((o) => ({ ...o, uppercase: v }))}
            label="UPPERCASE hex (A–F)"
          />
          <Toggle
            checked={view.group}
            onChange={(v) => setView((o) => ({ ...o, group: v }))}
            label="Group digits"
          />
          <Toggle
            checked={view.showSteps}
            onChange={(v) => setView((o) => ({ ...o, showSteps: v }))}
            label="Show conversion steps (→ hex)"
          />
        </div>
        {!parsed.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {parsed.error}
          </div>
        )}
      </section>

      {/* Outputs */}
      {all && (
        <section className="grid gap-3 sm:grid-cols-2">
          {BASES.map((b) => {
            const value =
              b.base === 2 ? all.binary :
              b.base === 8 ? all.octal :
              b.base === 10 ? all.decimal :
              all.hex;
            return (
              <div key={b.base} className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {b.label} <span className="ml-1 text-[10px] text-muted-foreground">base {b.base}</span>
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => copy(value, b.label)}
                    className="h-7 px-2"
                  >
                    {copied === b.label ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <code className="block break-all rounded-lg bg-black/5 dark:bg-white/5 p-3 font-mono text-base">
                  {b.prefix && <span className="text-muted-foreground">{b.prefix}</span>}
                  {value || "0"}
                </code>
                <p className="text-[11px] text-muted-foreground">{b.hint}</p>
              </div>
            );
          })}
        </section>
      )}

      {/* Steps */}
      {view.showSteps && steps.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Hash className="size-4 text-primary" />
            Decimal → hex conversion steps
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Divide by 16, record the remainder, repeat with the quotient. Read remainders bottom-up.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Step</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">÷ 16</th>
                  <th className="px-3 py-2 text-right">Quotient</th>
                  <th className="px-3 py-2 text-right">Remainder (hex digit)</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono tabular-nums text-muted-foreground">#{i + 1}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      {(s.quotient * BigInt(16) + s.remainder).toString()}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">÷ 16</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">{s.quotient.toString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums text-primary">
                      {s.remainder.toString(16).toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Hash className="size-3" />
        Conversion uses JavaScript BigInt — arbitrary precision, no rounding errors. 100% browser-side.
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}
