// Open Graph Preview engine. Extracts og:*, twitter:*, and key SEO meta
// tags from any HTML input using DOMParser. Builds preview cards that
// mimic how Facebook, X/Twitter, LinkedIn and Slack would render the
// shared URL.

export interface OgData {
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogType?: string;
  ogLocale?: string;
  // Twitter
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  // Generic SEO
  title?: string;
  description?: string;
  canonical?: string;
  favicon?: string;
  charset?: string;
  viewport?: string;
  themeColor?: string;
  /** Any meta tag we extracted but didn't categorise. */
  otherMetas: { name: string; content: string }[];
}

export interface OgValidation {
  data: OgData;
  ok: boolean;
  issues: { severity: "error" | "warning" | "info"; field: string; message: string }[];
}

export function analyse(html: string): OgValidation {
  const issues: OgValidation["issues"] = [];
  if (typeof DOMParser === "undefined") {
    return { data: { otherMetas: [] }, ok: false, issues: [{ severity: "error", field: "engine", message: "DOMParser unavailable." }] };
  }
  if (!html.trim()) {
    return { data: { otherMetas: [] }, ok: false, issues: [{ severity: "error", field: "input", message: "Paste HTML or just the <head> section." }] };
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const data: OgData = { otherMetas: [] };

  data.title = doc.querySelector("title")?.textContent?.trim() ?? undefined;

  for (const meta of Array.from(doc.querySelectorAll("meta"))) {
    const property = meta.getAttribute("property")?.toLowerCase();
    const name = meta.getAttribute("name")?.toLowerCase();
    const content = meta.getAttribute("content")?.trim() ?? "";
    const charsetAttr = meta.getAttribute("charset");
    const httpEquiv = meta.getAttribute("http-equiv")?.toLowerCase();
    if (charsetAttr) data.charset = charsetAttr;
    if (httpEquiv === "content-type" && content.toLowerCase().includes("charset=")) {
      const m = /charset=([^\s;]+)/i.exec(content);
      if (m) data.charset = m[1];
    }
    if (property === "og:title") data.ogTitle = content;
    else if (property === "og:description") data.ogDescription = content;
    else if (property === "og:image") data.ogImage = content;
    else if (property === "og:url") data.ogUrl = content;
    else if (property === "og:site_name") data.ogSiteName = content;
    else if (property === "og:type") data.ogType = content;
    else if (property === "og:locale") data.ogLocale = content;
    else if (name === "twitter:card") data.twitterCard = content;
    else if (name === "twitter:title") data.twitterTitle = content;
    else if (name === "twitter:description") data.twitterDescription = content;
    else if (name === "twitter:image" || name === "twitter:image:src") data.twitterImage = content;
    else if (name === "twitter:site") data.twitterSite = content;
    else if (name === "twitter:creator") data.twitterCreator = content;
    else if (name === "description") data.description = content;
    else if (name === "viewport") data.viewport = content;
    else if (name === "theme-color") data.themeColor = content;
    else if (property || name) data.otherMetas.push({ name: property ?? name ?? "", content });
  }

  const canonicalLink = doc.querySelector("link[rel='canonical']");
  if (canonicalLink) data.canonical = canonicalLink.getAttribute("href") ?? undefined;
  const faviconLink = doc.querySelector("link[rel='icon'], link[rel='shortcut icon']");
  if (faviconLink) data.favicon = faviconLink.getAttribute("href") ?? undefined;

  // Validation rules.
  function require(field: keyof OgData, label: string, severity: "warning" | "error" | "info" = "warning") {
    if (!data[field]) issues.push({ severity, field: label, message: `Missing ${label}.` });
  }
  function length(field: keyof OgData, label: string, recommended: [number, number]) {
    const v = data[field];
    if (typeof v !== "string") return;
    if (v.length < recommended[0]) issues.push({ severity: "info", field: label, message: `${label} is ${v.length} chars — under ${recommended[0]} recommended.` });
    if (v.length > recommended[1]) issues.push({ severity: "warning", field: label, message: `${label} is ${v.length} chars — over ${recommended[1]} may be truncated.` });
  }

  if (!data.ogTitle && !data.title) issues.push({ severity: "error", field: "title", message: "No <title> or og:title — share previews will be empty." });
  require("ogTitle", "og:title", data.title ? "warning" : "error");
  require("ogDescription", "og:description");
  require("ogImage", "og:image");
  require("ogUrl", "og:url");
  require("twitterCard", "twitter:card", "info");
  if (!data.canonical) issues.push({ severity: "info", field: "canonical", message: "No canonical link — rel=canonical helps Google pick the preferred URL." });
  length("ogTitle", "og:title", [30, 60]);
  length("ogDescription", "og:description", [50, 200]);
  length("description", "meta description", [50, 160]);
  length("title", "<title>", [30, 60]);
  if (data.ogImage && !/^https?:\/\//i.test(data.ogImage)) {
    issues.push({ severity: "warning", field: "og:image", message: "og:image should be an absolute URL (http/https), not a relative path." });
  }
  if (data.twitterCard && !["summary", "summary_large_image", "app", "player"].includes(data.twitterCard)) {
    issues.push({ severity: "warning", field: "twitter:card", message: `Unknown twitter:card value '${data.twitterCard}' — expected summary, summary_large_image, app, or player.` });
  }

  return { data, ok: issues.filter((i) => i.severity === "error").length === 0, issues };
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Toollyz — Privacy-first browser tools</title>
<meta name="description" content="Free tools that run entirely in your browser — no sign-up, no upload, no tracking. Over 250 utilities across text, developer, image and converter categories." />
<link rel="canonical" href="https://toollyz.com" />
<link rel="icon" href="/favicon.ico" />
<meta property="og:title" content="Toollyz — Privacy-first browser tools" />
<meta property="og:description" content="250+ free tools that run entirely in your browser. No sign-up, no upload, no tracking." />
<meta property="og:url" content="https://toollyz.com" />
<meta property="og:image" content="https://toollyz.com/og-image.png" />
<meta property="og:site_name" content="Toollyz" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Toollyz — Privacy-first browser tools" />
<meta name="twitter:description" content="250+ free tools that run entirely in your browser." />
<meta name="twitter:image" content="https://toollyz.com/og-image.png" />
<meta name="twitter:site" content="@toollyz" />
<meta name="theme-color" content="#0f766e" />
</head>
<body></body>
</html>`;
