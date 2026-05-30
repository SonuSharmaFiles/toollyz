// Extended color-space conversions for the Toollyz Color Picker.
//
// Adds HSV, HWB and OKLCH/OKLab on top of the HEX/RGB/HSL helpers in
// `color.ts`. The OKLCH math follows Björn Ottosson's reference
// implementation (https://bottosson.github.io/posts/oklab/) — sRGB → linear
// → OKLab → OKLCH and back, with the standard sRGB transfer function.

import type { RGB } from "@/lib/tools/color/color";

export interface HSV { h: number; s: number; v: number }
export interface HWB { h: number; w: number; b: number }
export interface OKLCH { l: number; c: number; h: number }

// ─── HSV ─────────────────────────────────────────────────────────────────

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(max * 100) };
}

// ─── HWB ─────────────────────────────────────────────────────────────────

export function rgbToHwb(rgb: RGB): HWB {
  const hsv = rgbToHsv(rgb);
  const w = Math.round((Math.min(rgb.r, rgb.g, rgb.b) / 255) * 100);
  const b = Math.round((1 - Math.max(rgb.r, rgb.g, rgb.b) / 255) * 100);
  return { h: hsv.h, w, b };
}

// ─── OKLCH ───────────────────────────────────────────────────────────────

function srgbToLinear(v: number): number {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const x = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(x * 255)));
}

interface OKLab { l: number; a: number; b: number }

function rgbToOklab({ r, g, b }: RGB): OKLab {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToRgb({ l, a, b }: OKLab): RGB {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const lL = l_ * l_ * l_;
  const mL = m_ * m_ * m_;
  const sL = s_ * s_ * s_;
  const rl = 4.0767416621 * lL - 3.3077115913 * mL + 0.2309699292 * sL;
  const gl = -1.2684380046 * lL + 2.6097574011 * mL - 0.3413193965 * sL;
  const bl = -0.0041960863 * lL - 0.7034186147 * mL + 1.707614701 * sL;
  return { r: linearToSrgb(rl), g: linearToSrgb(gl), b: linearToSrgb(bl) };
}

export function rgbToOklch(rgb: RGB): OKLCH {
  const lab = rgbToOklab(rgb);
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.l, c, h };
}

export function oklchToRgb({ l, c, h }: OKLCH): RGB {
  const hr = (h * Math.PI) / 180;
  return oklabToRgb({ l, a: c * Math.cos(hr), b: c * Math.sin(hr) });
}

// ─── Formatters ──────────────────────────────────────────────────────────

export function formatHsv({ h, s, v }: HSV): string {
  return `hsv(${h}, ${s}%, ${v}%)`;
}

export function formatHwb({ h, w, b }: HWB, alpha?: number): string {
  if (alpha !== undefined && alpha < 1) return `hwb(${h} ${w}% ${b}% / ${alpha.toFixed(2)})`;
  return `hwb(${h} ${w}% ${b}%)`;
}

export function formatOklch({ l, c, h }: OKLCH, alpha?: number): string {
  const lp = (l * 100).toFixed(1);
  const cs = c.toFixed(3);
  const hs = h.toFixed(1);
  if (alpha !== undefined && alpha < 1) return `oklch(${lp}% ${cs} ${hs} / ${alpha.toFixed(2)})`;
  return `oklch(${lp}% ${cs} ${hs})`;
}
