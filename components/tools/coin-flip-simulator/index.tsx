"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Coins,
  Download,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  COIN_STYLES,
  COIN_STYLE_BY_ID,
  DECISION_LABELS,
  computeStats,
  fairFlip,
  fairFlipMany,
  flipsToCsv,
  playFlipSound,
  playLandSound,
  type CoinStyle,
  type DecisionMode,
  type FlipRecord,
  type FlipResult,
} from "@/lib/tools/coin/coin";

const HISTORY_KEY = "toollyz:coinflip-history";
const SETTINGS_KEY = "toollyz:coinflip-settings";
const MAX_HISTORY = 200;

const MULTI_OPTIONS = [5, 10, 25, 50, 100];

export default function CoinFlipSimulator() {
  const reduceMotion = useReducedMotion();
  const [style, setStyle] = React.useState<CoinStyle>("gold");
  const [decision, setDecision] = React.useState<DecisionMode>("heads-tails");
  const [soundOn, setSoundOn] = React.useState(true);
  const [history, setHistory] = React.useState<FlipRecord[]>([]);

  const [rotation, setRotation] = React.useState(0);
  const [isFlipping, setIsFlipping] = React.useState(false);
  const [result, setResult] = React.useState<FlipResult | null>(null);
  const [confetti, setConfetti] = React.useState(false);

  const labels = DECISION_LABELS[decision];
  const stats = React.useMemo(() => computeStats(history), [history]);
  const styleConfig = COIN_STYLE_BY_ID[style];

  // Load saved state
  React.useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.style) setStyle(parsed.style);
        if (parsed.decision) setDecision(parsed.decision);
        if (typeof parsed.soundOn === "boolean") setSoundOn(parsed.soundOn);
      }
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ style, decision, soundOn }),
      );
    } catch {
      /* noop */
    }
  }, [style, decision, soundOn]);

  function persistHistory(next: FlipRecord[]) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, MAX_HISTORY)));
    } catch {
      /* noop */
    }
  }

  const flip = React.useCallback(() => {
    if (isFlipping) return;
    const outcome = fairFlip();
    if (soundOn) playFlipSound();
    setIsFlipping(true);
    setResult(null);

    // Compute landing rotation
    const spins = reduceMotion ? 1 : 5 + Math.floor(Math.random() * 3);
    setRotation((prev) => {
      const base = prev + spins * 360;
      const landed =
        Math.ceil(base / 360) * 360 + (outcome === "tails" ? 180 : 0);
      return landed;
    });

    const settleMs = reduceMotion ? 250 : 1400;
    window.setTimeout(() => {
      setResult(outcome);
      setIsFlipping(false);
      if (soundOn) playLandSound();
      setHistory((prev) => {
        const rec: FlipRecord = {
          id: crypto.randomUUID(),
          result: outcome,
          at: Date.now(),
        };
        const next = [rec, ...prev].slice(0, MAX_HISTORY);
        persistHistory(next);

        // Confetti on streak of 5+
        const streak = (() => {
          let len = 0;
          for (const r of next) {
            if (r.result === outcome) len++;
            else break;
          }
          return len;
        })();
        if (streak >= 5) {
          setConfetti(true);
          window.setTimeout(() => setConfetti(false), 1800);
          toast.success(`🔥 ${streak} ${outcome} in a row!`);
        }
        return next;
      });
    }, settleMs);
  }, [isFlipping, soundOn, reduceMotion]);

  function flipMany(count: number) {
    const results = fairFlipMany(count);
    const now = Date.now();
    setHistory((prev) => {
      const recs: FlipRecord[] = results.map((r, i) => ({
        id: crypto.randomUUID(),
        result: r,
        at: now + i,
      }));
      // newest first → reverse the batch so the last flip is at index 0
      const next = [...recs.reverse(), ...prev].slice(0, MAX_HISTORY);
      persistHistory(next);
      return next;
    });
    const h = results.filter((r) => r === "heads").length;
    toast.success(`Flipped ${count}× — ${h} ${labels.heads}, ${count - h} ${labels.tails}`);
  }

  // Spacebar shortcut
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        flip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip]);

  function clearHistory() {
    setHistory([]);
    persistHistory([]);
    setResult(null);
    toast.info("History cleared");
  }

  function exportCsv() {
    if (!history.length) return;
    const blob = new Blob([flipsToCsv(history)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-coinflips-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Results downloaded");
  }

  const resultLabel = result ? (result === "heads" ? labels.heads : labels.tails) : null;

  return (
    <div className="space-y-6">
      {/* ─── Hero coin stage ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-8 sm:p-12">
        {/* ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.25), transparent 70%)",
          }}
        />
        {confetti && <Confetti />}

        <div className="relative flex flex-col items-center gap-8">
          {/* Coin */}
          <div
            className="relative grid place-items-center"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              animate={{
                rotateX: rotation,
                y: isFlipping && !reduceMotion ? [-0, -90, 0] : 0,
              }}
              transition={{
                rotateX: {
                  duration: reduceMotion ? 0.25 : 1.4,
                  ease: [0.2, 0.7, 0.3, 1],
                },
                y: { duration: reduceMotion ? 0.25 : 1.4, ease: "easeOut" },
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative size-40 sm:size-48"
            >
              {/* Heads face */}
              <CoinFace
                style={styleConfig}
                label={labels.heads}
                rotate={0}
              />
              {/* Tails face */}
              <CoinFace
                style={styleConfig}
                label={labels.tails}
                rotate={180}
              />
            </motion.div>
            {/* Shadow */}
            <motion.div
              aria-hidden="true"
              animate={{
                scale: isFlipping && !reduceMotion ? [1, 0.6, 1] : 1,
                opacity: isFlipping && !reduceMotion ? [0.4, 0.15, 0.4] : 0.4,
              }}
              transition={{ duration: reduceMotion ? 0.25 : 1.4 }}
              className="mt-6 h-3 w-32 rounded-[100%] bg-black/50 blur-md"
            />
          </div>

          {/* Result text */}
          <div aria-live="polite" className="h-8 text-center">
            <AnimatePresence mode="wait">
              {resultLabel && !isFlipping && (
                <motion.p
                  key={resultLabel + history.length}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-semibold tracking-tight text-white"
                >
                  {resultLabel}
                </motion.p>
              )}
              {isFlipping && (
                <motion.p
                  key="flipping"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-indigo-200/70"
                >
                  Flipping…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Flip button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              size="lg"
              onClick={flip}
              disabled={isFlipping}
              className="h-12 min-w-44 bg-white text-slate-900 hover:bg-white/90"
            >
              <Coins className="size-5" />
              {isFlipping ? "Flipping…" : "Flip coin"}
            </Button>
            <span className="text-[11px] text-indigo-200/60">
              or press{" "}
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                Space
              </kbd>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Controls + stats ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: controls */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Coin style</Label>
            <div className="flex flex-wrap gap-2">
              {COIN_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  aria-pressed={style === s.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    style === s.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground/80 hover:bg-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-3.5 rounded-full ring-1 ring-black/10"
                    style={{ background: s.face }}
                  />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Decision mode</Label>
              <Select
                value={decision}
                onValueChange={(v) => v && setDecision(v as DecisionMode)}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DECISION_LABELS).map(([id, cfg]) => (
                    <SelectItem key={id} value={id}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sound</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSoundOn((v) => !v)}
                className="w-full justify-start gap-2"
              >
                {soundOn ? (
                  <>
                    <Volume2 className="size-4" /> On
                  </>
                ) : (
                  <>
                    <VolumeX className="size-4" /> Off
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Flip many at once</Label>
            <div className="flex flex-wrap gap-2">
              {MULTI_OPTIONS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => flipMany(n)}
                >
                  <Zap className="size-3.5" />
                  {n}×
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!history.length}
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              disabled={!history.length}
            >
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          </div>
        </div>

        {/* Right: stats dashboard */}
        <StatsDashboard stats={stats} labels={labels} />
      </div>

      {/* ─── History timeline ────────────────────────────────────── */}
      {history.length > 0 && (
        <HistoryPanel history={history} labels={labels} styleConfig={styleConfig} />
      )}
    </div>
  );
}

// ─── Coin face ───────────────────────────────────────────────────────────

function CoinFace({
  style,
  label,
  rotate,
}: {
  style: typeof COIN_STYLES[number];
  label: string;
  rotate: number;
}) {
  return (
    <div
      className="absolute inset-0 grid place-items-center rounded-full"
      style={{
        background: style.face,
        boxShadow: `${style.glow}, inset 0 0 0 6px ${style.ring}, inset 0 -8px 16px rgba(0,0,0,0.25), inset 0 8px 16px rgba(255,255,255,0.25)`,
        transform: `rotateX(${rotate}deg) translateZ(2px)`,
        backfaceVisibility: "hidden",
      }}
    >
      <span
        className="select-none text-center font-heading text-xl font-bold uppercase tracking-wider sm:text-2xl"
        style={{ color: style.text }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 400,
        rotate: Math.random() * 720,
        delay: Math.random() * 0.2,
        color: ["#fbbf24", "#6366f1", "#22d3ee", "#f472b6", "#34d399"][i % 5],
      })),
    [],
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: 300, rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
          className="absolute size-2 rounded-[2px]"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}

// ─── Stats dashboard ─────────────────────────────────────────────────────

function StatsDashboard({
  stats,
  labels,
}: {
  stats: ReturnType<typeof computeStats>;
  labels: { heads: string; tails: string };
}) {
  return (
    <section
      aria-label="Statistics"
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-5"
    >
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Total flips" value={stats.total} />
        <StatTile label={labels.heads} value={stats.heads} accent="indigo" />
        <StatTile label={labels.tails} value={stats.tails} accent="violet" />
      </div>

      {/* Distribution bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {labels.heads}{" "}
            <span className="font-mono text-foreground">{stats.headsPct}%</span>
          </span>
          <span>
            {labels.tails}{" "}
            <span className="font-mono text-foreground">{stats.tailsPct}%</span>
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-indigo-500"
            animate={{ width: `${stats.total ? stats.headsPct : 50}%` }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="h-full bg-violet-500"
            animate={{ width: `${stats.total ? stats.tailsPct : 50}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {stats.total > 0 && (
          <p className="text-[11px] text-muted-foreground">
            With a fair coin, both sides converge toward 50% as you flip more.
          </p>
        )}
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-background p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Current streak
          </div>
          <div className="mt-1 text-sm font-semibold">
            {stats.currentStreak
              ? `${stats.currentStreak.length}× ${
                  stats.currentStreak.result === "heads" ? labels.heads : labels.tails
                }`
              : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Longest streak
          </div>
          <div className="mt-1 text-sm font-semibold">
            {stats.longestStreak
              ? `${stats.longestStreak.length}× ${
                  stats.longestStreak.result === "heads" ? labels.heads : labels.tails
                }`
              : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "indigo" | "violet";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3 text-center">
      <div
        className={cn(
          "font-mono text-2xl font-bold tabular-nums",
          accent === "indigo" && "text-indigo-500",
          accent === "violet" && "text-violet-500",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

// ─── History panel ───────────────────────────────────────────────────────

function HistoryPanel({
  history,
  labels,
  styleConfig,
}: {
  history: FlipRecord[];
  labels: { heads: string; tails: string };
  styleConfig: typeof COIN_STYLES[number];
}) {
  return (
    <section aria-label="Flip history" className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Sparkles className="size-4 text-primary" />
        Recent flips
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {history.length}
        </span>
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {history.slice(0, 60).map((rec) => (
          <span
            key={rec.id}
            title={`${rec.result === "heads" ? labels.heads : labels.tails} · ${new Date(rec.at).toLocaleTimeString()}`}
            className="grid size-8 place-items-center rounded-full text-[9px] font-bold uppercase ring-1 ring-black/10"
            style={{
              background: styleConfig.face,
              color: styleConfig.text,
            }}
          >
            {(rec.result === "heads" ? labels.heads : labels.tails).charAt(0)}
          </span>
        ))}
      </div>
    </section>
  );
}
