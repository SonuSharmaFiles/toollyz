"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlarmClock,
  Check,
  Copy,
  Download,
  History,
  Hash,
  KeyRound,
  Lightbulb,
  Lock,
  Repeat,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatOtp,
  generateBatch,
  toCsv,
  toJson,
  toTxt,
  type GenerateOptions,
  type OtpType,
} from "@/lib/tools/otp/generator";

const HISTORY_KEY = "toollyz:otp-history";
const FAVORITES_KEY = "toollyz:otp-favorites";
const MAX_HISTORY = 12;

const TYPES: { id: OtpType; label: string; hint: string }[] = [
  { id: "numeric", label: "Numeric", hint: "Digits only (0–9) — most common SMS OTPs." },
  { id: "alphanumeric", label: "Alphanumeric", hint: "Letters + digits — stronger, longer-living codes." },
  { id: "hex", label: "Hex", hint: "0–9 and A–F — useful for technical / API codes." },
  { id: "pin", label: "PIN", hint: "Numeric PIN — short, memorable, app/device locks." },
  { id: "verification", label: "Verification", hint: "6-char uppercase alphanumeric — email-style codes." },
  { id: "backup", label: "Backup recovery", hint: "Grouped 8/16-char codes — print and store offline." },
];

const TIMER_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "60 seconds" },
  { value: "120", label: "2 minutes" },
  { value: "300", label: "5 minutes" },
] as const;

const QUANTITY_OPTIONS = [1, 5, 10, 25, 50, 100];
const LENGTH_PRESETS = [4, 6, 8, 10, 12];

interface HistoryEntry {
  id: string;
  code: string;
  type: OtpType;
  createdAt: number;
}

export default function OtpGenerator() {
  const [type, setType] = React.useState<OtpType>("numeric");
  const [length, setLength] = React.useState(6);
  const [count, setCount] = React.useState(1);
  const [uppercase, setUppercase] = React.useState(true);
  const [lowercase, setLowercase] = React.useState(false);
  const [numbers, setNumbers] = React.useState(true);
  const [symbols, setSymbols] = React.useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = React.useState(true);
  const [avoidRepeats, setAvoidRepeats] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState<string>("60");
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  const [results, setResults] = React.useState<string[]>([]);
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = React.useState<HistoryEntry[]>([]);

  // ─── Length presets per type ──────────────────────────────────────
  const lengthBounds = React.useMemo(() => {
    switch (type) {
      case "pin": return { min: 4, max: 10, defaultLen: 6 };
      case "verification": return { min: 4, max: 10, defaultLen: 6 };
      case "backup": return { min: 8, max: 24, defaultLen: 16 };
      case "hex": return { min: 4, max: 24, defaultLen: 8 };
      default: return { min: 4, max: 16, defaultLen: 6 };
    }
  }, [type]);

  // Clamp length when type changes
  React.useEffect(() => {
    if (length < lengthBounds.min) setLength(lengthBounds.min);
    if (length > lengthBounds.max) setLength(lengthBounds.max);
  }, [lengthBounds.min, lengthBounds.max, length]);

  const opts: GenerateOptions = React.useMemo(
    () => ({
      type,
      length,
      count,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeAmbiguous,
      avoidRepeats,
    }),
    [type, length, count, uppercase, lowercase, numbers, symbols, excludeAmbiguous, avoidRepeats],
  );

  function persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }

  // ─── Load history / favorites
  React.useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {
      /* noop */
    }
  }, []);

  const generate = React.useCallback(() => {
    const next = generateBatch(opts);
    setResults(next);
    if (timerSeconds !== "off") {
      setExpiresAt(Date.now() + Number(timerSeconds) * 1000);
    } else {
      setExpiresAt(null);
    }
    if (next[0]) {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        code: next[0],
        type,
        createdAt: Date.now(),
      };
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.code !== entry.code);
        const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
        persist(HISTORY_KEY, updated);
        return updated;
      });
    }
  }, [opts, timerSeconds, type]);

  // Initial generation
  React.useEffect(() => {
    setResults(generateBatch(opts));
    if (timerSeconds !== "off") {
      setExpiresAt(Date.now() + Number(timerSeconds) * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live tick for the countdown
  React.useEffect(() => {
    if (!expiresAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  // Auto-refresh when timer expires
  React.useEffect(() => {
    if (!autoRefresh || !expiresAt) return;
    if (now >= expiresAt) {
      generate();
    }
  }, [now, expiresAt, autoRefresh, generate]);

  const remaining = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const totalMs = timerSeconds === "off" ? 0 : Number(timerSeconds) * 1000;
  const progress = totalMs ? remaining / totalMs : 0;
  const isExpired = expiresAt !== null && remaining === 0;

  function toggleFavorite(entry: HistoryEntry) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.code === entry.code);
      const next = exists
        ? prev.filter((f) => f.code !== entry.code)
        : [entry, ...prev].slice(0, MAX_HISTORY);
      persist(FAVORITES_KEY, next);
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    persist(HISTORY_KEY, []);
    toast.info("History cleared");
  }

  async function copyAll() {
    if (!results.length) return;
    try {
      await navigator.clipboard.writeText(toTxt(results));
      toast.success(`Copied ${results.length} codes`);
    } catch {
      toast.error("Could not copy");
    }
  }

  function download(content: string, ext: "txt" | "csv" | "json", mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-otps-${type}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${ext.toUpperCase()}`);
  }

  return (
    <div className="space-y-6">
      {/* Privacy banner */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-sm"
      >
        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" />
        </span>
        <p className="text-foreground/90">
          <span className="font-medium">Generated in your browser.</span>{" "}
          <span className="text-foreground/70">
            Codes are produced via the Web Crypto API. Nothing is sent to a server,
            no SMS is delivered. Use these locally for testing, development or
            personal authentication apps.
          </span>
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>OTP type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as OtpType)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="font-medium">{t.label}</span>
                    <span className="text-muted-foreground"> · {t.hint}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Select
              value={String(count)}
              onValueChange={(v) => v && setCount(Number(v))}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITY_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "code" : "codes"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expiration timer</Label>
            <Select
              value={timerSeconds}
              onValueChange={(v) => v && setTimerSeconds(v)}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp-length">
              Length —{" "}
              <span className="text-foreground tabular-nums">{length}</span> chars
            </Label>
            <Slider
              id="otp-length"
              value={[length]}
              onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)}
              min={lengthBounds.min}
              max={lengthBounds.max}
              step={1}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Length presets:
          </span>
          {LENGTH_PRESETS.filter(
            (n) => n >= lengthBounds.min && n <= lengthBounds.max,
          ).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLength(n)}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                length === n
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>

        {type === "alphanumeric" && (
          <div className="flex flex-wrap gap-2">
            <ToggleChip
              active={lowercase}
              onClick={() => setLowercase((v) => !v)}
              label="abc"
            />
            <ToggleChip
              active={uppercase}
              onClick={() => setUppercase((v) => !v)}
              label="ABC"
            />
            <ToggleChip
              active={numbers}
              onClick={() => setNumbers((v) => !v)}
              label="123"
            />
            <ToggleChip
              active={symbols}
              onClick={() => setSymbols((v) => !v)}
              label="!@#"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <ToggleChip
            active={excludeAmbiguous}
            onClick={() => setExcludeAmbiguous((v) => !v)}
            label="Exclude ambiguous (0/O/1/l/I)"
          />
          <ToggleChip
            active={avoidRepeats}
            onClick={() => setAvoidRepeats((v) => !v)}
            label="Avoid repeated characters"
          />
          {timerSeconds !== "off" && (
            <ToggleChip
              active={autoRefresh}
              onClick={() => setAutoRefresh((v) => !v)}
              label="Auto-refresh on expiry"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" onClick={generate}>
            <Repeat className="size-4" />
            Generate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={copyAll}
            disabled={!results.length}
          >
            <Copy className="size-4" />
            Copy all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => download(toTxt(results), "txt", "text/plain")}
            disabled={!results.length}
          >
            <Download className="size-4" />
            TXT
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => download(toCsv(results, type), "csv", "text/csv")}
            disabled={!results.length}
          >
            <Download className="size-4" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => download(toJson(results, type), "json", "application/json")}
            disabled={!results.length}
          >
            <Download className="size-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Featured OTP (always show the first, large) */}
      {results[0] && (
        <FeaturedOtp
          code={results[0]}
          type={type}
          expiresAt={expiresAt}
          remaining={remaining}
          progress={progress}
          isExpired={isExpired}
          favorited={favorites.some((f) => f.code === results[0])}
          onToggleFavorite={() =>
            toggleFavorite({
              id: crypto.randomUUID(),
              code: results[0],
              type,
              createdAt: Date.now(),
            })
          }
          onRegenerate={generate}
        />
      )}

      {/* Bulk grid */}
      {results.length > 1 && (
        <section aria-label="Generated codes" className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-card p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{results.length}</span>{" "}
            codes generated · {type} ·{" "}
            <span className="text-foreground">{length}</span> chars
          </div>
          <ul
            aria-label="Generated OTPs"
            className="grid list-none gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {results.slice(1).map((code, idx) => (
                <motion.li
                  key={`${code}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.01, 0.1) }}
                >
                  <OtpRow
                    code={code}
                    type={type}
                    isExpired={isExpired}
                    favorited={favorites.some((f) => f.code === code)}
                    onToggleFavorite={() =>
                      toggleFavorite({
                        id: crypto.randomUUID(),
                        code,
                        type,
                        createdAt: Date.now(),
                      })
                    }
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      )}

      {/* History + favorites */}
      {(favorites.length > 0 || history.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.length > 0 && (
            <HistoryPanel
              title="Favorites"
              icon={<Star className="size-4 fill-rose-500 text-rose-500" />}
              accent="rose"
              entries={favorites}
              onToggleFavorite={toggleFavorite}
              isFavorite={() => true}
            />
          )}
          {history.length > 0 && (
            <HistoryPanel
              title="Recent (local only)"
              icon={<History className="size-4 text-primary" />}
              accent="primary"
              entries={history}
              onToggleFavorite={toggleFavorite}
              isFavorite={(e) => favorites.some((f) => f.code === e.code)}
              onClear={clearHistory}
            />
          )}
        </div>
      )}

      <SecurityTips />
    </div>
  );
}

// ─── Featured OTP card ────────────────────────────────────────────────────

interface FeaturedOtpProps {
  code: string;
  type: OtpType;
  expiresAt: number | null;
  remaining: number;
  progress: number;
  isExpired: boolean;
  favorited: boolean;
  onToggleFavorite: () => void;
  onRegenerate: () => void;
}

function FeaturedOtp({
  code,
  type,
  expiresAt,
  remaining,
  progress,
  isExpired,
  favorited,
  onToggleFavorite,
  onRegenerate,
}: FeaturedOtpProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  const formatted = formatOtp(code, type);
  const seconds = Math.ceil(remaining / 1000);

  return (
    <motion.div
      key={code}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-3xl border bg-card p-6 shadow-sm sm:p-8",
        isExpired ? "border-destructive/40 bg-destructive/5" : "border-border/70",
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Code display */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Shield className="size-3" />
            {isExpired ? "Expired one-time code" : "One-time code"}
          </div>
          <code
            className={cn(
              "block break-all font-mono text-4xl font-bold tracking-[0.18em] sm:text-5xl",
              isExpired ? "text-destructive line-through" : "text-foreground",
            )}
          >
            {formatted}
          </code>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copy}
              disabled={isExpired}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              Copy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
            >
              <Star
                className={cn(
                  "size-3.5",
                  favorited && "fill-rose-500 text-rose-500",
                )}
              />
              {favorited ? "Saved" : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onRegenerate}>
              <Repeat className="size-3.5" />
              New code
            </Button>
          </div>
        </div>

        {/* Countdown timer */}
        {expiresAt !== null && (
          <CountdownRing
            progress={progress}
            seconds={seconds}
            isExpired={isExpired}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Countdown ring ───────────────────────────────────────────────────────

function CountdownRing({
  progress,
  seconds,
  isExpired,
}: {
  progress: number;
  seconds: number;
  isExpired: boolean;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const color = isExpired
    ? "#ef4444"
    : progress < 0.2
      ? "#f59e0b"
      : "var(--primary)";

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/40"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.25, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isExpired ? (
          <>
            <ShieldAlert className="size-4 text-destructive" />
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-destructive">
              Expired
            </span>
          </>
        ) : (
          <>
            <span className="font-mono text-xl font-semibold tabular-nums">
              {seconds}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              seconds
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── OTP row (bulk grid) ──────────────────────────────────────────────────

function OtpRow({
  code,
  type,
  isExpired,
  favorited,
  onToggleFavorite,
}: {
  code: string;
  type: OtpType;
  isExpired: boolean;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card p-2.5 transition-colors",
        isExpired
          ? "border-destructive/30 opacity-60"
          : "border-border/70 hover:border-primary/40",
      )}
    >
      <code
        className={cn(
          "min-w-0 flex-1 truncate font-mono text-sm tracking-wider",
          isExpired && "line-through",
        )}
      >
        {formatOtp(code, type)}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={favorited ? "Remove favorite" : "Save favorite"}
        className={cn(
          "rounded-md p-1.5 transition-colors hover:bg-muted",
          favorited ? "text-rose-500" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Star className={cn("size-3.5", favorited && "fill-current")} />
      </button>
    </div>
  );
}

// ─── History panel ────────────────────────────────────────────────────────

function HistoryPanel({
  title,
  icon,
  accent,
  entries,
  onToggleFavorite,
  isFavorite,
  onClear,
}: {
  title: string;
  icon: React.ReactNode;
  accent: "rose" | "primary";
  entries: HistoryEntry[];
  onToggleFavorite: (e: HistoryEntry) => void;
  isFavorite: (e: HistoryEntry) => boolean;
  onClear?: () => void;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-2xl border p-4",
        accent === "rose"
          ? "border-rose-400/30 bg-rose-500/5"
          : "border-border/70 bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          {icon}
          {title}
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {entries.length}
          </span>
        </h3>
        {onClear && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
      <ul className="mt-3 space-y-1.5 list-none">
        {entries.map((e) => (
          <li key={e.id}>
            <OtpRow
              code={e.code}
              type={e.type}
              isExpired={false}
              favorited={isFavorite(e)}
              onToggleFavorite={() => onToggleFavorite(e)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Toggle chip ──────────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
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
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-1.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted-foreground/40",
        )}
      />
      {label}
    </button>
  );
}

// ─── Security tips ────────────────────────────────────────────────────────

function SecurityTips() {
  const tips = [
    {
      icon: AlarmClock,
      title: "OTPs should be short-lived",
      body: "Real OTPs typically expire in 30 seconds to 5 minutes. Long-lived 'one-time' codes lose their security value.",
    },
    {
      icon: KeyRound,
      title: "Never share OTPs",
      body: "Legitimate services will never ask you to read an OTP over the phone or paste it into a chat. If someone asks — it's a scam.",
    },
    {
      icon: Lock,
      title: "Use OTPs with passwords, not instead",
      body: "OTPs are designed as a second factor. Pair them with strong unique passwords for true multi-factor protection.",
    },
    {
      icon: Hash,
      title: "Print backup codes",
      body: "Generate one set of long backup codes when you set up 2FA. Print them and store somewhere safe — not in your password manager alone.",
    },
  ];
  return (
    <section
      aria-labelledby="otp-tips-heading"
      className="rounded-2xl border border-border/70 bg-card/40 p-5"
    >
      <h3
        id="otp-tips-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Lightbulb className="size-4 text-amber-500" />
        OTP security tips
      </h3>
      <ul className="mt-4 grid gap-3 list-none sm:grid-cols-2">
        {tips.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3 rounded-xl border border-border/60 bg-background p-4"
          >
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="space-y-1">
              <div className="text-sm font-semibold tracking-tight">{title}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
