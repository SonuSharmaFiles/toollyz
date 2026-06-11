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
  | { kind: "text"; raw: string };

const URL_RE = /^https?:\/\//i;
const EMAIL_PLAIN_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function parseQrContent(input: string): QrContent {
  const raw = input;
  const text = input.trim();

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
    case "text": return "Plain text";
  }
}
