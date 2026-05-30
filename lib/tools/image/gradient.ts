// Gradient generator engine for the Toollyz Gradient Generator. Pure
// functions, no DOM. Models the three CSS gradient kinds — linear, radial,
// conic — as plain JS records and serializes them to valid CSS Color Level 4
// gradient strings that browsers accept today.

export type GradientType = "linear" | "radial" | "conic";

export type RadialShape = "ellipse" | "circle";

export interface Stop {
  id: string;
  color: string; // hex or any CSS color
  position: number; // 0..100
}

export interface Gradient {
  type: GradientType;
  // Linear
  angle: number; // degrees
  // Radial
  shape: RadialShape;
  radialPositionX: number; // 0..100
  radialPositionY: number; // 0..100
  // Conic
  conicFromAngle: number; // degrees
  conicPositionX: number; // 0..100
  conicPositionY: number; // 0..100
  // Common
  stops: Stop[];
  repeating: boolean;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function makeStop(color: string, position: number): Stop {
  return { id: uid(), color, position: Math.max(0, Math.min(100, Math.round(position))) };
}

export const DEFAULT_GRADIENT: Gradient = {
  type: "linear",
  angle: 135,
  shape: "ellipse",
  radialPositionX: 50,
  radialPositionY: 50,
  conicFromAngle: 0,
  conicPositionX: 50,
  conicPositionY: 50,
  stops: [makeStop("#6366F1", 0), makeStop("#A855F7", 50), makeStop("#EC4899", 100)],
  repeating: false,
};

function fmtStop(s: Stop): string {
  return `${s.color} ${s.position}%`;
}

function sortedStops(g: Gradient): Stop[] {
  return [...g.stops].sort((a, b) => a.position - b.position);
}

/**
 * Serialize a gradient to a CSS gradient function — e.g.
 * "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)".
 */
export function toCssFunction(g: Gradient): string {
  const stops = sortedStops(g).map(fmtStop).join(", ");
  const prefix = g.repeating ? "repeating-" : "";
  if (g.type === "linear") {
    return `${prefix}linear-gradient(${g.angle}deg, ${stops})`;
  }
  if (g.type === "radial") {
    return `${prefix}radial-gradient(${g.shape} at ${g.radialPositionX}% ${g.radialPositionY}%, ${stops})`;
  }
  return `${prefix}conic-gradient(from ${g.conicFromAngle}deg at ${g.conicPositionX}% ${g.conicPositionY}%, ${stops})`;
}

/** "background-image: linear-gradient(...);" — ready to paste. */
export function toCssDeclaration(g: Gradient): string {
  return `background-image: ${toCssFunction(g)};`;
}

/** "background: ..." shorthand with a fallback solid color (the first stop). */
export function toCssShorthand(g: Gradient): string {
  const fallback = sortedStops(g)[0]?.color ?? "#000000";
  return `background: ${fallback};\nbackground-image: ${toCssFunction(g)};`;
}

/** A Tailwind-arbitrary class: bg-[image:linear-gradient(...)]. */
export function toTailwindClass(g: Gradient): string {
  const fn = toCssFunction(g).replace(/\s+/g, "_");
  return `bg-[image:${fn}]`;
}

/** SVG paint server for export to an SVG file. Currently linear/radial only;
 * conic has no SVG equivalent so falls back to a flat color. */
export function toSvg(g: Gradient, width = 800, height = 400): string {
  const id = "g" + uid();
  const stops = sortedStops(g)
    .map((s) => `<stop offset="${s.position}%" stop-color="${s.color}" />`)
    .join("");
  let def: string;
  if (g.type === "linear") {
    const r = (g.angle - 90) * (Math.PI / 180);
    const x2 = 50 + Math.cos(r) * 50;
    const y2 = 50 + Math.sin(r) * 50;
    const x1 = 50 - Math.cos(r) * 50;
    const y1 = 50 - Math.sin(r) * 50;
    def = `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
  } else if (g.type === "radial") {
    def = `<radialGradient id="${id}" cx="${g.radialPositionX}%" cy="${g.radialPositionY}%" r="70%">${stops}</radialGradient>`;
  } else {
    // Conic isn't standardized in SVG yet; use a flat fill as a fallback.
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${sortedStops(g)[0]?.color ?? "#000"}" /></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs>${def}</defs><rect width="100%" height="100%" fill="url(#${id})" /></svg>`;
}

// ─── Presets ─────────────────────────────────────────────────────────────

export interface Preset {
  id: string;
  label: string;
  gradient: Gradient;
}

function preset(id: string, label: string, partial: Partial<Gradient>): Preset {
  return { id, label, gradient: { ...DEFAULT_GRADIENT, ...partial } };
}

export const PRESETS: Preset[] = [
  preset("dawn", "Dawn", {
    angle: 135,
    stops: [makeStop("#F59E0B", 0), makeStop("#EF4444", 60), makeStop("#A855F7", 100)],
  }),
  preset("ocean", "Ocean", {
    angle: 145,
    stops: [makeStop("#0EA5E9", 0), makeStop("#6366F1", 100)],
  }),
  preset("forest", "Forest", {
    angle: 180,
    stops: [makeStop("#14532D", 0), makeStop("#10B981", 100)],
  }),
  preset("sunset", "Sunset", {
    angle: 90,
    stops: [makeStop("#FCA5A5", 0), makeStop("#EC4899", 50), makeStop("#6366F1", 100)],
  }),
  preset("aurora", "Aurora", {
    angle: 200,
    stops: [makeStop("#10B981", 0), makeStop("#06B6D4", 33), makeStop("#6366F1", 66), makeStop("#A855F7", 100)],
  }),
  preset("peach", "Peach", {
    angle: 135,
    stops: [makeStop("#FED7AA", 0), makeStop("#FB7185", 100)],
  }),
  preset("mint", "Mint", {
    angle: 135,
    stops: [makeStop("#A7F3D0", 0), makeStop("#34D399", 100)],
  }),
  preset("plum", "Plum", {
    angle: 145,
    stops: [makeStop("#581C87", 0), makeStop("#EC4899", 100)],
  }),
  preset("graphite", "Graphite", {
    angle: 145,
    stops: [makeStop("#111827", 0), makeStop("#374151", 100)],
  }),
  preset("nordic", "Nordic", {
    angle: 200,
    stops: [makeStop("#0F172A", 0), makeStop("#1E293B", 50), makeStop("#0EA5E9", 100)],
  }),
  preset("citrus", "Citrus", {
    angle: 90,
    stops: [makeStop("#FACC15", 0), makeStop("#84CC16", 100)],
  }),
  preset("rose", "Rose", {
    angle: 135,
    stops: [makeStop("#FBCFE8", 0), makeStop("#F472B6", 100)],
  }),
  preset("radial-spot", "Radial spot", {
    type: "radial",
    shape: "circle",
    radialPositionX: 30,
    radialPositionY: 30,
    stops: [makeStop("#6366F1", 0), makeStop("#0F172A", 100)],
  }),
  preset("radial-cyan", "Cyan halo", {
    type: "radial",
    shape: "ellipse",
    radialPositionX: 50,
    radialPositionY: 100,
    stops: [makeStop("#06B6D4", 0), makeStop("#0F172A", 80)],
  }),
  preset("conic-rainbow", "Conic rainbow", {
    type: "conic",
    conicPositionX: 50,
    conicPositionY: 50,
    stops: [
      makeStop("#EF4444", 0),
      makeStop("#F59E0B", 17),
      makeStop("#FACC15", 33),
      makeStop("#10B981", 50),
      makeStop("#0EA5E9", 67),
      makeStop("#6366F1", 83),
      makeStop("#EF4444", 100),
    ],
  }),
  preset("conic-pie", "Conic pie", {
    type: "conic",
    conicPositionX: 50,
    conicPositionY: 50,
    stops: [
      makeStop("#6366F1", 0),
      makeStop("#6366F1", 25),
      makeStop("#10B981", 25),
      makeStop("#10B981", 50),
      makeStop("#F59E0B", 50),
      makeStop("#F59E0B", 75),
      makeStop("#EF4444", 75),
      makeStop("#EF4444", 100),
    ],
  }),
];

/** Random gradient using HSL hues 30° apart and pleasant lightness range. */
export function randomGradient(seedType?: GradientType): Gradient {
  const type: GradientType = seedType ?? (["linear", "radial", "conic"] as const)[Math.floor(Math.random() * 3)];
  const baseHue = Math.floor(Math.random() * 360);
  const count = 2 + Math.floor(Math.random() * 3);
  const stops: Stop[] = [];
  for (let i = 0; i < count; i++) {
    const h = (baseHue + i * (30 + Math.random() * 30)) % 360;
    const s = 55 + Math.floor(Math.random() * 25);
    const l = 45 + Math.floor(Math.random() * 25);
    stops.push(makeStop(hslToHex(h, s, l), Math.round((i * 100) / (count - 1))));
  }
  return {
    ...DEFAULT_GRADIENT,
    type,
    angle: Math.floor(Math.random() * 360),
    stops,
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const ss = s / 100;
  const ll = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const c = ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(c * 255);
  };
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}
