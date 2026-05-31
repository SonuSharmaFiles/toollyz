// DKIM Record Checker engine. Parses a DKIM TXT record value
// (everything after the `key._domainkey.example.com  IN  TXT  "..."`
// prefix) into its semicolon-separated tags, then validates each.
//
// RFC 6376 tags:
//   v   version (must be "DKIM1")
//   k   key type ("rsa" default; "ed25519" newer)
//   p   public key (base64; "" = revoked)
//   h   acceptable hash algorithms (csv, default = "sha256")
//   s   service types (default = "*")
//   t   flags (csv: "y" = testing, "s" = strict subdomain)
//   n   notes (free text)
//
// For RSA keys we decode the base64 and infer key length from the
// DER-encoded SubjectPublicKeyInfo by reading the modulus length byte.

export interface DkimTag {
  name: string;
  value: string;
}

export interface DkimIssue {
  severity: "error" | "warning" | "info";
  message: string;
}

export interface DkimReport {
  raw: string;
  tags: DkimTag[];
  version?: string;
  keyType: string;
  publicKey?: string;
  /** Inferred RSA key length in bits, if recognisable. */
  keyBits?: number;
  acceptedHashes: string[];
  serviceTypes: string[];
  flags: string[];
  notes?: string;
  revoked: boolean;
  issues: DkimIssue[];
}

const KNOWN_TAGS = new Set(["v", "k", "p", "h", "s", "t", "n", "g"]);

export function parse(text: string): DkimReport {
  const raw = text
    .replace(/^v=DKIM1[^\s]*\s+/i, (m) => m) // leave alone
    .replace(/[\s\n\r]+/g, " ")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/"\s+"/g, "");
  const issues: DkimIssue[] = [];
  const tags: DkimTag[] = [];
  let version: string | undefined;
  let keyType = "rsa";
  let publicKey: string | undefined;
  let acceptedHashes: string[] = ["sha256"];
  let serviceTypes: string[] = ["*"];
  const flags: string[] = [];
  let notes: string | undefined;
  let revoked = false;

  if (!raw) {
    issues.push({ severity: "error", message: "Empty record — paste the DKIM TXT value." });
    return { raw, tags, keyType, acceptedHashes, serviceTypes, flags, revoked, issues };
  }

  for (const part of raw.split(/\s*;\s*/)) {
    if (!part.trim()) continue;
    const eq = part.indexOf("=");
    if (eq === -1) {
      issues.push({ severity: "warning", message: `Tag without value: '${part}'.` });
      continue;
    }
    const name = part.slice(0, eq).trim().toLowerCase();
    const value = part.slice(eq + 1).trim();
    tags.push({ name, value });
    if (!KNOWN_TAGS.has(name)) {
      issues.push({ severity: "info", message: `Unrecognised tag '${name}' — DKIM ignores it.` });
    }
    if (name === "v") version = value;
    else if (name === "k") keyType = value.toLowerCase();
    else if (name === "p") {
      publicKey = value;
      if (!value) {
        revoked = true;
        issues.push({ severity: "warning", message: "p= is empty — this key is revoked. Receivers will reject signatures using this selector." });
      }
    } else if (name === "h") acceptedHashes = value.split(":").map((s) => s.trim().toLowerCase());
    else if (name === "s") serviceTypes = value.split(":").map((s) => s.trim().toLowerCase());
    else if (name === "t") flags.push(...value.split(":").map((s) => s.trim().toLowerCase()));
    else if (name === "n") notes = value;
  }

  if (!version) issues.push({ severity: "error", message: "Missing v=DKIM1 — every DKIM record must start with the version tag." });
  else if (version !== "DKIM1") issues.push({ severity: "error", message: `v='${version}' is invalid — only DKIM1 is defined.` });
  if (!tags.find((t) => t.name === "p")) issues.push({ severity: "error", message: "Missing p= — public key tag is required (even if empty for revocation)." });

  // Key validation.
  if (publicKey) {
    if (keyType === "rsa") {
      const bits = inferRsaKeyBits(publicKey);
      if (bits === undefined) {
        issues.push({ severity: "warning", message: "Could not decode public key to determine RSA key length." });
      } else {
        if (bits < 1024) {
          issues.push({ severity: "error", message: `RSA key is ${bits} bits — below the 1024-bit minimum. Many receivers reject.` });
        } else if (bits < 2048) {
          issues.push({ severity: "warning", message: `RSA key is ${bits} bits — 2048 is the modern minimum (1024 deprecated since 2018).` });
        } else {
          issues.push({ severity: "info", message: `RSA key is ${bits} bits.` });
        }
      }
    } else if (keyType === "ed25519") {
      issues.push({ severity: "info", message: "Ed25519 key detected — modern compact algorithm, but support is uneven (Gmail OK as of 2024)." });
    } else {
      issues.push({ severity: "warning", message: `Unknown key type '${keyType}' — RFC 6376 defines only rsa and ed25519.` });
    }
  }

  // Flags: 'y' = testing.
  if (flags.includes("y")) {
    issues.push({ severity: "info", message: "Flag t=y — testing mode. Receivers may treat failures as warnings only." });
  }
  if (flags.includes("s")) {
    issues.push({ severity: "info", message: "Flag t=s — strict subdomain mode (i.e. From: must align with d=)." });
  }

  // Acceptable hash sanity.
  if (acceptedHashes.includes("sha1")) {
    issues.push({ severity: "warning", message: "h= allows SHA-1 — deprecated. Restrict to sha256." });
  }
  if (!acceptedHashes.includes("sha256") && !acceptedHashes.includes("*")) {
    issues.push({ severity: "warning", message: "h= does not include sha256 — most receivers require it." });
  }

  // Inferred ok-ness for informational stats.
  const inferredKeyBits = keyType === "rsa" && publicKey ? inferRsaKeyBits(publicKey) : undefined;

  return {
    raw,
    tags,
    version,
    keyType,
    publicKey,
    keyBits: inferredKeyBits,
    acceptedHashes,
    serviceTypes,
    flags,
    notes,
    revoked,
    issues,
  };
}

/** Best-effort RSA key length inference from base64 SubjectPublicKeyInfo. */
function inferRsaKeyBits(b64: string): number | undefined {
  try {
    const cleaned = b64.replace(/\s+/g, "");
    const binStr = typeof atob !== "undefined" ? atob(cleaned) : "";
    if (!binStr) return undefined;
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    // Walk DER: SEQUENCE → SEQUENCE (algo) → BIT STRING → unused-bits byte → SEQUENCE → INTEGER (modulus).
    let i = 0;
    if (bytes[i++] !== 0x30) return undefined;
    i += readLen(bytes, i).bytes;
    if (bytes[i++] !== 0x30) return undefined; // algorithm seq
    const algoLen = readLen(bytes, i);
    i += algoLen.bytes + algoLen.value;
    if (bytes[i++] !== 0x03) return undefined; // BIT STRING
    i += readLen(bytes, i).bytes;
    i++; // unused bits byte
    if (bytes[i++] !== 0x30) return undefined; // RSAPublicKey seq
    i += readLen(bytes, i).bytes;
    if (bytes[i++] !== 0x02) return undefined; // INTEGER (modulus)
    const modLen = readLen(bytes, i);
    i += modLen.bytes;
    let modBytes = modLen.value;
    // Strip leading 0x00 sign byte.
    if (bytes[i] === 0x00) modBytes--;
    return modBytes * 8;
  } catch {
    return undefined;
  }
}

function readLen(bytes: Uint8Array, off: number): { value: number; bytes: number } {
  const b = bytes[off];
  if (b < 0x80) return { value: b, bytes: 1 };
  const n = b & 0x7f;
  let v = 0;
  for (let i = 0; i < n; i++) v = (v << 8) | bytes[off + 1 + i];
  return { value: v, bytes: n + 1 };
}

export const SAMPLE_DKIM = `v=DKIM1; k=rsa; h=sha256; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxoLDqz4r2yDPjN7l5L9c1eRmsh1IjJqDqRcSx0e0aRfgI4xLnGTSXl0BCqDDGtKuq1NQM5Yz0KbAhEXh1m6t7eVeYJYP7sJaJ5SE3p0vGPe8WqMVjPbA0KqzPDjkqlbqNCNGz3RfJzpyZ3KvGfDLkfMo6w6FCv9G4O4CdZklSp4N0nJzcXVeEYrJh3fYW0PaowNcrMTFqHQqPMqPiWqxgxhqxxFhmtCfm4yvPdz6rRrEXoRkk8wYJ8wAEKLrTUAtrNvvfwTNTJpVmAd0iJWGAjMlNeS7svFq7tSqIuC60GpgPRr7nM5XCEzdpJySbfQK4hxLNijCJjyl3oP5jrwIDAQAB`;
