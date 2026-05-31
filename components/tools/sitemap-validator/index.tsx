"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  FileSearch,
  Info,
  Link as LinkIcon,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_SITEMAP, validate } from "@/lib/tools/text/sitemap";

const KEY = "toollyz:sitemap-text";

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SitemapValidator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_SITEMAP);
    } catch {
      setText(SAMPLE_SITEMAP);
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
  const result = React.useMemo(() => validate(deferred), [deferred]);
  const filtered = React.useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return result.urls;
    return result.urls.filter((u) => u.loc.toLowerCase().includes(f));
  }, [result.urls, filter]);

  async function copyUrls() {
    const lines = result.urls.map((u) => u.loc).join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success(`${result.urls.length.toLocaleString()} URLs copied`);
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label={result.kind === "sitemapindex" ? "Sitemaps" : "URLs"} value={result.urls.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors > 0 ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings > 0 ? "text-amber-300" : "text-sky-100"} />
          <Stat label="Infos" value={infos} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Kind</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg capitalize">
              {result.kind === "invalid" ? "—" : result.kind}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_SITEMAP)}
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
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <FileSearch className="size-4 text-primary" />
          XML input
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          spellCheck={false}
          placeholder="Paste your sitemap.xml content — <urlset> or <sitemapindex>."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
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

      {result.urls.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <LinkIcon className="size-4 text-primary" />
              {result.kind === "sitemapindex" ? "Child sitemaps" : "Extracted URLs"} ({result.urls.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter…"
                className="h-8 max-w-xs font-mono text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={copyUrls}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                Copy all
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const tsv = ["loc\tlastmod\tchangefreq\tpriority", ...result.urls.map((u) => `${u.loc}\t${u.lastmod ?? ""}\t${u.changefreq ?? ""}\t${u.priority ?? ""}`)].join("\n");
                  downloadText(tsv, "sitemap-urls.tsv");
                }}
              >
                <Download className="size-3.5" />
                TSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">URL</th>
                  <th className="px-3 py-2 text-left">Lastmod</th>
                  <th className="px-3 py-2 text-left">Changefreq</th>
                  <th className="px-3 py-2 text-right">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 500).map((u, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{u.loc}</td>
                    <td className="px-3 py-1.5 font-mono">
                      {u.lastmod && (
                        <span className={u.lastmodValid === false ? "text-rose-600 dark:text-rose-400" : ""}>{u.lastmod}</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{u.changefreq ?? ""}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{u.priority?.toFixed(2) ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 500 && (
              <div className="border-t border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                Showing first 500 of {filtered.length.toLocaleString()} URLs.
              </div>
            )}
          </div>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileSearch className="size-3" />
        XML parsing uses DOMParser and runs entirely in your browser — Toollyz has no server.
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
