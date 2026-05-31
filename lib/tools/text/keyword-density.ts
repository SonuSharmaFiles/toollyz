// Keyword Density Checker engine. Tokenises prose into words and produces
// 1-gram, 2-gram and 3-gram frequency tables. Each entry includes the
// raw count, density percentage, and an SEO band ("optimal" / "high" /
// "low") relative to common ideal ranges (1-3 % for primary keywords).

import { STOPWORDS } from "./word-counter";

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export type DensityBand = "low" | "optimal" | "high";

export interface DensityRow {
  keyword: string;
  count: number;
  density: number;
  band: DensityBand;
  /** Whether the keyword is a single stopword. */
  isStopword: boolean;
}

export interface DensityOptions {
  /** Drop stopwords from 1-gram results (default true). */
  ignoreStopwords: boolean;
  /** Lowercase before counting. */
  ignoreCase: boolean;
  /** Minimum word length (1-grams only). */
  minLength: number;
  /** Optimal density range as percentages — anything below `low` is "low", above `high` is "high". */
  optimalLow: number;
  optimalHigh: number;
}

export const DEFAULT_DENSITY_OPTIONS: DensityOptions = {
  ignoreStopwords: true,
  ignoreCase: true,
  minLength: 3,
  optimalLow: 1.0,
  optimalHigh: 3.0,
};

export interface DensityReport {
  totalWords: number;
  uniqueWords: number;
  diversity: number;
  unigrams: DensityRow[];
  bigrams: DensityRow[];
  trigrams: DensityRow[];
}

function bandOf(density: number, opt: DensityOptions): DensityBand {
  if (density < opt.optimalLow) return "low";
  if (density > opt.optimalHigh) return "high";
  return "optimal";
}

function tokenise(text: string, opt: DensityOptions): string[] {
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(WORD_RE.source, "gu");
  while ((match = re.exec(text))) {
    let t = match[0];
    if (opt.ignoreCase) t = t.toLowerCase();
    tokens.push(t);
  }
  return tokens;
}

function buildRows(counts: Map<string, number>, total: number, opt: DensityOptions): DensityRow[] {
  const rows: DensityRow[] = [];
  for (const [keyword, count] of counts) {
    const density = total === 0 ? 0 : (count / total) * 100;
    rows.push({
      keyword,
      count,
      density,
      band: bandOf(density, opt),
      isStopword: STOPWORDS.has(keyword),
    });
  }
  rows.sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword));
  return rows;
}

export function analyse(text: string, opt: DensityOptions = DEFAULT_DENSITY_OPTIONS): DensityReport {
  if (!text.trim()) {
    return { totalWords: 0, uniqueWords: 0, diversity: 0, unigrams: [], bigrams: [], trigrams: [] };
  }

  const tokens = tokenise(text, opt);
  // Filter for 1-gram counting.
  const filtered = tokens.filter((t) => {
    if (t.length < opt.minLength) return false;
    if (opt.ignoreStopwords && STOPWORDS.has(t)) return false;
    return true;
  });

  const uni = new Map<string, number>();
  for (const t of filtered) uni.set(t, (uni.get(t) ?? 0) + 1);

  const bi = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (opt.ignoreStopwords && (STOPWORDS.has(a) || STOPWORDS.has(b))) continue;
    if (a.length < 2 || b.length < 2) continue;
    const k = `${a} ${b}`;
    bi.set(k, (bi.get(k) ?? 0) + 1);
  }

  const tri = new Map<string, number>();
  for (let i = 0; i < tokens.length - 2; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    const c = tokens[i + 2];
    if (opt.ignoreStopwords && (STOPWORDS.has(a) || STOPWORDS.has(c))) continue;
    if (a.length < 2 || c.length < 2) continue;
    const k = `${a} ${b} ${c}`;
    tri.set(k, (tri.get(k) ?? 0) + 1);
  }

  const totalForUnigrams = filtered.length || 1;
  const totalForBigrams = Math.max(1, tokens.length - 1);
  const totalForTrigrams = Math.max(1, tokens.length - 2);

  return {
    totalWords: tokens.length,
    uniqueWords: new Set(tokens).size,
    diversity: tokens.length === 0 ? 0 : new Set(tokens).size / tokens.length,
    unigrams: buildRows(uni, totalForUnigrams, opt),
    bigrams: buildRows(bi, totalForBigrams, opt),
    trigrams: buildRows(tri, totalForTrigrams, opt),
  };
}

export function reportToCsv(report: DensityReport): string {
  const lines: string[] = ["gram\tkeyword\tcount\tdensity_percent\tband"];
  for (const row of report.unigrams) lines.push(`1\t${row.keyword}\t${row.count}\t${row.density.toFixed(2)}\t${row.band}`);
  for (const row of report.bigrams) lines.push(`2\t${row.keyword}\t${row.count}\t${row.density.toFixed(2)}\t${row.band}`);
  for (const row of report.trigrams) lines.push(`3\t${row.keyword}\t${row.count}\t${row.density.toFixed(2)}\t${row.band}`);
  return lines.join("\n");
}
