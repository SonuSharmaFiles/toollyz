"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Eraser,
  Filter,
  Lock,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_DENSITY_OPTIONS,
  analyse,
  reportToCsv,
  type DensityOptions,
  type DensityRow,
} from "@/lib/tools/text/keyword-density";

const TEXT_KEY = "toollyz:kwdensity-text";
const OPT_KEY = "toollyz:kwdensity-opt";

const SAMPLE = `Toollyz is a growing collection of fast, private, browser-only tools. Every Toollyz tool runs entirely in your browser — no upload, no sign-up, no tracking. The Toollyz platform now hosts over 250 free, privacy-first tools across text, developer, image, audio, calculator and converter categories. We add new tools every week; subscribe to our newsletter for updates.

Why Toollyz? Three reasons. First, Toollyz tools are private — your data never leaves your device. Second, Toollyz tools are fast — they ship as a single static page and load instantly. Third, Toollyz tools are free — no paywall, no ads, no upsell.

Want to build with us? The Toollyz code is open source on GitHub. Contributions welcome.`;

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

export default function KeywordDensityChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [opt, setOpt] = React.useState<DensityOptions>(DEFAULT_DENSITY_OPTIONS);
  const [filter, setFilter] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOpt({ ...DEFAULT_DENSITY_OPTIONS, ...parsed });
      }
    } catch {
      setText(SAMPLE);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(OPT_KEY, JSON.stringify(opt));
    } catch {
      /* noop */
    }
  }, [text, opt, mounted]);

  const deferred = React.useDeferredValue(text);
  const report = React.useMemo(() => analyse(deferred, opt), [deferred, opt]);
  const filterFn = React.useCallback(
    (r: DensityRow) => {
      const f = filter.trim().toLowerCase();
      return !f || r.keyword.toLowerCase().includes(f);
    },
    [filter],
  );

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
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total words" value={report.totalWords} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Unique words" value={report.uniqueWords} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Diversity</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={Math.round(report.diversity * 100)} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
          <Stat
            label="Top phrases"
            value={report.unigrams.length + report.bigrams.length + report.trigrams.length}
            reduceMotion={!!reduceMotion}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Filter className="size-4 text-primary" />
          Options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Toggle
            checked={opt.ignoreStopwords}
            onChange={(v) => setOpt((o) => ({ ...o, ignoreStopwords: v }))}
            label="Ignore stopwords"
          />
          <Toggle
            checked={opt.ignoreCase}
            onChange={(v) => setOpt((o) => ({ ...o, ignoreCase: v }))}
            label="Ignore case"
          />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Min length</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={opt.minLength}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOpt((o) => ({ ...o, minLength: Math.max(1, Math.min(20, n)) }));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Optimal range %</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.1"
                value={opt.optimalLow}
                onChange={(e) => setOpt((o) => ({ ...o, optimalLow: parseFloat(e.target.value) || 0 }))}
                className="h-9 font-mono text-xs"
              />
              <Input
                type="number"
                step="0.1"
                value={opt.optimalHigh}
                onChange={(e) => setOpt((o) => ({ ...o, optimalHigh: parseFloat(e.target.value) || 0 }))}
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
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
        <button
          type="button"
          onClick={() => copy(reportToCsv(report), "tsv")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          {copied === "tsv" ? <Check className="size-3" /> : <Copy className="size-3" />}
          Copy as TSV
        </button>
        <button
          type="button"
          onClick={() => downloadText(reportToCsv(report), "density.tsv")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Download className="size-3" />
          Download TSV
        </button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Search className="size-4 text-primary" />
          Text
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          spellCheck
          placeholder="Paste your prose — blog post, landing page, essay, marketing copy."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <TrendingUp className="size-4 text-primary" />
            Density tables
          </h2>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter keywords…"
            className="h-8 max-w-xs"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <DensityTable title="1-gram (single words)" rows={report.unigrams.filter(filterFn).slice(0, 50)} />
          <DensityTable title="2-gram (pairs)" rows={report.bigrams.filter(filterFn).slice(0, 50)} />
          <DensityTable title="3-gram (triples)" rows={report.trigrams.filter(filterFn).slice(0, 50)} />
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <TrendingUp className="size-3" />
        Tokenisation and density analysis run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function DensityTable({ title, rows }: { title: string; rows: DensityRow[] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-2">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No phrases match.</p>
      ) : (
        <ul className="space-y-1 list-none">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center gap-2 rounded-md p-1 text-xs">
              <span className="grid size-5 shrink-0 place-items-center rounded bg-muted text-[10px] font-mono text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 break-all">{r.keyword}</span>
              <span className="font-mono text-muted-foreground">×{r.count}</span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-mono text-[10px]",
                  r.band === "optimal" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  r.band === "high" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  r.band === "low" && "bg-muted text-muted-foreground",
                )}
              >
                {r.density.toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      )}
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
    <label className="inline-flex h-9 items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
