"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Copy, Lock, Paintbrush, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatCmyk, formatHsl, rgbToHsl } from "@/lib/tools/color/color";
import { asRgb, contrastInk, parseRgbInput, rgbaToHex, rgbaToString, type RgbaColor } from "@/lib/tools/color/parse";

const KEY = "toollyz:rgb-input";
const PRESETS = [
  { label: "Indigo", value: "rgb(99, 102, 241)" },
  { label: "Emerald", value: "rgb(16, 185, 129)" },
  { label: "Amber", value: "rgb(245, 158, 11)" },
  { label: "Red", value: "rgb(239, 68, 68)" },
  { label: "Sky", value: "rgb(14, 165, 233)" },
  { label: "Translucent", value: "rgba(168, 85, 247, 0.5)" },
];

export default function RgbToHex() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState("rgb(99, 102, 241)");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try { setInput(localStorage.getItem(KEY) ?? "rgb(99, 102, 241)"); } catch { /* noop */ }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(KEY, input); } catch { /* noop */ } }, [input, mounted]);

  const parsed = React.useMemo(() => parseRgbInput(input), [input]);
  void reduceMotion;

  function setChannel(key: keyof RgbaColor, value: number) {
    const base = parsed ?? { r: 0, g: 0, b: 0, a: 1 };
    const next: RgbaColor = { ...base, [key]: value };
    setInput(next.a < 1 ? `rgba(${next.r}, ${next.g}, ${next.b}, ${Number(next.a.toFixed(3))})` : `rgb(${next.r}, ${next.g}, ${next.b})`);
  }

  async function copy(value: string, label: string) {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(value); window.setTimeout(() => setCopied(null), 1200); toast.success(label); } catch { toast.error("Could not copy"); }
  }

  if (!mounted) return <div className="space-y-4" aria-hidden="true"><div className="h-72 animate-pulse rounded-3xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;

  const previewBg = parsed ? `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})` : "#0b1020";
  const ink = parsed ? contrastInk(parsed) : "#ffffff";
  const rgb = parsed ? asRgb(parsed) : { r: 0, g: 0, b: 0 };
  const hsl = parsed ? rgbToHsl(rgb) : { h: 0, s: 0, l: 0 };

  const formats: { key: string; value: string }[] = parsed
    ? [
        { key: "HEX", value: rgbaToHex(parsed, { uppercase: true }) },
        { key: "HEX (lower)", value: rgbaToHex(parsed) },
        { key: "HEX with alpha", value: rgbaToHex(parsed, { uppercase: true, includeAlpha: true }) },
        { key: "RGB", value: rgbaToString({ ...parsed, a: 1 }) },
        { key: "RGBA", value: `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${Number(parsed.a.toFixed(3))})` },
        { key: "HSL", value: formatHsl(hsl) },
        { key: "HSLA", value: formatHsl(hsl, parsed.a) },
        { key: "CMYK", value: formatCmyk(rgb) },
        { key: "Tailwind arbitrary", value: `[#${rgbaToHex(parsed).slice(1)}]` },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <section aria-label="Color preview" className="relative overflow-hidden rounded-3xl border border-white/10 transition-colors" style={{ background: previewBg, color: ink }}>
        <div className="relative p-6 sm:p-10">
          <div className="text-xs font-medium opacity-70">RGB input</div>
          <div className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-6xl">{parsed ? rgbaToHex(parsed, { uppercase: true }) : "—"}</div>
          {parsed ? (
            <div className="mt-2 text-sm opacity-80">{rgbaToString(parsed)} · {formatHsl(hsl, parsed.a)}</div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-2.5 py-1 text-sm text-rose-100"><AlertTriangle className="size-4" />Couldn&apos;t parse — try rgb(99, 102, 241) or 99,102,241</div>
          )}
        </div>
      </section>

      {/* Input + presets */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Paintbrush className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="rgb(99, 102, 241) or 99,102,241" className="pl-8 font-mono" aria-label="RGB value" />
          </div>
          <input type="color" value={parsed ? rgbaToHex({ ...parsed, a: 1 }) : "#6366f1"} onChange={(e) => setInput(`rgb(${parseInt(e.target.value.slice(1, 3), 16)}, ${parseInt(e.target.value.slice(3, 5), 16)}, ${parseInt(e.target.value.slice(5, 7), 16)})`)} aria-label="Color picker" className="h-10 w-12 cursor-pointer rounded-lg border border-input bg-background" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground">Try:</span>
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => setInput(p.value)} className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-muted">{p.label}</button>
          ))}
          <button type="button" onClick={() => { const r = Math.floor(Math.random() * 256), g = Math.floor(Math.random() * 256), b = Math.floor(Math.random() * 256); setInput(`rgb(${r}, ${g}, ${b})`); }} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"><Sparkles className="size-3" />Random</button>
        </div>
      </section>

      {/* Channel sliders */}
      {parsed && (
        <section className="grid gap-4 sm:grid-cols-2">
          <SliderRow label="Red" max={255} value={parsed.r} onChange={(v) => setChannel("r", v)} tone="bg-rose-500" />
          <SliderRow label="Green" max={255} value={parsed.g} onChange={(v) => setChannel("g", v)} tone="bg-emerald-500" />
          <SliderRow label="Blue" max={255} value={parsed.b} onChange={(v) => setChannel("b", v)} tone="bg-sky-500" />
          <SliderRow label="Alpha" max={1} step={0.01} value={parsed.a} onChange={(v) => setChannel("a", v)} tone="bg-slate-400" />
        </section>
      )}

      {/* All formats */}
      {parsed && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">All formats</h2>
          <ul className="divide-y divide-border/60 list-none">
            {formats.map((f) => (
              <li key={f.key} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="w-32 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{f.key}</span>
                <span className="min-w-0 flex-1 break-all font-mono text-foreground/90">{f.value}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => copy(f.value, `${f.key} copied`)}>{copied === f.value ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />All conversion happens in your browser — Toollyz has no server.</p>
    </div>
  );
}

function SliderRow({ label, value, onChange, tone, max = 255, step = 1 }: { label: string; value: number; onChange: (v: number) => void; tone: string; max?: number; step?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="font-mono text-sm font-medium tabular-nums">{max === 1 ? value.toFixed(2) : value}</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)} min={0} max={max} step={step} />
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", tone)} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
