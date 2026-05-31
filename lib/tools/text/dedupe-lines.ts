// Duplicate Line Remover engine. Pure helpers for dedupe / occurrence-counting
// / duplicate extraction. Splitting honours \r\n and a single trailing newline
// so a list paste from Excel doesn't gain a phantom blank entry.

export type Order = "preserve" | "first" | "sort";

export interface DedupeOptions {
  ignoreCase: boolean;
  trim: boolean;
  removeEmpty: boolean;
  /**
   * "preserve" — keep original order of first occurrence (most common).
   * "first" — same as preserve; kept as alias for explicit intent.
   * "sort" — emit the unique set sorted ascending.
   */
  order: Order;
}

export const DEFAULT_DEDUPE: DedupeOptions = {
  ignoreCase: false,
  trim: true,
  removeEmpty: false,
  order: "preserve",
};

function splitLines(text: string): string[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function keyOf(line: string, opt: DedupeOptions): string {
  let s = line;
  if (opt.trim) s = s.trim();
  if (opt.ignoreCase) s = s.toLowerCase();
  return s;
}

export interface DedupeResult {
  /** Cleaned text — unique lines joined with \n. */
  output: string;
  /** Lines actually emitted, in output order. */
  lines: string[];
  /** Number of duplicate lines that were dropped. */
  removed: number;
  /** Original line count after split. */
  originalCount: number;
}

export function dedupeLines(text: string, options: DedupeOptions = DEFAULT_DEDUPE): DedupeResult {
  if (!text) return { output: "", lines: [], removed: 0, originalCount: 0 };
  const all = splitLines(text);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const line of all) {
    const key = keyOf(line, options);
    if (options.removeEmpty && key === "") continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(options.trim ? line.trim() : line);
  }
  const ordered = options.order === "sort" ? [...out].sort((a, b) => a.localeCompare(b)) : out;

  return {
    output: ordered.join("\n"),
    lines: ordered,
    removed: all.length - out.length,
    originalCount: all.length,
  };
}

export interface OccurrenceRow {
  line: string;
  count: number;
}

/** Count every line's frequency under the same options used by dedupe. */
export function countOccurrences(text: string, options: DedupeOptions = DEFAULT_DEDUPE): OccurrenceRow[] {
  if (!text) return [];
  const all = splitLines(text);
  const counts = new Map<string, { display: string; count: number }>();
  for (const line of all) {
    const key = keyOf(line, options);
    if (options.removeEmpty && key === "") continue;
    const existing = counts.get(key);
    if (existing) existing.count++;
    else counts.set(key, { display: options.trim ? line.trim() : line, count: 1 });
  }
  const rows: OccurrenceRow[] = [];
  for (const v of counts.values()) rows.push({ line: v.display, count: v.count });
  rows.sort((a, b) => b.count - a.count || a.line.localeCompare(b.line));
  return rows;
}

/** Return only the lines that appear more than once. Useful for the
 * "show duplicates only" toggle in the UI. */
export function extractDuplicates(text: string, options: DedupeOptions = DEFAULT_DEDUPE): OccurrenceRow[] {
  return countOccurrences(text, options).filter((r) => r.count > 1);
}

export interface DedupeStats {
  /** Original line count after CRLF normalization. */
  originalLines: number;
  /** Unique lines. */
  uniqueLines: number;
  /** Lines appearing more than once. */
  duplicateLines: number;
  /** Total duplicate occurrences (sum of (count - 1) across duplicates). */
  duplicatesRemoved: number;
  /** Empty lines in the original. */
  blankLines: number;
}

export function statsOf(text: string, options: DedupeOptions = DEFAULT_DEDUPE): DedupeStats {
  if (!text) return { originalLines: 0, uniqueLines: 0, duplicateLines: 0, duplicatesRemoved: 0, blankLines: 0 };
  const all = splitLines(text);
  const counts = new Map<string, number>();
  let blanks = 0;
  for (const line of all) {
    const key = keyOf(line, options);
    if (key === "") blanks++;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let dupKeys = 0;
  let dupRemoved = 0;
  for (const v of counts.values()) {
    if (v > 1) {
      dupKeys++;
      dupRemoved += v - 1;
    }
  }
  return {
    originalLines: all.length,
    uniqueLines: counts.size,
    duplicateLines: dupKeys,
    duplicatesRemoved: dupRemoved,
    blankLines: blanks,
  };
}
