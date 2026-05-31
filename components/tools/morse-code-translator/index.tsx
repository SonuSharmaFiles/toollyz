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
  Pause,
  Play,
  SignalHigh,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  MORSE_MAP,
  morseToText,
  playMorse,
  statsOf,
  textToMorse,
  type PlaybackHandle,
} from "@/lib/tools/text/morse";

const TEXT_KEY = "toollyz:morse-text";
const MORSE_KEY = "toollyz:morse-code";
const MODE_KEY = "toollyz:morse-mode";
const WPM_KEY = "toollyz:morse-wpm";
const FREQ_KEY = "toollyz:morse-freq";

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

export default function MorseCodeTranslator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"text-to-morse" | "morse-to-text">("text-to-morse");
  const [textInput, setTextInput] = React.useState("SOS Toollyz");
  const [morseInput, setMorseInput] = React.useState("... --- ... / - --- --- .-.. .-.. -.-- --..");
  const [wpm, setWpm] = React.useState(15);
  const [frequency, setFrequency] = React.useState(600);
  const [copied, setCopied] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const handleRef = React.useRef<PlaybackHandle | null>(null);

  React.useEffect(() => {
    try {
      setTextInput(localStorage.getItem(TEXT_KEY) ?? "SOS Toollyz");
      setMorseInput(localStorage.getItem(MORSE_KEY) ?? "... --- ... / - --- --- .-.. .-.. -.-- --..");
      const m = localStorage.getItem(MODE_KEY);
      if (m === "text-to-morse" || m === "morse-to-text") setMode(m);
      const w = parseInt(localStorage.getItem(WPM_KEY) ?? "15", 10);
      if (Number.isFinite(w)) setWpm(Math.max(5, Math.min(40, w)));
      const f = parseInt(localStorage.getItem(FREQ_KEY) ?? "600", 10);
      if (Number.isFinite(f)) setFrequency(Math.max(300, Math.min(1200, f)));
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, textInput);
      localStorage.setItem(MORSE_KEY, morseInput);
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(WPM_KEY, String(wpm));
      localStorage.setItem(FREQ_KEY, String(frequency));
    } catch {
      /* noop */
    }
  }, [textInput, morseInput, mode, wpm, frequency, mounted]);

  const morseOutput = React.useMemo(() => textToMorse(textInput), [textInput]);
  const decodedText = React.useMemo(() => morseToText(morseInput), [morseInput]);
  const stats = React.useMemo(() => statsOf(textInput, wpm), [textInput, wpm]);

  React.useEffect(() => {
    return () => {
      handleRef.current?.stop();
    };
  }, []);

  async function copy(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function play() {
    const morse = mode === "text-to-morse" ? morseOutput : morseInput;
    if (!morse) return;
    handleRef.current?.stop();
    setPlaying(true);
    const handle = playMorse(morse, wpm, frequency);
    handleRef.current = handle;
    handle.promise.then(() => {
      setPlaying(false);
    });
  }

  function stop() {
    handleRef.current?.stop();
    setPlaying(false);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const visibleOutput = mode === "text-to-morse" ? morseOutput : decodedText;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Morse summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Symbols" value={stats.symbols} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Units" value={stats.units} reduceMotion={!!reduceMotion} />
          <Stat label="Duration (s)" value={Math.round(stats.durationMs / 100) / 10} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Speed</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={wpm} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40"> WPM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mode + controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group">
          <Seg active={mode === "text-to-morse"} onClick={() => setMode("text-to-morse")} label="Text → Morse" />
          <Seg active={mode === "morse-to-text"} onClick={() => setMode("morse-to-text")} label="Morse → Text" />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (mode === "text-to-morse") {
              setMorseInput(morseOutput);
              setMode("morse-to-text");
            } else {
              setTextInput(decodedText);
              setMode("text-to-morse");
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
            setMorseInput("");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Volume2 className="size-4 text-primary" />
          Audio settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Speed (WPM)</Label>
            <Input
              type="number"
              min={5}
              max={40}
              value={wpm}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setWpm(Math.max(5, Math.min(40, n)));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tone (Hz)</Label>
            <Input
              type="number"
              min={300}
              max={1200}
              step={50}
              value={frequency}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setFrequency(Math.max(300, Math.min(1200, n)));
              }}
              className="font-mono"
            />
          </div>
          <div className="flex items-end gap-2">
            {playing ? (
              <Button type="button" onClick={stop} variant="outline">
                <Pause className="size-4" />
                Stop
              </Button>
            ) : (
              <Button type="button" onClick={play} disabled={!visibleOutput && !morseInput}>
                <Play className="size-4" />
                Play
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={mode === "text-to-morse" ? "Plain text" : "Morse code"}>
          <textarea
            value={mode === "text-to-morse" ? textInput : morseInput}
            onChange={(e) => {
              if (mode === "text-to-morse") setTextInput(e.target.value);
              else setMorseInput(e.target.value);
            }}
            rows={10}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => {
              if (mode === "text-to-morse") setTextInput("SOS Toollyz");
              else setMorseInput("... --- ... / - --- --- .-.. .-.. -.-- --..");
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Sparkles className="size-3" />
            Sample
          </button>
        </Panel>
        <Panel label={mode === "text-to-morse" ? "Morse output" : "Decoded text"}>
          <textarea
            value={visibleOutput}
            readOnly
            rows={10}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => copy(visibleOutput)} disabled={!visibleOutput}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                downloadText(visibleOutput, mode === "text-to-morse" ? "morse.txt" : "decoded.txt")
              }
              disabled={!visibleOutput}
            >
              <Download className="size-3.5" />
              Download .txt
            </Button>
          </div>
        </Panel>
      </div>

      {/* Reference */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <SignalHigh className="size-4 text-primary" />
          Morse alphabet
        </h2>
        <div className="grid gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
          {Object.entries(MORSE_MAP).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (mode === "text-to-morse") setTextInput((t) => t + k);
                else setMorseInput((t) => (t ? `${t} ${v}` : v));
              }}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-1.5 text-left transition-colors hover:bg-muted"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded bg-primary/10 font-mono text-xs font-semibold text-primary">
                {k}
              </span>
              <span className="font-mono text-xs text-foreground/80">{v}</span>
            </button>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <SignalHigh className="size-3" />
        Translation and audio playback run entirely in your browser via the Web Audio API.
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
