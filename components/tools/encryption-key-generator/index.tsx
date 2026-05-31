"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eye,
  KeyRound,
  Lock,
  RefreshCcw,
  ShieldHalf,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  ALGORITHMS,
  DEFAULT_GENERATE_OPTIONS,
  entropyBits,
  generateKey,
  type Algorithm,
  type GeneratedKey,
  type GenerateOptions,
} from "@/lib/tools/text/encryption-key";

const STATE_KEY = "toollyz:enckey-state";

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

function isAlgorithm(s: string | null): s is Algorithm {
  return ALGORITHMS.some((a) => a.id === s);
}

export default function EncryptionKeyGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [options, setOptions] = React.useState<GenerateOptions>(DEFAULT_GENERATE_OPTIONS);
  const [key, setKey] = React.useState<GeneratedKey | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [revealPrivate, setRevealPrivate] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setOptions({
            ...DEFAULT_GENERATE_OPTIONS,
            ...parsed,
            algorithm: isAlgorithm(parsed.algorithm) ? parsed.algorithm : DEFAULT_GENERATE_OPTIONS.algorithm,
          });
        }
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [options, mounted]);

  const meta = ALGORITHMS.find((a) => a.id === options.algorithm) ?? ALGORITHMS[0];
  // When the algorithm changes, snap the param to the first valid option for it.
  React.useEffect(() => {
    if (!meta.options.includes(options.param)) {
      setOptions((o) => ({ ...o, param: meta.options[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.id]);

  async function regenerate() {
    setBusy(true);
    setError(null);
    setRevealPrivate(false);
    try {
      const k = await generateKey(options);
      setKey(k);
      toast.success("Key generated");
    } catch (e) {
      setKey(null);
      setError(e instanceof Error ? e.message : "Could not generate key");
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    if (!mounted) return;
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, options.algorithm, options.param, options.extractable]);

  async function copy(value: string | undefined, k: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(k);
      window.setTimeout(() => setCopied((c) => (c === k ? null : c)), 1200);
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

  const bits = entropyBits(options);
  const isAsymmetric = meta.family === "Asymmetric";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Key summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Algorithm</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">{meta.id}</div>
          </div>
          <Stat label="Bits / curve" value={bits} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Family</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">{meta.family}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-base font-bold tracking-tight sm:text-lg", error ? "text-rose-300" : key ? "text-emerald-300" : "text-amber-300")}>
              {busy ? "Generating…" : error ? "Error" : key ? "Ready" : "Idle"}
            </div>
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Key options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Algorithm</Label>
            <select
              value={options.algorithm}
              onChange={(e) => setOptions((o) => ({ ...o, algorithm: e.target.value as Algorithm }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {ALGORITHMS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              {options.algorithm === "HMAC" ? "Hash" : options.algorithm.startsWith("EC") ? "Curve" : "Bit length"}
            </Label>
            <select
              value={options.param}
              onChange={(e) => setOptions((o) => ({ ...o, param: e.target.value }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {meta.options.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Extractable</Label>
            <Toggle
              checked={options.extractable}
              onChange={(v) => setOptions((o) => ({ ...o, extractable: v }))}
              label="Allow exporting key material"
              title="Off = key stays in CryptoKey form only (good for production)."
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">{meta.hint}</p>
        <Button type="button" onClick={regenerate} disabled={busy}>
          <RefreshCcw className={cn("size-4", busy && "animate-spin")} />
          Regenerate
        </Button>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-4" />
          {error}
        </div>
      )}

      {/* Key output */}
      {key && options.extractable && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <KeyRound className="size-4 text-primary" />
            Key material
          </h2>
          {!isAsymmetric && key.raw ? (
            <>
              <Output label="Hex" value={key.hex} copyKey="hex" copied={copied} onCopy={copy} />
              <Output label="Base64URL" value={key.base64url} copyKey="b64" copied={copied} onCopy={copy} />
              <Output label="JWK (JSON)" value={JSON.stringify(key.jwk, null, 2)} copyKey="jwk" copied={copied} onCopy={copy} mono />
            </>
          ) : isAsymmetric && key.publicPem ? (
            <>
              <Output label="Public key (PEM)" value={key.publicPem} copyKey="pubPem" copied={copied} onCopy={copy} mono />
              <Output label="Public key (JWK)" value={JSON.stringify(key.publicJwk, null, 2)} copyKey="pubJwk" copied={copied} onCopy={copy} mono />
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-medium text-rose-500">Private key (sensitive)</Label>
                  <button
                    type="button"
                    onClick={() => setRevealPrivate((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
                  >
                    <Eye className="size-3" />
                    {revealPrivate ? "Hide" : "Reveal"}
                  </button>
                </div>
                {revealPrivate ? (
                  <>
                    <Output label="Private key (PEM)" value={key.privatePem} copyKey="privPem" copied={copied} onCopy={copy} mono />
                    <Output label="Private key (JWK)" value={JSON.stringify(key.jwk, null, 2)} copyKey="privJwk" copied={copied} onCopy={copy} mono />
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-rose-500/40 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-300">
                    Private key hidden. Click reveal only when ready to copy — never paste a private key into any website you don&apos;t trust.
                  </div>
                )}
              </div>
            </>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!isAsymmetric && key.hex && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => downloadText(JSON.stringify(key.jwk, null, 2), `${meta.id}-${options.param}.jwk.json`)}
              >
                <Download className="size-3.5" />
                Download JWK
              </Button>
            )}
            {isAsymmetric && key.privatePem && key.publicPem && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(key.publicPem!, `${meta.id}-${options.param}-public.pem`)}
                >
                  <Download className="size-3.5" />
                  public.pem
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(key.privatePem!, `${meta.id}-${options.param}-private.pem`)}
                >
                  <Download className="size-3.5" />
                  private.pem
                </Button>
              </>
            )}
          </div>
        </section>
      )}

      {!options.extractable && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs text-amber-700 dark:text-amber-300">
          <strong>Non-extractable key generated.</strong> The key exists in CryptoKey form only — Web Crypto
          will not export the bytes. This is the right setting for production: any code that needs to use the
          key must do so via crypto.subtle methods, never copying the bytes out.
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong>Honest framing:</strong> all keys are generated via the Web Crypto API
        (<code className="font-mono">crypto.subtle.generateKey</code>) entirely in your browser. Toollyz has
        no server. Treat any extracted key (especially private keys) the way you treat a password — never paste
        them into untrusted pages and never commit them to git.
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldHalf className="size-3" />
        All key generation runs entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function Output({
  label,
  value,
  copyKey,
  copied,
  onCopy,
  mono,
}: {
  label: string;
  value?: string;
  copyKey: string;
  copied: string | null;
  onCopy: (v: string | undefined, k: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium">{label}</Label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onCopy(value, copyKey)}
          className="h-7 px-2"
        >
          {copied === copyKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          Copy
        </Button>
      </div>
      <textarea
        value={value ?? ""}
        readOnly
        rows={mono ? 6 : 3}
        className={cn(
          "w-full resize-none rounded-xl border border-input bg-background p-3 text-xs outline-none",
          mono && "font-mono",
        )}
      />
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
    <label className="inline-flex h-9 items-center gap-1.5 text-xs font-medium text-muted-foreground" title={title}>
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
