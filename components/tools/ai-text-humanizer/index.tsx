"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
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
  PERSONAS,
  humanize,
  type Persona,
} from "@/lib/tools/text/ai-humanizer";

const KEY = "toollyz:humanizer-text";
const PERSONA_KEY = "toollyz:humanizer-persona";

const SAMPLE =
  "In today's fast-paced world, navigating the realm of productivity can feel overwhelming. Furthermore, it is important to note that leveraging modern tools can elucidate workflows. Moreover, the tapestry of options available ensures that one can find solutions tailored to specific needs. In conclusion, embarking on this journey will undoubtedly facilitate growth.";

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

function isPersona(s: string | null): s is Persona {
  return s === "balanced" || s === "casual" || s === "expert" || s === "story";
}

export default function AiTextHumanizer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [persona, setPersona] = React.useState<Persona>("balanced");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE);
      const p = localStorage.getItem(PERSONA_KEY);
      if (isPersona(p)) setPersona(p);
    } catch {
      setText(SAMPLE);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
      localStorage.setItem(PERSONA_KEY, persona);
    } catch {
      /* noop */
    }
  }, [text, persona, mounted]);

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => humanize(deferred, persona), [deferred, persona]);

  async function copy() {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Humanised text copied");
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
        aria-label="Humaniser summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,114,182,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="In / out words" value={result.stats.outputWords} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Tells detected" value={result.stats.detected.length} reduceMotion={!!reduceMotion} accent="text-rose-300" />
          <Stat label="Contractions" value={result.stats.contractions} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Sentence variance</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={Math.round(result.stats.variance * 10)} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40"> /10</span>
            </div>
          </div>
        </div>
      </section>

      {/* Honest framing */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-1.5 font-semibold">
          <AlertTriangle className="size-3.5" />
          What this is — and isn&apos;t
        </div>
        <p className="mt-1 opacity-90">
          A heuristic pass that breaks the most obvious LLM tells: stiff transitions (<em>Furthermore</em>,
          <em> Moreover</em>), hollow openers (<em>In today&apos;s fast-paced world</em>), overused verbs
          (<em>delve</em>, <em>leverage</em>), repeated em-dashes, and the <em>X, Y, and Z</em> tricolon.
          It can&apos;t make text undetectable by AI-text classifiers, and we don&apos;t pretend otherwise.
          The point is readability and voice.
        </p>
      </div>

      {/* Persona picker */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Wand2 className="size-3.5 text-primary" />
          Voice persona
        </div>
        <div role="radiogroup" className="flex flex-wrap gap-1.5">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={persona === p.id}
              onClick={() => setPersona(p.id)}
              title={p.hint}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                persona === p.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {PERSONAS.find((p) => p.id === persona)?.hint}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample AI-style text
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
        <Panel label="AI-style input" subtitle={`${result.stats.inputWords.toLocaleString()} words`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            spellCheck
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Humanised output" subtitle={`${result.stats.outputWords.toLocaleString()} words`}>
          <textarea
            value={result.output}
            readOnly
            rows={14}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none"
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
              onClick={() => downloadText(result.output, "humanised.txt")}
              disabled={!result.output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Detected tells */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Bot className="size-4 text-primary" />
          AI tells detected in the input
        </h2>
        {result.stats.detected.length === 0 ? (
          <p className="text-xs text-muted-foreground">No obvious LLM tells detected. Nice.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {result.stats.detected.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-700 dark:text-rose-300"
              >
                <strong className="font-mono">×{d.count}</strong> {d.label}
              </span>
            ))}
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Bot className="size-3" />
        Humanising runs entirely in your browser — Toollyz has no server.
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

// Unused placeholders silenced so future toggles can be wired without removing imports.
void Input;
