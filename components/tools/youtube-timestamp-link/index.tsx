"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eraser,
  ExternalLink,
  Film,
  Lock,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_LINK_OPTIONS,
  buildChapters,
  buildLink,
  formatTimestamp,
  newChapter,
  parseTimestamp,
  parseVideo,
  type Chapter,
  type LinkStyle,
} from "@/lib/tools/text/youtube-timestamp";

const URL_KEY = "toollyz:yt-url";
const TIME_KEY = "toollyz:yt-time";
const STYLE_KEY = "toollyz:yt-style";
const CHAPTERS_KEY = "toollyz:yt-chapters";

const SAMPLE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const SAMPLE_CHAPTERS: Chapter[] = [
  { id: "a", label: "Intro", seconds: 0 },
  { id: "b", label: "First chorus", seconds: 43 },
  { id: "c", label: "Bridge", seconds: 113 },
];

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

function isStyle(s: string | null): s is LinkStyle {
  return s === "full" || s === "short" || s === "embed" || s === "markdown";
}

export default function YouTubeTimestampLink() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [videoInput, setVideoInput] = React.useState("");
  const [timeInput, setTimeInput] = React.useState("");
  const [style, setStyle] = React.useState<LinkStyle>(DEFAULT_LINK_OPTIONS.style);
  const [chapters, setChapters] = React.useState<Chapter[]>([]);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setVideoInput(localStorage.getItem(URL_KEY) ?? SAMPLE_URL);
      setTimeInput(localStorage.getItem(TIME_KEY) ?? "1:23");
      const s = localStorage.getItem(STYLE_KEY);
      if (isStyle(s)) setStyle(s);
      const ch = localStorage.getItem(CHAPTERS_KEY);
      if (ch) {
        const parsed = JSON.parse(ch);
        if (Array.isArray(parsed)) setChapters(parsed);
        else setChapters(SAMPLE_CHAPTERS);
      } else {
        setChapters(SAMPLE_CHAPTERS);
      }
    } catch {
      setVideoInput(SAMPLE_URL);
      setTimeInput("1:23");
      setChapters(SAMPLE_CHAPTERS);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(URL_KEY, videoInput);
      localStorage.setItem(TIME_KEY, timeInput);
      localStorage.setItem(STYLE_KEY, style);
      localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
    } catch {
      /* noop */
    }
  }, [videoInput, timeInput, style, chapters, mounted]);

  const video = React.useMemo(() => parseVideo(videoInput), [videoInput]);
  const seconds = React.useMemo(() => parseTimestamp(timeInput), [timeInput]);
  const singleLink = React.useMemo(
    () =>
      video.id && Number.isFinite(seconds)
        ? buildLink(video, seconds, { style, preservePlaylist: DEFAULT_LINK_OPTIONS.preservePlaylist })
        : "",
    [video, seconds, style],
  );
  const chaptersOutput = React.useMemo(() => buildChapters(video, chapters), [video, chapters]);

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  function addChapter() {
    setChapters((c) => [...c, newChapter()]);
  }
  function updateChapter(id: string, partial: Partial<Chapter>) {
    setChapters((c) => c.map((ch) => (ch.id === id ? { ...ch, ...partial } : ch)));
  }
  function removeChapter(id: string) {
    setChapters((c) => c.filter((ch) => ch.id !== id));
  }
  function moveChapter(id: string, delta: -1 | 1) {
    setChapters((c) => {
      const idx = c.findIndex((ch) => ch.id === id);
      const target = idx + delta;
      if (idx < 0 || target < 0 || target >= c.length) return c;
      const copy = [...c];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const validChapters = chapters.filter((c) => Number.isFinite(c.seconds));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Video summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(239,68,68,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,114,182,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Video ID</div>
            <div className="font-mono text-sm text-sky-50 truncate">
              {video.id || <span className="text-rose-300/80">Paste a YouTube URL or 11-char ID</span>}
            </div>
            {video.playlist && (
              <div className="text-[11px] text-muted-foreground truncate">Playlist: {video.playlist}</div>
            )}
          </div>
          <Stat
            label="Seconds"
            value={Number.isFinite(seconds) ? seconds : 0}
            reduceMotion={!!reduceMotion}
            accent={Number.isFinite(seconds) ? "text-emerald-300" : "text-rose-300"}
          />
          <Stat
            label="Chapters"
            value={validChapters.length}
            reduceMotion={!!reduceMotion}
            accent={chaptersOutput.meetsYouTubeRules ? "text-emerald-300" : undefined}
          />
        </div>
      </section>

      {/* Video input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">YouTube URL or ID</Label>
            <Input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=… or 11-char ID"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Timestamp</Label>
            <Input
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="1:23 or 1h2m3s"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Link style</Label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as LinkStyle)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="short">youtu.be (short)</option>
              <option value="full">youtube.com/watch</option>
              <option value="embed">Embed iframe URL</option>
              <option value="markdown">Markdown link</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <ToolBtn
            onClick={() => {
              setVideoInput(SAMPLE_URL);
              setTimeInput("1:23");
            }}
            icon={<Sparkles className="size-3.5" />}
            label="Sample"
          />
          <ToolBtn
            onClick={() => {
              setVideoInput("");
              setTimeInput("");
            }}
            icon={<Eraser className="size-3.5" />}
            label="Clear"
          />
        </div>
      </section>

      {/* Single link */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Film className="size-4 text-primary" />
          Single timestamp link
        </h2>
        {!video.id ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            Paste a valid YouTube URL or 11-character video ID above.
          </div>
        ) : !Number.isFinite(seconds) ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5" />
            Couldn&apos;t parse the timestamp. Try formats like <code className="font-mono">1:23</code>,
            <code className="font-mono">1:23:45</code>, <code className="font-mono">85s</code> or{" "}
            <code className="font-mono">1h2m3s</code>.
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-border/60 bg-background p-3">
            <div className="break-all font-mono text-xs text-foreground/90">{singleLink}</div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>Jumps to {formatTimestamp(seconds)}</span>
              <span>·</span>
              <Button
                type="button"
                size="sm"
                onClick={() => copy(singleLink, "single")}
              >
                {copied === "single" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                Copy link
              </Button>
              <a
                href={singleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
              >
                <ExternalLink className="size-3" />
                Open
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Chapter list */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Film className="size-4 text-primary" />
            Chapters (YouTube-ready)
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={addChapter}>
            <Plus className="size-3.5" />
            Add chapter
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          YouTube auto-adds chapters when your description starts with timestamps. Required:
          first timestamp must be 0:00, at least 3 chapters, each at least 10 seconds long.
        </p>
        <div className="space-y-2">
          {chapters.map((c, i) => {
            const ok = Number.isFinite(c.seconds);
            return (
              <div
                key={c.id}
                className="grid items-center gap-2 rounded-xl border border-border/60 bg-background p-2 sm:grid-cols-[110px_1fr_auto]"
              >
                <Input
                  value={Number.isFinite(c.seconds) ? formatTimestamp(c.seconds) : ""}
                  onChange={(e) => {
                    const t = parseTimestamp(e.target.value);
                    updateChapter(c.id, { seconds: Number.isFinite(t) ? t : NaN });
                  }}
                  className={cn("font-mono text-sm", !ok && "border-rose-500/50")}
                  placeholder="0:00"
                />
                <Input
                  value={c.label}
                  onChange={(e) => updateChapter(c.id, { label: e.target.value })}
                  placeholder="Chapter label"
                />
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveChapter(c.id, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveChapter(c.id, 1)}
                    disabled={i === chapters.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeChapter(c.id)}
                    aria-label="Remove chapter"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {chaptersOutput.issues.length > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5" />
              YouTube auto-chapter rules:
            </div>
            <ul className="list-disc space-y-0.5 pl-5 list-inside">
              {chaptersOutput.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {chaptersOutput.text && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Panel label="Description (paste into YouTube)" subtitle="plain text">
              <textarea
                value={chaptersOutput.text}
                readOnly
                rows={Math.min(10, Math.max(3, validChapters.length))}
                className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => copy(chaptersOutput.text, "ch-text")}>
                  {copied === "ch-text" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  Copy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(chaptersOutput.text, "chapters.txt")}
                >
                  <Download className="size-3.5" />
                  .txt
                </Button>
              </div>
            </Panel>
            <Panel label="Markdown list (with links)" subtitle="for blog / readme">
              <textarea
                value={chaptersOutput.markdown}
                readOnly
                rows={Math.min(10, Math.max(3, validChapters.length))}
                className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => copy(chaptersOutput.markdown, "ch-md")}>
                  {copied === "ch-md" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  Copy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(chaptersOutput.markdown, "chapters.md")}
                >
                  <Download className="size-3.5" />
                  .md
                </Button>
              </div>
            </Panel>
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Film className="size-3" />
        URL parsing and link composing run entirely in your browser — Toollyz has no server.
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
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
        {subtitle && <span className="text-[10px] text-muted-foreground">{subtitle}</span>}
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
