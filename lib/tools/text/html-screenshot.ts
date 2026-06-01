// Website Screenshot Generator engine. Renders arbitrary HTML to a
// canvas via the SVG `foreignObject` trick:
//   1. Wrap the user's HTML inside <svg><foreignObject>…</foreignObject></svg>
//   2. Serialise to a data URL (text/svg+xml).
//   3. Load it into an Image element.
//   4. Draw the Image onto a canvas.
//   5. Export the canvas as PNG.
//
// Caveats (documented in the UI):
//   - External stylesheets and fonts don't load (SVG is sandboxed).
//     Inline <style> blocks work; @font-face url(...) does not.
//   - Cross-origin images are tainted; canvas.toBlob fails with
//     `SecurityError`. Inline data URLs and same-origin images work.
//   - Safari < 16 has bugs with foreignObject + style overrides.
//   - JS doesn't run inside the SVG (it's just paint).

export interface ScreenshotOptions {
  /** Output width (CSS px). */
  width: number;
  /** Output height (CSS px). */
  height: number;
  /** Device pixel ratio multiplier (1, 2, 3). */
  scale: number;
  /** Background colour painted behind the HTML. */
  background: string;
}

export const DEFAULT_OPTIONS: ScreenshotOptions = {
  width: 1280,
  height: 720,
  scale: 2,
  background: "#ffffff",
};

export interface ScreenshotResult {
  ok: boolean;
  blob?: Blob;
  dataUrl?: string;
  error?: string;
}

export async function renderHtmlToPng(html: string, opt: ScreenshotOptions): Promise<ScreenshotResult> {
  if (!html.trim()) return { ok: false, error: "Paste some HTML first." };
  const w = Math.max(64, Math.min(4096, opt.width));
  const h = Math.max(64, Math.min(4096, opt.height));
  const scale = Math.max(1, Math.min(4, opt.scale));

  // Wrap the user's HTML inside an XHTML document so foreignObject is happy.
  // The xmlns on the root is required; <body> tags are tolerated by browsers
  // but the inner content really wants to be valid XHTML.
  const inner = html.includes("<html") ? html : `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;min-height:${h}px;background:${opt.background};">${html}</div>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <foreignObject width="100%" height="100%">
    ${inner}
  </foreignObject>
</svg>`;
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  try {
    await img.decode();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? `Could not decode SVG: ${e.message}` : "Decode failed" };
  }

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { ok: false, error: "Canvas 2d context unavailable." };
  ctx.fillStyle = opt.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);

  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return { ok: false, error: "Canvas toBlob returned null (tainted by cross-origin content?)." };
    const dataUrl = canvas.toDataURL("image/png");
    return { ok: true, blob, dataUrl };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `Canvas was tainted: ${e.message}. Likely cause: cross-origin <img> in your HTML.` : "Canvas was tainted",
    };
  }
}

export const SAMPLE_HTML = `<div style="font-family: system-ui, -apple-system, sans-serif; padding: 48px; max-width: 1184px;">
  <div style="display:flex; align-items:center; gap:16px;">
    <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#ec4899);"></div>
    <div>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">Toollyz</h1>
      <p style="margin:4px 0 0;color:#64748b;font-size:14px;">250+ tools that run in your browser</p>
    </div>
  </div>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
  <h2 style="margin:0;font-size:48px;font-weight:800;line-height:1.1;letter-spacing:-0.03em;color:#0f172a;">
    Beautiful screenshots,<br/>generated locally.
  </h2>
  <p style="margin:16px 0 0;font-size:18px;color:#475569;line-height:1.5;">
    The HTML on the left renders into the PNG on the right via an SVG
    foreignObject → canvas pipeline. No server, no third-party CDN, no
    surprises. Inline styles work; external stylesheets, fonts, and
    cross-origin images do not.
  </p>
  <div style="margin-top:32px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;">
      <div style="font-size:24px;font-weight:700;color:#0ea5e9;">100%</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Client-side</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;">
      <div style="font-size:24px;font-weight:700;color:#22c55e;">0 KB</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Server payload</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;">
      <div style="font-size:24px;font-weight:700;color:#a855f7;">∞</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Tries / day</div>
    </div>
  </div>
</div>`;
