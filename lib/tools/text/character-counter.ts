// Character-level analysis + social/SEO/messaging limit data. Builds on the
// shared text engine (word-counter.ts) for word/sentence/timing metrics.

export interface CharBreakdown {
  total: number;
  noSpaces: number;
  spaces: number;
  letters: number;
  digits: number;
  punctuation: number;
  symbols: number;
  emoji: number;
  uppercase: number;
  lowercase: number;
  bytes: number;
}

export function byteLength(text: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  return unescape(encodeURIComponent(text)).length;
}

function countRe(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

export function charBreakdown(text: string): CharBreakdown {
  const total = text.length;
  const noSpaces = text.replace(/\s/g, "").length;
  return {
    total,
    noSpaces,
    spaces: total - noSpaces,
    letters: countRe(text, /\p{L}/gu),
    digits: countRe(text, /\p{N}/gu),
    punctuation: countRe(text, /\p{P}/gu),
    symbols: countRe(text, /\p{S}/gu),
    emoji: countRe(text, /\p{Extended_Pictographic}/gu),
    uppercase: countRe(text, /\p{Lu}/gu),
    lowercase: countRe(text, /\p{Ll}/gu),
    bytes: byteLength(text),
  };
}

export interface CharFreq {
  char: string;
  count: number;
  percent: number;
}

export function mostUsedChars(text: string, limit = 8): CharFreq[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
    total++;
  }
  if (!total) return [];
  return [...counts.entries()]
    .map(([char, count]) => ({ char, count, percent: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char))
    .slice(0, limit);
}

// ─── Platform limits ─────────────────────────────────────────────────────────

export type LimitGroup = "Social" | "SEO" | "Messaging";

export interface PlatformLimit {
  id: string;
  label: string;
  group: LimitGroup;
  limit: number;
  ideal?: [number, number];
  note?: string;
}

export const PLATFORM_LIMITS: PlatformLimit[] = [
  { id: "twitter", label: "Twitter / X post", group: "Social", limit: 280 },
  { id: "instagram", label: "Instagram caption", group: "Social", limit: 2200, ideal: [1, 125], note: "First ~125 chars show before “more”." },
  { id: "tiktok", label: "TikTok caption", group: "Social", limit: 2200 },
  { id: "facebook", label: "Facebook post", group: "Social", limit: 63206, ideal: [1, 80], note: "Posts under ~80 chars get more engagement." },
  { id: "linkedin", label: "LinkedIn post", group: "Social", limit: 3000, ideal: [1, 210], note: "First ~210 chars show before “see more”." },
  { id: "yt-title", label: "YouTube title", group: "Social", limit: 100, ideal: [1, 70] },
  { id: "yt-desc", label: "YouTube description", group: "Social", limit: 5000 },
  { id: "google-title", label: "Google title tag", group: "SEO", limit: 60, ideal: [50, 60] },
  { id: "meta-desc", label: "Meta description", group: "SEO", limit: 160, ideal: [120, 160] },
  { id: "sms", label: "SMS message", group: "Messaging", limit: 160, note: "Over 160 chars splits into multiple messages." },
];

export type LimitState = "empty" | "short" | "ideal" | "ok" | "warn" | "over";

export interface LimitStatus {
  count: number;
  remaining: number;
  pct: number; // 0..100 (capped)
  state: LimitState;
  segments?: number; // for SMS
}

export function platformStatus(count: number, p: PlatformLimit): LimitStatus {
  const remaining = p.limit - count;
  const pct = Math.min(100, (count / p.limit) * 100);
  let state: LimitState = "ok";

  if (count === 0) {
    state = "empty";
  } else if (count > p.limit) {
    state = "over";
  } else if (p.ideal) {
    const [min, max] = p.ideal;
    if (count < min) state = "short";
    else if (count <= max) state = "ideal";
    else state = "warn";
  } else {
    state = pct >= 90 ? "warn" : "ok";
  }

  const status: LimitStatus = { count, remaining, pct, state };
  if (p.id === "sms" && count > 0) {
    status.segments = count <= 160 ? 1 : Math.ceil(count / 153);
  }
  return status;
}

export const LIMIT_GROUPS: LimitGroup[] = ["Social", "SEO", "Messaging"];
