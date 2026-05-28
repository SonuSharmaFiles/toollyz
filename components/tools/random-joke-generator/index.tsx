"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Heart,
  Laugh,
  RotateCcw,
  Search,
  Share2,
  Shuffle,
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
  REACTIONS,
  dailyJoke,
  jokeText,
  randomJoke,
  randomJokes,
  searchJokes,
  similarJoke,
  type Joke,
  type JokeCategory,
  type Reaction,
} from "@/lib/tools/jokes/jokes";

const FAVORITES_KEY = "toollyz:joke-favorites";
const REACTIONS_KEY = "toollyz:joke-reactions";
const COUNT_OPTIONS = [1, 5, 10];

export default function RandomJokeGenerator() {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = React.useState<JokeCategory | "all">("all");
  const [count, setCount] = React.useState(1);
  const [feed, setFeed] = React.useState<Joke[]>([]);
  const [search, setSearch] = React.useState("");
  const [favorites, setFavorites] = React.useState<Joke[]>([]);
  const [reactions, setReactions] = React.useState<Record<string, Reaction>>({});
  const [endless, setEndless] = React.useState(false);
  const [daily, setDaily] = React.useState<Joke | null>(null);
  const [burst, setBurst] = React.useState<{ id: number; emoji: string } | null>(null);

  const searchResults = React.useMemo(() => searchJokes(search, 30), [search]);

  React.useEffect(() => {
    try {
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
      const r = localStorage.getItem(REACTIONS_KEY);
      if (r) setReactions(JSON.parse(r));
    } catch {
      /* noop */
    }
    setDaily(dailyJoke());
    setFeed([randomJoke("all")]);
  }, []);

  function persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }

  const generate = React.useCallback(() => {
    const next = randomJokes(category, count);
    setFeed((prev) => [...next, ...prev].slice(0, 60));
  }, [category, count]);

  function surpriseMe() {
    const cats = CATEGORIES.map((c) => c.id);
    const rc = cats[Math.floor(Math.random() * cats.length)];
    setCategory(rc);
    setFeed((prev) => [randomJoke(rc), ...prev].slice(0, 60));
    toast.success(`${CATEGORY_BY_ID[rc].emoji} ${CATEGORY_BY_ID[rc].label}`);
  }

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

  React.useEffect(() => {
    if (!endless) return;
    const id = window.setInterval(() => {
      setFeed((prev) => [randomJoke(category), ...prev].slice(0, 60));
    }, 4000);
    return () => window.clearInterval(id);
  }, [endless, category]);

  function isFavorite(j: Joke) {
    return favorites.some((f) => f.punchline === j.punchline);
  }

  function toggleFavorite(j: Joke) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.punchline === j.punchline);
      const next = exists
        ? prev.filter((f) => f.punchline !== j.punchline)
        : [j, ...prev].slice(0, 100);
      persist(FAVORITES_KEY, next);
      return next;
    });
  }

  function react(j: Joke, r: Reaction) {
    setReactions((prev) => {
      const next = { ...prev, [j.punchline]: r };
      persist(REACTIONS_KEY, next);
      return next;
    });
    const cfg = REACTIONS.find((x) => x.id === r);
    if (cfg && !reduceMotion) {
      setBurst({ id: Date.now(), emoji: cfg.emoji });
      window.setTimeout(() => setBurst(null), 1200);
    }
    if (r === "love") toggleFavorite(j);
  }

  function replaceWithSimilar(idx: number) {
    setFeed((prev) => prev.map((j, i) => (i === idx ? similarJoke(j) : j)));
  }

  function exportTxt() {
    const list = favorites.length ? favorites : feed;
    if (!list.length) return;
    const blob = new Blob([list.map((j) => `• ${jokeText(j)}`).join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-jokes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Jokes downloaded");
  }

  return (
    <div className="space-y-6">
      {burst && <ReactionBurst emoji={burst.emoji} key={burst.id} />}

      {/* ─── Daily joke ──────────────────────────────────────────── */}
      {daily && (
        <section
          aria-label="Joke of the day"
          className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.25), transparent 70%)",
            }}
          />
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
              <Laugh className="size-3.5" />
              Joke of the day
            </div>
            {daily.setup && (
              <p className="text-pretty text-base text-indigo-100/80 sm:text-lg">
                {daily.setup}
              </p>
            )}
            <p className="text-pretty font-heading text-xl font-semibold leading-relaxed text-white sm:text-2xl">
              {daily.punchline}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <CategoryBadge category={daily.c} dark />
              <div className="ml-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(jokeText(daily));
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
                    isFavorite(daily) ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white hover:bg-white/20",
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
            <Select value={category} onValueChange={(v) => v && setCategory(v as JokeCategory | "all")}>
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
                    {n} {n === 1 ? "joke" : "jokes"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" size="lg" onClick={generate} className="flex-1">
              <Laugh className="size-4" />
              Make me laugh
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={surpriseMe} aria-label="Surprise me">
              <Shuffle className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleChip active={endless} onClick={() => setEndless((v) => !v)} label="Endless feed" />
          <span className="text-[11px] text-muted-foreground">
            All jokes are clean & family-friendly · press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>{" "}
            for a new one
          </span>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jokes — 'cheese', 'computer', 'cat'…"
              className="rounded-lg pl-9"
              aria-label="Search jokes"
            />
          </div>
          {search.trim() && (
            <div className="space-y-1.5 rounded-xl border border-border/60 bg-card p-2">
              {searchResults.length ? (
                searchResults.map((j, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFeed((prev) => [j, ...prev].slice(0, 60));
                      setSearch("");
                      toast.success("Added to feed");
                    }}
                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{CATEGORY_BY_ID[j.c].emoji}</span>
                    <span className="flex-1">{j.setup ? `${j.setup} ${j.punchline}` : j.punchline}</span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  No jokes match &quot;{search}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Feed ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Joke feed</h2>
          {feed.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setFeed([])}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
        {feed.length === 0 ? (
          <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
            Hit &quot;Make me laugh&quot; to start
          </div>
        ) : (
          <ul className="space-y-3 list-none">
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((joke, idx) => (
                <motion.li
                  key={`${joke.punchline}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <JokeCard
                    joke={joke}
                    favorited={isFavorite(joke)}
                    reaction={reactions[joke.punchline]}
                    onReact={(r) => react(joke, r)}
                    onToggleFavorite={() => toggleFavorite(joke)}
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
        <section aria-label="Saved jokes" className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              Saved jokes
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
                  persist(FAVORITES_KEY, []);
                }}
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
          </div>
          <ul className="mt-3 space-y-2 list-none">
            {favorites.map((j, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-border/60 bg-background p-3 text-sm">
                <span className="shrink-0">{CATEGORY_BY_ID[j.c].emoji}</span>
                <span className="flex-1">{j.setup ? `${j.setup} ${j.punchline}` : j.punchline}</span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(j)}
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

// ─── Joke card ───────────────────────────────────────────────────────────

function JokeCard({
  joke,
  favorited,
  reaction,
  onReact,
  onToggleFavorite,
  onSimilar,
}: {
  joke: Joke;
  favorited: boolean;
  reaction?: Reaction;
  onReact: (r: Reaction) => void;
  onToggleFavorite: () => void;
  onSimilar: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(jokeText(joke));
      setCopied(true);
      toast.success("Joke copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ text: `${jokeText(joke)}\n\n— via toollyz.com` }).catch(() => {});
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
      {joke.setup && (
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {joke.setup}
        </p>
      )}
      <p className="mt-1 text-pretty text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
        {joke.punchline}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CategoryBadge category={joke.c} />
        {/* Reactions */}
        <div className="flex items-center gap-0.5">
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onReact(r.id)}
              aria-label={r.label}
              title={r.label}
              className={cn(
                "rounded-md px-1.5 py-1 text-base transition-transform hover:scale-125",
                reaction === r.id && "scale-110 rounded-md bg-primary/10 ring-1 ring-primary/30",
              )}
            >
              {r.emoji}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={copy}
            aria-label="Copy joke"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </button>
          <button
            type="button"
            onClick={share}
            aria-label="Share joke"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorited ? "Unsave joke" : "Save joke"}
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
            aria-label="Generate similar joke"
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

function CategoryBadge({ category, dark }: { category: JokeCategory; dark?: boolean }) {
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

// ─── Reaction burst ──────────────────────────────────────────────────────

function ReactionBurst({ emoji }: { emoji: string }) {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        delay: Math.random() * 0.15,
      })),
    [],
  );
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] grid place-items-center">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: -200 - Math.random() * 120, scale: 1.6 }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          className="absolute text-2xl"
        >
          {emoji}
        </motion.span>
      ))}
    </div>
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
