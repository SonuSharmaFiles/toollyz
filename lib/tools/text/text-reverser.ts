// Text Reverser engine. Pure, Unicode-aware string transforms used by the
// /tools/text-reverser component. Splitting via [...text] keeps surrogate
// pairs (emoji, astral-plane glyphs) intact when we flip characters.

export type ReverseMode =
  | "chars" // entire string reversed character-by-character
  | "words" // word order reversed; words themselves unchanged
  | "lines" // line order reversed
  | "each-word" // each word's characters reversed; word order kept
  | "each-line" // each line's characters reversed; line order kept
  | "mirror" // map ASCII letters to their right-to-left mirror glyph
  | "upside-down" // upside-down Unicode lookalikes
  | "alternate-case"; // toggle case per char after reversing

const WORD_RE = /(\s+)/; // capturing split keeps the spaces between tokens

function reverseChars(text: string): string {
  return [...text].reverse().join("");
}

function reverseLines(text: string): string {
  return text.split("\n").reverse().join("\n");
}

function reverseWords(text: string): string {
  // Per-line so a trailing newline isn't lost and indentation stays meaningful.
  return text
    .split("\n")
    .map((line) => {
      const parts = line.split(WORD_RE);
      const words = parts.filter((p) => p && !/^\s+$/.test(p));
      const spaces = parts.filter((p) => /^\s+$/.test(p));
      words.reverse();
      // Re-interleave: if line starts with whitespace keep it leading.
      let out = "";
      let wi = 0;
      let si = 0;
      const leadingSpace = parts[0] && /^\s+$/.test(parts[0]);
      if (leadingSpace) {
        out += spaces[si++] ?? "";
      }
      while (wi < words.length || si < spaces.length) {
        if (wi < words.length) out += words[wi++];
        if (si < spaces.length) out += spaces[si++];
      }
      return out;
    })
    .join("\n");
}

function reverseEachWord(text: string): string {
  return text.replace(/\S+/g, (w) => reverseChars(w));
}

function reverseEachLine(text: string): string {
  return text.split("\n").map(reverseChars).join("\n");
}

// Mathematical "reversed" / mirror letterforms. Falls through to identity
// when a glyph has no widely-supported mirror.
const MIRROR_MAP: Record<string, string> = {
  A: "Ɐ", B: "ꓭ", C: "Ↄ", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H", I: "I",
  J: "ſ", K: "ꓘ", L: "⅃", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Ò", R: "ꓤ",
  S: "S", T: "⊥", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ı",
  j: "ɾ", k: "ʞ", l: "ʃ", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ",
  s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ",
  "8": "8", "9": "6", "0": "0", ".": "˙", ",": "‘", "?": "¿", "!": "¡",
  "'": ",", '"': ",,", "(": ")", ")": "(", "[": "]", "]": "[", "{": "}",
  "}": "{", "<": ">", ">": "<", "&": "⅋", "_": "‾",
};

function flipUpsideDown(text: string): string {
  return [...text].reverse().map((ch) => MIRROR_MAP[ch] ?? ch).join("");
}

function mirrorText(text: string): string {
  // True mirror: keep order but swap each glyph for its horizontal mirror.
  return [...text].map((ch) => MIRROR_MAP[ch] ?? ch).join("");
}

function alternateCase(text: string): string {
  const reversed = reverseChars(text);
  let i = 0;
  return reversed.replace(/[a-zA-Z]/g, (ch) => {
    const out = i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
    i++;
    return out;
  });
}

export function reverseText(text: string, mode: ReverseMode): string {
  if (!text) return "";
  switch (mode) {
    case "chars":
      return reverseChars(text);
    case "words":
      return reverseWords(text);
    case "lines":
      return reverseLines(text);
    case "each-word":
      return reverseEachWord(text);
    case "each-line":
      return reverseEachLine(text);
    case "mirror":
      return mirrorText(text);
    case "upside-down":
      return flipUpsideDown(text);
    case "alternate-case":
      return alternateCase(text);
  }
}

export interface ReverseMeta {
  id: ReverseMode;
  label: string;
  description: string;
  exampleInput: string;
  exampleOutput: string;
}

export const REVERSE_MODES: ReverseMeta[] = [
  {
    id: "chars",
    label: "All characters",
    description: "Reverse the whole string, end → start.",
    exampleInput: "hello",
    exampleOutput: "olleh",
  },
  {
    id: "words",
    label: "Word order",
    description: "Reverse the order of words; each word stays intact.",
    exampleInput: "the quick brown fox",
    exampleOutput: "fox brown quick the",
  },
  {
    id: "lines",
    label: "Line order",
    description: "Reverse the order of lines top-to-bottom.",
    exampleInput: "one\ntwo\nthree",
    exampleOutput: "three\ntwo\none",
  },
  {
    id: "each-word",
    label: "Each word",
    description: "Reverse the characters inside every word.",
    exampleInput: "the quick fox",
    exampleOutput: "eht kciuq xof",
  },
  {
    id: "each-line",
    label: "Each line",
    description: "Reverse the characters inside every line.",
    exampleInput: "one\ntwo",
    exampleOutput: "eno\nowt",
  },
  {
    id: "mirror",
    label: "Mirror text",
    description: "Swap each letter for its right-to-left mirror glyph.",
    exampleInput: "ABC",
    exampleOutput: "ⒶBC".replace("Ⓐ", "Ɐ"),
  },
  {
    id: "upside-down",
    label: "Upside-down",
    description: "Reverse + Unicode upside-down lookalikes.",
    exampleInput: "hello",
    exampleOutput: "oʃʃǝɥ",
  },
  {
    id: "alternate-case",
    label: "Reverse + AlTeRnAtE",
    description: "Reverse the string then flip case every other letter.",
    exampleInput: "hello world",
    exampleOutput: "DlRoW OlLeH",
  },
];

export interface ReverseStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
}

export function statsOf(text: string): ReverseStats {
  const chars = [...text].length;
  const charsNoSpaces = [...text.replace(/\s/g, "")].length;
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const lines = text === "" ? 0 : text.split("\n").length;
  return { chars, charsNoSpaces, words, lines };
}
