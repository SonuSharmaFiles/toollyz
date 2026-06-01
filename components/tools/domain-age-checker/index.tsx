"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
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
import { SAMPLE_WHOIS, buildAgeReport } from "@/lib/tools/text/whois-parse";

const KEY = "toollyz:domain-age-input";

const SEV: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function DomainAgeChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_WHOIS);
    } catch {
      setText(SAMPLE_WHOIS);
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
  const r = React.useMemo(() => buildAgeReport(deferred), [deferred]);

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

  const ageColor = r.ageYears && r.ageYears >= 5 ? "text-emerald-300" : r.ageYears && r.ageYears >= 1 ? "text-amber-300" : "text-sky-300";
  const expColor =
    typeof r.daysTillExpiry === "number"
      ? r.daysTillExpiry < 0
        ? "text-rose-300"
        : r.daysTillExpiry < 30
        ? "text-rose-300"
        : r.daysTillExpiry < 90
        ? "text-amber-300"
        : "text-emerald-300"
      : "text-sky-100";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Domain</div>
            <div className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl break-all">
              {r.record.domain ?? "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Age</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", ageColor)}>
              {r.ageYears !== undefined ? (
                <>
                  <AnimatedNumber value={r.ageYears} decimals={1} reduceMotion={!!reduceMotion} />
                  <span className="ml-1 text-base text-sky-100/40">y</span>
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Days till expiry</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", expColor)}>
              {r.daysTillExpiry !== undefined ? (
                <AnimatedNumber value={r.daysTillExpiry} reduceMotion={!!reduceMotion} />
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_WHOIS)}
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
        <Button type="button" size="sm" variant="ghost" onClick={() => copy(text)}>
          <Copy className="size-3.5" />
          Copy input
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <CalendarDays className="size-4 text-primary" />
          WHOIS record
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste a WHOIS record from `whois example.com` or any WHOIS website."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {r.issues.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <ul className="space-y-1.5 list-none">
            {r.issues.map((i, idx) => {
              const Icon = i.severity === "error" ? AlertCircle : i.severity === "warning" ? AlertTriangle : Info;
              return (
                <li key={idx} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV[i.severity])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{i.message}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 text-xs">
        <KV label="Registrar" value={r.record.registrar} />
        <KV label="Registrant" value={r.record.registrant} />
        <KV label="Created" value={r.record.createdAt?.toUTCString()} />
        <KV label="Updated" value={r.record.updatedAt?.toUTCString()} />
        <KV label="Expires" value={r.record.expiresAt?.toUTCString()} />
        <KV label="Age" value={r.ageHuman} />
        <KV label="Status" value={r.record.status.join(", ") || undefined} />
        <KV label="Name servers" value={r.record.nameservers.join(", ") || undefined} />
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        WHOIS parsing runs entirely in your browser — we never query a registry.
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-32 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">—</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <span className="w-32 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="break-all font-mono">{value}</span>
    </div>
  );
}
