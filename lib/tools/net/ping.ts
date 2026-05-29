// Browser "ping" for the Toollyz Ping Test. True ICMP isn't possible in a
// browser, so this measures HTTP(S) round-trip time: it times a no-cors fetch
// (which resolves on any status = a completed round trip), falling back to an
// Image() load. A DNS/TLS warm-up sample is discarded; timeouts count as packet
// loss and are excluded from the RTT stats. HTTPS is enforced (mixed content).

import { now } from "@/lib/tools/shared/net";

export interface PingResult {
  min: number;
  avg: number;
  median: number;
  max: number;
  jitter: number;
  lossPct: number;
  sent: number;
  received: number;
  samples: (number | null)[]; // null = lost
}

export function normalizeHost(input: string): string {
  let s = input.trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return s.replace(/^http:\/\//i, "https://"); // upgrade to HTTPS to avoid mixed content
}

function bust(url: string, tag: string): string {
  return url + (url.includes("?") ? "&" : "?") + "_cb=" + tag;
}

function pingImage(url: string, timeoutMs: number): Promise<number | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const start = now();
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(ok ? now() - start : null);
    };
    const timer = setTimeout(() => { img.src = "about:blank"; done(false); }, timeoutMs);
    img.onload = () => done(true);
    img.onerror = () => done(true); // an error still means bytes round-tripped
    img.src = bust(url, `${Date.now()}_${Math.random()}`);
  });
}

async function pingOnce(url: string, timeoutMs: number): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = now();
  try {
    await fetch(bust(url, `${Date.now()}`), { mode: "no-cors", cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    return now() - start;
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof DOMException && e.name === "AbortError") return null; // timed out = packet loss
    return pingImage(url, timeoutMs); // network reject → try image (host may serve images but block fetch)
  }
}

export interface PingProgress { index: number; total: number; rtt: number | null }

export async function pingHost(
  rawUrl: string,
  opts: { samples?: number; timeoutMs?: number } = {},
  onProgress?: (p: PingProgress) => void,
): Promise<{ ok: boolean; error?: string; result?: PingResult }> {
  const url = normalizeHost(rawUrl);
  if (!url) return { ok: false, error: "Enter a host or URL." };
  const total = Math.max(1, Math.min(opts.samples ?? 14, 30));
  const timeoutMs = opts.timeoutMs ?? 3000;

  // warm-up (untimed): pays DNS resolution + TLS handshake + connection setup
  await pingOnce(url, Math.max(timeoutMs, 4000));

  const samples: (number | null)[] = [];
  for (let i = 0; i < total; i++) {
    const rtt = await pingOnce(url, timeoutMs);
    samples.push(rtt);
    onProgress?.({ index: i, total, rtt });
    await new Promise((r) => setTimeout(r, 120));
  }

  const rtts = samples.filter((r): r is number => r !== null);
  const sent = samples.length;
  const received = rtts.length;
  if (received === 0) {
    return { ok: false, error: "No response — the host may be down, blocking requests, or unreachable over HTTPS." };
  }
  const sorted = [...rtts].sort((a, b) => a - b);
  const avg = rtts.reduce((s, r) => s + r, 0) / received;
  let jitterSum = 0;
  for (let i = 1; i < rtts.length; i++) jitterSum += Math.abs(rtts[i] - rtts[i - 1]);
  const jitter = rtts.length > 1 ? jitterSum / (rtts.length - 1) : 0;

  return {
    ok: true,
    result: {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      avg,
      jitter,
      lossPct: ((sent - received) / sent) * 100,
      sent,
      received,
      samples,
    },
  };
}

export interface Preset { label: string; url: string }
export const PRESETS: Preset[] = [
  { label: "Cloudflare (1.1.1.1)", url: "https://1.1.1.1" },
  { label: "Google DNS", url: "https://dns.google" },
  { label: "Google", url: "https://www.google.com" },
  { label: "GitHub", url: "https://github.com" },
  { label: "Cloudflare", url: "https://cloudflare.com" },
];

export const SAMPLE_HOST = "https://1.1.1.1";
