"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Cookie,
  Download,
  Eraser,
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
  DEFAULT_SESSION_OPTIONS,
  ENCODINGS,
  entropyOf,
  generateBatch,
  type SessionEncoding,
  type SessionOptions,
} from "@/lib/tools/text/session-id";

const STATE_KEY = "toollyz:session-state";

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

function isEncoding(s: string | null): s is SessionEncoding {
  return s === "hex" || s === "base64" || s === "base64url" || s === "alphanumeric";
}

export default function SessionIdGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [options, setOptions] = React.useState<SessionOptions>(DEFAULT_SESSION_OPTIONS);
  const [tokens, setTokens] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setOptions({
            ...DEFAULT_SESSION_OPTIONS,
            ...parsed,
            encoding: isEncoding(parsed.encoding) ? parsed.encoding : DEFAULT_SESSION_OPTIONS.encoding,
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

  // Regenerate when settings change.
  const regenerate = React.useCallback(() => {
    try {
      setTokens(generateBatch(options));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate tokens");
    }
  }, [options]);

  React.useEffect(() => {
    if (!mounted) return;
    regenerate();
  }, [mounted, regenerate]);

  const entropy = React.useMemo(() => entropyOf(options), [options]);

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

  const bandAccent =
    entropy.band === "overkill"
      ? "text-emerald-300"
      : entropy.band === "strong"
      ? "text-emerald-300"
      : entropy.band === "ok"
      ? "text-amber-300"
      : "text-rose-300";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Entropy summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Entropy</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", bandAccent)}>
              <AnimatedNumber value={entropy.bits} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40"> bits</span>
            </div>
          </div>
          <Stat label="Length" value={options.length} reduceMotion={!!reduceMotion} />
          <Stat label="Tokens" value={tokens.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Strength</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight capitalize sm:text-xl", bandAccent)}>
              {entropy.band}
            </div>
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Encoding</Label>
            <select
              value={options.encoding}
              onChange={(e) => setOptions((o) => ({ ...o, encoding: e.target.value as SessionEncoding }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {ENCODINGS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Length (chars)</Label>
            <Input
              type="number"
              min={4}
              max={256}
              value={options.length}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, length: Math.max(4, Math.min(256, n)) }));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">How many tokens</Label>
            <Input
              type="number"
              min={1}
              max={500}
              value={options.count}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, count: Math.max(1, Math.min(500, n)) }));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Prefix (optional)</Label>
            <Input
              value={options.prefix}
              onChange={(e) => setOptions((o) => ({ ...o, prefix: e.target.value }))}
              placeholder="sess_"
              className="font-mono"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {ENCODINGS.find((m) => m.id === options.encoding)?.hint}
        </p>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" onClick={regenerate}>
          <RefreshCcw className="size-4" />
          Regenerate
        </Button>
        <ToolBtn
          onClick={() => copy(tokens.join("\n"), "all")}
          icon={<Copy className="size-3.5" />}
          label={`Copy all (${tokens.length})`}
        />
        <ToolBtn
          onClick={() => downloadText(tokens.join("\n"), "session-ids.txt")}
          icon={<Download className="size-3.5" />}
          label="Download .txt"
        />
        <ToolBtn onClick={() => setOptions(DEFAULT_SESSION_OPTIONS)} icon={<Eraser className="size-3.5" />} label="Reset" />
      </div>

      {/* Tokens */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <KeyRound className="size-4 text-primary" />
          Generated tokens
        </h2>
        {tokens.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            Click Regenerate to mint tokens.
          </p>
        ) : (
          <ul className="space-y-1.5 list-none">
            {tokens.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                  {i + 1}
                </span>
                <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground/90">{t}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copy(t, `t${i}`)}
                  className="h-7 px-2"
                >
                  {copied === `t${i}` ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Shield className="size-4 text-primary" />
          Strength guide
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <strong className="text-rose-500">Weak</strong> &lt; 80 bits — easy for distributed brute-force; avoid for production.
          </li>
          <li className="flex items-start gap-1.5">
            <strong className="text-amber-500">OK</strong> 80–127 bits — fine for short-lived session tokens.
          </li>
          <li className="flex items-start gap-1.5">
            <strong className="text-emerald-500">Strong</strong> 128–255 bits — recommended default.
          </li>
          <li className="flex items-start gap-1.5">
            <strong className="text-emerald-500">Overkill</strong> ≥ 256 bits — comfortable for keys that must outlast quantum-era brute-force.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Cookie className="size-3" />
        Tokens use <code className="mx-1 rounded bg-muted px-1 font-mono">crypto.getRandomValues</code> and are
        generated entirely in your browser — Toollyz has no server.
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
      <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
    >
      {icon}
      {label}
    </button>
  );
}
