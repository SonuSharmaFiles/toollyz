"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Megaphone,
  Pause,
  Play,
  Printer,
  Repeat,
  RotateCcw,
  Shuffle,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
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
  THEMES,
  THEME_BY_ID,
  buildPool,
  cardToCanvas,
  generateCards,
  type BingoCard,
  type BingoTheme,
  type ContentSource,
  type GridSize,
} from "@/lib/tools/bingo/bingo";

const SETTINGS_KEY = "toollyz:bingo-settings";

const CONTENT_SOURCES: { id: ContentSource; label: string }[] = [
  { id: "numbers", label: "Numbers (classic)" },
  { id: "emoji", label: "Emoji" },
  { id: "animals", label: "Animals" },
  { id: "party", label: "Party words" },
  { id: "classroom", label: "Classroom vocab" },
  { id: "custom", label: "Custom list" },
];

const GRID_OPTIONS: GridSize[] = [3, 4, 5, 6];
const COUNT_OPTIONS = [1, 5, 10, 25, 50, 100];

export default function BingoCardGenerator() {
  const [source, setSource] = React.useState<ContentSource>("numbers");
  const [customText, setCustomText] = React.useState("");
  const [gridSize, setGridSize] = React.useState<GridSize>(5);
  const [count, setCount] = React.useState(1);
  const [freeSpace, setFreeSpace] = React.useState(true);
  const [freeText, setFreeText] = React.useState("FREE");
  const [themeId, setThemeId] = React.useState("minimal");
  const [title, setTitle] = React.useState("BINGO");
  const [cards, setCards] = React.useState<BingoCard[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const theme = THEME_BY_ID[themeId] ?? THEMES[0];
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Caller mode
  const [callerPool, setCallerPool] = React.useState<string[]>([]);
  const [called, setCalled] = React.useState<string[]>([]);
  const [callerSound, setCallerSound] = React.useState(true);
  const [autoCall, setAutoCall] = React.useState(false);

  // Load + persist settings
  React.useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (p.source) setSource(p.source);
        if (p.gridSize) setGridSize(p.gridSize);
        if (p.themeId) setThemeId(p.themeId);
        if (typeof p.freeSpace === "boolean") setFreeSpace(p.freeSpace);
        if (p.title !== undefined) setTitle(p.title);
        if (p.customText) setCustomText(p.customText);
      }
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ source, gridSize, themeId, freeSpace, title, customText }),
      );
    } catch {
      /* noop */
    }
  }, [source, gridSize, themeId, freeSpace, title, customText]);

  const generate = React.useCallback(() => {
    const result = generateCards({
      source,
      customText,
      size: gridSize,
      count,
      freeSpace,
      freeText,
    });
    if (result.error) {
      setError(result.error);
      setCards([]);
      toast.error(result.error);
      return;
    }
    setError(null);
    setCards(result.cards);
  }, [source, customText, gridSize, count, freeSpace, freeText]);

  // Initial preview
  React.useEffect(() => {
    const result = generateCards({
      source: "numbers",
      customText: "",
      size: 5,
      count: 1,
      freeSpace: true,
      freeText: "FREE",
    });
    setCards(result.cards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setCustomText(text);
      setSource("custom");
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  // ─── Caller mode ──────────────────────────────────────────────
  function startCaller() {
    const pool = buildPool(source, customText, gridSize);
    if (pool.length < 2) {
      toast.error("Add more entries to start the caller");
      return;
    }
    // shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCallerPool(shuffled);
    setCalled([]);
    toast.success(`Caller ready — ${shuffled.length} items`);
  }

  const callNext = React.useCallback(() => {
    setCalled((prev) => {
      if (prev.length >= callerPool.length) {
        toast.info("All items have been called!");
        setAutoCall(false);
        return prev;
      }
      const next = callerPool[prev.length];
      if (callerSound) speakOrBeep(next);
      return [...prev, next];
    });
  }, [callerPool, callerSound]);

  // Auto-call interval
  React.useEffect(() => {
    if (!autoCall || callerPool.length === 0) return;
    const id = window.setInterval(callNext, 3000);
    return () => window.clearInterval(id);
  }, [autoCall, callerPool, callNext]);

  function resetCaller() {
    setCalled([]);
    setAutoCall(false);
  }

  // ─── Export ───────────────────────────────────────────────────
  function downloadPng() {
    if (!cards[0]) return;
    const canvas = cardToCanvas(cards[0], gridSize, theme, title, 1);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toollyz-bingo-${themeId}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Card downloaded as PNG");
    }, "image/png");
  }

  function printCards() {
    if (!cards.length) return;
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      toast.error("Pop-up blocked — allow pop-ups to print");
      return;
    }
    const cardHtml = cards
      .map((card, idx) => renderCardHtml(card, gridSize, theme, title, idx + 1))
      .join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8">
<title>${escapeHtml(title)} — Bingo cards</title>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; }
  .sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .bingo-card { background: ${theme.cardBg}; border-radius: ${theme.radius}px; padding: 16px; border: 1px solid ${theme.border}; break-inside: avoid; page-break-inside: avoid; }
  .bingo-head { background: ${theme.headerBg}; color: ${theme.headerText}; border-radius: ${theme.radius}px; padding: 10px; text-align: center; font-weight: 800; font-size: 24px; letter-spacing: 4px; margin-bottom: 12px; }
  .bingo-grid { display: grid; gap: 6px; }
  .bingo-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; text-align: center; border: 2px solid ${theme.border}; border-radius: ${Math.round(theme.radius * 0.6)}px; font-weight: 700; font-size: 16px; padding: 4px; word-break: break-word; }
  .bingo-foot { margin-top: 10px; text-align: center; font-size: 10px; opacity: 0.5; color: ${theme.cellText}; }
  @media print { body { background: #fff; padding: 0; } .sheet { gap: 16px; } }
</style></head><body>
<div class="sheet">${cardHtml}</div>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));</script>
</body></html>`);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ─── Controls ──────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Content</Label>
              <Select value={source} onValueChange={(v) => v && setSource(v as ContentSource)}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_SOURCES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={themeId} onValueChange={(v) => v && setThemeId(v)}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {source === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="bingo-custom">Your entries (one per line or comma-separated)</Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) onFile(f);
                }}
                className={cn(
                  "rounded-xl border transition-colors",
                  isDragging ? "border-primary/60 ring-2 ring-primary/20" : "border-transparent",
                )}
              >
                <Textarea
                  id="bingo-custom"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={"Apple\nBanana\nCherry\n…or drop a .txt/.csv file"}
                  rows={5}
                  className="resize-none rounded-xl font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <Upload className="size-3.5" />
                  Upload .txt / .csv
                </button>
                <span>
                  {customText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).length} entries
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.csv,text/plain,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
                className="hidden"
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Grid size</Label>
              <div className="flex gap-1.5">
                {GRID_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGridSize(g)}
                    aria-pressed={gridSize === g}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                      gridSize === g
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {g}×{g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>How many cards</Label>
              <Select value={String(count)} onValueChange={(v) => v && setCount(Number(v))}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNT_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "card" : "cards"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bingo-title">Card title</Label>
              <Input
                id="bingo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="BINGO"
                maxLength={24}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Free center space</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFreeSpace((v) => !v)}
                  aria-pressed={freeSpace}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    freeSpace
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {freeSpace ? "Enabled" : "Disabled"}
                </button>
                {freeSpace && (
                  <Input
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="FREE"
                    maxLength={8}
                    className="rounded-lg"
                    aria-label="Free space text"
                  />
                )}
              </div>
              {gridSize % 2 === 0 && freeSpace && (
                <p className="text-[11px] text-amber-500">
                  Even grids have no true center — free space applies to odd sizes (3, 5).
                </p>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="lg" onClick={generate}>
              <Repeat className="size-4" />
              Generate {count > 1 ? `${count} cards` : "card"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={printCards}
              disabled={!cards.length}
            >
              <Printer className="size-4" />
              Print / PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={downloadPng}
              disabled={!cards.length}
            >
              <Download className="size-4" />
              PNG
            </Button>
          </div>
        </div>

        {/* ─── Live preview ───────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <FileText className="size-4 text-primary" />
              Live preview
            </h2>
            {cards.length > 1 && (
              <span className="text-xs text-muted-foreground">
                Showing card 1 of {cards.length}
              </span>
            )}
          </div>
          {cards[0] ? (
            <BingoCardView
              card={cards[0]}
              size={gridSize}
              theme={theme}
              title={title}
            />
          ) : (
            <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
              Generate to preview your card
            </div>
          )}
        </div>
      </div>

      {/* ─── Multi-card thumbnails ──────────────────────────────── */}
      {cards.length > 1 && (
        <section aria-label="All cards" className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">
            All {cards.length} cards
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.slice(0, 20).map((card, idx) => (
              <BingoCardView
                key={card.id}
                card={card}
                size={gridSize}
                theme={theme}
                title={title}
                compact
                index={idx + 1}
              />
            ))}
          </div>
          {cards.length > 20 && (
            <p className="text-xs text-muted-foreground">
              Showing first 20 — all {cards.length} are included when you print.
            </p>
          )}
        </section>
      )}

      {/* ─── Caller mode ────────────────────────────────────────── */}
      <CallerPanel
        callerPool={callerPool}
        called={called}
        sound={callerSound}
        autoCall={autoCall}
        onStart={startCaller}
        onCallNext={callNext}
        onToggleSound={() => setCallerSound((v) => !v)}
        onToggleAuto={() => setAutoCall((v) => !v)}
        onReset={resetCaller}
      />
    </div>
  );
}

// ─── Bingo card view (HTML) ───────────────────────────────────────────────

function BingoCardView({
  card,
  size,
  theme,
  title,
  compact,
  index,
}: {
  card: BingoCard;
  size: GridSize;
  theme: BingoTheme;
  title: string;
  compact?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden border"
      style={{
        background: theme.cardBg,
        borderColor: theme.border,
        borderRadius: theme.radius,
        padding: compact ? 8 : 16,
      }}
    >
      {title && (
        <div
          className="text-center font-bold tracking-[0.3em]"
          style={{
            background: theme.headerBg,
            color: theme.headerText,
            borderRadius: theme.radius * 0.7,
            padding: compact ? "4px" : "8px",
            fontSize: compact ? 11 : 22,
            marginBottom: compact ? 6 : 12,
          }}
        >
          {title}
        </div>
      )}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gap: compact ? 3 : 6,
        }}
      >
        {card.cells.map((cell, i) => {
          const isFree = i === card.freeIndex;
          const row = Math.floor(i / size);
          const col = i % size;
          const alt = (row + col) % 2 === 1;
          return (
            <div
              key={i}
              className="flex aspect-square items-center justify-center text-center font-bold leading-tight"
              style={{
                background: isFree ? theme.freeBg : alt ? theme.cellAltBg : theme.cellBg,
                color: isFree ? theme.freeText : theme.cellText,
                border: `2px solid ${theme.border}`,
                borderRadius: theme.radius * 0.5,
                fontSize: compact ? 8 : cell.length > 6 ? 11 : 15,
                padding: compact ? 1 : 3,
                wordBreak: "break-word",
                overflow: "hidden",
              }}
            >
              {cell}
            </div>
          );
        })}
      </div>
      {index && (
        <div
          className="mt-1 text-center text-[9px] opacity-50"
          style={{ color: theme.cellText }}
        >
          Card #{index}
        </div>
      )}
    </motion.div>
  );
}

// ─── Caller panel ─────────────────────────────────────────────────────────

function CallerPanel({
  callerPool,
  called,
  sound,
  autoCall,
  onStart,
  onCallNext,
  onToggleSound,
  onToggleAuto,
  onReset,
}: {
  callerPool: string[];
  called: string[];
  sound: boolean;
  autoCall: boolean;
  onStart: () => void;
  onCallNext: () => void;
  onToggleSound: () => void;
  onToggleAuto: () => void;
  onReset: () => void;
}) {
  const current = called[called.length - 1];
  const active = callerPool.length > 0;

  return (
    <section
      aria-label="Bingo caller"
      className="rounded-2xl border border-border/70 bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Megaphone className="size-4 text-primary" />
          Caller mode
          {active && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {called.length}/{callerPool.length} called
            </span>
          )}
        </h2>
        <div className="flex gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={onToggleSound}>
            {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onStart}>
            <Shuffle className="size-3.5" />
            {active ? "Reshuffle" : "Start caller"}
          </Button>
        </div>
      </div>

      {!active ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Start the caller to draw items from your content pool one at a time —
          perfect for hosting a live game. Uses your current content selection.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Current call */}
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-6 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Now calling
            </span>
            <motion.span
              key={current ?? "none"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-heading text-4xl font-bold tracking-tight"
            >
              {current ?? "—"}
            </motion.span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={onCallNext}
              disabled={called.length >= callerPool.length}
            >
              <Megaphone className="size-4" />
              Call next
            </Button>
            <Button type="button" variant="outline" onClick={onToggleAuto}>
              {autoCall ? <Pause className="size-4" /> : <Play className="size-4" />}
              {autoCall ? "Pause auto-call" : "Auto-call (3s)"}
            </Button>
            <Button type="button" variant="ghost" onClick={onReset}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>

          {/* History */}
          {called.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[...called].reverse().map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    i === 0
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

let speechCtx: AudioContext | null = null;
function speakOrBeep(text: string) {
  // Prefer speech synthesis; fall back to a beep
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    speechCtx = speechCtx ?? new Ctx();
    const now = speechCtx.currentTime;
    const osc = speechCtx.createOscillator();
    osc.frequency.value = 880;
    const g = speechCtx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(g);
    g.connect(speechCtx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    /* noop */
  }
}

function renderCardHtml(
  card: BingoCard,
  size: GridSize,
  theme: BingoTheme,
  title: string,
  index: number,
): string {
  const cells = card.cells
    .map((cell, i) => {
      const isFree = i === card.freeIndex;
      const row = Math.floor(i / size);
      const col = i % size;
      const alt = (row + col) % 2 === 1;
      const bg = isFree ? theme.freeBg : alt ? theme.cellAltBg : theme.cellBg;
      const color = isFree ? theme.freeText : theme.cellText;
      return `<div class="bingo-cell" style="background:${bg};color:${color}">${escapeHtml(cell)}</div>`;
    })
    .join("");
  return `<div class="bingo-card">
    ${title ? `<div class="bingo-head">${escapeHtml(title)}</div>` : ""}
    <div class="bingo-grid" style="grid-template-columns:repeat(${size},1fr)">${cells}</div>
    <div class="bingo-foot">Card #${index} · toollyz.com</div>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c,
  );
}
