// Shared currency formatting + a small static list of common ISO 4217 codes
// for the Toollyz finance calculators (EMI, Loan, GST/VAT, Tip, Fuel).
// Pure functions, no DOM, no fetch.

export interface CurrencyOption { code: string; label: string; flag: string }

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳" },
  { code: "JPY", label: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", label: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", label: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", label: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", label: "Swiss Franc", flag: "🇨🇭" },
  { code: "SGD", label: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", label: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "NZD", label: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "KRW", label: "South Korean Won", flag: "🇰🇷" },
  { code: "MXN", label: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", label: "Brazilian Real", flag: "🇧🇷" },
  { code: "ZAR", label: "South African Rand", flag: "🇿🇦" },
  { code: "AED", label: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", label: "Saudi Riyal", flag: "🇸🇦" },
  { code: "TRY", label: "Turkish Lira", flag: "🇹🇷" },
  { code: "SEK", label: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", label: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", label: "Danish Krone", flag: "🇩🇰" },
  { code: "PLN", label: "Polish Zloty", flag: "🇵🇱" },
];

const ZERO_DECIMAL = new Set(["JPY", "KRW", "HUF", "ISK", "VND"]);

export function formatMoney(amount: number, currency: string, opts: { decimals?: number } = {}): string {
  if (!Number.isFinite(amount)) return "—";
  const decimals = opts.decimals ?? (ZERO_DECIMAL.has(currency) ? 0 : 2);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${amount.toFixed(decimals)} ${currency}`;
  }
}

export function formatNumber(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

export function downloadCsv(rows: string[], filename: string): void {
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
