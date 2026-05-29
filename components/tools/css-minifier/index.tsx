"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileUp,
  Gauge,
  Info,
  Layers,
  Lightbulb,
  Minimize2,
  Redo2,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import {
  DEFAULT_OPTIONS,
  OPTION_GROUPS,
  PRESETS,
  SAMPLE_CSS,
  analyzeCss,
  beautifyCss,
  byteSize,
  computeAnalytics,
  formatBytes,
  highlightCss,
  lineDiff,
  minifyCss,
  validateCss,
  type Analytics,
  type CssIssue,
  type CssStats,
  type DiffLine,
  type Indent as IndentType,
  type MinifyOptions,
} from "@/lib/tools/css/css-tools";

const TEXT_KEY = "toollyz:css-text";
const OPTS_KEY = "toollyz:css-options";
const INDENT_KEY = "toollyz:css-indent";
const HISTORY_KEY = "toollyz:css-history";

type Tab = "output" | "settings" | "analytics" | "validate" | "compare" | "bulk";
interface HistoryItem { id: string; preview: string; text: string; ts: number }
interface BulkItem { id: string; name: string; content: string }

function uid() { return Math.random().toString(36).slice(2, 10); }

const EDITOR_TOKENS =
  "[&_.c-sel]:text-sky-300 [&_.c-prop]:text-violet-300 [&_.c-val]:text-emerald-300 [&_.c-com]:italic [&_.c-com]:text-slate-500 [&_.c-at]:text-fuchsia-300 [&_.c-num]:text-amber-300 [&_.c-punc]:text-slate-400";

export default function CssMinifier() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setTextState] = React.useState("");
  const [options, setOptions] = React.useState<MinifyOptions>(DEFAULT_OPTIONS);
  const [indent, setIndent] = React.useState<IndentType>(2);
  const [tab, setTab] = React.useState<Tab>("output");
  const [compareText, setCompareText] = React.useState("");
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [bulk, setBulk] = React.useState<BulkItem[]>([]);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const backRef = React.useRef<HTMLPreElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);
  const hist = React.useRef<{ stack: string[]; idx: number }>({ stack: [""], idx: 0 });
  const skipPush = React.useRef(false);

  const deferred = React.useDeferredValue(text);
  const minified = React.useMemo(() => minifyCss(deferred, options), [deferred, options]);
  const issues = React.useMemo(() => validateCss(deferred), [deferred]);
  const stats: CssStats = React.useMemo(() => analyzeCss(deferred), [deferred]);
  const analytics: Analytics = React.useMemo(() => computeAnalytics(deferred, minified, issues), [deferred, minified, issues]);
  const lines = React.useMemo(() => text.split("\n"), [text]);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      setTextState(t ?? SAMPLE_CSS);
      const o = localStorage.getItem(OPTS_KEY);
      if (o) setOptions({ ...DEFAULT_OPTIONS, ...JSON.parse(o) });
      const ind = localStorage.getItem(INDENT_KEY);
      if (ind) setIndent(ind === "tab" ? "tab" : (Number(ind) as IndentType));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch { setTextState(SAMPLE_CSS); }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => { try { localStorage.setItem(TEXT_KEY, text); } catch { /* noop */ } }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(OPTS_KEY, JSON.stringify(options)); } catch { /* noop */ } }, [options, mounted]);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(INDENT_KEY, String(indent)); } catch { /* noop */ } }, [indent, mounted]);

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

  function doMinify() {
    if (!text.trim()) { toast.error("Nothing to minify"); return; }
    const result = minifyCss(text, options);
    setText(result);
    const saved = byteSize(text) - byteSize(result);
    toast.success(saved > 0 ? `Minified — saved ${formatBytes(saved)}` : "Minified");
  }
  function doBeautify() {
    if (!text.trim()) { toast.error("Nothing to format"); return; }
    setText(beautifyCss(text, indent));
    toast.success("Beautified");
  }
  function applyPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) { setOptions({ ...preset.options }); toast.success(`${preset.name} preset applied`); }
  }
  function toggleOption(key: keyof MinifyOptions) { setOptions((o) => ({ ...o, [key]: !o[key] })); }

  async function copyMinified() {
    if (!minified) return;
    try { await navigator.clipboard.writeText(minified); toast.success("Minified CSS copied"); } catch { toast.error("Could not copy"); }
  }
  function exportMin() { if (!minified) { toast.error("Nothing to export"); return; } downloadText(minified, "styles.min.css", "text/css"); toast.success("Downloaded minified CSS"); }
  function exportSource() { if (!text) { toast.error("Nothing to export"); return; } downloadText(text, "styles.css", "text/css"); toast.success("Downloaded CSS"); }
  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result));
    reader.readAsText(file);
    toast.success(`Loaded ${file.name}`);
  }
  function addBulkFiles(files: FileList) {
    const next: BulkItem[] = [];
    let pending = files.length;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        next.push({ id: uid(), name: file.name, content: String(reader.result) });
        pending--;
        if (pending === 0) { setBulk((b) => [...b, ...next]); setTab("bulk"); toast.success(`Queued ${next.length} file${next.length === 1 ? "" : "s"}`); }
      };
      reader.readAsText(file);
    });
  }
  function saveSession() {
    if (!text.trim()) return;
    const next = [{ id: uid(), preview: text.replace(/\s+/g, " ").slice(0, 60), text, ts: Date.now() }, ...history].slice(0, 16);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
    toast.success("Session saved");
  }
  function persistHistory(next: HistoryItem[]) { setHistory(next); try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ } }

  function jumpToLine(line: number) {
    const ta = taRef.current;
    if (!ta || line < 1) return;
    const pos = text.split("\n").slice(0, line - 1).join("\n").length + (line > 1 ? 1 : 0);
    ta.focus();
    ta.setSelectionRange(pos, pos);
    ta.scrollTop = Math.max(0, (line - 4) * 24);
    syncScroll();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); doMinify(); }
    else if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); doBeautify(); }
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

  const activePreset = PRESETS.find((p) => JSON.stringify(p.options) === JSON.stringify(options))?.id ?? null;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
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
      <section aria-label="Optimization summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Original</div>
            <div className="font-heading text-2xl font-bold text-sky-50 sm:text-3xl">{formatBytes(analytics.originalBytes)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Minified</div>
            <div className="font-heading text-2xl font-bold text-emerald-300 sm:text-3xl">{formatBytes(analytics.minifiedBytes)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Saved</div>
            <div className="font-heading text-2xl font-bold text-sky-50 sm:text-3xl tabular-nums"><AnimatedNumber value={Math.round(analytics.savedPercent)} reduceMotion={!!reduceMotion} />%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Score</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", analytics.score >= 80 ? "text-emerald-300" : analytics.score >= 50 ? "text-amber-300" : "text-rose-300")}>
              <AnimatedNumber value={analytics.score} reduceMotion={!!reduceMotion} /><span className="text-base text-sky-300/60">/100</span>
            </div>
          </div>
        </div>
        <div className="relative mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-sky-300/70">
            <span>Compression</span>
            <span className="tabular-nums">{formatBytes(analytics.savedBytes)} smaller</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" initial={false} animate={{ width: `${Math.min(100, Math.max(3, analytics.ratio * 100))}%` }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" size="sm" onClick={doMinify}><Minimize2 className="size-4" />Minify CSS</Button>
        <Button type="button" size="sm" variant="outline" onClick={doBeautify}><Wand2 className="size-4" />Beautify</Button>
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Preset">
          {PRESETS.map((p) => (<SegBtn key={p.id} active={activePreset === p.id} onClick={() => applyPreset(p.id)} label={p.name} title={p.description} />))}
        </div>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={undo} icon={<Undo2 className="size-3.5" />} label="Undo" />
        <ToolBtn onClick={redo} icon={<Redo2 className="size-3.5" />} label="Redo" />
        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn onClick={() => setText(SAMPLE_CSS)} icon={<Sparkles className="size-3.5" />} label="Sample" />
          <ToolBtn onClick={() => setText("")} icon={<Trash2 className="size-3.5" />} label="Clear" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <div
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files; if (f && f.length > 1) addBulkFiles(f); else if (f?.[0]) loadFile(f[0]); }}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <FileCode2 className="size-4 text-sky-300" />
              <span className="font-mono text-xs text-slate-300">styles.css</span>
              <span className="ml-auto font-mono text-[11px] text-slate-500">{lines.length} lines · {formatBytes(analytics.originalBytes)}</span>
            </div>
            <div className="flex h-[440px] font-mono text-[13px] leading-6">
              <div ref={gutterRef} className="select-none overflow-hidden border-r border-white/5 bg-white/[0.02] py-3 pr-2 text-right text-slate-600" style={{ minWidth: `calc(${gutterWidth} + 1rem)` }} aria-hidden="true">
                {lines.map((_, idx) => (<div key={idx} className="px-1">{idx + 1}</div>))}
              </div>
              <div className="relative flex-1">
                <pre ref={backRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-3 text-slate-100", EDITOR_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightCss(text) + "\n" }} />
                <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} onScroll={syncScroll} onKeyDown={onKeyDown} spellCheck={false} aria-label="CSS input" className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-transparent caret-white outline-none selection:bg-sky-400/30" />
              </div>
            </div>
          </div>

          <motion.div key={errorCount === 0 ? "ok" : "err"} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            {errorCount === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />{warnCount === 0 ? "No issues found" : `Valid · ${warnCount} suggestion${warnCount === 1 ? "" : "s"}`}
                <button type="button" onClick={() => setTab("validate")} className="ml-auto rounded-md border border-emerald-500/30 px-2 py-0.5 text-xs hover:bg-emerald-500/10">Details</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-4" />{errorCount} error{errorCount === 1 ? "" : "s"}{warnCount ? ` · ${warnCount} warning${warnCount === 1 ? "" : "s"}` : ""}
                <button type="button" onClick={() => setTab("validate")} className="ml-auto rounded-md border border-rose-500/30 px-2 py-0.5 text-xs hover:bg-rose-500/10">Review</button>
              </div>
            )}
          </motion.div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyMinified}><Copy className="size-4" />Copy min</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportMin}><Download className="size-4" />.min.css</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportSource}><Download className="size-4" />.css</Button>
            <Button type="button" variant="outline" size="sm" onClick={saveSession}><Clock className="size-4" />Save</Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              <FileUp className="size-4" />Import
              <input type="file" accept=".css,.txt,text/css,text/plain" multiple className="hidden" onChange={(e) => { const f = e.target.files; if (f && f.length > 1) addBulkFiles(f); else if (f?.[0]) loadFile(f[0]); e.target.value = ""; }} />
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

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1">
            <TabBtn active={tab === "output"} onClick={() => setTab("output")} icon={<Code2 className="size-4" />} label="Output" />
            <TabBtn active={tab === "settings"} onClick={() => setTab("settings")} icon={<Settings2 className="size-4" />} label="Settings" />
            <TabBtn active={tab === "analytics"} onClick={() => setTab("analytics")} icon={<Gauge className="size-4" />} label="Analytics" />
            <TabBtn active={tab === "validate"} onClick={() => setTab("validate")} icon={<AlertTriangle className="size-4" />} label="Validate" badge={errorCount + warnCount || undefined} />
            <TabBtn active={tab === "compare"} onClick={() => setTab("compare")} icon={<ArrowRightLeft className="size-4" />} label="Compare" />
            <TabBtn active={tab === "bulk"} onClick={() => setTab("bulk")} icon={<Layers className="size-4" />} label="Bulk" badge={bulk.length || undefined} />
          </div>

          {tab === "output" && (
            <section className="rounded-2xl border border-border/70 bg-card">
              <div className="flex items-center gap-2 border-b border-border/60 p-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Minimize2 className="size-3.5" />Minified output</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">−{Math.round(analytics.savedPercent)}% · {formatBytes(analytics.minifiedBytes)}</span>
                <div className="ml-auto flex gap-1.5">
                  <Button type="button" size="sm" variant="outline" onClick={copyMinified}><Copy className="size-4" />Copy</Button>
                  <Button type="button" size="sm" variant="outline" onClick={exportMin}><Download className="size-4" /></Button>
                </div>
              </div>
              <div className="max-h-[460px] overflow-auto p-3">
                {minified ? (
                  <pre className={cn("whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-slate-800 dark:text-slate-100", EDITOR_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightCss(minified) }} />
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">Type or paste CSS to see the minified result.</p>
                )}
              </div>
            </section>
          )}

          {tab === "settings" && (
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Zap className="size-4 text-primary" />Optimization presets</h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PRESETS.map((p) => (
                    <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className={cn("rounded-xl border p-3 text-left transition-colors", activePreset === p.id ? "border-primary bg-primary/5" : "border-border/60 bg-background hover:bg-muted")}>
                      <div className="flex items-center gap-1.5 text-sm font-medium">{p.name}{activePreset === p.id && <Check className="size-3.5 text-primary" />}</div>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 border-t border-border/60 pt-4">
                {OPTION_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</h3>
                    <div className="space-y-1.5">
                      {group.options.map((opt) => (<Toggle key={opt.key} checked={options[opt.key]} onChange={() => toggleOption(opt.key)} label={opt.label} description={opt.description} aggressive={opt.aggressive} />))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "analytics" && <AnalyticsPanel analytics={analytics} stats={stats} reduceMotion={!!reduceMotion} options={options} issues={issues} />}

          {tab === "validate" && <ValidatePanel issues={issues} onJump={jumpToLine} />}

          {tab === "compare" && <ComparePanel original={text} minified={minified} compareText={compareText} setCompareText={setCompareText} analytics={analytics} />}

          {tab === "bulk" && <BulkPanel bulk={bulk} setBulk={setBulk} options={options} onAdd={addBulkFiles} />}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics panel ─────────────────────────────────────────────────────────

function buildRecommendations(options: MinifyOptions, issues: CssIssue[], stats: CssStats): string[] {
  const tips: string[] = [];
  if (issues.some((i) => i.severity === "error")) tips.push("Fix the bracket errors in the Validate tab — broken CSS can't be safely minified.");
  if (!options.zeroUnits) tips.push("Enable “Strip units on zero” (Aggressive preset) to trim 0px → 0.");
  if (!options.shortenHex) tips.push("Turn on “Shorten hex colors” to collapse #ffffff → #fff.");
  if (stats.imports > 0) tips.push(`${stats.imports} @import rule${stats.imports === 1 ? "" : "s"} block parallel downloads — bundle them where possible.`);
  if (!options.removeEmptyRules) tips.push("Enable “Remove empty rules” to drop selectors with no declarations.");
  tips.push("For dead-code removal across files, pair this with a tool like PurgeCSS in your build.");
  return tips.slice(0, 4);
}

function AnalyticsPanel({ analytics, stats, reduceMotion, options, issues }: { analytics: Analytics; stats: CssStats; reduceMotion: boolean; options: MinifyOptions; issues: CssIssue[] }) {
  const cards = [
    { label: "Original size", value: formatBytes(analytics.originalBytes) },
    { label: "Minified size", value: formatBytes(analytics.minifiedBytes) },
    { label: "Bytes saved", value: formatBytes(analytics.savedBytes) },
    { label: "Reduction", value: `${analytics.savedPercent.toFixed(1)}%` },
  ];
  const structure = [
    { label: "Rules", value: stats.rules },
    { label: "Selectors", value: stats.selectors },
    { label: "Declarations", value: stats.declarations },
    { label: "@media", value: stats.mediaQueries },
    { label: "@keyframes", value: stats.keyframes },
    { label: "Colors", value: stats.colors },
    { label: "Max nesting", value: stats.maxDepth },
    { label: "@imports", value: stats.imports },
  ];
  const recommendations = buildRecommendations(options, issues, stats);
  const loadLabel = analytics.loadTimeSavedMs >= 1000 ? `${(analytics.loadTimeSavedMs / 1000).toFixed(2)} s` : `${analytics.loadTimeSavedMs} ms`;

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Gauge className="size-4 text-primary" />Optimization</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Score</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", analytics.score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : analytics.score >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400")}>{analytics.score}/100</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
              <div className="font-heading text-lg font-bold tabular-nums">{c.value}</div>
              <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <BarRow label="Original" value={analytics.originalBytes} max={analytics.originalBytes} tone="muted" text={formatBytes(analytics.originalBytes)} reduceMotion={reduceMotion} />
          <BarRow label="Minified" value={analytics.minifiedBytes} max={analytics.originalBytes} tone="accent" text={formatBytes(analytics.minifiedBytes)} reduceMotion={reduceMotion} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Characters</span><span className="font-medium tabular-nums">{analytics.originalChars.toLocaleString()} → {analytics.minifiedChars.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Lines</span><span className="font-medium tabular-nums">{analytics.originalLines.toLocaleString()} → {analytics.minifiedLines.toLocaleString()}</span></div>
          <div className="col-span-2 flex justify-between"><span className="text-muted-foreground">Est. load time saved (slow 3G)</span><span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">{loadLabel}</span></div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Layers className="size-4 text-primary" />Stylesheet analysis</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {structure.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
              <div className="font-heading text-lg font-bold tabular-nums"><AnimatedNumber value={c.value} reduceMotion={reduceMotion} /></div>
              <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight"><Lightbulb className="size-4 text-primary" />Recommendations</h2>
        <ul className="space-y-1.5 list-none">
          {recommendations.map((r, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground"><ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />{r}</li>))}
        </ul>
      </section>
    </div>
  );
}

function BarRow({ label, value, max, tone, text, reduceMotion }: { label: string; value: number; max: number; tone: "muted" | "accent"; text: string; reduceMotion: boolean }) {
  const pct = max > 0 ? Math.min(100, Math.max(2, (value / max) * 100)) : 2;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div className={cn("h-full rounded-full", tone === "accent" ? "bg-gradient-to-r from-sky-500 to-emerald-500" : "bg-muted-foreground/30")} initial={false} animate={{ width: `${pct}%` }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }} />
      </div>
      <span className="w-16 shrink-0 text-right text-xs font-medium tabular-nums">{text}</span>
    </div>
  );
}

// ─── Validate panel ──────────────────────────────────────────────────────────

function ValidatePanel({ issues, onJump }: { issues: CssIssue[]; onJump: (line: number) => void }) {
  if (issues.length === 0) {
    return (
      <section className="grid h-48 place-items-center rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 text-center">
        <div className="space-y-1">
          <Check className="mx-auto size-7 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">No issues found</p>
          <p className="text-xs text-muted-foreground">Your CSS is structurally balanced.</p>
        </div>
      </section>
    );
  }
  const order: Record<CssIssue["severity"], number> = { error: 0, warning: 1, info: 2 };
  const sorted = [...issues].sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);
  const tone: Record<CssIssue["severity"], string> = { error: "border-rose-500/30 bg-rose-500/5", warning: "border-amber-500/30 bg-amber-500/5", info: "border-sky-500/30 bg-sky-500/5" };
  const icon: Record<CssIssue["severity"], React.ReactNode> = { error: <AlertTriangle className="size-4 text-rose-500" />, warning: <AlertTriangle className="size-4 text-amber-500" />, info: <Info className="size-4 text-sky-500" /> };
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-3">
      <p className="mb-2 px-1 text-xs text-muted-foreground">{issues.length} item{issues.length === 1 ? "" : "s"} found.</p>
      <ul className="max-h-[460px] space-y-1.5 overflow-auto list-none">
        {sorted.map((issue, idx) => (
          <li key={idx} className={cn("rounded-lg border p-2.5", tone[issue.severity])}>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">{icon[issue.severity]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-foreground">{issue.message}</span>
                  {issue.line > 0 && (<button type="button" onClick={() => onJump(issue.line)} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted">line {issue.line}</button>)}
                </div>
                {issue.hint && <p className="mt-0.5 text-xs text-muted-foreground">{issue.hint}</p>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Compare panel ───────────────────────────────────────────────────────────

function ComparePanel({ original, minified, compareText, setCompareText, analytics }: { original: string; minified: string; compareText: string; setCompareText: (s: string) => void; analytics: Analytics }) {
  const diff: DiffLine[] = React.useMemo(() => {
    if (!compareText.trim()) return [];
    return lineDiff(original.split("\n"), compareText.split("\n"));
  }, [original, compareText]);
  const changed = diff.filter((l) => l.kind !== "same").length;

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60 text-center text-xs font-medium">
          <div className="p-2 text-muted-foreground">Original · {formatBytes(analytics.originalBytes)}</div>
          <div className="p-2 text-emerald-600 dark:text-emerald-400">Minified · {formatBytes(analytics.minifiedBytes)}</div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border/60">
          <pre className={cn("max-h-72 overflow-auto p-3 font-mono text-[11px] leading-relaxed", EDITOR_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightCss(original) }} />
          <pre className={cn("max-h-72 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-[11px] leading-relaxed", EDITOR_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightCss(minified) }} />
        </div>
        <div className="flex items-center justify-center gap-4 border-t border-border/60 p-2 text-xs">
          <span className="text-muted-foreground">Saved <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatBytes(analytics.savedBytes)}</span></span>
          <span className="text-muted-foreground">Reduction <span className="font-semibold text-emerald-600 dark:text-emerald-400">{analytics.savedPercent.toFixed(1)}%</span></span>
        </div>
      </section>

      <section className="space-y-2.5 rounded-2xl border border-border/70 bg-card p-3">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="cmp">Diff your CSS against another version</label>
        <textarea id="cmp" value={compareText} onChange={(e) => setCompareText(e.target.value)} rows={5} placeholder="Paste a second stylesheet to compare line by line…" className="w-full resize-none rounded-lg border border-input bg-background p-2.5 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
        {compareText.trim() ? (
          changed === 0 ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-600 dark:text-emerald-400"><Check className="mr-1 inline size-4" />The two versions are identical.</p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{changed} changed line{changed === 1 ? "" : "s"}</p>
              <div className="max-h-60 overflow-auto rounded-lg border border-border/60 bg-background p-2 font-mono text-[11px] leading-relaxed">
                {diff.map((l, idx) => (
                  <div key={idx} className={cn("whitespace-pre-wrap break-all", l.kind === "added" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", l.kind === "removed" && "bg-rose-500/10 text-rose-600 dark:text-rose-400", l.kind === "same" && "text-muted-foreground/70")}>
                    <span className="select-none opacity-60">{l.kind === "added" ? "+ " : l.kind === "removed" ? "- " : "  "}</span>{l.text || " "}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">Paste another version to see a line-by-line diff.</p>
        )}
      </section>
    </div>
  );
}

// ─── Bulk panel ──────────────────────────────────────────────────────────────

function downloadBulk(content: string, name: string) {
  const base = name.replace(/\.(css|txt)$/i, "");
  downloadText(content, `${base}.min.css`, "text/css");
}

function BulkPanel({ bulk, setBulk, options, onAdd }: { bulk: BulkItem[]; setBulk: React.Dispatch<React.SetStateAction<BulkItem[]>>; options: MinifyOptions; onAdd: (files: FileList) => void }) {
  const rows = React.useMemo(
    () => bulk.map((item) => {
      const min = minifyCss(item.content, options);
      const o = byteSize(item.content);
      const m = byteSize(min);
      return { ...item, min, originalBytes: o, minifiedBytes: m, saved: o > 0 ? ((o - m) / o) * 100 : 0 };
    }),
    [bulk, options],
  );
  const totals = rows.reduce((acc, r) => ({ o: acc.o + r.originalBytes, m: acc.m + r.minifiedBytes }), { o: 0, m: 0 });

  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-3">
      <div className="rounded-xl border border-dashed border-border bg-background p-5 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) onAdd(e.dataTransfer.files); }}>
        <Layers className="mx-auto mb-2 size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drop multiple CSS files here, or</p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />Choose files
          <input type="file" accept=".css,.txt,text/css,text/plain" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) onAdd(e.target.files); e.target.value = ""; }} />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">Each file is minified with your current settings, entirely in your browser.</p>
      </div>

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{rows.length} file{rows.length === 1 ? "" : "s"} · {formatBytes(totals.o)} → <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatBytes(totals.m)}</span></p>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => rows.forEach((r) => downloadBulk(r.min, r.name))} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Download className="size-3.5" />Download all</button>
              <button type="button" onClick={() => setBulk([])} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-rose-500">Clear</button>
            </div>
          </div>
          <ul className="space-y-1.5 list-none">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
                <FileCode2 className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs" title={r.name}>{r.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{formatBytes(r.originalBytes)} → {formatBytes(r.minifiedBytes)}</span>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">−{r.saved.toFixed(0)}%</span>
                <button type="button" onClick={() => downloadBulk(r.min, r.name)} aria-label={`Download ${r.name}`} className="shrink-0 text-muted-foreground hover:text-primary"><Download className="size-4" /></button>
                <button type="button" onClick={() => setBulk((b) => b.filter((x) => x.id !== r.id))} aria-label={`Remove ${r.name}`} className="shrink-0 text-muted-foreground hover:text-rose-500"><X className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

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

function Toggle({ checked, onChange, label, description, aggressive }: { checked: boolean; onChange: () => void; label: string; description: string; aggressive?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-background p-2.5 text-left transition-colors hover:bg-muted/50">
      <span className={cn("mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", checked ? "bg-primary" : "bg-muted-foreground/30")}>
        <span className={cn("size-4 rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-4")} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium leading-tight">
          {label}
          {aggressive && <span className="rounded bg-amber-500/15 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">aggressive</span>}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon?: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted">{icon}{label}</button>;
}
function SegBtn({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} title={title} className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{label}</button>;
}
function TabBtn({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>
      {icon}<span className="hidden sm:inline">{label}</span>
      {badge !== undefined && <span className={cn("rounded-full px-1.5 text-[10px] font-semibold tabular-nums", active ? "bg-primary-foreground/20" : "bg-muted-foreground/15")}>{badge}</span>}
    </button>
  );
}
