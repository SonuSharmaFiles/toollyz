// Logic for the Toollyz Clipboard Manager. A clipboard history is a list of
// saved text snippets kept entirely in the browser's localStorage. Pure and
// dependency-free — nothing is ever uploaded.

export interface ClipItem {
  id: string;
  text: string;
  pinned: boolean;
  ts: number;
}

export const MAX_ITEMS = 100;

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
}

export function preview(text: string, len = 90): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > len ? clean.slice(0, len) + "…" : clean;
}

export function relativeTime(ts: number): string {
  const delta = Date.now() - ts;
  const units: [number, string][] = [
    [86400000, "day"],
    [3600000, "hour"],
    [60000, "minute"],
  ];
  for (const [ms, label] of units) {
    const n = Math.floor(delta / ms);
    if (n >= 1) return `${n} ${label}${n === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

export interface ClipStats {
  items: number;
  pinned: number;
  chars: number;
}

export function clipStats(items: ClipItem[]): ClipStats {
  return {
    items: items.length,
    pinned: items.filter((i) => i.pinned).length,
    chars: items.reduce((sum, i) => sum + i.text.length, 0),
  };
}

/** Sort pinned first, then most-recent. */
export function sortItems(items: ClipItem[]): ClipItem[] {
  return [...items].sort((a, b) => (a.pinned === b.pinned ? b.ts - a.ts : a.pinned ? -1 : 1));
}

export function addItem(items: ClipItem[], text: string): ClipItem[] {
  const trimmed = text.replace(/\s+$/g, "");
  if (!trimmed.trim()) return items;
  // de-duplicate identical text (keep the newer one on top)
  const rest = items.filter((i) => i.text !== trimmed);
  const pinned = items.find((i) => i.text === trimmed)?.pinned ?? false;
  return [{ id: uid(), text: trimmed, pinned, ts: Date.now() }, ...rest].slice(0, MAX_ITEMS);
}

export type Transform = "upper" | "lower" | "trim" | "collapse";

export function applyTransform(text: string, t: Transform): string {
  switch (t) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "trim": return text.trim();
    case "collapse": return text.replace(/\s+/g, " ").trim();
  }
}

export const SAMPLE_ITEMS: ClipItem[] = [
  { id: uid(), text: "https://toollyz.com/tools/clipboard-manager", pinned: true, ts: Date.now() - 120000 },
  { id: uid(), text: "git commit -m \"Ship clipboard manager\"", pinned: false, ts: Date.now() - 600000 },
  { id: uid(), text: "The quick brown fox jumps over the lazy dog.", pinned: false, ts: Date.now() - 3600000 },
];
