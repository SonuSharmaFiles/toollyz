"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Database,
  Download,
  Eraser,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_FORMAT_OPTIONS,
  SQL_PRESETS,
  formatSql,
  sqlStats,
  type FormatOptions,
} from "@/lib/tools/text/sql-format";

const TEXT_KEY = "toollyz:sql-text";
const OPT_KEY = "toollyz:sql-opts";

const SAMPLE = SQL_PRESETS[0].sql;

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/sql;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SqlFormatter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<FormatOptions>(DEFAULT_FORMAT_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOptions({ ...DEFAULT_FORMAT_OPTIONS, ...parsed });
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
  const formatted = React.useMemo(() => formatSql(deferred, options), [deferred, options]);
  const stats = React.useMemo(() => sqlStats(deferred), [deferred]);

  async function copy() {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Formatted SQL copied");
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
      {/* Hero */}
      <section
        aria-label="SQL summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Tokens" value={stats.tokens} reduceMotion={!!reduceMotion} />
          <Stat label="Keywords" value={stats.keywords} reduceMotion={!!reduceMotion} accent="text-violet-300" />
          <Stat label="Identifiers" value={stats.identifiers} reduceMotion={!!reduceMotion} />
          <Stat label="Strings" value={stats.strings} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Statements" value={stats.statements} reduceMotion={!!reduceMotion} accent="text-amber-300" />
        </div>
      </section>

      {/* Options */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Formatting options
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle
            checked={options.uppercase}
            onChange={(v) => setOptions((o) => ({ ...o, uppercase: v }))}
            label="UPPERCASE reserved words"
          />
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Indent
            <input
              type="number"
              min={2}
              max={8}
              value={options.indent}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, indent: Math.max(2, Math.min(8, n)) }));
              }}
              className="h-7 w-14 rounded-md border border-input bg-background px-2 text-center font-mono text-xs"
            />
            spaces
          </label>
        </div>
      </section>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        {SQL_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setText(p.sql)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Sparkles className="size-3" />
            {p.label}
          </button>
        ))}
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
        <Panel label="Input SQL" subtitle={`${stats.tokens.toLocaleString()} tokens`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Formatted SQL" subtitle={`${formatted.split("\n").length.toLocaleString()} lines`}>
          <textarea
            value={formatted}
            readOnly
            rows={18}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copy} disabled={!formatted}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(formatted, "query.sql")}
              disabled={!formatted}
            >
              <Download className="size-3.5" />
              Download .sql
            </Button>
          </div>
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Database className="size-3" />
        Tokenising and re-indenting run entirely in your browser — Toollyz has no server. The formatter
        targets the dialect-neutral subset of SQL most users write (SELECT / INSERT / UPDATE / DELETE /
        CREATE / WITH / JOIN), so unusual dialect-specific syntax may not be re-formatted.
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
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
