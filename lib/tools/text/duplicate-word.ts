// Duplicate Word Finder engine. Tokenises prose into words, reports the
// frequency of each, surfaces the worst offenders, and computes lexical
// diversity (unique words / total words) so writers can quickly spot
// over-used filler.

import { STOPWORDS as WORD_COUNTER_STOPWORDS } from "./word-counter";

// We re-export so the UI can show the active stopword count.
export const STOPWORDS = WORD_COUNTER_STOPWORDS;

export interface DuplicateOptions {
  /** Minimum repetitions to flag a word (1 = report every word, 2 = only repeated). */
  minCount: number;
  /** Skip very common short words (a, the, and, etc.) when computing duplicates. */
  ignoreStopwords: boolean;
  /** Skip pure numbers (123, 4.5, …). */
  ignoreNumbers: boolean;
  /** Treat case differences as the same word. */
  ignoreCase: boolean;
  /** Minimum length to count — kills filler like "a" / "I" when 2. */
  minLength: number;
}

export const DEFAULT_DUPLICATE_OPTIONS: DuplicateOptions = {
  minCount: 2,
  ignoreStopwords: true,
  ignoreNumbers: true,
  ignoreCase: true,
  minLength: 3,
};

// Strict letter+digit token: Unicode-aware. Apostrophes inside a word
// (don't, it's) are preserved.
const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export interface WordOccurrence {
  /** Display form — the first casing we saw. */
  word: string;
  /** Number of times this word appeared. */
  count: number;
  /** 0-based character positions for highlighting. */
  positions: number[];
}

export interface DuplicateReport {
  /** Total words in the input (including stopwords / short words / numbers). */
  total: number;
  /** Unique normalised forms. */
  unique: number;
  /** Words that pass the minCount filter, sorted by count desc then alpha asc. */
  duplicates: WordOccurrence[];
  /** Every counted word (rank, count, positions). */
  every: WordOccurrence[];
  /** Lexical diversity 0-1 = unique/total (after the same normalisation). */
  diversity: number;
  /** Total stopwords matched (informational; the filter may or may not skip them). */
  stopwordCount: number;
}

function normaliseToken(token: string, opt: DuplicateOptions): string {
  return opt.ignoreCase ? token.toLowerCase() : token;
}

function isStopword(t: string): boolean {
  return STOPWORDS.has(t.toLowerCase());
}

function isNumber(t: string): boolean {
  return /^[\p{N}]+(?:[.,][\p{N}]+)?$/u.test(t);
}

export function findDuplicates(text: string, options: DuplicateOptions = DEFAULT_DUPLICATE_OPTIONS): DuplicateReport {
  if (!text) {
    return { total: 0, unique: 0, duplicates: [], every: [], diversity: 0, stopwordCount: 0 };
  }
  const counts = new Map<string, { word: string; count: number; positions: number[] }>();
  let total = 0;
  let stopwordCount = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(WORD_RE.source, "gu");
  while ((match = re.exec(text))) {
    const raw = match[0];
    if (raw.length < options.minLength) continue;
    if (options.ignoreNumbers && isNumber(raw)) continue;
    const isStop = isStopword(raw);
    if (isStop) stopwordCount++;
    if (options.ignoreStopwords && isStop) continue;
    total++;
    const key = normaliseToken(raw, options);
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
      existing.positions.push(match.index);
    } else {
      counts.set(key, { word: raw, count: 1, positions: [match.index] });
    }
  }

  const every: WordOccurrence[] = [];
  for (const v of counts.values()) every.push(v);
  every.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const duplicates = every.filter((o) => o.count >= options.minCount);
  const unique = counts.size;
  const diversity = total === 0 ? 0 : unique / total;
  return { total, unique, duplicates, every, diversity, stopwordCount };
}

export interface HighlightSegment {
  text: string;
  /** When set, this segment is a counted duplicate (UI highlights it). */
  word?: string;
  /** Per-word rank among duplicates (1 = most-repeated) so the UI can colour-rank. */
  rank?: number;
}

/** Walk the input text and split into segments — plain prose vs. highlighted
 * duplicate words — so the UI can render colour-rank highlighting without
 * re-tokenising on every render. */
export function highlight(text: string, report: DuplicateReport): HighlightSegment[] {
  if (!text || report.duplicates.length === 0) {
    return [{ text }];
  }
  // Build a quick lookup: keyed positions → (word, rank).
  const lookup = new Map<number, { word: string; length: number; rank: number }>();
  report.duplicates.forEach((d, idx) => {
    const rank = idx + 1;
    d.positions.forEach((pos) => {
      lookup.set(pos, { word: d.word, length: d.word.length, rank });
    });
  });
  // Some duplicate occurrences may have been recorded at the matched index
  // with a different surface form (case-folded). Re-tokenise to obtain the
  // surface length for each occurrence.
  const segs: HighlightSegment[] = [];
  let cursor = 0;
  const re = new RegExp(WORD_RE.source, "gu");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const hit = lookup.get(m.index);
    if (!hit) continue;
    if (m.index > cursor) segs.push({ text: text.slice(cursor, m.index) });
    segs.push({ text: m[0], word: hit.word, rank: hit.rank });
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor) });
  return segs;
}
