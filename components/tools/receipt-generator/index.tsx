"use client";

import * as React from "react";
import {
  Eraser,
  Lock,
  Plus,
  Printer,
  Receipt,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const KEY = "toollyz:receipt";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface ReceiptState {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessTaxId: string;
  receiptNumber: string;
  date: string;
  cashier: string;
  items: LineItem[];
  /** Tax percentage (0-100). */
  taxRate: number;
  /** Discount percentage (0-100). */
  discountRate: number;
  /** Currency symbol. */
  currency: string;
  paymentMethod: string;
  footerNote: string;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

const DEFAULTS: ReceiptState = {
  businessName: "Toollyz Café",
  businessAddress: "12 Browser Lane, Webville",
  businessPhone: "+1 (555) 010-1234",
  businessTaxId: "TIN: 00-1234567",
  receiptNumber: "R-000123",
  date: new Date().toISOString().slice(0, 10),
  cashier: "Alex",
  items: [
    { id: uid(), description: "Cappuccino — Large", qty: 2, unitPrice: 4.5 },
    { id: uid(), description: "Avocado Toast", qty: 1, unitPrice: 8.0 },
    { id: uid(), description: "Chocolate Croissant", qty: 1, unitPrice: 3.25 },
  ],
  taxRate: 8.25,
  discountRate: 0,
  currency: "$",
  paymentMethod: "Card · **** 4242",
  footerNote: "Thanks for stopping by!",
};

export default function ReceiptGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [s, setS] = React.useState<ReceiptState>(DEFAULTS);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReceiptState>;
        setS({ ...DEFAULTS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* noop */
    }
  }, [s, mounted]);

  const subtotal = React.useMemo(
    () => s.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
    [s.items],
  );
  const discount = (subtotal * s.discountRate) / 100;
  const afterDiscount = subtotal - discount;
  const tax = (afterDiscount * s.taxRate) / 100;
  const total = afterDiscount + tax;

  function update(patch: Partial<ReceiptState>) {
    setS((prev) => ({ ...prev, ...patch }));
  }
  function updateItem(id: string, patch: Partial<LineItem>) {
    setS((prev) => ({ ...prev, items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  }
  function removeItem(id: string) {
    setS((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  }
  function addItem() {
    setS((prev) => ({
      ...prev,
      items: [...prev.items, { id: uid(), description: "", qty: 1, unitPrice: 0 }],
    }));
  }

  function fmt(n: number): string {
    return `${s.currency}${n.toFixed(2)}`;
  }

  function printReceipt() {
    window.print();
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Editor — hidden when printing */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setS(DEFAULTS)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Sparkles className="size-3" />
            Sample
          </button>
          <button
            type="button"
            onClick={() =>
              setS({ ...DEFAULTS, businessName: "", businessAddress: "", businessPhone: "", businessTaxId: "", receiptNumber: "", cashier: "", items: [], footerNote: "" })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Eraser className="size-3" />
            Clear
          </button>
          <Button type="button" size="sm" onClick={printReceipt}>
            <Printer className="size-3.5" />
            Print / Save as PDF
          </Button>
        </div>

        <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
          <Field label="Business name">
            <Input value={s.businessName} onChange={(e) => update({ businessName: e.target.value })} className="h-9" />
          </Field>
          <Field label="Address">
            <Input value={s.businessAddress} onChange={(e) => update({ businessAddress: e.target.value })} className="h-9" />
          </Field>
          <Field label="Phone">
            <Input value={s.businessPhone} onChange={(e) => update({ businessPhone: e.target.value })} className="h-9" />
          </Field>
          <Field label="Tax ID">
            <Input value={s.businessTaxId} onChange={(e) => update({ businessTaxId: e.target.value })} className="h-9" />
          </Field>
          <Field label="Receipt number">
            <Input value={s.receiptNumber} onChange={(e) => update({ receiptNumber: e.target.value })} className="h-9 font-mono" />
          </Field>
          <Field label="Date">
            <Input type="date" value={s.date} onChange={(e) => update({ date: e.target.value })} className="h-9" />
          </Field>
          <Field label="Cashier">
            <Input value={s.cashier} onChange={(e) => update({ cashier: e.target.value })} className="h-9" />
          </Field>
          <Field label="Currency">
            <Input value={s.currency} onChange={(e) => update({ currency: e.target.value })} className="h-9 font-mono" />
          </Field>
          <Field label="Payment method">
            <Input value={s.paymentMethod} onChange={(e) => update({ paymentMethod: e.target.value })} className="h-9" />
          </Field>
          <Field label="Footer note">
            <Input value={s.footerNote} onChange={(e) => update({ footerNote: e.target.value })} className="h-9" />
          </Field>
        </section>

        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Line items ({s.items.length})</h2>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="size-3.5" />
              Item
            </Button>
          </div>
          {s.items.length === 0 && (
            <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
              No line items.
            </p>
          )}
          {s.items.map((it) => (
            <div key={it.id} className="grid grid-cols-12 items-center gap-2 text-xs">
              <Input
                value={it.description}
                onChange={(e) => updateItem(it.id, { description: e.target.value })}
                placeholder="Description"
                className="col-span-6 h-8"
              />
              <Input
                type="number"
                value={it.qty}
                onChange={(e) => updateItem(it.id, { qty: parseFloat(e.target.value || "0") })}
                placeholder="Qty"
                className="col-span-2 h-8 font-mono"
                min={0}
                step={1}
              />
              <Input
                type="number"
                value={it.unitPrice}
                onChange={(e) => updateItem(it.id, { unitPrice: parseFloat(e.target.value || "0") })}
                placeholder="Unit price"
                className="col-span-3 h-8 font-mono"
                min={0}
                step={0.01}
              />
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="col-span-1 ml-auto rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500"
                aria-label="Remove item"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </section>

        <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
          <Field label={`Tax rate (${s.taxRate.toFixed(2)}%)`}>
            <Input
              type="number"
              value={s.taxRate}
              onChange={(e) => update({ taxRate: parseFloat(e.target.value || "0") })}
              min={0}
              max={100}
              step={0.01}
              className="h-9 font-mono"
            />
          </Field>
          <Field label={`Discount (${s.discountRate.toFixed(2)}%)`}>
            <Input
              type="number"
              value={s.discountRate}
              onChange={(e) => update({ discountRate: parseFloat(e.target.value || "0") })}
              min={0}
              max={100}
              step={0.01}
              className="h-9 font-mono"
            />
          </Field>
        </section>
      </div>

      {/* Printable receipt — visible on screen and printer */}
      <section
        id="receipt"
        className="mx-auto max-w-[360px] rounded-2xl border border-border/70 bg-white p-6 font-mono text-[12px] text-zinc-900 shadow-sm print:max-w-none print:border-0 print:shadow-none"
      >
        <header className="text-center">
          <Receipt className="mx-auto mb-2 size-6" />
          <div className="text-base font-bold uppercase tracking-wide">{s.businessName || "Business name"}</div>
          {s.businessAddress && <div className="mt-1 text-[11px]">{s.businessAddress}</div>}
          {s.businessPhone && <div className="text-[11px]">{s.businessPhone}</div>}
          {s.businessTaxId && <div className="text-[11px]">{s.businessTaxId}</div>}
        </header>
        <hr className="my-3 border-dashed border-zinc-300" />
        <div className="flex justify-between text-[11px]">
          <span>#{s.receiptNumber || "—"}</span>
          <span>{s.date}</span>
        </div>
        {s.cashier && <div className="text-[11px]">Cashier: {s.cashier}</div>}
        <hr className="my-3 border-dashed border-zinc-300" />
        <div className="space-y-1">
          {s.items.map((it) => (
            <div key={it.id} className="space-y-0.5">
              <div className="flex justify-between">
                <span className="flex-1 truncate pr-2">{it.description || "(item)"}</span>
                <span>{fmt(it.qty * it.unitPrice)}</span>
              </div>
              <div className="text-[10px] text-zinc-500">
                {it.qty} × {fmt(it.unitPrice)}
              </div>
            </div>
          ))}
        </div>
        <hr className="my-3 border-dashed border-zinc-300" />
        <div className="space-y-1 text-[11px]">
          <Row label="Subtotal" value={fmt(subtotal)} />
          {s.discountRate > 0 && <Row label={`Discount (${s.discountRate.toFixed(2)}%)`} value={`- ${fmt(discount)}`} />}
          <Row label={`Tax (${s.taxRate.toFixed(2)}%)`} value={fmt(tax)} />
        </div>
        <hr className="my-3 border-dashed border-zinc-300" />
        <div className="flex justify-between text-base font-bold">
          <span>TOTAL</span>
          <span>{fmt(total)}</span>
        </div>
        <hr className="my-3 border-dashed border-zinc-300" />
        {s.paymentMethod && <div className="text-[11px]">Paid: {s.paymentMethod}</div>}
        {s.footerNote && (
          <p className="mt-3 text-center text-[11px]">{s.footerNote}</p>
        )}
      </section>

      <style>{`
        @media print {
          body { background: white !important; }
          @page { size: 80mm auto; margin: 6mm; }
        }
      `}</style>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground print:hidden">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Everything stays in your browser — print to paper or save the same dialog as PDF.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

void cn;
