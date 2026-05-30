"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  COMMON_TIMEZONES,
  formatAll,
  formatInTimezone,
  parseTimestamp,
  type Unit,
} from "@/lib/tools/time/timestamp";

const STORAGE_KEY = "toollyz:timestamp-input";

export default function UnixTimestampConverter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const [unit, setUnit] = React.useState<Unit | "auto">("auto");
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    setMounted(true);
    try {
      const r = localStorage.getItem(STORAGE_KEY);
      if (r) setRaw(r);
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      /* noop */
    }
  }, [raw, mounted]);

  const parsed = React.useMemo(() => parseTimestamp(raw || String(Math.floor(now.getTime() / 1000)), unit), [raw, unit, now]);

  // Avoid re-running formatAll every tick for empty input — keep stable date.
  const targetDate = raw.trim() ? parsed.date : now;
  const formats = targetDate ? formatAll(targetDate, now) : null;

  async function copy(text: string, what = "Value") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  function fillNow() {
    setRaw(String(Math.floor(now.getTime() / 1000)));
    toast.success("Filled with current epoch (seconds)");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live hero */}
      <section
        aria-label="Current time"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2 text-xs text-indigo-300/80">
            <Clock className="size-3.5" />
            <span>Now (this device)</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Epoch seconds" mono>
              <AnimatedNumber value={Math.floor(now.getTime() / 1000)} reduceMotion={!!reduceMotion} duration={250} />
            </Field>
            <Field label="Epoch milliseconds" mono>
              {now.getTime().toLocaleString()}
            </Field>
            <Field label="ISO 8601" mono>
              {now.toISOString()}
            </Field>
            <Field label="UTC" mono>
              {now.toUTCString()}
            </Field>
          </div>
        </div>
      </section>

      {/* Input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Convert any timestamp or date
        </h2>
        <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="raw" className="text-xs font-medium">
              Timestamp or date
            </Label>
            <Input
              id="raw"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="1748528823, 1748528823000, or 2026-05-30T14:00:00Z"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit" className="text-xs font-medium">
              Unit
            </Label>
            <Select value={unit} onValueChange={(v) => v && setUnit(v as Unit | "auto")}>
              <SelectTrigger id="unit" className="w-full sm:w-48 justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto detect</SelectItem>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="milliseconds">Milliseconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={fillNow}>
              <RefreshCcw className="size-3.5" />
              Now
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRaw("")}>
              Clear
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Accepts <code className="font-mono">unix seconds</code>, <code className="font-mono">unix milliseconds</code>, <code className="font-mono">ISO 8601</code> and most relaxed date strings (Date.parse).
        </p>
        {!parsed.ok && raw && (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            {parsed.error}
          </p>
        )}
        {parsed.detectedUnit && raw && (
          <p className="text-[11px] text-muted-foreground">
            Detected unit: <strong>{parsed.detectedUnit}</strong>.
          </p>
        )}
      </section>

      {/* Results */}
      {formats && (
        <Tabs defaultValue="formats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
            <TabsTrigger value="formats">Formats</TabsTrigger>
            <TabsTrigger value="timezones">Timezones</TabsTrigger>
          </TabsList>
          <TabsContent value="formats" className="mt-4 space-y-2">
            <Row label="Epoch seconds" value={String(formats.epochSec)} onCopy={() => copy(String(formats.epochSec), "Epoch seconds")} />
            <Row label="Epoch milliseconds" value={String(formats.epochMs)} onCopy={() => copy(String(formats.epochMs), "Epoch ms")} />
            <Row label="ISO 8601" value={formats.iso} onCopy={() => copy(formats.iso, "ISO")} />
            <Row label="UTC (toUTCString)" value={formats.utc} onCopy={() => copy(formats.utc, "UTC")} />
            <Row label="Local" value={formats.localReadable} onCopy={() => copy(formats.localReadable, "Local time")} />
            <Row label="Local (short)" value={formats.localShort} onCopy={() => copy(formats.localShort, "Local short")} />
            <Row label="UTC readable" value={formats.utcReadable} onCopy={() => copy(formats.utcReadable, "UTC readable")} />
            <Row label="RFC 2822" value={formats.rfc2822} onCopy={() => copy(formats.rfc2822, "RFC 2822")} />
            <Row label="Date only" value={formats.dateOnly} onCopy={() => copy(formats.dateOnly, "Date")} />
            <Row label="Time only" value={formats.timeOnly} onCopy={() => copy(formats.timeOnly, "Time")} />
            <Row label="Weekday · Month · Day-of-year · ISO week" value={`${formats.weekday} · ${formats.monthName} · day ${formats.yearDay} · week ${formats.weekNumber}`} />
            <Row label="Relative" value={formats.relative} />
            <Row label="Local timezone" value={formats.timezone} onCopy={() => copy(formats.timezone, "Timezone")} />
          </TabsContent>
          <TabsContent value="timezones" className="mt-4 space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Same moment, expressed in popular timezones. Times use your browser&apos;s Intl APIs — accurate to the IANA tz database it ships with.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {COMMON_TIMEZONES.map((tz) => (
                <Row
                  key={tz}
                  label={tz}
                  value={targetDate ? formatInTimezone(targetDate, tz) : "—"}
                  icon={<Globe className="size-3 text-muted-foreground" />}
                  onCopy={() => copy(targetDate ? formatInTimezone(targetDate, tz) : "", tz)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Clock className="mt-0.5 size-3.5 shrink-0 text-primary" />Auto unit detection treats 10-digit and shorter integers as seconds, 13-digit positive integers as milliseconds.</li>
          <li className="flex items-start gap-1.5"><Globe className="mt-0.5 size-3.5 shrink-0 text-primary" />Timezone formatting uses your browser&apos;s built-in IANA tz database — leap-second handling matches the OS.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Date.parse handles most ISO 8601 and RFC 2822 strings — non-standard formats may parse incorrectly per ECMA-262.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — everything runs in your browser. The current draft is saved locally.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Runs entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Field({ label, mono, children }: { label: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-medium uppercase tracking-wider text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-lg font-semibold tabular-nums text-indigo-50 sm:text-xl", mono && "font-mono")}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, onCopy, icon }: { label: string; value: string; onCopy?: () => void; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2.5 text-sm">
      <div className="flex w-40 shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="min-w-0 flex-1 break-all font-mono text-[12px]">{value}</span>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-3.5" />
        </button>
      )}
    </div>
  );
}
