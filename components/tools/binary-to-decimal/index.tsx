"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Binary,
  Check,
  Copy,
  Eraser,
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
  BINARY_PRESETS,
  decimalSummary,
  decodeIeee754,
  parseBinary,
} from "@/lib/tools/text/binary-decimal";

const KEY = "toollyz:bin2dec-input";

export default function BinaryToDecimal() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("01000001");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? "01000001");
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  const parsed = React.useMemo(() => parseBinary(text), [text]);
  const summary = React.useMemo(() => (parsed.ok ? decimalSummary(parsed.value, parsed.bits) : null), [parsed]);

  // IEEE 754 decode — only when length is exactly 32 or 64.
  const cleaned = text.replace(/[_,\s+-]/g, "").replace(/^0b/i, "");
  const ieee32 = cleaned.length === 32 && /^[01]+$/.test(cleaned) ? decodeIeee754(cleaned, 32) : null;
  const ieee64 = cleaned.length === 64 && /^[01]+$/.test(cleaned) ? decodeIeee754(cleaned, 64) : null;

  async function copy(value: string, key: string) {
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
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative space-y-2">
          <div className="text-xs font-medium text-sky-300/70">Decimal value</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="break-all rounded-lg bg-black/30 px-3 py-2 font-heading text-3xl tabular-nums text-emerald-300 sm:text-4xl">
              {summary?.decimal ?? "—"}
            </code>
            {summary && (
              <Button type="button" size="sm" onClick={() => copy(summary.decimal, "dec")}>
                {copied === "dec" ? <Check className="size-4" /> : <Copy className="size-4" />}
                Copy
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <Stat label="Bit length" value={parsed.bitLength} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
            <Stat label="Set bits" value={parsed.bits.filter((b) => b.bit === 1).length} reduceMotion={!!reduceMotion} />
            <Stat label="Zero bits" value={parsed.bits.filter((b) => b.bit === 0).length} reduceMotion={!!reduceMotion} />
            <div className="space-y-1">
              <div className="text-xs font-medium text-sky-300/70">Status</div>
              <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", parsed.ok ? "text-emerald-300" : "text-rose-300")}>
                {parsed.ok ? "Valid" : "Invalid"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Binary className="size-4 text-primary" />
          Binary input
        </h2>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="01000001 — optional 0b prefix, underscores allowed"
          className="font-mono text-lg"
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-1.5">
          {BINARY_PRESETS.map((p) => (
            <button
              key={p.label}
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
        {!parsed.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {parsed.error}
          </div>
        )}
      </section>

      {summary && parsed.bits.length <= 64 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Place-value table</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Position</th>
                  <th className="px-3 py-2 text-left">Bit</th>
                  <th className="px-3 py-2 text-right">Power of 2</th>
                  <th className="px-3 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsed.bits.map((b, i) => (
                  <tr key={i} className={cn("border-t border-border/40", b.bit === 1 && "bg-emerald-500/[0.05]")}>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">2^{b.position}</td>
                    <td className="px-3 py-1.5 font-mono font-bold">{b.bit}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{(BigInt(1) << BigInt(b.position)).toString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-primary">{b.value.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sum of set bits</div>
            <code className="mt-1 block break-all font-mono text-foreground/90">{summary.breakdown}</code>
          </div>
        </section>
      )}

      {(ieee32 || ieee64) && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">IEEE 754 floating-point interpretation</h2>
          {ieee32 && (
            <Card title="32-bit (single precision)" decode={ieee32} />
          )}
          {ieee64 && (
            <Card title="64-bit (double precision)" decode={ieee64} />
          )}
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Binary className="size-3" />
        Parsing uses JavaScript BigInt — arbitrary precision, no rounding errors. 100% browser-side.
      </p>
    </div>
  );
}

function Card({ title, decode }: { title: string; decode: ReturnType<typeof decodeIeee754> }) {
  if (!decode) return null;
  return (
    <div className="space-y-1.5 rounded-xl border border-border/60 bg-background p-3 text-xs">
      <div className="font-semibold">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        <Info label="Value" value={String(decode.value)} mono />
        <Info label="Class" value={decode.classification} />
        <Info label="Sign bit" value={`${decode.sign}`} mono />
        <Info label="Exponent" value={`${decode.exponent} (raw ${decode.exponentRaw})`} mono />
        <Info label="Mantissa" value={decode.mantissa} mono />
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border/60 bg-card p-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 break-all text-foreground/90", mono && "font-mono")}>{value}</div>
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
