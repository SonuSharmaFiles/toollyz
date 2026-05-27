import { MODES, type IpsumMode } from "./vocab";

export type IpsumUnit = "paragraphs" | "sentences" | "words" | "characters";
export type IpsumFormat = "plain" | "html" | "markdown";

export interface IpsumOptions {
  mode: IpsumMode;
  unit: IpsumUnit;
  quantity: number;
  startWithLorem: boolean;
  includeCommas: boolean;
  lineBreaks: boolean;
  format: IpsumFormat;
}

function rng(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildSentence(words: string[], length: number, commas: boolean): string {
  const tokens: string[] = [];
  for (let i = 0; i < length; i++) tokens.push(pick(words));
  tokens[0] = capitalize(tokens[0]);

  if (commas && length > 6) {
    const commaCount = rng(1, Math.min(2, Math.floor(length / 6)));
    const used = new Set<number>();
    for (let c = 0; c < commaCount; c++) {
      let pos = rng(2, length - 3);
      let attempts = 0;
      while (used.has(pos) && attempts < 4) {
        pos = rng(2, length - 3);
        attempts++;
      }
      if (!used.has(pos)) {
        used.add(pos);
        tokens[pos] = tokens[pos] + ",";
      }
    }
  }

  return tokens.join(" ") + ".";
}

function buildParagraph(
  words: string[],
  sentenceCount: number,
  commas: boolean,
  lineBreaks: boolean,
): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(buildSentence(words, rng(6, 14), commas));
  }
  return sentences.join(lineBreaks ? "\n" : " ");
}

function applyFormat(paragraphs: string[], format: IpsumFormat): string {
  if (format === "html") {
    return paragraphs.map((p) => `<p>${p}</p>`).join("\n\n");
  }
  // plain and markdown both use double-newline between paragraphs;
  // markdown is essentially the same for body text.
  return paragraphs.join("\n\n");
}

export function generateIpsum(opts: IpsumOptions): string {
  const mode = MODES[opts.mode];
  const words = mode.words;
  const q = Math.max(1, Math.floor(opts.quantity));

  if (opts.unit === "words") {
    const tokens: string[] = [];
    for (let i = 0; i < q; i++) tokens.push(pick(words));
    if (opts.startWithLorem && opts.mode === "classic") {
      const lead = ["lorem", "ipsum", "dolor", "sit", "amet"];
      for (let i = 0; i < Math.min(lead.length, tokens.length); i++) {
        tokens[i] = lead[i];
      }
    }
    return tokens.join(" ");
  }

  if (opts.unit === "sentences") {
    const sentences: string[] = [];
    if (opts.startWithLorem && opts.mode === "classic") {
      sentences.push(mode.intro ?? buildSentence(words, rng(8, 14), opts.includeCommas));
    }
    while (sentences.length < q) {
      sentences.push(buildSentence(words, rng(6, 14), opts.includeCommas));
    }
    const para = sentences.join(opts.lineBreaks ? "\n" : " ");
    return applyFormat([para], opts.format);
  }

  if (opts.unit === "characters") {
    // Generate ample paragraphs then trim.
    const buf: string[] = [];
    let totalLen = 0;
    while (totalLen < q + 200) {
      const p = buildParagraph(words, rng(3, 6), opts.includeCommas, opts.lineBreaks);
      buf.push(p);
      totalLen += p.length + 2;
    }
    let raw = buf.join("\n\n");
    if (opts.startWithLorem && opts.mode === "classic" && mode.intro) {
      raw = mode.intro + " " + raw.slice(mode.intro.length + 1);
    }
    let trimmed = raw.slice(0, q);
    // try not to cut a word
    const lastSpace = trimmed.lastIndexOf(" ");
    if (q - lastSpace < 12 && lastSpace > 0) {
      trimmed = trimmed.slice(0, lastSpace);
    }
    if (!/[.!?]$/.test(trimmed)) trimmed = trimmed.replace(/[,;]?$/, "") + ".";
    return applyFormat([trimmed], opts.format);
  }

  // paragraphs (default)
  const paragraphs: string[] = [];
  for (let i = 0; i < q; i++) {
    const sentenceCount = rng(3, 7);
    let para = buildParagraph(words, sentenceCount, opts.includeCommas, opts.lineBreaks);
    if (i === 0 && opts.startWithLorem && opts.mode === "classic" && mode.intro) {
      // Replace first sentence with intro
      const rest = para.split(/(?<=[.!?])\s+/).slice(1).join(" ");
      para = `${mode.intro} ${rest}`;
    }
    paragraphs.push(para);
  }
  return applyFormat(paragraphs, opts.format);
}

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
}

export function computeStats(raw: string): TextStats {
  // Strip HTML tags for counting
  const text = raw.replace(/<\/?[^>]+>/g, "").trim();
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingMinutes: 0,
    };
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, "").length;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length || 1;
  const readingMinutes = Math.max(1, Math.round(words / 200));
  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingMinutes };
}
