"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  FileCog,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_FORMAT_OPTIONS,
  formatToml,
  parseToml,
  tomlStats,
  type FormatOptions,
} from "@/lib/tools/text/toml-format";

const TEXT_KEY = "toollyz:toml-text";
const OPT_KEY = "toollyz:toml-opts";

const SAMPLE = `# pyproject-style example
[tool.poetry]
name = "toollyz"
version = "0.1.0"
description = "Browser-side dev tools"
authors = ["Sonu <shyam@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.31.0"

[[tool.poetry.scripts]]
name = "serve"
command = "python -m http.server"

[[tool.poetry.scripts]]
name = "test"
command = "pytest -q"

[server]
host = "0.0.0.0"
port = 8080
debug = false

  retry = { attempts = 3, delay = 0.5 }
tags = [ "alpha", "beta", "gamma", "delta" ]
`;

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/toml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function TomlFormatter() {
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
        if (parsed && typeof parsed === "object") {
          setOptions({ ...DEFAULT_FORMAT_OPTIONS, ...parsed });
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
  const parsed = React.useMemo(() => parseToml(deferred), [deferred]);
  const formatted = React.useMemo(() => formatToml(parsed, options), [parsed, options]);
  const stats = React.useMemo(() => tomlStats(parsed, deferred), [parsed, deferred]);

  async function copy() {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Formatted TOML copied");
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
        aria-label="TOML summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Tables" value={stats.tables} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Keys" value={stats.keys} reduceMotion={!!reduceMotion} />
          <Stat label="Arrays" value={stats.arrays} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", parsed.ok ? "text-emerald-300" : "text-rose-300")}>
              {parsed.ok ? "Valid TOML" : "Invalid"}
            </div>
          </div>
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
            checked={options.sortKeys}
            onChange={(v) => setOptions((o) => ({ ...o, sortKeys: v }))}
            label="Sort keys alphabetically"
          />
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Array break at
            <input
              type="number"
              min={2}
              max={20}
              value={options.arrayBreakAt}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, arrayBreakAt: Math.max(2, Math.min(20, n)) }));
              }}
              className="h-7 w-14 rounded-md border border-input bg-background px-2 text-center font-mono text-xs"
            />
            items
          </label>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3.5" />
          Sample
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3.5" />
          Clear
        </button>
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Input TOML" subtitle={`${stats.lines.toLocaleString()} lines · ${stats.bytes.toLocaleString()} bytes`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {!parsed.ok && parsed.errors[0] && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-3.5" />
              <span className="font-mono">
                Line {parsed.errors[0].line}, col {parsed.errors[0].column}:
              </span>{" "}
              {parsed.errors[0].message}
            </div>
          )}
        </Panel>

        <Panel label="Formatted TOML" subtitle={parsed.ok ? "valid" : "—"}>
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
              onClick={() => downloadText(formatted, "config.toml")}
              disabled={!formatted}
            >
              <Download className="size-3.5" />
              Download .toml
            </Button>
          </div>
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileCog className="size-3" />
        Parsing, validation and re-emit run entirely in your browser — Toollyz has no server.
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
