// SSL Certificate Checker engine. A focused X.509 v3 parser written
// from scratch — no `node-forge`, no `pkijs`, no `asn1.js`. Reads a PEM
// block, decodes the base64 to DER bytes, walks the ASN.1 structure of
// `Certificate { tbsCertificate, signatureAlgorithm, signatureValue }`,
// and exposes the fields users actually look at when inspecting a cert.
//
// Implemented:
//   - Version, serial number (hex)
//   - Signature algorithm OID
//   - Issuer + Subject Distinguished Names (CN, O, OU, C, L, ST, …)
//   - Validity period (notBefore, notAfter) — parses both UTCTime and
//     GeneralizedTime; computes days till expiry.
//   - SubjectPublicKeyInfo — algorithm OID + inferred RSA key bits or
//     EC curve OID
//   - v3 Extensions (a curated subset):
//       SubjectAltName     — DNS names + IP addresses
//       BasicConstraints   — isCA flag
//       KeyUsage           — bit string flags
//       ExtendedKeyUsage   — OIDs (serverAuth, clientAuth, etc.)
//   - Signature algorithm + signature length
//   - SHA-256 fingerprint over the full DER (Web Crypto, async)

export type Asn1Tag = number;

export interface Asn1Node {
  tag: Asn1Tag;
  length: number;
  /** Offset of value bytes in the buffer. */
  valueOffset: number;
  /** End offset (exclusive). */
  endOffset: number;
  /** Raw value bytes. */
  value: Uint8Array;
  /** For constructed types, parsed children. */
  children?: Asn1Node[];
}

const TAG = {
  BOOLEAN: 0x01,
  INTEGER: 0x02,
  BIT_STRING: 0x03,
  OCTET_STRING: 0x04,
  NULL: 0x05,
  OID: 0x06,
  UTF8String: 0x0c,
  SEQUENCE: 0x30,
  SET: 0x31,
  PrintableString: 0x13,
  T61String: 0x14,
  IA5String: 0x16,
  UTCTime: 0x17,
  GeneralizedTime: 0x18,
  BMPString: 0x1e,
} as const;

function isConstructed(tag: number): boolean {
  return (tag & 0x20) !== 0;
}

function parseLength(bytes: Uint8Array, offset: number): { length: number; bytesRead: number } {
  const first = bytes[offset];
  if (first < 0x80) return { length: first, bytesRead: 1 };
  const n = first & 0x7f;
  if (n === 0) throw new Error("Indefinite length not supported");
  let len = 0;
  for (let i = 0; i < n; i++) len = (len << 8) | bytes[offset + 1 + i];
  return { length: len, bytesRead: n + 1 };
}

export function parseNode(bytes: Uint8Array, offset: number): Asn1Node {
  const tag = bytes[offset];
  const { length, bytesRead } = parseLength(bytes, offset + 1);
  const valueOffset = offset + 1 + bytesRead;
  const endOffset = valueOffset + length;
  const value = bytes.subarray(valueOffset, endOffset);
  const node: Asn1Node = { tag, length, valueOffset, endOffset, value };
  if (isConstructed(tag) || tag === TAG.SEQUENCE || tag === TAG.SET) {
    node.children = [];
    let p = valueOffset;
    while (p < endOffset) {
      const child = parseNode(bytes, p);
      node.children.push(child);
      p = child.endOffset;
    }
  }
  return node;
}

function oidToString(value: Uint8Array): string {
  if (value.length === 0) return "";
  const out: number[] = [];
  // First byte = 40*x + y.
  out.push(Math.floor(value[0] / 40));
  out.push(value[0] % 40);
  let cur = 0;
  for (let i = 1; i < value.length; i++) {
    cur = (cur << 7) | (value[i] & 0x7f);
    if ((value[i] & 0x80) === 0) {
      out.push(cur);
      cur = 0;
    }
  }
  return out.join(".");
}

const OID_NAMES: Record<string, string> = {
  // RDN attribute types
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "2.5.4.12": "title",
  "2.5.4.42": "givenName",
  "2.5.4.4": "surname",
  "1.2.840.113549.1.9.1": "emailAddress",
  // Signature algorithms
  "1.2.840.113549.1.1.5": "sha1WithRSAEncryption",
  "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
  "1.2.840.113549.1.1.12": "sha384WithRSAEncryption",
  "1.2.840.113549.1.1.13": "sha512WithRSAEncryption",
  "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
  "1.3.101.112": "Ed25519",
  // Public key algos
  "1.2.840.113549.1.1.1": "rsaEncryption",
  "1.2.840.10045.2.1": "id-ecPublicKey",
  // EC curves
  "1.2.840.10045.3.1.7": "prime256v1 (P-256)",
  "1.3.132.0.34": "secp384r1 (P-384)",
  "1.3.132.0.35": "secp521r1 (P-521)",
  // Extensions
  "2.5.29.14": "subjectKeyIdentifier",
  "2.5.29.15": "keyUsage",
  "2.5.29.17": "subjectAltName",
  "2.5.29.19": "basicConstraints",
  "2.5.29.31": "cRLDistributionPoints",
  "2.5.29.32": "certificatePolicies",
  "2.5.29.35": "authorityKeyIdentifier",
  "2.5.29.37": "extendedKeyUsage",
  // EKU values
  "1.3.6.1.5.5.7.3.1": "serverAuth",
  "1.3.6.1.5.5.7.3.2": "clientAuth",
  "1.3.6.1.5.5.7.3.3": "codeSigning",
  "1.3.6.1.5.5.7.3.4": "emailProtection",
  "1.3.6.1.5.5.7.3.8": "timeStamping",
  "1.3.6.1.5.5.7.3.9": "OCSPSigning",
  // Authority Information Access
  "1.3.6.1.5.5.7.1.1": "authorityInfoAccess",
  "1.3.6.1.5.5.7.48.1": "OCSP",
  "1.3.6.1.5.5.7.48.2": "caIssuers",
};

function oidName(oid: string): string {
  return OID_NAMES[oid] ?? oid;
}

function decodeAsciiString(value: Uint8Array): string {
  let out = "";
  for (let i = 0; i < value.length; i++) out += String.fromCharCode(value[i]);
  return out;
}
function decodeUtf8(value: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(value);
}

function decodeString(node: Asn1Node): string {
  switch (node.tag) {
    case TAG.UTF8String:
      return decodeUtf8(node.value);
    case TAG.PrintableString:
    case TAG.IA5String:
    case TAG.T61String:
      return decodeAsciiString(node.value);
    case TAG.BMPString: {
      let out = "";
      for (let i = 0; i + 1 < node.value.length; i += 2) {
        out += String.fromCharCode((node.value[i] << 8) | node.value[i + 1]);
      }
      return out;
    }
    default:
      return decodeAsciiString(node.value);
  }
}

function parseTime(node: Asn1Node): Date | null {
  const s = decodeAsciiString(node.value);
  if (node.tag === TAG.UTCTime) {
    // YYMMDDHHMMSSZ
    const m = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(s);
    if (!m) return null;
    const yy = parseInt(m[1], 10);
    const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
    return new Date(Date.UTC(fullYear, parseInt(m[2], 10) - 1, parseInt(m[3], 10), parseInt(m[4], 10), parseInt(m[5], 10), parseInt(m[6], 10)));
  }
  if (node.tag === TAG.GeneralizedTime) {
    const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z?$/.exec(s);
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
  }
  return null;
}

function parseDN(seq: Asn1Node): { name: string; pairs: { type: string; value: string }[] } {
  const pairs: { type: string; value: string }[] = [];
  for (const rdn of seq.children ?? []) {
    for (const atv of rdn.children ?? []) {
      const oidNode = atv.children?.[0];
      const valNode = atv.children?.[1];
      if (!oidNode || !valNode) continue;
      const oid = oidToString(oidNode.value);
      pairs.push({ type: oidName(oid), value: decodeString(valNode) });
    }
  }
  const name = pairs.map((p) => `${p.type}=${p.value}`).join(", ");
  return { name, pairs };
}

function bytesToHex(bytes: Uint8Array, sep = ""): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(sep);
}

export interface SanEntry {
  kind: "DNS" | "IP" | "Email" | "URI" | "Other";
  value: string;
}

export interface CertReport {
  version: number;
  serialHex: string;
  signatureAlgorithm: string;
  issuer: { name: string; pairs: { type: string; value: string }[] };
  subject: { name: string; pairs: { type: string; value: string }[] };
  notBefore?: Date;
  notAfter?: Date;
  daysTillExpiry?: number;
  publicKey: {
    algorithm: string;
    rsaBits?: number;
    ecCurve?: string;
  };
  san: SanEntry[];
  isCa: boolean;
  keyUsage: string[];
  extendedKeyUsage: string[];
  /** SHA-256 of the full DER — computed async by caller. */
  sha256?: string;
  bytes: number;
  issues: { severity: "error" | "warning" | "info" | "ok"; message: string }[];
}

const KEY_USAGE_BITS = [
  "digitalSignature",
  "nonRepudiation",
  "keyEncipherment",
  "dataEncipherment",
  "keyAgreement",
  "keyCertSign",
  "cRLSign",
  "encipherOnly",
  "decipherOnly",
];

export function pemToDer(pem: string): Uint8Array | null {
  // Strip PEM headers + whitespace + decode base64.
  const m = /-----BEGIN [A-Z ]+-----([\s\S]+?)-----END [A-Z ]+-----/i.exec(pem.trim());
  const b64 = (m ? m[1] : pem).replace(/[\s\r\n]+/g, "");
  if (!b64) return null;
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function parseCertificate(pem: string): CertReport | { error: string } {
  const der = pemToDer(pem);
  if (!der) return { error: "Could not decode PEM. Expected `-----BEGIN CERTIFICATE-----` block (or raw base64)." };
  try {
    const root = parseNode(der, 0);
    if (root.tag !== TAG.SEQUENCE || !root.children) throw new Error("Not a SEQUENCE");
    // Certificate ::= SEQUENCE { tbsCertificate, signatureAlgorithm, signatureValue }
    const tbs = root.children[0];
    const sigAlg = root.children[1];
    // const sigValue = root.children[2];

    if (!tbs.children) throw new Error("Missing tbsCertificate");
    let idx = 0;
    // version [0] EXPLICIT Version DEFAULT v1
    let version = 1;
    if (tbs.children[0].tag === 0xa0) {
      const inner = tbs.children[0].children?.[0];
      if (inner && inner.tag === TAG.INTEGER) version = inner.value[0] + 1;
      idx++;
    }
    const serialNode = tbs.children[idx++];
    const sigAlgInner = tbs.children[idx++];
    const issuerSeq = tbs.children[idx++];
    const validitySeq = tbs.children[idx++];
    const subjectSeq = tbs.children[idx++];
    const spkiSeq = tbs.children[idx++];
    // optional issuerUID, subjectUID, extensions — extensions tagged [3].
    let extensionsSeq: Asn1Node | undefined;
    while (idx < tbs.children.length) {
      const n = tbs.children[idx++];
      if (n.tag === 0xa3) {
        extensionsSeq = n.children?.[0];
      }
    }

    const serialHex = bytesToHex(serialNode.value, ":");
    const sigAlgOid = oidToString(sigAlg.children?.[0]?.value ?? new Uint8Array());
    const sigAlgInnerOid = oidToString(sigAlgInner.children?.[0]?.value ?? new Uint8Array());
    const signatureAlgorithm = oidName(sigAlgOid || sigAlgInnerOid);

    const issuer = parseDN(issuerSeq);
    const subject = parseDN(subjectSeq);

    const notBeforeNode = validitySeq.children?.[0];
    const notAfterNode = validitySeq.children?.[1];
    const notBefore = notBeforeNode ? parseTime(notBeforeNode) ?? undefined : undefined;
    const notAfter = notAfterNode ? parseTime(notAfterNode) ?? undefined : undefined;
    const daysTillExpiry = notAfter ? Math.floor((notAfter.getTime() - Date.now()) / 86400000) : undefined;

    // SPKI: SEQUENCE { algorithm SEQUENCE { OID, params }, subjectPublicKey BIT STRING }.
    const algoSeq = spkiSeq.children?.[0];
    const algoOid = oidToString(algoSeq?.children?.[0]?.value ?? new Uint8Array());
    const pkBitString = spkiSeq.children?.[1];
    let rsaBits: number | undefined;
    let ecCurve: string | undefined;
    if (algoOid === "1.2.840.113549.1.1.1" && pkBitString && pkBitString.value.length > 1) {
      // RSA: BIT STRING content is unused-bits + DER of RSAPublicKey SEQUENCE.
      // First byte is unused-bits count.
      const rsaSeqStart = pkBitString.value[0] === 0x00 ? 1 : 0;
      const rsaSeqBytes = pkBitString.value.subarray(rsaSeqStart);
      const rsaSeq = parseNode(rsaSeqBytes, 0);
      const modulus = rsaSeq.children?.[0];
      if (modulus) {
        let bytes = modulus.value.length;
        if (modulus.value[0] === 0x00) bytes--;
        rsaBits = bytes * 8;
      }
    } else if (algoOid === "1.2.840.10045.2.1") {
      const params = algoSeq?.children?.[1];
      if (params && params.tag === TAG.OID) ecCurve = oidName(oidToString(params.value));
    }

    // Extensions.
    const san: SanEntry[] = [];
    let isCa = false;
    const keyUsage: string[] = [];
    const extendedKeyUsage: string[] = [];
    if (extensionsSeq?.children) {
      for (const ext of extensionsSeq.children) {
        if (!ext.children) continue;
        const oidNode = ext.children[0];
        // optional critical BOOLEAN
        const valueNode = ext.children[ext.children.length - 1];
        const oid = oidToString(oidNode.value);
        if (oid === "2.5.29.17") {
          // SubjectAltName — OCTET STRING wraps SEQUENCE OF GeneralName.
          const inner = parseNode(valueNode.value, 0);
          for (const gn of inner.children ?? []) {
            switch (gn.tag) {
              case 0x82: // dNSName [2] IA5String
                san.push({ kind: "DNS", value: decodeAsciiString(gn.value) });
                break;
              case 0x87: // iPAddress [7] OCTET STRING
                san.push({ kind: "IP", value: gn.value.length === 4 ? Array.from(gn.value).join(".") : bytesToHex(gn.value, ":") });
                break;
              case 0x81:
                san.push({ kind: "Email", value: decodeAsciiString(gn.value) });
                break;
              case 0x86:
                san.push({ kind: "URI", value: decodeAsciiString(gn.value) });
                break;
              default:
                san.push({ kind: "Other", value: `(tag 0x${gn.tag.toString(16)})` });
            }
          }
        } else if (oid === "2.5.29.19") {
          const inner = parseNode(valueNode.value, 0);
          const caBool = inner.children?.[0];
          if (caBool && caBool.tag === TAG.BOOLEAN && caBool.value[0] !== 0) isCa = true;
        } else if (oid === "2.5.29.15") {
          const inner = parseNode(valueNode.value, 0);
          if (inner.tag === TAG.BIT_STRING && inner.value.length > 1) {
            const unused = inner.value[0];
            const bits = inner.value.subarray(1);
            for (let i = 0; i < bits.length * 8 - unused; i++) {
              const byte = bits[Math.floor(i / 8)];
              if ((byte >> (7 - (i % 8))) & 1) {
                if (i < KEY_USAGE_BITS.length) keyUsage.push(KEY_USAGE_BITS[i]);
              }
            }
          }
        } else if (oid === "2.5.29.37") {
          const inner = parseNode(valueNode.value, 0);
          for (const ekuOid of inner.children ?? []) {
            extendedKeyUsage.push(oidName(oidToString(ekuOid.value)));
          }
        }
      }
    }

    const issues: CertReport["issues"] = [];
    if (notAfter && daysTillExpiry !== undefined) {
      if (daysTillExpiry < 0) issues.push({ severity: "error", message: `Certificate expired ${Math.abs(daysTillExpiry)} days ago.` });
      else if (daysTillExpiry < 14) issues.push({ severity: "error", message: `Certificate expires in ${daysTillExpiry} days — renew immediately.` });
      else if (daysTillExpiry < 30) issues.push({ severity: "warning", message: `Certificate expires in ${daysTillExpiry} days.` });
      else issues.push({ severity: "ok", message: `Certificate valid for ${daysTillExpiry} more days.` });
    }
    if (notBefore && Date.now() < notBefore.getTime()) {
      issues.push({ severity: "warning", message: `Certificate not yet valid (notBefore is in the future).` });
    }
    if (rsaBits !== undefined) {
      if (rsaBits < 2048) issues.push({ severity: "warning", message: `RSA key is ${rsaBits} bits — modern minimum is 2048.` });
      else issues.push({ severity: "ok", message: `RSA key is ${rsaBits} bits.` });
    }
    if (signatureAlgorithm === "sha1WithRSAEncryption") {
      issues.push({ severity: "error", message: "SHA-1 signature is deprecated and untrusted by major browsers since 2017." });
    }
    if (san.length === 0) {
      issues.push({ severity: "warning", message: "No Subject Alternative Names — modern browsers ignore Common Name for hostname validation; SAN is required." });
    }

    const ver = `v${version}`;
    void ver;

    return {
      version,
      serialHex,
      signatureAlgorithm,
      issuer,
      subject,
      notBefore: notBefore ?? undefined,
      notAfter: notAfter ?? undefined,
      daysTillExpiry,
      publicKey: {
        algorithm: oidName(algoOid),
        rsaBits,
        ecCurve,
      },
      san,
      isCa,
      keyUsage,
      extendedKeyUsage,
      bytes: der.length,
      issues,
    };
  } catch (err) {
    return { error: `Parse failed: ${(err as Error).message}` };
  }
}

export async function sha256Fingerprint(pem: string): Promise<string | undefined> {
  if (typeof crypto === "undefined" || !crypto.subtle) return undefined;
  const der = pemToDer(pem);
  if (!der) return undefined;
  const ab = new ArrayBuffer(der.length);
  new Uint8Array(ab).set(der);
  const digest = await crypto.subtle.digest("SHA-256", ab);
  return bytesToHex(new Uint8Array(digest), ":");
}

export const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIDtDCCAxqgAwIBAgIQDOfg5RfYRv6P5WD8G/AwOTAKBggqhkjOPQQDAzBhMQsw
CQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cu
ZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBHMzAe
Fw0xMzA4MDExMjAwMDBaFw0zODAxMTUxMjAwMDBaMGExCzAJBgNVBAYTAlVTMRUw
EwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5jb20x
IDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IEczMHYwEAYHKoZIzj0CAQYF
K4EEACIDYgAE3afZu4q4C/sLfyHS8L6+c/MzXRq8NOrexpu80JX28MzQC7phW1FG
fp4tn+6OYwwX7Adw9c+ELkCDnOg/QW07rdOkFFk2eJ0DQ+4QE2xy3q6Ip6FrtUPO
Z9wj/wMco+I+o0IwQDAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBhjAd
BgNVHQ4EFgQUs9tIpPmhxdiuNkHMEWNpYim8S8YwCgYIKoZIzj0EAwMDaAAwZQIx
AK288mw/EkrRLTnDCgmXc/SINoyIJ7vmiI1Qhadj+Z4y3maTD/HMsQmP3Wyr+mt/
oAIwOWZbwmSNuJ5Q3KjVSaLtx9zRSX8XAbjIho9OjIgrqJqpisXRAL34VOKa5Vt8
sycX
-----END CERTIFICATE-----`;
