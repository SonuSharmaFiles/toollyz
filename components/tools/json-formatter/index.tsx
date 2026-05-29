"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightLeft,
  Braces,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileJson,
  FileUp,
  FoldVertical,
  Hash,
  Indent,
  ListTree,
  Minimize2,
  Redo2,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  UnfoldVertical,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SAMPLE_JSON,
  analyze,
  beautify,
  byteSize,
  diffJson,
  escapeJson,
  extractKeys,
  formatBytes,
  healthScore,
  highlightJson,
  minify,
  parseJson,
  sortKeys,
  toCsv,
  unescapeJson,
  type DiffEntry,
  type Indent as IndentType,
  type Stats,
} from "@/lib/tools/json/json-tools";

const TEXT_KEY = "toollyz:json-text";
const INDENT_KEY = "toollyz:json-indent";
const HISTORY_KEY = "toollyz:json-history";

type Tab = "tree" | "stats" | "diff";
interface HistoryItem { id: string; preview: string; text: string; ts: number }

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function downloadText(content: string, filename: string, mime: string) {
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

const EDITOR_TOKENS =
  "[&_.j-key]:text-sky-300 [&_.j-str]:text-emerald-300 [&_.j-num]:text-amber-300 [&_.j-bool]:text-fuchsia-300 [&_.j-null]:text-rose-300 [&_.j-pun]:text-slate-500";

export default function JsonFormatter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setTextState] = React.useState("");
  const [indent, setIndent] = React.useState<IndentType>(2);
  const [tab, setTab] = React.useState<Tab>("tree");
  const [treeSearch, setTreeSearch] = React.useState("");
  const [treeKey, setTreeKey] = React.useState(0);
  const [openAll, setOpenAll] = React.useState(false);
  const [compareText, setCompareText] = React.useState("");
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const backRef = React.useRef<HTMLPreElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);
  const hist = React.useRef<{ stack: string[]; idx: number }>({ stack: [""], idx: 0 });
  const skipPush = React.useRef(false);

  const deferred = React.useDeferredValue(text);
  const parsed = React.useMemo(() => parseJson(deferred), [deferred]);
  const stats: Stats | null = React.useMemo(() => (parsed.ok ? analyze(parsed.value) : null), [parsed]);
  const size = React.useMemo(() => byteSize(text), [text]);
  const health = healthScore(parsed.ok, stats);
  const lines = React.useMemo(() => text.split("\n"), [text]);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      setTextState(t ?? SAMPLE_JSON);
      const ind = localStorage.getItem(INDENT_KEY);
      if (ind) setIndent(ind === "tab" ? "tab" : (Number(ind) as IndentType));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch {
      setTextState(SAMPLE_JSON);
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => {
      try { localStorage.setItem(TEXT_KEY, text); } catch { /* noop */ }
    }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(INDENT_KEY, String(indent)); } catch { /* noop */ }
  }, [indent, mounted]);

  // history
  React.useEffect(() => { hist.current = { stack: [text], idx: 0 }; }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => {
      if (skipPush.current) { skipPush.current = false; return; }
      const h = hist.current;
      if (h.stack[h.idx] !== text) {
        h.stack = h.stack.slice(0, h.idx + 1);
        h.stack.push(text);
        if (h.stack.length > 80) h.stack.shift();
        h.idx = h.stack.length - 1;
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [text, mounted]);

  function setText(next: string) { setTextState(next); }
  function undo() { const h = hist.current; if (h.idx > 0) { h.idx--; skipPush.current = true; setText(h.stack[h.idx]); } }
  function redo() { const h = hist.current; if (h.idx < h.stack.length - 1) { h.idx++; skipPush.current = true; setText(h.stack[h.idx]); } }

  function syncScroll() {
    if (taRef.current) {
      if (backRef.current) {
        backRef.current.scrollTop = taRef.current.scrollTop;
        backRef.current.scrollLeft = taRef.current.scrollLeft;
      }
      if (gutterRef.current) gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  }

  function withParsed(fn: (value: unknown) => string, label: string) {
    const r = parseJson(text);
    if (!r.ok) { toast.error(`Can't ${label}: ${r.error?.message}`); return; }
    setText(fn(r.value));
    toast.success(`${label} done`);
  }
  const doFormat = () => withParsed((v) => beautify(v, indent), "Format");
  const doMinify = () => withParsed((v) => minify(v), "Minify");
  const doSort = () => withParsed((v) => beautify(sortKeys(v), indent), "Sort keys");
  function doEscape() { if (!text) return; setText(escapeJson(text)); toast.success("Escaped"); }
  function doUnescape() {
    if (!text) return;
    try { setText(unescapeJson(text)); toast.success("Unescaped"); } catch { toast.error("Not a valid escaped string"); }
  }

  function jumpToError() {
    const err = parsed.error;
    if (!err || !taRef.current) return;
    const ta = taRef.current;
    const lineStart = text.split("\n").slice(0, err.line - 1).join("\n").length + (err.line > 1 ? 1 : 0);
    const pos = lineStart + (err.column - 1);
    ta.focus();
    ta.setSelectionRange(pos, pos);
    const lh = 24;
    ta.scrollTop = Math.max(0, (err.line - 4) * lh);
    syncScroll();
  }

  async function copyOut() {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { toast.error("Could not copy"); }
  }
  function exportJson() {
    if (!parsed.ok) { toast.error("Fix errors before exporting"); return; }
    downloadText(text, "data.json", "application/json");
    toast.success("Downloaded JSON");
  }
  function exportMin() {
    if (!parsed.ok) { toast.error("Fix errors first"); return; }
    downloadText(minify(parsed.value), "data.min.json", "application/json");
    toast.success("Downloaded minified");
  }
  function exportCsv() {
    if (!parsed.ok) { toast.error("Fix errors first"); return; }
    const r = toCsv(parsed.value);
    if (!r.ok) { toast.error(r.error ?? "Can't convert to CSV"); return; }
    downloadText(r.csv ?? "", "data.csv", "text/csv");
    toast.success("Downloaded CSV");
  }
  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result));
    reader.readAsText(file);
    toast.success(`Loaded ${file.name}`);
  }
  function saveSession() {
    if (!text.trim()) return;
    const next = [{ id: uid(), preview: text.replace(/\s+/g, " ").slice(0, 60), text, ts: Date.now() }, ...history].slice(0, 16);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
    toast.success("Session saved");
  }
  function persistHistory(next: HistoryItem[]) {
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); doFormat(); }
    else if (mod && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
    else if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const s = ta.selectionStart;
      const next = text.slice(0, s) + "  " + text.slice(ta.selectionEnd);
      setText(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
  }

  const compareResult = React.useMemo(() => {
    if (tab !== "diff" || !compareText.trim()) return null;
    const a = parseJson(text);
    const b = parseJson(compareText);
    if (!a.ok) return { error: "Left JSON is invalid." };
    if (!b.ok) return { error: "Right JSON is invalid." };
    return { entries: diffJson(a.value, b.value) };
  }, [tab, text, compareText]);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const gutterWidth = `${String(lines.length).length + 1}ch`;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="JSON summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat label="Keys" value={stats?.keys ?? 0} reduceMotion={!!reduceMotion} />
          <HeroStat label="Depth" value={stats?.maxDepth ?? 0} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-indigo-300/70">Size</div>
            <div className="font-heading text-2xl font-bold text-indigo-50 sm:text-3xl">{formatBytes(size)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-indigo-300/70">Status</div>
            <div className={cn("flex items-center gap-1.5 font-heading text-xl font-bold sm:text-2xl", parsed.ok ? "text-emerald-400" : "text-rose-400")}>
              {parsed.ok ? <><Check className="size-5" />Valid</> : <><AlertTriangle className="size-5" />Invalid</>}
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" size="sm" onClick={doFormat}><Wand2 className="size-4" />Format</Button>
        <Button type="button" size="sm" variant="outline" onClick={doMinify}><Minimize2 className="size-4" />Minify</Button>
        <Button type="button" size="sm" variant="outline" onClick={doSort}><FoldVertical className="size-4" />Sort keys</Button>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
          <Indent className="ml-1 size-3.5 text-muted-foreground" />
          {([2, 4, "tab"] as IndentType[]).map((v) => (
            <SegBtn key={String(v)} active={indent === v} onClick={() => setIndent(v)} label={v === "tab" ? "Tab" : `${v}sp`} />
          ))}
        </div>
        <ToolBtn onClick={doEscape} label="Escape" />
        <ToolBtn onClick={doUnescape} label="Unescape" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={undo} icon={<Undo2 className="size-3.5" />} label="Undo" />
        <ToolBtn onClick={redo} icon={<Redo2 className="size-3.5" />} label="Redo" />
        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn onClick={() => setText(SAMPLE_JSON)} icon={<Sparkles className="size-3.5" />} label="Sample" />
          <ToolBtn onClick={() => setText("")} icon={<Trash2 className="size-3.5" />} label="Clear" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Editor */}
        <div className="min-w-0 space-y-3">
          <div
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <FileJson className="size-4 text-indigo-300" />
              <span className="font-mono text-xs text-slate-300">input.json</span>
              <span className="ml-auto font-mono text-[11px] text-slate-500">{lines.length} lines · {formatBytes(size)}</span>
            </div>
            <div className="flex h-[440px] font-mono text-[13px] leading-6">
              <div ref={gutterRef} className="select-none overflow-hidden border-r border-white/5 bg-white/[0.02] py-3 pr-2 text-right text-slate-600" style={{ minWidth: `calc(${gutterWidth} + 1rem)` }} aria-hidden="true">
                {lines.map((_, i) => (
                  <div key={i} className={cn("px-1", !parsed.ok && parsed.error?.line === i + 1 && "bg-rose-500/20 text-rose-400")}>{i + 1}</div>
                ))}
              </div>
              <div className="relative flex-1">
                <pre ref={backRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-3 text-slate-100", EDITOR_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightJson(text) + "\n" }} />
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onScroll={syncScroll}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  aria-label="JSON input"
                  className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-transparent caret-white outline-none selection:bg-indigo-400/30"
                />
              </div>
            </div>
          </div>

          {/* Validation status (keyed entrance — no mode="wait" so it never sticks) */}
          <motion.div
            key={parsed.ok ? "ok" : "err"}
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {parsed.ok ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />Valid JSON{stats ? ` · ${stats.nodes} nodes` : ""}
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="size-4" />{parsed.error?.message}
                  <span className="text-xs font-normal text-rose-500/80">line {parsed.error?.line}, col {parsed.error?.column}</span>
                  <button type="button" onClick={jumpToError} className="ml-auto rounded-md border border-rose-500/30 px-2 py-0.5 text-xs hover:bg-rose-500/10">Jump</button>
                </div>
                {parsed.error?.hint && <p className="mt-1 text-xs text-muted-foreground">{parsed.error.hint}</p>}
              </div>
            )}
          </motion.div>

          {/* Export bar */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyOut}><Copy className="size-4" />Copy</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportJson}><Download className="size-4" />JSON</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportMin}><Download className="size-4" />Min</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportCsv}><Download className="size-4" />CSV</Button>
            <Button type="button" variant="outline" size="sm" onClick={saveSession}><Clock className="size-4" />Save</Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              <FileUp className="size-4" />Import
              <input type="file" accept=".json,.txt,application/json,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            </label>
          </div>

          {history.length > 0 && (
            <section className="rounded-2xl border border-border/70 bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Clock className="size-3.5" />Recent</h2>
                <button type="button" onClick={() => persistHistory([])} className="text-xs text-muted-foreground hover:text-rose-500">Clear</button>
              </div>
              <ul className="space-y-1 list-none">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center gap-2">
                    <button type="button" onClick={() => setText(h.text)} className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={h.preview}>{h.preview}</button>
                    <button type="button" onClick={() => persistHistory(history.filter((x) => x.id !== h.id))} aria-label="Delete" className="shrink-0 text-muted-foreground hover:text-rose-500"><X className="size-3.5" /></button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right panel */}
        <div className="min-w-0 space-y-3">
          <div className="flex gap-1 rounded-xl border border-border/70 bg-card p-1">
            <TabBtn active={tab === "tree"} onClick={() => setTab("tree")} icon={<ListTree className="size-4" />} label="Tree" />
            <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={<Hash className="size-4" />} label="Stats" />
            <TabBtn active={tab === "diff"} onClick={() => setTab("diff")} icon={<ArrowRightLeft className="size-4" />} label="Diff" />
          </div>

          {tab === "tree" && (
            <section className="rounded-2xl border border-border/70 bg-card">
              <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-2">
                <div className="relative min-w-[140px] flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={treeSearch} onChange={(e) => setTreeSearch(e.target.value)} placeholder="Search keys & values…" className="h-8 rounded-lg pl-8 text-sm" aria-label="Search JSON" />
                </div>
                <button type="button" onClick={() => { setOpenAll(true); setTreeKey((k) => k + 1); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><UnfoldVertical className="size-3.5" />Expand</button>
                <button type="button" onClick={() => { setOpenAll(false); setTreeKey((k) => k + 1); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><FoldVertical className="size-3.5" />Collapse</button>
              </div>
              <div className="max-h-[460px] overflow-auto p-3 font-mono text-[13px]">
                {parsed.ok ? (
                  <TreeNode key={treeKey} k={null} value={parsed.value} path="$" depth={0} openAll={openAll || treeSearch.trim().length > 0} search={treeSearch.trim().toLowerCase()} />
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">Fix the JSON to explore the tree.</p>
                )}
              </div>
            </section>
          )}

          {tab === "stats" && (
            <StatsPanel stats={stats} valid={parsed.ok} health={health} value={parsed.value} size={size} reduceMotion={!!reduceMotion} />
          )}

          {tab === "diff" && (
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="cmp">Compare against (JSON B)</label>
                <textarea id="cmp" value={compareText} onChange={(e) => setCompareText(e.target.value)} rows={6} placeholder="Paste a second JSON document to diff against your editor…" className="w-full resize-none rounded-lg border border-input bg-background p-2.5 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
              </div>
              <DiffView result={compareResult} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tree node ────────────────────────────────────────────────────────────────

function valueType(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
function previewValue(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") return `{${Object.keys(v as object).length}}`;
  return String(v);
}
const TYPE_COLOR: Record<string, string> = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-amber-600 dark:text-amber-400",
  boolean: "text-fuchsia-600 dark:text-fuchsia-400",
  null: "text-rose-600 dark:text-rose-400",
};

function matches(value: unknown, key: string | null, q: string): boolean {
  if (!q) return false;
  if (key && key.toLowerCase().includes(q)) return true;
  if (Array.isArray(value)) return value.some((v) => matches(v, null, q));
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).some(([k, v]) => matches(v, k, q));
  return String(value).toLowerCase().includes(q);
}

function TreeNode({ k, value, path, depth, openAll, search }: { k: string | null; value: unknown; path: string; depth: number; openAll: boolean; search: string }) {
  const isContainer = value !== null && typeof value === "object";
  const [open, setOpen] = React.useState(openAll || depth < 1);
  const type = valueType(value);
  const keyHit = !!k && !!search && k.toLowerCase().includes(search);
  const valHit = !isContainer && !!search && String(value).toLowerCase().includes(search);

  function copyPath() {
    navigator.clipboard.writeText(path);
    toast.success(`Copied ${path}`);
  }

  if (!isContainer) {
    return (
      <div className="flex items-start gap-1.5 rounded py-0.5 hover:bg-muted/50">
        <span className="w-3.5 shrink-0" />
        {k !== null && (
          <button type="button" onClick={copyPath} title={`Copy ${path}`} className={cn("shrink-0 text-sky-600 hover:underline dark:text-sky-300", keyHit && "rounded bg-yellow-300/60 dark:bg-yellow-500/30")}>{k}:</button>
        )}
        <span className={cn("break-all", TYPE_COLOR[type] ?? "text-foreground", valHit && "rounded bg-yellow-300/60 dark:bg-yellow-500/30")}>
          {type === "string" ? `"${value as string}"` : String(value)}
        </span>
      </div>
    );
  }

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((v, idx) => [String(idx), v])
    : Object.entries(value as Record<string, unknown>);
  const open2 = openAll || open;

  return (
    <div>
      <div className="flex items-center gap-1 rounded py-0.5 hover:bg-muted/50">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open2 ? "Collapse" : "Expand"} className="shrink-0 text-muted-foreground">
          <ChevronRight className={cn("size-3.5 transition-transform", open2 && "rotate-90")} />
        </button>
        {k !== null && (
          <button type="button" onClick={copyPath} title={`Copy ${path}`} className={cn("shrink-0 text-sky-600 hover:underline dark:text-sky-300", keyHit && "rounded bg-yellow-300/60 dark:bg-yellow-500/30")}>{k}:</button>
        )}
        <span className="text-muted-foreground">{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>
        {!open2 && <span className="truncate text-xs text-muted-foreground/60">{previewValue(value)}</span>}
      </div>
      {open2 && (
        <div className="ml-3 border-l border-border/50 pl-3">
          {entries.map(([ck, cv]) => (
            <TreeNode key={ck} k={ck} value={cv} path={Array.isArray(value) ? `${path}[${ck}]` : `${path}.${ck}`} depth={depth + 1} openAll={openAll} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────

function StatsPanel({ stats, valid, health, value, size, reduceMotion }: { stats: Stats | null; valid: boolean; health: number; value: unknown; size: number; reduceMotion: boolean }) {
  const keys = React.useMemo(() => (valid ? extractKeys(value) : []), [valid, value]);
  if (!valid || !stats) {
    return <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">Fix the JSON to see statistics.</div>;
  }
  const cards = [
    { label: "Objects", value: stats.objects },
    { label: "Arrays", value: stats.arrays },
    { label: "Keys", value: stats.keys },
    { label: "Strings", value: stats.strings },
    { label: "Numbers", value: stats.numbers },
    { label: "Booleans", value: stats.booleans },
    { label: "Nulls", value: stats.nulls },
    { label: "Max depth", value: stats.maxDepth },
  ];
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Hash className="size-4 text-primary" />Structure</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Health</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", health >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>{health}/100</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
              <div className="font-heading text-lg font-bold tabular-nums"><AnimatedNumber value={c.value} reduceMotion={reduceMotion} /></div>
              <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Total nodes</span><span className="font-medium tabular-nums">{stats.nodes}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span className="font-medium">{formatBytes(size)}</span></div>
        </div>
      </section>
      {keys.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight"><Braces className="size-4 text-primary" />Unique keys ({keys.length})</h2>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-auto">
            {keys.map((key) => (
              <span key={key} className="rounded-md border border-border/60 bg-background px-2 py-0.5 font-mono text-[11px]">{key}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Diff view ────────────────────────────────────────────────────────────────

function DiffView({ result }: { result: { error?: string; entries?: DiffEntry[] } | null }) {
  if (!result) return <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">Paste a second JSON to see the differences.</p>;
  if (result.error) return <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{result.error}</p>;
  const entries = result.entries ?? [];
  if (!entries.length) return <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-600 dark:text-emerald-400"><Check className="mr-1 inline size-4" />The two documents are identical.</p>;
  const color: Record<string, string> = {
    added: "border-emerald-500/30 bg-emerald-500/5",
    removed: "border-rose-500/30 bg-rose-500/5",
    changed: "border-amber-500/30 bg-amber-500/5",
  };
  const tag: Record<string, string> = {
    added: "text-emerald-600 dark:text-emerald-400",
    removed: "text-rose-600 dark:text-rose-400",
    changed: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{entries.length} difference{entries.length === 1 ? "" : "s"}</p>
      <ul className="max-h-72 space-y-1.5 overflow-auto list-none">
        {entries.map((e, i) => (
          <li key={i} className={cn("rounded-lg border p-2 font-mono text-xs", color[e.type])}>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold uppercase", tag[e.type])}>{e.type}</span>
              <span className="truncate text-muted-foreground">{e.path}</span>
            </div>
            {e.type === "changed" && (
              <div className="mt-1 space-y-0.5">
                <div className="text-rose-500">- {JSON.stringify(e.a)}</div>
                <div className="text-emerald-500">+ {JSON.stringify(e.b)}</div>
              </div>
            )}
            {e.type === "added" && <div className="mt-1 text-emerald-500">+ {JSON.stringify(e.b)}</div>}
            {e.type === "removed" && <div className="mt-1 text-rose-500">- {JSON.stringify(e.a)}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function HeroStat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-indigo-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
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
function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon?: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted">{icon}{label}</button>;
}
function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{label}</button>;
}
function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
}
