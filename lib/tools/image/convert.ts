// Canvas-based image format conversion for the Toollyz image converters
// (JPG↔PNG↔WebP). Browser-only: reads the file with FileReader, decodes it
// into an HTMLImageElement, draws it onto a canvas and exports a Blob with the
// target MIME type. No upload, no library.

export interface ConvertOptions {
  /** Target MIME type, e.g. "image/png", "image/webp", "image/jpeg". */
  mime: string;
  /** 0..1 quality for lossy targets (webp/jpeg). Ignored for png. */
  quality?: number;
  /** Optional max width/height; the image is downscaled if larger. */
  maxDimension?: number;
}

export interface ConvertResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  newBytes: number;
  mime: string;
  extension: string;
}

function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/bmp") return "bmp";
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

export async function convertImage(file: File, opts: ConvertOptions): Promise<ConvertResult> {
  const src = await readAsDataUrl(file);
  const img = await loadImage(src);
  let { width, height } = { width: img.naturalWidth, height: img.naturalHeight };
  if (opts.maxDimension && Math.max(width, height) > opts.maxDimension) {
    const scale = opts.maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(img, 0, 0, width, height);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), opts.mime, opts.quality));
  if (!blob) throw new Error(`This browser can't encode ${opts.mime}.`);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Couldn't read the converted blob."));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
  return {
    blob,
    dataUrl,
    width,
    height,
    originalBytes: file.size,
    newBytes: blob.size,
    mime: opts.mime,
    extension: extensionFor(opts.mime),
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
