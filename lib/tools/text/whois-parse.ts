// Domain Age Checker engine. WHOIS records are notoriously inconsistent
// across registries — VeriSign uses `Creation Date:`, JPRS uses `[登録年月日]`,
// Nominet uses `Registered on:`, etc. We try a curated set of regex
// patterns covering the major registries (com/net/org/io/co/uk/eu/de/jp/cn).

export interface WhoisRecord {
  domain?: string;
  registrar?: string;
  registrant?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  status: string[];
  nameservers: string[];
  /** Raw key/value pairs that we extracted. */
  raw: { key: string; value: string }[];
}

export interface AgeReport {
  record: WhoisRecord;
  ageDays?: number;
  ageYears?: number;
  ageHuman?: string;
  daysTillExpiry?: number;
  expiresHuman?: string;
  issues: { severity: "info" | "warning" | "error"; message: string }[];
}

const DATE_FORMATS = [
  // ISO 8601
  /(\d{4})[-/](\d{2})[-/](\d{2})(?:T(\d{2}):(\d{2}):(\d{2}))?/,
  // DD-MMM-YYYY (Nominet, AfriNIC)
  /(\d{1,2})-([A-Za-z]{3})-(\d{4})/,
  // YYYYMMDD
  /(\d{4})(\d{2})(\d{2})/,
];

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseDate(input: string): Date | undefined {
  const s = input.trim();
  for (const re of DATE_FORMATS) {
    const m = re.exec(s);
    if (!m) continue;
    try {
      if (m[2] && /^[A-Za-z]+$/.test(m[2])) {
        // DD-MMM-YYYY
        const day = parseInt(m[1], 10);
        const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
        const year = parseInt(m[3], 10);
        if (Number.isFinite(day) && Number.isFinite(year) && month >= 0) {
          return new Date(Date.UTC(year, month, day));
        }
      } else {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10) - 1;
        const day = parseInt(m[3], 10);
        const hh = m[4] ? parseInt(m[4], 10) : 0;
        const mm = m[5] ? parseInt(m[5], 10) : 0;
        const ss = m[6] ? parseInt(m[6], 10) : 0;
        if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
          return new Date(Date.UTC(year, month, day, hh, mm, ss));
        }
      }
    } catch {
      /* noop */
    }
  }
  // Last fallback — let JS try.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;
  return undefined;
}

const KEY_PATTERNS: { keys: RegExp; field: keyof Pick<WhoisRecord, "domain" | "registrar" | "registrant"> }[] = [
  { keys: /^(?:domain name|domain|domain_name|name)$/i, field: "domain" },
  { keys: /^(?:registrar(?: name)?|sponsoring registrar)$/i, field: "registrar" },
  { keys: /^(?:registrant(?: name)?|owner|holder)$/i, field: "registrant" },
];

const DATE_KEYS: { keys: RegExp; field: keyof Pick<WhoisRecord, "createdAt" | "updatedAt" | "expiresAt"> }[] = [
  { keys: /^(?:creation date|created(?: on)?|registered(?: on)?|registration time|created date|domain registration date)$/i, field: "createdAt" },
  { keys: /^(?:updated date|last updated|last modified|last update(?:d)?|updated)$/i, field: "updatedAt" },
  { keys: /^(?:registry expiry date|expiry date|expires on|expiration date|expiration time|expire|renewal date|domain expiration date)$/i, field: "expiresAt" },
];

const STATUS_KEY_RE = /^(?:domain status|status)$/i;
const NAMESERVER_KEY_RE = /^(?:name server|nameservers?|ns)$/i;

export function parseWhois(text: string): WhoisRecord {
  const record: WhoisRecord = {
    status: [],
    nameservers: [],
    raw: [],
  };
  if (!text.trim()) return record;
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%") || line.startsWith("#") || line.startsWith(">>>")) continue;
    const m = /^([^:]+?):\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    if (!value) continue;
    record.raw.push({ key, value });
    for (const p of KEY_PATTERNS) {
      if (p.keys.test(key)) {
        if (!record[p.field]) record[p.field] = value;
      }
    }
    for (const p of DATE_KEYS) {
      if (p.keys.test(key) && !record[p.field]) {
        const d = parseDate(value);
        if (d) record[p.field] = d;
      }
    }
    if (STATUS_KEY_RE.test(key)) record.status.push(value);
    if (NAMESERVER_KEY_RE.test(key)) record.nameservers.push(value);
  }
  // Dedup status + nameservers (case-insensitive).
  record.status = [...new Set(record.status.map((s) => s.toLowerCase()))];
  record.nameservers = [...new Set(record.nameservers.map((n) => n.toLowerCase()))];
  return record;
}

export function buildAgeReport(text: string): AgeReport {
  const record = parseWhois(text);
  const report: AgeReport = { record, issues: [] };
  if (record.createdAt) {
    const ageMs = Date.now() - record.createdAt.getTime();
    const ageDays = Math.floor(ageMs / 86400000);
    report.ageDays = ageDays;
    report.ageYears = Math.floor((ageDays / 365.25) * 10) / 10;
    report.ageHuman = humaniseDuration(ageMs);
  } else if (text.trim()) {
    report.issues.push({ severity: "warning", message: "Couldn't find a creation date — registry uses a non-standard key." });
  }
  if (record.expiresAt) {
    const daysTillExpiry = Math.floor((record.expiresAt.getTime() - Date.now()) / 86400000);
    report.daysTillExpiry = daysTillExpiry;
    report.expiresHuman = humaniseDuration(record.expiresAt.getTime() - Date.now());
    if (daysTillExpiry < 0) report.issues.push({ severity: "error", message: `Domain expired ${Math.abs(daysTillExpiry)} days ago.` });
    else if (daysTillExpiry < 30) report.issues.push({ severity: "warning", message: `Domain expires in ${daysTillExpiry} days — renew soon.` });
    else if (daysTillExpiry < 90) report.issues.push({ severity: "info", message: `Domain expires in ${daysTillExpiry} days.` });
  } else if (text.trim()) {
    report.issues.push({ severity: "info", message: "Couldn't find an expiry date — some ccTLDs (like .de) don't expose it via WHOIS." });
  }
  if (record.status.some((s) => /(clientHold|serverHold)/i.test(s))) {
    report.issues.push({ severity: "warning", message: "Status includes a 'Hold' — DNS is suspended for this domain." });
  }
  if (record.status.some((s) => /redemption|pendingDelete/i.test(s))) {
    report.issues.push({ severity: "error", message: "Domain is in redemption / pending-delete — recovery window is short." });
  }
  return report;
}

function humaniseDuration(ms: number): string {
  const days = Math.floor(Math.abs(ms) / 86400000);
  const years = Math.floor(days / 365.25);
  const remainingDays = Math.round(days - years * 365.25);
  const sign = ms < 0 ? "-" : "";
  if (years > 0) return `${sign}${years}y ${remainingDays}d`;
  return `${sign}${days}d`;
}

export const SAMPLE_WHOIS = `Domain Name: TOOLLYZ.COM
Registry Domain ID: 2858293821_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.namecheap.com
Registrar URL: http://www.namecheap.com
Updated Date: 2026-03-12T10:14:08Z
Creation Date: 2024-01-30T18:42:01Z
Registry Expiry Date: 2027-01-30T18:42:01Z
Registrar: NameCheap, Inc.
Registrar IANA ID: 1068
Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
Name Server: NS1.TOOLLYZ.COM
Name Server: NS2.TOOLLYZ.COM
DNSSEC: unsigned
URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/
>>> Last update of WHOIS database: 2026-05-31T22:00:00Z <<<`;
