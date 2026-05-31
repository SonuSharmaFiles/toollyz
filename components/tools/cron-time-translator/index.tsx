"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Copy,
  Lock,
  Sparkles,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  PRESETS,
  describe,
  nextRuns,
  parseCron,
} from "@/lib/tools/text/cron-translator";

const KEY = "toollyz:cron-translator-input";

export default function CronTimeTranslator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? "*/15 * * * *");
    } catch {
      setText("*/15 * * * *");
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  // Tick "now" every 30 seconds so the relative times stay fresh.
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [mounted]);

  const parsed = React.useMemo(() => parseCron(text), [text]);
  const englishDescription = React.useMemo(() => describe(parsed), [parsed]);
  const next = React.useMemo(() => (parsed.ok ? nextRuns(parsed, 8, new Date(now)) : []), [parsed, now]);

  async function copy(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
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

  const nextDelta = next[0] ? next[0].date.getTime() - now : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Cron summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">English description</div>
            <div className={cn("font-heading text-base font-bold tracking-tight sm:text-lg", parsed.ok ? "text-sky-50" : "text-rose-300")}>
              {parsed.ok ? englishDescription || "—" : parsed.error}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-xl font-bold tracking-tight sm:text-2xl", parsed.ok ? "text-emerald-300" : "text-rose-300")}>
              {parsed.ok ? "Valid" : "Invalid"}
            </div>
          </div>
          <Stat
            label="Next runs"
            value={next.length}
            reduceMotion={!!reduceMotion}
            accent="text-amber-300"
          />
        </div>
      </section>

      {/* Input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <CalendarClock className="size-4 text-primary" />
          Cron expression
        </h2>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="*/15 * * * *"
          className="font-mono text-base"
          spellCheck={false}
        />
        <p className="text-[11px] text-muted-foreground">
          5-field (POSIX) or 6-field (with leading seconds) cron expressions. Also accepts <code className="font-mono">@yearly</code>,{" "}
          <code className="font-mono">@monthly</code>, <code className="font-mono">@weekly</code>,{" "}
          <code className="font-mono">@daily</code>, <code className="font-mono">@hourly</code>.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setText(p.expression)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              <Sparkles className="size-3" />
              {p.label}
            </button>
          ))}
        </div>
        {!parsed.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {parsed.error}
            {parsed.errorField !== undefined && (
              <span className="ml-1 font-mono">
                (field #{parsed.errorField + 1}: &quot;{parsed.fields[parsed.errorField]?.raw ?? "?"}&quot;)
              </span>
            )}
          </div>
        )}
      </section>

      {/* Field breakdown */}
      {parsed.ok && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Timer className="size-4 text-primary" />
            Per-field breakdown
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Field</th>
                  <th className="px-3 py-2 text-left">Raw</th>
                  <th className="px-3 py-2 text-left">Resolved values</th>
                  <th className="px-3 py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {parsed.fields.map((f, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono font-semibold capitalize">{f.kind.replace("-", " ")}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{f.raw}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">
                      {f.isStar ? "*" : f.values.join(", ")}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{f.values.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Next runs */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Clock className="size-4 text-primary" />
            Next {next.length} run{next.length === 1 ? "" : "s"}
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copy(text)}
          >
            <Copy className="size-3.5" />
            Copy expression
          </Button>
        </div>
        {next.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            <AlertTriangle className="size-3.5" />
            Could not compute next runs (impossible date combination or invalid expression).
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
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs text-foreground/90">
                    {new Intl.DateTimeFormat(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: parsed.fields.length === 6 ? "2-digit" : undefined,
                    }).format(n.date)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {n.relative} · <span className="font-mono">{n.iso}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {next[0] && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Times shown in your local time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone}). The next run is{" "}
            <strong>{Math.round(nextDelta / 1000)}s</strong> from now.
          </p>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CalendarClock className="size-3" />
        Cron parsing and run prediction happen entirely in your browser — Toollyz has no server.
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
