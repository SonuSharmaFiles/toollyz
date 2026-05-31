// CSV to JSON engine. Custom CSV parser that handles RFC 4180 — quoted
// fields containing the delimiter, escaped double quotes, CRLF line endings —
// plus the common real-world variants (TSV, semicolon, pipe).

export type Delimiter = "," | ";" | "\t" | "|";

export interface CsvOptions {
  /** When "auto", we sniff the most common delimiter on the first 10 lines. */
  delimiter: Delimiter | "auto";
  /** Treat the first non-empty row as field names. */
  hasHeader: boolean;
  /** Try to detect numbers and booleans and convert them; otherwise everything stays a string. */
  typedValues: boolean;
  /** Drop completely empty rows (all fields blank). */
  skipEmpty: boolean;
  /** "array" → array of objects; "rows" → array of arrays. */
  output: "objects" | "rows";
}

export const DEFAULT_CSV_OPTIONS: CsvOptions = {
  delimiter: "auto",
  hasHeader: true,
  typedValues: true,
  skipEmpty: true,
  output: "objects",
};

function sniffDelimiter(text: string): Delimiter {
  const sample = text.split(/\r?\n/).slice(0, 10).join("\n");
  const counts: Record<Delimiter, number> = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  for (const ch of sample) {
    if (ch in counts) counts[ch as Delimiter]++;
  }
  let best: Delimiter = ",";
  let bestCount = -1;
  for (const d of Object.keys(counts) as Delimiter[]) {
    if (counts[d] > bestCount) {
      best = d;
      bestCount = counts[d];
    }
  }
  return best;
}

export function parseRows(text: string, delimiter: Delimiter): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r" && text[i + 1] === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 2;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // Push the final field/row if we ended mid-line.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function coerceValue(raw: string): string | number | boolean | null {
  const t = raw.trim();
  if (t === "") return "";
  if (t === "null" || t === "NULL") return null;
  if (t === "true" || t === "TRUE") return true;
  if (t === "false" || t === "FALSE") return false;
  if (/^-?\d+$/.test(t)) {
    const n = parseInt(t, 10);
    if (Number.isSafeInteger(n)) return n;
  }
  if (/^-?\d+\.\d+([eE][+-]?\d+)?$/.test(t)) return parseFloat(t);
  return raw;
}

export interface CsvResult {
  ok: boolean;
  rows: string[][];
  headers: string[];
  /** Either an array of objects (when output === "objects") or rows. */
  data: Record<string, unknown>[] | unknown[][];
  /** Detected or chosen delimiter. */
  delimiter: Delimiter;
  /** Total rows including header. */
  totalRows: number;
  /** Distinct field count per row — handy for malformed CSV. */
  rowFieldCounts: number[];
  error?: string;
}

export function csvToJson(text: string, options: CsvOptions = DEFAULT_CSV_OPTIONS): CsvResult {
  if (!text.trim()) {
    return {
      ok: false,
      rows: [],
      headers: [],
      data: [],
      delimiter: ",",
      totalRows: 0,
      rowFieldCounts: [],
      error: "Input is empty.",
    };
  }
  const delim: Delimiter = options.delimiter === "auto" ? sniffDelimiter(text) : options.delimiter;
  let rows = parseRows(text, delim);
  if (options.skipEmpty) {
    rows = rows.filter((r) => !(r.length === 1 && r[0] === "") && r.some((f) => f !== ""));
  }
  const rowFieldCounts = rows.map((r) => r.length);

  let headers: string[] = [];
  let bodyRows: string[][];
  if (options.hasHeader && rows.length > 0) {
    headers = rows[0].map((h, i) => h.trim() || `field${i + 1}`);
    bodyRows = rows.slice(1);
  } else if (rows.length > 0) {
    const cols = rows[0].length;
    headers = Array.from({ length: cols }, (_, i) => `field${i + 1}`);
    bodyRows = rows;
  } else {
    bodyRows = [];
  }

  let data: Record<string, unknown>[] | unknown[][];
  if (options.output === "rows") {
    data = bodyRows.map((r) => r.map((v) => (options.typedValues ? coerceValue(v) : v)));
  } else {
    data = bodyRows.map((r) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < headers.length; i++) {
        const v = r[i] ?? "";
        obj[headers[i]] = options.typedValues ? coerceValue(v) : v;
      }
      return obj;
    });
  }

  return {
    ok: true,
    rows,
    headers,
    data,
    delimiter: delim,
    totalRows: rows.length,
    rowFieldCounts,
  };
}

export const DELIMITER_LABELS: Record<Delimiter, string> = {
  ",": "Comma (,)",
  ";": "Semicolon (;)",
  "\t": "Tab (\\t)",
  "|": "Pipe (|)",
};

export function summariseFieldCounts(rowFieldCounts: number[]): { min: number; max: number; uniform: boolean } {
  if (rowFieldCounts.length === 0) return { min: 0, max: 0, uniform: true };
  const min = Math.min(...rowFieldCounts);
  const max = Math.max(...rowFieldCounts);
  return { min, max, uniform: min === max };
}
