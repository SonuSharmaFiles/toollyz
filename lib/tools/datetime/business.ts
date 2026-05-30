// Business-days math for the Toollyz Business Days Calculator. Pure
// functions over the JS Date API.

export interface BusinessDayBreakdown {
  totalDays: number;
  businessDays: number;
  weekendDays: number;
  holidayCount: number;
  perWeekday: number[]; // Sun..Sat counts
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseHolidays(raw: string): { dates: Set<string>; invalid: string[] } {
  const dates = new Set<string>();
  const invalid: string[] = [];
  for (const line of raw.split(/\n/).map((l) => l.trim()).filter(Boolean)) {
    // Strip a trailing comment (everything after #) so users can label dates.
    const onlyDate = line.split("#")[0].trim();
    if (!onlyDate) continue;
    if (!ISO_DATE.test(onlyDate)) {
      invalid.push(line);
      continue;
    }
    // Validate it's a real date.
    const [y, m, d] = onlyDate.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) {
      invalid.push(line);
      continue;
    }
    dates.add(onlyDate);
  }
  return { dates, invalid };
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calculate the business days between `from` and `to` (inclusive of both
 * end dates), counting only weekdays Mon–Fri minus any provided holidays.
 * Weekend toggling lets you include them if needed.
 */
export function countBusinessDays(
  from: Date,
  to: Date,
  opts: { skipWeekends: boolean; holidays: Set<string>; weekendDays?: number[] } = {
    skipWeekends: true,
    holidays: new Set(),
  },
): BusinessDayBreakdown {
  const startTs = stripTime(from).getTime();
  const endTs = stripTime(to).getTime();
  const [start, end] = startTs <= endTs ? [stripTime(from), stripTime(to)] : [stripTime(to), stripTime(from)];
  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.round(totalMs / 86400000) + 1;
  const perWeekday = [0, 0, 0, 0, 0, 0, 0];
  let business = 0;
  let weekend = 0;
  let holiday = 0;
  const weekendSet = new Set(opts.weekendDays ?? [0, 6]);
  const cursor = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    const dow = cursor.getDay();
    perWeekday[dow] += 1;
    const isWeekend = weekendSet.has(dow);
    const key = dateKey(cursor);
    const isHoliday = opts.holidays.has(key);
    if (isWeekend) weekend += 1;
    if (isHoliday) holiday += 1;
    const shouldSkip = (opts.skipWeekends && isWeekend) || isHoliday;
    if (!shouldSkip) business += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return {
    totalDays,
    businessDays: business,
    weekendDays: weekend,
    holidayCount: holiday,
    perWeekday,
  };
}

/**
 * Add a count of business days to a start date, skipping weekends and an
 * optional holiday set. Returns the landing date.
 */
export function addBusinessDays(
  start: Date,
  count: number,
  opts: { skipWeekends: boolean; holidays: Set<string>; weekendDays?: number[] } = {
    skipWeekends: true,
    holidays: new Set(),
  },
): Date {
  const direction = count >= 0 ? 1 : -1;
  let remaining = Math.abs(count);
  const cursor = new Date(stripTime(start));
  const weekendSet = new Set(opts.weekendDays ?? [0, 6]);
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + direction);
    const dow = cursor.getDay();
    if (opts.skipWeekends && weekendSet.has(dow)) continue;
    if (opts.holidays.has(dateKey(cursor))) continue;
    remaining -= 1;
  }
  return cursor;
}

function stripTime(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** ISO yyyy-mm-dd for an `<input type="date">`. */
export function formatDateOnly(d: Date): string {
  return dateKey(d);
}
