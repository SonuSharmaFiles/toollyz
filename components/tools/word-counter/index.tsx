"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlignLeft,
  ArrowDownToLine,
  Award,
  Check,
  Clipboard,
  Copy,
  Eraser,
  FileText,
  FileUp,
  Focus,
  Gauge,
  Hash,
  KeyRound,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Save,
  Search,
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
  keywordDensity,
  passiveVoiceCount,
  readability,
  removeDuplicateLines,
  removeExtraSpaces,
  removeLineBreaks,
  repeatedWords,
  toLower,
  toSentenceCase,
  toTitleCase,
  toUpper,
  trimWhitespace,
  type Keyword,
  type ReadBand,
} from "@/lib/tools/text/word-counter";

const TEXT_KEY = "toollyz:wc-text";
const GOAL_KEY = "toollyz:wc-goal";
const DRAFTS_KEY = "toollyz:wc-drafts";

interface Draft {
  id: string;
  preview: string;
  words: number;
  text: string;
  ts: number;
}

const SAMPLE =
  "Great writing is rewriting. Start with a messy first draft, then sharpen every sentence until your ideas shine. Paste or type your text here and watch the live analytics update in real time — word count, reading time, readability and keyword density, all without your text ever leaving your browser.";

const BAND_STYLES: Record<ReadBand, { text: string; bg: string; bar: string }> = {
  easy: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
  medium: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", bar: "bg-amber-500" },
  advanced: { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", bar: "bg-orange-500" },
  professional: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", bar: "bg-rose-500" },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function downloadText(content: string, filename: string, type = "text/plain") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function WordCounter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [goal, setGoal] = React.useState(500);
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [gram, setGram] = React.useState<1 | 2>(1);
  const [search, setSearch] = React.useState("");
  const [highlightRepeated, setHighlightRepeated] = React.useState(false);
  const [focusMode, setFocusMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Session timer
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const sessionStartWords = React.useRef(0);

  const undoStack = React.useRef<string[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const prevWords = React.useRef(0);

  const deferredText = React.useDeferredValue(text);
  const stats = React.useMemo(() => analyzeText(deferredText), [deferredText]);
  const read = React.useMemo(() => readability(deferredText, stats), [deferredText, stats]);
  const keywords = React.useMemo(() => keywordDensity(deferredText, gram), [deferredText, gram]);
  const repeats = React.useMemo(() => repeatedWords(deferredText, 4), [deferredText]);
  const passive = React.useMemo(() => passiveVoiceCount(deferredText), [deferredText]);

  // ── Load persisted ──
  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      if (t) setText(t);
      const g = localStorage.getItem(GOAL_KEY);
      if (g) setGoal(Number(g) || 500);
      const d = localStorage.getItem(DRAFTS_KEY);
      if (d) setDrafts(JSON.parse(d));
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  // ── Auto-save ──
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
      localStorage.setItem(GOAL_KEY, String(goal));
    } catch {
      /* noop */
    }
  }, [goal, mounted]);

  // ── Timer ──
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // ── Fullscreen sync ──
  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ── Goal celebration ──
  React.useEffect(() => {
    if (!mounted) return;
    if (goal > 0 && prevWords.current < goal && stats.words >= goal) {
      toast.success(`🎉 Goal reached — ${goal.toLocaleString()} words!`);
    }
    prevWords.current = stats.words;
  }, [stats.words, goal, mounted]);

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
    if (prev === undefined) {
      toast.error("Nothing to undo");
      return;
    }
    setText(prev);
  }

  function clearAll() {
    if (!text) return;
    pushHistory(text);
    setText("");
    taRef.current?.focus();
  }

  function saveDraft() {
    if (!text.trim()) {
      toast.error("Nothing to save");
      return;
    }
    const draft: Draft = {
      id: uid(),
      preview: text.trim().slice(0, 80),
      words: stats.words,
      text,
      ts: Date.now(),
    };
    const next = [draft, ...drafts].slice(0, 20);
    setDrafts(next);
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
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
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  function toggleTimer() {
    if (!running) sessionStartWords.current = stats.words;
    setRunning((r) => !r);
  }
  function resetTimer() {
    setRunning(false);
    setSeconds(0);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await shellRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
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
      if (content.includes("PK") || isBinary(content)) {
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
      "TEXT ANALYSIS SUMMARY",
      `Generated ${new Date().toLocaleString()} · toollyz.com`,
      "",
      `Words: ${stats.words}`,
      `Characters: ${stats.characters} (no spaces: ${stats.charactersNoSpaces})`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Reading time: ${formatDuration(stats.readingTime)}`,
      `Speaking time: ${formatDuration(stats.speakingTime)}`,
      `Unique words: ${stats.uniqueWords}`,
      `Lexical diversity: ${(stats.lexicalDiversity * 100).toFixed(1)}%`,
      `Avg word length: ${stats.avgWordLength.toFixed(1)} chars`,
      `Avg sentence length: ${stats.avgSentenceLength.toFixed(1)} words`,
      `Longest word: ${stats.longestWord || "—"}`,
      "",
      "READABILITY",
      `Flesch Reading Ease: ${read.fleschReadingEase} (${read.bandLabel})`,
      `Flesch-Kincaid Grade: ${read.fleschKincaidGrade}`,
      `Gunning Fog Index: ${read.gunningFog}`,
      `Education level: ${read.educationLevel}`,
      `Passive voice (est.): ${passive}`,
      "",
      "TOP KEYWORDS",
      ...keywords.map((k, i) => `${i + 1}. ${k.term} — ${k.count}× (${k.percent.toFixed(1)}%)`),
    ].join("\n");
  }

  function exportSummary() {
    if (!text) {
      toast.error("Add some text first");
      return;
    }
    downloadText(summaryText(), "toollyz-text-analysis.txt");
    toast.success("Summary exported");
  }

  function exportPdf() {
    if (!text) {
      toast.error("Add some text first");
      return;
    }
    const rows = (pairs: [string, string][]) =>
      pairs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
    const kw = keywords
      .map((k) => `<li><span>${escapeHtml(k.term)}</span><b>${k.count}× · ${k.percent.toFixed(1)}%</b></li>`)
      .join("");
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) {
      toast.error("Allow pop-ups to export PDF");
      return;
    }
    w.document.write(`<!doctype html><html><head><title>Text Analysis Report</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;padding:40px;max-width:760px;margin:auto}
      h1{font-size:24px;margin-bottom:4px}.sub{color:#64748b;font-size:13px;margin-bottom:24px}
      h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#6366f1;margin:24px 0 10px}
      table{width:100%;border-collapse:collapse}td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:14px}
      td:last-child{text-align:right;font-weight:600}
      ul{list-style:none}li{display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:14px}
      .foot{margin-top:28px;color:#94a3b8;font-size:12px;text-align:center}
      @media print{body{padding:0}}
    </style></head><body>
      <h1>Text Analysis Report</h1>
      <div class="sub">Generated ${new Date().toLocaleString()} · toollyz.com</div>
      <h2>Overview</h2><table>${rows([
        ["Words", String(stats.words)],
        ["Characters", String(stats.characters)],
        ["Characters (no spaces)", String(stats.charactersNoSpaces)],
        ["Sentences", String(stats.sentences)],
        ["Paragraphs", String(stats.paragraphs)],
        ["Reading time", formatDuration(stats.readingTime)],
        ["Speaking time", formatDuration(stats.speakingTime)],
        ["Unique words", String(stats.uniqueWords)],
        ["Lexical diversity", `${(stats.lexicalDiversity * 100).toFixed(1)}%`],
      ])}</table>
      <h2>Readability</h2><table>${rows([
        ["Flesch Reading Ease", `${read.fleschReadingEase} (${read.bandLabel})`],
        ["Flesch-Kincaid Grade", String(read.fleschKincaidGrade)],
        ["Gunning Fog Index", String(read.gunningFog)],
        ["Education level", read.educationLevel],
        ["Passive voice (est.)", String(passive)],
      ])}</table>
      ${kw ? `<h2>Top keywords</h2><ul>${kw}</ul>` : ""}
      <div class="foot">Generated with toollyz.com/tools/word-counter</div>
      <script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
    </body></html>`);
    w.document.close();
  }

  // Highlight terms
  const highlightTerms = React.useMemo(() => {
    const terms: string[] = [];
    if (search.trim()) terms.push(search.trim().toLowerCase());
    if (highlightRepeated) terms.push(...repeats.map((r) => r.term));
    return Array.from(new Set(terms));
  }, [search, highlightRepeated, repeats]);

  const searchMatches = React.useMemo(() => {
    if (!search.trim()) return 0;
    try {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      return (text.match(re) ?? []).length;
    } catch {
      return 0;
    }
  }, [search, text]);

  const goalPct = goal > 0 ? Math.min(100, (stats.words / goal) * 100) : 0;
  const wpm = seconds > 0 ? Math.max(0, Math.round((stats.words - sessionStartWords.current) / (seconds / 60))) : 0;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const editor = (
    <Editor
      taRef={taRef}
      value={text}
      onChange={setText}
      terms={highlightTerms}
      onLoadFile={loadFile}
      placeholder="Start writing or paste your text here…"
      heightClass={focusMode ? "h-[60vh]" : "h-[420px]"}
    />
  );

  return (
    <div ref={shellRef} className={cn("space-y-6", isFullscreen && "overflow-auto bg-background p-6")}>
      {/* ─── Hero stat strip ─────────────────────────────────────── */}
      <section
        aria-label="Live writing statistics"
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-card to-violet-500/10 p-5 sm:p-6"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat icon={<Type className="size-4" />} label="Words" value={stats.words} reduceMotion={!!reduceMotion} primary />
          <HeroStat icon={<Hash className="size-4" />} label="Characters" value={stats.characters} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<Timer className="size-4" />} label="Reading time" text={formatDuration(stats.readingTime)} />
          <HeroStat icon={<Gauge className="size-4" />} label="Readability" text={read.hasEnough ? read.bandLabel : "—"} accent={BAND_STYLES[read.band].text} />
        </div>
      </section>

      {/* ─── Toolbar ─────────────────────────────────────────────── */}
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

      {/* ─── Main grid ───────────────────────────────────────────── */}
      <div className={cn("grid gap-5", !focusMode && "lg:grid-cols-[1fr_360px]")}>
        {/* Editor column */}
        <div className="min-w-0 space-y-4">
          {editor}

          {/* Search / highlight */}
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
            <ToolBtn
              onClick={() => setHighlightRepeated((v) => !v)}
              icon={<Repeat className="size-3.5" />}
              label="Highlight repeats"
              active={highlightRepeated}
            />
          </div>

          {/* Export bar */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyText}><Copy className="size-4" />Copy</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { if (!text) { toast.error("Add some text first"); return; } downloadText(text, "toollyz-text.txt"); toast.success("Text exported"); }}><FileText className="size-4" />TXT</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportSummary}><ArrowDownToLine className="size-4" />Summary</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportPdf}><FileUp className="size-4" />PDF report</Button>
            <Button type="button" variant="outline" size="sm" onClick={saveDraft}><Save className="size-4" />Save draft</Button>
          </div>

          {/* Drafts */}
          {drafts.length > 0 && !focusMode && (
            <DraftsPanel drafts={drafts} onRestore={restoreDraft} onRemove={removeDraft} />
          )}
        </div>

        {/* Analytics column */}
        {!focusMode && (
          <div className="space-y-5">
            <StatsGrid stats={stats} passive={passive} reduceMotion={!!reduceMotion} />
            <ReadabilityCard read={read} reduceMotion={!!reduceMotion} />
            <KeywordPanel keywords={keywords} gram={gram} setGram={setGram} reduceMotion={!!reduceMotion} />
            <ProductivityPanel
              words={stats.words}
              goal={goal}
              setGoal={setGoal}
              goalPct={goalPct}
              running={running}
              seconds={seconds}
              wpm={wpm}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              reduceMotion={!!reduceMotion}
            />
          </div>
        )}
      </div>

      {focusMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-5 py-2 text-sm shadow-lg backdrop-blur">
            <span><b>{stats.words.toLocaleString()}</b> words</span>
            <span className="text-muted-foreground">{stats.characters.toLocaleString()} chars</span>
            <span className="text-muted-foreground">{formatDuration(stats.readingTime)}</span>
            <button type="button" onClick={() => setFocusMode(false)} className="text-primary hover:underline">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Editor (textarea + highlight backdrop) ─────────────────────────────────

const EDITOR_TYPO =
  "w-full whitespace-pre-wrap break-words px-5 py-4 font-sans text-[15px] leading-7";

function Editor({
  taRef,
  value,
  onChange,
  terms,
  onLoadFile,
  placeholder,
  heightClass,
}: {
  taRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  terms: string[];
  onLoadFile: (f: File) => void;
  placeholder: string;
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
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card transition-colors",
        dragOver ? "border-primary ring-2 ring-primary/30" : "border-border/70",
        heightClass,
      )}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onLoadFile(file);
      }}
    >
      <div
        ref={backRef}
        aria-hidden="true"
        className={cn(EDITOR_TYPO, "pointer-events-none absolute inset-0 select-none overflow-hidden text-transparent")}
      >
        {segments.map((seg, i) =>
          seg.hit ? (
            <mark key={i} className="rounded bg-yellow-300/60 text-transparent dark:bg-yellow-400/40">{seg.text}</mark>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
        {"\n"}
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={sync}
        placeholder={placeholder}
        spellCheck
        aria-label="Text editor"
        className={cn(
          EDITOR_TYPO,
          "absolute inset-0 resize-none overflow-auto bg-transparent text-foreground caret-primary outline-none placeholder:text-muted-foreground/60",
        )}
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
      >
        <FileUp className="size-3.5" />
        Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.markdown,.text,.csv,.log,.rtf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onLoadFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

interface Segment { text: string; hit: boolean }

function buildSegments(text: string, terms: string[]): Segment[] {
  if (!terms.length || !text) return [{ text, hit: false }];
  const escaped = terms
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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

// ─── Hero stat ──────────────────────────────────────────────────────────────

function HeroStat({
  icon, label, value, text, primary, accent, reduceMotion,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  text?: string;
  primary?: boolean;
  accent?: string;
  reduceMotion?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className={cn("font-heading font-bold tabular-nums", primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl", accent)}>
        {value !== undefined ? <AnimatedNumber value={value} reduceMotion={!!reduceMotion} /> : text}
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
    if (from === to) {
      setDisplay(to);
      return;
    }
    // Snap instantly when motion is reduced or the tab isn't actively painting
    // (requestAnimationFrame may not fire in background/headless contexts).
    if (
      reduceMotion ||
      typeof document === "undefined" ||
      document.visibilityState !== "visible"
    ) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    const start = performance.now();
    const dur = 350;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    // Guaranteed convergence even if rAF is throttled/never paints.
    const fallback = window.setTimeout(() => {
      setDisplay(to);
      fromRef.current = to;
    }, dur + 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [value, reduceMotion]);

  return <>{display.toLocaleString()}</>;
}

// ─── Stats grid ─────────────────────────────────────────────────────────────

function StatsGrid({
  stats, passive, reduceMotion,
}: {
  stats: ReturnType<typeof analyzeText>;
  passive: number;
  reduceMotion: boolean;
}) {
  const cards: { label: string; value: number; suffix?: string }[] = [
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Unique words", value: stats.uniqueWords },
    { label: "Passive voice", value: passive },
  ];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Detailed statistics">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <AlignLeft className="size-4 text-primary" />
        Statistics
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
            <div className="font-heading text-xl font-bold tabular-nums">
              <AnimatedNumber value={c.value} reduceMotion={reduceMotion} />
            </div>
            <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <Row label="Speaking time" value={formatDuration(stats.speakingTime)} />
        <Row label="Lexical diversity" value={`${(stats.lexicalDiversity * 100).toFixed(0)}%`} />
        <Row label="Avg word length" value={`${stats.avgWordLength.toFixed(1)}`} />
        <Row label="Avg sentence" value={`${stats.avgSentenceLength.toFixed(1)} w`} />
        <Row label="Longest word" value={stats.longestWord || "—"} />
        <Row label="Shortest word" value={stats.shortestWord || "—"} />
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium" title={value}>{value}</span>
    </div>
  );
}

// ─── Readability ────────────────────────────────────────────────────────────

function ReadabilityCard({ read, reduceMotion }: { read: ReturnType<typeof readability>; reduceMotion: boolean }) {
  const style = BAND_STYLES[read.band];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Readability analysis">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Gauge className="size-4 text-primary" />
        Readability
      </h2>
      {!read.hasEnough ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
          Write at least 25 words for an accurate readability score.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", style.bg, style.text)}>
              {read.bandLabel}
            </span>
            <span className="font-heading text-2xl font-bold tabular-nums">{read.fleschReadingEase}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500">
            <div className="relative h-full">
              <motion.span
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow"
                initial={{ left: reduceMotion ? `${read.fleschReadingEase}%` : "0%" }}
                animate={{ left: `${read.fleschReadingEase}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Hard</span><span>Flesch Reading Ease</span><span>Easy</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Metric label="F-K Grade" value={read.fleschKincaidGrade} />
            <Metric label="Gunning Fog" value={read.gunningFog} />
            <Metric label="Level" text={read.educationLevel} />
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value, text }: { label: string; value?: number; text?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-2.5">
      <div className="font-heading text-base font-bold leading-tight tabular-nums">
        {value !== undefined ? value : <span className="text-[11px] font-semibold leading-tight">{text}</span>}
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

// ─── Keyword density ────────────────────────────────────────────────────────

function KeywordPanel({
  keywords, gram, setGram, reduceMotion,
}: {
  keywords: Keyword[];
  gram: 1 | 2;
  setGram: (g: 1 | 2) => void;
  reduceMotion: boolean;
}) {
  const max = keywords[0]?.count ?? 1;
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Keyword density">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <KeyRound className="size-4 text-primary" />
          Keyword density
        </h2>
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
          <SegBtn active={gram === 1} onClick={() => setGram(1)} label="Words" />
          <SegBtn active={gram === 2} onClick={() => setGram(2)} label="Phrases" />
        </div>
      </div>
      {keywords.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
          Keywords appear here as you write.
        </p>
      ) : (
        <ul className="space-y-2 list-none">
          {keywords.map((k) => (
            <li key={k.term}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate font-medium">{k.term}</span>
                <span className="shrink-0 text-muted-foreground">{k.count}× · {k.percent.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn("h-full rounded-full", k.percent > 6 ? "bg-rose-500" : "bg-primary")}
                  initial={{ width: reduceMotion ? `${(k.count / max) * 100}%` : 0 }}
                  animate={{ width: `${(k.count / max) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {keywords.some((k) => k.percent > 6) && (
        <p className="mt-3 text-[11px] text-rose-500">
          ⚠ Some keywords exceed 6% density — consider varying your wording for better SEO.
        </p>
      )}
    </section>
  );
}

// ─── Productivity ───────────────────────────────────────────────────────────

function ProductivityPanel({
  words, goal, setGoal, goalPct, running, seconds, wpm, onToggleTimer, onResetTimer, reduceMotion,
}: {
  words: number;
  goal: number;
  setGoal: (n: number) => void;
  goalPct: number;
  running: boolean;
  seconds: number;
  wpm: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  reduceMotion: boolean;
}) {
  const reached = goal > 0 && words >= goal;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const badges = [
    { id: "w100", label: "100 words", earned: words >= 100 },
    { id: "w500", label: "500 words", earned: words >= 500 },
    { id: "w1k", label: "1,000 words", earned: words >= 1000 },
    { id: "goal", label: "Goal met", earned: reached },
  ];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Writing productivity">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Target className="size-4 text-primary" />
        Productivity
      </h2>

      {/* Goal */}
      <div className="flex items-center gap-3">
        <ProgressRing pct={goalPct} reached={reached} reduceMotion={reduceMotion} />
        <div className="flex-1">
          <label className="text-xs text-muted-foreground" htmlFor="wc-goal">Word goal</label>
          <Input
            id="wc-goal"
            type="number"
            min={0}
            value={goal}
            onChange={(e) => setGoal(Math.max(0, Number(e.target.value)))}
            className="mt-1 h-8 rounded-lg"
          />
          <p className="mt-1 text-xs">
            <b>{words.toLocaleString()}</b>
            <span className="text-muted-foreground"> / {goal.toLocaleString()} ({goalPct.toFixed(0)}%)</span>
          </p>
        </div>
      </div>

      {/* Timer */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background p-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Timer className="size-3.5" />Session</div>
          <div className="font-heading text-xl font-bold tabular-nums">{mm}:{ss}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Typing speed</div>
          <div className="font-heading text-xl font-bold tabular-nums">{wpm} <span className="text-xs font-normal text-muted-foreground">wpm</span></div>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="icon" onClick={onToggleTimer} aria-label={running ? "Pause" : "Start"}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onResetTimer} aria-label="Reset timer">
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Achievements</p>
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                b.earned
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border bg-muted/30 text-muted-foreground/60",
              )}
            >
              {b.earned ? <Award className="size-3" /> : <Award className="size-3 opacity-40" />}
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
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
        <motion.circle
          cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
          className={reached ? "text-emerald-500" : "text-primary"}
          stroke="currentColor" strokeDasharray={c}
          initial={{ strokeDashoffset: reduceMotion ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums">
        {reached ? <Check className="size-5 text-emerald-500" /> : `${Math.round(pct)}%`}
      </span>
    </div>
  );
}

// ─── Drafts ─────────────────────────────────────────────────────────────────

function DraftsPanel({ drafts, onRestore, onRemove }: { drafts: Draft[]; onRestore: (d: Draft) => void; onRemove: (id: string) => void }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Saved drafts">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Clipboard className="size-4 text-primary" />
        Drafts
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{drafts.length}</span>
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 list-none">
        <AnimatePresence initial={false}>
          {drafts.map((d) => (
            <motion.li
              key={d.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-start gap-2 rounded-xl border border-border/60 bg-background p-3"
            >
              <button type="button" onClick={() => onRestore(d)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm">{d.preview || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground">{d.words} words · {new Date(d.ts).toLocaleDateString()}</p>
              </button>
              <button type="button" onClick={() => onRemove(d.id)} aria-label="Delete draft" className="shrink-0 text-muted-foreground hover:text-rose-500">
                <X className="size-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

// ─── Small controls ─────────────────────────────────────────────────────────

function ToolBtn({
  onClick, icon, label, active,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-foreground/80 hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function isBinary(content: string): boolean {
  const sample = content.slice(0, 2000);
  let control = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32)) control++;
  }
  return sample.length > 0 && control / sample.length > 0.05;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
