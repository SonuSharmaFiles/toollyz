// Encryption Key Generator engine. Wraps the Web Crypto API's generateKey
// for AES (256-bit GCM/CBC/CTR), RSA-OAEP / RSA-PSS / RSASSA-PKCS1-v1_5,
// ECDSA (P-256/P-384/P-521) and HMAC. Exports keys in JWK and PEM-friendly
// formats with honest framing about the cost of each algorithm.

export type Algorithm =
  | "AES-GCM"
  | "AES-CBC"
  | "AES-CTR"
  | "RSA-OAEP"
  | "RSA-PSS"
  | "RSASSA-PKCS1-v1_5"
  | "ECDSA"
  | "ECDH"
  | "HMAC";

export interface AlgorithmMeta {
  id: Algorithm;
  label: string;
  family: "Symmetric" | "Asymmetric";
  /** Common bit lengths or curve names. */
  options: string[];
  /** One-liner hint for the picker. */
  hint: string;
}

export const ALGORITHMS: AlgorithmMeta[] = [
  {
    id: "AES-GCM",
    label: "AES-GCM (encrypt + authenticate)",
    family: "Symmetric",
    options: ["128", "192", "256"],
    hint: "Authenticated encryption — the default for new symmetric work.",
  },
  {
    id: "AES-CBC",
    label: "AES-CBC (legacy block cipher)",
    family: "Symmetric",
    options: ["128", "192", "256"],
    hint: "Use only when interoperability requires it. Needs separate MAC for authentication.",
  },
  {
    id: "AES-CTR",
    label: "AES-CTR (streaming block cipher)",
    family: "Symmetric",
    options: ["128", "192", "256"],
    hint: "Counter mode — fast, parallelisable. Pair with HMAC for integrity.",
  },
  {
    id: "HMAC",
    label: "HMAC (message authentication)",
    family: "Symmetric",
    options: ["SHA-256", "SHA-384", "SHA-512"],
    hint: "Symmetric MAC used for JWT signing and API request signing.",
  },
  {
    id: "RSA-OAEP",
    label: "RSA-OAEP (encrypt)",
    family: "Asymmetric",
    options: ["2048", "3072", "4096"],
    hint: "RSA public-key encryption with OAEP padding.",
  },
  {
    id: "RSA-PSS",
    label: "RSA-PSS (sign)",
    family: "Asymmetric",
    options: ["2048", "3072", "4096"],
    hint: "Probabilistic RSA signing — modern preferred over PKCS#1 v1.5.",
  },
  {
    id: "RSASSA-PKCS1-v1_5",
    label: "RSA PKCS#1 v1.5 (sign)",
    family: "Asymmetric",
    options: ["2048", "3072", "4096"],
    hint: "Used by older RS256 JWTs. PSS is preferred for new work.",
  },
  {
    id: "ECDSA",
    label: "ECDSA (sign)",
    family: "Asymmetric",
    options: ["P-256", "P-384", "P-521"],
    hint: "Elliptic-curve signatures — small keys, fast verification.",
  },
  {
    id: "ECDH",
    label: "ECDH (key exchange)",
    family: "Asymmetric",
    options: ["P-256", "P-384", "P-521"],
    hint: "Diffie-Hellman key agreement on elliptic curves.",
  },
];

export interface GenerateOptions {
  algorithm: Algorithm;
  /** Bit length for AES / RSA / HMAC, or curve name for ECDSA / ECDH. */
  param: string;
  /** When non-extractable, exporting is forbidden — useful for production. */
  extractable: boolean;
}

export const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  algorithm: "AES-GCM",
  param: "256",
  extractable: true,
};

function isHmac(alg: Algorithm): boolean {
  return alg === "HMAC";
}

function isAsymmetric(alg: Algorithm): boolean {
  return (ALGORITHMS.find((a) => a.id === alg)?.family ?? "Symmetric") === "Asymmetric";
}

function rsaUsages(alg: Algorithm): KeyUsage[] {
  if (alg === "RSA-OAEP") return ["encrypt", "decrypt"];
  return ["sign", "verify"];
}

function ecUsages(alg: Algorithm): KeyUsage[] {
  if (alg === "ECDH") return ["deriveKey", "deriveBits"];
  return ["sign", "verify"];
}

function aesUsages(): KeyUsage[] {
  return ["encrypt", "decrypt"];
}

function buildKeyGenParams(opt: GenerateOptions): { algorithm: AlgorithmIdentifier | RsaHashedKeyGenParams | EcKeyGenParams | HmacKeyGenParams | AesKeyGenParams; usages: KeyUsage[] } {
  if (opt.algorithm === "AES-GCM" || opt.algorithm === "AES-CBC" || opt.algorithm === "AES-CTR") {
    const bits = parseInt(opt.param, 10);
    return {
      algorithm: { name: opt.algorithm, length: bits } as AesKeyGenParams,
      usages: aesUsages(),
    };
  }
  if (opt.algorithm === "HMAC") {
    return {
      algorithm: { name: "HMAC", hash: opt.param } as HmacKeyGenParams,
      usages: ["sign", "verify"],
    };
  }
  if (opt.algorithm.startsWith("RSA")) {
    const bits = parseInt(opt.param, 10);
    return {
      algorithm: {
        name: opt.algorithm,
        modulusLength: bits,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      } as RsaHashedKeyGenParams,
      usages: rsaUsages(opt.algorithm),
    };
  }
  if (opt.algorithm === "ECDSA" || opt.algorithm === "ECDH") {
    return {
      algorithm: { name: opt.algorithm, namedCurve: opt.param } as EcKeyGenParams,
      usages: ecUsages(opt.algorithm),
    };
  }
  throw new Error(`Unknown algorithm: ${opt.algorithm}`);
}

export interface GeneratedKey {
  algorithm: Algorithm;
  param: string;
  /** Raw key bytes (symmetric) or null (asymmetric). */
  raw?: Uint8Array;
  /** Hex-encoded raw bytes. */
  hex?: string;
  /** Base64-encoded raw bytes (URL-safe). */
  base64url?: string;
  /** JWK form (symmetric → 1 JWK; asymmetric → public + private). */
  jwk?: JsonWebKey;
  /** PKCS#8 base64-encoded private key — for asymmetric. */
  privatePem?: string;
  /** SPKI base64-encoded public key — for asymmetric. */
  publicPem?: string;
  /** Public JWK for asymmetric. */
  publicJwk?: JsonWebKey;
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

function chunk(str: string, n: number): string {
  const out: string[] = [];
  for (let i = 0; i < str.length; i += n) out.push(str.slice(i, i + n));
  return out.join("\n");
}

function toPem(label: string, base64: string): string {
  return `-----BEGIN ${label}-----\n${chunk(base64, 64)}\n-----END ${label}-----`;
}

export async function generateKey(opt: GenerateOptions = DEFAULT_GENERATE_OPTIONS): Promise<GeneratedKey> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API (crypto.subtle) is not available.");
  }
  const { algorithm, usages } = buildKeyGenParams(opt);

  if (isAsymmetric(opt.algorithm)) {
    const pair = await crypto.subtle.generateKey(algorithm, opt.extractable, usages) as CryptoKeyPair;
    const out: GeneratedKey = { algorithm: opt.algorithm, param: opt.param };
    if (opt.extractable) {
      const priv = new Uint8Array(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
      const pub = new Uint8Array(await crypto.subtle.exportKey("spki", pair.publicKey));
      out.privatePem = toPem("PRIVATE KEY", toBase64(priv));
      out.publicPem = toPem("PUBLIC KEY", toBase64(pub));
      out.jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
      out.publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
    }
    return out;
  }

  const key = await crypto.subtle.generateKey(algorithm, opt.extractable, usages) as CryptoKey;
  const out: GeneratedKey = { algorithm: opt.algorithm, param: opt.param };
  if (opt.extractable) {
    if (isHmac(opt.algorithm)) {
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
      out.raw = raw;
      out.hex = toHex(raw);
      out.base64url = toBase64Url(raw);
      out.jwk = await crypto.subtle.exportKey("jwk", key);
    } else {
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
      out.raw = raw;
      out.hex = toHex(raw);
      out.base64url = toBase64Url(raw);
      out.jwk = await crypto.subtle.exportKey("jwk", key);
    }
  }
  return out;
}

export function entropyBits(opt: GenerateOptions): number {
  if (opt.algorithm === "HMAC") {
    if (opt.param === "SHA-256") return 256;
    if (opt.param === "SHA-384") return 384;
    if (opt.param === "SHA-512") return 512;
  }
  if (opt.algorithm.startsWith("AES")) return parseInt(opt.param, 10);
  if (opt.algorithm.startsWith("RSA")) return parseInt(opt.param, 10);
  if (opt.algorithm === "ECDSA" || opt.algorithm === "ECDH") {
    if (opt.param === "P-256") return 256;
    if (opt.param === "P-384") return 384;
    if (opt.param === "P-521") return 521;
  }
  return 0;
}
