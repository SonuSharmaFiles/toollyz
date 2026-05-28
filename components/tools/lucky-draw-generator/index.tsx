"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Copy,
  Download,
  Plus,
  Shuffle,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  Wand2,
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
  DRAW_TEMPLATES,
  dedupeParticipants,
  parseParticipants,
  pickWinners,
  playCountdown,
  playTick,
  playWin,
  randomItem,
  tierLabel,
  winnerCardCanvas,
  winnersToCsv,
} from "@/lib/tools/lucky-draw/draw";

const SETTINGS_KEY = "toollyz:luckydraw-settings";

const WINNER_PRESETS = [1, 3, 5, 10];

interface DrawRecord {
  id: string;
  winners: string[];
  title: string;
  at: number;
}

export default function LuckyDrawGenerator() {
  const reduceMotion = useReducedMotion();
  const [participants, setParticipants] = React.useState<string[]>(
    DRAW_TEMPLATES[0].participants,
  );
  const [draft, setDraft] = React.useState("");
  const [winnerCount, setWinnerCount] = React.useState(1);
  const [title, setTitle] = React.useState(DRAW_TEMPLATES[0].title);
  const [prize, setPrize] = React.useState(DRAW_TEMPLATES[0].prize);
  const [eliminate, setEliminate] = React.useState(true);
  const [soundOn, setSoundOn] = React.useState(true);
  const [activeTemplate, setActiveTemplate] = React.useState<string | null>("classroom");

  const [drawing, setDrawing] = React.useState(false);
  const [reelName, setReelName] = React.useState<string | null>(null);
  const [winners, setWinners] = React.useState<string[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [confetti, setConfetti] = React.useState(false);
  const [history, setHistory] = React.useState<DrawRecord[]>([]);

  const fileRef = React.useRef<HTMLInputElement>(null);
  const reelTimer = React.useRef<number | null>(null);

  // Load + persist
  React.useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p.participants) && p.participants.length)
          setParticipants(p.participants);
        if (typeof p.winnerCount === "number") setWinnerCount(p.winnerCount);
        if (p.title) setTitle(p.title);
        if (p.prize) setPrize(p.prize);
        if (typeof p.soundOn === "boolean") setSoundOn(p.soundOn);
        if (typeof p.eliminate === "boolean") setEliminate(p.eliminate);
        if (p.activeTemplate !== undefined) setActiveTemplate(p.activeTemplate);
      }
      const h = localStorage.getItem(SETTINGS_KEY + ":history");
      if (h) setHistory(JSON.parse(h));
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          participants,
          winnerCount,
          title,
          prize,
          soundOn,
          eliminate,
          activeTemplate,
        }),
      );
    } catch {
      /* noop */
    }
  }, [participants, winnerCount, title, prize, soundOn, eliminate, activeTemplate]);

  React.useEffect(() => {
    return () => {
      if (reelTimer.current) window.clearTimeout(reelTimer.current);
    };
  }, []);

  function loadTemplate(id: string) {
    const t = DRAW_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setParticipants(t.participants);
    setTitle(t.title);
    setPrize(t.prize);
    setActiveTemplate(t.id);
    setWinners([]);
    setReelName(null);
    toast.success(`Loaded "${t.label}"`);
  }

  const startDraw = React.useCallback(() => {
    if (drawing) return;
    if (participants.length < 2) {
      toast.error("Add at least 2 participants");
      return;
    }
    const n = Math.min(winnerCount, participants.length);
    const picked = pickWinners(participants, n);
    setDrawing(true);
    setWinners([]);
    setReelName(null);

    const duration = reduceMotion ? 600 : 3200;
    const start = performance.now();

    function step() {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / duration);
      if (progress >= 1) {
        setReelName(picked[0]);
        finish(picked, n);
        return;
      }
      setReelName(randomItem(participants));
      if (soundOn) playTick();
      // accelerating delay → decelerating flicker
      const delay = 35 + progress * progress * 240;
      reelTimer.current = window.setTimeout(step, delay);
    }

    function finish(won: string[], _n: number) {
      setDrawing(false);
      setWinners(won);
      setShowModal(true);
      setConfetti(true);
      if (soundOn) playWin();
      window.setTimeout(() => setConfetti(false), 2400);
      setHistory((prev) => {
        const rec: DrawRecord = {
          id: crypto.randomUUID(),
          winners: won,
          title,
          at: Date.now(),
        };
        const next = [rec, ...prev].slice(0, 30);
        try {
          localStorage.setItem(SETTINGS_KEY + ":history", JSON.stringify(next));
        } catch {
          /* noop */
        }
        return next;
      });
    }

    if (soundOn && !reduceMotion) playCountdown();
    step();
  }, [drawing, participants, winnerCount, reduceMotion, soundOn, title]);

  // Spacebar
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        startDraw();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startDraw]);

  function addDraft() {
    const items = parseParticipants(draft);
    if (!items.length) return;
    setParticipants((prev) => [...prev, ...items]);
    setDraft("");
    setActiveTemplate(null);
  }

  function doDedupe() {
    setParticipants((prev) => {
      const { unique, removed } = dedupeParticipants(prev);
      if (removed > 0) toast.success(`Removed ${removed} duplicate(s)`);
      else toast.info("No duplicates found");
      return unique;
    });
  }

  function doShuffle() {
    setParticipants((prev) => {
      const a = [...prev];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    toast.success("Shuffled");
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const items = parseParticipants(String(reader.result ?? ""));
      setParticipants((prev) => [...prev, ...items]);
      setActiveTemplate(null);
      toast.success(`Imported ${items.length} participants`);
    };
    reader.readAsText(file);
  }

  function acceptWinners() {
    if (eliminate && winners.length) {
      setParticipants((prev) => prev.filter((p) => !winners.includes(p)));
    }
    setShowModal(false);
  }

  function copyWinners() {
    if (!winners.length) return;
    navigator.clipboard.writeText(winners.join("\n")).then(
      () => toast.success("Winners copied"),
      () => toast.error("Could not copy"),
    );
  }

  function exportCsv() {
    if (!winners.length) return;
    downloadBlob(
      new Blob([winnersToCsv(winners)], { type: "text/csv;charset=utf-8" }),
      "csv",
    );
  }

  function exportCard() {
    if (!winners.length) return;
    const canvas = winnerCardCanvas(winners, title, prize);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "png");
    }, "image/png");
  }

  function downloadBlob(blob: Blob, ext: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-luckydraw-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${ext.toUpperCase()}`);
  }

  return (
    <div className="space-y-6">
      {/* ─── Templates ────────────────────────────────────────────── */}
      <section aria-label="Quick templates" className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Wand2 className="size-4 text-primary" />
          Quick templates
        </h2>
        <div className="flex flex-wrap gap-2">
          {DRAW_TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t.id)}
                aria-pressed={activeTemplate === t.id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTemplate === t.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground/80 hover:border-primary/30 hover:bg-muted",
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ─── Participant manager ─────────────────────────────── */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ld-draft">Participants</Label>
            <div className="flex gap-2">
              <Input
                id="ld-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDraft();
                  }
                }}
                placeholder="Add a name and press Enter"
                className="rounded-lg"
              />
              <Button type="button" onClick={addDraft} disabled={!draft.trim()}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <Textarea
              value={participants.join("\n")}
              onChange={(e) => {
                setParticipants(parseParticipants(e.target.value));
                setActiveTemplate(null);
              }}
              placeholder={"Or paste a list — one per line…"}
              rows={6}
              className="resize-none rounded-xl font-mono text-sm"
              aria-label="All participants"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{participants.length} participants</span>
              <div className="flex gap-1.5">
                <Button type="button" variant="ghost" size="sm" onClick={doShuffle}>
                  <Shuffle className="size-3.5" />
                  Shuffle
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={doDedupe}>
                  <Sparkles className="size-3.5" />
                  Dedupe
                </Button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium hover:bg-muted"
                >
                  <Download className="size-3.5 rotate-180" />
                  Import
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParticipants([]);
                    setActiveTemplate(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Winners to pick</Label>
              <div className="flex gap-1.5">
                {WINNER_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWinnerCount(n)}
                    aria-pressed={winnerCount === n}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                      winnerCount === n
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ld-prize">Prize label</Label>
              <Input
                id="ld-prize"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="Grand prize"
                maxLength={32}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ld-title">Draw title</Label>
            <Input
              id="ld-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lucky Draw"
              maxLength={40}
              className="rounded-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <ToggleChip
              active={eliminate}
              onClick={() => setEliminate((v) => !v)}
              label="Remove winners after draw"
            />
            <ToggleChip
              active={soundOn}
              onClick={() => setSoundOn((v) => !v)}
              label={soundOn ? "Sound" : "Muted"}
              icon={soundOn ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
            />
          </div>
        </div>

        {/* ─── Draw stage ──────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-8 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.25), transparent 70%)",
              }}
            />
            {confetti && <Confetti />}
            <div className="relative space-y-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-200/70">
                {prize || "Lucky draw"}
              </p>
              {/* Reel display */}
              <div className="flex min-h-24 items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reelName ?? "idle"}
                    initial={{ opacity: 0, y: drawing ? 16 : 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: drawing ? -16 : 0 }}
                    transition={{ duration: drawing ? 0.08 : 0.3 }}
                    className={cn(
                      "break-words px-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl",
                      drawing ? "text-indigo-200 blur-[0.4px]" : "text-white",
                    )}
                  >
                    {reelName ?? "Ready to draw"}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Winners podium */}
              {winners.length > 0 && !drawing && (
                <ul className="mx-auto flex max-w-md flex-col gap-1.5 list-none">
                  {winners.map((w, i) => {
                    const tier = tierLabel(i);
                    return (
                      <motion.li
                        key={`${w}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-left backdrop-blur-sm"
                      >
                        <span className="text-lg">{tier.medal}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                          {w}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-indigo-200/60">
                          {tier.place}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              )}

              <Button
                type="button"
                size="lg"
                onClick={startDraw}
                disabled={drawing || participants.length < 2}
                className="h-12 min-w-48 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:opacity-90"
              >
                <Trophy className="size-5" />
                {drawing ? "Drawing…" : "Start lucky draw"}
              </Button>
              <p className="text-[11px] text-indigo-200/50">
                Fair draw · powered by your browser&apos;s secure random generator
              </p>
            </div>
          </div>

          {winners.length > 0 && !drawing && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyWinners}>
                <Copy className="size-3.5" />
                Copy
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportCard}>
                <Download className="size-3.5" />
                Winner card
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
                <Download className="size-3.5" />
                CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─── History ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <section aria-label="Draw history" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Trophy className="size-4 text-amber-500" />
              Past draws
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {history.length}
              </span>
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setHistory([]);
                try {
                  localStorage.removeItem(SETTINGS_KEY + ":history");
                } catch {
                  /* noop */
                }
              }}
            >
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-2 list-none">
            {history.slice(0, 10).map((rec) => (
              <li
                key={rec.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-sm"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {new Date(rec.at).toLocaleString()}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium">{rec.title}</span>
                <span className="text-muted-foreground">·</span>
                <span className="flex flex-wrap gap-1">
                  {rec.winners.map((w, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                    >
                      {tierLabel(i).medal} {w}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Winner modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && winners.length > 0 && (
          <WinnerModal
            winners={winners}
            title={title}
            prize={prize}
            eliminate={eliminate}
            onClose={acceptWinners}
            onCopy={copyWinners}
            onCard={exportCard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Winner modal ─────────────────────────────────────────────────────────

function WinnerModal({
  winners,
  title,
  prize,
  eliminate,
  onClose,
  onCopy,
  onCard,
}: {
  winners: string[];
  title: string;
  prize: string;
  eliminate: boolean;
  onClose: () => void;
  onCopy: () => void;
  onCard: () => void;
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
      aria-label="Lucky draw winners"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"
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
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
        >
          <Trophy className="size-8" />
        </motion.div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {prize} · {title}
        </p>
        <h3 className="mt-1 font-heading text-2xl font-bold tracking-tight">
          {winners.length === 1 ? "We have a winner!" : `${winners.length} winners!`}
        </h3>
        <ul className="mt-5 space-y-2 list-none text-left">
          {winners.map((w, i) => {
            const tier = tierLabel(i);
            return (
              <motion.li
                key={`${w}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3"
              >
                <span className="text-2xl">{tier.medal}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{w}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {tier.place}
                </span>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={onCard}>
            <Download className="size-4" />
            Winner card
          </Button>
          <Button type="button" variant="outline" onClick={onCopy}>
            <Copy className="size-4" />
            Copy
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
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
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerWidth : 800),
        rotate: Math.random() * 720,
        delay: Math.random() * 0.3,
        color: ["#fbbf24", "#f59e0b", "#6366f1", "#22d3ee", "#f472b6", "#34d399"][i % 6],
      })),
    [],
  );
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] grid place-items-start justify-center pt-10">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: 0,
            x: p.x,
            y: typeof window !== "undefined" ? window.innerHeight : 800,
            rotate: p.rotate,
          }}
          transition={{ duration: 2.2, delay: p.delay, ease: "easeOut" }}
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
