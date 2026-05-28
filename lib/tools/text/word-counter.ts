// Text analysis engine: counts, readability, keyword density, passive voice
// and text-cleaning utilities. Pure functions, no external dependencies.

export const READING_WPM = 200;
export const SPEAKING_WPM = 130;

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number; // minutes
  speakingTime: number; // minutes
  avgWordLength: number;
  avgSentenceLength: number; // words per sentence
  longestWord: string;
  shortestWord: string;
  uniqueWords: number;
  lexicalDiversity: number; // 0..1
  syllables: number;
}

const WORD_RE = /[A-Za-z0-9]+(?:[''-][A-Za-z0-9]+)*/g;

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(WORD_RE) ?? []).filter(Boolean);
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function countSyllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  w = w.replace(/^y/, "");
  const groups = w.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

export function analyzeText(text: string): TextStats {
  const words = countWords(text);
  const tokens = tokenize(text);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Sentences
  let sentences = 0;
  if (words > 0) {
    const ended = text.match(/[^.!?…]+[.!?…]+/g) ?? [];
    sentences = ended.length;
    const remainder = text.replace(/[^.!?…]+[.!?…]+/g, "").trim();
    if (remainder.length) sentences += 1;
    if (sentences === 0) sentences = 1;
  }

  // Paragraphs
  const paragraphs = text.trim()
    ? text.trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length || 1
    : 0;

  const lines = text === "" ? 0 : text.split(/\n/).length;

  let longestWord = "";
  let shortestWord = "";
  let totalLen = 0;
  let syllables = 0;
  for (const tk of tokens) {
    totalLen += tk.length;
    syllables += countSyllables(tk);
    if (tk.length > longestWord.length) longestWord = tk;
    if (!shortestWord || tk.length < shortestWord.length) shortestWord = tk;
  }

  const unique = new Set(tokens);

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTime: words / READING_WPM,
    speakingTime: words / SPEAKING_WPM,
    avgWordLength: tokens.length ? totalLen / tokens.length : 0,
    avgSentenceLength: sentences ? words / sentences : 0,
    longestWord,
    shortestWord,
    uniqueWords: unique.size,
    lexicalDiversity: tokens.length ? unique.size / tokens.length : 0,
    syllables,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0s";
  const totalSeconds = Math.round(minutes * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m}m ${s}s`;
}

// ─── Readability ─────────────────────────────────────────────────────────────

export type ReadBand = "easy" | "medium" | "advanced" | "professional";

export interface Readability {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  educationLevel: string;
  band: ReadBand;
  bandLabel: string;
  hasEnough: boolean;
}

export function readability(text: string, stats?: TextStats): Readability {
  const s = stats ?? analyzeText(text);
  const tokens = tokenize(text);
  const words = s.words;
  const sentences = Math.max(1, s.sentences);
  const syllables = s.syllables;
  const complexWords = tokens.filter((t) => countSyllables(t) >= 3).length;

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = words ? syllables / words : 0;

  const fre = words
    ? 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    : 0;
  const fkg = words
    ? 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
    : 0;
  const fog = words ? 0.4 * (wordsPerSentence + 100 * (complexWords / words)) : 0;

  const fleschReadingEase = clamp(round(fre, 1), 0, 100);
  const fleschKincaidGrade = Math.max(0, round(fkg, 1));
  const gunningFog = Math.max(0, round(fog, 1));

  let band: ReadBand = "medium";
  let bandLabel = "Standard";
  if (fleschReadingEase >= 70) { band = "easy"; bandLabel = "Easy to read"; }
  else if (fleschReadingEase >= 50) { band = "medium"; bandLabel = "Fairly readable"; }
  else if (fleschReadingEase >= 30) { band = "advanced"; bandLabel = "Fairly difficult"; }
  else { band = "professional"; bandLabel = "Very difficult"; }

  const grade = fleschKincaidGrade;
  let educationLevel = "Professional";
  if (grade < 6) educationLevel = "5th grade — very easy";
  else if (grade < 9) educationLevel = "Middle school";
  else if (grade < 13) educationLevel = "High school";
  else if (grade < 16) educationLevel = "College";
  else educationLevel = "College graduate";

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    educationLevel,
    band,
    bandLabel,
    hasEnough: words >= 25,
  };
}

// ─── Keyword density ─────────────────────────────────────────────────────────

export interface Keyword {
  term: string;
  count: number;
  percent: number;
}

export const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","been","being","but","by","for","from",
  "had","has","have","he","her","here","hers","him","his","how","i","if","in",
  "into","is","it","its","just","me","my","no","not","of","on","or","our","out",
  "over","own","so","some","such","than","that","the","their","them","then",
  "there","these","they","this","to","too","under","up","very","was","we","were",
  "what","when","where","which","while","who","why","will","with","you","your",
  "yours","do","does","did","done","can","could","would","should","may","might",
  "must","shall","about","after","again","all","also","am","because","before",
  "between","both","down","during","each","few","more","most","off","only","other",
]);

export function keywordDensity(
  text: string,
  gram: 1 | 2 = 1,
  limit = 8,
): Keyword[] {
  const tokens = tokenize(text).filter((t) => !/^\d+$/.test(t));
  if (!tokens.length) return [];

  const counts = new Map<string, number>();
  if (gram === 1) {
    for (const t of tokens) {
      if (t.length < 2 || STOPWORDS.has(t)) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  } else {
    for (let i = 0; i < tokens.length - 1; i++) {
      const a = tokens[i];
      const b = tokens[i + 1];
      if (STOPWORDS.has(a) || STOPWORDS.has(b)) continue;
      if (a.length < 2 || b.length < 2) continue;
      const phrase = `${a} ${b}`;
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }

  const denom = gram === 1 ? tokens.length : Math.max(1, tokens.length - 1);
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count, percent: (count / denom) * 100 }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, limit);
}

// Words repeated more than `min` times (excluding stopwords) — overuse signal.
export function repeatedWords(text: string, min = 4): Keyword[] {
  return keywordDensity(text, 1, 100).filter((k) => k.count >= min);
}

// ─── Passive voice (heuristic estimate) ──────────────────────────────────────

const IRREGULAR_PARTICIPLES =
  "done|made|seen|known|given|taken|written|built|held|told|found|kept|left|sent|brought|bought|caught|taught|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|gotten|hidden|paid|put|read|run|said|set|shown|spoken|stolen|won";

const PASSIVE_RE = new RegExp(
  `\\b(?:am|is|are|was|were|be|been|being)\\b\\s+(?:\\w+ly\\s+)?(?:\\w+ed|${IRREGULAR_PARTICIPLES})\\b`,
  "gi",
);

export function passiveVoiceCount(text: string): number {
  return (text.match(PASSIVE_RE) ?? []).length;
}

// ─── Text cleaning utilities ─────────────────────────────────────────────────

export function removeExtraSpaces(t: string): string {
  return t.replace(/[ \t]{2,}/g, " ").replace(/ +\n/g, "\n");
}
export function trimWhitespace(t: string): string {
  return t.split("\n").map((l) => l.trim()).join("\n").trim();
}
export function removeLineBreaks(t: string): string {
  return t.replace(/\s*\n\s*/g, " ").replace(/[ \t]{2,}/g, " ").trim();
}
export function removeDuplicateLines(t: string): string {
  const seen = new Set<string>();
  return t
    .split("\n")
    .filter((line) => {
      const key = line.trim();
      if (key === "") return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}
export function toUpper(t: string): string {
  return t.toUpperCase();
}
export function toLower(t: string): string {
  return t.toLowerCase();
}
export function toTitleCase(t: string): string {
  return t.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
export function toSentenceCase(t: string): string {
  const lower = t.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s+\w|\n\s*\w)/g, (m) => m.toUpperCase());
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round(n: number, d = 0): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
