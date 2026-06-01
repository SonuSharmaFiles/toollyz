"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  Eraser,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_CURL, parse } from "@/lib/tools/text/redirect-chain";

const KEY = "toollyz:redirect-chain-input";

const SEV: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function RedirectChainChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_CURL);
    } catch {
      setText(SAMPLE_CURL);
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
  const r = React.useMemo(() => parse(deferred), [deferred]);

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

  const errors = r.hops.reduce((s, h) => s + h.notes.filter((n) => n.severity === "error").length, 0);
  const warnings = r.hops.reduce((s, h) => s + h.notes.filter((n) => n.severity === "warning").length, 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Hops" value={r.hops.length} reduceMotion={!!reduceMotion} accent={r.hops.length > 5 ? "text-amber-300" : "text-emerald-300"} />
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings ? "text-amber-300" : "text-sky-100"} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Final status</div>
            <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", r.finalStatus && r.finalStatus < 300 ? "text-emerald-300" : "text-rose-300")}>
              {r.finalStatus ?? "—"}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_CURL)}
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
          <ArrowRight className="size-4 text-primary" />
          curl -IL output (or any HTTP response chain)
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste the output of `curl -IL https://example.com`."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {r.notes.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Chain findings</h2>
          <ul className="space-y-1.5 list-none">
            {r.notes.map((n, i) => {
              const Icon = n.severity === "error" ? AlertCircle : n.severity === "warning" ? AlertTriangle : Info;
              return (
                <li key={i} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV[n.severity])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{n.message}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {r.hops.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Hops ({r.hops.length})</h2>
          <ol className="space-y-2 list-none">
            {r.hops.map((h) => (
              <li key={h.index} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                      #{h.index}
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 font-mono text-[10px] font-semibold",
                        h.status < 300
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : h.status < 400
                          ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {h.status} {h.statusText}
                    </span>
                    {h.server && <span className="font-mono text-[10px] text-muted-foreground">server: {h.server}</span>}
                  </div>
                </div>
                {h.location && (
                  <div className="mt-1 flex items-baseline gap-1.5 text-xs">
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                    <code className="break-all font-mono">{h.location}</code>
                  </div>
                )}
                {h.contentType && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    content-type: <code className="font-mono">{h.contentType}</code>
                  </div>
                )}
                {h.notes.length > 0 && (
                  <ul className="mt-2 space-y-1 list-none">
                    {h.notes.map((n, i) => (
                      <li key={i} className={cn("rounded border p-1.5 text-[11px]", SEV[n.severity])}>
                        {n.severity === "error" ? <AlertCircle className="mr-1 inline size-3" /> : n.severity === "warning" ? <AlertTriangle className="mr-1 inline size-3" /> : <Info className="mr-1 inline size-3" />}
                        {n.message}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing runs entirely in your browser — we never follow redirects ourselves.
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
