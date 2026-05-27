"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AtSign,
  Check,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Repeat,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  generateUsernames,
  toCsv,
  toTxt,
  type Casing,
  type Separator,
} from "@/lib/tools/username/generator";
import { MODE_LIST, type UsernameMode } from "@/lib/tools/username/vocab";
import {
  GithubIcon,
  TwitterIcon,
} from "@/components/shared/social-icons";

const QUANTITY_OPTIONS = [10, 25, 50, 100];
const LENGTH_PRESETS: { label: string; min: number; max: number }[] = [
  { label: "4–6", min: 4, max: 6 },
  { label: "6–10", min: 6, max: 10 },
  { label: "10–15", min: 10, max: 15 },
];

const FAVORITES_KEY = "toollyz:username-favorites";

// Small inline icons for platforms not in lucide
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.2 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.09a4.85 4.85 0 0 1-1.24-.4Z" />
    </svg>
  );
}

export default function UsernameGenerator() {
  const [mode, setMode] = React.useState<UsernameMode>("random");
  const [count, setCount] = React.useState(25);
  const [seed, setSeed] = React.useState("");
  const [minLength, setMinLength] = React.useState(6);
  const [maxLength, setMaxLength] = React.useState(14);
  const [separator, setSeparator] = React.useState<Separator>("none");
  const [casing, setCasing] = React.useState<Casing>("lower");
  const [includeNumbers, setIncludeNumbers] = React.useState(true);
  const [includeSpecial, setIncludeSpecial] = React.useState(false);
  const [pronounceable, setPronounceable] = React.useState(false);
  const [results, setResults] = React.useState<string[]>([]);
  const [favorites, setFavorites] = React.useState<string[]>([]);

  // Load favorites from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      /* noop */
    }
  }, [favorites]);

  const generate = React.useCallback(() => {
    const next = generateUsernames({
      mode,
      count,
      minLength,
      maxLength,
      separator,
      casing,
      includeNumbers,
      includeSpecial,
      pronounceable,
      seed: seed.trim() || undefined,
    });
    setResults(next);
  }, [
    mode, count, minLength, maxLength, separator, casing,
    includeNumbers, includeSpecial, pronounceable, seed,
  ]);

  // Initial mount
  React.useEffect(() => {
    setResults(
      generateUsernames({
        mode: "random",
        count: 25,
        minLength: 6,
        maxLength: 14,
        separator: "none",
        casing: "lower",
        includeNumbers: true,
        includeSpecial: false,
        pronounceable: false,
      }),
    );
  }, []);

  function toggleFavorite(u: string) {
    setFavorites((prev) =>
      prev.includes(u) ? prev.filter((f) => f !== u) : [u, ...prev],
    );
  }

  function regenerateOne(idx: number) {
    const next = generateUsernames({
      mode, count: 1, minLength, maxLength, separator, casing,
      includeNumbers, includeSpecial, pronounceable,
      seed: seed.trim() || undefined,
    });
    setResults((prev) => prev.map((u, i) => (i === idx && next[0] ? next[0] : u)));
  }

  async function copyAll() {
    if (!results.length) return;
    try {
      await navigator.clipboard.writeText(results.join("\n"));
      toast.success(`Copied ${results.length} usernames`);
    } catch {
      toast.error("Could not copy");
    }
  }

  function download(content: string, ext: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-usernames-${mode}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${ext.toUpperCase()}`);
  }

  function clearAll() {
    setResults([]);
    toast.info("Cleared");
  }

  function clearFavorites() {
    setFavorites([]);
    toast.info("Favorites cleared");
  }

  return (
    <div className="space-y-6">
      {/* ─── Controls ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => v && setMode(v as UsernameMode)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_LIST.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground"> · {m.hint}</span>
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
                    {n} usernames
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username-seed">Optional seed</Label>
            <Input
              id="username-seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Your name, nickname or keyword"
              className="rounded-lg"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>
              Length —{" "}
              <span className="text-foreground tabular-nums">{minLength}</span>
              <span className="text-muted-foreground"> to </span>
              <span className="text-foreground tabular-nums">{maxLength}</span>
              <span className="text-muted-foreground"> chars</span>
            </Label>
            <div className="flex gap-1">
              {LENGTH_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setMinLength(p.min);
                    setMaxLength(p.max);
                  }}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    minLength === p.min && maxLength === p.max
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Slider
              value={[minLength]}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                setMinLength(Math.min(next, maxLength));
              }}
              min={3}
              max={20}
              step={1}
              aria-label="Minimum length"
            />
            <Slider
              value={[maxLength]}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                setMaxLength(Math.max(next, minLength));
              }}
              min={3}
              max={25}
              step={1}
              aria-label="Maximum length"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Separator</Label>
            <Select
              value={separator}
              onValueChange={(v) => v && setSeparator(v as Separator)}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (joined)</SelectItem>
                <SelectItem value="underscore">Underscore _</SelectItem>
                <SelectItem value="dot">Dot .</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Casing</Label>
            <Select value={casing} onValueChange={(v) => v && setCasing(v as Casing)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lower">lowercase</SelectItem>
                <SelectItem value="title">Title Case</SelectItem>
                <SelectItem value="upper">UPPERCASE</SelectItem>
                <SelectItem value="camel">camelCase</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleChip
            active={includeNumbers}
            onClick={() => setIncludeNumbers((v) => !v)}
            label="Numbers"
          />
          <ToggleChip
            active={includeSpecial}
            onClick={() => setIncludeSpecial((v) => !v)}
            label="Special chars"
          />
          <ToggleChip
            active={pronounceable}
            onClick={() => setPronounceable((v) => !v)}
            label="Pronounceable"
          />
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
            onClick={() => download(toCsv(results, mode), "csv", "text/csv")}
            disabled={!results.length}
          >
            <Download className="size-4" />
            CSV
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={clearAll}
            disabled={!results.length}
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* ─── Favorites panel ───────────────────────────────────────── */}
      {favorites.length > 0 && (
        <FavoritesPanel
          favorites={favorites}
          onRemove={(u) => toggleFavorite(u)}
          onClear={clearFavorites}
        />
      )}

      {/* ─── Results ─────────────────────────────────────────────── */}
      {results.length === 0 ? (
        <EmptyState onGenerate={generate} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card p-3 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{results.length}</span>{" "}
              usernames ·{" "}
              <span className="text-foreground">{MODE_LIST.find((m) => m.id === mode)?.label}</span> mode
            </span>
            <span>Click the heart to save · Click the platform icon to check availability</span>
          </div>

          <ul
            aria-label="Generated usernames"
            className="grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {results.map((username, idx) => (
                <motion.li
                  key={`${username}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.01, 0.15) }}
                >
                  <UsernameCard
                    username={username}
                    favorited={favorites.includes(username)}
                    onToggleFavorite={() => toggleFavorite(username)}
                    onRegenerate={() => regenerateOne(idx)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Username card ────────────────────────────────────────────────────────

interface UsernameCardProps {
  username: string;
  favorited: boolean;
  onToggleFavorite: () => void;
  onRegenerate: () => void;
}

function UsernameCard({
  username,
  favorited,
  onToggleFavorite,
  onRegenerate,
}: UsernameCardProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(username);
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
        "group flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-colors",
        favorited
          ? "border-rose-400/50 bg-rose-500/5"
          : "hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <code className="block min-w-0 break-all font-mono text-base font-medium text-foreground">
          {username}
        </code>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
          className={cn(
            "shrink-0 rounded-md p-1.5 transition-colors",
            favorited
              ? "text-rose-500 hover:bg-rose-500/10"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Heart
            className={cn("size-4 transition-transform", favorited && "fill-current scale-110")}
          />
        </button>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className="rounded-full bg-muted px-1.5 py-0.5 font-medium uppercase tracking-wider">
          {username.length} chars
        </span>
      </div>

      <PlatformLinks username={username} />

      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Generate a similar username"
        >
          <RotateCcw className="size-3.5" /> Similar
        </button>
      </div>
    </div>
  );
}

// ─── Platform availability links ──────────────────────────────────────────

function PlatformLinks({ username }: { username: string }) {
  const safe = encodeURIComponent(username.replace(/[^a-zA-Z0-9_.]/g, ""));
  const platforms = [
    {
      label: "Instagram",
      url: `https://instagram.com/${safe}`,
      icon: <InstagramIcon className="size-3.5" />,
    },
    {
      label: "X / Twitter",
      url: `https://x.com/${safe}`,
      icon: <TwitterIcon className="size-3.5" />,
    },
    {
      label: "TikTok",
      url: `https://tiktok.com/@${safe}`,
      icon: <TiktokIcon className="size-3.5" />,
    },
    {
      label: "GitHub",
      url: `https://github.com/${safe}`,
      icon: <GithubIcon className="size-3.5" />,
    },
  ];
  return (
    <ul aria-label={`Check availability for ${username}`} className="flex flex-wrap gap-1">
      {platforms.map((p) => (
        <li key={p.label}>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title={`Check on ${p.label}`}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {p.icon}
            <span className="sr-only">{p.label}</span>
            <ExternalLink className="size-2.5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

// ─── Favorites ────────────────────────────────────────────────────────────

interface FavoritesPanelProps {
  favorites: string[];
  onRemove: (u: string) => void;
  onClear: () => void;
}

function FavoritesPanel({ favorites, onRemove, onClear }: FavoritesPanelProps) {
  async function copyAll() {
    try {
      await navigator.clipboard.writeText(favorites.join("\n"));
      toast.success(`Copied ${favorites.length} favorites`);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <section
      aria-labelledby="favorites-heading"
      className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3
          id="favorites-heading"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <Heart className="size-4 fill-rose-500 text-rose-500" />
          Favorites
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">
            {favorites.length}
          </span>
        </h3>
        <div className="flex gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={copyAll}>
            <Copy className="size-3.5" />
            Copy all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5 list-none">
        {favorites.map((u) => (
          <li key={u}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-background px-2.5 py-1 font-mono text-xs">
              {u}
              <button
                type="button"
                onClick={() => onRemove(u)}
                aria-label={`Remove ${u} from favorites`}
                className="text-muted-foreground hover:text-rose-500"
              >
                <X className="size-3" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Toggle chip ──────────────────────────────────────────────────────────

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function ToggleChip({ active, onClick, label }: ToggleChipProps) {
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

// ─── Empty state ──────────────────────────────────────────────────────────

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <AtSign className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">No usernames yet</p>
        <p className="text-xs text-muted-foreground">
          Pick a mode and hit Generate to create your batch.
        </p>
      </div>
      <Button type="button" size="sm" onClick={onGenerate}>
        <Sparkles className="size-3.5" />
        Generate now
      </Button>
    </div>
  );
}
