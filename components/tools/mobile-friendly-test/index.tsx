"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eraser,
  Info,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HTML, analyse } from "@/lib/tools/text/mobile-friendly";

const KEY = "toollyz:mobile-friendly-input";

const SEV: Record<string, string> = {
  fail: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function MobileFriendlyTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_HTML);
    } catch {
      setText(SAMPLE_HTML);
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
  const r = React.useMemo(() => analyse(deferred), [deferred]);

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

  const fails = r.checks.filter((c) => c.status === "fail").length;
  const warns = r.checks.filter((c) => c.status === "warn").length;
  const scoreColor = r.score >= 85 ? "text-emerald-300" : r.score >= 60 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Mobile score</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", scoreColor)}>
              <AnimatedNumber value={r.score} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">/100</span>
            </div>
          </div>
          <Stat label="Errors" value={fails} reduceMotion={!!reduceMotion} accent={fails ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warns} reduceMotion={!!reduceMotion} accent={warns ? "text-amber-300" : "text-sky-100"} />
          <Stat label="Small taps" value={r.summary.smallTapTargets} reduceMotion={!!reduceMotion} accent={r.summary.smallTapTargets ? "text-amber-300" : "text-sky-100"} />
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_HTML)}
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
          <Smartphone className="size-4 text-primary" />
          Page HTML
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste a page's HTML — head is enough for viewport / font-size checks."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {r.checks.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <ul className="space-y-1.5 list-none">
            {r.checks.map((c, i) => {
              const Icon =
                c.status === "fail"
                  ? AlertCircle
                  : c.status === "warn"
                  ? AlertTriangle
                  : c.status === "ok"
                  ? CheckCircle2
                  : Info;
              return (
                <li key={i} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV[c.status])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <span className="font-semibold">{c.label}</span> — {c.message}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          What we check
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li>Viewport meta + width=device-width</li>
          <li>User-scalable / maximum-scale (accessibility)</li>
          <li>Tap targets under 44×44 px (Apple HIG)</li>
          <li>Inline font-size under 12px</li>
          <li>Fixed-width containers wider than 360px</li>
          <li>Large images without max-width: 100%</li>
          <li>Plugin content (Flash, Java, applet)</li>
          <li>Body font size hints</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Audit runs entirely in your browser — Toollyz has no server. We check the HTML you paste; we don&apos;t fetch the URL itself.
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
