"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Activity,
  Eraser,
  Info,
  Lock,
  Pause,
  Play,
  Plus,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  HISTORY_CAP,
  type MonitorTarget,
  averageRtt,
  probe,
  uid,
  uptimePct,
} from "@/lib/tools/text/uptime";

const KEY = "toollyz:uptime-targets";

const SAMPLE: MonitorTarget[] = [
  { id: uid(), label: "Cloudflare", url: "https://1.1.1.1/", intervalSec: 30, timeoutMs: 5000, history: [] },
  { id: uid(), label: "Google", url: "https://www.google.com/", intervalSec: 60, timeoutMs: 5000, history: [] },
  { id: uid(), label: "GitHub", url: "https://github.com/", intervalSec: 60, timeoutMs: 5000, history: [] },
];

const OUTCOME_STYLE: Record<string, string> = {
  up: "bg-emerald-500",
  down: "bg-rose-500",
  timeout: "bg-amber-500",
  blocked: "bg-zinc-400",
};

export default function WebsiteUptimeMonitor() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [targets, setTargets] = React.useState<MonitorTarget[]>([]);
  const [running, setRunning] = React.useState(false);
  const [draft, setDraft] = React.useState({ label: "", url: "", intervalSec: 60, timeoutMs: 5000 });
  const timersRef = React.useRef<Map<string, number>>(new Map());

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MonitorTarget[];
        if (Array.isArray(parsed)) setTargets(parsed);
        else setTargets(SAMPLE);
      } else {
        setTargets(SAMPLE);
      }
    } catch {
      setTargets(SAMPLE);
    }
    setMounted(true);
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(targets));
    } catch {
      /* noop */
    }
  }, [targets, mounted]);

  function stopAll() {
    for (const t of timersRef.current.values()) clearInterval(t);
    timersRef.current.clear();
  }

  async function runOnce(id: string) {
    const target = targets.find((t) => t.id === id);
    if (!target) return;
    const result = await probe(target);
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, history: [...t.history, result].slice(-HISTORY_CAP) }
          : t,
      ),
    );
  }

  function startPolling() {
    stopAll();
    for (const t of targets) {
      // Run once immediately.
      void runOnce(t.id);
      const handle = window.setInterval(() => void runOnce(t.id), Math.max(5, t.intervalSec) * 1000);
      timersRef.current.set(t.id, handle);
    }
    setRunning(true);
  }
  function stopPolling() {
    stopAll();
    setRunning(false);
  }

  function add() {
    const url = draft.url.trim();
    if (!url) {
      toast.error("Add a URL first");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    setTargets((prev) => [
      ...prev,
      {
        id: uid(),
        label: draft.label.trim() || new URL(url).hostname,
        url,
        intervalSec: draft.intervalSec,
        timeoutMs: draft.timeoutMs,
        history: [],
      },
    ]);
    setDraft({ label: "", url: "", intervalSec: 60, timeoutMs: 5000 });
    toast.success("Target added");
  }

  function remove(id: string) {
    const handle = timersRef.current.get(id);
    if (handle) {
      clearInterval(handle);
      timersRef.current.delete(id);
    }
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }

  function clearAll() {
    stopAll();
    setTargets([]);
    setRunning(false);
  }

  function clearHistory(id: string) {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, history: [] } : t)));
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const totalChecks = targets.reduce((s, t) => s + t.history.length, 0);
  const overallUp = targets.reduce((s, t) => s + t.history.filter((h) => h.outcome === "up").length, 0);
  const overallUpPct = totalChecks > 0 ? Math.round((overallUp / totalChecks) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Targets" value={targets.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Total checks" value={totalChecks} reduceMotion={!!reduceMotion} accent="text-sky-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Overall uptime</div>
            <div className={cn("font-heading text-3xl font-bold tabular-nums sm:text-4xl", overallUpPct >= 99 ? "text-emerald-300" : overallUpPct >= 90 ? "text-amber-300" : "text-rose-300")}>
              <AnimatedNumber value={overallUpPct} decimals={1} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-xl font-bold tracking-tight sm:text-2xl", running ? "text-emerald-300" : "text-sky-100")}>
              {running ? "Running" : "Paused"}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        {running ? (
          <Button type="button" size="sm" variant="outline" onClick={stopPolling}>
            <Pause className="size-3.5" />
            Pause
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={startPolling} disabled={targets.length === 0}>
            <Play className="size-3.5" />
            Start polling
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={() => targets.forEach((t) => void runOnce(t.id))} disabled={targets.length === 0}>
          <RotateCw className="size-3.5" />
          Check now
        </Button>
        <button
          type="button"
          onClick={() => setTargets(SAMPLE.map((t) => ({ ...t, id: uid(), history: [] })))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear all
        </button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Plus className="size-4 text-primary" />
          Add a target
        </h2>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            placeholder="Label (optional)"
            className="h-9 text-xs"
          />
          <Input
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            placeholder="https://example.com/"
            className="h-9 font-mono text-xs sm:col-span-2"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={draft.intervalSec}
              onChange={(e) => setDraft((d) => ({ ...d, intervalSec: parseInt(e.target.value || "60", 10) }))}
              min={5}
              max={3600}
              step={5}
              className="h-9 font-mono text-xs"
              aria-label="Interval seconds"
            />
            <Button type="button" size="sm" onClick={add}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Activity className="size-4 text-primary" />
          Targets ({targets.length})
        </h2>
        {targets.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
            No targets — add one above or click Sample.
          </p>
        )}
        <div className="space-y-3">
          {targets.map((t) => {
            const upPct = uptimePct(t.history);
            const avgMs = averageRtt(t.history);
            const last = t.history[t.history.length - 1];
            return (
              <div key={t.id} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground break-all">{t.url}</div>
                  </div>
                  <div className="flex items-baseline gap-3 text-xs">
                    <span className={cn("font-mono font-bold", upPct >= 99 ? "text-emerald-500" : upPct >= 90 ? "text-amber-500" : "text-rose-500")}>
                      {upPct}% up
                    </span>
                    {avgMs !== undefined && (
                      <span className="font-mono text-muted-foreground">{avgMs}ms avg</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void runOnce(t.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Run now"
                    >
                      <RotateCw className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => clearHistory(t.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Clear history"
                    >
                      <Eraser className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-rose-500"
                      aria-label="Remove target"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex h-3 flex-wrap items-stretch gap-[1px] overflow-hidden rounded">
                  {t.history.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">No checks yet — start polling.</span>
                  ) : (
                    t.history.slice(-HISTORY_CAP).map((h, i) => (
                      <span
                        key={i}
                        className={cn("h-3 flex-1 min-w-[3px]", OUTCOME_STYLE[h.outcome])}
                        title={`${new Date(h.at).toLocaleTimeString()} — ${h.outcome}${h.rttMs ? ` (${h.rttMs}ms)` : ""}`}
                      />
                    ))
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Every {t.intervalSec}s · {t.history.length} checks
                  </span>
                  {last && (
                    <span className="font-mono">
                      Last: <span className={cn("font-semibold", last.outcome === "up" ? "text-emerald-500" : last.outcome === "timeout" ? "text-amber-500" : "text-rose-500")}>{last.outcome}</span> · {new Date(last.at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs text-sky-700 dark:text-sky-300">
        <h2 className="mb-1 flex items-center gap-1.5 font-semibold">
          <Info className="size-4" />
          How it works
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Each check is a fetch with <code className="font-mono">mode: no-cors</code> — the browser returns an opaque response, enough to tell up / down / timeout.</li>
          <li>Status codes are not visible (CORS makes them opaque). For full HTTP status, use a server-side monitor like UptimeRobot or Hetzner.</li>
          <li>The monitor only runs while this tab is open. Background tab throttling may extend intervals; mobile browsers may pause altogether.</li>
          <li>Targets and history live in localStorage — clear browser data to reset.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Checks happen browser → target directly — no Toollyz server in the middle.
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
