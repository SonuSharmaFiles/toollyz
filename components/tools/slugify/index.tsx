"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  FileUp,
  Focus,
  Gauge,
  Hash,
  Link2,
  ListChecks,
  Maximize2,
  Minimize2,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Type,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { countWords } from "@/lib/tools/text/word-counter";
import {
  DEFAULT_OPTIONS,
  FORMAT_PRESETS,
  SEPARATORS,
  bulkSlugs,
  devUtilities,
  slugScore,
  slugify,
  type LetterCase,
  type Separator,
  type SlugLevel,
  type SlugOptions,
  type UnicodeMode,
} from "@/lib/tools/text/slugify";

const TEXT_KEY = "toollyz:slug-text";
const OPT_KEY = "toollyz:slug-options";
const BASE_KEY = "toollyz:slug-base";
const HISTORY_KEY = "toollyz:slug-history";

const SAMPLE = "10 Amazing CSS Tricks You Should Know in 2026!";

const LEVEL_STYLE: Record<SlugLevel, { text: string; ring: string; bg: string }> = {
  good: { text: "text-emerald-600 dark:text-emerald-400", ring: "text-emerald-500", bg: "bg-emerald-500/10" },
  ok: { text: "text-amber-600 dark:text-amber-400", ring: "text-amber-500", bg: "bg-amber-500/10" },
  poor: { text: "text-rose-600 dark:text-rose-400", ring: "text-rose-500", bg: "bg-rose-500/10" },
};

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
function downloadText(content: string, filename: string, mime = "text/plain") {
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
function csvEscape(s: string) {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Slugify() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<SlugOptions>(DEFAULT_OPTIONS);
  const [baseUrl, setBaseUrl] = React.useState("https://example.com");
  const [autoNumber, setAutoNumber] = React.useState(true);
  const [history, setHistory] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState("");
  const [focusMode, setFocusMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);

  const deferred = React.useDeferredValue(text);
  const lines = React.useMemo(
    () => deferred.split("\n").map((l) => l.trim()).filter(Boolean),
    [deferred],
  );
  const primarySource = lines[0] ?? "";
  const primarySlug = React.useMemo(() => slugify(primarySource, options), [primarySource, options]);
  const score = React.useMemo(
    () => slugScore(primarySlug, options, countWords(primarySource)),
    [primarySlug, options, primarySource],
  );
  const bulk = React.useMemo(() => bulkSlugs(deferred, options, autoNumber), [deferred, options, autoNumber]);
  const dev = React.useMemo(() => devUtilities(primarySource), [primarySource]);
  const isBulk = lines.length > 1;
  const fullUrl = `${baseUrl.replace(/\/+$/, "")}/${primarySlug}`;
  const dupCount = bulk.filter((r) => r.duplicate).length;

  const filteredBulk = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return bulk;
    return bulk.filter((r) => r.slug.toLowerCase().includes(q) || r.original.toLowerCase().includes(q));
  }, [bulk, filter]);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      if (t) setText(t);
      const o = localStorage.getItem(OPT_KEY);
      if (o) setOptions({ ...DEFAULT_OPTIONS, ...JSON.parse(o) });
      const b = localStorage.getItem(BASE_KEY);
      if (b) setBaseUrl(b);
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
      try { localStorage.setItem(TEXT_KEY, text); } catch { /* noop */ }
    }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
      localStorage.setItem(BASE_KEY, baseUrl);
    } catch { /* noop */ }
  }, [options, baseUrl, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    const t = primarySource;
    if (t.length < 4) return;
    const id = window.setTimeout(() => {
      setHistory((prev) => {
        if (prev[0] === t) return prev;
        const next = [t, ...prev.filter((x) => x !== t)].slice(0, 8);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    }, 1500);
    return () => window.clearTimeout(id);
  }, [primarySource, mounted]);

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function setOpt<K extends keyof SlugOptions>(key: K, value: SlugOptions[K]) {
    setOptions((o) => ({ ...o, [key]: value }));
  }
  function applyPreset(apply: Partial<SlugOptions>) {
    setOptions((o) => ({ ...o, ...apply }));
  }

  async function copy(value: string, label: string) {
    if (!value) { toast.error("Nothing to copy"); return; }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(label);
    } catch {
      toast.error("Could not copy");
    }
  }

  function copyAllSlugs() {
    const out = bulk.map((r) => r.slug).filter(Boolean).join("\n");
    if (!out) { toast.error("No slugs yet"); return; }
    copy(out, `Copied ${bulk.filter((r) => r.slug).length} slugs`);
  }
  function exportTxt() {
    const out = bulk.map((r) => r.slug).filter(Boolean).join("\n");
    if (!out) { toast.error("No slugs yet"); return; }
    downloadText(out, "toollyz-slugs.txt");
    toast.success("Exported TXT");
  }
  function exportCsv() {
    if (!bulk.length) { toast.error("No slugs yet"); return; }
    const rows = ["original,slug", ...bulk.map((r) => `${csvEscape(r.original)},${csvEscape(r.slug)}`)];
    downloadText(rows.join("\n"), "toollyz-slugs.csv", "text/csv");
    toast.success("Exported CSV");
  }

  async function loadFile(file: File) {
    if (/\.(docx?|pages|odt)$/i.test(file.name)) {
      toast.error("Word docs aren't supported — paste the text or upload a .txt/.csv file");
      return;
    }
    try {
      const content = await file.text();
      if (content.includes("PK") || isBinary(content)) {
        toast.error("That file isn't plain text. Try a .txt or .csv file.");
        return;
      }
      setText(content);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Could not read the file");
    }
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await shellRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast.error("Fullscreen unavailable");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const lvl = LEVEL_STYLE[score.level];

  return (
    <div ref={shellRef} className={cn("space-y-6", isFullscreen && "overflow-auto bg-background p-6")}>
      {/* Hero */}
      <section
        aria-label="Slug summary"
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-card to-violet-500/10 p-5 sm:p-6"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Gauge className="size-4 text-primary" />SEO score</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", lvl.text)}>
              <AnimatedNumber value={score.score} reduceMotion={!!reduceMotion} />
              <span className="text-base font-medium text-muted-foreground">/100</span>
            </div>
          </div>
          <HeroStat icon={<Hash className="size-4" />} label="Slug length" value={score.length} reduceMotion={!!reduceMotion} />
          <HeroStat icon={<Type className="size-4" />} label="Words" value={score.wordCount} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><ListChecks className="size-4 text-primary" />Lines</div>
            <div className="font-heading text-2xl font-bold tabular-nums sm:text-3xl">
              <AnimatedNumber value={lines.length} reduceMotion={!!reduceMotion} />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => copy(primarySlug, "Slug copied")} icon={<Copy className="size-3.5" />} label="Copy slug" />
        <ToolBtn onClick={() => { setText(""); taRef.current?.focus(); }} icon={<Trash2 className="size-3.5" />} label="Clear" />
        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn onClick={() => setFocusMode((f) => !f)} icon={<Focus className="size-3.5" />} label={focusMode ? "Exit focus" : "Focus"} active={focusMode} />
          <ToolBtn onClick={toggleFullscreen} icon={isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />} label="Fullscreen" />
        </div>
      </div>

      <div className={cn("grid gap-5", !focusMode && "lg:grid-cols-[1fr_340px]")}>
        {/* Left */}
        <div className="min-w-0 space-y-4">
          <div>
            <PanelLabel>Your text {isBulk && <span className="text-primary">· {lines.length} lines</span>}</PanelLabel>
            <Editor taRef={taRef} value={text} onChange={setText} onLoadFile={loadFile} heightClass={focusMode ? "h-[40vh]" : "h-[200px]"} />
          </div>

          {/* Primary URL preview */}
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <PanelLabel>Slug preview</PanelLabel>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", lvl.bg, lvl.text)}>
                <Check className="size-3" />URL-safe
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-3">
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 truncate font-mono text-sm">
                <span className="text-muted-foreground">{baseUrl.replace(/\/+$/, "")}/</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={primarySlug}
                    initial={{ opacity: reduceMotion ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="font-semibold text-primary"
                  >
                    {primarySlug || <span className="text-muted-foreground/50">your-slug-here</span>}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button type="button" onClick={() => copy(fullUrl, "URL copied")} aria-label="Copy URL" className="shrink-0 text-muted-foreground hover:text-foreground"><Link2 className="size-4" /></button>
              <button type="button" onClick={() => copy(primarySlug, "Slug copied")} aria-label="Copy slug" className="shrink-0 text-muted-foreground hover:text-foreground"><Copy className="size-4" /></button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} aria-label="Base URL" className="h-8 rounded-lg font-mono text-xs" placeholder="https://example.com" />
            </div>
          </section>

          {/* Bulk */}
          {isBulk && (
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <ListChecks className="size-4 text-primary" />Bulk slugs
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{bulk.length}</span>
                  {dupCount > 0 && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">{dupCount} dup</span>}
                </h2>
                <div className="flex items-center gap-1.5">
                  <ToolBtn onClick={() => setAutoNumber((v) => !v)} icon={<Hash className="size-3.5" />} label="Auto-number dupes" active={autoNumber} />
                </div>
              </div>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter slugs…" className="h-8 rounded-lg pl-9 text-sm" aria-label="Filter slugs" />
              </div>
              <ul className="max-h-80 space-y-1 overflow-auto list-none">
                {filteredBulk.map((r, i) => (
                  <li key={i} className={cn("flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5", r.duplicate ? "border-rose-400/40" : "border-border/60")}>
                    <span className="w-1/3 shrink-0 truncate text-xs text-muted-foreground" title={r.original}>{r.original}</span>
                    <code className="min-w-0 flex-1 truncate font-mono text-xs" title={r.slug}>{r.slug || "—"}</code>
                    {r.duplicate && <span className="shrink-0 text-[10px] font-semibold text-rose-500">dup</span>}
                    <button type="button" onClick={() => copy(r.slug, "Copied")} aria-label="Copy" className="shrink-0 text-muted-foreground hover:text-foreground"><Copy className="size-3.5" /></button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={copyAllSlugs}><Copy className="size-4" />Copy all</Button>
                <Button type="button" variant="outline" size="sm" onClick={exportTxt}><FileText className="size-4" />TXT</Button>
                <Button type="button" variant="outline" size="sm" onClick={exportCsv}><FileSpreadsheet className="size-4" />CSV</Button>
              </div>
            </section>
          )}

          {!focusMode && <DevUtilitiesCard items={dev} />}
          {!focusMode && history.length > 0 && (
            <HistoryRow history={history} onRestore={(t) => { setText(t); toast.success("Restored"); }} onClear={() => { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ } }} />
          )}
        </div>

        {/* Right: settings + SEO */}
        {!focusMode && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Settings2 className="size-4 text-primary" />Settings</h2>

              <Field label="Format presets">
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_PRESETS.map((p) => (
                    <button key={p.id} type="button" onClick={() => applyPreset(p.apply)} className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-muted">{p.label}</button>
                  ))}
                </div>
              </Field>

              <Field label="Separator">
                <div className="grid grid-cols-4 gap-1">
                  {SEPARATORS.map((s) => (
                    <SegBtn key={s.id} active={options.identifier === "none" && options.separator === s.id} disabled={options.identifier !== "none"} onClick={() => setOpt("separator", s.id as Separator)} label={s.id} />
                  ))}
                </div>
              </Field>

              <Field label="Case">
                <div className="grid grid-cols-3 gap-1">
                  {(["lower", "upper", "title"] as LetterCase[]).map((c) => (
                    <SegBtn key={c} active={options.identifier === "none" && options.letterCase === c} disabled={options.identifier !== "none"} onClick={() => setOpt("letterCase", c)} label={c === "lower" ? "abc" : c === "upper" ? "ABC" : "Abc"} />
                  ))}
                </div>
              </Field>

              <Field label="Unicode">
                <div className="grid grid-cols-2 gap-1">
                  {(["translit", "keep"] as UnicodeMode[]).map((u) => (
                    <SegBtn key={u} active={options.unicode === u} onClick={() => setOpt("unicode", u)} label={u === "translit" ? "Transliterate" : "Keep Unicode"} />
                  ))}
                </div>
              </Field>

              <Field label="Cleanup">
                <div className="flex flex-wrap gap-1.5">
                  <Toggle active={options.removeStopwords} onClick={() => setOpt("removeStopwords", !options.removeStopwords)} label="Stop words" />
                  <Toggle active={options.removeNumbers} onClick={() => setOpt("removeNumbers", !options.removeNumbers)} label="Numbers" />
                  <Toggle active={options.removeEmoji} onClick={() => setOpt("removeEmoji", !options.removeEmoji)} label="Emojis" />
                </div>
              </Field>

              <Field label="Max length (0 = none)">
                <Input type="number" min={0} value={options.maxLength} onChange={(e) => setOpt("maxLength", Math.max(0, Number(e.target.value)))} className="h-8 rounded-lg" />
              </Field>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Gauge className="size-4 text-primary" />SEO insights</h2>
              <div className="flex items-center gap-3">
                <ScoreRing score={score.score} level={score.level} reduceMotion={!!reduceMotion} />
                <div>
                  <p className={cn("text-sm font-semibold capitalize", lvl.text)}>{score.level === "good" ? "SEO-friendly" : score.level === "ok" ? "Decent" : "Needs work"}</p>
                  <p className="text-xs text-muted-foreground">{score.length} chars · {score.wordCount} words</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 list-none">
                {score.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <Wand2 className="mt-0.5 size-3 shrink-0 text-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>

      {focusMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-5 py-2 text-sm shadow-lg backdrop-blur">
            <code className="font-mono text-primary">{truncate(primarySlug || "—", 40)}</code>
            <span className={cn("font-semibold", lvl.text)}>{score.score}/100</span>
            <button type="button" onClick={() => setFocusMode(false)} className="text-primary hover:underline">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Developer utilities ────────────────────────────────────────────────────

function DevUtilitiesCard({ items }: { items: ReturnType<typeof devUtilities> }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-label="Developer utilities">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <FileText className="size-4 text-primary" />Developer &amp; CMS
      </h2>
      <ul className="grid gap-1.5 sm:grid-cols-2 list-none">
        {items.map((d) => (
          <DevRow key={d.label} label={d.label} value={d.value} hint={d.hint} />
        ))}
      </ul>
    </section>
  );
}

function DevRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  const [copied, setCopied] = React.useState(false);
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
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <code className="block truncate font-mono text-xs" title={value}>{value}</code>
      </div>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="shrink-0 text-muted-foreground hover:text-foreground">
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      </button>
    </li>
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
            {truncate(t, 36)}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Editor ─────────────────────────────────────────────────────────────────

function Editor({
  taRef, value, onChange, onLoadFile, heightClass,
}: {
  taRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  onLoadFile: (f: File) => void;
  heightClass: string;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border bg-card transition-colors", dragOver ? "border-primary ring-2 ring-primary/30" : "border-border/70", heightClass)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onLoadFile(f); }}
    >
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a title — or paste multiple lines to bulk-generate slugs…"
        spellCheck={false}
        aria-label="Text to slugify"
        className="h-full w-full resize-none bg-transparent px-5 py-4 font-sans text-[15px] leading-7 text-foreground caret-primary outline-none placeholder:text-muted-foreground/60"
      />
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-card/80 text-sm font-medium text-primary">
          <span className="flex items-center gap-2"><FileUp className="size-5" />Drop your text or CSV file</span>
        </div>
      )}
      <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground">
        <Download className="size-3.5" />Upload
      </button>
      <input ref={inputRef} type="file" accept=".txt,.md,.csv,.text,.log" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onLoadFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function HeroStat({ icon, label, value, reduceMotion }: { icon: React.ReactNode; label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><span className="text-primary">{icon}</span>{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
    </div>
  );
}

function ScoreRing({ score, level, reduceMotion }: { score: number; level: SlugLevel; reduceMotion: boolean }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
        <motion.circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className={LEVEL_STYLE[level].ring} stroke="currentColor" strokeDasharray={c} initial={{ strokeDashoffset: reduceMotion ? offset : c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums">{score}</span>
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

function SegBtn({ active, onClick, label, disabled }: { active: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={active} className={cn("rounded-md px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40", active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground/80 hover:bg-muted")}>
      {label}
    </button>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted")}>
      <span className={cn("inline-block size-1.5 rounded-full", active ? "bg-primary" : "bg-muted-foreground/40")} />
      {label}
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
