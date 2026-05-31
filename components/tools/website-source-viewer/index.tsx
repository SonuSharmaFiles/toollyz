"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Code,
  Copy,
  Eraser,
  FileCode2,
  Image as ImageIcon,
  Link as LinkIcon,
  ListTree,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_HTML, analyse } from "@/lib/tools/text/source-viewer";

const KEY = "toollyz:source-viewer";

type Tab = "source" | "outline" | "scripts" | "styles" | "links" | "images" | "metas";

export default function WebsiteSourceViewer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("source");

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
  const result = React.useMemo(() => analyse(deferred), [deferred]);

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-3 gap-4 sm:grid-cols-6">
          <Stat label="Elements" value={result.totals.elements} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Scripts" value={result.totals.scripts} reduceMotion={!!reduceMotion} accent="text-sky-300" />
          <Stat label="Styles" value={result.totals.styles} reduceMotion={!!reduceMotion} accent="text-violet-300" />
          <Stat label="Images" value={result.totals.images} reduceMotion={!!reduceMotion} accent="text-amber-300" />
          <Stat label="Links" value={result.totals.links} reduceMotion={!!reduceMotion} accent="text-rose-300" />
          <Stat label="iframes" value={result.totals.iframes} reduceMotion={!!reduceMotion} accent="text-cyan-300" />
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

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <FileCode2 className="size-4 text-primary" />
          Page HTML
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste any page's HTML — even partial fragments work."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "source", label: "Source", icon: Code },
              { id: "outline", label: "Outline", icon: ListTree },
              { id: "scripts", label: "Scripts", icon: FileCode2 },
              { id: "styles", label: "Styles", icon: FileCode2 },
              { id: "links", label: "Links", icon: LinkIcon },
              { id: "images", label: "Images", icon: ImageIcon },
              { id: "metas", label: "Meta", icon: Sparkles },
            ] as { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium",
                tab === id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "source" && (
          <div className="relative">
            <pre className="max-h-[480px] overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px]">
              {result.pretty}
            </pre>
            <div className="absolute right-2 top-2">
              <Button type="button" size="sm" variant="outline" onClick={() => copy(result.pretty)}>
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>
          </div>
        )}

        {tab === "outline" && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
            {result.outline.length === 0 && <div className="text-muted-foreground">No headings.</div>}
            <ul className="space-y-1 list-none">
              {result.outline.map((h, i) => (
                <li key={i} style={{ paddingLeft: `${(h.level - 1) * 16}px` }} className="flex items-baseline gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">H{h.level}</span>
                  <span>{h.text || <span className="text-muted-foreground/60">(empty)</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "scripts" && (
          <Table
            head={["#", "Kind", "src / bytes", "type"]}
            rows={result.scripts.map((s, i) => [
              String(i + 1),
              s.inline ? "inline" : "external",
              s.inline ? `${s.bytes.toLocaleString()} bytes` : (s.src ?? ""),
              s.type ?? "",
            ])}
          />
        )}

        {tab === "styles" && (
          <Table
            head={["#", "Kind", "href / bytes"]}
            rows={result.styles.map((s, i) => [
              String(i + 1),
              s.inline ? "inline" : "external",
              s.inline ? `${s.bytes.toLocaleString()} bytes` : (s.href ?? ""),
            ])}
          />
        )}

        {tab === "links" && (
          <Table
            head={["#", "Text", "href", "rel"]}
            rows={result.links.map((l, i) => [String(i + 1), l.text, l.href, l.rel ?? ""])}
          />
        )}

        {tab === "images" && (
          <Table
            head={["#", "src", "alt", "Dimensions"]}
            rows={result.images.map((img, i) => [
              String(i + 1),
              img.src,
              img.alt ?? "",
              [img.width, img.height].filter(Boolean).join("×") || "—",
            ])}
          />
        )}

        {tab === "metas" && (
          <Table
            head={["#", "Name / property", "Content"]}
            rows={result.metas.map((m, i) => [String(i + 1), m.name, m.content])}
          />
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Parsing and analysis run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Nothing to show.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/40">
              {r.map((c, j) => (
                <td key={j} className={cn("px-3 py-1.5 font-mono break-all", j === 0 && "text-muted-foreground")}>
                  {c || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
