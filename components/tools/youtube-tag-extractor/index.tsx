"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Eraser,
  Hash,
  Lock,
  ShieldCheck,
  Sparkles,
  Tag,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_DESCRIPTION, analyse } from "@/lib/tools/text/yt-tags";

const KEY = "toollyz:yt-tags-input";

export default function YoutubeTagExtractor() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [copiedBlock, setCopiedBlock] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_DESCRIPTION);
    } catch {
      setText(SAMPLE_DESCRIPTION);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => analyse(deferred), [deferred]);

  async function copy(value: string, msg = "Copied") {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(msg);
    } catch {
      toast.error("Could not copy");
    }
  }
  async function copyBlock() {
    if (!result.copyBlock) {
      toast.error("Nothing to copy yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.copyBlock);
      setCopiedBlock(true);
      window.setTimeout(() => setCopiedBlock(false), 1200);
      toast.success("Block copied");
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(239,68,68,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Hashtags" value={result.hashtags.length} reduceMotion={!!reduceMotion} accent="text-rose-300" />
          <Stat label="Comma tags" value={result.commaTags.length} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Keywords" value={result.keywords.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Tag chars</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", result.stats.commaTagsLimitOk ? "text-emerald-300" : "text-rose-300")}>
              <AnimatedNumber value={result.stats.commaTagsChars} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/500</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_DESCRIPTION)}
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

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Tv className="size-4 text-primary" />
          Video description
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste your YouTube video description here — hashtags above the title, `tags:` labels and recurring keywords are all extracted."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {!result.stats.hashtagsLimitOk && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mr-1 inline size-3.5" />
          Hashtag block is {result.stats.hashtagChars} chars — YouTube shows only the first ~60 above the title. Reorder the most important hashtags to the front.
        </div>
      )}
      {!result.stats.commaTagsLimitOk && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="mr-1 inline size-3.5" />
          Tag string is {result.stats.commaTagsChars} chars — YouTube caps the back-end tag field at 500. Some tags will be truncated when you paste.
        </div>
      )}

      {result.hashtags.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Hash className="size-4 text-primary" />
              Hashtags ({result.hashtags.length})
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy(result.hashtags.join(" "), `${result.hashtags.length} hashtags copied`)}
            >
              <Copy className="size-3.5" />
              Copy all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.hashtags.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => copy(h)}
                className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 font-mono text-xs text-rose-700 transition-colors hover:bg-rose-500/20 dark:text-rose-300"
              >
                {h}
              </button>
            ))}
          </div>
        </section>
      )}

      {result.commaTags.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Tag className="size-4 text-primary" />
              Comma-separated tags ({result.commaTags.length})
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy(result.commaTags.join(", "), `${result.commaTags.length} tags copied`)}
            >
              <Copy className="size-3.5" />
              Copy all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.commaTags.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => copy(t)}
                className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
              >
                {t}
              </button>
            ))}
          </div>
        </section>
      )}

      {result.keywords.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Auto-extracted keywords ({result.keywords.length})</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy(result.keywords.join(", "), `${result.keywords.length} keywords copied`)}
            >
              <Copy className="size-3.5" />
              Copy all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.keywords.map((k, i) => (
              <button
                key={i}
                type="button"
                onClick={() => copy(k)}
                className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"
              >
                {k}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Auto-extracted from the description's most-frequent unigrams and bigrams (excluding stop-words, URLs, hashtags and mentions). Recommended for the back-end Tags field in YouTube Studio.
          </p>
        </section>
      )}

      {result.copyBlock && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Ready-to-paste block</h2>
            <Button type="button" size="sm" variant="outline" onClick={copyBlock}>
              {copiedBlock ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy block
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
            {result.copyBlock}
          </pre>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Extraction runs entirely in your browser — Toollyz has no server and never contacts YouTube.
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
