// Website Uptime Monitor engine. Browser-side checker — uses fetch
// with `mode: no-cors` so we can probe arbitrary URLs without CORS
// rejecting us. A `no-cors` request returns an opaque response: we
// can detect network success / failure / timeout, but not the status
// code or body. That's enough for an up/down monitor.
//
// History is stored in localStorage as a ring buffer per URL — each
// entry is a check timestamp + outcome + latency.

import { fetchWithTimeout, now } from "@/lib/tools/shared/net";

export type CheckOutcome = "up" | "down" | "timeout" | "blocked";

export interface CheckResult {
  at: number;
  outcome: CheckOutcome;
  /** Round-trip in ms (omitted on timeout/blocked). */
  rttMs?: number;
}

export interface MonitorTarget {
  id: string;
  label: string;
  url: string;
  /** Polling interval in seconds. */
  intervalSec: number;
  /** Per-check timeout in ms. */
  timeoutMs: number;
  history: CheckResult[];
}

export const HISTORY_CAP = 240;

export async function probe(target: MonitorTarget): Promise<CheckResult> {
  const url = target.url;
  if (!/^https?:\/\//i.test(url)) {
    return { at: Date.now(), outcome: "blocked" };
  }
  const t0 = now();
  const res = await fetchWithTimeout(url, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    redirect: "follow",
    timeoutMs: target.timeoutMs,
  });
  const rttMs = Math.round(now() - t0);
  if (!res.ok) {
    if (res.kind === "timeout") return { at: Date.now(), outcome: "timeout" };
    return { at: Date.now(), outcome: "down" };
  }
  return { at: Date.now(), outcome: "up", rttMs };
}

export function uptimePct(history: CheckResult[]): number {
  if (history.length === 0) return 0;
  const up = history.filter((h) => h.outcome === "up").length;
  return Math.round((up / history.length) * 1000) / 10;
}

export function averageRtt(history: CheckResult[]): number | undefined {
  const ups = history.filter((h) => h.outcome === "up" && typeof h.rttMs === "number");
  if (ups.length === 0) return undefined;
  return Math.round(ups.reduce((s, h) => s + (h.rttMs ?? 0), 0) / ups.length);
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
