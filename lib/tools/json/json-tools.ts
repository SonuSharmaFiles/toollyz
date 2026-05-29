// JSON engine: a hand-written parser with precise error positions and hints,
// plus beautify / minify / sort / analyze / diff / CSV and a safe syntax
// highlighter. Dependency-free.

export interface ParseError {
  message: string;
  line: number;
  column: number;
  pos: number;
  hint?: string;
}
export interface ParseResult {
  ok: boolean;
  value?: unknown;
  error?: ParseError;
}

class JErr {
  constructor(public pos: number, public message: string, public hint?: string) {}
}

function lineCol(src: string, pos: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  const end = Math.min(pos, src.length);
  for (let k = 0; k < end; k++) {
    if (src[k] === "\n") {
      line++;
      col = 1;
    } else col++;
  }
  return { line, column: col };
}

export function parseJson(src: string): ParseResult {
  let i = 0;
  const n = src.length;

  const ws = () => {
    while (i < n) {
      const c = src.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13) i++;
      else break;
    }
  };

  function value(): unknown {
    ws();
    if (i >= n) throw new JErr(i, "Unexpected end of input", "The JSON is incomplete — a value is expected here.");
    const c = src[i];
    if (c === "{") return obj();
    if (c === "[") return arr();
    if (c === '"') return str();
    if (c === "-" || (c >= "0" && c <= "9")) return num();
    if (src.startsWith("true", i)) { i += 4; return true; }
    if (src.startsWith("false", i)) { i += 5; return false; }
    if (src.startsWith("null", i)) { i += 4; return null; }
    if (c === "'") throw new JErr(i, "Strings must use double quotes", 'Replace ’ with " — JSON requires double quotes.');
    throw new JErr(i, `Unexpected token "${c}"`, "Expected a value: object, array, string, number, true, false or null.");
  }

  function obj(): Record<string, unknown> {
    i++;
    const o: Record<string, unknown> = {};
    ws();
    if (src[i] === "}") { i++; return o; }
    for (;;) {
      ws();
      if (src[i] !== '"') {
        throw new JErr(
          i,
          src[i] === "}" ? "Trailing comma in object" : "Expected a property name in double quotes",
          src[i] === "}" ? "Remove the trailing comma before }." : "Object keys must be double-quoted strings.",
        );
      }
      const key = str();
      ws();
      if (src[i] !== ":") throw new JErr(i, "Expected ':' after property name", "Use \"key\": value pairs.");
      i++;
      o[key] = value();
      ws();
      const ch = src[i];
      if (ch === ",") { i++; continue; }
      if (ch === "}") { i++; return o; }
      throw new JErr(i, i >= n ? "Unexpected end of input" : "Expected ',' or '}'", "Separate properties with commas and close the object with }.");
    }
  }

  function arr(): unknown[] {
    i++;
    const a: unknown[] = [];
    ws();
    if (src[i] === "]") { i++; return a; }
    for (;;) {
      a.push(value());
      ws();
      const ch = src[i];
      if (ch === ",") {
        i++;
        ws();
        if (src[i] === "]") throw new JErr(i, "Trailing comma in array", "Remove the trailing comma before ].");
        continue;
      }
      if (ch === "]") { i++; return a; }
      throw new JErr(i, i >= n ? "Unexpected end of input" : "Expected ',' or ']'", "Separate items with commas and close the array with ].");
    }
  }

  function str(): string {
    i++;
    let s = "";
    while (i < n) {
      const c = src[i];
      if (c === '"') { i++; return s; }
      if (c === "\\") {
        i++;
        const e = src[i];
        if (e === '"') s += '"';
        else if (e === "\\") s += "\\";
        else if (e === "/") s += "/";
        else if (e === "b") s += "\b";
        else if (e === "f") s += "\f";
        else if (e === "n") s += "\n";
        else if (e === "r") s += "\r";
        else if (e === "t") s += "\t";
        else if (e === "u") {
          const hex = src.slice(i + 1, i + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) throw new JErr(i - 1, "Invalid unicode escape", "\\u must be followed by 4 hex digits.");
          s += String.fromCharCode(parseInt(hex, 16));
          i += 4;
        } else throw new JErr(i - 1, `Invalid escape "\\${e ?? ""}"`, 'Valid escapes: \\" \\\\ \\/ \\b \\f \\n \\r \\t \\uXXXX.');
        i++;
      } else if (c.charCodeAt(0) < 0x20) {
        throw new JErr(i, "Unescaped control character in string", "Control characters must be escaped (e.g. use \\n for a newline).");
      } else {
        s += c;
        i++;
      }
    }
    throw new JErr(i, "Unterminated string", 'Add a closing double quote ".');
  }

  function num(): number {
    const start = i;
    if (src[i] === "-") i++;
    if (src[i] === "0") i++;
    else if (src[i] >= "1" && src[i] <= "9") while (src[i] >= "0" && src[i] <= "9") i++;
    else throw new JErr(start, "Invalid number", "A number must have at least one digit.");
    if (src[i] === ".") {
      i++;
      if (!(src[i] >= "0" && src[i] <= "9")) throw new JErr(i, "Invalid number", "Expected digits after the decimal point.");
      while (src[i] >= "0" && src[i] <= "9") i++;
    }
    if (src[i] === "e" || src[i] === "E") {
      i++;
      if (src[i] === "+" || src[i] === "-") i++;
      if (!(src[i] >= "0" && src[i] <= "9")) throw new JErr(i, "Invalid number", "Expected digits in the exponent.");
      while (src[i] >= "0" && src[i] <= "9") i++;
    }
    return Number(src.slice(start, i));
  }

  try {
    ws();
    if (i >= n) return { ok: false, error: { message: "Empty input", line: 1, column: 1, pos: 0, hint: "Paste or type some JSON to validate." } };
    const v = value();
    ws();
    if (i < n) throw new JErr(i, "Unexpected trailing characters", "Remove anything after the top-level value.");
    return { ok: true, value: v };
  } catch (e) {
    if (e instanceof JErr) {
      const { line, column } = lineCol(src, e.pos);
      return { ok: false, error: { message: e.message, line, column, pos: e.pos, hint: e.hint } };
    }
    return { ok: false, error: { message: "Invalid JSON", line: 1, column: 1, pos: 0 } };
  }
}

// ─── Transforms ──────────────────────────────────────────────────────────────

export type Indent = 2 | 4 | "tab";

export function beautify(value: unknown, indent: Indent): string {
  return JSON.stringify(value, null, indent === "tab" ? "\t" : indent);
}
export function minify(value: unknown): string {
  return JSON.stringify(value);
}
export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) o[k] = sortKeys((value as Record<string, unknown>)[k]);
    return o;
  }
  return value;
}

export function escapeJson(text: string): string {
  return JSON.stringify(text);
}
export function unescapeJson(text: string): string {
  const t = text.trim();
  try {
    const parsed = JSON.parse(t.startsWith('"') ? t : `"${t}"`);
    return String(parsed);
  } catch {
    return JSON.parse(`"${t.replace(/^"|"$/g, "")}"`);
  }
}

export function extractKeys(value: unknown): string[] {
  const keys = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      for (const k of Object.keys(v as Record<string, unknown>)) {
        keys.add(k);
        walk((v as Record<string, unknown>)[k]);
      }
    }
  };
  walk(value);
  return [...keys].sort();
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export interface Stats {
  objects: number;
  arrays: number;
  keys: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  maxDepth: number;
  nodes: number;
}

export function analyze(value: unknown): Stats {
  const s: Stats = { objects: 0, arrays: 0, keys: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, maxDepth: 0, nodes: 0 };
  const walk = (v: unknown, depth: number) => {
    s.nodes++;
    if (depth > s.maxDepth) s.maxDepth = depth;
    if (Array.isArray(v)) {
      s.arrays++;
      v.forEach((x) => walk(x, depth + 1));
    } else if (v && typeof v === "object") {
      s.objects++;
      const obj = v as Record<string, unknown>;
      const ks = Object.keys(obj);
      s.keys += ks.length;
      ks.forEach((k) => walk(obj[k], depth + 1));
    } else if (typeof v === "string") s.strings++;
    else if (typeof v === "number") s.numbers++;
    else if (typeof v === "boolean") s.booleans++;
    else if (v === null) s.nulls++;
  };
  walk(value, 1);
  return s;
}

export function byteSize(text: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  return text.length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Diff ────────────────────────────────────────────────────────────────────

export type DiffType = "added" | "removed" | "changed";
export interface DiffEntry {
  path: string;
  type: DiffType;
  a?: unknown;
  b?: unknown;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  if (isObj(a) && isObj(b)) {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

export function diffJson(a: unknown, b: unknown, path = "$"): DiffEntry[] {
  const out: DiffEntry[] = [];
  if (deepEqual(a, b)) return out;
  if (isObj(a) && isObj(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const p = `${path}.${k}`;
      if (!(k in a)) out.push({ path: p, type: "added", b: b[k] });
      else if (!(k in b)) out.push({ path: p, type: "removed", a: a[k] });
      else out.push(...diffJson(a[k], b[k], p));
    }
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let idx = 0; idx < len; idx++) {
      const p = `${path}[${idx}]`;
      if (idx >= a.length) out.push({ path: p, type: "added", b: b[idx] });
      else if (idx >= b.length) out.push({ path: p, type: "removed", a: a[idx] });
      else out.push(...diffJson(a[idx], b[idx], p));
    }
  } else {
    out.push({ path, type: "changed", a, b });
  }
  return out;
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function toCsv(value: unknown): { ok: boolean; csv?: string; error?: string } {
  if (!Array.isArray(value)) return { ok: false, error: "CSV export needs a top-level array (e.g. an array of objects)." };
  if (value.length === 0) return { ok: true, csv: "" };
  const cell = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  if (value.every((r) => isObj(r))) {
    const cols = [...new Set(value.flatMap((r) => Object.keys(r as Record<string, unknown>)))];
    const head = cols.map(cell).join(",");
    const rows = value.map((r) => cols.map((c) => cell((r as Record<string, unknown>)[c])).join(","));
    return { ok: true, csv: [head, ...rows].join("\n") };
  }
  return { ok: true, csv: ["value", ...value.map((v) => cell(v))].join("\n") };
}

// ─── Health score ────────────────────────────────────────────────────────────

export function healthScore(valid: boolean, stats: Stats | null): number {
  if (!valid || !stats) return 0;
  let score = 100;
  if (stats.maxDepth > 12) score -= Math.min(20, (stats.maxDepth - 12) * 2);
  if (stats.nodes > 20000) score -= 10;
  return Math.max(40, score);
}

// ─── Syntax highlighter (safe HTML) ──────────────────────────────────────────

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const HL_RE =
  /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(-?\d[\d.eE+-]*)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\],:])/g;

export function highlightJson(src: string): string {
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  HL_RE.lastIndex = 0;
  while ((m = HL_RE.exec(src)) !== null) {
    out += escapeHtml(src.slice(last, m.index));
    if (m[1]) {
      const key = m[1].replace(/\s*:$/, "");
      out += `<span class="j-key">${escapeHtml(key)}</span><span class="j-pun">${m[1].slice(key.length)}</span>`;
    } else if (m[2]) out += `<span class="j-str">${escapeHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="j-num">${escapeHtml(m[3])}</span>`;
    else if (m[4]) out += `<span class="j-bool">${m[4]}</span>`;
    else if (m[5]) out += `<span class="j-null">null</span>`;
    else if (m[6]) out += `<span class="j-pun">${escapeHtml(m[6])}</span>`;
    last = m.index + m[0].length;
  }
  out += escapeHtml(src.slice(last));
  return out;
}

export const SAMPLE_JSON = `{
  "name": "Toollyz",
  "version": 2.6,
  "live": true,
  "tags": ["json", "formatter", "developer"],
  "stats": { "tools": 200, "rating": 4.9, "free": true },
  "owner": { "id": 1, "handle": "@toollyz", "verified": null }
}`;
