"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownUp,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  History as HistoryIcon,
  Info,
  Loader2,
  Lock,
  RefreshCcw,
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
  CURRENCY_META,
  POPULAR,
  convert,
  formatCurrency,
  formatNumber,
  getRates,
  knownCodes,
  metaFor,
  type Rates,
} from "@/lib/tools/currency/exchange";

const HISTORY_KEY = "toollyz:fx-history";
const SETTINGS_KEY = "toollyz:fx-settings";
const MAX_HISTORY = 16;

interface Settings {
  from: string;
  to: string;
  amount: number;
}

interface HistoryItem {
  ts: number;
  from: string;
  to: string;
  amount: number;
  result: number;
  provider: string;
}

const DEFAULT_SETTINGS: Settings = { from: "USD", to: "EUR", amount: 100 };

export default function CurrencyConverter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [rates, setRates] = React.useState<Rates | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cached, setCached] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(s) as Partial<Settings>) });
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as HistoryItem[]);
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

  const fetchRates = React.useCallback(async (base: string) => {
    if (!isOnline()) {
      setOnline(false);
      return;
    }
    setLoading(true);
    setError(null);
    const r = await getRates(base);
    setLoading(false);
    if (!r.ok || !r.rates) {
      setError(r.error ?? "Couldn't fetch exchange rates.");
      return;
    }
    setRates(r.rates);
    setCached(!!r.cached);
  }, []);

  // Fetch rates on mount and when "from" changes.
  React.useEffect(() => {
    if (!mounted) return;
    void fetchRates(settings.from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, settings.from]);

  function swap() {
    setSettings((s) => ({ ...s, from: s.to, to: s.from }));
  }

  const result = React.useMemo(() => {
    if (!rates) return null;
    return convert(settings.amount, rates, settings.to);
  }, [rates, settings]);

  const unitRate = React.useMemo(() => {
    if (!rates) return null;
    return convert(1, rates, settings.to);
  }, [rates, settings.to]);

  function logHistory() {
    if (!rates || result === null) return;
    const item: HistoryItem = {
      ts: Date.now(),
      from: settings.from,
      to: settings.to,
      amount: settings.amount,
      result,
      provider: rates.provider,
    };
    setHistory((prev) => [item, ...prev.filter((p) => !(p.from === item.from && p.to === item.to && p.amount === item.amount))].slice(0, MAX_HISTORY));
    toast.success("Saved to history");
  }

  function clearHistory() {
    setHistory([]);
  }

  async function copyResult() {
    if (result === null) return;
    const text = `${formatCurrency(settings.amount, settings.from)} = ${formatCurrency(result, settings.to)}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  const codes = knownCodes(rates ?? undefined);
  const codeOptions = codes.length > 0 ? codes : Object.keys(CURRENCY_META);
  const fromMeta = metaFor(settings.from);
  const toMeta = metaFor(settings.to);

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
      {/* Hero */}
      <section
        aria-label="Currency conversion result"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(16,185,129,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-xs text-emerald-300/70">
            <Banknote className="size-3.5" />
            <span>Live exchange rate</span>
            {loading && <Loader2 className="size-3 animate-spin" />}
            {cached && !loading && <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">cached</span>}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <div className="font-heading text-3xl font-bold text-emerald-50 sm:text-5xl">
                <span className="mr-2 text-emerald-300/80">{fromMeta.flag}</span>
                <AnimatedNumber value={settings.amount} reduceMotion={!!reduceMotion} decimals={2} />
                <span className="ml-2 text-emerald-300/80">{settings.from}</span>
              </div>
              <span className="text-emerald-300/60">=</span>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="font-heading text-3xl font-bold tabular-nums text-emerald-100 sm:text-5xl">
                <span className="mr-2 text-emerald-300/80">{toMeta.flag}</span>
                {result === null ? (
                  <span className="text-emerald-300/60">—</span>
                ) : (
                  <AnimatedNumber value={result} reduceMotion={!!reduceMotion} decimals={result < 1 ? 4 : 2} />
                )}
                <span className="ml-2 text-emerald-300/80">{settings.to}</span>
              </div>
            </div>
            {unitRate !== null && (
              <p className="text-xs text-emerald-200/80">
                1 {settings.from} = <span className="font-mono tabular-nums">{formatNumber(unitRate)}</span> {settings.to}
                {rates && (
                  <>
                    <span className="mx-1.5 text-emerald-300/40">·</span>
                    <Clock className="mr-0.5 inline size-3" />
                    <span>{rates.date}</span>
                    <span className="mx-1.5 text-emerald-300/40">·</span>
                    <span>via {rates.provider}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={Number.isFinite(settings.amount) ? settings.amount : ""}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSettings((s) => ({ ...s, amount: Number.isFinite(v) ? v : 0 }));
              }}
              className="font-mono text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs font-medium">
              From
            </Label>
            <Select
              value={settings.from}
              onValueChange={(v) => v && setSettings((s) => ({ ...s, from: v }))}
            >
              <SelectTrigger id="from" className="w-full justify-between font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {codeOptions.map((c) => {
                  const m = metaFor(c);
                  return (
                    <SelectItem key={c} value={c}>
                      <span className="mr-1.5">{m.flag}</span>
                      <span className="font-mono">{c}</span>
                      <span className="ml-1 text-muted-foreground"> · {m.name}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center pb-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={swap}
              aria-label="Swap currencies"
            >
              <ArrowDownUp className="size-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs font-medium">
              To
            </Label>
            <Select
              value={settings.to}
              onValueChange={(v) => v && setSettings((s) => ({ ...s, to: v }))}
            >
              <SelectTrigger id="to" className="w-full justify-between font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {codeOptions.map((c) => {
                  const m = metaFor(c);
                  return (
                    <SelectItem key={c} value={c}>
                      <span className="mr-1.5">{m.flag}</span>
                      <span className="font-mono">{c}</span>
                      <span className="ml-1 text-muted-foreground"> · {m.name}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-end gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => fetchRates(settings.from)} disabled={loading}>
              <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={copyResult} disabled={result === null}>
              <Copy className="size-4" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={logHistory} disabled={result === null}>
              <Sparkles className="size-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Popular currency quick-picks */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-muted-foreground">Quick to:</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR.filter((c) => c !== settings.from).map((c) => {
              const m = metaFor(c);
              const active = settings.to === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, to: c }))}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground/80 hover:bg-muted",
                  )}
                >
                  <span className="mr-1">{m.flag}</span>
                  <span className="font-mono">{c}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!online && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-sm text-amber-700 dark:text-amber-400">
            <WifiOff className="size-4" />
            You appear to be offline — showing cached rates if available.
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            {error}
          </p>
        )}
      </section>

      {/* Multi-currency table */}
      {rates && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <CheckCircle2 className="size-4 text-primary" />
            {formatCurrency(settings.amount, settings.from)} in popular currencies
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {POPULAR.filter((c) => c !== settings.from).map((c) => {
              const v = convert(settings.amount, rates, c);
              const meta = metaFor(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, to: c }))}
                  className="rounded-lg border border-border/60 bg-background p-2.5 text-left hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <span>{meta.flag}</span>
                    <span className="font-mono">{c}</span>
                  </div>
                  <div className="mt-0.5 font-mono text-sm tabular-nums">
                    {v === null ? "—" : formatCurrency(v, c)}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <HistoryIcon className="size-4 text-primary" />
              Saved conversions
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1.5 list-none">
            {history.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-background p-2.5 text-xs">
                <span>{metaFor(h.from).flag}</span>
                <span className="font-mono tabular-nums">{formatCurrency(h.amount, h.from)}</span>
                <span className="text-muted-foreground">→</span>
                <span>{metaFor(h.to).flag}</span>
                <span className="font-mono font-medium tabular-nums">{formatCurrency(h.result, h.to)}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {new Date(h.ts).toLocaleString()} · {h.provider}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Caveats */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About these rates
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <Banknote className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Rates come from public providers — open.er-api.com (160+ currencies) with a fallback to api.frankfurter.app (European Central Bank, 30 currencies).
          </li>
          <li className="flex items-start gap-1.5">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Cached in your browser for 30 minutes per base currency. Refresh fetches fresh data immediately.
          </li>
          <li className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Mid-market reference rates — your bank or card network applies a spread, so the rate you actually get is usually 0.5–3% worse.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no server — your browser talks directly to the providers; nothing passes through us.
          </li>
        </ul>
      </section>
    </div>
  );
}
