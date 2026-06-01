"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Copy,
  Eraser,
  Globe,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HEADERS_CDN, fingerprint } from "@/lib/tools/text/cdn-fingerprint";

const KEY = "toollyz:cdn-checker-input";

export default function CdnChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_HEADERS_CDN);
    } catch {
      setText(SAMPLE_HEADERS_CDN);
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
  const r = React.useMemo(() => fingerprint(deferred), [deferred]);

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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Detected</div>
            <div className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl">
              {r.hits.length > 0 ? r.hits[0].name : "Unknown / origin"}
            </div>
            {r.hits.length > 0 && (
              <div className="text-[11px] font-mono text-sky-300/80">{r.hits[0].evidence}</div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Signature headers</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-emerald-300 sm:text-3xl">
              <AnimatedNumber
                value={r.byHeader.filter((h) => h.isSignature).length}
                reduceMotion={!!reduceMotion}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_HEADERS_CDN)}
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
          <Globe className="size-4 text-primary" />
          HTTP response headers
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste the response from `curl -I https://example.com`."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {r.hits.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Matches ({r.hits.length})</h2>
          <ul className="space-y-1.5 list-none">
            {r.hits.map((h, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2 text-xs",
                  h.confidence === "high"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : h.confidence === "medium"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                )}
              >
                <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[10px] uppercase dark:bg-white/10">
                  {h.confidence}
                </span>
                <span>
                  <span className="font-semibold">{h.name}</span> — {h.evidence}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.byHeader.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">All headers ({r.byHeader.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Header</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">Signature</th>
                </tr>
              </thead>
              <tbody>
                {r.byHeader.map((h, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono">{h.name}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{h.value}</td>
                    <td className="px-3 py-1.5">
                      {h.isSignature && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                          CDN
                        </span>
                      )}
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
          Signatures we recognise
        </h2>
        <ul className="grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2 list-none">
          <li>Cloudflare — cf-ray, cf-cache-status</li>
          <li>Fastly — x-served-by (cache-…)</li>
          <li>AWS CloudFront — x-amz-cf-id, via cloudfront</li>
          <li>Akamai — x-akamai-* headers</li>
          <li>Vercel — x-vercel-id, x-vercel-cache</li>
          <li>Netlify — x-nf-request-id, server: Netlify</li>
          <li>GitHub Pages — x-github-request-id</li>
          <li>Bunny CDN — server: BunnyCDN, cdn-pullzone</li>
          <li>Imperva (Incapsula) — x-iinfo</li>
          <li>Sucuri — server: Sucuri/CloudProxy</li>
          <li>Google Cloud CDN — via google-fe</li>
          <li>Azure CDN / Front Door — x-msedge-ref, x-azure-ref</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Fingerprinting runs entirely in your browser — we never fetch the URL.
      </p>
    </div>
  );
}
