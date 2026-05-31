"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Cog,
  Copy,
  Eraser,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_BUILDER_STATE,
  FIELDS_META,
  build,
  listValues,
  toggleListValue,
  withField,
  type BuilderState,
  type FieldMode,
  type FieldMeta,
} from "@/lib/tools/text/cron-builder";
import { describe, nextRuns } from "@/lib/tools/text/cron-translator";

const KEY = "toollyz:cron-builder-state";

export default function CronJobExpressionGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<BuilderState>(DEFAULT_BUILDER_STATE);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setState({ ...DEFAULT_BUILDER_STATE, ...parsed });
        }
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  const result = React.useMemo(() => build(state), [state]);
  const description = React.useMemo(() => describe(result.parsed), [result.parsed]);
  const next = React.useMemo(() => (result.parsed.ok ? nextRuns(result.parsed, 5) : []), [result.parsed]);

  async function copy(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

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
      {/* Hero */}
      <section
        aria-label="Cron builder summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative space-y-2">
          <div className="text-xs font-medium text-sky-300/70">Generated expression</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="break-all rounded-lg bg-black/30 px-3 py-1.5 font-mono text-xl text-emerald-300 sm:text-2xl">
              {result.expression}
            </code>
            <Button type="button" size="sm" onClick={() => copy(result.expression)}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
          </div>
          <div className="text-sm text-sky-100/80">{description || "—"}</div>
        </div>
      </section>

      {/* Field builders */}
      <div className="grid gap-3 lg:grid-cols-2">
        {FIELDS_META.map((meta) => (
          <FieldBuilder
            key={meta.id}
            meta={meta}
            state={state[meta.id]}
            onPatch={(patch) => setState((s) => withField(s, meta.id, patch))}
          />
        ))}
      </div>

      {/* Reset */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setState(DEFAULT_BUILDER_STATE)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3.5" />
          Reset to every-minute
        </button>
      </div>

      {/* Next runs */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Clock className="size-4 text-primary" />
          Next {next.length} run{next.length === 1 ? "" : "s"}
        </h2>
        {next.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            Adjust the fields above to see future run times.
          </div>
        ) : (
          <ul className="space-y-1.5 list-none">
            {next.map((n, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-mono">
                    {new Intl.DateTimeFormat(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(n.date)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{n.relative}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Cog className="size-3" />
        Cron generation and run prediction happen entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function FieldBuilder({
  meta,
  state,
  onPatch,
}: {
  meta: FieldMeta;
  state: BuilderState["minute"];
  onPatch: (patch: Partial<BuilderState["minute"]>) => void;
}) {
  const selectedListValues = listValues(state.list);
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          {meta.label}
        </h2>
        <span className="text-[10px] text-muted-foreground">
          {meta.min}–{meta.max}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">{meta.hint}</p>

      <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
        {(["every", "list", "range", "step"] as FieldMode[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={state.mode === m}
            onClick={() => onPatch({ mode: m })}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              state.mode === m ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {state.mode === "list" && (
        <div className="space-y-2">
          {meta.optionLabels ? (
            <div className="flex flex-wrap gap-1">
              {meta.optionLabels.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={selectedListValues.includes(o.value)}
                  onClick={() => onPatch({ list: toggleListValue(state.list, o.value) })}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    selectedListValues.includes(o.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/80 hover:bg-muted",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : (
            <Input
              value={state.list}
              onChange={(e) => onPatch({ list: e.target.value })}
              placeholder={`e.g. ${meta.min}, ${meta.min + 1}, ${Math.max(meta.min + 2, meta.min)}`}
              className="font-mono"
            />
          )}
          <p className="text-[10px] text-muted-foreground">Pick one or more values. Comma-separated.</p>
        </div>
      )}

      {state.mode === "range" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">From</Label>
            <Input
              type="number"
              min={meta.min}
              max={meta.max}
              value={state.rangeStart}
              onChange={(e) => onPatch({ rangeStart: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">To</Label>
            <Input
              type="number"
              min={meta.min}
              max={meta.max}
              value={state.rangeEnd}
              onChange={(e) => onPatch({ rangeEnd: e.target.value })}
              className="font-mono"
            />
          </div>
        </div>
      )}

      {state.mode === "step" && (
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Every N</Label>
          <Input
            type="number"
            min={1}
            max={meta.max}
            value={state.step}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (Number.isFinite(n)) onPatch({ step: Math.max(1, Math.min(meta.max, n)) });
            }}
            className="font-mono"
          />
        </div>
      )}
    </section>
  );
}
