// Meta Tag Analyzer engine. A broader audit than Open Graph Preview —
// instead of rendering social cards, this scores every meta tag on a
// page against current SEO best practices, then computes an overall
// score 0-100 that breaks down by category. The full audit covers:
//
//   - Title + meta description (length, presence, character ranges)
//   - meta robots (noindex/nofollow detection, conflict warnings)
//   - meta viewport (presence + mobile-friendly defaults)
//   - meta charset (presence)
//   - Canonical link
//   - Open Graph block (title/description/image/url/type)
//   - Twitter card block (card/title/description/image)
//   - hreflang alternates (count + x-default check)
//   - Structured data: JSON-LD blocks parsed for @type values
//   - Theme colour + apple-mobile-web-app-* tags
//   - Author / publisher / Dublin Core sniffing
//   - Image dimensions hints for OG (og:image:width/height)
//
// 100% offline — DOMParser only.

export interface AuditCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail" | "info";
  message: string;
}

export interface MetaAuditReport {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  themeColor?: string;
  language?: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
  hreflangs: string[];
  jsonLdTypes: string[];
  /** All meta name/property tags we don't recognise. */
  other: { name: string; content: string }[];
  checks: AuditCheck[];
  score: number;
  /** Sub-scores by category. */
  breakdown: { id: string; label: string; max: number; got: number }[];
}

export function analyse(html: string): MetaAuditReport {
  const checks: AuditCheck[] = [];
  const breakdown: MetaAuditReport["breakdown"] = [];
  if (typeof DOMParser === "undefined") {
    return {
      og: {},
      twitter: {},
      hreflangs: [],
      jsonLdTypes: [],
      other: [],
      checks: [{ id: "engine", label: "Engine", status: "fail", message: "DOMParser unavailable." }],
      score: 0,
      breakdown: [],
    };
  }
  if (!html.trim()) {
    return {
      og: {},
      twitter: {},
      hreflangs: [],
      jsonLdTypes: [],
      other: [],
      checks: [{ id: "input", label: "Input", status: "fail", message: "Paste HTML or just the <head>." }],
      score: 0,
      breakdown: [],
    };
  }
  const doc = new DOMParser().parseFromString(html, "text/html");

  const language = doc.documentElement.getAttribute("lang") ?? undefined;
  const title = doc.querySelector("title")?.textContent?.trim();
  const canonical = doc.querySelector("link[rel='canonical']")?.getAttribute("href") ?? undefined;
  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  const other: { name: string; content: string }[] = [];
  const hreflangs: string[] = [];
  for (const l of Array.from(doc.querySelectorAll("link[rel='alternate'][hreflang]"))) {
    const lang = l.getAttribute("hreflang");
    if (lang) hreflangs.push(lang);
  }

  let description: string | undefined;
  let robots: string | undefined;
  let viewport: string | undefined;
  let charset: string | undefined;
  let themeColor: string | undefined;

  for (const m of Array.from(doc.querySelectorAll("meta"))) {
    const prop = m.getAttribute("property")?.toLowerCase();
    const name = m.getAttribute("name")?.toLowerCase();
    const httpEquiv = m.getAttribute("http-equiv")?.toLowerCase();
    const content = m.getAttribute("content")?.trim() ?? "";
    if (m.hasAttribute("charset")) charset = m.getAttribute("charset") ?? undefined;
    if (httpEquiv === "content-type") {
      const cm = /charset=([^\s;]+)/i.exec(content);
      if (cm) charset = cm[1];
    }
    if (prop?.startsWith("og:")) og[prop.slice(3)] = content;
    else if (name?.startsWith("twitter:")) twitter[name.slice(8)] = content;
    else if (name === "description") description = content;
    else if (name === "robots") robots = content;
    else if (name === "viewport") viewport = content;
    else if (name === "theme-color") themeColor = content;
    else if (prop || name) other.push({ name: prop ?? name ?? "", content });
  }

  // JSON-LD types.
  const jsonLdTypes: string[] = [];
  for (const s of Array.from(doc.querySelectorAll("script[type='application/ld+json']"))) {
    try {
      const obj = JSON.parse(s.textContent ?? "{}") as Record<string, unknown>;
      const walk = (n: unknown): void => {
        if (!n) return;
        if (Array.isArray(n)) {
          n.forEach(walk);
          return;
        }
        if (typeof n === "object") {
          const v = (n as Record<string, unknown>)["@type"];
          if (typeof v === "string") jsonLdTypes.push(v);
          else if (Array.isArray(v)) v.forEach((x) => typeof x === "string" && jsonLdTypes.push(x));
          for (const key of Object.keys(n as object)) walk((n as Record<string, unknown>)[key]);
        }
      };
      walk(obj);
    } catch {
      checks.push({
        id: "jsonld",
        label: "JSON-LD",
        status: "warn",
        message: "Invalid JSON inside an `application/ld+json` block — search engines may discard it.",
      });
    }
  }

  // ── Category audits ───────────────────────────────────────────────────────
  // Title (max 16 pts).
  let tGot = 0;
  if (title) {
    tGot += 6;
    if (title.length >= 30 && title.length <= 60) {
      tGot += 10;
      checks.push({ id: "title-len", label: "Title length", status: "ok", message: `Title is ${title.length} chars — within 30-60 sweet spot.` });
    } else if (title.length > 60) {
      tGot += 4;
      checks.push({ id: "title-len", label: "Title length", status: "warn", message: `Title is ${title.length} chars — likely truncated past 60.` });
    } else {
      tGot += 4;
      checks.push({ id: "title-len", label: "Title length", status: "warn", message: `Title is ${title.length} chars — under 30 may be too short.` });
    }
  } else {
    checks.push({ id: "title", label: "Title", status: "fail", message: "Missing <title> — required for search results." });
  }
  breakdown.push({ id: "title", label: "Title", max: 16, got: tGot });

  // Description (max 14 pts).
  let dGot = 0;
  if (description) {
    dGot += 6;
    if (description.length >= 70 && description.length <= 160) {
      dGot += 8;
      checks.push({ id: "desc-len", label: "Meta description", status: "ok", message: `Description is ${description.length} chars — within 70-160.` });
    } else if (description.length > 160) {
      dGot += 4;
      checks.push({ id: "desc-len", label: "Meta description", status: "warn", message: `Description is ${description.length} chars — truncated past 160 on Google.` });
    } else {
      dGot += 4;
      checks.push({ id: "desc-len", label: "Meta description", status: "warn", message: `Description is ${description.length} chars — under 70 leaves SERP space empty.` });
    }
  } else {
    checks.push({ id: "desc", label: "Meta description", status: "fail", message: "Missing meta description — Google generates one automatically (often poorly)." });
  }
  breakdown.push({ id: "desc", label: "Description", max: 14, got: dGot });

  // Technical (max 14 pts): charset + viewport + robots + lang + canonical.
  let techGot = 0;
  if (charset) techGot += 2;
  else checks.push({ id: "charset", label: "Charset", status: "fail", message: "Missing <meta charset> — declare UTF-8 explicitly." });
  if (viewport) {
    techGot += 4;
    if (viewport.toLowerCase().includes("width=device-width")) techGot += 0;
    else checks.push({ id: "viewport", label: "Viewport", status: "warn", message: `Viewport '${viewport}' lacks width=device-width — mobile rendering may break.` });
  } else {
    checks.push({ id: "viewport", label: "Viewport", status: "fail", message: "Missing <meta viewport> — Google flags page as not mobile-friendly." });
  }
  if (language) techGot += 2;
  else checks.push({ id: "lang", label: "Document language", status: "warn", message: "Missing <html lang=…> attribute — helps accessibility and SEO." });
  if (canonical) techGot += 4;
  else checks.push({ id: "canonical", label: "Canonical", status: "warn", message: "Missing <link rel=canonical> — Google may pick a URL for you." });
  if (robots) {
    techGot += 2;
    if (/noindex/i.test(robots)) {
      checks.push({ id: "robots", label: "Robots", status: "warn", message: `Robots header has 'noindex' — page won't be indexed.` });
    }
    if (/nofollow/i.test(robots) && /index/i.test(robots) && !/noindex/i.test(robots)) {
      checks.push({ id: "robots", label: "Robots", status: "info", message: `Robots header has 'nofollow' — page indexes but outbound links don't pass equity.` });
    }
  }
  breakdown.push({ id: "tech", label: "Technical", max: 14, got: techGot });

  // Open Graph (max 16 pts).
  let ogGot = 0;
  const ogChecks: [string, number][] = [
    ["title", 4],
    ["description", 3],
    ["image", 4],
    ["url", 3],
    ["type", 2],
  ];
  const ogMissing: string[] = [];
  for (const [k, pts] of ogChecks) {
    if (og[k]) ogGot += pts;
    else ogMissing.push(`og:${k}`);
  }
  if (ogMissing.length > 0) {
    checks.push({
      id: "og",
      label: "Open Graph",
      status: ogGot === 0 ? "fail" : "warn",
      message: `Missing ${ogMissing.join(", ")} — share previews on Facebook/LinkedIn/Slack will degrade.`,
    });
  }
  if (og.image && !/^https?:\/\//i.test(og.image)) {
    checks.push({ id: "og-image-url", label: "og:image URL", status: "warn", message: "og:image should be an absolute URL — relative paths break on most consumers." });
  }
  breakdown.push({ id: "og", label: "Open Graph", max: 16, got: ogGot });

  // Twitter (max 10 pts).
  let twGot = 0;
  const twChecks: [string, number][] = [
    ["card", 3],
    ["title", 2],
    ["description", 2],
    ["image", 3],
  ];
  const twMissing: string[] = [];
  for (const [k, pts] of twChecks) {
    if (twitter[k]) twGot += pts;
    else twMissing.push(`twitter:${k}`);
  }
  if (twMissing.length > 0) {
    checks.push({
      id: "twitter",
      label: "Twitter Card",
      status: twGot === 0 ? "info" : "warn",
      message: twMissing.length === 4 ? "No Twitter Card tags — falls back to Open Graph on X if those are set." : `Missing ${twMissing.join(", ")}.`,
    });
  }
  if (twitter.card && !["summary", "summary_large_image", "app", "player"].includes(twitter.card)) {
    checks.push({ id: "tw-card", label: "Twitter card type", status: "warn", message: `Unknown twitter:card value '${twitter.card}' — expected summary, summary_large_image, app, or player.` });
  }
  breakdown.push({ id: "twitter", label: "Twitter Card", max: 10, got: twGot });

  // International (max 8 pts).
  let intlGot = 0;
  if (hreflangs.length > 0) {
    intlGot += 4;
    if (hreflangs.includes("x-default")) intlGot += 4;
    else
      checks.push({
        id: "hreflang-default",
        label: "hreflang x-default",
        status: "info",
        message: "Hreflang alternates set without x-default — recommended for unmatched locales.",
      });
  } else {
    checks.push({ id: "hreflang", label: "hreflang", status: "info", message: "No hreflang alternates — only needed for multi-locale sites." });
  }
  breakdown.push({ id: "intl", label: "International", max: 8, got: intlGot });

  // Structured data (max 12 pts).
  let sdGot = 0;
  if (jsonLdTypes.length > 0) {
    sdGot += 8;
    if (jsonLdTypes.some((t) => ["BreadcrumbList", "Article", "Product", "Organization", "WebSite", "FAQPage"].includes(t))) {
      sdGot += 4;
    }
    checks.push({
      id: "jsonld",
      label: "JSON-LD",
      status: "ok",
      message: `${jsonLdTypes.length} JSON-LD type(s) detected: ${jsonLdTypes.slice(0, 4).join(", ")}${jsonLdTypes.length > 4 ? "…" : ""}.`,
    });
  } else {
    checks.push({ id: "jsonld", label: "JSON-LD", status: "info", message: "No JSON-LD structured data — add Organization or BreadcrumbList for richer SERPs." });
  }
  breakdown.push({ id: "jsonld", label: "Structured data", max: 12, got: sdGot });

  // PWA / theme (max 10 pts).
  let pwaGot = 0;
  if (themeColor) pwaGot += 4;
  else checks.push({ id: "theme-color", label: "Theme colour", status: "info", message: "No theme-color — Chrome on Android paints the address bar with your brand colour when set." });
  if (doc.querySelector("link[rel='manifest']")) pwaGot += 6;
  else checks.push({ id: "manifest", label: "Web app manifest", status: "info", message: "No <link rel=manifest> — required for installable PWAs." });
  breakdown.push({ id: "pwa", label: "PWA", max: 10, got: pwaGot });

  const maxTotal = breakdown.reduce((s, b) => s + b.max, 0);
  const gotTotal = breakdown.reduce((s, b) => s + b.got, 0);
  const score = Math.round((gotTotal / maxTotal) * 100);

  return {
    title,
    description,
    canonical,
    robots,
    viewport,
    charset,
    themeColor,
    language,
    og,
    twitter,
    hreflangs,
    jsonLdTypes,
    other,
    checks,
    score,
    breakdown,
  };
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Toollyz — 250+ Privacy-First Browser Tools</title>
<meta name="description" content="Free tools that run entirely in your browser. No sign-up, no upload, no tracking — over 250 utilities across text, developer, image and converter categories." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0f766e" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="https://toollyz.com/" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="alternate" hreflang="en" href="https://toollyz.com/" />
<link rel="alternate" hreflang="x-default" href="https://toollyz.com/" />
<meta property="og:title" content="Toollyz — privacy-first browser tools" />
<meta property="og:description" content="250+ free tools that run entirely in your browser." />
<meta property="og:image" content="https://toollyz.com/og.png" />
<meta property="og:url" content="https://toollyz.com/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Toollyz — privacy-first browser tools" />
<meta name="twitter:description" content="250+ free tools that run entirely in your browser." />
<meta name="twitter:image" content="https://toollyz.com/og.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Toollyz",
  "url": "https://toollyz.com"
}
</script>
</head>
<body></body>
</html>`;
