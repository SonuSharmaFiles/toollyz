"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bold,
  BookOpen,
  Braces,
  Check,
  Clock,
  Code,
  Columns2,
  Copy,
  Eye,
  FileCode2,
  FileText,
  FileUp,
  Focus,
  Hash,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  ListTree,
  Maximize2,
  Minimize2,
  PencilLine,
  Quote,
  Redo2,
  Replace,
  Save,
  Search,
  Settings2,
  Strikethrough,
  Table,
  Type,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { analyzeText, formatDuration } from "@/lib/tools/text/word-counter";
import {
  CHEAT_SHEET,
  TEMPLATES,
  countElements,
  extractOutline,
  htmlDocument,
  renderMarkdown,
  type Template,
} from "@/lib/tools/text/markdown";

const CONTENT_KEY = "toollyz:mdedit-content";
const SETTINGS_KEY = "toollyz:mdedit-settings";
const SNAP_KEY = "toollyz:mdedit-snapshots";

type View = "edit" | "split" | "preview";

interface Settings {
  font: "sans" | "serif" | "mono";
  size: number;
  lineHeight: number;
  width: "narrow" | "normal" | "wide";
}
const DEFAULT_SETTINGS: Settings = { font: "mono", size: 15, lineHeight: 1.7, width: "normal" };

interface Snapshot {
  id: string;
  ts: number;
  preview: string;
  content: string;
  words: number;
}

const DEMO = `# Markdown Editor & Previewer 🚀

Write **GitHub-Flavored Markdown** and see it render *instantly*.

## Features
- Live preview with ~~lag~~ zero delay
- Syntax-highlighted code blocks
- Tables, task lists and emoji :tada:

### Task list
- [x] Real-time rendering
- [x] Tables & GFM
- [ ] Your first document

### Table
| Feature | Supported |
| ------- | :-------: |
| Tables | ✅ |
| Task lists | ✅ |
| Code | ✅ |

### Code
\`\`\`js
function greet(name) {
  // say hello
  return \`Hello, \${name}!\`;
}
\`\`\`

> Tip: open the **Templates** panel for ready-made docs.`;

const FONT_STACK: Record<Settings["font"], string> = {
  sans: "var(--font-sans, ui-sans-serif), system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
};
const WIDTH_CLASS: Record<Settings["width"], string> = {
  narrow: "max-w-[42rem]",
  normal: "max-w-[54rem]",
  wide: "max-w-none",
};

const PROSE =
  "[&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:border-b [&_h1]:border-border/60 [&_h1]:pb-1.5 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-3 [&_h4]:font-semibold [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_del]:line-through [&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_pre]:relative [&_pre]:mb-3 [&_pre]:overflow-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:pt-6 [&_pre]:text-[0.85em] [&_pre]:text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100 [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-500/40 [&_hr]:my-5 [&_hr]:border-border [&_table]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-1.5 [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_.md-tasklist]:list-none [&_.md-tasklist]:pl-0 [&_.md-task]:flex [&_.md-task]:items-center [&_.md-task]:gap-1.5 [&_.md-lang]:absolute [&_.md-lang]:right-3 [&_.md-lang]:top-2 [&_.md-lang]:text-[10px] [&_.md-lang]:font-sans [&_.md-lang]:uppercase [&_.md-lang]:tracking-wider [&_.md-lang]:text-slate-400 [&_.tok-c]:italic [&_.tok-c]:text-slate-400 [&_.tok-s]:text-emerald-300 [&_.tok-n]:text-sky-300 [&_.tok-k]:text-rose-300 [&_.tok-b]:text-violet-300";

function uid() {
  return Math.random().toString(36).slice(2, 10);
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

export default function MarkdownEditorPreviewer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [content, setContentState] = React.useState("");
  const [view, setView] = React.useState<View>("split");
  const [htmlView, setHtmlView] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [focusMode, setFocusMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showFind, setShowFind] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showCheat, setShowCheat] = React.useState(false);
  const [findQuery, setFindQuery] = React.useState("");
  const [replaceQuery, setReplaceQuery] = React.useState("");
  const [snapshots, setSnapshots] = React.useState<Snapshot[]>([]);
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved">("idle");

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const pendingSel = React.useRef<{ start: number; end: number } | null>(null);
  const hist = React.useRef<{ stack: string[]; idx: number }>({ stack: [""], idx: 0 });
  const skipPush = React.useRef(false);

  const deferred = React.useDeferredValue(content);
  const stats = React.useMemo(() => analyzeText(deferred), [deferred]);
  const counts = React.useMemo(() => countElements(deferred), [deferred]);
  const html = React.useMemo(() => renderMarkdown(deferred), [deferred]);
  const outline = React.useMemo(() => extractOutline(deferred), [deferred]);

  React.useEffect(() => {
    try {
      const c = localStorage.getItem(CONTENT_KEY);
      setContentState(c ?? DEMO);
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      const snaps = localStorage.getItem(SNAP_KEY);
      if (snaps) setSnapshots(JSON.parse(snaps));
    } catch {
      setContentState(DEMO);
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    setSaveState("saving");
    const id = window.setTimeout(() => {
      try { localStorage.setItem(CONTENT_KEY, content); } catch { /* noop */ }
      setSaveState("saved");
    }, 500);
    return () => window.clearTimeout(id);
  }, [content, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* noop */ }
  }, [settings, mounted]);

  // History
  React.useEffect(() => {
    if (!mounted) return;
    hist.current = { stack: [content], idx: 0 };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps
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

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  React.useLayoutEffect(() => {
    if (pendingSel.current && taRef.current) {
      const { start, end } = pendingSel.current;
      taRef.current.focus();
      taRef.current.setSelectionRange(start, end);
      pendingSel.current = null;
    }
  }, [content]);

  function setContent(next: string) {
    setContentState(next);
  }
  function undo() {
    const h = hist.current;
    if (h.idx > 0) { h.idx--; skipPush.current = true; setContent(h.stack[h.idx]); }
  }
  function redo() {
    const h = hist.current;
    if (h.idx < h.stack.length - 1) { h.idx++; skipPush.current = true; setContent(h.stack[h.idx]); }
  }

  // Formatting
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
    const target = content.slice(lineStart, e);
    const tail = content.slice(e);
    const prefixed = target.split("\n").map((l) => prefix + l).join("\n");
    setContent(head + prefixed + tail);
    pendingSel.current = { start: lineStart, end: lineStart + prefixed.length };
  }
  function insertBlock(text: string, cursorOffset?: number) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    setContent(content.slice(0, s) + text + content.slice(ta.selectionEnd));
    const pos = s + (cursorOffset ?? text.length);
    pendingSel.current = { start: pos, end: pos };
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

  // Find & replace
  const findCount = React.useMemo(() => {
    if (!findQuery) return 0;
    try {
      const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      return (content.match(re) ?? []).length;
    } catch { return 0; }
  }, [findQuery, content]);
  function findNext() {
    const ta = taRef.current;
    if (!ta || !findQuery) return;
    const lower = content.toLowerCase();
    const q = findQuery.toLowerCase();
    let idx = lower.indexOf(q, ta.selectionEnd);
    if (idx === -1) idx = lower.indexOf(q, 0);
    if (idx === -1) { toast.error("No matches"); return; }
    ta.focus();
    ta.setSelectionRange(idx, idx + findQuery.length);
  }
  function replaceAll() {
    if (!findQuery) return;
    const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const n = findCount;
    setContent(content.replace(re, replaceQuery));
    toast.success(`Replaced ${n} match${n === 1 ? "" : "es"}`);
  }

  // Templates / snapshots
  function applyTemplate(t: Template) {
    setContent(t.content);
    setShowTemplates(false);
    toast.success(`${t.label} template loaded`);
  }
  function snapshot() {
    if (!content.trim()) { toast.error("Nothing to snapshot"); return; }
    const snap: Snapshot = { id: uid(), ts: Date.now(), preview: content.replace(/[#>*`_-]/g, "").trim().slice(0, 50), content, words: stats.words };
    const next = [snap, ...snapshots].slice(0, 12);
    setSnapshots(next);
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(next)); } catch { /* noop */ }
    toast.success("Snapshot saved");
  }
  function restoreSnapshot(s: Snapshot) {
    setContent(s.content);
    toast.success("Snapshot restored");
  }

  function jumpTo(id: string) {
    if (view === "edit") setView("split");
    requestAnimationFrame(() => {
      const el = previewRef.current?.querySelector(`#${CSS.escape(id)}`);
      el?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  async function loadFile(file: File) {
    if (/\.(docx?|pages|odt)$/i.test(file.name)) {
      toast.error("Word docs aren't supported — paste the text or upload a .md/.txt file");
      return;
    }
    try {
      const text = await file.text();
      if (text.includes("PK") || isBinary(text)) { toast.error("That file isn't plain text."); return; }
      setContent(text);
      toast.success(`Imported ${file.name}`);
    } catch { toast.error("Could not read the file"); }
  }

  function exportAs(kind: "md" | "html" | "txt" | "doc") {
    if (!content.trim()) { toast.error("Nothing to export"); return; }
    if (kind === "md") downloadBlob(content, "document.md", "text/markdown");
    else if (kind === "txt") downloadBlob(content, "document.txt", "text/plain");
    else if (kind === "html") downloadBlob(htmlDocument("Markdown Export", html), "document.html", "text/html");
    else downloadBlob(htmlDocument("Markdown Export", html), "document.doc", "application/msword");
    toast.success(`Exported ${kind.toUpperCase()}`);
  }
  function printDoc() {
    if (!content.trim()) { toast.error("Nothing to print"); return; }
    const w = window.open("", "_blank", "width=860,height=900");
    if (!w) { toast.error("Allow pop-ups to print"); return; }
    w.document.write(htmlDocument("Markdown Export", html) + "<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>");
    w.document.close();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await shellRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch { toast.error("Fullscreen unavailable"); }
  }

  const editorStyle: React.CSSProperties = { fontFamily: FONT_STACK[settings.font], fontSize: settings.size, lineHeight: settings.lineHeight };
  const showEditor = view === "edit" || view === "split";
  const showPreview = view === "preview" || view === "split";

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div ref={shellRef} className={cn("space-y-5", isFullscreen && "overflow-auto bg-background p-6")}>
      {/* Hero */}
      <section aria-label="Document statistics" className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-card to-violet-500/10 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat icon={<Type className="size-4" />} label="Words" value={stats.words} reduceMotion={!!reduceMotion} primary />
          <HeroStat icon={<Hash className="size-4" />} label="Headings" value={counts.headings} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<Clock className="size-4" />} label="Reading" text={formatDuration(stats.readingTime)} />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Save className="size-4 text-primary" />Auto-save</div>
            <div className="flex items-center gap-1.5 font-heading text-base font-bold">
              <AnimatePresence mode="wait" initial={false}>
                {saveState === "saving" ? (
                  <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-amber-500"><span className="size-2 animate-pulse rounded-full bg-amber-500" />Saving…</motion.span>
                ) : (
                  <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-emerald-500"><Check className="size-4" />Saved</motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
            <SegBtn active={view === "edit"} onClick={() => setView("edit")} icon={<PencilLine className="size-3.5" />} label="Edit" />
            <SegBtn active={view === "split"} onClick={() => setView("split")} icon={<Columns2 className="size-3.5" />} label="Split" />
            <SegBtn active={view === "preview"} onClick={() => setView("preview")} icon={<Eye className="size-3.5" />} label="Preview" />
          </div>
          <ToolBtn onClick={() => setShowTemplates((v) => !v)} icon={<FileText className="size-3.5" />} label="Templates" active={showTemplates} />
          <ToolBtn onClick={snapshot} icon={<Save className="size-3.5" />} label="Snapshot" />
          <div className="ml-auto flex items-center gap-1.5">
            <IconBtn onClick={() => setHtmlView((v) => !v)} label="View HTML" icon={<FileCode2 className="size-4" />} active={htmlView} />
            <IconBtn onClick={undo} label="Undo" icon={<Undo2 className="size-4" />} />
            <IconBtn onClick={redo} label="Redo" icon={<Redo2 className="size-4" />} />
            <IconBtn onClick={() => setShowFind((v) => !v)} label="Find" icon={<Search className="size-4" />} active={showFind} />
            <IconBtn onClick={() => setShowSettings((v) => !v)} label="Settings" icon={<Settings2 className="size-4" />} active={showSettings} />
            <IconBtn onClick={() => setFocusMode((f) => !f)} label="Focus" icon={<Focus className="size-4" />} active={focusMode} />
            <IconBtn onClick={toggleFullscreen} label="Fullscreen" icon={isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />} />
          </div>
        </div>

        {/* Formatting toolbar */}
        {view !== "preview" && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-card p-1.5">
            <FmtBtn onClick={() => surround("**", "**", "bold")} icon={<Bold className="size-4" />} label="Bold" />
            <FmtBtn onClick={() => surround("*", "*", "italic")} icon={<Italic className="size-4" />} label="Italic" />
            <FmtBtn onClick={() => surround("~~", "~~", "strikethrough")} icon={<Strikethrough className="size-4" />} label="Strikethrough" />
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
            <FmtBtn onClick={() => linePrefix("# ")} icon={<Heading1 className="size-4" />} label="Heading 1" />
            <FmtBtn onClick={() => linePrefix("## ")} icon={<Heading2 className="size-4" />} label="Heading 2" />
            <FmtBtn onClick={() => linePrefix("- ")} icon={<List className="size-4" />} label="Bullet list" />
            <FmtBtn onClick={() => linePrefix("1. ")} icon={<ListOrdered className="size-4" />} label="Numbered list" />
            <FmtBtn onClick={() => linePrefix("- [ ] ")} icon={<ListChecks className="size-4" />} label="Task list" />
            <FmtBtn onClick={() => linePrefix("> ")} icon={<Quote className="size-4" />} label="Quote" />
            <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
            <FmtBtn onClick={() => surround("`", "`", "code")} icon={<Code className="size-4" />} label="Inline code" />
            <FmtBtn onClick={() => insertBlock("\n```js\n\n```\n", 7)} icon={<Braces className="size-4" />} label="Code block" />
            <FmtBtn onClick={() => surround("[", "](https://)", "link")} icon={<Link2 className="size-4" />} label="Link" />
            <FmtBtn onClick={() => surround("![", "](https://)", "alt")} icon={<ImageIcon className="size-4" />} label="Image" />
            <FmtBtn onClick={() => insertBlock("\n| Column A | Column B |\n| -------- | -------- |\n| Cell 1 | Cell 2 |\n")} icon={<Table className="size-4" />} label="Table" />
          </div>
        )}

        {/* Find & replace */}
        <AnimatePresence>
          {showFind && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-2">
                <div className="relative min-w-[160px] flex-1">
                  <Input value={findQuery} onChange={(e) => setFindQuery(e.target.value)} placeholder="Find…" className="h-8 rounded-lg pr-12 text-sm" aria-label="Find" />
                  {findQuery && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{findCount}</span>}
                </div>
                <Input value={replaceQuery} onChange={(e) => setReplaceQuery(e.target.value)} placeholder="Replace…" className="h-8 min-w-[160px] flex-1 rounded-lg text-sm" aria-label="Replace" />
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
                <SettingGroup label="Editor font">
                  <div className="grid grid-cols-3 gap-1">
                    {(["mono", "sans", "serif"] as const).map((f) => (
                      <SegBtn key={f} active={settings.font === f} onClick={() => setSettings((s) => ({ ...s, font: f }))} label={f === "mono" ? "Mono" : f === "sans" ? "Sans" : "Serif"} />
                    ))}
                  </div>
                </SettingGroup>
                <SettingGroup label={`Size · ${settings.size}px`}>
                  <input type="range" min={12} max={20} value={settings.size} onChange={(e) => setSettings((s) => ({ ...s, size: Number(e.target.value) }))} className="w-full accent-primary" aria-label="Font size" />
                </SettingGroup>
                <SettingGroup label={`Line height · ${settings.lineHeight}`}>
                  <input type="range" min={1.3} max={2.2} step={0.1} value={settings.lineHeight} onChange={(e) => setSettings((s) => ({ ...s, lineHeight: Number(e.target.value) }))} className="w-full accent-primary" aria-label="Line height" />
                </SettingGroup>
                <SettingGroup label="Preview width">
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

        {/* Templates */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="grid gap-2 rounded-xl border border-border/70 bg-card p-3 sm:grid-cols-2 lg:grid-cols-4">
                {TEMPLATES.map((t) => (
                  <button key={t.id} type="button" onClick={() => applyTemplate(t)} className="rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted">
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main */}
      <div className={cn("grid gap-4", !focusMode && "lg:grid-cols-[220px_1fr]")}>
        {/* Outline + snapshots sidebar */}
        {!focusMode && (
          <aside className="space-y-4">
            <section className="rounded-2xl border border-border/70 bg-card p-3">
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><ListTree className="size-3.5" />Outline</h2>
              {outline.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">Add headings to build an outline.</p>
              ) : (
                <ul className="space-y-0.5 list-none">
                  {outline.map((o, i) => (
                    <li key={i}>
                      <button type="button" onClick={() => jumpTo(o.id)} className="block w-full truncate rounded-md py-1 pr-1 text-left text-xs text-foreground/80 transition-colors hover:bg-muted hover:text-primary" style={{ paddingLeft: `${(o.level - 1) * 10 + 6}px` }} title={o.text}>
                        {o.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {snapshots.length > 0 && (
              <section className="rounded-2xl border border-border/70 bg-card p-3">
                <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Clock className="size-3.5" />Versions</h2>
                <ul className="space-y-1 list-none">
                  {snapshots.map((s) => (
                    <li key={s.id}>
                      <button type="button" onClick={() => restoreSnapshot(s)} className="block w-full truncate rounded-md p-1.5 text-left text-xs transition-colors hover:bg-muted" title={s.preview}>
                        <span className="font-medium">{s.words}w</span>{" "}
                        <span className="text-muted-foreground">{new Date(s.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        )}

        {/* Editor + preview */}
        <div className="min-w-0 space-y-4">
          <div className="grid overflow-hidden rounded-2xl border border-border/70 bg-card lg:auto-rows-fr" style={showEditor && showPreview ? { gridTemplateColumns: "1fr 1fr" } : undefined} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}>
            {showEditor && (
              <textarea
                ref={taRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Start writing Markdown…"
                spellCheck={false}
                aria-label="Markdown editor"
                style={editorStyle}
                className={cn("resize-none border-border/60 bg-transparent px-5 py-4 text-foreground caret-primary outline-none placeholder:text-muted-foreground/50", showEditor && showPreview && "lg:border-r", focusMode ? "h-[64vh]" : "h-[460px]")}
              />
            )}
            {showPreview && (
              htmlView ? (
                <div className={cn("relative overflow-auto bg-slate-900 px-5 py-4", focusMode ? "h-[64vh]" : "h-[460px]")}>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(html); toast.success("HTML copied"); }} className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-white/20"><Copy className="size-3.5" />Copy</button>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-slate-300"><code>{html || "<!-- nothing yet -->"}</code></pre>
                </div>
              ) : (
                <div ref={previewRef} style={editorStyle} className={cn("overflow-auto px-5 py-4", PROSE, focusMode ? "h-[64vh]" : "h-[460px]", view === "preview" && "mx-auto w-full", view === "preview" && WIDTH_CLASS[settings.width])}>
                  {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-muted-foreground/50">Nothing to preview yet.</p>}
                </div>
              )
            )}
          </div>

          {/* Export bar */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(content); toast.success("Markdown copied"); }}><Copy className="size-4" />Copy MD</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("md")}><FileText className="size-4" />.md</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("html")}><FileCode2 className="size-4" />HTML</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("doc")}><FileText className="size-4" />DOC</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportAs("txt")}><FileText className="size-4" />TXT</Button>
            <Button type="button" variant="outline" size="sm" onClick={printDoc}><FileText className="size-4" />Print / PDF</Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              <FileUp className="size-4" />Import
              <input type="file" accept=".md,.markdown,.txt,.text,.mdx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            </label>
          </div>

          {!focusMode && (
            <>
              <ElementCounts stats={stats} counts={counts} reduceMotion={!!reduceMotion} />
              <CheatSheet open={showCheat} onToggle={() => setShowCheat((v) => !v)} />
            </>
          )}
        </div>
      </div>

      {focusMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-5 py-2 text-sm shadow-lg backdrop-blur">
            <span><b>{stats.words.toLocaleString()}</b> words</span>
            <span className="text-muted-foreground">{counts.headings} headings</span>
            <span className={saveState === "saved" ? "text-emerald-500" : "text-amber-500"}>{saveState === "saved" ? "Saved" : "Saving…"}</span>
            <button type="button" onClick={() => setFocusMode(false)} className="text-primary hover:underline">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Element counts ─────────────────────────────────────────────────────────

function ElementCounts({ stats, counts, reduceMotion }: { stats: ReturnType<typeof analyzeText>; counts: ReturnType<typeof countElements>; reduceMotion: boolean }) {
  const cards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Headings", value: counts.headings },
    { label: "Links", value: counts.links },
    { label: "Images", value: counts.images },
    { label: "Code blocks", value: counts.codeBlocks },
    { label: "Tasks", value: counts.tasks },
    { label: "Tables", value: counts.tables },
  ];
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Document analytics">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Hash className="size-4 text-primary" />Document analytics</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
            <div className="font-heading text-lg font-bold tabular-nums"><AnimatedNumber value={c.value} reduceMotion={reduceMotion} /></div>
            <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Reading time</span><span className="font-medium">{formatDuration(stats.readingTime)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Speaking time</span><span className="font-medium">{formatDuration(stats.speakingTime)}</span>
      </div>
    </section>
  );
}

// ─── Cheat sheet ────────────────────────────────────────────────────────────

function CheatSheet({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Markdown cheat sheet">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-sm font-semibold tracking-tight">
        <span className="flex items-center gap-2"><BookOpen className="size-4 text-primary" />Markdown cheat sheet</span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {CHEAT_SHEET.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
                  <span className="text-xs font-medium">{c.label}</span>
                  <code className="truncate font-mono text-[11px] text-muted-foreground">{c.syntax}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Shortcuts: <kbd className="rounded border border-border bg-muted px-1 font-mono">Ctrl/⌘ B</kbd> bold · <kbd className="rounded border border-border bg-muted px-1 font-mono">Ctrl/⌘ I</kbd> italic · <kbd className="rounded border border-border bg-muted px-1 font-mono">Ctrl/⌘ K</kbd> link · <kbd className="rounded border border-border bg-muted px-1 font-mono">Tab</kbd> indent</p>
          </motion.div>
        )}
      </AnimatePresence>
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
    if (reduceMotion || typeof document === "undefined" || document.visibilityState !== "visible") { setDisplay(to); fromRef.current = to; return; }
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

function SettingGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
function ToolBtn({ onClick, icon, label, active }: { onClick: () => void; icon?: React.ReactNode; label: string; active?: boolean }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:bg-muted")}>{icon}{label}</button>;
}
function IconBtn({ onClick, label, icon, active }: { onClick: () => void; label: string; icon: React.ReactNode; active?: boolean }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active} className={cn("grid size-9 place-items-center rounded-lg border transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:bg-muted")}>{icon}</button>;
}
function FmtBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-8 place-items-center rounded-md text-foreground/80 transition-colors hover:bg-muted">{icon}</button>;
}
function SegBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon?: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
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
