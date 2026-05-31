// JSON to CSV engine. Accepts an array of objects (the common API-response
// shape) OR an array of arrays. Handles nested objects via dotted-path
// flattening, arrays via JSON-stringification, and the usual CSV escaping.

import type { Delimiter } from "./csv-json";

export interface JsonCsvOptions {
  delimiter: Delimiter;
  /** Wrap every field in double quotes (not just the ones that need it). */
  alwaysQuote: boolean;
  /** Flatten nested objects into dotted columns (user.name, user.email …). */
  flatten: boolean;
  /** How to render nested arrays inside cells. */
  arrayMode: "json" | "join-pipe" | "first-item";
  /** Include the header row at the top. */
  includeHeader: boolean;
  /** Newline style. */
  newline: "\n" | "\r\n";
}

export const DEFAULT_JSON_CSV_OPTIONS: JsonCsvOptions = {
  delimiter: ",",
  alwaysQuote: false,
  flatten: true,
  arrayMode: "json",
  includeHeader: true,
  newline: "\n",
};

function needsQuoting(s: string, delim: Delimiter): boolean {
  return s.includes(delim) || s.includes('"') || s.includes("\n") || s.includes("\r");
}

function csvEscape(s: string, opt: JsonCsvOptions): string {
  if (opt.alwaysQuote || needsQuoting(s, opt.delimiter)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function flatten(prefix: string, obj: unknown, out: Record<string, unknown>, opt: JsonCsvOptions): void {
  if (obj === null || obj === undefined) {
    out[prefix] = obj ?? "";
    return;
  }
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return;
  }
  if (Array.isArray(obj)) {
    if (opt.arrayMode === "json") out[prefix] = JSON.stringify(obj);
    else if (opt.arrayMode === "join-pipe") out[prefix] = obj.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(" | ");
    else out[prefix] = obj[0] ?? "";
    return;
  }
  // Plain object — recurse with dotted keys.
  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length === 0) {
    out[prefix] = "";
    return;
  }
  for (const [k, v] of entries) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (opt.flatten) flatten(next, v, out, opt);
    else out[next] = typeof v === "object" ? JSON.stringify(v) : v;
  }
}

function valueToCsv(v: unknown, opt: JsonCsvOptions): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

export interface JsonCsvResult {
  ok: boolean;
  /** The CSV text. */
  output: string;
  /** Field names extracted (in column order). */
  headers: string[];
  /** Number of rows (excluding header). */
  rowCount: number;
  error?: string;
}

export function jsonToCsv(jsonText: string, opt: JsonCsvOptions = DEFAULT_JSON_CSV_OPTIONS): JsonCsvResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return { ok: false, output: "", headers: [], rowCount: 0, error: e instanceof Error ? e.message : "Invalid JSON" };
  }

  let rows: Record<string, unknown>[] = [];

  if (Array.isArray(parsed)) {
    // Either array of objects (the common case) or array of arrays.
    if (parsed.length === 0) {
      return { ok: true, output: "", headers: [], rowCount: 0 };
    }
    if (Array.isArray(parsed[0])) {
      const arrs = parsed as unknown[][];
      // Treat the first array as the header row.
      const headers = (arrs[0] as unknown[]).map((h, i) => String(h ?? `field${i + 1}`));
      const body = arrs.slice(1).map((arr) => {
        const row: Record<string, unknown> = {};
        for (let i = 0; i < headers.length; i++) row[headers[i]] = arr[i];
        return row;
      });
      rows = body;
    } else {
      for (const item of parsed) {
        const flat: Record<string, unknown> = {};
        flatten("", item, flat, opt);
        rows.push(flat);
      }
    }
  } else if (parsed && typeof parsed === "object") {
    const flat: Record<string, unknown> = {};
    flatten("", parsed, flat, opt);
    rows = [flat];
  } else {
    return { ok: false, output: "", headers: [], rowCount: 0, error: "Top-level JSON must be an array or object." };
  }

  // Collect headers from the union of all rows so missing fields show up as empty cells.
  const headerSet = new Set<string>();
  for (const row of rows) for (const k of Object.keys(row)) headerSet.add(k);
  const headers = [...headerSet];

  const lines: string[] = [];
  if (opt.includeHeader) {
    lines.push(headers.map((h) => csvEscape(h, opt)).join(opt.delimiter));
  }
  for (const row of rows) {
    const cells = headers.map((h) => csvEscape(valueToCsv(row[h], opt), opt));
    lines.push(cells.join(opt.delimiter));
  }
  return {
    ok: true,
    output: lines.join(opt.newline),
    headers,
    rowCount: rows.length,
  };
}
