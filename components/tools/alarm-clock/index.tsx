"use client";

import * as React from "react";
import {
  AlarmClock as AlarmIcon,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Info,
  Lock,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  STORAGE_KEY,
  TONES,
  WEEK_LABELS,
  bitmaskForRepeat,
  describeRepeat,
  isDayActive,
  newAlarm,
  nextFiringTime,
  toggleDay,
  untilString,
  type Alarm,
  type Repeat,
  type Tone,
} from "@/lib/tools/clock/alarms";

interface RingingState {
  alarm: Alarm;
  startedAt: number;
}

export default function AlarmClock() {
  const [mounted, setMounted] = React.useState(false);
  const [alarms, setAlarms] = React.useState<Alarm[]>([]);
  const [now, setNow] = React.useState(new Date());
  const [ringing, setRinging] = React.useState<RingingState | null>(null);
  const [notificationStatus, setNotificationStatus] = React.useState<NotificationPermission | "unsupported">("default");
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscRef = React.useRef<{ stop: () => void } | null>(null);
  const firedRef = React.useRef<Map<string, number>>(new Map());

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Alarm[];
        if (Array.isArray(parsed)) setAlarms(parsed);
      }
    } catch {
      /* noop */
    }
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") {
      setNotificationStatus("unsupported");
    } else {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch {
      /* noop */
    }
  }, [alarms, mounted]);

  // Tick once per second to update the clock and check for firing alarms.
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [mounted]);

  // Check for alarms to fire when `now` advances.
  React.useEffect(() => {
    if (!mounted || ringing) return;
    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      const target = nextFiringTime(alarm, new Date(now.getTime() - 30 * 1000));
      if (!target) continue;
      const diff = Math.abs(target.getTime() - now.getTime());
      if (diff < 1500) {
        const last = firedRef.current.get(alarm.id) ?? 0;
        if (target.getTime() === last) continue;
        firedRef.current.set(alarm.id, target.getTime());
        triggerRing(alarm);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, alarms, ringing, mounted]);

  function triggerRing(alarm: Alarm) {
    setRinging({ alarm, startedAt: performance.now() });
    playTone(alarm.tone);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(alarm.label || "Alarm", { body: `It's ${alarm.time}.`, silent: false, tag: alarm.id });
      } catch {
        /* noop */
      }
    }
    if (alarm.repeat === "once") {
      setAlarms((prev) => prev.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a)));
    }
  }

  function stopRing() {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current = null;
    }
    setRinging(null);
  }

  function snooze(minutes: number) {
    if (!ringing) return;
    stopRing();
    const target = new Date(Date.now() + minutes * 60 * 1000);
    const hh = String(target.getHours()).padStart(2, "0");
    const mm = String(target.getMinutes()).padStart(2, "0");
    const snoozeAlarm: Alarm = {
      ...ringing.alarm,
      id: `snz-${Math.random().toString(36).slice(2, 7)}`,
      label: `${ringing.alarm.label} (snooze)`,
      time: `${hh}:${mm}`,
      enabled: true,
      repeat: "once",
      days: 0,
    };
    setAlarms((prev) => [snoozeAlarm, ...prev]);
    toast.success(`Snoozed ${minutes} minute${minutes === 1 ? "" : "s"}`);
  }

  function add() {
    setAlarms((prev) => [newAlarm(), ...prev]);
  }

  function remove(id: string) {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }

  function update(id: string, patch: Partial<Alarm>) {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  async function requestPermission() {
    if (typeof Notification === "undefined") {
      toast.error("Notifications aren't supported in this browser.");
      return;
    }
    const result = await Notification.requestPermission();
    setNotificationStatus(result);
    if (result === "granted") toast.success("Notifications enabled");
    else toast.error("Notifications denied — Toollyz can't show desktop pop-ups.");
  }

  function playTone(tone: Tone) {
    try {
      if (typeof AudioContext === "undefined" && typeof (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === "undefined") {
        toast.error("AudioContext isn't available in this browser.");
        return;
      }
      type Ctor = typeof AudioContext;
      const Ctor = (typeof AudioContext !== "undefined"
        ? AudioContext
        : (window as { webkitAudioContext?: Ctor }).webkitAudioContext) as Ctor | undefined;
      if (!Ctor) {
        toast.error("AudioContext isn't available in this browser.");
        return;
      }
      audioCtxRef.current ??= new Ctor();
      const ctx = audioCtxRef.current;
      const stop = scheduleTone(ctx, tone);
      oscRef.current = { stop };
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't play tone");
    }
  }

  function testTone(tone: Tone) {
    playTone(tone);
  }

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
      {/* Ringing overlay */}
      {ringing && (
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-emerald-500/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <BellRing className="size-10 animate-pulse text-emerald-500" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Alarm ringing</div>
              <div className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{ringing.alarm.label}</div>
              <div className="text-xs text-muted-foreground">Tone: {ringing.alarm.tone}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" onClick={() => snooze(5)}>+5 min</Button>
              <Button type="button" variant="outline" onClick={() => snooze(10)}>+10 min</Button>
              <Button type="button" variant="ghost" onClick={stopRing}>
                <X className="size-3.5" />
                Stop
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Live clock */}
      <section
        aria-label="Current time"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300/70">Now ({Intl.DateTimeFormat().resolvedOptions().timeZone})</div>
            <div className="font-mono text-5xl font-bold tabular-nums text-indigo-50 sm:text-7xl">
              {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </div>
            <div className="text-xs text-indigo-200/80">
              {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={add} className="bg-white/5 text-white">
              <Plus className="size-3.5" />
              Alarm
            </Button>
            {notificationStatus === "default" && (
              <Button type="button" size="sm" variant="outline" onClick={requestPermission} className="bg-white/5 text-white">
                <BellRing className="size-3.5" />
                Enable notifications
              </Button>
            )}
            {notificationStatus === "denied" && (
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-300">
                Notifications blocked
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Alarms */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <AlarmIcon className="size-4 text-primary" />
          Alarms ({alarms.length})
        </h2>
        {alarms.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No alarms yet — click <strong>+ Alarm</strong> in the clock above.
          </p>
        ) : (
          <ul className="space-y-3 list-none">
            {alarms.map((a) => {
              const target = nextFiringTime(a, now);
              return (
                <li key={a.id} className={cn("space-y-3 rounded-2xl border bg-background p-4", a.enabled ? "border-border" : "border-border/40 opacity-60")}>
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      type="time"
                      value={a.time}
                      onChange={(e) => update(a.id, { time: e.target.value })}
                      className="w-32 font-mono text-lg"
                    />
                    <Input
                      value={a.label}
                      onChange={(e) => update(a.id, { label: e.target.value })}
                      placeholder="Label"
                      className="min-w-[160px] flex-1"
                    />
                    <label className="flex shrink-0 items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={a.enabled}
                        onChange={(e) => update(a.id, { enabled: e.target.checked })}
                        className="size-4 rounded border-border accent-primary"
                      />
                      {a.enabled ? "Enabled" : "Off"}
                    </label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => remove(a.id)} aria-label="Delete">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Repeat</Label>
                      <Select value={a.repeat} onValueChange={(v) => v && update(a.id, { repeat: v as Repeat, days: bitmaskForRepeat(v as Repeat, a.days) })}>
                        <SelectTrigger className="w-full justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="daily">Every day</SelectItem>
                          <SelectItem value="weekdays">Weekdays</SelectItem>
                          <SelectItem value="weekends">Weekends</SelectItem>
                          <SelectItem value="custom">Custom…</SelectItem>
                        </SelectContent>
                      </Select>
                      {a.repeat === "custom" && (
                        <div className="flex flex-wrap gap-1">
                          {WEEK_LABELS.map((d, i) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => update(a.id, { days: toggleDay(a.days, i) })}
                              className={cn(
                                "rounded-md border px-2 py-1 text-[11px] font-medium",
                                isDayActive(a.days, i)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background text-foreground/70 hover:bg-muted",
                              )}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Tone</Label>
                      <div className="flex gap-1.5">
                        <Select value={a.tone} onValueChange={(v) => v && update(a.id, { tone: v as Tone })}>
                          <SelectTrigger className="w-full justify-between">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TONES.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.label}
                                <span className="ml-1 text-muted-foreground">— {t.description}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" size="sm" variant="outline" onClick={() => testTone(a.tone)} aria-label="Test tone">
                          <Volume2 className="size-3.5" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{describeRepeat(a)}</span>
                    {a.enabled && target && (
                      <>
                        <span>·</span>
                        <span>Next: {target.toLocaleString()}</span>
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                          {untilString(target, now)}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Honest notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" /><strong>The tab must stay open.</strong> Browsers can&apos;t fire alarms when the page is closed — no service worker, no Toollyz server. Pin the tab and keep it loaded.</li>
          <li className="flex items-start gap-1.5"><BellRing className="mt-0.5 size-3.5 shrink-0 text-primary" />Tones are synthesised live with the WebAudio API — no audio files, no licensing concerns, near-instant start.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Granting browser notification permission lets the alarm pop up an OS notification when it rings (great for muted tabs).</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — alarms save to localStorage on this device only.</li>
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

// --- WebAudio tone synth -----------------------------------------------------

function scheduleTone(ctx: AudioContext, tone: Tone): () => void {
  const startedAt = ctx.currentTime;
  const nodes: AudioNode[] = [];
  const oscillators: OscillatorNode[] = [];

  function note(freq: number, start: number, dur: number, gain = 0.4): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tone === "buzz" ? "square" : tone === "beep" ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(freq, startedAt + start);
    g.gain.setValueAtTime(0, startedAt + start);
    g.gain.linearRampToValueAtTime(gain, startedAt + start + 0.02);
    g.gain.linearRampToValueAtTime(0, startedAt + start + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(startedAt + start);
    osc.stop(startedAt + start + dur + 0.05);
    oscillators.push(osc);
    nodes.push(g);
  }

  let length = 1;
  if (tone === "bell") {
    note(660, 0, 1.4, 0.45);
    note(880, 0, 1.4, 0.18);
    length = 1.5;
  } else if (tone === "chime") {
    note(523.25, 0, 0.6); // C5
    note(659.25, 0.4, 0.6); // E5
    note(783.99, 0.8, 0.8); // G5
    length = 1.7;
  } else if (tone === "beep") {
    for (let i = 0; i < 3; i++) {
      note(1200, i * 0.5, 0.2, 0.35);
      note(600, i * 0.5 + 0.25, 0.2, 0.35);
    }
    length = 3;
  } else {
    for (let i = 0; i < 4; i++) {
      note(220, i * 0.4, 0.3, 0.5);
    }
    length = 2;
  }

  const stop = () => {
    oscillators.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* noop */
      }
    });
  };
  // Auto-stop after `length` seconds so the tone doesn't keep ringing
  // forever in a tab with no user interaction.
  window.setTimeout(stop, length * 1000);
  return stop;
}
