"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  Check,
  ChevronsLeftRight,
  Copy,
  Download,
  Eraser,
  GitCompareArrows,
  Lock,
  Minus,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_DIFF_OPTIONS,
  diffText,
  diffWords,
  type DiffOptions,
  type DiffRow,
} from "@/lib/tools/text/text-diff";

const LEFT_KEY = "toollyz:diff-left";
const RIGHT_KEY = "toollyz:diff-right";
const OPT_KEY = "toollyz:diff-options";

const SAMPLE_LEFT = `The quick brown fox
jumps over the lazy dog.
Sphinx of black quartz, judge my vow.
Pack my box with five dozen liquor jugs.`;

const SAMPLE_RIGHT = `The quick brown fox
jumps over the sleepy dog.
Sphinx of black quartz judges the vow.
The five boxing wizards jump quickly.`;

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

function buildPatch(rows: DiffRow[]): string {
  return rows
    .map((r) => {
      if (r.op === "equal") return `  ${r.left}`;
      if (r.op === "add") return `+ ${r.right}`;
      if (r.op === "remove") return `- ${r.left}`;
      return `- ${r.left}\n+ ${r.right}`;
    })
    .join("\n");
}

export default function TextDiffChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [left, setLeft] = React.useState("");
  const [right, setRight] = React.useState("");
  const [options, setOptions] = React.useState<DiffOptions>(DEFAULT_DIFF_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setLeft(localStorage.getItem(LEFT_KEY) ?? SAMPLE_LEFT);
      setRight(localStorage.getItem(RIGHT_KEY) ?? SAMPLE_RIGHT);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") {
          setOptions({ ...DEFAULT_DIFF_OPTIONS, ...parsed });
        }
      }
    } catch {
      setLeft(SAMPLE_LEFT);
      setRight(SAMPLE_RIGHT);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(LEFT_KEY, left);
      localStorage.setItem(RIGHT_KEY, right);
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [left, right, options, mounted]);

  const deferredL = React.useDeferredValue(left);
  const deferredR = React.useDeferredValue(right);
  const result = React.useMemo(
    () => diffText(deferredL, deferredR, options),
    [deferredL, deferredR, options],
  );

  function swap() {
    setLeft(right);
    setRight(left);
    toast.success("Sides swapped");
  }

  async function copyPatch() {
    try {
      await navigator.clipboard.writeText(buildPatch(result.rows));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Patch copied");
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

  const similarityPct = Math.round(result.stats.similarity * 100);
  const identical = result.stats.added + result.stats.removed + result.stats.changed === 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Diff summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(74,222,128,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Added" value={result.stats.added} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Removed" value={result.stats.removed} reduceMotion={!!reduceMotion} accent="text-rose-300" />
          <Stat label="Changed" value={result.stats.changed} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Unchanged" value={result.stats.unchanged} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Similar</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={similarityPct} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Options */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ChevronsLeftRight className="size-3.5 text-primary" />
          Diff options
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={options.ignoreWhitespace}
            onChange={(v) => setOptions({ ...options, ignoreWhitespace: v })}
            label="Ignore whitespace"
            title="Collapse runs of spaces and tabs before comparing."
          />
          <Toggle
            checked={options.ignoreCase}
            onChange={(v) => setOptions({ ...options, ignoreCase: v })}
            label="Ignore case"
          />
          <Toggle
            checked={options.ignoreBlankLines}
            onChange={(v) => setOptions({ ...options, ignoreBlankLines: v })}
            label="Ignore blank lines"
          />
          <Toggle
            checked={options.pairChanges}
            onChange={(v) => setOptions({ ...options, pairChanges: v })}
            label="Pair add+remove as change"
            title="Show a single highlighted row when one line is replaced by another."
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn
          onClick={() => {
            setLeft(SAMPLE_LEFT);
            setRight(SAMPLE_RIGHT);
          }}
          icon={<Sparkles className="size-3.5" />}
          label="Sample"
        />
        <ToolBtn
          onClick={() => {
            setLeft("");
            setRight("");
          }}
          icon={<Eraser className="size-3.5" />}
          label="Clear"
        />
        <ToolBtn onClick={swap} icon={<ArrowLeftRight className="size-3.5" />} label="Swap sides" />
      </div>

      {/* Input panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Original (left)" subtitle={`${result.stats.leftLines.toLocaleString()} lines`}>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            rows={10}
            spellCheck={false}
            aria-label="Original text"
            placeholder="Paste the original text here…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Modified (right)" subtitle={`${result.stats.rightLines.toLocaleString()} lines`}>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            rows={10}
            spellCheck={false}
            aria-label="Modified text"
            placeholder="Paste the modified text here…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
      </div>

      {/* Diff result */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <GitCompareArrows className="size-4 text-primary" />
            Side-by-side diff
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copyPatch} disabled={result.rows.length === 0}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy patch
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => downloadText(buildPatch(result.rows), "diff.patch")}
              disabled={result.rows.length === 0}
            >
              <Download className="size-3.5" />
              Download .patch
            </Button>
          </div>
        </div>
        {identical ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            Texts are identical under the current options.
          </div>
        ) : result.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Paste some text on each side.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-background">
            <table className="w-full border-collapse font-mono text-[12px] leading-5">
              <colgroup>
                <col style={{ width: 42 }} />
                <col />
                <col style={{ width: 42 }} />
                <col />
              </colgroup>
              <tbody>
                {result.rows.map((row, i) => (
                  <DiffRowView key={i} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        Diff runs entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function DiffRowView({ row }: { row: DiffRow }) {
  const baseCell = "px-2 py-1 align-top whitespace-pre-wrap break-words";
  const numCell = "px-1.5 py-1 text-right tabular-nums text-[10px] text-muted-foreground select-none border-r border-border/40 align-top";

  if (row.op === "equal") {
    return (
      <tr className="bg-background">
        <td className={numCell}>{row.leftNo}</td>
        <td className={cn(baseCell, "border-r border-border/40")}>{row.left || " "}</td>
        <td className={numCell}>{row.rightNo}</td>
        <td className={baseCell}>{row.right || " "}</td>
      </tr>
    );
  }
  if (row.op === "add") {
    return (
      <tr className="bg-emerald-500/[0.07]">
        <td className={numCell}></td>
        <td className={cn(baseCell, "border-r border-border/40 text-muted-foreground")}>{" "}</td>
        <td className={cn(numCell, "text-emerald-600 dark:text-emerald-400")}>+{row.rightNo}</td>
        <td className={cn(baseCell, "text-emerald-700 dark:text-emerald-300")}>
          <span className="mr-1 text-emerald-500">+</span>
          {row.right || " "}
        </td>
      </tr>
    );
  }
  if (row.op === "remove") {
    return (
      <tr className="bg-rose-500/[0.07]">
        <td className={cn(numCell, "text-rose-600 dark:text-rose-400")}>-{row.leftNo}</td>
        <td className={cn(baseCell, "border-r border-border/40 text-rose-700 dark:text-rose-300")}>
          <span className="mr-1 text-rose-500">-</span>
          {row.left || " "}
        </td>
        <td className={numCell}></td>
        <td className={cn(baseCell, "text-muted-foreground")}>{" "}</td>
      </tr>
    );
  }
  // change — show word-level highlights on both sides
  const tokens = diffWords(row.left, row.right);
  return (
    <tr className="bg-amber-500/[0.07]">
      <td className={cn(numCell, "text-amber-700 dark:text-amber-400")}>~{row.leftNo}</td>
      <td className={cn(baseCell, "border-r border-border/40")}>
        {tokens.left.map((t, i) => (
          <span
            key={i}
            className={cn(
              t.op === "remove" && "bg-rose-500/30 text-rose-800 dark:text-rose-200",
            )}
          >
            {t.text}
          </span>
        ))}
      </td>
      <td className={cn(numCell, "text-amber-700 dark:text-amber-400")}>~{row.rightNo}</td>
      <td className={baseCell}>
        {tokens.right.map((t, i) => (
          <span
            key={i}
            className={cn(
              t.op === "add" && "bg-emerald-500/30 text-emerald-800 dark:text-emerald-200",
            )}
          >
            {t.text}
          </span>
        ))}
      </td>
    </tr>
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
// Silence "Trash2/Minus/Plus imported but unused" if compiled with strict
// settings — they may end up unused after Tailwind purges the variant rows.
void Minus;
void Plus;
void Trash2;
