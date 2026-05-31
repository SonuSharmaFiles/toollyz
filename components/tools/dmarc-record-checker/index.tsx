"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Copy,
  Eraser,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_DMARC, parse } from "@/lib/tools/text/dmarc-parser";

const KEY = "toollyz:dmarc-input";

const SEV: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function DmarcRecordChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_DMARC);
    } catch {
      setText(SAMPLE_DMARC);
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
  const r = React.useMemo(() => parse(deferred), [deferred]);

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

  const errors = r.issues.filter((i) => i.severity === "error").length;
  const warnings = r.issues.filter((i) => i.severity === "warning").length;
  const scoreColor = r.score.value >= 80 ? "text-emerald-300" : r.score.value >= 50 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(239,68,68,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Score — {r.score.label}</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", scoreColor)}>
              <AnimatedNumber value={r.score.value} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/100</span>
            </div>
          </div>
          <Stat label="Policy" value={0} reduceMotion={!!reduceMotion} accent="text-emerald-300" overrideText={r.policy ?? "—"} />
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings ? "text-amber-300" : "text-sky-100"} />
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_DMARC)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample (p=reject)
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
          Copy record
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Mail className="size-4 text-primary" />
          DMARC TXT record value
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder='v=DMARC1; p=reject; rua=mailto:dmarc@example.com; sp=reject; pct=100'
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <p className="text-[11px] text-muted-foreground">
          Paste the value from <code className="font-mono">_dmarc.example.com</code> TXT record.
        </p>
      </section>

      <section className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 text-xs">
        <KV label="Version" value={r.version} />
        <KV label="Policy (p)" value={r.policy} />
        <KV label="Subdomain (sp)" value={r.subdomainPolicy} />
        <KV label="DKIM alignment" value={r.adkim === "s" ? "strict" : "relaxed"} />
        <KV label="SPF alignment" value={r.aspf === "s" ? "strict" : "relaxed"} />
        <KV label="Percentage" value={`${r.pct}%`} />
        <KV label="Aggregate (rua)" value={r.ruaUris.join(", ") || undefined} />
        <KV label="Forensic (ruf)" value={r.rufUris.join(", ") || undefined} />
        <KV label="Report interval" value={`${r.reportInterval}s (≈${Math.round(r.reportInterval / 3600)}h)`} />
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

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing runs entirely in your browser — Toollyz has no server.
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

function Stat({
  label,
  value,
  reduceMotion,
  accent,
  overrideText,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
  overrideText?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      {overrideText !== undefined ? (
        <div className={cn("font-heading text-xl font-bold tracking-tight capitalize sm:text-2xl", accent ?? "text-sky-50")}>
          {overrideText}
        </div>
      ) : (
        <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
          <AnimatedNumber value={value} reduceMotion={reduceMotion} />
        </div>
      )}
    </div>
  );
}
