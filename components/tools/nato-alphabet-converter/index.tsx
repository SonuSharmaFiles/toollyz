"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  Lock,
  RadioTower,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_NATO_OPTIONS,
  JOINERS,
  NATO,
  joinNato,
  natoToText,
  statsOf,
  textToNato,
  type NatoOptions,
} from "@/lib/tools/text/nato";

const TEXT_KEY = "toollyz:nato-text";
const OPT_KEY = "toollyz:nato-opts";
const MODE_KEY = "toollyz:nato-mode";

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

export default function NatoAlphabetConverter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"to-nato" | "to-text">("to-nato");
  const [text, setText] = React.useState("Toollyz 2026");
  const [options, setOptions] = React.useState<NatoOptions>(DEFAULT_NATO_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? "Toollyz 2026");
      const m = localStorage.getItem(MODE_KEY);
      if (m === "to-nato" || m === "to-text") setMode(m);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOptions({ ...DEFAULT_NATO_OPTIONS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [text, mode, options, mounted]);

  const words = React.useMemo(() => (mode === "to-nato" ? textToNato(text, options) : []), [text, mode, options]);
  const natoOutput = React.useMemo(() => joinNato(words, options.joiner), [words, options.joiner]);
  const decodedOutput = React.useMemo(() => (mode === "to-text" ? natoToText(text) : ""), [text, mode]);
  const stats = React.useMemo(() => statsOf(text), [text]);

  const output = mode === "to-nato" ? natoOutput : decodedOutput;

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="NATO summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Letters" value={stats.letters} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Digits" value={stats.digits} reduceMotion={!!reduceMotion} />
          <Stat label="Punctuation" value={stats.punctuation} reduceMotion={!!reduceMotion} />
          <Stat label="Unknown" value={stats.unknown} reduceMotion={!!reduceMotion} accent="text-rose-300" />
        </div>
      </section>

      {/* Mode + options */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group">
          <Seg active={mode === "to-nato"} onClick={() => setMode("to-nato")} label="Text → NATO" />
          <Seg active={mode === "to-text"} onClick={() => setMode("to-text")} label="NATO → Text" />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setText(output);
            setMode((m) => (m === "to-nato" ? "to-text" : "to-nato"));
          }}
        >
          <ArrowLeftRight className="size-3.5" />
          Swap
        </Button>
        <button
          type="button"
          onClick={() => setText("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
        <button
          type="button"
          onClick={() => setText("Toollyz 2026")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <RadioTower className="size-4 text-primary" />
          Options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Joiner</Label>
            <select
              value={options.joiner}
              onChange={(e) => setOptions((o) => ({ ...o, joiner: e.target.value }))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {JOINERS.map((j) => (
                <option key={j.id} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Casing</Label>
            <Toggle
              checked={options.uppercase}
              onChange={(v) => setOptions((o) => ({ ...o, uppercase: v }))}
              label="UPPERCASE all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Punctuation</Label>
            <Toggle
              checked={options.includePunctuation}
              onChange={(v) => setOptions((o) => ({ ...o, includePunctuation: v }))}
              label="Spell punctuation"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Unknown chars</Label>
            <Toggle
              checked={options.dropUnknown}
              onChange={(v) => setOptions((o) => ({ ...o, dropUnknown: v }))}
              label="Drop silently"
            />
          </div>
        </div>
      </section>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={mode === "to-nato" ? "Plain text" : "NATO words"}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={mode === "to-nato" ? "Type or paste the text you want to spell out…" : "Paste NATO words separated by spaces or dashes…"}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label={mode === "to-nato" ? "Phonetic output" : "Decoded text"}>
          <textarea
            value={output}
            readOnly
            rows={10}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copy} disabled={!output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadText(output, "nato.txt")}
              disabled={!output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Word-by-word */}
      {mode === "to-nato" && words.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <RadioTower className="size-4 text-primary" />
            Letter-by-letter
          </h2>
          <ul className="grid gap-1 list-none sm:grid-cols-2 lg:grid-cols-3">
            {[...text].map((ch, i) => {
              const up = ch.toUpperCase();
              const word = NATO[up];
              if (!word) return null;
              return (
                <li key={i} className="flex items-center gap-2 rounded-md border border-border/60 bg-background p-1.5 text-xs">
                  <span className="grid size-6 shrink-0 place-items-center rounded bg-primary/10 font-mono font-semibold text-primary">
                    {up}
                  </span>
                  <span className="text-foreground/90">{options.uppercase ? word.toUpperCase() : word}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Alphabet reference */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          NATO alphabet reference
        </h2>
        <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(NATO)
            .filter(([k]) => /^[A-Z0-9]$/.test(k))
            .map(([k, v]) => (
              <div
                key={k}
                className="flex items-center gap-2 rounded-md border border-border/60 bg-background p-1.5"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {k}
                </span>
                <span className="text-sm font-medium">{v}</span>
              </div>
            ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <RadioTower className="size-3" />
        Conversion runs entirely in your browser — Toollyz has no server.
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
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function Panel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="mb-2 text-sm font-semibold tracking-tight">{label}</h2>
      {children}
    </section>
  );
}

function Seg({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex h-9 items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
