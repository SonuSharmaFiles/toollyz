"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
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
import { SAMPLE_CACHE_HEADERS, audit } from "@/lib/tools/text/cache-audit";

const KEY = "toollyz:cache-checker-input";

const SEV: Record<string, string> = {
  fail: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function WebsiteCacheChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_CACHE_HEADERS);
    } catch {
      setText(SAMPLE_CACHE_HEADERS);
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
  const r = React.useMemo(() => audit(deferred), [deferred]);

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

  const oks = r.checks.filter((c) => c.status === "ok").length;
  const warns = r.checks.filter((c) => c.status === "warn").length;
  const fails = r.checks.filter((c) => c.status === "fail").length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Freshness</div>
            <div className={cn("font-heading text-xl font-bold tracking-tight sm:text-2xl", r.uncacheable ? "text-rose-300" : r.freshnessSeconds && r.freshnessSeconds > 0 ? "text-emerald-300" : "text-amber-300")}>
              {r.uncacheable ? "no-store" : r.freshnessSeconds !== undefined ? humanise(r.freshnessSeconds) : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">{r.freshnessSource}</div>
          </div>
          <Stat label="OK" value={oks} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Warnings" value={warns} reduceMotion={!!reduceMotion} accent={warns ? "text-amber-300" : "text-sky-100"} />
          <Stat label="Errors" value={fails} reduceMotion={!!reduceMotion} accent={fails ? "text-rose-300" : "text-sky-100"} />
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_CACHE_HEADERS)}
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
          HTTP response headers
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste the response from `curl -I https://example.com`."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

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
                <li key={i} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV[c.status])}>
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
        <KV label="Cache-Control" value={r.cacheControl ? Object.entries(r.cacheControl).map(([k, v]) => (v === true ? k : `${k}=${v}`)).join(", ") : undefined} />
        <KV label="Pragma" value={r.pragma} />
        <KV label="Expires" value={r.expires?.toUTCString()} />
        <KV label="ETag" value={r.etag} />
        <KV label="Last-Modified" value={r.lastModified?.toUTCString()} />
        <KV label="Age" value={r.age !== undefined ? `${r.age}s` : undefined} />
        <KV label="Vary" value={r.vary?.join(", ")} />
        <KV label="CDN cache" value={r.cdnCacheStatus ? `${r.cdnCacheStatus.name}: ${r.cdnCacheStatus.value}` : undefined} />
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Audit runs entirely in your browser.
      </p>
    </div>
  );
}

function humanise(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  if (seconds < 31_536_000) return `${Math.round(seconds / 86400)}d`;
  return `${(seconds / 31_536_000).toFixed(1)}y`;
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
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
