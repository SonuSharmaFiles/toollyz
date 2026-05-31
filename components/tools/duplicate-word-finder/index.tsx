"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Eraser,
  Filter,
  Highlighter,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_DUPLICATE_OPTIONS,
  findDuplicates,
  highlight,
  type DuplicateOptions,
} from "@/lib/tools/text/duplicate-word";

const TEXT_KEY = "toollyz:dupwords-text";
const OPT_KEY = "toollyz:dupwords-opts";

const SAMPLE = `Great writing is rewriting. Great writers know that the first draft is just the start of writing. The very best writers rewrite again and again until each sentence is the best it can be. The trick is to find the duplicate words you don't notice when you write them — words like "very" or "just" or "really".`;

const HIGHLIGHT_CLASSES = [
  "bg-rose-500/30 text-rose-900 dark:text-rose-100",
  "bg-amber-500/30 text-amber-900 dark:text-amber-100",
  "bg-emerald-500/30 text-emerald-900 dark:text-emerald-100",
  "bg-sky-500/30 text-sky-900 dark:text-sky-100",
  "bg-violet-500/30 text-violet-900 dark:text-violet-100",
];

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DuplicateWordFinder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<DuplicateOptions>(DEFAULT_DUPLICATE_OPTIONS);
  const [filter, setFilter] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") {
          setOptions({ ...DEFAULT_DUPLICATE_OPTIONS, ...parsed });
        }
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
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [text, options, mounted]);

  const deferred = React.useDeferredValue(text);
  const report = React.useMemo(() => findDuplicates(deferred, options), [deferred, options]);
  const segments = React.useMemo(() => highlight(deferred, report), [deferred, report]);
  const filtered = React.useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return report.duplicates;
    return report.duplicates.filter((d) => d.word.toLowerCase().includes(f));
  }, [report.duplicates, filter]);

  async function copyReport() {
    if (report.duplicates.length === 0) return;
    const lines = report.duplicates.map((d) => `${d.word}\t${d.count}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success(`Copied ${report.duplicates.length} duplicates`);
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const diversityPct = Math.round(report.diversity * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Duplicate word summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,114,182,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Words counted" value={report.total} reduceMotion={!!reduceMotion} />
          <Stat label="Unique" value={report.unique} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Repeated" value={report.duplicates.length} reduceMotion={!!reduceMotion} accent="text-rose-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Diversity</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={diversityPct} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Options */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="size-3.5 text-primary" />
          What counts as a duplicate
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle
            checked={options.ignoreCase}
            onChange={(v) => setOptions({ ...options, ignoreCase: v })}
            label="Ignore case"
          />
          <Toggle
            checked={options.ignoreStopwords}
            onChange={(v) => setOptions({ ...options, ignoreStopwords: v })}
            label="Ignore stopwords"
            title="Skip very common short words like the, and, of, to, …"
          />
          <Toggle
            checked={options.ignoreNumbers}
            onChange={(v) => setOptions({ ...options, ignoreNumbers: v })}
            label="Ignore numbers"
          />
          <NumberField
            label="Min length"
            value={options.minLength}
            min={1}
            max={20}
            onChange={(n) => setOptions({ ...options, minLength: n })}
          />
          <NumberField
            label="Min count"
            value={options.minCount}
            min={1}
            max={20}
            onChange={(n) => setOptions({ ...options, minCount: n })}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
      </div>

      {/* Editor + highlight preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Your text" subtitle={`${report.total.toLocaleString()} counted words`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            spellCheck
            aria-label="Text"
            placeholder="Paste an essay, post or paragraph…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Highlighted preview" subtitle={`${report.duplicates.length.toLocaleString()} repeated words`}>
          <div className="min-h-[12rem] whitespace-pre-wrap break-words rounded-xl border border-input bg-background p-3 text-sm leading-relaxed">
            {segments.length === 0 ? (
              <em className="text-muted-foreground">Start typing to see duplicates light up.</em>
            ) : (
              segments.map((s, i) =>
                s.word ? (
                  <span
                    key={i}
                    className={cn(
                      "rounded px-1 py-0.5 transition-colors",
                      HIGHLIGHT_CLASSES[(s.rank ?? 1) - 1] ?? HIGHLIGHT_CLASSES[HIGHLIGHT_CLASSES.length - 1],
                    )}
                    title={`Rank ${s.rank} duplicate: "${s.word}"`}
                  >
                    {s.text}
                  </span>
                ) : (
                  <React.Fragment key={i}>{s.text}</React.Fragment>
                ),
              )
            )}
          </div>
        </Panel>
      </div>

      {/* Frequency table */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Search className="size-4 text-primary" />
            Repeated words
          </h2>
          <div className="flex items-center gap-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="h-8 max-w-xs font-mono text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copyReport}
              disabled={report.duplicates.length === 0}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy TSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                downloadText(
                  report.duplicates.map((d) => `${d.word}\t${d.count}`).join("\n"),
                  "duplicates.tsv",
                )
              }
              disabled={report.duplicates.length === 0}
            >
              <Download className="size-3.5" />
              .tsv
            </Button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            <AlertCircle className="size-3.5" />
            {filter ? "No duplicates match that filter." : "No duplicates yet — keep writing!"}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Rank</th>
                  <th className="px-3 py-2 text-left">Word</th>
                  <th className="px-3 py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((row, i) => (
                  <tr key={row.word + i} className="border-t border-border/40 hover:bg-muted/30">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground tabular-nums">#{i + 1}</td>
                    <td className="px-3 py-1.5 font-medium break-all">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5",
                          HIGHLIGHT_CLASSES[i] ?? HIGHLIGHT_CLASSES[HIGHLIGHT_CLASSES.length - 1],
                        )}
                      >
                        {row.word}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">×{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Highlighter className="size-3" />
        Tokenising and counting run entirely in your browser — nothing is uploaded.
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

function Panel({
  label,
  subtitle,
  children,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
        {subtitle && <span className="text-xs text-muted-foreground tabular-nums">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
    >
      {icon}
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  title?: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title={title}>
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

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className="h-7 w-14 rounded-md border border-input bg-background px-2 text-center text-xs font-mono outline-none focus-visible:border-primary"
      />
    </label>
  );
}
