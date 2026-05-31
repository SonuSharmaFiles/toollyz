// Duplicate File Name Cleaner engine. Parses a list of file names, groups
// case-insensitive duplicates, and produces a rename plan with counter
// suffixes that preserve the original extension. Useful when moving
// scattered downloads into a single folder or auditing CSV exports.

export interface RenameRow {
  original: string;
  /** Suggested new name — equal to original when no rename was needed. */
  suggested: string;
  /** Where this name appears in the input — first occurrence is 1. */
  occurrence: number;
  /** Total occurrences of this base name. */
  totalOccurrences: number;
  /** Did we rename this row? */
  renamed: boolean;
}

export interface DupOptions {
  /** Strip the extension before grouping (foo.png vs foo.jpg treated as same). */
  ignoreExtension: boolean;
  /** Case-insensitive grouping (Photo.PNG vs photo.png are the same). */
  ignoreCase: boolean;
  /** Pattern for the counter: "{name} (2){ext}" or "{name}-2{ext}" etc. */
  pattern: "paren" | "dash" | "underscore" | "zero-padded";
  /** Zero-pad the counter to this many digits (used by "zero-padded" pattern). */
  digits: number;
  /** Start the renamed copies at this counter — the first occurrence stays untouched. */
  start: number;
}

export const DEFAULT_DUP_OPTIONS: DupOptions = {
  ignoreExtension: false,
  ignoreCase: true,
  pattern: "paren",
  digits: 2,
  start: 2,
};

function splitExt(name: string): { base: string; ext: string } {
  // Treat dot-files (e.g. .bashrc) as having no extension.
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

function keyOf(name: string, opt: DupOptions): string {
  const { base, ext } = splitExt(name);
  let key = opt.ignoreExtension ? base : `${base}${ext}`;
  if (opt.ignoreCase) key = key.toLowerCase();
  return key;
}

function counter(n: number, pattern: DupOptions["pattern"], digits: number): string {
  switch (pattern) {
    case "paren":
      return ` (${n})`;
    case "dash":
      return `-${n}`;
    case "underscore":
      return `_${n}`;
    case "zero-padded":
      return `_${String(n).padStart(Math.max(1, digits), "0")}`;
  }
}

export function splitLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export interface DupResult {
  rows: RenameRow[];
  /** Number of distinct names with > 1 occurrence. */
  duplicateGroups: number;
  /** Total renames suggested. */
  renamedCount: number;
  /** Original unique-name count. */
  uniqueOriginal: number;
  /** Total names after the rename pass. */
  uniqueAfter: number;
}

export function dedupeNames(input: string[] | string, opt: DupOptions = DEFAULT_DUP_OPTIONS): DupResult {
  const names = Array.isArray(input) ? input : splitLines(input);
  const groups = new Map<string, number[]>();
  // First pass: collect indices per key.
  for (let i = 0; i < names.length; i++) {
    const k = keyOf(names[i], opt);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(i);
  }

  // Build the seen-set of final names so renames don't collide with each
  // other when the original list already contains foo (2).png.
  const finalKeys = new Set<string>();
  for (const indices of groups.values()) {
    if (indices.length === 1) {
      const onlyName = names[indices[0]];
      finalKeys.add(opt.ignoreCase ? onlyName.toLowerCase() : onlyName);
    } else {
      // The FIRST occurrence keeps its name; downstream code picks a counter.
      const first = names[indices[0]];
      finalKeys.add(opt.ignoreCase ? first.toLowerCase() : first);
    }
  }

  const rows: RenameRow[] = names.map((name, i) => ({
    original: name,
    suggested: name,
    occurrence: 1,
    totalOccurrences: 1,
    renamed: false,
  }));

  for (const [, indices] of groups) {
    const total = indices.length;
    indices.forEach((idx, j) => {
      rows[idx].totalOccurrences = total;
      rows[idx].occurrence = j + 1;
      if (j === 0 || total === 1) return;
      // Try counters starting at opt.start until we land a unique name.
      const { base, ext } = splitExt(names[idx]);
      let candidate = "";
      let counterValue = opt.start + j - 1;
      // Bump counter until uniqueness is achieved (handles original list with collisions).
      for (let safety = 0; safety < 10_000; safety++) {
        candidate = `${base}${counter(counterValue, opt.pattern, opt.digits)}${ext}`;
        const candidateKey = opt.ignoreCase ? candidate.toLowerCase() : candidate;
        if (!finalKeys.has(candidateKey)) {
          finalKeys.add(candidateKey);
          break;
        }
        counterValue++;
      }
      rows[idx].suggested = candidate;
      rows[idx].renamed = true;
    });
  }

  const renamedCount = rows.filter((r) => r.renamed).length;
  const duplicateGroups = [...groups.values()].filter((arr) => arr.length > 1).length;
  const uniqueOriginal = groups.size;
  const uniqueAfter = new Set(rows.map((r) => r.suggested)).size;

  return { rows, duplicateGroups, renamedCount, uniqueOriginal, uniqueAfter };
}

/** Produce a flat newline-separated suggested list ready to copy. */
export function suggestedList(rows: RenameRow[]): string {
  return rows.map((r) => r.suggested).join("\n");
}

/** TSV ready to paste into a spreadsheet: original [TAB] suggested. */
export function renameTsv(rows: RenameRow[]): string {
  return ["Original\tSuggested\tRenamed", ...rows.map((r) => `${r.original}\t${r.suggested}\t${r.renamed ? "yes" : "no"}`)].join("\n");
}
