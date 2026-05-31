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
  ListMinus,
  Lock,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_DEDUPE,
  countOccurrences,
  dedupeLines,
  statsOf,
  type DedupeOptions,
  type Order,
} from "@/lib/tools/text/dedupe-lines";

const TEXT_KEY = "toollyz:dedup-text";
const OPT_KEY = "toollyz:dedup-opts";

const SAMPLE = `apple
banana
Apple
cherry
banana
date
apple
elderberry
fig
date
grape`;

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

function isOrder(s: string | null): s is Order {
  return s === "preserve" || s === "first" || s === "sort";
}

export default function DuplicateLineRemover() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<DedupeOptions>(DEFAULT_DEDUPE);
  const [filter, setFilter] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") {
          setOptions({
            ...DEFAULT_DEDUPE,
            ...parsed,
            order: isOrder(parsed.order) ? parsed.order : DEFAULT_DEDUPE.order,
          });
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
  const result = React.useMemo(() => dedupeLines(deferred, options), [deferred, options]);
  const stats = React.useMemo(() => statsOf(deferred, options), [deferred, options]);
  const occurrences = React.useMemo(() => countOccurrences(deferred, options), [deferred, options]);
  const filtered = React.useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return occurrences;
    return occurrences.filter((o) => o.line.toLowerCase().includes(f));
  }, [occurrences, filter]);

  async function copyOutput() {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Unique lines copied");
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Dedupe summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,114,182,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Input lines" value={stats.originalLines} reduceMotion={!!reduceMotion} />
          <Stat
            label="Unique kept"
            value={stats.uniqueLines}
            reduceMotion={!!reduceMotion}
            accent="text-emerald-300"
          />
          <Stat
            label="Duplicates dropped"
            value={stats.duplicatesRemoved}
            reduceMotion={!!reduceMotion}
            accent="text-rose-300"
          />
          <Stat label="Blank lines" value={stats.blankLines} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Options */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="size-3.5 text-primary" />
          Compare options
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={options.ignoreCase}
            onChange={(v) => setOptions({ ...options, ignoreCase: v })}
            label="Ignore case"
            title="Apple and APPLE are treated as the same line."
          />
          <Toggle
            checked={options.trim}
            onChange={(v) => setOptions({ ...options, trim: v })}
            label="Trim whitespace"
            title="Lines that differ only in leading/trailing spaces collapse."
          />
          <Toggle
            checked={options.removeEmpty}
            onChange={(v) => setOptions({ ...options, removeEmpty: v })}
            label="Drop blank lines"
          />
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group">
            <Seg
              active={options.order === "preserve"}
              onClick={() => setOptions({ ...options, order: "preserve" })}
              label="Keep original order"
            />
            <Seg
              active={options.order === "sort"}
              onClick={() => setOptions({ ...options, order: "sort" })}
              label="Sort A → Z"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
        <ToolBtn
          onClick={() => setText(result.output)}
          icon={<ListMinus className="size-3.5" />}
          label="Replace with unique"
        />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          label="Input"
          subtitle={`${stats.originalLines.toLocaleString()} lines`}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            spellCheck={false}
            aria-label="Input lines"
            placeholder="Paste the list with duplicate lines…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel
          label="Unique lines"
          subtitle={`${result.lines.length.toLocaleString()} kept · ${result.removed.toLocaleString()} dropped`}
        >
          <textarea
            value={result.output}
            readOnly
            rows={12}
            aria-label="Unique output"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copyOutput} disabled={!result.output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(result.output, "unique.txt")}
              disabled={!result.output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setText("")}
            >
              <Trash2 className="size-3.5" />
              Clear input
            </Button>
          </div>
        </Panel>
      </div>

      {/* Occurrence table */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Search className="size-4 text-primary" />
            Line frequency
          </h2>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter lines…"
            className="h-8 max-w-xs font-mono text-xs"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            <AlertCircle className="size-3.5" />
            {filter
              ? "No lines match the filter."
              : "Paste some lines to see how often each repeats."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Line</th>
                  <th className="px-3 py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((row, i) => (
                  <tr key={i} className="border-t border-border/40 hover:bg-muted/30">
                    <td className="px-3 py-1.5 font-mono break-all">{row.line || <em className="text-muted-foreground">(blank)</em>}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      <span
                        className={cn(
                          "inline-block min-w-[2ch] rounded px-1.5 py-0.5",
                          row.count > 1
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                        )}
                      >
                        ×{row.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <div className="border-t border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                Showing first 200 of {filtered.length.toLocaleString()} unique lines.
              </div>
            )}
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        Dedupe runs entirely in your browser — nothing is uploaded.
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

function Seg({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
