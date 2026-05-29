"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Award,
  Bold,
  Check,
  Clock,
  Code,
  Columns2,
  Copy,
  Eye,
  FileText,
  FileUp,
  Focus,
  Hash,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Pause,
  PencilLine,
  Pin,
  Play,
  Plus,
  Printer,
  Quote,
  Redo2,
  Replace,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Strikethrough,
  Target,
  Timer,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { analyzeText, formatDuration } from "@/lib/tools/text/word-counter";
import { htmlDocument, renderMarkdown } from "@/lib/tools/text/notepad";

const NOTES_KEY = "toollyz:notepad-notes";
const ACTIVE_KEY = "toollyz:notepad-active";
const SETTINGS_KEY = "toollyz:notepad-settings";
const GOAL_KEY = "toollyz:notepad-goal";

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

interface Settings {
  markdown: boolean;
  font: "sans" | "serif" | "mono";
  size: number;
  lineHeight: number;
  width: "narrow" | "normal" | "wide";
}

const DEFAULT_SETTINGS: Settings = { markdown: true, font: "sans", size: 16, lineHeight: 1.7, width: "normal" };

type View = "edit" | "split" | "preview";

const WELCOME = `# Welcome to Toollyz Notepad ✨

A fast, **distraction-free** writing workspace that lives in your browser.

## Features
- Auto-saves everything locally — your notes are *private*
- Markdown formatting with a live preview
- Word goals, a focus timer and writing streaks
- Export to TXT, Markdown, HTML, PDF or DOC

> Tip: select text and hit the **B** button, or press Ctrl+B.

\`\`\`js
// Code blocks work too
const note = "stay focused";
\`\`\`

Happy writing!`;

const FONT_STACK: Record<Settings["font"], string> = {
  sans: "var(--font-sans, ui-sans-serif), system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
};
const WIDTH_CLASS: Record<Settings["width"], string> = {
  narrow: "max-w-[40rem]",
  normal: "max-w-[52rem]",
  wide: "max-w-none",
};

const PROSE =
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_del]:line-through [&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_pre]:mb-3 [&_pre]:overflow-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-500/40 [&_hr]:my-4 [&_hr]:border-border";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function newNote(title = "Untitled", content = ""): Note {
  const now = Date.now();
  return { id: uid(), title, content, pinned: false, createdAt: now, updatedAt: now };
}
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function safeName(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "note";
}

export default function OnlineNotepad() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [activeId, setActiveId] = React.useState("");
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [view, setView] = React.useState<View>("edit");
  const [goal, setGoal] = React.useState(300);
  const [search, setSearch] = React.useState("");
  const [showFind, setShowFind] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [findQuery, setFindQuery] = React.useState("");
  const [replaceQuery, setReplaceQuery] = React.useState("");
  const [focusMode, setFocusMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved">("idle");

  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const sessionStartWords = React.useRef(0);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const pendingSel = React.useRef<{ start: number; end: number } | null>(null);
  const hist = React.useRef<{ stack: string[]; idx: number }>({ stack: [""], idx: 0 });
  const skipPush = React.useRef(false);
  const goalFired = React.useRef(false);

  const active = notes.find((n) => n.id === activeId) ?? null;
  const content = active?.content ?? "";

  const deferred = React.useDeferredValue(content);
  const stats = React.useMemo(() => analyzeText(deferred), [deferred]);
  const html = React.useMemo(() => renderMarkdown(deferred), [deferred]);

  // ── Load ──
  React.useEffect(() => {
    let loaded: Note[] = [];
    try {
      const n = localStorage.getItem(NOTES_KEY);
      if (n) loaded = JSON.parse(n);
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      const g = localStorage.getItem(GOAL_KEY);
      if (g) setGoal(Number(g) || 300);
    } catch {
      /* noop */
    }
    if (!loaded.length) loaded = [newNote("Welcome", WELCOME)];
    setNotes(loaded);
    const savedActive = (() => { try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; } })();
    setActiveId(loaded.find((x) => x.id === savedActive)?.id ?? loaded[0].id);
    setMounted(true);
  }, []);

  // ── Persist notes (debounced + save indicator) ──
  React.useEffect(() => {
    if (!mounted) return;
    setSaveState("saving");
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      } catch { /* noop */ }
      setSaveState("saved");
    }, 500);
    return () => window.clearTimeout(id);
  }, [notes, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(GOAL_KEY, String(goal));
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    } catch { /* noop */ }
  }, [settings, goal, activeId, mounted]);

  // ── History seed on note switch ──
  React.useEffect(() => {
    hist.current = { stack: [active?.content ?? ""], idx: 0 };
    goalFired.current = false;
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced history push ──
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => {
      if (skipPush.current) { skipPush.current = false; return; }
      const h = hist.current;
      if (h.stack[h.idx] !== content) {
        h.stack = h.stack.slice(0, h.idx + 1);
        h.stack.push(content);
        if (h.stack.length > 120) h.stack.shift();
        h.idx = h.stack.length - 1;
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [content, mounted]);

  // ── Timer ──
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

  // ── Goal celebration ──
  React.useEffect(() => {
    if (!mounted) return;
    if (goal > 0 && !goalFired.current && stats.words >= goal) {
      goalFired.current = true;
      toast.success(`🎉 Writing goal reached — ${goal} words!`);
    }
  }, [stats.words, goal, mounted]);

  // ── Restore selection after programmatic edits ──
  React.useLayoutEffect(() => {
    if (pendingSel.current && taRef.current) {
      const { start, end } = pendingSel.current;
      taRef.current.focus();
      taRef.current.setSelectionRange(start, end);
      pendingSel.current = null;
    }
  }, [content]);

  function setContent(next: string) {
    setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, content: next, updatedAt: Date.now() } : n)));
  }

  function updateActive(patch: Partial<Note>) {
    setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }

  function undo() {
    const h = hist.current;
    if (h.idx > 0) { h.idx--; skipPush.current = true; setContent(h.stack[h.idx]); }
  }
  function redo() {
    const h = hist.current;
    if (h.idx < h.stack.length - 1) { h.idx++; skipPush.current = true; setContent(h.stack[h.idx]); }
  }

  // ── Note management ──
  function createNote() {
    const n = newNote();
    setNotes((prev) => [n, ...prev]);
    setActiveId(n.id);
    setTimeout(() => taRef.current?.focus(), 30);
    toast.success("New note");
  }
  function duplicateNote(id: string) {
    const src = notes.find((n) => n.id === id);
    if (!src) return;
    const copy = newNote(`${src.title} (copy)`, src.content);
    setNotes((prev) => [copy, ...prev]);
    setActiveId(copy.id);
    toast.success("Duplicated");
  }
  function deleteNote(id: string) {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (!next.length) {
        const empty = newNote("Untitled", "");
        setActiveId(empty.id);
        return [empty];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }
  function togglePin(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }

  // ── Formatting ──
  function surround(before: string, after: string, placeholder = "") {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = content.slice(s, e) || placeholder;
    setContent(content.slice(0, s) + before + sel + after + content.slice(e));
    pendingSel.current = { start: s + before.length, end: s + before.length + sel.length };
  }
  function linePrefix(prefix: string) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = content.lastIndexOf("\n", s - 1) + 1;
    const head = content.slice(0, lineStart);
    const target = content.slice(lineStart, e) || "";
    const tail = content.slice(e);
    const prefixed = (target || "").split("\n").map((l) => prefix + l).join("\n");
    setContent(head + prefixed + tail);
    pendingSel.current = { start: lineStart, end: lineStart + prefixed.length };
  }
  function insertCodeBlock() {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = content.slice(s, e) || "code";
    const block = `\n\`\`\`\n${sel}\n\`\`\`\n`;
    setContent(content.slice(0, s) + block + content.slice(e));
    pendingSel.current = { start: s + 5, end: s + 5 + sel.length };
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); surround("**", "**", "bold"); }
    else if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); surround("*", "*", "italic"); }
    else if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); surround("[", "](https://)", "link"); }
    else if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); toast.success("Saved"); }
    else if (mod && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
    else if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const s = ta.selectionStart;
      setContent(content.slice(0, s) + "  " + content.slice(ta.selectionEnd));
      pendingSel.current = { start: s + 2, end: s + 2 };
    }
  }

  // ── Find & replace ──
  const findCount = React.useMemo(() => {
    if (!findQuery) return 0;
    try {
      const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      return (content.match(re) ?? []).length;
    } catch {
      return 0;
    }
  }, [findQuery, content]);

  function findNext() {
    const ta = taRef.current;
    if (!ta || !findQuery) return;
    const from = ta.selectionEnd;
    const lower = content.toLowerCase();
    const q = findQuery.toLowerCase();
    let idx = lower.indexOf(q, from);
    if (idx === -1) idx = lower.indexOf(q, 0);
    if (idx === -1) { toast.error("No matches"); return; }
    ta.focus();
    ta.setSelectionRange(idx, idx + findQuery.length);
  }
  function replaceAll() {
    if (!findQuery) return;
    const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const next = content.replace(re, replaceQuery);
    const count = findCount;
    setContent(next);
    toast.success(`Replaced ${count} match${count === 1 ? "" : "es"}`);
  }

  // ── Import / export ──
  async function loadFile(file: File) {
    if (/\.(docx?|pages|odt)$/i.test(file.name)) {
      toast.error("Word docs aren't supported — paste the text or upload a .txt/.md file");
      return;
    }
    try {
      const text = await file.text();
      if (text.includes("PK") || isBinary(text)) {
        toast.error("That file isn't plain text. Try a .txt or .md file.");
        return;
      }
      const n = newNote(file.name.replace(/\.[^.]+$/, ""), text);
      setNotes((prev) => [n, ...prev]);
      setActiveId(n.id);
      toast.success(`Imported ${file.name}`);
    } catch {
      toast.error("Could not read the file");
    }
  }

  function exportAs(kind: "txt" | "md" | "html" | "doc") {
    if (!content.trim()) { toast.error("Nothing to export"); return; }
    const name = safeName(active?.title ?? "note");
    if (kind === "txt") downloadBlob(content, `${name}.txt`, "text/plain");
    else if (kind === "md") downloadBlob(content, `${name}.md`, "text/markdown");
    else if (kind === "html") downloadBlob(htmlDocument(active?.title ?? "Note", html), `${name}.html`, "text/html");
    else downloadBlob(htmlDocument(active?.title ?? "Note", html), `${name}.doc`, "application/msword");
    toast.success(`Exported ${kind.toUpperCase()}`);
  }
  function printNote() {
    if (!content.trim()) { toast.error("Nothing to print"); return; }
    const w = window.open("", "_blank", "width=860,height=900");
    if (!w) { toast.error("Allow pop-ups to print"); return; }
    w.document.write(htmlDocument(active?.title ?? "Note", html) + "<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>");
    w.document.close();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await shellRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast.error("Fullscreen unavailable");
    }
  }
  function toggleTimer() {
    if (!running) sessionStartWords.current = stats.words;
    setRunning((r) => !r);
  }

  const sortedNotes = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...notes]
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, search]);

  const wpm = seconds > 0 ? Math.max(0, Math.round((stats.words - sessionStartWords.current) / (seconds / 60))) : 0;
  const goalPct = goal > 0 ? Math.min(100, (stats.words / goal) * 100) : 0;
  const editorStyle: React.CSSProperties = {
    fontFamily: FONT_STACK[settings.font],
    fontSize: settings.size,
    lineHeight: settings.lineHeight,
  };
  const showPreview = settings.markdown && (view === "split" || view === "preview");
  const showEditor = view === "edit" || view === "split" || !settings.markdown;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div ref={shellRef} className={cn("space-y-5", isFullscreen && "overflow-auto bg-background p-6")}>
      {/* Hero */}
      <section aria-label="Writing statistics" className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-card to-violet-500/10 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat icon={<Type className="size-4" />} label="Words" value={stats.words} reduceMotion={!!reduceMotion} primary />
          <HeroStat icon={<Hash className="size-4" />} label="Characters" value={stats.characters} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<Clock className="size-4" />} label="Reading" text={formatDuration(stats.readingTime)} />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Save className="size-4 text-primary" />Auto-save</div>
            <div className="flex items-center gap-1.5 font-heading text-base font-bold">
              <AnimatePresence mode="wait" initial={false}>
                {saveState === "saving" ? (
                  <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-amber-500">
                    <span className="size-2 animate-pulse rounded-full bg-amber-500" />Saving…
                  </motion.span>
                ) : (
                  <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4" />Saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Input value={active?.title ?? ""} onChange={(e) => updateActive({ title: e.target.value })} aria-label="Note title" className="h-9 w-48 rounded-lg font-medium" placeholder="Untitled" />
          {settings.markdown && (
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              <SegBtn active={view === "edit"} onClick={() => setView("edit")} icon={<PencilLine className="size-3.5" />} label="Edit" />
              <SegBtn active={view === "split"} onClick={() => setView("split")} icon={<Columns2 className="size-3.5" />} label="Split" />
              <SegBtn active={view === "preview"} onClick={() => setView("preview")} icon={<Eye className="size-3.5" />} label="Preview" />
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <ToolBtn onClick={() => setSettings((s) => ({ ...s, markdown: !s.markdown }))} label="Markdown" active={settings.markdown} />
            <IconBtn onClick={undo} label="Undo" icon={<Undo2 className="size-4" />} />
            <IconBtn onClick={redo} label="Redo" icon={<Redo2 className="size-4" />} />
            <IconBtn onClick={() => setShowFind((v) => !v)} label="Find" icon={<Search className="size-4" />} active={showFind} />
            <IconBtn onClick={() => setShowSettings((v) => !v)} label="Settings" icon={<Settings2 className="size-4" />} active={showSettings} />
            <IconBtn onClick={() => setFocusMode((f) => !f)} label="Focus" icon={<Focus className="size-4" />} active={focusMode} />
            <IconBtn onClick={toggleFullscreen} label="Fullscreen" icon={isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />} />
          </div>
        </div>

        {/* Formatting toolbar */}
        {settings.markdown && view !== "preview" && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-card p-1.5">
            <FmtBtn onClick={() => surround("**", "**", "bold")} icon={<Bold className="size-4" />} label="Bold" />
            <FmtBtn onClick={() => surround("*", "*", "italic")} icon={<Italic className="size-4" />} label="Italic" />
            <FmtBtn onClick={() => surround("~~", "~~", "strikethrough")} icon={<Strikethrough className="size-4" />} label="Strikethrough" />
            <FmtBtn onClick={() => surround("==", "==", "highlight")} icon={<Highlighter className="size-4" />} label="Highlight" />
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
            <FmtBtn onClick={() => linePrefix("# ")} icon={<Heading1 className="size-4" />} label="Heading 1" />
            <FmtBtn onClick={() => linePrefix("## ")} icon={<Heading2 className="size-4" />} label="Heading 2" />
            <FmtBtn onClick={() => linePrefix("- ")} icon={<List className="size-4" />} label="Bullet list" />
            <FmtBtn onClick={() => linePrefix("1. ")} icon={<ListOrdered className="size-4" />} label="Numbered list" />
            <FmtBtn onClick={() => linePrefix("> ")} icon={<Quote className="size-4" />} label="Quote" />
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
            <FmtBtn onClick={() => surround("`", "`", "code")} icon={<Code className="size-4" />} label="Inline code" />
            <FmtBtn onClick={insertCodeBlock} icon={<Code className="size-4" />} label="Code block" textLabel="block" />
            <FmtBtn onClick={() => surround("[", "](https://)", "link")} icon={<Link2 className="size-4" />} label="Link" />
          </div>
        )}

        {/* Find & replace */}
        <AnimatePresence>
          {showFind && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-2">
                <div className="relative min-w-[160px] flex-1">
                  <Input value={findQuery} onChange={(e) => setFindQuery(e.target.value)} placeholder="Find…" className="h-8 rounded-lg pr-14 text-sm" aria-label="Find" />
                  {findQuery && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{findCount}</span>}
                </div>
                <Input value={replaceQuery} onChange={(e) => setReplaceQuery(e.target.value)} placeholder="Replace with…" className="h-8 min-w-[160px] flex-1 rounded-lg text-sm" aria-label="Replace" />
                <Button type="button" variant="outline" size="sm" onClick={findNext}>Next</Button>
                <Button type="button" variant="outline" size="sm" onClick={replaceAll}><Replace className="size-4" />All</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-3 sm:grid-cols-4">
                <SettingGroup label="Font">
                  <div className="grid grid-cols-3 gap-1">
                    {(["sans", "serif", "mono"] as const).map((f) => (
                      <SegBtn key={f} active={settings.font === f} onClick={() => setSettings((s) => ({ ...s, font: f }))} label={f === "sans" ? "Sans" : f === "serif" ? "Serif" : "Mono"} />
                    ))}
                  </div>
                </SettingGroup>
                <SettingGroup label={`Size · ${settings.size}px`}>
                  <input type="range" min={13} max={22} value={settings.size} onChange={(e) => setSettings((s) => ({ ...s, size: Number(e.target.value) }))} className="w-full accent-primary" aria-label="Font size" />
                </SettingGroup>
                <SettingGroup label={`Line height · ${settings.lineHeight}`}>
                  <input type="range" min={1.3} max={2.2} step={0.1} value={settings.lineHeight} onChange={(e) => setSettings((s) => ({ ...s, lineHeight: Number(e.target.value) }))} className="w-full accent-primary" aria-label="Line height" />
                </SettingGroup>
                <SettingGroup label="Width">
                  <div className="grid grid-cols-3 gap-1">
                    {(["narrow", "normal", "wide"] as const).map((w) => (
                      <SegBtn key={w} active={settings.width === w} onClick={() => setSettings((s) => ({ ...s, width: w }))} label={w[0].toUpperCase() + w.slice(1)} />
                    ))}
                  </div>
                </SettingGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main */}
      <div className={cn("grid gap-4", !focusMode && "lg:grid-cols-[260px_1fr]")}>
        {/* Sidebar */}
        {!focusMode && (
          <aside className="space-y-2">
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" className="flex-1" onClick={createNote}><Plus className="size-4" />New note</Button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="h-9 rounded-lg pl-9 text-sm" aria-label="Search notes" />
            </div>
            <ul className="max-h-[420px] space-y-1 overflow-auto list-none lg:max-h-[600px]">
              {sortedNotes.map((n) => (
                <li key={n.id}>
                  <div className={cn("group flex items-start gap-1.5 rounded-xl border p-2.5 transition-colors", n.id === activeId ? "border-primary/50 bg-primary/10" : "border-border/60 bg-card hover:bg-muted")}>
                    <button type="button" onClick={() => setActiveId(n.id)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1 truncate text-sm font-medium">
                        {n.pinned && <Pin className="size-3 shrink-0 fill-amber-400 text-amber-400" />}
                        {n.title || "Untitled"}
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{n.content.replace(/[#>*`_-]/g, "").trim().slice(0, 40) || "Empty note"}</p>
                    </button>
                    <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" onClick={() => togglePin(n.id)} aria-label="Pin" className="rounded p-0.5 text-muted-foreground hover:text-amber-500"><Pin className={cn("size-3.5", n.pinned && "fill-current text-amber-400")} /></button>
                      <button type="button" onClick={() => duplicateNote(n.id)} aria-label="Duplicate" className="rounded p-0.5 text-muted-foreground hover:text-foreground"><Copy className="size-3.5" /></button>
                      <button type="button" onClick={() => deleteNote(n.id)} aria-label="Delete" className="rounded p-0.5 text-muted-foreground hover:text-rose-500"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Editor / preview */}
        <div className="min-w-0 space-y-4">
          <div className={cn("mx-auto w-full", focusMode && WIDTH_CLASS[settings.width])}>
            <div
              className={cn("grid overflow-hidden rounded-2xl border border-border/70 bg-card", showPreview && showEditor && "lg:grid-cols-2 lg:divide-x lg:divide-border/60")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
            >
              {showEditor && (
                <textarea
                  ref={taRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Start writing…"
                  spellCheck
                  aria-label="Notepad editor"
                  style={editorStyle}
                  className={cn("resize-none bg-transparent px-5 py-4 text-foreground caret-primary outline-none placeholder:text-muted-foreground/50", focusMode ? "h-[62vh]" : "h-[440px]")}
                />
              )}
              {showPreview && (
                <div
                  style={editorStyle}
                  className={cn("overflow-auto px-5 py-4", PROSE, focusMode ? "h-[62vh]" : "h-[440px]", view === "preview" && "mx-auto", view === "preview" && WIDTH_CLASS[settings.width])}
                >
                  {html ? (
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  ) : (
                    <p className="text-muted-foreground/50">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Export bar */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(content); toast.success("Copied"); }}><Copy className="size-4" />Copy</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("txt")}><FileText className="size-4" />TXT</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("md")}><FileText className="size-4" />MD</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("html")}><FileText className="size-4" />HTML</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("doc")}><FileText className="size-4" />DOC</Button>
            <Button type="button" variant="outline" size="sm" onClick={printNote}><Printer className="size-4" />Print / PDF</Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              <FileUp className="size-4" />Import
              <input type="file" accept=".txt,.md,.markdown,.text,.csv,.log" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            </label>
          </div>

          {/* Analytics + productivity */}
          {!focusMode && (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnalyticsCard stats={stats} reduceMotion={!!reduceMotion} />
              <ProductivityCard
                words={stats.words}
                goal={goal}
                setGoal={setGoal}
                goalPct={goalPct}
                running={running}
                seconds={seconds}
                wpm={wpm}
                onToggleTimer={toggleTimer}
                onResetTimer={() => { setRunning(false); setSeconds(0); }}
                reduceMotion={!!reduceMotion}
              />
            </div>
          )}
        </div>
      </div>

      {focusMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-5 py-2 text-sm shadow-lg backdrop-blur">
            <span><b>{stats.words.toLocaleString()}</b> words</span>
            <span className="text-muted-foreground">{formatDuration(stats.readingTime)}</span>
            <span className={saveState === "saved" ? "text-emerald-500" : "text-amber-500"}>{saveState === "saved" ? "Saved" : "Saving…"}</span>
            <button type="button" onClick={() => setFocusMode(false)} className="text-primary hover:underline">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics ──────────────────────────────────────────────────────────────

function AnalyticsCard({ stats, reduceMotion }: { stats: ReturnType<typeof analyzeText>; reduceMotion: boolean }) {
  const cards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "No spaces", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
  ];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Analytics">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Hash className="size-4 text-primary" />Analytics</h2>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border/60 bg-background p-2.5">
            <div className="font-heading text-base font-bold tabular-nums"><AnimatedNumber value={c.value} reduceMotion={reduceMotion} /></div>
            <div className="text-[10px] leading-tight text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Reading time</span>
        <span className="font-medium">{formatDuration(stats.readingTime)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Speaking time</span>
        <span className="font-medium">{formatDuration(stats.speakingTime)}</span>
      </div>
    </section>
  );
}

// ─── Productivity ───────────────────────────────────────────────────────────

function ProductivityCard({
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
    { id: "goal", label: "Goal met", earned: reached },
    { id: "focus", label: "Focused 5m", earned: seconds >= 300 },
  ];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Productivity">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Target className="size-4 text-primary" />Productivity</h2>
      <div className="flex items-center gap-3">
        <ProgressRing pct={goalPct} reached={reached} reduceMotion={reduceMotion} />
        <div className="flex-1">
          <label className="text-xs text-muted-foreground" htmlFor="np-goal">Word goal</label>
          <Input id="np-goal" type="number" min={0} value={goal} onChange={(e) => setGoal(Math.max(0, Number(e.target.value)))} className="mt-1 h-8 rounded-lg" />
          <p className="mt-1 text-xs"><b>{words.toLocaleString()}</b><span className="text-muted-foreground"> / {goal.toLocaleString()}</span></p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-background p-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Timer className="size-3.5" />Focus session</div>
          <div className="font-heading text-lg font-bold tabular-nums">{mm}:{ss} <span className="text-xs font-normal text-muted-foreground">· {wpm} wpm</span></div>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="icon" onClick={onToggleTimer} aria-label={running ? "Pause" : "Start"}>{running ? <Pause className="size-4" /> : <Play className="size-4" />}</Button>
          <Button type="button" variant="ghost" size="icon" onClick={onResetTimer} aria-label="Reset"><RotateCcw className="size-4" /></Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <span key={b.id} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", b.earned ? "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-border bg-muted/30 text-muted-foreground/60")}>
            <Award className={cn("size-3", !b.earned && "opacity-40")} />{b.label}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function HeroStat({ icon, label, value, text, primary, reduceMotion }: { icon: React.ReactNode; label: string; value?: number; text?: string; primary?: boolean; reduceMotion?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><span className="text-primary">{icon}</span>{label}</div>
      <div className={cn("font-heading font-bold tabular-nums", primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
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

function SettingGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function ToolBtn({ onClick, label, active }: { onClick: () => void; label: string; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:bg-muted")}>{label}</button>
  );
}
function IconBtn({ onClick, label, icon, active }: { onClick: () => void; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active} className={cn("grid size-9 place-items-center rounded-lg border transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:bg-muted")}>{icon}</button>
  );
}
function FmtBtn({ onClick, icon, label, textLabel }: { onClick: () => void; icon: React.ReactNode; label: string; textLabel?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-foreground/80 transition-colors hover:bg-muted">
      {icon}{textLabel && <span className="text-[10px] font-medium">{textLabel}</span>}
    </button>
  );
}
function SegBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon?: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>
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
