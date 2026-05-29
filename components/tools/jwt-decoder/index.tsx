"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Braces,
  Check,
  Copy,
  FileKey,
  KeyRound,
  ListChecks,
  Lock,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { highlightJson } from "@/lib/tools/json/json-tools";
import {
  SAMPLE_JWT,
  SAMPLE_SECRET,
  STATE_LABEL,
  decodeJwt,
  humanizeClaims,
  type DecodedJwt,
} from "@/lib/tools/jwt/jwt-tools";
import { verifyHs256 } from "@/lib/tools/jwt/verify";

const TOKEN_KEY = "toollyz:jwt-token";
const JSON_TOKENS =
  "[&_.j-key]:text-sky-300 [&_.j-str]:text-emerald-300 [&_.j-num]:text-amber-300 [&_.j-bool]:text-fuchsia-300 [&_.j-null]:text-rose-300 [&_.j-pun]:text-slate-500";

type VerifyState = { status: "idle" | "pending" | "done"; ok?: boolean; error?: string };

export default function JwtDecoder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [token, setToken] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [verify, setVerify] = React.useState<VerifyState>({ status: "idle" });

  const deferred = React.useDeferredValue(token);
  const decoded: DecodedJwt = React.useMemo(() => decodeJwt(deferred), [deferred]);
  const claims = React.useMemo(() => humanizeClaims(decoded.payload), [decoded]);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      setToken(t ?? SAMPLE_JWT);
    } catch { setToken(SAMPLE_JWT); }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => { try { localStorage.setItem(TOKEN_KEY, token); } catch { /* noop */ } }, 400);
    return () => window.clearTimeout(id);
  }, [token, mounted]);
  React.useEffect(() => { setVerify({ status: "idle" }); }, [token, secret]);

  async function runVerify() {
    setVerify({ status: "pending" });
    const res = await verifyHs256(token, secret);
    setVerify({ status: "done", ok: res.ok, error: res.error });
  }
  async function copy(value: string, label: string) {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); toast.success(`${label} copied`); } catch { toast.error("Could not copy"); }
  }

  const isHs256 = decoded.alg?.toUpperCase() === "HS256";
  const state = STATE_LABEL[decoded.state];

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-muted" /><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero summary */}
      <section aria-label="Token summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(16,185,129,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroCell label="Algorithm" value={decoded.alg ?? "—"} />
          <HeroCell label="Type" value={decoded.typ ?? "—"} />
          <HeroCell label="Claims" value={String(claims.length)} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-emerald-300/70">Status</div>
            <div className={cn("flex items-center gap-1.5 font-heading text-xl font-bold sm:text-2xl", state.tone === "ok" ? "text-emerald-400" : state.tone === "bad" ? "text-rose-400" : state.tone === "warn" ? "text-amber-400" : "text-slate-300")}>
              {state.tone === "ok" ? <Check className="size-5" /> : state.tone === "bad" ? <AlertTriangle className="size-5" /> : null}{state.text}
            </div>
          </div>
        </div>
      </section>

      {/* Token input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><FileKey className="size-4 text-primary" />Encoded token</h2>
          <div className="ml-auto flex gap-1.5">
            <button type="button" onClick={() => setToken(SAMPLE_JWT)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"><Sparkles className="size-3.5" />Sample</button>
            <button type="button" onClick={() => setToken("")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"><Trash2 className="size-3.5" />Clear</button>
          </div>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          spellCheck={false}
          rows={4}
          aria-label="JWT input"
          placeholder="Paste a JSON Web Token (header.payload.signature)…"
          className="w-full resize-none rounded-xl border border-input bg-[#0b1020] p-3 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        {decoded.segments.header && (
          <div className="rounded-xl border border-border/60 bg-[#0b1020] p-3 font-mono text-[13px] leading-relaxed break-all">
            <span className="text-sky-400">{decoded.segments.header}</span>
            <span className="text-slate-500">.</span>
            <span className="text-fuchsia-400">{decoded.segments.payload}</span>
            <span className="text-slate-500">.</span>
            <span className="text-emerald-400">{decoded.segments.signature || "(no signature)"}</span>
          </div>
        )}
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Decoded entirely in your browser — your token is never uploaded.</p>

        {decoded.errors.length > 0 && (
          <div className="space-y-1 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
            {decoded.errors.map((e, i) => (<div key={i} className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" />{e}</div>))}
          </div>
        )}
        {decoded.warnings.map((w, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-sm text-amber-600 dark:text-amber-400"><AlertTriangle className="size-4 shrink-0" />{w}</div>
        ))}
      </section>

      {/* Header + payload */}
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonCard title="Header" accent="text-sky-500" icon={<Braces className="size-4" />} data={decoded.header} onCopy={() => copy(decoded.header ? JSON.stringify(decoded.header, null, 2) : "", "Header")} />
        <JsonCard title="Payload" accent="text-fuchsia-500" icon={<Braces className="size-4" />} data={decoded.payload} onCopy={() => copy(decoded.payload ? JSON.stringify(decoded.payload, null, 2) : "", "Payload")} />
      </div>

      {/* Claims */}
      {claims.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><ListChecks className="size-4 text-primary" />Claims</h2>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border/60">
                {claims.map((c) => (
                  <motion.tr key={c.key} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="align-top">
                    <td className="w-28 bg-muted/30 px-3 py-2 font-mono text-xs font-medium text-foreground/90">{c.key}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("break-all", c.isDate ? "text-foreground" : "font-mono text-xs text-foreground/90")}>{c.display}</span>
                        {c.badge && <Pill tone={c.badge.tone}>{c.badge.text}</Pill>}
                      </div>
                      {c.description && <p className="mt-0.5 text-[11px] text-muted-foreground">{c.description}</p>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Signature & verification */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><ShieldCheck className="size-4 text-primary" />Signature verification</h2>
        {decoded.signature && (
          <div className="rounded-xl border border-border/60 bg-background p-2.5 font-mono text-xs break-all text-emerald-600 dark:text-emerald-400">{decoded.signature}</div>
        )}
        {isHs256 ? (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={`HMAC secret (try "${SAMPLE_SECRET}")`} className="h-9 rounded-lg pl-8 font-mono text-sm" aria-label="HMAC secret" onKeyDown={(e) => e.key === "Enter" && runVerify()} />
              </div>
              <Button type="button" size="sm" onClick={runVerify} disabled={verify.status === "pending"}><BadgeCheck className="size-4" />{verify.status === "pending" ? "Verifying…" : "Verify HS256"}</Button>
            </div>
            {verify.status === "done" && (
              verify.error ? (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"><ShieldX className="size-4" />{verify.error}</div>
              ) : verify.ok ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"><ShieldCheck className="size-4" />Signature verified — this token was signed with that secret.</div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"><ShieldX className="size-4" />Invalid signature — the secret doesn&apos;t match.</div>
              )
            )}
            <p className="text-[11px] text-muted-foreground">The secret is used only in your browser (Web Crypto HMAC-SHA-256) and never leaves this page.</p>
          </>
        ) : (
          <p className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
            {decoded.alg === "none"
              ? "This token is unsecured (alg: none) and has no signature to verify."
              : `${decoded.alg ?? "This algorithm"} verification needs the issuer's public key, so this offline tool decodes ${decoded.alg ? `${decoded.alg} tokens` : "it"} without verifying the signature. HS256 tokens can be verified above.`}
          </p>
        )}
      </section>
    </div>
  );
}

function HeroCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-emerald-300/70">{label}</div>
      <div className="font-heading text-xl font-bold text-emerald-50 sm:text-2xl break-all">{value}</div>
    </div>
  );
}

function JsonCard({ title, accent, icon, data, onCopy }: { title: string; accent: string; icon: React.ReactNode; data: Record<string, unknown> | null; onCopy: () => void }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 p-2">
        <span className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", accent)}>{icon}{title}</span>
        <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={onCopy} disabled={!data}><Copy className="size-4" />Copy</Button>
      </div>
      <div className="max-h-[320px] overflow-auto bg-[#0b1020] p-3">
        {data ? (
          <pre className={cn("whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-slate-100", JSON_TOKENS)} dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(data, null, 2)) }} />
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Nothing to show — paste a valid token above.</p>
        )}
      </div>
    </section>
  );
}

function Pill({ tone, children }: { tone: "ok" | "warn" | "bad"; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      tone === "ok" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : tone === "warn" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400")}>
      {children}
    </span>
  );
}
