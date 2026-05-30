// Foreign-exchange rate fetcher for the Toollyz Currency Converter.
// Toollyz is a static site with no server, so live rates come from a chain
// of public CORS-enabled providers, tried in order:
//   1. open.er-api.com (Open Exchange Rates' free tier, 160+ currencies)
//   2. api.frankfurter.app (European Central Bank, 30 major currencies)
//
// Successful results are cached in localStorage for 30 minutes per base
// currency so the user gets instant re-conversions and we don't pound the
// providers. Failures fall through; if both providers fail the caller can
// surface an offline / unreachable banner.

import { fetchWithTimeout } from "@/lib/tools/shared/net";

export interface Rates {
  base: string;
  date: string;
  rates: Record<string, number>;
  provider: string;
}

const CACHE_PREFIX = "toollyz:fx-";
export const CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheEntry {
  rates: Rates;
  ts: number;
}

function readCache(base: string): CacheEntry | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${base}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.rates?.rates || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rates: Rates): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${rates.base}`, JSON.stringify({ rates, ts: Date.now() }));
  } catch {
    /* ignore quota */
  }
}

async function tryOpenErApi(base: string): Promise<Rates | null> {
  const r = await fetchWithTimeout(
    `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,
    { timeoutMs: 8000, cache: "no-store" },
  );
  if (!r.ok) return null;
  try {
    const data = (await r.response.json()) as {
      result?: string;
      base_code?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };
    if (data.result !== "success" || !data.rates) return null;
    return {
      base: data.base_code ?? base,
      date: data.time_last_update_utc ?? new Date().toUTCString(),
      rates: data.rates,
      provider: "open.er-api.com",
    };
  } catch {
    return null;
  }
}

async function tryFrankfurter(base: string): Promise<Rates | null> {
  const r = await fetchWithTimeout(
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`,
    { timeoutMs: 8000, cache: "no-store" },
  );
  if (!r.ok) return null;
  try {
    const data = (await r.response.json()) as {
      base?: string;
      date?: string;
      rates?: Record<string, number>;
      message?: string;
    };
    if (!data.rates || data.message) return null;
    return {
      base: data.base ?? base,
      date: data.date ?? new Date().toISOString().slice(0, 10),
      // Frankfurter omits the base = 1 entry; add it for parity.
      rates: { ...data.rates, [data.base ?? base]: 1 },
      provider: "api.frankfurter.app",
    };
  } catch {
    return null;
  }
}

export interface RatesResult {
  ok: boolean;
  rates?: Rates;
  cached?: boolean;
  error?: string;
}

export async function getRates(base: string): Promise<RatesResult> {
  const upper = base.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(upper)) return { ok: false, error: "Currency code must be 3 letters." };

  const cached = readCache(upper);
  if (cached) return { ok: true, rates: cached.rates, cached: true };

  const r1 = await tryOpenErApi(upper);
  if (r1) {
    writeCache(r1);
    return { ok: true, rates: r1 };
  }
  const r2 = await tryFrankfurter(upper);
  if (r2) {
    writeCache(r2);
    return { ok: true, rates: r2 };
  }
  return { ok: false, error: "Couldn't reach any exchange-rate provider. Check your connection and try again." };
}

export function convert(amount: number, rates: Rates, to: string): number | null {
  const target = to.trim().toUpperCase();
  const r = rates.rates[target];
  if (typeof r !== "number") return null;
  return amount * r;
}

/** Pretty number with smart decimal precision based on magnitude. */
export function formatNumber(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  let digits = 2;
  if (abs > 0 && abs < 1) digits = 4;
  if (abs > 0 && abs < 0.01) digits = 6;
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatCurrency(n: number, code: string): string {
  if (!isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code, maximumFractionDigits: 4 }).format(n);
  } catch {
    return `${formatNumber(n)} ${code}`;
  }
}

export interface CurrencyMeta { name: string; flag: string }

export const CURRENCY_META: Record<string, CurrencyMeta> = {
  USD: { name: "US Dollar", flag: "🇺🇸" },
  EUR: { name: "Euro", flag: "🇪🇺" },
  GBP: { name: "British Pound", flag: "🇬🇧" },
  JPY: { name: "Japanese Yen", flag: "🇯🇵" },
  CNY: { name: "Chinese Yuan", flag: "🇨🇳" },
  INR: { name: "Indian Rupee", flag: "🇮🇳" },
  AUD: { name: "Australian Dollar", flag: "🇦🇺" },
  CAD: { name: "Canadian Dollar", flag: "🇨🇦" },
  CHF: { name: "Swiss Franc", flag: "🇨🇭" },
  HKD: { name: "Hong Kong Dollar", flag: "🇭🇰" },
  SGD: { name: "Singapore Dollar", flag: "🇸🇬" },
  NZD: { name: "New Zealand Dollar", flag: "🇳🇿" },
  KRW: { name: "South Korean Won", flag: "🇰🇷" },
  MXN: { name: "Mexican Peso", flag: "🇲🇽" },
  BRL: { name: "Brazilian Real", flag: "🇧🇷" },
  RUB: { name: "Russian Ruble", flag: "🇷🇺" },
  ZAR: { name: "South African Rand", flag: "🇿🇦" },
  TRY: { name: "Turkish Lira", flag: "🇹🇷" },
  AED: { name: "UAE Dirham", flag: "🇦🇪" },
  SAR: { name: "Saudi Riyal", flag: "🇸🇦" },
  SEK: { name: "Swedish Krona", flag: "🇸🇪" },
  NOK: { name: "Norwegian Krone", flag: "🇳🇴" },
  DKK: { name: "Danish Krone", flag: "🇩🇰" },
  PLN: { name: "Polish Zloty", flag: "🇵🇱" },
  CZK: { name: "Czech Koruna", flag: "🇨🇿" },
  HUF: { name: "Hungarian Forint", flag: "🇭🇺" },
  THB: { name: "Thai Baht", flag: "🇹🇭" },
  MYR: { name: "Malaysian Ringgit", flag: "🇲🇾" },
  IDR: { name: "Indonesian Rupiah", flag: "🇮🇩" },
  PHP: { name: "Philippine Peso", flag: "🇵🇭" },
  VND: { name: "Vietnamese Dong", flag: "🇻🇳" },
  PKR: { name: "Pakistani Rupee", flag: "🇵🇰" },
  BDT: { name: "Bangladeshi Taka", flag: "🇧🇩" },
  EGP: { name: "Egyptian Pound", flag: "🇪🇬" },
  NGN: { name: "Nigerian Naira", flag: "🇳🇬" },
  KES: { name: "Kenyan Shilling", flag: "🇰🇪" },
  ILS: { name: "Israeli Shekel", flag: "🇮🇱" },
  CLP: { name: "Chilean Peso", flag: "🇨🇱" },
  COP: { name: "Colombian Peso", flag: "🇨🇴" },
  ARS: { name: "Argentine Peso", flag: "🇦🇷" },
  PEN: { name: "Peruvian Sol", flag: "🇵🇪" },
  TWD: { name: "Taiwan Dollar", flag: "🇹🇼" },
  UAH: { name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  RON: { name: "Romanian Leu", flag: "🇷🇴" },
  BGN: { name: "Bulgarian Lev", flag: "🇧🇬" },
  ISK: { name: "Icelandic Krona", flag: "🇮🇸" },
};

export const POPULAR = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "BRL"];

export function metaFor(code: string): CurrencyMeta {
  return CURRENCY_META[code] ?? { name: code, flag: "🌐" };
}

export function knownCodes(rates?: Rates): string[] {
  if (rates) return Object.keys(rates.rates).sort();
  return Object.keys(CURRENCY_META);
}
