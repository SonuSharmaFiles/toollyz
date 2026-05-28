"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlignLeft,
  ArrowDownToLine,
  ArrowDownUp,
  ArrowRightLeft,
  Check,
  Clock,
  Copy,
  Eraser,
  FileText,
  FileUp,
  Focus,
  Hash,
  Maximize2,
  Minimize2,
  Repeat,
  Search,
  Sparkles,
  Star,
  Trash2,
  Type,
  Undo2,
  Wand2,
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
  trimWhitespace,
} from "@/lib/tools/text/word-counter";
import {
  CASES,
  CASE_BY_ID,
  DEVELOPER_CASE_IDS,
  convertCase,
  normalizeSpacing,
  removeSpecialChars,
  reverseText,
  sortLines,
  type CaseDef,
  type CaseGroup,
} from "@/lib/tools/text/case-converter";

const TEXT_KEY = "toollyz:case-text";
const ACTIVE_KEY = "toollyz:case-active";
const FAV_KEY = "toollyz:case-favs";
const HISTORY_KEY = "toollyz:case-history";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
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

export default function CaseConverter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [activeCase, setActiveCase] = React.useState("title");
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [highlightRepeated, setHighlightRepeated] = React.useState(false);
  const [focusMode, setFocusMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const undoStack = React.useRef<string[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);

  const deferred = React.useDeferredValue(text);
  const stats = React.useMemo(() => analyzeText(deferred), [deferred]);
  const converted = React.useMemo(() => convertCase(text, activeCase), [text, activeCase]);
  const activeDef = CASE_BY_ID[activeCase] ?? CASES[0];

  const sampleSource = React.useMemo(() => {
    const t = deferred.trim();
    if (!t) return SAMPLE;
    return t.split(/\s+/).slice(0, 5).join(" ");
  }, [deferred]);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      if (t) setText(t);
      const a = localStorage.getItem(ACTIVE_KEY);
      if (a && CASE_BY_ID[a]) setActiveCase(a);
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
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
      localStorage.setItem(ACTIVE_KEY, activeCase);
    } catch {
      /* noop */
    }
  }, [activeCase, mounted]);

  // Auto-save distinct source snapshots to history (debounced)
  React.useEffect(() => {
    if (!mounted) return;
    const t = text.trim();
    if (t.length < 8) return;
    const id = window.setTimeout(() => {
      setHistory((prev) => {
        if (prev[0] === t) return prev;
        const next = [t, ...prev.filter((x) => x !== t)].slice(0, 8);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    }, 1500);
    return () => window.clearTimeout(id);
  }, [text, mounted]);

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function pushHistory(prev: string) {
    undoStack.current.push(prev);
    if (undoStack.current.length > 50) undoStack.current.shift();
  }
  function applyUtil(fn: (t: string) => string, label: string) {
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

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }

  function applyConvertedToSource() {
    if (!converted) return;
    pushHistory(text);
    setText(converted);
    toast.success(`Applied ${activeDef.label}`);
  }

  async function copyConverted() {
    if (!converted) { toast.error("Nothing to copy"); return; }
    try {
      await navigator.clipboard.writeText(converted);
      toast.success(`Copied ${activeDef.label}`);
    } catch {
      toast.error("Could not copy");
    }
  }

  function shareConverted() {
    if (!converted) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ text: converted }).catch(() => {});
    } else {
      copyConverted();
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

  const highlightTerms = React.useMemo(() => {
    const terms: string[] = [];
    if (search.trim()) terms.push(search.trim().toLowerCase());
    if (highlightRepeated) {
      const counts = new Map<string, number>();
      for (const w of (deferred.toLowerCase().match(/[a-z']{2,}/g) ?? [])) counts.set(w, (counts.get(w) ?? 0) + 1);
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

  const writingCases = CASES.filter((c) => c.group === "Writing");
  const developerCases = CASES.filter((c) => c.group === "Developer");
  const favCases = favorites.map((id) => CASE_BY_ID[id]).filter(Boolean) as CaseDef[];

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div ref={shellRef} className={cn("space-y-6", isFullscreen && "overflow-auto bg-background p-6")}>
      {/* Hero */}
      <section
        aria-label="Live text statistics"
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-card to-violet-500/10 p-5 sm:p-6"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat icon={<Type className="size-4" />} label="Characters" value={stats.characters} reduceMotion={!!reduceMotion} primary />
          <HeroStat icon={<AlignLeft className="size-4" />} label="Words" value={stats.words} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<Hash className="size-4" />} label="Lines" value={stats.lines} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Wand2 className="size-4 text-primary" />Active case
            </div>
            <div className="truncate font-heading text-xl font-bold sm:text-2xl">{activeDef.label}</div>
          </div>
        </div>
      </section>

      {/* Utilities toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => applyUtil(reverseText, "Text reversed")} icon={<ArrowRightLeft className="size-3.5" />} label="Reverse" />
        <ToolBtn onClick={() => applyUtil((t) => sortLines(t, "asc"), "Lines sorted A→Z")} icon={<ArrowDownUp className="size-3.5" />} label="Sort A→Z" />
        <ToolBtn onClick={() => applyUtil(removeSpecialChars, "Special characters removed")} icon={<Eraser className="size-3.5" />} label="Strip symbols" />
        <ToolBtn onClick={() => applyUtil(normalizeSpacing, "Spacing normalized")} icon={<Sparkles className="size-3.5" />} label="Normalize" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={() => applyUtil(removeExtraSpaces, "Extra spaces removed")} icon={<Eraser className="size-3.5" />} label="Spaces" />
        <ToolBtn onClick={() => applyUtil(removeLineBreaks, "Line breaks removed")} icon={<AlignLeft className="size-3.5" />} label="Line breaks" />
        <ToolBtn onClick={() => applyUtil(removeDuplicateLines, "Duplicate lines removed")} icon={<Repeat className="size-3.5" />} label="Dupes" />
        <ToolBtn onClick={() => applyUtil(trimWhitespace, "Whitespace trimmed")} icon={<Eraser className="size-3.5" />} label="Trim" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={undo} icon={<Undo2 className="size-3.5" />} label="Undo" />
        <ToolBtn onClick={clearAll} icon={<Trash2 className="size-3.5" />} label="Clear" />
        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
          <ToolBtn onClick={() => setFocusMode((f) => !f)} icon={<Focus className="size-3.5" />} label={focusMode ? "Exit focus" : "Focus"} active={focusMode} />
          <ToolBtn onClick={toggleFullscreen} icon={isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />} label="Fullscreen" />
        </div>
      </div>

      <div className={cn("grid gap-5", !focusMode && "lg:grid-cols-[1fr_360px]")}>
        {/* Left: editor + converted */}
        <div className="min-w-0 space-y-4">
          <div>
            <PanelLabel>Original</PanelLabel>
            <Editor taRef={taRef} value={text} onChange={setText} terms={highlightTerms} onLoadFile={loadFile} heightClass={focusMode ? "h-[42vh]" : "h-[260px]"} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <PanelLabel>
                Converted · <span className="text-primary">{activeDef.label}</span>
              </PanelLabel>
              <SeoChips length={converted.length} />
            </div>
            <ConvertedOutput
              value={converted}
              onCopy={copyConverted}
              onApply={applyConvertedToSource}
              reduceMotion={!!reduceMotion}
              heightClass={focusMode ? "h-[42vh]" : "h-[260px]"}
            />
          </div>

          {/* search + export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search & highlight in source…" className="rounded-lg pl-9" aria-label="Search within text" />
              {search.trim() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  {searchMatches} match{searchMatches === 1 ? "" : "es"}
                </span>
              )}
            </div>
            <ToolBtn onClick={() => setHighlightRepeated((v) => !v)} icon={<Repeat className="size-3.5" />} label="Highlight repeats" active={highlightRepeated} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copyConverted}><Copy className="size-4" />Copy result</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { if (!converted) { toast.error("Nothing to export"); return; } downloadText(converted, `toollyz-${activeCase}.txt`); toast.success("Downloaded"); }}><FileText className="size-4" />Download TXT</Button>
            <Button type="button" variant="outline" size="sm" onClick={shareConverted}><ArrowDownToLine className="size-4" />Share</Button>
            <Button type="button" variant="outline" size="sm" onClick={applyConvertedToSource}><Wand2 className="size-4" />Apply to source</Button>
          </div>

          {!focusMode && <DevFormatsCard source={deferred} sample={sampleSource} />}
          {!focusMode && history.length > 0 && (
            <HistoryRow history={history} onRestore={(t) => { pushHistory(text); setText(t); toast.success("Restored"); }} onClear={() => { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ } }} />
          )}
        </div>

        {/* Right: conversion grid + analytics */}
        {!focusMode && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Wand2 className="size-4 text-primary" />Convert to
              </h2>

              {favCases.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Star className="size-3 fill-amber-400 text-amber-400" />Favorites
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {favCases.map((c) => (
                      <CaseButton key={c.id} def={c} active={activeCase === c.id} preview={convertCase(sampleSource, c.id)} fav onPick={() => setActiveCase(c.id)} onFav={() => toggleFav(c.id)} />
                    ))}
                  </div>
                </div>
              )}

              <CaseGroupBlock title="Writing" cases={writingCases} activeCase={activeCase} favorites={favorites} sample={sampleSource} onPick={setActiveCase} onFav={toggleFav} />
              <div className="mt-3">
                <CaseGroupBlock title="Developer" cases={developerCases} activeCase={activeCase} favorites={favorites} sample={sampleSource} onPick={setActiveCase} onFav={toggleFav} />
              </div>
            </section>

            <AnalyticsCard stats={stats} reduceMotion={!!reduceMotion} />
          </div>
        )}
      </div>

      {focusMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-5 py-2 text-sm shadow-lg backdrop-blur">
            <span><b>{stats.characters.toLocaleString()}</b> chars</span>
            <span className="text-muted-foreground">{stats.words.toLocaleString()} words</span>
            <span className="text-primary">{activeDef.label}</span>
            <button type="button" onClick={() => setFocusMode(false)} className="text-primary hover:underline">Exit</button>
          </div>
        </div>
      )}
    </div>
  );

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await shellRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast.error("Fullscreen unavailable");
    }
  }
}

// ─── Conversion buttons ─────────────────────────────────────────────────────

function CaseGroupBlock({
  title, cases, activeCase, favorites, sample, onPick, onFav,
}: {
  title: CaseGroup;
  cases: CaseDef[];
  activeCase: string;
  favorites: string[];
  sample: string;
  onPick: (id: string) => void;
  onFav: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-1.5">
        {cases.map((c) => (
          <CaseButton
            key={c.id}
            def={c}
            active={activeCase === c.id}
            preview={convertCase(sample, c.id)}
            fav={favorites.includes(c.id)}
            onPick={() => onPick(c.id)}
            onFav={() => onFav(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CaseButton({
  def, active, preview, fav, onPick, onFav,
}: {
  def: CaseDef;
  active: boolean;
  preview: string;
  fav: boolean;
  onPick: () => void;
  onFav: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors",
        active ? "border-primary/50 bg-primary/10" : "border-border/60 bg-background hover:bg-muted",
      )}
    >
      <button type="button" onClick={onPick} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-pressed={active} title={def.desc}>
        <span className={cn("shrink-0 text-sm font-semibold", active && "text-primary")}>{def.label}</span>
        <span className="min-w-0 flex-1 truncate text-right font-mono text-[11px] text-muted-foreground">{truncate(preview, 22)}</span>
      </button>
      <button
        type="button"
        onClick={onFav}
        aria-label={fav ? `Unfavorite ${def.label}` : `Favorite ${def.label}`}
        className={cn("shrink-0 rounded p-0.5 transition-colors", fav ? "text-amber-400" : "text-muted-foreground/40 hover:text-amber-400 opacity-0 group-hover:opacity-100", fav && "opacity-100")}
      >
        <Star className={cn("size-3.5", fav && "fill-current")} />
      </button>
    </div>
  );
}

// ─── Converted output ───────────────────────────────────────────────────────

function ConvertedOutput({
  value, onCopy, onApply, reduceMotion, heightClass,
}: {
  value: string;
  onCopy: () => void;
  onApply: () => void;
  reduceMotion: boolean;
  heightClass: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30", heightClass)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={value}
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="h-full overflow-auto whitespace-pre-wrap break-words px-5 py-4 font-sans text-[15px] leading-7"
        >
          {value || <span className="text-muted-foreground/60">Converted text appears here…</span>}
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <button type="button" onClick={onApply} aria-label="Apply to source" className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground">
          <Wand2 className="size-3.5" />Apply
        </button>
        <button type="button" onClick={onCopy} aria-label="Copy result" className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground">
          <Copy className="size-3.5" />Copy
        </button>
      </div>
    </div>
  );
}

function SeoChips({ length }: { length: number }) {
  const title = length === 0 ? "muted" : length <= 60 ? "ok" : "over";
  const meta = length === 0 ? "muted" : length <= 160 ? "ok" : "over";
  const cls = (s: string) =>
    s === "over" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : s === "ok" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground";
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium">
      <span className={cn("rounded-full px-2 py-0.5", cls(title))}>SEO title {length}/60</span>
      <span className={cn("rounded-full px-2 py-0.5", cls(meta))}>Meta {length}/160</span>
    </div>
  );
}

// ─── Developer formats comparison ───────────────────────────────────────────

function DevFormatsCard({ source, sample }: { source: string; sample: string }) {
  const base = source.trim() ? source : sample;
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Developer formats">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <FileText className="size-4 text-primary" />Developer formats
        <span className="text-[11px] font-normal text-muted-foreground">naming conventions</span>
      </h2>
      <ul className="grid gap-1.5 sm:grid-cols-2 list-none">
        {DEVELOPER_CASE_IDS.map((id) => (
          <DevRow key={id} label={CASE_BY_ID[id].label} value={convertCase(base, id)} />
        ))}
      </ul>
    </section>
  );
}

function DevRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);
  const single = value.split("\n")[0] ?? "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied ${label}`);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy");
    }
  }
  return (
    <li className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
      <span className="w-[88px] shrink-0 text-[11px] font-medium text-muted-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-xs" title={single}>{single || "—"}</code>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="shrink-0 text-muted-foreground hover:text-foreground">
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      </button>
    </li>
  );
}

// ─── Analytics ──────────────────────────────────────────────────────────────

function AnalyticsCard({ stats, reduceMotion }: { stats: ReturnType<typeof analyzeText>; reduceMotion: boolean }) {
  const cards = [
    { label: "Characters", value: stats.characters },
    { label: "No spaces", value: stats.charactersNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
  ];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Text analytics">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Hash className="size-4 text-primary" />Analytics
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
        <div className="flex items-center justify-between"><span className="text-muted-foreground">Reading</span><span className="font-medium">{formatDuration(stats.readingTime)}</span></div>
        <div className="flex items-center justify-between"><span className="text-muted-foreground">Speaking</span><span className="font-medium">{formatDuration(stats.speakingTime)}</span></div>
      </div>
    </section>
  );
}

// ─── History ────────────────────────────────────────────────────────────────

function HistoryRow({ history, onRestore, onClear }: { history: string[]; onRestore: (t: string) => void; onClear: () => void }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Recent text">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Clock className="size-4 text-primary" />Recent</h2>
        <button type="button" onClick={onClear} className="text-xs text-muted-foreground hover:text-rose-500">Clear</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {history.map((t, i) => (
          <button key={i} type="button" onClick={() => onRestore(t)} className="max-w-[220px] truncate rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t}>
            {truncate(t.replace(/\n/g, " "), 40)}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Editor ─────────────────────────────────────────────────────────────────

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
        placeholder="Type or paste your text here…"
        spellCheck
        aria-label="Source text editor"
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

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

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

function ToolBtn({ onClick, icon, label, active }: { onClick: () => void; icon?: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:bg-muted")}>
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
