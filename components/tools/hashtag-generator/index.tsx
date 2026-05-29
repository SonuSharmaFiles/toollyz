"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, Hash, Info, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { PLATFORMS, PLATFORM_META, type Platform } from "@/lib/tools/hashtag/lexicons";
import { generateHashtags, toBlock, toLines, withHash, type Reach } from "@/lib/tools/hashtag/generator";

const SEED_KEY = "toollyz:hashtag-seed";
const PLATFORM_KEY = "toollyz:hashtag-platform";
const FAV_KEY = "toollyz:hashtag-favorites";

const REACHES: { id: Reach; label: string }[] = [
  { id: "broad", label: "Broad" },
  { id: "balanced", label: "Balanced" },
  { id: "niche", label: "Niche" },
];

export default function HashtagGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [seed, setSeed] = React.useState("travel photography");
  const [platform, setPlatform] = React.useState<Platform>("instagram");
  const [count, setCount] = React.useState(PLATFORM_META.instagram.defaultCount);
  const [reach, setReach] = React.useState<Reach>("balanced");
  const [shuffle, setShuffle] = React.useState(0);
  const [favorites, setFavorites] = React.useState<string[]>([]);

  const deferredSeed = React.useDeferredValue(seed);
  const result = React.useMemo(
    () => generateHashtags({ seed: deferredSeed, platform, count, reach, shuffle }),
    [deferredSeed, platform, count, reach, shuffle],
  );

  React.useEffect(() => {
    try {
      const s = localStorage.getItem(SEED_KEY);
      if (s !== null) setSeed(s);
      const p = localStorage.getItem(PLATFORM_KEY) as Platform | null;
      if (p && PLATFORMS.includes(p)) { setPlatform(p); setCount(PLATFORM_META[p].defaultCount); }
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch { /* noop */ }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(SEED_KEY, seed); localStorage.setItem(PLATFORM_KEY, platform); } catch { /* noop */ } }, [seed, platform, mounted]);

  function changePlatform(p: Platform) {
    setPlatform(p);
    setCount((c) => Math.min(PLATFORM_META[p].max, Math.max(3, c > PLATFORM_META[p].max ? PLATFORM_META[p].defaultCount : c)));
  }
  function persistFav(next: string[]) { setFavorites(next); try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* noop */ } }
  function toggleFav(tag: string) { persistFav(favorites.includes(tag) ? favorites.filter((t) => t !== tag) : [...favorites, tag]); }

  async function copy(value: string, label: string) { if (!value) return; try { await navigator.clipboard.writeText(value); toast.success(label); } catch { toast.error("Could not copy"); } }

  const max = PLATFORM_META[platform].max;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-44 animate-pulse rounded-2xl bg-muted" />
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Hashtag summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(16,185,129,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(20,184,166,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat label="Hashtags" value={result.tags.length} reduceMotion={!!reduceMotion} />
          <HeroStat label="Broad reach" value={result.broadCount} reduceMotion={!!reduceMotion} />
          <HeroStat label="Niche reach" value={result.nicheCount} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-emerald-300/70">Topic</div>
            <div className="font-heading text-xl font-bold text-emerald-50 sm:text-2xl">{result.category ?? "General"}</div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="space-y-1.5">
          <Label htmlFor="seed">Topic or keywords</Label>
          <Input id="seed" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="e.g. travel photography, vegan recipes, web development" className="text-base" />
        </div>

        <div className="space-y-1.5">
          <Label>Platform</Label>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <button key={p} type="button" onClick={() => changePlatform(p)} aria-pressed={platform === p} className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", platform === p ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-foreground/80 hover:bg-muted")}>{PLATFORM_META[p].name}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="count">Count — <span className="tabular-nums text-foreground">{count}</span></Label>
            <Slider id="count" value={[count]} onValueChange={(v) => setCount(Array.isArray(v) ? v[0] : v)} min={3} max={max} step={1} />
            <p className="text-[11px] text-muted-foreground">{PLATFORM_META[platform].name} works best with around {PLATFORM_META[platform].defaultCount}.</p>
          </div>
          <div className="space-y-2">
            <Label>Reach mix</Label>
            <div className="inline-flex w-full rounded-lg border border-border bg-background p-0.5">
              {REACHES.map((r) => (
                <button key={r.id} type="button" onClick={() => setReach(r.id)} aria-pressed={reach === r.id} className={cn("flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors", reach === r.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{r.label}</button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">Broad = popular & competitive · Niche = long-tail & easier to rank.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setShuffle((s) => s + 1)} variant="outline" size="sm"><RefreshCw className="size-4" />Shuffle</Button>
          <Button type="button" onClick={() => copy(toBlock(result.tags), "Copied all hashtags")} size="sm" disabled={!result.tags.length}><Copy className="size-4" />Copy all</Button>
          <Button type="button" onClick={() => copy(toLines(result.tags), "Copied (one per line)")} variant="outline" size="sm" disabled={!result.tags.length}><Copy className="size-4" />Copy as list</Button>
        </div>
      </section>

      {/* Results */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Hash className="size-4 text-primary" />Suggested hashtags</h2>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{result.tags.length}</span>
        </div>
        {result.tags.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Enter a topic above to generate hashtags.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {withHash(result.tags).map((tag, i) => {
                const bare = result.tags[i];
                const fav = favorites.includes(bare);
                return (
                  <motion.div key={tag} layout={!reduceMotion} initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.15 }}
                    className="group inline-flex items-center gap-1 rounded-full border border-border bg-background py-1 pl-3 pr-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-muted">
                    <button type="button" onClick={() => copy(tag, `Copied ${tag}`)} className="font-medium text-foreground/90">{tag}</button>
                    <button type="button" onClick={() => toggleFav(bare)} aria-label={fav ? "Unfavorite" : "Favorite"} className={cn("rounded-full p-0.5 transition-colors", fav ? "text-amber-500" : "text-muted-foreground/50 hover:text-amber-500")}>
                      <Star className={cn("size-3.5", fav && "fill-current")} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        {result.tags.length > 0 && (
          <pre className="mt-1 overflow-x-auto rounded-xl border border-border/60 bg-background p-3 text-xs leading-relaxed text-muted-foreground">{toBlock(result.tags)}</pre>
        )}
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Info className="size-3 shrink-0" />Curated, relevance-ranked suggestions generated in your browser — not live trend data from any platform API.</p>
      </section>

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Star className="size-4 fill-amber-400 text-amber-400" />Saved hashtags</h2>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">{favorites.length}</span>
            <div className="ml-auto flex gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={() => copy(toBlock(favorites), "Copied saved hashtags")}><Copy className="size-4" />Copy</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => persistFav([])}><Trash2 className="size-3.5" />Clear</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {withHash(favorites).map((tag, i) => (
              <button key={tag} type="button" onClick={() => toggleFav(favorites[i])} className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-background py-1 px-3 text-sm font-medium text-foreground/90 hover:bg-muted">
                {tag}<Star className="size-3.5 fill-amber-400 text-amber-400" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function HeroStat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-emerald-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-emerald-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
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
