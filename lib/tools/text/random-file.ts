// Random File Generator engine. Produces files of any size up to 100 MB
// (browser memory permitting) in five flavours:
//   - Text       (cryptographic-random ASCII)
//   - Lorem      (lorem-ipsum sentences)
//   - Binary     (crypto.getRandomValues bytes — for upload testing)
//   - Zeros      (all 0x00 — fast, useful for sparse-file testing)
//   - Image      (PNG built from a noise canvas — for upload testing
//                 with content-type checks)

export type FileKind = "text" | "lorem" | "binary" | "zeros" | "image";

export interface FileKindMeta {
  id: FileKind;
  label: string;
  mime: string;
  defaultExt: string;
  hint: string;
}

export const FILE_KINDS: FileKindMeta[] = [
  { id: "text", label: "Random ASCII text", mime: "text/plain", defaultExt: "txt", hint: "Cryptographically random ASCII letters and digits." },
  { id: "lorem", label: "Lorem ipsum", mime: "text/plain", defaultExt: "txt", hint: "Latin filler sentences." },
  { id: "binary", label: "Random bytes (.bin)", mime: "application/octet-stream", defaultExt: "bin", hint: "crypto.getRandomValues output — incompressible." },
  { id: "zeros", label: "All zeros (.zero)", mime: "application/octet-stream", defaultExt: "zero", hint: "Sparse file content; compresses to ~nothing." },
  { id: "image", label: "Noise PNG", mime: "image/png", defaultExt: "png", hint: "PNG of cryptographic random RGB noise." },
];

const ASCII_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

export const MAX_BYTES = 100 * 1024 * 1024;

function getRandomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const CHUNK = 65_536;
    for (let off = 0; off < n; off += CHUNK) {
      crypto.getRandomValues(buf.subarray(off, Math.min(off + CHUNK, n)));
    }
  } else {
    for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
}

function randomInt(lo: number, hi: number): number {
  const range = hi - lo + 1;
  const bound = Math.floor(0xffffffff / range) * range;
  const buf = new Uint32Array(1);
  for (;;) {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) crypto.getRandomValues(buf);
    else buf[0] = Math.floor(Math.random() * 0xffffffff);
    if (buf[0] < bound) return lo + (buf[0] % range);
  }
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomAscii(n: number): string {
  // Use rejection sampling for uniform distribution over the alphabet.
  let out = "";
  while (out.length < n) {
    const buf = getRandomBytes(Math.min(n - out.length, 8192));
    for (let i = 0; i < buf.length && out.length < n; i++) {
      if (buf[i] < 248) out += ASCII_ALPHABET[buf[i] % ASCII_ALPHABET.length];
    }
  }
  return out;
}

function loremUntil(targetBytes: number): string {
  let out = "";
  while (out.length < targetBytes) {
    const words: string[] = [];
    const n = randomInt(6, 18);
    for (let i = 0; i < n; i++) words.push(pick(LOREM_WORDS));
    let s = words.join(" ");
    s = s.charAt(0).toUpperCase() + s.slice(1) + ". ";
    out += s;
  }
  return out.slice(0, targetBytes);
}

function noisePng(width: number, height: number): Blob | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const data = ctx.createImageData(width, height);
  const rng = getRandomBytes(width * height * 4);
  for (let i = 0; i < data.data.length; i += 4) {
    data.data[i] = rng[i];
    data.data[i + 1] = rng[i + 1];
    data.data[i + 2] = rng[i + 2];
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return null; // We'll resolve via toBlob in the component.
}

export interface GenerateOptions {
  kind: FileKind;
  /** Target size in bytes. */
  size: number;
  /** Image width (for image kind). */
  width?: number;
  /** Image height (for image kind). */
  height?: number;
}

export interface GenerateResult {
  ok: boolean;
  blob?: Blob;
  /** Optional canvas reference for image kind. */
  canvas?: HTMLCanvasElement;
  size: number;
  mime: string;
  /** SHA-256 of the content (hex). */
  digest?: string;
  error?: string;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "";
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generate(opt: GenerateOptions): Promise<GenerateResult> {
  if (opt.size > MAX_BYTES) {
    return { ok: false, size: 0, mime: "", error: `Files over ${MAX_BYTES / 1024 / 1024} MB exceed the in-browser cap.` };
  }
  const meta = FILE_KINDS.find((k) => k.id === opt.kind);
  if (!meta) return { ok: false, size: 0, mime: "", error: "Unknown file kind." };

  // TS strict mode requires a plain ArrayBuffer (not SharedArrayBuffer) for
  // BlobPart — copy into a fresh buffer before constructing each Blob.
  function blobOf(bytes: Uint8Array, type: string): Blob {
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    return new Blob([ab], { type });
  }

  if (opt.kind === "text") {
    const txt = randomAscii(opt.size);
    const bytes = new TextEncoder().encode(txt);
    return { ok: true, blob: blobOf(bytes, meta.mime), size: bytes.length, mime: meta.mime, digest: await sha256Hex(bytes) };
  }
  if (opt.kind === "lorem") {
    const txt = loremUntil(opt.size);
    const bytes = new TextEncoder().encode(txt);
    return { ok: true, blob: blobOf(bytes, meta.mime), size: bytes.length, mime: meta.mime, digest: await sha256Hex(bytes) };
  }
  if (opt.kind === "binary") {
    const bytes = getRandomBytes(opt.size);
    return { ok: true, blob: blobOf(bytes, meta.mime), size: bytes.length, mime: meta.mime, digest: await sha256Hex(bytes) };
  }
  if (opt.kind === "zeros") {
    const bytes = new Uint8Array(opt.size);
    return { ok: true, blob: blobOf(bytes, meta.mime), size: bytes.length, mime: meta.mime, digest: await sha256Hex(bytes) };
  }
  if (opt.kind === "image") {
    // For images we draw to a canvas; the component will toBlob and download.
    const w = opt.width ?? 512;
    const h = opt.height ?? 512;
    if (typeof document === "undefined") {
      return { ok: false, size: 0, mime: meta.mime, error: "Image generation requires a DOM." };
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, size: 0, mime: meta.mime, error: "Canvas not available." };
    const data = ctx.createImageData(w, h);
    const rng = getRandomBytes(w * h * 4);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = rng[i];
      data.data[i + 1] = rng[i + 1];
      data.data[i + 2] = rng[i + 2];
      data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    return await new Promise<GenerateResult>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ ok: false, size: 0, mime: meta.mime, error: "toBlob failed." });
          return;
        }
        blob.arrayBuffer().then((buf) =>
          sha256Hex(new Uint8Array(buf)).then((digest) =>
            resolve({ ok: true, blob, canvas, size: blob.size, mime: meta.mime, digest }),
          ),
        );
      }, "image/png");
    });
  }
  void noisePng; // referenced to avoid TS unused warning
  return { ok: false, size: 0, mime: "", error: "Unhandled file kind." };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export const SIZE_PRESETS = [
  { label: "1 KB", bytes: 1024 },
  { label: "10 KB", bytes: 10 * 1024 },
  { label: "100 KB", bytes: 100 * 1024 },
  { label: "1 MB", bytes: 1024 * 1024 },
  { label: "5 MB", bytes: 5 * 1024 * 1024 },
  { label: "25 MB", bytes: 25 * 1024 * 1024 },
];
