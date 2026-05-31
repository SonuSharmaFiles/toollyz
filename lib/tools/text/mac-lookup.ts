// MAC Address Lookup engine. Normalises the many MAC formats users paste
// (colon-separated, dash-separated, Cisco dot-quad, bare 12-hex), then
// resolves the leading 24-bit OUI against a curated vendor table covering
// roughly 300 of the most-deployed manufacturer prefixes.
//
// This intentionally does NOT ship the full IEEE OUI registry (~50 000
// entries × ~5 MB). We cover the high-traffic prefixes Apple, Cisco, HP,
// Dell, Intel, Samsung, Google, Microsoft, etc. — the prefixes responsible
// for the overwhelming majority of devices home users actually scan.

const OUI_DB: Record<string, string> = {
  // Apple
  "001451": "Apple",
  "001b63": "Apple",
  "001cb3": "Apple",
  "001ec2": "Apple",
  "001ff3": "Apple",
  "00226b": "Apple",
  "002500": "Apple",
  "0026bb": "Apple",
  "041552": "Apple",
  "0c4de9": "Apple",
  "1093e9": "Apple",
  "14109f": "Apple",
  "1499e2": "Apple",
  "204747": "Apple",
  "28cfe9": "Apple",
  "34159e": "Apple",
  "3ca6f6": "Apple",
  "404d7f": "Apple",
  "5cf5da": "Apple",
  "68a86d": "Apple",
  "78ca39": "Apple",
  "8c2937": "Apple",
  "9027e4": "Apple",
  "98fe94": "Apple",
  "a4b197": "Apple",
  "b817c2": "Apple",
  "bcec5d": "Apple",
  "d83062": "Apple",
  "e0acf1": "Apple",
  "f0c1f1": "Apple",
  "f8e94e": "Apple",

  // Cisco / Cisco Meraki
  "00000c": "Cisco Systems",
  "001007": "Cisco Systems",
  "001a30": "Cisco Systems",
  "0023ac": "Cisco Systems",
  "003036": "Cisco Systems",
  "0050bd": "Cisco Systems",
  "00b000": "Cisco Systems",
  "00d058": "Cisco Systems",
  "00e0b0": "Cisco Systems",
  "00f6dc": "Cisco Systems",
  "388804": "Cisco Meraki",
  "8085c2": "Cisco Meraki",
  "e0cb4e": "Cisco Meraki",

  // Intel
  "001517": "Intel",
  "0019d2": "Intel",
  "0021f6": "Intel",
  "002413": "Intel",
  "00266c": "Intel",
  "0202b3": "Intel",
  "08d40c": "Intel",
  "0c8bfd": "Intel",
  "1c3947": "Intel",
  "1ca0d3": "Intel",
  "44850b": "Intel",
  "5cf938": "Intel",
  "60f262": "Intel",
  "68c44d": "Intel",
  "78ff61": "Intel",
  "78d4f1": "Intel",
  "847beb": "Intel",
  "8c7140": "Intel",
  "94c691": "Intel",
  "a4c3f0": "Intel",
  "ac7ba1": "Intel",
  "b2c0fd": "Intel",
  "c43dd9": "Intel",
  "d0a637": "Intel",
  "e09467": "Intel",
  "f44d30": "Intel",

  // Samsung
  "002566": "Samsung Electronics",
  "0023d6": "Samsung Electronics",
  "0024e9": "Samsung Electronics",
  "08373d": "Samsung Electronics",
  "0c1420": "Samsung Electronics",
  "1cf509": "Samsung Electronics",
  "30d6c9": "Samsung Electronics",
  "5404a6": "Samsung Electronics",
  "6c2f2c": "Samsung Electronics",
  "80edec": "Samsung Electronics",
  "8c7712": "Samsung Electronics",
  "9806f3": "Samsung Electronics",
  "ac3613": "Samsung Electronics",
  "b85a73": "Samsung Electronics",
  "d4e8b2": "Samsung Electronics",
  "fcdbb3": "Samsung Electronics",

  // Google / Nest / Pixel
  "00ae0c": "Google",
  "1cf29a": "Google",
  "1ce85d": "Google",
  "20df3f": "Google",
  "242b03": "Google",
  "30fd38": "Google",
  "ac63be": "Google (Nest)",
  "d8cc5a": "Google",
  "f4f5d8": "Google",
  "f4f5e8": "Google",
  "f4f5db": "Google",

  // Microsoft
  "00125a": "Microsoft",
  "001f5b": "Microsoft",
  "0050f2": "Microsoft",
  "0017fa": "Microsoft",
  "043f72": "Microsoft",
  "1cdf0f": "Microsoft",
  "204700": "Microsoft (Surface)",
  "60ba47": "Microsoft",
  "84c7ea": "Microsoft",
  "9cb6d0": "Microsoft",
  "c8b1ee": "Microsoft",

  // Amazon (Echo / FireTV / Kindle / Ring)
  "00fc8b": "Amazon",
  "44650d": "Amazon",
  "503eaa": "Amazon",
  "747548": "Amazon",
  "8871e5": "Amazon",
  "94e36d": "Amazon",
  "a002dc": "Amazon",
  "b85d4c": "Amazon",
  "f0d2f1": "Amazon",
  "f817b8": "Amazon Ring",

  // Sonos / Roku / smart TVs
  "000e58": "Sonos",
  "5cbe70": "Sonos",
  "78284f": "Sonos",
  "94b80b": "Sonos",
  "b86b23": "Sonos",
  "ac3a7a": "Roku",
  "b0a737": "Roku",
  "cc6da0": "Roku",
  "d83134": "Roku",

  // HP
  "00306e": "Hewlett-Packard",
  "001083": "Hewlett-Packard",
  "002481": "Hewlett-Packard",
  "001cc4": "Hewlett-Packard",
  "008365": "Hewlett-Packard",
  "0021f7": "Hewlett-Packard",
  "1062eb": "Hewlett-Packard",
  "30e171": "Hewlett-Packard",
  "9457a5": "Hewlett-Packard",
  "9c8e99": "Hewlett-Packard",

  // Dell
  "00065b": "Dell",
  "001143": "Dell",
  "0014a4": "Dell",
  "001ec9": "Dell",
  "002564": "Dell",
  "180373": "Dell",
  "246e96": "Dell",
  "50652b": "Dell",
  "5c260a": "Dell",
  "84a93e": "Dell",
  "b8ca3a": "Dell",
  "ec2a72": "Dell",
  "f8db88": "Dell",

  // Lenovo / IBM
  "0050d6": "Lenovo",
  "001a64": "IBM",
  "00215e": "IBM",
  "9c4e36": "Lenovo",
  "c8ddc9": "Lenovo",
  "ec88e5": "Lenovo",

  // Asus
  "001bfc": "ASUSTek",
  "001e8c": "ASUSTek",
  "0024bf": "ASUSTek",
  "1c872c": "ASUSTek",
  "30b5c2": "ASUSTek",
  "60a44c": "ASUSTek",
  "ac1f6b": "ASUSTek",
  "bcaec5": "ASUSTek",

  // Asus ROG/laptops, MSI, Gigabyte
  "1c697a": "Elitegroup",
  "001fc6": "MSI",
  "402cf4": "MSI",
  "0050ba": "Gigabyte",
  "1c1b0d": "Gigabyte",

  // Routers / networking
  "00146c": "Netgear",
  "001b2f": "Netgear",
  "0024b2": "Netgear",
  "203cae": "Netgear",
  "203db2": "Netgear",
  "44a56e": "Netgear",
  "6c198f": "Netgear",
  "98e7f5": "Netgear",
  "001346": "D-Link",
  "001cf0": "D-Link",
  "00188e": "D-Link",
  "ac9054": "D-Link",
  "b8a386": "D-Link",
  "0015e9": "D-Link",
  "0014d1": "Trendnet",
  "0040f4": "Compex / Linksys",
  "002129": "Linksys",
  "0014bf": "Linksys",
  "248c0e": "Linksys",
  "001e8f": "Buffalo",
  "0024a5": "Buffalo",
  "002586": "Buffalo",
  "001fbe": "Belkin",
  "ec1a59": "Belkin",
  "081196": "Belkin",
  "002795": "Tenda",
  "5ca39d": "Tenda",
  "ac84c6": "Tenda",
  "78d294": "TP-Link",
  "b0487a": "TP-Link",
  "1431b0": "TP-Link",
  "60634c": "TP-Link",
  "9c5322": "TP-Link",
  "f4ec38": "TP-Link",
  "f8d111": "TP-Link",
  "b4a394": "TP-Link",
  "001ee5": "Cisco-Linksys",

  // Raspberry Pi / hobby
  "b827eb": "Raspberry Pi",
  "dca632": "Raspberry Pi",
  "e45f01": "Raspberry Pi",
  "281878": "Raspberry Pi",
  "d83add": "Raspberry Pi",
  "2cf7f1": "Raspberry Pi",

  // Espressif (ESP32 / ESP8266)
  "1c9dc2": "Espressif",
  "240ac4": "Espressif",
  "2cf432": "Espressif",
  "246f28": "Espressif",
  "30aea4": "Espressif",
  "3c61b5": "Espressif",
  "84f3eb": "Espressif",
  "94b97e": "Espressif",
  "ac0bfb": "Espressif",
  "b4e62d": "Espressif",
  "bcddc2": "Espressif",
  "c45bbe": "Espressif",
  "c8c9a3": "Espressif",
  "d8a01d": "Espressif",
  "ec64c9": "Espressif",
  "f4cfa2": "Espressif",
  "fcf5c4": "Espressif",

  // VMware / virtual
  "000c29": "VMware",
  "001c14": "VMware",
  "005056": "VMware",
  "080027": "Oracle VirtualBox",
  "525400": "QEMU virtual NIC",
  "021100": "Xen virtual NIC",

  // Misc popular
  "0017a4": "Global Locate",
  "0019a8": "Genew Technologies",
  "0c1ddc": "Sony",
  "10a5d0": "Sony",
  "30183a": "Sony",
  "40f407": "Sony",
  "0021c4": "Nintendo",
  "0023cc": "Nintendo",
  "0024f3": "Nintendo",
  "0026f6": "Nintendo",
  "402bbb": "Nintendo",
  "606fff": "Nintendo",
  "0019fd": "Nintendo",
  "0009b6": "Brother",
  "0030c1": "Brother",
  "001ba9": "Brother",
  "0080a1": "Konica Minolta",
  "0021b7": "Lexmark",
  "0010e0": "Canon",
  "002ac5": "Canon",
  "001ee2": "Canon",
  "0040db": "Konica Minolta",
};

export type MacKind = "unicast" | "multicast" | "broadcast";
export type MacAdmin = "universal" | "local";

export interface MacInfo {
  /** Canonical lower-case AA:BB:CC:DD:EE:FF form. */
  canonical: string;
  /** Same but uppercase. */
  upper: string;
  /** Cisco-style 0123.4567.89AB. */
  cisco: string;
  /** Dash-separated form. */
  dashed: string;
  /** Bare 12-hex string. */
  bare: string;
  /** The 24-bit OUI prefix (lower-case, no separators). */
  oui: string;
  /** Hardware manufacturer if known; empty when unknown. */
  vendor: string;
  /** Unicast / multicast / broadcast classification. */
  kind: MacKind;
  /** Whether the address is universally-administered (IEEE-assigned) or locally-administered. */
  admin: MacAdmin;
  /** Why parsing failed (empty when ok). */
  error?: string;
  /** Was the input a valid MAC? */
  valid: boolean;
}

const HEX_ONLY = /^[0-9a-f]{12}$/i;

function normalise(input: string): string {
  return input.replace(/[\s:.\-_]/g, "").toLowerCase();
}

export function parseMac(input: string): MacInfo {
  const cleaned = normalise(input);
  if (!HEX_ONLY.test(cleaned)) {
    return {
      canonical: "",
      upper: "",
      cisco: "",
      dashed: "",
      bare: "",
      oui: "",
      vendor: "",
      kind: "unicast",
      admin: "universal",
      valid: false,
      error: "Not a valid MAC — expected 12 hexadecimal characters.",
    };
  }
  const firstByte = parseInt(cleaned.slice(0, 2), 16);
  const isBroadcast = /^ffffffffffff$/.test(cleaned);
  const isMulticast = (firstByte & 0x01) === 0x01;
  const isLocal = (firstByte & 0x02) === 0x02;
  const kind: MacKind = isBroadcast ? "broadcast" : isMulticast ? "multicast" : "unicast";
  const admin: MacAdmin = isLocal ? "local" : "universal";
  const oui = cleaned.slice(0, 6);
  const vendor = OUI_DB[oui] ?? "";

  const canonical = cleaned.match(/.{2}/g)!.join(":");
  const dashed = cleaned.match(/.{2}/g)!.join("-");
  const cisco = cleaned.match(/.{4}/g)!.join(".");

  return {
    canonical,
    upper: canonical.toUpperCase(),
    cisco,
    dashed,
    bare: cleaned,
    oui,
    vendor,
    kind,
    admin,
    valid: true,
  };
}

/** Number of OUI prefixes in the bundled vendor table. */
export const OUI_DB_SIZE = Object.keys(OUI_DB).length;
