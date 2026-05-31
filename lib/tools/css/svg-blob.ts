// SVG Blob Generator engine. Builds an organic closed-curve "blob" by
// scattering N points on a circle with random radial wobble, then joining
// them with a Catmull-Rom-derived cubic Bezier path so the result is
// perfectly smooth (no straight-line artefacts even at low complexity).
//
// Uses a small seedable PRNG (mulberry32) so a given seed always produces
// the same blob — required for the user to share a config and get the
// same shape back. Outputs an SVG `<path d="...">` string and assorted
// metadata (gradient hex, viewBox).

export interface BlobOptions {
  /** Number of anchor points along the perimeter (4-20 looks best). */
  complexity: number;
  /** 0-100 — how strongly radii wobble from the base radius. */
  contrast: number;
  /** Seed for the PRNG — same seed → same shape. */
  seed: number;
  /** ViewBox dimension (square — w === h). */
  size: number;
}

export const DEFAULT_OPTIONS: BlobOptions = {
  complexity: 8,
  contrast: 40,
  seed: 1337,
  size: 400,
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Pt {
  x: number;
  y: number;
}

function controlPointsCatmull(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t = 0.18): { c1: Pt; c2: Pt } {
  return {
    c1: { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t },
    c2: { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t },
  };
}

export function buildBlobPath(options: BlobOptions): string {
  const rng = mulberry32(options.seed);
  const cx = options.size / 2;
  const cy = options.size / 2;
  const baseR = options.size * 0.36;
  const wobble = (baseR * options.contrast) / 100;
  const n = Math.max(4, Math.min(40, options.complexity));

  const points: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const r = baseR + (rng() - 0.5) * 2 * wobble;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }

  // Build closed smooth path via Catmull-Rom → Bezier.
  const at = (i: number) => points[(i + n) % n];
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const { c1, c2 } = controlPointsCatmull(p0, p1, p2, p3, 0.18);
    d += ` C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  d += " Z";
  return d;
}

export interface BlobFill {
  type: "solid" | "gradient";
  color1: string;
  color2: string;
  angle: number;
}

export const FILL_PRESETS: { id: string; label: string; fill: BlobFill }[] = [
  { id: "indigo", label: "Indigo", fill: { type: "gradient", color1: "#6366f1", color2: "#a855f7", angle: 135 } },
  { id: "sunset", label: "Sunset", fill: { type: "gradient", color1: "#fb923c", color2: "#db2777", angle: 135 } },
  { id: "ocean", label: "Ocean", fill: { type: "gradient", color1: "#0ea5e9", color2: "#14b8a6", angle: 135 } },
  { id: "forest", label: "Forest", fill: { type: "gradient", color1: "#22c55e", color2: "#0f766e", angle: 135 } },
  { id: "rose", label: "Rose", fill: { type: "gradient", color1: "#fb7185", color2: "#f97316", angle: 135 } },
  { id: "lavender", label: "Lavender", fill: { type: "gradient", color1: "#c4b5fd", color2: "#fb7185", angle: 135 } },
  { id: "midnight", label: "Midnight", fill: { type: "gradient", color1: "#1e1b4b", color2: "#312e81", angle: 135 } },
  { id: "amber", label: "Amber", fill: { type: "solid", color1: "#f59e0b", color2: "#f59e0b", angle: 0 } },
];

export function buildSvg(options: BlobOptions, fill: BlobFill): string {
  const d = buildBlobPath(options);
  const gradId = `g${options.seed}`;
  const defs =
    fill.type === "gradient"
      ? `<defs><linearGradient id="${gradId}" gradientTransform="rotate(${fill.angle})">
  <stop offset="0%" stop-color="${fill.color1}" />
  <stop offset="100%" stop-color="${fill.color2}" />
</linearGradient></defs>`
      : "";
  const fillAttr = fill.type === "gradient" ? `url(#${gradId})` : fill.color1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${options.size} ${options.size}">
${defs}
<path fill="${fillAttr}" d="${d}" />
</svg>`;
}
