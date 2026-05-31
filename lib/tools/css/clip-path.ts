// CSS Clip-Path Generator engine. Models the two practical clip-path
// shapes designers actually use:
//   - polygon(x1% y1%, x2% y2%, …) — arbitrary points
//   - inset(t r b l round r)        — rectangular crop with optional radius
//
// The polygon points are stored as { xPct, yPct } and rendered into both a
// CSS string and an SVG preview. The on-page editor lets the user drag
// each point with the pointer; we expose the engine here as pure functions
// so the component stays presentation-only.

export interface ClipPoint {
  xPct: number;
  yPct: number;
}

export type ClipKind = "polygon" | "inset";

export interface ClipState {
  kind: ClipKind;
  /** Polygon points (only used when kind === "polygon"). */
  points: ClipPoint[];
  /** Inset values % (top, right, bottom, left, radius). */
  inset: { t: number; r: number; b: number; l: number; radius: number };
}

export interface ClipPreset {
  id: string;
  label: string;
  points: ClipPoint[];
}

export const PRESETS: ClipPreset[] = [
  {
    id: "rect",
    label: "Rectangle",
    points: [
      { xPct: 0, yPct: 0 },
      { xPct: 100, yPct: 0 },
      { xPct: 100, yPct: 100 },
      { xPct: 0, yPct: 100 },
    ],
  },
  {
    id: "triangle",
    label: "Triangle",
    points: [
      { xPct: 50, yPct: 0 },
      { xPct: 100, yPct: 100 },
      { xPct: 0, yPct: 100 },
    ],
  },
  {
    id: "rhombus",
    label: "Rhombus",
    points: [
      { xPct: 50, yPct: 0 },
      { xPct: 100, yPct: 50 },
      { xPct: 50, yPct: 100 },
      { xPct: 0, yPct: 50 },
    ],
  },
  {
    id: "trapezoid",
    label: "Trapezoid",
    points: [
      { xPct: 20, yPct: 0 },
      { xPct: 80, yPct: 0 },
      { xPct: 100, yPct: 100 },
      { xPct: 0, yPct: 100 },
    ],
  },
  {
    id: "parallelogram",
    label: "Parallelogram",
    points: [
      { xPct: 25, yPct: 0 },
      { xPct: 100, yPct: 0 },
      { xPct: 75, yPct: 100 },
      { xPct: 0, yPct: 100 },
    ],
  },
  {
    id: "pentagon",
    label: "Pentagon",
    points: [
      { xPct: 50, yPct: 0 },
      { xPct: 100, yPct: 38 },
      { xPct: 82, yPct: 100 },
      { xPct: 18, yPct: 100 },
      { xPct: 0, yPct: 38 },
    ],
  },
  {
    id: "hexagon",
    label: "Hexagon",
    points: [
      { xPct: 25, yPct: 0 },
      { xPct: 75, yPct: 0 },
      { xPct: 100, yPct: 50 },
      { xPct: 75, yPct: 100 },
      { xPct: 25, yPct: 100 },
      { xPct: 0, yPct: 50 },
    ],
  },
  {
    id: "octagon",
    label: "Octagon",
    points: [
      { xPct: 30, yPct: 0 },
      { xPct: 70, yPct: 0 },
      { xPct: 100, yPct: 30 },
      { xPct: 100, yPct: 70 },
      { xPct: 70, yPct: 100 },
      { xPct: 30, yPct: 100 },
      { xPct: 0, yPct: 70 },
      { xPct: 0, yPct: 30 },
    ],
  },
  {
    id: "star",
    label: "Star",
    points: starPoints(5, 50, 50, 50, 20),
  },
  {
    id: "arrow",
    label: "Right arrow",
    points: [
      { xPct: 0, yPct: 20 },
      { xPct: 60, yPct: 20 },
      { xPct: 60, yPct: 0 },
      { xPct: 100, yPct: 50 },
      { xPct: 60, yPct: 100 },
      { xPct: 60, yPct: 80 },
      { xPct: 0, yPct: 80 },
    ],
  },
  {
    id: "chevron",
    label: "Chevron",
    points: [
      { xPct: 0, yPct: 0 },
      { xPct: 75, yPct: 0 },
      { xPct: 100, yPct: 50 },
      { xPct: 75, yPct: 100 },
      { xPct: 0, yPct: 100 },
      { xPct: 25, yPct: 50 },
    ],
  },
  {
    id: "message",
    label: "Speech bubble",
    points: [
      { xPct: 0, yPct: 0 },
      { xPct: 100, yPct: 0 },
      { xPct: 100, yPct: 75 },
      { xPct: 75, yPct: 75 },
      { xPct: 75, yPct: 100 },
      { xPct: 50, yPct: 75 },
      { xPct: 0, yPct: 75 },
    ],
  },
];

function starPoints(spikes: number, cx: number, cy: number, outerR: number, innerR: number): ClipPoint[] {
  const points: ClipPoint[] = [];
  const step = Math.PI / spikes;
  let rot = (Math.PI / 2) * 3;
  for (let i = 0; i < spikes; i++) {
    points.push({ xPct: cx + Math.cos(rot) * outerR, yPct: cy + Math.sin(rot) * outerR });
    rot += step;
    points.push({ xPct: cx + Math.cos(rot) * innerR, yPct: cy + Math.sin(rot) * innerR });
    rot += step;
  }
  return points.map((p) => ({ xPct: round(p.xPct), yPct: round(p.yPct) }));
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function pointsToCss(points: ClipPoint[]): string {
  if (points.length < 3) return "none";
  return `polygon(${points
    .map((p) => `${round(p.xPct)}% ${round(p.yPct)}%`)
    .join(", ")})`;
}

export function insetToCss(i: ClipState["inset"]): string {
  const radius = i.radius > 0 ? ` round ${i.radius}px` : "";
  return `inset(${i.t}% ${i.r}% ${i.b}% ${i.l}%${radius})`;
}

export function toCss(state: ClipState): string {
  return state.kind === "polygon" ? pointsToCss(state.points) : insetToCss(state.inset);
}

export const DEFAULT_STATE: ClipState = {
  kind: "polygon",
  points: PRESETS[5].points, // pentagon
  inset: { t: 5, r: 10, b: 5, l: 10, radius: 24 },
};
