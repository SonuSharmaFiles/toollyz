"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Copy,
  Download,
  Eraser,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_PEM, parseCertificate } from "@/lib/tools/text/x509-parser";
import { buildIcs } from "@/lib/tools/text/ics";

const KEY = "toollyz:ssl-expiry-input";

interface ReminderConfig {
  daysBefore: number;
  alarmMinutesBefore: number;
}

const DEFAULT_CONFIG: ReminderConfig = {
  daysBefore: 30,
  alarmMinutesBefore: 9 * 60, // 9 AM the day before
};

export default function SslExpiryReminder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [config, setConfig] = React.useState<ReminderConfig>(DEFAULT_CONFIG);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_PEM);
    } catch {
      setText(SAMPLE_PEM);
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

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => parseCertificate(deferred), [deferred]);

  const summary = React.useMemo(() => {
    if ("error" in result) return null;
    const subject =
      result.subject.pairs.find((p) => p.type === "CN")?.value ?? result.subject.name ?? "Certificate";
    return { subject, days: result.daysTillExpiry, expiresOn: result.notAfter };
  }, [result]);

  const reminderDate = React.useMemo(() => {
    if (!summary?.expiresOn) return null;
    const d = new Date(summary.expiresOn);
    d.setUTCDate(d.getUTCDate() - config.daysBefore);
    return d;
  }, [summary, config.daysBefore]);

  function buildAndDownload() {
    if (!summary || !summary.expiresOn || !reminderDate) {
      toast.error("Paste a valid certificate first");
      return;
    }
    const uid = `ssl-${summary.subject}-${summary.expiresOn.getTime()}@toollyz.com`;
    const ics = buildIcs([
      {
        uid,
        summary: `Renew SSL certificate — ${summary.subject}`,
        description: `Certificate expires on ${summary.expiresOn.toUTCString()}.\nRenew at least ${config.daysBefore} days before to avoid downtime.`,
        dateStart: reminderDate,
        alarmMinutesBefore: config.alarmMinutesBefore,
      },
    ]);
    downloadIcs(ics, `ssl-renew-${slugify(summary.subject)}.ics`);
    toast.success("Calendar reminder downloaded");
  }

  async function copyIcs() {
    if (!summary || !reminderDate) return;
    const uid = `ssl-${summary.subject}-${summary.expiresOn?.getTime()}@toollyz.com`;
    const ics = buildIcs([
      {
        uid,
        summary: `Renew SSL certificate — ${summary.subject}`,
        description: `Certificate expires on ${summary.expiresOn?.toUTCString()}.`,
        dateStart: reminderDate,
        alarmMinutesBefore: config.alarmMinutesBefore,
      },
    ]);
    try {
      await navigator.clipboard.writeText(ics);
      toast.success(".ics copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const errored = "error" in result;
  const days = summary?.days ?? 0;
  const daysColor =
    days < 0 ? "text-rose-300" : days < 14 ? "text-rose-300" : days < 60 ? "text-amber-300" : "text-emerald-300";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3">
          {summary ? (
            <>
              <div className="space-y-1 sm:col-span-2">
                <div className="text-xs font-medium text-sky-300/70">Subject</div>
                <div className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl break-all">
                  {summary.subject}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-sky-300/70">Days till expiry</div>
                <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", daysColor)}>
                  <AnimatedNumber value={days} reduceMotion={!!reduceMotion} />
                </div>
              </div>
            </>
          ) : errored ? (
            <div className="font-heading text-base font-bold text-rose-300 sm:col-span-3">
              {(result as { error: string }).error}
            </div>
          ) : (
            <div className="font-heading text-base text-sky-300 sm:col-span-3">Paste a PEM certificate</div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_PEM)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ShieldCheck className="size-4 text-primary" />
          PEM certificate
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="-----BEGIN CERTIFICATE-----&#10;…base64…&#10;-----END CERTIFICATE-----"
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-[10px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <p className="text-[11px] text-muted-foreground">
          Get a PEM from <code className="font-mono">openssl s_client -connect example.com:443 -servername example.com</code>.
        </p>
      </section>

      {summary && summary.expiresOn && (
        <>
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <CalendarClock className="size-4 text-primary" />
              Reminder
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs">
                <div className="font-medium text-muted-foreground">Days before expiry</div>
                <div className="flex flex-wrap gap-1.5">
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, daysBefore: d }))}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs font-mono",
                        config.daysBefore === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </label>
              <label className="space-y-1 text-xs">
                <div className="font-medium text-muted-foreground">Alarm offset</div>
                <select
                  value={config.alarmMinutesBefore}
                  onChange={(e) => setConfig((c) => ({ ...c, alarmMinutesBefore: parseInt(e.target.value, 10) }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value={60}>1 hour before</option>
                  <option value={9 * 60}>9 hours before (≈ start of workday)</option>
                  <option value={24 * 60}>1 day before</option>
                  <option value={7 * 24 * 60}>1 week before</option>
                </select>
              </label>
            </div>
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reminder lands on</div>
              <div className="mt-1 font-mono">
                {reminderDate ? reminderDate.toUTCString() : "—"}
              </div>
              <div className="mt-1 text-muted-foreground">
                Certificate expires: <span className="font-mono">{summary.expiresOn.toUTCString()}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={buildAndDownload}>
                <Download className="size-3.5" />
                Download .ics
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={copyIcs}>
                <Copy className="size-3.5" />
                Copy .ics
              </Button>
            </div>
          </section>

          <section
            className={cn(
              "rounded-2xl border p-3 text-xs",
              days < 0
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : days < 14
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : days < 60
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}
          >
            {days < 0 && <AlertTriangle className="mr-1 inline size-3.5" />}
            {days >= 0 && days < 14 && <Bell className="mr-1 inline size-3.5" />}
            {days >= 60 && <CheckCircle2 className="mr-1 inline size-3.5" />}
            {days < 0
              ? `Certificate already expired ${Math.abs(days)} days ago — renew immediately.`
              : days < 14
              ? `Only ${days} days left — renewal is overdue.`
              : days < 60
              ? `${days} days left — schedule the renewal soon.`
              : `${days} days left — comfortable runway.`}
          </section>
        </>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Cert parsing and .ics generation run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cert";
}
