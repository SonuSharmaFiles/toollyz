// IP lookup for the Toollyz IP Address Finder. Uses a sequential provider
// chain of reputable, CORS-enabled public APIs (so the user's IP is revealed to
// at most one provider), with a normalizer to a common shape. Public IP + geo
// from ipwho.is → ipapi.co → ipify (IP-only). IPv6 via ipify's api64. Local
// IPs via WebRTC (best-effort; modern browsers obscure these with mDNS).
// There is no Toollyz server — these calls go directly from your browser.

import { fetchWithTimeout } from "@/lib/tools/shared/net";

export interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  org?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
  provider: string;
}

export interface LookupResult { ok: boolean; info?: IpInfo; error?: string }

async function fromIpwhois(): Promise<IpInfo | null> {
  const r = await fetchWithTimeout("https://ipwho.is/", { timeoutMs: 6000, cache: "no-store" });
  if (!r.ok) return null;
  try {
    const d = await r.response.json();
    if (!d || d.success === false || !d.ip) return null;
    return {
      ip: d.ip, city: d.city, region: d.region, country: d.country, countryCode: d.country_code,
      isp: d.connection?.isp, org: d.connection?.org, timezone: d.timezone?.id,
      lat: typeof d.latitude === "number" ? d.latitude : undefined,
      lng: typeof d.longitude === "number" ? d.longitude : undefined,
      provider: "ipwho.is",
    };
  } catch { return null; }
}

async function fromIpapi(): Promise<IpInfo | null> {
  const r = await fetchWithTimeout("https://ipapi.co/json/", { timeoutMs: 6000, cache: "no-store" });
  if (!r.ok) return null;
  try {
    const d = await r.response.json();
    if (!d || d.error || !d.ip) return null;
    return {
      ip: d.ip, city: d.city, region: d.region, country: d.country_name, countryCode: d.country_code,
      isp: d.org, org: d.org, timezone: d.timezone,
      lat: typeof d.latitude === "number" ? d.latitude : undefined,
      lng: typeof d.longitude === "number" ? d.longitude : undefined,
      provider: "ipapi.co",
    };
  } catch { return null; }
}

async function fromIpify(): Promise<IpInfo | null> {
  const r = await fetchWithTimeout("https://api.ipify.org?format=json", { timeoutMs: 6000, cache: "no-store" });
  if (!r.ok) return null;
  try { const d = await r.response.json(); return d?.ip ? { ip: d.ip, provider: "ipify.org" } : null; } catch { return null; }
}

export async function lookupIp(): Promise<LookupResult> {
  for (const fn of [fromIpwhois, fromIpapi, fromIpify]) {
    const info = await fn();
    if (info) return { ok: true, info };
  }
  return { ok: false, error: "Couldn't reach any IP lookup service. Check your connection or disable any ad/privacy blocker that may be blocking the request." };
}

export async function getIpv6(): Promise<string | null> {
  const r = await fetchWithTimeout("https://api64.ipify.org?format=json", { timeoutMs: 6000, cache: "no-store" });
  if (!r.ok) return null;
  try { const d = await r.response.json(); return d?.ip ?? null; } catch { return null; }
}

export interface LocalIps { addresses: string[]; obscured: boolean }

/** Best-effort local/private IP discovery via WebRTC ICE candidates. */
export async function getLocalIps(timeoutMs = 2500): Promise<LocalIps> {
  if (typeof RTCPeerConnection === "undefined") return { addresses: [], obscured: false };
  return new Promise((resolve) => {
    const found = new Set<string>();
    let obscured = false;
    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    } catch { resolve({ addresses: [], obscured: false }); return; }
    const finish = () => { try { pc.close(); } catch { /* noop */ } resolve({ addresses: [...found], obscured }); };
    const timer = setTimeout(finish, timeoutMs);
    pc.onicecandidate = (e) => {
      if (!e.candidate) { clearTimeout(timer); finish(); return; }
      const addr = e.candidate.candidate.split(" ")[4] ?? "";
      if (addr.endsWith(".local")) obscured = true;
      else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(addr) || (addr.includes(":") && addr.length > 6)) found.add(addr);
    };
    try {
      pc.createDataChannel("toollyz");
      pc.createOffer().then((o) => pc.setLocalDescription(o)).catch(() => finish());
    } catch { finish(); }
  });
}

export function flagEmoji(cc?: string): string {
  if (!cc || cc.length !== 2) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => base + c.charCodeAt(0) - 65));
}
