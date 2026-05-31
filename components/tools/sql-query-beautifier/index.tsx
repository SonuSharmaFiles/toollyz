"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Database,
  Eraser,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { type BeautifyOptions, DEFAULT_OPTIONS, SAMPLE_SQL, beautify } from "@/lib/tools/text/sql-beautify";

const KEY = "toollyz:sql-beautify-input";
const OPT_KEY = "toollyz:sql-beautify-opt";

export default function SqlQueryBeautifier() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [opt, setOpt] = React.useState<BeautifyOptions>(DEFAULT_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_SQL);
      const raw = localStorage.getItem(OPT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<BeautifyOptions>;
        setOpt({ ...DEFAULT_OPTIONS, ...parsed });
      }
    } catch {
      setText(SAMPLE_SQL);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
      localStorage.setItem(OPT_KEY, JSON.stringify(opt));
    } catch {
      /* noop */
    }
  }, [text, opt, mounted]);

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => beautify(deferred, opt), [deferred, opt]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("SQL copied");
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Lines" value={result.stats.lines} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Columns" value={result.stats.columns} reduceMotion={!!reduceMotion} accent="text-sky-300" />
          <Stat label="Keywords" value={result.stats.keywords} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Bytes" value={result.stats.bytes} reduceMotion={!!reduceMotion} accent="text-violet-300" />
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_SQL)}
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

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <Field label="Keyword case">
          <select
            value={opt.keywordCase}
            onChange={(e) => setOpt((o) => ({ ...o, keywordCase: e.target.value as BeautifyOptions["keywordCase"] }))}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="upper">UPPER</option>
            <option value="lower">lower</option>
            <option value="preserve">preserve</option>
          </select>
        </Field>
        <Field label="Comma style">
          <select
            value={opt.commaStyle}
            onChange={(e) => setOpt((o) => ({ ...o, commaStyle: e.target.value as BeautifyOptions["commaStyle"] }))}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="trailing">trailing (PEP-style)</option>
            <option value="leading">leading (Joe Celko)</option>
          </select>
        </Field>
        <Field label="Indent">
          <select
            value={opt.indent === "  " ? "2" : opt.indent === "    " ? "4" : "tab"}
            onChange={(e) => {
              const v = e.target.value;
              setOpt((o) => ({ ...o, indent: v === "2" ? "  " : v === "4" ? "    " : "\t" }));
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">tab</option>
          </select>
        </Field>
        <label className="flex items-end gap-2 text-xs sm:col-span-3">
          <input
            type="checkbox"
            checked={opt.alignSelectColumns}
            onChange={(e) => setOpt((o) => ({ ...o, alignSelectColumns: e.target.checked }))}
            className="size-4 rounded border-input"
          />
          Align SELECT columns (pad so `AS alias` lines up)
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Database className="size-4 text-primary" />
          Input
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder="Paste a SQL query — single line or messy whitespace welcome."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Beautified</h2>
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy
          </Button>
        </div>
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs">
          {result.output || "(nothing to format)"}
        </pre>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing and formatting run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
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
