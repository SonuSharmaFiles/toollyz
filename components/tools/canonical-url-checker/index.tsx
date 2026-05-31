"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Copy,
  Eraser,
  Info,
  Link as LinkIcon,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HTML, checkHtml, normalizeUrl } from "@/lib/tools/text/canonical-check";

const KEY = "toollyz:canonical-html";
const URL_KEY = "toollyz:canonical-url";

const SEV_STYLE: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function CanonicalUrlChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [html, setHtml] = React.useState("");
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    try {
      setHtml(localStorage.getItem(KEY) ?? SAMPLE_HTML);
      setUrl(localStorage.getItem(URL_KEY) ?? "");
    } catch {
      setHtml(SAMPLE_HTML);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, html);
      localStorage.setItem(URL_KEY, url);
    } catch {
      /* noop */
    }
  }, [html, url, mounted]);

  const deferredHtml = React.useDeferredValue(html);
  const report = React.useMemo(() => checkHtml(deferredHtml), [deferredHtml]);

  const normalised = React.useMemo(() => {
    if (!url.trim()) return null;
    return normalizeUrl(url.trim());
  }, [url]);

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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Canonicals" value={report.summary.canonicalsFound} reduceMotion={!!reduceMotion} accent={report.summary.canonicalsFound === 1 ? "text-emerald-300" : "text-rose-300"} />
          <Stat label="Alternates" value={report.summary.alternates} reduceMotion={!!reduceMotion} accent="text-sky-100" />
          <Stat label="Errors" value={report.summary.errors} reduceMotion={!!reduceMotion} accent={report.summary.errors ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={report.summary.warnings} reduceMotion={!!reduceMotion} accent={report.summary.warnings ? "text-amber-300" : "text-sky-100"} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <LinkIcon className="size-4 text-primary" />
          Normalise a single URL
        </h2>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page?utm_source=email&utm_medium=newsletter#hero"
          className="h-9 font-mono text-xs"
        />
        {normalised && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
            {normalised.ok ? (
              <>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Normalised</div>
                <div className="mt-1 break-all font-mono">{normalised.out}</div>
                <button
                  type="button"
                  onClick={() => copy(normalised.out)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium hover:bg-muted"
                >
                  <Copy className="size-3" />
                  Copy
                </button>
              </>
            ) : (
              <div className="text-rose-600 dark:text-rose-400">{normalised.reason}</div>
            )}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setHtml(SAMPLE_HTML)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
        <button
          type="button"
          onClick={() => setHtml("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <LinkIcon className="size-4 text-primary" />
          Page HTML (head is enough)
        </h2>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste a page's HTML — only the <head> is required."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      <section className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 text-xs">
        <KV label="Title" value={report.title} />
        <KV label="<base href>" value={report.baseHref} />
        <KV label="Canonical" value={report.canonical} />
        <KV label="og:url" value={report.ogUrl} />
        <KV label="twitter:url" value={report.twitterUrl} />
      </section>

      {report.issues.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Issues</h2>
          <ul className="space-y-1.5 list-none">
            {report.issues.map((i, idx) => {
              const Icon = i.severity === "error" ? AlertCircle : i.severity === "warning" ? AlertTriangle : Info;
              return (
                <li key={idx} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV_STYLE[i.severity])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{i.message}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {report.alternates.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">hreflang alternates ({report.alternates.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">hreflang</th>
                  <th className="px-3 py-2 text-left">href</th>
                  <th className="px-3 py-2 text-left">Normalised</th>
                </tr>
              </thead>
              <tbody>
                {report.alternates.map((a, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono">{a.hreflang ?? "—"}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{a.href}</td>
                    <td className="px-3 py-1.5 font-mono break-all text-muted-foreground">{a.normalized}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing and normalisation run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">—</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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
