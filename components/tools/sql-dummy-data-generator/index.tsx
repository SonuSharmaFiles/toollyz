"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  DatabaseBackup,
  Download,
  Lock,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { FIELD_TYPE_META, newField, type FieldSpec, type FieldType } from "@/lib/tools/text/fake-json";
import {
  DEFAULT_SQL_OPTIONS,
  DIALECTS,
  generateSql,
  type ConflictMode,
  type Dialect,
  type SqlOptions,
} from "@/lib/tools/text/sql-dummy";

const SCHEMA_KEY = "toollyz:sqldummy-schema";
const OPT_KEY = "toollyz:sqldummy-opt";
const COUNT_KEY = "toollyz:sqldummy-count";

const SAMPLE_SCHEMA: FieldSpec[] = [
  { id: "f1", name: "id", type: "uuid" },
  { id: "f2", name: "name", type: "name" },
  { id: "f3", name: "email", type: "email" },
  { id: "f4", name: "country", type: "country" },
  { id: "f5", name: "is_active", type: "boolean" },
  { id: "f6", name: "created_at", type: "iso-date" },
];

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/sql;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SqlDummyDataGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [schema, setSchema] = React.useState<FieldSpec[]>(SAMPLE_SCHEMA);
  const [count, setCount] = React.useState(10);
  const [sqlOpt, setSqlOpt] = React.useState<SqlOptions>(DEFAULT_SQL_OPTIONS);
  const [seed, setSeed] = React.useState(0);
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const sraw = localStorage.getItem(SCHEMA_KEY);
      if (sraw) {
        const parsed = JSON.parse(sraw);
        if (Array.isArray(parsed)) setSchema(parsed);
      }
      const oraw = localStorage.getItem(OPT_KEY);
      if (oraw) {
        const parsed = JSON.parse(oraw);
        if (parsed && typeof parsed === "object") setSqlOpt({ ...DEFAULT_SQL_OPTIONS, ...parsed });
      }
      const c = parseInt(localStorage.getItem(COUNT_KEY) ?? "10", 10);
      if (Number.isFinite(c)) setCount(Math.max(1, Math.min(10_000, c)));
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SCHEMA_KEY, JSON.stringify(schema));
      localStorage.setItem(OPT_KEY, JSON.stringify(sqlOpt));
      localStorage.setItem(COUNT_KEY, String(count));
    } catch {
      /* noop */
    }
  }, [schema, sqlOpt, count, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      const res = generateSql({ schema, rowCount: count, sql: sqlOpt });
      if (res.ok) {
        setOutput(res.sql);
        setError(null);
      } else {
        setOutput("");
        setError(res.error ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, schema, sqlOpt, count, seed]);

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("SQL copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function updateField(id: string, patch: Partial<FieldSpec>) {
    setSchema((s) => s.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removeField(id: string) {
    setSchema((s) => s.filter((f) => f.id !== id));
  }
  function moveField(i: number, d: -1 | 1) {
    setSchema((s) => {
      const next = [...s];
      const t = i + d;
      if (t < 0 || t >= next.length) return s;
      [next[i], next[t]] = [next[t], next[i]];
      return next;
    });
  }

  const grouped = React.useMemo(() => {
    const g: Record<string, typeof FIELD_TYPE_META> = {};
    for (const m of FIELD_TYPE_META) (g[m.group] = g[m.group] ?? []).push(m);
    return g;
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Rows" value={count} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Columns" value={schema.length} reduceMotion={!!reduceMotion} />
          <Stat label="SQL bytes" value={output.length} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Dialect</div>
            <div className="font-heading text-base font-bold text-sky-50 sm:text-lg">
              {DIALECTS.find((d) => d.id === sqlOpt.dialect)?.label.split(" / ")[0]}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Database className="size-4 text-primary" />
          Output options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Dialect</Label>
            <select
              value={sqlOpt.dialect}
              onChange={(e) => setSqlOpt((o) => ({ ...o, dialect: e.target.value as Dialect }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Table name</Label>
            <Input
              value={sqlOpt.tableName}
              onChange={(e) => setSqlOpt((o) => ({ ...o, tableName: e.target.value }))}
              className="font-mono"
              placeholder="users"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rows</Label>
            <Input
              type="number"
              min={1}
              max={10_000}
              value={count}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setCount(Math.max(1, Math.min(10_000, n)));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Conflict</Label>
            <select
              value={sqlOpt.conflict}
              onChange={(e) => setSqlOpt((o) => ({ ...o, conflict: e.target.value as ConflictMode }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="none">None</option>
              <option value="ignore">ON CONFLICT DO NOTHING</option>
              <option value="upsert">ON CONFLICT DO UPDATE</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={sqlOpt.multiRowInsert}
            onChange={(v) => setSqlOpt((o) => ({ ...o, multiRowInsert: v }))}
            label="Single multi-row INSERT"
          />
          <Toggle
            checked={sqlOpt.transaction}
            onChange={(v) => setSqlOpt((o) => ({ ...o, transaction: v }))}
            label="Wrap in BEGIN / COMMIT"
          />
          {sqlOpt.conflict !== "none" && (
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              Conflict column
              <Input
                value={sqlOpt.conflictColumn ?? ""}
                onChange={(e) => setSqlOpt((o) => ({ ...o, conflictColumn: e.target.value }))}
                placeholder="email"
                className="h-7 w-32 font-mono text-xs"
              />
            </label>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <DatabaseBackup className="size-4 text-primary" />
            Columns
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={() => setSchema((s) => [...s, newField()])}>
            <Plus className="size-3.5" />
            Column
          </Button>
        </div>
        <div className="space-y-2">
          {schema.map((f, i) => (
            <div
              key={f.id}
              className="grid items-center gap-2 rounded-xl border border-border/60 bg-background p-2 sm:grid-cols-[1fr_220px_120px_auto]"
            >
              <Input
                value={f.name}
                onChange={(e) => updateField(f.id, { name: e.target.value })}
                placeholder="column_name"
                className="h-8 font-mono"
              />
              <select
                value={f.type}
                onChange={(e) => updateField(f.id, { type: e.target.value as FieldType })}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-primary"
              >
                {Object.entries(grouped).map(([group, items]) => (
                  <optgroup label={group} key={group}>
                    {items.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {(f.type === "integer" || f.type === "float") ? (
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={f.min ?? 0}
                    onChange={(e) => updateField(f.id, { min: parseFloat(e.target.value) })}
                    className="h-8 font-mono text-xs"
                  />
                  <Input
                    type="number"
                    value={f.max ?? 100}
                    onChange={(e) => updateField(f.id, { max: parseFloat(e.target.value) })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground">—</div>
              )}
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => moveField(i, -1)}
                  disabled={i === 0}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveField(i, 1)}
                  disabled={i === schema.length - 1}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeField(f.id)}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3.5" />
          {error}
        </div>
      )}

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Database className="size-4 text-primary" />
            Generated SQL
          </h2>
          <Button type="button" onClick={() => setSeed((s) => s + 1)}>
            <RefreshCcw className="size-4" />
            Regenerate
          </Button>
        </div>
        <textarea
          value={output}
          readOnly
          rows={20}
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={copy} disabled={!output}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => downloadText(output, "seed.sql")}
            disabled={!output}
          >
            <Download className="size-3.5" />
            Download .sql
          </Button>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Database className="size-3" />
        SQL generation runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}
