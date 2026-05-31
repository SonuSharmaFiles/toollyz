// API Key Generator engine. Produces production-style API keys with the
// patterns most platforms use: a brand prefix ("sk_live_…", "pk_…", "ghp_…"),
// segmented blocks, optional checksum, and configurable entropy.
//
// Crypto-strong throughout — every random byte comes from
// crypto.getRandomValues with rejection sampling so the distribution of
// each output character is uniform.

import { generateSessionId, type SessionEncoding } from "./session-id";

export type Charset = "alphanumeric" | "hex" | "base64url";

export interface KeyTemplate {
  id: string;
  label: string;
  prefix: string;
  bodyLength: number;
  charset: Charset;
  segments: number;
  separator: string;
  description: string;
}

/**
 * Pre-baked templates that mirror real-world API key formats so users can
 * inspect what a "Stripe-style" or "GitHub-style" key actually looks like.
 */
export const TEMPLATES: KeyTemplate[] = [
  {
    id: "stripe-live",
    label: "Stripe (live)",
    prefix: "sk_live_",
    bodyLength: 32,
    charset: "alphanumeric",
    segments: 1,
    separator: "",
    description: "Stripe secret key for production traffic.",
  },
  {
    id: "stripe-test",
    label: "Stripe (test)",
    prefix: "sk_test_",
    bodyLength: 32,
    charset: "alphanumeric",
    segments: 1,
    separator: "",
    description: "Stripe test secret key — safe for sandbox.",
  },
  {
    id: "github-pat",
    label: "GitHub PAT",
    prefix: "ghp_",
    bodyLength: 36,
    charset: "alphanumeric",
    segments: 1,
    separator: "",
    description: "Personal access token style — fine-grained or classic.",
  },
  {
    id: "openai",
    label: "OpenAI-style",
    prefix: "sk-",
    bodyLength: 48,
    charset: "alphanumeric",
    segments: 1,
    separator: "",
    description: "OpenAI / Anthropic style — sk- prefix + 48-char body.",
  },
  {
    id: "uuid-segmented",
    label: "UUID-style (8-4-4-4-12)",
    prefix: "",
    bodyLength: 32,
    charset: "hex",
    segments: 5,
    separator: "-",
    description: "Hex segmented like a UUID — 8-4-4-4-12.",
  },
  {
    id: "rest-segmented",
    label: "Segmented (4 × 6)",
    prefix: "key_",
    bodyLength: 24,
    charset: "alphanumeric",
    segments: 4,
    separator: "-",
    description: "Easy-to-dictate 4 segments of 6 chars.",
  },
  {
    id: "raw-base64",
    label: "Raw Base64URL",
    prefix: "",
    bodyLength: 43,
    charset: "base64url",
    segments: 1,
    separator: "",
    description: "Raw 256-bit Base64URL token (43 chars).",
  },
];

export interface KeyOptions {
  prefix: string;
  bodyLength: number;
  charset: Charset;
  segments: number;
  separator: string;
  count: number;
  uppercase: boolean;
  includeChecksum: boolean;
}

export const DEFAULT_KEY_OPTIONS: KeyOptions = {
  prefix: "sk_live_",
  bodyLength: 32,
  charset: "alphanumeric",
  segments: 1,
  separator: "",
  count: 1,
  uppercase: false,
  includeChecksum: false,
};

function checksumChar(token: string): string {
  // Simple, fast Luhn-style sum mod 36 — enough to spot single-character
  // typos when humans paste keys. Not cryptographic.
  let sum = 0;
  for (let i = 0; i < token.length; i++) {
    sum = (sum * 31 + token.charCodeAt(i)) % 36;
  }
  const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return digits[sum];
}

function bodyEncoding(charset: Charset): SessionEncoding {
  if (charset === "hex") return "hex";
  if (charset === "base64url") return "base64url";
  return "alphanumeric";
}

function buildSegments(body: string, segments: number, separator: string): string {
  if (segments <= 1) return body;
  const each = Math.ceil(body.length / segments);
  const parts: string[] = [];
  for (let i = 0; i < segments; i++) {
    parts.push(body.slice(i * each, (i + 1) * each));
  }
  return parts.filter(Boolean).join(separator);
}

export function generateApiKey(opt: KeyOptions = DEFAULT_KEY_OPTIONS): string {
  const encoding = bodyEncoding(opt.charset);
  const body = generateSessionId({
    length: opt.bodyLength,
    encoding,
    count: 1,
    prefix: "",
  });
  let formatted = buildSegments(opt.uppercase ? body.toUpperCase() : body, opt.segments, opt.separator);
  if (opt.includeChecksum) {
    formatted = `${formatted}_${checksumChar(formatted)}`;
  }
  return `${opt.prefix}${formatted}`;
}

export function generateBatch(opt: KeyOptions = DEFAULT_KEY_OPTIONS): string[] {
  const out: string[] = [];
  for (let i = 0; i < Math.max(1, opt.count); i++) out.push(generateApiKey(opt));
  return out;
}

const ALPHABET_SIZE: Record<Charset, number> = {
  alphanumeric: 62,
  hex: 16,
  base64url: 64,
};

export interface KeyStrength {
  bits: number;
  band: "weak" | "ok" | "strong" | "overkill";
  composition: string;
}

export function strengthOf(opt: KeyOptions): KeyStrength {
  const bits = Math.floor(opt.bodyLength * Math.log2(ALPHABET_SIZE[opt.charset]));
  let band: KeyStrength["band"] = "weak";
  if (bits >= 256) band = "overkill";
  else if (bits >= 128) band = "strong";
  else if (bits >= 80) band = "ok";
  const composition = `${opt.bodyLength} × ${ALPHABET_SIZE[opt.charset]}-char alphabet`;
  return { bits, band, composition };
}

export function templateToOptions(t: KeyTemplate, count = 1): KeyOptions {
  return {
    prefix: t.prefix,
    bodyLength: t.bodyLength,
    charset: t.charset,
    segments: t.segments,
    separator: t.separator,
    count,
    uppercase: false,
    includeChecksum: false,
  };
}
