"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eraser,
  Gauge,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HTML, analyse } from "@/lib/tools/text/meta-analyzer";

const KEY = "toollyz:meta-analyzer";

const SEV_STYLE: Record<string, string> = {
  fail: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function MetaTagAnalyzer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_HTML);
    } catch {
      setText(SAMPLE_HTML);
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
  const r = React.useMemo(() => analyse(deferred), [deferred]);

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

  const scoreColor =
    r.score >= 85 ? "text-emerald-300" : r.score >= 60 ? "text-amber-300" : "text-rose-300";

  const errors = r.checks.filter((c) => c.status === "fail").length;
  const warnings = r.checks.filter((c) => c.status === "warn").length;
  const oks = r.checks.filter((c) => c.status === "ok").length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">SEO score</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", scoreColor)}>
              <AnimatedNumber value={r.score} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/100</span>
            </div>
          </div>
          <Stat label="OK" value={oks} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings ? "text-amber-300" : "text-sky-100"} />
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors ? "text-rose-300" : "text-sky-100"} />
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_HTML)}
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
          <Gauge className="size-4 text-primary" />
          Page HTML
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste a page's HTML — head is enough."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {r.breakdown.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Score breakdown</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.breakdown.map((b) => {
              const pct = Math.round((b.got / b.max) * 100);
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{b.label}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{b.got}/{b.max}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full transition-all", pct >= 85 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {r.checks.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <ul className="space-y-1.5 list-none">
            {r.checks.map((c, i) => {
              const Icon =
                c.status === "fail"
                  ? AlertCircle
                  : c.status === "warn"
                  ? AlertTriangle
                  : c.status === "ok"
                  ? CheckCircle2
                  : Info;
              return (
                <li key={i} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV_STYLE[c.status])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <span className="font-semibold">{c.label}</span> — {c.message}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 text-xs">
        <KV label="Title" value={r.title} />
        <KV label="Description" value={r.description} />
        <KV label="Lang" value={r.language} />
        <KV label="Charset" value={r.charset} />
        <KV label="Viewport" value={r.viewport} />
        <KV label="Robots" value={r.robots} />
        <KV label="Theme colour" value={r.themeColor} />
        <KV label="Canonical" value={r.canonical} />
        <KV label="hreflang" value={r.hreflangs.length ? r.hreflangs.join(", ") : undefined} />
        <KV label="JSON-LD types" value={r.jsonLdTypes.length ? r.jsonLdTypes.join(", ") : undefined} />
      </section>

      {(Object.keys(r.og).length > 0 || Object.keys(r.twitter).length > 0) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {Object.keys(r.og).length > 0 && (
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="text-sm font-semibold tracking-tight">Open Graph</h3>
              <div className="space-y-1 text-xs">
                {Object.entries(r.og).map(([k, v]) => (
                  <KV key={k} label={`og:${k}`} value={v} />
                ))}
              </div>
            </div>
          )}
          {Object.keys(r.twitter).length > 0 && (
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="text-sm font-semibold tracking-tight">Twitter Card</h3>
              <div className="space-y-1 text-xs">
                {Object.entries(r.twitter).map(([k, v]) => (
                  <KV key={k} label={`twitter:${k}`} value={v} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Audit runs entirely in your browser — Toollyz has no server.
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
