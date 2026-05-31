"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  Hash,
  Lock,
  MessagesSquare,
  Sparkles,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DISCORD_FORMATS,
  PRESETS,
  fromLocalInputValue,
  previewFor,
  syntaxFor,
  toLocalInputValue,
  unixSeconds,
  type DiscordFormat,
} from "@/lib/tools/text/discord-timestamp";

const DATE_KEY = "toollyz:dts-date";

export default function DiscordTimestampGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [date, setDate] = React.useState<Date>(new Date());
  const [now, setNow] = React.useState(Date.now());
  const [copied, setCopied] = React.useState<DiscordFormat | "" | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(DATE_KEY);
      if (stored) {
        const d = new Date(stored);
        if (Number.isFinite(d.getTime())) {
          setDate(d);
          setMounted(true);
          return;
        }
      }
    } catch {
      /* noop */
    }
    setDate(new Date());
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(DATE_KEY, date.toISOString());
    } catch {
      /* noop */
    }
  }, [date, mounted]);

  // Tick "now" once per second so the Relative preview stays honest.
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [mounted]);

  const sec = unixSeconds(date.getTime());
  const millisDelta = date.getTime() - now;

  async function copy(value: string, key: DiscordFormat | "") {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success(`Copied ${value}`);
    } catch {
      toast.error("Could not copy");
    }
  }

  function setFromLocal(s: string) {
    const d = fromLocalInputValue(s);
    if (d) setDate(d);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const absSecAway = Math.abs(Math.round(millisDelta / 1000));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Timestamp summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Selected moment</div>
            <div className="font-heading text-lg font-bold tracking-tight text-sky-50 sm:text-xl">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(date)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {Intl.DateTimeFormat().resolvedOptions().timeZone} ·{" "}
              {millisDelta > 0 ? "in" : "ago"} {absSecAway < 60
                ? `${absSecAway}s`
                : absSecAway < 3600
                ? `${Math.round(absSecAway / 60)}m`
                : absSecAway < 86400
                ? `${Math.round(absSecAway / 3600)}h`
                : `${Math.round(absSecAway / 86400)}d`}
            </div>
          </div>
          <Stat label="Unix seconds" value={sec} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Formats</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={DISCORD_FORMATS.length} reduceMotion={!!reduceMotion} />
            </div>
          </div>
        </div>
      </section>

      {/* Date picker */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Timer className="size-4 text-primary" />
          Pick a moment
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Local date &amp; time</Label>
            <Input
              type="datetime-local"
              value={toLocalInputValue(date)}
              onChange={(e) => setFromLocal(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Unix seconds</Label>
            <Input
              type="number"
              value={Number.isFinite(sec) ? sec : 0}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setDate(new Date(n * 1000));
              }}
              className="font-mono"
              min={0}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDate(p.resolve(Date.now()))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              <Sparkles className="size-3" />
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Format cards */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <MessagesSquare className="size-4 text-primary" />
          Discord format codes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DISCORD_FORMATS.map((f) => {
            const syntax = syntaxFor(sec, f.code);
            const preview = previewFor(sec, f.code, now);
            return (
              <div
                key={f.code}
                className="rounded-2xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {f.label}
                      {f.isDefault && (
                        <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
                          default
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      :{f.code}
                    </div>
                  </div>
                  <Hash className="size-4 text-primary" />
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Discord syntax</div>
                    <code className="mt-1 block break-all rounded-md bg-muted/40 p-2 font-mono text-xs text-foreground">
                      {syntax}
                    </code>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Preview (your locale)</div>
                    <div className="mt-1 rounded-md border border-border/60 bg-background p-2 text-sm">
                      {preview}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copy(syntax, f.code)}
                    className="w-full"
                  >
                    {copied === f.code ? <Check className="size-4" /> : <Copy className="size-4" />}
                    Copy syntax
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Clock className="size-3" />
        Timestamps are composed entirely in your browser — Toollyz has no server.
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
