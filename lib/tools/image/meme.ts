// Meme rendering engine for the Toollyz Meme Generator. Pure functions over
// a CanvasRenderingContext2D — no React, no global state. The component
// drives it: layout templates ("blank" backgrounds we draw directly), an
// uploaded image source, and the user's text settings.

export type TextPosition = "top" | "middle" | "bottom";

export type FontFamily =
  | "Impact, 'Anton', sans-serif"
  | "'Arial Black', sans-serif"
  | "Helvetica, Arial, sans-serif"
  | "'Comic Sans MS', cursive"
  | "Georgia, serif"
  | "'Courier New', monospace";

export const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "Impact, 'Anton', sans-serif", label: "Impact (classic meme)" },
  { value: "'Arial Black', sans-serif", label: "Arial Black" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier" },
];

export interface TextLayer {
  text: string;
  fontFamily: FontFamily;
  fontSize: number; // px on the canvas
  color: string;
  strokeColor: string;
  strokeWidth: number;
  allCaps: boolean;
  align: "left" | "center" | "right";
  position: TextPosition;
}

export const DEFAULT_LAYER = (position: TextPosition): TextLayer => ({
  text: position === "top" ? "ONE DOES NOT SIMPLY" : position === "bottom" ? "WRITE A MEME BY HAND" : "",
  fontFamily: "Impact, 'Anton', sans-serif",
  fontSize: 72,
  color: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 4,
  allCaps: true,
  align: "center",
  position,
});

export interface BlankTemplate {
  id: string;
  label: string;
  aspect: number; // width / height
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

function gradientPaint(stops: { c: string; p: number }[], angleDeg = 135): BlankTemplate["paint"] {
  return (ctx, w, h) => {
    const r = (angleDeg * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.max(w, h);
    const x0 = cx - (Math.cos(r) * len) / 2;
    const y0 = cy - (Math.sin(r) * len) / 2;
    const x1 = cx + (Math.cos(r) * len) / 2;
    const y1 = cy + (Math.sin(r) * len) / 2;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => g.addColorStop(s.p, s.c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
}

export const BLANK_TEMPLATES: BlankTemplate[] = [
  {
    id: "indigo",
    label: "Indigo",
    aspect: 1,
    paint: gradientPaint([{ c: "#3730A3", p: 0 }, { c: "#0F172A", p: 1 }], 145),
  },
  {
    id: "sunset",
    label: "Sunset",
    aspect: 16 / 9,
    paint: gradientPaint([{ c: "#F59E0B", p: 0 }, { c: "#EF4444", p: 0.5 }, { c: "#A855F7", p: 1 }], 135),
  },
  {
    id: "ocean",
    label: "Ocean",
    aspect: 4 / 5,
    paint: gradientPaint([{ c: "#0EA5E9", p: 0 }, { c: "#0F172A", p: 1 }], 180),
  },
  {
    id: "mono",
    label: "Mono",
    aspect: 1,
    paint: gradientPaint([{ c: "#111827", p: 0 }, { c: "#111827", p: 1 }], 0),
  },
  {
    id: "story",
    label: "Story 9:16",
    aspect: 9 / 16,
    paint: gradientPaint([{ c: "#581C87", p: 0 }, { c: "#0F172A", p: 1 }], 200),
  },
  {
    id: "panels",
    label: "Two-panel split",
    aspect: 1,
    paint: (ctx, w, h) => {
      ctx.fillStyle = "#0EA5E9";
      ctx.fillRect(0, 0, w, h / 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(0, h / 2, w, h / 2);
    },
  },
];

export interface RenderInput {
  canvas: HTMLCanvasElement;
  imageSource: HTMLImageElement | null;
  template: BlankTemplate | null;
  width: number;
  layers: TextLayer[];
  padding: number; // pixels above/below stroked text
}

export function renderMeme(input: RenderInput): void {
  const { canvas, imageSource, template, width, layers, padding } = input;

  let w = Math.max(1, Math.round(width));
  let h: number;
  if (imageSource) {
    const ratio = imageSource.naturalWidth / imageSource.naturalHeight || 1;
    h = Math.max(1, Math.round(w / ratio));
  } else if (template) {
    h = Math.max(1, Math.round(w / template.aspect));
  } else {
    h = Math.round(w * 0.75);
  }
  if (w > 2048) {
    h = Math.round((h * 2048) / w);
    w = 2048;
  }
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);

  if (imageSource) {
    ctx.drawImage(imageSource, 0, 0, w, h);
  } else if (template) {
    template.paint(ctx, w, h);
  } else {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, w, h);
  }

  for (const layer of layers) {
    drawLayer(ctx, layer, w, h, padding);
  }
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  width: number,
  height: number,
  padding: number,
): void {
  const text = layer.allCaps ? layer.text.toUpperCase() : layer.text;
  if (!text.trim()) return;

  ctx.save();
  ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
  ctx.fillStyle = layer.color;
  ctx.strokeStyle = layer.strokeColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = layer.align;

  const maxWidth = width - padding * 2;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = Math.round(layer.fontSize * 1.1);
  const blockH = lineHeight * lines.length;

  let y: number;
  if (layer.position === "top") y = padding + layer.fontSize;
  else if (layer.position === "bottom") y = height - padding - blockH + layer.fontSize;
  else y = (height - blockH) / 2 + layer.fontSize;

  let x: number;
  if (layer.align === "left") x = padding;
  else if (layer.align === "right") x = width - padding;
  else x = width / 2;

  for (const line of lines) {
    if (layer.strokeWidth > 0) ctx.strokeText(line, x, y);
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length === 0 ? [text] : lines;
}
