"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_CSV_OPTIONS,
  DELIMITER_LABELS,
  csvToJson,
  summariseFieldCounts,
  type CsvOptions,
  type Delimiter,
} from "@/lib/tools/text/csv-json";

const TEXT_KEY = "toollyz:csvjson-text";
const OPT_KEY = "toollyz:csvjson-opts";

const SAMPLE = `id,name,role,active,created_at
1,Ada Lovelace,founder,true,1815-12-10
2,Grace Hopper,admiral,true,1906-12-09
3,"Alan Turing, PhD",pioneer,false,1912-06-23
4,Margaret Hamilton,engineer,true,1936-08-17
5,Katherine Johnson,mathematician,true,1918-08-26
`;

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CsvToJson() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<CsvOptions>(DEFAULT_CSV_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOptions({ ...DEFAULT_CSV_OPTIONS, ...parsed });
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
  const result = React.useMemo(() => csvToJson(deferred, options), [deferred, options]);
  const fieldSummary = React.useMemo(() => summariseFieldCounts(result.rowFieldCounts), [result.rowFieldCounts]);
  const jsonOutput = React.useMemo(() => JSON.stringify(result.data, null, 2), [result.data]);

  async function copy() {
    if (!jsonOutput) return;
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("JSON copied");
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

  const rowCount = Array.isArray(result.data) ? result.data.length : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="CSV summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Rows" value={rowCount} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Columns" value={result.headers.length} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Delimiter</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">
              {DELIMITER_LABELS[result.delimiter]}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", result.ok ? "text-emerald-300" : "text-rose-300")}>
              {result.ok ? "Parsed" : "Error"}
            </div>
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Parse options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Delimiter</Label>
            <select
              value={options.delimiter}
              onChange={(e) => setOptions((o) => ({ ...o, delimiter: e.target.value as Delimiter | "auto" }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="auto">Auto-detect</option>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={"\t"}>Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Output shape</Label>
            <select
              value={options.output}
              onChange={(e) => setOptions((o) => ({ ...o, output: e.target.value as CsvOptions["output"] }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="objects">Array of objects</option>
              <option value="rows">Array of arrays</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Header row</Label>
            <Toggle
              checked={options.hasHeader}
              onChange={(v) => setOptions((o) => ({ ...o, hasHeader: v }))}
              label="First row is field names"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Types</Label>
            <Toggle
              checked={options.typedValues}
              onChange={(v) => setOptions((o) => ({ ...o, typedValues: v }))}
              label="Detect numbers / booleans"
            />
          </div>
        </div>
        <Toggle
          checked={options.skipEmpty}
          onChange={(v) => setOptions((o) => ({ ...o, skipEmpty: v }))}
          label="Skip empty rows"
        />
      </section>

      {!fieldSummary.uniform && fieldSummary.min !== fieldSummary.max && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
          Rows have inconsistent field counts ({fieldSummary.min}–{fieldSummary.max}). Check for unescaped
          delimiters inside fields.
        </div>
      )}

      {result.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3.5" />
          {result.error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
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
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="CSV input" subtitle={`${result.totalRows.toLocaleString()} rows`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="JSON output" subtitle={`${result.headers.length.toLocaleString()} columns`}>
          <textarea
            value={jsonOutput}
            readOnly
            rows={18}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copy} disabled={!result.ok}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy JSON
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(jsonOutput, "data.json", "application/json")}
              disabled={!result.ok}
            >
              <Download className="size-3.5" />
              Download .json
            </Button>
          </div>
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileSpreadsheet className="size-3" />
        Parsing runs entirely in your browser — Toollyz has no server.
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
