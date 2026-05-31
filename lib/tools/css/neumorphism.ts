// Neumorphism Generator engine. Soft-UI neumorphism is one base color
// + two diagonally-offset shadows: a dark drop on one side and a light
// drop on the opposite side, so the element appears extruded from (or
// pressed into) the surrounding surface. Recipe:
//   1) The container background MUST match the page background — otherwise
//      the shadows look wrong. We expose `base` and use it for both.
//   2) Distance = how far the two shadows are offset.
//   3) Intensity = how much darker / lighter the shadow / highlight is
//      vs. the base (10-20% is realistic; >35% looks fake).
//   4) Blur ≈ distance × 2 (we expose both for tuning).
//   5) Inset flips both shadows inside to create a pressed/inset look.

export interface NeumorphState {
  /** Background hex. Used for both the page and the element. */
  base: string;
  /** px — how far the two shadows drift. */
  distance: number;
  /** px — Gaussian blur for both shadows. */
  blur: number;
  /** 0-100 — lighten % for the highlight + darken % for the shadow. */
  intensity: number;
  /** px — border radius of the surface. */
  radius: number;
  /** Concave / convex / flat / pressed. */
  variant: "flat" | "convex" | "concave" | "pressed";
}

export const DEFAULT_STATE: NeumorphState = {
  base: "#e0e5ec",
  distance: 10,
  blur: 20,
  intensity: 15,
  radius: 24,
  variant: "flat",
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex);
  if (!m) return { r: 224, g: 229, b: 236 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
function lighten(hex: string, pct: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * (pct / 100), g + (255 - g) * (pct / 100), b + (255 - b) * (pct / 100));
}
function darken(hex: string, pct: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - pct / 100), g * (1 - pct / 100), b * (1 - pct / 100));
}

export function buildShadows(state: NeumorphState): { dark: string; light: string } {
  return {
    dark: darken(state.base, state.intensity),
    light: lighten(state.base, state.intensity * 1.4),
  };
}

export function toBoxShadow(state: NeumorphState): string {
  const { dark, light } = buildShadows(state);
  const d = state.distance;
  const b = state.blur;
  if (state.variant === "pressed") {
    return `inset ${d}px ${d}px ${b}px ${dark}, inset -${d}px -${d}px ${b}px ${light}`;
  }
  return `${d}px ${d}px ${b}px ${dark}, -${d}px -${d}px ${b}px ${light}`;
}

export function toBackground(state: NeumorphState): string {
  if (state.variant === "convex") {
    return `linear-gradient(145deg, ${lighten(state.base, 6)}, ${darken(state.base, 6)})`;
  }
  if (state.variant === "concave") {
    return `linear-gradient(145deg, ${darken(state.base, 6)}, ${lighten(state.base, 6)})`;
  }
  return state.base;
}

export function toCss(state: NeumorphState): string {
  return [
    `background: ${toBackground(state)};`,
    `border-radius: ${state.radius}px;`,
    `box-shadow: ${toBoxShadow(state)};`,
  ].join("\n");
}

export const PRESETS: { id: string; label: string; state: Partial<NeumorphState> }[] = [
  { id: "default", label: "Default", state: {} },
  { id: "soft", label: "Soft", state: { distance: 6, blur: 14, intensity: 10 } },
  { id: "dramatic", label: "Dramatic", state: { distance: 16, blur: 32, intensity: 22 } },
  { id: "convex", label: "Convex", state: { variant: "convex" } },
  { id: "concave", label: "Concave", state: { variant: "concave" } },
  { id: "pressed", label: "Pressed", state: { variant: "pressed" } },
  { id: "dark", label: "Dark mode", state: { base: "#1f2937", intensity: 20 } },
  { id: "midnight", label: "Midnight", state: { base: "#0f172a", intensity: 30 } },
  { id: "lavender", label: "Lavender", state: { base: "#ede9fe", intensity: 18 } },
];
