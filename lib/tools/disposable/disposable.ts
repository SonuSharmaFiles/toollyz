// Disposable-password engine for the Toollyz Disposable Password Generator.
// Static-site honest framing: passwords are generated locally with
// crypto.getRandomValues and can auto-clear from the screen after a timeout.
// There is no server-side expiry — for cross-device sharing, use a real
// secrets manager.

export interface DisposableOptions {
  length: number;
  /** Word-style: groups of 4 chars separated by hyphens for easier dictation. */
  grouped: boolean;
  includeUpper: boolean;
  includeLower: boolean;
  includeDigits: boolean;
  includeSymbols: boolean;
  /** Avoid confusable characters like I, l, 1, O, 0. */
  avoidConfusables: boolean;
}

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%&*?+-=";
const CONFUSABLE = /[Il1O0]/g;

export interface DisposableResult {
  password: string;
  entropyBits: number;
  alphabetSize: number;
}

function secureIndices(count: number, bound: number): number[] {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("crypto.getRandomValues unavailable — refusing to fall back.");
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

export function buildAlphabet(opts: DisposableOptions): string {
  let alphabet = "";
  if (opts.includeUpper) alphabet += UPPER;
  if (opts.includeLower) alphabet += LOWER;
  if (opts.includeDigits) alphabet += DIGITS;
  if (opts.includeSymbols) alphabet += SYMBOLS;
  if (opts.avoidConfusables) alphabet = alphabet.replace(CONFUSABLE, "");
  // De-dupe (in case a class overlaps with another after removing confusables).
  return Array.from(new Set(alphabet)).join("");
}

export function generate(opts: DisposableOptions): DisposableResult {
  const alphabet = buildAlphabet(opts);
  if (!alphabet) throw new Error("Pick at least one character class.");
  const length = Math.max(4, Math.min(128, Math.round(opts.length)));
  const idxs = secureIndices(length, alphabet.length);
  let pw = idxs.map((i) => alphabet[i]).join("");
  if (opts.grouped) {
    pw = pw.match(/.{1,4}/g)?.join("-") ?? pw;
  }
  return {
    password: pw,
    entropyBits: Math.round(length * Math.log2(alphabet.length) * 10) / 10,
    alphabetSize: alphabet.length,
  };
}

/** Return a description like "uppercase + lowercase + digits". */
export function describeClasses(opts: DisposableOptions): string {
  const parts: string[] = [];
  if (opts.includeUpper) parts.push("uppercase");
  if (opts.includeLower) parts.push("lowercase");
  if (opts.includeDigits) parts.push("digits");
  if (opts.includeSymbols) parts.push("symbols");
  return parts.join(" + ") || "(none)";
}
