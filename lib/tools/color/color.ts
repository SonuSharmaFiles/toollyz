// Compact color utilities — HEX / RGB / HSL conversions, contrast ratios.

export interface RGB {
  r: number; // 0..255
  g: number; // 0..255
  b: number; // 0..255
}

export interface HSL {
  h: number; // 0..360
  s: number; // 0..100
  l: number; // 0..100
}

// ─── Conversions ─────────────────────────────────────────────────────────

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const n = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${n(r)}${n(g)}${n(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let s = 0;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return {
    r: Math.round(hueToRgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hh) * 255),
    b: Math.round(hueToRgb(p, q, hh - 1 / 3) * 255),
  };
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

// ─── Formatters ──────────────────────────────────────────────────────────

export function formatRgb({ r, g, b }: RGB, alpha?: number): string {
  if (alpha !== undefined && alpha < 1) return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl({ h, s, l }: HSL, alpha?: number): string {
  if (alpha !== undefined && alpha < 1) return `hsla(${h}, ${s}%, ${l}%, ${alpha.toFixed(2)})`;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function formatCmyk(rgb: RGB): string {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return "cmyk(0%, 0%, 0%, 100%)";
  const c = ((1 - r - k) / (1 - k)) * 100;
  const m = ((1 - g - k) / (1 - k)) * 100;
  const y = ((1 - b - k) / (1 - k)) * 100;
  return `cmyk(${Math.round(c)}%, ${Math.round(m)}%, ${Math.round(y)}%, ${Math.round(k * 100)}%)`;
}

// ─── Mutations ───────────────────────────────────────────────────────────

export function adjustHsl(
  hex: string,
  delta: { h?: number; s?: number; l?: number },
): string {
  const hsl = hexToHsl(hex);
  const next: HSL = {
    h: ((hsl.h + (delta.h ?? 0)) % 360 + 360) % 360,
    s: clamp(hsl.s + (delta.s ?? 0), 0, 100),
    l: clamp(hsl.l + (delta.l ?? 0), 0, 100),
  };
  return hslToHex(next);
}
