// DNS resolution for the Toollyz DNS Lookup Tool. A browser can't query the
// system resolver, so this uses DNS-over-HTTPS (DoH) — specifically
// Cloudflare's public CORS-enabled JSON API. Each record type is fetched in
// parallel and normalized into a common shape. There is no Toollyz server;
// the request goes directly from your browser to 1.1.1.1.

import { fetchWithTimeout } from "@/lib/tools/shared/net";

export type RecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA" | "CAA";

export const ALL_TYPES: RecordType[] = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "CAA"];
export const DEFAULT_TYPES: RecordType[] = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"];

const TYPE_CODES: Record<RecordType, number> = { A: 1, AAAA: 28, CNAME: 5, MX: 15, TXT: 16, NS: 2, SOA: 6, CAA: 257 };

export const TYPE_DESCRIPTIONS: Record<RecordType, string> = {
  A: "IPv4 address",
  AAAA: "IPv6 address",
  CNAME: "Alias to another hostname",
  MX: "Mail servers (with priority)",
  TXT: "Free-form text — used for SPF, DKIM, verification",
  NS: "Authoritative name servers",
  SOA: "Start of Authority — zone metadata",
  CAA: "Which CAs can issue certificates",
};

export interface DnsRecord { type: RecordType; name: string; data: string; ttl: number }
export interface DnsTypeResult { type: RecordType; ok: boolean; records: DnsRecord[]; error?: string; nxdomain?: boolean }
export interface DnsResult { domain: string; results: DnsTypeResult[]; provider: string }

const DOMAIN_RE = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;

export function normalizeDomain(input: string): { ok: boolean; value: string; error?: string } {
  let s = input.trim().toLowerCase();
  if (!s) return { ok: false, value: "", error: "Enter a domain." };
  s = s.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  s = s.replace(/\.$/, "");
  if (!DOMAIN_RE.test(s)) return { ok: false, value: s, error: "That doesn't look like a valid domain." };
  return { ok: true, value: s };
}

function cleanData(type: RecordType, data: string): string {
  if (type === "TXT") return data.replace(/^"|"$/g, "").replace(/" "/g, "");
  if (type === "CNAME" || type === "NS") return data.replace(/\.$/, "");
  return data;
}

async function queryOne(domain: string, type: RecordType): Promise<DnsTypeResult> {
  const code = TYPE_CODES[type];
  const r = await fetchWithTimeout(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, {
    timeoutMs: 6000,
    cache: "no-store",
    headers: { Accept: "application/dns-json" },
  });
  if (!r.ok) return { type, ok: false, records: [], error: r.kind === "timeout" ? "Timed out" : "Network error" };
  try {
    const data = await r.response.json();
    if (data.Status === 3) return { type, ok: true, records: [], nxdomain: true };
    if (data.Status !== 0) return { type, ok: false, records: [], error: `DNS status ${data.Status}` };
    const answers: { name: string; type: number; data: string; TTL: number }[] = data.Answer ?? [];
    const records: DnsRecord[] = answers
      .filter((a) => a.type === code)
      .map((a) => ({ type, name: a.name.replace(/\.$/, ""), data: cleanData(type, a.data), ttl: a.TTL }));
    return { type, ok: true, records };
  } catch {
    return { type, ok: false, records: [], error: "Couldn't parse the DoH response." };
  }
}

export async function lookupDns(rawDomain: string, types: RecordType[]): Promise<{ ok: boolean; error?: string; result?: DnsResult }> {
  const norm = normalizeDomain(rawDomain);
  if (!norm.ok) return { ok: false, error: norm.error };
  const results = await Promise.all(types.map((t) => queryOne(norm.value, t)));
  return { ok: true, result: { domain: norm.value, results, provider: "cloudflare-dns.com" } };
}

export function formatTtl(seconds: number): string {
  if (seconds >= 86400) return `${Math.round(seconds / 86400)}d`;
  if (seconds >= 3600) return `${Math.round(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.round(seconds / 60)}m`;
  return `${seconds}s`;
}

export const SAMPLE_DOMAIN = "toollyz.com";
