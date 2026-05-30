// Resume PDF engine for the Toollyz Resume PDF Generator. Renders a clean
// single-column resume PDF via pdf-lib, with overflow onto additional pages.
// Two templates: "classic" (centered header, full-width sections) and
// "modern" (left-aligned header with a coloured rule under the name).

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Template = "classic" | "modern";
export type FontChoice = "Helvetica" | "Times" | "Courier";

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  details: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface CertEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageEntry {
  id: string;
  name: string;
  level: string;
}

export interface ResumeData {
  template: Template;
  font: FontChoice;
  themeColor: string;
  // Header
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  // Sections
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string; // comma or pipe separated
  projects: ProjectEntry[];
  languages: LanguageEntry[];
  certifications: CertEntry[];
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function emptyExperience(): ExperienceEntry {
  return { id: newId(), role: "", company: "", location: "", start: "", end: "", bullets: "" };
}
export function emptyEducation(): EducationEntry {
  return { id: newId(), school: "", degree: "", location: "", start: "", end: "", details: "" };
}
export function emptyProject(): ProjectEntry {
  return { id: newId(), name: "", link: "", description: "" };
}
export function emptyCert(): CertEntry {
  return { id: newId(), name: "", issuer: "", date: "" };
}
export function emptyLanguage(): LanguageEntry {
  return { id: newId(), name: "", level: "" };
}

const W = 595.28;
const H = 841.89;
const MARGIN = 48;

type PdfFont = import("pdf-lib").PDFFont;
type PdfPage = ReturnType<PDFDocument["addPage"]>;

interface DrawCtx {
  pdf: PDFDocument;
  page: PdfPage;
  y: number;
  font: PdfFont;
  bold: PdfFont;
  italic: PdfFont;
  data: ResumeData;
  theme: { r: number; g: number; b: number };
  ink: { r: number; g: number; b: number };
  faint: { r: number; g: number; b: number };
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  let v = hex.trim().replace(/^#/, "");
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  if (v.length !== 6) return { r: 0.07, g: 0.09, b: 0.13 };
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

function ensureRoom(ctx: DrawCtx, need: number): void {
  if (ctx.y - need < MARGIN) {
    ctx.page = ctx.pdf.addPage([W, H]);
    ctx.y = H - MARGIN;
  }
}

function drawLine(ctx: DrawCtx, x: number, y: number): void {
  ctx.page.drawRectangle({ x, y, width: W - MARGIN * 2, height: 0.6, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
}

function wrap(font: PdfFont, text: string, maxWidth: number, size: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n/)) {
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

function fontPair(font: FontChoice): { regular: StandardFonts; bold: StandardFonts; italic: StandardFonts } {
  switch (font) {
    case "Times":
      return { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold, italic: StandardFonts.TimesRomanItalic };
    case "Courier":
      return { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold, italic: StandardFonts.CourierOblique };
    default:
      return { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold, italic: StandardFonts.HelveticaOblique };
  }
}

function drawHeader(ctx: DrawCtx): void {
  const d = ctx.data;
  if (d.template === "classic") {
    const name = d.fullName || "Your Name";
    const nameSize = 24;
    const nameWidth = ctx.bold.widthOfTextAtSize(name, nameSize);
    ctx.page.drawText(name, { x: (W - nameWidth) / 2, y: ctx.y, size: nameSize, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    ctx.y -= 28;
    if (d.title.trim()) {
      const tWidth = ctx.italic.widthOfTextAtSize(d.title, 12);
      ctx.page.drawText(d.title, { x: (W - tWidth) / 2, y: ctx.y, size: 12, font: ctx.italic, color: rgb(ctx.theme.r, ctx.theme.g, ctx.theme.b) });
      ctx.y -= 16;
    }
    const meta = [d.email, d.phone, d.location, d.website, d.linkedin, d.github].filter((x) => x.trim()).join("  ·  ");
    if (meta) {
      const mWidth = ctx.font.widthOfTextAtSize(meta, 9.5);
      ctx.page.drawText(meta, { x: (W - mWidth) / 2, y: ctx.y, size: 9.5, font: ctx.font, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
      ctx.y -= 16;
    }
    ctx.y -= 4;
    drawLine(ctx, MARGIN, ctx.y);
    ctx.y -= 12;
  } else {
    // Modern: left-aligned with a coloured underline.
    const name = d.fullName || "Your Name";
    const nameSize = 26;
    ctx.page.drawText(name, { x: MARGIN, y: ctx.y, size: nameSize, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    ctx.y -= 30;
    if (d.title.trim()) {
      ctx.page.drawText(d.title, { x: MARGIN, y: ctx.y, size: 13, font: ctx.italic, color: rgb(ctx.theme.r, ctx.theme.g, ctx.theme.b) });
      ctx.y -= 18;
    }
    // Accent rule
    ctx.page.drawRectangle({ x: MARGIN, y: ctx.y, width: 80, height: 2.4, color: rgb(ctx.theme.r, ctx.theme.g, ctx.theme.b) });
    ctx.y -= 14;
    const cols = [d.email, d.phone, d.location, d.website, d.linkedin, d.github].filter((x) => x.trim());
    if (cols.length > 0) {
      const text = cols.join("  ·  ");
      const wrapped = wrap(ctx.font, text, W - MARGIN * 2, 9.5);
      for (const line of wrapped) {
        ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 9.5, font: ctx.font, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
        ctx.y -= 14;
      }
    }
  }
}

function drawSectionHeader(ctx: DrawCtx, label: string): void {
  ensureRoom(ctx, 24);
  if (ctx.data.template === "classic") {
    ctx.page.drawText(label.toUpperCase(), { x: MARGIN, y: ctx.y, size: 10.5, font: ctx.bold, color: rgb(ctx.theme.r, ctx.theme.g, ctx.theme.b) });
    ctx.y -= 12;
    drawLine(ctx, MARGIN, ctx.y);
    ctx.y -= 10;
  } else {
    ctx.page.drawText(label, { x: MARGIN, y: ctx.y, size: 12, font: ctx.bold, color: rgb(ctx.theme.r, ctx.theme.g, ctx.theme.b) });
    ctx.y -= 16;
  }
}

function drawParagraph(ctx: DrawCtx, text: string, size: number, font: PdfFont, color: { r: number; g: number; b: number }): void {
  for (const line of wrap(font, text, W - MARGIN * 2, size)) {
    ensureRoom(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font, color: rgb(color.r, color.g, color.b) });
    ctx.y -= size * 1.3;
  }
}

function drawBullets(ctx: DrawCtx, text: string, size: number, font: PdfFont, color: { r: number; g: number; b: number }): void {
  const items = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const item of items) {
    const wrapped = wrap(font, item, W - MARGIN * 2 - 14, size);
    for (let i = 0; i < wrapped.length; i++) {
      ensureRoom(ctx, size + 4);
      const indent = MARGIN + (i === 0 ? 12 : 14);
      if (i === 0) {
        ctx.page.drawText("•", { x: MARGIN + 2, y: ctx.y, size, font, color: rgb(color.r, color.g, color.b) });
      }
      ctx.page.drawText(wrapped[i], { x: indent, y: ctx.y, size, font, color: rgb(color.r, color.g, color.b) });
      ctx.y -= size * 1.3;
    }
  }
}

function drawExperience(ctx: DrawCtx): void {
  if (ctx.data.experience.length === 0) return;
  drawSectionHeader(ctx, "Experience");
  for (const exp of ctx.data.experience) {
    if (!exp.role && !exp.company) continue;
    ensureRoom(ctx, 36);
    const role = exp.role || "Role";
    const company = exp.company || "Company";
    const dates = [exp.start, exp.end].filter(Boolean).join(" — ");
    const head = `${role}, ${company}`;
    ctx.page.drawText(head, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    if (dates) {
      const dw = ctx.font.widthOfTextAtSize(dates, 9.5);
      ctx.page.drawText(dates, { x: W - MARGIN - dw, y: ctx.y, size: 9.5, font: ctx.font, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
    }
    ctx.y -= 14;
    if (exp.location.trim()) {
      ctx.page.drawText(exp.location, { x: MARGIN, y: ctx.y, size: 9.5, font: ctx.italic, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
      ctx.y -= 12;
    }
    if (exp.bullets.trim()) {
      drawBullets(ctx, exp.bullets, 10, ctx.font, ctx.ink);
    }
    ctx.y -= 6;
  }
}

function drawEducation(ctx: DrawCtx): void {
  if (ctx.data.education.length === 0) return;
  drawSectionHeader(ctx, "Education");
  for (const ed of ctx.data.education) {
    if (!ed.school && !ed.degree) continue;
    ensureRoom(ctx, 32);
    const head = ed.degree ? `${ed.degree}${ed.school ? ", " : ""}${ed.school}` : ed.school;
    const dates = [ed.start, ed.end].filter(Boolean).join(" — ");
    ctx.page.drawText(head, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    if (dates) {
      const dw = ctx.font.widthOfTextAtSize(dates, 9.5);
      ctx.page.drawText(dates, { x: W - MARGIN - dw, y: ctx.y, size: 9.5, font: ctx.font, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
    }
    ctx.y -= 14;
    if (ed.location.trim()) {
      ctx.page.drawText(ed.location, { x: MARGIN, y: ctx.y, size: 9.5, font: ctx.italic, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
      ctx.y -= 12;
    }
    if (ed.details.trim()) drawParagraph(ctx, ed.details, 10, ctx.font, ctx.ink);
    ctx.y -= 4;
  }
}

function drawSkills(ctx: DrawCtx): void {
  const cleaned = ctx.data.skills
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (cleaned.length === 0) return;
  drawSectionHeader(ctx, "Skills");
  drawParagraph(ctx, cleaned.join("  ·  "), 10, ctx.font, ctx.ink);
}

function drawProjects(ctx: DrawCtx): void {
  const items = ctx.data.projects.filter((p) => p.name.trim());
  if (items.length === 0) return;
  drawSectionHeader(ctx, "Projects");
  for (const p of items) {
    ensureRoom(ctx, 28);
    const head = p.link ? `${p.name} — ${p.link}` : p.name;
    ctx.page.drawText(head, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    ctx.y -= 14;
    if (p.description.trim()) drawParagraph(ctx, p.description, 10, ctx.font, ctx.ink);
    ctx.y -= 4;
  }
}

function drawLanguages(ctx: DrawCtx): void {
  const items = ctx.data.languages.filter((l) => l.name.trim());
  if (items.length === 0) return;
  drawSectionHeader(ctx, "Languages");
  const text = items.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("  ·  ");
  drawParagraph(ctx, text, 10, ctx.font, ctx.ink);
}

function drawCertifications(ctx: DrawCtx): void {
  const items = ctx.data.certifications.filter((c) => c.name.trim());
  if (items.length === 0) return;
  drawSectionHeader(ctx, "Certifications");
  for (const c of items) {
    ensureRoom(ctx, 14);
    const right = [c.issuer, c.date].filter(Boolean).join(" · ");
    ctx.page.drawText(c.name, { x: MARGIN, y: ctx.y, size: 10.5, font: ctx.bold, color: rgb(ctx.ink.r, ctx.ink.g, ctx.ink.b) });
    if (right) {
      const rw = ctx.font.widthOfTextAtSize(right, 9.5);
      ctx.page.drawText(right, { x: W - MARGIN - rw, y: ctx.y, size: 9.5, font: ctx.font, color: rgb(ctx.faint.r, ctx.faint.g, ctx.faint.b) });
    }
    ctx.y -= 14;
  }
}

export async function buildResumePdf(data: ResumeData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const f = fontPair(data.font);
  const font = await pdf.embedFont(f.regular);
  const bold = await pdf.embedFont(f.bold);
  const italic = await pdf.embedFont(f.italic);
  const page = pdf.addPage([W, H]);
  const ctx: DrawCtx = {
    pdf,
    page,
    y: H - MARGIN,
    font,
    bold,
    italic,
    data,
    theme: hexToRgb01(data.themeColor),
    ink: { r: 0.07, g: 0.09, b: 0.13 },
    faint: { r: 0.42, g: 0.46, b: 0.53 },
  };

  drawHeader(ctx);
  if (data.summary.trim()) {
    drawSectionHeader(ctx, "Summary");
    drawParagraph(ctx, data.summary, 10.5, ctx.font, ctx.ink);
  }
  drawExperience(ctx);
  drawEducation(ctx);
  drawSkills(ctx);
  drawProjects(ctx);
  drawLanguages(ctx);
  drawCertifications(ctx);

  return pdf.save({ useObjectStreams: true });
}
