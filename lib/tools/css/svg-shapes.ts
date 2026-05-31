// SVG Shape Generator engine. A library of common decorative SVG shapes
// rendered as parameterised path / primitive elements. Each shape returns
// a complete <svg> that can be copied or downloaded. Fill is solid or a
// two-stop linear gradient; stroke is optional.

export type ShapeKind =
  | "circle"
  | "square"
  | "rounded-square"
  | "triangle"
  | "rhombus"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "star"
  | "heart"
  | "arrow-right"
  | "chevron"
  | "speech-bubble"
  | "lightning"
  | "cross"
  | "ring";

export interface ShapeFill {
  type: "solid" | "gradient";
  color1: string;
  color2: string;
  angle: number;
}

export interface ShapeStyle {
  fill: ShapeFill;
  /** Optional outline. */
  stroke: string;
  strokeWidth: number;
  /** SVG viewBox size (square). */
  size: number;
}

export const DEFAULT_STYLE: ShapeStyle = {
  fill: { type: "gradient", color1: "#6366f1", color2: "#a855f7", angle: 135 },
  stroke: "#0f172a",
  strokeWidth: 0,
  size: 400,
};

interface ShapeMeta {
  id: ShapeKind;
  label: string;
}

export const SHAPES: ShapeMeta[] = [
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "rounded-square", label: "Rounded square" },
  { id: "triangle", label: "Triangle" },
  { id: "rhombus", label: "Rhombus" },
  { id: "pentagon", label: "Pentagon" },
  { id: "hexagon", label: "Hexagon" },
  { id: "octagon", label: "Octagon" },
  { id: "star", label: "Star" },
  { id: "heart", label: "Heart" },
  { id: "arrow-right", label: "Arrow" },
  { id: "chevron", label: "Chevron" },
  { id: "speech-bubble", label: "Speech bubble" },
  { id: "lightning", label: "Lightning" },
  { id: "cross", label: "Cross" },
  { id: "ring", label: "Ring" },
];

function polygon(points: { x: number; y: number }[]): string {
  return points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");
}
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Returns inner SVG markup (without the wrapping <svg>) for a given shape. */
export function buildBody(kind: ShapeKind, size: number, fillAttr: string, strokeAttr: string): string {
  const s = size;
  const c = s / 2;
  switch (kind) {
    case "circle":
      return `<circle cx="${c}" cy="${c}" r="${c - 10}" fill="${fillAttr}" ${strokeAttr} />`;
    case "square":
      return `<rect x="10" y="10" width="${s - 20}" height="${s - 20}" fill="${fillAttr}" ${strokeAttr} />`;
    case "rounded-square":
      return `<rect x="10" y="10" width="${s - 20}" height="${s - 20}" rx="${s / 6}" ry="${s / 6}" fill="${fillAttr}" ${strokeAttr} />`;
    case "triangle":
      return `<polygon points="${polygon([
        { x: c, y: 20 },
        { x: s - 20, y: s - 20 },
        { x: 20, y: s - 20 },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    case "rhombus":
      return `<polygon points="${polygon([
        { x: c, y: 20 },
        { x: s - 20, y: c },
        { x: c, y: s - 20 },
        { x: 20, y: c },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    case "pentagon":
      return `<polygon points="${polygon(regularPolygon(5, c, s * 0.4))}" fill="${fillAttr}" ${strokeAttr} />`;
    case "hexagon":
      return `<polygon points="${polygon(regularPolygon(6, c, s * 0.4))}" fill="${fillAttr}" ${strokeAttr} />`;
    case "octagon":
      return `<polygon points="${polygon(regularPolygon(8, c, s * 0.42))}" fill="${fillAttr}" ${strokeAttr} />`;
    case "star":
      return `<polygon points="${polygon(starPoints(5, c, c, s * 0.42, s * 0.16))}" fill="${fillAttr}" ${strokeAttr} />`;
    case "heart": {
      const w = s - 20;
      const h = s - 20;
      // Two cubic Bezier arcs joined at top + bottom.
      const cx = 10 + w / 2;
      const cy = 10 + h * 0.32;
      const d = `M ${cx} ${10 + h * 0.95}
        C ${10 + w * 0.05} ${10 + h * 0.6}, ${10 + w * 0.05} ${10 + h * 0.1}, ${cx} ${cy}
        C ${10 + w * 0.95} ${10 + h * 0.1}, ${10 + w * 0.95} ${10 + h * 0.6}, ${cx} ${10 + h * 0.95} Z`;
      return `<path d="${d}" fill="${fillAttr}" ${strokeAttr} />`;
    }
    case "arrow-right":
      return `<polygon points="${polygon([
        { x: 20, y: c - s * 0.18 },
        { x: s * 0.6, y: c - s * 0.18 },
        { x: s * 0.6, y: 20 },
        { x: s - 20, y: c },
        { x: s * 0.6, y: s - 20 },
        { x: s * 0.6, y: c + s * 0.18 },
        { x: 20, y: c + s * 0.18 },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    case "chevron":
      return `<polygon points="${polygon([
        { x: 20, y: 20 },
        { x: s * 0.75, y: 20 },
        { x: s - 20, y: c },
        { x: s * 0.75, y: s - 20 },
        { x: 20, y: s - 20 },
        { x: s * 0.25, y: c },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    case "speech-bubble":
      return `<polygon points="${polygon([
        { x: 20, y: 20 },
        { x: s - 20, y: 20 },
        { x: s - 20, y: s * 0.75 },
        { x: s * 0.75, y: s * 0.75 },
        { x: s * 0.75, y: s - 20 },
        { x: s * 0.5, y: s * 0.75 },
        { x: 20, y: s * 0.75 },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    case "lightning":
      return `<polygon points="${polygon([
        { x: s * 0.55, y: 20 },
        { x: 20, y: c },
        { x: s * 0.35, y: c },
        { x: s * 0.25, y: s - 20 },
        { x: s - 20, y: s * 0.45 },
        { x: s * 0.55, y: s * 0.45 },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    case "cross": {
      const t = s * 0.15;
      const m = c - t / 2;
      return `<polygon points="${polygon([
        { x: m, y: 20 },
        { x: m + t, y: 20 },
        { x: m + t, y: m },
        { x: s - 20, y: m },
        { x: s - 20, y: m + t },
        { x: m + t, y: m + t },
        { x: m + t, y: s - 20 },
        { x: m, y: s - 20 },
        { x: m, y: m + t },
        { x: 20, y: m + t },
        { x: 20, y: m },
        { x: m, y: m },
      ])}" fill="${fillAttr}" ${strokeAttr} />`;
    }
    case "ring": {
      const r = c - 20;
      const inner = r * 0.6;
      // Use evenodd ring: outer + inner counter-clockwise.
      return `<path d="M ${c - r} ${c} A ${r} ${r} 0 1 0 ${c + r} ${c} A ${r} ${r} 0 1 0 ${c - r} ${c} Z M ${c - inner} ${c} A ${inner} ${inner} 0 1 1 ${c + inner} ${c} A ${inner} ${inner} 0 1 1 ${c - inner} ${c} Z" fill-rule="evenodd" fill="${fillAttr}" ${strokeAttr} />`;
    }
  }
}

function regularPolygon(n: number, cx: number, r: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const rot = -Math.PI / 2; // Start at top.
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n;
    out.push({ x: cx + Math.cos(a) * r, y: cx + Math.sin(a) * r });
  }
  return out;
}

function starPoints(spikes: number, cx: number, cy: number, outerR: number, innerR: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const step = Math.PI / spikes;
  let rot = (Math.PI / 2) * 3;
  for (let i = 0; i < spikes; i++) {
    out.push({ x: cx + Math.cos(rot) * outerR, y: cy + Math.sin(rot) * outerR });
    rot += step;
    out.push({ x: cx + Math.cos(rot) * innerR, y: cy + Math.sin(rot) * innerR });
    rot += step;
  }
  return out;
}

export function buildSvg(kind: ShapeKind, style: ShapeStyle): string {
  const s = style.size;
  const gradId = `g${kind}`;
  const defs =
    style.fill.type === "gradient"
      ? `<defs><linearGradient id="${gradId}" gradientTransform="rotate(${style.fill.angle})">
  <stop offset="0%" stop-color="${style.fill.color1}" />
  <stop offset="100%" stop-color="${style.fill.color2}" />
</linearGradient></defs>`
      : "";
  const fillAttr = style.fill.type === "gradient" ? `url(#${gradId})` : style.fill.color1;
  const strokeAttr =
    style.strokeWidth > 0
      ? `stroke="${style.stroke}" stroke-width="${style.strokeWidth}" stroke-linejoin="round"`
      : "";
  const body = buildBody(kind, s, fillAttr, strokeAttr);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
${defs}
${body}
</svg>`;
}
