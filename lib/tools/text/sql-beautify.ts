// SQL Query Beautifier engine. Distinct from the existing SQL Formatter
// — this one aligns columns + commas + operators visually, so SELECT
// lists and JOIN ON clauses read like a table. Three style switches:
//
//   - keywordCase: "upper" | "lower" | "preserve"
//   - commaStyle:  "leading" (Joe Celko style) | "trailing"
//   - alignSelectColumns: pad aliased columns so the `AS x` aligns
//
// Tokeniser handles SQL strings (single + dollar-quoted), block + line
// comments (preserves them), keywords (~140 entries), identifiers, ops.

const KEYWORDS = new Set([
  "select", "from", "where", "and", "or", "not", "in", "like", "ilike",
  "between", "is", "null", "as", "join", "left", "right", "inner", "outer",
  "full", "cross", "on", "using", "group", "by", "order", "having", "limit",
  "offset", "insert", "into", "values", "update", "set", "delete", "create",
  "table", "drop", "alter", "add", "primary", "key", "foreign", "references",
  "default", "case", "when", "then", "else", "end", "asc", "desc", "distinct",
  "union", "intersect", "except", "all", "any", "exists", "with", "recursive",
  "returning", "begin", "commit", "rollback", "savepoint", "transaction", "if",
  "else", "while", "loop", "for", "do", "declare", "fetch", "first", "next",
  "rows", "only", "over", "partition", "window", "rank", "row_number",
  "dense_rank", "lag", "lead", "true", "false", "constraint", "unique",
  "check", "view", "schema", "index", "trigger", "function", "procedure",
  "language", "returns", "stable", "immutable", "volatile",
]);

const MAJOR_CLAUSES = new Set([
  "select", "from", "where", "group", "order", "having", "limit", "offset",
  "join", "left", "right", "inner", "outer", "full", "cross", "union",
  "intersect", "except", "with", "values", "set", "insert", "update", "delete",
  "returning",
]);

type Token = {
  kind: "keyword" | "ident" | "string" | "number" | "punct" | "comment" | "ws";
  raw: string;
  /** Lowercased for keyword matching. */
  lower: string;
};

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    // Whitespace.
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      out.push({ kind: "ws", raw: src.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Line comment.
    if (src.startsWith("--", i)) {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      out.push({ kind: "comment", raw: src.slice(i, stop), lower: "" });
      i = stop;
      continue;
    }
    // Block comment.
    if (src.startsWith("/*", i)) {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      out.push({ kind: "comment", raw: src.slice(i, stop), lower: "" });
      i = stop;
      continue;
    }
    // String literal.
    if (ch === "'" || ch === '"' || ch === "`") {
      const q = ch;
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === q) {
          if (src[j + 1] === q) {
            j += 2; // escaped quote
            continue;
          }
          j++;
          break;
        }
        j++;
      }
      out.push({ kind: "string", raw: src.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Number.
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < n && /[0-9.eE+\-]/.test(src[j])) j++;
      out.push({ kind: "number", raw: src.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Identifier / keyword.
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const raw = src.slice(i, j);
      const lower = raw.toLowerCase();
      out.push({ kind: KEYWORDS.has(lower) ? "keyword" : "ident", raw, lower });
      i = j;
      continue;
    }
    // Punctuation / operators (single char is fine for our purposes).
    let j = i + 1;
    if ("<>=!|&".includes(ch)) {
      while (j < n && "<>=!|&".includes(src[j])) j++;
    }
    out.push({ kind: "punct", raw: src.slice(i, j), lower: src.slice(i, j) });
    i = j;
  }
  return out;
}

export interface BeautifyOptions {
  /** Force keywords to UPPER / lower or preserve original case. */
  keywordCase: "upper" | "lower" | "preserve";
  /** "leading" puts the comma at line start (Joe Celko), "trailing" at line end. */
  commaStyle: "leading" | "trailing";
  /** Pad aliased columns in SELECT so `AS alias` aligns. */
  alignSelectColumns: boolean;
  /** Indent string ("  " or "    " or tab). */
  indent: string;
}

export const DEFAULT_OPTIONS: BeautifyOptions = {
  keywordCase: "upper",
  commaStyle: "trailing",
  alignSelectColumns: true,
  indent: "  ",
};

export interface BeautifyResult {
  output: string;
  stats: {
    lines: number;
    bytes: number;
    keywords: number;
    columns: number;
  };
}

function caseKw(raw: string, lower: string, opt: BeautifyOptions): string {
  if (opt.keywordCase === "upper") return lower.toUpperCase();
  if (opt.keywordCase === "lower") return lower;
  return raw;
}

/** Split a tokenised SELECT-list region into column expressions (comma-separated, respecting parens). */
function splitColumns(tokens: Token[]): Token[][] {
  const cols: Token[][] = [];
  let depth = 0;
  let cur: Token[] = [];
  for (const t of tokens) {
    if (t.kind === "punct" && t.raw === "(") depth++;
    else if (t.kind === "punct" && t.raw === ")") depth--;
    if (t.kind === "punct" && t.raw === "," && depth === 0) {
      cols.push(cur);
      cur = [];
      continue;
    }
    cur.push(t);
  }
  if (cur.length > 0) cols.push(cur);
  return cols;
}

function rejoin(tokens: Token[], opt: BeautifyOptions): string {
  // Light per-token re-emission, preserving spacing in identifier-heavy expressions.
  return tokens
    .map((t) => {
      if (t.kind === "ws") return t.raw;
      if (t.kind === "keyword") return caseKw(t.raw, t.lower, opt);
      return t.raw;
    })
    .join("")
    .trim()
    .replace(/\s+/g, " ");
}

function findAlias(col: string): { expr: string; alias?: string } {
  // Find ` AS xyz` or final bareword alias.
  const asMatch = /^([\s\S]+?)\s+(?:as|AS)\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/.exec(col);
  if (asMatch) return { expr: asMatch[1].trim(), alias: asMatch[2] };
  // Bareword at end after a space (only if no parens etc.) — conservative.
  return { expr: col };
}

export function beautify(src: string, opt: BeautifyOptions): BeautifyResult {
  const tokens = tokenize(src);
  let kwCount = 0;
  // Pass 1 — emit lines with indentation, breaking at major clauses + commas.
  const lines: string[] = [];
  let buffer = "";
  let depth = 0;
  let pendingIndent = 0;

  function flush() {
    if (buffer.trim().length > 0) {
      lines.push(opt.indent.repeat(Math.max(0, pendingIndent)) + buffer.replace(/\s+$/, ""));
    }
    buffer = "";
  }

  // We do a streaming render: collect tokens into the current logical line,
  // newline at major clause / comma at depth 0.
  let lineStart = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind === "ws") {
      if (buffer && !buffer.endsWith(" ")) buffer += " ";
      continue;
    }
    if (t.kind === "punct") {
      if (t.raw === "(") {
        depth++;
        buffer += t.raw;
        continue;
      }
      if (t.raw === ")") {
        depth = Math.max(0, depth - 1);
        buffer = buffer.replace(/\s+$/, "");
        buffer += t.raw;
        continue;
      }
      if (t.raw === ";") {
        buffer = buffer.replace(/\s+$/, "") + t.raw;
        flush();
        lineStart = i + 1;
        continue;
      }
      if (t.raw === "," && depth === 0) {
        if (opt.commaStyle === "trailing") {
          buffer = buffer.replace(/\s+$/, "") + ",";
          flush();
        } else {
          flush();
          buffer = ", ";
        }
        continue;
      }
      buffer += t.raw;
      continue;
    }
    if (t.kind === "keyword") {
      kwCount++;
      const isMajor = MAJOR_CLAUSES.has(t.lower) && depth === 0;
      const text = caseKw(t.raw, t.lower, opt);
      if (isMajor && i > lineStart) {
        flush();
        // Most majors stay at indent 0; subquery brackets bump pendingIndent.
        buffer = text;
        continue;
      }
      if (buffer && !buffer.endsWith(" ") && !buffer.endsWith("(")) buffer += " ";
      buffer += text;
      continue;
    }
    // ident / number / string / comment.
    if (buffer && !buffer.endsWith(" ") && !buffer.endsWith("(") && !buffer.endsWith(".")) buffer += " ";
    if (t.kind === "comment") {
      if (buffer.trim()) flush();
      lines.push(opt.indent.repeat(Math.max(0, pendingIndent)) + t.raw.trim());
      buffer = "";
      continue;
    }
    buffer += t.raw;
  }
  flush();

  // Pass 2 — align SELECT columns if requested.
  let columns = 0;
  if (opt.alignSelectColumns) {
    const result: string[] = [];
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      // Detect a SELECT line followed by indented column lines until a major clause.
      if (/^\s*SELECT\b/i.test(line)) {
        result.push(line);
        const group: { idx: number; expr: string; alias?: string; tail: string }[] = [];
        let lj = li + 1;
        while (lj < lines.length && !/^\s*(?:FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|JOIN|LEFT|RIGHT|INNER|UNION|OFFSET|RETURNING)\b/i.test(lines[lj])) {
          const trimmed = lines[lj].trimStart();
          if (!trimmed) {
            lj++;
            continue;
          }
          const trailingComma = trimmed.endsWith(",");
          const body = trailingComma ? trimmed.slice(0, -1) : trimmed;
          const { expr, alias } = findAlias(body);
          group.push({ idx: result.length + group.length + 1, expr, alias, tail: trailingComma ? "," : "" });
          lj++;
        }
        if (group.length > 0) {
          const maxExprLen = Math.max(...group.map((g) => g.expr.length));
          for (const g of group) {
            const padded = g.alias ? g.expr.padEnd(maxExprLen) + " " + caseKw("as", "as", opt) + " " + g.alias : g.expr;
            result.push(opt.indent + padded + g.tail);
            columns++;
          }
        }
        li = lj - 1;
        continue;
      }
      result.push(line);
    }
    return {
      output: result.join("\n"),
      stats: { lines: result.length, bytes: result.join("\n").length, keywords: kwCount, columns },
    };
  }

  return {
    output: lines.join("\n"),
    stats: { lines: lines.length, bytes: lines.join("\n").length, keywords: kwCount, columns: 0 },
  };
}

export const SAMPLE_SQL = `SELECT u.id, u.email, u.created_at AS signup_date, p.title, p.status, COUNT(c.id) AS comment_count FROM users u LEFT JOIN posts p ON p.author_id = u.id LEFT JOIN comments c ON c.post_id = p.id WHERE u.deleted_at IS NULL AND p.published_at > '2026-01-01' GROUP BY u.id, p.id ORDER BY p.published_at DESC LIMIT 100;`;
