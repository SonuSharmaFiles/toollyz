// Client-side encryption for the Toollyz Secure Notes tool. AES-256-GCM with
// a PBKDF2-SHA-256-derived key. Encrypted blobs are self-describing and version
// -tagged ("TLZ1.") so they can be decrypted by any future build: the
// iterations, random salt and random IV are all embedded. A fresh IV is used
// for every encryption (never reused under a key). The password is never stored
// and a wrong password is detected for free by the GCM auth tag. Browser-only.

import { base64UrlToBytes, bytesToBase64Url, decodeUtf8, encodeUtf8 } from "@/lib/tools/shared/base64";

export const PBKDF2_ITERATIONS = 250_000;
const VERSION = 1;
const MARKER = "TLZ1.";
const SALT_LEN = 16;
const IV_LEN = 12;
const HEADER_LEN = 1 + 4 + SALT_LEN + IV_LEN; // version + iterations + salt + iv

/** Copy bytes into a fresh ArrayBuffer so Web Crypto accepts them as BufferSource. */
function buf(bytes: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(out).set(bytes);
  return out;
}

function available(): boolean {
  return typeof crypto !== "undefined" && !!crypto.subtle && !!crypto.getRandomValues;
}

export async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", buf(encodeUtf8(password)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: buf(salt), iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function pack(salt: Uint8Array, iterations: number, iv: Uint8Array, ct: Uint8Array): string {
  const packed = new Uint8Array(HEADER_LEN + ct.length);
  packed[0] = VERSION;
  new DataView(packed.buffer).setUint32(1, iterations, false);
  packed.set(salt, 5);
  packed.set(iv, 5 + SALT_LEN);
  packed.set(ct, HEADER_LEN);
  return MARKER + bytesToBase64Url(packed);
}

export interface Unpacked { iterations: number; salt: Uint8Array; iv: Uint8Array; ct: Uint8Array }

export function unpack(blob: string): Unpacked {
  const trimmed = blob.trim();
  if (!trimmed.startsWith(MARKER)) throw new Error("This doesn't look like a Toollyz encrypted note.");
  const packed = base64UrlToBytes(trimmed.slice(MARKER.length));
  if (packed.length < HEADER_LEN || packed[0] !== VERSION) throw new Error("The encrypted data is corrupted or unsupported.");
  const view = new DataView(packed.buffer, packed.byteOffset, packed.byteLength);
  const iterations = view.getUint32(1, false);
  const salt = packed.slice(5, 5 + SALT_LEN);
  const iv = packed.slice(5 + SALT_LEN, HEADER_LEN);
  const ct = packed.slice(HEADER_LEN);
  return { iterations, salt, iv, ct };
}

/** Encrypt with an already-derived key + the vault's fixed salt (fresh IV each call). */
export async function encryptWithKey(key: CryptoKey, salt: Uint8Array, iterations: number, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: buf(iv) }, key, buf(encodeUtf8(plaintext))));
  return pack(salt, iterations, iv, ct);
}

export async function decryptWithKey(key: CryptoKey, iv: Uint8Array, ct: Uint8Array): Promise<string> {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf(iv) }, key, buf(ct));
  return decodeUtf8(new Uint8Array(pt));
}

// ─── High-level helpers ──────────────────────────────────────────────────────

export interface VaultKey { key: CryptoKey; salt: Uint8Array; iterations: number }

/** Create a brand-new vault key (random salt). */
export async function createVaultKey(password: string): Promise<VaultKey> {
  if (!available()) throw new Error("Secure encryption isn't available in this browser.");
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return { key, salt, iterations: PBKDF2_ITERATIONS };
}

export interface OpenResult { ok: boolean; error?: string; plaintext?: string; vaultKey?: VaultKey }

/** Open an existing blob with a password — returns the plaintext and a reusable key. */
export async function openBlob(blob: string, password: string): Promise<OpenResult> {
  if (!available()) return { ok: false, error: "Secure encryption isn't available in this browser." };
  let parsed: Unpacked;
  try { parsed = unpack(blob); } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Corrupted data." }; }
  try {
    const key = await deriveKey(password, parsed.salt, parsed.iterations);
    const plaintext = await decryptWithKey(key, parsed.iv, parsed.ct);
    return { ok: true, plaintext, vaultKey: { key, salt: parsed.salt, iterations: parsed.iterations } };
  } catch {
    return { ok: false, error: "Incorrect password or corrupted data." };
  }
}

/** One-shot encrypt for the Share feature (fresh random salt, self-contained). */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  const { key, salt, iterations } = await createVaultKey(password);
  return encryptWithKey(key, salt, iterations, plaintext);
}

/** One-shot decrypt for the Share feature. */
export async function decryptText(blob: string, password: string): Promise<OpenResult> {
  return openBlob(blob, password);
}
