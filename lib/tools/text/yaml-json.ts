// YAML ↔ JSON converter. Implements a minimal YAML 1.2 subset that covers
// the workhorse cases real configs use (Kubernetes manifests, GitHub
// Actions workflows, dprint config, prettier config, docker-compose).
//
// Supported:
//   - Scalars: strings (plain, single-quoted, double-quoted with escapes),
//     numbers (int / float / hex / oct), booleans (true/false/yes/no),
//     null (null / ~), ISO 8601 dates (kept as strings).
//   - Block maps with arbitrary nesting (indentation-based).
//   - Block sequences (- item).
//   - Flow maps {key: value, …}.
//   - Flow sequences [a, b, c].
//   - Multi-line strings (| literal, > folded, with chomping indicators).
//   - Comments (# …).
//
// Not (yet) supported: anchors/aliases (&foo *foo), tags (!!str), document
// markers (---/...).

export type YamlValue =
  | string
  | number
  | boolean
  | null
  | YamlValue[]
  | { [k: string]: YamlValue };

export interface YamlParseResult {
  ok: boolean;
  value: YamlValue;
  error?: string;
  errorLine?: number;
}

// ── Tokeniser-light line-based parser ───────────────────────────────────────

interface Line {
  raw: string;
  indent: number;
  content: string;
  number: number;
}

function preprocess(text: string): Line[] {
  const lines: Line[] = [];
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < raw.length; i++) {
    const lineRaw = raw[i];
    const indent = lineRaw.length - lineRaw.replace(/^[ \t]+/, "").length;
    const trimmed = lineRaw.replace(/^[ \t]+/, "");
    // Strip end-of-line comments (only when '#' is preceded by whitespace
    // or at line start).
    const stripped = trimmed.replace(/(^|\s)#.*$/, "$1").replace(/\s+$/, "");
    if (stripped === "") continue;
    lines.push({ raw: lineRaw, indent, content: stripped, number: i + 1 });
  }
  return lines;
}

function parseScalar(text: string): YamlValue {
  const t = text.trim();
  if (t === "" || t === "~" || t === "null") return null;
  if (t === "true" || t === "True" || t === "TRUE" || t === "yes" || t === "Yes" || t === "YES") return true;
  if (t === "false" || t === "False" || t === "FALSE" || t === "no" || t === "No" || t === "NO") return false;
  // Quoted strings
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    const inner = t.slice(1, -1);
    if (t.startsWith('"')) return decodeDoubleQuoted(inner);
    return inner.replace(/''/g, "'");
  }
  // Hex / octal
  if (/^0x[0-9a-fA-F]+$/.test(t)) return parseInt(t, 16);
  if (/^0o[0-7]+$/.test(t)) return parseInt(t.slice(2), 8);
  // Number
  if (/^-?\d+$/.test(t)) {
    const n = parseInt(t, 10);
    if (Number.isSafeInteger(n)) return n;
  }
  if (/^-?\d+\.\d*([eE][+-]?\d+)?$/.test(t)) return parseFloat(t);
  if (/^-?(\.inf|\.Inf|\.INF)$/.test(t)) return t.startsWith("-") ? -Infinity : Infinity;
  if (/^(\.nan|\.NaN|\.NAN)$/.test(t)) return NaN;
  return t;
}

function decodeDoubleQuoted(s: string): string {
  return s.replace(/\\(["\\nrtbf]|u[0-9a-fA-F]{4})/g, (_, esc) => {
    switch (esc) {
      case '"': return '"';
      case "\\": return "\\";
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      default:
        if (esc.startsWith("u")) return String.fromCharCode(parseInt(esc.slice(1), 16));
        return esc;
    }
  });
}

// ── Flow (inline) parser ────────────────────────────────────────────────────

interface FlowCursor {
  text: string;
  pos: number;
}

function flowSkipWs(c: FlowCursor): void {
  while (c.pos < c.text.length && /\s/.test(c.text[c.pos])) c.pos++;
}

function flowParse(text: string): YamlValue {
  const c: FlowCursor = { text: text.trim(), pos: 0 };
  return flowValue(c);
}

function flowValue(c: FlowCursor): YamlValue {
  flowSkipWs(c);
  const ch = c.text[c.pos];
  if (ch === "[") return flowArray(c);
  if (ch === "{") return flowMap(c);
  // Read until next , or ] or } at depth 0.
  let s = "";
  while (c.pos < c.text.length) {
    const cur = c.text[c.pos];
    if (cur === "," || cur === "]" || cur === "}") break;
    s += cur;
    c.pos++;
  }
  return parseScalar(s);
}

function flowArray(c: FlowCursor): YamlValue {
  c.pos++; // [
  const out: YamlValue[] = [];
  flowSkipWs(c);
  if (c.text[c.pos] === "]") {
    c.pos++;
    return out;
  }
  while (c.pos < c.text.length) {
    out.push(flowValue(c));
    flowSkipWs(c);
    if (c.text[c.pos] === ",") {
      c.pos++;
      continue;
    }
    if (c.text[c.pos] === "]") {
      c.pos++;
      return out;
    }
    break;
  }
  return out;
}

function flowMap(c: FlowCursor): YamlValue {
  c.pos++; // {
  const out: Record<string, YamlValue> = {};
  flowSkipWs(c);
  if (c.text[c.pos] === "}") {
    c.pos++;
    return out;
  }
  while (c.pos < c.text.length) {
    flowSkipWs(c);
    let key = "";
    while (c.pos < c.text.length && c.text[c.pos] !== ":" && c.text[c.pos] !== "," && c.text[c.pos] !== "}") {
      key += c.text[c.pos];
      c.pos++;
    }
    flowSkipWs(c);
    if (c.text[c.pos] !== ":") break;
    c.pos++;
    flowSkipWs(c);
    const v = flowValue(c);
    out[key.trim().replace(/^["']|["']$/g, "")] = v;
    flowSkipWs(c);
    if (c.text[c.pos] === ",") {
      c.pos++;
      continue;
    }
    if (c.text[c.pos] === "}") {
      c.pos++;
      return out;
    }
    break;
  }
  return out;
}

// ── Block parser ────────────────────────────────────────────────────────────

interface ParseState {
  lines: Line[];
  cursor: number;
}

function peek(state: ParseState): Line | undefined {
  return state.lines[state.cursor];
}

function readBlockMap(state: ParseState, baseIndent: number): Record<string, YamlValue> {
  const obj: Record<string, YamlValue> = {};
  while (state.cursor < state.lines.length) {
    const line = state.lines[state.cursor];
    if (line.indent < baseIndent) break;
    if (line.indent > baseIndent) {
      // Misindented continuation; bail.
      break;
    }
    const c = line.content;
    if (c.startsWith("- ")) break; // sequence at same indent — not part of this map
    const colon = findKeyColon(c);
    if (colon < 0) break;
    const key = parseScalar(c.slice(0, colon).trim()) as string | number;
    const rest = c.slice(colon + 1).trim();
    state.cursor++;
    if (rest === "" || rest === "|" || rest === ">" || /^[|>][+-]?\d*$/.test(rest)) {
      // Multi-line scalar or nested structure.
      if (/^[|>][+-]?\d*$/.test(rest) || rest === "|" || rest === ">") {
        const chomp = rest.length > 0 ? rest : "|";
        obj[String(key)] = readBlockScalar(state, baseIndent, chomp);
      } else {
        // Could be nested map, nested sequence, or null.
        const next = peek(state);
        if (!next || next.indent <= baseIndent) {
          obj[String(key)] = null;
        } else if (next.content.startsWith("- ")) {
          obj[String(key)] = readBlockSequence(state, next.indent);
        } else {
          obj[String(key)] = readBlockMap(state, next.indent);
        }
      }
    } else {
      // Inline value.
      if (rest.startsWith("[") || rest.startsWith("{")) obj[String(key)] = flowParse(rest);
      else obj[String(key)] = parseScalar(rest);
    }
  }
  return obj;
}

function findKeyColon(s: string): number {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === ":" && !inSingle && !inDouble) return i;
  }
  return -1;
}

function readBlockSequence(state: ParseState, baseIndent: number): YamlValue[] {
  const out: YamlValue[] = [];
  while (state.cursor < state.lines.length) {
    const line = state.lines[state.cursor];
    if (line.indent < baseIndent) break;
    if (line.indent > baseIndent || !line.content.startsWith("- ")) {
      if (line.content === "-") {
        // empty item
        state.cursor++;
        out.push(null);
        continue;
      }
      break;
    }
    const itemRaw = line.content.slice(2).trim();
    state.cursor++;
    if (itemRaw === "") {
      // Nested structure starts on the next line at deeper indent.
      const next = peek(state);
      if (next && next.indent > baseIndent) {
        if (next.content.startsWith("- ")) out.push(readBlockSequence(state, next.indent));
        else out.push(readBlockMap(state, next.indent));
      } else {
        out.push(null);
      }
    } else if (itemRaw.startsWith("[") || itemRaw.startsWith("{")) {
      out.push(flowParse(itemRaw));
    } else {
      // Check whether this looks like a key:value pair (continuing as a nested map).
      const colon = findKeyColon(itemRaw);
      if (colon > 0 && (itemRaw[colon + 1] === " " || colon === itemRaw.length - 1)) {
        // Treat the "- key: value" as a one-line map; nested keys may follow.
        const map: Record<string, YamlValue> = {};
        const k = String(parseScalar(itemRaw.slice(0, colon).trim()));
        const v = itemRaw.slice(colon + 1).trim();
        if (v === "") {
          // Look for nested children at higher indent.
          const next = peek(state);
          if (next && next.indent > baseIndent) {
            if (next.content.startsWith("- ")) map[k] = readBlockSequence(state, next.indent);
            else map[k] = readBlockMap(state, next.indent);
          } else {
            map[k] = null;
          }
        } else {
          map[k] = v.startsWith("[") || v.startsWith("{") ? flowParse(v) : parseScalar(v);
        }
        // After the inline first key, continue reading additional keys at the same indent + 2.
        const continueIndent = baseIndent + 2;
        const sub = readBlockMap(state, continueIndent);
        for (const [kk, vv] of Object.entries(sub)) map[kk] = vv;
        out.push(map);
      } else {
        out.push(parseScalar(itemRaw));
      }
    }
  }
  return out;
}

function readBlockScalar(state: ParseState, baseIndent: number, chomp: string): string {
  // chomp: "|" literal-keep, ">" folded; trailing "-" strips, trailing "+" keeps all.
  const literal = chomp.startsWith("|");
  const strip = chomp.includes("-");
  const lines: string[] = [];
  let blockIndent = -1;
  while (state.cursor < state.lines.length) {
    const line = state.lines[state.cursor];
    if (line.indent <= baseIndent) break;
    if (blockIndent === -1) blockIndent = line.indent;
    lines.push(line.raw.slice(blockIndent));
    state.cursor++;
  }
  let result = literal ? lines.join("\n") : lines.join(" ").replace(/\s+/g, " ").trim();
  if (literal) result += "\n";
  if (strip) result = result.replace(/\n+$/, "");
  return result;
}

export function parseYaml(text: string): YamlParseResult {
  try {
    const lines = preprocess(text);
    if (lines.length === 0) return { ok: true, value: null };
    const state: ParseState = { lines, cursor: 0 };
    const baseIndent = lines[0].indent;
    let value: YamlValue;
    if (lines[0].content.startsWith("- ")) {
      value = readBlockSequence(state, baseIndent);
    } else if (lines[0].content.startsWith("[") || lines[0].content.startsWith("{")) {
      value = flowParse(lines[0].content);
    } else {
      value = readBlockMap(state, baseIndent);
    }
    return { ok: true, value };
  } catch (e) {
    return { ok: false, value: null, error: e instanceof Error ? e.message : "Parse error" };
  }
}

// ── JSON → YAML ─────────────────────────────────────────────────────────────

export interface DumpOptions {
  /** Number of spaces per indentation level. */
  indent: number;
  /** Sort keys alphabetically within each map. */
  sortKeys: boolean;
}

export const DEFAULT_DUMP_OPTIONS: DumpOptions = { indent: 2, sortKeys: false };

const BARE_KEY_RE = /^[A-Za-z_][\w-]*$/;
const NEEDS_QUOTING_VAL = /^(true|false|yes|no|null|~|on|off)$/i;

function dumpValue(v: YamlValue, opt: DumpOptions, indent: number, isMapValue: boolean): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (Number.isNaN(v)) return ".nan";
    if (v === Infinity) return ".inf";
    if (v === -Infinity) return "-.inf";
    return String(v);
  }
  if (typeof v === "string") {
    return dumpScalarString(v);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const lines = v.map((item) => {
      const dumped = dumpValue(item, opt, indent + opt.indent, false);
      if (typeof item === "object" && item !== null) {
        // Nested map/array — render inline on the same line as the dash, then continue indented.
        const subLines = dumped.split("\n");
        return `${" ".repeat(indent)}- ${subLines[0]}\n${subLines
          .slice(1)
          .map((l) => " ".repeat(indent + 2) + l.replace(/^ */, ""))
          .filter((l) => l.trim() !== "")
          .join("\n")}`;
      }
      return `${" ".repeat(indent)}- ${dumped}`;
    });
    const txt = lines.join("\n");
    return isMapValue ? `\n${txt}` : txt;
  }
  if (typeof v === "object") {
    const obj = v as Record<string, YamlValue>;
    const keys = opt.sortKeys ? Object.keys(obj).sort() : Object.keys(obj);
    if (keys.length === 0) return "{}";
    const lines = keys.map((k) => {
      const child = dumpValue(obj[k], opt, indent + opt.indent, true);
      const keyOut = BARE_KEY_RE.test(k) ? k : `"${k.replace(/"/g, '\\"')}"`;
      if (typeof obj[k] === "object" && obj[k] !== null) {
        return `${" ".repeat(indent)}${keyOut}:${child.startsWith("\n") ? child : ` ${child}`}`;
      }
      return `${" ".repeat(indent)}${keyOut}: ${child}`;
    });
    const txt = lines.join("\n");
    return isMapValue ? `\n${txt}` : txt;
  }
  return String(v);
}

function dumpScalarString(s: string): string {
  if (s === "") return '""';
  if (NEEDS_QUOTING_VAL.test(s)) return `"${s}"`;
  if (/[:#\[\]{},&*!|>'"%@`\n]/.test(s) || /^\s/.test(s) || /\s$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\t/g, "\\t")}"`;
  }
  return s;
}

export function dumpYaml(value: YamlValue, opt: DumpOptions = DEFAULT_DUMP_OPTIONS): string {
  const out = dumpValue(value, opt, 0, false);
  return out.replace(/^\n/, "") + (out.endsWith("\n") ? "" : "\n");
}

// ── Stats ───────────────────────────────────────────────────────────────────

export interface YamlStats {
  scalars: number;
  maps: number;
  sequences: number;
  bytes: number;
}

function countValues(v: YamlValue, stats: YamlStats): void {
  if (Array.isArray(v)) {
    stats.sequences++;
    v.forEach((item) => countValues(item, stats));
    return;
  }
  if (v !== null && typeof v === "object") {
    stats.maps++;
    Object.values(v).forEach((item) => countValues(item, stats));
    return;
  }
  stats.scalars++;
}

export function statsOf(parsed: YamlParseResult, text: string): YamlStats {
  const stats: YamlStats = { scalars: 0, maps: 0, sequences: 0, bytes: text.length };
  if (parsed.ok) countValues(parsed.value, stats);
  return stats;
}
