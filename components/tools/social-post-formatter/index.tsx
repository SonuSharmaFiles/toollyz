"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  Eye,
  Hash,
  Lock,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_HASHTAGS,
  DEFAULT_SPACING,
  SOCIAL_STYLES,
  composePost,
  type HashtagInput,
  type SocialStyleId,
  type SpacingOptions,
} from "@/lib/tools/text/social-post";

const STATE_KEY = "toollyz:social-state";

interface State {
  body: string;
  bodyStyle: SocialStyleId | "none";
  hashtags: HashtagInput;
  spacing: SpacingOptions;
}

const DEFAULT_STATE: State = {
  body:
    "Just shipped 5 new tools.\n\nEach one runs entirely in your browser — no upload, no sign-up.\n\nHave a look:",
  bodyStyle: "bold",
  hashtags: { ...DEFAULT_HASHTAGS, raw: "tools, indiehackers, buildinpublic" },
  spacing: { ...DEFAULT_SPACING },
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

export default function SocialPostFormatter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setState({
            ...DEFAULT_STATE,
            ...parsed,
            hashtags: { ...DEFAULT_STATE.hashtags, ...(parsed.hashtags ?? {}) },
            spacing: { ...DEFAULT_STATE.spacing, ...(parsed.spacing ?? {}) },
          });
        }
      }
    } catch {
      /* noop */
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

  const result = React.useMemo(
    () =>
      composePost({
        body: state.body,
        bodyStyle: state.bodyStyle,
        hashtags: state.hashtags,
        spacing: state.spacing,
      }),
    [state],
  );

  async function copy() {
    if (!result.composed) return;
    try {
      await navigator.clipboard.writeText(result.composed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Post copied — paste straight into your platform");
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Post summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Characters" value={result.characters} reduceMotion={!!reduceMotion} />
          <Stat label="Lines" value={result.lines} reduceMotion={!!reduceMotion} />
          <Stat label="Hashtags" value={result.hashtagCount} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Style</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">
              {state.bodyStyle === "none"
                ? "Plain"
                : SOCIAL_STYLES.find((s) => s.id === state.bodyStyle)?.label ?? "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Style picker */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Body style (Unicode — survives copy-paste)
        </div>
        <div role="radiogroup" className="flex flex-wrap gap-1.5">
          <StyleBtn
            active={state.bodyStyle === "none"}
            label="Plain"
            hint="No transform"
            onClick={() => setState((s) => ({ ...s, bodyStyle: "none" }))}
          />
          {SOCIAL_STYLES.map((s) => (
            <StyleBtn
              key={s.id}
              active={state.bodyStyle === s.id}
              label={s.label}
              hint={s.hint}
              onClick={() => setState((cur) => ({ ...cur, bodyStyle: s.id }))}
            />
          ))}
        </div>
      </div>

      {/* Spacing + hashtags + toolbar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Eye className="size-4 text-primary" />
            Line break boosters
          </h2>
          <div className="space-y-2">
            <Toggle
              checked={state.spacing.preserveBlankLines}
              onChange={(v) => setState((s) => ({ ...s, spacing: { ...s.spacing, preserveBlankLines: v } }))}
              label="Preserve blank lines (zero-width spacer)"
              title="Adds U+2063 to empty lines so platforms don't collapse them."
            />
            <Toggle
              checked={state.spacing.doubleSpace}
              onChange={(v) => setState((s) => ({ ...s, spacing: { ...s.spacing, doubleSpace: v } }))}
              label="Double-space every line"
              title="Inserts a spacer line between every line for extra breathing room."
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Hash className="size-4 text-primary" />
            Hashtag block
          </h2>
          <textarea
            value={state.hashtags.raw}
            onChange={(e) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, raw: e.target.value } }))}
            placeholder="tools, indiehackers, buildinpublic"
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
              checked={state.hashtags.newlineBefore}
              onChange={(v) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, newlineBefore: v } }))}
              label="Line break before tags"
            />
            <Toggle
              checked={state.hashtags.lowercase}
              onChange={(v) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, lowercase: v } }))}
              label="lowercase"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setState(DEFAULT_STATE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn
          onClick={() => setState((s) => ({ ...s, body: "" }))}
          icon={<Eraser className="size-3.5" />}
          label="Clear body"
        />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Post body" subtitle={`${[...state.body].length.toLocaleString()} chars`}>
          <textarea
            value={state.body}
            onChange={(e) => setState((s) => ({ ...s, body: e.target.value }))}
            rows={12}
            spellCheck
            aria-label="Post body"
            placeholder="Write the body of your post here…"
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
              onClick={() => downloadText(result.composed, "post.txt")}
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
        <Megaphone className="size-3" />
        Unicode style transforms work on X / Twitter, Mastodon, Bluesky, Facebook, Threads and Reddit —
        paste straight from the preview.
      </p>
    </div>
  );
}

function StyleBtn({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={hint}
      className={cn(
        "min-w-0 rounded-lg border px-3 py-1.5 text-left text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/80 hover:bg-muted",
      )}
    >
      <div>{label}</div>
      <div className="font-mono text-[10px] opacity-70">{hint}</div>
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
  label: string;
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
