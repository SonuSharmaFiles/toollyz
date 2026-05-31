"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  Download,
  Eraser,
  Lock,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_SCHEMA,
  FIELD_TYPE_META,
  generate,
  newField,
  type FieldSpec,
  type FieldType,
} from "@/lib/tools/text/fake-json";

const SCHEMA_KEY = "toollyz:fakejson-schema";
const COUNT_KEY = "toollyz:fakejson-count";

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function FakeJsonDataGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [schema, setSchema] = React.useState<FieldSpec[]>(DEFAULT_SCHEMA);
  const [count, setCount] = React.useState(10);
  const [seed, setSeed] = React.useState(0);
  const [data, setData] = React.useState<Record<string, unknown>[]>([]);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SCHEMA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSchema(parsed);
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
      localStorage.setItem(COUNT_KEY, String(count));
    } catch {
      /* noop */
    }
  }, [schema, count, mounted]);

  // Regenerate when schema, count or seed changes.
  React.useEffect(() => {
    if (!mounted) return;
    try {
      setData(generate({ schema, count }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, schema, count, seed]);

  const output = React.useMemo(() => JSON.stringify(data, null, 2), [data]);

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("JSON copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function moveField(idx: number, delta: -1 | 1) {
    setSchema((s) => {
      const next = [...s];
      const target = idx + delta;
      if (target < 0 || target >= s.length) return s;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  function updateField(id: string, patch: Partial<FieldSpec>) {
    setSchema((s) => s.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removeField(id: string) {
    setSchema((s) => s.filter((f) => f.id !== id));
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const grouped = React.useMemo(() => {
    const groups: Record<string, typeof FIELD_TYPE_META> = {};
    for (const meta of FIELD_TYPE_META) {
      groups[meta.group] = groups[meta.group] ?? [];
      groups[meta.group].push(meta);
    }
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Generator summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Records" value={data.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Fields" value={schema.length} reduceMotion={!!reduceMotion} />
          <Stat label="JSON bytes" value={output.length} reduceMotion={!!reduceMotion} />
          <Stat label="Field types" value={FIELD_TYPE_META.length} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Schema */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Schema
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => setSchema([...schema, newField()])}>
              <Plus className="size-3.5" />
              Field
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSchema(DEFAULT_SCHEMA)}
            >
              <Eraser className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {schema.map((f, i) => (
            <div
              key={f.id}
              className="grid items-center gap-2 rounded-xl border border-border/60 bg-background p-2 sm:grid-cols-[1fr_220px_160px_auto]"
            >
              <div className="space-y-0.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Field name</Label>
                <Input
                  value={f.name}
                  onChange={(e) => updateField(f.id, { name: e.target.value })}
                  placeholder="email"
                  className="h-8 font-mono"
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</Label>
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
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {f.type === "integer" || f.type === "float" ? "Min / max" : f.type === "lorem" ? "Sentences" : f.type === "literal" ? "Literal" : "—"}
                </Label>
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
                ) : f.type === "lorem" ? (
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={f.count ?? 1}
                    onChange={(e) => updateField(f.id, { count: parseInt(e.target.value, 10) })}
                    className="h-8 font-mono text-xs"
                  />
                ) : f.type === "literal" ? (
                  <Input
                    value={f.literal ?? ""}
                    onChange={(e) => updateField(f.id, { literal: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                ) : (
                  <div className="h-8 rounded-md border border-dashed border-border bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground">
                    no options
                  </div>
                )}
              </div>
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

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Database className="size-4 text-primary" />
          Generate
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Number of records</Label>
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
          <div className="flex items-end gap-2">
            <Button type="button" onClick={() => setSeed((s) => s + 1)}>
              <RefreshCcw className="size-4" />
              Regenerate
            </Button>
          </div>
        </div>
      </section>

      {/* Output */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Database className="size-4 text-primary" />
          JSON output
        </h2>
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
            onClick={() => downloadText(output, "fake-data.json", "application/json")}
            disabled={!output}
          >
            <Download className="size-3.5" />
            Download .json
          </Button>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Database className="size-3" />
        Data is generated entirely in your browser using <code className="font-mono">crypto.getRandomValues</code>{" "}
        with rejection sampling — Toollyz has no server.
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
