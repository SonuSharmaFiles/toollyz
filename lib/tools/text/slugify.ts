// URL slug generation: Unicode transliteration, configurable formats and SEO
// scoring. Pure functions; reuses the shared stopword set.

import { STOPWORDS } from "./word-counter";

export type Separator = "-" | "_" | "." | "/";
export type LetterCase = "lower" | "upper" | "title";
export type Identifier = "none" | "camel" | "pascal";
export type UnicodeMode = "translit" | "keep";

export interface SlugOptions {
  separator: Separator;
  letterCase: LetterCase;
  identifier: Identifier;
  unicode: UnicodeMode;
  removeStopwords: boolean;
  removeNumbers: boolean;
  removeEmoji: boolean;
  maxLength: number; // 0 = no limit
}

export const DEFAULT_OPTIONS: SlugOptions = {
  separator: "-",
  letterCase: "lower",
  identifier: "none",
  unicode: "translit",
  removeStopwords: false,
  removeNumbers: false,
  removeEmoji: true,
  maxLength: 0,
};

export const SEPARATORS: { id: Separator; label: string }[] = [
  { id: "-", label: "Hyphen -" },
  { id: "_", label: "Underscore _" },
  { id: ".", label: "Dot ." },
  { id: "/", label: "Slash /" },
];

export interface FormatPreset {
  id: string;
  label: string;
  apply: Partial<SlugOptions>;
}

export const FORMAT_PRESETS: FormatPreset[] = [
  { id: "url", label: "URL slug", apply: { identifier: "none", separator: "-", letterCase: "lower" } },
  { id: "snake", label: "snake_case", apply: { identifier: "none", separator: "_", letterCase: "lower" } },
  { id: "dot", label: "dot.case", apply: { identifier: "none", separator: ".", letterCase: "lower" } },
  { id: "path", label: "path/case", apply: { identifier: "none", separator: "/", letterCase: "lower" } },
  { id: "camel", label: "camelCase", apply: { identifier: "camel" } },
  { id: "pascal", label: "PascalCase", apply: { identifier: "pascal" } },
];

// ─── Transliteration map (non-decomposable Latin, Cyrillic, Greek) ───────────

const CHAR_MAP: Record<string, string> = {
  ß: "ss", æ: "ae", Æ: "ae", œ: "oe", Œ: "oe", ø: "o", Ø: "o", ð: "d", Ð: "d",
  þ: "th", Þ: "th", đ: "d", Đ: "d", ł: "l", Ł: "l", ı: "i", ĸ: "k", ŉ: "n",
  // Cyrillic (Russian)
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  А: "a", Б: "b", В: "v", Г: "g", Д: "d", Е: "e", Ё: "e", Ж: "zh", З: "z",
  И: "i", Й: "y", К: "k", Л: "l", М: "m", Н: "n", О: "o", П: "p", Р: "r",
  С: "s", Т: "t", У: "u", Ф: "f", Х: "h", Ц: "ts", Ч: "ch", Ш: "sh", Щ: "sch",
  Ъ: "", Ы: "y", Ь: "", Э: "e", Ю: "yu", Я: "ya",
  // Greek (lowercase common)
  α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i",
  κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s",
  ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
};

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function slugify(input: string, opt: SlugOptions): string {
  if (!input) return "";
  let s = input;
  if (opt.removeEmoji) s = s.replace(/\p{Extended_Pictographic}/gu, " ");

  if (opt.unicode === "translit") {
    s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    s = s.replace(/./gu, (ch) => (ch in CHAR_MAP ? CHAR_MAP[ch] : ch));
  }

  const wordRe = opt.unicode === "keep" ? /[\p{L}\p{N}]+/gu : /[A-Za-z0-9]+/g;
  let words: string[] = s.match(wordRe) ?? [];

  if (opt.removeNumbers) {
    words = words.map((w) => w.replace(/[\p{N}]+/gu, "")).filter(Boolean);
  }
  if (opt.removeStopwords) {
    const filtered = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
    if (filtered.length) words = filtered; // never reduce to nothing
  }
  if (!words.length) return "";

  const caseWord = (w: string, i: number): string => {
    if (opt.identifier === "camel") return i === 0 ? w.toLowerCase() : cap(w);
    if (opt.identifier === "pascal") return cap(w);
    if (opt.letterCase === "upper") return w.toUpperCase();
    if (opt.letterCase === "title") return cap(w);
    return w.toLowerCase();
  };

  const parts = words.map(caseWord);
  let slug = opt.identifier !== "none" ? parts.join("") : parts.join(opt.separator);

  if (opt.maxLength > 0 && slug.length > opt.maxLength) {
    slug = slug.slice(0, opt.maxLength);
    if (opt.identifier === "none") {
      const lastSep = slug.lastIndexOf(opt.separator);
      if (lastSep > 0) slug = slug.slice(0, lastSep);
    }
    slug = trimSep(slug, opt.separator);
  }
  return slug;
}

function trimSep(s: string, sep: string): string {
  let out = s;
  while (out.startsWith(sep)) out = out.slice(sep.length);
  while (out.endsWith(sep)) out = out.slice(0, -sep.length);
  return out;
}

// ─── SEO scoring ─────────────────────────────────────────────────────────────

export type SlugLevel = "good" | "ok" | "poor";

export interface SlugScore {
  score: number;
  level: SlugLevel;
  wordCount: number;
  length: number;
  tips: string[];
}

export function slugScore(slug: string, opt: SlugOptions, originalWordCount: number): SlugScore {
  const length = slug.length;
  const tips: string[] = [];
  let score = 100;

  if (length === 0) {
    return { score: 0, level: "poor", wordCount: 0, length: 0, tips: ["Enter some text to generate a slug."] };
  }

  const wordCount =
    opt.identifier !== "none"
      ? Math.max(1, originalWordCount)
      : slug.split(opt.separator).filter(Boolean).length;

  if (length > 75) { score -= 30; tips.push("Slug is long — aim for under 60 characters."); }
  else if (length > 60) { score -= 12; tips.push("Slightly long — under 60 characters reads best."); }
  if (wordCount > 6) { score -= 12; tips.push("Use 3–5 keywords for the cleanest URLs."); }
  if (wordCount < 1) { score -= 20; }

  if (opt.identifier === "none" && opt.letterCase !== "lower") {
    score -= 10;
    tips.push("Lowercase URLs avoid duplicate-content issues.");
  }
  if (opt.separator === "_") {
    score -= 8;
    tips.push("Google treats hyphens as word separators — prefer “-” over “_”.");
  }
  if (opt.identifier !== "none") {
    score -= 6;
    tips.push("camelCase suits code identifiers; use a hyphen slug for public URLs.");
  }
  if (!opt.removeStopwords && originalWordCount - wordCount <= 0 && wordCount > 4) {
    tips.push("Removing stop words (a, the, of…) can tighten the slug.");
  }

  score = Math.max(0, Math.min(100, score));
  const level: SlugLevel = score >= 80 ? "good" : score >= 55 ? "ok" : "poor";
  if (!tips.length) tips.push("Clean, readable and SEO-friendly. 👍");
  return { score, level, wordCount, length, tips };
}

// ─── Bulk ────────────────────────────────────────────────────────────────────

export interface BulkRow {
  original: string;
  slug: string;
  duplicate: boolean;
}

export function bulkSlugs(text: string, opt: SlugOptions, autoNumber: boolean): BulkRow[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const seen = new Map<string, number>();
  return lines.map((original) => {
    let slug = slugify(original, opt);
    let duplicate = false;
    if (slug) {
      const count = seen.get(slug) ?? 0;
      if (count > 0) {
        duplicate = true;
        if (autoNumber) {
          const joiner = opt.identifier !== "none" ? "" : opt.separator;
          slug = `${slug}${joiner}${count + 1}`;
        }
      }
      seen.set(slugify(original, opt), count + 1);
    }
    return { original, slug, duplicate };
  });
}

// ─── Developer / CMS utilities ───────────────────────────────────────────────

export interface DevUtil {
  label: string;
  value: string;
  hint: string;
}

export function devUtilities(text: string): DevUtil[] {
  const base = (sep: Separator, lc: LetterCase = "lower", id: Identifier = "none") =>
    slugify(text, { ...DEFAULT_OPTIONS, separator: sep, letterCase: lc, identifier: id });
  const kebab = base("-");
  const snake = base("_");
  return [
    { label: "WordPress slug", value: kebab, hint: "Permalink" },
    { label: "Next.js route", value: `/blog/${kebab || "[slug]"}`, hint: "App router path" },
    { label: "API endpoint", value: `/api/${kebab || "resource"}`, hint: "REST path" },
    { label: "Database field", value: snake || "field_name", hint: "snake_case column" },
    { label: "Markdown file", value: `${kebab || "post"}.md`, hint: "Content filename" },
    { label: "Image file", value: `${kebab || "image"}.jpg`, hint: "SEO image name" },
  ];
}
