// Discord Timestamp Generator engine. Discord renders messages containing
// the literal `<t:UNIX_SECONDS:FORMAT>` syntax as a localised, viewer-relative
// timestamp. This module emits all seven supported format codes and a
// preview string that matches the Discord client's wording.
//
// See https://discord.com/developers/docs/reference#message-formatting

export type DiscordFormat = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export interface DiscordFormatMeta {
  /** Single-letter format code that Discord recognises. */
  code: DiscordFormat;
  /** Human label shown in the UI. */
  label: string;
  /** Short example of the rendered output, e.g. "16:20". */
  example: string;
  /** When true, this is the "default" format Discord falls back to. */
  isDefault?: boolean;
}

export const DISCORD_FORMATS: DiscordFormatMeta[] = [
  { code: "t", label: "Short time", example: "16:20" },
  { code: "T", label: "Long time", example: "16:20:30" },
  { code: "d", label: "Short date", example: "20/04/2021" },
  { code: "D", label: "Long date", example: "20 April 2021" },
  { code: "f", label: "Short date / time", example: "20 April 2021 16:20", isDefault: true },
  { code: "F", label: "Long date / time", example: "Tuesday, 20 April 2021 16:20" },
  { code: "R", label: "Relative", example: "in 2 hours" },
];

export function unixSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

export function syntaxFor(seconds: number, code: DiscordFormat | ""): string {
  if (!Number.isFinite(seconds)) return "";
  if (code === "") return `<t:${seconds}>`;
  return `<t:${seconds}:${code}>`;
}

/** Locale-aware preview that mimics how the Discord client would render the
 * timestamp. Falls back gracefully if the user's locale lacks a formatter. */
export function previewFor(seconds: number, code: DiscordFormat, now: number = Date.now()): string {
  if (!Number.isFinite(seconds)) return "—";
  const date = new Date(seconds * 1000);
  switch (code) {
    case "t":
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
    case "T":
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
    case "d":
      return new Intl.DateTimeFormat(undefined, { dateStyle: "short" }).format(date);
    case "D":
      return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
    case "f":
      return new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(date);
    case "F":
      return new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date);
    case "R":
      return relativeTime(date.getTime(), now);
  }
}

const RTF = typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl
  ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  : null;

function relativeTime(then: number, now: number): string {
  const diffMs = then - now;
  const sec = Math.round(diffMs / 1000);
  const abs = Math.abs(sec);
  if (!RTF) return `${abs} seconds`;
  if (abs < 60) return RTF.format(sec, "second");
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return RTF.format(min, "minute");
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return RTF.format(hr, "hour");
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 30) return RTF.format(day, "day");
  const month = Math.round(day / 30);
  if (Math.abs(month) < 12) return RTF.format(month, "month");
  const year = Math.round(month / 12);
  return RTF.format(year, "year");
}

export interface DiscordPreset {
  id: string;
  label: string;
  /** Returns the target date for the preset given "now". */
  resolve: (now: number) => Date;
}

export const PRESETS: DiscordPreset[] = [
  { id: "now", label: "Right now", resolve: (now) => new Date(now) },
  {
    id: "in-1h",
    label: "In 1 hour",
    resolve: (now) => new Date(now + 60 * 60 * 1000),
  },
  {
    id: "in-24h",
    label: "Tomorrow this time",
    resolve: (now) => new Date(now + 24 * 60 * 60 * 1000),
  },
  {
    id: "in-7d",
    label: "Next week",
    resolve: (now) => new Date(now + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "in-30d",
    label: "30 days from now",
    resolve: (now) => new Date(now + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "midnight",
    label: "Tonight at midnight",
    resolve: (now) => {
      const d = new Date(now);
      d.setHours(24, 0, 0, 0);
      return d;
    },
  },
];

/** ISO local "YYYY-MM-DDTHH:MM" for <input type="datetime-local"> — Date.toISOString
 * returns UTC and clips seconds; this helper returns the LOCAL representation. */
export function toLocalInputValue(d: Date): string {
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}
