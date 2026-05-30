"use client";

import * as React from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Coffee,
  Hourglass,
  Info,
  Lock,
  Pause,
  Play,
  RefreshCcw,
  SkipForward,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SETTINGS_KEY = "toollyz:pomodoro-settings";
const HISTORY_KEY = "toollyz:pomodoro-history";

type Phase = "work" | "short" | "long";

interface Settings {
  workMin: number;
  shortMin: number;
  longMin: number;
  cyclesPerLongBreak: number;
  autoAdvance: boolean;
  sound: boolean;
  notify: boolean;
}

interface HistoryEntry {
  ts: number;
  phase: Phase;
  durationMin: number;
}

const DEFAULTS: Settings = {
  workMin: 25,
  shortMin: 5,
  longMin: 15,
  cyclesPerLongBreak: 4,
  autoAdvance: true,
  sound: true,
  notify: false,
};

function load<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

function fmt(ms: number): { mm: string; ss: string } {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return { mm, ss };
}

export default function PomodoroTimer() {
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(DEFAULTS);
  const [phase, setPhase] = React.useState<Phase>("work");
  const [running, setRunning] = React.useState(false);
  const [remaining, setRemaining] = React.useState(DEFAULTS.workMin * 60 * 1000);
  const [completedWork, setCompletedWork] = React.useState(0); // today's work sessions
  const [historyToday, setHistoryToday] = React.useState<HistoryEntry[]>([]);
  const tickEndRef = React.useRef<number | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const s = load(SETTINGS_KEY, DEFAULTS);
    setSettings(s);
    setRemaining(s.workMin * 60 * 1000);
    const history = load<HistoryEntry[]>(HISTORY_KEY, []);
    if (Array.isArray(history)) {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const today = history.filter((h) => h.ts >= todayStart);
      setHistoryToday(today);
      setCompletedWork(today.filter((h) => h.phase === "work").length);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    save(SETTINGS_KEY, settings);
  }, [settings, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    save(HISTORY_KEY, historyToday);
  }, [historyToday, mounted]);

  React.useEffect(() => {
    if (!running) return;
    const endAt = performance.now() + remaining;
    tickEndRef.current = endAt;
    let raf = 0;
    const tick = () => {
      const ms = (tickEndRef.current ?? endAt) - performance.now();
      if (ms <= 0) {
        completePhase();
        return;
      }
      setRemaining(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const phaseLabel = phase === "work" ? "Focus" : phase === "short" ? "Short break" : "Long break";

  function phaseDurationMs(p: Phase, s: Settings = settings): number {
    const min = p === "work" ? s.workMin : p === "short" ? s.shortMin : s.longMin;
    return Math.max(1, Math.round(min)) * 60 * 1000;
  }

  function startPause() {
    setRunning((r) => !r);
  }

  function completePhase() {
    if (settings.sound) playChime(phase === "work" ? "work-end" : "break-end");
    if (settings.notify && typeof Notification !== "undefined" && Notification.permission === "granted") {
      const body = phase === "work" ? "Take a break — well done." : "Break over — back to focus.";
      try {
        new Notification(`${phaseLabel} complete`, { body, silent: false });
      } catch {
        /* noop */
      }
    }
    setHistoryToday((prev) => [
      ...prev,
      { ts: Date.now(), phase, durationMin: phase === "work" ? settings.workMin : phase === "short" ? settings.shortMin : settings.longMin },
    ]);
    let nextPhase: Phase;
    if (phase === "work") {
      const next = completedWork + 1;
      setCompletedWork(next);
      nextPhase = next % settings.cyclesPerLongBreak === 0 ? "long" : "short";
    } else {
      nextPhase = "work";
    }
    setPhase(nextPhase);
    setRemaining(phaseDurationMs(nextPhase));
    setRunning(settings.autoAdvance);
    toast.success(`${phaseLabel} complete · next: ${nextPhase === "work" ? "Focus" : nextPhase === "short" ? "Short break" : "Long break"}`);
  }

  function skip() {
    completePhase();
  }

  function reset() {
    setRunning(false);
    setPhase("work");
    setRemaining(settings.workMin * 60 * 1000);
  }

  function updateSetting<K extends keyof Settings>(k: K, v: Settings[K]) {
    setSettings((s) => {
      const next = { ...s, [k]: v };
      // If user changes the current phase's duration while paused, reflect it.
      if (!running && (k === "workMin" || k === "shortMin" || k === "longMin")) {
        if ((phase === "work" && k === "workMin") || (phase === "short" && k === "shortMin") || (phase === "long" && k === "longMin")) {
          setRemaining(phaseDurationMs(phase, next));
        }
      }
      return next;
    });
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      toast.error("Notifications aren't supported in this browser.");
      return;
    }
    const r = await Notification.requestPermission();
    if (r === "granted") {
      updateSetting("notify", true);
      toast.success("Notifications enabled");
    } else {
      toast.error("Notifications denied");
    }
  }

  function playChime(kind: "work-end" | "break-end") {
    try {
      type Ctor = typeof AudioContext;
      const Ctor = (typeof AudioContext !== "undefined"
        ? AudioContext
        : (window as { webkitAudioContext?: Ctor }).webkitAudioContext) as Ctor | undefined;
      if (!Ctor) return;
      audioCtxRef.current ??= new Ctor();
      const ctx = audioCtxRef.current;
      const startedAt = ctx.currentTime;
      const tones: [number, number, number][] = kind === "work-end"
        ? [[523.25, 0, 0.4], [659.25, 0.32, 0.5]] // C5 then E5
        : [[783.99, 0, 0.35], [659.25, 0.3, 0.35], [523.25, 0.6, 0.5]]; // G-E-C
      for (const [freq, start, dur] of tones) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startedAt + start);
        g.gain.setValueAtTime(0, startedAt + start);
        g.gain.linearRampToValueAtTime(0.35, startedAt + start + 0.02);
        g.gain.linearRampToValueAtTime(0, startedAt + start + dur);
        osc.connect(g).connect(ctx.destination);
        osc.start(startedAt + start);
        osc.stop(startedAt + start + dur + 0.05);
      }
    } catch {
      /* noop */
    }
  }

  function testChime() {
    playChime("work-end");
  }

  const totalForPhase = phaseDurationMs(phase);
  const elapsedFraction = 1 - remaining / totalForPhase;
  const { mm, ss } = fmt(remaining);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const phaseColors: Record<Phase, { ring: string; bg: string; tint: string }> = {
    work: { ring: "stroke-emerald-400", bg: "bg-emerald-500/15", tint: "text-emerald-700 dark:text-emerald-400" },
    short: { ring: "stroke-sky-400", bg: "bg-sky-500/15", tint: "text-sky-700 dark:text-sky-400" },
    long: { ring: "stroke-indigo-400", bg: "bg-indigo-500/15", tint: "text-indigo-700 dark:text-indigo-400" },
  };

  return (
    <div className="space-y-6">
      {/* Big timer */}
      <section
        aria-label="Pomodoro timer"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="grid place-items-center">
            <div className="relative size-48 sm:size-56">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="44" className="fill-none stroke-white/10" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={cn("fill-none transition-all", phaseColors[phase].ring)}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - elapsedFraction)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="font-mono text-4xl font-bold tabular-nums text-white sm:text-5xl">
                  {mm}:{ss}
                </div>
                <div className={cn("text-[10px] font-semibold uppercase tracking-widest", phaseColors[phase].tint)}>
                  {phaseLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-white">
            <div className="text-xs uppercase tracking-wider text-indigo-300/70">Today</div>
            <div className="flex items-end gap-4">
              <div>
                <div className="font-heading text-4xl font-bold tabular-nums">{completedWork}</div>
                <div className="text-[11px] text-indigo-200/80">Focus sessions</div>
              </div>
              <div>
                <div className="font-heading text-4xl font-bold tabular-nums">
                  {Math.round(historyToday.filter((h) => h.phase === "work").reduce((s, h) => s + h.durationMin, 0))}
                </div>
                <div className="text-[11px] text-indigo-200/80">Focus minutes</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="lg" onClick={startPause} className={cn("min-w-32", running ? "bg-amber-500/90 hover:bg-amber-500" : "bg-emerald-500/90 hover:bg-emerald-500", "text-white")}>
                {running ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Start</>}
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={skip} className="bg-white/5 text-white">
                <SkipForward className="size-4" />
                Skip
              </Button>
              <Button type="button" size="lg" variant="ghost" onClick={reset} className="text-white">
                <RefreshCcw className="size-4" />
                Reset
              </Button>
            </div>
            <p className="text-[11px] text-indigo-200/70">
              Next: every {settings.cyclesPerLongBreak}th focus session triggers a Long break. Cycle progress: {completedWork % settings.cyclesPerLongBreak} / {settings.cyclesPerLongBreak}.
            </p>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Hourglass className="size-4 text-primary" />
          Settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Focus (min)"><DurationInput value={settings.workMin} onChange={(v) => updateSetting("workMin", v)} /></Field>
          <Field label="Short break (min)"><DurationInput value={settings.shortMin} onChange={(v) => updateSetting("shortMin", v)} /></Field>
          <Field label="Long break (min)"><DurationInput value={settings.longMin} onChange={(v) => updateSetting("longMin", v)} /></Field>
          <Field label={`Long break every ${settings.cyclesPerLongBreak} sessions`}>
            <Input
              type="number"
              min={2}
              max={12}
              value={settings.cyclesPerLongBreak}
              onChange={(e) => updateSetting("cyclesPerLongBreak", Math.max(2, Math.min(12, Number(e.target.value) || 4)))}
              className="font-mono"
            />
          </Field>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Auto-advance</Label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => updateSetting("autoAdvance", e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              Continue automatically to the next phase
            </label>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notifications & sound</Label>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => updateSetting("sound", e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                Chime
              </label>
              <Button type="button" size="sm" variant="outline" onClick={testChime}>
                <Volume2 className="size-3.5" />
                Test
              </Button>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.notify}
                  onChange={(e) => {
                    if (e.target.checked) void enableNotifications();
                    else updateSetting("notify", false);
                  }}
                  className="size-4 rounded border-border accent-primary"
                />
                Browser notifications
              </label>
              {typeof Notification !== "undefined" && Notification.permission === "denied" && (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                  Browser-blocked
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      {historyToday.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Coffee className="size-4 text-primary" />
            Today ({historyToday.length})
          </h2>
          <ul className="space-y-1.5 list-none">
            {historyToday.slice().reverse().map((h, i) => (
              <li key={i} className="grid grid-cols-[20px_80px_80px_1fr] items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
                <span className={cn("size-2.5 rounded-full", h.phase === "work" ? "bg-emerald-400" : h.phase === "short" ? "bg-sky-400" : "bg-indigo-400")} />
                <span className="font-mono text-muted-foreground capitalize">{h.phase}</span>
                <span className="font-mono text-foreground">{h.durationMin} min</span>
                <span className="truncate text-[10px] text-muted-foreground">{new Date(h.ts).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this Pomodoro
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Hourglass className="mt-0.5 size-3.5 shrink-0 text-primary" />Default cadence is 25 / 5 / 15 minutes — Cirillo&apos;s original. Tune it however you like; every value persists.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />After every <strong>{settings.cyclesPerLongBreak}</strong> focus sessions you get a long break instead of a short one — the canonical 4-and-1 pattern.</li>
          <li className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />Background tabs are throttled, so the visual countdown can freeze briefly when this tab isn&apos;t focused — the underlying timer is still on the wall clock and will catch up on the next frame.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — settings and today&apos;s history save to localStorage. Tomorrow&apos;s tally starts fresh after midnight.</li>
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

function DurationInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      min={1}
      max={120}
      value={value}
      onChange={(e) => onChange(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
      className="font-mono"
    />
  );
}
