// Website Cache Checker engine. Deep audit of every cache-related
// response header. Builds on the http-headers parser; layered to
// surface the actual freshness model the browser/proxy will apply.

import { parseHeaders } from "@/lib/tools/text/http-headers";

export interface CacheCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail" | "info";
  message: string;
}

export interface CacheReport {
  headers: { name: string; value: string }[];
  cacheControl?: Record<string, string | true>;
  pragma?: string;
  expires?: Date;
  expiresValid?: boolean;
  etag?: string;
  lastModified?: Date;
  age?: number;
  vary?: string[];
  cdnCacheStatus?: { name: string; value: string };
  /** Computed freshness in seconds — either max-age, expires - now, or `undefined`. */
  freshnessSeconds?: number;
  freshnessSource?: "Cache-Control max-age" | "s-maxage" | "Expires" | "none";
  /** Whether the response is uncacheable. */
  uncacheable: boolean;
  checks: CacheCheck[];
}

function parseCacheControl(v: string): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (const part of v.split(/,\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) out[part.trim().toLowerCase()] = true;
    else out[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim().replace(/^"|"$/g, "");
  }
  return out;
}

const CDN_CACHE_HEADERS = ["cf-cache-status", "x-cache", "x-vercel-cache", "x-served-by", "fastly-debug-digest", "x-akamai-cache", "x-cache-hits"];

export function audit(text: string): CacheReport {
  const { headers } = parseHeaders(text);
  const get = (name: string) => headers.find((h) => h.key === name.toLowerCase())?.value;
  const getAll = (name: string) => headers.filter((h) => h.key === name.toLowerCase()).map((h) => h.value);

  const cacheControlRaw = get("cache-control");
  const cacheControl = cacheControlRaw ? parseCacheControl(cacheControlRaw) : undefined;
  const pragma = get("pragma");
  const expiresRaw = get("expires");
  const expires = expiresRaw ? new Date(expiresRaw) : undefined;
  const expiresValid = expires && !Number.isNaN(expires.getTime());
  const etag = get("etag");
  const lastModRaw = get("last-modified");
  const lastModified = lastModRaw ? new Date(lastModRaw) : undefined;
  const ageRaw = get("age");
  const age = ageRaw ? parseInt(ageRaw, 10) : undefined;
  const vary = get("vary")?.split(/,\s*/).filter(Boolean);

  let cdnCacheStatus: { name: string; value: string } | undefined;
  for (const h of CDN_CACHE_HEADERS) {
    const v = get(h);
    if (v) {
      cdnCacheStatus = { name: h, value: v };
      break;
    }
  }

  // Compute freshness.
  let freshnessSeconds: number | undefined;
  let freshnessSource: CacheReport["freshnessSource"] = "none";
  let uncacheable = false;
  if (cacheControl?.["no-store"]) {
    uncacheable = true;
  } else if (cacheControl?.["s-maxage"] && typeof cacheControl["s-maxage"] === "string") {
    freshnessSeconds = parseInt(cacheControl["s-maxage"], 10);
    freshnessSource = "s-maxage";
  } else if (cacheControl?.["max-age"] && typeof cacheControl["max-age"] === "string") {
    freshnessSeconds = parseInt(cacheControl["max-age"], 10);
    freshnessSource = "Cache-Control max-age";
  } else if (expiresValid && expires) {
    freshnessSeconds = Math.floor((expires.getTime() - Date.now()) / 1000);
    freshnessSource = "Expires";
  }

  const checks: CacheCheck[] = [];
  if (!cacheControl && !expires) {
    checks.push({ id: "missing", label: "No cache headers", status: "warn", message: "No Cache-Control or Expires — heuristic caching applies, every browser/proxy decides freshness independently." });
  }
  if (cacheControl?.["no-store"]) {
    checks.push({ id: "no-store", label: "no-store", status: "info", message: "`no-store` forbids any cache from storing this response — the strongest setting." });
  }
  if (cacheControl?.["no-cache"]) {
    checks.push({ id: "no-cache", label: "no-cache", status: "info", message: "`no-cache` allows caching but requires revalidation on each use. Common for HTML." });
  }
  if (cacheControl?.["private"]) {
    checks.push({ id: "private", label: "private", status: "info", message: "Only the user's browser may cache — CDNs and proxies will not store." });
  }
  if (cacheControl?.["public"]) {
    checks.push({ id: "public", label: "public", status: "ok", message: "Public — any cache may store, including CDNs." });
  }
  if (cacheControl?.["public"] && cacheControl?.["private"]) {
    checks.push({ id: "contradiction", label: "Contradiction", status: "warn", message: "Both `public` and `private` directives — clients may pick one arbitrarily." });
  }
  if (cacheControl?.["must-revalidate"]) {
    checks.push({ id: "must-revalidate", label: "must-revalidate", status: "ok", message: "Stale responses must be revalidated before reuse — safest for dynamic content." });
  }
  if (cacheControl?.["immutable"]) {
    checks.push({ id: "immutable", label: "immutable", status: "ok", message: "`immutable` tells the browser this never changes during max-age — great for fingerprinted asset URLs." });
  }
  if (freshnessSeconds !== undefined) {
    if (freshnessSeconds > 31_536_000) {
      checks.push({ id: "very-long", label: "Very long max-age", status: "info", message: `${freshnessSeconds.toLocaleString()}s (> 1 year) — fine for fingerprinted URLs, dangerous otherwise.` });
    } else if (freshnessSeconds < 0) {
      checks.push({ id: "expired", label: "Expired", status: "warn", message: `Expires in the past (${freshnessSeconds}s) — already stale.` });
    } else {
      checks.push({ id: "fresh", label: "Freshness", status: "ok", message: `${freshnessSource}: fresh for ${freshnessSeconds.toLocaleString()}s (≈${humanise(freshnessSeconds)}).` });
    }
  }

  if (pragma && pragma.toLowerCase() === "no-cache" && !cacheControl) {
    checks.push({ id: "pragma", label: "Pragma fallback", status: "info", message: "`Pragma: no-cache` is the HTTP/1.0 form — Cache-Control: no-cache supersedes it. Use both for legacy clients." });
  }
  if (expires && cacheControl) {
    checks.push({ id: "redundant-expires", label: "Redundant Expires", status: "info", message: "Both Cache-Control and Expires present — Cache-Control wins; Expires is redundant." });
  }
  if (etag) {
    checks.push({ id: "etag", label: "ETag", status: "ok", message: `ETag set (${etag.slice(0, 16)}…) — clients can revalidate with If-None-Match for 304 responses.` });
  }
  if (lastModified && !Number.isNaN(lastModified.getTime())) {
    checks.push({ id: "lastmod", label: "Last-Modified", status: "ok", message: `Last-Modified: ${lastModified.toUTCString()} — clients can revalidate with If-Modified-Since.` });
  } else if (!etag && !lastModified && cacheControl && !cacheControl["no-store"]) {
    checks.push({ id: "no-validator", label: "No validators", status: "warn", message: "Cacheable but no ETag or Last-Modified — every revalidation must re-download fully." });
  }
  if (age !== undefined) {
    checks.push({ id: "age", label: "Age", status: "info", message: `Age: ${age}s — response has been in cache this long.` });
    if (freshnessSeconds !== undefined && age > freshnessSeconds) {
      checks.push({ id: "stale", label: "Stale", status: "warn", message: `Age (${age}s) exceeds freshness (${freshnessSeconds}s) — response is stale.` });
    }
  }
  if (vary?.includes("*")) {
    checks.push({ id: "vary-star", label: "Vary: *", status: "warn", message: "`Vary: *` means every request is unique — caches can never reuse the response." });
  }
  if (cdnCacheStatus) {
    const v = cdnCacheStatus.value.toUpperCase();
    if (v.includes("HIT")) checks.push({ id: "cdn-hit", label: "CDN HIT", status: "ok", message: `${cdnCacheStatus.name}: ${cdnCacheStatus.value} — CDN served from cache.` });
    else if (v.includes("MISS")) checks.push({ id: "cdn-miss", label: "CDN MISS", status: "info", message: `${cdnCacheStatus.name}: ${cdnCacheStatus.value} — CDN had to fetch from origin.` });
    else if (v.includes("EXPIRED") || v.includes("STALE")) checks.push({ id: "cdn-stale", label: "CDN STALE", status: "warn", message: `${cdnCacheStatus.name}: ${cdnCacheStatus.value} — CDN cache is stale.` });
    else if (v.includes("DYNAMIC")) checks.push({ id: "cdn-dynamic", label: "CDN DYNAMIC", status: "info", message: `${cdnCacheStatus.name}: ${cdnCacheStatus.value} — response was treated as uncacheable.` });
    else checks.push({ id: "cdn-other", label: "CDN cache", status: "info", message: `${cdnCacheStatus.name}: ${cdnCacheStatus.value}` });
  }

  return {
    headers,
    cacheControl,
    pragma,
    expires: expiresValid ? expires : undefined,
    expiresValid,
    etag,
    lastModified: lastModified && !Number.isNaN(lastModified.getTime()) ? lastModified : undefined,
    age,
    vary,
    cdnCacheStatus,
    freshnessSeconds,
    freshnessSource,
    uncacheable,
    checks,
  };
}

function humanise(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  if (seconds < 31_536_000) return `${Math.round(seconds / 86400)}d`;
  return `${(seconds / 31_536_000).toFixed(1)}y`;
}

export const SAMPLE_CACHE_HEADERS = `HTTP/2 200
date: Sat, 31 May 2026 22:00:00 GMT
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600, must-revalidate
etag: "abc123-2026"
last-modified: Fri, 30 May 2026 18:14:00 GMT
vary: Accept-Encoding, Origin
age: 142
cf-cache-status: HIT`;
