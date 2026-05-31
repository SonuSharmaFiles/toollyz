"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  FileType,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_OPTIONS,
  htmlToMarkdown,
  type ConvertOptions,
} from "@/lib/tools/text/html-markdown";

const TEXT_KEY = "toollyz:htmlmd-text";
const OPT_KEY = "toollyz:htmlmd-opts";

const SAMPLE = `<article>
  <h1>Welcome to Toollyz</h1>
  <p>A growing collection of <strong>fast, private, browser-only</strong> tools.</p>
  <h2>Features</h2>
  <ul>
    <li>No sign-up. No upload. No tracking.</li>
    <li>Each tool is a self-contained <em>page</em>.</li>
    <li>Open source on <a href="https://github.com" title="GitHub">GitHub</a>.</li>
  </ul>
  <h2>Code</h2>
  <pre><code class="language-ts">function hello(name: string) {
  return \`Hello, \${name}!\`;
}</code></pre>
  <blockquote>
    <p>Slow and private beats fast and tracked.</p>
  </blockquote>
  <table>
    <thead><tr><th>Category</th><th>Tools</th><th align="right">Count</th></tr></thead>
    <tbody>
      <tr><td>Text</td><td>writing, format, count</td><td align="right">25</td></tr>
      <tr><td>Developer</td><td>regex, json, sql</td><td align="right">40</td></tr>
    </tbody>
  </table>
</article>`;

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function HtmlToMarkdown() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<ConvertOptions>(DEFAULT_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOptions({ ...DEFAULT_OPTIONS, ...parsed });
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
  const result = React.useMemo(() => htmlToMarkdown(deferred, options), [deferred, options]);

  async function copy() {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Markdown copied");
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
        aria-label="HTML summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Headings" value={result.stats.headings} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Paragraphs" value={result.stats.paragraphs} reduceMotion={!!reduceMotion} />
          <Stat label="Lists" value={result.stats.lists} reduceMotion={!!reduceMotion} />
          <Stat label="Tables" value={result.stats.tables} reduceMotion={!!reduceMotion} />
          <Stat label="Links + images" value={result.stats.links + result.stats.images} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Options */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Output style
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Headings</Label>
            <select
              value={options.heading}
              onChange={(e) => setOptions((o) => ({ ...o, heading: e.target.value as ConvertOptions["heading"] }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="atx"># ATX</option>
              <option value="setext">Setext (===)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Bullet</Label>
            <select
              value={options.bullet}
              onChange={(e) => setOptions((o) => ({ ...o, bullet: e.target.value as ConvertOptions["bullet"] }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="-">- dash</option>
              <option value="*">* asterisk</option>
              <option value="+">+ plus</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Bold style</Label>
            <select
              value={options.strong}
              onChange={(e) => setOptions((o) => ({ ...o, strong: e.target.value as ConvertOptions["strong"] }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="**">** double-asterisk</option>
              <option value="__">__ double-underscore</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Italic style</Label>
            <select
              value={options.em}
              onChange={(e) => setOptions((o) => ({ ...o, em: e.target.value as ConvertOptions["em"] }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="*">* single-asterisk</option>
              <option value="_">_ single-underscore</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={options.preserveUnknown}
            onChange={(v) => setOptions((o) => ({ ...o, preserveUnknown: v }))}
            label="Keep unknown HTML tags verbatim"
          />
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Wrap at
            <input
              type="number"
              min={0}
              max={120}
              value={options.wrap}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, wrap: Math.max(0, Math.min(120, n)) }));
              }}
              className="h-7 w-14 rounded-md border border-input bg-background px-2 text-center font-mono text-xs"
            />
            columns (0 = none)
          </label>
        </div>
      </section>

      {result.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3.5" />
          {result.error}
        </div>
      )}

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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="HTML input" subtitle={`${text.length.toLocaleString()} chars`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={20}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Markdown output" subtitle={`${result.output.length.toLocaleString()} chars`}>
          <textarea
            value={result.output}
            readOnly
            rows={20}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copy} disabled={!result.output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(result.output, "converted.md")}
              disabled={!result.output}
            >
              <Download className="size-3.5" />
              Download .md
            </Button>
          </div>
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileType className="size-3" />
        Conversion runs entirely in your browser via DOMParser — Toollyz has no server. Scripts and styles
        are stripped.
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
