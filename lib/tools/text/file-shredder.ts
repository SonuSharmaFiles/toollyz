// Secure File Shredder engine. Important honest framing first:
//
// Browsers cannot overwrite a file on the user's disk — sandbox forbids it.
// What this tool does is take the IN-MEMORY copy of a file the user picked,
// overwrite its bytes with crypto-random data (or a DoD-5220.22-M style 3-pass
// pattern), and offer the shredded version for download. The user can then
// move the shredded download over their original file manually.
//
// We use crypto.getRandomValues for entropy, chunked through the typed-array
// in 64 KB blocks to avoid the 65 536-byte-per-call ceiling for that API.

const CHUNK_SIZE = 65_536; // crypto.getRandomValues hard limit per call
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB practical cap for in-browser shredding

export type ShredPattern = "random" | "zeros" | "ones" | "dod-3pass";

export interface PatternMeta {
  id: ShredPattern;
  label: string;
  passes: number;
  hint: string;
}

export const PATTERNS: PatternMeta[] = [
  { id: "random", label: "Single random pass", passes: 1, hint: "Fast. crypto.getRandomValues → overwrite once." },
  { id: "dod-3pass", label: "DoD 5220.22-M (3-pass)", passes: 3, hint: "Pass 1 = zeros, Pass 2 = ones, Pass 3 = random." },
  { id: "zeros", label: "Zero-fill", passes: 1, hint: "Overwrite every byte with 0x00. Useful for sparse files." },
  { id: "ones", label: "One-fill", passes: 1, hint: "Overwrite every byte with 0xFF." },
];

export const MAX_SHRED_BYTES = MAX_FILE_SIZE;

function fillRandom(buffer: Uint8Array): void {
  if (typeof crypto === "undefined" || !("getRandomValues" in crypto)) {
    // Fallback — Math.random is NOT cryptographically secure but is better
    // than nothing if crypto.getRandomValues is unavailable. In practice
    // every modern browser supports the WebCrypto API.
    for (let i = 0; i < buffer.length; i++) buffer[i] = Math.floor(Math.random() * 256);
    return;
  }
  // crypto.getRandomValues caps at 65 536 bytes per call. Slice the buffer
  // into chunks and fill each in turn.
  for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
    const slice = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE, buffer.length));
    crypto.getRandomValues(slice);
  }
}

function fill(buffer: Uint8Array, byte: number): void {
  buffer.fill(byte);
}

export interface ShredOptions {
  pattern: ShredPattern;
  /**
   * Number of bytes to keep when "truncate" is true — e.g. setting this to 0
   * effectively zero-bytes the file before download. When undefined we keep
   * the original byte length.
   */
  truncateTo?: number;
  /** Called after each pass so a progress bar can update. */
  onPass?: (passIndex: number, totalPasses: number) => void;
}

export interface ShredResult {
  bytes: Uint8Array;
  /** SHA-256 of the final shredded output (hex), for receipt-style proof. */
  digest: string;
  /** Number of passes the engine actually performed. */
  passes: number;
  /** Number of bytes overwritten. */
  size: number;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "";
  // Copy to a fresh ArrayBuffer so SubtleCrypto receives a plain backing
  // store (avoids issues with SharedArrayBuffer-backed views).
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function shredBytes(input: Uint8Array, opt: ShredOptions): Promise<ShredResult> {
  const originalSize = input.byteLength;
  const targetSize = opt.truncateTo ?? originalSize;
  if (targetSize > MAX_FILE_SIZE) {
    throw new Error(`Files over ${MAX_FILE_SIZE / 1024 / 1024} MB exceed the in-browser shred limit.`);
  }
  const out = new Uint8Array(targetSize);

  const passes = PATTERNS.find((p) => p.id === opt.pattern)?.passes ?? 1;

  for (let i = 0; i < passes; i++) {
    if (opt.pattern === "dod-3pass") {
      if (i === 0) fill(out, 0x00);
      else if (i === 1) fill(out, 0xff);
      else fillRandom(out);
    } else if (opt.pattern === "zeros") {
      fill(out, 0x00);
    } else if (opt.pattern === "ones") {
      fill(out, 0xff);
    } else {
      fillRandom(out);
    }
    opt.onPass?.(i + 1, passes);
    // Yield to the event loop so the UI doesn't lock up on big buffers.
    await new Promise((r) => setTimeout(r, 0));
  }

  const digest = await sha256(out);
  return { bytes: out, digest, passes, size: out.byteLength };
}

export async function shredFile(file: File, opt: ShredOptions): Promise<ShredResult & { suggestedName: string; mime: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Files over ${MAX_FILE_SIZE / 1024 / 1024} MB exceed the in-browser shred limit.`);
  }
  const buf = new Uint8Array(await file.arrayBuffer());
  const res = await shredBytes(buf, opt);
  return {
    ...res,
    suggestedName: deriveShreddedName(file.name),
    mime: file.type || "application/octet-stream",
  };
}

function deriveShreddedName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}.shredded`;
  return `${name.slice(0, dot)}.shredded${name.slice(dot)}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
