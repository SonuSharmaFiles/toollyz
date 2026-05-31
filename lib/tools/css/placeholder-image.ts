// Lorem Ipsum Image Generator engine. Renders a labelled "WIDTHxHEIGHT"
// placeholder image to a canvas — the same look as placeholder.com or
// picsum.photos's basic mode, but generated offline and completely free
// to use commercially.
//
// Supports a few rendering modes:
//   - solid: flat background colour
//   - gradient: two-stop linear gradient
//   - pattern: diagonal stripes / dots over the base
//   - noise: subtle random grain overlay
// Plus a label override (replace "1200x630" with custom text).

export type ImageMode = "solid" | "gradient" | "stripes" | "dots";

export interface PlaceholderOptions {
  width: number;
  height: number;
  mode: ImageMode;
  background: string;
  /** Used by gradient mode. */
  background2: string;
  foreground: string;
  /** Override the default WxH label. */
  customLabel?: string;
  /** Show the dimensions text. */
  showLabel: boolean;
  /** Font size as % of the shorter dimension. */
  fontSize: number;
  /** 0-100 noise grain strength. */
  noise: number;
}

export const DEFAULT_OPTIONS: PlaceholderOptions = {
  width: 1200,
  height: 630,
  mode: "solid",
  background: "#0f172a",
  background2: "#312e81",
  foreground: "#f8fafc",
  customLabel: "",
  showLabel: true,
  fontSize: 8,
  noise: 0,
};

export const SIZE_PRESETS: { id: string; label: string; width: number; height: number }[] = [
  { id: "og", label: "Open Graph (1200×630)", width: 1200, height: 630 },
  { id: "square", label: "Square (1080×1080)", width: 1080, height: 1080 },
  { id: "story", label: "Story (1080×1920)", width: 1080, height: 1920 },
  { id: "twitter", label: "Twitter (1600×900)", width: 1600, height: 900 },
  { id: "hero", label: "Hero (1920×1080)", width: 1920, height: 1080 },
  { id: "thumb", label: "Thumbnail (400×300)", width: 400, height: 300 },
  { id: "avatar", label: "Avatar (256×256)", width: 256, height: 256 },
  { id: "favicon", label: "Favicon (512×512)", width: 512, height: 512 },
];

export function render(canvas: HTMLCanvasElement, opt: PlaceholderOptions): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = opt.width * dpr;
  canvas.height = opt.height * dpr;
  canvas.style.width = `${opt.width}px`;
  canvas.style.height = `${opt.height}px`;
  ctx.scale(dpr, dpr);

  // Background.
  if (opt.mode === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, opt.width, opt.height);
    grad.addColorStop(0, opt.background);
    grad.addColorStop(1, opt.background2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = opt.background;
  }
  ctx.fillRect(0, 0, opt.width, opt.height);

  // Pattern overlay.
  if (opt.mode === "stripes") {
    ctx.save();
    ctx.strokeStyle = opt.background2;
    ctx.lineWidth = Math.max(2, Math.round(opt.width / 80));
    ctx.beginPath();
    const step = Math.max(20, opt.width / 32);
    for (let x = -opt.height; x < opt.width + opt.height; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + opt.height, opt.height);
    }
    ctx.stroke();
    ctx.restore();
  } else if (opt.mode === "dots") {
    ctx.save();
    ctx.fillStyle = opt.background2;
    const step = Math.max(20, opt.width / 32);
    const r = Math.max(2, step / 5);
    for (let y = step / 2; y < opt.height; y += step) {
      for (let x = step / 2; x < opt.width; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Noise overlay (subtle).
  if (opt.noise > 0) {
    const img = ctx.getImageData(0, 0, opt.width, opt.height);
    const data = img.data;
    const strength = (opt.noise / 100) * 60;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * strength;
      data[i] = clamp(data[i] + n);
      data[i + 1] = clamp(data[i + 1] + n);
      data[i + 2] = clamp(data[i + 2] + n);
    }
    ctx.putImageData(img, 0, 0);
  }

  // Label.
  if (opt.showLabel) {
    const text = opt.customLabel || `${opt.width} × ${opt.height}`;
    const shorter = Math.min(opt.width, opt.height);
    const px = Math.max(16, Math.round((shorter * opt.fontSize) / 100));
    ctx.fillStyle = opt.foreground;
    ctx.font = `700 ${px}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = px / 4;
    ctx.fillText(text, opt.width / 2, opt.height / 2);
    ctx.shadowBlur = 0;
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(255, n));
}
