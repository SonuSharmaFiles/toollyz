"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  History as HistoryIcon,
  Info,
  Link as LinkIcon,
  Loader2,
  Lock,
  Scissors,
  Sparkles,
  Trash2,
  WifiOff,
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
import { isOnline } from "@/lib/tools/shared/net";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  PROVIDERS,
  type Provider,
  type ProviderChoice,
  type ShortenResult,
  aliasError,
  isValidUrl,
  normalizeUrl,
  shorten,
} from "@/lib/tools/seo/url-shortener";

const HISTORY_KEY = "toollyz:url-shortener-history";
const SETTINGS_KEY = "toollyz:url-shortener-settings";
const MAX_HISTORY = 30;

interface Settings {
  provider: ProviderChoice;
}

const DEFAULT_SETTINGS: Settings = { provider: "auto" };

interface HistoryEntry extends ShortenResult {
  ts: number;
}

export default function UrlShortener() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [url, setUrl] = React.useState("");
  const [alias, setAlias] = React.useState("");
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ShortenResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(s) as Partial<Settings>) });
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as HistoryEntry[]);
    } catch {
      /* noop */
    }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
  }, [settings, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  const aliasIssue = React.useMemo(() => aliasError(alias.trim()), [alias]);
  const normalized = React.useMemo(() => normalizeUrl(url), [url]);
  const validUrl = isValidUrl(normalized);

  async function submit() {
    setError(null);
    if (!isOnline()) {
      setOnline(false);
      setError("You appear to be offline.");
      return;
    }
    if (!url.trim()) {
      setError("Paste a URL to shorten.");
      return;
    }
    if (!validUrl) {
      setError("That doesn't look like a valid HTTP(S) URL.");
      return;
    }
    if (aliasIssue) {
      setError(aliasIssue);
      return;
    }
    setLoading(true);
    setResult(null);
    const r = await shorten(normalized, settings.provider, alias.trim() || undefined);
    setLoading(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setResult(r.result);
    setHistory((prev) => [
      { ...r.result, ts: Date.now() },
      ...prev.filter((h) => h.short !== r.result.short),
    ].slice(0, MAX_HISTORY));
    toast.success(`Shortened with ${PROVIDERS[r.result.provider].label}`);
  }

  async function copy(text: string, what = "Short link") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  function clearHistory() {
    setHistory([]);
  }

  const totalSaved = history.reduce((s, h) => s + h.savedChars, 0);
  const longestSaved = history.reduce((m, h) => Math.max(m, h.savedChars), 0);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Latest short link"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total shortened" value={history.length} reduceMotion={!!reduceMotion} />
          <Stat label="Chars saved" value={totalSaved} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Best save" value={longestSaved} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat
            label="Latest"
            value={result?.short.length ?? 0}
            reduceMotion={!!reduceMotion}
            suffix=" chars"
            accent="text-indigo-300"
          />
        </div>
        {result && (
          <div className="relative mt-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm sm:flex-row sm:items-center">
            <Sparkles className="size-4 shrink-0 text-emerald-300" />
            <a
              href={result.short}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-base font-semibold text-emerald-100 underline-offset-4 hover:underline"
            >
              {result.short}
            </a>
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-indigo-200">
              {PROVIDERS[result.provider].host}
            </span>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={() => copy(result.short)}>
                <Copy className="size-3.5" />
              </Button>
              <a
                href={result.short}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open short link"
                className="inline-flex h-7 items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <Label htmlFor="url" className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Scissors className="size-4 text-primary" />
          Long URL
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }}
              placeholder="https://example.com/long/url?with=many&params"
              className="pl-8 font-mono text-sm"
              aria-invalid={!!error}
            />
          </div>
          <Button type="button" onClick={submit} disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Shortening…
              </>
            ) : (
              <>
                <ArrowUpRight className="size-4" />
                Shorten
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="provider" className="text-xs font-medium">
              Provider
            </Label>
            <Select
              value={settings.provider}
              onValueChange={(v) => v && setSettings((s) => ({ ...s, provider: v as ProviderChoice }))}
            >
              <SelectTrigger id="provider" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <span className="font-medium">Auto</span>
                  <span className="text-muted-foreground"> · TinyURL → is.gd</span>
                </SelectItem>
                {(Object.values(PROVIDERS) as { id: Provider; label: string; host: string; note: string }[]).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-medium">{p.label}</span>
                    <span className="text-muted-foreground"> · {p.host}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alias" className="text-xs font-medium">
              Custom alias <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. my-launch"
              className="font-mono text-sm"
              aria-invalid={!!aliasIssue && alias.length > 0}
            />
            <p className="text-[10px] text-muted-foreground">
              3–30 chars, letters/numbers/hyphen/underscore. Not guaranteed available — providers fail if taken.
            </p>
          </div>
        </div>

        {!online && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-sm text-amber-700 dark:text-amber-400">
            <WifiOff className="size-4" />
            You appear to be offline.
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            {error}
          </p>
        )}
      </section>

      {/* Result detail */}
      {result && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Result
          </h2>
          <ResultRow label="Original" value={result.original} mono onCopy={() => copy(result.original, "Original URL")} />
          <ResultRow label="Short" value={result.short} mono accent onCopy={() => copy(result.short)} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat2 label="Original chars" value={result.original.length} />
            <Stat2 label="Short chars" value={result.short.length} accent="text-emerald-600 dark:text-emerald-400" />
            <Stat2 label="Saved" value={result.savedChars} accent="text-emerald-600 dark:text-emerald-400" />
            <Stat2 label="Provider" value={PROVIDERS[result.provider].host} mono />
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <HistoryIcon className="size-4 text-primary" />
              Recent short links
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1.5 list-none">
            {history.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-background p-2.5 text-xs">
                <a
                  href={h.short}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono font-medium text-primary underline-offset-4 hover:underline"
                >
                  {h.short}
                </a>
                <span className="text-muted-foreground">·</span>
                <span className="break-all text-muted-foreground">{truncate(h.original, 72)}</span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{new Date(h.ts).toLocaleString()}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {PROVIDERS[h.provider].host}
                  </span>
                  <button type="button" onClick={() => copy(h.short)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Copy short link">
                    <Copy className="size-3.5" />
                  </button>
                  <a href={h.short} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Open short link">
                    <ExternalLink className="size-3.5" />
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Transparency */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          How the shortening works
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <LinkIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Short links are minted by public services — TinyURL (tinyurl.com) and is.gd (is.gd). Toollyz has no server in the chain.
          </li>
          <li className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Auto mode tries TinyURL first and falls back to is.gd if that fails. Pick a specific provider to lock the host.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Recent short links are saved in your browser&apos;s localStorage so you can re-copy them later — they&apos;re never uploaded to Toollyz.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Short links are public by nature — anyone with the link can follow it. Don&apos;t shorten sensitive URLs.
          </li>
        </ul>
      </section>
    </div>
  );
}

function ResultRow({
  label,
  value,
  mono,
  accent,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2.5",
        accent ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 bg-background",
      )}
    >
      <span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("flex-1 break-all text-sm", mono && "font-mono", accent && "font-semibold")}>
        {value}
      </span>
      {onCopy && (
        <button type="button" onClick={onCopy} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Copy ${label.toLowerCase()}`}>
          <Copy className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}

function Stat2({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: number | string;
  accent?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          accent ?? "text-foreground",
          mono && "font-mono",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
