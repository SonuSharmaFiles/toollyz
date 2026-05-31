// SQL Formatter engine. A small tokenizer-based formatter that handles the
// dialect-neutral subset of SQL most users write: SELECT / INSERT / UPDATE /
// DELETE / CREATE / ALTER, with WITH (CTEs), JOINs, sub-queries, comments
// (`--` and `/* */`), strings, identifiers (`"…"`, `` `…` ``, `[…]`), and
// dollar-quoted PostgreSQL strings.
//
// The output uses standard 2-space indentation and uppercases reserved words.
// Comments are preserved verbatim.

const RESERVED = new Set([
  "select", "from", "where", "and", "or", "not", "in", "is", "null", "as", "by",
  "order", "group", "having", "limit", "offset", "with", "union", "all", "intersect",
  "except", "case", "when", "then", "else", "end", "join", "inner", "outer", "left",
  "right", "full", "cross", "on", "using", "lateral", "natural", "into", "values",
  "insert", "update", "delete", "set", "create", "alter", "drop", "table", "view",
  "index", "primary", "key", "foreign", "references", "default", "unique", "check",
  "constraint", "if", "exists", "between", "like", "ilike", "asc", "desc", "distinct",
  "true", "false", "returning", "begin", "commit", "rollback", "transaction",
]);

// Keywords that start a new line / clause at the top level.
const TOP_CLAUSES = new Set([
  "select", "from", "where", "group", "having", "order", "limit", "offset",
  "values", "set", "into", "returning", "with",
]);

// Multi-word clauses that should stick together.
const MULTI_CLAUSES: [string, string][] = [
  ["group", "by"],
  ["order", "by"],
  ["partition", "by"],
  ["inner", "join"],
  ["left", "join"],
  ["left", "outer"],
  ["right", "join"],
  ["right", "outer"],
  ["full", "join"],
  ["full", "outer"],
  ["cross", "join"],
  ["natural", "join"],
  ["lateral", "join"],
  ["union", "all"],
  ["intersect", "all"],
  ["except", "all"],
  ["is", "null"],
  ["is", "not"],
  ["not", "in"],
  ["not", "like"],
  ["not", "between"],
  ["primary", "key"],
  ["foreign", "key"],
];

const JOIN_STARTS = new Set(["join", "left", "right", "inner", "outer", "full", "cross", "natural", "lateral"]);

export type TokenKind =
  | "keyword"
  | "identifier"
  | "string"
  | "number"
  | "punct"
  | "operator"
  | "comment-line"
  | "comment-block"
  | "whitespace";

export interface Token {
  kind: TokenKind;
  text: string;
  /** Lower-case text — convenient for keyword matching. */
  lower: string;
}

function isAlpha(ch: string): boolean {
  return /[A-Za-z_]/.test(ch);
}
function isAlnum(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}
function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const ch = sql[i];
    // Whitespace
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(sql[j])) j++;
      tokens.push({ kind: "whitespace", text: sql.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Line comment
    if (ch === "-" && sql[i + 1] === "-") {
      let j = i;
      while (j < n && sql[j] !== "\n") j++;
      tokens.push({ kind: "comment-line", text: sql.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Block comment
    if (ch === "/" && sql[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(sql[j] === "*" && sql[j + 1] === "/")) j++;
      j = Math.min(n, j + 2);
      tokens.push({ kind: "comment-block", text: sql.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Single-quoted string (with '' escape)
    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") { j++; break; }
        else j++;
      }
      tokens.push({ kind: "string", text: sql.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Double-quoted identifier
    if (ch === '"') {
      let j = i + 1;
      while (j < n && sql[j] !== '"') j++;
      j = Math.min(n, j + 1);
      tokens.push({ kind: "identifier", text: sql.slice(i, j), lower: sql.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    // Backtick identifier (MySQL)
    if (ch === "`") {
      let j = i + 1;
      while (j < n && sql[j] !== "`") j++;
      j = Math.min(n, j + 1);
      tokens.push({ kind: "identifier", text: sql.slice(i, j), lower: sql.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    // Bracketed identifier (SQL Server)
    if (ch === "[") {
      let j = i + 1;
      while (j < n && sql[j] !== "]") j++;
      j = Math.min(n, j + 1);
      tokens.push({ kind: "identifier", text: sql.slice(i, j), lower: sql.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    // Numbers
    if (isDigit(ch) || (ch === "." && isDigit(sql[i + 1]))) {
      let j = i;
      while (j < n && /[0-9.eE+\-]/.test(sql[j])) j++;
      tokens.push({ kind: "number", text: sql.slice(i, j), lower: "" });
      i = j;
      continue;
    }
    // Identifiers / keywords
    if (isAlpha(ch)) {
      let j = i;
      while (j < n && isAlnum(sql[j])) j++;
      const text = sql.slice(i, j);
      const lower = text.toLowerCase();
      tokens.push({ kind: RESERVED.has(lower) ? "keyword" : "identifier", text, lower });
      i = j;
      continue;
    }
    // Multi-char operators
    if (
      (ch === "<" && (sql[i + 1] === "=" || sql[i + 1] === ">")) ||
      (ch === ">" && sql[i + 1] === "=") ||
      (ch === "!" && sql[i + 1] === "=") ||
      (ch === ":" && sql[i + 1] === ":")
    ) {
      tokens.push({ kind: "operator", text: sql.slice(i, i + 2), lower: "" });
      i += 2;
      continue;
    }
    if ("()[]{},.;".includes(ch)) {
      tokens.push({ kind: "punct", text: ch, lower: "" });
      i++;
      continue;
    }
    if ("+-*/%=<>".includes(ch)) {
      tokens.push({ kind: "operator", text: ch, lower: "" });
      i++;
      continue;
    }
    // Unknown — accept verbatim.
    tokens.push({ kind: "punct", text: ch, lower: "" });
    i++;
  }
  return tokens;
}

export interface FormatOptions {
  indent: number;
  uppercase: boolean;
  /** Add a blank line between major clauses (SELECT block / FROM block). */
  blankLinesBetweenClauses: boolean;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  indent: 2,
  uppercase: true,
  blankLinesBetweenClauses: false,
};

function indent(level: number, opt: FormatOptions): string {
  return " ".repeat(Math.max(0, level) * opt.indent);
}

function emitKeyword(tok: Token, opt: FormatOptions): string {
  return opt.uppercase ? tok.text.toUpperCase() : tok.text;
}

export function formatSql(sql: string, opt: FormatOptions = DEFAULT_FORMAT_OPTIONS): string {
  const tokens = tokenize(sql).filter((t) => t.kind !== "whitespace");
  let out = "";
  let depth = 0;
  let needNewline = false;

  function newline() {
    if (out.endsWith("\n")) return;
    out += "\n";
  }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];

    // Pair multi-word clauses so they emit on the same line.
    if (next) {
      const found = MULTI_CLAUSES.find((p) => p[0] === t.lower && p[1] === next.lower);
      if (found) {
        if (needNewline) newline();
        if (TOP_CLAUSES.has(t.lower) || JOIN_STARTS.has(t.lower)) {
          out += indent(depth, opt);
        } else if (!out.endsWith("\n") && !out.endsWith(" ") && out.length > 0) {
          out += " ";
        }
        out += `${emitKeyword(t, opt)} ${emitKeyword(next, opt)}`;
        i++;
        needNewline = true;
        continue;
      }
    }

    if (t.kind === "comment-line") {
      if (out && !out.endsWith("\n")) out += " ";
      out += t.text;
      newline();
      needNewline = false;
      continue;
    }
    if (t.kind === "comment-block") {
      if (out && !out.endsWith("\n") && !out.endsWith(" ")) out += " ";
      out += t.text;
      continue;
    }

    if (t.kind === "punct" && t.text === "(") {
      // Sub-query / function call — keep on the same line; bump depth.
      if (!out.endsWith(" ") && !out.endsWith("(") && !out.endsWith("\n") && out.length > 0) out += "";
      out += "(";
      depth++;
      continue;
    }
    if (t.kind === "punct" && t.text === ")") {
      depth = Math.max(0, depth - 1);
      out += ")";
      continue;
    }
    if (t.kind === "punct" && t.text === ",") {
      out += ",\n" + indent(depth, opt);
      continue;
    }
    if (t.kind === "punct" && t.text === ";") {
      out += ";\n";
      needNewline = false;
      continue;
    }

    // Top-level clauses → newline + base indent.
    if (t.kind === "keyword" && TOP_CLAUSES.has(t.lower)) {
      if (out && !out.endsWith("\n")) newline();
      out += indent(depth, opt) + emitKeyword(t, opt);
      needNewline = true;
      continue;
    }

    // JOIN starts also indent under FROM.
    if (t.kind === "keyword" && JOIN_STARTS.has(t.lower)) {
      if (out && !out.endsWith("\n")) newline();
      out += indent(depth + 1, opt) + emitKeyword(t, opt);
      needNewline = true;
      continue;
    }

    // AND / OR after WHERE → newline at same depth.
    if (t.kind === "keyword" && (t.lower === "and" || t.lower === "or")) {
      newline();
      out += indent(depth + 1, opt) + emitKeyword(t, opt);
      needNewline = true;
      continue;
    }

    if (needNewline) {
      out += "\n" + indent(depth + 1, opt);
      needNewline = false;
    } else if (!out.endsWith(" ") && !out.endsWith("\n") && !out.endsWith("(")) {
      out += " ";
    }

    const text = t.kind === "keyword" ? emitKeyword(t, opt) : t.text;
    out += text;
  }

  return out
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd() + "\n";
}

export interface SqlStats {
  tokens: number;
  keywords: number;
  identifiers: number;
  strings: number;
  comments: number;
  /** Tokens that look like a query terminator. */
  statements: number;
}

export function sqlStats(sql: string): SqlStats {
  const tokens = tokenize(sql);
  const stats: SqlStats = { tokens: 0, keywords: 0, identifiers: 0, strings: 0, comments: 0, statements: 0 };
  for (const t of tokens) {
    if (t.kind === "whitespace") continue;
    stats.tokens++;
    if (t.kind === "keyword") stats.keywords++;
    else if (t.kind === "identifier") stats.identifiers++;
    else if (t.kind === "string") stats.strings++;
    else if (t.kind === "comment-line" || t.kind === "comment-block") stats.comments++;
    if (t.kind === "punct" && t.text === ";") stats.statements++;
  }
  if (stats.statements === 0 && stats.tokens > 0) stats.statements = 1;
  return stats;
}

export const SQL_PRESETS = [
  {
    id: "join",
    label: "SELECT with JOIN",
    sql: `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true and u.created_at > '2024-01-01' group by u.id, u.name having count(o.id) > 5 order by orders desc limit 10;`,
  },
  {
    id: "cte",
    label: "CTE with subquery",
    sql: `with recent_orders as (select user_id, count(*) as cnt from orders where created_at > now() - interval '7 days' group by user_id) select u.id, u.name, ro.cnt from users u join recent_orders ro on ro.user_id = u.id order by ro.cnt desc;`,
  },
  {
    id: "insert",
    label: "INSERT … VALUES",
    sql: `insert into users (id, name, email, created_at) values (1, 'Ada', 'ada@example.com', now()), (2, 'Grace', 'grace@example.com', now()) on conflict (email) do update set name = excluded.name returning id, name;`,
  },
  {
    id: "create",
    label: "CREATE TABLE",
    sql: `create table if not exists posts (id bigint primary key, title text not null, body text, author_id bigint references users(id), published_at timestamptz, tags text[]);`,
  },
];
