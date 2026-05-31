// Noise Texture Generator engine. Two paths:
//   1) Canvas — true RGB or monochrome noise pixel-by-pixel using
//      crypto.getRandomValues. The result is exportable as PNG, and
//      converted to a data: URL for use in CSS `background-image`.
//   2) SVG `<filter>` with `feTurbulence` — a procedural noise filter
//      that renders without an image. Cheaper bytes than the PNG but
//      slightly different visual character (more cloud-like, less
//      grain-like).
//
// Both modes accept the same NoiseState (density, contrast, monochrome,
// blend mode, opacity).

export type NoiseMode = "canvas" | "svg";

export interface NoiseState {
  mode: NoiseMode;
  /** 16-2048 px square. */
  size: number;
  /** 0-100 — how grainy the pixels look (higher = denser dark/light). */
  contrast: number;
  /** Greyscale instead of RGB. */
  monochrome: boolean;
  /** 0-100 % — alpha of the noise layer. */
  opacity: number;
  /** Used for CSS blend mode preview. */
  blendMode: GlobalCompositeOperation | "normal" | "overlay" | "multiply" | "screen" | "soft-light";
  /** SVG turbulence frequency (only for SVG mode). */
  frequency: number;
}

export const DEFAULT_STATE: NoiseState = {
  mode: "canvas",
  size: 256,
  contrast: 60,
  monochrome: true,
  opacity: 35,
  blendMode: "overlay",
  frequency: 0.65,
};

export function renderNoiseToCanvas(canvas: HTMLCanvasElement, state: NoiseState): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = state.size;
  canvas.height = state.size;
  const img = ctx.createImageData(state.size, state.size);
  const px = img.data;
  const n = state.size * state.size;
  const rng = new Uint8Array(n * (state.monochrome ? 1 : 3));
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const CHUNK = 65_536;
    for (let off = 0; off < rng.length; off += CHUNK) {
      crypto.getRandomValues(rng.subarray(off, Math.min(off + CHUNK, rng.length)));
    }
  } else {
    for (let i = 0; i < rng.length; i++) rng[i] = Math.floor(Math.random() * 256);
  }
  // Contrast curve: remap 0-255 → push outliers harder when contrast > 50.
  const c = state.contrast / 50; // 0…2
  const midpoint = 128;
  const remap = (v: number) => {
    const dev = (v - midpoint) * c;
    return Math.max(0, Math.min(255, midpoint + dev));
  };
  for (let i = 0; i < n; i++) {
    const offset = i * 4;
    if (state.monochrome) {
      const g = remap(rng[i]);
      px[offset] = g;
      px[offset + 1] = g;
      px[offset + 2] = g;
    } else {
      px[offset] = remap(rng[i * 3]);
      px[offset + 1] = remap(rng[i * 3 + 1]);
      px[offset + 2] = remap(rng[i * 3 + 2]);
    }
    px[offset + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export function buildSvg(state: NoiseState): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${state.size} ${state.size}">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="${state.frequency.toFixed(3)}" numOctaves="2" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="${state.monochrome ? 0 : 1}" />
    <feComponentTransfer>
      <feFuncR type="linear" slope="${(state.contrast / 50).toFixed(2)}" intercept="${(-((state.contrast - 50) / 100)).toFixed(2)}" />
      <feFuncG type="linear" slope="${(state.contrast / 50).toFixed(2)}" intercept="${(-((state.contrast - 50) / 100)).toFixed(2)}" />
      <feFuncB type="linear" slope="${(state.contrast / 50).toFixed(2)}" intercept="${(-((state.contrast - 50) / 100)).toFixed(2)}" />
    </feComponentTransfer>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="1" />
</svg>`;
}

export function buildCssFromDataUrl(dataUrl: string, state: NoiseState): string {
  return `background-image: url("${dataUrl}");
background-size: ${state.size}px ${state.size}px;
background-repeat: repeat;
opacity: ${(state.opacity / 100).toFixed(2)};
mix-blend-mode: ${state.blendMode};`;
}
