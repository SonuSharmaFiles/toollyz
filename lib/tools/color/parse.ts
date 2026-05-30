// Strict HEX / RGB(A) input parsers used by the HEX↔RGB converter tools.
// Returns null on invalid input (the existing color.ts helpers are lenient and
// pad missing digits, which would mask bad input from a converter). Adds alpha
// support that the base helpers don't carry around.

import type { RGB } from "@/lib/tools/color/color";

export interface RgbaColor { r: number; g: number; b: number; a: number }

const HEX_RE = /^#?([0-9a-fA-F]{3,8})$/;

export function parseHexStrict(input: string): RgbaColor | null {
  const m = input.trim().match(HEX_RE);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  else if (h.length === 4) h = h.split("").map((c) => c + c).join("");
  else if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function readChannel(value: string, max = 255): number | null {
  const v = value.trim();
  if (v.endsWith("%")) {
    const n = parseFloat(v.slice(0, -1));
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(255, Math.round((n / 100) * 255)));
  }
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return null;
  if (max === 1) return Math.max(0, Math.min(1, n));
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function parseRgbInput(input: string): RgbaColor | null {
  const stripped = input.trim().replace(/^rgba?\s*\(/i, "").replace(/\)$/, "");
  const parts = stripped.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const r = readChannel(parts[0]);
  const g = readChannel(parts[1]);
  const b = readChannel(parts[2]);
  if (r === null || g === null || b === null) return null;
  let a = 1;
  if (parts.length === 4) {
    const alpha = readChannel(parts[3], 1);
    if (alpha === null) return null;
    a = alpha;
  }
  return { r, g, b, a };
}

export function rgbaToHex(c: RgbaColor, opts: { uppercase?: boolean; includeAlpha?: boolean } = {}): string {
  const pad = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  const aByte = Math.round(c.a * 255);
  const includeA = opts.includeAlpha ?? c.a < 1;
  const hex = pad(c.r) + pad(c.g) + pad(c.b) + (includeA ? pad(aByte) : "");
  return "#" + (opts.uppercase ? hex.toUpperCase() : hex.toLowerCase());
}

export function rgbaToString(c: RgbaColor): string {
  if (c.a < 1) return `rgba(${c.r}, ${c.g}, ${c.b}, ${Number(c.a.toFixed(3))})`;
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

export function relativeLuminance(c: { r: number; g: number; b: number }): number {
  const linear = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * linear(c.r) + 0.7152 * linear(c.g) + 0.0722 * linear(c.b);
}
export function contrastInk(c: { r: number; g: number; b: number }): string {
  return relativeLuminance(c) > 0.55 ? "#0b1020" : "#ffffff";
}

export function asRgb({ r, g, b }: RgbaColor): RGB { return { r, g, b }; }
