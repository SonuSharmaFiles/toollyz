// SQL Dummy Data Generator engine. Reuses the fake-json data generators
// and emits INSERT statements for a configurable table. Outputs three
// dialects: standard SQL (PostgreSQL / SQLite), MySQL backtick-quoted, and
// SQL Server bracket-quoted. Multi-row insert, single-row inserts, and
// optional ON CONFLICT / ON DUPLICATE KEY clauses.

import { generate, type FieldSpec } from "./fake-json";

export type Dialect = "postgres" | "mysql" | "mssql";

export interface DialectMeta {
  id: Dialect;
  label: string;
  quoteId: (id: string) => string;
  quoteStr: (s: string) => string;
  hint: string;
}

function pgQuoteStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}
function mssqlQuoteStr(s: string): string {
  return `N'${s.replace(/'/g, "''")}'`;
}
function mysqlQuoteStr(s: string): string {
  // Use single quotes; escape with backslash for newlines and embedded quotes.
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
}

export const DIALECTS: DialectMeta[] = [
  {
    id: "postgres",
    label: "PostgreSQL / SQLite (standard)",
    quoteId: (id) => `"${id.replace(/"/g, '""')}"`,
    quoteStr: pgQuoteStr,
    hint: "Double-quoted identifiers, '' escape for single quotes.",
  },
  {
    id: "mysql",
    label: "MySQL / MariaDB",
    quoteId: (id) => `\`${id.replace(/`/g, "``")}\``,
    quoteStr: mysqlQuoteStr,
    hint: "Backtick identifiers, backslash + '' escapes.",
  },
  {
    id: "mssql",
    label: "SQL Server",
    quoteId: (id) => `[${id.replace(/\]/g, "]]")}]`,
    quoteStr: mssqlQuoteStr,
    hint: "Bracket identifiers, N'…' Unicode literals.",
  },
];

export type ConflictMode = "none" | "ignore" | "upsert";

export interface SqlOptions {
  dialect: Dialect;
  tableName: string;
  /** Combine into a single multi-row INSERT (true) or one INSERT per row (false). */
  multiRowInsert: boolean;
  /** Wrap output in BEGIN / COMMIT. */
  transaction: boolean;
  /** Conflict-handling clause. */
  conflict: ConflictMode;
  /** Column to use as the conflict target for ON CONFLICT (DO UPDATE). */
  conflictColumn?: string;
}

export const DEFAULT_SQL_OPTIONS: SqlOptions = {
  dialect: "postgres",
  tableName: "users",
  multiRowInsert: true,
  transaction: false,
  conflict: "none",
};

function formatValue(v: unknown, dialect: DialectMeta): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") {
    if (dialect.id === "mssql") return v ? "1" : "0";
    return v ? "TRUE" : "FALSE";
  }
  if (typeof v === "string") return dialect.quoteStr(v);
  return dialect.quoteStr(JSON.stringify(v));
}

export interface SqlOutput {
  ok: boolean;
  sql: string;
  /** Number of rows the SQL inserts. */
  rowCount: number;
  /** Number of INSERT statements actually emitted (1 when multiRow). */
  statementCount: number;
  byteLength: number;
  error?: string;
}

export interface GenerateInput {
  schema: FieldSpec[];
  rowCount: number;
  sql: SqlOptions;
}

export function generateSql(input: GenerateInput): SqlOutput {
  const dialect = DIALECTS.find((d) => d.id === input.sql.dialect) ?? DIALECTS[0];
  const schema = input.schema.filter((f) => f.name.trim());
  if (schema.length === 0) {
    return { ok: false, sql: "", rowCount: 0, statementCount: 0, byteLength: 0, error: "Schema is empty — add at least one field." };
  }
  if (!input.sql.tableName.trim()) {
    return { ok: false, sql: "", rowCount: 0, statementCount: 0, byteLength: 0, error: "Set a table name." };
  }
  const rows = generate({ schema, count: Math.max(1, Math.min(10_000, input.rowCount)) });
  const cols = schema.map((f) => dialect.quoteId(f.name));
  const table = dialect.quoteId(input.sql.tableName.trim());

  const rowValues: string[] = rows.map((row) => {
    const vals = schema.map((f) => formatValue(row[f.name], dialect));
    return `(${vals.join(", ")})`;
  });

  const lines: string[] = [];
  if (input.sql.transaction) lines.push("BEGIN;");

  if (input.sql.multiRowInsert) {
    const prefix = `INSERT INTO ${table} (${cols.join(", ")}) VALUES`;
    const body = rowValues.join(",\n  ");
    lines.push(`${prefix}\n  ${body}${tail(input.sql, dialect)};`);
  } else {
    const prefix = `INSERT INTO ${table} (${cols.join(", ")}) VALUES `;
    for (const rv of rowValues) {
      lines.push(`${prefix}${rv}${tail(input.sql, dialect)};`);
    }
  }

  if (input.sql.transaction) lines.push("COMMIT;");

  const sql = lines.join("\n") + "\n";
  return {
    ok: true,
    sql,
    rowCount: rows.length,
    statementCount: input.sql.multiRowInsert ? 1 : rows.length,
    byteLength: sql.length,
  };
}

function tail(opt: SqlOptions, dialect: DialectMeta): string {
  if (opt.conflict === "none") return "";
  if (opt.conflict === "ignore") {
    if (dialect.id === "mysql") return " ON DUPLICATE KEY UPDATE id=id";
    if (dialect.id === "postgres") return ` ON CONFLICT${opt.conflictColumn ? ` (${dialect.quoteId(opt.conflictColumn)})` : ""} DO NOTHING`;
    return "";
  }
  // upsert
  if (dialect.id === "postgres") {
    const target = opt.conflictColumn ? ` (${dialect.quoteId(opt.conflictColumn)})` : "";
    return ` ON CONFLICT${target} DO UPDATE SET ${"updated_at = EXCLUDED.updated_at"}`;
  }
  if (dialect.id === "mysql") {
    return " ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)";
  }
  return "";
}
