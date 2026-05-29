// Internet speed measurement for the Toollyz Internet Speed Test, using
// Cloudflare's public, CORS-enabled speed endpoints (the same ones their own
// speed.cloudflare.com uses). Download is measured by streaming the response
// and timing a steady-state window (after discarding TCP slow-start); upload
// POSTs raw bytes (preflight-free); latency is the min RTT of tiny requests.
// Single-stream and browser-based, so it reads a little lower than native apps.
// Runs directly from the browser — there is no Toollyz server.

import { fetchWithTimeout, isOnline, now } from "@/lib/tools/shared/net";

const DOWN = "https://speed.cloudflare.com/__down";
const UP = "https://speed.cloudflare.com/__up";

export interface SpeedResult {
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
}
export type Phase = "idle" | "latency" | "download" | "upload" | "done" | "error";

export interface SpeedHandlers {
  onPhase?: (p: Phase) => void;
  onValue?: (metric: "ping" | "download" | "upload", value: number) => void;
}

function rand() { return Math.random().toString(36).slice(2); }

async function measureLatency(onValue?: (v: number) => void): Promise<{ ping: number; jitter: number; reachable: boolean }> {
  const rtts: number[] = [];
  for (let i = 0; i < 12; i++) {
    const start = now();
    const r = await fetchWithTimeout(`${DOWN}?bytes=0&cb=${rand()}`, { timeoutMs: 3000, cache: "no-store" });
    if (r.ok) {
      try { await r.response.arrayBuffer(); } catch { /* noop */ }
      const rtt = now() - start;
      rtts.push(rtt);
      onValue?.(rtt);
    }
    await new Promise((res) => setTimeout(res, 70));
  }
  if (!rtts.length) return { ping: 0, jitter: 0, reachable: false };
  const sorted = [...rtts].sort((a, b) => a - b);
  let j = 0;
  for (let i = 1; i < rtts.length; i++) j += Math.abs(rtts[i] - rtts[i - 1]);
  return { ping: sorted[0], jitter: rtts.length > 1 ? j / (rtts.length - 1) : 0, reachable: true };
}

async function measureDownload(onValue?: (mbps: number) => void): Promise<number> {
  const res = await fetch(`${DOWN}?bytes=100000000&cb=${rand()}`, { cache: "no-store" });
  if (!res.ok || !res.body) throw new Error("Download stream failed");
  const reader = res.body.getReader();
  const start = now();
  let received = 0;
  let measuring = false;
  let windowStart = 0;
  let lastSampleAt = 0;
  let windowBytes = 0;
  const samples: number[] = [];
  const hardStop = start + 9000;
  const WARMUP = 800;
  const WINDOW = 4000;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const t = now();
      received += value.length;
      if (!measuring && t - start >= WARMUP) { measuring = true; windowStart = t; lastSampleAt = t; windowBytes = 0; }
      if (measuring) {
        windowBytes += value.length;
        if (t - lastSampleAt >= 200) {
          const mbps = (windowBytes * 8) / ((t - lastSampleAt) / 1000) / 1e6;
          samples.push(mbps);
          onValue?.(mbps);
          windowBytes = 0;
          lastSampleAt = t;
        }
        if (t - windowStart >= WINDOW) break;
      }
      if (t >= hardStop) break;
    }
  } finally {
    try { await reader.cancel(); } catch { /* noop */ }
  }
  if (samples.length >= 3) {
    const sorted = [...samples].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)]; // median of steady-state samples
  }
  const dur = (now() - start) / 1000;
  return dur > 0 ? (received * 8) / dur / 1e6 : 0;
}

async function uploadOnce(size: number): Promise<number> {
  const payload = new Uint8Array(size); // no custom headers ⇒ preflight-free
  const start = now();
  const res = await fetch(UP, { method: "POST", body: payload, cache: "no-store" });
  try { await res.arrayBuffer(); } catch { /* noop */ }
  const dur = (now() - start) / 1000;
  return dur > 0 ? (size * 8) / dur / 1e6 : 0;
}

async function measureUpload(onValue?: (mbps: number) => void): Promise<number> {
  try { await uploadOnce(200_000); } catch { /* warm-up */ }
  const probe = await uploadOnce(700_000);
  onValue?.(probe);
  // size the main upload to take roughly 3 seconds, clamped
  let size = Math.round((probe * 1e6 * 3) / 8);
  size = Math.max(1_000_000, Math.min(size, 25_000_000));
  const main = await uploadOnce(size);
  onValue?.(main);
  return main;
}

export async function runSpeedTest(cb: SpeedHandlers = {}): Promise<{ ok: boolean; error?: string; result?: SpeedResult }> {
  if (!isOnline()) return { ok: false, error: "You appear to be offline." };
  cb.onPhase?.("latency");
  const lat = await measureLatency((v) => cb.onValue?.("ping", v));
  if (!lat.reachable) {
    cb.onPhase?.("error");
    return { ok: false, error: "Couldn't reach the speed-test server (speed.cloudflare.com). It may be blocked on your network or by an extension." };
  }
  let download = 0;
  let upload = 0;
  try {
    cb.onPhase?.("download");
    download = await measureDownload((v) => cb.onValue?.("download", v));
    cb.onPhase?.("upload");
    upload = await measureUpload((v) => cb.onValue?.("upload", v));
  } catch (e) {
    cb.onPhase?.("error");
    return { ok: false, error: e instanceof Error ? e.message : "The speed test failed partway through." };
  }
  cb.onPhase?.("done");
  return { ok: true, result: { download, upload, ping: lat.ping, jitter: lat.jitter } };
}
