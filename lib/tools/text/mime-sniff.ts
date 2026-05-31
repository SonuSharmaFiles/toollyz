// MIME Type Checker engine. Examines the first 32 bytes of a file against a
// curated table of magic-byte signatures to detect the true MIME type
// independent of the filename extension. Useful for spotting renamed
// files, content-spoofing attacks, and broken upload pipelines.

export interface Signature {
  mime: string;
  /** Human label. */
  label: string;
  /** File extension we'd suggest. */
  ext: string;
  /** Hex pattern (lowercase, two-char per byte). Use "??" as a wildcard byte. */
  pattern: string;
  /** Offset within the file where the signature starts. */
  offset?: number;
  /** Optional second pattern further into the file. */
  secondaryPattern?: { hex: string; offset: number };
  /** Free-form notes for the UI. */
  notes?: string;
}

export const SIGNATURES: Signature[] = [
  // Images
  { mime: "image/jpeg", label: "JPEG", ext: "jpg", pattern: "ffd8ff" },
  { mime: "image/png", label: "PNG", ext: "png", pattern: "89504e470d0a1a0a" },
  { mime: "image/gif", label: "GIF87a", ext: "gif", pattern: "474946383761" },
  { mime: "image/gif", label: "GIF89a", ext: "gif", pattern: "474946383961" },
  { mime: "image/webp", label: "WebP", ext: "webp", pattern: "52494646", secondaryPattern: { hex: "57454250", offset: 8 } },
  { mime: "image/bmp", label: "BMP", ext: "bmp", pattern: "424d" },
  { mime: "image/tiff", label: "TIFF (little-endian)", ext: "tif", pattern: "49492a00" },
  { mime: "image/tiff", label: "TIFF (big-endian)", ext: "tif", pattern: "4d4d002a" },
  { mime: "image/avif", label: "AVIF", ext: "avif", pattern: "????????66747970617669", offset: 0 },
  { mime: "image/heic", label: "HEIC", ext: "heic", pattern: "????????6674797068656963", offset: 0 },
  { mime: "image/x-icon", label: "ICO", ext: "ico", pattern: "00000100" },
  { mime: "image/svg+xml", label: "SVG (XML)", ext: "svg", pattern: "3c3f786d6c", notes: "Or starts with <svg" },

  // Documents
  { mime: "application/pdf", label: "PDF", ext: "pdf", pattern: "25504446" },
  { mime: "application/zip", label: "ZIP (or DOCX/XLSX/PPTX/JAR/APK)", ext: "zip", pattern: "504b0304" },
  { mime: "application/x-rar-compressed", label: "RAR v1.5+", ext: "rar", pattern: "526172211a07" },
  { mime: "application/x-7z-compressed", label: "7-Zip", ext: "7z", pattern: "377abcaf271c" },
  { mime: "application/gzip", label: "GZIP", ext: "gz", pattern: "1f8b08" },
  { mime: "application/x-tar", label: "TAR", ext: "tar", pattern: "75737461720030", offset: 257 },
  { mime: "application/x-bzip2", label: "BZIP2", ext: "bz2", pattern: "425a68" },
  { mime: "application/x-xz", label: "XZ", ext: "xz", pattern: "fd377a585a00" },

  // Audio
  { mime: "audio/mpeg", label: "MP3 (with ID3)", ext: "mp3", pattern: "494433" },
  { mime: "audio/mpeg", label: "MP3 (raw frame)", ext: "mp3", pattern: "fffb" },
  { mime: "audio/wav", label: "WAV", ext: "wav", pattern: "52494646", secondaryPattern: { hex: "57415645", offset: 8 } },
  { mime: "audio/ogg", label: "OGG", ext: "ogg", pattern: "4f676753" },
  { mime: "audio/flac", label: "FLAC", ext: "flac", pattern: "664c6143" },
  { mime: "audio/midi", label: "MIDI", ext: "mid", pattern: "4d546864" },
  { mime: "audio/aac", label: "AAC (ADTS)", ext: "aac", pattern: "fff1" },

  // Video
  { mime: "video/mp4", label: "MP4 / M4V", ext: "mp4", pattern: "????????667479706d703432" },
  { mime: "video/mp4", label: "MP4 isom", ext: "mp4", pattern: "????????6674797069736f6d" },
  { mime: "video/webm", label: "WebM", ext: "webm", pattern: "1a45dfa3" },
  { mime: "video/x-matroska", label: "Matroska MKV", ext: "mkv", pattern: "1a45dfa3" },
  { mime: "video/quicktime", label: "QuickTime MOV", ext: "mov", pattern: "????????6674797071742020" },
  { mime: "video/x-msvideo", label: "AVI", ext: "avi", pattern: "52494646", secondaryPattern: { hex: "41564920", offset: 8 } },

  // Fonts
  { mime: "font/woff", label: "WOFF", ext: "woff", pattern: "774f4646" },
  { mime: "font/woff2", label: "WOFF2", ext: "woff2", pattern: "774f4632" },
  { mime: "font/ttf", label: "TTF", ext: "ttf", pattern: "00010000" },
  { mime: "font/otf", label: "OTF (CFF)", ext: "otf", pattern: "4f54544f" },

  // Text-y
  { mime: "text/xml", label: "XML", ext: "xml", pattern: "3c3f786d6c" },
  { mime: "text/html", label: "HTML doctype", ext: "html", pattern: "3c21444f43545950", notes: "Case-insensitive doctype check" },

  // Executables
  { mime: "application/x-executable", label: "ELF (Linux/BSD)", ext: "elf", pattern: "7f454c46" },
  { mime: "application/x-msdownload", label: "PE (Windows EXE/DLL)", ext: "exe", pattern: "4d5a" },
  { mime: "application/x-mach-binary", label: "Mach-O (macOS 32-bit)", ext: "bin", pattern: "feedface" },
  { mime: "application/x-mach-binary", label: "Mach-O (macOS 64-bit)", ext: "bin", pattern: "feedfacf" },
];

export interface DetectionResult {
  ok: boolean;
  /** Matches in order of confidence (longest pattern first). */
  matches: Signature[];
  /** Hex dump of the first 32 bytes. */
  headerHex: string;
  /** Same bytes as a printable ASCII string (non-printable → "."). */
  headerAscii: string;
  /** Reported MIME from the file's metadata. */
  reportedMime: string;
  reportedSize: number;
  reportedName: string;
  /** Whether the reported extension matches one of the detected MIMEs. */
  extensionMatchesContent: boolean;
}

function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

function bytesToAscii(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    s += b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".";
  }
  return s;
}

function matchesPattern(hex: string, pattern: string, offset: number): boolean {
  if (offset + pattern.length > hex.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "?") continue;
    if (hex[offset + i] !== pattern[i]) return false;
  }
  return true;
}

export function detectFromBytes(bytes: Uint8Array): Signature[] {
  const hex = bytesToHex(bytes);
  const matches: Signature[] = [];
  for (const sig of SIGNATURES) {
    const offset = (sig.offset ?? 0) * 2;
    if (!matchesPattern(hex, sig.pattern.toLowerCase(), offset)) continue;
    if (sig.secondaryPattern) {
      const s2 = sig.secondaryPattern;
      if (!matchesPattern(hex, s2.hex.toLowerCase(), s2.offset * 2)) continue;
    }
    matches.push(sig);
  }
  // Sort by pattern length (longer = more confident).
  matches.sort((a, b) => b.pattern.length - a.pattern.length);
  return matches;
}

export async function detectFromFile(file: File): Promise<DetectionResult> {
  const slice = file.slice(0, 512);
  const buf = new Uint8Array(await slice.arrayBuffer());
  const header = buf.slice(0, 32);
  const matches = detectFromBytes(buf);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extensionMatchesContent =
    matches.length === 0 ||
    matches.some((m) => m.ext === ext || m.mime.endsWith("/" + ext));
  return {
    ok: true,
    matches,
    headerHex: bytesToHex(header),
    headerAscii: bytesToAscii(header),
    reportedMime: file.type || "(unknown)",
    reportedSize: file.size,
    reportedName: file.name,
    extensionMatchesContent,
  };
}

export function formatHex(hex: string, group = 2): string {
  const chunks: string[] = [];
  for (let i = 0; i < hex.length; i += group * 2) {
    chunks.push(hex.slice(i, Math.min(hex.length, i + group * 2)));
  }
  return chunks.join(" ");
}

export const TOTAL_SIGNATURES = SIGNATURES.length;
