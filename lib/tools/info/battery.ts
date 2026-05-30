// Battery introspection for the Toollyz Battery Status Checker. Uses the
// browser's Battery Status API (navigator.getBattery), which Chromium-based
// browsers implement. Safari and Firefox no longer expose it — the tool
// handles that gracefully and shows a clear "not available" message.

export interface BatteryInfo {
  level: number; // 0-1
  charging: boolean;
  chargingTime: number; // seconds; Infinity when not charging or unknown
  dischargingTime: number; // seconds; Infinity when charging or unknown
}

export interface BatteryManagerLike {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

export function snapshot(b: BatteryManagerLike): BatteryInfo {
  return { level: b.level, charging: b.charging, chargingTime: b.chargingTime, dischargingTime: b.dischargingTime };
}

export async function getBattery(): Promise<BatteryManagerLike | null> {
  const n = navigator as unknown as { getBattery?: () => Promise<BatteryManagerLike> };
  if (!n.getBattery) return null;
  try { return await n.getBattery(); } catch { return null; }
}

export function isSupported(): boolean {
  return typeof navigator !== "undefined" && "getBattery" in navigator;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function levelTone(level: number, charging: boolean): "good" | "warn" | "low" | "charging" {
  if (charging) return "charging";
  if (level >= 0.5) return "good";
  if (level >= 0.2) return "warn";
  return "low";
}
