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
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  SAMPLE_PEM,
  type CertReport,
  parseCertificate,
  sha256Fingerprint,
} from "@/lib/tools/text/x509-parser";

const KEY = "toollyz:ssl-cert-input";

const SEV: Record<string, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function SslCertificateChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [fp, setFp] = React.useState<string | undefined>(undefined);

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

  React.useEffect(() => {
    if ("error" in result) {
      setFp(undefined);
      return;
    }
    let cancelled = false;
    void sha256Fingerprint(deferred).then((v) => {
      if (!cancelled) setFp(v);
    });
    return () => {
      cancelled = true;
    };
  }, [deferred, result]);

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

  const errored = "error" in result;
  const c = errored ? null : (result as CertReport);
  const days = c?.daysTillExpiry ?? 0;
  const daysColor =
    days < 0 ? "text-rose-300" : days < 30 ? "text-amber-300" : "text-emerald-300";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {c ? (
            <>
              <div className="space-y-1">
                <div className="text-xs font-medium text-sky-300/70">Days till expiry</div>
                <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", daysColor)}>
                  <AnimatedNumber value={days} reduceMotion={!!reduceMotion} />
                </div>
              </div>
              <Stat label="Bytes" value={c.bytes} reduceMotion={!!reduceMotion} accent="text-sky-300" />
              <Stat label="SAN" value={c.san.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
              <Stat label="Key bits" value={c.publicKey.rsaBits ?? 0} reduceMotion={!!reduceMotion} accent={(c.publicKey.rsaBits ?? 0) >= 2048 ? "text-emerald-300" : "text-amber-300"} />
            </>
          ) : (
            <div className="font-heading text-lg font-bold text-rose-300 sm:col-span-4">
              {(result as { error: string }).error}
            </div>
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
          Sample (DigiCert root)
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
          Copy PEM
        </Button>
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
          Get a PEM from the command line: <code className="font-mono">openssl s_client -connect example.com:443 -servername example.com {"<"}/dev/null 2{">"}/dev/null | openssl x509</code>
        </p>
      </section>

      {c && (
        <>
          {c.issues.length > 0 && (
            <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
              <ul className="space-y-1.5 list-none">
                {c.issues.map((i, idx) => {
                  const Icon =
                    i.severity === "error"
                      ? AlertCircle
                      : i.severity === "warning"
                      ? AlertTriangle
                      : i.severity === "ok"
                      ? CheckCircle2
                      : Info;
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

          <section className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 text-xs">
            <KV label="Version" value={`v${c.version}`} />
            <KV label="Serial" value={c.serialHex} />
            <KV label="Signature algo" value={c.signatureAlgorithm} />
            <KV label="Subject" value={c.subject.name} />
            <KV label="Issuer" value={c.issuer.name} />
            <KV label="Not before" value={c.notBefore?.toUTCString()} />
            <KV label="Not after" value={c.notAfter?.toUTCString()} />
            <KV label="Public key" value={`${c.publicKey.algorithm}${c.publicKey.rsaBits ? ` ${c.publicKey.rsaBits}-bit` : ""}${c.publicKey.ecCurve ? ` ${c.publicKey.ecCurve}` : ""}`} />
            <KV label="Is CA" value={c.isCa ? "yes" : "no"} />
            {c.keyUsage.length > 0 && <KV label="Key usage" value={c.keyUsage.join(", ")} />}
            {c.extendedKeyUsage.length > 0 && <KV label="Extended key usage" value={c.extendedKeyUsage.join(", ")} />}
            {fp && <KV label="SHA-256 fingerprint" value={fp} />}
          </section>

          {c.san.length > 0 && (
            <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="text-sm font-semibold tracking-tight">Subject Alternative Names ({c.san.length})</h2>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Kind</th>
                      <th className="px-3 py-2 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.san.map((s, i) => (
                      <tr key={i} className="border-t border-border/40">
                        <td className="px-3 py-1.5 font-mono">{s.kind}</td>
                        <td className="px-3 py-1.5 font-mono break-all">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        DER decoding, ASN.1 walk, and SHA-256 all run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="w-40 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="break-all font-mono">{value}</span>
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
