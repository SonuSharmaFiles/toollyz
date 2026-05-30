// Unix-timestamp ↔ date conversion engine for the Toollyz Unix Timestamp
// Converter. Pure functions over the standard Date / Intl APIs — no library,
// no DOM. The component drives the live "now" clock; this engine is only
// concerned with conversions, parsing and formatting.

export type Unit = "seconds" | "milliseconds";

export interface ParseResult {
  ok: boolean;
  date?: Date;
  detectedUnit?: Unit;
  error?: string;
}

/**
 * Detect whether an integer is seconds or milliseconds. Cutoff: 13-digit
 * positive integers are treated as milliseconds (year ~2286 in seconds, but
 * still in this century in ms), 10-digit and shorter as seconds.
 */
export function detectUnit(n: number): Unit {
  return Math.abs(n) >= 1e12 ? "milliseconds" : "seconds";
}

/**
 * Parse a number string as a unix timestamp, an ISO 8601 date or a relaxed
 * date string. Returns the resulting Date and a tag indicating which unit
 * was detected (if numeric input).
 */
export function parseTimestamp(raw: string, unitHint: Unit | "auto" = "auto"): ParseResult {
  const s = raw.trim();
  if (!s) return { ok: false, error: "Enter a number, date or ISO timestamp." };
  // Numeric → unix epoch
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return { ok: false, error: "Couldn't parse the number." };
    const unit: Unit = unitHint === "auto" ? detectUnit(n) : unitHint;
    const ms = unit === "seconds" ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "That timestamp is outside the supported range." };
    return { ok: true, date: d, detectedUnit: unit };
  }
  // Try Date.parse — handles ISO 8601 and many RFC 2822 variants.
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return { ok: true, date: new Date(t) };
  return { ok: false, error: "Couldn't parse that as a number or date." };
}

export interface Formats {
  epochSec: number;
  epochMs: number;
  iso: string;
  utc: string; // RFC 1123 / "GMT" string
  utcReadable: string; // "Sun, 30 May 2026 14:23:45 UTC"
  localReadable: string;
  localShort: string;
  rfc2822: string;
  dateOnly: string;
  timeOnly: string;
  yearDay: number;
  weekNumber: number;
  weekday: string;
  monthName: string;
  relative: string;
  timezone: string;
}

const RTF = typeof Intl !== "undefined" && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }) : null;

function relative(from: Date, now: Date): string {
  const diffSec = Math.round((from.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (!RTF) return diffSec >= 0 ? `in ${abs}s` : `${abs}s ago`;
  const divs: { unit: Intl.RelativeTimeFormatUnit; sec: number }[] = [
    { unit: "year", sec: 60 * 60 * 24 * 365 },
    { unit: "month", sec: 60 * 60 * 24 * 30 },
    { unit: "week", sec: 60 * 60 * 24 * 7 },
    { unit: "day", sec: 60 * 60 * 24 },
    { unit: "hour", sec: 60 * 60 },
    { unit: "minute", sec: 60 },
    { unit: "second", sec: 1 },
  ];
  for (const { unit, sec } of divs) {
    if (abs >= sec || unit === "second") {
      const v = Math.round(diffSec / sec);
      return RTF.format(v, unit);
    }
  }
  return RTF.format(diffSec, "second");
}

function weekday(d: Date, tz: "utc" | "local"): string {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: tz === "utc" ? "UTC" : undefined });
  return formatter.format(d);
}
function monthName(d: Date, tz: "utc" | "local"): string {
  const formatter = new Intl.DateTimeFormat(undefined, { month: "long", timeZone: tz === "utc" ? "UTC" : undefined });
  return formatter.format(d);
}
function isoWeek(d: Date): number {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = target.getTime();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  return 1 + Math.ceil((firstThursday - target.getTime()) / (7 * 86400000));
}
function dayOfYearUtc(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000);
}

const RFC2822 = (d: Date) =>
  d.toUTCString().replace("GMT", "+0000");

export function formatAll(date: Date, now: Date = new Date()): Formats {
  const ms = date.getTime();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    epochSec: Math.floor(ms / 1000),
    epochMs: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    utcReadable: new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(date),
    localReadable: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date),
    localShort: new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date),
    rfc2822: RFC2822(date),
    dateOnly: new Intl.DateTimeFormat(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).format(date),
    timeOnly: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date),
    yearDay: dayOfYearUtc(date),
    weekNumber: isoWeek(date),
    weekday: weekday(date, "local"),
    monthName: monthName(date, "local"),
    relative: relative(date, now),
    timezone: tz,
  };
}

export const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export function formatInTimezone(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: tz,
    }).format(date);
  }
}
