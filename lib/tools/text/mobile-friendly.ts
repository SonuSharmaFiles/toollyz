// Mobile-Friendly Test engine. Paste HTML and we audit the same set of
// signals Google's old "Mobile-Friendly Test" checked, plus a few extras
// that translate well to Core Web Vitals on mobile:
//
//   1. Viewport meta — present, `width=device-width`, sensible scale.
//   2. Tap target hints — count of small <a>/<button> elements with
//      inline width/height attributes < 44px.
//   3. Fixed-width content — root containers using `width: <Npx>` in
//      inline styles that don't fit a 360px viewport.
//   4. Legible font sizes — inline styles or <font size> with px < 12.
//   5. Plugin / Flash content — <object>, <embed>, <applet> presence.
//   6. Horizontal scroll triggers — large fixed-pixel images without
//      width: 100% or max-width: 100%.
//
// 100% offline. DOMParser + regex only.

export interface AuditCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail" | "info";
  message: string;
}

export interface MobileReport {
  viewport?: string;
  /** Pass/fail with score 0-100. */
  score: number;
  checks: AuditCheck[];
  summary: {
    smallTapTargets: number;
    smallFonts: number;
    fixedWidthEls: number;
    plugins: number;
    largeImages: number;
  };
}

export function analyse(html: string): MobileReport {
  const checks: AuditCheck[] = [];
  const summary = { smallTapTargets: 0, smallFonts: 0, fixedWidthEls: 0, plugins: 0, largeImages: 0 };
  if (typeof DOMParser === "undefined") {
    return { score: 0, checks: [{ id: "engine", label: "Engine", status: "fail", message: "DOMParser unavailable." }], summary };
  }
  if (!html.trim()) {
    return { score: 0, checks: [{ id: "input", label: "Input", status: "fail", message: "Paste HTML or just the <head>." }], summary };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const viewport = doc.querySelector("meta[name='viewport']")?.getAttribute("content") ?? undefined;
  if (!viewport) {
    checks.push({ id: "viewport", label: "Viewport meta", status: "fail", message: "No <meta name='viewport'> — Google flags page as not mobile-friendly. Add <meta name='viewport' content='width=device-width, initial-scale=1'>." });
  } else {
    const lc = viewport.toLowerCase();
    if (!/width=device-width/.test(lc)) {
      checks.push({ id: "viewport-width", label: "Viewport width", status: "fail", message: `Viewport '${viewport}' lacks 'width=device-width' — page won't scale to phone width.` });
    } else {
      checks.push({ id: "viewport-width", label: "Viewport width", status: "ok", message: "Viewport sets width=device-width." });
    }
    if (/user-scalable\s*=\s*no/.test(lc) || /maximum-scale\s*=\s*1/.test(lc)) {
      checks.push({ id: "viewport-scale", label: "User scaling", status: "warn", message: "Viewport blocks user-scalable / locks maximum-scale=1 — hurts accessibility (low-vision users can't zoom)." });
    }
  }

  // Plugins.
  const plugins = doc.querySelectorAll("object, embed, applet");
  summary.plugins = plugins.length;
  if (plugins.length > 0) {
    checks.push({
      id: "plugins",
      label: "Plugins",
      status: "fail",
      message: `${plugins.length} <object>/<embed>/<applet> — Flash and Java plugins don't run on mobile browsers. Replace with HTML5 equivalents.`,
    });
  }

  // Tap targets.
  for (const el of Array.from(doc.querySelectorAll("a, button, input[type='button'], input[type='submit']"))) {
    const w = parseInt(el.getAttribute("width") ?? "0", 10);
    const h = parseInt(el.getAttribute("height") ?? "0", 10);
    const styleW = inlineCssPx(el.getAttribute("style") ?? "", "width");
    const styleH = inlineCssPx(el.getAttribute("style") ?? "", "height");
    const ew = styleW ?? w;
    const eh = styleH ?? h;
    if ((ew > 0 && ew < 44) || (eh > 0 && eh < 44)) summary.smallTapTargets++;
  }
  if (summary.smallTapTargets > 0) {
    checks.push({
      id: "tap-targets",
      label: "Tap target sizing",
      status: "warn",
      message: `${summary.smallTapTargets} link or button declared with width or height under 44px (Apple's HIG minimum tap target). Increase with padding or larger font.`,
    });
  }

  // Small fonts.
  for (const el of Array.from(doc.querySelectorAll("[style]"))) {
    const fs = inlineCssPx(el.getAttribute("style") ?? "", "font-size");
    if (fs !== null && fs < 12) summary.smallFonts++;
  }
  for (const f of Array.from(doc.querySelectorAll("font[size]"))) {
    const n = parseInt(f.getAttribute("size") ?? "0", 10);
    if (n > 0 && n < 2) summary.smallFonts++;
  }
  if (summary.smallFonts > 0) {
    checks.push({
      id: "font-size",
      label: "Legible fonts",
      status: "warn",
      message: `${summary.smallFonts} element with font-size < 12px (via inline style or <font size>). Mobile-friendly body text should be ≥ 16px.`,
    });
  }

  // Fixed-width root containers.
  for (const el of Array.from(doc.querySelectorAll("body > *, body div"))) {
    const w = inlineCssPx(el.getAttribute("style") ?? "", "width");
    if (w !== null && w > 360 && !/%/.test(el.getAttribute("style") ?? "")) {
      summary.fixedWidthEls++;
    }
  }
  if (summary.fixedWidthEls > 0) {
    checks.push({
      id: "fixed-width",
      label: "Fixed-width containers",
      status: "warn",
      message: `${summary.fixedWidthEls} container with width > 360px in inline px (no %). Use max-width or % for responsive layouts.`,
    });
  }

  // Large images without max-width.
  for (const img of Array.from(doc.querySelectorAll("img"))) {
    const w = parseInt(img.getAttribute("width") ?? "0", 10);
    const style = img.getAttribute("style") ?? "";
    if (w > 480 && !/max-width\s*:\s*100%/.test(style) && !/width\s*:\s*100%/.test(style)) {
      summary.largeImages++;
    }
  }
  if (summary.largeImages > 0) {
    checks.push({
      id: "responsive-images",
      label: "Responsive images",
      status: "warn",
      message: `${summary.largeImages} <img> wider than 480px with no max-width:100% — will trigger horizontal scroll on small viewports.`,
    });
  }

  // Body font default (very rough heuristic).
  const bodyStyle = doc.querySelector("body")?.getAttribute("style") ?? "";
  const bodyFs = inlineCssPx(bodyStyle, "font-size");
  if (bodyFs !== null && bodyFs < 14) {
    checks.push({ id: "body-font", label: "Body font size", status: "warn", message: `body has inline font-size: ${bodyFs}px — below the 14-16px mobile body minimum.` });
  }

  // Sum up.
  const passes = checks.filter((c) => c.status === "ok").length;
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const score = Math.max(0, Math.min(100, 100 - fails * 30 - warns * 8 + passes * 5));

  return { viewport, score, checks, summary };
}

function inlineCssPx(style: string, prop: string): number | null {
  const re = new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*([0-9.]+)\\s*px`, "i");
  const m = re.exec(style);
  if (!m) return null;
  return parseFloat(m[1]);
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Friendly mobile page</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>body{font-family:system-ui;margin:0;font-size:16px;padding:16px}img{max-width:100%;height:auto}a{padding:12px;display:inline-block}</style>
</head>
<body>
<h1>Toollyz</h1>
<p>250+ free tools that run entirely in your browser.</p>
<p><a href="/tools/json-formatter">JSON Formatter</a></p>
<p><a href="/tools/regex-tester">Regex Tester</a></p>
<img src="/hero.png" alt="Tools" width="1200" height="630" style="max-width:100%" />
</body>
</html>`;
