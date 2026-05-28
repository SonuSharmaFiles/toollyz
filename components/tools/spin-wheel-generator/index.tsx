"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Download,
  Plus,
  Repeat,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  THEME_BY_ID,
  WHEEL_THEMES,
  computeTargetRotation,
  fairIndex,
  parseEntries,
  playTick,
  playWin,
  readableText,
  segmentPath,
  polarToXY,
  type WheelTheme,
} from "@/lib/tools/wheel/wheel";

const SETTINGS_KEY = "toollyz:wheel-settings";
const WHEELS_KEY = "toollyz:wheel-saved";

const DEFAULT_ENTRIES = [
  "Pizza",
  "Sushi",
  "Burgers",
  "Tacos",
  "Pasta",
  "Salad",
];

interface WinRecord {
  id: string;
  name: string;
  at: number;
}

export default function SpinWheelGenerator() {
  const reduceMotion = useReducedMotion();
  const [entries, setEntries] = React.useState<string[]>(DEFAULT_ENTRIES);
  const [draft, setDraft] = React.useState("");
  const [themeId, setThemeId] = React.useState("neon");
  const [eliminate, setEliminate] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(true);
  const [spinSeconds, setSpinSeconds] = React.useState(5);

  const [rotation, setRotation] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [winner, setWinner] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [confetti, setConfetti] = React.useState(false);
  const [history, setHistory] = React.useState<WinRecord[]>([]);

  const theme = THEME_BY_ID[themeId] ?? WHEEL_THEMES[0];
  const tickTimers = React.useRef<number[]>([]);

  // Load + persist settings
  React.useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p.entries) && p.entries.length) setEntries(p.entries);
        if (p.themeId) setThemeId(p.themeId);
        if (typeof p.soundOn === "boolean") setSoundOn(p.soundOn);
        if (typeof p.spinSeconds === "number") setSpinSeconds(p.spinSeconds);
      }
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ entries, themeId, soundOn, spinSeconds }),
      );
    } catch {
      /* noop */
    }
  }, [entries, themeId, soundOn, spinSeconds]);

  React.useEffect(() => {
    return () => tickTimers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  function scheduleTicks(duration: number) {
    tickTimers.current.forEach((t) => window.clearTimeout(t));
    tickTimers.current = [];
    if (!soundOn) return;
    // ticks that slow down toward the end (ease-out feel)
    let t = 0;
    let interval = 60;
    while (t < duration * 1000) {
      const timer = window.setTimeout(() => playTick(), t);
      tickTimers.current.push(timer);
      t += interval;
      interval *= 1.12; // decelerate
    }
  }

  const spin = React.useCallback(() => {
    if (spinning || entries.length < 2) {
      if (entries.length < 2) toast.error("Add at least 2 entries to spin");
      return;
    }
    const winnerIndex = fairIndex(entries.length);
    setSpinning(true);
    setWinner(null);
    const duration = reduceMotion ? 0.6 : spinSeconds;
    const target = computeTargetRotation(
      rotation,
      winnerIndex,
      entries.length,
      reduceMotion ? 2 : 6,
    );
    setRotation(target);
    scheduleTicks(duration);

    window.setTimeout(
      () => {
        const win = entries[winnerIndex];
        setWinner(win);
        setSpinning(false);
        setShowModal(true);
        setConfetti(true);
        if (soundOn) playWin();
        window.setTimeout(() => setConfetti(false), 2200);
        setHistory((prev) => [
          { id: crypto.randomUUID(), name: win, at: Date.now() },
          ...prev,
        ].slice(0, 50));
      },
      duration * 1000 + 100,
    );
  }, [spinning, entries, rotation, spinSeconds, reduceMotion, soundOn]);

  function addDraft() {
    const items = parseEntries(draft);
    if (!items.length) return;
    setEntries((prev) => Array.from(new Set([...prev, ...items])));
    setDraft("");
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function shuffleEntries() {
    setEntries((prev) => {
      const a = [...prev];
      for (let i = a.length - 1; i > 0; i--) {
        const j = fairIndex(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    toast.success("Shuffled");
  }

  function dedupe() {
    setEntries((prev) => {
      const unique = Array.from(new Set(prev));
      if (unique.length !== prev.length) {
        toast.success(`Removed ${prev.length - unique.length} duplicate(s)`);
      } else {
        toast.info("No duplicates found");
      }
      return unique;
    });
  }

  function clearEntries() {
    setEntries([]);
    setWinner(null);
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const items = parseEntries(String(reader.result ?? ""));
      setEntries((prev) => Array.from(new Set([...prev, ...items])));
      toast.success(`Imported ${items.length} entries`);
    };
    reader.readAsText(file);
  }

  function acceptWinner() {
    if (eliminate && winner) {
      setEntries((prev) => prev.filter((e) => e !== winner));
    }
    setShowModal(false);
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ entries, theme: themeId, history }, null, 2)],
      { type: "application/json;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-wheel-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Wheel exported");
  }

  function exportPng() {
    const svg = document.getElementById("spin-wheel-svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 720, 720);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `toollyz-wheel-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Wheel image downloaded");
      }, "image/png");
    };
    img.src = `data:image/svg+xml;base64,${svg64}`;
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ─── Controls ──────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wheel-draft">Add entries</Label>
            <div className="flex gap-2">
              <Input
                id="wheel-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDraft();
                  }
                }}
                placeholder="Type an entry and press Enter"
                className="rounded-lg"
              />
              <Button type="button" onClick={addDraft} disabled={!draft.trim()}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <Textarea
              value={entries.join("\n")}
              onChange={(e) => setEntries(parseEntries(e.target.value))}
              placeholder={"Or paste a list — one per line…"}
              rows={5}
              className="resize-none rounded-xl font-mono text-sm"
              aria-label="All entries"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{entries.length} entries</span>
              <div className="flex gap-1.5">
                <Button type="button" variant="ghost" size="sm" onClick={shuffleEntries}>
                  <Shuffle className="size-3.5" />
                  Shuffle
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={dedupe}>
                  <Sparkles className="size-3.5" />
                  Dedupe
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-muted">
                  <Download className="size-3.5 rotate-180" />
                  Import
                  <input
                    type="file"
                    accept=".txt,.csv,text/plain,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                    }}
                  />
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={clearEntries}>
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={themeId} onValueChange={(v) => v && setThemeId(v)}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WHEEL_THEMES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Spin duration</Label>
              <Select
                value={String(spinSeconds)}
                onValueChange={(v) => v && setSpinSeconds(Number(v))}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Quick (3s)</SelectItem>
                  <SelectItem value="5">Normal (5s)</SelectItem>
                  <SelectItem value="8">Dramatic (8s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToggleChip
              active={eliminate}
              onClick={() => setEliminate((v) => !v)}
              label="Elimination mode"
            />
            <ToggleChip
              active={soundOn}
              onClick={() => setSoundOn((v) => !v)}
              label={soundOn ? "Sound on" : "Sound off"}
              icon={
                soundOn ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={exportPng} disabled={entries.length < 2}>
              <Download className="size-3.5" />
              PNG
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportJson} disabled={!entries.length}>
              <Download className="size-3.5" />
              JSON
            </Button>
          </div>
        </div>

        {/* ─── Wheel ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5">
          <Wheel
            entries={entries}
            theme={theme}
            rotation={rotation}
            spinning={spinning}
            duration={reduceMotion ? 0.6 : spinSeconds}
            onSpin={spin}
          />
          <Button
            type="button"
            size="lg"
            onClick={spin}
            disabled={spinning || entries.length < 2}
            className="min-w-40"
          >
            <Repeat className={cn("size-4", spinning && "animate-spin")} />
            {spinning ? "Spinning…" : "Spin the wheel"}
          </Button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <section aria-label="Winner history" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Trophy className="size-4 text-amber-500" />
              Winners
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {history.length}
              </span>
            </h2>
            <Button type="button" variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((w, i) => (
              <span
                key={w.id}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium",
                  i === 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground",
                )}
              >
                {w.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Winner modal */}
      <AnimatePresence>
        {showModal && winner && (
          <WinnerModal
            winner={winner}
            eliminate={eliminate}
            onClose={acceptWinner}
            onSpinAgain={() => {
              setShowModal(false);
              if (eliminate) {
                setEntries((prev) => prev.filter((e) => e !== winner));
              }
              window.setTimeout(spin, 200);
            }}
          />
        )}
      </AnimatePresence>

      {confetti && <Confetti />}
    </div>
  );
}

// ─── Wheel (SVG) ──────────────────────────────────────────────────────────

function Wheel({
  entries,
  theme,
  rotation,
  spinning,
  duration,
  onSpin,
}: {
  entries: string[];
  theme: WheelTheme;
  rotation: number;
  spinning: boolean;
  duration: number;
  onSpin: () => void;
}) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const n = entries.length;

  if (n < 2) {
    return (
      <div className="grid aspect-square w-full max-w-[360px] place-items-center rounded-full border-2 border-dashed border-border bg-card/40 text-center text-sm text-muted-foreground">
        Add at least 2 entries
        <br />
        to build your wheel
      </div>
    );
  }

  const seg = 360 / n;

  return (
    <div className="relative aspect-square w-full max-w-[360px]">
      {/* Pointer */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34">
          <path d="M17 32 L4 6 Q17 16 30 6 Z" fill={theme.pointer} stroke="rgba(0,0,0,0.15)" />
        </svg>
      </div>

      <motion.svg
        id="spin-wheel-svg"
        viewBox={`0 0 ${size} ${size}`}
        className="size-full cursor-pointer"
        onClick={() => !spinning && onSpin()}
        animate={{ rotate: rotation }}
        transition={{
          duration,
          ease: spinning ? [0.16, 1, 0.3, 1] : "linear",
        }}
        style={{ transformOrigin: "center" }}
      >
        <circle cx={cx} cy={cy} r={r + 4} fill={theme.stroke} />
        {entries.map((entry, i) => {
          const start = i * seg;
          const end = start + seg;
          const color = theme.colors[i % theme.colors.length];
          const mid = start + seg / 2;
          const [tx, ty] = polarToXY(cx, cy, r * 0.62, mid);
          const textColor = readableText(color);
          const label = entry.length > 14 ? entry.slice(0, 13) + "…" : entry;
          return (
            <g key={i}>
              <path d={segmentPath(cx, cy, r, start, end)} fill={color} stroke={theme.stroke} strokeWidth={2} />
              <text
                x={tx}
                y={ty}
                fill={textColor}
                fontSize={n > 12 ? 9 : n > 8 ? 11 : 13}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid}, ${tx}, ${ty})`}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </motion.svg>

      {/* Center hub */}
      <button
        type="button"
        onClick={() => !spinning && onSpin()}
        disabled={spinning}
        aria-label="Spin"
        className="absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ring-4 ring-white/30 transition-transform active:scale-95"
        style={{ background: theme.centerBg, color: theme.centerText }}
      >
        Spin
      </button>
    </div>
  );
}

// ─── Winner modal ─────────────────────────────────────────────────────────

function WinnerModal({
  winner,
  eliminate,
  onClose,
  onSpinAgain,
}: {
  winner: string;
  eliminate: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Winner"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
        >
          <Trophy className="size-8" />
        </motion.div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          And the winner is
        </p>
        <h3 className="mt-1 break-words font-heading text-3xl font-bold tracking-tight">
          {winner}
        </h3>
        <div className="mt-6 flex justify-center gap-2">
          <Button type="button" onClick={onSpinAgain}>
            <Repeat className="size-4" />
            Spin again
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {eliminate ? "Remove & close" : "Done"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * window.innerWidth,
        rotate: Math.random() * 720,
        delay: Math.random() * 0.3,
        color: ["#fbbf24", "#6366f1", "#22d3ee", "#f472b6", "#34d399", "#f97316"][i % 6],
      })),
    [],
  );
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] grid place-items-start justify-center pt-10">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: window.innerHeight, rotate: p.rotate }}
          transition={{ duration: 2, delay: p.delay, ease: "easeOut" }}
          className="absolute size-2.5 rounded-[2px]"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}

// ─── Toggle chip ──────────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      {icon ?? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-1.5 rounded-full transition-colors",
            active ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
      )}
      {label}
    </button>
  );
}
