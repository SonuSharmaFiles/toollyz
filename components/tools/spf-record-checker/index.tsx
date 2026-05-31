"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  Eraser,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  QUALIFIER_NAMES,
  SAMPLE_SPF,
  parseSpf,
} from "@/lib/tools/text/spf-parser";

const KEY = "toollyz:spf-input";

export default function SpfRecordChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_SPF);
    } catch {
      setText(SAMPLE_SPF);
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

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => parseSpf(deferred), [deferred]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
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

  const errors = result.issues.filter((i) => i.severity === "error").length;
  const warnings = result.issues.filter((i) => i.severity === "warning").length;
  const infos = result.issues.filter((i) => i.severity === "info").length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Tokens" value={result.tokens.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">DNS lookups</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", result.lookupCount > 10 ? "text-rose-300" : result.lookupCount > 8 ? "text-amber-300" : "text-emerald-300")}>
              <AnimatedNumber value={result.lookupCount} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/10</span>
            </div>
          </div>
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors > 0 ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings > 0 ? "text-amber-300" : "text-sky-100"} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", result.ok ? "text-emerald-300" : "text-rose-300")}>
              {result.ok ? "Valid" : "Invalid"}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_SPF)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => copy(text)}
        >
          <Copy className="size-3.5" />
          Copy record
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ShieldCheck className="size-4 text-primary" />
          SPF TXT record
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="v=spf1 include:_spf.example.com ip4:198.51.100.0/24 ~all"
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <p className="text-[11px] text-muted-foreground">
          Paste the value of your <code className="font-mono">_spf.yourdomain.com</code> TXT record — or any SPF
          record beginning with <code className="font-mono">v=spf1</code>.
        </p>
      </section>

      {result.issues.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Issues</h2>
          <ul className="space-y-1.5 list-none">
            {result.issues.map((i, idx) => {
              const color =
                i.severity === "error"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : i.severity === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
              const Icon = i.severity === "error" ? AlertCircle : i.severity === "warning" ? AlertTriangle : Info;
              return (
                <li key={idx} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", color)}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{i.message}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {result.tokens.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Token breakdown</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Token</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Qualifier</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-right">Lookup?</th>
                </tr>
              </thead>
              <tbody>
                {result.tokens.map((t, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono">{t.raw}</td>
                    <td className="px-3 py-1.5 capitalize">{t.kind}</td>
                    <td className="px-3 py-1.5 font-mono">
                      {t.kind === "mechanism" ? (
                        <span>
                          {t.qualifier} <span className="text-muted-foreground">({QUALIFIER_NAMES[t.qualifier].name})</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-1.5 font-mono break-all">
                      {t.kind === "mechanism" ? `${t.name}${t.value ? `:${t.value}` : ""}${t.cidr4 !== undefined ? `/${t.cidr4}` : ""}` : `${t.name}=${t.value}`}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {t.kind === "mechanism" && t.causesLookup ? (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300">DNS</span>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.terminator && (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Terminator</div>
              <div>
                <code className="font-mono font-semibold">{result.terminator.qualifier}all</code>{" "}
                — {QUALIFIER_NAMES[result.terminator.qualifier].hint}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Quick reference
        </h2>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          {(Object.entries(QUALIFIER_NAMES) as Array<[keyof typeof QUALIFIER_NAMES, (typeof QUALIFIER_NAMES)[keyof typeof QUALIFIER_NAMES]]>).map(([q, m]) => (
            <div key={q} className="rounded-lg border border-border/60 bg-background p-2">
              <div className="flex items-center gap-2">
                <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">{q}all</code>
                <span className="text-xs font-semibold">{m.name}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">{m.result}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{m.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing and validation run entirely in your browser — Toollyz has no server.
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
