"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Heart,
  Image as ImageIcon,
  Quote as QuoteIcon,
  RotateCcw,
  Search,
  Share2,
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
  AUTHORS,
  CATEGORIES,
  CATEGORY_BY_ID,
  THEMES,
  THEME_BY_ID,
  dailyQuote,
  quoteImageCanvas,
  quoteText,
  randomQuote,
  randomQuotes,
  readingSeconds,
  searchQuotes,
  similarQuote,
  type Quote,
  type QuoteCategory,
} from "@/lib/tools/quotes/quotes";

const FAVORITES_KEY = "toollyz:quote-favorites";
const SETTINGS_KEY = "toollyz:quote-settings";
const COUNT_OPTIONS = [1, 5, 10];

export default function RandomQuoteGenerator() {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = React.useState<QuoteCategory | "all">("all");
  const [author, setAuthor] = React.useState<string>("all");
  const [count, setCount] = React.useState(1);
  const [themeId, setThemeId] = React.useState("indigo");
  const [feed, setFeed] = React.useState<Quote[]>([]);
  const [search, setSearch] = React.useState("");
  const [favorites, setFavorites] = React.useState<Quote[]>([]);
  const [endless, setEndless] = React.useState(false);
  const [daily, setDaily] = React.useState<Quote | null>(null);

  const theme = THEME_BY_ID[themeId] ?? THEMES[0];
  const searchResults = React.useMemo(() => searchQuotes(search, 30), [search]);

  React.useEffect(() => {
    try {
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (p.themeId) setThemeId(p.themeId);
      }
    } catch {
      /* noop */
    }
    setDaily(dailyQuote());
    setFeed([randomQuote("all")]);
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ themeId }));
    } catch {
      /* noop */
    }
  }, [themeId]);

  function persistFavorites(next: Quote[]) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  const generate = React.useCallback(() => {
    const next = randomQuotes(category, author, count);
    setFeed((prev) => [...next, ...prev].slice(0, 60));
  }, [category, author, count]);

  function inspireMe() {
    const cats = CATEGORIES.map((c) => c.id);
    const rc = cats[Math.floor(Math.random() * cats.length)];
    setCategory(rc);
    setAuthor("all");
    setFeed((prev) => [randomQuote(rc), ...prev].slice(0, 60));
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
      setFeed((prev) => [randomQuote(category, author), ...prev].slice(0, 60));
    }, 4500);
    return () => window.clearInterval(id);
  }, [endless, category, author]);

  function isFavorite(q: Quote) {
    return favorites.some((f) => f.text === q.text);
  }

  function toggleFavorite(q: Quote) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.text === q.text);
      const next = exists
        ? prev.filter((f) => f.text !== q.text)
        : [q, ...prev].slice(0, 100);
      persistFavorites(next);
      return next;
    });
  }

  function replaceWithSimilar(idx: number) {
    setFeed((prev) => prev.map((q, i) => (i === idx ? similarQuote(q) : q)));
  }

  function downloadImage(q: Quote) {
    const canvas = quoteImageCanvas(q, theme);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toollyz-quote-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Quote image downloaded");
    }, "image/png");
  }

  function exportTxt() {
    const list = favorites.length ? favorites : feed;
    if (!list.length) return;
    const blob = new Blob([list.map(quoteText).join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-quotes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Quotes downloaded");
  }

  return (
    <div className="space-y-6">
      {/* ─── Daily quote (themed) ────────────────────────────────── */}
      {daily && (
        <section
          aria-label="Quote of the day"
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
          style={{
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            color: theme.text,
          }}
        >
          <QuoteIcon
            aria-hidden="true"
            className="absolute -left-2 -top-2 size-28 opacity-15"
            style={{ color: theme.sub }}
          />
          <div className="relative space-y-4">
            <div
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: theme.sub }}
            >
              <Sparkles className="size-3.5" />
              Quote of the day
            </div>
            <blockquote className="text-pretty font-heading text-2xl font-semibold leading-snug sm:text-3xl">
              &ldquo;{daily.text}&rdquo;
            </blockquote>
            <p className="text-base font-medium" style={{ color: theme.sub }}>
              — {daily.author}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CategoryBadge category={daily.c} dark />
              <div className="ml-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(quoteText(daily));
                    toast.success("Copied");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-white/25"
                  style={{ color: theme.text }}
                >
                  <Copy className="size-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => downloadImage(daily)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-white/25"
                  style={{ color: theme.text }}
                >
                  <ImageIcon className="size-3.5" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(daily)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-white/25"
                  style={{ color: theme.text }}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v as QuoteCategory | "all")}>
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
            <Label>Author</Label>
            <Select value={author} onValueChange={(v) => v && setAuthor(v)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any author</SelectItem>
                {AUTHORS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
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
                    {n} {n === 1 ? "quote" : "quotes"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Image theme</Label>
            <Select value={themeId} onValueChange={(v) => v && setThemeId(v)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="lg" onClick={generate}>
            <Sparkles className="size-4" />
            Generate quote
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={inspireMe}>
            <Shuffle className="size-4" />
            Inspire me
          </Button>
          <ToggleChip active={endless} onClick={() => setEndless((v) => !v)} label="Endless inspiration" />
          <span className="text-[11px] text-muted-foreground">
            Press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>{" "}
            for a new quote
          </span>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes — 'wisdom', 'Einstein', 'dreams'…"
              className="rounded-lg pl-9"
              aria-label="Search quotes"
            />
          </div>
          {search.trim() && (
            <div className="space-y-1.5 rounded-xl border border-border/60 bg-card p-2">
              {searchResults.length ? (
                searchResults.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFeed((prev) => [q, ...prev].slice(0, 60));
                      setSearch("");
                      toast.success("Added to feed");
                    }}
                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{CATEGORY_BY_ID[q.c].emoji}</span>
                    <span className="flex-1">
                      &ldquo;{q.text}&rdquo;{" "}
                      <span className="text-muted-foreground">— {q.author}</span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  No quotes match &quot;{search}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Feed ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Inspiration feed</h2>
          {feed.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setFeed([])}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
        {feed.length === 0 ? (
          <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
            Generate a quote to start exploring
          </div>
        ) : (
          <ul className="space-y-3 list-none">
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((quote, idx) => (
                <motion.li
                  key={`${quote.text}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <QuoteCard
                    quote={quote}
                    favorited={isFavorite(quote)}
                    onToggleFavorite={() => toggleFavorite(quote)}
                    onSimilar={() => replaceWithSimilar(idx)}
                    onImage={() => downloadImage(quote)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* ─── Social preview ──────────────────────────────────────── */}
      {feed[0] && <SocialPreviews quote={feed[0]} theme={theme} />}

      {/* ─── Favorites ───────────────────────────────────────────── */}
      {favorites.length > 0 && (
        <section aria-label="Saved quotes" className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              Saved quotes
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
            {favorites.map((q, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-border/60 bg-background p-3 text-sm">
                <span className="shrink-0">{CATEGORY_BY_ID[q.c].emoji}</span>
                <span className="flex-1">
                  &ldquo;{q.text}&rdquo; <span className="text-muted-foreground">— {q.author}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(q)}
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

// ─── Quote card ──────────────────────────────────────────────────────────

function QuoteCard({
  quote,
  favorited,
  onToggleFavorite,
  onSimilar,
  onImage,
}: {
  quote: Quote;
  favorited: boolean;
  onToggleFavorite: () => void;
  onSimilar: () => void;
  onImage: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(quoteText(quote));
      setCopied(true);
      toast.success("Quote copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ text: `${quoteText(quote)}\n\n— via toollyz.com` }).catch(() => {});
    } else {
      copy();
    }
  }

  return (
    <article
      className={cn(
        "group rounded-2xl border bg-card p-6 transition-colors",
        favorited ? "border-rose-400/40 bg-rose-500/5" : "border-border/70 hover:border-primary/40",
      )}
    >
      <QuoteIcon className="size-5 text-primary/40" aria-hidden="true" />
      <blockquote className="mt-2 text-pretty font-heading text-lg font-medium leading-relaxed text-foreground sm:text-xl">
        {quote.text}
      </blockquote>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-foreground/80">— {quote.author}</span>
        <CategoryBadge category={quote.c} />
        <span className="text-xs text-muted-foreground">{readingSeconds(quote.text)}s read</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={copy} aria-label="Copy quote" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </button>
          <button type="button" onClick={onImage} aria-label="Download quote image" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ImageIcon className="size-4" />
          </button>
          <button type="button" onClick={share} aria-label="Share quote" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorited ? "Unsave quote" : "Save quote"}
            className={cn(
              "rounded-md p-1.5 transition-colors hover:bg-muted",
              favorited ? "text-rose-500" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart className={cn("size-4", favorited && "fill-current")} />
          </button>
          <button type="button" onClick={onSimilar} aria-label="Generate similar quote" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Social previews ─────────────────────────────────────────────────────

function SocialPreviews({ quote, theme }: { quote: Quote; theme: typeof THEMES[number] }) {
  return (
    <section aria-labelledby="social-heading" className="space-y-3">
      <h2 id="social-heading" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Sparkles className="size-4 text-primary" />
        Share preview
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Instagram square */}
        <div className="rounded-2xl border border-border/70 bg-card p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Instagram post
          </p>
          <div
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl p-6 text-center"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, color: theme.text }}
          >
            <span className="font-serif text-3xl leading-none" style={{ color: theme.sub }}>&ldquo;</span>
            <p className="line-clamp-5 font-heading text-sm font-medium leading-snug sm:text-base">
              {quote.text}
            </p>
            <p className="text-xs" style={{ color: theme.sub }}>— {quote.author}</p>
          </div>
        </div>
        {/* Twitter/X card */}
        <div className="rounded-2xl border border-border/70 bg-card p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            X / Twitter
          </p>
          <div className="rounded-xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-2">
              <span className="size-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
              <div>
                <div className="text-sm font-semibold">You</div>
                <div className="text-xs text-muted-foreground">@you · now</div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              &ldquo;{quote.text}&rdquo; — {quote.author} ✨ #quotes #motivation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Category badge ──────────────────────────────────────────────────────

function CategoryBadge({ category, dark }: { category: QuoteCategory; dark?: boolean }) {
  const cfg = CATEGORY_BY_ID[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        dark ? "bg-white/15" : "bg-muted",
      )}
      style={dark ? { color: "inherit" } : undefined}
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
