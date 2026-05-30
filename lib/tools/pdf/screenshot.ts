// Screenshot-to-PDF engine for the Toollyz Screenshot to PDF tool. Builds
// on the same pdf-lib pipeline as the Image to PDF converter, with a few
// screenshot-specific defaults: Auto-size each page to match the screenshot,
// optional per-image caption, optional cover page with title/subtitle and
// optional page numbers in the footer.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readImage, type SourceImage } from "./build";

export interface ScreenshotPageSettings {
  /** Cover page at the front with a title + optional subtitle. */
  coverTitle?: string;
  coverSubtitle?: string;
  /** Show "Page n / N" in the footer. */
  pageNumbers: boolean;
  /** Include a small footer caption per page. */
  showCaptions: boolean;
  /** Outer margin (pt) on every screenshot page (and cover). */
  margin: number;
  /** Page background color (hex). */
  background: string;
  /** Foreground/text color (hex). */
  textColor: string;
  /** When true, also write the current local date on the cover. */
  showDate: boolean;
}

export interface CapturedShot {
  image: SourceImage;
  caption: string;
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  let v = hex.trim().replace(/^#/, "");
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  if (v.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

export const DEFAULT_SETTINGS: ScreenshotPageSettings = {
  coverTitle: "",
  coverSubtitle: "",
  pageNumbers: true,
  showCaptions: true,
  margin: 24,
  background: "#ffffff",
  textColor: "#111827",
  showDate: false,
};

export { readImage };

export async function buildScreenshotPdf(
  shots: CapturedShot[],
  s: ScreenshotPageSettings,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  if (shots.length === 0) throw new Error("Add at least one screenshot.");
  const pdf = await PDFDocument.create();
  const bg = hexToRgb01(s.background);
  const fg = hexToRgb01(s.textColor);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let totalPages = shots.length;
  const hasCover = !!(s.coverTitle?.trim() || s.coverSubtitle?.trim() || s.showDate);
  if (hasCover) totalPages += 1;

  // --- Cover page (A4 portrait) ----------------------------------------------
  if (hasCover) {
    const W = 595.28;
    const H = 841.89;
    const page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(bg.r, bg.g, bg.b) });
    const title = s.coverTitle?.trim() || "Untitled report";
    const subtitle = s.coverSubtitle?.trim() || "";
    const titleSize = 32;
    const subSize = 16;
    const titleY = H / 2 + 16;
    const subY = titleY - 32;
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    page.drawText(title, { x: (W - titleWidth) / 2, y: titleY, size: titleSize, font: fontBold, color: rgb(fg.r, fg.g, fg.b) });
    if (subtitle) {
      const subWidth = font.widthOfTextAtSize(subtitle, subSize);
      page.drawText(subtitle, { x: (W - subWidth) / 2, y: subY, size: subSize, font, color: rgb(fg.r, fg.g, fg.b) });
    }
    if (s.showDate) {
      const dateLabel = new Date().toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const dateWidth = font.widthOfTextAtSize(dateLabel, 11);
      page.drawText(dateLabel, { x: (W - dateWidth) / 2, y: 64, size: 11, font, color: rgb(fg.r, fg.g, fg.b) });
    }
  }

  // --- Screenshot pages -------------------------------------------------------
  let imageIndex = 0;
  for (const shot of shots) {
    const img = shot.image;
    const captionHeight = s.showCaptions && shot.caption ? 32 : 0;
    const footerHeight = s.pageNumbers ? 18 : 0;
    // Page size: hug the screenshot but accommodate caption and footer.
    const pageW = img.width + s.margin * 2;
    const pageH = img.height + s.margin * 2 + captionHeight + footerHeight;
    const page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(bg.r, bg.g, bg.b) });
    const embedded = img.type === "image/png" ? await pdf.embedPng(img.bytes) : await pdf.embedJpg(img.bytes);
    const imgY = pageH - s.margin - img.height;
    page.drawImage(embedded, {
      x: s.margin,
      y: imgY,
      width: img.width,
      height: img.height,
    });
    if (captionHeight > 0) {
      const caption = shot.caption.trim();
      // Word-wrap the caption into one or two lines that fit the page width.
      const lines = wrapText(caption, pageW - s.margin * 2, font, 11);
      let y = imgY - 14;
      for (let i = 0; i < Math.min(2, lines.length); i++) {
        page.drawText(lines[i], { x: s.margin, y, size: 11, font, color: rgb(fg.r, fg.g, fg.b) });
        y -= 14;
      }
    }
    if (s.pageNumbers) {
      const pageIndex = imageIndex + (hasCover ? 2 : 1);
      const label = `Page ${pageIndex} / ${totalPages}`;
      const labelWidth = font.widthOfTextAtSize(label, 9);
      page.drawText(label, {
        x: pageW - s.margin - labelWidth,
        y: 10,
        size: 9,
        font,
        color: rgb(fg.r, fg.g, fg.b),
      });
    }
    imageIndex += 1;
  }

  const bytes = await pdf.save({ useObjectStreams: true });
  return { bytes, pageCount: totalPages };
}

function wrapText(text: string, maxWidth: number, font: import("pdf-lib").PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}
