// Website Source Viewer engine. Takes a raw HTML string, parses with
// DOMParser, returns a structured analysis: document outline (heading
// tree), every <script src>, every <link rel="stylesheet">, every <img
// src>, every <a href>, the full meta-tag list, and a prettified
// re-serialised HTML for the source view. 100% offline.

export interface SourceAnalysis {
  /** Pretty-printed HTML (light formatter). */
  pretty: string;
  /** Heading tree — level 1-6 in DOM order. */
  outline: { level: number; text: string }[];
  scripts: { src?: string; inline: boolean; bytes: number; type?: string }[];
  styles: { href?: string; inline: boolean; bytes: number }[];
  links: { href: string; text: string; rel?: string }[];
  images: { src: string; alt?: string; width?: string; height?: string }[];
  metas: { name: string; content: string }[];
  iframes: { src: string }[];
  totals: {
    bytes: number;
    elements: number;
    scripts: number;
    styles: number;
    images: number;
    links: number;
    iframes: number;
  };
  error?: string;
}

const SELF_CLOSING = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** Minimal HTML beautifier — adds line breaks + indentation. Not a full
 * formatter (doesn't parse CSS / JS) but fine for viewing source. */
function prettifyHtml(html: string): string {
  // Insert newlines around tags.
  const tagPattern = /<\/?[^>]+>/g;
  const tokens: string[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = tagPattern.exec(html)) !== null) {
    if (m.index > lastIdx) tokens.push(html.slice(lastIdx, m.index));
    tokens.push(m[0]);
    lastIdx = tagPattern.lastIndex;
  }
  if (lastIdx < html.length) tokens.push(html.slice(lastIdx));

  let indent = 0;
  const out: string[] = [];
  for (const tok of tokens) {
    if (!tok.trim()) continue;
    if (tok.startsWith("<!--")) {
      out.push("  ".repeat(indent) + tok.trim());
      continue;
    }
    if (tok.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      out.push("  ".repeat(indent) + tok.trim());
      continue;
    }
    if (tok.startsWith("<")) {
      const tagName = (tok.match(/^<\s*([a-zA-Z0-9-]+)/)?.[1] ?? "").toLowerCase();
      const selfClosed = tok.endsWith("/>") || SELF_CLOSING.has(tagName) || tagName.startsWith("!");
      out.push("  ".repeat(indent) + tok.trim());
      if (!selfClosed) indent++;
      continue;
    }
    // Text node — collapse whitespace.
    const t = tok.replace(/\s+/g, " ").trim();
    if (t) out.push("  ".repeat(indent) + t);
  }
  return out.join("\n");
}

export function analyse(html: string): SourceAnalysis {
  const totals = { bytes: html.length, elements: 0, scripts: 0, styles: 0, images: 0, links: 0, iframes: 0 };
  if (typeof DOMParser === "undefined") {
    return {
      pretty: html,
      outline: [],
      scripts: [],
      styles: [],
      links: [],
      images: [],
      metas: [],
      iframes: [],
      totals,
      error: "DOMParser unavailable.",
    };
  }
  if (!html.trim()) {
    return {
      pretty: "",
      outline: [],
      scripts: [],
      styles: [],
      links: [],
      images: [],
      metas: [],
      iframes: [],
      totals,
      error: "Paste HTML or just the <head>.",
    };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const pretty = prettifyHtml(html);

  // Outline (h1-h6).
  const outline: SourceAnalysis["outline"] = [];
  for (const h of Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"))) {
    const level = parseInt(h.tagName.substring(1), 10);
    outline.push({ level, text: (h.textContent ?? "").trim().replace(/\s+/g, " ") });
  }

  // Scripts.
  const scripts: SourceAnalysis["scripts"] = [];
  for (const s of Array.from(doc.querySelectorAll("script"))) {
    const src = s.getAttribute("src") ?? undefined;
    const type = s.getAttribute("type") ?? undefined;
    scripts.push({
      src,
      inline: !src,
      bytes: src ? 0 : (s.textContent ?? "").length,
      type,
    });
  }

  // Styles (link rel=stylesheet + <style>).
  const styles: SourceAnalysis["styles"] = [];
  for (const l of Array.from(doc.querySelectorAll("link[rel='stylesheet']"))) {
    styles.push({ href: l.getAttribute("href") ?? undefined, inline: false, bytes: 0 });
  }
  for (const s of Array.from(doc.querySelectorAll("style"))) {
    styles.push({ inline: true, bytes: (s.textContent ?? "").length });
  }

  // Links.
  const links: SourceAnalysis["links"] = [];
  for (const a of Array.from(doc.querySelectorAll("a[href]"))) {
    links.push({
      href: a.getAttribute("href") ?? "",
      text: (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
      rel: a.getAttribute("rel") ?? undefined,
    });
  }

  // Images.
  const images: SourceAnalysis["images"] = [];
  for (const img of Array.from(doc.querySelectorAll("img"))) {
    images.push({
      src: img.getAttribute("src") ?? "",
      alt: img.getAttribute("alt") ?? undefined,
      width: img.getAttribute("width") ?? undefined,
      height: img.getAttribute("height") ?? undefined,
    });
  }

  // Meta tags.
  const metas: SourceAnalysis["metas"] = [];
  for (const m of Array.from(doc.querySelectorAll("meta"))) {
    const name = m.getAttribute("name") ?? m.getAttribute("property") ?? m.getAttribute("http-equiv") ?? "";
    const content = m.getAttribute("content") ?? m.getAttribute("charset") ?? "";
    if (name || content) metas.push({ name, content });
  }

  // Iframes.
  const iframes: SourceAnalysis["iframes"] = [];
  for (const f of Array.from(doc.querySelectorAll("iframe[src]"))) {
    iframes.push({ src: f.getAttribute("src") ?? "" });
  }

  totals.elements = doc.querySelectorAll("*").length;
  totals.scripts = scripts.length;
  totals.styles = styles.length;
  totals.images = images.length;
  totals.links = links.length;
  totals.iframes = iframes.length;

  return { pretty, outline, scripts, styles, links, images, metas, iframes, totals };
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Toollyz — privacy-first browser tools</title>
<meta name="description" content="Free tools that run entirely in your browser — no upload, no tracking." />
<meta property="og:title" content="Toollyz" />
<meta property="og:image" content="https://toollyz.com/og.png" />
<link rel="canonical" href="https://toollyz.com/" />
<link rel="stylesheet" href="/main.css" />
<link rel="icon" href="/favicon.ico" />
<style>body{font-family:system-ui;margin:0}</style>
<script src="/main.js" defer></script>
</head>
<body>
<header>
  <h1>Toollyz</h1>
  <p>Free tools that run entirely in your browser.</p>
</header>
<main>
  <h2>Featured tools</h2>
  <ul>
    <li><a href="/tools/json-formatter">JSON Formatter</a></li>
    <li><a href="/tools/regex-tester">Regex Tester</a></li>
    <li><a href="/tools/qr-code-generator">QR Code Generator</a></li>
  </ul>
  <h2>How it works</h2>
  <p>Everything runs in your browser — there's no server.</p>
  <img src="/hero.png" alt="Tools illustration" width="800" height="420" />
</main>
<footer>
  <p>&copy; 2026 Toollyz</p>
</footer>
</body>
</html>`;
