"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  Download,
  Heart,
  Lightbulb,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  dailyFact,
  randomFact,
  randomFacts,
  readingSeconds,
  searchFacts,
  similarFact,
  type Fact,
  type FactCategory,
} from "@/lib/tools/facts/facts";

const FAVORITES_KEY = "toollyz:fact-favorites";
const COUNT_OPTIONS = [1, 5, 10];

export default function RandomFactGenerator() {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = React.useState<FactCategory | "all">("all");
  const [count, setCount] = React.useState(1);
  const [feed, setFeed] = React.useState<Fact[]>([]);
  const [search, setSearch] = React.useState("");
  const [favorites, setFavorites] = React.useState<Fact[]>([]);
  const [endless, setEndless] = React.useState(false);
  const [daily, setDaily] = React.useState<Fact | null>(null);

  const searchResults = React.useMemo(() => searchFacts(search, 30), [search]);

  React.useEffect(() => {
    try {
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {
      /* noop */
    }
    setDaily(dailyFact());
    setFeed([randomFact("all")]);
  }, []);

  function persistFavorites(next: Fact[]) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  const generate = React.useCallback(() => {
    const next = randomFacts(category, count);
    setFeed((prev) => [...next, ...prev].slice(0, 60));
  }, [category, count]);

  function surpriseMe() {
    const cats = CATEGORIES.map((c) => c.id);
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    setCategory(randomCat);
    const fact = randomFact(randomCat);
    setFeed((prev) => [fact, ...prev].slice(0, 60));
    toast.success(`${CATEGORY_BY_ID[randomCat].emoji} ${CATEGORY_BY_ID[randomCat].label}`);
  }

  // Spacebar
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        generate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  // Endless mode
  React.useEffect(() => {
    if (!endless) return;
    const id = window.setInterval(() => {
      setFeed((prev) => [randomFact(category), ...prev].slice(0, 60));
    }, 3500);
    return () => window.clearInterval(id);
  }, [endless, category]);

  function isFavorite(fact: Fact) {
    return favorites.some((f) => f.text === fact.text);
  }

  function toggleFavorite(fact: Fact) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.text === fact.text);
      const next = exists
        ? prev.filter((f) => f.text !== fact.text)
        : [fact, ...prev].slice(0, 100);
      persistFavorites(next);
      return next;
    });
  }

  function replaceWithSimilar(idx: number) {
    setFeed((prev) => prev.map((f, i) => (i === idx ? similarFact(f) : f)));
  }

  function exportTxt() {
    const list = favorites.length ? favorites : feed;
    if (!list.length) return;
    const blob = new Blob([list.map((f) => `• ${f.text}`).join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-facts-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Facts downloaded");
  }

  return (
    <div className="space-y-6">
      {/* ─── Daily fact ──────────────────────────────────────────── */}
      {daily && (
        <section
          aria-label="Fact of the day"
          className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.25), transparent 70%)",
            }}
          />
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
              <Sparkles className="size-3.5" />
              Fact of the day
            </div>
            <p className="text-pretty font-heading text-xl font-semibold leading-relaxed text-white sm:text-2xl">
              {daily.text}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={daily.c} dark />
              <span className="flex items-center gap-1 text-xs text-indigo-200/60">
                <Clock className="size-3" />
                {readingSeconds(daily.text)}s read
              </span>
              <div className="ml-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(daily.text);
                    toast.success("Copied");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  <Copy className="size-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(daily)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    isFavorite(daily)
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-white/10 text-white hover:bg-white/20",
                  )}
                >
                  <Heart className={cn("size-3.5", isFavorite(daily) && "fill-current")} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Controls ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v as FactCategory | "all")}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🎲 All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>How many</Label>
            <Select value={String(count)} onValueChange={(v) => v && setCount(Number(v))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "fact" : "facts"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" size="lg" onClick={generate} className="flex-1">
              <Lightbulb className="size-4" />
              Generate
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={surpriseMe} aria-label="Surprise me">
              <Shuffle className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleChip
            active={endless}
            onClick={() => setEndless((v) => !v)}
            label="Endless discovery"
          />
          <span className="text-[11px] text-muted-foreground">
            Press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Space
            </kbd>{" "}
            for a new fact
          </span>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facts — 'space', 'brain', 'honey'…"
              className="rounded-lg pl-9"
              aria-label="Search facts"
            />
          </div>
          {search.trim() && (
            <div className="space-y-1.5 rounded-xl border border-border/60 bg-card p-2">
              {searchResults.length ? (
                searchResults.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFeed((prev) => [f, ...prev].slice(0, 60));
                      setSearch("");
                      toast.success("Added to feed");
                    }}
                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{CATEGORY_BY_ID[f.c].emoji}</span>
                    <span className="flex-1">{f.text}</span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  No facts match &quot;{search}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Feed ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Discovery feed</h2>
          {feed.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setFeed([])}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
        {feed.length === 0 ? (
          <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
            Generate a fact to start exploring
          </div>
        ) : (
          <ul className="space-y-3 list-none">
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((fact, idx) => (
                <motion.li
                  key={`${fact.text}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <FactCard
                    fact={fact}
                    favorited={isFavorite(fact)}
                    onToggleFavorite={() => toggleFavorite(fact)}
                    onSimilar={() => replaceWithSimilar(idx)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* ─── Favorites ───────────────────────────────────────────── */}
      {favorites.length > 0 && (
        <section
          aria-label="Saved facts"
          className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              Saved facts
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">
                {favorites.length}
              </span>
            </h2>
            <div className="flex gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={exportTxt}>
                <Download className="size-3.5" />
                Export
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFavorites([]);
                  persistFavorites([]);
                }}
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
          </div>
          <ul className="mt-3 space-y-2 list-none">
            {favorites.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border border-border/60 bg-background p-3 text-sm"
              >
                <span className="shrink-0">{CATEGORY_BY_ID[f.c].emoji}</span>
                <span className="flex-1">{f.text}</span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(f)}
                  aria-label="Remove"
                  className="shrink-0 text-rose-500 hover:text-rose-600"
                >
                  <Heart className="size-3.5 fill-current" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─── Fact card ───────────────────────────────────────────────────────────

function FactCard({
  fact,
  favorited,
  onToggleFavorite,
  onSimilar,
}: {
  fact: Fact;
  favorited: boolean;
  onToggleFavorite: () => void;
  onSimilar: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fact.text);
      setCopied(true);
      toast.success("Fact copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator
        .share({ text: `${fact.text}\n\n— via toollyz.com` })
        .catch(() => {});
    } else {
      copy();
    }
  }

  return (
    <article
      className={cn(
        "group rounded-2xl border bg-card p-5 transition-colors",
        favorited ? "border-rose-400/40 bg-rose-500/5" : "border-border/70 hover:border-primary/40",
      )}
    >
      <p className="text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
        {fact.text}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CategoryBadge category={fact.c} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {readingSeconds(fact.text)}s read
        </span>
        <div className="ml-auto flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={copy}
            aria-label="Copy fact"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </button>
          <button
            type="button"
            onClick={share}
            aria-label="Share fact"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Sparkles className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorited ? "Unsave fact" : "Save fact"}
            className={cn(
              "rounded-md p-1.5 transition-colors hover:bg-muted",
              favorited ? "text-rose-500" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart className={cn("size-4", favorited && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={onSimilar}
            aria-label="Generate similar fact"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Category badge ──────────────────────────────────────────────────────

function CategoryBadge({ category, dark }: { category: FactCategory; dark?: boolean }) {
  const cfg = CATEGORY_BY_ID[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        dark ? "bg-white/10 text-white" : "bg-muted",
      )}
    >
      <span>{cfg.emoji}</span>
      <span className={dark ? "" : cfg.accent}>{cfg.label}</span>
    </span>
  );
}

// ─── Toggle chip ─────────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-1.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted-foreground/40",
        )}
      />
      {label}
    </button>
  );
}
