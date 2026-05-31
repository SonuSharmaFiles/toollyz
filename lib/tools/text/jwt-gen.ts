// JWT Generator engine. Builds and signs JSON Web Tokens with HS256, HS384
// or HS512 via the Web Crypto API's HMAC primitive. Async signing because
// SubtleCrypto returns Promises.
//
// Browsers cannot perform RS256/ES256 without a private-key import flow that
// requires a PEM the user supplies — too dangerous to encourage casually
// (the user would paste a real private key into a webpage). We deliberately
// limit this tool to symmetric HMAC algorithms; for RS/ES signing, point
// users at server-side libraries.

export type HmacAlg = "HS256" | "HS384" | "HS512";

export interface JwtHeader {
  alg: HmacAlg;
  typ: "JWT";
  /** Optional key ID hint — embedded as kid in the header. */
  kid?: string;
}

export interface JwtClaims {
  /** Issuer. */
  iss?: string;
  /** Subject. */
  sub?: string;
  /** Audience. */
  aud?: string;
  /** Expiration — UNIX seconds. */
  exp?: number;
  /** Not-before — UNIX seconds. */
  nbf?: number;
  /** Issued-at — UNIX seconds. */
  iat?: number;
  /** Unique token ID. */
  jti?: string;
  /** Catch-all for any custom claims. */
  [k: string]: unknown;
}

const ALG_HASH: Record<HmacAlg, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export interface SignOptions {
  alg: HmacAlg;
  secret: string;
  /** When true, the secret string is parsed as base64url-encoded raw bytes. */
  secretIsBase64Url: boolean;
}

export const DEFAULT_HEADER: JwtHeader = { alg: "HS256", typ: "JWT" };

export const DEFAULT_CLAIMS: JwtClaims = {
  iss: "toollyz",
  sub: "user_42",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  name: "Ada Lovelace",
  scope: "read write",
};

export const DEFAULT_SIGN_OPTIONS: SignOptions = {
  alg: "HS256",
  secret: "your-256-bit-secret",
  secretIsBase64Url: false,
};

function fromBase64Url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = typeof atob !== "undefined" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function getSecretBytes(opt: SignOptions): Uint8Array {
  if (opt.secretIsBase64Url) return fromBase64Url(opt.secret);
  return utf8(opt.secret);
}

/** Stably stringify so repeated runs of the same claims produce the same JWT. */
function stableJson(obj: object): string {
  // We sort keys deterministically; values within arrays preserve order.
  const visit = (v: unknown): unknown => {
    if (v === null || v === undefined) return v;
    if (Array.isArray(v)) return v.map(visit);
    if (typeof v === "object") {
      const keys = Object.keys(v as Record<string, unknown>).sort();
      const out: Record<string, unknown> = {};
      for (const k of keys) out[k] = visit((v as Record<string, unknown>)[k]);
      return out;
    }
    return v;
  };
  return JSON.stringify(visit(obj));
}

export async function signJwt(header: JwtHeader, claims: JwtClaims, opt: SignOptions): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API (crypto.subtle) is not available in this environment.");
  }
  const finalHeader: JwtHeader = { ...header, alg: opt.alg };
  const encodedHeader = toBase64Url(utf8(stableJson(finalHeader)));
  const encodedPayload = toBase64Url(utf8(stableJson(claims)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const secretBytes = getSecretBytes(opt);
  // SubtleCrypto's TS definitions require a non-Shared ArrayBuffer; copy into
  // a fresh buffer to satisfy the type checker without runtime cost.
  const secretBuf = new ArrayBuffer(secretBytes.byteLength);
  new Uint8Array(secretBuf).set(secretBytes);
  const key = await crypto.subtle.importKey(
    "raw",
    secretBuf,
    { name: "HMAC", hash: ALG_HASH[opt.alg] },
    false,
    ["sign"],
  );
  const signingBytes = utf8(signingInput);
  const signingBuf = new ArrayBuffer(signingBytes.byteLength);
  new Uint8Array(signingBuf).set(signingBytes);
  const sigBuf = await crypto.subtle.sign("HMAC", key, signingBuf);
  const sig = toBase64Url(new Uint8Array(sigBuf));
  return `${signingInput}.${sig}`;
}

export interface BuildOutput {
  jwt: string;
  encodedHeader: string;
  encodedPayload: string;
  encodedSignature: string;
  /** Total bytes the JWT consumes when stored as ASCII. */
  byteLength: number;
}

export async function build(claims: JwtClaims, opt: SignOptions = DEFAULT_SIGN_OPTIONS): Promise<BuildOutput> {
  const jwt = await signJwt({ ...DEFAULT_HEADER, alg: opt.alg }, claims, opt);
  const [encodedHeader, encodedPayload, encodedSignature] = jwt.split(".");
  return {
    jwt,
    encodedHeader,
    encodedPayload,
    encodedSignature,
    byteLength: utf8(jwt).byteLength,
  };
}

export interface ClaimRow {
  key: string;
  value: string;
  /** When this is a registered claim, a short hint about what it means. */
  hint?: string;
}

const REGISTERED: Record<string, string> = {
  iss: "Issuer — the principal that minted the token.",
  sub: "Subject — the principal the token is about.",
  aud: "Audience — the recipient(s) the token is intended for.",
  exp: "Expiration — UNIX seconds after which the token is invalid.",
  nbf: "Not-before — UNIX seconds before which the token is invalid.",
  iat: "Issued-at — UNIX seconds when the token was minted.",
  jti: "JWT ID — a unique identifier for this token.",
};

export function inspectClaims(claims: JwtClaims): ClaimRow[] {
  const rows: ClaimRow[] = [];
  for (const k of Object.keys(claims)) {
    const v = claims[k];
    const value = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
    rows.push({ key: k, value, hint: REGISTERED[k] });
  }
  return rows;
}

export const ALG_OPTIONS: { id: HmacAlg; label: string; hash: string }[] = [
  { id: "HS256", label: "HS256 (HMAC SHA-256)", hash: "SHA-256" },
  { id: "HS384", label: "HS384 (HMAC SHA-384)", hash: "SHA-384" },
  { id: "HS512", label: "HS512 (HMAC SHA-512)", hash: "SHA-512" },
];

/** Pretty-print JSON for the editor textareas, ignoring stable-key ordering. */
export function pretty(obj: object): string {
  return JSON.stringify(obj, null, 2);
}

export function parseJsonSafely<T>(text: string, fallback: T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}
