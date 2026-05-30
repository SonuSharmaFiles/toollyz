// Cryptographic hash engine for the Toollyz Hash Generator. SHA-1, SHA-256,
// SHA-384 and SHA-512 use the browser's built-in Web Crypto SubtleCrypto;
// MD5 uses the open-source spark-md5 library because Web Crypto explicitly
// doesn't ship MD5 (it's considered broken for cryptographic use). HMAC
// variants of every SHA algorithm are also supported.

import SparkMD5 from "spark-md5";

export type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
export const ALGORITHMS: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const TEXT_ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < view.length; i++) {
    out += view[i].toString(16).padStart(2, "0");
  }
  return out;
}

/** Hash an in-memory string with the given algorithm. */
export async function hashString(text: string, alg: Algorithm): Promise<string> {
  if (alg === "MD5") {
    return SparkMD5.hash(text);
  }
  if (!TEXT_ENCODER || typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(`${alg} requires a browser with the Web Crypto API.`);
  }
  const buf = TEXT_ENCODER.encode(text);
  const out = await crypto.subtle.digest(alg, buf);
  return toHex(out);
}

/** HMAC-<algo> over (text) with the given key string. */
export async function hmacString(text: string, key: string, alg: Algorithm): Promise<string> {
  if (alg === "MD5") {
    // HMAC-MD5 (RFC 2104) over short messages.
    return hmacMd5(text, key);
  }
  if (!TEXT_ENCODER || typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(`HMAC-${alg} requires a browser with the Web Crypto API.`);
  }
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(key),
    { name: "HMAC", hash: alg },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, TEXT_ENCODER.encode(text));
  return toHex(sig);
}

function hmacMd5(message: string, key: string): string {
  // RFC 2104 over MD5 using spark-md5. Block size = 64 bytes.
  const enc = TEXT_ENCODER ?? new TextEncoder();
  let kBytes = enc.encode(key);
  if (kBytes.length > 64) {
    kBytes = new Uint8Array(SparkMD5.ArrayBuffer.hash(kBytes.buffer, true) as unknown as ArrayBuffer);
  }
  if (kBytes.length < 64) {
    const padded = new Uint8Array(64);
    padded.set(kBytes);
    kBytes = padded;
  }
  const oPad = new Uint8Array(64);
  const iPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oPad[i] = kBytes[i] ^ 0x5c;
    iPad[i] = kBytes[i] ^ 0x36;
  }
  const inner = new Uint8Array(64 + message.length);
  inner.set(iPad, 0);
  inner.set(enc.encode(message), 64);
  const innerHash = new Uint8Array(SparkMD5.ArrayBuffer.hash(inner.buffer, true) as unknown as ArrayBuffer);
  const outer = new Uint8Array(64 + 16);
  outer.set(oPad, 0);
  outer.set(innerHash, 64);
  return SparkMD5.ArrayBuffer.hash(outer.buffer);
}

/** Hash a File using a stream. SHA-* runs on the full ArrayBuffer (Web
 * Crypto doesn't support streaming); MD5 streams through SparkMD5. */
export async function hashFile(
  file: File,
  alg: Algorithm,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (alg === "MD5") {
    return hashFileMd5(file, onProgress);
  }
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(`${alg} requires a browser with the Web Crypto API.`);
  }
  const buf = await file.arrayBuffer();
  onProgress?.(50);
  const out = await crypto.subtle.digest(alg, buf);
  onProgress?.(100);
  return toHex(out);
}

async function hashFileMd5(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const chunkSize = 2 * 1024 * 1024;
  const spark = new SparkMD5.ArrayBuffer();
  const total = file.size;
  let offset = 0;
  while (offset < total) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, total));
    const buf = await chunk.arrayBuffer();
    spark.append(buf);
    offset += buf.byteLength;
    onProgress?.(Math.round((offset / total) * 100));
  }
  return spark.end();
}

export interface HashTriple {
  algorithm: Algorithm;
  hex: string;
}

export async function hashStringAll(text: string, opts: { algorithms?: Algorithm[]; hmacKey?: string }): Promise<HashTriple[]> {
  const list = opts.algorithms ?? ALGORITHMS;
  const out: HashTriple[] = [];
  for (const alg of list) {
    const hex = opts.hmacKey?.trim()
      ? await hmacString(text, opts.hmacKey, alg)
      : await hashString(text, alg);
    out.push({ algorithm: alg, hex });
  }
  return out;
}

export function formatHex(hex: string, casing: "upper" | "lower"): string {
  return casing === "upper" ? hex.toUpperCase() : hex.toLowerCase();
}

export function isHexEqualCaseInsensitive(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
