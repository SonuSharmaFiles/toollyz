"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Info,
  Lock,
  Percent,
  RefreshCcw,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CURRENCY_OPTIONS, formatMoney } from "@/lib/tools/finance/money";

const STORAGE_KEY = "toollyz:gst-vat-input";

type Mode = "add" | "remove";

interface State {
  mode: Mode;
  amount: number;
  ratePct: number;
  currency: string;
  region: string; // arbitrary preset key, e.g. "india-gst-18"
}

interface RegionPreset {
  id: string;
  label: string;
  ratePct: number;
  taxName: string;
  flag: string;
  currency: string;
}

const PRESETS: RegionPreset[] = [
  { id: "uk", label: "United Kingdom (standard VAT)", ratePct: 20, taxName: "VAT", flag: "🇬🇧", currency: "GBP" },
  { id: "uk-reduced", label: "United Kingdom (reduced VAT)", ratePct: 5, taxName: "VAT", flag: "🇬🇧", currency: "GBP" },
  { id: "eu-de", label: "Germany (standard VAT)", ratePct: 19, taxName: "USt.", flag: "🇩🇪", currency: "EUR" },
  { id: "eu-fr", label: "France (standard VAT)", ratePct: 20, taxName: "TVA", flag: "🇫🇷", currency: "EUR" },
  { id: "eu-it", label: "Italy (standard VAT)", ratePct: 22, taxName: "IVA", flag: "🇮🇹", currency: "EUR" },
  { id: "eu-es", label: "Spain (standard VAT)", ratePct: 21, taxName: "IVA", flag: "🇪🇸", currency: "EUR" },
  { id: "in-5", label: "India GST 5%", ratePct: 5, taxName: "GST", flag: "🇮🇳", currency: "INR" },
  { id: "in-12", label: "India GST 12%", ratePct: 12, taxName: "GST", flag: "🇮🇳", currency: "INR" },
  { id: "in-18", label: "India GST 18%", ratePct: 18, taxName: "GST", flag: "🇮🇳", currency: "INR" },
  { id: "in-28", label: "India GST 28%", ratePct: 28, taxName: "GST", flag: "🇮🇳", currency: "INR" },
  { id: "au", label: "Australia GST", ratePct: 10, taxName: "GST", flag: "🇦🇺", currency: "AUD" },
  { id: "nz", label: "New Zealand GST", ratePct: 15, taxName: "GST", flag: "🇳🇿", currency: "NZD" },
  { id: "ca-gst", label: "Canada (federal GST only)", ratePct: 5, taxName: "GST", flag: "🇨🇦", currency: "CAD" },
  { id: "ca-hst", label: "Canada HST (Ontario)", ratePct: 13, taxName: "HST", flag: "🇨🇦", currency: "CAD" },
  { id: "ca-qst", label: "Canada (QST + GST, Quebec)", ratePct: 14.975, taxName: "QST+GST", flag: "🇨🇦", currency: "CAD" },
  { id: "sg", label: "Singapore GST", ratePct: 9, taxName: "GST", flag: "🇸🇬", currency: "SGD" },
  { id: "za", label: "South Africa VAT", ratePct: 15, taxName: "VAT", flag: "🇿🇦", currency: "ZAR" },
  { id: "jp", label: "Japan consumption tax", ratePct: 10, taxName: "消費税", flag: "🇯🇵", currency: "JPY" },
];

const DEFAULT_STATE: State = {
  mode: "add",
  amount: 100,
  ratePct: 18,
  currency: "INR",
  region: "in-18",
};

interface Computation {
  net: number;
  taxAmount: number;
  gross: number;
}

function compute(state: State): Computation {
  const r = state.ratePct / 100;
  if (state.mode === "add") {
    const net = state.amount;
    const taxAmount = net * r;
    return { net, taxAmount, gross: net + taxAmount };
  }
  const gross = state.amount;
  const net = gross / (1 + r);
  return { net, taxAmount: gross - net, gross };
}

export default function GstVatCalculator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  const result = React.useMemo(() => compute(state), [state]);

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setState((s) => ({ ...s, region: p.id, ratePct: p.ratePct, currency: p.currency }));
    toast.success(`${p.label} loaded`);
  }

  function swap() {
    setState((s) => ({ ...s, mode: s.mode === "add" ? "remove" : "add", amount: Number(result[s.mode === "add" ? "gross" : "net"].toFixed(2)) }));
  }

  async function copySummary() {
    const lines = [
      `${state.mode === "add" ? "Added" : "Removed"} ${state.ratePct}% tax`,
      `Net (pre-tax): ${formatMoney(result.net, state.currency)}`,
      `Tax: ${formatMoney(result.taxAmount, state.currency)}`,
      `Gross (incl. tax): ${formatMoney(result.gross, state.currency)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Summary copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function reset() {
    setState(DEFAULT_STATE);
    toast.success("Reset");
  }

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
        aria-label="Tax breakdown"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Cell label="Net (pre-tax)" value={formatMoney(result.net, state.currency)} accent="text-indigo-50" />
          <Cell label={`Tax @ ${state.ratePct}%`} value={formatMoney(result.taxAmount, state.currency)} accent="text-amber-300" emphasis />
          <Cell label="Gross (incl. tax)" value={formatMoney(result.gross, state.currency)} accent="text-emerald-300" emphasis />
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <Tabs value={state.mode} onValueChange={(v) => v && setState((s) => ({ ...s, mode: v as Mode }))} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
            <TabsTrigger value="add">Add tax (net → gross)</TabsTrigger>
            <TabsTrigger value="remove">Remove tax (gross → net)</TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="mt-3 space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium">Net amount (pre-tax)</Label>
            <AmountRow state={state} setState={setState} />
          </TabsContent>
          <TabsContent value="remove" className="mt-3 space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium">Gross amount (tax included)</Label>
            <AmountRow state={state} setState={setState} />
          </TabsContent>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rate" className="text-xs font-medium">Tax rate (%)</Label>
            <Input
              id="rate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={state.ratePct}
              onChange={(e) => setState((s) => ({ ...s, ratePct: Math.max(0, Math.min(100, Number(e.target.value) || 0)), region: "custom" }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region" className="text-xs font-medium">Region preset</Label>
            <Select value={state.region} onValueChange={(v) => v && applyPreset(v)}>
              <SelectTrigger id="region" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom rate</SelectItem>
                {PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.flag} {p.label} — {p.ratePct}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs font-medium">Quick presets:</Label>
          <div className="flex flex-wrap gap-1.5">
            {[5, 10, 12, 15, 18, 20, 22, 25].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setState((s) => ({ ...s, ratePct: r, region: "custom" }))}
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-xs",
                  state.ratePct === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted",
                )}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={swap}>
            <ArrowLeftRight className="size-3.5" />
            Switch mode
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={copySummary}>
            <Copy className="size-3.5" />
            Copy summary
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Percent className="mt-0.5 size-3.5 shrink-0 text-primary" />Add mode: gross = net × (1 + r). Remove mode: net = gross ÷ (1 + r). Both work for VAT, GST, sales tax, HST or any percentage tax.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Region presets pre-load both the rate and the currency for that country. Switch the currency manually if you want a different display unit.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />The math is decimal-precise to double precision; values are displayed to 2 decimal places (or 0 for zero-decimal currencies like JPY).</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Last amount, rate and region save to localStorage on this device only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Runs entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function AmountRow({ state, setState }: { state: State; setState: React.Dispatch<React.SetStateAction<State>> }) {
  return (
    <div className="flex gap-2">
      <Input
        type="number"
        min={0}
        step="any"
        value={state.amount}
        onChange={(e) => setState((s) => ({ ...s, amount: Math.max(0, Number(e.target.value) || 0) }))}
        className="font-mono text-lg"
      />
      <Select value={state.currency} onValueChange={(v) => v && setState((s) => ({ ...s, currency: v }))}>
        <SelectTrigger className="w-32 justify-between font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCY_OPTIONS.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.flag} {c.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Cell({ label, value, accent, emphasis }: { label: string; value: string; accent: string; emphasis?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading tabular-nums", emphasis ? "text-3xl font-bold sm:text-4xl" : "text-xl font-semibold sm:text-2xl", accent)}>
        {value}
      </div>
    </div>
  );
}
