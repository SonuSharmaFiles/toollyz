// Meta-tag generator engine for the Toollyz Meta Tag Generator. Builds a
// standards-conformant <head> snippet with title, description, robots, Open
// Graph and Twitter Card tags from a structured input, and runs lightweight
// SEO checks (length, image presence, canonical URL etc) to produce a score
// and human-friendly issues list. Pure functions, no DOM or fetch.

export type OgType =
  | "website"
  | "article"
  | "book"
  | "profile"
  | "video.other"
  | "music.song";

export type TwitterCardType =
  | "summary"
  | "summary_large_image"
  | "app"
  | "player";

export interface MetaInput {
  // Standard
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  language: string;
  // Canonical & icons
  canonical: string;
  favicon: string;
  themeColor: string;
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogType: OgType;
  ogImage: string;
  ogImageAlt: string;
  ogUrl: string;
  ogSiteName: string;
  ogLocale: string;
  // Twitter Card
  twitterCard: TwitterCardType;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  // Misc
  viewport: string;
  charset: string;
}

export const DEFAULT_META: MetaInput = {
  title: "Toollyz — 200+ free, private browser tools",
  description:
    "Toollyz is a fast, ad-light collection of 200+ utilities — converters, generators, network testers and more — that run entirely in your browser.",
  keywords: "toollyz, free tools, online tools, browser tools",
  author: "",
  robots: "index, follow",
  language: "en",
  canonical: "https://toollyz.com/",
  favicon: "/favicon.ico",
  themeColor: "#0b1020",
  ogTitle: "",
  ogDescription: "",
  ogType: "website",
  ogImage: "https://toollyz.com/og.png",
  ogImageAlt: "Toollyz — 200+ free, private browser tools",
  ogUrl: "",
  ogSiteName: "Toollyz",
  ogLocale: "en_US",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  viewport: "width=device-width, initial-scale=1",
  charset: "UTF-8",
};

const OG_TYPES: OgType[] = ["website", "article", "book", "profile", "video.other", "music.song"];
const TWITTER_CARDS: TwitterCardType[] = ["summary", "summary_large_image", "app", "player"];
export const OG_TYPE_OPTIONS = OG_TYPES;
export const TWITTER_CARD_OPTIONS = TWITTER_CARDS;

function escAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function metaTag(name: string, content: string, attr: "name" | "property" | "http-equiv" = "name"): string {
  if (!content) return "";
  return `  <meta ${attr}="${name}" content="${escAttr(content)}" />`;
}

/**
 * Build the rendered <head> HTML snippet from the structured input.
 * Empty fields are silently omitted (no `content=""` attributes).
 */
export function generateHtml(input: MetaInput): string {
  const m = input;
  const ogTitle = m.ogTitle || m.title;
  const ogDescription = m.ogDescription || m.description;
  const ogUrl = m.ogUrl || m.canonical;
  const ogImage = m.ogImage;
  const twTitle = m.twitterTitle || ogTitle;
  const twDescription = m.twitterDescription || ogDescription;
  const twImage = m.twitterImage || ogImage;

  const out: string[] = ["<head>"];
  if (m.charset) out.push(`  <meta charset="${escAttr(m.charset)}" />`);
  if (m.viewport) out.push(`  <meta name="viewport" content="${escAttr(m.viewport)}" />`);
  if (m.language) out.push(`  <meta http-equiv="content-language" content="${escAttr(m.language)}" />`);
  if (m.title) out.push(`  <title>${escAttr(m.title)}</title>`);
  if (m.description) out.push(metaTag("description", m.description));
  if (m.keywords.trim()) out.push(metaTag("keywords", m.keywords));
  if (m.author) out.push(metaTag("author", m.author));
  if (m.robots) out.push(metaTag("robots", m.robots));
  if (m.themeColor) out.push(metaTag("theme-color", m.themeColor));
  if (m.canonical) out.push(`  <link rel="canonical" href="${escAttr(m.canonical)}" />`);
  if (m.favicon) out.push(`  <link rel="icon" href="${escAttr(m.favicon)}" />`);

  out.push("");
  out.push("  <!-- Open Graph / Facebook / LinkedIn -->");
  if (ogTitle) out.push(metaTag("og:title", ogTitle, "property"));
  if (ogDescription) out.push(metaTag("og:description", ogDescription, "property"));
  out.push(metaTag("og:type", m.ogType, "property"));
  if (ogImage) out.push(metaTag("og:image", ogImage, "property"));
  if (m.ogImageAlt) out.push(metaTag("og:image:alt", m.ogImageAlt, "property"));
  if (ogUrl) out.push(metaTag("og:url", ogUrl, "property"));
  if (m.ogSiteName) out.push(metaTag("og:site_name", m.ogSiteName, "property"));
  if (m.ogLocale) out.push(metaTag("og:locale", m.ogLocale, "property"));

  out.push("");
  out.push("  <!-- Twitter Card -->");
  out.push(metaTag("twitter:card", m.twitterCard));
  if (m.twitterSite) out.push(metaTag("twitter:site", m.twitterSite));
  if (m.twitterCreator) out.push(metaTag("twitter:creator", m.twitterCreator));
  if (twTitle) out.push(metaTag("twitter:title", twTitle));
  if (twDescription) out.push(metaTag("twitter:description", twDescription));
  if (twImage) out.push(metaTag("twitter:image", twImage));

  out.push("</head>");
  // Squash duplicate blanks
  return out
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}

export type IssueLevel = "error" | "warn" | "info";
export interface Issue { level: IssueLevel; field: string; msg: string }

const URL_RE = /^https?:\/\/[^\s]+$/i;

/**
 * Lightweight SEO checklist. Returns issues + a 0–100 score (errors weigh more
 * than warnings). Designed to be useful, not pedantic — every check matches a
 * real concern a marketer or developer would care about.
 */
export function analyze(input: MetaInput): { issues: Issue[]; score: number } {
  const issues: Issue[] = [];

  if (!input.title.trim()) {
    issues.push({ level: "error", field: "title", msg: "Page title is empty — Google uses this as the headline in search results." });
  } else if (input.title.length < 30) {
    issues.push({ level: "warn", field: "title", msg: `Title is only ${input.title.length} characters — aim for 50–60.` });
  } else if (input.title.length > 60) {
    issues.push({ level: "warn", field: "title", msg: `Title is ${input.title.length} characters — over 60 may be truncated in Google.` });
  }

  if (!input.description.trim()) {
    issues.push({ level: "error", field: "description", msg: "Description is empty — this is the snippet under your title in search results." });
  } else if (input.description.length < 80) {
    issues.push({ level: "warn", field: "description", msg: `Description is only ${input.description.length} characters — aim for 150–160.` });
  } else if (input.description.length > 160) {
    issues.push({ level: "warn", field: "description", msg: `Description is ${input.description.length} characters — over 160 may be cut off.` });
  }

  if (!input.canonical.trim()) {
    issues.push({ level: "info", field: "canonical", msg: "Set a canonical URL to avoid duplicate-content issues across www/non-www and trailing slashes." });
  } else if (!URL_RE.test(input.canonical.trim())) {
    issues.push({ level: "warn", field: "canonical", msg: "Canonical URL should be absolute (start with https://)." });
  }

  if (!input.ogImage.trim()) {
    issues.push({ level: "warn", field: "ogImage", msg: "No Open Graph image — links shared on Facebook/LinkedIn/Slack will be plain text." });
  } else if (!URL_RE.test(input.ogImage.trim())) {
    issues.push({ level: "warn", field: "ogImage", msg: "og:image should be an absolute URL (https://...)." });
  }

  if (input.ogUrl && !URL_RE.test(input.ogUrl.trim())) {
    issues.push({ level: "warn", field: "ogUrl", msg: "og:url should be an absolute URL." });
  }

  if (input.twitterCard === "summary_large_image" && !(input.twitterImage || input.ogImage)) {
    issues.push({ level: "warn", field: "twitterImage", msg: "summary_large_image card with no image will degrade to a small card on Twitter/X." });
  }
  if (input.twitterSite && !input.twitterSite.startsWith("@")) {
    issues.push({ level: "warn", field: "twitterSite", msg: "twitter:site should start with @ (e.g. @yourbrand)." });
  }
  if (input.twitterCreator && !input.twitterCreator.startsWith("@")) {
    issues.push({ level: "warn", field: "twitterCreator", msg: "twitter:creator should start with @." });
  }

  if (!input.viewport.trim()) {
    issues.push({ level: "warn", field: "viewport", msg: "Missing viewport meta — your page won't render correctly on mobile." });
  }
  if (!input.charset.trim()) {
    issues.push({ level: "warn", field: "charset", msg: "Missing charset declaration — UTF-8 is strongly recommended." });
  }

  const errs = issues.filter((i) => i.level === "error").length;
  const warns = issues.filter((i) => i.level === "warn").length;
  const score = Math.max(0, Math.min(100, 100 - errs * 25 - warns * 8));
  return { issues, score };
}

/** Tally for the hero / stats panel. */
export function counts(input: MetaInput): { totalTags: number; ogCount: number; twitterCount: number } {
  let ogCount = 0;
  let twitterCount = 0;
  let totalTags = 0;
  const std: (keyof MetaInput)[] = [
    "title",
    "description",
    "keywords",
    "author",
    "robots",
    "themeColor",
    "canonical",
    "favicon",
    "viewport",
    "charset",
    "language",
  ];
  for (const k of std) if (String(input[k]).trim()) totalTags += 1;
  const og: (keyof MetaInput)[] = ["ogTitle", "ogDescription", "ogImage", "ogImageAlt", "ogUrl", "ogSiteName", "ogLocale"];
  for (const k of og) if (String(input[k]).trim()) ogCount += 1;
  ogCount += 1; // og:type always written
  const tw: (keyof MetaInput)[] = ["twitterSite", "twitterCreator", "twitterTitle", "twitterDescription", "twitterImage"];
  for (const k of tw) if (String(input[k]).trim()) twitterCount += 1;
  twitterCount += 1; // twitter:card always written
  return { totalTags: totalTags + ogCount + twitterCount, ogCount, twitterCount };
}

export function previewHost(url: string): string {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "example.com";
  }
}
