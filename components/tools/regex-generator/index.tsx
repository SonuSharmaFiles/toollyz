"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  Eraser,
  Lock,
  Regex,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_BUILDER,
  PATTERN_CATEGORIES,
  PATTERN_LIBRARY,
  buildRegex,
  testRegex,
  type BuilderState,
  type CharClass,
  type PatternEntry,
} from "@/lib/tools/text/regex-builder";

const PATTERN_KEY = "toollyz:regex-pattern";
const FLAGS_KEY = "toollyz:regex-flags";
const TEST_KEY = "toollyz:regex-test";

export default function RegexGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"library" | "builder">("library");
  const [pattern, setPattern] = React.useState("");
  const [flags, setFlags] = React.useState("g");
  const [testInput, setTestInput] = React.useState("");
  const [builder, setBuilder] = React.useState<BuilderState>(DEFAULT_BUILDER);
  const [activeCategory, setActiveCategory] = React.useState<PatternEntry["category"] | "All">("All");
  const [search, setSearch] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setPattern(localStorage.getItem(PATTERN_KEY) ?? PATTERN_LIBRARY[0].pattern);
      setFlags(localStorage.getItem(FLAGS_KEY) ?? PATTERN_LIBRARY[0].flags);
      setTestInput(localStorage.getItem(TEST_KEY) ?? PATTERN_LIBRARY[0].sampleInput);
    } catch {
      setPattern(PATTERN_LIBRARY[0].pattern);
      setFlags(PATTERN_LIBRARY[0].flags);
      setTestInput(PATTERN_LIBRARY[0].sampleInput);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(PATTERN_KEY, pattern);
      localStorage.setItem(FLAGS_KEY, flags);
      localStorage.setItem(TEST_KEY, testInput);
    } catch {
      /* noop */
    }
  }, [pattern, flags, testInput, mounted]);

  const result = React.useMemo(() => testRegex(pattern, flags, testInput), [pattern, flags, testInput]);
  const built = React.useMemo(() => buildRegex(builder), [builder]);

  const visibleLibrary = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return PATTERN_LIBRARY.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.pattern.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, search]);

  function pickEntry(entry: PatternEntry) {
    setPattern(entry.pattern);
    setFlags(entry.flags);
    setTestInput(entry.sampleInput);
    setMode("library");
  }

  function applyBuilt() {
    setPattern(built.pattern);
    setFlags(built.flags);
    toast.success("Pattern from builder applied");
  }

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

  const fullExpression = `/${pattern}/${flags}`;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Regex summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative space-y-2">
          <div className="text-xs font-medium text-sky-300/70">Regex</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="break-all rounded-lg bg-black/30 px-3 py-1.5 font-mono text-base text-emerald-300 sm:text-lg">
              {fullExpression}
            </code>
            <Button type="button" size="sm" onClick={() => copy(fullExpression, "expr")}>
              {copied === "expr" ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <Stat label="Matches" value={result.matches.length} reduceMotion={!!reduceMotion} accent={result.ok ? "text-emerald-300" : "text-rose-300"} />
            <Stat label="Pattern length" value={pattern.length} reduceMotion={!!reduceMotion} />
            <Stat label="Flags" value={flags.length} reduceMotion={!!reduceMotion} />
            <div className="space-y-1">
              <div className="text-xs font-medium text-sky-300/70">Status</div>
              <div className={cn("font-heading text-base font-bold tracking-tight sm:text-lg", result.ok ? "text-emerald-300" : "text-rose-300")}>
                {result.ok ? "Valid" : "Invalid"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode picker */}
      <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
        <Seg active={mode === "library"} onClick={() => setMode("library")} label="Pattern library" />
        <Seg active={mode === "builder"} onClick={() => setMode("builder")} label="Visual builder" />
      </div>

      {mode === "library" ? (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Pattern library
            <span className="text-xs font-normal text-muted-foreground">
              {PATTERN_LIBRARY.length} curated
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              <Seg active={activeCategory === "All"} onClick={() => setActiveCategory("All")} label="All" />
              {PATTERN_CATEGORIES.map((c) => (
                <Seg key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} label={c} />
              ))}
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-8 max-w-xs"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLibrary.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickEntry(p)}
                className="rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm">{p.label}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                    /{p.flags}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{p.description}</p>
                <code className="mt-1.5 block break-all font-mono text-[10px] text-foreground/80">{p.pattern}</code>
              </button>
            ))}
            {visibleLibrary.length === 0 && (
              <div className="col-span-full flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
                <AlertCircle className="size-3.5" />
                No patterns match the filter.
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Wand2 className="size-4 text-primary" />
            Visual builder
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Character class</Label>
              <select
                value={builder.charClass}
                onChange={(e) => setBuilder((b) => ({ ...b, charClass: e.target.value as CharClass }))}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
              >
                <option value="letters">Letters [A-Za-z]</option>
                <option value="digits">Digits \d</option>
                <option value="alnum">Letters or digits</option>
                <option value="whitespace">Whitespace \s</option>
                <option value="word">Word characters \w</option>
                <option value="any">Anything .</option>
                <option value="custom">Custom set […]</option>
              </select>
            </div>
            {builder.charClass === "custom" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Custom characters</Label>
                <Input
                  value={builder.customClass}
                  onChange={(e) => setBuilder((b) => ({ ...b, customClass: e.target.value }))}
                  placeholder="A-Z0-9_"
                  className="font-mono"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Quantifier</Label>
              <select
                value={builder.quantifier}
                onChange={(e) => setBuilder((b) => ({ ...b, quantifier: e.target.value as BuilderState["quantifier"] }))}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
              >
                <option value="one">Exactly one</option>
                <option value="one-or-more">One or more (+)</option>
                <option value="zero-or-more">Zero or more (*)</option>
                <option value="optional">Optional (?)</option>
                <option value="exact">Exactly N</option>
                <option value="between">Between min and max</option>
              </select>
            </div>
            {builder.quantifier === "exact" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Exact count</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={builder.exact}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isFinite(n)) setBuilder((b) => ({ ...b, exact: Math.max(1, n) }));
                  }}
                  className="font-mono"
                />
              </div>
            )}
            {builder.quantifier === "between" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Min</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1000}
                    value={builder.betweenMin}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (Number.isFinite(n)) setBuilder((b) => ({ ...b, betweenMin: Math.max(0, n) }));
                    }}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Max</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={builder.betweenMax}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (Number.isFinite(n)) setBuilder((b) => ({ ...b, betweenMax: Math.max(1, n) }));
                    }}
                    className="font-mono"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Toggle
              checked={builder.startAnchor}
              onChange={(v) => setBuilder((b) => ({ ...b, startAnchor: v }))}
              label="Anchor at line start (^)"
            />
            <Toggle
              checked={builder.endAnchor}
              onChange={(v) => setBuilder((b) => ({ ...b, endAnchor: v }))}
              label="Anchor at line end ($)"
            />
            <Toggle
              checked={builder.flags.g}
              onChange={(v) => setBuilder((b) => ({ ...b, flags: { ...b.flags, g: v } }))}
              label="Global (g)"
            />
            <Toggle
              checked={builder.flags.i}
              onChange={(v) => setBuilder((b) => ({ ...b, flags: { ...b.flags, i: v } }))}
              label="Case-insensitive (i)"
            />
            <Toggle
              checked={builder.flags.m}
              onChange={(v) => setBuilder((b) => ({ ...b, flags: { ...b.flags, m: v } }))}
              label="Multiline (m)"
            />
            <Toggle
              checked={builder.flags.s}
              onChange={(v) => setBuilder((b) => ({ ...b, flags: { ...b.flags, s: v } }))}
              label="Dot-all (s)"
            />
          </div>
          <div className="space-y-1.5 rounded-xl border border-border/60 bg-background p-3">
            <code className="block break-all font-mono text-sm text-primary">/{built.pattern}/{built.flags}</code>
            <p className="text-[11px] text-muted-foreground">In plain English: {built.explanation}.</p>
            <div>
              <Button type="button" size="sm" onClick={applyBuilt}>
                Use this pattern below
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Tester */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Search className="size-4 text-primary" />
          Live tester
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Pattern</Label>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="font-mono"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Flags</Label>
            <Input
              value={flags}
              onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
              className="font-mono"
              maxLength={6}
              placeholder="g i m s u y"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Test input</Label>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        {!result.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-3.5" />
            {result.error}
          </div>
        )}
        {result.ok && (
          <div className="rounded-xl border border-border/60 bg-background p-3">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              {result.matches.length} match{result.matches.length === 1 ? "" : "es"}
            </div>
            {result.matches.length === 0 ? (
              <p className="text-xs text-muted-foreground">No matches in the test input.</p>
            ) : (
              <ul className="space-y-1 list-none">
                {result.matches.slice(0, 50).map((m, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-xs">
                    <span className="grid size-5 shrink-0 place-items-center rounded-md bg-muted text-[10px] text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300">{m.match}</span>
                    <span className="text-muted-foreground">@ {m.index}</span>
                    {m.groups && m.groups.length > 0 && m.groups.some(Boolean) && (
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        groups: {m.groups.map((g, j) => `(${j + 1}: ${g ?? ""})`).join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => copy(pattern, "p")}>
            <Copy className="size-3.5" />
            Copy pattern
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => copy(fullExpression, "full")}>
            <Copy className="size-3.5" />
            Copy /pattern/flags
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setPattern("");
              setTestInput("");
            }}
          >
            <Eraser className="size-3.5" />
            Clear
          </Button>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Regex className="size-3" />
        Pattern testing runs entirely in your browser — Toollyz has no server.
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

function Seg({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
