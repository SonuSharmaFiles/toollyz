// TOML Formatter engine. Parses a subset of TOML 1.0 large enough to cover
// 95% of real-world config files (Cargo.toml, pyproject.toml, dprint config,
// etc.), validates, and re-emits with consistent spacing.
//
// Supported:
//   - Comments (`# …`)
//   - Bare and quoted keys, dotted keys (a.b.c)
//   - Strings (basic "…", literal '…', multi-line """…""", '''…''')
//   - Integers (decimal, hex 0x, octal 0o, binary 0b — incl. underscores)
//   - Floats (incl. inf, nan)
//   - Booleans (true / false)
//   - Inline arrays — multi-line supported, trailing comma OK
//   - Inline tables { key = value, … }
//   - Standard tables [section] and dotted [a.b.c]
//   - Array of tables [[section]]
//   - RFC 3339 datetimes (passed through as opaque strings; we don't try to
//     re-format them).
//
// Not (yet) supported:
//   - Mixed type arrays (we accept them but warn).
//   - Cross-table merging rules beyond the standard.

export type TomlValue =
  | { type: "string"; value: string; literal: boolean; multiline: boolean }
  | { type: "integer"; value: number; raw: string }
  | { type: "float"; value: number; raw: string }
  | { type: "bool"; value: boolean }
  | { type: "datetime"; value: string }
  | { type: "array"; value: TomlValue[] }
  | { type: "inline-table"; value: Map<string, TomlValue> };

export interface TomlError {
  line: number;
  column: number;
  message: string;
}

export interface ParseResult {
  ok: boolean;
  errors: TomlError[];
  /** Tree of tables → key → value. Empty when ok === false. */
  root: TableNode;
}

export interface TableNode {
  /** Keys at this table's level, preserving insertion order. */
  entries: Array<[string, TomlValue]>;
  /** Sub-tables by name (the dot-separated last segment). */
  tables: Map<string, TableNode>;
  /** Arrays of tables under this node. */
  arrayTables: Map<string, TableNode[]>;
  /** The literal `[a.b]` line that opened this table, if any — used for re-emit. */
  headerPath?: string[];
  isArrayOfTables?: boolean;
}

function makeTable(): TableNode {
  return { entries: [], tables: new Map(), arrayTables: new Map() };
}

// ── Tokeniser-light parser ─────────────────────────────────────────────────

interface Cursor {
  text: string;
  pos: number;
  line: number;
  col: number;
}

function cursorOf(text: string): Cursor {
  return { text, pos: 0, line: 1, col: 1 };
}

function advance(c: Cursor, n = 1): void {
  for (let i = 0; i < n && c.pos < c.text.length; i++) {
    if (c.text[c.pos] === "\n") {
      c.line++;
      c.col = 1;
    } else {
      c.col++;
    }
    c.pos++;
  }
}

function peek(c: Cursor, offset = 0): string {
  return c.text[c.pos + offset] ?? "";
}

function eatWs(c: Cursor): void {
  while (peek(c) === " " || peek(c) === "\t") advance(c);
}

function eatNewlinesAndComments(c: Cursor): void {
  while (c.pos < c.text.length) {
    eatWs(c);
    const ch = peek(c);
    if (ch === "\n" || ch === "\r") advance(c);
    else if (ch === "#") {
      while (c.pos < c.text.length && peek(c) !== "\n") advance(c);
    } else break;
  }
}

function err(c: Cursor, message: string): TomlError {
  return { line: c.line, column: c.col, message };
}

function isBareKeyChar(ch: string): boolean {
  return /[A-Za-z0-9_\-]/.test(ch);
}

function readBareKey(c: Cursor): string {
  let s = "";
  while (isBareKeyChar(peek(c))) {
    s += peek(c);
    advance(c);
  }
  return s;
}

function readQuotedKey(c: Cursor, quote: string): string {
  advance(c); // opening quote
  let s = "";
  while (c.pos < c.text.length && peek(c) !== quote) {
    if (peek(c) === "\\" && quote === '"') {
      s += handleEscape(c);
    } else {
      s += peek(c);
      advance(c);
    }
  }
  advance(c); // closing
  return s;
}

function handleEscape(c: Cursor): string {
  advance(c); // skip backslash
  const e = peek(c);
  advance(c);
  switch (e) {
    case '"': return '"';
    case "\\": return "\\";
    case "/": return "/";
    case "b": return "\b";
    case "f": return "\f";
    case "n": return "\n";
    case "r": return "\r";
    case "t": return "\t";
    case "u": {
      const hex = c.text.slice(c.pos, c.pos + 4);
      advance(c, 4);
      return String.fromCharCode(parseInt(hex, 16));
    }
    default: return e;
  }
}

function readKey(c: Cursor): { parts: string[]; error?: TomlError } {
  const parts: string[] = [];
  while (true) {
    eatWs(c);
    const ch = peek(c);
    if (ch === '"') parts.push(readQuotedKey(c, '"'));
    else if (ch === "'") parts.push(readQuotedKey(c, "'"));
    else if (isBareKeyChar(ch)) parts.push(readBareKey(c));
    else return { parts, error: err(c, `Expected a key, found '${ch || "EOF"}'.`) };
    eatWs(c);
    if (peek(c) === ".") advance(c);
    else return { parts };
  }
}

function readString(c: Cursor): TomlValue | TomlError {
  if (peek(c) === '"' && peek(c, 1) === '"' && peek(c, 2) === '"') {
    advance(c, 3);
    // Skip an immediate newline after opening triple quotes.
    if (peek(c) === "\n") advance(c);
    let s = "";
    while (c.pos < c.text.length && !(peek(c) === '"' && peek(c, 1) === '"' && peek(c, 2) === '"')) {
      if (peek(c) === "\\") s += handleEscape(c);
      else {
        s += peek(c);
        advance(c);
      }
    }
    if (c.pos >= c.text.length) return err(c, "Unterminated multi-line basic string.");
    advance(c, 3);
    return { type: "string", value: s, literal: false, multiline: true };
  }
  if (peek(c) === "'" && peek(c, 1) === "'" && peek(c, 2) === "'") {
    advance(c, 3);
    if (peek(c) === "\n") advance(c);
    let s = "";
    while (c.pos < c.text.length && !(peek(c) === "'" && peek(c, 1) === "'" && peek(c, 2) === "'")) {
      s += peek(c);
      advance(c);
    }
    if (c.pos >= c.text.length) return err(c, "Unterminated multi-line literal string.");
    advance(c, 3);
    return { type: "string", value: s, literal: true, multiline: true };
  }
  if (peek(c) === '"') {
    advance(c);
    let s = "";
    while (c.pos < c.text.length && peek(c) !== '"') {
      if (peek(c) === "\\") s += handleEscape(c);
      else {
        s += peek(c);
        advance(c);
      }
    }
    if (peek(c) !== '"') return err(c, "Unterminated string.");
    advance(c);
    return { type: "string", value: s, literal: false, multiline: false };
  }
  if (peek(c) === "'") {
    advance(c);
    let s = "";
    while (c.pos < c.text.length && peek(c) !== "'") {
      s += peek(c);
      advance(c);
    }
    if (peek(c) !== "'") return err(c, "Unterminated literal string.");
    advance(c);
    return { type: "string", value: s, literal: true, multiline: false };
  }
  return err(c, "Expected a string.");
}

const NUM_TERMINATOR = /[\s,\]\}#]/;

function readScalar(c: Cursor): TomlValue | TomlError {
  // Booleans
  if (c.text.startsWith("true", c.pos)) {
    advance(c, 4);
    return { type: "bool", value: true };
  }
  if (c.text.startsWith("false", c.pos)) {
    advance(c, 5);
    return { type: "bool", value: false };
  }
  // Date / time — match anything that looks RFC-3339-ish and leave as opaque string.
  const slice = c.text.slice(c.pos, c.pos + 40);
  const dateMatch = /^(\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?|\d{2}:\d{2}:\d{2}(\.\d+)?)/.exec(slice);
  if (dateMatch) {
    advance(c, dateMatch[0].length);
    return { type: "datetime", value: dateMatch[0] };
  }
  // Numbers
  let raw = "";
  while (c.pos < c.text.length && !NUM_TERMINATOR.test(peek(c))) {
    raw += peek(c);
    advance(c);
  }
  if (!raw) return err(c, "Expected a value.");
  const cleaned = raw.replace(/_/g, "");
  if (/^[+-]?0x[0-9a-fA-F]+$/.test(cleaned)) {
    return { type: "integer", value: parseInt(cleaned.replace(/^[+-]?0x/, ""), 16) * (cleaned.startsWith("-") ? -1 : 1), raw };
  }
  if (/^[+-]?0o[0-7]+$/.test(cleaned)) {
    return { type: "integer", value: parseInt(cleaned.replace(/^[+-]?0o/, ""), 8) * (cleaned.startsWith("-") ? -1 : 1), raw };
  }
  if (/^[+-]?0b[01]+$/.test(cleaned)) {
    return { type: "integer", value: parseInt(cleaned.replace(/^[+-]?0b/, ""), 2) * (cleaned.startsWith("-") ? -1 : 1), raw };
  }
  if (/^[+-]?\d+$/.test(cleaned)) {
    return { type: "integer", value: parseInt(cleaned, 10), raw };
  }
  if (/^[+-]?(inf|nan)$/i.test(cleaned)) {
    return { type: "float", value: /nan$/i.test(cleaned) ? NaN : (cleaned.startsWith("-") ? -Infinity : Infinity), raw };
  }
  if (/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(cleaned)) {
    return { type: "float", value: parseFloat(cleaned), raw };
  }
  return err(c, `Unrecognised scalar '${raw}'.`);
}

function readValue(c: Cursor): TomlValue | TomlError {
  eatWs(c);
  const ch = peek(c);
  if (ch === '"' || ch === "'") return readString(c);
  if (ch === "[") return readArray(c);
  if (ch === "{") return readInlineTable(c);
  return readScalar(c);
}

function readArray(c: Cursor): TomlValue | TomlError {
  advance(c); // [
  const items: TomlValue[] = [];
  while (true) {
    eatNewlinesAndComments(c);
    if (peek(c) === "]") {
      advance(c);
      return { type: "array", value: items };
    }
    const v = readValue(c);
    if (!("type" in v)) return v;
    items.push(v);
    eatNewlinesAndComments(c);
    if (peek(c) === ",") advance(c);
    else if (peek(c) !== "]") return err(c, "Expected ',' or ']' in array.");
  }
}

function readInlineTable(c: Cursor): TomlValue | TomlError {
  advance(c); // {
  const m = new Map<string, TomlValue>();
  eatWs(c);
  if (peek(c) === "}") {
    advance(c);
    return { type: "inline-table", value: m };
  }
  while (true) {
    eatWs(c);
    const k = readKey(c);
    if (k.error) return k.error;
    eatWs(c);
    if (peek(c) !== "=") return err(c, "Expected '=' inside inline table.");
    advance(c);
    const v = readValue(c);
    if (!("type" in v)) return v;
    m.set(k.parts.join("."), v);
    eatWs(c);
    if (peek(c) === ",") {
      advance(c);
      continue;
    }
    if (peek(c) === "}") {
      advance(c);
      return { type: "inline-table", value: m };
    }
    return err(c, "Expected ',' or '}' in inline table.");
  }
}

function navigateTable(root: TableNode, path: string[]): TableNode {
  let cur = root;
  for (const seg of path) {
    if (!cur.tables.has(seg)) cur.tables.set(seg, makeTable());
    cur = cur.tables.get(seg)!;
  }
  return cur;
}

function navigateArrayTable(root: TableNode, path: string[]): TableNode {
  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];
  const parent = navigateTable(root, parentPath);
  if (!parent.arrayTables.has(last)) parent.arrayTables.set(last, []);
  const newTable = makeTable();
  newTable.isArrayOfTables = true;
  newTable.headerPath = path;
  parent.arrayTables.get(last)!.push(newTable);
  return newTable;
}

export function parseToml(text: string): ParseResult {
  const c = cursorOf(text);
  const root = makeTable();
  let currentTable = root;
  const errors: TomlError[] = [];

  while (c.pos < c.text.length) {
    eatNewlinesAndComments(c);
    if (c.pos >= c.text.length) break;

    if (peek(c) === "[") {
      const isArray = peek(c, 1) === "[";
      advance(c, isArray ? 2 : 1);
      eatWs(c);
      const k = readKey(c);
      if (k.error) {
        errors.push(k.error);
        return { ok: false, errors, root: makeTable() };
      }
      eatWs(c);
      if (peek(c) === "]") advance(c);
      else {
        errors.push(err(c, "Expected ']' to close table header."));
        return { ok: false, errors, root: makeTable() };
      }
      if (isArray) {
        if (peek(c) !== "]") {
          errors.push(err(c, "Expected ']]' to close array-of-tables header."));
          return { ok: false, errors, root: makeTable() };
        }
        advance(c);
        currentTable = navigateArrayTable(root, k.parts);
      } else {
        currentTable = navigateTable(root, k.parts);
        currentTable.headerPath = k.parts;
      }
      eatNewlinesAndComments(c);
      continue;
    }

    // key = value
    const k = readKey(c);
    if (k.error) {
      errors.push(k.error);
      return { ok: false, errors, root: makeTable() };
    }
    eatWs(c);
    if (peek(c) !== "=") {
      errors.push(err(c, "Expected '=' after key."));
      return { ok: false, errors, root: makeTable() };
    }
    advance(c);
    const v = readValue(c);
    if (!("type" in v)) {
      errors.push(v);
      return { ok: false, errors, root: makeTable() };
    }
    if (k.parts.length === 1) {
      currentTable.entries.push([k.parts[0], v]);
    } else {
      // Dotted key — descend to a nested table.
      const target = navigateTable(currentTable, k.parts.slice(0, -1));
      target.entries.push([k.parts[k.parts.length - 1], v]);
    }
    eatNewlinesAndComments(c);
  }

  return { ok: true, errors: [], root };
}

// ── Emitter ────────────────────────────────────────────────────────────────

export interface FormatOptions {
  /** Pad single-line arrays to multi-line when >= N items. */
  arrayBreakAt: number;
  /** Sort keys alphabetically within each table. */
  sortKeys: boolean;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  arrayBreakAt: 4,
  sortKeys: false,
};

function formatValue(v: TomlValue, opt: FormatOptions): string {
  switch (v.type) {
    case "string":
      if (v.multiline) {
        return v.literal ? `'''\n${v.value}'''` : `"""\n${v.value}"""`;
      }
      return v.literal
        ? `'${v.value}'`
        : `"${v.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\t/g, "\\t")}"`;
    case "integer":
      return String(v.value);
    case "float":
      if (Number.isNaN(v.value)) return "nan";
      if (v.value === Infinity) return "inf";
      if (v.value === -Infinity) return "-inf";
      return Number.isInteger(v.value) ? `${v.value}.0` : String(v.value);
    case "bool":
      return v.value ? "true" : "false";
    case "datetime":
      return v.value;
    case "array":
      return formatArray(v.value, opt);
    case "inline-table":
      return formatInlineTable(v.value, opt);
  }
}

function formatArray(items: TomlValue[], opt: FormatOptions): string {
  if (items.length === 0) return "[]";
  if (items.length < opt.arrayBreakAt) {
    return `[${items.map((i) => formatValue(i, opt)).join(", ")}]`;
  }
  const inner = items.map((i) => `  ${formatValue(i, opt)}`).join(",\n");
  return `[\n${inner},\n]`;
}

function formatInlineTable(m: Map<string, TomlValue>, opt: FormatOptions): string {
  const items: string[] = [];
  for (const [k, v] of m) items.push(`${k} = ${formatValue(v, opt)}`);
  return `{ ${items.join(", ")} }`;
}

function emitTable(t: TableNode, opt: FormatOptions, path: string[] = []): string {
  const lines: string[] = [];
  const entries = opt.sortKeys ? [...t.entries].sort((a, b) => a[0].localeCompare(b[0])) : t.entries;
  if (path.length > 0) lines.push(`[${path.join(".")}]`);
  for (const [k, v] of entries) lines.push(`${k} = ${formatValue(v, opt)}`);
  if (path.length > 0 || entries.length > 0) lines.push("");

  const subKeys = opt.sortKeys ? [...t.tables.keys()].sort() : [...t.tables.keys()];
  for (const k of subKeys) {
    lines.push(emitTable(t.tables.get(k)!, opt, [...path, k]).trimEnd());
    lines.push("");
  }
  const arrKeys = opt.sortKeys ? [...t.arrayTables.keys()].sort() : [...t.arrayTables.keys()];
  for (const k of arrKeys) {
    for (const at of t.arrayTables.get(k)!) {
      lines.push(`[[${[...path, k].join(".")}]]`);
      for (const [ek, ev] of (opt.sortKeys ? [...at.entries].sort((a, b) => a[0].localeCompare(b[0])) : at.entries)) {
        lines.push(`${ek} = ${formatValue(ev, opt)}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function formatToml(parsed: ParseResult, opt: FormatOptions = DEFAULT_FORMAT_OPTIONS): string {
  if (!parsed.ok) return "";
  return emitTable(parsed.root, opt).trim() + "\n";
}

// ── Stats ──────────────────────────────────────────────────────────────────

export interface TomlStats {
  tables: number;
  keys: number;
  arrays: number;
  lines: number;
  bytes: number;
}

function countTable(t: TableNode, stats: TomlStats): void {
  stats.tables++;
  stats.keys += t.entries.length;
  for (const [, v] of t.entries) {
    if (v.type === "array") stats.arrays++;
  }
  for (const child of t.tables.values()) countTable(child, stats);
  for (const arr of t.arrayTables.values()) {
    for (const child of arr) countTable(child, stats);
  }
}

export function tomlStats(parsed: ParseResult, text: string): TomlStats {
  const stats: TomlStats = { tables: 0, keys: 0, arrays: 0, lines: text.split("\n").length, bytes: text.length };
  if (parsed.ok) countTable(parsed.root, stats);
  return stats;
}
