// Deterministic avatar engine for the Toollyz Avatar Generator. Four
// styles (Initials, Identicon, Beam, Pixel) — all driven by a 32-bit FNV-1a
// hash of the seed so the same input always produces the same avatar.

export type Style = "initials" | "identicon" | "beam" | "pixel";

export interface AvatarOptions {
  seed: string;
  style: Style;
  size: number;
  square: boolean;
  /** Palette key — random hue rotation derived from seed when undefined. */
  paletteId: string;
}

export const PALETTES: { id: string; label: string; colors: string[] }[] = [
  { id: "indigo", label: "Indigo & teal", colors: ["#6366F1", "#0EA5E9", "#A855F7", "#10B981", "#F59E0B"] },
  { id: "warm", label: "Warm", colors: ["#F59E0B", "#EF4444", "#EC4899", "#FB923C", "#F472B6"] },
  { id: "cool", label: "Cool", colors: ["#0EA5E9", "#06B6D4", "#3B82F6", "#10B981", "#8B5CF6"] },
  { id: "earth", label: "Earth", colors: ["#84CC16", "#A16207", "#22C55E", "#D97706", "#15803D"] },
  { id: "mono", label: "Mono", colors: ["#1F2937", "#4B5563", "#9CA3AF", "#E5E7EB", "#111827"] },
  { id: "candy", label: "Candy", colors: ["#F472B6", "#A78BFA", "#22D3EE", "#FB7185", "#FBBF24"] },
];

const STYLE_OPTIONS: { id: Style; label: string }[] = [
  { id: "initials", label: "Initials" },
  { id: "identicon", label: "Identicon" },
  { id: "beam", label: "Beam (shapes)" },
  { id: "pixel", label: "Pixel (8×8)" },
];

export { STYLE_OPTIONS };

export const DEFAULT_OPTIONS: AvatarOptions = {
  seed: "Toollyz",
  style: "beam",
  size: 256,
  square: false,
  paletteId: "indigo",
};

/** FNV-1a 32-bit hash → unsigned 32-bit integer. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Mulberry32 — small, fast PRNG seeded by an integer. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function paletteFor(opts: AvatarOptions): string[] {
  return PALETTES.find((p) => p.id === opts.paletteId)?.colors ?? PALETTES[0].colors;
}

function pickColor(palette: string[], rand: () => number): string {
  return palette[Math.floor(rand() * palette.length)];
}

function pickInitials(seed: string): string {
  const cleaned = seed
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .toUpperCase();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
  return cleaned.slice(0, 2);
}

function svgAttrs(size: number, square: boolean): string {
  const clip = square ? "" : "";
  void clip;
  return `width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"`;
}

function backgroundShape(size: number, square: boolean, fill: string): string {
  if (square) return `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.16)}" fill="${fill}" />`;
  return `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fill}" />`;
}

function clipPath(size: number, square: boolean): string {
  // Use a clip-path so non-square shapes (beam) are masked to the avatar shape.
  return square
    ? `<clipPath id="clip"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.16)}" /></clipPath>`
    : `<clipPath id="clip"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></clipPath>`;
}

function buildInitials(opts: AvatarOptions): string {
  const palette = paletteFor(opts);
  const rand = mulberry32(fnv1a(opts.seed));
  const bg = pickColor(palette, rand);
  const initials = pickInitials(opts.seed);
  const fontSize = Math.round(opts.size * 0.44);
  return `<svg ${svgAttrs(opts.size, opts.square)}>
    ${backgroundShape(opts.size, opts.square, bg)}
    <text x="${opts.size / 2}" y="${opts.size / 2}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="#ffffff">${initials}</text>
  </svg>`;
}

function buildIdenticon(opts: AvatarOptions): string {
  const palette = paletteFor(opts);
  const rand = mulberry32(fnv1a(opts.seed));
  const cell = opts.size / 7; // 5 inner cells + 1 cell margin on each side
  const fg = pickColor(palette, rand);
  const bg = "#ffffff";
  const rects: string[] = [];
  rects.push(`<rect width="${opts.size}" height="${opts.size}" fill="${bg}" />`);
  // 3-wide left grid → mirrored to make a symmetric 5×5 inner area.
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const on = rand() < 0.5;
      if (!on) continue;
      const x1 = (col + 1) * cell;
      const x2 = (5 - col) * cell;
      const y = (row + 1) * cell;
      rects.push(`<rect x="${x1}" y="${y}" width="${cell + 0.5}" height="${cell + 0.5}" fill="${fg}" />`);
      if (col < 2) rects.push(`<rect x="${x2}" y="${y}" width="${cell + 0.5}" height="${cell + 0.5}" fill="${fg}" />`);
    }
  }
  return `<svg ${svgAttrs(opts.size, opts.square)}>
    <defs>${clipPath(opts.size, opts.square)}</defs>
    <g clip-path="url(#clip)">${rects.join("")}</g>
  </svg>`;
}

function buildBeam(opts: AvatarOptions): string {
  const palette = paletteFor(opts);
  const rand = mulberry32(fnv1a(opts.seed));
  const bg = pickColor(palette, rand);
  const shapes: string[] = [];
  // 2-3 random overlapping shapes (circles and rounded rects) tinted from palette.
  const count = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < count; i++) {
    const isCircle = rand() < 0.55;
    const fill = pickColor(palette, rand);
    const cx = rand() * opts.size;
    const cy = rand() * opts.size;
    const radius = (0.25 + rand() * 0.35) * opts.size;
    if (isCircle) {
      shapes.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" opacity="0.8" />`);
    } else {
      const w = radius * 2;
      const h = radius * 2;
      const rotate = Math.round(rand() * 60 - 30);
      shapes.push(`<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${radius * 0.4}" fill="${fill}" opacity="0.85" transform="rotate(${rotate} ${cx} ${cy})" />`);
    }
  }
  return `<svg ${svgAttrs(opts.size, opts.square)}>
    <defs>${clipPath(opts.size, opts.square)}</defs>
    <g clip-path="url(#clip)">
      ${backgroundShape(opts.size, opts.square, bg)}
      ${shapes.join("")}
    </g>
  </svg>`;
}

function buildPixel(opts: AvatarOptions): string {
  const palette = paletteFor(opts);
  const rand = mulberry32(fnv1a(opts.seed));
  const bg = pickColor(palette, rand);
  const fg = pickColor(palette, rand);
  const grid = 8;
  const cell = opts.size / grid;
  const rects: string[] = [`<rect width="${opts.size}" height="${opts.size}" fill="${bg}" />`];
  // 4-wide grid mirrored to 8 so the result is left-right symmetric.
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid / 2; col++) {
      if (rand() < 0.45) {
        const colorPick = rand() < 0.7 ? fg : pickColor(palette, rand);
        const x1 = col * cell;
        const x2 = (grid - 1 - col) * cell;
        const y = row * cell;
        rects.push(`<rect x="${x1}" y="${y}" width="${cell + 0.5}" height="${cell + 0.5}" fill="${colorPick}" />`);
        rects.push(`<rect x="${x2}" y="${y}" width="${cell + 0.5}" height="${cell + 0.5}" fill="${colorPick}" />`);
      }
    }
  }
  return `<svg ${svgAttrs(opts.size, opts.square)}>
    <defs>${clipPath(opts.size, opts.square)}</defs>
    <g clip-path="url(#clip)">${rects.join("")}</g>
  </svg>`;
}

export function buildSvg(opts: AvatarOptions): string {
  switch (opts.style) {
    case "initials":
      return buildInitials(opts);
    case "identicon":
      return buildIdenticon(opts);
    case "beam":
      return buildBeam(opts);
    case "pixel":
      return buildPixel(opts);
  }
}

export async function svgToPng(svg: string, size: number): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't rasterise SVG"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, size, size);
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("PNG encode failed"));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
