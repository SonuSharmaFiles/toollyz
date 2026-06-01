// Broken Link Checker engine. Paste HTML; we audit every <a> and a
// curated set of resource attributes for patterns that are broken at
// the markup level — without ever leaving the browser to verify the
// URL responds (that's a server-side job).
//
// Categories:
//   - empty href (`href=""` or just `href` without value)
//   - placeholder hrefs (`#`, `javascript:void(0)`, `about:blank`)
//   - whitespace-only hrefs
//   - relative-vs-absolute mixed mode (mailto: missing colon, ftp://, etc.)
//   - mixed content (page is on https but link is http://)
//   - missing rel="noopener" on target="_blank"
//   - duplicate anchor text pointing to different hrefs
//   - same href used as both internal and external
//   - tracking parameters (utm_*, gclid, fbclid) in internal links

export type LinkCategory =
  | "empty"
  | "placeholder"
  | "whitespace"
  | "invalid"
  | "mixed-content"
  | "missing-noopener"
  | "tracking-params"
  | "ok";

export interface LinkRecord {
  index: number;
  href: string;
  text: string;
  rel?: string;
  target?: string;
  categories: LinkCategory[];
}

export interface BrokenLinkReport {
  totalLinks: number;
  uniqueHrefs: number;
  duplicateTextCount: number;
  links: LinkRecord[];
  summary: Record<LinkCategory, number>;
  /** Inputs that aren't anchors but might still be broken: <link>, <script src>, <img src>. */
  resources: { kind: string; href: string; categories: LinkCategory[] }[];
  notes: string[];
  error?: string;
}

const TRACKING_PARAMS = /\b(utm_[a-z_]+|gclid|fbclid|mc_cid|mc_eid|msclkid|yclid|_ga|_gl|ref|ref_src)\b/i;
const PLACEHOLDER_HREFS = new Set([
  "#",
  "javascript:void(0)",
  "javascript:void(0);",
  "javascript:;",
  "javascript:",
  "about:blank",
]);

function isHttps(s: string): boolean {
  return /^https:\/\//i.test(s);
}
function isHttp(s: string): boolean {
  return /^http:\/\//i.test(s);
}

function categorizeAnchor(
  href: string,
  rel: string | undefined,
  target: string | undefined,
  pageIsHttps: boolean,
): LinkCategory[] {
  const cats: LinkCategory[] = [];
  if (href === "") cats.push("empty");
  else if (PLACEHOLDER_HREFS.has(href.toLowerCase().trim())) cats.push("placeholder");
  else if (/^\s+$/.test(href)) cats.push("whitespace");
  else if (/^mailto:[^?]+@/.test(href)) {
    // ok
  } else if (/^tel:[+\d ]+$/.test(href)) {
    // ok
  } else if (isHttp(href) && pageIsHttps) cats.push("mixed-content");
  else if (!/^([a-z]+:|#|\/|\?|\.)/i.test(href)) {
    // Doesn't start with a scheme, fragment, root path, or query-string
    cats.push("invalid");
  }
  if (target === "_blank" && (!rel || !/noopener|noreferrer/i.test(rel))) {
    cats.push("missing-noopener");
  }
  if (TRACKING_PARAMS.test(href)) {
    cats.push("tracking-params");
  }
  if (cats.length === 0) cats.push("ok");
  return cats;
}

export function audit(html: string, pageIsHttps = true): BrokenLinkReport {
  if (typeof DOMParser === "undefined") {
    return {
      totalLinks: 0,
      uniqueHrefs: 0,
      duplicateTextCount: 0,
      links: [],
      summary: emptySummary(),
      resources: [],
      notes: [],
      error: "DOMParser unavailable.",
    };
  }
  if (!html.trim()) {
    return {
      totalLinks: 0,
      uniqueHrefs: 0,
      duplicateTextCount: 0,
      links: [],
      summary: emptySummary(),
      resources: [],
      notes: [],
      error: "Paste HTML or just the <head>.",
    };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Detect if the page declares itself as HTTPS via canonical or og:url.
  const canonical = doc.querySelector("link[rel='canonical']")?.getAttribute("href") ?? "";
  const ogUrl = doc.querySelector("meta[property='og:url']")?.getAttribute("content") ?? "";
  const inferredHttps = isHttps(canonical) || isHttps(ogUrl) || pageIsHttps;

  const anchors = Array.from(doc.querySelectorAll("a"));
  const links: LinkRecord[] = anchors.map((a, idx) => {
    const href = a.getAttribute("href") ?? "";
    const text = (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
    const rel = a.getAttribute("rel") ?? undefined;
    const target = a.getAttribute("target") ?? undefined;
    return {
      index: idx + 1,
      href,
      text,
      rel,
      target,
      categories: categorizeAnchor(href, rel, target, inferredHttps),
    };
  });

  // Resources (link rel, script src, img src, iframe src).
  const resources: BrokenLinkReport["resources"] = [];
  for (const l of Array.from(doc.querySelectorAll("link[rel='stylesheet']"))) {
    const href = l.getAttribute("href") ?? "";
    const cats: LinkCategory[] = [];
    if (!href) cats.push("empty");
    else if (isHttp(href) && inferredHttps) cats.push("mixed-content");
    resources.push({ kind: "stylesheet", href, categories: cats.length ? cats : ["ok"] });
  }
  for (const s of Array.from(doc.querySelectorAll("script[src]"))) {
    const href = s.getAttribute("src") ?? "";
    const cats: LinkCategory[] = [];
    if (!href) cats.push("empty");
    else if (isHttp(href) && inferredHttps) cats.push("mixed-content");
    resources.push({ kind: "script", href, categories: cats.length ? cats : ["ok"] });
  }
  for (const img of Array.from(doc.querySelectorAll("img[src]"))) {
    const href = img.getAttribute("src") ?? "";
    const cats: LinkCategory[] = [];
    if (!href) cats.push("empty");
    else if (isHttp(href) && inferredHttps) cats.push("mixed-content");
    resources.push({ kind: "image", href, categories: cats.length ? cats : ["ok"] });
  }
  for (const f of Array.from(doc.querySelectorAll("iframe[src]"))) {
    const href = f.getAttribute("src") ?? "";
    const cats: LinkCategory[] = [];
    if (!href) cats.push("empty");
    else if (isHttp(href) && inferredHttps) cats.push("mixed-content");
    resources.push({ kind: "iframe", href, categories: cats.length ? cats : ["ok"] });
  }

  // Uniqueness / duplicates.
  const hrefCount = new Map<string, number>();
  for (const l of links) hrefCount.set(l.href, (hrefCount.get(l.href) ?? 0) + 1);
  const textHrefMap = new Map<string, Set<string>>();
  for (const l of links) {
    if (!l.text) continue;
    const key = l.text.toLowerCase();
    if (!textHrefMap.has(key)) textHrefMap.set(key, new Set());
    textHrefMap.get(key)!.add(l.href);
  }
  let duplicateTextCount = 0;
  for (const set of textHrefMap.values()) {
    if (set.size > 1) duplicateTextCount++;
  }

  const summary = emptySummary();
  for (const l of links) for (const c of l.categories) summary[c]++;

  const notes: string[] = [];
  if (links.length === 0) notes.push("No `<a>` elements found.");
  if (summary["placeholder"] > 0) notes.push(`${summary["placeholder"]} link(s) use a placeholder href (#, javascript:, about:blank). Replace with real URLs or use a <button>.`);
  if (summary["missing-noopener"] > 0) notes.push(`${summary["missing-noopener"]} link(s) open in a new tab without rel="noopener" — a known phishing-attack vector.`);
  if (summary["mixed-content"] > 0) notes.push(`${summary["mixed-content"]} link(s) use http:// while the page is HTTPS — browsers block these resources.`);
  if (summary["tracking-params"] > 0) notes.push(`${summary["tracking-params"]} link(s) carry utm_*/gclid/fbclid — strip from internal navigation to keep analytics clean.`);
  if (duplicateTextCount > 0) notes.push(`${duplicateTextCount} unique anchor text(s) point to multiple different URLs — confusing for users and SEO.`);

  return {
    totalLinks: links.length,
    uniqueHrefs: hrefCount.size,
    duplicateTextCount,
    links,
    summary,
    resources,
    notes,
  };
}

function emptySummary(): Record<LinkCategory, number> {
  return {
    empty: 0,
    placeholder: 0,
    whitespace: 0,
    invalid: 0,
    "mixed-content": 0,
    "missing-noopener": 0,
    "tracking-params": 0,
    ok: 0,
  };
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Sample page</title>
<link rel="canonical" href="https://example.com/page" />
<link rel="stylesheet" href="https://cdn.example.com/main.css" />
<script src="https://cdn.example.com/main.js"></script>
</head>
<body>
<h1>Lots of links</h1>
<p>
  <a href="https://example.com/about">About</a> ·
  <a href="">Contact</a> ·
  <a href="#">Pricing</a> ·
  <a href="javascript:void(0)">Toggle</a> ·
  <a href="http://example.com/secure" target="_blank">External (insecure)</a> ·
  <a href="page2.html">Page 2</a> ·
  <a href="https://example.com/blog?utm_source=newsletter&utm_campaign=launch">Read more</a> ·
  <a href="mailto:hello@example.com">Email</a> ·
  <a href="tel:+1234567890">Call</a> ·
  <a href="https://example.com" target="_blank" rel="noopener">Site</a>
</p>
<p>
  <a href="https://example.com/a">Click here</a> and also
  <a href="https://example.com/b">Click here</a>
</p>
<img src="http://insecure.example.com/banner.png" alt="banner" />
<iframe src="https://www.youtube.com/embed/abc"></iframe>
</body>
</html>`;
