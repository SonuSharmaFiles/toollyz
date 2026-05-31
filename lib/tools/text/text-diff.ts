// Text Diff engine. Implements a line-level diff using LCS + per-line word
// diff for changed lines. Pure functions, browser-safe, no external deps.
//
// The algorithm is plain O(m·n) longest-common-subsequence — fine up to a few
// thousand lines for browser use. We prefer correctness and simplicity to the
// memory wins of Myers/Hunt-McIlroy because users diff prose or config, not
// large source trees.

export type DiffOp = "equal" | "add" | "remove" | "change";

export interface DiffRow {
  op: DiffOp;
  /** Left-side line number (1-based) or null when this row is a pure addition. */
  leftNo: number | null;
  /** Right-side line number (1-based) or null when this row is a pure removal. */
  rightNo: number | null;
  /** Left-side line content (empty on pure additions). */
  left: string;
  /** Right-side line content (empty on pure removals). */
  right: string;
}

export interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  ignoreBlankLines: boolean;
  /** Pair single "remove + add" runs as a single "change" row for nicer rendering. */
  pairChanges: boolean;
}

export const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  ignoreWhitespace: false,
  ignoreCase: false,
  ignoreBlankLines: false,
  pairChanges: true,
};

function normalize(line: string, opt: DiffOptions): string {
  let s = line;
  if (opt.ignoreWhitespace) s = s.replace(/\s+/g, " ").trim();
  if (opt.ignoreCase) s = s.toLowerCase();
  return s;
}

function splitLines(text: string): string[] {
  // Normalise CRLF → LF; drop a single trailing empty line so a final newline
  // doesn't show as a phantom "added blank" row.
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

interface LinePair {
  raw: string;
  key: string;
  index: number; // 1-based original line number
}

function prepare(text: string, opt: DiffOptions): LinePair[] {
  const lines = splitLines(text);
  return lines
    .map<LinePair>((raw, i) => ({ raw, key: normalize(raw, opt), index: i + 1 }))
    .filter((p) => !(opt.ignoreBlankLines && p.key === ""));
}

/** Build the LCS length matrix. */
function lcsMatrix(a: LinePair[], b: LinePair[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i].key === b[j].key) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

function pairChangeRuns(rows: DiffRow[]): DiffRow[] {
  const out: DiffRow[] = [];
  let i = 0;
  while (i < rows.length) {
    const r = rows[i];
    if (r.op === "remove") {
      // Collect a contiguous run of removes then adds.
      const removes: DiffRow[] = [r];
      let j = i + 1;
      while (j < rows.length && rows[j].op === "remove") {
        removes.push(rows[j]);
        j++;
      }
      const adds: DiffRow[] = [];
      while (j < rows.length && rows[j].op === "add") {
        adds.push(rows[j]);
        j++;
      }
      // Zip pair-wise; leftovers stay as pure remove or pure add rows.
      const n = Math.min(removes.length, adds.length);
      for (let k = 0; k < n; k++) {
        out.push({
          op: "change",
          leftNo: removes[k].leftNo,
          rightNo: adds[k].rightNo,
          left: removes[k].left,
          right: adds[k].right,
        });
      }
      for (let k = n; k < removes.length; k++) out.push(removes[k]);
      for (let k = n; k < adds.length; k++) out.push(adds[k]);
      i = j;
    } else {
      out.push(r);
      i++;
    }
  }
  return out;
}

export interface DiffStats {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  /** Similarity 0–1 — common lines over the longer side. */
  similarity: number;
  leftLines: number;
  rightLines: number;
}

export interface DiffResult {
  rows: DiffRow[];
  stats: DiffStats;
}

export function diffText(leftText: string, rightText: string, opt: DiffOptions = DEFAULT_DIFF_OPTIONS): DiffResult {
  const a = prepare(leftText, opt);
  const b = prepare(rightText, opt);
  const dp = lcsMatrix(a, b);

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i].key === b[j].key) {
      rows.push({ op: "equal", leftNo: a[i].index, rightNo: b[j].index, left: a[i].raw, right: b[j].raw });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ op: "remove", leftNo: a[i].index, rightNo: null, left: a[i].raw, right: "" });
      i++;
    } else {
      rows.push({ op: "add", leftNo: null, rightNo: b[j].index, left: "", right: b[j].raw });
      j++;
    }
  }
  while (i < a.length) {
    rows.push({ op: "remove", leftNo: a[i].index, rightNo: null, left: a[i].raw, right: "" });
    i++;
  }
  while (j < b.length) {
    rows.push({ op: "add", leftNo: null, rightNo: b[j].index, left: "", right: b[j].raw });
    j++;
  }

  const paired = opt.pairChanges ? pairChangeRuns(rows) : rows;

  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;
  for (const r of paired) {
    switch (r.op) {
      case "add": added++; break;
      case "remove": removed++; break;
      case "change": changed++; break;
      case "equal": unchanged++; break;
    }
  }
  const denom = Math.max(a.length, b.length, 1);
  const similarity = denom === 0 ? 1 : unchanged / denom;

  return {
    rows: paired,
    stats: {
      added, removed, changed, unchanged,
      similarity,
      leftLines: a.length,
      rightLines: b.length,
    },
  };
}

// ─── Inline word diff ──────────────────────────────────────────────────────

export type Token = { text: string; op: "equal" | "add" | "remove" };

const WORD_RE = /\s+|\S+/g;

function tokenize(s: string): string[] {
  return s.match(WORD_RE) ?? [];
}

/** Compute a word-level diff between two strings — used to highlight inline
 * changes inside paired "change" rows. */
export function diffWords(a: string, b: string): { left: Token[]; right: Token[] } {
  const aT = tokenize(a);
  const bT = tokenize(b);
  const m = aT.length;
  const n = bT.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (aT[i] === bT[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const left: Token[] = [];
  const right: Token[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (aT[i] === bT[j]) {
      left.push({ text: aT[i], op: "equal" });
      right.push({ text: bT[j], op: "equal" });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      left.push({ text: aT[i], op: "remove" });
      i++;
    } else {
      right.push({ text: bT[j], op: "add" });
      j++;
    }
  }
  while (i < m) { left.push({ text: aT[i], op: "remove" }); i++; }
  while (j < n) { right.push({ text: bT[j], op: "add" }); j++; }
  return { left, right };
}
