// URL Shortener engine for the Toollyz URL Shortener. Static-site
// constraint: there's no Toollyz backend, so links are produced by reputable
// public link-shortening services that expose a CORS-friendly HTTP API.
//
// Supported providers:
//   1. TinyURL (tinyurl.com/api-create.php) — GET, plain-text response,
//      optional alias parameter.
//   2. is.gd (is.gd/create.php?format=json) — GET, JSON response with rich
//      error reporting, optional shorturl parameter.
//
// The caller picks a provider; if `auto` is selected the engine tries
// TinyURL first and falls back to is.gd on any failure.

import { fetchWithTimeout } from "@/lib/tools/shared/net";

export type Provider = "tinyurl" | "isgd";
export type ProviderChoice = Provider | "auto";

export interface ProviderInfo {
  id: Provider;
  label: string;
  host: string;
  supportsAlias: boolean;
  note: string;
}

export const PROVIDERS: Record<Provider, ProviderInfo> = {
  tinyurl: {
    id: "tinyurl",
    label: "TinyURL",
    host: "tinyurl.com",
    supportsAlias: true,
    note: "Plain-text API, no auth, optional custom alias.",
  },
  isgd: {
    id: "isgd",
    label: "is.gd",
    host: "is.gd",
    supportsAlias: true,
    note: "JSON API with descriptive errors, optional custom alias.",
  },
};

export interface ShortenResult {
  short: string;
  original: string;
  provider: Provider;
  alias?: string;
  savedChars: number;
}

const ALIAS_RE = /^[A-Za-z0-9_-]{3,30}$/;
const URL_BAD_SCHEME_RE = /^(javascript|data|file|vbscript):/i;

export function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (URL_BAD_SCHEME_RE.test(raw)) return false;
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (URL_BAD_SCHEME_RE.test(trimmed)) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function aliasError(raw: string): string | null {
  if (!raw) return null;
  if (raw.length < 3) return "Alias must be at least 3 characters.";
  if (raw.length > 30) return "Alias must be 30 characters or fewer.";
  if (!ALIAS_RE.test(raw)) return "Alias may only contain letters, numbers, hyphens and underscores.";
  return null;
}

async function callTinyUrl(url: string, alias?: string): Promise<{ ok: true; short: string } | { ok: false; error: string }> {
  const params = new URLSearchParams({ url });
  if (alias) params.set("alias", alias);
  const r = await fetchWithTimeout(`https://tinyurl.com/api-create.php?${params}`, {
    timeoutMs: 8000,
    cache: "no-store",
  });
  if (!r.ok) return { ok: false, error: r.kind === "timeout" ? "TinyURL timed out." : "Couldn't reach TinyURL." };
  const text = (await r.response.text()).trim();
  if (!text) return { ok: false, error: "TinyURL returned an empty response." };
  if (/^error/i.test(text)) return { ok: false, error: text };
  if (!/^https?:\/\//i.test(text)) return { ok: false, error: text };
  return { ok: true, short: text };
}

async function callIsGd(url: string, alias?: string): Promise<{ ok: true; short: string } | { ok: false; error: string }> {
  const params = new URLSearchParams({ format: "json", url });
  if (alias) params.set("shorturl", alias);
  const r = await fetchWithTimeout(`https://is.gd/create.php?${params}`, {
    timeoutMs: 8000,
    cache: "no-store",
  });
  if (!r.ok) return { ok: false, error: r.kind === "timeout" ? "is.gd timed out." : "Couldn't reach is.gd." };
  try {
    const data = (await r.response.json()) as { shorturl?: string; errorcode?: number; errormessage?: string };
    if (data.errorcode || !data.shorturl) {
      return { ok: false, error: data.errormessage || "is.gd returned an error." };
    }
    return { ok: true, short: data.shorturl };
  } catch {
    return { ok: false, error: "Couldn't parse is.gd response." };
  }
}

export async function shorten(
  rawUrl: string,
  choice: ProviderChoice,
  alias?: string,
): Promise<{ ok: true; result: ShortenResult } | { ok: false; error: string }> {
  const normalized = normalizeUrl(rawUrl);
  if (!isValidUrl(normalized)) return { ok: false, error: "Enter a valid HTTP(S) URL." };
  const cleanedAlias = alias?.trim() || undefined;
  if (cleanedAlias) {
    const e = aliasError(cleanedAlias);
    if (e) return { ok: false, error: e };
  }

  const order: Provider[] = choice === "auto" ? ["tinyurl", "isgd"] : [choice];
  const errors: string[] = [];
  for (const p of order) {
    const call = p === "tinyurl" ? callTinyUrl : callIsGd;
    const r = await call(normalized, cleanedAlias);
    if (r.ok) {
      return {
        ok: true,
        result: {
          short: r.short,
          original: normalized,
          provider: p,
          alias: cleanedAlias,
          savedChars: Math.max(0, normalized.length - r.short.length),
        },
      };
    }
    errors.push(`${PROVIDERS[p].label}: ${r.error}`);
  }
  return { ok: false, error: errors.join(" · ") };
}
