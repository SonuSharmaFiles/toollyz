"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Eraser,
  Lock,
  Search,
  Sparkles,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_FILTER,
  SHELL_LIST,
  TOTAL_CHEATS,
  allTags,
  filterCheats,
  type Shell,
} from "@/lib/tools/text/terminal-cheat";

const QUERY_KEY = "toollyz:cheat-query";
const SHELL_KEY = "toollyz:cheat-shell";
const TAG_KEY = "toollyz:cheat-tag";

function isShell(s: string | null): s is Shell | "All" {
  return s === "All" || (typeof s === "string" && SHELL_LIST.includes(s as Shell));
}

export default function TerminalCheatSheet() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [shell, setShell] = React.useState<Shell | "All">(DEFAULT_FILTER.shell);
  const [tag, setTag] = React.useState<string | undefined>(undefined);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setQuery(localStorage.getItem(QUERY_KEY) ?? "");
      const s = localStorage.getItem(SHELL_KEY);
      if (isShell(s)) setShell(s);
      const t = localStorage.getItem(TAG_KEY);
      if (t) setTag(t);
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(QUERY_KEY, query);
      localStorage.setItem(SHELL_KEY, shell);
      if (tag) localStorage.setItem(TAG_KEY, tag);
      else localStorage.removeItem(TAG_KEY);
    } catch {
      /* noop */
    }
  }, [query, shell, tag, mounted]);

  const filtered = React.useMemo(() => filterCheats({ shell, query, tag }), [shell, query, tag]);
  const allTagList = React.useMemo(() => allTags(), []);

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied to clipboard");
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
        aria-label="Cheat sheet summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total commands" value={TOTAL_CHEATS} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Filtered" value={filtered.length} reduceMotion={!!reduceMotion} />
          <Stat label="Shell sections" value={SHELL_LIST.length} reduceMotion={!!reduceMotion} />
          <Stat label="Tags" value={allTagList.length} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Filters */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Search className="size-4 text-primary" />
          Filter
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, descriptions or tags…"
            className="font-mono"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setQuery("");
              setShell("All");
              setTag(undefined);
            }}
          >
            <Eraser className="size-3.5" />
            Clear filters
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
            <Seg active={shell === "All"} onClick={() => setShell("All")} label="All shells" />
            {SHELL_LIST.map((s) => (
              <Seg key={s} active={shell === s} onClick={() => setShell(s)} label={s} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {allTagList.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag((cur) => (cur === t ? undefined : t))}
              aria-pressed={tag === t}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
                tag === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </section>

      {/* Commands */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Terminal className="size-4 text-primary" />
          Commands
          <span className="text-xs font-normal text-muted-foreground">{filtered.length}</span>
        </h2>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            No commands match the filter. Try clearing the search.
          </div>
        ) : (
          <ul className="grid gap-2 list-none sm:grid-cols-2">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-border/60 bg-background p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="break-all rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        {c.command}
                      </code>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.shell}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-foreground/90">{c.description}</p>
                    <div className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
                      <Sparkles className="mr-1 inline size-2.5 align-middle" />
                      {c.example}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag(t)}
                          className="rounded px-1 text-[9px] text-muted-foreground hover:text-primary"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => copy(c.command, c.id)}
                    className="h-7 px-2"
                  >
                    {copied === c.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Terminal className="size-3" />
        Cheat sheet runs entirely in your browser — Toollyz has no server. The commands are
        examples; always read the man page (<code className="font-mono">man cmd</code>) for the
        full options.
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
