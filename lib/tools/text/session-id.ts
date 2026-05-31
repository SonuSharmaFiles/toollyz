// Session ID Generator engine. Produces high-entropy random session tokens
// via crypto.getRandomValues, then encodes to hex / base64 / base64url. Pure
// helpers, no React, no side effects.

export type SessionEncoding = "hex" | "base64" | "base64url" | "alphanumeric";

export interface SessionMeta {
  id: SessionEncoding;
  label: string;
  hint: string;
  charsPerByte: number;
}

export const ENCODINGS: SessionMeta[] = [
  { id: "hex", label: "Hexadecimal", hint: "0–9 a–f · 2 chars per byte · widest compatibility", charsPerByte: 2 },
  { id: "base64", label: "Base64", hint: "A–Z a–z 0–9 + / = · 4 chars per 3 bytes", charsPerByte: 4 / 3 },
  { id: "base64url", label: "Base64 URL-safe", hint: "Drops + / = padding — safe in URLs and cookies", charsPerByte: 4 / 3 },
  { id: "alphanumeric", label: "Alphanumeric", hint: "A–Z a–z 0–9 · best when manually typed", charsPerByte: 0 },
];

function getRandomBytes(n: number): Uint8Array {
  if (typeof crypto === "undefined" || !("getRandomValues" in crypto)) {
    throw new Error("crypto.getRandomValues is not available in this environment.");
  }
  // crypto.getRandomValues caps at 65 536 bytes per call.
  const buf = new Uint8Array(n);
  for (let off = 0; off < n; off += 65_536) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + 65_536, n)));
  }
  return buf;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Crypto-grade alphanumeric using rejection sampling — no modulo bias.
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function toAlphanumeric(targetLength: number): string {
  // 62 chars; we accept bytes < 248 (4 * 62 = 248) and reject the rest so
  // the distribution stays uniform.
  const out: string[] = [];
  while (out.length < targetLength) {
    const buf = getRandomBytes(targetLength * 2);
    for (let i = 0; i < buf.length && out.length < targetLength; i++) {
      if (buf[i] < 248) out.push(ALPHA[buf[i] % 62]);
    }
  }
  return out.join("");
}

export interface SessionOptions {
  /** Output length in CHARACTERS (the byte count is derived from the encoding). */
  length: number;
  encoding: SessionEncoding;
  /** Number of tokens to produce in one batch. */
  count: number;
  /** Prefix prepended to every token (e.g. "sess_"). Not counted toward length. */
  prefix: string;
}

export const DEFAULT_SESSION_OPTIONS: SessionOptions = {
  length: 32,
  encoding: "hex",
  count: 1,
  prefix: "",
};

function bytesForChars(charLen: number, enc: SessionEncoding): number {
  if (enc === "hex") return Math.ceil(charLen / 2);
  if (enc === "alphanumeric") return charLen; // rejection sampling iterates
  // base64 / base64url: 4 chars carry 3 bytes.
  return Math.ceil((charLen * 3) / 4);
}

export function generateSessionId(opt: SessionOptions = DEFAULT_SESSION_OPTIONS): string {
  const charLen = Math.max(1, opt.length);
  if (opt.encoding === "alphanumeric") {
    return `${opt.prefix}${toAlphanumeric(charLen)}`;
  }
  const bytes = getRandomBytes(bytesForChars(charLen, opt.encoding));
  let token: string;
  if (opt.encoding === "hex") token = toHex(bytes).slice(0, charLen);
  else if (opt.encoding === "base64") token = toBase64(bytes).slice(0, charLen);
  else token = toBase64Url(bytes).slice(0, charLen);
  return `${opt.prefix}${token}`;
}

export function generateBatch(opt: SessionOptions = DEFAULT_SESSION_OPTIONS): string[] {
  const out: string[] = [];
  for (let i = 0; i < Math.max(1, opt.count); i++) out.push(generateSessionId(opt));
  return out;
}

export interface EntropyStats {
  /** Effective bits of entropy for a token of the configured length. */
  bits: number;
  /** Human readable strength band. */
  band: "weak" | "ok" | "strong" | "overkill";
  /** Years to brute-force at 1e9 attempts/sec — illustrative only. */
  yearsToBruteForce: number;
}

const ALPHABETS: Record<SessionEncoding, number> = {
  hex: 16,
  base64: 64,
  base64url: 64,
  alphanumeric: 62,
};

export function entropyOf(opt: SessionOptions): EntropyStats {
  const alphaSize = ALPHABETS[opt.encoding];
  const bitsPerChar = Math.log2(alphaSize);
  const bits = Math.floor(bitsPerChar * opt.length);
  let band: EntropyStats["band"] = "weak";
  if (bits >= 256) band = "overkill";
  else if (bits >= 128) band = "strong";
  else if (bits >= 80) band = "ok";
  const seconds = Math.pow(2, bits) / 1e9;
  const yearsToBruteForce = seconds / (60 * 60 * 24 * 365);
  return { bits, band, yearsToBruteForce };
}
