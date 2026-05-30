// Image-resize engine for the Toollyz Image Resizer. Unlike convertImage's
// longest-edge `maxDimension`, this resizes to explicit target dimensions
// with three fit modes:
//
//   - "contain" (default): preserve aspect ratio; pad the canvas with a
//     background color if the target ratio differs.
//   - "cover": preserve aspect ratio; crop the source so it fills the
//     canvas (centered).
//   - "stretch": ignore aspect ratio; force the image to exactly W × H.
//
// Browser-only — uses FileReader, HTMLImageElement and a 2D canvas.

export type FitMode = "contain" | "cover" | "stretch";

export interface ResizeOptions {
  width: number;
  height: number;
  mime: string;
  quality?: number;
  fit?: FitMode;
  background?: string; // CSS color, used by "contain" letterbox
}

export interface ResizeResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  originalBytes: number;
  newBytes: number;
  mime: string;
  extension: string;
}

function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Couldn't read the file."));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Couldn't decode the image."));
    img.onload = () => resolve(img);
    img.src = src;
  });
}

export async function resizeImage(file: File, opts: ResizeOptions): Promise<ResizeResult> {
  if (!Number.isFinite(opts.width) || opts.width <= 0) throw new Error("Width must be a positive number.");
  if (!Number.isFinite(opts.height) || opts.height <= 0) throw new Error("Height must be a positive number.");
  const width = Math.round(opts.width);
  const height = Math.round(opts.height);
  if (width > 8192 || height > 8192) throw new Error("Maximum dimension is 8192 px on each side.");

  const src = await readAsDataUrl(file);
  const img = await loadImage(src);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  const fit: FitMode = opts.fit ?? "contain";
  const transparent = opts.mime === "image/png" || opts.mime === "image/webp";

  if (fit !== "stretch" && !transparent) {
    ctx.fillStyle = opts.background ?? "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else if (fit === "contain" && transparent && opts.background && opts.background !== "transparent") {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, width, height);
  }

  if (fit === "stretch") {
    ctx.drawImage(img, 0, 0, width, height);
  } else if (fit === "contain") {
    // Fit inside, preserve aspect, center.
    const sRatio = originalWidth / originalHeight;
    const tRatio = width / height;
    let dw: number;
    let dh: number;
    if (sRatio > tRatio) {
      dw = width;
      dh = Math.round(width / sRatio);
    } else {
      dh = height;
      dw = Math.round(height * sRatio);
    }
    const dx = Math.round((width - dw) / 2);
    const dy = Math.round((height - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    // cover: fill canvas, preserve aspect, crop centered.
    const sRatio = originalWidth / originalHeight;
    const tRatio = width / height;
    let sx = 0;
    let sy = 0;
    let sw = originalWidth;
    let sh = originalHeight;
    if (sRatio > tRatio) {
      // source is wider → crop sides
      sw = Math.round(originalHeight * tRatio);
      sx = Math.round((originalWidth - sw) / 2);
    } else {
      sh = Math.round(originalWidth / tRatio);
      sy = Math.round((originalHeight - sh) / 2);
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  }

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), opts.mime, opts.quality));
  if (!blob) throw new Error(`This browser can't encode ${opts.mime}.`);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Couldn't read the resized blob."));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });

  return {
    blob,
    dataUrl,
    width,
    height,
    originalWidth,
    originalHeight,
    originalBytes: file.size,
    newBytes: blob.size,
    mime: opts.mime,
    extension: extensionFor(opts.mime),
  };
}

export interface SocialPreset { id: string; label: string; width: number; height: number; group: string }

export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: "ig-square", label: "Instagram square", width: 1080, height: 1080, group: "Instagram" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, group: "Instagram" },
  { id: "ig-story", label: "Instagram story", width: 1080, height: 1920, group: "Instagram" },
  { id: "ig-landscape", label: "Instagram landscape", width: 1080, height: 566, group: "Instagram" },
  { id: "fb-post", label: "Facebook post", width: 1200, height: 630, group: "Facebook" },
  { id: "fb-cover", label: "Facebook cover", width: 820, height: 312, group: "Facebook" },
  { id: "x-post", label: "X / Twitter post", width: 1600, height: 900, group: "X / Twitter" },
  { id: "x-header", label: "X / Twitter header", width: 1500, height: 500, group: "X / Twitter" },
  { id: "li-post", label: "LinkedIn post", width: 1200, height: 627, group: "LinkedIn" },
  { id: "li-cover", label: "LinkedIn cover", width: 1584, height: 396, group: "LinkedIn" },
  { id: "yt-thumb", label: "YouTube thumbnail", width: 1280, height: 720, group: "YouTube" },
  { id: "yt-channel", label: "YouTube channel art", width: 2560, height: 1440, group: "YouTube" },
  { id: "tiktok", label: "TikTok video", width: 1080, height: 1920, group: "TikTok" },
  { id: "hd-1080", label: "1080p HD", width: 1920, height: 1080, group: "Standard" },
  { id: "hd-720", label: "720p HD", width: 1280, height: 720, group: "Standard" },
  { id: "4k", label: "4K UHD", width: 3840, height: 2160, group: "Standard" },
];
