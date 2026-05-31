// Cron Time Translator engine. Parses 5-field (POSIX) and 6-field (with
// seconds) cron expressions, builds a natural-English description, and
// computes the next N firing times. Pure functions — no scheduler bus,
// no setInterval — so the same input always returns the same output for a
// given "now".

export type FieldKind = "minute" | "hour" | "day-of-month" | "month" | "day-of-week" | "second";

export interface FieldDef {
  kind: FieldKind;
  min: number;
  max: number;
  /** Pretty names for fields that accept names (months, days). */
  names?: string[];
}

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DOW_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const FIELD_DEFS_5: FieldDef[] = [
  { kind: "minute", min: 0, max: 59 },
  { kind: "hour", min: 0, max: 23 },
  { kind: "day-of-month", min: 1, max: 31 },
  { kind: "month", min: 1, max: 12, names: MONTH_NAMES },
  { kind: "day-of-week", min: 0, max: 6, names: DOW_NAMES },
];

export const FIELD_DEFS_6: FieldDef[] = [
  { kind: "second", min: 0, max: 59 },
  ...FIELD_DEFS_5,
];

export interface ParsedField {
  kind: FieldKind;
  /** Resolved set of valid integer values for the field. */
  values: number[];
  /** Did the user pass "*" (every value)? */
  isStar: boolean;
  /** Raw text from the input. */
  raw: string;
}

export interface ParseResult {
  ok: boolean;
  fields: ParsedField[];
  fieldDefs: FieldDef[];
  /** Human-readable error if ok === false. */
  error?: string;
  /** Which field index failed when ok === false. */
  errorField?: number;
  /** Original raw expression. */
  raw: string;
}

function parseValue(raw: string, def: FieldDef): number | null {
  const v = raw.toLowerCase().trim();
  const idx = def.names?.indexOf(v) ?? -1;
  if (idx >= 0) return idx + (def.kind === "month" ? 1 : 0);
  if (/^\d+$/.test(v)) {
    const n = parseInt(v, 10);
    if (n >= def.min && n <= def.max) return n;
  }
  return null;
}

function expandField(text: string, def: FieldDef): { values: number[]; isStar: boolean } | string {
  const raw = text.trim();
  if (raw === "") return `Field is empty.`;
  if (raw === "*") return { values: rangeArr(def.min, def.max), isStar: true };

  const out = new Set<number>();
  for (const part of raw.split(",")) {
    const stepMatch = /^(.*?)(?:\/(\d+))?$/.exec(part);
    if (!stepMatch) return `Could not parse "${part}".`;
    const head = stepMatch[1];
    const step = stepMatch[2] ? parseInt(stepMatch[2], 10) : 1;
    if (step <= 0) return `Step value must be positive: "${part}".`;

    let lo: number;
    let hi: number;
    if (head === "*" || head === "") {
      lo = def.min;
      hi = def.max;
    } else if (head.includes("-")) {
      const [a, b] = head.split("-");
      const an = parseValue(a, def);
      const bn = parseValue(b, def);
      if (an === null || bn === null) return `Range value out of bounds: "${part}".`;
      lo = an;
      hi = bn;
    } else {
      const n = parseValue(head, def);
      if (n === null) return `Value out of bounds: "${part}".`;
      lo = n;
      hi = n;
    }
    if (lo > hi) return `Range start (${lo}) is greater than end (${hi}).`;
    for (let i = lo; i <= hi; i += step) out.add(i);
  }
  // Cron compatibility: day-of-week 7 = Sunday = 0.
  if (def.kind === "day-of-week" && out.has(7)) {
    out.delete(7);
    out.add(0);
  }
  return { values: [...out].sort((a, b) => a - b), isStar: false };
}

function rangeArr(lo: number, hi: number): number[] {
  const arr: number[] = [];
  for (let i = lo; i <= hi; i++) arr.push(i);
  return arr;
}

export function parseCron(input: string): ParseResult {
  const raw = input.trim();
  // @-keyword aliases
  const ALIAS: Record<string, string> = {
    "@yearly": "0 0 1 1 *",
    "@annually": "0 0 1 1 *",
    "@monthly": "0 0 1 * *",
    "@weekly": "0 0 * * 0",
    "@daily": "0 0 * * *",
    "@midnight": "0 0 * * *",
    "@hourly": "0 * * * *",
  };
  const expression = ALIAS[raw.toLowerCase()] ?? raw;

  const parts = expression.split(/\s+/);
  let defs: FieldDef[];
  if (parts.length === 5) defs = FIELD_DEFS_5;
  else if (parts.length === 6) defs = FIELD_DEFS_6;
  else {
    return {
      ok: false,
      fields: [],
      fieldDefs: FIELD_DEFS_5,
      raw,
      error: `Cron expressions take 5 fields (or 6 with seconds). Got ${parts.length}.`,
    };
  }

  const fields: ParsedField[] = [];
  for (let i = 0; i < defs.length; i++) {
    const result = expandField(parts[i], defs[i]);
    if (typeof result === "string") {
      return { ok: false, fields, fieldDefs: defs, raw, error: result, errorField: i };
    }
    fields.push({
      kind: defs[i].kind,
      values: result.values,
      isStar: result.isStar,
      raw: parts[i],
    });
  }

  return { ok: true, fields, fieldDefs: defs, raw };
}

// ─── Description ───────────────────────────────────────────────────────────

function joinList(arr: (string | number)[], conj = "and"): string {
  const s = arr.map(String);
  if (s.length === 0) return "";
  if (s.length === 1) return s[0];
  if (s.length === 2) return `${s[0]} ${conj} ${s[1]}`;
  return `${s.slice(0, -1).join(", ")}, ${conj} ${s[s.length - 1]}`;
}

function describeField(field: ParsedField, def: FieldDef): string {
  if (field.isStar) return "every";
  if (field.values.length === 1) return `${formatValue(field.values[0], def)}`;
  // Detect a "step" pattern like 0,15,30,45.
  const v = field.values;
  if (v.length > 2 && v[1] - v[0] === v[2] - v[1] && v[v.length - 1] - v[v.length - 2] === v[1] - v[0]) {
    const step = v[1] - v[0];
    if (v[0] === def.min && v[v.length - 1] === def.max - (def.max - def.min) % step) {
      return `every ${step}`;
    }
  }
  return joinList(v.map((n) => formatValue(n, def)));
}

function formatValue(n: number, def: FieldDef): string {
  if (def.kind === "month") return MONTH_NAMES[n - 1].slice(0, 1).toUpperCase() + MONTH_NAMES[n - 1].slice(1);
  if (def.kind === "day-of-week") return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n];
  return String(n);
}

export function describe(parsed: ParseResult): string {
  if (!parsed.ok) return parsed.error ?? "Invalid cron expression";
  const five = parsed.fields.length === 5 ? parsed.fields : parsed.fields.slice(1);
  const second = parsed.fields.length === 6 ? parsed.fields[0] : null;
  const [minute, hour, dom, month, dow] = five;
  const defs = parsed.fields.length === 5 ? FIELD_DEFS_5 : FIELD_DEFS_5;

  const parts: string[] = [];

  if (second) {
    if (second.isStar) parts.push("Every second");
    else parts.push(`At ${describeField(second, FIELD_DEFS_6[0])} seconds`);
  }

  if (minute.isStar && hour.isStar) parts.push("every minute");
  else if (minute.isStar) parts.push(`every minute past hour ${describeField(hour, defs[1])}`);
  else if (hour.isStar) parts.push(`at minute ${describeField(minute, defs[0])} of every hour`);
  else parts.push(`at ${hourMinute(hour.values, minute.values)}`);

  // Day-of-month / day-of-week combination.
  if (!(dom.isStar && dow.isStar)) {
    const segs: string[] = [];
    if (!dom.isStar) segs.push(`on day ${describeField(dom, defs[2])} of the month`);
    if (!dow.isStar) segs.push(`on ${describeField(dow, defs[4])}`);
    parts.push(segs.join(" "));
  }

  if (!month.isStar) parts.push(`in ${describeField(month, defs[3])}`);

  return parts.join(", ").replace(/, in /, " in ");
}

function hourMinute(hours: number[], minutes: number[]): string {
  if (hours.length === 1 && minutes.length === 1) {
    const hh = String(hours[0]).padStart(2, "0");
    const mm = String(minutes[0]).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  if (hours.length === 1) {
    return `hour ${hours[0]}, minute ${joinList(minutes)}`;
  }
  return `${joinList(minutes)} past hour ${joinList(hours)}`;
}

// ─── Next runs ─────────────────────────────────────────────────────────────

export interface NextRun {
  date: Date;
  iso: string;
  relative: string;
}

function relative(ms: number): string {
  if (ms < 60_000) return "in less than a minute";
  if (ms < 3_600_000) return `in ${Math.round(ms / 60_000)} min`;
  if (ms < 86_400_000) return `in ${Math.round(ms / 3_600_000)} h`;
  if (ms < 604_800_000) return `in ${Math.round(ms / 86_400_000)} days`;
  return `in ${Math.round(ms / 604_800_000)} weeks`;
}

/** Walk forward from `now` to find the next N matching dates. Cap iterations
 *  so a never-matching combo (Feb 30) can't hang the browser. */
export function nextRuns(parsed: ParseResult, count = 5, from = new Date(), maxIterDays = 366 * 4): NextRun[] {
  if (!parsed.ok) return [];
  const has6 = parsed.fields.length === 6;
  const [secF, minF, hourF, domF, monthF, dowF] = has6
    ? parsed.fields
    : [null, ...parsed.fields];

  const out: NextRun[] = [];
  const cur = new Date(from.getTime());
  // Round up to the next second / minute.
  cur.setMilliseconds(0);
  if (!has6) cur.setSeconds(0);
  // Bump immediately to avoid returning the current second.
  cur.setSeconds(cur.getSeconds() + 1);
  if (!has6) {
    cur.setSeconds(0);
    cur.setMinutes(cur.getMinutes() + 1);
  }

  const limitMs = from.getTime() + maxIterDays * 24 * 3600 * 1000;
  while (out.length < count && cur.getTime() < limitMs) {
    const m = cur.getMonth() + 1;
    if (monthF && !monthF.values.includes(m)) {
      // Skip to first day of next eligible month.
      cur.setMonth(cur.getMonth() + 1, 1);
      cur.setHours(0, 0, 0, 0);
      continue;
    }
    const day = cur.getDate();
    const dow = cur.getDay();
    // Both domF and dowF must match — unless one of them is *, in which
    // case the other applies. (Cron's classic union semantics.)
    const domStar = !domF || domF.isStar;
    const dowStar = !dowF || dowF.isStar;
    const domOk = domStar ? true : !!domF && domF.values.includes(day);
    const dowOk = dowStar ? true : !!dowF && dowF.values.includes(dow);
    const dayOk = (domStar && dowStar) || (domStar && dowOk) || (dowStar && domOk) || (domOk && dowOk);
    if (!dayOk) {
      cur.setDate(cur.getDate() + 1);
      cur.setHours(0, 0, 0, 0);
      continue;
    }
    if (hourF && !hourF.values.includes(cur.getHours())) {
      cur.setHours(cur.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (minF && !minF.values.includes(cur.getMinutes())) {
      cur.setMinutes(cur.getMinutes() + 1, 0, 0);
      continue;
    }
    if (has6 && secF && !secF.values.includes(cur.getSeconds())) {
      cur.setSeconds(cur.getSeconds() + 1, 0);
      continue;
    }
    const date = new Date(cur.getTime());
    out.push({
      date,
      iso: date.toISOString(),
      relative: relative(date.getTime() - Date.now()),
    });
    // Advance to next candidate to avoid re-matching the same time.
    if (has6) cur.setSeconds(cur.getSeconds() + 1);
    else cur.setMinutes(cur.getMinutes() + 1);
  }
  return out;
}

export const PRESETS = [
  { id: "min", label: "Every minute", expression: "* * * * *" },
  { id: "5min", label: "Every 5 minutes", expression: "*/5 * * * *" },
  { id: "15min", label: "Every 15 minutes", expression: "*/15 * * * *" },
  { id: "hourly", label: "Hourly", expression: "0 * * * *" },
  { id: "daily-9", label: "9:00 every day", expression: "0 9 * * *" },
  { id: "weekly-mon", label: "Every Monday 7:30", expression: "30 7 * * 1" },
  { id: "weekday-9", label: "Weekdays 9:00", expression: "0 9 * * 1-5" },
  { id: "first-of-month", label: "1st of every month", expression: "0 0 1 * *" },
  { id: "midnight-sat-sun", label: "Sat & Sun midnight", expression: "0 0 * * 6,0" },
  { id: "yearly", label: "@yearly", expression: "@yearly" },
];
