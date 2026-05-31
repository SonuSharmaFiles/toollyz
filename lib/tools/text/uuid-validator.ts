// UUID Validator engine. Parses RFC 4122 / RFC 9562 UUIDs and reports both
// the structural validity and the encoded version + variant. Supports the
// modern v6 / v7 / v8 specs introduced in RFC 9562.

export type UuidVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type UuidVariant = "ncs" | "rfc4122" | "microsoft" | "reserved";

export interface UuidParts {
  /** Canonical lower-case form with hyphens — empty when invalid. */
  canonical: string;
  /** Hex digits with the hyphens stripped. */
  hex: string;
  /** Detected version (1-8) or null if unparseable. */
  version: UuidVersion | null;
  /** Variant per RFC 4122 §4.1.1. */
  variant: UuidVariant | null;
  /** Special — all zeros. */
  isNil: boolean;
  /** Special — all ones (FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF). */
  isMax: boolean;
  /** For v1 / v6 / v7 — the embedded UNIX millisecond timestamp. */
  timestampMs?: number;
  /** Why the UUID failed to parse, when valid === false. */
  error?: string;
}

export interface UuidValidation extends UuidParts {
  valid: boolean;
}

const HEX = /^[0-9a-f]+$/i;
const HYPHEN_FORM = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i;
const BRACE_FORM = /^\{([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\}$/i;
const URN_FORM = /^urn:uuid:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const COMPACT_FORM = /^([0-9a-f]{32})$/i;

function detectVariant(byte: number): UuidVariant {
  // Top bits of byte index 8 (the "clock-seq-hi" octet).
  if ((byte & 0x80) === 0x00) return "ncs";
  if ((byte & 0xc0) === 0x80) return "rfc4122";
  if ((byte & 0xe0) === 0xc0) return "microsoft";
  return "reserved";
}

function detectVersion(byte: number): UuidVersion | null {
  // Top 4 bits of byte index 6 are the version.
  const v = (byte >> 4) & 0xf;
  if (v >= 1 && v <= 8) return v as UuidVersion;
  return null;
}

function extractTimestampMs(hex: string, version: UuidVersion): number | undefined {
  if (version === 1 || version === 6) {
    // v1: 60-bit timestamp in 100-ns intervals since 1582-10-15.
    // Bytes layout: time_low (8 hex) | time_mid (4 hex) | time_hi_and_version (4 hex).
    let tsHex: string;
    if (version === 1) {
      const timeLow = hex.slice(0, 8);
      const timeMid = hex.slice(8, 12);
      const timeHi = hex.slice(12, 16); // top 4 bits = version
      tsHex = timeHi.slice(1) + timeMid + timeLow; // big-endian 60-bit
    } else {
      // v6: timestamp stored big-endian, no rearrangement; high 48 bits + 12 bits.
      tsHex = hex.slice(0, 12) + hex.slice(13, 16);
    }
    const ns100 = BigInt("0x" + tsHex);
    // 1582-10-15T00:00:00Z to 1970-01-01T00:00:00Z is 122 192 928 000 000 000 100ns intervals.
    const epochOffset = BigInt("122192928000000000");
    const tenThousand = BigInt(10000);
    const ms = (ns100 - epochOffset) / tenThousand;
    const num = Number(ms);
    return Number.isFinite(num) ? num : undefined;
  }
  if (version === 7) {
    // v7: 48 most-significant bits encode a UNIX-millisecond timestamp.
    const tsHex = hex.slice(0, 12);
    const ms = parseInt(tsHex, 16);
    return Number.isFinite(ms) ? ms : undefined;
  }
  return undefined;
}

export function parse(input: string): UuidValidation {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return invalid("(empty input)");
  }

  let canonical = "";
  let hexOnly = "";

  // Accept several common shapes — canonical hyphenated, braced, urn:uuid:, compact 32-char.
  let m = HYPHEN_FORM.exec(trimmed);
  if (m) {
    canonical = `${m[1]}-${m[2]}-${m[3]}-${m[4]}-${m[5]}`;
    hexOnly = `${m[1]}${m[2]}${m[3]}${m[4]}${m[5]}`;
  } else {
    m = BRACE_FORM.exec(trimmed);
    if (m) {
      canonical = `${m[1]}-${m[2]}-${m[3]}-${m[4]}-${m[5]}`;
      hexOnly = `${m[1]}${m[2]}${m[3]}${m[4]}${m[5]}`;
    } else {
      m = URN_FORM.exec(trimmed);
      if (m) {
        canonical = m[1];
        hexOnly = m[1].replace(/-/g, "");
      } else {
        m = COMPACT_FORM.exec(trimmed);
        if (m) {
          const c = m[1];
          canonical = `${c.slice(0, 8)}-${c.slice(8, 12)}-${c.slice(12, 16)}-${c.slice(16, 20)}-${c.slice(20)}`;
          hexOnly = c;
        }
      }
    }
  }

  if (!canonical || !HEX.test(hexOnly) || hexOnly.length !== 32) {
    return invalid("Not a recognisable UUID form. Try 8-4-4-4-12 hex characters with optional hyphens, braces or urn:uuid: prefix.");
  }

  const isNil = /^0+$/.test(hexOnly);
  const isMax = /^f+$/i.test(hexOnly);
  const byte6 = parseInt(hexOnly.slice(12, 14), 16);
  const byte8 = parseInt(hexOnly.slice(16, 18), 16);
  const version = detectVersion(byte6);
  const variant = detectVariant(byte8);
  const timestampMs = version !== null ? extractTimestampMs(hexOnly, version) : undefined;

  return {
    valid: true,
    canonical,
    hex: hexOnly,
    version,
    variant,
    isNil,
    isMax,
    timestampMs,
  };
}

function invalid(error: string): UuidValidation {
  return {
    valid: false,
    canonical: "",
    hex: "",
    version: null,
    variant: null,
    isNil: false,
    isMax: false,
    error,
  };
}

export const VERSION_INFO: Record<UuidVersion, { name: string; hint: string }> = {
  1: { name: "Time-based (v1)", hint: "100-ns timestamp + node MAC. Can leak generator identity and rough timing." },
  2: { name: "DCE Security (v2)", hint: "Embeds POSIX UID/GID. Rare in practice." },
  3: { name: "Name-based MD5 (v3)", hint: "Deterministic from namespace + name. Reproducible but uses MD5." },
  4: { name: "Random (v4)", hint: "122 random bits. The default safe choice for most apps." },
  5: { name: "Name-based SHA-1 (v5)", hint: "Deterministic from namespace + name. Same as v3 but with SHA-1." },
  6: { name: "Reordered time (v6, RFC 9562)", hint: "Like v1 but stores timestamp big-endian — sortable." },
  7: { name: "UNIX-time + random (v7, RFC 9562)", hint: "48-bit ms timestamp + 74 random bits — sortable and modern." },
  8: { name: "Custom (v8, RFC 9562)", hint: "Application-defined layout — only the version + variant nibbles are fixed." },
};

export const VARIANT_INFO: Record<UuidVariant, { name: string; hint: string }> = {
  ncs: { name: "NCS legacy", hint: "Pre-1995 Apollo Network Computing System. Almost never seen today." },
  rfc4122: { name: "RFC 4122 / 9562", hint: "The variant every modern UUID library produces." },
  microsoft: { name: "Microsoft GUID", hint: "Legacy COM GUIDs (binary little-endian). Compatible structurally." },
  reserved: { name: "Reserved", hint: "Top bits 111. Reserved for future definition by the standard." },
};

export interface BulkResult {
  line: string;
  result: UuidValidation;
}

export function parseBulk(text: string): BulkResult[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => ({ line, result: parse(line) }));
}
