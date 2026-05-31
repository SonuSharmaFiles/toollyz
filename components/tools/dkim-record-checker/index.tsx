"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Copy,
  Eraser,
  Info,
  Key,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SAMPLE_DKIM, parse } from "@/lib/tools/text/dkim-parser";

const KEY = "toollyz:dkim-input";

const SEV: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function DkimRecordChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_DKIM);
    } catch {
      setText(SAMPLE_DKIM);
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

  const errors = r.issues.filter((i) => i.severity === "error").length;
  const warnings = r.issues.filter((i) => i.severity === "warning").length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Key bits" value={r.keyBits ?? 0} reduceMotion={!!reduceMotion} accent={r.keyBits && r.keyBits >= 2048 ? "text-emerald-300" : r.keyBits && r.keyBits >= 1024 ? "text-amber-300" : "text-rose-300"} />
          <Stat label="Tags" value={r.tags.length} reduceMotion={!!reduceMotion} accent="text-sky-300" />
          <Stat label="Errors" value={errors} reduceMotion={!!reduceMotion} accent={errors ? "text-rose-300" : "text-sky-100"} />
          <Stat label="Warnings" value={warnings} reduceMotion={!!reduceMotion} accent={warnings ? "text-amber-300" : "text-sky-100"} />
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_DKIM)}
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
          Copy record
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Key className="size-4 text-primary" />
          DKIM TXT record value
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          spellCheck={false}
          placeholder='v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8...'
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <p className="text-[11px] text-muted-foreground">
          Paste the value from <code className="font-mono">selector._domainkey.example.com</code> TXT record. Multi-string TXT chunks are auto-joined.
        </p>
      </section>

      {r.issues.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <ul className="space-y-1.5 list-none">
            {r.issues.map((i, idx) => {
              const Icon = i.severity === "error" ? AlertCircle : i.severity === "warning" ? AlertTriangle : Info;
              return (
                <li key={idx} className={cn("flex items-start gap-2 rounded-lg border p-2 text-xs", SEV[i.severity])}>
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{i.message}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {r.tags.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Tags ({r.tags.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tag</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {r.tags.map((t, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono font-semibold">{t.name}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{t.value || "(empty)"}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{TAG_DOCS[t.name] ?? "—"}</td>
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
        Parsing runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

const TAG_DOCS: Record<string, string> = {
  v: "Version (must be DKIM1)",
  k: "Key type (rsa or ed25519)",
  p: "Base64 public key (empty = revoked)",
  h: "Accepted hash algorithms (colon-separated)",
  s: "Allowed service types (* or email)",
  t: "Flags (y=testing, s=strict subdomain)",
  n: "Notes (free text)",
  g: "Granularity (deprecated)",
};

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
