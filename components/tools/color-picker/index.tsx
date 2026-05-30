"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  Info,
  Lock,
  Paintbrush,
  Palette,
  Pipette,
  Shuffle,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  adjustHsl,
  formatCmyk,
  formatHsl,
  formatRgb,
  hexToHsl,
  hexToRgb,
  hslToHex,
  rgbToHex,
  type HSL,
  type RGB,
} from "@/lib/tools/color/color";
import { contrastRatio, gradeContrast } from "@/lib/tools/color/contrast";
import { formatHsv, formatHwb, formatOklch, rgbToHsv, rgbToHwb, rgbToOklch } from "@/lib/tools/color/spaces";
import { contrastInk } from "@/lib/tools/color/parse";

const SETTINGS_KEY = "toollyz:color-picker-settings";
const FAVORITES_KEY = "toollyz:color-picker-favorites";
const HISTORY_KEY = "toollyz:color-picker-history";

const DEFAULT_HEX = "#6366F1";

const PRESETS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#0EA5E9",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#111827",
  "#F3F4F6",
];

interface Settings {
  hex: string;
  alpha: number;
  compareWith: string;
}

const DEFAULT_SETTINGS: Settings = {
  hex: DEFAULT_HEX,
  alpha: 1,
  compareWith: "#FFFFFF",
};

interface EyeDropperResult { sRGBHex: string }
interface EyeDropperConstructor { new (): { open: (signal?: { signal?: AbortSignal }) => Promise<EyeDropperResult> } }

export default function ColorPicker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [eyedropperSupported, setEyedropperSupported] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(s) as Partial<Settings>) });
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f) as string[]);
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as string[]);
    } catch {
      /* noop */
    }
    setEyedropperSupported(typeof window !== "undefined" && "EyeDropper" in window);
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
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      /* noop */
    }
  }, [favorites, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  // Push to history when the hex changes (debounced via simple effect)
  React.useEffect(() => {
    if (!mounted) return;
    const t = window.setTimeout(() => {
      const next = settings.hex.toUpperCase();
      setHistory((prev) => {
        if (prev[0] === next) return prev;
        return [next, ...prev.filter((h) => h !== next)].slice(0, 18);
      });
    }, 300);
    return () => window.clearTimeout(t);
  }, [settings.hex, mounted]);

  const hex = normalizeHex(settings.hex);
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  const hsv = rgbToHsv(rgb);
  const hwb = rgbToHwb(rgb);
  const oklch = rgbToOklch(rgb);
  const cmyk = formatCmyk(rgb);

  const compareRgb = hexToRgb(normalizeHex(settings.compareWith));
  const ratio = contrastRatio(hex, normalizeHex(settings.compareWith));
  const grades = gradeContrast(ratio);

  const fg = contrastInk({ r: rgb.r, g: rgb.g, b: rgb.b });

  const formats: { label: string; value: string }[] = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: formatRgb(rgb) },
    { label: "RGBA", value: settings.alpha < 1 ? formatRgb(rgb, settings.alpha) : formatRgb(rgb, 1) },
    { label: "HSL", value: formatHsl(hsl) },
    { label: "HSLA", value: settings.alpha < 1 ? formatHsl(hsl, settings.alpha) : formatHsl(hsl, 1) },
    { label: "HSV", value: formatHsv(hsv) },
    { label: "HWB", value: formatHwb(hwb, settings.alpha < 1 ? settings.alpha : undefined) },
    { label: "OKLCH", value: formatOklch(oklch, settings.alpha < 1 ? settings.alpha : undefined) },
    { label: "CMYK", value: cmyk },
  ];

  function setHex(h: string) {
    setSettings((s) => ({ ...s, hex: normalizeHex(h) }));
  }

  function setHsl(next: Partial<HSL>) {
    const merged: HSL = { ...hsl, ...next };
    setHex(hslToHex(merged));
  }

  function setRgbCh(ch: keyof RGB, v: number) {
    const next: RGB = { ...rgb, [ch]: Math.max(0, Math.min(255, Math.round(v))) };
    setHex(rgbToHex(next));
  }

  function randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 30);
    const l = 35 + Math.floor(Math.random() * 45);
    setHex(hslToHex({ h, s, l }));
  }

  async function copy(s: string, what = "Color") {
    try {
      await navigator.clipboard.writeText(s);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function pickFromScreen() {
    try {
      const Ctor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
      if (!Ctor) {
        toast.error("EyeDropper isn't supported in this browser.");
        return;
      }
      const result = await new Ctor().open();
      setHex(result.sRGBHex);
      toast.success(`Picked ${result.sRGBHex.toUpperCase()}`);
    } catch {
      /* user cancelled */
    }
  }

  function toggleFavorite() {
    const next = hex.toUpperCase();
    setFavorites((prev) => prev.includes(next) ? prev.filter((c) => c !== next) : [next, ...prev].slice(0, 24));
  }

  const isFavorite = favorites.includes(hex.toUpperCase());

  // Tints / shades / complementary
  const tints = [10, 20, 30].map((p) => adjustHsl(hex, { l: p }));
  const shades = [10, 20, 30].map((p) => adjustHsl(hex, { l: -p }));
  const complementary = adjustHsl(hex, { h: 180 });
  const triadic = [adjustHsl(hex, { h: 120 }), adjustHsl(hex, { h: 240 })];
  const analogous = [adjustHsl(hex, { h: -30 }), adjustHsl(hex, { h: 30 })];

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
      {/* Hero swatch */}
      <section
        aria-label="Selected color"
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 transition-colors"
        style={{ backgroundColor: hex, color: fg }}
      >
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Selected color</div>
            <div className="mt-1 font-heading text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
              {hex.toUpperCase()}
            </div>
            <div className="mt-1 font-mono text-xs opacity-80">
              {formatRgb(rgb)} · {formatHsl(hsl)}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:justify-end">
            <button
              type="button"
              onClick={toggleFavorite}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 text-sm font-medium backdrop-blur hover:bg-white/25"
              aria-label="Toggle favorite"
              style={{ color: fg }}
            >
              <Star className={cn("size-4", isFavorite && "fill-current")} />
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => copy(hex.toUpperCase())}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 text-sm font-medium backdrop-blur hover:bg-white/25"
              style={{ color: fg }}
            >
              <Copy className="size-4" />
              HEX
            </button>
            <button
              type="button"
              onClick={randomColor}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 text-sm font-medium backdrop-blur hover:bg-white/25"
              style={{ color: fg }}
            >
              <Shuffle className="size-4" />
              Random
            </button>
            {eyedropperSupported && (
              <button
                type="button"
                onClick={pickFromScreen}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 text-sm font-medium backdrop-blur hover:bg-white/25"
                style={{ color: fg }}
              >
                <Pipette className="size-4" />
                Eyedropper
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Picker + values */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Palette className="size-4 text-primary" />
            Picker
          </h2>

          {/* Native input + HEX text */}
          <div className="grid items-end gap-3 sm:grid-cols-[auto_1fr_auto]">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-12 w-16 cursor-pointer rounded-lg border border-border bg-background p-1"
              aria-label="Color picker"
            />
            <div className="space-y-1">
              <Label htmlFor="hexInput" className="text-xs font-medium">
                HEX
              </Label>
              <Input
                id="hexInput"
                value={settings.hex}
                onChange={(e) => setSettings((s) => ({ ...s, hex: e.target.value }))}
                onBlur={() => setHex(settings.hex)}
                className="font-mono"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setHex(DEFAULT_HEX)}>
              Reset
            </Button>
          </div>

          {/* Alpha slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="alpha" className="font-medium">
                Alpha
              </Label>
              <span className="font-mono tabular-nums">{settings.alpha.toFixed(2)}</span>
            </div>
            <Slider
              id="alpha"
              value={[settings.alpha]}
              onValueChange={(v) => setSettings((s) => ({ ...s, alpha: Array.isArray(v) ? v[0] : (v as number) }))}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* HSL/RGB sliders */}
          <Tabs defaultValue="hsl" className="w-full">
            <TabsList className="mb-3 grid w-full grid-cols-2">
              <TabsTrigger value="hsl">HSL</TabsTrigger>
              <TabsTrigger value="rgb">RGB</TabsTrigger>
            </TabsList>
            <TabsContent value="hsl" className="space-y-2">
              <SliderRow label="Hue" value={hsl.h} max={360} onChange={(v) => setHsl({ h: v })} suffix="°" />
              <SliderRow label="Saturation" value={hsl.s} max={100} onChange={(v) => setHsl({ s: v })} suffix="%" />
              <SliderRow label="Lightness" value={hsl.l} max={100} onChange={(v) => setHsl({ l: v })} suffix="%" />
            </TabsContent>
            <TabsContent value="rgb" className="space-y-2">
              <SliderRow label="Red" value={rgb.r} max={255} onChange={(v) => setRgbCh("r", v)} />
              <SliderRow label="Green" value={rgb.g} max={255} onChange={(v) => setRgbCh("g", v)} />
              <SliderRow label="Blue" value={rgb.b} max={255} onChange={(v) => setRgbCh("b", v)} />
            </TabsContent>
          </Tabs>

          {/* Presets */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Presets</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setHex(c)}
                  className="size-7 rounded-md border border-border ring-offset-background hover:ring-2 hover:ring-primary"
                  style={{ backgroundColor: c }}
                  title={c}
                  aria-label={`Use ${c}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Format outputs */}
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Formats
          </h2>
          <ul className="space-y-1.5 list-none">
            {formats.map((f) => (
              <li key={f.label} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
                <span className="w-14 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </span>
                <span className="flex-1 break-all font-mono text-xs">{f.value}</span>
                <button
                  type="button"
                  onClick={() => copy(f.value, f.label)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Copy ${f.label}`}
                >
                  <Copy className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Contrast */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Eye className="size-4 text-primary" />
          WCAG contrast vs. {settings.compareWith.toUpperCase()}
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <div className="space-y-1">
            <Label htmlFor="compareWith" className="text-xs font-medium">
              Compare with
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={normalizeHex(settings.compareWith)}
                onChange={(e) => setSettings((s) => ({ ...s, compareWith: e.target.value }))}
                className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-background p-1"
                aria-label="Compare color"
              />
              <Input
                id="compareWith"
                value={settings.compareWith}
                onChange={(e) => setSettings((s) => ({ ...s, compareWith: e.target.value }))}
                className="font-mono"
              />
            </div>
            <div className="flex gap-1.5 pt-1">
              <button type="button" onClick={() => setSettings((s) => ({ ...s, compareWith: "#FFFFFF" }))} className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:bg-muted">
                White
              </button>
              <button type="button" onClick={() => setSettings((s) => ({ ...s, compareWith: "#000000" }))} className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:bg-muted">
                Black
              </button>
              <button type="button" onClick={() => setSettings((s) => ({ ...s, compareWith: "#0b1020" }))} className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:bg-muted">
                Toollyz dark
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-2">
                <div className="space-y-1 p-3" style={{ backgroundColor: settings.compareWith, color: hex }}>
                  <div className="text-xs font-medium opacity-70">Text on compare</div>
                  <div className="text-lg font-semibold">Sample text</div>
                  <div className="text-xs">12 px regular preview</div>
                </div>
                <div className="space-y-1 p-3" style={{ backgroundColor: hex, color: settings.compareWith }}>
                  <div className="text-xs font-medium opacity-70">Compare on text</div>
                  <div className="text-lg font-semibold">Sample text</div>
                  <div className="text-xs">12 px regular preview</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <RatioStat label="Ratio" value={`${ratio.toFixed(2)}:1`} />
              <RatioStat label="AA large" pass={grades.AALarge} />
              <RatioStat label="AA normal" pass={grades.AANormal} />
              <RatioStat label="AAA normal" pass={grades.AAANormal} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              AA normal ≥ 4.5:1 · AAA normal ≥ 7:1 · large = 18 pt or 14 pt bold.
            </p>
            <p className="text-[10px] text-muted-foreground">
              Compare RGB: {formatRgb(compareRgb)} — just a sanity check.
            </p>
          </div>
        </div>
      </section>

      {/* Harmonies */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Paintbrush className="size-4 text-primary" />
          Harmonies & shades
        </h2>
        <HarmonyRow label="Tints (lighter)" colors={tints} onPick={setHex} />
        <HarmonyRow label="Shades (darker)" colors={shades} onPick={setHex} />
        <HarmonyRow label="Complementary" colors={[complementary]} onPick={setHex} />
        <HarmonyRow label="Triadic" colors={triadic} onPick={setHex} />
        <HarmonyRow label="Analogous" colors={analogous} onPick={setHex} />
      </section>

      {/* Favorites + history */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Star className="size-4 text-primary" />
              Favorites
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setFavorites([])} disabled={favorites.length === 0}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          {favorites.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-center text-xs text-muted-foreground">
              Click Save in the header above to pin colors here.
            </p>
          ) : (
            <SwatchGrid colors={favorites} onPick={setHex} />
          )}
        </section>
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Sparkles className="size-4 text-primary" />
              Recent
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setHistory([])} disabled={history.length === 0}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-center text-xs text-muted-foreground">
              Your recent colors will appear here as you experiment.
            </p>
          ) : (
            <SwatchGrid colors={history} onPick={setHex} />
          )}
        </section>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Everything stays in your browser — Toollyz has no backend.
      </p>

      {!eyedropperSupported && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="size-3" />
          Eyedropper isn&apos;t supported in this browser — it works on Chromium-based browsers (Chrome, Edge, Brave, Opera).
        </p>
      )}
    </div>
  );
}

function normalizeHex(s: string): string {
  let v = s.trim();
  if (!v) return DEFAULT_HEX;
  if (!v.startsWith("#")) v = "#" + v;
  const m = v.match(/^#([0-9a-fA-F]{3,8})$/);
  if (!m) return DEFAULT_HEX;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return DEFAULT_HEX;
  return "#" + h.toLowerCase();
}

function SliderRow({
  label,
  value,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <Label className="font-medium">{label}</Label>
        <span className="font-mono tabular-nums">
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))} min={0} max={max} step={1} />
    </div>
  );
}

function HarmonyRow({ label, colors, onPick }: { label: string; colors: string[]; onPick: (c: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            onClick={() => onPick(c)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono hover:bg-muted"
          >
            <span className="size-3.5 rounded-sm border border-border" style={{ backgroundColor: c }} />
            {c.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwatchGrid({ colors, onPick }: { colors: string[]; onPick: (c: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
      {colors.map((c, i) => (
        <button
          key={`${c}-${i}`}
          type="button"
          onClick={() => onPick(c)}
          title={c}
          aria-label={`Use ${c}`}
          className="aspect-square rounded-md border border-border ring-offset-background hover:ring-2 hover:ring-primary"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function RatioStat({ label, value, pass }: { label: string; value?: string; pass?: boolean }) {
  if (pass === undefined) {
    return (
      <div className="rounded-lg border border-border/60 bg-background p-2.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-mono text-sm font-semibold">{value}</div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        pass
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
          : "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400",
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
        {pass ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
        {pass ? "Pass" : "Fail"}
      </div>
    </div>
  );
}
