// Invoice PDF engine for the Toollyz Invoice Generator. Builds a clean,
// single-page (extends to multi-page when line items overflow) invoice PDF
// via pdf-lib with Helvetica + Helvetica Bold. Currency formatting uses
// the standard `Intl.NumberFormat` API; the engine just renders the values.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Address {
  name: string;
  email: string;
  lines: string; // free-form multiline string
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string; // ISO yyyy-mm-dd
  dueDate: string;
  currency: string; // ISO 4217 code (USD, EUR, INR, …)
  from: Address;
  to: Address;
  items: LineItem[];
  taxPercent: number;
  discount: number; // flat in currency
  notes: string;
  paymentTerms: string;
  themeColor: string; // hex
  logoBytes?: Uint8Array;
  logoMime?: string;
}

export function newLineItem(): LineItem {
  return {
    id: Math.random().toString(36).slice(2, 9),
    description: "",
    quantity: 1,
    rate: 0,
  };
}

export interface Totals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function totals(data: InvoiceData): Totals {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const afterDiscount = Math.max(0, subtotal - data.discount);
  const taxAmount = afterDiscount * (data.taxPercent / 100);
  const total = afterDiscount + taxAmount;
  return { subtotal, taxAmount, total };
}

export function formatMoney(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  let v = hex.trim().replace(/^#/, "");
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  if (v.length !== 6) return { r: 0.05, g: 0.06, b: 0.12 };
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

const W = 595.28; // A4 portrait pt
const H = 841.89;
const MARGIN = 40;

type PdfPage = ReturnType<PDFDocument["addPage"]>;
type PdfFont = import("pdf-lib").PDFFont;

interface DrawCtx {
  pdf: PDFDocument;
  page: PdfPage;
  y: number;
  font: PdfFont;
  bold: PdfFont;
  data: InvoiceData;
  theme: { r: number; g: number; b: number };
  ink: { r: number; g: number; b: number };
  faint: { r: number; g: number; b: number };
}

function ensureRoom(ctx: DrawCtx, need: number): DrawCtx {
  if (ctx.y - need < MARGIN + 20) {
    ctx.page = ctx.pdf.addPage([W, H]);
    ctx.y = H - MARGIN;
  }
  return ctx;
}

function drawLines(ctx: DrawCtx, lines: string[], opts: { size: number; font?: PdfFont; color?: { r: number; g: number; b: number }; gap?: number }): void {
  const size = opts.size;
  const font = opts.font ?? ctx.font;
  const color = opts.color ?? ctx.ink;
  const gap = opts.gap ?? size * 1.25;
  for (const line of lines) {
    ensureRoom(ctx, gap + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font, color: rgb(color.r, color.g, color.b) });
    ctx.y -= gap;
  }
}

export async function buildInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  if (data.items.length === 0) throw new Error("Add at least one line item.");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const theme = hexToRgb01(data.themeColor);
  const ink = { r: 0.07, g: 0.09, b: 0.13 };
  const faint = { r: 0.45, g: 0.48, b: 0.55 };
  const page = pdf.addPage([W, H]);
  const ctx: DrawCtx = { pdf, page, y: H - MARGIN, font, bold, data, theme, ink, faint };

  // --- Header ----------------------------------------------------------------
  // Theme accent bar
  ctx.page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: rgb(theme.r, theme.g, theme.b) });

  // Logo (top-right) or invoice title
  let titleX = MARGIN;
  let titleY = H - MARGIN;
  if (data.logoBytes && (data.logoMime === "image/png" || data.logoMime === "image/jpeg")) {
    try {
      const img = data.logoMime === "image/png" ? await pdf.embedPng(data.logoBytes) : await pdf.embedJpg(data.logoBytes);
      const max = 64;
      const aspect = img.width / img.height;
      const lw = aspect >= 1 ? max : max * aspect;
      const lh = aspect >= 1 ? max / aspect : max;
      ctx.page.drawImage(img, { x: W - MARGIN - lw, y: H - MARGIN - lh, width: lw, height: lh });
    } catch {
      /* ignore logo failures */
    }
  }

  ctx.page.drawText("INVOICE", { x: titleX, y: titleY - 4, size: 28, font: bold, color: rgb(theme.r, theme.g, theme.b) });
  ctx.y = titleY - 40;

  // Invoice metadata
  drawLines(
    ctx,
    [
      `Invoice no. ${data.invoiceNumber || "—"}`,
      `Issue date: ${data.issueDate || "—"}`,
      `Due date: ${data.dueDate || "—"}`,
    ],
    { size: 10, color: faint, gap: 14 },
  );

  // From & To columns
  ctx.y -= 4;
  const colY = ctx.y;
  drawColumn(ctx, "From", data.from, MARGIN, colY);
  drawColumn(ctx, "Bill to", data.to, W / 2 + 10, colY);
  ctx.y = colY - 110;

  // --- Line items table ------------------------------------------------------
  const tableTop = ctx.y;
  ensureRoom(ctx, 28);
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 22, width: W - MARGIN * 2, height: 22, color: rgb(theme.r, theme.g, theme.b) });
  drawTableRow(ctx, ["Description", "Qty", "Rate", "Amount"], 11, bold, { r: 1, g: 1, b: 1 });
  ctx.y -= 28;

  for (const item of data.items) {
    ensureRoom(ctx, 22);
    const amount = item.quantity * item.rate;
    drawTableRow(
      ctx,
      [item.description || "—", String(item.quantity), formatMoney(item.rate, data.currency), formatMoney(amount, data.currency)],
      10,
      font,
      ink,
    );
    ctx.y -= 22;
    // Line separator
    ctx.page.drawRectangle({ x: MARGIN, y: ctx.y + 6, width: W - MARGIN * 2, height: 0.5, color: rgb(faint.r, faint.g, faint.b) });
  }

  // --- Totals ---------------------------------------------------------------
  const t = totals(data);
  ctx.y -= 8;
  ensureRoom(ctx, 64);
  const rightX = W - MARGIN;
  drawRightRow(ctx, "Subtotal", formatMoney(t.subtotal, data.currency), 10, font, ink, rightX);
  ctx.y -= 16;
  if (data.discount > 0) {
    drawRightRow(ctx, `Discount`, `-${formatMoney(data.discount, data.currency)}`, 10, font, faint, rightX);
    ctx.y -= 16;
  }
  if (data.taxPercent > 0) {
    drawRightRow(ctx, `Tax (${data.taxPercent.toFixed(2)}%)`, formatMoney(t.taxAmount, data.currency), 10, font, ink, rightX);
    ctx.y -= 16;
  }
  ctx.page.drawRectangle({ x: rightX - 240, y: ctx.y + 2, width: 240, height: 0.6, color: rgb(faint.r, faint.g, faint.b) });
  ctx.y -= 10;
  drawRightRow(ctx, "Total", formatMoney(t.total, data.currency), 14, bold, theme, rightX);
  ctx.y -= 32;

  // --- Notes / terms ---------------------------------------------------------
  if (data.notes.trim()) {
    ensureRoom(ctx, 24);
    ctx.page.drawText("Notes", { x: MARGIN, y: ctx.y, size: 10, font: bold, color: rgb(ink.r, ink.g, ink.b) });
    ctx.y -= 14;
    for (const line of wrap(font, data.notes, W - MARGIN * 2, 10)) {
      ensureRoom(ctx, 14);
      ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 10, font, color: rgb(ink.r, ink.g, ink.b) });
      ctx.y -= 14;
    }
    ctx.y -= 8;
  }
  if (data.paymentTerms.trim()) {
    ensureRoom(ctx, 24);
    ctx.page.drawText("Payment terms", { x: MARGIN, y: ctx.y, size: 10, font: bold, color: rgb(ink.r, ink.g, ink.b) });
    ctx.y -= 14;
    for (const line of wrap(font, data.paymentTerms, W - MARGIN * 2, 10)) {
      ensureRoom(ctx, 14);
      ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 10, font, color: rgb(ink.r, ink.g, ink.b) });
      ctx.y -= 14;
    }
  }

  return pdf.save({ useObjectStreams: true });
}

function drawColumn(ctx: DrawCtx, heading: string, addr: Address, x: number, top: number): void {
  ctx.page.drawText(heading.toUpperCase(), { x, y: top, size: 9, font: ctx.bold, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
  let y = top - 14;
  if (addr.name.trim()) {
    ctx.page.drawText(addr.name, { x, y, size: 11, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    y -= 14;
  }
  if (addr.email.trim()) {
    ctx.page.drawText(addr.email, { x, y, size: 10, font: ctx.font, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    y -= 14;
  }
  for (const line of (addr.lines || "").split("\n").slice(0, 4)) {
    if (!line.trim()) continue;
    ctx.page.drawText(line, { x, y, size: 10, font: ctx.font, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    y -= 14;
  }
}

function drawTableRow(ctx: DrawCtx, cells: string[], size: number, font: PdfFont, color: { r: number; g: number; b: number }): void {
  const colX = [MARGIN + 6, W - MARGIN - 260, W - MARGIN - 160, W - MARGIN - 6];
  const max = [W - MARGIN - 270, 80, 100, 100];
  for (let i = 0; i < cells.length; i++) {
    const text = clipToWidth(font, cells[i], size, max[i]);
    const x = i === 0 ? colX[i] : colX[i] - font.widthOfTextAtSize(text, size);
    ctx.page.drawText(text, { x, y: ctx.y - 14, size, font, color: rgb(color.r, color.g, color.b) });
  }
}

function drawRightRow(ctx: DrawCtx, label: string, value: string, size: number, font: PdfFont, color: { r: number; g: number; b: number }, rightX: number): void {
  const valueWidth = font.widthOfTextAtSize(value, size);
  ctx.page.drawText(label, { x: rightX - 240, y: ctx.y, size, font, color: rgb(color.r, color.g, color.b) });
  ctx.page.drawText(value, { x: rightX - valueWidth, y: ctx.y, size, font, color: rgb(color.r, color.g, color.b) });
}

function clipToWidth(font: PdfFont, text: string, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let s = text;
  while (s.length > 1 && font.widthOfTextAtSize(s + "…", size) > maxWidth) s = s.slice(0, -1);
  return s + "…";
}

function wrap(font: PdfFont, text: string, maxWidth: number, size: number): string[] {
  const paragraphs = text.split(/\n/);
  const out: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
        out.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) out.push(current);
  }
  return out;
}

export const CURRENCY_OPTIONS = [
  "USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "BRL",
  "SGD", "HKD", "NZD", "KRW", "MXN", "SEK", "NOK", "DKK", "PLN", "AED",
];
