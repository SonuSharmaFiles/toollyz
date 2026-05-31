"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRightLeft,
  Check,
  Copy,
  Download,
  Eraser,
  Lock,
  Pilcrow,
  Sparkles,
  Trash2,
  Type,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  REVERSE_MODES,
  reverseText,
  statsOf,
  type ReverseMode,
} from "@/lib/tools/text/text-reverser";

const INPUT_KEY = "toollyz:rev-input";
const MODE_KEY = "toollyz:rev-mode";

const SAMPLE =
  "Toollyz reverses text in your browser.\nReverse by character, word, line — even flip it upside down.";

function isMode(s: string | null): s is ReverseMode {
  return (
    s === "chars" ||
    s === "words" ||
    s === "lines" ||
    s === "each-word" ||
    s === "each-line" ||
    s === "mirror" ||
    s === "upside-down" ||
    s === "alternate-case"
  );
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

export default function TextReverser() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<ReverseMode>("chars");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(INPUT_KEY);
      setInput(stored ?? SAMPLE);
      const m = localStorage.getItem(MODE_KEY);
      if (isMode(m)) setMode(m);
    } catch {
      setInput(SAMPLE);
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(INPUT_KEY, input);
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [input, mode, mounted]);

  const deferred = React.useDeferredValue(input);
  const output = React.useMemo(() => reverseText(deferred, mode), [deferred, mode]);
  const inStats = React.useMemo(() => statsOf(input), [input]);
  const outStats = React.useMemo(() => statsOf(output), [output]);
  const meta = REVERSE_MODES.find((m) => m.id === mode) ?? REVERSE_MODES[0];

  async function copy(value: string, label = "Copied") {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success(label);
    } catch {
      toast.error("Could not copy");
    }
  }

  function swap() {
    if (!output) return;
    setInput(output);
    toast.success("Output is now the input");
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
        aria-label="Reverse summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Characters" value={inStats.chars} reduceMotion={!!reduceMotion} />
          <Stat label="Words" value={inStats.words} reduceMotion={!!reduceMotion} />
          <Stat label="Lines" value={inStats.lines} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Mode</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">
              {meta.label}
            </div>
          </div>
        </div>
      </section>

      {/* Mode picker */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Wand2 className="size-3.5 text-primary" />
          Reverse mode
        </div>
        <div role="radiogroup" aria-label="Reverse mode" className="flex flex-wrap gap-1.5">
          {REVERSE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => setMode(m.id)}
              title={m.description}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                mode === m.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:bg-muted",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{meta.description}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setInput(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setInput("")} icon={<Eraser className="size-3.5" />} label="Clear" />
        <ToolBtn onClick={swap} icon={<ArrowRightLeft className="size-3.5" />} label="Use output as input" />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          label="Input"
          subtitle={`${inStats.chars.toLocaleString()} chars · ${inStats.words.toLocaleString()} words`}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            spellCheck={false}
            aria-label="Input text"
            placeholder="Paste or type the text you want to flip…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => copy(input, "Input copied")}>
              <Copy className="size-4" />
              Copy input
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setInput("")}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
        </Panel>

        <Panel
          label="Reversed output"
          subtitle={`${outStats.chars.toLocaleString()} chars · ${outStats.words.toLocaleString()} words`}
        >
          <textarea
            value={output}
            readOnly
            rows={12}
            aria-label="Reversed output"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => copy(output, "Output copied")}
              disabled={!output}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy output
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(output, "reversed.txt")}
              disabled={!output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Mode gallery */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Type className="size-4 text-primary" />
          Quick examples
        </h2>
        <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {REVERSE_MODES.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                mode === m.id ? "border-primary bg-primary/5" : "border-border/60 bg-background hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{m.label}</span>
                {mode === m.id && <Check className="size-3.5 text-primary" />}
              </div>
              <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {m.exampleInput} → {m.exampleOutput}
              </div>
            </button>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Pilcrow className="size-3" aria-hidden="true" />
        Reversing happens entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  reduceMotion,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
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
