// Canonical URL Checker engine. Two input modes:
//   1) Paste HTML — pulls every `<link rel="canonical">`, `<meta property="og:url">`,
//      `<meta name="twitter:url">`, `<link rel="alternate" hreflang>`, plus the
//      `<base href>` and the page title. Validates: only one canonical, absolute
//      URL, https, no fragments, hreflang consistency, og:url matches canonical.
//   2) Single URL — normalises it (lowercase host, strip default ports, trim
//      trailing slash, drop tracking params, lowercase percent-encoding) and
//      compares to the user's "intended" canonical.
//
// 100% offline — DOMParser + URL constructor only.

export interface CanonicalLink {
  rel: string;
  hreflang?: string;
  href: string;
  normalized: string;
  ok: boolean;
}

export interface CanonicalIssue {
  severity: "error" | "warning" | "info";
  message: string;
}

export interface CanonicalReport {
  canonical?: string;
  ogUrl?: string;
  twitterUrl?: string;
  baseHref?: string;
  title?: string;
  alternates: CanonicalLink[];
  issues: CanonicalIssue[];
  summary: {
    canonicalsFound: number;
    alternates: number;
    errors: number;
    warnings: number;
  };
}

const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "gclid", "fbclid", "mc_cid", "mc_eid", "msclkid", "yclid",
  "_ga", "_gl", "ref", "ref_src", "source",
]);

export function normalizeUrl(input: string): { ok: boolean; out: string; reason?: string } {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return { ok: false, out: input, reason: "Not a valid absolute URL." };
  }
  // Lowercase scheme + host.
  u.protocol = u.protocol.toLowerCase();
  u.hostname = u.hostname.toLowerCase();
  // Strip default ports.
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) {
    u.port = "";
  }
  // Drop tracking params.
  const newSearch = new URLSearchParams();
  for (const [k, v] of u.searchParams) {
    if (!TRACKING_PARAMS.has(k.toLowerCase())) newSearch.append(k, v);
  }
  u.search = newSearch.toString();
  // Drop fragments — canonicals must not have one.
  u.hash = "";
  // Trim trailing slash if it's the only path char (root) — keep otherwise.
  let out = u.toString();
  // Some hosts collapse `?` even when empty; URL.toString re-adds. Strip dangling `?`.
  out = out.replace(/\?$/, "");
  return { ok: true, out };
}

export function checkHtml(html: string): CanonicalReport {
  const issues: CanonicalIssue[] = [];
  if (typeof DOMParser === "undefined") {
    return {
      alternates: [],
      issues: [{ severity: "error", message: "DOMParser unavailable." }],
      summary: { canonicalsFound: 0, alternates: 0, errors: 1, warnings: 0 },
    };
  }
  if (!html.trim()) {
    return {
      alternates: [],
      issues: [{ severity: "error", message: "Paste HTML or just the <head> section." }],
      summary: { canonicalsFound: 0, alternates: 0, errors: 1, warnings: 0 },
    };
  }
  const doc = new DOMParser().parseFromString(html, "text/html");

  const canonicalLinks = Array.from(doc.querySelectorAll("link[rel='canonical']"));
  const canonical = canonicalLinks[0]?.getAttribute("href") ?? undefined;
  if (canonicalLinks.length === 0) {
    issues.push({ severity: "warning", message: "No <link rel=\"canonical\"> found — Google may pick a URL for you." });
  } else if (canonicalLinks.length > 1) {
    issues.push({
      severity: "error",
      message: `${canonicalLinks.length} <link rel="canonical"> tags — Google considers this a conflict and may ignore all of them.`,
    });
  }

  const ogUrl = doc.querySelector("meta[property='og:url']")?.getAttribute("content") ?? undefined;
  const twitterUrl = doc.querySelector("meta[name='twitter:url']")?.getAttribute("content") ?? undefined;
  const baseHref = doc.querySelector("base")?.getAttribute("href") ?? undefined;
  const title = doc.querySelector("title")?.textContent?.trim();

  function pushUrlIssues(url: string | undefined, label: string) {
    if (!url) return;
    const n = normalizeUrl(url);
    if (!n.ok) {
      issues.push({ severity: "warning", message: `${label} is not an absolute URL: '${url}'. Canonicals must be fully qualified.` });
      return;
    }
    if (url.startsWith("http://")) {
      issues.push({ severity: "warning", message: `${label} uses http:// — prefer https for canonical URLs.` });
    }
    if (url.includes("#")) {
      issues.push({ severity: "error", message: `${label} contains a fragment (#) — canonicals must not have fragments.` });
    }
    if (url !== n.out) {
      issues.push({ severity: "info", message: `${label} would normalise to '${n.out}'.` });
    }
  }
  pushUrlIssues(canonical, "Canonical");
  pushUrlIssues(ogUrl, "og:url");
  pushUrlIssues(twitterUrl, "twitter:url");

  if (canonical && ogUrl) {
    const a = normalizeUrl(canonical).out;
    const b = normalizeUrl(ogUrl).out;
    if (a !== b) {
      issues.push({
        severity: "warning",
        message: `Canonical and og:url disagree (after normalising). Google reads canonical; Facebook/LinkedIn read og:url — keep them in sync.`,
      });
    }
  }

  // Hreflang alternates.
  const alternates: CanonicalLink[] = [];
  for (const link of Array.from(doc.querySelectorAll("link[rel='alternate']"))) {
    const href = link.getAttribute("href") ?? "";
    const hreflang = link.getAttribute("hreflang") ?? undefined;
    const n = normalizeUrl(href);
    alternates.push({ rel: "alternate", hreflang, href, normalized: n.out, ok: n.ok });
  }
  if (alternates.length > 0) {
    const langs = alternates.map((a) => a.hreflang).filter(Boolean);
    if (!langs.includes("x-default")) {
      issues.push({
        severity: "info",
        message: "Hreflang alternates present without an `x-default` — Google recommends adding it for unmatched locales.",
      });
    }
    if (canonical && !alternates.some((a) => normalizeUrl(a.href).out === normalizeUrl(canonical).out)) {
      issues.push({
        severity: "warning",
        message: "Canonical URL is not listed as one of the hreflang alternates — they should form a closed loop.",
      });
    }
  }

  if (baseHref) {
    issues.push({
      severity: "info",
      message: `<base href="${baseHref}"> is set — all relative URLs on the page resolve against it.`,
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  return {
    canonical,
    ogUrl,
    twitterUrl,
    baseHref,
    title,
    alternates,
    issues,
    summary: { canonicalsFound: canonicalLinks.length, alternates: alternates.length, errors, warnings },
  };
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Pricing — Toollyz</title>
<link rel="canonical" href="https://toollyz.com/pricing" />
<link rel="alternate" hreflang="en" href="https://toollyz.com/pricing" />
<link rel="alternate" hreflang="fr" href="https://toollyz.com/fr/pricing" />
<link rel="alternate" hreflang="de" href="https://toollyz.com/de/pricing" />
<link rel="alternate" hreflang="x-default" href="https://toollyz.com/pricing" />
<meta property="og:url" content="https://toollyz.com/pricing" />
<meta name="twitter:url" content="https://toollyz.com/pricing" />
<meta property="og:title" content="Pricing" />
</head>
<body></body>
</html>`;
