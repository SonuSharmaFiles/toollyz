"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Copy, Lock, Pipette, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCmyk, formatHsl, rgbToHsl } from "@/lib/tools/color/color";
import { asRgb, contrastInk, parseHexStrict, rgbaToHex, rgbaToString } from "@/lib/tools/color/parse";

const KEY = "toollyz:hex-input";
const PRESETS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9", "#A855F7", "#111827", "#FFFFFF"];

export default function HexToRgb() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [hex, setHex] = React.useState("#6366F1");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try { setHex(localStorage.getItem(KEY) ?? "#6366F1"); } catch { /* noop */ }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(KEY, hex); } catch { /* noop */ } }, [hex, mounted]);

  const parsed = React.useMemo(() => parseHexStrict(hex), [hex]);
  void reduceMotion;

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
        { key: "CSS var()", value: `--brand: ${rgbaToHex(parsed)};` },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <section aria-label="Color preview" className="relative overflow-hidden rounded-3xl border border-white/10 transition-colors" style={{ background: previewBg, color: ink }}>
        <div className="relative p-6 sm:p-10">
          <div className="text-xs font-medium opacity-70">HEX input</div>
          <div className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-6xl">{parsed ? rgbaToHex(parsed, { uppercase: true }) : "—"}</div>
          {parsed ? (
            <div className="mt-2 text-sm opacity-80">{rgbaToString(parsed)} · {formatHsl(hsl, parsed.a)}</div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-2.5 py-1 text-sm text-rose-100"><AlertTriangle className="size-4" />Not a valid HEX color</div>
          )}
        </div>
      </section>

      {/* Input + presets */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Pipette className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#6366F1 or 6366F1" className="pl-8 font-mono" aria-label="HEX color" />
          </div>
          <input type="color" value={parsed ? rgbaToHex({ ...parsed, a: 1 }) : "#6366f1"} onChange={(e) => setHex(e.target.value.toUpperCase())} aria-label="Color picker" className="h-10 w-12 cursor-pointer rounded-lg border border-input bg-background" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground">Try:</span>
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setHex(p)} className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-muted">
              <span className="block size-3 rounded border border-border/60" style={{ background: p }} />{p}
            </button>
          ))}
          <button type="button" onClick={() => setHex(`#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase()}`)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"><Sparkles className="size-3" />Random</button>
        </div>
      </section>

      {/* Channels */}
      {parsed && (
        <section className="grid gap-3 sm:grid-cols-4">
          <ChannelCard label="R" value={parsed.r} tone="bg-rose-500" />
          <ChannelCard label="G" value={parsed.g} tone="bg-emerald-500" />
          <ChannelCard label="B" value={parsed.b} tone="bg-sky-500" />
          <ChannelCard label="A" value={Number(parsed.a.toFixed(3))} max={1} tone="bg-slate-400" />
        </section>
      )}

      {/* Format outputs */}
      {parsed && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">All formats</h2>
          <ul className="divide-y divide-border/60 list-none">
            {formats.map((f) => (
              <li key={f.key} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="w-28 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{f.key}</span>
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

function ChannelCard({ label, value, tone, max = 255 }: { label: string; value: number; tone: string; max?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{label}</span><span className="font-mono tabular-nums">{max === 1 ? value : value}{max === 255 ? "" : ""}</span></div>
      <div className="font-heading text-2xl font-bold tabular-nums">{value}{max === 255 ? "" : ""}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", tone)} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
