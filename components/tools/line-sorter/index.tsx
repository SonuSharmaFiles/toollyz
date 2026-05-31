"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowDownAZ,
  Check,
  Copy,
  Download,
  Eraser,
  Filter,
  Lock,
  Shuffle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_SORT_OPTIONS,
  SORT_MODES,
  sortLines,
  type SortMode,
  type SortOptions,
} from "@/lib/tools/text/sort-lines";

const TEXT_KEY = "toollyz:sort-text";
const MODE_KEY = "toollyz:sort-mode";
const OPT_KEY = "toollyz:sort-opts";

const SAMPLE = `image10.png
image2.png
image1.png
zebra
Apple
banana
4 oranges
12 apples
3 cherries`;

function isMode(s: string | null): s is SortMode {
  return SORT_MODES.some((m) => m.id === s);
}

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

export default function LineSorter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [mode, setMode] = React.useState<SortMode>("natural-az");
  const [options, setOptions] = React.useState<SortOptions>(DEFAULT_SORT_OPTIONS);
  const [copied, setCopied] = React.useState(false);
  // Bumping this re-runs shuffle when the user clicks the mode again.
  const [shuffleSeed, setShuffleSeed] = React.useState(0);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const m = localStorage.getItem(MODE_KEY);
      if (isMode(m)) setMode(m);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") {
          setOptions({ ...DEFAULT_SORT_OPTIONS, ...parsed });
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
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [text, mode, options, mounted]);

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(
    () => sortLines(deferred, mode, options),
    // shuffleSeed is intentionally included so re-clicking shuffle produces a
    // new order even when text/options haven't changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deferred, mode, options, shuffleSeed],
  );

  async function copyOutput() {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Sorted output copied");
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

  const groups: Array<"Alpha" | "Numeric" | "Length" | "Random"> = ["Alpha", "Numeric", "Length", "Random"];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Sort summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(74,222,128,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Input lines" value={result.inputLines} reduceMotion={!!reduceMotion} />
          <Stat label="Sorted lines" value={result.lines.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Blanks removed" value={result.removedBlanks} reduceMotion={!!reduceMotion} />
          <Stat label="Duplicates removed" value={result.removedDuplicates} reduceMotion={!!reduceMotion} accent="text-rose-300" />
        </div>
      </section>

      {/* Mode picker */}
      <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ArrowDownAZ className="size-3.5 text-primary" />
          Sort method
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div key={g}>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</div>
              <div className="flex flex-wrap gap-1">
                {SORT_MODES.filter((m) => m.group === g).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={mode === m.id}
                    title={m.hint}
                    onClick={() => {
                      if (mode === m.id && m.id === "shuffle") setShuffleSeed((s) => s + 1);
                      else setMode(m.id);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                      mode === m.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {m.id === "shuffle" && <Shuffle className="size-3" />}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="size-3.5 text-primary" />
          Options
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={options.caseSensitive}
            onChange={(v) => setOptions({ ...options, caseSensitive: v })}
            label="Case-sensitive"
            title="When off (default), Apple and apple sort together."
          />
          <Toggle
            checked={options.ignoreLeadingSpace}
            onChange={(v) => setOptions({ ...options, ignoreLeadingSpace: v })}
            label="Ignore leading spaces"
            title="Indentation is ignored when comparing — useful for nested lists."
          />
          <Toggle
            checked={options.removeBlanks}
            onChange={(v) => setOptions({ ...options, removeBlanks: v })}
            label="Drop blank lines"
          />
          <Toggle
            checked={options.dedupe}
            onChange={(v) => setOptions({ ...options, dedupe: v })}
            label="Dedupe after sorting"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
        <ToolBtn
          onClick={() => setText(result.output)}
          icon={<ArrowDownAZ className="size-3.5" />}
          label="Replace input with sorted"
        />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Input" subtitle={`${result.inputLines.toLocaleString()} lines`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            spellCheck={false}
            aria-label="Input lines"
            placeholder="Paste a list with one item per line…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Sorted output" subtitle={`${result.lines.length.toLocaleString()} lines`}>
          <textarea
            value={result.output}
            readOnly
            rows={14}
            aria-label="Sorted output"
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
              onClick={() => downloadText(result.output, "sorted.txt")}
              disabled={!result.output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setText("")}>
              <Trash2 className="size-3.5" />
              Clear input
            </Button>
          </div>
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        Sorting runs entirely in your browser — nothing is uploaded. Shuffle uses
        <code className="mx-1 rounded bg-muted px-1 font-mono">crypto.getRandomValues</code>
        when available.
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
