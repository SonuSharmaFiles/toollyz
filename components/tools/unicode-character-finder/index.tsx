"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Eraser,
  Lock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  CATEGORIES,
  TOTAL_ENTRIES,
  cssEscape,
  decimalEntity,
  formatCodePoint,
  htmlEntity,
  jsEscape,
  search,
  type UnicodeEntry,
} from "@/lib/tools/text/unicode-finder";

const QUERY_KEY = "toollyz:unicode-query";
const CAT_KEY = "toollyz:unicode-cat";

export default function UnicodeCharacterFinder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [focused, setFocused] = React.useState<UnicodeEntry | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setQuery(localStorage.getItem(QUERY_KEY) ?? "");
      setCategory(localStorage.getItem(CAT_KEY) ?? "All");
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(QUERY_KEY, query);
      localStorage.setItem(CAT_KEY, category);
    } catch {
      /* noop */
    }
  }, [query, category, mounted]);

  const results = React.useMemo(() => search({ query, category }), [query, category]);

  React.useEffect(() => {
    if (!focused && results.length > 0) setFocused(results[0]);
  }, [results, focused]);

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
        aria-label="Search summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Catalogue" value={TOTAL_ENTRIES} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Matches" value={results.length} reduceMotion={!!reduceMotion} />
          <Stat label="Categories" value={CATEGORIES.length} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Focused</div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-black/30 font-heading text-3xl text-sky-50">
              {focused?.ch || "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Search className="size-4 text-primary" />
          Search
        </h2>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, keyword, character, or codepoint (e.g. arrow, ©, U+2603)"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
            <Seg active={category === "All"} onClick={() => setCategory("All")} label="All" />
            {CATEGORIES.map((c) => (
              <Seg key={c} active={category === c} onClick={() => setCategory(c)} label={c} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Eraser className="size-3" />
            Reset
          </button>
        </div>
      </section>

      {/* Results + focused detail */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="grid max-h-[640px] grid-cols-3 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6 lg:grid-cols-8">
            {results.slice(0, 600).map((e, i) => (
              <button
                key={`${e.cp}-${i}`}
                type="button"
                onClick={() => setFocused(e)}
                title={`${e.name} · ${formatCodePoint(e.cp)}`}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md border p-1.5 transition-colors hover:bg-muted",
                  focused?.cp === e.cp && focused?.ch === e.ch
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-background",
                )}
              >
                <span className="font-heading text-2xl leading-none">{e.ch}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{formatCodePoint(e.cp)}</span>
              </button>
            ))}
          </div>
          {results.length > 600 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Showing first 600 of {results.length.toLocaleString()} matches — refine the search.
            </p>
          )}
        </section>

        {focused && (
          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="space-y-1 text-center">
              <div className="grid h-24 place-items-center rounded-xl bg-black/5 font-heading text-6xl dark:bg-white/5">
                {focused.ch}
              </div>
              <h3 className="text-sm font-semibold">{focused.name}</h3>
              <p className="text-[11px] text-muted-foreground">{focused.category} · {formatCodePoint(focused.cp)}</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <CopyRow label="Character" value={focused.ch} copyKey="ch" copied={copied} onCopy={copy} />
              <CopyRow label="Code point" value={formatCodePoint(focused.cp)} copyKey="cp" copied={copied} onCopy={copy} />
              <CopyRow label="HTML entity" value={htmlEntity(focused.cp)} copyKey="html" copied={copied} onCopy={copy} mono />
              <CopyRow label="HTML decimal" value={decimalEntity(focused.cp)} copyKey="dec" copied={copied} onCopy={copy} mono />
              <CopyRow label="JS escape" value={jsEscape(focused.cp)} copyKey="js" copied={copied} onCopy={copy} mono />
              <CopyRow label="CSS escape" value={cssEscape(focused.cp)} copyKey="css" copied={copied} onCopy={copy} mono />
            </div>
          </section>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Search className="size-3" />
        Catalogue is bundled with the page — {TOTAL_ENTRIES.toLocaleString()} curated high-traffic
        characters. Search runs entirely in your browser.
      </p>
    </div>
  );
}

function CopyRow({
  label,
  value,
  copyKey,
  copied,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  copyKey: string;
  copied: string | null;
  onCopy: (v: string, k: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background p-2">
      <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <code className={cn("min-w-0 flex-1 break-all", mono ? "font-mono" : "")}>{value}</code>
      <button
        type="button"
        onClick={() => onCopy(value, copyKey)}
        className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
      >
        {copied === copyKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
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
