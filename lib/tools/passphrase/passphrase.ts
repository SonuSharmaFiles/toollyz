// Passphrase engine for the Toollyz Random Password Phrase Generator. Uses
// the existing curated 1646-word list at lib/tools/password/words.ts, with
// added case styles, separators, optional digit/symbol suffix and entropy
// math. crypto.getRandomValues is required — no Math.random fallback.

import { PASSPHRASE_WORDS } from "@/lib/tools/password/words";

export type CaseStyle = "lower" | "Title" | "UPPER" | "camel";

export interface PassphraseOptions {
  wordCount: number;
  separator: string;
  caseStyle: CaseStyle;
  /** Append a random 1-4 digit number to the end. */
  appendDigits: number; // 0–4 digits
  /** Append a random symbol from a curated safe set. */
  appendSymbol: boolean;
}

export const SAFE_SYMBOLS = "!@#$%&*?+-=";

function secureIndices(count: number, bound: number): number[] {
  // Rejection sampling to avoid modulo bias.
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("crypto.getRandomValues unavailable — refusing to fall back to Math.random.");
  }
  const out: number[] = [];
  const maxMultiple = Math.floor(0xffffffff / bound) * bound;
  while (out.length < count) {
    const block = new Uint32Array(Math.max(16, count - out.length));
    crypto.getRandomValues(block);
    for (let i = 0; i < block.length && out.length < count; i++) {
      const v = block[i];
      if (v < maxMultiple) out.push(v % bound);
    }
  }
  return out;
}

export function casify(word: string, style: CaseStyle, indexInPhrase: number): string {
  const w = word.toLowerCase();
  switch (style) {
    case "Title":
      return w[0].toUpperCase() + w.slice(1);
    case "UPPER":
      return w.toUpperCase();
    case "camel":
      return indexInPhrase === 0 ? w : w[0].toUpperCase() + w.slice(1);
    case "lower":
    default:
      return w;
  }
}

function randomDigits(count: number): string {
  if (count <= 0) return "";
  const out: string[] = [];
  const idxs = secureIndices(count, 10);
  for (const i of idxs) out.push(String(i));
  return out.join("");
}

function randomSymbol(): string {
  const idx = secureIndices(1, SAFE_SYMBOLS.length)[0];
  return SAFE_SYMBOLS[idx];
}

export interface PassphraseResult {
  text: string;
  /** Bits of entropy in the word component alone. */
  wordEntropyBits: number;
  /** Bits added by appended digits + symbols. */
  appendEntropyBits: number;
  totalEntropyBits: number;
}

export function generate(opts: PassphraseOptions): PassphraseResult {
  const wordCount = Math.max(2, Math.min(16, Math.round(opts.wordCount)));
  const idxs = secureIndices(wordCount, PASSPHRASE_WORDS.length);
  const words = idxs.map((i, k) => casify(PASSPHRASE_WORDS[i], opts.caseStyle, k));
  let text = words.join(opts.caseStyle === "camel" ? "" : opts.separator);
  const digitCount = Math.max(0, Math.min(4, opts.appendDigits));
  if (digitCount > 0) text += randomDigits(digitCount);
  if (opts.appendSymbol) text += randomSymbol();
  const wordEntropyBits = wordCount * Math.log2(PASSPHRASE_WORDS.length);
  const appendEntropyBits =
    digitCount * Math.log2(10) + (opts.appendSymbol ? Math.log2(SAFE_SYMBOLS.length) : 0);
  return {
    text,
    wordEntropyBits: Math.round(wordEntropyBits * 10) / 10,
    appendEntropyBits: Math.round(appendEntropyBits * 10) / 10,
    totalEntropyBits: Math.round((wordEntropyBits + appendEntropyBits) * 10) / 10,
  };
}

export function entropyBand(bits: number): { label: string; color: string; tone: "rose" | "amber" | "emerald" | "sky" } {
  if (bits < 40) return { label: "Weak — easy to crack offline", color: "text-rose-700 dark:text-rose-400", tone: "rose" };
  if (bits < 60) return { label: "Fair — fine for casual sites", color: "text-amber-700 dark:text-amber-400", tone: "amber" };
  if (bits < 80) return { label: "Strong — solid against most attacks", color: "text-emerald-700 dark:text-emerald-400", tone: "emerald" };
  return { label: "Excellent — long-term safe", color: "text-sky-700 dark:text-sky-400", tone: "sky" };
}

export const WORDLIST_SIZE = PASSPHRASE_WORDS.length;
