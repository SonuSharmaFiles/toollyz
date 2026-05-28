// Calendar math, holiday sets, themes, and export helpers (no external deps).

export type CalMode = "month" | "year";

export interface CalDay {
  date: Date;
  iso: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function isoKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildMonthGrid(
  year: number,
  month: number,
  startMonday: boolean,
): CalDay[][] {
  const today = new Date();
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0 Sun .. 6 Sat
  const offset = startMonday ? (startDow + 6) % 7 : startDow;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalDay[] = [];
  const makeDay = (d: Date, inMonth: boolean): CalDay => ({
    date: d,
    iso: isoKey(d),
    day: d.getDate(),
    inMonth,
    isToday: sameDay(d, today),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
  });

  for (let i = 0; i < offset; i++) {
    cells.push(makeDay(new Date(year, month, 1 - (offset - i)), false));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(makeDay(new Date(year, month, d), true));
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push(makeDay(next, false));
  }
  const weeks: CalDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ─── Holidays ───────────────────────────────────────────────────────────────

export type HolidayRegion = "none" | "international" | "us" | "uk" | "india";

export const HOLIDAY_REGIONS: { id: HolidayRegion; label: string }[] = [
  { id: "none", label: "No holidays" },
  { id: "international", label: "International" },
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "india", label: "India" },
];

interface FixedHoliday {
  month: number; // 0-indexed
  day: number;
  name: string;
}

const INTERNATIONAL: FixedHoliday[] = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 1, day: 14, name: "Valentine's Day" },
  { month: 2, day: 8, name: "International Women's Day" },
  { month: 3, day: 22, name: "Earth Day" },
  { month: 9, day: 31, name: "Halloween" },
  { month: 11, day: 25, name: "Christmas Day" },
  { month: 11, day: 31, name: "New Year's Eve" },
];

const US_FIXED: FixedHoliday[] = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 5, day: 19, name: "Juneteenth" },
  { month: 6, day: 4, name: "Independence Day" },
  { month: 10, day: 11, name: "Veterans Day" },
  { month: 11, day: 25, name: "Christmas Day" },
];

const UK_FIXED: FixedHoliday[] = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 11, day: 25, name: "Christmas Day" },
  { month: 11, day: 26, name: "Boxing Day" },
];

const INDIA_FIXED: FixedHoliday[] = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 0, day: 26, name: "Republic Day" },
  { month: 7, day: 15, name: "Independence Day" },
  { month: 9, day: 2, name: "Gandhi Jayanti" },
  { month: 11, day: 25, name: "Christmas Day" },
];

// nth weekday of a month (weekday 0=Sun..6=Sat, n=1..5)
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const firstDow = first.getDay();
  const offset = (weekday - firstDow + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const lastDow = last.getDay();
  const offset = (lastDow - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

export function holidaysForYear(
  region: HolidayRegion,
  year: number,
): Record<string, string> {
  const map: Record<string, string> = {};
  const add = (d: Date, name: string) => {
    map[isoKey(d)] = name;
  };
  const addFixed = (list: FixedHoliday[]) =>
    list.forEach((h) => add(new Date(year, h.month, h.day), h.name));

  if (region === "international") addFixed(INTERNATIONAL);
  if (region === "uk") addFixed(UK_FIXED);
  if (region === "india") addFixed(INDIA_FIXED);
  if (region === "us") {
    addFixed(US_FIXED);
    add(nthWeekday(year, 0, 1, 3), "Martin Luther King Jr. Day"); // 3rd Mon Jan
    add(nthWeekday(year, 1, 1, 3), "Presidents' Day"); // 3rd Mon Feb
    add(lastWeekday(year, 4, 1), "Memorial Day"); // last Mon May
    add(nthWeekday(year, 8, 1, 1), "Labor Day"); // 1st Mon Sep
    add(nthWeekday(year, 10, 4, 4), "Thanksgiving"); // 4th Thu Nov
  }
  return map;
}

// ─── Themes ─────────────────────────────────────────────────────────────────

export interface CalTheme {
  id: string;
  label: string;
  cardBg: string;
  headerBg: string;
  headerText: string;
  weekdayBg: string;
  weekdayText: string;
  dayBg: string;
  dayText: string;
  mutedText: string;
  todayBg: string;
  todayText: string;
  weekendBg: string;
  holidayText: string;
  border: string;
  radius: number;
}

export const THEMES: CalTheme[] = [
  {
    id: "minimal", label: "Minimal modern",
    cardBg: "#ffffff", headerBg: "#4f46e5", headerText: "#ffffff",
    weekdayBg: "#f1f5f9", weekdayText: "#475569", dayBg: "#ffffff", dayText: "#0f172a",
    mutedText: "#cbd5e1", todayBg: "#4f46e5", todayText: "#ffffff", weekendBg: "#f8fafc",
    holidayText: "#dc2626", border: "#e2e8f0", radius: 14,
  },
  {
    id: "corporate", label: "Corporate",
    cardBg: "#ffffff", headerBg: "#1e293b", headerText: "#ffffff",
    weekdayBg: "#f8fafc", weekdayText: "#334155", dayBg: "#ffffff", dayText: "#1e293b",
    mutedText: "#cbd5e1", todayBg: "#0ea5e9", todayText: "#ffffff", weekendBg: "#f1f5f9",
    holidayText: "#b91c1c", border: "#cbd5e1", radius: 8,
  },
  {
    id: "dark", label: "Dark mode",
    cardBg: "#0f172a", headerBg: "#6366f1", headerText: "#ffffff",
    weekdayBg: "#1e293b", weekdayText: "#94a3b8", dayBg: "#0f172a", dayText: "#e2e8f0",
    mutedText: "#475569", todayBg: "#6366f1", todayText: "#ffffff", weekendBg: "#172033",
    holidayText: "#f87171", border: "#1e293b", radius: 14,
  },
  {
    id: "pastel", label: "Pastel aesthetic",
    cardBg: "#fdf4ff", headerBg: "#c084fc", headerText: "#ffffff",
    weekdayBg: "#fae8ff", weekdayText: "#86198f", dayBg: "#ffffff", dayText: "#701a75",
    mutedText: "#e9d5ff", todayBg: "#ec4899", todayText: "#ffffff", weekendBg: "#fdf2f8",
    holidayText: "#db2777", border: "#f5d0fe", radius: 18,
  },
  {
    id: "classroom", label: "Classroom",
    cardBg: "#fffbeb", headerBg: "#0d9488", headerText: "#ffffff",
    weekdayBg: "#ccfbf1", weekdayText: "#115e59", dayBg: "#ffffff", dayText: "#134e4a",
    mutedText: "#cbd5e1", todayBg: "#f59e0b", todayText: "#ffffff", weekendBg: "#f0fdfa",
    holidayText: "#dc2626", border: "#99f6e4", radius: 14,
  },
  {
    id: "elegant", label: "Elegant serif",
    cardBg: "#fafaf9", headerBg: "#292524", headerText: "#fafaf9",
    weekdayBg: "#f5f5f4", weekdayText: "#57534e", dayBg: "#fafaf9", dayText: "#1c1917",
    mutedText: "#d6d3d1", todayBg: "#a16207", todayText: "#ffffff", weekendBg: "#f5f5f4",
    holidayText: "#b91c1c", border: "#e7e5e4", radius: 6,
  },
  {
    id: "printable", label: "Printable B&W",
    cardBg: "#ffffff", headerBg: "#ffffff", headerText: "#000000",
    weekdayBg: "#ffffff", weekdayText: "#000000", dayBg: "#ffffff", dayText: "#000000",
    mutedText: "#9ca3af", todayBg: "#000000", todayText: "#ffffff", weekendBg: "#f3f4f6",
    holidayText: "#000000", border: "#000000", radius: 0,
  },
];

export const THEME_BY_ID: Record<string, CalTheme> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
);

// ─── Events ─────────────────────────────────────────────────────────────────

export interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
  emoji?: string;
}

export const EVENT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#8b5cf6",
];

export const EVENT_EMOJIS = ["🎉", "🎂", "📌", "💼", "❤️", "✈️", "🏆", "📞", "💊", "🏋️"];

// ─── ICS export ─────────────────────────────────────────────────────────────

export function eventsToIcs(events: CalEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Toollyz//Calendar Generator//EN",
    "CALSCALE:GREGORIAN",
  ];
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z");
  for (const ev of events) {
    const d = ev.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@toollyz.com`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${d}`);
    lines.push(`SUMMARY:${(ev.emoji ? ev.emoji + " " : "") + ev.title.replace(/\n/g, " ")}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ─── PNG export (month canvas) ──────────────────────────────────────────────

export function monthToCanvas(
  year: number,
  month: number,
  startMonday: boolean,
  theme: CalTheme,
  holidays: Record<string, string>,
  events: Record<string, CalEvent[]>,
  highlightWeekends: boolean,
): HTMLCanvasElement {
  const weeks = buildMonthGrid(year, month, startMonday);
  const scale = 2;
  const cell = 120;
  const pad = 28;
  const headerH = 70;
  const weekdayH = 40;
  const cols = 7;
  const w = pad * 2 + cell * cols;
  const h = pad * 2 + headerH + weekdayH + weeks.length * cell;

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.fillStyle = theme.cardBg;
  ctx.fillRect(0, 0, w, h);

  // Header
  ctx.fillStyle = theme.headerBg;
  roundRect(ctx, pad, pad, w - pad * 2, headerH - 12, theme.radius);
  ctx.fill();
  if (theme.id === "printable") {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = theme.headerText;
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${MONTH_NAMES[month]} ${year}`, w / 2, pad + (headerH - 12) / 2);

  // Weekdays
  const labels = startMonday ? WEEKDAYS_MON : WEEKDAYS_SUN;
  const gridTop = pad + headerH;
  ctx.font = "600 16px system-ui, sans-serif";
  labels.forEach((label, i) => {
    const x = pad + i * cell;
    ctx.fillStyle = theme.weekdayBg;
    ctx.fillRect(x, gridTop, cell, weekdayH);
    ctx.fillStyle = theme.weekdayText;
    ctx.fillText(label, x + cell / 2, gridTop + weekdayH / 2);
  });

  // Days
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  weeks.forEach((week, r) => {
    week.forEach((dayCell, c) => {
      const x = pad + c * cell;
      const y = gridTop + weekdayH + r * cell;
      const weekend = highlightWeekends && dayCell.isWeekend;
      ctx.fillStyle = dayCell.isToday
        ? theme.todayBg
        : weekend
          ? theme.weekendBg
          : theme.dayBg;
      ctx.fillRect(x, y, cell, cell);
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cell, cell);

      const holiday = dayCell.inMonth ? holidays[dayCell.iso] : undefined;
      ctx.fillStyle = dayCell.isToday
        ? theme.todayText
        : !dayCell.inMonth
          ? theme.mutedText
          : holiday
            ? theme.holidayText
            : theme.dayText;
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.fillText(String(dayCell.day), x + 10, y + 8);

      if (holiday) {
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillStyle = theme.holidayText;
        wrapText(ctx, holiday, x + 10, y + 38, cell - 18, 13, 2);
      }
      const evs = dayCell.inMonth ? events[dayCell.iso] : undefined;
      if (evs && evs.length) {
        evs.slice(0, 2).forEach((ev, i) => {
          ctx.fillStyle = ev.color;
          ctx.beginPath();
          ctx.arc(x + 16 + i * 14, y + cell - 16, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
  });

  // Footer
  ctx.fillStyle = theme.mutedText;
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Generated with toollyz.com", w / 2, h - 16);

  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}
