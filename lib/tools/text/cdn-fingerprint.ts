// CDN Checker engine. Paste HTTP response headers and we fingerprint
// the CDN / proxy / hosting platform from header signatures. Every CDN
// leaks signature headers (Cloudflare's CF-Ray, Fastly's X-Served-By,
// Vercel's x-vercel-id, etc.) — they're our entry points.

import { parseHeaders } from "@/lib/tools/text/http-headers";

export interface CdnHit {
  name: string;
  confidence: "high" | "medium" | "low";
  /** Why we think it's this CDN. */
  evidence: string;
}

const RULES: { name: string; check: (m: Map<string, string[]>, server: string | undefined) => CdnHit | undefined }[] = [
  {
    name: "Cloudflare",
    check: (m, server) => {
      if (m.get("cf-ray")) return { name: "Cloudflare", confidence: "high", evidence: `cf-ray: ${m.get("cf-ray")?.[0]}` };
      if (server?.toLowerCase().includes("cloudflare")) return { name: "Cloudflare", confidence: "high", evidence: `server: ${server}` };
      if (m.get("cf-cache-status")) return { name: "Cloudflare", confidence: "high", evidence: `cf-cache-status: ${m.get("cf-cache-status")?.[0]}` };
      return undefined;
    },
  },
  {
    name: "Fastly",
    check: (m, server) => {
      if (m.get("x-served-by")?.[0]?.includes("cache-")) return { name: "Fastly", confidence: "high", evidence: `x-served-by: ${m.get("x-served-by")?.[0]}` };
      if (m.get("fastly-debug-digest")) return { name: "Fastly", confidence: "high", evidence: "fastly-debug-digest header present" };
      if (server?.toLowerCase() === "fastly") return { name: "Fastly", confidence: "high", evidence: "server: Fastly" };
      return undefined;
    },
  },
  {
    name: "AWS CloudFront",
    check: (m, server) => {
      if (m.get("x-amz-cf-id")) return { name: "AWS CloudFront", confidence: "high", evidence: `x-amz-cf-id: ${m.get("x-amz-cf-id")?.[0]?.slice(0, 16)}…` };
      if (m.get("x-amz-cf-pop")) return { name: "AWS CloudFront", confidence: "high", evidence: `x-amz-cf-pop: ${m.get("x-amz-cf-pop")?.[0]}` };
      if (m.get("via")?.[0]?.toLowerCase().includes("cloudfront")) return { name: "AWS CloudFront", confidence: "high", evidence: `via: ${m.get("via")?.[0]}` };
      if (server?.toLowerCase().includes("cloudfront")) return { name: "AWS CloudFront", confidence: "high", evidence: `server: ${server}` };
      return undefined;
    },
  },
  {
    name: "Akamai",
    check: (m, server) => {
      if (m.get("x-akamai-transformed")) return { name: "Akamai", confidence: "high", evidence: "x-akamai-transformed header present" };
      if (m.get("x-akamai-request-id")) return { name: "Akamai", confidence: "high", evidence: `x-akamai-request-id: ${m.get("x-akamai-request-id")?.[0]?.slice(0, 16)}…` };
      if (server?.toLowerCase().includes("akamai")) return { name: "Akamai", confidence: "high", evidence: `server: ${server}` };
      if (m.get("akamai-grn")) return { name: "Akamai", confidence: "high", evidence: "akamai-grn header present" };
      return undefined;
    },
  },
  {
    name: "Vercel",
    check: (m) => {
      if (m.get("x-vercel-id")) return { name: "Vercel", confidence: "high", evidence: `x-vercel-id: ${m.get("x-vercel-id")?.[0]?.slice(0, 24)}…` };
      if (m.get("x-vercel-cache")) return { name: "Vercel", confidence: "high", evidence: `x-vercel-cache: ${m.get("x-vercel-cache")?.[0]}` };
      return undefined;
    },
  },
  {
    name: "Netlify",
    check: (m, server) => {
      if (server?.toLowerCase().includes("netlify")) return { name: "Netlify", confidence: "high", evidence: `server: ${server}` };
      if (m.get("x-nf-request-id")) return { name: "Netlify", confidence: "high", evidence: `x-nf-request-id: ${m.get("x-nf-request-id")?.[0]?.slice(0, 16)}…` };
      return undefined;
    },
  },
  {
    name: "GitHub Pages",
    check: (m, server) => {
      if (server?.toLowerCase().includes("github.com")) return { name: "GitHub Pages", confidence: "high", evidence: `server: ${server}` };
      if (m.get("x-github-request-id")) return { name: "GitHub Pages", confidence: "high", evidence: "x-github-request-id present" };
      return undefined;
    },
  },
  {
    name: "Bunny CDN",
    check: (m, server) => {
      if (server?.toLowerCase().startsWith("bunnycdn") || server?.toLowerCase() === "bunnycdn") return { name: "Bunny CDN", confidence: "high", evidence: `server: ${server}` };
      if (m.get("cdn-pullzone")) return { name: "Bunny CDN", confidence: "high", evidence: `cdn-pullzone: ${m.get("cdn-pullzone")?.[0]}` };
      return undefined;
    },
  },
  {
    name: "KeyCDN",
    check: (m, server) => {
      if (server?.toLowerCase() === "keycdn-engine") return { name: "KeyCDN", confidence: "high", evidence: `server: ${server}` };
      return undefined;
    },
  },
  {
    name: "Imperva (Incapsula)",
    check: (m) => {
      if (m.get("x-iinfo")) return { name: "Imperva (Incapsula)", confidence: "high", evidence: "x-iinfo header present" };
      if (m.get("x-cdn") && m.get("x-cdn")?.[0]?.toLowerCase().includes("incapsula")) return { name: "Imperva (Incapsula)", confidence: "high", evidence: `x-cdn: ${m.get("x-cdn")?.[0]}` };
      return undefined;
    },
  },
  {
    name: "Sucuri",
    check: (m, server) => {
      if (server?.toLowerCase() === "sucuri/cloudproxy") return { name: "Sucuri", confidence: "high", evidence: `server: ${server}` };
      if (m.get("x-sucuri-id")) return { name: "Sucuri", confidence: "high", evidence: "x-sucuri-id present" };
      return undefined;
    },
  },
  {
    name: "Google Cloud CDN",
    check: (m) => {
      if (m.get("via")?.some((v) => /google-fe|google internet authority/i.test(v))) return { name: "Google Cloud CDN", confidence: "medium", evidence: `via: ${m.get("via")?.join(", ")}` };
      return undefined;
    },
  },
  {
    name: "Azure CDN",
    check: (m) => {
      if (m.get("x-msedge-ref")) return { name: "Azure CDN (Front Door)", confidence: "high", evidence: `x-msedge-ref: ${m.get("x-msedge-ref")?.[0]?.slice(0, 24)}…` };
      if (m.get("x-azure-ref")) return { name: "Azure CDN", confidence: "high", evidence: `x-azure-ref: ${m.get("x-azure-ref")?.[0]?.slice(0, 16)}…` };
      return undefined;
    },
  },
  {
    name: "Nginx (origin)",
    check: (_m, server) => {
      if (server?.toLowerCase().startsWith("nginx")) return { name: "Nginx (origin)", confidence: "low", evidence: `server: ${server}` };
      return undefined;
    },
  },
  {
    name: "Apache (origin)",
    check: (_m, server) => {
      if (server?.toLowerCase().startsWith("apache")) return { name: "Apache (origin)", confidence: "low", evidence: `server: ${server}` };
      return undefined;
    },
  },
];

export interface CdnReport {
  hits: CdnHit[];
  /** All headers (lowercase) → values. Useful for the UI. */
  byHeader: { name: string; value: string; isSignature: boolean }[];
}

const SIGNATURE_HEADERS = new Set([
  "cf-ray", "cf-cache-status", "x-served-by", "fastly-debug-digest",
  "x-amz-cf-id", "x-amz-cf-pop", "via", "x-akamai-transformed",
  "x-akamai-request-id", "akamai-grn", "x-vercel-id", "x-vercel-cache",
  "x-nf-request-id", "x-github-request-id", "cdn-pullzone", "x-iinfo",
  "x-cdn", "x-sucuri-id", "x-msedge-ref", "x-azure-ref", "server",
]);

export function fingerprint(rawHeaders: string): CdnReport {
  const { headers } = parseHeaders(rawHeaders);
  const byKey = new Map<string, string[]>();
  for (const h of headers) {
    const k = h.key;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(h.value);
  }
  const server = byKey.get("server")?.[0];
  const hits: CdnHit[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    const hit = rule.check(byKey, server);
    if (hit && !seen.has(hit.name)) {
      hits.push(hit);
      seen.add(hit.name);
    }
  }
  return {
    hits,
    byHeader: headers.map((h) => ({
      name: h.name,
      value: h.value,
      isSignature: SIGNATURE_HEADERS.has(h.key),
    })),
  };
}

export const SAMPLE_HEADERS_CDN = `HTTP/2 200
date: Sat, 31 May 2026 22:00:00 GMT
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600
vary: Accept-Encoding
cf-ray: 8a3f9c1e4d2a1234-LAX
cf-cache-status: HIT
server: cloudflare
x-content-type-options: nosniff
alt-svc: h3=":443"; ma=86400`;
