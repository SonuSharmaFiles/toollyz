// Favicon engine for the Toollyz Favicon Generator from Text. Renders a
// short label (letter, digits or emoji) onto a 512×512 canvas with a chosen
// background shape and colour, then downsamples to the requested sizes.
// ICO assembly is a minimal hand-rolled writer that wraps PNG payloads in
// ICONDIR + ICONDIRENTRY headers — Vista+ supports embedded PNGs.

export type ShapeId = "square" | "rounded" | "circle";

export interface FaviconOptions {
  text: string;
  background: string;
  textColor: string;
  shape: ShapeId;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

export const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", label: "System UI" },
  { value: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Inter / Helvetica" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia (serif)" },
  { value: "'Courier New', monospace", label: "Courier (mono)" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
];

export const SHAPES: ShapeId[] = ["square", "rounded", "circle"];

export const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];

function paintBackground(ctx: CanvasRenderingContext2D, size: number, shape: ShapeId, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "rounded") {
    const r = size * 0.22;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }
  ctx.restore();
}

function paintText(ctx: CanvasRenderingContext2D, size: number, opts: FaviconOptions): void {
  const text = opts.text.trim();
  if (!text) return;
  ctx.save();
  const weight = opts.bold ? "700" : "500";
  const style = opts.italic ? "italic" : "normal";
  // Auto-fit: start with 64% of size, shrink if it overflows.
  let fontSize = Math.round(size * 0.64);
  ctx.fillStyle = opts.textColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let i = 0; i < 12; i++) {
    ctx.font = `${style} ${weight} ${fontSize}px ${opts.fontFamily}`;
    const metrics = ctx.measureText(text);
    const visualWidth = metrics.width;
    const maxWidth = size * 0.86;
    if (visualWidth <= maxWidth) break;
    fontSize = Math.round(fontSize * 0.85);
  }
  // Re-apply font after final fontSize.
  ctx.font = `${style} ${weight} ${fontSize}px ${opts.fontFamily}`;
  // Nudge baseline up slightly because middle baseline tends to look low.
  ctx.fillText(text, size / 2, size / 2 + size * 0.04);
  ctx.restore();
}

export function renderToCanvas(canvas: HTMLCanvasElement, size: number, opts: FaviconOptions): void {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  paintBackground(ctx, size, opts.shape, opts.background);
  paintText(ctx, size, opts);
}

export async function renderToBlob(size: number, opts: FaviconOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderToCanvas(canvas, size, opts);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(`Failed to encode ${size}×${size} PNG.`));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

/**
 * Build a Windows ICO file containing the listed sizes as PNG payloads.
 * Vista+ supports embedded-PNG ICOs (much smaller than legacy BMP icons).
 */
export async function buildIco(opts: FaviconOptions, sizes: number[] = [16, 32, 48]): Promise<Blob> {
  const png: { size: number; bytes: Uint8Array }[] = [];
  for (const s of sizes) {
    const blob = await renderToBlob(s, opts);
    png.push({ size: s, bytes: new Uint8Array(await blob.arrayBuffer()) });
  }
  // ICONDIR is 6 bytes; each ICONDIRENTRY is 16 bytes.
  const headerLength = 6 + png.length * 16;
  let offset = headerLength;
  const totalLength = headerLength + png.reduce((s, p) => s + p.bytes.length, 0);
  const buf = new ArrayBuffer(totalLength);
  const view = new DataView(buf);
  // ICONDIR: Reserved=0, Type=1 (icon), Count=N (all little-endian).
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, png.length, true);
  // Directory entries.
  png.forEach((p, i) => {
    const base = 6 + i * 16;
    view.setUint8(base + 0, p.size === 256 ? 0 : p.size); // width
    view.setUint8(base + 1, p.size === 256 ? 0 : p.size); // height
    view.setUint8(base + 2, 0); // colour count
    view.setUint8(base + 3, 0); // reserved
    view.setUint16(base + 4, 1, true); // planes
    view.setUint16(base + 6, 32, true); // bit count
    view.setUint32(base + 8, p.bytes.length, true); // size in bytes
    view.setUint32(base + 12, offset, true); // file offset
    offset += p.bytes.length;
  });
  // Payloads.
  let cursor = headerLength;
  const out = new Uint8Array(buf);
  for (const p of png) {
    out.set(p.bytes, cursor);
    cursor += p.bytes.length;
  }
  return new Blob([buf], { type: "image/vnd.microsoft.icon" });
}

export function htmlSnippet(siteName = "Your Site"): string {
  return [
    `<!-- Toollyz favicon set — paste into <head> -->`,
    `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />`,
    `<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`,
    `<meta name="theme-color" content="#0b1020" />`,
    `<meta name="apple-mobile-web-app-title" content="${siteName.replace(/"/g, "&quot;")}" />`,
  ].join("\n");
}
