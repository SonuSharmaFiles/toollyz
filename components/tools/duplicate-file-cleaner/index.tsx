"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Eraser,
  FileText,
  Files,
  Filter,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_DUP_OPTIONS,
  dedupeNames,
  renameTsv,
  suggestedList,
  type DupOptions,
} from "@/lib/tools/text/dup-files";

const TEXT_KEY = "toollyz:dupfiles-text";
const OPT_KEY = "toollyz:dupfiles-opts";

const SAMPLE = `report.pdf
report.pdf
photo.JPG
photo.jpg
notes.txt
report.pdf
invoice (2).pdf
invoice.pdf
invoice.pdf
budget.xlsx
.bashrc
.bashrc
slides.pptx`;

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

function isPattern(s: string | null): s is DupOptions["pattern"] {
  return s === "paren" || s === "dash" || s === "underscore" || s === "zero-padded";
}

export default function DuplicateFileCleaner() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<DupOptions>(DEFAULT_DUP_OPTIONS);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [showOnlyRenamed, setShowOnlyRenamed] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") {
          setOptions({
            ...DEFAULT_DUP_OPTIONS,
            ...parsed,
            pattern: isPattern(parsed.pattern) ? parsed.pattern : DEFAULT_DUP_OPTIONS.pattern,
          });
        }
      }
    } catch {
      setText(SAMPLE);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [text, options, mounted]);

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => dedupeNames(deferred, options), [deferred, options]);
  const visibleRows = showOnlyRenamed ? result.rows.filter((r) => r.renamed) : result.rows;

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Rename summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,114,182,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Input files" value={result.rows.length} reduceMotion={!!reduceMotion} />
          <Stat
            label="Duplicate groups"
            value={result.duplicateGroups}
            reduceMotion={!!reduceMotion}
            accent="text-rose-300"
          />
          <Stat
            label="Renames suggested"
            value={result.renamedCount}
            reduceMotion={!!reduceMotion}
            accent="text-amber-300"
          />
          <Stat
            label="Unique after"
            value={result.uniqueAfter}
            reduceMotion={!!reduceMotion}
            accent="text-emerald-300"
          />
        </div>
      </section>

      {/* Options */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Filter className="size-4 text-primary" />
          Rename rules
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Pattern</Label>
            <select
              value={options.pattern}
              onChange={(e) => setOptions((o) => ({ ...o, pattern: e.target.value as DupOptions["pattern"] }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="paren">name (2).ext</option>
              <option value="dash">name-2.ext</option>
              <option value="underscore">name_2.ext</option>
              <option value="zero-padded">name_002.ext</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Start counter at</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={options.start}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, start: Math.max(1, Math.min(1000, n)) }));
              }}
              className="font-mono"
            />
          </div>
          {options.pattern === "zero-padded" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Padding digits</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={options.digits}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n)) setOptions((o) => ({ ...o, digits: Math.max(1, Math.min(6, n)) }));
                }}
                className="font-mono"
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={options.ignoreCase}
            onChange={(v) => setOptions((o) => ({ ...o, ignoreCase: v }))}
            label="Case-insensitive"
            title="Photo.PNG and photo.png are treated as the same name."
          />
          <Toggle
            checked={options.ignoreExtension}
            onChange={(v) => setOptions((o) => ({ ...o, ignoreExtension: v }))}
            label="Ignore extension"
            title="foo.png and foo.jpg are treated as the same name."
          />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolBtn onClick={() => setText(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setText("")} icon={<Eraser className="size-3.5" />} label="Clear" />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="File list (paste names, one per line)">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder="report.pdf&#10;photo.jpg&#10;invoice.pdf"
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label="Suggested unique list" subtitle={`${result.uniqueAfter.toLocaleString()} unique`}>
          <textarea
            value={suggestedList(result.rows)}
            readOnly
            rows={14}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => copy(suggestedList(result.rows), "list")}>
              {copied === "list" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy list
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(suggestedList(result.rows), "unique-names.txt")}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => downloadText(renameTsv(result.rows), "rename-plan.tsv")}
            >
              <Download className="size-3.5" />
              Rename plan (TSV)
            </Button>
          </div>
        </Panel>
      </div>

      {/* Rename plan */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <FileText className="size-4 text-primary" />
            Side-by-side rename plan
          </h2>
          <Toggle
            checked={showOnlyRenamed}
            onChange={setShowOnlyRenamed}
            label="Show only renamed"
          />
        </div>
        {visibleRows.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            <AlertCircle className="size-3.5" />
            {showOnlyRenamed ? "No renames needed — every name is already unique." : "Paste a list above to see the plan."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Original</th>
                  <th className="px-3 py-2 text-left">Suggested</th>
                  <th className="px-3 py-2 text-left">Occurrence</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.slice(0, 300).map((r, i) => (
                  <tr key={i} className={cn("border-t border-border/40", r.renamed && "bg-amber-500/[0.06]")}>
                    <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{r.original}</td>
                    <td className="px-3 py-1.5 font-mono break-all">
                      {r.renamed ? (
                        <span className="text-amber-700 dark:text-amber-300">{r.suggested}</span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-300">{r.suggested}</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums text-muted-foreground">
                      {r.occurrence}/{r.totalOccurrences}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleRows.length > 300 && (
              <div className="border-t border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                Showing first 300 of {visibleRows.length.toLocaleString()} rows.
              </div>
            )}
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Files className="size-3" />
        Name normalisation runs entirely in your browser — Toollyz has no server. The rename plan is a
        suggestion; you still have to run the renames yourself with your file manager or a shell loop.
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
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
        {subtitle && <span className="text-xs text-muted-foreground tabular-nums">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  title?: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-border accent-primary"
      />
      {label}
    </label>
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
