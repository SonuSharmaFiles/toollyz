"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Eraser,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  SAMPLE_HEADERS,
  analyse,
  methodLabel,
  verdictColor,
} from "@/lib/tools/text/email-headers";
import { Button } from "@/components/ui/button";

const TEXT_KEY = "toollyz:emailheaders-text";

export default function EmailHeaderAnalyzer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE_HEADERS);
    } catch {
      setText(SAMPLE_HEADERS);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  const deferred = React.useDeferredValue(text);
  const analysis = React.useMemo(() => analyse(deferred), [deferred]);

  async function copy(value: string) {
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

  const passCount = analysis.authResults.filter((r) => r.verdict === "pass").length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Hops" value={analysis.receivedChain.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Auth methods" value={analysis.authResults.length} reduceMotion={!!reduceMotion} />
          <Stat label="Passing" value={passCount} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Total transit</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              {analysis.totalTransitMs ? (
                <>
                  {Math.round(analysis.totalTransitMs / 100) / 10}
                  <span className="text-base text-sky-100/40"> s</span>
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_HEADERS)}
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
          <Mail className="size-4 text-primary" />
          Raw headers
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          spellCheck={false}
          placeholder="Paste raw email headers — View Source / Show Original in your mail client."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {(analysis.subject || analysis.from || analysis.to) && (
        <section className="grid gap-3 sm:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identifiers</h3>
            <Row label="From" value={analysis.from} onCopy={copy} />
            <Row label="To" value={analysis.to} onCopy={copy} />
            <Row label="Cc" value={analysis.cc} onCopy={copy} />
            <Row label="Reply-To" value={analysis.replyTo} onCopy={copy} />
            <Row label="Subject" value={analysis.subject} onCopy={copy} />
            <Row label="Date" value={analysis.date?.toISOString()} onCopy={copy} />
            <Row label="Message-ID" value={analysis.messageId} onCopy={copy} mono />
          </Card>

          <Card>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Authentication results
            </h3>
            {analysis.authResults.length === 0 ? (
              <p className="text-xs text-muted-foreground">No SPF / DKIM / DMARC headers detected.</p>
            ) : (
              <ul className="space-y-1.5 list-none">
                {analysis.authResults.map((r, i) => {
                  const color = verdictColor(r.verdict);
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2 text-xs",
                        color === "good" && "border-emerald-500/30 bg-emerald-500/10",
                        color === "warn" && "border-amber-500/30 bg-amber-500/10",
                        color === "bad" && "border-rose-500/30 bg-rose-500/10",
                        color === "neutral" && "border-border/60 bg-background",
                      )}
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                        {methodLabel(r.method)}
                      </span>
                      <span className="rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[10px] uppercase dark:bg-white/10">
                        {r.verdict}
                      </span>
                      {r.domain && <span className="font-mono text-foreground/90">{r.domain}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>
      )}

      {analysis.receivedChain.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Clock className="size-4 text-primary" />
            Received chain (sender → receiver)
          </h2>
          <ol className="space-y-2 list-none">
            {analysis.receivedChain.map((hop, i) => (
              <li key={i} className="rounded-xl border border-border/60 bg-background p-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-primary">
                    {i + 1}
                  </span>
                  <span className="font-mono text-foreground/90">
                    {hop.from ? <span className="font-semibold">{hop.from}</span> : "?"} →{" "}
                    {hop.by ? <span className="font-semibold">{hop.by}</span> : "?"}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {hop.with ?? "—"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  {hop.date && <span>{hop.date.toISOString()}</span>}
                  {typeof hop.latencyMs === "number" && (
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      +{(hop.latencyMs / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold tracking-tight">All headers ({analysis.headers.length})</h2>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60">
          <table className="w-full border-collapse text-xs">
            <tbody>
              {analysis.headers.map((h, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td className="px-3 py-1 font-mono font-semibold align-top w-1/3">{h.rawName}</td>
                  <td className="px-3 py-1 font-mono break-all">{h.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Mail className="size-3" />
        Parsing runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border/70 bg-card p-4">{children}</div>;
}

function Row({
  label,
  value,
  mono,
  onCopy,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  onCopy: (v: string) => void;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 border-t border-border/40 py-1.5 first:border-t-0 text-xs">
      <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("flex-1 break-all", mono && "font-mono")}>{value}</span>
      <Button type="button" size="sm" variant="ghost" onClick={() => onCopy(value)} className="h-6 px-2">
        <Check className="size-3 opacity-0" />
      </Button>
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
