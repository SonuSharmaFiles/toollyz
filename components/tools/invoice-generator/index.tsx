"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  Info,
  Loader2,
  Lock,
  Plus,
  Receipt,
  RefreshCcw,
  Sparkles,
  Trash2,
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
import { downloadBytes } from "@/lib/tools/pdf/merge";
import {
  CURRENCY_OPTIONS,
  buildInvoicePdf,
  formatMoney,
  newLineItem,
  totals,
  type InvoiceData,
  type LineItem,
} from "@/lib/tools/pdf/invoice";

const STORAGE_KEY = "toollyz:invoice-data";

const DEFAULTS: InvoiceData = {
  invoiceNumber: "INV-0001",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  currency: "USD",
  from: { name: "Your business", email: "you@example.com", lines: "123 Example Lane\nSuite 4\nSan Francisco, CA 94110" },
  to: { name: "Client name", email: "client@example.com", lines: "456 Customer Street\nBuilding C\nLondon, EC1A 1AA" },
  items: [
    { ...newLineItem(), description: "Brand identity refresh — logo and palette", quantity: 1, rate: 1800 },
    { ...newLineItem(), description: "Landing page design (3 sections)", quantity: 1, rate: 1200 },
    { ...newLineItem(), description: "Revision rounds", quantity: 2, rate: 250 },
  ],
  taxPercent: 10,
  discount: 0,
  notes: "Thanks for your business! Wire transfer details on the next page.",
  paymentTerms: "Net 14. Late payments accrue 1.5% interest per month.",
  themeColor: "#6366F1",
};

export default function InvoiceGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState<InvoiceData>(DEFAULTS);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState("invoice.pdf");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<InvoiceData>;
        // Don't try to rehydrate logo bytes from JSON.
        delete (parsed as InvoiceData).logoBytes;
        delete (parsed as InvoiceData).logoMime;
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      const { logoBytes: _b, logoMime: _m, ...rest } = data;
      void _b;
      void _m;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* noop */
    }
  }, [data, mounted]);

  React.useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const t = totals(data);

  function updateItem(id: string, patch: Partial<LineItem>) {
    setData((d) => ({
      ...d,
      items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setData((d) => ({ ...d, items: [...d.items, newLineItem()] }));
  }

  function removeItem(id: string) {
    setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));
  }

  async function pickLogo(files: FileList) {
    const f = files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type)) {
      toast.error("Pick a PNG or JPG logo");
      return;
    }
    if (f.size > 1.5 * 1024 * 1024) {
      toast.error("Logo must be under 1.5 MB");
      return;
    }
    const buf = await f.arrayBuffer();
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(URL.createObjectURL(f));
    setData((d) => ({ ...d, logoBytes: new Uint8Array(buf), logoMime: f.type }));
    toast.success("Logo added");
  }

  function clearLogo() {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
    setData((d) => ({ ...d, logoBytes: undefined, logoMime: undefined }));
  }

  function reset() {
    setData(DEFAULTS);
    clearLogo();
    toast.success("Reset to defaults");
  }

  async function build() {
    setError(null);
    if (data.items.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    setBusy(true);
    try {
      const bytes = await buildInvoicePdf(data);
      downloadBytes(bytes, filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
      toast.success("Invoice PDF downloaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Build failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
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
      {/* Totals hero */}
      <section
        aria-label="Invoice totals"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
        style={{
          background:
            `linear-gradient(135deg, ${data.themeColor}22, transparent 60%), #0b1020`,
        }}
      >
        <div className="relative flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300/70">Total due</div>
            <div className="font-heading text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {formatMoney(t.total, data.currency)}
            </div>
          </div>
          <div className="text-right text-xs text-indigo-200/80">
            <div>Subtotal: <span className="font-mono">{formatMoney(t.subtotal, data.currency)}</span></div>
            {data.discount > 0 && <div>Discount: <span className="font-mono">−{formatMoney(data.discount, data.currency)}</span></div>}
            {data.taxPercent > 0 && <div>Tax: <span className="font-mono">{formatMoney(t.taxAmount, data.currency)}</span></div>}
            <div className="mt-1 text-indigo-300/60">Invoice {data.invoiceNumber} · due {data.dueDate}</div>
          </div>
        </div>
      </section>

      {/* Top: From / To */}
      <section className="grid gap-4 sm:grid-cols-2">
        <PartyCard
          title="From"
          name={data.from.name}
          email={data.from.email}
          lines={data.from.lines}
          onName={(v) => setData((d) => ({ ...d, from: { ...d.from, name: v } }))}
          onEmail={(v) => setData((d) => ({ ...d, from: { ...d.from, email: v } }))}
          onLines={(v) => setData((d) => ({ ...d, from: { ...d.from, lines: v } }))}
        />
        <PartyCard
          title="Bill to"
          name={data.to.name}
          email={data.to.email}
          lines={data.to.lines}
          onName={(v) => setData((d) => ({ ...d, to: { ...d.to, name: v } }))}
          onEmail={(v) => setData((d) => ({ ...d, to: { ...d.to, email: v } }))}
          onLines={(v) => setData((d) => ({ ...d, to: { ...d.to, lines: v } }))}
        />
      </section>

      {/* Meta */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Receipt className="size-4 text-primary" />
          Invoice
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="num" className="text-xs font-medium">Number</Label>
            <Input id="num" value={data.invoiceNumber} onChange={(e) => setData((d) => ({ ...d, invoiceNumber: e.target.value }))} className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue" className="text-xs font-medium">Issue date</Label>
            <Input id="issue" type="date" value={data.issueDate} onChange={(e) => setData((d) => ({ ...d, issueDate: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due" className="text-xs font-medium">Due date</Label>
            <Input id="due" type="date" value={data.dueDate} onChange={(e) => setData((d) => ({ ...d, dueDate: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs font-medium">Currency</Label>
            <Select value={data.currency} onValueChange={(v) => v && setData((d) => ({ ...d, currency: v }))}>
              <SelectTrigger id="currency" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Line items */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Line items
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="size-3.5" />
            Line
          </Button>
        </div>
        <div className="space-y-2">
          <div className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[1fr_70px_110px_110px_24px] sm:gap-2 sm:px-2">
            <div>Description</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Amount</div>
            <div />
          </div>
          {data.items.map((item) => {
            const lineTotal = item.quantity * item.rate;
            return (
              <div key={item.id} className="grid grid-cols-[1fr_70px_110px_110px_24px] gap-2 rounded-lg border border-border/60 bg-background p-2">
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Item description"
                />
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
                  className="text-right font-mono"
                />
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, { rate: Math.max(0, Number(e.target.value) || 0) })}
                  className="text-right font-mono"
                />
                <div className="grid place-items-center text-right font-mono text-sm tabular-nums">
                  {formatMoney(lineTotal, data.currency)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="grid place-items-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Remove line"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Money modifiers */}
      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="tax" className="text-xs font-medium">Tax %</Label>
          <Input
            id="tax"
            type="number"
            min={0}
            max={100}
            step="any"
            value={data.taxPercent}
            onChange={(e) => setData((d) => ({ ...d, taxPercent: Math.max(0, Number(e.target.value) || 0) }))}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discount" className="text-xs font-medium">Discount ({data.currency})</Label>
          <Input
            id="discount"
            type="number"
            min={0}
            step="any"
            value={data.discount}
            onChange={(e) => setData((d) => ({ ...d, discount: Math.max(0, Number(e.target.value) || 0) }))}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="theme" className="text-xs font-medium">Theme colour</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.themeColor}
              onChange={(e) => setData((d) => ({ ...d, themeColor: e.target.value }))}
              className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
              aria-label="Theme colour"
            />
            <Input
              id="theme"
              value={data.themeColor}
              onChange={(e) => setData((d) => ({ ...d, themeColor: e.target.value }))}
              className="font-mono"
            />
          </div>
        </div>
      </section>

      {/* Logo + notes + terms */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Branding & terms
        </h2>
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Logo (PNG or JPG)</Label>
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="size-16 rounded border border-border object-contain" />
                  <Button type="button" size="sm" variant="ghost" onClick={clearLogo}>
                    <X className="size-3.5" />
                    Remove
                  </Button>
                </>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
                  <FileUp className="size-4" />
                  Upload logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) void pickLogo(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Up to 1.5 MB. Drawn in the top-right corner of the PDF.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
              <Textarea
                id="notes"
                value={data.notes}
                onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Thanks for your business!"
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="terms" className="text-xs font-medium">Payment terms</Label>
              <Textarea
                id="terms"
                value={data.paymentTerms}
                onChange={(e) => setData((d) => ({ ...d, paymentTerms: e.target.value }))}
                placeholder="Net 14. Late payments accrue 1.5% interest per month."
                className="min-h-[60px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Download */}
      <section className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="filename" className="text-xs font-medium">Output filename</Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="invoice.pdf"
            className="font-mono w-64"
          />
        </div>
        <div className="flex gap-1.5">
          <Button type="button" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
          <Button type="button" onClick={build} disabled={busy || data.items.length === 0}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Download className="size-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </section>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this invoice
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Receipt className="mt-0.5 size-3.5 shrink-0 text-primary" />Drawn with pdf-lib using built-in Helvetica + Helvetica Bold, so the output PDF has no font-embedding licensing concerns.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />A4 portrait by default; line items overflow onto additional pages automatically.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Currency formatting uses your browser&apos;s Intl.NumberFormat — symbols, separators and decimal places follow your locale.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — everything runs in your browser. Form values save to localStorage (without the logo bytes).</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Rendered locally — nothing is uploaded.
      </p>
    </div>
  );
}

function PartyCard({
  title,
  name,
  email,
  lines,
  onName,
  onEmail,
  onLines,
}: {
  title: string;
  name: string;
  email: string;
  lines: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onLines: (v: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
      <h3 className={cn("text-[10px] font-medium uppercase tracking-wider text-muted-foreground")}>{title}</h3>
      <Input value={name} onChange={(e) => onName(e.target.value)} placeholder="Name" />
      <Input type="email" value={email} onChange={(e) => onEmail(e.target.value)} placeholder="email@example.com" />
      <Textarea value={lines} onChange={(e) => onLines(e.target.value)} placeholder="Address" className="min-h-[88px]" />
    </div>
  );
}
