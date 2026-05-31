"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Download,
  Eraser,
  Eye,
  Hash,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_INSTAGRAM_INPUT,
  INSTAGRAM_LIMIT,
  INSTAGRAM_MAX_HASHTAGS,
  INSTAGRAM_MORE_CUTOFF,
  composeInstagramCaption,
  type InstagramInput,
  type InstagramStyleId,
} from "@/lib/tools/text/instagram-caption";
import { SOCIAL_STYLES } from "@/lib/tools/text/social-post";

const STATE_KEY = "toollyz:ig-state";

const SAMPLE: InstagramInput = {
  body:
    "✨ Slow mornings at the studio.\n\nCoffee in hand. Sketchbook open.\n\nWhat's your favourite way to start the day?",
  bodyStyle: "none",
  hashtags: {
    raw: "studio, slowliving, mornings, coffee, sketchbook, creative, artistsoninstagram, makersgonnamake, dailyinspiration",
    dedupe: true,
    newlineBefore: false,
    ensureHash: true,
    lowercase: false,
  },
  hideHashtagsBelowMore: true,
  spacerLines: 5,
};

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

export default function InstagramCaptionFormatter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<InstagramInput>(SAMPLE);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setState({
            ...DEFAULT_INSTAGRAM_INPUT,
            ...parsed,
            hashtags: { ...DEFAULT_INSTAGRAM_INPUT.hashtags, ...(parsed.hashtags ?? {}) },
          });
        }
      } else {
        setState(SAMPLE);
      }
    } catch {
      setState(SAMPLE);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  const result = React.useMemo(() => composeInstagramCaption(state), [state]);

  async function copy() {
    if (!result.composed) return;
    try {
      await navigator.clipboard.writeText(result.composed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Caption copied — paste into Instagram");
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

  const charsOver = result.characters > INSTAGRAM_LIMIT;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Caption summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,114,182,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Characters</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", charsOver ? "text-rose-300" : "text-sky-50")}>
              <AnimatedNumber value={result.characters} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/{INSTAGRAM_LIMIT.toLocaleString()}</span>
            </div>
          </div>
          <Stat label="Visible chars" value={result.visibleCharacters} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Hashtags</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={result.hashtagCount} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/{INSTAGRAM_MAX_HASHTAGS}</span>
            </div>
          </div>
          <Stat label="Hashtag slots left" value={result.remainingHashtagSlots} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
        </div>
      </section>

      {/* "More" preview */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Eye className="size-3.5 text-primary" />
          What followers see in the feed (before tapping &ldquo;…more&rdquo;)
        </div>
        <div className="rounded-xl border border-border/60 bg-background p-3 text-sm leading-relaxed">
          {result.hookText || <em className="text-muted-foreground">Type a caption to see the preview.</em>}
          {result.characters > INSTAGRAM_MORE_CUTOFF && <span className="text-primary"> …more</span>}
        </div>
      </section>

      {/* Style + spacing */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Body style
          </h2>
          <div className="flex flex-wrap gap-1">
            <Pill active={state.bodyStyle === "none"} label="Plain" onClick={() => setState((s) => ({ ...s, bodyStyle: "none" as InstagramStyleId }))} />
            {SOCIAL_STYLES.map((sty) => (
              <Pill
                key={sty.id}
                active={state.bodyStyle === sty.id}
                label={sty.label}
                onClick={() => setState((s) => ({ ...s, bodyStyle: sty.id }))}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Eye className="size-4 text-primary" />
            Hashtag placement
          </h2>
          <Toggle
            checked={state.hideHashtagsBelowMore}
            onChange={(v) => setState((s) => ({ ...s, hideHashtagsBelowMore: v }))}
            label="Push hashtags below the &ldquo;…more&rdquo; fold"
            title="Inserts invisible spacer lines so hashtags collapse out of the visible preview."
          />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Spacer lines</Label>
            <Input
              type="number"
              min={0}
              max={8}
              value={state.spacerLines}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setState((s) => ({ ...s, spacerLines: Math.max(0, Math.min(8, n)) }));
              }}
              className="h-9 w-24 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Hashtags */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Hash className="size-4 text-primary" />
          Hashtags
          <span className="text-xs font-normal text-muted-foreground">
            Best 5–11 niche tags
          </span>
        </h2>
        <textarea
          value={state.hashtags.raw}
          onChange={(e) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, raw: e.target.value } }))}
          placeholder="studio, slowliving, mornings, coffee, sketchbook"
          rows={3}
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary"
        />
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={state.hashtags.dedupe}
            onChange={(v) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, dedupe: v } }))}
            label="Dedupe"
          />
          <Toggle
            checked={state.hashtags.lowercase}
            onChange={(v) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, lowercase: v } }))}
            label="lowercase"
          />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setState(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn
          onClick={() => setState((s) => ({ ...s, body: "" }))}
          icon={<Eraser className="size-3.5" />}
          label="Clear body"
        />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Caption body" subtitle={`${[...state.body].length.toLocaleString()} chars`}>
          <textarea
            value={state.body}
            onChange={(e) => setState((s) => ({ ...s, body: e.target.value }))}
            rows={12}
            spellCheck
            aria-label="Caption body"
            placeholder="Write your caption — blank lines stay intact when copied."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Formatted preview" subtitle={`${result.characters.toLocaleString()} chars · ${result.hashtagCount} tags`}>
          <textarea
            value={result.composed}
            readOnly
            rows={12}
            aria-label="Formatted preview"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copy} disabled={!result.composed}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(result.composed, "instagram-caption.txt")}
              disabled={!result.composed}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {result.warnings.length > 0 && (
        <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="size-3.5" />
            Heads up
          </div>
          <ul className="list-disc space-y-0.5 pl-5 list-inside">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Camera className="size-3" />
        Caption formatting runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground/80 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  title?: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title={title}>
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
