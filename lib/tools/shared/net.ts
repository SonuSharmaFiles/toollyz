// Shared network primitive for the Toollyz network tools (speed test, ping,
// IP finder). Wraps fetch with an AbortController timeout and normalizes
// failures into a tagged result. Browser-only — these are the platform's only
// tools that make outbound requests.

export type NetErrorKind = "timeout" | "network";
export interface NetSuccess { ok: true; response: Response }
export interface NetFailure { ok: false; kind: NetErrorKind; error?: string }
export type NetResult = NetSuccess | NetFailure;

export interface FetchOptions extends Omit<RequestInit, "signal"> {
  timeoutMs?: number;
}

export async function fetchWithTimeout(url: string, opts: FetchOptions = {}): Promise<NetResult> {
  const { timeoutMs = 10000, ...init } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return { ok: true, response };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return { ok: false, kind: "timeout" };
    return { ok: false, kind: "network", error: e instanceof Error ? e.message : "Network error" };
  } finally {
    clearTimeout(timer);
  }
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
