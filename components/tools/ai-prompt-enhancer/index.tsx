"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Eraser,
  Lightbulb,
  Lock,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_REWRITE_OPTIONS,
  PRESET_PROMPTS,
  PROMPT_STYLES,
  analyse,
  rewrite,
  type PromptStyle,
} from "@/lib/tools/text/prompt-enhancer";

const TEXT_KEY = "toollyz:prompt-text";
const STYLE_KEY = "toollyz:prompt-style";

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

function isStyle(s: string | null): s is PromptStyle {
  return s === "markdown" || s === "xml" || s === "structured";
}

export default function AiPromptEnhancer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [style, setStyle] = React.useState<PromptStyle>(DEFAULT_REWRITE_OPTIONS.style);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? PRESET_PROMPTS[1].prompt);
      const s = localStorage.getItem(STYLE_KEY);
      if (isStyle(s)) setStyle(s);
    } catch {
      setText(PRESET_PROMPTS[1].prompt);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(STYLE_KEY, style);
    } catch {
      /* noop */
    }
  }, [text, style, mounted]);

  const deferred = React.useDeferredValue(text);
  const analysis = React.useMemo(() => analyse(deferred), [deferred]);
  const enhanced = React.useMemo(
    () => rewrite(deferred, analysis, { ...DEFAULT_REWRITE_OPTIONS, style }),
    [deferred, analysis, style],
  );

  async function copyOutput() {
    if (!enhanced) return;
    try {
      await navigator.clipboard.writeText(enhanced);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Enhanced prompt copied");
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

  const passedChecks = analysis.checks.filter((c) => c.present).length;
  const totalChecks = analysis.checks.length;
  const scoreColor =
    analysis.score >= 75 ? "text-emerald-300" : analysis.score >= 40 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Prompt analysis summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Completeness</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", scoreColor)}>
              <AnimatedNumber value={analysis.score} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/100</span>
            </div>
          </div>
          <Stat label="Words" value={analysis.words} reduceMotion={!!reduceMotion} />
          <Stat label="Characters" value={analysis.length} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Checks</div>
            <div className="font-heading text-3xl font-bold tabular-nums text-sky-50 sm:text-4xl">
              <AnimatedNumber value={passedChecks} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/{totalChecks}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Style + presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Prompt style">
          {PROMPT_STYLES.map((s) => (
            <SegBtn key={s.id} active={style === s.id} onClick={() => setStyle(s.id)} label={s.label} title={s.hint} />
          ))}
        </div>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        {PRESET_PROMPTS.map((p) => (
          <ToolBtn
            key={p.id}
            onClick={() => setText(p.prompt)}
            icon={<Sparkles className="size-3.5" />}
            label={p.label}
          />
        ))}
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
      </div>

      {/* Editor + enhanced output */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Your prompt" subtitle={`${analysis.words.toLocaleString()} words`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            spellCheck
            aria-label="Original prompt"
            placeholder="Paste a prompt you'd send to ChatGPT, Claude or Gemini…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Enhanced prompt" subtitle={style === "markdown" ? "markdown sections" : style === "xml" ? "XML tags" : "ALL-CAPS sections"}>
          <textarea
            value={enhanced}
            readOnly
            rows={12}
            aria-label="Enhanced prompt"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copyOutput} disabled={!enhanced}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                downloadText(enhanced, `prompt.${style === "xml" ? "xml" : style === "structured" ? "txt" : "md"}`)
              }
              disabled={!enhanced}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </Panel>
      </div>

      {/* Checks */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Lightbulb className="size-4 text-primary" />
          Prompt component checks
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {analysis.checks.map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex items-start gap-2 rounded-xl border p-3 text-xs",
                c.present
                  ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300",
              )}
            >
              {c.present ? <Check className="mt-0.5 size-3.5 shrink-0" /> : <X className="mt-0.5 size-3.5 shrink-0" />}
              <div className="space-y-0.5">
                <div className="font-semibold">{c.label}</div>
                <div className="opacity-90">{c.suggestion}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {analysis.warnings.length > 0 && (
        <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="size-3.5" />
            Heads up
          </div>
          <ul className="list-disc space-y-0.5 pl-5 list-inside">
            {analysis.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <WandSparkles className="size-3" />
        Analysis and rewriting run entirely in your browser — your prompt is never sent to any AI service.
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
      <div className="font-heading text-3xl font-bold tabular-nums text-sky-50 sm:text-4xl">
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

function SegBtn({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
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
