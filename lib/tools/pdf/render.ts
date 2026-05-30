// PDF render engine for the Toollyz PDF to Image Converter. Wraps the
// Mozilla pdf.js library (pdfjs-dist) to load a PDF in the browser, render
// every requested page to a 2D canvas at a configurable scale and export it
// as a PNG or JPEG Blob. Worker is served from the static /pdfjs/ asset.

import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/src/display/api";

let pdfjsModule: typeof import("pdfjs-dist") | null = null;

async function loadPdfJs(): Promise<typeof import("pdfjs-dist")> {
  if (pdfjsModule) return pdfjsModule;
  const mod = await import("pdfjs-dist");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  // pdf.js v5 ships an ESM worker; point at the file copied into /public.
  mod.GlobalWorkerOptions.workerSrc = `${basePath}/pdfjs/pdf.worker.min.mjs`;
  pdfjsModule = mod;
  return mod;
}

export interface PdfInfo { pageCount: number; doc: PDFDocumentProxy }

export async function openPdf(file: File): Promise<PdfInfo> {
  const buf = await file.arrayBuffer();
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  return { pageCount: doc.numPages, doc };
}

export interface RenderOpts {
  scale: number;
  mime: "image/png" | "image/jpeg";
  quality?: number; // 0..1, only for jpeg
  backgroundColor?: string; // applied for JPEG to avoid black; default white
}

export interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  opts: RenderOpts,
): Promise<RenderedPage> {
  const page: PDFPageProxy = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: opts.scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  // JPEG can't carry alpha — fill a background so transparent regions become
  // the expected color rather than black.
  if (opts.mime === "image/jpeg") {
    ctx.fillStyle = opts.backgroundColor ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  await page.render({ canvas, viewport }).promise;
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), opts.mime, opts.quality),
  );
  if (!blob) throw new Error(`This browser can't encode ${opts.mime}.`);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Couldn't read rendered blob."));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
  return {
    pageNumber,
    blob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    bytes: blob.size,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
