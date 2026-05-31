// Keyboard Layout Visualizer engine. Curated layouts for QWERTY (US),
// Dvorak, Colemak, AZERTY (FR), and Workman. Each layout is a 4-row grid
// of physical-key labels; the home row, special keys (space, enter, tab,
// shift, modifiers) and the punctuation differ between layouts.
//
// Also includes a finger-load analyser: given a sample text, count how
// many keystrokes each finger would type on the chosen layout.

export type LayoutId = "qwerty" | "dvorak" | "colemak" | "azerty" | "workman";

export interface LayoutMeta {
  id: LayoutId;
  name: string;
  region: string;
  /** Year first published. */
  year: number;
  hint: string;
}

export const LAYOUTS_META: LayoutMeta[] = [
  { id: "qwerty", name: "QWERTY", region: "US", year: 1873, hint: "Sholes & Glidden — the universal default." },
  { id: "dvorak", name: "Dvorak", region: "US Simplified", year: 1936, hint: "August Dvorak — vowels under the left home row." },
  { id: "colemak", name: "Colemak", region: "US Improved", year: 2006, hint: "Shai Coleman — modern minimum-relocation refresh." },
  { id: "azerty", name: "AZERTY", region: "France / Belgium", year: 1907, hint: "French national variant of QWERTY." },
  { id: "workman", name: "Workman", region: "US Ergonomic", year: 2010, hint: "OJ Bucao — bias toward stronger fingers." },
];

// Each row is the 'unshifted' character. Capital letters render the row label.
// Row 0 = numbers, row 1 = top, row 2 = home, row 3 = bottom.
export const LAYOUTS: Record<LayoutId, string[][]> = {
  qwerty: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ],
  dvorak: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[", "]"],
    ["'", ",", ".", "p", "y", "f", "g", "c", "r", "l", "/", "=", "\\"],
    ["a", "o", "e", "u", "i", "d", "h", "t", "n", "s", "-"],
    [";", "q", "j", "k", "x", "b", "m", "w", "v", "z"],
  ],
  colemak: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "w", "f", "p", "g", "j", "l", "u", "y", ";", "[", "]", "\\"],
    ["a", "r", "s", "t", "d", "h", "n", "e", "i", "o", "'"],
    ["z", "x", "c", "v", "b", "k", "m", ",", ".", "/"],
  ],
  azerty: [
    ["²", "&", "é", '"', "'", "(", "-", "è", "_", "ç", "à", ")", "="],
    ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p", "^", "$", "*"],
    ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m", "ù"],
    ["w", "x", "c", "v", "b", "n", ",", ";", ":", "!"],
  ],
  workman: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "d", "r", "w", "b", "j", "f", "u", "p", ";", "[", "]", "\\"],
    ["a", "s", "h", "t", "g", "y", "n", "e", "o", "i", "'"],
    ["z", "x", "m", "c", "v", "k", "l", ",", ".", "/"],
  ],
};

// Standard 10-finger typing assignment. Index 0 = left pinky, 9 = right pinky.
// Each row has its own assignment; we use the same physical row indices.
export type Finger =
  | "LP" | "LR" | "LM" | "LI" // left pinky, ring, middle, index
  | "RI" | "RM" | "RR" | "RP" // right index, middle, ring, pinky
  | "T";                      // thumbs

// Finger per column (0–12 with 13 col rows, but vary per row). We assign
// columns conservatively for the standard QWERTY-like footprint.
const FINGER_PER_COL: Finger[][] = [
  ["LP", "LP", "LR", "LM", "LI", "LI", "RI", "RI", "RM", "RR", "RP", "RP", "RP"], // row 0
  ["LP", "LR", "LM", "LI", "LI", "RI", "RI", "RM", "RR", "RP", "RP", "RP", "RP"], // row 1
  ["LP", "LR", "LM", "LI", "LI", "RI", "RI", "RM", "RR", "RP", "RP"],             // row 2
  ["LP", "LR", "LM", "LI", "LI", "RI", "RI", "RM", "RR", "RP"],                   // row 3
];

export const HOME_KEYS: Record<LayoutId, string> = {
  qwerty: "asdfjkl;",
  dvorak: "aoeuhtns",
  colemak: "arstneio",
  azerty: "qsdfjklm",
  workman: "ashtneoi",
};

// ── Finger-load analyser ────────────────────────────────────────────────────

export interface FingerLoad {
  finger: Finger;
  count: number;
  pct: number;
}

const FINGER_ORDER: Finger[] = ["LP", "LR", "LM", "LI", "RI", "RM", "RR", "RP", "T"];

export interface LoadResult {
  total: number;
  perFinger: FingerLoad[];
  /** Percentage of keystrokes typed on the home row. */
  homeRowPct: number;
  /** Strongest-finger percentage (index + middle). */
  strongFingerPct: number;
}

function findCoords(layout: string[][], ch: string): { row: number; col: number } | null {
  for (let r = 0; r < layout.length; r++) {
    const c = layout[r].indexOf(ch);
    if (c >= 0) return { row: r, col: c };
  }
  return null;
}

export function analyseLoad(text: string, id: LayoutId): LoadResult {
  const layout = LAYOUTS[id];
  const counts: Record<Finger, number> = { LP: 0, LR: 0, LM: 0, LI: 0, RI: 0, RM: 0, RR: 0, RP: 0, T: 0 };
  let total = 0;
  let homeRow = 0;
  for (const raw of text) {
    const ch = raw.toLowerCase();
    if (ch === " ") {
      counts.T++;
      total++;
      continue;
    }
    const coords = findCoords(layout, ch);
    if (!coords) continue;
    const finger = FINGER_PER_COL[coords.row]?.[coords.col];
    if (!finger) continue;
    counts[finger]++;
    total++;
    if (coords.row === 2) homeRow++;
  }
  const perFinger: FingerLoad[] = FINGER_ORDER.map((f) => ({
    finger: f,
    count: counts[f],
    pct: total === 0 ? 0 : (counts[f] / total) * 100,
  }));
  const strong = total === 0 ? 0 : ((counts.LI + counts.LM + counts.RI + counts.RM) / total) * 100;
  return {
    total,
    perFinger,
    homeRowPct: total === 0 ? 0 : (homeRow / total) * 100,
    strongFingerPct: strong,
  };
}

export const FINGER_LABELS: Record<Finger, string> = {
  LP: "Left pinky",
  LR: "Left ring",
  LM: "Left middle",
  LI: "Left index",
  RI: "Right index",
  RM: "Right middle",
  RR: "Right ring",
  RP: "Right pinky",
  T: "Thumb (space)",
};

export const FINGER_COLORS: Record<Finger, string> = {
  LP: "#fb7185",
  LR: "#fbbf24",
  LM: "#fde047",
  LI: "#86efac",
  RI: "#67e8f9",
  RM: "#93c5fd",
  RR: "#c4b5fd",
  RP: "#f0abfc",
  T: "#94a3b8",
};

export function fingerAt(row: number, col: number): Finger | null {
  return FINGER_PER_COL[row]?.[col] ?? null;
}

export const SAMPLE_TEXT =
  "the quick brown fox jumps over the lazy dog. pack my box with five dozen liquor jugs. how vexingly quick daft zebras jump.";
