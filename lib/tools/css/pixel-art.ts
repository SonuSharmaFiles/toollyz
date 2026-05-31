// Pixel Art Generator engine. Pure helpers — the actual painting loop
// lives in the component because it needs DOM/pointer events. Here we
// provide grid construction, color palettes, and PNG export at any zoom.

export type Grid = string[];

export const DEFAULT_PALETTE = [
  "#000000", "#1f2937", "#6b7280", "#d1d5db", "#f8fafc",
  "#ef4444", "#f97316", "#f59e0b", "#fde047", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#a855f7", "#ec4899", "#fb7185", "#a8a29e", "#78350f",
];

export const SIZE_PRESETS = [8, 16, 24, 32, 48, 64] as const;

export function emptyGrid(size: number): Grid {
  // Use transparent string for "empty" so we know what to skip on export.
  return Array(size * size).fill("");
}

export function resizeGrid(g: Grid, fromSize: number, toSize: number): Grid {
  const out = emptyGrid(toSize);
  const minSize = Math.min(fromSize, toSize);
  for (let y = 0; y < minSize; y++) {
    for (let x = 0; x < minSize; x++) {
      out[y * toSize + x] = g[y * fromSize + x] ?? "";
    }
  }
  return out;
}

export interface ExportOptions {
  /** Grid size (e.g. 16). */
  size: number;
  /** Pixel size in output px. 1 = original, 16 = 16x larger. */
  scale: number;
  /** Background colour for empty cells (or "" for transparent). */
  background: string;
}

export function renderToCanvas(canvas: HTMLCanvasElement, grid: Grid, opt: ExportOptions): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dim = opt.size * opt.scale;
  canvas.width = dim;
  canvas.height = dim;
  ctx.imageSmoothingEnabled = false;
  if (opt.background) {
    ctx.fillStyle = opt.background;
    ctx.fillRect(0, 0, dim, dim);
  } else {
    ctx.clearRect(0, 0, dim, dim);
  }
  for (let y = 0; y < opt.size; y++) {
    for (let x = 0; x < opt.size; x++) {
      const color = grid[y * opt.size + x];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * opt.scale, y * opt.scale, opt.scale, opt.scale);
    }
  }
}
