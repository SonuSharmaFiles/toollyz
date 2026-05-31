"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eye,
  Key,
  KeyRound,
  Lock,
  RefreshCcw,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  ALG_OPTIONS,
  DEFAULT_CLAIMS,
  DEFAULT_SIGN_OPTIONS,
  build,
  inspectClaims,
  parseJsonSafely,
  pretty,
  type HmacAlg,
  type JwtClaims,
  type SignOptions,
} from "@/lib/tools/text/jwt-gen";

const CLAIMS_KEY = "toollyz:jwt-claims";
const ALG_KEY = "toollyz:jwt-alg";
const SECRET_KEY = "toollyz:jwt-secret";
const B64_KEY = "toollyz:jwt-secret-b64";

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isAlg(s: string | null): s is HmacAlg {
  return s === "HS256" || s === "HS384" || s === "HS512";
}

export default function JwtGeneratorTool() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [claimsText, setClaimsText] = React.useState(pretty(DEFAULT_CLAIMS));
  const [alg, setAlg] = React.useState<HmacAlg>(DEFAULT_SIGN_OPTIONS.alg);
  const [secret, setSecret] = React.useState(DEFAULT_SIGN_OPTIONS.secret);
  const [secretIsBase64Url, setSecretIsBase64Url] = React.useState(DEFAULT_SIGN_OPTIONS.secretIsBase64Url);
  const [jwt, setJwt] = React.useState("");
  const [signing, setSigning] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [signError, setSignError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setClaimsText(localStorage.getItem(CLAIMS_KEY) ?? pretty(DEFAULT_CLAIMS));
      const a = localStorage.getItem(ALG_KEY);
      if (isAlg(a)) setAlg(a);
      setSecret(localStorage.getItem(SECRET_KEY) ?? DEFAULT_SIGN_OPTIONS.secret);
      setSecretIsBase64Url(localStorage.getItem(B64_KEY) === "true");
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CLAIMS_KEY, claimsText);
      localStorage.setItem(ALG_KEY, alg);
      localStorage.setItem(SECRET_KEY, secret);
      localStorage.setItem(B64_KEY, String(secretIsBase64Url));
    } catch {
      /* noop */
    }
  }, [claimsText, alg, secret, secretIsBase64Url, mounted]);

  const parsedClaims = React.useMemo(() => parseJsonSafely<JwtClaims>(claimsText, DEFAULT_CLAIMS), [claimsText]);
  const claimsValid = parsedClaims.ok;
  const claimRows = claimsValid ? inspectClaims(parsedClaims.value) : [];

  const regenerate = React.useCallback(async () => {
    if (!claimsValid) {
      setJwt("");
      setSignError(parsedClaims.ok ? null : parsedClaims.error);
      return;
    }
    setSigning(true);
    setSignError(null);
    try {
      const signOpts: SignOptions = { alg, secret, secretIsBase64Url };
      const out = await build(parsedClaims.value, signOpts);
      setJwt(out.jwt);
    } catch (e) {
      setJwt("");
      setSignError(e instanceof Error ? e.message : "Could not sign the JWT.");
    } finally {
      setSigning(false);
    }
  }, [claimsValid, parsedClaims, alg, secret, secretIsBase64Url]);

  React.useEffect(() => {
    if (!mounted) return;
    regenerate();
  }, [mounted, regenerate]);

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const parts = jwt ? jwt.split(".") : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="JWT summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="JWT bytes" value={jwt.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Claims" value={claimRows.length} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Algorithm</div>
            <div className="font-heading text-2xl font-bold tracking-tight text-sky-50 sm:text-3xl">{alg}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", signError ? "text-rose-300" : "text-emerald-300")}>
              {signing ? "Signing…" : signError ? "Error" : jwt ? "Ready" : "Idle"}
            </div>
          </div>
        </div>
      </section>

      {/* Sign settings */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <KeyRound className="size-4 text-primary" />
          Signing options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Algorithm</Label>
            <select
              value={alg}
              onChange={(e) => setAlg(e.target.value as HmacAlg)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {ALG_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium">Shared secret</Label>
            <Input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="your-256-bit-secret"
              className="font-mono"
            />
            <Toggle
              checked={secretIsBase64Url}
              onChange={setSecretIsBase64Url}
              label="Secret is base64url-encoded raw bytes"
              title="Use when you have a 32/48/64-byte key encoded as base64url."
            />
          </div>
        </div>
        <Button type="button" onClick={regenerate} disabled={!claimsValid || signing}>
          <RefreshCcw className={cn("size-4", signing && "animate-spin")} />
          {signing ? "Signing…" : "Re-sign"}
        </Button>
      </section>

      {/* Claims editor + JWT output */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Claims (JSON payload)" subtitle={claimsValid ? "valid JSON" : "invalid JSON"}>
          <textarea
            value={claimsText}
            onChange={(e) => setClaimsText(e.target.value)}
            rows={14}
            spellCheck={false}
            className={cn(
              "w-full resize-none rounded-xl border bg-background p-3 font-mono text-xs outline-none focus-visible:ring-2",
              claimsValid
                ? "border-input focus-visible:border-primary focus-visible:ring-primary/30"
                : "border-rose-500/60 focus-visible:border-rose-500 focus-visible:ring-rose-500/30",
            )}
          />
          {!claimsValid && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-3.5" />
              {parsedClaims.error}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setClaimsText(pretty(DEFAULT_CLAIMS))}
            >
              <Sparkles className="size-3.5" />
              Sample
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                if (claimsValid) setClaimsText(pretty(parsedClaims.value));
              }}
              disabled={!claimsValid}
            >
              <Eye className="size-3.5" />
              Pretty print
            </Button>
          </div>
        </Panel>

        <Panel label="Signed JWT" subtitle={`${jwt.length.toLocaleString()} bytes`}>
          {signError ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-4" />
              {signError}
            </div>
          ) : (
            <textarea
              value={jwt}
              readOnly
              rows={6}
              className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
            />
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => copy(jwt, "jwt")} disabled={!jwt}>
              {copied === "jwt" ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy JWT
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(jwt, "token.jwt")}
              disabled={!jwt}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>

          {parts.length === 3 && (
            <div className="mt-3 space-y-2 text-xs">
              <SegmentRow label="Header" color="text-rose-400" value={parts[0]} copyKey="h" copied={copied} onCopy={copy} />
              <SegmentRow label="Payload" color="text-violet-400" value={parts[1]} copyKey="p" copied={copied} onCopy={copy} />
              <SegmentRow label="Signature" color="text-sky-400" value={parts[2]} copyKey="s" copied={copied} onCopy={copy} />
            </div>
          )}
        </Panel>
      </div>

      {/* Claim inspector */}
      {claimsValid && claimRows.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Key className="size-4 text-primary" />
            Claim inspector
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Claim</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {claimRows.map((c, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-1.5 font-mono font-semibold">{c.key}</td>
                    <td className="px-3 py-1.5 font-mono break-all">{c.value}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{c.hint ?? "(custom claim)"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-1.5 font-semibold">
          <Shield className="size-3.5" />
          About signing locally
        </div>
        <p className="mt-1 opacity-90">
          Signing happens via the Web Crypto API (`crypto.subtle.sign`) entirely in your browser — your
          secret and payload never touch a server. We deliberately only offer HMAC algorithms (HS256 / HS384 /
          HS512); RS256 / ES256 require importing a real private key, and pasting one into any webpage is a
          security risk we won&apos;t encourage.
        </p>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <KeyRound className="size-3" />
        Signing happens entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function SegmentRow({
  label,
  color,
  value,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  color: string;
  value: string;
  copyKey: string;
  copied: string | null;
  onCopy: (v: string, k: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2">
      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] uppercase tracking-wider font-semibold", color)}>{label}</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onCopy(value, copyKey)}
          className="h-6 px-2 text-[10px]"
        >
          {copied === copyKey ? <Check className="size-3" /> : <Copy className="size-3" />}
          Copy
        </Button>
      </div>
      <code className={cn("mt-1 block break-all font-mono text-[11px]", color)}>{value}</code>
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

function Panel({
  label,
  subtitle,
  children,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
        {subtitle && <span className="text-xs text-muted-foreground tabular-nums">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  title?: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}
