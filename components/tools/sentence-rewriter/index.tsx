"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Eraser,
  Lock,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  TONES,
  rewriteBatch,
  rewriteSentence,
  type Tone,
} from "@/lib/tools/text/sentence-rewriter";

const KEY = "toollyz:sentrew-text";
const TONE_KEY = "toollyz:sentrew-tone";
const COUNT_KEY = "toollyz:sentrew-count";

const SAMPLE = "Great writing is the result of careful, deliberate rewriting that improves clarity, removes filler, and respects the reader's time.";

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

function isTone(s: string | null): s is Tone {
  return TONES.some((t) => t.id === s);
}

export default function SentenceRewriter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [tone, setTone] = React.useState<Tone>("casual");
  const [count, setCount] = React.useState(5);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"sentence" | "batch">("sentence");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE);
      const t = localStorage.getItem(TONE_KEY);
      if (isTone(t)) setTone(t);
      const c = parseInt(localStorage.getItem(COUNT_KEY) ?? "5", 10);
      if (Number.isFinite(c)) setCount(Math.max(2, Math.min(8, c)));
    } catch {
      setText(SAMPLE);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
      localStorage.setItem(TONE_KEY, tone);
      localStorage.setItem(COUNT_KEY, String(count));
    } catch {
      /* noop */
    }
  }, [text, tone, count, mounted]);

  const deferred = React.useDeferredValue(text);
  const single = React.useMemo(() => rewriteSentence(deferred, tone, count), [deferred, tone, count]);
  const batch = React.useMemo(
    () => rewriteBatch({ text: deferred, tone, variationsPerSentence: count }),
    [deferred, tone, count],
  );

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied");
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

  const totalVariations = mode === "sentence" ? single.variations.length : batch.reduce((s, b) => s + b.rewrites.length, 0);
  const inputWords = deferred.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Rewriter summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Input words" value={inputWords} reduceMotion={!!reduceMotion} />
          <Stat
            label="Variations"
            value={totalVariations}
            reduceMotion={!!reduceMotion}
            accent="text-emerald-300"
          />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Tone</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">
              {TONES.find((t) => t.id === tone)?.label}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Mode</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">
              {mode === "sentence" ? "Single sentence" : "Whole text"}
            </div>
          </div>
        </div>
      </section>

      {/* Mode + tone picker */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group">
          <SegBtn active={mode === "sentence"} onClick={() => setMode("sentence")} label="Single sentence" />
          <SegBtn active={mode === "batch"} onClick={() => setMode("batch")} label="Whole text" />
        </div>
        <Input
          type="number"
          min={2}
          max={8}
          value={count}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n)) setCount(Math.max(2, Math.min(8, n)));
          }}
          className="h-8 w-20 font-mono"
          aria-label="Variations per sentence"
        />
        <span className="text-[11px] text-muted-foreground">variations / sentence</span>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
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

      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Wand2 className="size-3.5 text-primary" />
          Tone
        </div>
        <div role="radiogroup" className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={tone === t.id}
              onClick={() => setTone(t.id)}
              title={t.hint}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                tone === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {TONES.find((t) => t.id === tone)?.hint}
        </p>
      </div>

      {/* I/O */}
      <Panel label={mode === "sentence" ? "Sentence" : "Paragraph or essay"}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={mode === "sentence" ? 4 : 10}
          spellCheck
          placeholder={mode === "sentence" ? "Paste a sentence you'd like to vary…" : "Paste multiple sentences — each one gets its own set of rewrites."}
          className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </Panel>

      {/* Output */}
      {mode === "sentence" ? (
        <Panel label="Rewrites" subtitle={`${single.variations.length} variation${single.variations.length === 1 ? "" : "s"}`}>
          <ol className="space-y-2 list-none">
            {single.variations.map((v, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border border-border/60 bg-background p-3"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">{v}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{single.wordCounts[i]} words</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copy(v, `s${i}`)}
                  className="h-7 px-2"
                >
                  {copied === `s${i}` ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy(single.variations.join("\n"), "all")}
              disabled={single.variations.length === 0}
            >
              <Copy className="size-3.5" />
              Copy all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => downloadText(single.variations.join("\n"), "rewrites.txt")}
              disabled={single.variations.length === 0}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      ) : (
        <Panel label="Rewrites by sentence" subtitle={`${batch.length} sentence${batch.length === 1 ? "" : "s"}`}>
          <div className="space-y-3">
            {batch.map((row, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Original</div>
                <p className="mt-1 text-sm">{row.original}</p>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Rewrites ({row.rewrites.length})
                </div>
                <ul className="mt-1 space-y-1.5 list-none">
                  {row.rewrites.map((r, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="grid size-5 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                        {j + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed">{r}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => copy(r, `b${i}-${j}`)}
                        className="h-6 px-2"
                      >
                        {copied === `b${i}-${j}` ? <Check className="size-3" /> : <Copy className="size-3" />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs text-amber-700 dark:text-amber-300">
        <strong>Heuristic, not AI.</strong> This tool applies rule-based transformations and a curated
        synonym thesaurus — it doesn&apos;t call an LLM. Use the rewrites as a starting point and
        always re-read for accuracy. Some swaps may change subtle meaning.
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Wand2 className="size-3" />
        Rewriting runs entirely in your browser — your text is never sent to an AI service.
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

function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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
