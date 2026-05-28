"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlignLeft,
  ArrowDownToLine,
  Award,
  BarChart3,
  Check,
  Clipboard,
  Copy,
  Eraser,
  Eye,
  FileText,
  FileUp,
  Focus,
  Gauge,
  Hash,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Save,
  Search,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  analyzeText,
  formatDuration,
  removeDuplicateLines,
  removeExtraSpaces,
  removeLineBreaks,
  toLower,
  toSentenceCase,
  toTitleCase,
  toUpper,
  trimWhitespace,
} from "@/lib/tools/text/word-counter";
import {
  LIMIT_GROUPS,
  PLATFORM_LIMITS,
  charBreakdown,
  mostUsedChars,
  platformStatus,
  type CharFreq,
  type LimitState,
  type PlatformLimit,
} from "@/lib/tools/text/character-counter";

const TEXT_KEY = "toollyz:cc-text";
const TARGET_KEY = "toollyz:cc-target";
const DRAFTS_KEY = "toollyz:cc-drafts";

type Tab = "stats" | "limits" | "previews" | "goals";

interface Draft {
  id: string;
  preview: string;
  chars: number;
  text: string;
  ts: number;
}

const SAMPLE =
  "Master your message in every character. ✨ Whether you're crafting the perfect tweet, an SEO title that ranks, or a caption that converts — count, optimize and preview your text in real time. No fluff, just clarity. #writing #SEO";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n).trimEnd()}…` : s;
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
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const STATE_STYLES: Record<LimitState, { bar: string; text: string }> = {
  empty: { bar: "bg-muted-foreground/30", text: "text-muted-foreground" },
  short: { bar: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  ideal: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  ok: { bar: "bg-primary", text: "text-primary" },
  warn: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  over: { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

export default function CharacterCounter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("stats");
  const [target, setTarget] = React.useState(280);
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [search, setSearch] = React.useState("");
  const [highlightRepeated, setHighlightRepeated] = React.useState(false);
  const [focusMode, setFocusMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const sessionStartChars = React.useRef(0);

  const undoStack = React.useRef<string[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const prevChars = React.useRef(0);

  const deferred = React.useDeferredValue(text);
  const stats = React.useMemo(() => analyzeText(deferred), [deferred]);
  const breakdown = React.useMemo(() => charBreakdown(deferred), [deferred]);
  const topChars = React.useMemo(() => mostUsedChars(deferred, 8), [deferred]);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      if (t) setText(t);
      const tg = localStorage.getItem(TARGET_KEY);
      if (tg) setTarget(Number(tg) || 280);
      const d = localStorage.getItem(DRAFTS_KEY);
      if (d) setDrafts(JSON.parse(d));
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(TEXT_KEY, text);
      } catch {
        /* noop */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TARGET_KEY, String(target));
    } catch {
      /* noop */
    }
  }, [target, mounted]);

  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (target > 0 && prevChars.current < target && breakdown.total >= target) {
      toast.success(`🎯 Target reached — ${target.toLocaleString()} characters!`);
    }
    prevChars.current = breakdown.total;
  }, [breakdown.total, target, mounted]);

  function pushHistory(prev: string) {
    undoStack.current.push(prev);
    if (undoStack.current.length > 50) undoStack.current.shift();
  }
  function apply(fn: (t: string) => string, label: string) {
    if (!text) return;
    pushHistory(text);
    setText(fn(text));
    toast.success(label);
  }
  function undo() {
    const prev = undoStack.current.pop();
    if (prev === undefined) { toast.error("Nothing to undo"); return; }
    setText(prev);
  }
  function clearAll() {
    if (!text) return;
    pushHistory(text);
    setText("");
    taRef.current?.focus();
  }

  function saveDraft() {
    if (!text.trim()) { toast.error("Nothing to save"); return; }
    const draft: Draft = { id: uid(), preview: text.trim().slice(0, 80), chars: breakdown.total, text, ts: Date.now() };
    const next = [draft, ...drafts].slice(0, 20);
    setDrafts(next);
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); } catch { /* noop */ }
    toast.success("Draft saved");
  }
  function restoreDraft(d: Draft) {
    pushHistory(text);
    setText(d.text);
    toast.success("Draft restored");
  }
  function removeDraft(id: string) {
    const next = drafts.filter((d) => d.id !== id);
    setDrafts(next);
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  function toggleTimer() {
    if (!running) sessionStartChars.current = breakdown.total;
    setRunning((r) => !r);
  }
  function resetTimer() {
    setRunning(false);
    setSeconds(0);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await shellRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast.error("Fullscreen unavailable");
    }
  }

  async function loadFile(file: File) {
    if (/\.(docx?|pages|odt)$/i.test(file.name)) {
      toast.error("Word docs aren't supported — paste the text or upload a .txt file");
      return;
    }
    try {
      let content = await file.text();
      if (content.includes("PK") || isBinary(content)) {
        toast.error("That file isn't plain text. Try a .txt or .md file.");
        return;
      }
      if (/\.rtf$/i.test(file.name)) {
        content = content
          .replace(/\\par[d]?/g, "\n")
          .replace(/\{\\[^{}]*\}/g, "")
          .replace(/\\[a-z]+-?\d* ?/gi, "")
          .replace(/[{}]/g, "")
          .trim();
      }
      pushHistory(text);
      setText(content);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Could not read the file");
    }
  }

  async function copyText() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function summaryText(): string {
    return [
      "CHARACTER ANALYSIS SUMMARY",
      `Generated ${new Date().toLocaleString()} · toollyz.com`,
      "",
      `Characters: ${breakdown.total}`,
      `Characters (no spaces): ${breakdown.noSpaces}`,
      `Words: ${stats.words}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Spaces: ${breakdown.spaces}`,
      `Bytes (UTF-8): ${breakdown.bytes}`,
      `Reading time: ${formatDuration(stats.readingTime)}`,
      `Speaking time: ${formatDuration(stats.speakingTime)}`,
      "",
      "CHARACTER BREAKDOWN",
      `Letters: ${breakdown.letters} (${breakdown.uppercase} upper / ${breakdown.lowercase} lower)`,
      `Digits: ${breakdown.digits}`,
      `Punctuation: ${breakdown.punctuation}`,
      `Symbols: ${breakdown.symbols}`,
      `Emoji: ${breakdown.emoji}`,
      "",
      "PLATFORM LIMITS",
      ...PLATFORM_LIMITS.map((p) => {
        const s = platformStatus(breakdown.total, p);
        return `${p.label}: ${breakdown.total}/${p.limit} (${s.remaining >= 0 ? `${s.remaining} left` : `${-s.remaining} over`})`;
      }),
    ].join("\n");
  }

  function exportSummary() {
    if (!text) { toast.error("Add some text first"); return; }
    downloadText(summaryText(), "toollyz-character-analysis.txt");
    toast.success("Summary exported");
  }

  function exportPdf() {
    if (!text) { toast.error("Add some text first"); return; }
    const rows = (pairs: [string, string][]) =>
      pairs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
    const limitRows = PLATFORM_LIMITS.map((p) => {
      const s = platformStatus(breakdown.total, p);
      const status = s.remaining >= 0 ? `${s.remaining} left` : `${-s.remaining} over`;
      return `<tr><td>${escapeHtml(p.label)}</td><td>${breakdown.total} / ${p.limit} — ${status}</td></tr>`;
    }).join("");
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) { toast.error("Allow pop-ups to export PDF"); return; }
    w.document.write(`<!doctype html><html><head><title>Character Analysis Report</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;padding:40px;max-width:760px;margin:auto}
      h1{font-size:24px;margin-bottom:4px}.sub{color:#64748b;font-size:13px;margin-bottom:24px}
      h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#6366f1;margin:24px 0 10px}
      table{width:100%;border-collapse:collapse}td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:14px}
      td:last-child{text-align:right;font-weight:600}
      .foot{margin-top:28px;color:#94a3b8;font-size:12px;text-align:center}
      @media print{body{padding:0}}
    </style></head><body>
      <h1>Character Analysis Report</h1>
      <div class="sub">Generated ${new Date().toLocaleString()} · toollyz.com</div>
      <h2>Overview</h2><table>${rows([
        ["Characters", String(breakdown.total)],
        ["Characters (no spaces)", String(breakdown.noSpaces)],
        ["Words", String(stats.words)],
        ["Sentences", String(stats.sentences)],
        ["Lines", String(stats.lines)],
        ["Spaces", String(breakdown.spaces)],
        ["Bytes (UTF-8)", String(breakdown.bytes)],
        ["Reading time", formatDuration(stats.readingTime)],
      ])}</table>
      <h2>Character breakdown</h2><table>${rows([
        ["Letters", `${breakdown.letters} (${breakdown.uppercase} upper / ${breakdown.lowercase} lower)`],
        ["Digits", String(breakdown.digits)],
        ["Punctuation", String(breakdown.punctuation)],
        ["Symbols", String(breakdown.symbols)],
        ["Emoji", String(breakdown.emoji)],
      ])}</table>
      <h2>Platform limits</h2><table>${limitRows}</table>
      <div class="foot">Generated with toollyz.com/tools/character-counter</div>
      <script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
    </body></html>`);
    w.document.close();
  }

  const highlightTerms = React.useMemo(() => {
    const terms: string[] = [];
    if (search.trim()) terms.push(search.trim().toLowerCase());
    if (highlightRepeated) {
      const re = /[A-Za-z']{2,}/g;
      const counts = new Map<string, number>();
      for (const w of (deferred.toLowerCase().match(re) ?? [])) counts.set(w, (counts.get(w) ?? 0) + 1);
      for (const [w, c] of counts) if (c >= 4) terms.push(w);
    }
    return Array.from(new Set(terms));
  }, [search, highlightRepeated, deferred]);

  const searchMatches = React.useMemo(() => {
    if (!search.trim()) return 0;
    try {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      return (text.match(re) ?? []).length;
    } catch {
      return 0;
    }
  }, [search, text]);

  const targetPct = target > 0 ? Math.min(100, (breakdown.total / target) * 100) : 0;
  const cpm = seconds > 0 ? Math.max(0, Math.round((breakdown.total - sessionStartChars.current) / (seconds / 60))) : 0;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div ref={shellRef} className={cn("space-y-6", isFullscreen && "overflow-auto bg-background p-6")}>
      {/* Hero */}
      <section
        aria-label="Live character statistics"
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-card to-violet-500/10 p-5 sm:p-6"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat icon={<Type className="size-4" />} label="Characters" value={breakdown.total} reduceMotion={!!reduceMotion} primary />
          <HeroStat icon={<Hash className="size-4" />} label="No spaces" value={breakdown.noSpaces} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<AlignLeft className="size-4" />} label="Words" value={stats.words} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<BarChart3 className="size-4" />} label="Bytes" value={breakdown.bytes} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => apply(removeExtraSpaces, "Extra spaces removed")} icon={<Eraser className="size-3.5" />} label="Spaces" />
        <ToolBtn onClick={() => apply(removeLineBreaks, "Line breaks removed")} icon={<AlignLeft className="size-3.5" />} label="Line breaks" />
        <ToolBtn onClick={() => apply(removeDuplicateLines, "Duplicate lines removed")} icon={<Repeat className="size-3.5" />} label="Dupes" />
        <ToolBtn onClick={() => apply(trimWhitespace, "Whitespace trimmed")} icon={<Eraser className="size-3.5" />} label="Trim" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={() => apply(toUpper, "UPPERCASE")} label="AA" />
        <ToolBtn onClick={() => apply(toLower, "lowercase")} label="aa" />
        <ToolBtn onClick={() => apply(toTitleCase, "Title Case")} label="Aa" />
        <ToolBtn onClick={() => apply(toSentenceCase, "Sentence case")} label="Ab" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={undo} icon={<Undo2 className="size-3.5" />} label="Undo" />
        <ToolBtn onClick={clearAll} icon={<Trash2 className="size-3.5" />} label="Clear" />
        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
          <ToolBtn onClick={() => setFocusMode((f) => !f)} icon={<Focus className="size-3.5" />} label={focusMode ? "Exit focus" : "Focus"} active={focusMode} />
          <ToolBtn onClick={toggleFullscreen} icon={isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />} label="Fullscreen" />
        </div>
      </div>

      {/* Main grid */}
      <div className={cn("grid gap-5", !focusMode && "lg:grid-cols-[1fr_380px]")}>
        <div className="min-w-0 space-y-4">
          <Editor
            taRef={taRef}
            value={text}
            onChange={setText}
            terms={highlightTerms}
            onLoadFile={loadFile}
            heightClass={focusMode ? "h-[60vh]" : "h-[420px]"}
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search & highlight in text…"
                className="rounded-lg pl-9"
                aria-label="Search within text"
              />
              {search.trim() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  {searchMatches} match{searchMatches === 1 ? "" : "es"}
                </span>
              )}
            </div>
            <ToolBtn onClick={() => setHighlightRepeated((v) => !v)} icon={<Repeat className="size-3.5" />} label="Highlight repeats" active={highlightRepeated} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyText}><Copy className="size-4" />Copy</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { if (!text) { toast.error("Add some text first"); return; } downloadText(text, "toollyz-text.txt"); toast.success("Text exported"); }}><FileText className="size-4" />TXT</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportSummary}><ArrowDownToLine className="size-4" />Summary</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportPdf}><FileUp className="size-4" />PDF report</Button>
            <Button type="button" variant="outline" size="sm" onClick={saveDraft}><Save className="size-4" />Save draft</Button>
          </div>

          {drafts.length > 0 && !focusMode && (
            <DraftsPanel drafts={drafts} onRestore={restoreDraft} onRemove={removeDraft} />
          )}
        </div>

        {!focusMode && (
          <div className="space-y-4">
            <div className="flex gap-1 rounded-xl border border-border/70 bg-card p-1">
              <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={<BarChart3 className="size-4" />} label="Stats" />
              <TabBtn active={tab === "limits"} onClick={() => setTab("limits")} icon={<Gauge className="size-4" />} label="Limits" />
              <TabBtn active={tab === "previews"} onClick={() => setTab("previews")} icon={<Eye className="size-4" />} label="Preview" />
              <TabBtn active={tab === "goals"} onClick={() => setTab("goals")} icon={<Target className="size-4" />} label="Goals" />
            </div>

            <motion.div
              key={tab}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "stats" && (
                <StatsTab stats={stats} breakdown={breakdown} topChars={topChars} reduceMotion={!!reduceMotion} />
              )}
              {tab === "limits" && <LimitsTab count={breakdown.total} reduceMotion={!!reduceMotion} />}
              {tab === "previews" && <PreviewsTab text={text} count={breakdown.total} />}
              {tab === "goals" && (
                <GoalsTab
                  chars={breakdown.total}
                  target={target}
                  setTarget={setTarget}
                  targetPct={targetPct}
                  running={running}
                  seconds={seconds}
                  cpm={cpm}
                  onToggleTimer={toggleTimer}
                  onResetTimer={resetTimer}
                  reduceMotion={!!reduceMotion}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>

      {focusMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-5 py-2 text-sm shadow-lg backdrop-blur">
            <span><b>{breakdown.total.toLocaleString()}</b> chars</span>
            <span className="text-muted-foreground">{stats.words.toLocaleString()} words</span>
            <span className="text-muted-foreground">{breakdown.noSpaces.toLocaleString()} no spaces</span>
            <button type="button" onClick={() => setFocusMode(false)} className="text-primary hover:underline">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats tab ──────────────────────────────────────────────────────────────

function StatsTab({
  stats, breakdown, topChars, reduceMotion,
}: {
  stats: ReturnType<typeof analyzeText>;
  breakdown: ReturnType<typeof charBreakdown>;
  topChars: CharFreq[];
  reduceMotion: boolean;
}) {
  const cards = [
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Spaces", value: breakdown.spaces },
    { label: "Letters", value: breakdown.letters },
    { label: "Digits", value: breakdown.digits },
    { label: "Punctuation", value: breakdown.punctuation },
    { label: "Emoji", value: breakdown.emoji },
  ];
  const totalCase = breakdown.uppercase + breakdown.lowercase;
  const upperPct = totalCase ? (breakdown.uppercase / totalCase) * 100 : 0;
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <BarChart3 className="size-4 text-primary" />Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
              <div className="font-heading text-lg font-bold tabular-nums">
                <AnimatedNumber value={c.value} reduceMotion={reduceMotion} />
              </div>
              <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <Row label="Reading time" value={formatDuration(stats.readingTime)} />
          <Row label="Speaking time" value={formatDuration(stats.speakingTime)} />
          <Row label="Unique words" value={String(stats.uniqueWords)} />
          <Row label="Avg word length" value={stats.avgWordLength.toFixed(1)} />
          <Row label="Longest word" value={stats.longestWord || "—"} />
          <Row label="Symbols" value={String(breakdown.symbols)} />
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Uppercase vs lowercase</h2>
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: reduceMotion ? `${upperPct}%` : 0 }}
            animate={{ width: `${upperPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{breakdown.uppercase} upper ({upperPct.toFixed(0)}%)</span>
          <span>{breakdown.lowercase} lower</span>
        </div>
      </section>

      {topChars.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Hash className="size-4 text-primary" />Most used characters
          </h2>
          <div className="flex flex-wrap gap-2">
            {topChars.map((c) => (
              <div key={c.char} className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
                <span className="grid size-6 place-items-center rounded bg-primary/10 font-mono text-sm font-bold text-primary">{c.char}</span>
                <span className="text-xs font-medium tabular-nums">{c.count}</span>
                <span className="text-[10px] text-muted-foreground">{c.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Limits tab ─────────────────────────────────────────────────────────────

function LimitsTab({ count, reduceMotion }: { count: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-4">
      {LIMIT_GROUPS.map((group) => {
        const items = PLATFORM_LIMITS.filter((p) => p.group === group);
        return (
          <section key={group} className="rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold tracking-tight">{group}</h2>
            <ul className="space-y-3 list-none">
              {items.map((p) => (
                <LimitRow key={p.id} p={p} count={count} reduceMotion={reduceMotion} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function LimitRow({ p, count, reduceMotion }: { p: PlatformLimit; count: number; reduceMotion: boolean }) {
  const s = platformStatus(count, p);
  const style = STATE_STYLES[s.state];
  const label =
    s.state === "over"
      ? `${-s.remaining} over`
      : s.state === "empty"
        ? `${p.limit} max`
        : `${s.remaining} left`;
  return (
    <li>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{p.label}</span>
        <span className={cn("font-semibold tabular-nums", style.text)}>
          {count}/{p.limit}
          {p.id === "sms" && s.segments ? ` · ${s.segments} SMS` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", style.bar)}
          initial={{ width: reduceMotion ? `${s.pct}%` : 0 }}
          animate={{ width: `${s.pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={cn("text-[11px]", style.text)}>
          {s.state === "ideal" && "✓ Ideal length"}
          {s.state === "over" && "⚠ Over limit"}
          {s.state === "warn" && "Approaching limit"}
          {(s.state === "ok" || s.state === "short" || s.state === "empty") && (p.note ?? "")}
        </span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
    </li>
  );
}

// ─── Previews tab ───────────────────────────────────────────────────────────

function PreviewsTab({ text, count }: { text: string; count: number }) {
  const lines = text.split("\n");
  const title = (lines[0] || "Your page title").trim();
  const desc = (lines.slice(1).join(" ").trim() || text).trim();
  const empty = !text.trim();

  if (empty) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
        Start typing to see live platform previews
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Twitter / X */}
      <PreviewCard label="Twitter / X" over={count > 280}>
        <div className="flex gap-2.5">
          <span className="size-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-bold">You</span>
              <span className="text-muted-foreground">@you · now</span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-snug">{truncate(text, 280)}</p>
          </div>
        </div>
      </PreviewCard>

      {/* Instagram */}
      <PreviewCard label="Instagram caption">
        <div className="text-sm leading-snug">
          <span className="font-semibold">you</span>{" "}
          <span className="whitespace-pre-wrap break-words">
            {truncate(text, 125)}
            {text.length > 125 && <span className="text-muted-foreground"> more</span>}
          </span>
        </div>
      </PreviewCard>

      {/* Google SERP */}
      <PreviewCard label="Google result">
        <div className="space-y-0.5">
          <div className="text-xs text-emerald-700 dark:text-emerald-400">toollyz.com › your-page</div>
          <div className="truncate text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8]">{truncate(title, 60)}</div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{truncate(desc, 160)}</p>
        </div>
      </PreviewCard>

      {/* LinkedIn */}
      <PreviewCard label="LinkedIn post">
        <div className="flex gap-2.5">
          <span className="size-9 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">You</div>
            <div className="text-[11px] text-muted-foreground">Your headline · now</div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-snug">
              {truncate(text, 210)}
              {text.length > 210 && <span className="text-muted-foreground"> …see more</span>}
            </p>
          </div>
        </div>
      </PreviewCard>

      {/* SMS */}
      <PreviewCard label="SMS message">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 shrink-0 text-muted-foreground" />
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
            <span className="whitespace-pre-wrap break-words">{truncate(text, 320)}</span>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {count <= 160 ? "1 SMS" : `${Math.ceil(count / 153)} SMS segments`} · {count} chars
        </p>
      </PreviewCard>
    </div>
  );
}

function PreviewCard({ label, over, children }: { label: string; over?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-4", over ? "border-rose-400/40" : "border-border/70")}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {over && <span className="text-[10px] font-semibold text-rose-500">Over limit</span>}
      </div>
      {children}
    </section>
  );
}

// ─── Goals tab ──────────────────────────────────────────────────────────────

function GoalsTab({
  chars, target, setTarget, targetPct, running, seconds, cpm, onToggleTimer, onResetTimer, reduceMotion,
}: {
  chars: number;
  target: number;
  setTarget: (n: number) => void;
  targetPct: number;
  running: boolean;
  seconds: number;
  cpm: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  reduceMotion: boolean;
}) {
  const reached = target > 0 && chars >= target;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const badges = [
    { id: "c100", label: "100 chars", earned: chars >= 100 },
    { id: "tweet", label: "Tweet-ready", earned: chars > 0 && chars <= 280 },
    { id: "c500", label: "500 chars", earned: chars >= 500 },
    { id: "target", label: "Target met", earned: reached },
  ];
  const presets = [160, 280, 2200];
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Target className="size-4 text-primary" />Character target
        </h2>
        <div className="flex items-center gap-3">
          <ProgressRing pct={targetPct} reached={reached} reduceMotion={reduceMotion} />
          <div className="flex-1">
            <label className="text-xs text-muted-foreground" htmlFor="cc-target">Target</label>
            <Input id="cc-target" type="number" min={0} value={target} onChange={(e) => setTarget(Math.max(0, Number(e.target.value)))} className="mt-1 h-8 rounded-lg" />
            <p className="mt-1 text-xs"><b>{chars.toLocaleString()}</b><span className="text-muted-foreground"> / {target.toLocaleString()} ({targetPct.toFixed(0)}%)</span></p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {presets.map((p) => (
            <button key={p} type="button" onClick={() => setTarget(p)} className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-muted">
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Timer className="size-3.5" />Session</div>
            <div className="font-heading text-xl font-bold tabular-nums">{mm}:{ss}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Typing speed</div>
            <div className="font-heading text-xl font-bold tabular-nums">{cpm} <span className="text-xs font-normal text-muted-foreground">cpm</span></div>
          </div>
          <div className="flex gap-1">
            <Button type="button" variant="outline" size="icon" onClick={onToggleTimer} aria-label={running ? "Pause" : "Start"}>
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onResetTimer} aria-label="Reset timer"><RotateCcw className="size-4" /></Button>
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Achievements</p>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span key={b.id} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", b.earned ? "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-border bg-muted/30 text-muted-foreground/60")}>
                <Award className={cn("size-3", !b.earned && "opacity-40")} />{b.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Editor (textarea + highlight backdrop) ─────────────────────────────────

const EDITOR_TYPO = "w-full whitespace-pre-wrap break-words px-5 py-4 font-sans text-[15px] leading-7";

function Editor({
  taRef, value, onChange, terms, onLoadFile, heightClass,
}: {
  taRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  terms: string[];
  onLoadFile: (f: File) => void;
  heightClass: string;
}) {
  const backRef = React.useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const segments = React.useMemo(() => buildSegments(value, terms), [value, terms]);

  function sync() {
    if (backRef.current && taRef.current) {
      backRef.current.scrollTop = taRef.current.scrollTop;
      backRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border bg-card transition-colors", dragOver ? "border-primary ring-2 ring-primary/30" : "border-border/70", heightClass)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onLoadFile(f); }}
    >
      <div ref={backRef} aria-hidden="true" className={cn(EDITOR_TYPO, "pointer-events-none absolute inset-0 select-none overflow-hidden text-transparent")}>
        {segments.map((seg, i) => seg.hit ? <mark key={i} className="rounded bg-yellow-300/60 text-transparent dark:bg-yellow-400/40">{seg.text}</mark> : <span key={i}>{seg.text}</span>)}
        {"\n"}
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={sync}
        placeholder="Start typing or paste your text here…"
        spellCheck
        aria-label="Text editor"
        className={cn(EDITOR_TYPO, "absolute inset-0 resize-none overflow-auto bg-transparent text-foreground caret-primary outline-none placeholder:text-muted-foreground/60")}
      />
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-card/80 text-sm font-medium text-primary">
          <span className="flex items-center gap-2"><FileUp className="size-5" />Drop your text file</span>
        </div>
      )}
      <FileInputCorner onLoadFile={onLoadFile} />
    </div>
  );
}

function FileInputCorner({ onLoadFile }: { onLoadFile: (f: File) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground">
        <FileUp className="size-3.5" />Upload
      </button>
      <input ref={inputRef} type="file" accept=".txt,.md,.markdown,.text,.csv,.log,.rtf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onLoadFile(f); e.target.value = ""; }} />
    </>
  );
}

interface Segment { text: string; hit: boolean }
function buildSegments(text: string, terms: string[]): Segment[] {
  if (!terms.length || !text) return [{ text, hit: false }];
  const escaped = terms.filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escaped.length) return [{ text, hit: false }];
  let re: RegExp;
  try {
    re = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  } catch {
    return [{ text, hit: false }];
  }
  const segs: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ text: text.slice(last, m.index), hit: false });
    segs.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (last < text.length) segs.push({ text: text.slice(last), hit: false });
  return segs;
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function HeroStat({ icon, label, value, primary, reduceMotion }: { icon: React.ReactNode; label: string; value: number; primary?: boolean; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-primary">{icon}</span>{label}
      </div>
      <div className={cn("font-heading font-bold tabular-nums", primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function AnimatedNumber({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  React.useEffect(() => {
    const to = value;
    const from = fromRef.current;
    if (from === to) { setDisplay(to); return; }
    if (reduceMotion || typeof document === "undefined" || document.visibilityState !== "visible") {
      setDisplay(to); fromRef.current = to; return;
    }
    const start = performance.now();
    const dur = 350;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick); else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    const fallback = window.setTimeout(() => { setDisplay(to); fromRef.current = to; }, dur + 120);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(fallback); };
  }, [value, reduceMotion]);
  return <>{display.toLocaleString()}</>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium" title={value}>{value}</span>
    </div>
  );
}

function ProgressRing({ pct, reached, reduceMotion }: { pct: number; reached: boolean; reduceMotion: boolean }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
        <motion.circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className={reached ? "text-emerald-500" : "text-primary"} stroke="currentColor" strokeDasharray={c} initial={{ strokeDashoffset: reduceMotion ? offset : c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums">{reached ? <Check className="size-5 text-emerald-500" /> : `${Math.round(pct)}%`}</span>
    </div>
  );
}

function DraftsPanel({ drafts, onRestore, onRemove }: { drafts: Draft[]; onRestore: (d: Draft) => void; onRemove: (id: string) => void }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Saved drafts">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Clipboard className="size-4 text-primary" />Drafts
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{drafts.length}</span>
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 list-none">
        <AnimatePresence initial={false}>
          {drafts.map((d) => (
            <motion.li key={d.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex items-start gap-2 rounded-xl border border-border/60 bg-background p-3">
              <button type="button" onClick={() => onRestore(d)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm">{d.preview || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground">{d.chars} chars · {new Date(d.ts).toLocaleDateString()}</p>
              </button>
              <button type="button" onClick={() => onRemove(d.id)} aria-label="Delete draft" className="shrink-0 text-muted-foreground hover:text-rose-500"><X className="size-3.5" /></button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

function ToolBtn({ onClick, icon, label, active }: { onClick: () => void; icon?: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:bg-muted")}>
      {icon}{label}
    </button>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>
      {icon}{label}
    </button>
  );
}

function isBinary(content: string): boolean {
  const sample = content.slice(0, 2000);
  let control = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32)) control++;
  }
  return sample.length > 0 && control / sample.length > 0.05;
}
