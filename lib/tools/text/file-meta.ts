// File Metadata Viewer engine. Inspects a `File` object using only the
// File API + a small magic-byte sniff (reuses the MIME Type Checker's
// signatures via dynamic import would couple too tightly; instead we
// ship a compact subset focused on the formats that carry useful
// in-content metadata).
//
// Returns:
//   - basic File attributes (name, size, browser MIME, lastModified)
//   - sniffed MIME from the first 64 bytes
//   - image dimensions (via an Image element)
//   - audio / video duration + dimensions (via the media element)
//   - SHA-256 hash of the file content (capped at 50 MB by default)

export interface FileMeta {
  name: string;
  /** Bytes. */
  size: number;
  /** Browser's claimed type (from extension/filesystem). */
  type: string;
  lastModified: number;
  /** Detected MIME (magic-byte sniff). */
  sniffedType?: string;
  /** First 32 bytes for the hex dump. */
  firstBytes: Uint8Array;
  /** Width/height for images & video. */
  width?: number;
  height?: number;
  /** Duration in seconds for audio/video. */
  duration?: number;
  /** SHA-256 hex digest. */
  sha256?: string;
  /** Size in human-readable form. */
  sizeHuman: string;
}

interface Signature {
  mime: string;
  /** Lowercase hex bytes, '??' = wildcard. */
  pattern: string;
}

const SIGS: Signature[] = [
  { mime: "image/jpeg", pattern: "ffd8ff" },
  { mime: "image/png", pattern: "89504e470d0a1a0a" },
  { mime: "image/gif", pattern: "474946383961" },
  { mime: "image/gif", pattern: "474946383761" },
  { mime: "image/webp", pattern: "52494646" },
  { mime: "image/bmp", pattern: "424d" },
  { mime: "image/x-icon", pattern: "00000100" },
  { mime: "image/heic", pattern: "00000018667479706865696300" },
  { mime: "application/pdf", pattern: "25504446" },
  { mime: "application/zip", pattern: "504b0304" },
  { mime: "application/x-rar-compressed", pattern: "526172211a0700" },
  { mime: "application/x-7z-compressed", pattern: "377abcaf271c" },
  { mime: "application/gzip", pattern: "1f8b" },
  { mime: "audio/mpeg", pattern: "494433" },
  { mime: "audio/wav", pattern: "52494646" },
  { mime: "audio/ogg", pattern: "4f676753" },
  { mime: "audio/flac", pattern: "664c6143" },
  { mime: "video/mp4", pattern: "00000018667479706d703432" },
  { mime: "video/mp4", pattern: "0000001c667479706973" },
  { mime: "video/webm", pattern: "1a45dfa3" },
  { mime: "video/quicktime", pattern: "0000001466747970716e" },
  { mime: "font/woff", pattern: "774f4646" },
  { mime: "font/woff2", pattern: "774f4632" },
  { mime: "font/ttf", pattern: "0001000000" },
  { mime: "font/otf", pattern: "4f54544f" },
];

function bytesToHex(buf: Uint8Array): string {
  let out = "";
  for (let i = 0; i < buf.length; i++) out += buf[i].toString(16).padStart(2, "0");
  return out;
}

function sniff(first: Uint8Array): string | undefined {
  const hex = bytesToHex(first);
  let best: Signature | undefined;
  for (const sig of SIGS) {
    if (hex.startsWith(sig.pattern)) {
      if (!best || sig.pattern.length > best.pattern.length) best = sig;
    }
  }
  return best?.mime;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function sha256(buf: ArrayBuffer): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "";
  const digest = await crypto.subtle.digest("SHA-256", buf);
  let out = "";
  const bytes = new Uint8Array(digest);
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const out = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}

async function readMediaInfo(
  file: File,
  kind: "audio" | "video",
): Promise<{ duration?: number; width?: number; height?: number } | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.src = url;
    el.onloadedmetadata = () => {
      const out: { duration?: number; width?: number; height?: number } = {
        duration: isFinite(el.duration) ? el.duration : undefined,
      };
      if (kind === "video") {
        out.width = (el as HTMLVideoElement).videoWidth;
        out.height = (el as HTMLVideoElement).videoHeight;
      }
      URL.revokeObjectURL(url);
      resolve(out);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
  });
}

export interface InspectOptions {
  /** Skip SHA-256 for files larger than this. Default 50 MB. */
  hashCapBytes?: number;
}

export async function inspect(file: File, opt: InspectOptions = {}): Promise<FileMeta> {
  const cap = opt.hashCapBytes ?? 50 * 1024 * 1024;
  const first = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const sniffedType = sniff(first);
  const meta: FileMeta = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sniffedType,
    firstBytes: first.slice(0, 32),
    sizeHuman: formatBytes(file.size),
  };

  const effectiveType = sniffedType ?? file.type;

  if (effectiveType.startsWith("image/")) {
    const dims = await readImageDimensions(file);
    if (dims) {
      meta.width = dims.width;
      meta.height = dims.height;
    }
  } else if (effectiveType.startsWith("video/")) {
    const info = await readMediaInfo(file, "video");
    if (info) {
      meta.width = info.width;
      meta.height = info.height;
      meta.duration = info.duration;
    }
  } else if (effectiveType.startsWith("audio/")) {
    const info = await readMediaInfo(file, "audio");
    if (info) meta.duration = info.duration;
  }

  if (file.size <= cap) {
    try {
      const buf = await file.arrayBuffer();
      meta.sha256 = await sha256(buf);
    } catch {
      /* noop */
    }
  }

  return meta;
}

export function formatHex(bytes: Uint8Array): string {
  const lines: string[] = [];
  const W = 16;
  for (let off = 0; off < bytes.length; off += W) {
    const slice = bytes.slice(off, off + W);
    const hex = Array.from(slice)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    const ascii = Array.from(slice)
      .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : "."))
      .join("");
    lines.push(`${off.toString(16).padStart(4, "0")}  ${hex.padEnd(W * 3 - 1, " ")}  ${ascii}`);
  }
  return lines.join("\n");
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return "?";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
