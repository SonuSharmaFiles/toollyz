// Sitemap Validator engine. Parses XML sitemaps via DOMParser (browser-
// native, no dep), validates the structure against the sitemaps.org spec,
// extracts every URL, and surfaces common SEO issues: missing/invalid
// <loc>, lastmod date validation, priority range checks, duplicate URLs,
// HTTPS warnings, sitemap-index nesting.

export type SitemapKind = "urlset" | "sitemapindex" | "invalid";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  lastmodValid?: boolean;
  changefreq?: string;
  priority?: number;
  /** Sitemap index entries link to other sitemaps. */
  isIndex?: boolean;
}

export interface SitemapValidation {
  kind: SitemapKind;
  /** Parsed URLs (urlset) or child sitemaps (sitemapindex). */
  urls: SitemapUrl[];
  /** Total URL count — for sitemap index this is the number of child sitemaps. */
  count: number;
  /** Issues — informational, warnings and errors. */
  issues: Issue[];
  /** Bytes of the input. */
  bytes: number;
  error?: string;
}

export interface Issue {
  severity: "error" | "warning" | "info";
  message: string;
  /** Line where the issue was detected, when known. */
  line?: number;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
const VALID_CHANGEFREQ = new Set([
  "always", "hourly", "daily", "weekly", "monthly", "yearly", "never",
]);

export function validate(text: string): SitemapValidation {
  const bytes = text.length;
  if (typeof DOMParser === "undefined") {
    return { kind: "invalid", urls: [], count: 0, issues: [{ severity: "error", message: "DOMParser is not available." }], bytes, error: "DOMParser unavailable." };
  }
  if (!text.trim()) {
    return { kind: "invalid", urls: [], count: 0, issues: [{ severity: "error", message: "Empty sitemap." }], bytes };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  const errorEl = doc.querySelector("parsererror");
  const issues: Issue[] = [];
  if (errorEl) {
    issues.push({ severity: "error", message: `XML parse error: ${errorEl.textContent?.split("\n")[0] ?? "unknown"}` });
    return { kind: "invalid", urls: [], count: 0, issues, bytes };
  }

  const root = doc.documentElement;
  if (!root) {
    issues.push({ severity: "error", message: "No root element." });
    return { kind: "invalid", urls: [], count: 0, issues, bytes };
  }
  const rootName = root.tagName.toLowerCase();
  let kind: SitemapKind;
  if (rootName === "urlset") kind = "urlset";
  else if (rootName === "sitemapindex") kind = "sitemapindex";
  else {
    issues.push({
      severity: "error",
      message: `Root element must be <urlset> or <sitemapindex> — got <${root.tagName}>.`,
    });
    return { kind: "invalid", urls: [], count: 0, issues, bytes };
  }

  // Recommended xmlns check.
  const xmlns = root.getAttribute("xmlns") ?? "";
  if (!xmlns.includes("sitemaps.org/schemas/sitemap")) {
    issues.push({
      severity: "warning",
      message: "Missing or non-standard xmlns — expected http://www.sitemaps.org/schemas/sitemap/0.9.",
    });
  }

  const urls: SitemapUrl[] = [];
  const seen = new Set<string>();

  const entries = Array.from(root.children);
  for (const entry of entries) {
    const tag = entry.tagName.toLowerCase();
    if ((kind === "urlset" && tag !== "url") || (kind === "sitemapindex" && tag !== "sitemap")) {
      issues.push({
        severity: "warning",
        message: `Unexpected child element <${entry.tagName}> — expected <${kind === "urlset" ? "url" : "sitemap"}>.`,
      });
      continue;
    }
    const u: SitemapUrl = { loc: "" };
    if (kind === "sitemapindex") u.isIndex = true;
    for (const child of Array.from(entry.children)) {
      const t = child.tagName.toLowerCase();
      const v = child.textContent?.trim() ?? "";
      if (t === "loc") u.loc = v;
      else if (t === "lastmod") {
        u.lastmod = v;
        u.lastmodValid = ISO_DATE_RE.test(v) && !Number.isNaN(new Date(v).getTime());
        if (!u.lastmodValid) {
          issues.push({ severity: "warning", message: `Invalid <lastmod>: '${v}' on ${u.loc || "(no loc)"} — expected ISO 8601.` });
        }
      } else if (t === "changefreq") {
        u.changefreq = v;
        if (!VALID_CHANGEFREQ.has(v.toLowerCase())) {
          issues.push({ severity: "warning", message: `Invalid <changefreq>: '${v}' on ${u.loc || "(no loc)"} — expected one of ${[...VALID_CHANGEFREQ].join(", ")}.` });
        }
      } else if (t === "priority") {
        const p = parseFloat(v);
        u.priority = p;
        if (!Number.isFinite(p) || p < 0 || p > 1) {
          issues.push({ severity: "warning", message: `Invalid <priority>: '${v}' on ${u.loc || "(no loc)"} — expected 0.0–1.0.` });
        }
      }
    }
    if (!u.loc) {
      issues.push({ severity: "error", message: "Missing <loc> in a URL entry." });
      continue;
    }
    if (!/^https?:\/\//i.test(u.loc)) {
      issues.push({ severity: "warning", message: `<loc> should be an absolute URL — got '${u.loc}'.` });
    } else if (u.loc.startsWith("http://")) {
      issues.push({ severity: "info", message: `<loc> uses http:// (consider https): '${u.loc}'.` });
    }
    if (u.loc.length > 2048) {
      issues.push({ severity: "warning", message: `<loc> exceeds 2,048 characters — '${u.loc.slice(0, 60)}…'.` });
    }
    if (seen.has(u.loc)) {
      issues.push({ severity: "warning", message: `Duplicate <loc>: '${u.loc}'.` });
    }
    seen.add(u.loc);
    urls.push(u);
  }

  if (urls.length === 0) {
    issues.push({ severity: "error", message: "No URLs / sitemaps found in the document." });
  }
  if (kind === "urlset" && urls.length > 50_000) {
    issues.push({ severity: "warning", message: `${urls.length.toLocaleString()} URLs — sitemap.xml has a 50,000-URL limit.` });
  }
  if (bytes > 50 * 1024 * 1024) {
    issues.push({ severity: "warning", message: `${(bytes / 1024 / 1024).toFixed(1)} MB — sitemap files have a 50 MB limit.` });
  }

  return { kind, urls, count: urls.length, issues, bytes };
}

export const SAMPLE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-05-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-04-12T14:30:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <lastmod>2026-05-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://example.com/contact</loc>
    <lastmod>2026-01-08</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
