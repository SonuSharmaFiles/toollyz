// Image → PDF engine for the Toollyz Image to PDF Converter. Uses pdf-lib
// to create a fresh PDFDocument, embed each image (JPG or PNG natively;
// WebP gets re-encoded to PNG via canvas first) and lay it out on a page
// according to size/orientation/fit settings.

import { PDFDocument, rgb } from "pdf-lib";

export type PageSize = "auto" | "A4" | "A3" | "Letter" | "Legal" | "custom";
export type Orientation = "portrait" | "landscape";
export type Fit = "fit" | "fill" | "stretch";

export interface PageSettings {
  size: PageSize;
  orientation: Orientation;
  margin: number; // pt
  background: string; // hex
  fit: Fit;
  customWidth: number; // pt
  customHeight: number; // pt
}

// Sizes in points (1pt = 1/72 in).
const SIZES: Record<Exclude<PageSize, "auto" | "custom">, [number, number]> = {
  A4: [595.28, 841.89],
  A3: [841.89, 1190.55],
  Letter: [612, 792],
  Legal: [612, 1008],
};

export interface SourceImage {
  id: string;
  name: string;
  type: string; // mime
  bytes: Uint8Array;
  width: number;
  height: number;
  size: number;
  dataUrl: string;
}

export async function readImage(file: File): Promise<SourceImage> {
  const buf = await file.arrayBuffer();
  let bytes: Uint8Array = new Uint8Array(buf);
  let type = file.type;

  // WebP isn't natively supported by pdf-lib — re-encode to PNG via canvas.
  if (type === "image/webp" || /\.webp$/i.test(file.name)) {
    const url = URL.createObjectURL(file);
    try {
      const { png, w, h, dataUrl } = await reencodeAsPng(url);
      bytes = png;
      type = "image/png";
      return {
        id: cryptoId(),
        name: file.name,
        type,
        bytes,
        width: w,
        height: h,
        size: file.size,
        dataUrl,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const { width, height, dataUrl } = await decodeMeta(file);
  return {
    id: cryptoId(),
    name: file.name,
    type,
    bytes,
    width,
    height,
    size: file.size,
    dataUrl,
  };
}

function cryptoId(): string {
  return Math.random().toString(36).slice(2, 9);
}

async function decodeMeta(file: File): Promise<{ width: number; height: number; dataUrl: string }> {
  const dataUrl = await readDataUrl(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, dataUrl });
    img.onerror = () => reject(new Error(`Couldn't decode ${file.name}.`));
    img.src = dataUrl;
  });
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error(`Couldn't read ${file.name}.`));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

async function reencodeAsPng(srcUrl: string): Promise<{ png: Uint8Array; w: number; h: number; dataUrl: string }> {
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("WebP decode failed."));
    el.src = srcUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.drawImage(img, 0, 0);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  if (!blob) throw new Error("WebP→PNG encode failed.");
  const buf = await blob.arrayBuffer();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("dataUrl read failed."));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
  return { png: new Uint8Array(buf), w: canvas.width, h: canvas.height, dataUrl };
}

function pageDimensions(s: PageSettings, img: SourceImage): { w: number; h: number } {
  if (s.size === "auto") {
    // Match the image pixel size 1:1 (treated as points to keep aspect).
    return { w: img.width, h: img.height };
  }
  if (s.size === "custom") {
    if (s.orientation === "landscape" && s.customWidth < s.customHeight) {
      return { w: s.customHeight, h: s.customWidth };
    }
    return { w: s.customWidth, h: s.customHeight };
  }
  const [w, h] = SIZES[s.size];
  if (s.orientation === "landscape") return { w: h, h: w };
  return { w, h };
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  let v = hex.trim().replace(/^#/, "");
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  if (v.length !== 6) return { r: 1, g: 1, b: 1 };
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

export interface BuildResult { bytes: Uint8Array; pages: number }

export async function buildPdf(images: SourceImage[], s: PageSettings): Promise<BuildResult> {
  if (images.length === 0) throw new Error("Add at least one image.");
  const pdf = await PDFCreate();
  for (const img of images) {
    const dim = pageDimensions(s, img);
    const page = pdf.addPage([dim.w, dim.h]);
    const bg = hexToRgb01(s.background);
    page.drawRectangle({ x: 0, y: 0, width: dim.w, height: dim.h, color: rgb(bg.r, bg.g, bg.b) });
    const embedded = img.type === "image/png" ? await pdf.embedPng(img.bytes) : await pdf.embedJpg(img.bytes);
    const usableW = dim.w - s.margin * 2;
    const usableH = dim.h - s.margin * 2;
    let dw = usableW;
    let dh = usableH;
    if (s.fit !== "stretch") {
      const ratio = embedded.width / embedded.height;
      if (s.fit === "fit") {
        if (usableW / usableH > ratio) {
          dh = usableH;
          dw = dh * ratio;
        } else {
          dw = usableW;
          dh = dw / ratio;
        }
      } else {
        // fill — overflow allowed inside the usable area; we still constrain
        // to the page (no clipping in pdf-lib without a clipping path) so use
        // fill = same as fit for now but oriented to cover the larger dim.
        if (usableW / usableH > ratio) {
          dw = usableW;
          dh = dw / ratio;
          if (dh > usableH) dh = usableH;
        } else {
          dh = usableH;
          dw = dh * ratio;
          if (dw > usableW) dw = usableW;
        }
      }
    }
    const dx = s.margin + (usableW - dw) / 2;
    const dy = s.margin + (usableH - dh) / 2;
    page.drawImage(embedded, { x: dx, y: dy, width: dw, height: dh });
  }
  const bytes = await pdf.save({ useObjectStreams: true });
  return { bytes, pages: images.length };
}

// Lazy import to keep pdf-lib out of the initial chunk when this engine is
// imported speculatively.
async function PDFCreate() {
  return PDFDocument.create();
}
