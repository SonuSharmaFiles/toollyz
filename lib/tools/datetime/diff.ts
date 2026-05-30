// Date-difference engine for the Toollyz Age Difference Calculator and the
// Business Days Calculator. Pure functions over the JS Date API.

export interface YmdHms {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TotalsInUnits {
  totalMilliseconds: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalYears: number;
}

/**
 * Compute the calendar-correct difference between two dates as
 * years/months/days/hours/minutes/seconds (with "from" assumed to be the
 * earlier of the two; we swap internally when reversed).
 *
 * Uses month-by-month subtraction so 30-Jan + 1 month = 28-Feb (or 29 in a
 * leap year) — the same convention `dayjs.diff` uses.
 */
export function diff(from: Date, to: Date): { breakdown: YmdHms; totals: TotalsInUnits; reversed: boolean } {
  let reversed = false;
  let a = from;
  let b = to;
  if (a.getTime() > b.getTime()) {
    [a, b] = [b, a];
    reversed = true;
  }

  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  let hours = b.getHours() - a.getHours();
  let minutes = b.getMinutes() - a.getMinutes();
  let seconds = b.getSeconds() - a.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    // Borrow days from the prior month of `b`.
    const prior = new Date(b.getFullYear(), b.getMonth(), 0);
    days += prior.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalMilliseconds = b.getTime() - a.getTime();
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalYears = years + months / 12 + days / 365.2425;

  return {
    reversed,
    breakdown: { years, months, days, hours, minutes, seconds },
    totals: {
      totalMilliseconds,
      totalSeconds,
      totalMinutes,
      totalHours,
      totalDays,
      totalWeeks,
      totalMonths,
      totalYears: Math.round(totalYears * 1000) / 1000,
    },
  };
}

/** Add months while clamping to the last valid day of the month. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

/**
 * Next anniversary of `birthday` on or after `from`. Handles Feb-29
 * birthdays by promoting to Feb-28 in non-leap years.
 */
export function nextAnniversary(birthday: Date, from: Date = new Date()): Date {
  const candidate = new Date(from.getFullYear(), birthday.getMonth(), birthday.getDate());
  // Feb-29 → adjust if landing year isn't leap.
  if (birthday.getMonth() === 1 && birthday.getDate() === 29 && candidate.getDate() !== 29) {
    candidate.setMonth(1);
    candidate.setDate(28);
  }
  if (candidate.getTime() < from.getTime()) {
    candidate.setFullYear(candidate.getFullYear() + 1);
    if (birthday.getMonth() === 1 && birthday.getDate() === 29) {
      const day29 = new Date(candidate.getFullYear(), 1, 29);
      if (day29.getMonth() === 1) candidate.setDate(29);
    }
  }
  return candidate;
}

export function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

/** ISO week number (1–53). */
export function isoWeek(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = target.getTime();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.getTime()) / (7 * 86400000));
}

/** Whether a year is a leap year per the Gregorian rule. */
export function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
