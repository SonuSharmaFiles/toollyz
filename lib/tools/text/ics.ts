// Minimal iCalendar (.ics) generator. Just enough RFC 5545 to produce
// valid all-day reminder events that Outlook, Google Calendar, Apple
// Calendar, and Fastmail all parse. No timezone support — we always
// emit UTC `YYYYMMDDTHHMMSSZ` form for DTSTAMP/CREATED, and
// `;VALUE=DATE:YYYYMMDD` for all-day DTSTART/DTEND.

export interface IcsEvent {
  uid: string;
  summary: string;
  description?: string;
  /** Date object — we render to YYYYMMDD. */
  dateStart: Date;
  /** Optional reminder before-event offset in minutes (a VALARM trigger). */
  alarmMinutesBefore?: number;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function fmtDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function fmtDateTime(d: Date): string {
  return `${fmtDate(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets per RFC 5545. */
function foldLine(line: string): string {
  const max = 73;
  if (line.length <= max) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    parts.push(line.slice(i, i + max));
    i += max;
  }
  return parts.join("\r\n ");
}

export function buildIcs(events: IcsEvent[], productId = "Toollyz"): string {
  const now = new Date();
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:-//${productId}//EN`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${fmtDateTime(now)}`);
    lines.push(`SUMMARY:${escape(ev.summary)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escape(ev.description)}`);
    lines.push(`DTSTART;VALUE=DATE:${fmtDate(ev.dateStart)}`);
    const dayAfter = new Date(ev.dateStart);
    dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);
    lines.push(`DTEND;VALUE=DATE:${fmtDate(dayAfter)}`);
    lines.push("TRANSP:TRANSPARENT");
    if (typeof ev.alarmMinutesBefore === "number" && ev.alarmMinutesBefore >= 0) {
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${escape(ev.summary)}`);
      lines.push(`TRIGGER:-PT${ev.alarmMinutesBefore}M`);
      lines.push("END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
