// Hashtag generation for the Toollyz Hashtag Generator. Expands a seed keyword
// into relevant, popular and niche hashtag suggestions using curated lexicons.
// Deterministic for a given (seed, platform, count, reach) so results are
// stable; an optional shuffle seed reorders them. Dependency-free.

import {
  BLOCKLIST,
  GENERIC_BROAD,
  GENERIC_NICHE,
  PLATFORM_META,
  detectCategory,
  type Platform,
} from "@/lib/tools/hashtag/lexicons";

export type Reach = "broad" | "balanced" | "niche";

export interface HashtagOptions {
  seed: string;
  platform: Platform;
  count: number;
  reach: Reach;
  shuffle: number;
}

export interface HashtagResult {
  tags: string[];
  category: string | null;
  broadCount: number;
  nicheCount: number;
}

function clean(word: string): string {
  return word.normalize("NFKD").replace(/[^\p{L}\p{N}_]/gu, "").toLowerCase();
}

function pascal(words: string[]): string {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function camel(words: string[]): string {
  return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join("");
}

// tiny seeded PRNG (mulberry32) for stable shuffles
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWith(arr: string[], seed: number): string[] {
  const rand = rng(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateHashtags(opts: HashtagOptions): HashtagResult {
  const rawWords = opts.seed.split(/[\s,]+/).map(clean).filter(Boolean);
  if (rawWords.length === 0) return { tags: [], category: null, broadCount: 0, nicheCount: 0 };

  const words = Array.from(new Set(rawWords)).slice(0, 5);
  const category = detectCategory(words);
  const combined = words.length > 1 ? words.join("") : "";

  // core: the seed itself in useful casings (always first, highest relevance)
  const core: string[] = [];
  for (const w of words) core.push(w);
  if (combined) { core.push(combined); core.push(camel(words)); }
  if (words.length > 1) core.push(pascal(words));

  // broad pool: most-relevant first (category + platform), then seed × modifiers
  const broad: string[] = [];
  if (category) broad.push(...category.tags.slice(0, 6));
  broad.push(...PLATFORM_META[opts.platform].tags);
  for (const w of words) {
    for (const m of GENERIC_BROAD) { broad.push(w + m); broad.push(m + w); }
  }

  // niche pool: seed × long-tail modifiers + category long-tail + multiword combos
  const niche: string[] = [];
  for (const w of words) {
    for (const m of GENERIC_NICHE) { niche.push(w + m); }
  }
  if (combined) for (const m of GENERIC_NICHE) niche.push(combined + m);
  if (category) niche.push(...category.tags.slice(6));

  const dedupe = (list: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of list) {
      const c = clean(t);
      if (!c || c.length < 2 || c.length > 30) continue;
      if (BLOCKLIST.has(c)) continue;
      if (seen.has(c)) continue;
      seen.add(c);
      out.push(c);
    }
    return out;
  };

  const coreClean = dedupe(core);
  let broadClean = dedupe(broad).filter((t) => !coreClean.includes(t));
  let nicheClean = dedupe(niche).filter((t) => !coreClean.includes(t) && !broadClean.includes(t));

  if (opts.shuffle > 0) {
    broadClean = shuffleWith(broadClean, opts.shuffle * 2 + 1);
    nicheClean = shuffleWith(nicheClean, opts.shuffle * 7 + 3);
  }

  const count = Math.max(1, Math.min(opts.count, 60));
  const remaining = Math.max(0, count - coreClean.length);
  const broadRatio = opts.reach === "broad" ? 0.75 : opts.reach === "niche" ? 0.25 : 0.5;
  let nBroad = Math.round(remaining * broadRatio);
  let nNiche = remaining - nBroad;
  // backfill if one pool runs short
  if (nBroad > broadClean.length) { nNiche += nBroad - broadClean.length; nBroad = broadClean.length; }
  if (nNiche > nicheClean.length) { nBroad = Math.min(broadClean.length, nBroad + (nNiche - nicheClean.length)); nNiche = nicheClean.length; }

  const pickedBroad = broadClean.slice(0, nBroad);
  const pickedNiche = nicheClean.slice(0, nNiche);
  const tags = [...coreClean, ...pickedBroad, ...pickedNiche].slice(0, count);

  return {
    tags,
    category: category?.name ?? null,
    broadCount: pickedBroad.length,
    nicheCount: pickedNiche.length,
  };
}

export function withHash(tags: string[]): string[] {
  return tags.map((t) => `#${t}`);
}
export function toBlock(tags: string[]): string {
  return withHash(tags).join(" ");
}
export function toLines(tags: string[]): string {
  return withHash(tags).join("\n");
}
