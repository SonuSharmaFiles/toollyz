// Alarm-clock domain model for the Toollyz Alarm Clock. Pure data — the
// component handles the WebAudio playback and Notification API. Repeat
// schedules cover one-off alarms, daily recurrences, weekdays, weekends
// and explicit per-day bitmasks.

export type Tone = "bell" | "chime" | "beep" | "buzz";

export type Repeat = "once" | "daily" | "weekdays" | "weekends" | "custom";

/** Bit 0 = Sunday … bit 6 = Saturday. */
export type DaysBitmask = number;

export interface Alarm {
  id: string;
  label: string;
  /** HH:MM 24-hour. */
  time: string;
  enabled: boolean;
  repeat: Repeat;
  /** Used when `repeat === "custom"`. */
  days: DaysBitmask;
  tone: Tone;
}

export const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const TONES: { id: Tone; label: string; description: string }[] = [
  { id: "bell", label: "Bell", description: "Single warm bell stroke that decays gently." },
  { id: "chime", label: "Chime", description: "Three-note ascending chime, easy on the ear." },
  { id: "beep", label: "Beep", description: "Two-tone alarm beep, hard to sleep through." },
  { id: "buzz", label: "Buzz", description: "Low buzzer pulse — tactile and assertive." },
];

export function newAlarm(): Alarm {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return {
    id: Math.random().toString(36).slice(2, 9),
    label: "Wake up",
    time: `${hh}:${mm}`,
    enabled: true,
    repeat: "once",
    days: 0,
    tone: "bell",
  };
}

export function bitmaskForRepeat(r: Repeat, days: DaysBitmask): DaysBitmask {
  switch (r) {
    case "daily":
      return 0b1111111;
    case "weekdays":
      return 0b0111110; // Mon..Fri
    case "weekends":
      return 0b1000001; // Sun + Sat
    case "custom":
      return days;
    case "once":
    default:
      return 0;
  }
}

export function isDayActive(mask: DaysBitmask, day: number): boolean {
  return ((mask >> day) & 1) === 1;
}

export function toggleDay(mask: DaysBitmask, day: number): DaysBitmask {
  return (mask ^ (1 << day)) & 0b1111111;
}

export function describeRepeat(a: Alarm): string {
  if (a.repeat === "once") return "Once";
  if (a.repeat === "daily") return "Every day";
  if (a.repeat === "weekdays") return "Weekdays";
  if (a.repeat === "weekends") return "Weekends";
  // custom
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    if (isDayActive(a.days, i)) labels.push(WEEK_LABELS[i]);
  }
  return labels.length === 0 ? "Disabled" : labels.join(", ");
}

/**
 * Return the next absolute time (Date) the alarm should fire from `from`.
 * Returns null if a once-off alarm is in the past.
 */
export function nextFiringTime(a: Alarm, from: Date = new Date()): Date | null {
  if (!a.enabled) return null;
  const [hh, mm] = a.time.split(":").map((x) => Number(x));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const candidate = new Date(from);
  candidate.setSeconds(0, 0);
  candidate.setHours(hh, mm, 0, 0);
  if (a.repeat === "once") {
    if (candidate.getTime() <= from.getTime()) {
      // "Today" already passed — schedule for tomorrow as a generous interpretation.
      candidate.setDate(candidate.getDate() + 1);
    }
    return candidate;
  }
  const mask = bitmaskForRepeat(a.repeat, a.days);
  if (mask === 0) return null;
  for (let i = 0; i < 8; i++) {
    const day = (candidate.getDay()) % 7;
    if (isDayActive(mask, day) && candidate.getTime() > from.getTime()) {
      return candidate;
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return null;
}

/** Pretty "in 2h 4m" until the next fire. */
export function untilString(target: Date | null, now: Date): string {
  if (!target) return "";
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "now";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `in ${hours}h ${m}m`;
  }
  if (minutes > 0) return `in ${minutes}m ${seconds}s`;
  return `in ${seconds}s`;
}

export const STORAGE_KEY = "toollyz:alarms";
