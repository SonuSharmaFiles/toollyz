// Shared "burst test" engine for the Toollyz CPS / Drag Click / Spacebar
// tools. They share a duration selector, a rAF-based countdown, a count of
// captured events and a localStorage history per duration.

export type Duration = 1 | 5 | 10 | 30 | 60;
export const DURATIONS: Duration[] = [1, 5, 10, 30, 60];

export type Phase = "idle" | "running" | "done";

export interface RunRecord {
  ts: number;
  duration: Duration;
  count: number;
  cps: number; // events / duration in seconds
}

export function rate(count: number, durationSec: number): number {
  if (durationSec <= 0) return 0;
  return Math.round((count / durationSec) * 100) / 100;
}

export function bestFor(history: RunRecord[], duration: Duration): RunRecord | null {
  const ofDuration = history.filter((h) => h.duration === duration);
  if (ofDuration.length === 0) return null;
  return ofDuration.reduce((best, cur) => (cur.cps > best.cps ? cur : best), ofDuration[0]);
}

export interface Storage {
  key: string;
}

export function loadHistory(storage: Storage): RunRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storage.key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RunRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(storage: Storage, history: RunRecord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storage.key, JSON.stringify(history.slice(0, 30)));
  } catch {
    /* noop */
  }
}
