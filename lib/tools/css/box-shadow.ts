// Box Shadow Generator engine. A layer model — each shadow is one entry,
// the final CSS is the comma-separated list of `inset? x y blur spread color`.
// Presets are designed to cover the most common real-world UI shadows:
// elevation tiers (Material), neumorphism inner glow, glow-on-hover, etc.

export interface ShadowLayer {
  id: string;
  inset: boolean;
  /** Horizontal offset in px. */
  x: number;
  /** Vertical offset in px. */
  y: number;
  /** Blur radius in px (must be ≥ 0). */
  blur: number;
  /** Spread radius in px (can be negative). */
  spread: number;
  /** rgba colour. */
  color: string;
}

export function layerToCss(l: ShadowLayer): string {
  return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
}

export function toCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return "none";
  return layers.map(layerToCss).join(", ");
}

export function newLayer(partial: Partial<ShadowLayer> = {}): ShadowLayer {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    inset: false,
    x: 0,
    y: 6,
    blur: 16,
    spread: -2,
    color: "rgba(15, 23, 42, 0.18)",
    ...partial,
  };
}

export interface ShadowPreset {
  id: string;
  label: string;
  layers: ShadowLayer[];
}

export const PRESETS: ShadowPreset[] = [
  {
    id: "soft",
    label: "Soft",
    layers: [newLayer({ x: 0, y: 4, blur: 12, spread: -2, color: "rgba(15, 23, 42, 0.12)" })],
  },
  {
    id: "elevated",
    label: "Elevated",
    layers: [
      newLayer({ x: 0, y: 2, blur: 4, spread: -1, color: "rgba(15, 23, 42, 0.10)" }),
      newLayer({ x: 0, y: 12, blur: 24, spread: -4, color: "rgba(15, 23, 42, 0.18)" }),
    ],
  },
  {
    id: "floating",
    label: "Floating",
    layers: [
      newLayer({ x: 0, y: 8, blur: 16, spread: -4, color: "rgba(15, 23, 42, 0.15)" }),
      newLayer({ x: 0, y: 24, blur: 48, spread: -8, color: "rgba(15, 23, 42, 0.20)" }),
    ],
  },
  {
    id: "neumorph",
    label: "Neumorphic",
    layers: [
      newLayer({ inset: true, x: 6, y: 6, blur: 12, spread: 0, color: "rgba(0,0,0,0.18)" }),
      newLayer({ inset: true, x: -6, y: -6, blur: 12, spread: 0, color: "rgba(255,255,255,0.85)" }),
    ],
  },
  {
    id: "glow",
    label: "Glow",
    layers: [newLayer({ x: 0, y: 0, blur: 24, spread: 4, color: "rgba(99, 102, 241, 0.55)" })],
  },
  {
    id: "ring",
    label: "Focus ring",
    layers: [newLayer({ x: 0, y: 0, blur: 0, spread: 3, color: "rgba(59, 130, 246, 0.55)" })],
  },
  {
    id: "long",
    label: "Long shadow",
    layers: Array.from({ length: 18 }, (_, i) =>
      newLayer({ x: i + 1, y: i + 1, blur: 0, spread: 0, color: "rgba(15, 23, 42, 0.05)" }),
    ),
  },
  {
    id: "stripe",
    label: "Layered stripes",
    layers: [
      newLayer({ x: 10, y: 10, blur: 0, spread: 0, color: "#fde68a" }),
      newLayer({ x: 20, y: 20, blur: 0, spread: 0, color: "#fca5a5" }),
      newLayer({ x: 30, y: 30, blur: 0, spread: 0, color: "#a5b4fc" }),
    ],
  },
];

export const TARGET_PRESETS = [
  { id: "card", label: "Card", w: 280, h: 180, radius: 16, bg: "#ffffff" },
  { id: "button", label: "Button", w: 180, h: 56, radius: 999, bg: "#6366f1" },
  { id: "square", label: "Square", w: 180, h: 180, radius: 24, bg: "#f8fafc" },
  { id: "circle", label: "Circle", w: 180, h: 180, radius: 999, bg: "#ec4899" },
] as const;

export type TargetId = (typeof TARGET_PRESETS)[number]["id"];
