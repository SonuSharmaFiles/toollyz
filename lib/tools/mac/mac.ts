// MAC-address engine for the Toollyz MAC Address Generator. Each address is
// 6 bytes; the high two bits of the first byte mean:
//
//   bit 0 (LSB of byte) = I/G — 0 unicast, 1 multicast
//   bit 1               = U/L — 0 universally administered, 1 locally admin.
//
// For random MACs we set U/L = 1 and clear I/G = 0 so the address is a
// well-formed unicast locally-administered MAC that won't clash with real
// OUI assignments. For vendor-prefixed (OUI) MACs we leave the first 3 bytes
// alone and randomise the last 3.

export interface OuiPreset {
  id: string;
  label: string;
  /** 3 bytes, e.g. "00:1B:63" (Apple). */
  prefix: string;
}

export const OUI_PRESETS: OuiPreset[] = [
  { id: "apple", label: "Apple", prefix: "00:1B:63" },
  { id: "cisco", label: "Cisco", prefix: "00:0C:29" },
  { id: "intel", label: "Intel", prefix: "3C:97:0E" },
  { id: "dell", label: "Dell", prefix: "00:14:22" },
  { id: "hp", label: "HP", prefix: "3C:D9:2B" },
  { id: "lenovo", label: "Lenovo", prefix: "70:5A:0F" },
  { id: "samsung", label: "Samsung", prefix: "78:25:AD" },
  { id: "microsoft", label: "Microsoft", prefix: "00:50:F2" },
  { id: "vmware", label: "VMware", prefix: "00:0C:29" },
  { id: "google", label: "Google", prefix: "F4:F5:E8" },
  { id: "raspberry-pi", label: "Raspberry Pi", prefix: "B8:27:EB" },
  { id: "amazon", label: "Amazon", prefix: "FC:A1:83" },
];

export type Format = "colon" | "dash" | "dot" | "none";
export type Casing = "lower" | "upper";

export interface MacOptions {
  count: number;
  /** "random" (locally administered unicast) or one of OUI ids. */
  vendor: string;
  format: Format;
  casing: Casing;
}

function secureBytes(length: number): Uint8Array {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("crypto.getRandomValues unavailable — refusing to fall back.");
  }
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf;
}

function hex(byte: number): string {
  return byte.toString(16).padStart(2, "0");
}

function parsePrefix(prefix: string): number[] {
  return prefix
    .replace(/[^0-9A-Fa-f]/g, "")
    .match(/.{1,2}/g)!
    .slice(0, 3)
    .map((b) => parseInt(b, 16));
}

export function formatBytes(bytes: number[], format: Format, casing: Casing): string {
  const parts = bytes.map(hex);
  let s: string;
  switch (format) {
    case "colon":
      s = parts.join(":");
      break;
    case "dash":
      s = parts.join("-");
      break;
    case "dot": {
      // Cisco-style: XXXX.XXXX.XXXX
      const pairs = parts.join("");
      s = (pairs.match(/.{1,4}/g) ?? []).join(".");
      break;
    }
    case "none":
    default:
      s = parts.join("");
      break;
  }
  return casing === "upper" ? s.toUpperCase() : s.toLowerCase();
}

export function generate(opts: MacOptions): string[] {
  const count = Math.max(1, Math.min(500, Math.round(opts.count)));
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let bytes: number[];
    if (opts.vendor === "random") {
      const rand = secureBytes(6);
      // Force unicast (clear bit 0) + locally administered (set bit 1) on first byte.
      rand[0] = (rand[0] & 0xfc) | 0x02;
      bytes = Array.from(rand);
    } else {
      const oui = OUI_PRESETS.find((p) => p.id === opts.vendor);
      if (!oui) {
        const rand = secureBytes(6);
        rand[0] = (rand[0] & 0xfc) | 0x02;
        bytes = Array.from(rand);
      } else {
        const prefix = parsePrefix(oui.prefix);
        const rand = secureBytes(3);
        bytes = [...prefix, ...Array.from(rand)];
      }
    }
    out.push(formatBytes(bytes, opts.format, opts.casing));
  }
  return out;
}

export function describeVendor(id: string): string {
  if (id === "random") return "Random (locally administered, unicast)";
  return OUI_PRESETS.find((p) => p.id === id)?.label ?? "Unknown";
}
