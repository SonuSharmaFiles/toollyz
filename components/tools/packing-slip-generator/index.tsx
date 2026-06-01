"use client";

import * as React from "react";
import {
  Box,
  Eraser,
  Lock,
  Package,
  Plus,
  Printer,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const KEY = "toollyz:packing-slip";

interface SlipItem {
  id: string;
  sku: string;
  description: string;
  qty: number;
}

interface SlipState {
  shipFromName: string;
  shipFromAddress: string;
  shipToName: string;
  shipToAddress: string;
  orderNumber: string;
  shipDate: string;
  carrier: string;
  trackingNumber: string;
  items: SlipItem[];
  notes: string;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

const DEFAULTS: SlipState = {
  shipFromName: "Toollyz Supply Co.",
  shipFromAddress: "12 Browser Lane, Warehouse 3\nWebville, CA 94000\nUSA",
  shipToName: "Sam Buyer",
  shipToAddress: "456 Customer Street, Apt 5\nFastview, OR 97200\nUSA",
  orderNumber: "ORD-78421",
  shipDate: new Date().toISOString().slice(0, 10),
  carrier: "USPS",
  trackingNumber: "9400 1118 9930 1234 5678 90",
  items: [
    { id: uid(), sku: "WGT-001", description: "Wireless Mouse — Slate Grey", qty: 1 },
    { id: uid(), sku: "WGT-002", description: "Mechanical Keyboard (TKL)", qty: 1 },
    { id: uid(), sku: "CBL-014", description: "USB-C Cable, 1m, Braided", qty: 3 },
  ],
  notes: "Thanks for your order! Returns accepted within 30 days.",
};

export default function PackingSlipGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [s, setS] = React.useState<SlipState>(DEFAULTS);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SlipState>;
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

  const totalQty = s.items.reduce((sum, it) => sum + (it.qty || 0), 0);

  function update(patch: Partial<SlipState>) {
    setS((prev) => ({ ...prev, ...patch }));
  }
  function updateItem(id: string, patch: Partial<SlipItem>) {
    setS((prev) => ({ ...prev, items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  }
  function removeItem(id: string) {
    setS((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  }
  function addItem() {
    setS((prev) => ({ ...prev, items: [...prev.items, { id: uid(), sku: "", description: "", qty: 1 }] }));
  }

  function printSlip() {
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
            onClick={() => setS({ ...DEFAULTS, shipFromName: "", shipFromAddress: "", shipToName: "", shipToAddress: "", orderNumber: "", carrier: "", trackingNumber: "", items: [], notes: "" })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Eraser className="size-3" />
            Clear
          </button>
          <Button type="button" size="sm" onClick={printSlip}>
            <Printer className="size-3.5" />
            Print / Save as PDF
          </Button>
        </div>

        <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
          <Field label="Ship from — name">
            <Input value={s.shipFromName} onChange={(e) => update({ shipFromName: e.target.value })} className="h-9" />
          </Field>
          <Field label="Ship to — name">
            <Input value={s.shipToName} onChange={(e) => update({ shipToName: e.target.value })} className="h-9" />
          </Field>
          <Field label="Ship from — address">
            <textarea
              value={s.shipFromAddress}
              onChange={(e) => update({ shipFromAddress: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background p-2 text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </Field>
          <Field label="Ship to — address">
            <textarea
              value={s.shipToAddress}
              onChange={(e) => update({ shipToAddress: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background p-2 text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </Field>
          <Field label="Order number">
            <Input value={s.orderNumber} onChange={(e) => update({ orderNumber: e.target.value })} className="h-9 font-mono" />
          </Field>
          <Field label="Ship date">
            <Input type="date" value={s.shipDate} onChange={(e) => update({ shipDate: e.target.value })} className="h-9" />
          </Field>
          <Field label="Carrier">
            <Input value={s.carrier} onChange={(e) => update({ carrier: e.target.value })} className="h-9" />
          </Field>
          <Field label="Tracking number">
            <Input value={s.trackingNumber} onChange={(e) => update({ trackingNumber: e.target.value })} className="h-9 font-mono" />
          </Field>
          <Field label="Notes (printed at bottom)">
            <Input value={s.notes} onChange={(e) => update({ notes: e.target.value })} className="h-9" />
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
              No items.
            </p>
          )}
          {s.items.map((it) => (
            <div key={it.id} className="grid grid-cols-12 items-center gap-2 text-xs">
              <Input
                value={it.sku}
                onChange={(e) => updateItem(it.id, { sku: e.target.value })}
                placeholder="SKU"
                className="col-span-3 h-8 font-mono"
              />
              <Input
                value={it.description}
                onChange={(e) => updateItem(it.id, { description: e.target.value })}
                placeholder="Description"
                className="col-span-7 h-8"
              />
              <Input
                type="number"
                value={it.qty}
                onChange={(e) => updateItem(it.id, { qty: parseInt(e.target.value || "0", 10) })}
                placeholder="Qty"
                className="col-span-1 h-8 font-mono"
                min={0}
                step={1}
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
      </div>

      {/* Printable packing slip */}
      <section
        id="packing-slip"
        className="mx-auto max-w-[800px] rounded-2xl border border-border/70 bg-white p-8 text-zinc-900 shadow-sm print:max-w-none print:border-0 print:shadow-none"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
              <Package className="size-6" />
              Packing Slip
            </h1>
            <div className="text-xs">
              Order <span className="font-mono font-semibold">#{s.orderNumber || "—"}</span> · {s.shipDate}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-300 p-3 text-right text-xs">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Carrier</div>
            <div className="font-bold">{s.carrier || "—"}</div>
            {s.trackingNumber && <div className="mt-1 font-mono text-[10px]">{s.trackingNumber}</div>}
          </div>
        </header>

        <hr className="my-5 border-zinc-300" />

        <section className="grid gap-4 sm:grid-cols-2">
          <Address title="Ship from" name={s.shipFromName} address={s.shipFromAddress} />
          <Address title="Ship to" name={s.shipToName} address={s.shipToAddress} />
        </section>

        <hr className="my-5 border-zinc-300" />

        <section>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-300">
                <th className="px-2 py-2 text-left">SKU</th>
                <th className="px-2 py-2 text-left">Description</th>
                <th className="px-2 py-2 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {s.items.map((it) => (
                <tr key={it.id} className="border-b border-zinc-200">
                  <td className="px-2 py-1.5 font-mono">{it.sku || "—"}</td>
                  <td className="px-2 py-1.5">{it.description || "—"}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{it.qty}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="px-2 py-2 text-right text-xs font-semibold">Total items</td>
                <td className="px-2 py-2 text-right font-mono text-xs font-bold">{totalQty}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {s.notes && (
          <>
            <hr className="my-5 border-zinc-300" />
            <p className="text-xs italic">{s.notes}</p>
          </>
        )}
      </section>

      <style>{`
        @media print {
          body { background: white !important; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground print:hidden">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Everything stays in your browser — print to paper or save as PDF.
      </p>
    </div>
  );
}

function Address({ title, name, address }: { title: string; name: string; address: string }) {
  return (
    <div className="text-xs">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="mt-1 font-semibold">{name || "—"}</div>
      <div className="mt-1 whitespace-pre-wrap text-[11px]">{address}</div>
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

void cn;
void Box;
