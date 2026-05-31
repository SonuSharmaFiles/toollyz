// Braille translator (Grade 1 — uncontracted English Braille). Uses the
// Unicode Braille Patterns block (U+2800–U+28FF). Includes the number
// indicator (⠼) and capital indicator (⠠) for ASCII alphanumerics, the
// standard punctuation set, and bidirectional translation.

const LETTERS: Record<string, string> = {
  A: "⠁", B: "⠃", C: "⠉", D: "⠙", E: "⠑", F: "⠋",
  G: "⠛", H: "⠓", I: "⠊", J: "⠚", K: "⠅", L: "⠇",
  M: "⠍", N: "⠝", O: "⠕", P: "⠏", Q: "⠟", R: "⠗",
  S: "⠎", T: "⠞", U: "⠥", V: "⠧", W: "⠺", X: "⠭",
  Y: "⠽", Z: "⠵",
};

// Digits use the same dot patterns as A-J but prefixed with the number sign ⠼.
const DIGITS: Record<string, string> = {
  "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
  "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚",
};

const PUNCTUATION: Record<string, string> = {
  ".": "⠲",
  ",": "⠂",
  "?": "⠦",
  "!": "⠖",
  ";": "⠆",
  ":": "⠒",
  "'": "⠄",
  "-": "⠤",
  "(": "⠐⠣",
  ")": "⠐⠜",
  "/": "⠸⠌",
  "\"": "⠐⠦",
  "*": "⠐⠔",
  "@": "⠈⠁",
  "#": "⠼",
};

export const NUMBER_INDICATOR = "⠼";
export const CAPITAL_INDICATOR = "⠠";

// Reverse map — pattern → ASCII letter.
const PATTERN_TO_LETTER: Record<string, string> = {};
for (const [k, v] of Object.entries(LETTERS)) PATTERN_TO_LETTER[v] = k;

const PATTERN_TO_DIGIT: Record<string, string> = {};
for (const [k, v] of Object.entries(DIGITS)) PATTERN_TO_DIGIT[v] = k;

const PATTERN_TO_PUNCT: Record<string, string> = {};
for (const [k, v] of Object.entries(PUNCTUATION)) {
  if (v.length === 1) PATTERN_TO_PUNCT[v] = k;
}

export interface BrailleOptions {
  /** Use the ⠠ capital indicator before uppercase letters. */
  capitalIndicator: boolean;
  /** Surround the output with the Grade 1 indicator ⠰ for clarity. */
  grade1Indicator: boolean;
}

export const DEFAULT_BRAILLE_OPTIONS: BrailleOptions = {
  capitalIndicator: true,
  grade1Indicator: false,
};

export function textToBraille(input: string, opt: BrailleOptions = DEFAULT_BRAILLE_OPTIONS): string {
  let out = "";
  let inDigits = false;
  for (const ch of input) {
    if (/[A-Z]/.test(ch)) {
      if (opt.capitalIndicator) out += CAPITAL_INDICATOR;
      out += LETTERS[ch];
      inDigits = false;
      continue;
    }
    if (/[a-z]/.test(ch)) {
      out += LETTERS[ch.toUpperCase()];
      inDigits = false;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      if (!inDigits) out += NUMBER_INDICATOR;
      out += DIGITS[ch];
      inDigits = true;
      continue;
    }
    if (ch === " ") {
      out += "⠀"; // U+2800 BRAILLE PATTERN BLANK
      inDigits = false;
      continue;
    }
    if (ch === "\n") {
      out += "\n";
      inDigits = false;
      continue;
    }
    const punct = PUNCTUATION[ch];
    if (punct) {
      out += punct;
      inDigits = false;
      continue;
    }
    // Unknown — pass through.
    out += ch;
    inDigits = false;
  }
  if (opt.grade1Indicator) out = `⠰⠰⠰ ${out} ⠰⠰⠰`;
  return out;
}

export function brailleToText(input: string): string {
  let out = "";
  let i = 0;
  const chars = [...input];
  let inDigits = false;
  let nextCapital = false;
  while (i < chars.length) {
    const ch = chars[i];
    if (ch === CAPITAL_INDICATOR) {
      nextCapital = true;
      i++;
      continue;
    }
    if (ch === NUMBER_INDICATOR) {
      inDigits = true;
      i++;
      continue;
    }
    if (ch === "⠀") {
      out += " ";
      inDigits = false;
      i++;
      continue;
    }
    if (ch === "\n") {
      out += "\n";
      inDigits = false;
      i++;
      continue;
    }
    // 2-char punctuation pairs first.
    if (i + 1 < chars.length) {
      const pair = ch + chars[i + 1];
      for (const [text, br] of Object.entries(PUNCTUATION)) {
        if (br === pair) {
          out += text;
          i += 2;
          inDigits = false;
          continue;
        }
      }
    }
    // Single-cell punctuation.
    const punct = PATTERN_TO_PUNCT[ch];
    if (punct) {
      out += punct;
      i++;
      inDigits = false;
      continue;
    }
    // In digit mode, use digit mapping; otherwise letter mapping.
    if (inDigits) {
      const d = PATTERN_TO_DIGIT[ch];
      if (d) {
        out += d;
        i++;
        continue;
      }
      // Drop out of digit mode on any non-digit pattern.
      inDigits = false;
    }
    const letter = PATTERN_TO_LETTER[ch];
    if (letter) {
      out += nextCapital ? letter : letter.toLowerCase();
      nextCapital = false;
      i++;
      continue;
    }
    // Unknown — pass through.
    out += ch;
    i++;
  }
  return out;
}

export interface BrailleStats {
  letters: number;
  digits: number;
  punctuation: number;
  cells: number;
  unknown: number;
}

export function statsOf(text: string): BrailleStats {
  let letters = 0, digits = 0, punctuation = 0, unknown = 0;
  for (const ch of text) {
    if (/[A-Za-z]/.test(ch)) letters++;
    else if (/[0-9]/.test(ch)) digits++;
    else if (ch === " " || ch === "\n") continue;
    else if (PUNCTUATION[ch]) punctuation++;
    else unknown++;
  }
  const braille = textToBraille(text);
  const cells = [...braille].filter((c) => /[⠀-⣿]/.test(c)).length;
  return { letters, digits, punctuation, cells, unknown };
}

// Display map for the reference table (only the most-used set).
export const BRAILLE_REFERENCE = {
  letters: LETTERS,
  digits: DIGITS,
  punctuation: PUNCTUATION,
  indicators: {
    "Capital": CAPITAL_INDICATOR,
    "Number": NUMBER_INDICATOR,
    "Space": "⠀",
  },
};
