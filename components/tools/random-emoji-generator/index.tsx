"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Heart,
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
  STYLE_MODES,
  generateEmojis,
  nameFor,
  searchEmojis,
  similarEmoji,
  toCodePoints,
  type EmojiCategory,
  type StyleMode,
} from "@/lib/tools/emoji/emoji";

const FAVORITES_KEY = "toollyz:emoji-favorites";
const COUNT_OPTIONS = [1, 3, 5, 10, 25, 50];
const FLOATERS = ["✨", "🌙", "🦋", "💫", "🌸", "🔥", "💖", "🪐"];

export default function RandomEmojiGenerator() {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = React.useState(5);
  const [category, setCategory] = React.useState<EmojiCategory | "all">("all");
  const [mode, setMode] = React.useState<StyleMode>("chaos");
  const [results, setResults] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [favorites, setFavorites] = React.useState<string[]>([]);

  const searchResults = React.useMemo(() => searchEmojis(search, 60), [search]);
  const pack = results.join(" ");

  React.useEffect(() => {
    try {
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {
      /* noop */
    }
    setResults(generateEmojis({ count: 5, category: "all", mode: "chaos" }));
  }, []);

  function persistFavorites(next: string[]) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  const generate = React.useCallback(() => {
    setResults(generateEmojis({ count, category, mode }));
  }, [count, category, mode]);

  // Spacebar generate
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

  function toggleFavorite(emoji: string) {
    setFavorites((prev) => {
      const next = prev.includes(emoji)
        ? prev.filter((e) => e !== emoji)
        : [emoji, ...prev].slice(0, 60);
      persistFavorites(next);
      return next;
    });
  }

  function regenerateOne(idx: number) {
    setResults((prev) => prev.map((e, i) => (i === idx ? similarEmoji(e) : e)));
  }

  async function copyPack() {
    if (!pack) return;
    try {
      await navigator.clipboard.writeText(results.join(""));
      toast.success("Emoji pack copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function downloadTxt() {
    if (!results.length) return;
    const blob = new Blob([results.join(" ")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-emojis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded TXT");
  }

  return (
    <div className="space-y-6">
      {/* ─── Hero showcase ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-fuchsia-500/10 p-6 sm:p-8">
        {!reduceMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {FLOATERS.map((em, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl opacity-20"
                style={{ left: `${(i / FLOATERS.length) * 100}%`, top: "100%" }}
                animate={{ y: ["0%", "-700%"], opacity: [0, 0.3, 0], rotate: [0, 180] }}
                transition={{
                  duration: 9 + i * 1.5,
                  repeat: Infinity,
                  delay: i * 1.1,
                  ease: "linear",
                }}
              >
                {em}
              </motion.span>
            ))}
          </div>
        )}
        <div className="relative space-y-5 text-center">
          <div className="min-h-20 sm:min-h-24">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={pack || "empty"}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap items-center justify-center gap-2 text-4xl leading-none sm:text-5xl"
              >
                {results.length ? (
                  results.map((e, i) => (
                    <motion.span
                      key={`${e}-${i}`}
                      initial={{ opacity: 0, y: 10, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3), type: "spring", stiffness: 300 }}
                      className="cursor-pointer select-none transition-transform hover:scale-125"
                      onClick={() => {
                        navigator.clipboard.writeText(e);
                        toast.success(`Copied ${e}`);
                      }}
                      title={nameFor(e)}
                    >
                      {e}
                    </motion.span>
                  ))
                ) : (
                  <span className="text-base text-muted-foreground">
                    Hit generate to summon some emojis
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button type="button" size="lg" onClick={generate}>
              <Sparkles className="size-4" />
              Generate emojis
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={copyPack} disabled={!pack}>
              <Copy className="size-4" />
              Copy pack
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tap any emoji to copy · press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Space
            </kbd>{" "}
            to reroll
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* ─── Controls ─────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>How many</Label>
              <Select value={String(count)} onValueChange={(v) => v && setCount(Number(v))}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNT_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "emoji" : "emojis"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Style mode</Label>
              <Select value={mode} onValueChange={(v) => v && setMode(v as StyleMode)}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_MODES.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category {mode !== "chaos" && <span className="text-muted-foreground">(ignored in style modes)</span>}</Label>
            <div className="flex flex-wrap gap-1.5">
              <CategoryChip label="All" active={category === "all"} onClick={() => setCategory("all")} disabled={mode !== "chaos"} />
              {CATEGORIES.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.label}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                  disabled={mode !== "chaos"}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji-search">Search emojis</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="emoji-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="happy, heart, pizza, fire…"
                className="rounded-lg pl-9"
              />
            </div>
            {search.trim() && (
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-card p-2">
                {searchResults.length ? (
                  searchResults.map((em) => (
                    <button
                      key={em.e}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(em.e);
                        toast.success(`Copied ${em.e}`);
                      }}
                      title={em.n}
                      className="grid size-9 place-items-center rounded-lg text-xl transition-transform hover:scale-110 hover:bg-muted"
                    >
                      {em.e}
                    </button>
                  ))
                ) : (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    No emojis match &quot;{search}&quot;
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Result cards ─────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Generated</h2>
            <div className="flex gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={generate}>
                <Shuffle className="size-3.5" />
                Reroll
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={downloadTxt} disabled={!results.length}>
                <Download className="size-3.5" />
                TXT
              </Button>
            </div>
          </div>
          {results.length === 0 ? (
            <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
              Generate to see emoji cards
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-2 list-none sm:grid-cols-4 lg:grid-cols-5">
              <AnimatePresence initial={false} mode="popLayout">
                {results.map((emoji, idx) => (
                  <motion.li
                    key={`${emoji}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.01, 0.15) }}
                  >
                    <EmojiCard
                      emoji={emoji}
                      favorited={favorites.includes(emoji)}
                      onToggleFavorite={() => toggleFavorite(emoji)}
                      onRegenerate={() => regenerateOne(idx)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* ─── Social previews ──────────────────────────────────────── */}
      {results.length > 0 && <SocialPreviews pack={results.join(" ")} />}

      {/* ─── Favorites ────────────────────────────────────────────── */}
      {favorites.length > 0 && (
        <section
          aria-label="Favorite emojis"
          className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              Favorites
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">
                {favorites.length}
              </span>
            </h2>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(favorites.join(""));
                  toast.success("Favorites copied");
                }}
              >
                <Copy className="size-3.5" />
                Copy all
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
          <div className="mt-3 flex flex-wrap gap-1.5">
            {favorites.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(e);
                  toast.success(`Copied ${e}`);
                }}
                title={nameFor(e)}
                className="grid size-10 place-items-center rounded-lg bg-background text-2xl ring-1 ring-rose-400/20 transition-transform hover:scale-110"
              >
                {e}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Emoji card ──────────────────────────────────────────────────────────

function EmojiCard({
  emoji,
  favorited,
  onToggleFavorite,
  onRegenerate,
}: {
  emoji: string;
  favorited: boolean;
  onToggleFavorite: () => void;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(emoji);
      setCopied(true);
      toast.success(`Copied ${emoji}`);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div
      className={cn(
        "group flex flex-col items-center gap-1 rounded-2xl border bg-card p-3 transition-colors",
        favorited ? "border-rose-400/50 bg-rose-500/5" : "border-border/70 hover:border-primary/40",
      )}
    >
      <button
        type="button"
        onClick={copy}
        className="text-4xl transition-transform hover:scale-110 active:scale-95"
        title={`Copy ${emoji}`}
        aria-label={`Copy ${nameFor(emoji)}`}
      >
        {emoji}
      </button>
      <span className="line-clamp-1 w-full text-center text-[9px] text-muted-foreground" title={nameFor(emoji)}>
        {nameFor(emoji)}
      </span>
      <span className="hidden text-[8px] font-mono text-muted-foreground/60 sm:block">
        {toCodePoints(emoji).split(" ")[0]}
      </span>
      <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={copy}
          aria-label="Copy"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={favorited ? "Unfavorite" : "Favorite"}
          className={cn(
            "rounded-md p-1 hover:bg-muted",
            favorited ? "text-rose-500" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart className={cn("size-3", favorited && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          aria-label="Generate similar"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="size-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Social previews ─────────────────────────────────────────────────────

function SocialPreviews({ pack }: { pack: string }) {
  return (
    <section aria-labelledby="social-heading" className="space-y-3">
      <h2 id="social-heading" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Sparkles className="size-4 text-primary" />
        See it in context
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Chat bubble */}
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Chat
          </p>
          <div className="flex justify-end">
            <span className="max-w-full break-words rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
              {pack}
            </span>
          </div>
        </div>
        {/* Instagram bio */}
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Instagram bio
          </p>
          <div className="flex items-center gap-2">
            <span className="size-8 shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600" />
            <div className="min-w-0">
              <div className="text-xs font-semibold">your_handle</div>
              <div className="truncate text-xs text-muted-foreground">{pack}</div>
            </div>
          </div>
        </div>
        {/* TikTok caption */}
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            TikTok caption
          </p>
          <p className="break-words text-sm">
            POV: you found the perfect combo {pack}
          </p>
        </div>
        {/* Discord username */}
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Discord
          </p>
          <div className="flex items-center gap-2">
            <span className="size-8 shrink-0 rounded-full bg-indigo-500" />
            <span className="truncate text-sm font-medium">
              {pack.split(" ").slice(0, 2).join("")}gamer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Category chip ───────────────────────────────────────────────────────

function CategoryChip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
