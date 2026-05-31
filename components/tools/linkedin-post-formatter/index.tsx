"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BookText,
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
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_LINKEDIN_INPUT,
  LINKEDIN_HOOK_CUTOFF,
  LINKEDIN_LIMIT,
  composeLinkedinPost,
  evaluateHook,
  type LinkedinInput,
  type LinkedinStyleId,
} from "@/lib/tools/text/linkedin-post";
import { SOCIAL_STYLES } from "@/lib/tools/text/social-post";

const STATE_KEY = "toollyz:linkedin-state";

const SAMPLE: LinkedinInput = {
  body:
    "5 lessons from 5 years of building in public.\n\nI started writing about my work in 2020.\n\nIt felt scary. Now it's the single highest-leverage habit I have.\n\nHere's what I learned (the hard way):",
  bodyStyle: "none",
  hookStyle: "bold",
  hashtags: { raw: "buildinpublic, indiehackers, writing", dedupe: true, newlineBefore: true, ensureHash: true, lowercase: false },
  spacing: { preserveBlankLines: true, doubleSpace: false },
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

export default function LinkedinPostFormatter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<LinkedinInput>(SAMPLE);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setState({
            ...DEFAULT_LINKEDIN_INPUT,
            ...parsed,
            hashtags: { ...DEFAULT_LINKEDIN_INPUT.hashtags, ...(parsed.hashtags ?? {}) },
            spacing: { ...DEFAULT_LINKEDIN_INPUT.spacing, ...(parsed.spacing ?? {}) },
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

  const result = React.useMemo(() => composeLinkedinPost(state), [state]);
  const firstLine = state.body.split("\n")[0] ?? "";
  const hookChecks = React.useMemo(() => evaluateHook(firstLine), [firstLine]);
  const hookScore = hookChecks.filter((h) => h.passed).length;

  async function copy() {
    if (!result.composed) return;
    try {
      await navigator.clipboard.writeText(result.composed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Post copied — paste into LinkedIn");
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

  const overLimit = result.characters > LINKEDIN_LIMIT;
  const hookOver = result.hookChars >= LINKEDIN_HOOK_CUTOFF;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="LinkedIn post summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(14,165,233,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Characters</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", overLimit ? "text-rose-300" : "text-sky-50")}>
              <AnimatedNumber value={result.characters} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/{LINKEDIN_LIMIT.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Hook chars</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", hookOver ? "text-amber-300" : "text-emerald-300")}>
              <AnimatedNumber value={result.hookChars} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/{LINKEDIN_HOOK_CUTOFF}</span>
            </div>
          </div>
          <Stat label="Hashtags" value={result.hashtagCount} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Hook score</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={hookScore} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hook preview */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Eye className="size-3.5 text-primary" />
          What readers see before clicking &ldquo;…see more&rdquo;
        </div>
        <div className="rounded-xl border border-border/60 bg-background p-3 text-sm leading-relaxed">
          {result.hookText || <em className="text-muted-foreground">Start typing — the first 210 chars appear here.</em>}
          {result.characters > LINKEDIN_HOOK_CUTOFF && (
            <span className="text-primary"> …see more</span>
          )}
        </div>
      </section>

      {/* Style picker */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Style picker
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hook (first line)</div>
            <StyleGrid
              value={state.hookStyle}
              onChange={(v) => setState((s) => ({ ...s, hookStyle: v }))}
            />
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rest of body</div>
            <StyleGrid
              value={state.bodyStyle}
              onChange={(v) => setState((s) => ({ ...s, bodyStyle: v }))}
            />
          </div>
        </div>
      </div>

      {/* Spacing + hashtags */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Eye className="size-4 text-primary" />
            Line break boosters
          </h2>
          <Toggle
            checked={state.spacing.preserveBlankLines}
            onChange={(v) => setState((s) => ({ ...s, spacing: { ...s.spacing, preserveBlankLines: v } }))}
            label="Preserve blank lines (invisible spacer)"
            title="Stops LinkedIn mobile from collapsing empty lines."
          />
          <Toggle
            checked={state.spacing.doubleSpace}
            onChange={(v) => setState((s) => ({ ...s, spacing: { ...s.spacing, doubleSpace: v } }))}
            label="Double-space every line"
            title="More breathing room for long posts."
          />
        </div>
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Hash className="size-4 text-primary" />
            Hashtags (3–5 niche tags do best)
          </h2>
          <textarea
            value={state.hashtags.raw}
            onChange={(e) => setState((s) => ({ ...s, hashtags: { ...s.hashtags, raw: e.target.value } }))}
            placeholder="buildinpublic, leadership, writing"
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setState(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn
          onClick={() => setState((s) => ({ ...s, body: "" }))}
          icon={<Eraser className="size-3.5" />}
          label="Clear"
        />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Post body" subtitle={`${[...state.body].length.toLocaleString()} chars`}>
          <textarea
            value={state.body}
            onChange={(e) => setState((s) => ({ ...s, body: e.target.value }))}
            rows={14}
            spellCheck
            aria-label="Body"
            placeholder="Start with a 1-line hook, then write the rest…"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Formatted preview" subtitle={`${result.characters.toLocaleString()} chars`}>
          <textarea
            value={result.composed}
            readOnly
            rows={14}
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
              onClick={() => downloadText(result.composed, "linkedin-post.txt")}
              disabled={!result.composed}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Hook checks */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <BookText className="size-4 text-primary" />
          Hook checks
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hookChecks.map((c) => (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border p-3 text-xs",
                c.passed
                  ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {c.passed ? <Check className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
                {c.label}
              </div>
              <div className="mt-1 opacity-90">{c.hint}</div>
            </div>
          ))}
        </div>
      </section>

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
        <BookText className="size-3" />
        Formatting and hook scoring run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function StyleGrid({
  value,
  onChange,
}: {
  value: LinkedinStyleId;
  onChange: (v: LinkedinStyleId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <Pill active={value === "none"} label="Plain" onClick={() => onChange("none")} />
      {SOCIAL_STYLES.map((s) => (
        <Pill
          key={s.id}
          active={value === s.id}
          label={s.label}
          onClick={() => onChange(s.id)}
        />
      ))}
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
