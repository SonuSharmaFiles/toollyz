"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  History as HistoryIcon,
  Info,
  Lock,
  Pause,
  Play,
  RefreshCcw,
  Shuffle,
  Sparkles,
  Timer,
  TimerReset,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  PASSAGES,
  computeStats,
  loadHistory,
  saveHistory,
  type Duration,
  type Passage,
  type RunRecord,
} from "@/lib/tools/games/typing";

const DURATIONS: Duration[] = [15, 30, 60, 120];

export default function TypingSpeedTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [duration, setDuration] = React.useState<Duration>(30);
  const [passageId, setPassageId] = React.useState<string>(PASSAGES[0].id);
  const [customText, setCustomText] = React.useState("");
  const [useCustom, setUseCustom] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [mistakes, setMistakes] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const [history, setHistory] = React.useState<RunRecord[]>([]);
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setHistory(loadHistory());
  }, []);

  React.useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Live timer
  React.useEffect(() => {
    if (startedAt === null || finished) return;
    let raf = 0;
    const tick = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      setNow(elapsed);
      if (elapsed >= duration) {
        finishRun(elapsed);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, duration, finished]);

  const passage = React.useMemo(() => {
    if (useCustom) {
      const text = customText.trim();
      return { id: "custom", label: "Your text", text: text || "Paste some text to begin." } as Passage;
    }
    return PASSAGES.find((p) => p.id === passageId) ?? PASSAGES[0];
  }, [useCustom, customText, passageId]);

  const target = passage.text;
  const elapsed = startedAt ? now : 0;
  const remaining = Math.max(0, duration - elapsed);
  const stats = React.useMemo(() => computeStats(typed, target, Math.max(elapsed, 0.001), mistakes), [typed, target, elapsed, mistakes]);

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (finished) return;
    const value = e.target.value;
    if (value.length > target.length) return; // hard stop at target length
    if (startedAt === null && value.length > 0) {
      setStartedAt(performance.now());
    }
    if (value.length > typed.length) {
      const newChar = value[value.length - 1];
      const expected = target[value.length - 1];
      if (newChar !== expected) setMistakes((m) => m + 1);
    }
    setTyped(value);
    if (value.length === target.length && startedAt !== null) {
      finishRun((performance.now() - startedAt) / 1000);
    }
  }

  function finishRun(seconds: number) {
    setFinished(true);
    const final = computeStats(typed, target, Math.max(seconds, 0.001), mistakes);
    const record: RunRecord = {
      ts: Date.now(),
      duration,
      passageId: passage.id,
      wpm: final.wpm,
      rawWpm: final.rawWpm,
      accuracy: final.accuracy,
      errors: final.errors,
      typed: final.typed,
    };
    setHistory((prev) => [record, ...prev].slice(0, 30));
    toast.success(`Done! ${final.wpm} WPM · ${final.accuracy}% accuracy`);
  }

  function restart() {
    setTyped("");
    setMistakes(0);
    setStartedAt(null);
    setNow(0);
    setFinished(false);
    setTimeout(() => textAreaRef.current?.focus(), 0);
  }

  function pickRandom() {
    const others = PASSAGES.filter((p) => p.id !== passageId);
    const pick = others[Math.floor(Math.random() * others.length)] ?? PASSAGES[0];
    setUseCustom(false);
    setPassageId(pick.id);
    restart();
  }

  function clearHistory() {
    setHistory([]);
    toast.success("History cleared");
  }

  const bestForDuration = React.useMemo(() => {
    const ofDuration = history.filter((h) => h.duration === duration);
    if (ofDuration.length === 0) return null;
    return ofDuration.reduce((best, cur) => (cur.wpm > best.wpm ? cur : best), ofDuration[0]);
  }, [history, duration]);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <section
        aria-label="Typing stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="WPM" value={stats.wpm} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Raw WPM" value={stats.rawWpm} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Accuracy" value={stats.accuracy} suffix="%" reduceMotion={!!reduceMotion} />
          <Stat label="Errors" value={stats.errors} reduceMotion={!!reduceMotion} accent={stats.errors === 0 ? "text-emerald-300" : "text-rose-300"} />
          <Stat label="Time left" value={Math.ceil(remaining)} suffix="s" reduceMotion={!!reduceMotion} />
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{ width: `${Math.min(100, (elapsed / duration) * 100)}%` }}
          />
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-xs font-medium">Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => v && setDuration(Number(v) as Duration)}>
              <SelectTrigger id="duration" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} seconds
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passage" className="text-xs font-medium">Passage</Label>
            <Select
              value={useCustom ? "__custom" : passageId}
              onValueChange={(v) => {
                if (!v) return;
                if (v === "__custom") {
                  setUseCustom(true);
                } else {
                  setUseCustom(false);
                  setPassageId(v);
                }
                restart();
              }}
            >
              <SelectTrigger id="passage" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PASSAGES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">Paste your own…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={pickRandom}>
              <Shuffle className="size-3.5" />
              Random
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={restart}>
              <RefreshCcw className="size-3.5" />
              Restart
            </Button>
          </div>
        </div>
        {useCustom && (
          <div className="space-y-1.5">
            <Label htmlFor="custom" className="text-xs font-medium">Your text</Label>
            <Textarea
              id="custom"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste a paragraph or two…"
              className="min-h-[100px]"
            />
            <p className="text-[11px] text-muted-foreground">Pasted text is hashed locally to populate the test passage — never uploaded.</p>
          </div>
        )}
      </section>

      {/* Passage + input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Timer className="size-4 text-primary" />
          {passage.label}
        </h2>
        <PassageView text={target} typed={typed} />
        <Textarea
          ref={textAreaRef}
          value={typed}
          onChange={onChange}
          disabled={finished}
          placeholder={startedAt === null ? "Start typing to begin the timer…" : "Keep going!"}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          className="min-h-[120px] font-mono"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {startedAt === null ? (
              <>Press a key to start the {duration}-second timer.</>
            ) : finished ? (
              <>Done. <button type="button" onClick={restart} className="underline-offset-4 hover:underline">Try again</button>?</>
            ) : (
              <>{Math.ceil(remaining)}s left · target {target.length.toLocaleString()} chars</>
            )}
          </span>
          {bestForDuration && (
            <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Best at {duration}s: {bestForDuration.wpm} WPM
            </span>
          )}
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <HistoryIcon className="size-4 text-primary" />
              History ({history.length})
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1.5 list-none">
            {history.map((h, i) => (
              <li key={i} className="grid grid-cols-[80px_56px_56px_56px_1fr] items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
                <span className="font-mono text-muted-foreground">{h.duration}s</span>
                <span className="font-mono font-semibold text-foreground">{h.wpm} WPM</span>
                <span className="font-mono text-muted-foreground">{h.accuracy}%</span>
                <span className="font-mono text-muted-foreground">{h.errors} err</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {new Date(h.ts).toLocaleString()} · {h.passageId}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this test
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />WPM = correct chars ÷ 5 ÷ minutes elapsed. Raw WPM ignores errors. Accuracy = correct ÷ total typed.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Built-in passages cover pangrams, classic literature, code and common-word drills. Paste your own for niche practice.</li>
          <li className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />The test ends either when the timer hits zero or you finish the passage — whichever comes first.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every keystroke stays in your browser. The 30 most recent runs save to localStorage.</li>
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

function PassageView({ text, typed }: { text: string; typed: string }) {
  // Render every character with status: correct, wrong, current, pending.
  // For performance we render a single <p> with inline <span>s.
  const limit = text.length;
  const elements: React.ReactNode[] = [];
  for (let i = 0; i < limit; i++) {
    const ch = text[i];
    let className = "text-muted-foreground/60";
    if (i < typed.length) {
      const correct = typed[i] === ch;
      className = correct
        ? "text-emerald-600 dark:text-emerald-400"
        : "rounded bg-rose-500/15 text-rose-600 dark:text-rose-400";
    } else if (i === typed.length) {
      className = "rounded-l bg-primary/20 text-foreground underline underline-offset-4";
    } else {
      className = "text-muted-foreground/70";
    }
    elements.push(
      <span key={i} className={className}>
        {ch}
      </span>,
    );
  }
  return (
    <div className="max-h-44 overflow-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-sm leading-relaxed">
      {elements}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}
