"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Eraser,
  Key,
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
  DEFAULT_KEY_OPTIONS,
  TEMPLATES,
  generateBatch,
  strengthOf,
  templateToOptions,
  type Charset,
  type KeyOptions,
} from "@/lib/tools/text/api-key";

const STATE_KEY = "toollyz:apikey-state";

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

function isCharset(s: string | null): s is Charset {
  return s === "alphanumeric" || s === "hex" || s === "base64url";
}

export default function ApiKeyGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [options, setOptions] = React.useState<KeyOptions>(DEFAULT_KEY_OPTIONS);
  const [keys, setKeys] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setOptions({
            ...DEFAULT_KEY_OPTIONS,
            ...parsed,
            charset: isCharset(parsed.charset) ? parsed.charset : DEFAULT_KEY_OPTIONS.charset,
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

  const regenerate = React.useCallback(() => {
    try {
      setKeys(generateBatch(options));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate keys");
    }
  }, [options]);

  React.useEffect(() => {
    if (!mounted) return;
    regenerate();
  }, [mounted, regenerate]);

  const strength = React.useMemo(() => strengthOf(options), [options]);

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
    strength.band === "overkill"
      ? "text-emerald-300"
      : strength.band === "strong"
      ? "text-emerald-300"
      : strength.band === "ok"
      ? "text-amber-300"
      : "text-rose-300";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Strength summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Entropy</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", bandAccent)}>
              <AnimatedNumber value={strength.bits} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40"> bits</span>
            </div>
          </div>
          <Stat label="Body length" value={options.bodyLength} reduceMotion={!!reduceMotion} />
          <Stat label="Keys" value={keys.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Strength</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight capitalize sm:text-xl", bandAccent)}>
              {strength.band}
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Real-world templates
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOptions((o) => templateToOptions(t, o.count))}
              className="rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{t.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{t.charset}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{t.description}</div>
              <div className="mt-1 font-mono text-[10px] text-primary">{t.prefix}…</div>
            </button>
          ))}
        </div>
      </section>

      {/* Options */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Key className="size-4 text-primary" />
          Custom settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Prefix</Label>
            <Input
              value={options.prefix}
              onChange={(e) => setOptions((o) => ({ ...o, prefix: e.target.value }))}
              placeholder="sk_live_"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Charset</Label>
            <select
              value={options.charset}
              onChange={(e) => setOptions((o) => ({ ...o, charset: e.target.value as Charset }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              <option value="alphanumeric">Alphanumeric (a-z A-Z 0-9)</option>
              <option value="hex">Hex (0-9 a-f)</option>
              <option value="base64url">Base64 URL-safe</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Body length</Label>
            <Input
              type="number"
              min={4}
              max={128}
              value={options.bodyLength}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, bodyLength: Math.max(4, Math.min(128, n)) }));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Segments</Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={options.segments}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, segments: Math.max(1, Math.min(8, n)) }));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Separator</Label>
            <Input
              value={options.separator}
              onChange={(e) => setOptions((o) => ({ ...o, separator: e.target.value }))}
              placeholder="-"
              className="font-mono"
              maxLength={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">How many keys</Label>
            <Input
              type="number"
              min={1}
              max={200}
              value={options.count}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setOptions((o) => ({ ...o, count: Math.max(1, Math.min(200, n)) }));
              }}
              className="font-mono"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={options.uppercase}
            onChange={(v) => setOptions((o) => ({ ...o, uppercase: v }))}
            label="UPPERCASE body"
          />
          <Toggle
            checked={options.includeChecksum}
            onChange={(v) => setOptions((o) => ({ ...o, includeChecksum: v }))}
            label="Append checksum char"
            title="Adds a simple sum-mod-36 character so single-character typos can be caught client-side."
          />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" onClick={regenerate}>
          <RefreshCcw className="size-4" />
          Regenerate
        </Button>
        <ToolBtn
          onClick={() => copy(keys.join("\n"), "all")}
          icon={<Copy className="size-3.5" />}
          label={`Copy all (${keys.length})`}
        />
        <ToolBtn
          onClick={() => downloadText(keys.join("\n"), "api-keys.txt")}
          icon={<Download className="size-3.5" />}
          label="Download .txt"
        />
        <ToolBtn onClick={() => setOptions(DEFAULT_KEY_OPTIONS)} icon={<Eraser className="size-3.5" />} label="Reset" />
      </div>

      {/* Keys */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Key className="size-4 text-primary" />
          Generated keys
        </h2>
        {keys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
            Click Regenerate to mint API keys.
          </p>
        ) : (
          <ul className="space-y-1.5 list-none">
            {keys.map((k, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                  {i + 1}
                </span>
                <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground/90">{k}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copy(k, `k${i}`)}
                  className="h-7 px-2"
                >
                  {copied === `k${i}` ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Shield className="size-4 text-primary" />
          Composition
        </h2>
        <p className="text-xs text-muted-foreground">
          Each key has <strong>{strength.composition}</strong> ≈ {strength.bits.toLocaleString()} bits of entropy. The
          prefix and any separators / checksums are excluded from the entropy calculation. Production keys
          should target ≥ 128 bits.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Key className="size-3" />
        Keys are generated with <code className="mx-1 rounded bg-muted px-1 font-mono">crypto.getRandomValues</code>{" "}
        entirely in your browser — Toollyz has no server.
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
