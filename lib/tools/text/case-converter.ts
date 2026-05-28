// Text case transformations + extra formatting utilities. Pure functions.
// Letter-case styles preserve whitespace/punctuation; developer styles
// tokenize each line into words and join with the relevant separator.

export type CaseGroup = "Writing" | "Developer";

export interface CaseDef {
  id: string;
  label: string;
  group: CaseGroup;
  desc: string;
}

export const CASES: CaseDef[] = [
  { id: "upper", label: "UPPERCASE", group: "Writing", desc: "Every letter capitalized — for emphasis and acronyms." },
  { id: "lower", label: "lowercase", group: "Writing", desc: "Every letter in lower case." },
  { id: "title", label: "Title Case", group: "Writing", desc: "First letter of each word capitalized — for headlines." },
  { id: "sentence", label: "Sentence case", group: "Writing", desc: "First letter of each sentence capitalized." },
  { id: "capitalize", label: "Capitalized Case", group: "Writing", desc: "First letter of every word up, rest unchanged." },
  { id: "alternating", label: "aLtErNaTiNg", group: "Writing", desc: "Alternating lower and upper letters." },
  { id: "inverse", label: "InVeRsE", group: "Writing", desc: "Swap the case of every letter." },
  { id: "camel", label: "camelCase", group: "Developer", desc: "First word lower, others capitalized, no spaces." },
  { id: "pascal", label: "PascalCase", group: "Developer", desc: "Every word capitalized, no spaces." },
  { id: "snake", label: "snake_case", group: "Developer", desc: "Lowercase words joined by underscores." },
  { id: "kebab", label: "kebab-case", group: "Developer", desc: "Lowercase words joined by hyphens." },
  { id: "constant", label: "CONSTANT_CASE", group: "Developer", desc: "Uppercase words joined by underscores." },
  { id: "dot", label: "dot.case", group: "Developer", desc: "Lowercase words joined by dots." },
  { id: "path", label: "path/case", group: "Developer", desc: "Lowercase words joined by slashes." },
  { id: "header", label: "Header-Case", group: "Developer", desc: "Capitalized words joined by hyphens (Train-Case)." },
];

export const CASE_BY_ID: Record<string, CaseDef> = Object.fromEntries(
  CASES.map((c) => [c.id, c]),
);

export const DEVELOPER_CASE_IDS = CASES.filter((c) => c.group === "Developer").map((c) => c.id);

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Split any input style (camelCase, snake_case, "spaced", etc.) into words.
export function splitWords(input: string): string[] {
  const cleaned = input
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ");
  return cleaned.trim().split(/\s+/).filter(Boolean);
}

function perLine(text: string, fn: (line: string) => string): string {
  return text.split("\n").map(fn).join("\n");
}

function titleCase(text: string): string {
  return text.replace(/\b\w[\w']*/g, (w) => cap(w));
}

function capitalizeEach(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

function sentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w|\n\s*\w)/g, (m) => m.toUpperCase());
}

function alternating(text: string): string {
  let i = 0;
  return text.replace(/[a-z]/gi, (ch) => {
    const out = i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
    i++;
    return out;
  });
}

function inverse(text: string): string {
  return text.replace(/[a-z]/gi, (ch) =>
    ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase(),
  );
}

function devCase(text: string, join: string, transform: (w: string, i: number) => string): string {
  return perLine(text, (line) => {
    const words = splitWords(line);
    if (!words.length) return line.trim() === "" ? "" : line;
    return words.map(transform).join(join);
  });
}

export function convertCase(text: string, id: string): string {
  if (!text) return "";
  switch (id) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return titleCase(text);
    case "sentence": return sentenceCase(text);
    case "capitalize": return capitalizeEach(text);
    case "alternating": return alternating(text);
    case "inverse": return inverse(text);
    case "camel":
      return devCase(text, "", (w, i) => (i === 0 ? w.toLowerCase() : cap(w)));
    case "pascal":
      return devCase(text, "", (w) => cap(w));
    case "snake":
      return devCase(text, "_", (w) => w.toLowerCase());
    case "kebab":
      return devCase(text, "-", (w) => w.toLowerCase());
    case "constant":
      return devCase(text, "_", (w) => w.toUpperCase());
    case "dot":
      return devCase(text, ".", (w) => w.toLowerCase());
    case "path":
      return devCase(text, "/", (w) => w.toLowerCase());
    case "header":
      return devCase(text, "-", (w) => cap(w));
    default:
      return text;
  }
}

// ─── Extra utilities ─────────────────────────────────────────────────────────

export function reverseText(text: string): string {
  return [...text].reverse().join("");
}

export function sortLines(text: string, dir: "asc" | "desc" = "asc"): string {
  const lines = text.split("\n");
  lines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  if (dir === "desc") lines.reverse();
  return lines.join("\n");
}

export function removeSpecialChars(text: string): string {
  return text.replace(/[^\p{L}\p{N}\s]/gu, "");
}

export function normalizeSpacing(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
