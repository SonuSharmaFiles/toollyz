"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  History,
  Key,
  KeyRound,
  Lightbulb,
  Lock,
  Repeat,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Wifi,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  analyzePassword,
  generatePasswords,
  toCsv,
  toTxt,
  type GenerateOptions,
  type PasswordMode,
  type Strength,
} from "@/lib/tools/password/generator";

const HISTORY_KEY = "toollyz:password-history";
const FAVORITES_KEY = "toollyz:password-favorites";
const MAX_HISTORY = 12;

const QUANTITY_OPTIONS = [1, 5, 10, 25, 50];

const MODES: { id: PasswordMode; label: string; icon: React.ElementType; hint: string }[] = [
  { id: "random", label: "Random", icon: Zap, hint: "Maximum-entropy random password." },
  { id: "memorable", label: "Memorable", icon: Sparkles, hint: "Pronounceable, easy to remember." },
  { id: "passphrase", label: "Passphrase", icon: KeyRound, hint: "Word-based, like correct-horse-battery." },
  { id: "pin", label: "PIN", icon: Lock, hint: "Numeric PIN, 4–12 digits." },
  { id: "wifi", label: "WiFi", icon: Wifi, hint: "Long, typeable, no ambiguous chars." },
  { id: "api-key", label: "API Key", icon: Key, hint: "Hex key with optional prefix." },
];

interface HistoryEntry {
  id: string;
  password: string;
  mode: PasswordMode;
  createdAt: number;
}

export default function PasswordGenerator() {
  const [mode, setMode] = React.useState<PasswordMode>("random");
  const [count, setCount] = React.useState(1);

  // Random / memorable / wifi
  const [length, setLength] = React.useState(20);
  const [uppercase, setUppercase] = React.useState(true);
  const [lowercase, setLowercase] = React.useState(true);
  const [numbers, setNumbers] = React.useState(true);
  const [symbols, setSymbols] = React.useState(true);
  const [excludeSimilar, setExcludeSimilar] = React.useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = React.useState(false);
  const [avoidRepeats, setAvoidRepeats] = React.useState(false);
  const [avoidSequential, setAvoidSequential] = React.useState(false);

  // Passphrase
  const [wordCount, setWordCount] = React.useState(5);
  const [separator, setSeparator] = React.useState<"-" | "." | "_" | " ">("-");
  const [capitalizeWords, setCapitalizeWords] = React.useState(false);
  const [appendNumber, setAppendNumber] = React.useState(true);

  // PIN
  const [pinLength, setPinLength] = React.useState(6);

  // API key
  const [apiKeyPrefix, setApiKeyPrefix] = React.useState("sk_");
  const [apiKeyLength, setApiKeyLength] = React.useState(32);

  // UI state
  const [results, setResults] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = React.useState<HistoryEntry[]>([]);

  const opts: GenerateOptions = React.useMemo(
    () => ({
      mode,
      count,
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeSimilar,
      excludeAmbiguous,
      avoidRepeats,
      avoidSequential,
      wordCount,
      separator,
      capitalizeWords,
      appendNumber,
      pinLength,
      apiKeyPrefix,
      apiKeyLength,
    }),
    [
      mode, count, length, uppercase, lowercase, numbers, symbols,
      excludeSimilar, excludeAmbiguous, avoidRepeats, avoidSequential,
      wordCount, separator, capitalizeWords, appendNumber,
      pinLength, apiKeyPrefix, apiKeyLength,
    ],
  );

  // Load history + favorites
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

  function persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }

  const generate = React.useCallback(() => {
    const next = generatePasswords(opts);
    setResults(next);
    // Add first result to history
    if (next[0]) {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        password: next[0],
        mode,
        createdAt: Date.now(),
      };
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.password !== entry.password);
        const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
        persist(HISTORY_KEY, updated);
        return updated;
      });
    }
  }, [opts, mode]);

  // Initial generation
  React.useEffect(() => {
    setResults(generatePasswords(opts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleFavorite(entry: HistoryEntry) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.password === entry.password);
      const next = exists
        ? prev.filter((f) => f.password !== entry.password)
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
      toast.success(`Copied ${results.length} passwords`);
    } catch {
      toast.error("Could not copy");
    }
  }

  function download(content: string, ext: "txt" | "csv", mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-passwords-${mode}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${ext.toUpperCase()}`);
  }

  const firstStrength: Strength | null = results[0] ? analyzePassword(results[0]) : null;

  return (
    <div className="space-y-6">
      {/* ─── Privacy banner ──────────────────────────────────────── */}
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
            Passwords are created using the Web Crypto API and never leave your
            device. We don&apos;t log, store or transmit any password you generate.
          </span>
        </p>
      </div>

      {/* ─── Mode tabs ──────────────────────────────────────────── */}
      <Tabs value={mode} onValueChange={(v) => v && setMode(v as PasswordMode)}>
        <TabsList className="flex h-auto w-full flex-wrap gap-1 p-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <TabsTrigger key={m.id} value={m.id} className="gap-1.5">
                <Icon className="size-3.5" />
                {m.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ─── Random / Memorable / WiFi panel ─────────────────── */}
        <TabsContent value={mode} className="mt-6 space-y-5">
          {/* Common controls */}
          <div className="grid gap-5 sm:grid-cols-2">
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
                      {n} {n === 1 ? "password" : "passwords"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(mode === "random" || mode === "memorable" || mode === "wifi") && (
              <div className="space-y-2">
                <Label htmlFor="pw-length">
                  Length —{" "}
                  <span className="text-foreground tabular-nums">{length}</span> chars
                </Label>
                <Slider
                  id="pw-length"
                  value={[length]}
                  onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)}
                  min={4}
                  max={128}
                  step={1}
                />
              </div>
            )}

            {mode === "passphrase" && (
              <div className="space-y-2">
                <Label htmlFor="pw-words">
                  Words —{" "}
                  <span className="text-foreground tabular-nums">{wordCount}</span>
                </Label>
                <Slider
                  id="pw-words"
                  value={[wordCount]}
                  onValueChange={(v) => setWordCount(Array.isArray(v) ? v[0] : v)}
                  min={3}
                  max={10}
                  step={1}
                />
              </div>
            )}

            {mode === "pin" && (
              <div className="space-y-2">
                <Label htmlFor="pw-pin">
                  PIN length —{" "}
                  <span className="text-foreground tabular-nums">{pinLength}</span>
                </Label>
                <Slider
                  id="pw-pin"
                  value={[pinLength]}
                  onValueChange={(v) => setPinLength(Array.isArray(v) ? v[0] : v)}
                  min={4}
                  max={12}
                  step={1}
                />
              </div>
            )}

            {mode === "api-key" && (
              <div className="space-y-2">
                <Label htmlFor="pw-api-len">
                  Body length —{" "}
                  <span className="text-foreground tabular-nums">{apiKeyLength}</span>
                </Label>
                <Slider
                  id="pw-api-len"
                  value={[apiKeyLength]}
                  onValueChange={(v) => setApiKeyLength(Array.isArray(v) ? v[0] : v)}
                  min={16}
                  max={128}
                  step={2}
                />
              </div>
            )}
          </div>

          {/* Mode-specific options */}
          {mode === "random" && (
            <RandomOptions
              uppercase={uppercase}
              lowercase={lowercase}
              numbers={numbers}
              symbols={symbols}
              excludeSimilar={excludeSimilar}
              excludeAmbiguous={excludeAmbiguous}
              avoidRepeats={avoidRepeats}
              avoidSequential={avoidSequential}
              onChange={{
                setUppercase, setLowercase, setNumbers, setSymbols,
                setExcludeSimilar, setExcludeAmbiguous,
                setAvoidRepeats, setAvoidSequential,
              }}
            />
          )}

          {mode === "memorable" && (
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={uppercase}
                onClick={() => setUppercase((v) => !v)}
                label="Capitalize first letter"
              />
              <ToggleChip
                active={numbers}
                onClick={() => setNumbers((v) => !v)}
                label="Insert numbers"
              />
              <ToggleChip
                active={symbols}
                onClick={() => setSymbols((v) => !v)}
                label="Insert separators"
              />
            </div>
          )}

          {mode === "passphrase" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Separator</Label>
                  <Select
                    value={separator}
                    onValueChange={(v) =>
                      v && setSeparator(v as "-" | "." | "_" | " ")
                    }
                  >
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">Dash -</SelectItem>
                      <SelectItem value=".">Dot .</SelectItem>
                      <SelectItem value="_">Underscore _</SelectItem>
                      <SelectItem value=" ">Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToggleChip
                  active={capitalizeWords}
                  onClick={() => setCapitalizeWords((v) => !v)}
                  label="Capitalize each word"
                />
                <ToggleChip
                  active={appendNumber}
                  onClick={() => setAppendNumber((v) => !v)}
                  label="Append a number"
                />
              </div>
            </>
          )}

          {mode === "pin" && (
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={avoidRepeats}
                onClick={() => setAvoidRepeats((v) => !v)}
                label="Avoid repeats"
              />
              <ToggleChip
                active={avoidSequential}
                onClick={() => setAvoidSequential((v) => !v)}
                label="Avoid sequences"
              />
            </div>
          )}

          {mode === "wifi" && (
            <p className="text-xs text-muted-foreground">
              WiFi mode forces alphanumeric, excludes similar / ambiguous characters,
              and ensures a minimum 16-character length for safe sharing.
            </p>
          )}

          {mode === "api-key" && (
            <div className="space-y-2">
              <Label htmlFor="pw-api-prefix">Prefix (optional)</Label>
              <Input
                id="pw-api-prefix"
                value={apiKeyPrefix}
                onChange={(e) => setApiKeyPrefix(e.target.value)}
                placeholder="sk_, pk_, tly_…"
                className="rounded-lg font-mono"
                autoComplete="off"
                maxLength={10}
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap gap-2 pt-1">
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
              onClick={() => download(toCsv(results), "csv", "text/csv")}
              disabled={!results.length}
            >
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Featured first result + strength meter ───────────── */}
      {results[0] && firstStrength && (
        <FeaturedPassword
          password={results[0]}
          strength={firstStrength}
          favorited={favorites.some((f) => f.password === results[0])}
          onToggleFavorite={() =>
            toggleFavorite({
              id: crypto.randomUUID(),
              password: results[0],
              mode,
              createdAt: Date.now(),
            })
          }
          onRegenerate={generate}
        />
      )}

      {/* ─── Additional results ──────────────────────────────── */}
      {results.length > 1 && (
        <ul
          aria-label="Generated passwords"
          className="grid list-none gap-2"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {results.slice(1).map((pw, idx) => (
              <motion.li
                key={`${pw}-${idx}`}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.015, 0.1) }}
              >
                <PasswordRow
                  password={pw}
                  favorited={favorites.some((f) => f.password === pw)}
                  onToggleFavorite={() =>
                    toggleFavorite({
                      id: crypto.randomUUID(),
                      password: pw,
                      mode,
                      createdAt: Date.now(),
                    })
                  }
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* ─── Favorites + history ─────────────────────────────── */}
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
              title="Recent (local)"
              icon={<History className="size-4 text-primary" />}
              accent="primary"
              entries={history}
              onToggleFavorite={toggleFavorite}
              isFavorite={(e) => favorites.some((f) => f.password === e.password)}
              onClear={clearHistory}
            />
          )}
        </div>
      )}

      {/* ─── Security tips ───────────────────────────────────── */}
      <SecurityTips />
    </div>
  );
}

// ─── Featured password card ───────────────────────────────────────────────

interface FeaturedPasswordProps {
  password: string;
  strength: Strength;
  favorited: boolean;
  onToggleFavorite: () => void;
  onRegenerate: () => void;
}

function FeaturedPassword({
  password,
  strength,
  favorited,
  onToggleFavorite,
  onRegenerate,
}: FeaturedPasswordProps) {
  const [show, setShow] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Password copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  const masked = show ? password : "•".repeat(Math.min(password.length, 32));

  return (
    <motion.div
      key={password}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="flex-1 break-all rounded-xl border border-border/60 bg-background px-4 py-3 font-mono text-lg font-medium tracking-tight">
          {masked}
        </code>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff /> : <Eye />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={copy}
            aria-label="Copy password"
          >
            {copied ? <Check className="text-emerald-500" /> : <Copy />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
          >
            <Star
              className={cn("size-4", favorited && "fill-rose-500 text-rose-500")}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRegenerate}
            aria-label="Regenerate"
          >
            <Repeat />
          </Button>
        </div>
      </div>

      {/* Strength meter */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="size-4" style={{ color: strength.color }} />
            <span className="text-sm font-semibold" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground tabular-nums">
                {strength.entropy}
              </span>{" "}
              bits
            </span>
            <span>·</span>
            <span>
              Crack:{" "}
              <span className="font-medium text-foreground">{strength.crackTime}</span>
            </span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength.percent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: strength.color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Password row (for bulk list) ─────────────────────────────────────────

function PasswordRow({
  password,
  favorited,
  onToggleFavorite,
}: {
  password: string;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  const strength = analyzePassword(password);
  const [copied, setCopied] = React.useState(false);
  const [show, setShow] = React.useState(true);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="group flex items-center gap-2 rounded-xl border border-border/70 bg-card p-2.5">
      <code className="min-w-0 flex-1 truncate font-mono text-sm">
        {show ? password : "•".repeat(Math.min(password.length, 24))}
      </code>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
        style={{ background: `${strength.color}20`, color: strength.color }}
      >
        {strength.label}
      </span>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide" : "Show"}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
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

// ─── Random options ───────────────────────────────────────────────────────

interface RandomOptionsProps {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  avoidRepeats: boolean;
  avoidSequential: boolean;
  onChange: {
    setUppercase: React.Dispatch<React.SetStateAction<boolean>>;
    setLowercase: React.Dispatch<React.SetStateAction<boolean>>;
    setNumbers: React.Dispatch<React.SetStateAction<boolean>>;
    setSymbols: React.Dispatch<React.SetStateAction<boolean>>;
    setExcludeSimilar: React.Dispatch<React.SetStateAction<boolean>>;
    setExcludeAmbiguous: React.Dispatch<React.SetStateAction<boolean>>;
    setAvoidRepeats: React.Dispatch<React.SetStateAction<boolean>>;
    setAvoidSequential: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

function RandomOptions(p: RandomOptionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ToggleChip active={p.lowercase} onClick={() => p.onChange.setLowercase((v) => !v)} label="abc" />
      <ToggleChip active={p.uppercase} onClick={() => p.onChange.setUppercase((v) => !v)} label="ABC" />
      <ToggleChip active={p.numbers} onClick={() => p.onChange.setNumbers((v) => !v)} label="123" />
      <ToggleChip active={p.symbols} onClick={() => p.onChange.setSymbols((v) => !v)} label="!@#" />
      <ToggleChip
        active={p.excludeSimilar}
        onClick={() => p.onChange.setExcludeSimilar((v) => !v)}
        label="Exclude similar (i, l, 1, L, o, 0, O)"
      />
      <ToggleChip
        active={p.excludeAmbiguous}
        onClick={() => p.onChange.setExcludeAmbiguous((v) => !v)}
        label="Exclude ambiguous symbols"
      />
      <ToggleChip
        active={p.avoidRepeats}
        onClick={() => p.onChange.setAvoidRepeats((v) => !v)}
        label="Avoid repeated characters"
      />
      <ToggleChip
        active={p.avoidSequential}
        onClick={() => p.onChange.setAvoidSequential((v) => !v)}
        label="Avoid sequential patterns"
      />
    </div>
  );
}

// ─── History panel ────────────────────────────────────────────────────────

interface HistoryPanelProps {
  title: string;
  icon: React.ReactNode;
  accent: "rose" | "primary";
  entries: HistoryEntry[];
  onToggleFavorite: (e: HistoryEntry) => void;
  isFavorite: (e: HistoryEntry) => boolean;
  onClear?: () => void;
}

function HistoryPanel({
  title,
  icon,
  accent,
  entries,
  onToggleFavorite,
  isFavorite,
  onClear,
}: HistoryPanelProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-2xl border p-4",
        accent === "rose" ? "border-rose-400/30 bg-rose-500/5" : "border-border/70 bg-card",
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
            <PasswordRow
              password={e.password}
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
      icon: KeyRound,
      title: "Use a different password for every site",
      body: "A leak from one site shouldn't compromise the others. Use a password manager so you don't have to remember them all.",
    },
    {
      icon: Lock,
      title: "Length beats complexity",
      body: "A 20-character passphrase like 'velvet-rain-trumpet-river-92' is stronger than a 10-character symbol soup.",
    },
    {
      icon: ShieldCheck,
      title: "Enable two-factor authentication",
      body: "Even the strongest password is one breach away from public. Always add an authenticator app or hardware key.",
    },
    {
      icon: Zap,
      title: "Avoid personal information",
      body: "Birthdays, pet names and addresses are findable. They drop entropy and make passwords guessable.",
    },
  ];
  return (
    <section
      aria-labelledby="security-tips-heading"
      className="rounded-2xl border border-border/70 bg-card/40 p-5"
    >
      <h3
        id="security-tips-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Lightbulb className="size-4 text-amber-500" />
        Security tips
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
