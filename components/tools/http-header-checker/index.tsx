"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eraser,
  Info,
  ListChecks,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HEADERS, analyse } from "@/lib/tools/text/http-headers";

const KEY = "toollyz:http-headers-input";

const SEV_STYLE: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function HttpHeaderChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_HEADERS);
    } catch {
      setText(SAMPLE_HEADERS);
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
  const report = React.useMemo(() => analyse(deferred), [deferred]);

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
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const { counts, findings, headers, status } = report;
  const scoreColor =
    counts.errors > 0
      ? "text-rose-300"
      : counts.warnings > 2
      ? "text-amber-300"
      : "text-emerald-300";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Headers" value={headers.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Findings" value={counts.total} reduceMotion={!!reduceMotion} accent={scoreColor} />
          <Stat label="Errors" value={counts.errors} reduceMotion={!!reduceMotion} accent={counts.errors ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={counts.warnings} reduceMotion={!!reduceMotion} accent={counts.warnings ? "text-amber-300" : "text-sky-100"} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className="font-heading text-lg font-bold tracking-tight text-sky-50 sm:text-xl">
              {status ? `${status.status} ${status.text}` : "—"}
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
        <Button type="button" size="sm" variant="ghost" onClick={() => copy(text)}>
          <Copy className="size-3.5" />
          Copy input
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ListChecks className="size-4 text-primary" />
          Raw HTTP response (or just headers)
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="HTTP/2 200 OK
Content-Type: text/html; charset=utf-8
Strict-Transport-Security: max-age=31536000; includeSubDomains
…"
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <p className="text-[11px] text-muted-foreground">
          Paste the response from <code className="font-mono">curl -I https://example.com</code> or browser DevTools — body is ignored.
        </p>
      </section>

      {findings.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <ul className="space-y-1.5 list-none">
            {findings.map((f, idx) => {
              const Icon =
                f.severity === "error"
                  ? AlertCircle
                  : f.severity === "warning"
                  ? AlertTriangle
                  : f.severity === "good"
                  ? CheckCircle2
                  : Info;
              return (
                <li key={idx} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV_STYLE[f.severity])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <code className="font-mono font-semibold">{f.header}</code> — {f.message}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {headers.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Parsed headers ({headers.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Header</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-right">Copy</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((h, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono font-semibold">{h.name}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{h.value}</td>
                    <td className="px-3 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => copy(`${h.name}: ${h.value}`)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Copy ${h.name}`}
                      >
                        <Copy className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Quick reference
        </h2>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          {[
            { name: "Strict-Transport-Security", desc: "Forces HTTPS for max-age seconds; preload it for full coverage." },
            { name: "Content-Security-Policy", desc: "Whitelist of allowed resources — your strongest XSS defence." },
            { name: "X-Frame-Options", desc: "Stops other sites embedding yours in a frame (clickjacking)." },
            { name: "X-Content-Type-Options", desc: "`nosniff` stops browsers guessing MIME from response bytes." },
            { name: "Referrer-Policy", desc: "Controls how much referrer info leaks to other sites." },
            { name: "Permissions-Policy", desc: "Disable powerful APIs (camera, mic, geo) site-wide." },
            { name: "Cache-Control", desc: "How (and how long) caches should store this response." },
            { name: "Access-Control-Allow-Origin", desc: "Which origins can read this resource via fetch." },
          ].map((h) => (
            <div key={h.name} className="rounded-lg border border-border/60 bg-background p-2">
              <code className="font-mono text-[11px] font-bold text-primary">{h.name}</code>
              <p className="mt-1 text-[11px] text-muted-foreground">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing and analysis run entirely in your browser — Toollyz has no server. Paste a response that you fetched yourself.
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
