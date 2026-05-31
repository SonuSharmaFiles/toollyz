// Cron Job Expression Generator engine. Compose a 5-field cron expression
// from a friendly per-field option model. Round-trips through cron-translator
// for validation and next-run preview so the UI doesn't have to re-implement
// the matching logic.

import { parseCron, type ParseResult } from "./cron-translator";

export type FieldMode = "every" | "list" | "range" | "step";

export interface FieldState {
  mode: FieldMode;
  /** Comma-separated values for "list" mode — eg "0,15,30,45". */
  list: string;
  /** "5-10" form for "range" mode. */
  rangeStart: string;
  rangeEnd: string;
  /** Step like 5 → "asterisk/5". */
  step: number;
}

export interface BuilderState {
  minute: FieldState;
  hour: FieldState;
  dayOfMonth: FieldState;
  month: FieldState;
  dayOfWeek: FieldState;
}

export const DEFAULT_FIELD_STATE: FieldState = {
  mode: "every",
  list: "",
  rangeStart: "",
  rangeEnd: "",
  step: 5,
};

export const DEFAULT_BUILDER_STATE: BuilderState = {
  minute: { ...DEFAULT_FIELD_STATE },
  hour: { ...DEFAULT_FIELD_STATE },
  dayOfMonth: { ...DEFAULT_FIELD_STATE },
  month: { ...DEFAULT_FIELD_STATE },
  dayOfWeek: { ...DEFAULT_FIELD_STATE },
};

function fieldToExpr(field: FieldState): string {
  switch (field.mode) {
    case "every":
      return "*";
    case "list":
      return field.list.trim() || "*";
    case "range":
      if (!field.rangeStart || !field.rangeEnd) return "*";
      return `${field.rangeStart}-${field.rangeEnd}`;
    case "step":
      return `*/${Math.max(1, field.step | 0)}`;
  }
}

export function compose(state: BuilderState): string {
  return [
    fieldToExpr(state.minute),
    fieldToExpr(state.hour),
    fieldToExpr(state.dayOfMonth),
    fieldToExpr(state.month),
    fieldToExpr(state.dayOfWeek),
  ].join(" ");
}

export interface FieldMeta {
  id: keyof BuilderState;
  label: string;
  min: number;
  max: number;
  hint: string;
  optionLabels?: { value: number; label: string }[];
}

const DOW_LABELS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
].map((label, i) => ({ value: i + 1, label }));

export const FIELDS_META: FieldMeta[] = [
  { id: "minute", label: "Minute", min: 0, max: 59, hint: "0-59. */5 = every 5 minutes." },
  { id: "hour", label: "Hour", min: 0, max: 23, hint: "0-23. 9 = 09:00." },
  { id: "dayOfMonth", label: "Day of month", min: 1, max: 31, hint: "1-31. Combined with day-of-week via OR." },
  { id: "month", label: "Month", min: 1, max: 12, hint: "1-12 or Jan-Dec.", optionLabels: MONTH_LABELS },
  { id: "dayOfWeek", label: "Day of week", min: 0, max: 6, hint: "0 = Sunday, 6 = Saturday. 7 also = Sunday.", optionLabels: DOW_LABELS },
];

export function withField(state: BuilderState, field: keyof BuilderState, patch: Partial<FieldState>): BuilderState {
  return { ...state, [field]: { ...state[field], ...patch } };
}

export interface ComposeResult {
  expression: string;
  parsed: ParseResult;
}

export function build(state: BuilderState): ComposeResult {
  const expression = compose(state);
  const parsed = parseCron(expression);
  return { expression, parsed };
}

/** Helpers for the "list" field — toggle a single value in/out. */
export function toggleListValue(list: string, value: number): string {
  const set = new Set(
    list
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => Number(p))
      .filter((n) => Number.isFinite(n)),
  );
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return [...set].sort((a, b) => a - b).join(",");
}

export function listValues(list: string): number[] {
  return list
    .split(/[\s,]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n));
}
