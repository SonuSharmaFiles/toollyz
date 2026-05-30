// vCard 3.0 builder for the Toollyz VCard Generator and the Digital Business
// Card. Generates an RFC 2426-compliant .vcf payload that imports cleanly
// into iOS Contacts, macOS Contacts, Google Contacts and Outlook.
//
// We use 3.0 (rather than 4.0) because 3.0 has the broadest mobile support.
// All values are CRLF-terminated per spec; long lines are folded at 75
// octets with a leading space to satisfy strict parsers.

export interface ContactEntry {
  /** "Home", "Work", "Mobile", etc. */
  type: string;
  value: string;
}

export interface AddressEntry {
  type: string; // HOME / WORK
  street: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
}

export interface VCardInput {
  firstName: string;
  lastName: string;
  middleName: string;
  prefix: string;
  suffix: string;
  nickname: string;
  organization: string;
  title: string;
  department: string;
  phones: ContactEntry[];
  emails: ContactEntry[];
  websites: ContactEntry[];
  addresses: AddressEntry[];
  birthday: string; // YYYY-MM-DD
  note: string;
  /** Public photo URL (we'd inline base64 but VCF inlines are flaky). */
  photoUrl: string;
}

export function emptyContactEntry(type: string): ContactEntry {
  return { type, value: "" };
}

export function emptyAddressEntry(type: string): AddressEntry {
  return { type, street: "", city: "", region: "", postcode: "", country: "" };
}

export const DEFAULT_VCARD: VCardInput = {
  firstName: "Jordan",
  lastName: "Reyes",
  middleName: "",
  prefix: "",
  suffix: "",
  nickname: "",
  organization: "Lumen Studio",
  title: "Senior Product Designer",
  department: "",
  phones: [{ type: "CELL", value: "+1 (555) 123-4567" }],
  emails: [{ type: "WORK", value: "jordan@lumen.studio" }],
  websites: [{ type: "WORK", value: "https://lumen.studio" }],
  addresses: [],
  birthday: "",
  note: "",
  photoUrl: "",
};

/** RFC 2426 §2.1.3 — escape special characters in unstructured values. */
function escapeValue(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** RFC 2425 §5.8.1 — fold lines that exceed 75 octets. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  for (let i = 0; i < line.length; i += 75) {
    out.push((i === 0 ? "" : " ") + line.slice(i, i + 75));
  }
  return out.join("\r\n");
}

function structuredName(input: VCardInput): string {
  const family = escapeValue(input.lastName);
  const given = escapeValue(input.firstName);
  const additional = escapeValue(input.middleName);
  const prefix = escapeValue(input.prefix);
  const suffix = escapeValue(input.suffix);
  return `${family};${given};${additional};${prefix};${suffix}`;
}

function formattedName(input: VCardInput): string {
  const parts = [input.prefix, input.firstName, input.middleName, input.lastName, input.suffix]
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.join(" ").trim() || "Unnamed Contact";
}

function addressLine(addr: AddressEntry): string {
  // ADR field: PO Box ; Extended ; Street ; City ; Region ; Postal ; Country
  const parts = [
    "",
    "",
    escapeValue(addr.street),
    escapeValue(addr.city),
    escapeValue(addr.region),
    escapeValue(addr.postcode),
    escapeValue(addr.country),
  ];
  return parts.join(";");
}

export function buildVcard(input: VCardInput): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  const fn = formattedName(input);
  lines.push(`FN:${escapeValue(fn)}`);
  lines.push(`N:${structuredName(input)}`);
  if (input.nickname.trim()) lines.push(`NICKNAME:${escapeValue(input.nickname)}`);
  if (input.organization.trim() || input.department.trim()) {
    const orgPair = [escapeValue(input.organization), escapeValue(input.department)].filter(Boolean).join(";");
    lines.push(`ORG:${orgPair}`);
  }
  if (input.title.trim()) lines.push(`TITLE:${escapeValue(input.title)}`);
  if (input.birthday.trim()) lines.push(`BDAY:${input.birthday.replace(/-/g, "")}`);
  for (const phone of input.phones) {
    if (!phone.value.trim()) continue;
    const type = phone.type.toUpperCase();
    lines.push(`TEL;TYPE=${type}:${escapeValue(phone.value)}`);
  }
  for (const email of input.emails) {
    if (!email.value.trim()) continue;
    const type = email.type.toUpperCase();
    lines.push(`EMAIL;TYPE=${type}:${escapeValue(email.value)}`);
  }
  for (const url of input.websites) {
    if (!url.value.trim()) continue;
    const type = url.type.toUpperCase();
    lines.push(`URL;TYPE=${type}:${escapeValue(url.value)}`);
  }
  for (const addr of input.addresses) {
    if (![addr.street, addr.city, addr.region, addr.postcode, addr.country].some((p) => p.trim())) continue;
    const type = addr.type.toUpperCase();
    lines.push(`ADR;TYPE=${type}:${addressLine(addr)}`);
  }
  if (input.photoUrl.trim()) {
    lines.push(`PHOTO;VALUE=URI:${input.photoUrl.trim()}`);
  }
  if (input.note.trim()) {
    lines.push(`NOTE:${escapeValue(input.note)}`);
  }
  lines.push(`REV:${new Date().toISOString().split(".")[0]}Z`);
  lines.push("END:VCARD");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function suggestFilename(input: VCardInput): string {
  const name = [input.firstName, input.lastName]
    .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"))
    .filter(Boolean)
    .join("-");
  return `${name || "contact"}.vcf`;
}

export const PHONE_TYPES = ["CELL", "WORK", "HOME", "FAX", "VOICE", "PAGER"];
export const EMAIL_TYPES = ["WORK", "HOME", "INTERNET"];
export const URL_TYPES = ["WORK", "HOME", "OTHER"];
export const ADDRESS_TYPES = ["WORK", "HOME"];
