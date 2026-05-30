// WHOIS Domain Lookup engine. Toollyz is a static site, so this can't query
// WHOIS port 43 directly — instead it uses RDAP (Registration Data Access
// Protocol), the modern IETF-standardized HTTP+JSON replacement for WHOIS.
//
// Flow:
//   1. Fetch the IANA RDAP bootstrap (https://data.iana.org/rdap/dns.json),
//      a static JSON file that lists which RDAP server handles each TLD.
//      Cached in localStorage for a day.
//   2. Pick the HTTPS RDAP server for the input domain's TLD.
//   3. Query `<server>/domain/<name>` for the standardized JSON response.
//   4. Parse events (registration / expiration), entities (registrar,
//      registrant — often redacted post-GDPR), nameservers and statuses.
//
// Each step has its own honest error so the user can see which one failed.

import { fetchWithTimeout } from "@/lib/tools/shared/net";

interface BootstrapData {
  services: [string[], string[]][];
  publication?: string;
}

const BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const BOOTSTRAP_KEY = "toollyz:rdap-bootstrap";
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000;

let memoryCache: BootstrapData | null = null;
let memoryTs = 0;

async function getBootstrap(): Promise<BootstrapData | null> {
  if (memoryCache && Date.now() - memoryTs < BOOTSTRAP_TTL_MS) return memoryCache;
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(BOOTSTRAP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: BootstrapData; ts: number };
        if (parsed?.data?.services && Date.now() - parsed.ts < BOOTSTRAP_TTL_MS) {
          memoryCache = parsed.data;
          memoryTs = parsed.ts;
          return memoryCache;
        }
      }
    } catch {
      /* noop */
    }
  }
  const r = await fetchWithTimeout(BOOTSTRAP_URL, { timeoutMs: 6000, cache: "no-store" });
  if (!r.ok) return null;
  try {
    const data = (await r.response.json()) as BootstrapData;
    if (!Array.isArray(data.services)) return null;
    memoryCache = data;
    memoryTs = Date.now();
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(BOOTSTRAP_KEY, JSON.stringify({ data, ts: memoryTs }));
      } catch {
        /* ignore quota */
      }
    }
    return data;
  } catch {
    return null;
  }
}

function pickServer(bootstrap: BootstrapData, tld: string): string | null {
  const t = tld.toLowerCase();
  for (const [tlds, servers] of bootstrap.services) {
    if (tlds.includes(t)) {
      const https = servers.find((s) => s.startsWith("https://")) ?? servers[0];
      return https ? https.replace(/\/$/, "") : null;
    }
  }
  return null;
}

export interface RdapEvent { action: string; date?: string; actor?: string }

export interface RdapEntity {
  handle?: string;
  roles: string[];
  name?: string;
  org?: string;
  email?: string;
  phone?: string;
  url?: string;
}

export interface RdapNameserver { ldhName: string; ipv4?: string[]; ipv6?: string[] }

export interface DomainResult {
  domain: string;
  handle?: string;
  status?: string[];
  events: RdapEvent[];
  entities: RdapEntity[];
  nameservers: RdapNameserver[];
  secureDNS?: { delegationSigned?: boolean };
  rdapServer: string;
  tld: string;
}

const DOMAIN_RE = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;

export function normalizeDomain(input: string): { ok: boolean; value: string; error?: string } {
  let s = input.trim().toLowerCase();
  if (!s) return { ok: false, value: "", error: "Enter a domain name." };
  s = s.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  s = s.replace(/\.$/, "");
  try {
    const u = new URL(`http://${s}`);
    // u.hostname strips Unicode -> punycode for IDN domains
    s = u.hostname;
  } catch {
    /* fall through */
  }
  if (!DOMAIN_RE.test(s)) return { ok: false, value: s, error: "That doesn't look like a valid domain." };
  return { ok: true, value: s };
}

type VcardField = [string, Record<string, unknown> | object, string, string | string[]];

function parseVcard(vcardArray: unknown): Partial<RdapEntity> {
  const out: Partial<RdapEntity> = {};
  if (!Array.isArray(vcardArray) || vcardArray.length < 2 || !Array.isArray(vcardArray[1])) return out;
  for (const item of vcardArray[1] as VcardField[]) {
    if (!Array.isArray(item) || item.length < 4) continue;
    const [field, , , value] = item;
    if (field === "fn" && typeof value === "string") out.name = value;
    if (field === "org" && typeof value === "string") out.org = value;
    if (field === "email" && typeof value === "string") out.email = value;
    if (field === "tel" && typeof value === "string") out.phone = value;
    if (field === "url" && typeof value === "string") out.url = value;
  }
  return out;
}

function parseEntities(entities: unknown): RdapEntity[] {
  if (!Array.isArray(entities)) return [];
  return entities.map((e) => {
    const rec = e as { vcardArray?: unknown; roles?: unknown; handle?: unknown };
    const v = parseVcard(rec.vcardArray);
    return {
      handle: typeof rec.handle === "string" ? rec.handle : undefined,
      roles: Array.isArray(rec.roles) ? (rec.roles as unknown[]).map(String) : [],
      ...v,
    };
  });
}

function parseNameservers(ns: unknown): RdapNameserver[] {
  if (!Array.isArray(ns)) return [];
  return ns.map((n) => {
    const rec = n as { ldhName?: unknown; ipAddresses?: { v4?: unknown; v6?: unknown } };
    return {
      ldhName: typeof rec.ldhName === "string" ? rec.ldhName.toLowerCase() : "",
      ipv4: Array.isArray(rec.ipAddresses?.v4) ? (rec.ipAddresses.v4 as unknown[]).map(String) : undefined,
      ipv6: Array.isArray(rec.ipAddresses?.v6) ? (rec.ipAddresses.v6 as unknown[]).map(String) : undefined,
    };
  }).filter((n) => n.ldhName);
}

export type LookupResult =
  | { ok: true; result: DomainResult }
  | { ok: false; error: string; kind: "input" | "bootstrap" | "no-rdap" | "network" | "timeout" | "not-found" | "blocked" | "parse" };

export async function lookupDomain(rawDomain: string): Promise<LookupResult> {
  const norm = normalizeDomain(rawDomain);
  if (!norm.ok) return { ok: false, error: norm.error ?? "Invalid domain.", kind: "input" };

  const tld = norm.value.split(".").pop()!;
  const bootstrap = await getBootstrap();
  if (!bootstrap) {
    return {
      ok: false,
      error: "Couldn't reach the IANA RDAP bootstrap registry (data.iana.org). Check your connection and try again.",
      kind: "bootstrap",
    };
  }
  const server = pickServer(bootstrap, tld);
  if (!server) {
    return {
      ok: false,
      error: `No RDAP server is registered with IANA for .${tld}. Many ccTLDs (e.g. .de, .fr, .uk, .ru) still rely on traditional WHOIS — try the registry's own website.`,
      kind: "no-rdap",
    };
  }

  const url = `${server}/domain/${encodeURIComponent(norm.value)}`;
  const r = await fetchWithTimeout(url, {
    timeoutMs: 8000,
    cache: "no-store",
    headers: { Accept: "application/rdap+json" },
  });
  if (!r.ok) {
    if (r.kind === "timeout") {
      return { ok: false, error: `The RDAP server for .${tld} timed out.`, kind: "timeout" };
    }
    return {
      ok: false,
      error: `Couldn't reach the RDAP server for .${tld}. Some registry RDAP endpoints don't allow cross-origin browser requests (CORS) — try a different domain or look it up on the registry's website.`,
      kind: "blocked",
    };
  }
  if (r.response.status === 404) {
    return { ok: false, error: `${norm.value} appears to be unregistered — the RDAP server returned 404.`, kind: "not-found" };
  }
  if (!r.response.ok) {
    return { ok: false, error: `RDAP server returned status ${r.response.status}.`, kind: "network" };
  }
  try {
    const data = (await r.response.json()) as Record<string, unknown>;
    const events = (Array.isArray(data.events) ? data.events : []).map((e) => {
      const rec = e as { eventAction?: unknown; eventDate?: unknown; eventActor?: unknown };
      return {
        action: typeof rec.eventAction === "string" ? rec.eventAction : "",
        date: typeof rec.eventDate === "string" ? rec.eventDate : undefined,
        actor: typeof rec.eventActor === "string" ? rec.eventActor : undefined,
      };
    }).filter((e) => e.action);
    const secureRec = data.secureDNS as { delegationSigned?: unknown } | undefined;
    return {
      ok: true,
      result: {
        domain: norm.value,
        handle: typeof data.handle === "string" ? data.handle : undefined,
        status: Array.isArray(data.status) ? (data.status as unknown[]).map(String) : undefined,
        events,
        entities: parseEntities(data.entities),
        nameservers: parseNameservers(data.nameservers),
        secureDNS: secureRec ? { delegationSigned: !!secureRec.delegationSigned } : undefined,
        rdapServer: new URL(server).host,
        tld,
      },
    };
  } catch {
    return { ok: false, error: "Couldn't parse the RDAP response.", kind: "parse" };
  }
}

export function findEventDate(result: DomainResult, action: string): string | undefined {
  return result.events.find((e) => e.action.toLowerCase() === action.toLowerCase())?.date;
}

export function findEntity(result: DomainResult, role: string): RdapEntity | undefined {
  return result.entities.find((e) => e.roles.some((r) => r.toLowerCase() === role.toLowerCase()));
}

export function ageDays(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((t - Date.now()) / 86400000);
}

export function formatIsoDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

export const SAMPLE_DOMAINS = ["google.com", "wikipedia.org", "github.com", "cloudflare.com"];
