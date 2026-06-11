// Classify raw QR text into a structured shape so the UI can render a
// label/value card instead of a single opaque pre-formatted string.
//
// Real-world QR codes encode well-known payload schemes (URL, mailto,
// tel, sms, wifi, vcard, geo, calendar, crypto). Surfacing the parsed
// fields lets us show "Network: HomeWifi · Security: WPA2 · Password:
// ••••" instead of `WIFI:T:WPA;S:HomeWifi;P:hunter2;;` — the latter
// is correct but reads like log output.

export type QrContent =
  | { kind: "url"; href: string; host: string; pretty: string; raw: string }
  | {
      kind: "email";
      address: string;
      subject?: string;
      body?: string;
      cc?: string;
      bcc?: string;
      href: string;
      raw: string;
    }
  | { kind: "phone"; number: string; href: string; raw: string }
  | { kind: "sms"; number: string; message?: string; href: string; raw: string }
  | {
      kind: "wifi";
      ssid: string;
      password?: string;
      auth?: "WPA" | "WEP" | "nopass";
      hidden?: boolean;
      raw: string;
    }
  | {
      kind: "vcard";
      name?: string;
      org?: string;
      title?: string;
      phone?: string;
      email?: string;
      url?: string;
      address?: string;
      raw: string;
    }
  | { kind: "geo"; lat: number; lng: number; mapsUrl: string; raw: string }
  | {
      kind: "calendar";
      summary?: string;
      start?: string;
      end?: string;
      location?: string;
      description?: string;
      raw: string;
    }
  | { kind: "upi"; payee: string; name?: string; amount?: string; note?: string; href: string; raw: string }
  | { kind: "crypto"; scheme: string; address: string; amount?: string; href: string; raw: string }
  | {
      // EMVCo Merchant-Presented Mode QR (NepalPay/NCHL, BharatQR,
      // UPI, PromptPay (Thailand), PayNow (Singapore), DuitNow
      // (Malaysia), QRIS (Indonesia), and most other Asian payment
      // systems). The payload is a TLV string that scans as a wall of
      // digits/letters — parsing it lets us show the actual merchant.
      kind: "emv-merchant";
      merchant?: string;
      city?: string;
      countryCode?: string;
      countryName?: string;
      currencyCode?: string;
      currency?: string;
      amount?: string;
      dynamic: boolean;
      network?: string;
      networkLabel?: string;
      mcc?: string;
      billNumber?: string;
      storeLabel?: string;
      reference?: string;
      purpose?: string;
      raw: string;
    }
  | { kind: "text"; raw: string };

const URL_RE = /^https?:\/\//i;
const EMAIL_PLAIN_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function parseQrContent(input: string): QrContent {
  const raw = input;
  const text = input.trim();

  // EMVCo Merchant-Presented QR (payment QRs). These look like a wall
  // of digits/letters starting with `000201`/`000202` or `010211`/
  // `010212` and ending with `6304XXXX` (CRC checksum). Parse before
  // any URL/text fallback so they don't fall through to "Plain text".
  if (looksLikeEmv(text)) {
    const parsed = parseEmv(text);
    if (parsed) return parsed;
  }

  // mailto: — fully URL-decoded into address + subject/body so the
  // card can show "To: x · Subject: y" instead of the raw query string.
  if (text.toLowerCase().startsWith("mailto:")) {
    const u = safeUrl(text);
    const address = u ? decodeURIComponent(u.pathname) : text.slice(7);
    const params = u?.searchParams;
    return {
      kind: "email",
      address,
      subject: params?.get("subject") ?? undefined,
      body: params?.get("body") ?? undefined,
      cc: params?.get("cc") ?? undefined,
      bcc: params?.get("bcc") ?? undefined,
      href: text,
      raw,
    };
  }

  // Plain "name@host.tld" — common in vCards and QRs that encode just
  // an address. Promote it to a mailto: link so the action button works.
  if (EMAIL_PLAIN_RE.test(text)) {
    return { kind: "email", address: text, href: `mailto:${text}`, raw };
  }

  // tel: — accept either `tel:+...` or a leading-+ bare number.
  if (/^tel:/i.test(text)) {
    const number = text.replace(/^tel:/i, "").trim();
    return { kind: "phone", number, href: `tel:${number}`, raw };
  }

  // sms:/smsto: — body comes after `?body=` or `:` depending on flavor.
  if (/^smsto?:/i.test(text)) {
    const stripped = text.replace(/^smsto?:/i, "");
    let number = stripped;
    let message: string | undefined;
    const qIdx = stripped.indexOf("?");
    if (qIdx >= 0) {
      number = stripped.slice(0, qIdx);
      const params = new URLSearchParams(stripped.slice(qIdx + 1));
      message = params.get("body") ?? undefined;
    } else if (stripped.includes(":")) {
      // smsto:NUMBER:MESSAGE
      const [n, ...rest] = stripped.split(":");
      number = n;
      message = rest.join(":");
    }
    return { kind: "sms", number, message, href: text, raw };
  }

  // WIFI:T:WPA;S:NetworkName;P:Password;H:true;;
  if (/^WIFI:/i.test(text)) {
    const inner = text.replace(/^WIFI:/i, "").replace(/;;$/, "");
    const map: Record<string, string> = {};
    // Fields are separated by ';' but values can contain escaped chars
    // (\\, \;, \, \"). Honor the spec's backslash-escape protocol.
    let key = "";
    let val = "";
    let inVal = false;
    for (let i = 0; i < inner.length; i++) {
      const c = inner[i];
      if (c === "\\" && i + 1 < inner.length) {
        const next = inner[i + 1];
        if (inVal) val += next;
        else key += next;
        i++;
        continue;
      }
      if (!inVal && c === ":") { inVal = true; continue; }
      if (inVal && c === ";") {
        if (key) map[key.toUpperCase()] = val;
        key = ""; val = ""; inVal = false; continue;
      }
      if (inVal) val += c;
      else key += c;
    }
    if (key) map[key.toUpperCase()] = val;
    const auth = (map.T ?? "").toUpperCase();
    return {
      kind: "wifi",
      ssid: map.S ?? "",
      password: map.P || undefined,
      auth: auth === "WPA" || auth === "WEP" || auth === "NOPASS" ? (auth as "WPA" | "WEP" | "nopass") : undefined,
      hidden: /^true$/i.test(map.H ?? ""),
      raw,
    };
  }

  // BEGIN:VCARD ... END:VCARD — parse the common fields. We deliberately
  // don't try to be a full vCard 4.0 parser; we extract the ones a
  // user expects to see at a glance.
  if (/^BEGIN:VCARD/i.test(text)) {
    const lines = text.split(/\r?\n/);
    const get = (prefix: string) =>
      lines.find((l) => l.toUpperCase().startsWith(prefix))?.split(":").slice(1).join(":");
    const fn = get("FN:");
    const n = get("N:");
    return {
      kind: "vcard",
      name: fn ?? (n ? n.split(";").filter(Boolean).reverse().join(" ").trim() : undefined),
      org: get("ORG:"),
      title: get("TITLE:"),
      phone: get("TEL:") ?? get("TEL;"),
      email: get("EMAIL:") ?? get("EMAIL;"),
      url: get("URL:"),
      address: get("ADR:")?.split(";").filter(Boolean).join(", "),
      raw,
    };
  }

  // geo:LAT,LNG[,ALT][?q=...]
  if (/^geo:/i.test(text)) {
    const body = text.slice(4);
    const [coords] = body.split("?");
    const [latS, lngS] = coords.split(",");
    const lat = Number(latS);
    const lng = Number(lngS);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        kind: "geo",
        lat,
        lng,
        mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        raw,
      };
    }
  }

  // iCalendar VEVENT (rare but real — event-share QRs use it).
  if (/^BEGIN:VEVENT/i.test(text) || /BEGIN:VEVENT/i.test(text)) {
    const lines = text.split(/\r?\n/);
    const get = (prefix: string) =>
      lines.find((l) => l.toUpperCase().startsWith(prefix))?.split(":").slice(1).join(":");
    return {
      kind: "calendar",
      summary: get("SUMMARY:"),
      start: get("DTSTART:") ?? get("DTSTART;"),
      end: get("DTEND:") ?? get("DTEND;"),
      location: get("LOCATION:"),
      description: get("DESCRIPTION:"),
      raw,
    };
  }

  // upi://pay?pa=…&pn=…&am=…&tn=… — Indian payments QRs.
  if (/^upi:\/\//i.test(text)) {
    const u = safeUrl(text);
    const params = u?.searchParams;
    return {
      kind: "upi",
      payee: params?.get("pa") ?? "",
      name: params?.get("pn") ?? undefined,
      amount: params?.get("am") ?? undefined,
      note: params?.get("tn") ?? undefined,
      href: text,
      raw,
    };
  }

  // bitcoin:, ethereum:, litecoin: etc.
  const cryptoMatch = /^(bitcoin|ethereum|litecoin|monero|dogecoin|solana):([^?]+)(?:\?(.*))?$/i.exec(text);
  if (cryptoMatch) {
    const [, scheme, address, query] = cryptoMatch;
    const params = query ? new URLSearchParams(query) : null;
    return {
      kind: "crypto",
      scheme: scheme.toLowerCase(),
      address,
      amount: params?.get("amount") ?? params?.get("value") ?? undefined,
      href: text,
      raw,
    };
  }

  // Plain URL — http(s) or naked domain we can promote.
  if (URL_RE.test(text)) {
    const u = safeUrl(text);
    const host = u?.host ?? text;
    const pretty = u ? `${u.host}${u.pathname === "/" ? "" : u.pathname}` : text;
    return { kind: "url", href: text, host, pretty, raw };
  }

  return { kind: "text", raw };
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

// Human-friendly label for the type badge / heading.
export function qrKindLabel(kind: QrContent["kind"]): string {
  switch (kind) {
    case "url": return "Website link";
    case "email": return "Email address";
    case "phone": return "Phone number";
    case "sms": return "SMS message";
    case "wifi": return "Wi-Fi network";
    case "vcard": return "Contact card";
    case "geo": return "Map location";
    case "calendar": return "Calendar event";
    case "upi": return "UPI payment";
    case "crypto": return "Crypto address";
    case "emv-merchant": return "Merchant payment QR";
    case "text": return "Plain text";
  }
}

// -------- EMVCo Merchant-Presented QR (EMV-MPM) parsing --------
//
// Spec: every payload is a stream of TLV records. The header is the
// Payload Format Indicator (`000201`) and the trailer is the CRC-16
// checksum (`6304XXXX`). Each record is `TT LL <LL chars of value>`
// with both TT and LL written as 2 ASCII characters.
//
// Real-world QRs frequently omit the PFI (Nepal NCHL QRs often do),
// so the detector accepts the spec start *or* a bare Point-of-Init
// (`010211` static / `010212` dynamic).

function looksLikeEmv(text: string): boolean {
  // Trailing CRC field is the most reliable signal.
  if (!/6304[0-9A-Fa-f]{4}$/.test(text)) return false;
  // Leading header (PFI or PoI). Reject anything that doesn't look
  // like a numeric tag/length prefix.
  return /^(?:000201|000202|0102(?:11|12))/.test(text);
}

function parseTlv(text: string): Record<string, string> {
  const map: Record<string, string> = {};
  let i = 0;
  while (i + 4 <= text.length) {
    const tag = text.slice(i, i + 2);
    const lenStr = text.slice(i + 2, i + 4);
    const len = parseInt(lenStr, 10);
    if (!/^\d{2}$/.test(tag) || !Number.isFinite(len) || i + 4 + len > text.length) break;
    map[tag] = text.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return map;
}

function parseEmv(raw: string): QrContent | null {
  const top = parseTlv(raw);
  if (!top["59"] && !top["29"] && !top["30"]) {
    // No Merchant Name and no merchant-account templates — not a
    // useful EMV. Bail to the plain-text fallback.
    return null;
  }

  // Network: scan reserved merchant-account templates 26..51 for the
  // first Globally Unique Identifier (sub-tag 00).
  let network: string | undefined;
  for (let t = 26; t <= 51; t++) {
    const tagS = t.toString().padStart(2, "0");
    const v = top[tagS];
    if (!v) continue;
    const guid = parseTlv(v)["00"];
    if (guid) {
      network = guid;
      break;
    }
  }
  // Fall back: scan low slots 02..25 used by card-scheme templates.
  if (!network) {
    for (let t = 2; t <= 25; t++) {
      const tagS = t.toString().padStart(2, "0");
      const v = top[tagS];
      if (!v) continue;
      const guid = parseTlv(v)["00"];
      if (guid) {
        network = guid;
        break;
      }
    }
  }

  // Additional Data Field Template (tag 62) is itself TLV.
  let billNumber: string | undefined;
  let storeLabel: string | undefined;
  let reference: string | undefined;
  let purpose: string | undefined;
  const additional = top["62"];
  if (additional) {
    const nested = parseTlv(additional);
    billNumber = nested["01"];
    storeLabel = nested["03"];
    reference = nested["05"] ?? nested["07"];
    // Tag 08 is "Purpose of Transaction" — a human-readable string.
    // Real-world QRs sometimes truncate or corrupt the length byte
    // (e.g. an extra space), leaving us with a single char or
    // garbage. Suppress anything that doesn't look like a sentence
    // fragment so the UI doesn't show "Purpose: 2".
    const candidate = nested["08"];
    if (candidate && candidate.length >= 3 && /[A-Za-z]/.test(candidate)) {
      purpose = candidate;
    }
  }

  const countryCode = top["58"];
  const currencyCode = top["53"];
  const rawAmount = top["54"];
  // Amount "0", "0.00", or missing → dynamic / user-entered.
  const amount = rawAmount && Number(rawAmount) > 0 ? rawAmount : undefined;

  return {
    kind: "emv-merchant",
    merchant: cleanWhitespace(top["59"]),
    city: cleanWhitespace(top["60"]),
    countryCode,
    countryName: countryCode ? friendlyCountry(countryCode) : undefined,
    currencyCode,
    currency: currencyCode ? friendlyCurrency(currencyCode) : undefined,
    amount,
    // PoI "12" = dynamic (one-time, fixed amount). "11" = static.
    dynamic: top["01"] === "12",
    network,
    networkLabel: network ? friendlyNetwork(network) : undefined,
    mcc: top["52"],
    billNumber,
    storeLabel: cleanWhitespace(storeLabel),
    reference,
    purpose: cleanWhitespace(purpose),
    raw,
  };
}

function cleanWhitespace(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const trimmed = v.replace(/\s+/g, " ").trim();
  return trimmed || undefined;
}

// Many real QRs glom the network prefix and the merchant id together
// into one big string (NCHL ones bake the merchant id into the GUID,
// PromptPay/BharatQR are cleaner). Match by prefix/substring so we
// resolve to a readable name even when the merchant id is appended.
function friendlyNetwork(guid: string): string {
  const lower = guid.toLowerCase();
  if (lower.startsWith("nchl")) return "NepalPay (NCHL)";
  if (lower.includes("fonepay")) return "Fonepay";
  if (lower === "upi" || lower.startsWith("in.upi")) return "UPI (BharatQR)";
  if (lower.includes("bharat")) return "BharatQR";
  if (lower.includes("paynow") || lower.startsWith("sg.paynow")) return "PayNow (Singapore)";
  if (lower.includes("promptpay") || lower.includes("napas") || lower.includes("pmm")) return "PromptPay (Thailand)";
  if (lower.includes("duitnow")) return "DuitNow (Malaysia)";
  if (lower.includes("qris")) return "QRIS (Indonesia)";
  if (lower.includes("gcash")) return "GCash (Philippines)";
  if (lower.includes("alipay")) return "Alipay";
  if (lower.includes("wechat") || lower.includes("weixin")) return "WeChat Pay";
  if (lower.includes("kbz")) return "KBZPay (Myanmar)";
  if (lower.includes("bakong")) return "Bakong KHQR (Cambodia)";
  // GUID was unrecognized — show just the leading alphabetic prefix
  // (typically the network code) instead of the merchant id tail.
  const prefix = guid.match(/^[A-Za-z]+/)?.[0];
  return prefix && prefix.length >= 2 ? prefix : guid;
}

// ISO 4217 numeric → "ALPHA (Friendly name)". Covers the currencies
// users will realistically meet on a merchant QR. Anything else falls
// back to the raw 3-digit code in the UI.
const CURRENCY_MAP: Record<string, string> = {
  "036": "AUD (Australian Dollar)",
  "050": "BDT (Bangladeshi Taka)",
  "124": "CAD (Canadian Dollar)",
  "144": "LKR (Sri Lankan Rupee)",
  "156": "CNY (Chinese Yuan)",
  "344": "HKD (Hong Kong Dollar)",
  "356": "INR (Indian Rupee)",
  "360": "IDR (Indonesian Rupiah)",
  "392": "JPY (Japanese Yen)",
  "398": "KZT (Kazakhstani Tenge)",
  "410": "KRW (South Korean Won)",
  "446": "MOP (Macanese Pataca)",
  "458": "MYR (Malaysian Ringgit)",
  "462": "MVR (Maldivian Rufiyaa)",
  "496": "MNT (Mongolian Tögrög)",
  "524": "NPR (Nepalese Rupee)",
  "554": "NZD (New Zealand Dollar)",
  "586": "PKR (Pakistani Rupee)",
  "608": "PHP (Philippine Peso)",
  "634": "QAR (Qatari Riyal)",
  "682": "SAR (Saudi Riyal)",
  "702": "SGD (Singapore Dollar)",
  "704": "VND (Vietnamese Dong)",
  "752": "SEK (Swedish Krona)",
  "756": "CHF (Swiss Franc)",
  "764": "THB (Thai Baht)",
  "784": "AED (UAE Dirham)",
  "826": "GBP (British Pound)",
  "840": "USD (US Dollar)",
  "901": "TWD (Taiwan Dollar)",
  "971": "AFN (Afghan Afghani)",
  "978": "EUR (Euro)",
};

function friendlyCurrency(code: string): string {
  return CURRENCY_MAP[code] ?? code;
}

const COUNTRY_NAMES: Record<string, string> = {
  AE: "United Arab Emirates", AU: "Australia", BD: "Bangladesh", BR: "Brazil",
  CA: "Canada", CN: "China", DE: "Germany", ES: "Spain", FR: "France",
  GB: "United Kingdom", HK: "Hong Kong", ID: "Indonesia", IN: "India",
  IT: "Italy", JP: "Japan", KH: "Cambodia", KR: "South Korea", LA: "Laos",
  LK: "Sri Lanka", MM: "Myanmar", MX: "Mexico", MY: "Malaysia", NL: "Netherlands",
  NP: "Nepal", NZ: "New Zealand", PH: "Philippines", PK: "Pakistan",
  SA: "Saudi Arabia", SG: "Singapore", TH: "Thailand", TW: "Taiwan",
  US: "United States", VN: "Vietnam",
};

function friendlyCountry(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}
