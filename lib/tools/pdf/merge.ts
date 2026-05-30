// PDF merger engine for the Toollyz PDF Merger. Uses pdf-lib to load each
// source PDF, copy every page (preserving fonts, embedded images and layout)
// into a fresh PDFDocument and serialize the result back to a Uint8Array the
// browser can download. Pure browser-side — no upload, no Toollyz server.

import { PDFDocument } from "pdf-lib";

export interface PdfFileMeta {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  bytes: Uint8Array;
}

export async function readPdfMeta(file: File): Promise<PdfFileMeta> {
  const buf = await file.arrayBuffer();
  // pdf-lib only needs ignoreEncryption for read-only metadata inspection.
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return {
    id: cryptoId(),
    name: file.name,
    size: file.size,
    pageCount: doc.getPageCount(),
    bytes: new Uint8Array(buf),
  };
}

function cryptoId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export async function mergePdfs(files: PdfFileMeta[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("Add at least one PDF.");
  const out = await PDFDocument.create();
  for (const f of files) {
    const src = await PDFDocument.load(f.bytes, { ignoreEncryption: true });
    const indices = src.getPageIndices();
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
  }
  return out.save({ useObjectStreams: true });
}

export function downloadBytes(bytes: Uint8Array, filename: string, type = "application/pdf"): void {
  // Copy to a fresh ArrayBuffer to satisfy the BlobPart type and avoid issues
  // when the underlying buffer is shared.
  const buf = bytes.slice().buffer;
  const blob = new Blob([buf], { type });
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
