"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  Lock,
  Smile,
  Sparkles,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_TEXT_TO_EMOJI,
  EMOJI_DICT,
  emojiToText,
  statsEmoji,
  statsText,
  textToEmoji,
} from "@/lib/tools/text/emoji-translator";

const TEXT_KEY = "toollyz:emoji-text";
const DIR_KEY = "toollyz:emoji-dir";
const MODE_KEY = "toollyz:emoji-mode";

type Direction = "to-emoji" | "to-text";
type Mode = "replace" | "append";

const SAMPLE_TO_EMOJI =
  "Just shipped a fire new tool — love it. Sending big hugs and lots of coffee to my team! Time to sleep.";
const SAMPLE_TO_TEXT = "🚀 Just launched! Big 🎉 — sending ❤️ and ☕ to everyone. 🥳";

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

export default function EmojiTranslator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [direction, setDirection] = React.useState<Direction>("to-emoji");
  const [mode, setMode] = React.useState<Mode>(DEFAULT_TEXT_TO_EMOJI.mode);
  const [text, setText] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const d = localStorage.getItem(DIR_KEY);
      const dir: Direction = d === "to-text" ? "to-text" : "to-emoji";
      setDirection(dir);
      const m = localStorage.getItem(MODE_KEY);
      if (m === "replace" || m === "append") setMode(m);
      const stored = localStorage.getItem(TEXT_KEY);
      setText(stored ?? (dir === "to-text" ? SAMPLE_TO_TEXT : SAMPLE_TO_EMOJI));
    } catch {
      setText(SAMPLE_TO_EMOJI);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(DIR_KEY, direction);
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [text, direction, mode, mounted]);

  const deferred = React.useDeferredValue(text);
  const output = React.useMemo(() => {
    return direction === "to-emoji"
      ? textToEmoji(deferred, { mode, longestMatchFirst: true })
      : emojiToText(deferred);
  }, [deferred, direction, mode]);

  const stats = React.useMemo(
    () => (direction === "to-emoji" ? statsText(deferred) : statsEmoji(deferred)),
    [deferred, direction],
  );

  async function copy(value: string, label = "Output copied") {
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
    setText(output);
    setDirection((d) => (d === "to-emoji" ? "to-text" : "to-emoji"));
  }

  function flipSample() {
    setText(direction === "to-emoji" ? SAMPLE_TO_EMOJI : SAMPLE_TO_TEXT);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const coveragePct = Math.round(stats.coverage * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Translator summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(250,204,21,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            label={direction === "to-emoji" ? "Words" : "Emoji seen"}
            value={direction === "to-emoji" ? stats.words : stats.emojiSeen}
            reduceMotion={!!reduceMotion}
          />
          <Stat label="Matched" value={stats.matches} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Dictionary" value={EMOJI_DICT.length} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Coverage</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={coveragePct} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Direction & mode */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Direction">
          <SegBtn active={direction === "to-emoji"} onClick={() => setDirection("to-emoji")} label="Text → Emoji" />
          <SegBtn active={direction === "to-text"} onClick={() => setDirection("to-text")} label="Emoji → Text" />
        </div>
        {direction === "to-emoji" && (
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Mode">
            <SegBtn active={mode === "replace"} onClick={() => setMode("replace")} label="Replace word" />
            <SegBtn active={mode === "append"} onClick={() => setMode("append")} label="Append emoji" />
          </div>
        )}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={flipSample} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
        <ToolBtn onClick={swap} icon={<ArrowLeftRight className="size-3.5" />} label="Use output as input" />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={direction === "to-emoji" ? "Plain text" : "Emoji-rich text"}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            aria-label="Input"
            placeholder={
              direction === "to-emoji"
                ? "Type a message — coffee, fire, hugs, party, love…"
                : "Paste a message with emoji and decode them to keywords."
            }
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label={direction === "to-emoji" ? "With emoji" : "Decoded text"}>
          <textarea
            value={output}
            readOnly
            rows={10}
            aria-label="Output"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-base outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => copy(output)} disabled={!output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(output, direction === "to-emoji" ? "with-emoji.txt" : "decoded.txt")}
              disabled={!output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Dictionary preview */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Smile className="size-4 text-primary" />
          Built-in dictionary
          <span className="text-xs font-normal text-muted-foreground">
            {EMOJI_DICT.length} entries
          </span>
        </h2>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60 bg-background p-2">
          <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3 lg:grid-cols-4">
            {EMOJI_DICT.map((e, i) => (
              <button
                type="button"
                key={i}
                onClick={() => {
                  if (direction === "to-emoji") setText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}${e.keywords[0]}`);
                  else setText((t) => `${t}${e.emoji}`);
                }}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-1.5 text-left transition-colors hover:bg-muted"
                title={`Keywords: ${e.keywords.join(", ")}`}
              >
                <span className="text-xl leading-none">{e.emoji}</span>
                <span className="min-w-0 truncate text-[11px] font-medium text-foreground/80">
                  {e.keywords[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Type className="size-3" />
        Translation uses a built-in dictionary and runs entirely in your browser — Toollyz has no server.
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

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="mb-2 text-sm font-semibold tracking-tight">{label}</h2>
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
