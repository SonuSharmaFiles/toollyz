// NATO Phonetic Alphabet (1956 ICAO/NATO standard) translator. Includes
// the numbers spelled phonetically (Wun, Too, Tree, Fower, Fife, Six,
// Seven, Eight, Niner, Zero) and a handful of common punctuation tokens
// for plain voice spelling.

export const NATO: Record<string, string> = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
  "0": "Zero",
  "1": "Wun",
  "2": "Too",
  "3": "Tree",
  "4": "Fower",
  "5": "Fife",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Niner",
  ".": "Stop",
  ",": "Comma",
  "?": "Question",
  "!": "Exclamation",
  "@": "At",
  "/": "Slash",
  "-": "Dash",
  "_": "Underscore",
  "+": "Plus",
  "&": "Ampersand",
  ":": "Colon",
  ";": "Semicolon",
  '"': "Quote",
  "'": "Apostrophe",
};

const NATO_REVERSE: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [k, v] of Object.entries(NATO)) m[v.toLowerCase()] = k;
  // Common spelling variants — accept both the strict NATO form and
  // the common pronunciation form.
  const aliases: Record<string, string> = {
    juliet: "J",
    juliette: "J",
    xray: "X",
    "x ray": "X",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    nine: "9",
    period: ".",
    dot: ".",
    "full stop": ".",
    dash: "-",
    hyphen: "-",
  };
  for (const [k, v] of Object.entries(aliases)) m[k.toLowerCase()] = v;
  return m;
})();

export interface NatoOptions {
  /** Drop unknown characters silently instead of leaving them in. */
  dropUnknown: boolean;
  /** Show punctuation entries (.,?,!,@,/,-,…) in addition to letters/digits. */
  includePunctuation: boolean;
  /** Join character: " ", " - ", "-", " · ". */
  joiner: string;
  /** Preserve case in the output (uppercased always by NATO standard). */
  uppercase: boolean;
}

export const DEFAULT_NATO_OPTIONS: NatoOptions = {
  dropUnknown: false,
  includePunctuation: true,
  joiner: " ",
  uppercase: false,
};

export function textToNato(text: string, opt: NatoOptions = DEFAULT_NATO_OPTIONS): string[] {
  const words: string[] = [];
  for (const ch of text) {
    if (ch === " ") {
      words.push("(space)");
      continue;
    }
    if (ch === "\n") {
      words.push("(newline)");
      continue;
    }
    const lookup = NATO[ch.toUpperCase()];
    if (lookup) {
      // Drop punctuation if requested.
      const isPunct = /[^A-Z0-9]/.test(ch.toUpperCase());
      if (isPunct && !opt.includePunctuation) continue;
      words.push(opt.uppercase ? lookup.toUpperCase() : lookup);
    } else if (!opt.dropUnknown) {
      words.push(`(?${ch})`);
    }
  }
  return words;
}

export function joinNato(words: string[], joiner: string): string {
  return words.join(joiner);
}

export function natoToText(input: string): string {
  // Tokenise by whitespace / dashes / dots, drop punctuation between tokens.
  return input
    .split(/[\s\-·,]+/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .map((w) => NATO_REVERSE[w] ?? `?${w}?`)
    .join("");
}

export interface NatoStats {
  letters: number;
  digits: number;
  punctuation: number;
  unknown: number;
}

export function statsOf(text: string): NatoStats {
  const stats: NatoStats = { letters: 0, digits: 0, punctuation: 0, unknown: 0 };
  for (const ch of text) {
    if (ch === " " || ch === "\n") continue;
    const up = ch.toUpperCase();
    if (/[A-Z]/.test(up)) stats.letters++;
    else if (/[0-9]/.test(up)) stats.digits++;
    else if (NATO[up]) stats.punctuation++;
    else stats.unknown++;
  }
  return stats;
}

export const JOINERS = [
  { id: "space", label: "Space", value: " " },
  { id: "dash", label: "Dash", value: " - " },
  { id: "hyphen", label: "Hyphen", value: "-" },
  { id: "dot", label: "Middle dot", value: " · " },
  { id: "comma", label: "Comma", value: ", " },
];
