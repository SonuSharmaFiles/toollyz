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
  Link as LinkIcon,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { type LinkCategory, SAMPLE_HTML, audit } from "@/lib/tools/text/broken-links";

const KEY = "toollyz:broken-links-input";

const CATEGORY_BADGE: Record<LinkCategory, string> = {
  empty: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  placeholder: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  whitespace: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  invalid: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "mixed-content": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "missing-noopener": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "tracking-params": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const CATEGORY_LABEL: Record<LinkCategory, string> = {
  empty: "empty",
  placeholder: "placeholder",
  whitespace: "whitespace",
  invalid: "invalid",
  "mixed-content": "mixed-content",
  "missing-noopener": "missing noopener",
  "tracking-params": "tracking-params",
  ok: "ok",
};

export default function BrokenLinkChecker() {
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
  const r = React.useMemo(() => audit(deferred), [deferred]);

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

  const broken = r.summary.empty + r.summary.placeholder + r.summary.whitespace + r.summary.invalid;
  const warnings = r.summary["mixed-content"] + r.summary["missing-noopener"];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,63,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total links" value={r.totalLinks} reduceMotion={!!reduceMotion} accent="text-sky-300" />
          <Stat label="Broken" value={broken} reduceMotion={!!reduceMotion} accent={broken ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings ? "text-amber-300" : "text-sky-100"} />
          <Stat label="Unique" value={r.uniqueHrefs} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
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
          <LinkIcon className="size-4 text-primary" />
          Page HTML
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste a page's HTML — anchors, scripts, stylesheets, images, iframes are all audited."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {r.notes.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <ul className="space-y-1.5 list-none">
            {r.notes.map((n, i) => (
              <li key={i} className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mr-1 inline size-3.5" />
                {n}
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.links.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Anchors ({r.totalLinks})</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Text</th>
                  <th className="px-3 py-2 text-left">href</th>
                  <th className="px-3 py-2 text-left">Categories</th>
                </tr>
              </thead>
              <tbody>
                {r.links.map((l) => (
                  <tr key={l.index} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{l.index}</td>
                    <td className="px-3 py-1.5">{l.text || <span className="text-muted-foreground/60">(empty text)</span>}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{l.href || <span className="text-rose-500">(empty)</span>}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {l.categories.map((c, i) => (
                          <span key={i} className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono", CATEGORY_BADGE[c])}>
                            {c === "ok" ? (
                              <CheckCircle2 className="size-3" />
                            ) : c === "tracking-params" ? (
                              <Info className="size-3" />
                            ) : c === "missing-noopener" || c === "mixed-content" || c === "whitespace" ? (
                              <AlertTriangle className="size-3" />
                            ) : (
                              <AlertCircle className="size-3" />
                            )}
                            {CATEGORY_LABEL[c]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {r.resources.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Resources ({r.resources.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Kind</th>
                  <th className="px-3 py-2 text-left">URL</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {r.resources.map((res, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono">{res.kind}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{res.href || <span className="text-rose-500">(empty)</span>}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {res.categories.map((c, ci) => (
                          <span key={ci} className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono", CATEGORY_BADGE[c])}>
                            {CATEGORY_LABEL[c]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        We never fetch URLs — we only inspect the markup you paste. To verify each URL responds, use a server-side crawler.
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
