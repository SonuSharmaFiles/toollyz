"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  Languages,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  BRAILLE_REFERENCE,
  DEFAULT_BRAILLE_OPTIONS,
  brailleToText,
  statsOf,
  textToBraille,
  type BrailleOptions,
} from "@/lib/tools/text/braille";

const TEXT_KEY = "toollyz:braille-text";
const BRAILLE_KEY = "toollyz:braille-braille";
const MODE_KEY = "toollyz:braille-mode";
const OPT_KEY = "toollyz:braille-opts";

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

export default function BrailleTranslator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"to-braille" | "to-text">("to-braille");
  const [textInput, setTextInput] = React.useState("Hello Toollyz 2026");
  const [brailleInput, setBrailleInput] = React.useState("⠠⠓⠑⠇⠇⠕ ⠠⠞⠕⠕⠇⠇⠽⠵ ⠼⠃⠚⠃⠋");
  const [options, setOptions] = React.useState<BrailleOptions>(DEFAULT_BRAILLE_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setTextInput(localStorage.getItem(TEXT_KEY) ?? "Hello Toollyz 2026");
      setBrailleInput(localStorage.getItem(BRAILLE_KEY) ?? "⠠⠓⠑⠇⠇⠕ ⠠⠞⠕⠕⠇⠇⠽⠵ ⠼⠃⠚⠃⠋");
      const m = localStorage.getItem(MODE_KEY);
      if (m === "to-braille" || m === "to-text") setMode(m);
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOptions({ ...DEFAULT_BRAILLE_OPTIONS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, textInput);
      localStorage.setItem(BRAILLE_KEY, brailleInput);
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(OPT_KEY, JSON.stringify(options));
    } catch {
      /* noop */
    }
  }, [textInput, brailleInput, mode, options, mounted]);

  const brailleOut = React.useMemo(() => textToBraille(textInput, options), [textInput, options]);
  const decoded = React.useMemo(() => brailleToText(brailleInput), [brailleInput]);
  const stats = React.useMemo(() => statsOf(textInput), [textInput]);

  const output = mode === "to-braille" ? brailleOut : decoded;

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
        aria-label="Braille summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(245,158,11,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Letters" value={stats.letters} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Digits" value={stats.digits} reduceMotion={!!reduceMotion} />
          <Stat label="Cells" value={stats.cells} reduceMotion={!!reduceMotion} />
          <Stat label="Unknown" value={stats.unknown} reduceMotion={!!reduceMotion} accent={stats.unknown > 0 ? "text-rose-300" : undefined} />
        </div>
      </section>

      {/* Mode + options */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group">
          <Seg active={mode === "to-braille"} onClick={() => setMode("to-braille")} label="Text → Braille" />
          <Seg active={mode === "to-text"} onClick={() => setMode("to-text")} label="Braille → Text" />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (mode === "to-braille") {
              setBrailleInput(brailleOut);
              setMode("to-text");
            } else {
              setTextInput(decoded);
              setMode("to-braille");
            }
          }}
        >
          <ArrowLeftRight className="size-3.5" />
          Swap
        </Button>
        <button
          type="button"
          onClick={() => {
            setTextInput("");
            setBrailleInput("");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
      </div>

      {mode === "to-braille" && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Options
          </h2>
          <div className="flex flex-wrap gap-3">
            <Toggle
              checked={options.capitalIndicator}
              onChange={(v) => setOptions((o) => ({ ...o, capitalIndicator: v }))}
              label="Use capital indicator ⠠"
            />
            <Toggle
              checked={options.grade1Indicator}
              onChange={(v) => setOptions((o) => ({ ...o, grade1Indicator: v }))}
              label="Wrap with Grade 1 indicator ⠰⠰⠰"
            />
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={mode === "to-braille" ? "Plain text" : "Braille input"}>
          <textarea
            value={mode === "to-braille" ? textInput : brailleInput}
            onChange={(e) => {
              if (mode === "to-braille") setTextInput(e.target.value);
              else setBrailleInput(e.target.value);
            }}
            rows={10}
            spellCheck={false}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-background p-3 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
              mode === "to-braille" ? "text-sm font-mono" : "text-xl",
            )}
            placeholder={mode === "to-braille" ? "Hello world…" : "⠠⠓⠑⠇⠇⠕…"}
          />
        </Panel>
        <Panel label={mode === "to-braille" ? "Braille output" : "Decoded text"}>
          <textarea
            value={output}
            readOnly
            rows={10}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-background p-3 outline-none",
              mode === "to-braille" ? "text-xl" : "text-sm font-mono",
            )}
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
              onClick={() =>
                downloadText(output, mode === "to-braille" ? "braille.txt" : "decoded.txt")
              }
              disabled={!output}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Reference */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Languages className="size-4 text-primary" />
          Braille reference (Grade 1)
        </h2>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Letters</Label>
            <div className="mt-1 grid grid-cols-6 gap-1.5 sm:grid-cols-13">
              {Object.entries(BRAILLE_REFERENCE.letters).map(([k, v]) => (
                <CellRow key={k} symbol={v} label={k} />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Digits (preceded by ⠼)</Label>
            <div className="mt-1 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
              {Object.entries(BRAILLE_REFERENCE.digits).map(([k, v]) => (
                <CellRow key={k} symbol={v} label={k} />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Indicators</Label>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {Object.entries(BRAILLE_REFERENCE.indicators).map(([k, v]) => (
                <CellRow key={k} symbol={v} label={k} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Languages className="size-3" />
        Translation uses the standard Grade 1 (uncontracted) English Braille mapping with Unicode Braille
        Patterns (U+2800–U+28FF). Runs entirely in your browser.
      </p>
    </div>
  );
}

function CellRow({ symbol, label }: { symbol: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background p-1">
      <span className="grid size-7 shrink-0 place-items-center rounded bg-primary/10 text-base">
        {symbol}
      </span>
      <span className="text-[11px] font-mono text-foreground/80">{label}</span>
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
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
