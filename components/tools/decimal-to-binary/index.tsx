"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Binary,
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
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DECIMAL_PRESETS,
  divisionSteps,
  encodeIeee754,
  parseDecimal,
  placeValueTable,
  toBinary,
} from "@/lib/tools/text/decimal-binary";

const KEY = "toollyz:dec2bin-input";

export default function DecimalToBinary() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("65");
  const [showSteps, setShowSteps] = React.useState(true);
  const [group, setGroup] = React.useState(true);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? "65");
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

  const parsed = React.useMemo(() => parseDecimal(text), [text]);
  const binary = React.useMemo(() => (parsed.ok ? toBinary(parsed.value, { group }) : ""), [parsed, group]);
  const steps = React.useMemo(() => (parsed.ok ? divisionSteps(parsed.value) : []), [parsed]);
  const placeTable = React.useMemo(() => (parsed.ok ? placeValueTable(parsed.value) : []), [parsed]);
  const ieee32 = parsed.hasFractional && Number.isFinite(parsed.floatValue) ? encodeIeee754(parsed.floatValue!, 32) : null;
  const ieee64 = parsed.hasFractional && Number.isFinite(parsed.floatValue) ? encodeIeee754(parsed.floatValue!, 64) : null;

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
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative space-y-2">
          <div className="text-xs font-medium text-sky-300/70">Binary representation</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="break-all rounded-lg bg-black/30 px-3 py-2 font-mono text-xl text-emerald-300 sm:text-2xl">
              {binary || "—"}
            </code>
            {binary && (
              <Button type="button" size="sm" onClick={() => copy(binary.replace(/\s/g, ""), "bin")}>
                {copied === "bin" ? <Check className="size-4" /> : <Copy className="size-4" />}
                Copy
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <Stat label="Bit length" value={placeTable.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
            <Stat label="Set bits" value={placeTable.filter((b) => b.bit === 1).length} reduceMotion={!!reduceMotion} />
            <Stat label="Division steps" value={steps.length} reduceMotion={!!reduceMotion} />
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
          <Hash className="size-4 text-primary" />
          Decimal input
        </h2>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="65 — integers or decimals (3.14, 1e6)"
          className="font-mono text-lg"
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-1.5">
          {DECIMAL_PRESETS.map((p) => (
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
        <div className="flex flex-wrap gap-3">
          <Toggle checked={showSteps} onChange={setShowSteps} label="Show division-by-2 steps" />
          <Toggle checked={group} onChange={setGroup} label="Group bits (4-bit nibbles)" />
        </div>
        {!parsed.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {parsed.error}
          </div>
        )}
      </section>

      {showSteps && steps.length > 0 && parsed.ok && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Division-by-2 steps</h2>
          <p className="text-[11px] text-muted-foreground">
            Divide by 2 repeatedly; record each remainder. Read the remainders bottom-up to get the binary form.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Step</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">÷ 2 quotient</th>
                  <th className="px-3 py-2 text-right">Remainder (bit)</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">#{s.step}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{s.dividend.toString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{s.quotient.toString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-primary">{s.remainder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(ieee32 || ieee64) && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">IEEE 754 encoding</h2>
          {ieee32 && <FloatCard title="32-bit single precision" encode={ieee32} onCopy={copy} copied={copied} />}
          {ieee64 && <FloatCard title="64-bit double precision" encode={ieee64} onCopy={copy} copied={copied} />}
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Binary className="size-3" />
        Conversion uses JavaScript BigInt for integers and the platform&apos;s DataView for IEEE 754
        encoding. 100% browser-side.
      </p>
    </div>
  );
}

function FloatCard({
  title,
  encode,
  copied,
  onCopy,
}: {
  title: string;
  encode: ReturnType<typeof encodeIeee754>;
  copied: string | null;
  onCopy: (v: string, k: string) => void;
}) {
  if (!encode) return null;
  return (
    <div className="space-y-1.5 rounded-xl border border-border/60 bg-background p-3 text-xs">
      <div className="font-semibold">{title}</div>
      <div className="flex items-center gap-2 rounded-md bg-black/5 p-2 font-mono dark:bg-white/5">
        <span className="text-rose-400">{encode.bits.slice(0, 1)}</span>
        <span className="text-amber-400">{encode.bits.slice(1, 1 + (encode.width === 32 ? 8 : 11))}</span>
        <span className="text-emerald-400 break-all">{encode.bits.slice(1 + (encode.width === 32 ? 8 : 11))}</span>
        <button
          type="button"
          onClick={() => onCopy(encode.bits, `bits${encode.width}`)}
          className="ml-auto grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        >
          {copied === `bits${encode.width}` ? <Check className="size-3" /> : <Copy className="size-3" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Info label="Hex" value={encode.hex} mono />
        <Info label="Class" value={encode.classification} />
        <Info label="Sign" value={`${encode.sign}`} mono />
        <Info label="Exponent" value={`${encode.exponent} (raw ${encode.exponentRaw})`} mono />
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
