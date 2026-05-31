// EXIF Data Remover engine. Two strategies, picked automatically by file
// type:
//
//   1. JPEG: structural strip — walk the JPEG segments (FFE0..FFEF + FFE1
//      APP1/EXIF + FFE2 ICC + FFED IPTC + FFFE COM) and drop the metadata
//      segments while keeping the original pixel data (SOI, SOFx, DHT,
//      DQT, SOS, IDAT). This preserves quality perfectly — no
//      re-compression artefacts.
//
//   2. PNG / WebP / others: canvas re-encode — draw to canvas, export
//      via toBlob, which strips all metadata as a side effect.
//
// We surface which strategy was used so the user understands the trade-off
// (structural strip = lossless; canvas re-encode = lossy for JPG/WebP).

export type Strategy = "structural" | "canvas-png" | "canvas-webp" | "canvas-jpeg";

export interface StripResult {
  ok: boolean;
  blob?: Blob;
  /** Bytes after stripping. */
  size: number;
  /** Mime of the result. */
  mime: string;
  /** Strategy used. */
  strategy: Strategy;
  /** Stripped metadata segments (JPEG). */
  removedSegments?: { marker: string; sizeBytes: number; description: string }[];
  /** Width/height if we drew to canvas. */
  width?: number;
  height?: number;
  /** Size before stripping. */
  originalSize: number;
  /** Percent of bytes removed. */
  reductionPct: number;
  error?: string;
}

// ── JPEG structural strip ──────────────────────────────────────────────────

const APP_MARKERS_TO_DROP: Record<number, string> = {
  0xe0: "APP0 (JFIF, may keep)",
  0xe1: "APP1 (EXIF / XMP)",
  0xe2: "APP2 (ICC / FPXR)",
  0xe3: "APP3",
  0xe4: "APP4",
  0xe5: "APP5",
  0xe6: "APP6",
  0xe7: "APP7",
  0xe8: "APP8",
  0xe9: "APP9",
  0xea: "APP10",
  0xeb: "APP11",
  0xec: "APP12 (Ducky / Picture Info)",
  0xed: "APP13 (Photoshop IRB / IPTC)",
  0xee: "APP14 (Adobe)",
  0xef: "APP15",
  0xfe: "COM (Comment)",
};

interface StripJpegOptions {
  /** Keep APP0 (JFIF) — needed for some legacy readers. */
  keepJfif: boolean;
}

export async function stripJpeg(bytes: Uint8Array, opt: StripJpegOptions = { keepJfif: true }): Promise<StripResult> {
  // Validate JPEG magic.
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return {
      ok: false,
      size: 0,
      mime: "image/jpeg",
      strategy: "structural",
      originalSize: bytes.length,
      reductionPct: 0,
      error: "Not a JPEG (missing SOI marker FFD8).",
    };
  }
  const out: number[] = [];
  // Push SOI.
  out.push(0xff, 0xd8);
  let i = 2;
  const removed: { marker: string; sizeBytes: number; description: string }[] = [];
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) break;
    const marker = bytes[i + 1];
    if (marker === 0xd9) {
      // EOI
      out.push(0xff, 0xd9);
      i += 2;
      break;
    }
    if (marker === 0xda) {
      // SOS — push the rest of the file verbatim (compressed pixel data + EOI).
      while (i < bytes.length) {
        out.push(bytes[i]);
        i++;
      }
      break;
    }
    // All other markers have a 2-byte length immediately after.
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (APP_MARKERS_TO_DROP[marker] !== undefined && !(opt.keepJfif && marker === 0xe0)) {
      removed.push({
        marker: `FF${marker.toString(16).padStart(2, "0").toUpperCase()}`,
        sizeBytes: len,
        description: APP_MARKERS_TO_DROP[marker],
      });
      i += 2 + len;
      continue;
    }
    // Keep this segment.
    for (let j = 0; j < 2 + len; j++) out.push(bytes[i + j]);
    i += 2 + len;
  }
  const ab = new ArrayBuffer(out.length);
  new Uint8Array(ab).set(out);
  const blob = new Blob([ab], { type: "image/jpeg" });
  return {
    ok: true,
    blob,
    size: blob.size,
    mime: "image/jpeg",
    strategy: "structural",
    removedSegments: removed,
    originalSize: bytes.length,
    reductionPct: ((bytes.length - blob.size) / bytes.length) * 100,
  };
}

// ── Canvas re-encode (PNG, WebP, others) ───────────────────────────────────

export async function stripViaCanvas(
  file: File,
  outputMime: "image/png" | "image/webp" | "image/jpeg",
  quality = 0.92,
): Promise<StripResult> {
  if (typeof document === "undefined") {
    return {
      ok: false,
      size: 0,
      mime: outputMime,
      strategy: outputMime === "image/png" ? "canvas-png" : outputMime === "image/webp" ? "canvas-webp" : "canvas-jpeg",
      originalSize: file.size,
      reductionPct: 0,
      error: "Canvas not available.",
    };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputMime, quality));
    if (!blob) throw new Error("Canvas toBlob failed.");
    return {
      ok: true,
      blob,
      size: blob.size,
      mime: outputMime,
      strategy: outputMime === "image/png" ? "canvas-png" : outputMime === "image/webp" ? "canvas-webp" : "canvas-jpeg",
      width: canvas.width,
      height: canvas.height,
      originalSize: file.size,
      reductionPct: ((file.size - blob.size) / file.size) * 100,
    };
  } catch (e) {
    return {
      ok: false,
      size: 0,
      mime: outputMime,
      strategy: outputMime === "image/png" ? "canvas-png" : outputMime === "image/webp" ? "canvas-webp" : "canvas-jpeg",
      originalSize: file.size,
      reductionPct: 0,
      error: e instanceof Error ? e.message : "Canvas error",
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = url;
  });
}

// ── Main entry ─────────────────────────────────────────────────────────────

export async function stripFile(file: File): Promise<StripResult> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const isJpeg = buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8;
  if (isJpeg) return stripJpeg(buf);
  // Re-encode PNG → PNG (lossless) or WebP → WebP (lossy).
  const mime = file.type.toLowerCase();
  if (mime.includes("png") || file.name.toLowerCase().endsWith(".png")) {
    return stripViaCanvas(file, "image/png");
  }
  if (mime.includes("webp") || file.name.toLowerCase().endsWith(".webp")) {
    return stripViaCanvas(file, "image/webp");
  }
  // Fallback to PNG re-encode for any image we can load (HEIC won't decode in browsers).
  return stripViaCanvas(file, "image/png");
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function deriveCleanName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}-clean`;
  return `${name.slice(0, dot)}-clean${name.slice(dot)}`;
}
