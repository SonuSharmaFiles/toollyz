// Line Sorter engine. Supports alpha, natural, numeric, length, random and
// reverse modes plus filter options (case-sensitivity, ignore-leading
// whitespace, blank handling, dedupe). All pure, no side effects.

export type SortMode =
  | "az"        // case-aware alpha ascending
  | "za"        // case-aware alpha descending
  | "natural-az" // "img2.png" before "img10.png" (Intl.Collator numeric)
  | "natural-za"
  | "numeric-az" // parseFloat lines; non-numeric sort last
  | "numeric-za"
  | "length-az" // short → long
  | "length-za"
  | "shuffle"   // Fisher-Yates with crypto.getRandomValues when available
  | "reverse";  // simple top↔bottom flip; no sort

export interface SortOptions {
  caseSensitive: boolean;
  /** Ignore leading whitespace when comparing — useful for indented lists. */
  ignoreLeadingSpace: boolean;
  /** Drop empty lines before sorting. */
  removeBlanks: boolean;
  /** Dedupe after sorting. */
  dedupe: boolean;
}

export const DEFAULT_SORT_OPTIONS: SortOptions = {
  caseSensitive: false,
  ignoreLeadingSpace: true,
  removeBlanks: false,
  dedupe: false,
};

function splitLines(text: string): string[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function keyOf(line: string, opt: SortOptions): string {
  let s = line;
  if (opt.ignoreLeadingSpace) s = s.replace(/^\s+/, "");
  if (!opt.caseSensitive) s = s.toLowerCase();
  return s;
}

const NUMERIC_LEAD_RE = /^[-+]?\d[\d.,_eE+-]*/;
function leadingNumber(line: string): number {
  const trimmed = line.replace(/^\s+/, "");
  const match = NUMERIC_LEAD_RE.exec(trimmed);
  if (!match) return NaN;
  // Strip thousands separators before parseFloat.
  const cleaned = match[0].replace(/,/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function cryptoRand(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0xffffffff;
  }
  return Math.random();
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(cryptoRand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const NATURAL = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const ALPHA = new Intl.Collator(undefined, { sensitivity: "variant" });
const ALPHA_INSENSITIVE = new Intl.Collator(undefined, { sensitivity: "base" });

export interface SortResult {
  output: string;
  lines: string[];
  removedBlanks: number;
  removedDuplicates: number;
  inputLines: number;
}

export function sortLines(text: string, mode: SortMode, options: SortOptions = DEFAULT_SORT_OPTIONS): SortResult {
  if (!text) return { output: "", lines: [], removedBlanks: 0, removedDuplicates: 0, inputLines: 0 };
  let all = splitLines(text);
  const inputLines = all.length;
  let removedBlanks = 0;
  if (options.removeBlanks) {
    const next = all.filter((l) => l.trim() !== "");
    removedBlanks = all.length - next.length;
    all = next;
  }

  let sorted: string[];
  const collator = options.caseSensitive ? ALPHA : ALPHA_INSENSITIVE;

  switch (mode) {
    case "az":
      sorted = [...all].sort((a, b) => collator.compare(keyOf(a, options), keyOf(b, options)));
      break;
    case "za":
      sorted = [...all].sort((a, b) => collator.compare(keyOf(b, options), keyOf(a, options)));
      break;
    case "natural-az":
      sorted = [...all].sort((a, b) => NATURAL.compare(keyOf(a, options), keyOf(b, options)));
      break;
    case "natural-za":
      sorted = [...all].sort((a, b) => NATURAL.compare(keyOf(b, options), keyOf(a, options)));
      break;
    case "numeric-az":
      sorted = [...all].sort((a, b) => {
        const na = leadingNumber(a);
        const nb = leadingNumber(b);
        const aN = Number.isNaN(na);
        const bN = Number.isNaN(nb);
        if (aN && bN) return collator.compare(keyOf(a, options), keyOf(b, options));
        if (aN) return 1; // non-numeric goes last
        if (bN) return -1;
        return na - nb;
      });
      break;
    case "numeric-za":
      sorted = [...all].sort((a, b) => {
        const na = leadingNumber(a);
        const nb = leadingNumber(b);
        const aN = Number.isNaN(na);
        const bN = Number.isNaN(nb);
        if (aN && bN) return collator.compare(keyOf(b, options), keyOf(a, options));
        if (aN) return 1;
        if (bN) return -1;
        return nb - na;
      });
      break;
    case "length-az":
      sorted = [...all].sort((a, b) => [...a].length - [...b].length || collator.compare(a, b));
      break;
    case "length-za":
      sorted = [...all].sort((a, b) => [...b].length - [...a].length || collator.compare(a, b));
      break;
    case "shuffle":
      sorted = shuffle(all);
      break;
    case "reverse":
      sorted = [...all].reverse();
      break;
  }

  let removedDuplicates = 0;
  if (options.dedupe) {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of sorted) {
      const k = keyOf(line, options);
      if (seen.has(k)) {
        removedDuplicates++;
        continue;
      }
      seen.add(k);
      unique.push(line);
    }
    sorted = unique;
  }

  return {
    output: sorted.join("\n"),
    lines: sorted,
    removedBlanks,
    removedDuplicates,
    inputLines,
  };
}

export interface SortModeMeta {
  id: SortMode;
  label: string;
  group: "Alpha" | "Numeric" | "Length" | "Random";
  hint: string;
}

export const SORT_MODES: SortModeMeta[] = [
  { id: "az", label: "A → Z", group: "Alpha", hint: "Standard alphabetical ascending." },
  { id: "za", label: "Z → A", group: "Alpha", hint: "Standard alphabetical descending." },
  { id: "natural-az", label: "Natural A → Z", group: "Alpha", hint: "img2 before img10 — handles embedded numbers." },
  { id: "natural-za", label: "Natural Z → A", group: "Alpha", hint: "Natural ordering descending." },
  { id: "numeric-az", label: "Number ↑", group: "Numeric", hint: "Sort by the leading number; non-numeric lines go last." },
  { id: "numeric-za", label: "Number ↓", group: "Numeric", hint: "Largest number first." },
  { id: "length-az", label: "Shortest first", group: "Length", hint: "Sort by line length ascending." },
  { id: "length-za", label: "Longest first", group: "Length", hint: "Sort by line length descending." },
  { id: "shuffle", label: "Shuffle", group: "Random", hint: "Random order using crypto.getRandomValues." },
  { id: "reverse", label: "Reverse", group: "Random", hint: "Just flip top↔bottom — no sort." },
];
