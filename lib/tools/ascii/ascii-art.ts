// ASCII art engine: pure grid/style transforms, image-pixel→character mapping,
// frame generation and SVG export. Canvas rasterisation (text & image → grid)
// lives in the component; everything here is dependency-free and DOM-free.

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Text art styles (applied to a filled boolean grid) ──────────────────────

export type StyleMode = "fill" | "outline" | "shadow" | "threed" | "slant";

export interface TextStyle {
  id: string;
  label: string;
  category: "Solid" | "Outline" | "Effect";
  mode: StyleMode;
  fill: string;
  shadow?: string;
}

export const TEXT_STYLES: TextStyle[] = [
  { id: "block", label: "Block", category: "Solid", mode: "fill", fill: "█" },
  { id: "shade", label: "Shade", category: "Solid", mode: "fill", fill: "▓" },
  { id: "light", label: "Light", category: "Solid", mode: "fill", fill: "░" },
  { id: "hash", label: "Hash", category: "Solid", mode: "fill", fill: "#" },
  { id: "dots", label: "Dots", category: "Solid", mode: "fill", fill: "●" },
  { id: "stars", label: "Stars", category: "Solid", mode: "fill", fill: "*" },
  { id: "plus", label: "Plus", category: "Solid", mode: "fill", fill: "+" },
  { id: "banner", label: "Banner", category: "Outline", mode: "outline", fill: "#" },
  { id: "outline", label: "Outline", category: "Outline", mode: "outline", fill: "█" },
  { id: "neon", label: "Neon", category: "Outline", mode: "outline", fill: "▒" },
  { id: "shadow", label: "Shadow", category: "Effect", mode: "shadow", fill: "█", shadow: "░" },
  { id: "threed", label: "3D", category: "Effect", mode: "threed", fill: "█", shadow: "▒" },
  { id: "slant", label: "Slant", category: "Effect", mode: "slant", fill: "█" },
  { id: "retro", label: "Retro", category: "Effect", mode: "shadow", fill: "▓", shadow: "·" },
];

export const STYLE_BY_ID: Record<string, TextStyle> = Object.fromEntries(
  TEXT_STYLES.map((s) => [s.id, s]),
);

export const FILL_CHARS = ["█", "▓", "▒", "░", "#", "@", "*", "+", "●", "■", "♦", "."];

function trimBlock(lines: string[]): string {
  // strip trailing spaces
  let rows = lines.map((l) => l.replace(/\s+$/g, ""));
  // drop empty top/bottom lines
  while (rows.length && rows[0].trim() === "") rows.shift();
  while (rows.length && rows[rows.length - 1].trim() === "") rows.pop();
  // remove common left indent
  const indents = rows.filter((l) => l.trim() !== "").map((l) => l.match(/^ */)![0].length);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  if (minIndent > 0) rows = rows.map((l) => l.slice(minIndent));
  return rows.join("\n");
}

export function gridToText(grid: boolean[][], style: TextStyle, fillOverride?: string): string {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (!rows || !cols) return "";
  const fill = fillOverride || style.fill;
  const shadow = style.shadow ?? "░";
  const out: string[][] = Array.from({ length: rows }, () => Array(cols).fill(" "));
  const on = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c];

  if (style.mode === "outline") {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c] && (!on(r - 1, c) || !on(r + 1, c) || !on(r, c - 1) || !on(r, c + 1)))
          out[r][c] = fill;
  } else if (style.mode === "shadow") {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c] && r + 1 < rows && c + 1 < cols && out[r + 1][c + 1] === " ")
          out[r + 1][c + 1] = shadow;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) out[r][c] = fill;
  } else if (style.mode === "threed") {
    const depth = 2;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c])
          for (let k = 1; k <= depth; k++)
            if (r + k < rows && c + k < cols && out[r + k][c + k] === " ") out[r + k][c + k] = shadow;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) out[r][c] = fill;
  } else {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) out[r][c] = fill;
  }

  let lines = out.map((row) => row.join(""));
  if (style.mode === "slant") {
    lines = lines.map((line, r) => " ".repeat(Math.floor((rows - 1 - r) * 0.5)) + line);
  }
  return trimBlock(lines);
}

// ─── Image → ASCII ───────────────────────────────────────────────────────────

export interface Ramp {
  id: string;
  label: string;
  chars: string; // ordered dark → light
}

export const RAMPS: Ramp[] = [
  { id: "standard", label: "Standard", chars: "@%#*+=-:. " },
  { id: "dense", label: "Detailed", chars: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'. " },
  { id: "blocks", label: "Blocks", chars: "█▓▒░ " },
  { id: "shades", label: "Shades", chars: "█▉▊▋▌▍▎▏ " },
  { id: "minimal", label: "Minimal", chars: "#+-. " },
  { id: "binary", label: "Binary", chars: "10 " },
  { id: "dots", label: "Dots", chars: "●◍◎○∙ " },
];

export const RAMP_BY_ID: Record<string, Ramp> = Object.fromEntries(RAMPS.map((r) => [r.id, r]));

// lum: 0..255 grid (already brightness/contrast adjusted). Returns ascii string.
export function pixelsToAscii(lum: number[][], rampChars: string, invert: boolean): string {
  const n = rampChars.length - 1;
  const lines: string[] = [];
  for (const row of lum) {
    let line = "";
    for (let v of row) {
      if (invert) v = 255 - v;
      const idx = Math.max(0, Math.min(n, Math.round((v / 255) * n)));
      line += rampChars[idx];
    }
    lines.push(line.replace(/\s+$/g, ""));
  }
  return lines.join("\n");
}

export function applyBrightnessContrast(v: number, brightness: number, contrast: number): number {
  // brightness: -100..100, contrast: -100..100
  let x = v + brightness * 1.5;
  const c = (contrast + 100) / 100; // 0..2
  x = (x - 128) * c + 128;
  return Math.max(0, Math.min(255, x));
}

// ─── Frames ──────────────────────────────────────────────────────────────────

export interface FrameStyle {
  id: string;
  label: string;
  tl: string; tr: string; bl: string; br: string; h: string; v: string;
}

export const FRAME_STYLES: FrameStyle[] = [
  { id: "single", label: "Single", tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  { id: "double", label: "Double", tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  { id: "rounded", label: "Rounded", tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
  { id: "bold", label: "Bold", tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
  { id: "ascii", label: "ASCII", tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
  { id: "stars", label: "Stars", tl: "*", tr: "*", bl: "*", br: "*", h: "*", v: "*" },
  { id: "dots", label: "Dotted", tl: "·", tr: "·", bl: "·", br: "·", h: "·", v: "·" },
];

export function makeFrame(text: string, style: FrameStyle, padding = 1): string {
  const lines = (text || "Your text").split("\n");
  const width = Math.max(...lines.map((l) => [...l].length), 1);
  const padX = " ".repeat(padding);
  const innerW = width + padding * 2;
  const top = style.tl + style.h.repeat(innerW) + style.tr;
  const bottom = style.bl + style.h.repeat(innerW) + style.br;
  const blank = style.v + " ".repeat(innerW) + style.v;
  const body: string[] = [];
  for (let p = 0; p < padding; p++) body.push(blank);
  for (const l of lines) {
    const len = [...l].length;
    body.push(style.v + padX + l + " ".repeat(width - len) + padX + style.v);
  }
  for (let p = 0; p < padding; p++) body.push(blank);
  return [top, ...body, bottom].join("\n");
}

// ─── SVG export ──────────────────────────────────────────────────────────────

export function asciiToSvg(ascii: string, opts: { fg: string; bg: string; fontSize?: number }): string {
  const fontSize = opts.fontSize ?? 14;
  const lineH = fontSize * 1.1;
  const charW = fontSize * 0.6;
  const lines = ascii.split("\n");
  const cols = Math.max(...lines.map((l) => [...l].length), 1);
  const w = Math.ceil(cols * charW + 16);
  const h = Math.ceil(lines.length * lineH + 16);
  const texts = lines
    .map((l, i) => `<text x="8" y="${Math.round(16 + i * lineH)}" xml:space="preserve">${escapeHtml(l)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${opts.bg}"/><g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${fontSize}" fill="${opts.fg}">${texts}</g></svg>`;
}

// ─── Gallery (ready-made art) ────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  label: string;
  art: string;
}

export const GALLERY: GalleryItem[] = [
  { id: "cat", label: "Cat", art: " /\\_/\\\n( o.o )\n > ^ <" },
  { id: "heart", label: "Heart", art: " .:::.   .:::.\n:::::::.:::::::\n:::::::::::::::\n':::::::::::::'\n  ':::::::::'\n    ':::::'\n      ':'" },
  {
    id: "shrug", label: "Shrug", art: "¯\\_(ツ)_/¯",
  },
  { id: "rocket", label: "Rocket", art: "    /\\\n   /  \\\n  |    |\n  |||||| \n  |||||| \n /||||||\\\n//||||||\\\\\n   /\\\n  /  \\" },
  { id: "coffee", label: "Coffee", art: "      (\n       )\n     [===]\n     |   |__\n     |   |  |)\n     |   |__|\n     |___|" },
  { id: "skull", label: "Skull", art: "  .-.\n (o.o)\n  |=|\n __|__\n//.=|=.\\\\\n\\\\ .=|= //\n `=|=`" },
  { id: "star", label: "Star", art: "    *\n   ***\n  *****\n*********\n  *****\n ** ***\n*       *" },
  {
    id: "arrow", label: "Arrow", art: "  ___________\n /           \\\n<   TOOLLYZ   |\n \\___________/",
  },
];

// ─── ANSI rainbow / gradient colors ──────────────────────────────────────────

export function rainbowColor(t: number): string {
  // t in 0..1 → hsl rainbow
  const hue = Math.round(t * 360);
  return `hsl(${hue} 85% 60%)`;
}

export function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r} ${g} ${bl})`;
}
