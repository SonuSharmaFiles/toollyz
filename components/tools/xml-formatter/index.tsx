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
  Code,
  Copy,
  Download,
  FileCode2,
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
  SAMPLE_XML,
  analyzeXml,
  beautifyXml,
  byteSize,
  escapeXml,
  formatBytes,
  healthScore,
  highlightXml,
  lineDiff,
  minifyXml,
  parseXml,
  removeEmptyNodes,
  sortAttributes,
  structurePaths,
  unescapeXml,
  xmlToJson,
  type Indent as IndentType,
  type XmlNode,
  type XmlStats,
} from "@/lib/tools/xml/xml-tools";

const TEXT_KEY = "toollyz:xml-text";
const INDENT_KEY = "toollyz:xml-indent";
const HISTORY_KEY = "toollyz:xml-history";

type Tab = "tree" | "stats" | "xpath" | "json" | "diff";
interface HistoryItem { id: string; preview: string; text: string; ts: number }

function uid() { return Math.random().toString(36).slice(2, 10); }
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
  "[&_.x-tag]:text-sky-300 [&_.x-attr]:text-amber-300 [&_.x-aval]:text-emerald-300 [&_.x-com]:italic [&_.x-com]:text-slate-500 [&_.x-cdata]:text-violet-300 [&_.x-pi]:text-fuchsia-300 [&_.x-ent]:text-rose-300 [&_.x-pun]:text-slate-500";

export default function XmlFormatter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setTextState] = React.useState("");
  const [indent, setIndent] = React.useState<IndentType>(2);
  const [tab, setTab] = React.useState<Tab>("tree");
  const [treeSearch, setTreeSearch] = React.useState("");
  const [treeKey, setTreeKey] = React.useState(0);
  const [openAll, setOpenAll] = React.useState(false);
  const [compareText, setCompareText] = React.useState("");
  const [xpath, setXpath] = React.useState("//product/name");
  const [xpathResult, setXpathResult] = React.useState<{ error?: string; items?: string[]; value?: string } | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const backRef = React.useRef<HTMLPreElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);
  const hist = React.useRef<{ stack: string[]; idx: number }>({ stack: [""], idx: 0 });
  const skipPush = React.useRef(false);

  const deferred = React.useDeferredValue(text);
  const parsed = React.useMemo(() => parseXml(deferred), [deferred]);
  const stats: XmlStats | null = React.useMemo(() => (parsed.ok && parsed.nodes ? analyzeXml(parsed.nodes) : null), [parsed]);
  const size = React.useMemo(() => byteSize(text), [text]);
  const health = healthScore(parsed.ok, stats);
  const lines = React.useMemo(() => text.split("\n"), [text]);

  const jsonOut = React.useMemo(() => {
    if (tab !== "json" || !parsed.ok || !parsed.nodes) return "";
    try { return JSON.stringify(xmlToJson(parsed.nodes), null, 2); } catch { return ""; }
  }, [tab, parsed]);

  const diffResult = React.useMemo(() => {
    if (tab !== "diff" || !compareText.trim()) return null;
    const a = parseXml(text);
    const b = parseXml(compareText);
    if (!a.ok || !a.nodes) return { error: "Left XML is invalid." };
    if (!b.ok || !b.nodes) return { error: "Right XML is invalid." };
    return { lines: lineDiff(beautifyXml(a.nodes, indent).split("\n"), beautifyXml(b.nodes, indent).split("\n")) };
  }, [tab, text, compareText, indent]);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      setTextState(t ?? SAMPLE_XML);
      const ind = localStorage.getItem(INDENT_KEY);
      if (ind) setIndent(ind === "tab" ? "tab" : (Number(ind) as IndentType));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch { setTextState(SAMPLE_XML); }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => { try { localStorage.setItem(TEXT_KEY, text); } catch { /* noop */ } }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(INDENT_KEY, String(indent)); } catch { /* noop */ }
  }, [indent, mounted]);

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
      if (backRef.current) { backRef.current.scrollTop = taRef.current.scrollTop; backRef.current.scrollLeft = taRef.current.scrollLeft; }
      if (gutterRef.current) gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  }

  function withParsed(fn: (nodes: XmlNode[]) => string, label: string) {
    const r = parseXml(text);
    if (!r.ok || !r.nodes) { toast.error(`Can't ${label}: ${r.error?.message}`); return; }
    setText(fn(r.nodes));
    toast.success(`${label} done`);
  }
  const doFormat = () => withParsed((nd) => beautifyXml(nd, indent), "Format");
  const doMinify = () => withParsed((nd) => minifyXml(nd), "Minify");
  const doSortAttrs = () => withParsed((nd) => beautifyXml(sortAttributes(nd), indent), "Sort attributes");
  const doRemoveEmpty = () => withParsed((nd) => beautifyXml(removeEmptyNodes(nd), indent), "Remove empty");
  function doEscape() { if (!text) return; setText(escapeXml(text)); toast.success("Escaped"); }
  function doUnescape() { if (!text) return; setText(unescapeXml(text)); toast.success("Unescaped"); }

  function jumpToError() {
    const err = parsed.error;
    if (!err || !taRef.current) return;
    const ta = taRef.current;
    const lineStart = text.split("\n").slice(0, err.line - 1).join("\n").length + (err.line > 1 ? 1 : 0);
    const pos = lineStart + (err.column - 1);
    ta.focus();
    ta.setSelectionRange(pos, pos);
    ta.scrollTop = Math.max(0, (err.line - 4) * 24);
    syncScroll();
  }

  async function copyOut() { if (!text) return; try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { toast.error("Could not copy"); } }
  function exportXml() { if (!parsed.ok) { toast.error("Fix errors first"); return; } downloadText(text, "data.xml", "application/xml"); toast.success("Downloaded XML"); }
  function exportMin() { if (!parsed.ok || !parsed.nodes) { toast.error("Fix errors first"); return; } downloadText(minifyXml(parsed.nodes), "data.min.xml", "application/xml"); toast.success("Downloaded minified"); }
  function exportJsonFile() { if (!parsed.ok || !parsed.nodes) { toast.error("Fix errors first"); return; } downloadText(JSON.stringify(xmlToJson(parsed.nodes), null, 2), "data.json", "application/json"); toast.success("Downloaded JSON"); }
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
  function persistHistory(next: HistoryItem[]) { setHistory(next); try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ } }

  function runXpath() {
    if (!parsed.ok) { setXpathResult({ error: "Fix the XML before running XPath." }); return; }
    try {
      const doc = new DOMParser().parseFromString(text, "application/xml");
      if (doc.querySelector("parsererror")) { setXpathResult({ error: "The browser couldn't parse this XML for XPath." }); return; }
      const res = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
      const t = res.resultType;
      if (t === XPathResult.NUMBER_TYPE) { setXpathResult({ value: String(res.numberValue) }); return; }
      if (t === XPathResult.STRING_TYPE) { setXpathResult({ value: JSON.stringify(res.stringValue) }); return; }
      if (t === XPathResult.BOOLEAN_TYPE) { setXpathResult({ value: String(res.booleanValue) }); return; }
      const items: string[] = [];
      const ser = new XMLSerializer();
      let node = res.iterateNext();
      while (node && items.length < 100) {
        if (node.nodeType === 1) items.push(ser.serializeToString(node));
        else if (node.nodeType === 2) items.push(`${(node as Attr).name}="${(node as Attr).value}"`);
        else items.push((node.nodeValue ?? "").trim());
        node = res.iterateNext();
      }
      setXpathResult({ items: items.filter(Boolean) });
    } catch (e) {
      setXpathResult({ error: `Invalid XPath: ${e instanceof Error ? e.message : "syntax error"}` });
    }
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
      setText(text.slice(0, s) + "  " + text.slice(ta.selectionEnd));
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
  }

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
      <section aria-label="XML summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat label="Elements" value={stats?.elements ?? 0} reduceMotion={!!reduceMotion} />
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
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
          <Indent className="ml-1 size-3.5 text-muted-foreground" />
          {([2, 4, "tab"] as IndentType[]).map((v) => (
            <SegBtn key={String(v)} active={indent === v} onClick={() => setIndent(v)} label={v === "tab" ? "Tab" : `${v}sp`} />
          ))}
        </div>
        <ToolBtn onClick={doSortAttrs} label="Sort attrs" />
        <ToolBtn onClick={doRemoveEmpty} label="Remove empty" />
        <ToolBtn onClick={doEscape} label="Escape" />
        <ToolBtn onClick={doUnescape} label="Unescape" />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={undo} icon={<Undo2 className="size-3.5" />} label="Undo" />
        <ToolBtn onClick={redo} icon={<Redo2 className="size-3.5" />} label="Redo" />
        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn onClick={() => setText(SAMPLE_XML)} icon={<Sparkles className="size-3.5" />} label="Sample" />
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
              <FileCode2 className="size-4 text-indigo-300" />
              <span className="font-mono text-xs text-slate-300">input.xml</span>
              <span className="ml-auto font-mono text-[11px] text-slate-500">{lines.length} lines · {formatBytes(size)}</span>
            </div>
            <div className="flex h-[440px] font-mono text-[13px] leading-6">
              <div ref={gutterRef} className="select-none overflow-hidden border-r border-white/5 bg-white/[0.02] py-3 pr-2 text-right text-slate-600" style={{ minWidth: `calc(${gutterWidth} + 1rem)` }} aria-hidden="true">
                {lines.map((_, idx) => (
                  <div key={idx} className={cn("px-1", !parsed.ok && parsed.error?.line === idx + 1 && "bg-rose-500/20 text-rose-400")}>{idx + 1}</div>
                ))}
              </div>
              <div className="relative flex-1">
                <pre ref={backRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-3 text-slate-100", EDITOR_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightXml(text) + "\n" }} />
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onScroll={syncScroll}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  aria-label="XML input"
                  className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-transparent caret-white outline-none selection:bg-indigo-400/30"
                />
              </div>
            </div>
          </div>

          {/* Validation (keyed entrance, no mode="wait") */}
          <motion.div key={parsed.ok ? "ok" : "err"} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            {parsed.ok ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />Well-formed XML{stats ? ` · ${stats.elements} elements` : ""}
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
            <Button type="button" variant="outline" size="sm" onClick={exportXml}><Download className="size-4" />XML</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportMin}><Download className="size-4" />Min</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportJsonFile}><Download className="size-4" />JSON</Button>
            <Button type="button" variant="outline" size="sm" onClick={saveSession}><Clock className="size-4" />Save</Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              <FileUp className="size-4" />Import
              <input type="file" accept=".xml,.txt,.rss,.svg,.xsd,application/xml,text/xml,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
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
          <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1">
            <TabBtn active={tab === "tree"} onClick={() => setTab("tree")} icon={<ListTree className="size-4" />} label="Tree" />
            <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={<Hash className="size-4" />} label="Stats" />
            <TabBtn active={tab === "xpath"} onClick={() => setTab("xpath")} icon={<Search className="size-4" />} label="XPath" />
            <TabBtn active={tab === "json"} onClick={() => setTab("json")} icon={<Braces className="size-4" />} label="JSON" />
            <TabBtn active={tab === "diff"} onClick={() => setTab("diff")} icon={<ArrowRightLeft className="size-4" />} label="Diff" />
          </div>

          {tab === "tree" && (
            <section className="rounded-2xl border border-border/70 bg-card">
              <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-2">
                <div className="relative min-w-[140px] flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={treeSearch} onChange={(e) => setTreeSearch(e.target.value)} placeholder="Search tags, attributes & text…" className="h-8 rounded-lg pl-8 text-sm" aria-label="Search XML" />
                </div>
                <button type="button" onClick={() => { setOpenAll(true); setTreeKey((kk) => kk + 1); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><UnfoldVertical className="size-3.5" />Expand</button>
                <button type="button" onClick={() => { setOpenAll(false); setTreeKey((kk) => kk + 1); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><FoldVertical className="size-3.5" />Collapse</button>
              </div>
              <div className="max-h-[460px] overflow-auto p-3 font-mono text-[13px]">
                {parsed.ok && parsed.nodes ? (
                  <div key={treeKey}>
                    {parsed.nodes.filter((nd) => nd.type !== "text" || nd.value.trim()).map((nd, idx) => (
                      <XmlTreeNode key={idx} node={nd} path="" depth={0} openAll={openAll || treeSearch.trim().length > 0} search={treeSearch.trim().toLowerCase()} />
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">Fix the XML to explore the tree.</p>
                )}
              </div>
            </section>
          )}

          {tab === "stats" && <StatsPanel stats={stats} valid={parsed.ok} health={health} nodes={parsed.nodes} size={size} reduceMotion={!!reduceMotion} />}

          {tab === "xpath" && (
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-3">
              <div className="flex gap-2">
                <Input value={xpath} onChange={(e) => setXpath(e.target.value)} placeholder="//tag[@attr='value']" className="h-9 rounded-lg font-mono text-sm" aria-label="XPath query" onKeyDown={(e) => e.key === "Enter" && runXpath()} />
                <Button type="button" size="sm" onClick={runXpath}><Search className="size-4" />Run</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["//product", "//product/name", "//product[@featured='true']", "//@id", "count(//product)"].map((q) => (
                  <button key={q} type="button" onClick={() => setXpath(q)} className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-muted">{q}</button>
                ))}
              </div>
              {xpathResult && (
                xpathResult.error ? (
                  <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{xpathResult.error}</p>
                ) : xpathResult.value !== undefined ? (
                  <div className="rounded-lg border border-border/60 bg-background p-3 font-mono text-sm">{xpathResult.value}</div>
                ) : (
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">{xpathResult.items?.length ?? 0} match{xpathResult.items?.length === 1 ? "" : "es"}</p>
                    <ul className="max-h-72 space-y-1 overflow-auto list-none">
                      {(xpathResult.items ?? []).map((it, idx) => (
                        <li key={idx} className="overflow-x-auto rounded-lg border border-border/60 bg-background p-2"><pre className="whitespace-pre font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{it}</pre></li>
                      ))}
                      {(xpathResult.items?.length ?? 0) === 0 && <li className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">No nodes matched.</li>}
                    </ul>
                  </div>
                )
              )}
            </section>
          )}

          {tab === "json" && (
            <section className="rounded-2xl border border-border/70 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 p-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Braces className="size-3.5" />XML → JSON</span>
                <Button type="button" size="sm" variant="outline" disabled={!parsed.ok} onClick={() => { navigator.clipboard.writeText(jsonOut); toast.success("JSON copied"); }}><Copy className="size-4" />Copy</Button>
              </div>
              <div className="max-h-[440px] overflow-auto p-3">
                {parsed.ok ? <pre className="whitespace-pre font-mono text-[12px] leading-relaxed text-foreground">{jsonOut}</pre> : <p className="py-10 text-center text-sm text-muted-foreground">Fix the XML to convert to JSON.</p>}
              </div>
            </section>
          )}

          {tab === "diff" && (
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="cmp">Compare against (XML B)</label>
                <textarea id="cmp" value={compareText} onChange={(e) => setCompareText(e.target.value)} rows={6} placeholder="Paste a second XML document to diff against your editor…" className="w-full resize-none rounded-lg border border-input bg-background p-2.5 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
              </div>
              <DiffView result={diffResult} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tree node ────────────────────────────────────────────────────────────────

function XmlTreeNode({ node, path, depth, openAll, search }: { node: XmlNode; path: string; depth: number; openAll: boolean; search: string }) {
  const [open, setOpen] = React.useState(openAll || depth < 1);
  const open2 = openAll || open;

  if (node.type === "text") {
    if (!node.value.trim()) return null;
    const hit = search && node.value.toLowerCase().includes(search);
    return <div className="flex gap-1.5 py-0.5 pl-5 text-foreground/80"><span className="text-muted-foreground">#text</span><span className={cn("break-all text-emerald-600 dark:text-emerald-400", hit && "rounded bg-yellow-300/60 dark:bg-yellow-500/30")}>{node.value.trim()}</span></div>;
  }
  if (node.type === "comment") return <div className="py-0.5 pl-5 italic text-slate-500">{`<!--${node.value.trim()}-->`}</div>;
  if (node.type === "cdata") return <div className="py-0.5 pl-5 text-violet-500">{`<![CDATA[${node.value.slice(0, 60)}]]>`}</div>;
  if (node.type === "pi" || node.type === "decl") return <div className="py-0.5 pl-5 text-fuchsia-500">{node.type === "decl" && node.value.startsWith("<") ? node.value : `<?${node.value}?>`}</div>;

  // element
  const myPath = `${path}/${node.name}`;
  const kids = node.children.filter((c) => c.type !== "text" || c.value.trim());
  const hasChildren = kids.length > 0;
  const keyHit = !!search && node.name.toLowerCase().includes(search);
  function copyPath() { navigator.clipboard.writeText(myPath); toast.success(`Copied ${myPath}`); }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded py-0.5 hover:bg-muted/50">
        {hasChildren ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open2 ? "Collapse" : "Expand"} className="shrink-0 text-muted-foreground"><ChevronRight className={cn("size-3.5 transition-transform", open2 && "rotate-90")} /></button>
        ) : <span className="w-3.5 shrink-0" />}
        <button type="button" onClick={copyPath} title={`Copy ${myPath}`} className={cn("shrink-0 text-sky-600 hover:underline dark:text-sky-300", keyHit && "rounded bg-yellow-300/60 dark:bg-yellow-500/30")}>&lt;{node.name}&gt;</button>
        {node.attrs.map((a) => {
          const aHit = !!search && (a.name.toLowerCase().includes(search) || a.value.toLowerCase().includes(search));
          return <span key={a.name} className={cn("text-xs", aHit && "rounded bg-yellow-300/60 dark:bg-yellow-500/30")}><span className="text-amber-600 dark:text-amber-400">{a.name}</span><span className="text-muted-foreground">=</span><span className="text-emerald-600 dark:text-emerald-400">&quot;{a.value}&quot;</span></span>;
        })}
        {!open2 && hasChildren && <span className="text-xs text-muted-foreground/60">…{kids.length}</span>}
      </div>
      {open2 && hasChildren && (
        <div className="ml-3 border-l border-border/50 pl-3">
          {kids.map((c, idx) => <XmlTreeNode key={idx} node={c} path={myPath} depth={depth + 1} openAll={openAll} search={search} />)}
        </div>
      )}
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────

function StatsPanel({ stats, valid, health, nodes, size, reduceMotion }: { stats: XmlStats | null; valid: boolean; health: number; nodes: XmlNode[] | undefined; size: number; reduceMotion: boolean }) {
  const paths = React.useMemo(() => (valid && nodes ? structurePaths(nodes) : []), [valid, nodes]);
  if (!valid || !stats) return <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">Fix the XML to see statistics.</div>;
  const cards = [
    { label: "Elements", value: stats.elements },
    { label: "Attributes", value: stats.attributes },
    { label: "Text nodes", value: stats.textNodes },
    { label: "Comments", value: stats.comments },
    { label: "CDATA", value: stats.cdata },
    { label: "Namespaces", value: stats.namespaces },
    { label: "Max depth", value: stats.maxDepth },
    { label: "Total nodes", value: stats.nodes },
  ];
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Hash className="size-4 text-primary" />Structure</h2>
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Health</span><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", health >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>{health}/100</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
              <div className="font-heading text-lg font-bold tabular-nums"><AnimatedNumber value={c.value} reduceMotion={reduceMotion} /></div>
              <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Size</span><span className="font-medium">{formatBytes(size)}</span></div>
      </section>
      {paths.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight"><Code className="size-4 text-primary" />Element paths ({paths.length})</h2>
          <div className="max-h-44 space-y-0.5 overflow-auto">
            {paths.map((p) => <div key={p} className="truncate font-mono text-[11px] text-muted-foreground">{p}</div>)}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Diff view ────────────────────────────────────────────────────────────────

function DiffView({ result }: { result: { error?: string; lines?: import("@/lib/tools/xml/xml-tools").DiffLine[] } | null }) {
  if (!result) return <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">Paste a second XML to see the differences.</p>;
  if (result.error) return <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{result.error}</p>;
  const lines = result.lines ?? [];
  const changed = lines.filter((l) => l.kind !== "same").length;
  if (!changed) return <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-600 dark:text-emerald-400"><Check className="mr-1 inline size-4" />The two documents are identical.</p>;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{changed} changed line{changed === 1 ? "" : "s"}</p>
      <div className="max-h-72 overflow-auto rounded-lg border border-border/60 bg-background p-2 font-mono text-[11px] leading-relaxed">
        {lines.map((l, idx) => (
          <div key={idx} className={cn("whitespace-pre", l.kind === "added" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", l.kind === "removed" && "bg-rose-500/10 text-rose-600 dark:text-rose-400", l.kind === "same" && "text-muted-foreground/70")}>
            <span className="select-none opacity-60">{l.kind === "added" ? "+ " : l.kind === "removed" ? "- " : "  "}</span>{l.text || " "}
          </div>
        ))}
      </div>
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
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
}
