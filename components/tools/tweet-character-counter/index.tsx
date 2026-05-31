"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  AtSign,
  Check,
  Copy,
  Download,
  Eraser,
  Hash,
  Layers,
  Link2,
  Lock,
  Pilcrow,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_SPLIT,
  TWEET_LIMITS,
  evaluateTweet,
  summariseThread,
  weighTweet,
  type TweetLimitId,
} from "@/lib/tools/text/tweet-counter";

const TEXT_KEY = "toollyz:tweet-text";
const LIMIT_KEY = "toollyz:tweet-limit";
const MARKER_KEY = "toollyz:tweet-marker";
const NUMBER_KEY = "toollyz:tweet-number";

const SAMPLE =
  "Just shipped 5 new tools on Toollyz — text reverser, line sorter, tweet counter and more. Each one runs entirely in your browser, no upload. https://toollyz.com #tools";

function isLimitId(s: string | null): s is TweetLimitId {
  return s === "free" || s === "long" || s === "premium";
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

export default function TweetCharacterCounter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [limitId, setLimitId] = React.useState<TweetLimitId>("free");
  const [marker, setMarker] = React.useState(DEFAULT_SPLIT.threadMarker);
  const [numbering, setNumbering] = React.useState(DEFAULT_SPLIT.numbering);
  const [copied, setCopied] = React.useState<number | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const l = localStorage.getItem(LIMIT_KEY);
      if (isLimitId(l)) setLimitId(l);
      const m = localStorage.getItem(MARKER_KEY);
      if (m !== null) setMarker(m);
      const n = localStorage.getItem(NUMBER_KEY);
      if (n === "true" || n === "false") setNumbering(n === "true");
    } catch {
      setText(SAMPLE);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(LIMIT_KEY, limitId);
      localStorage.setItem(MARKER_KEY, marker);
      localStorage.setItem(NUMBER_KEY, String(numbering));
    } catch {
      /* noop */
    }
  }, [text, limitId, marker, numbering, mounted]);

  const deferred = React.useDeferredValue(text);
  const limit = TWEET_LIMITS.find((l) => l.id === limitId) ?? TWEET_LIMITS[0];
  const state = React.useMemo(() => evaluateTweet(deferred, limit), [deferred, limit]);
  const w = React.useMemo(() => weighTweet(deferred), [deferred]);
  const thread = React.useMemo(
    () => summariseThread(deferred, { limit: limit.limit, numbering, threadMarker: marker }),
    [deferred, limit.limit, numbering, marker],
  );

  async function copy(value: string, index: number) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(index);
      window.setTimeout(() => setCopied((c) => (c === index ? null : c)), 1200);
      toast.success(index < 0 ? "Tweet copied" : `Tweet ${index + 1}/${thread.totalPosts} copied`);
    } catch {
      toast.error("Could not copy");
    }
  }
  function copyAll() {
    if (!thread.pieces.length) return;
    const all = thread.pieces.map((p) => p.text).join("\n\n");
    navigator.clipboard
      .writeText(all)
      .then(() => toast.success(`Copied ${thread.totalPosts} tweet${thread.totalPosts > 1 ? "s" : ""}`))
      .catch(() => toast.error("Could not copy"));
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const zoneAccent =
    state.zone === "over"
      ? "text-rose-300"
      : state.zone === "warn"
      ? "text-amber-300"
      : "text-emerald-300";
  const ringPct = Math.min(100, Math.round(state.ratio * 100));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Tweet summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Used</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", zoneAccent)}>
              <AnimatedNumber value={state.used} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/ {limit.limit.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">{state.remaining >= 0 ? "Remaining" : "Over by"}</div>
            <div
              className={cn(
                "font-heading text-2xl font-bold tabular-nums sm:text-3xl",
                state.remaining < 0 ? "text-rose-300" : "text-sky-50",
              )}
            >
              <AnimatedNumber value={Math.abs(state.remaining)} reduceMotion={!!reduceMotion} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Posts to send</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={thread.totalPosts} reduceMotion={!!reduceMotion} />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div
              className="relative grid place-items-center rounded-full"
              style={{
                width: 84,
                height: 84,
                background: `conic-gradient(currentColor ${ringPct}%, rgba(148,163,184,0.15) ${ringPct}%)`,
                color:
                  state.zone === "over"
                    ? "#fda4af"
                    : state.zone === "warn"
                    ? "#fcd34d"
                    : "#5eead4",
              }}
              aria-label={`${ringPct}% of limit`}
            >
              <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#0b1020] text-center font-mono text-xs text-sky-100/80">
                {ringPct}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Limit picker */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Pilcrow className="size-3.5 text-primary" />
          Account tier
        </div>
        <div role="radiogroup" aria-label="Tweet limit" className="flex flex-wrap gap-1.5">
          {TWEET_LIMITS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={limit.id === l.id}
              onClick={() => setLimitId(l.id)}
              title={l.hint}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                limit.id === l.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:bg-muted",
              )}
            >
              {l.label}
              <span className="ml-1 text-[10px] opacity-60">{l.limit.toLocaleString()}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{limit.hint}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={numbering}
            onChange={(e) => setNumbering(e.target.checked)}
            className="size-3.5 rounded border-border accent-primary"
          />
          Add &quot;1/N&quot; numbering
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          Marker
          <input
            type="text"
            value={marker}
            onChange={(e) => setMarker(e.target.value)}
            placeholder="🧵"
            maxLength={4}
            className="h-7 w-16 rounded-md border border-input bg-background px-2 text-center text-sm font-mono outline-none focus-visible:border-primary"
          />
        </label>
      </div>

      {/* Editor + thread */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          label="Draft"
          subtitle={`${state.used.toLocaleString()} / ${limit.limit.toLocaleString()} weighted`}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            spellCheck
            aria-label="Tweet text"
            placeholder="Type or paste your tweet…"
            className={cn(
              "w-full resize-none rounded-xl border bg-background p-3 text-sm outline-none focus-visible:ring-2",
              state.zone === "over"
                ? "border-rose-500/60 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
                : state.zone === "warn"
                ? "border-amber-500/60 focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
                : "border-input focus-visible:border-primary focus-visible:ring-primary/30",
            )}
          />
          {state.zone === "over" && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-3.5" />
              {Math.abs(state.remaining)} weighted chars over — will be split into{" "}
              <strong>{thread.totalPosts}</strong> posts.
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => copy(text, -1)}>
              <Copy className="size-4" />
              Copy draft
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setText("")}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
        </Panel>

        <Panel
          label="Thread preview"
          subtitle={`${thread.totalPosts} post${thread.totalPosts === 1 ? "" : "s"}`}
        >
          {thread.pieces.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
              Start typing to see the thread split.
            </p>
          ) : (
            <ul className="space-y-2 list-none">
              {thread.pieces.map((p, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-border/60 bg-background p-3"
                >
                  <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>
                      Post {p.index} / {p.total} ·{" "}
                      <span className="font-mono">{p.weight} chars</span>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => copy(p.text, idx)}
                      className="h-6 px-2 text-[11px]"
                    >
                      {copied === idx ? <Check className="size-3" /> : <Copy className="size-3" />}
                      Copy
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {p.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={copyAll}
              disabled={thread.pieces.length === 0}
            >
              <Layers className="size-4" />
              Copy all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                downloadText(
                  thread.pieces.map((p) => p.text).join("\n\n---\n\n"),
                  "thread.txt",
                )
              }
              disabled={thread.pieces.length === 0}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </Panel>
      </div>

      {/* Detection grid */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Detect icon={<Link2 className="size-3.5" />} label="URLs" count={w.urlCount}>
          {w.urlCount > 0
            ? `Each URL counts as ${23} chars — saved ${w.urlSavings.toLocaleString()} weighted units.`
            : "No URLs detected."}
        </Detect>
        <Detect icon={<AtSign className="size-3.5" />} label="Mentions" count={w.mentions.length}>
          {w.mentions.length > 0 ? w.mentions.join(" · ") : "No @mentions yet."}
        </Detect>
        <Detect icon={<Hash className="size-3.5" />} label="Hashtags" count={w.hashtags.length}>
          {w.hashtags.length > 0 ? w.hashtags.join(" · ") : "No #hashtags yet."}
        </Detect>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        Tweet weighting follows the X developer specification — URLs count as a fixed 23,
        and CJK / emoji code points count as 2.
      </p>
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

function Detect({
  icon,
  label,
  count,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="font-mono tabular-nums">{count}</span>
      </div>
      <p className="mt-1 break-words text-[11px] text-foreground/80">{children}</p>
    </div>
  );
}
