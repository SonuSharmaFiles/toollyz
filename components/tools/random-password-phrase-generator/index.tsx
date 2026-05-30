"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Dices,
  History as HistoryIcon,
  Info,
  KeyRound,
  Lock,
  RefreshCcw,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  WORDLIST_SIZE,
  entropyBand,
  generate,
  type CaseStyle,
  type PassphraseOptions,
  type PassphraseResult,
} from "@/lib/tools/passphrase/passphrase";

const STORAGE_KEY = "toollyz:passphrase-settings";
const HISTORY_KEY = "toollyz:passphrase-history";
const MAX_HISTORY = 12;

const DEFAULT_OPTIONS: PassphraseOptions = {
  wordCount: 5,
  separator: "-",
  caseStyle: "Title",
  appendDigits: 0,
  appendSymbol: false,
};

const SEPARATOR_OPTIONS: { value: string; label: string }[] = [
  { value: "-", label: "Hyphen (-)" },
  { value: ".", label: "Period (.)" },
  { value: "_", label: "Underscore (_)" },
  { value: " ", label: "Space ( )" },
  { value: "", label: "None (joined)" },
];

const CASE_OPTIONS: { value: CaseStyle; label: string; sample: string }[] = [
  { value: "lower", label: "lowercase", sample: "horse-battery" },
  { value: "Title", label: "Title Case", sample: "Horse-Battery" },
  { value: "UPPER", label: "UPPER CASE", sample: "HORSE-BATTERY" },
  { value: "camel", label: "camelCase", sample: "horseBattery" },
];

export default function RandomPasswordPhraseGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [opts, setOpts] = React.useState<PassphraseOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = React.useState<PassphraseResult | null>(null);
  const [history, setHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOpts({ ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<PassphraseOptions>) });
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as string[]);
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
    } catch {
      /* noop */
    }
  }, [opts, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  const generateNew = React.useCallback(() => {
    try {
      const r = generate(opts);
      setResult(r);
      setHistory((prev) => [r.text, ...prev.filter((x) => x !== r.text)].slice(0, MAX_HISTORY));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate");
    }
  }, [opts]);

  // Generate once on mount, then on settings change.
  React.useEffect(() => {
    if (mounted) generateNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, opts]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function reset() {
    setOpts(DEFAULT_OPTIONS);
    toast.success("Reset to defaults");
  }

  function clearHistory() {
    setHistory([]);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const band = result ? entropyBand(result.totalEntropyBits) : null;

  return (
    <div className="space-y-6">
      {/* Hero — current passphrase */}
      <section
        aria-label="Generated passphrase"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between text-xs text-indigo-300/80">
            <span className="uppercase tracking-wider">Your passphrase</span>
            {band && (
              <span className={cn("rounded-full bg-white/10 px-2 py-0.5 font-semibold", band.color)}>
                {result?.totalEntropyBits} bits · {band.label}
              </span>
            )}
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-emerald-100 sm:text-3xl break-words">
            {result?.text ?? "…"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" onClick={() => result && copy(result.text)} disabled={!result}>
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={generateNew} className="bg-white/5 text-white">
              <Dices className="size-3.5" />
              Re-roll
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white">
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <KeyRound className="size-4 text-primary" />
          Passphrase settings
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="font-medium">Word count</Label>
            <span className="font-mono tabular-nums">{opts.wordCount} words</span>
          </div>
          <Slider
            value={[opts.wordCount]}
            onValueChange={(v) => setOpts((o) => ({ ...o, wordCount: Math.round(Array.isArray(v) ? v[0] : (v as number)) }))}
            min={2}
            max={12}
            step={1}
          />
          <p className="text-[11px] text-muted-foreground">
            Wordlist size: <strong>{WORDLIST_SIZE}</strong> · ~{Math.round(Math.log2(WORDLIST_SIZE) * 10) / 10} bits per word.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Separator">
            <Select value={opts.separator} onValueChange={(v) => v !== null && setOpts((o) => ({ ...o, separator: v }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEPARATOR_OPTIONS.map((s) => (
                  <SelectItem key={s.label} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Case style">
            <Select value={opts.caseStyle} onValueChange={(v) => v && setOpts((o) => ({ ...o, caseStyle: v as CaseStyle }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASE_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="font-medium">{c.label}</span>
                    <span className="ml-2 font-mono text-muted-foreground">{c.sample}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`Append digits: ${opts.appendDigits}`}>
            <Slider
              value={[opts.appendDigits]}
              onValueChange={(v) => setOpts((o) => ({ ...o, appendDigits: Math.round(Array.isArray(v) ? v[0] : (v as number)) }))}
              min={0}
              max={4}
              step={1}
            />
            <p className="text-[10px] text-muted-foreground">
              Adds ~3.3 bits per digit. Useful when sites require a number.
            </p>
          </Field>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Append symbol</Label>
            <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
              <input
                type="checkbox"
                checked={opts.appendSymbol}
                onChange={(e) => setOpts((o) => ({ ...o, appendSymbol: e.target.checked }))}
                className="size-4 rounded border-border accent-primary"
              />
              Append one safe symbol (! @ # $ % &amp; * ? + − =)
            </label>
            <p className="text-[10px] text-muted-foreground">Adds ~3.5 bits. Excludes characters that often break copy-paste.</p>
          </div>
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <HistoryIcon className="size-4 text-primary" />
              Last {history.length}
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1 list-none">
            {history.map((entry, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
                <code className="min-w-0 flex-1 break-all font-mono">{entry}</code>
                <button
                  type="button"
                  onClick={() => copy(entry)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Copy ${entry}`}
                >
                  <Copy className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Why passphrases */}
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
          <Shield className="size-4" />
          Why passphrases?
        </h2>
        <ul className="grid gap-1.5 text-xs text-emerald-700/90 dark:text-emerald-400/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />A 5-word phrase from a {WORDLIST_SIZE}-word list has ~{(5 * Math.log2(WORDLIST_SIZE)).toFixed(0)} bits of entropy — roughly equivalent to a 9-character random string.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Memorable phrases are easier to type on mobile and to dictate over the phone than dense random strings.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Inspired by the <a href="https://xkcd.com/936/" className="underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">XKCD 936</a> &quot;correct horse battery staple&quot; comic and the older <a href="https://theworld.com/~reinhold/diceware.html" className="underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">Diceware</a> method.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Use a password manager — even great passphrases shouldn&apos;t be reused across accounts.</li>
        </ul>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Randomness comes from <code className="font-mono">crypto.getRandomValues</code> — the same CSPRNG used by HTTPS in your browser. No <code className="font-mono">Math.random</code> fallback.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Word selection uses rejection sampling to avoid modulo bias — every word is exactly equally likely.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Entropy = log₂(wordlist size) × wordCount + log₂(10) × digitCount + log₂(11) for the symbol slot.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — phrases are generated and history is stored in your browser only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Runs entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
