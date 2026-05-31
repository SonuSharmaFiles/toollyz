"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  BookImage,
  Eraser,
  Info,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HTML, analyse } from "@/lib/tools/text/og-preview";

const KEY = "toollyz:og-input";

export default function OpenGraphPreview() {
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
  const v = React.useMemo(() => analyse(deferred), [deferred]);
  const errors = v.issues.filter((i) => i.severity === "error").length;
  const warnings = v.issues.filter((i) => i.severity === "warning").length;
  const infos = v.issues.filter((i) => i.severity === "info").length;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const title = v.data.ogTitle ?? v.data.twitterTitle ?? v.data.title ?? "(no title)";
  const description = v.data.ogDescription ?? v.data.twitterDescription ?? v.data.description ?? "";
  const image = v.data.ogImage ?? v.data.twitterImage;
  const siteName = v.data.ogSiteName ?? v.data.canonical?.replace(/^https?:\/\//, "").split("/")[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Meta tags" value={v.data.otherMetas.length + Object.values(v.data).filter((x) => typeof x === "string").length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors > 0 ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings > 0 ? "text-amber-300" : "text-sky-100"} />
          <Stat label="Infos" value={infos} reduceMotion={!!reduceMotion} />
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
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <BookImage className="size-4 text-primary" />
          HTML &lt;head&gt; (or full page)
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste your page HTML, or just the <head> section."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Preview cards</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          <FacebookCard title={title} description={description} image={image} siteName={siteName ?? "example.com"} />
          <TwitterCard title={title} description={description} image={image} cardType={v.data.twitterCard ?? "summary_large_image"} />
          <LinkedInCard title={title} description={description} image={image} siteName={siteName ?? "example.com"} />
        </div>
      </section>

      {v.issues.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Issues</h2>
          <ul className="space-y-1.5 list-none">
            {v.issues.map((i, idx) => {
              const color =
                i.severity === "error"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : i.severity === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
              const Icon = i.severity === "error" ? AlertCircle : i.severity === "warning" ? AlertTriangle : Info;
              return (
                <li key={idx} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", color)}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <strong>{i.field}:</strong> {i.message}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold tracking-tight">All extracted meta</h2>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full border-collapse text-xs">
            <tbody>
              {Object.entries(v.data as unknown as Record<string, unknown>)
                .filter(([k, val]) => k !== "otherMetas" && typeof val === "string")
                .map(([k, val]) => (
                  <tr key={k} className="border-t border-border/40 first:border-t-0">
                    <td className="px-3 py-1 font-mono font-semibold align-top w-1/3">{k}</td>
                    <td className="px-3 py-1 font-mono break-all">{String(val)}</td>
                  </tr>
                ))}
              {v.data.otherMetas.map((m, i) => (
                <tr key={`o-${i}`} className="border-t border-border/40">
                  <td className="px-3 py-1 font-mono text-muted-foreground align-top w-1/3">{m.name}</td>
                  <td className="px-3 py-1 font-mono break-all">{m.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <BookImage className="size-3" />
        HTML parsing uses DOMParser and runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function FacebookCard({ title, description, image, siteName }: { title: string; description: string; image?: string; siteName: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="border-b border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Facebook / Meta share
      </div>
      {image ? (
        <div className="aspect-[1.91/1] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
        </div>
      ) : (
        <div className="aspect-[1.91/1] grid w-full place-items-center bg-muted text-xs text-muted-foreground">
          (no og:image)
        </div>
      )}
      <div className="space-y-1 p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{siteName}</div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}

function TwitterCard({ title, description, image, cardType }: { title: string; description: string; image?: string; cardType: string }) {
  const large = cardType === "summary_large_image";
  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="border-b border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        X / Twitter — {cardType}
      </div>
      {large ? (
        <>
          {image ? (
            <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            </div>
          ) : (
            <div className="aspect-[2/1] grid w-full place-items-center bg-muted text-xs text-muted-foreground">
              (no twitter:image)
            </div>
          )}
          <div className="space-y-1 p-3">
            <h3 className="line-clamp-1 text-sm font-semibold">{title}</h3>
            <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
          </div>
        </>
      ) : (
        <div className="flex gap-3 p-3">
          {image && (
            <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-1 text-sm font-semibold">{title}</h3>
            <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function LinkedInCard({ title, description, image, siteName }: { title: string; description: string; image?: string; siteName: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="border-b border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        LinkedIn share
      </div>
      {image ? (
        <div className="aspect-[1.91/1] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
        </div>
      ) : (
        <div className="aspect-[1.91/1] grid w-full place-items-center bg-muted text-xs text-muted-foreground">
          (no og:image)
        </div>
      )}
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{title}</h3>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{siteName}</p>
      </div>
    </article>
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
