// PDF splitter engine for the Toollyz PDF Splitter. Parses page-range
// expressions into 1-based page lists, validates them against a source PDF
// and emits new PDFDocuments containing only the requested pages.

import { PDFDocument } from "pdf-lib";

export interface SplitRange {
  /** 1-based start and end (inclusive). For single pages, start === end. */
  start: number;
  end: number;
  label: string;
}

export interface SplitOutput {
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * Parse a range expression like "1-3, 5, 8-10" into ordered SplitRange[].
 * Returns parse errors per chunk where the input was malformed.
 */
export function parseRanges(expression: string, totalPages: number): { ranges: SplitRange[]; errors: string[] } {
  const errors: string[] = [];
  const ranges: SplitRange[] = [];
  const chunks = expression
    .split(/[,\n]/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const c of chunks) {
    const m = c.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) {
      errors.push(`Couldn't parse "${c}". Use formats like 1, 3-5, 8.`);
      continue;
    }
    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : start;
    if (start < 1 || end < 1) {
      errors.push(`Pages start at 1 — "${c}" is out of range.`);
      continue;
    }
    if (start > totalPages || end > totalPages) {
      errors.push(`"${c}" exceeds the PDF's ${totalPages} page${totalPages === 1 ? "" : "s"}.`);
      continue;
    }
    if (start > end) {
      errors.push(`"${c}" reverses start/end — try ${end}-${start}.`);
      continue;
    }
    ranges.push({ start, end, label: start === end ? `${start}` : `${start}-${end}` });
  }
  return { ranges, errors };
}

export function eachPageAsRange(totalPages: number): SplitRange[] {
  const out: SplitRange[] = [];
  for (let i = 1; i <= totalPages; i++) out.push({ start: i, end: i, label: `${i}` });
  return out;
}

export async function splitPdf(
  bytes: Uint8Array,
  ranges: SplitRange[],
  baseName: string,
): Promise<SplitOutput[]> {
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out: SplitOutput[] = [];
  for (const r of ranges) {
    const doc = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = r.start; i <= r.end; i++) indices.push(i - 1);
    const copied = await doc.copyPages(src, indices);
    copied.forEach((p) => doc.addPage(p));
    const result = await doc.save({ useObjectStreams: true });
    out.push({ name: `${baseName}_p${r.label}.pdf`, bytes: result, pageCount: r.end - r.start + 1 });
  }
  return out;
}

export async function pdfPageCount(file: File): Promise<{ pageCount: number; bytes: Uint8Array }> {
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return { pageCount: doc.getPageCount(), bytes: new Uint8Array(buf) };
}
