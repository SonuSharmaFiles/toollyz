"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Droplet,
  Eye,
  Heart,
  Lock,
  Pipette,
  Repeat,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCmyk,
  formatHsl,
  formatRgb,
  hexToHsl,
  hexToRgb,
  hslToHex,
  type HSL,
} from "@/lib/tools/color/color";
import {
  PALETTE_STYLES,
  adjustEntry,
  fromHex,
  generatePalette,
  lockEntry,
  type PaletteEntry,
  type PaletteStyle,
} from "@/lib/tools/color/palette";
import {
  bestTextColor,
  contrastRatio,
  gradeContrast,
} from "@/lib/tools/color/contrast";

const FAVORITES_KEY = "toollyz:color-favorites";
const PALETTES_KEY = "toollyz:color-palettes";

const SIZE_OPTIONS = [2, 3, 5, 10];

type GradientType = "linear" | "radial" | "conic";

interface SavedPalette {
  id: string;
  colors: string[];
  style: PaletteStyle;
  savedAt: number;
}

export default function RandomColorGenerator() {
  const [style, setStyle] = React.useState<PaletteStyle>("analogous");
  const [size, setSize] = React.useState(5);
  const [palette, setPalette] = React.useState<PaletteEntry[]>(() =>
    generatePalette("analogous", 5),
  );
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = React.useState<SavedPalette[]>([]);

  // Gradient state
  const [gradientType, setGradientType] = React.useState<GradientType>("linear");
  const [gradientAngle, setGradientAngle] = React.useState(135);
  const [gradientReverse, setGradientReverse] = React.useState(false);

  // Load saved state
  React.useEffect(() => {
    try {
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
      const p = localStorage.getItem(PALETTES_KEY);
      if (p) setSavedPalettes(JSON.parse(p));
    } catch {
      /* noop */
    }
  }, []);

  // Adjust palette size when changed
  React.useEffect(() => {
    if (palette.length === size) return;
    setPalette((prev) => {
      if (prev.length < size) {
        const extras = generatePalette(style, size - prev.length);
        return [...prev, ...extras];
      }
      return prev.slice(0, size);
    });
  }, [size, style, palette.length]);

  function persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }

  const regenerate = React.useCallback(() => {
    setPalette((prev) => generatePalette(style, size, prev));
  }, [style, size]);

  // Spacebar regen
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA", "BUTTON", "SELECT"].includes(e.target.tagName) &&
        !e.target.isContentEditable
      ) {
        e.preventDefault();
        regenerate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [regenerate]);

  function toggleLock(index: number) {
    setPalette((prev) =>
      prev.map((e, i) => (i === index ? lockEntry(e, !e.locked) : e)),
    );
  }

  function updateColor(index: number, hex: string) {
    setPalette((prev) =>
      prev.map((e, i) => (i === index ? fromHex(hex, e.locked) : e)),
    );
  }

  function adjust(index: number, delta: { h?: number; s?: number; l?: number }) {
    setPalette((prev) => prev.map((e, i) => (i === index ? adjustEntry(e, delta) : e)));
  }

  function adjustAll(delta: { h?: number; s?: number; l?: number }) {
    setPalette((prev) =>
      prev.map((e) => (e.locked ? e : adjustEntry(e, delta))),
    );
  }

  function toggleFavorite(hex: string) {
    setFavorites((prev) => {
      const next = prev.includes(hex)
        ? prev.filter((h) => h !== hex)
        : [hex, ...prev].slice(0, 24);
      persist(FAVORITES_KEY, next);
      return next;
    });
  }

  function savePalette() {
    const entry: SavedPalette = {
      id: crypto.randomUUID(),
      colors: palette.map((p) => p.hex),
      style,
      savedAt: Date.now(),
    };
    setSavedPalettes((prev) => {
      const next = [entry, ...prev].slice(0, 12);
      persist(PALETTES_KEY, next);
      return next;
    });
    toast.success("Palette saved");
  }

  function loadPalette(saved: SavedPalette) {
    setPalette(saved.colors.map((hex) => fromHex(hex)));
    setSize(saved.colors.length);
    if (PALETTE_STYLES.some((p) => p.id === saved.style)) {
      setStyle(saved.style);
    }
    toast.success("Palette loaded");
  }

  function deletePalette(id: string) {
    setSavedPalettes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist(PALETTES_KEY, next);
      return next;
    });
  }

  async function pickWithEyedropper() {
    if (!("EyeDropper" in window)) {
      toast.error("EyeDropper isn't supported in this browser.");
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eye = new (window as any).EyeDropper();
      const result = await eye.open();
      if (result?.sRGBHex) {
        // Replace the first unlocked color
        setPalette((prev) => {
          const idx = prev.findIndex((e) => !e.locked);
          if (idx === -1) return prev;
          return prev.map((e, i) => (i === idx ? fromHex(result.sRGBHex, e.locked) : e));
        });
        toast.success(`Picked ${result.sRGBHex.toUpperCase()}`);
      }
    } catch {
      // user cancelled
    }
  }

  // Exports
  function downloadFile(content: string, ext: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-palette-${style}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${ext.toUpperCase()}`);
  }

  function exportCss(): string {
    return [
      ":root {",
      ...palette.map((p, i) => `  --color-${i + 1}: ${p.hex.toLowerCase()};`),
      "}",
    ].join("\n");
  }
  function exportScss(): string {
    return palette.map((p, i) => `$color-${i + 1}: ${p.hex.toLowerCase()};`).join("\n");
  }
  function exportTailwind(): string {
    const names = ["primary", "secondary", "accent", "muted", "info", "success", "warning", "danger", "neutral", "highlight"];
    const lines = palette.map((p, i) => `  ${names[i] ?? `color${i + 1}`}: "${p.hex.toLowerCase()}",`);
    return `// tailwind.config.ts\nexport default {\n  theme: {\n    extend: {\n      colors: {\n${lines.join("\n")}\n      },\n    },\n  },\n};`;
  }
  function exportJson(): string {
    return JSON.stringify(
      {
        style,
        colors: palette.map((p) => {
          const rgb = hexToRgb(p.hex);
          return {
            hex: p.hex.toLowerCase(),
            rgb: formatRgb(rgb),
            hsl: formatHsl(p.hsl),
            cmyk: formatCmyk(rgb),
          };
        }),
      },
      null,
      2,
    );
  }
  async function exportPng() {
    const canvas = document.createElement("canvas");
    const swatchW = 200;
    const swatchH = 280;
    const labelH = 60;
    canvas.width = swatchW * palette.length;
    canvas.height = swatchH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    palette.forEach((p, i) => {
      ctx.fillStyle = p.hex;
      ctx.fillRect(i * swatchW, 0, swatchW, swatchH - labelH);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(i * swatchW, swatchH - labelH, swatchW, labelH);
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 18px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(p.hex.toUpperCase(), i * swatchW + swatchW / 2, swatchH - labelH / 2 + 6);
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toollyz-palette-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PNG downloaded");
    }, "image/png");
  }

  // Gradient
  const gradientCss = React.useMemo(() => {
    const stops = (gradientReverse ? [...palette].reverse() : palette)
      .map((p) => p.hex)
      .join(", ");
    if (gradientType === "linear") return `linear-gradient(${gradientAngle}deg, ${stops})`;
    if (gradientType === "radial") return `radial-gradient(circle, ${stops})`;
    return `conic-gradient(from ${gradientAngle}deg, ${stops})`;
  }, [palette, gradientType, gradientAngle, gradientReverse]);

  async function copyGradient() {
    try {
      await navigator.clipboard.writeText(`background: ${gradientCss};`);
      toast.success("Gradient CSS copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Controls ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label>Palette style</Label>
            <Select value={style} onValueChange={(v) => v && setStyle(v as PaletteStyle)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PALETTE_STYLES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground"> · {s.hint}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Colors</Label>
            <Select value={String(size)} onValueChange={(v) => v && setSize(Number(v))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} colors
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" size="lg" onClick={regenerate} className="flex-1">
              <Repeat className="size-4" />
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={pickWithEyedropper}
              aria-label="Pick from screen"
              title="Pick from screen (EyeDropper)"
            >
              <Pipette className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>{" "}
          to regenerate. Lock colors to keep them when you re-roll.
        </p>
      </div>

      {/* ─── Palette grid ───────────────────────────────────────── */}
      <div
        className={cn(
          "grid gap-3",
          size === 2 && "grid-cols-1 sm:grid-cols-2",
          size === 3 && "grid-cols-1 sm:grid-cols-3",
          size === 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
          size === 10 && "grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-10",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {palette.map((entry, idx) => (
            <motion.div
              key={`${idx}-${entry.hex}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <ColorCard
                entry={entry}
                index={idx}
                favorited={favorites.includes(entry.hex)}
                onToggleLock={() => toggleLock(idx)}
                onToggleFavorite={() => toggleFavorite(entry.hex)}
                onAdjust={(d) => adjust(idx, d)}
                onChangeHex={(hex) => updateColor(idx, hex)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── Global adjustments + exports ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* HSL global */}
        <section
          aria-label="Global adjustments"
          className="rounded-2xl border border-border/70 bg-card p-4 space-y-3"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Droplet className="size-4 text-primary" />
            Global adjustments
          </h3>
          <div className="space-y-2">
            <Label className="text-xs">Hue rotation</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ h: -15 })}>
                −15°
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ h: 15 })}>
                +15°
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ h: 180 })}>
                Invert
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Saturation</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ s: -10 })}>
                −10
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ s: 10 })}>
                +10
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Lightness</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ l: -10 })}>
                Darker
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => adjustAll({ l: 10 })}>
                Lighter
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Skips locked colors. Use the per-card adjusters for finer control.
          </p>
        </section>

        {/* Exports */}
        <section
          aria-label="Export palette"
          className="rounded-2xl border border-border/70 bg-card p-4 space-y-3"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Download className="size-4 text-primary" />
            Export
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => downloadFile(exportCss(), "css", "text/css")}>
              <Download className="size-3.5" />
              CSS
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => downloadFile(exportScss(), "scss", "text/css")}>
              <Download className="size-3.5" />
              SCSS
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => downloadFile(exportTailwind(), "ts", "text/typescript")}>
              <Download className="size-3.5" />
              Tailwind
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => downloadFile(exportJson(), "json", "application/json")}>
              <Download className="size-3.5" />
              JSON
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exportPng}>
              <Download className="size-3.5" />
              PNG
            </Button>
            <Button type="button" size="sm" onClick={savePalette}>
              <Heart className="size-3.5" />
              Save palette
            </Button>
          </div>
          <pre className="max-h-32 overflow-auto rounded-xl border border-border/60 bg-background p-3 font-mono text-[11px] leading-snug">
            {exportCss()}
          </pre>
        </section>
      </div>

      {/* ─── Live UI preview ────────────────────────────────────── */}
      <LivePreview palette={palette} />

      {/* ─── Gradient editor ────────────────────────────────────── */}
      <GradientEditor
        css={gradientCss}
        type={gradientType}
        setType={setGradientType}
        angle={gradientAngle}
        setAngle={setGradientAngle}
        reverse={gradientReverse}
        setReverse={setGradientReverse}
        onCopy={copyGradient}
        showAngle={gradientType !== "radial"}
      />

      {/* ─── Favorites + saved palettes ─────────────────────────── */}
      {(favorites.length > 0 || savedPalettes.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.length > 0 && (
            <FavoritesPanel
              favorites={favorites}
              onApply={(hex) => {
                setPalette((prev) => {
                  const idx = prev.findIndex((e) => !e.locked);
                  if (idx === -1) return prev;
                  return prev.map((e, i) => (i === idx ? fromHex(hex, e.locked) : e));
                });
                toast.success("Applied to next unlocked slot");
              }}
              onRemove={(hex) => toggleFavorite(hex)}
            />
          )}
          {savedPalettes.length > 0 && (
            <SavedPalettesPanel
              palettes={savedPalettes}
              onLoad={loadPalette}
              onDelete={deletePalette}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Color card ──────────────────────────────────────────────────────────

interface ColorCardProps {
  entry: PaletteEntry;
  index: number;
  favorited: boolean;
  onToggleLock: () => void;
  onToggleFavorite: () => void;
  onAdjust: (delta: { h?: number; s?: number; l?: number }) => void;
  onChangeHex: (hex: string) => void;
}

function ColorCard({
  entry,
  index,
  favorited,
  onToggleLock,
  onToggleFavorite,
  onAdjust,
  onChangeHex,
}: ColorCardProps) {
  const textColor = bestTextColor(entry.hex);
  const rgb = hexToRgb(entry.hex);
  const contrast = contrastRatio(entry.hex, textColor);
  const grade = gradeContrast(contrast);
  const [copied, setCopied] = React.useState<"hex" | "rgb" | "hsl" | null>(null);

  async function copy(value: string, kind: "hex" | "rgb" | "hsl") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      toast.success(`${kind.toUpperCase()} copied`);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div
        className="relative aspect-square w-full"
        style={{ background: entry.hex, color: textColor }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
              className="rounded-md p-1 transition-colors"
              style={{ color: textColor, opacity: favorited ? 1 : 0.7 }}
            >
              <Heart className={cn("size-4", favorited && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={onToggleLock}
              aria-label={entry.locked ? "Unlock color" : "Lock color"}
              className="rounded-md p-1 transition-colors"
              style={{ color: textColor, opacity: entry.locked ? 1 : 0.7 }}
            >
              {entry.locked ? (
                <Lock className="size-4" />
              ) : (
                <Unlock className="size-4" />
              )}
            </button>
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => copy(entry.hex, "hex")}
              className="block font-mono text-base font-semibold tracking-wider"
              style={{ color: textColor }}
            >
              {entry.hex.toUpperCase()}
              {copied === "hex" && (
                <Check className="ml-1 inline size-3 text-emerald-300" />
              )}
            </button>
            <span
              className="block text-[10px] font-medium"
              style={{ color: textColor, opacity: 0.7 }}
              title={`Contrast: ${contrast.toFixed(2)}:1`}
            >
              {grade.AANormal ? "AA" : grade.AALarge ? "AA large" : "Fail"}{" "}
              · {contrast.toFixed(1)}:1
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="space-y-1 text-[11px]">
          <CopyableLine
            label="RGB"
            value={formatRgb(rgb)}
            onCopy={() => copy(formatRgb(rgb), "rgb")}
            copied={copied === "rgb"}
          />
          <CopyableLine
            label="HSL"
            value={formatHsl(entry.hsl)}
            onCopy={() => copy(formatHsl(entry.hsl), "hsl")}
            copied={copied === "hsl"}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={entry.hex}
            onChange={(e) => onChangeHex(e.target.value)}
            className="size-6 cursor-pointer rounded-md border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
            aria-label="Pick color"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onAdjust({ l: -8 })}
            aria-label="Darken"
          >
            <span aria-hidden>−</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onAdjust({ l: 8 })}
            aria-label="Lighten"
          >
            <span aria-hidden>+</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onAdjust({ h: 30 })}
            aria-label="Shift hue"
          >
            <Sparkles className="size-3" />
          </Button>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
            #{index + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

function CopyableLine({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="group flex w-full items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span className="font-mono text-[10px] uppercase">{label}</span>
      <span className="truncate font-mono text-foreground/90">{value}</span>
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 opacity-0 group-hover:opacity-100" />}
    </button>
  );
}

// ─── Live preview ────────────────────────────────────────────────────────

function LivePreview({ palette }: { palette: PaletteEntry[] }) {
  const c1 = palette[0]?.hex ?? "#6366F1";
  const c2 = palette[1]?.hex ?? "#A78BFA";
  const c3 = palette[2]?.hex ?? "#22D3EE";
  const c4 = palette[3]?.hex ?? "#F3F4F6";
  const c5 = palette[4]?.hex ?? "#0F172A";

  const text1 = bestTextColor(c1);
  const text5 = bestTextColor(c5);

  return (
    <section
      aria-labelledby="live-preview-heading"
      className="space-y-3"
    >
      <h2
        id="live-preview-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Eye className="size-4 text-primary" />
        Live UI preview
      </h2>
      <div
        className="grid gap-4 rounded-2xl border border-border/70 p-5"
        style={{ background: c4 }}
      >
        {/* Nav bar */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: c5, color: text5 }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span
              className="inline-flex size-6 items-center justify-center rounded-md text-xs font-bold"
              style={{ background: c1, color: text1 }}
            >
              T
            </span>
            Toollyz
          </div>
          <div className="flex gap-3 text-xs">
            <span style={{ opacity: 0.7 }}>Tools</span>
            <span style={{ opacity: 0.7 }}>Pricing</span>
            <span style={{ opacity: 0.7 }}>Docs</span>
          </div>
        </div>
        {/* Hero / card row */}
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div
            className="rounded-xl p-5"
            style={{
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              color: text1,
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
              Premium tool
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              Your palette in action
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ background: text1, color: c1 }}
              >
                Primary action
              </button>
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-xs font-semibold"
                style={{ borderColor: text1, color: text1 }}
              >
                Secondary
              </button>
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "#FFFFFF", borderColor: c1 + "33" }}
          >
            <div
              className="inline-flex size-8 items-center justify-center rounded-lg"
              style={{ background: c3 + "22", color: c3 }}
            >
              <Sparkles className="size-4" />
            </div>
            <div className="mt-3 text-sm font-semibold tracking-tight" style={{ color: c5 }}>
              Accent card
            </div>
            <div className="mt-1 text-xs" style={{ color: c5, opacity: 0.7 }}>
              Subtle accents using your palette tones.
            </div>
            <div className="mt-3 flex gap-1">
              {palette.slice(0, 5).map((p, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full"
                  style={{ background: p.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Gradient editor ─────────────────────────────────────────────────────

interface GradientEditorProps {
  css: string;
  type: GradientType;
  setType: (t: GradientType) => void;
  angle: number;
  setAngle: (a: number) => void;
  reverse: boolean;
  setReverse: (r: boolean) => void;
  onCopy: () => void;
  showAngle: boolean;
}

function GradientEditor({
  css,
  type,
  setType,
  angle,
  setAngle,
  reverse,
  setReverse,
  onCopy,
  showAngle,
}: GradientEditorProps) {
  return (
    <section
      aria-labelledby="gradient-heading"
      className="space-y-3"
    >
      <h2
        id="gradient-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Droplet className="size-4 text-primary" />
        Gradient
      </h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-1">
              {(["linear", "radial", "conic"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                    type === t
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground/80 hover:bg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {showAngle && (
            <div className="space-y-2">
              <Label htmlFor="grad-angle">
                Angle —{" "}
                <span className="font-mono tabular-nums text-foreground">{angle}°</span>
              </Label>
              <Slider
                id="grad-angle"
                value={[angle]}
                onValueChange={(v) => setAngle(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={360}
                step={5}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReverse(!reverse)}
            >
              <Repeat className="size-3.5" />
              {reverse ? "Restored" : "Reverse"}
            </Button>
            <Button type="button" size="sm" onClick={onCopy}>
              <Copy className="size-3.5" />
              Copy CSS
            </Button>
          </div>
          <pre className="max-h-24 overflow-auto rounded-xl border border-border/60 bg-background p-3 font-mono text-[11px] leading-snug">
            background: {css};
          </pre>
        </div>
        <div
          className="aspect-[2/1] rounded-2xl border border-border/70"
          style={{ background: css }}
          aria-label="Gradient preview"
        />
      </div>
    </section>
  );
}

// ─── Favorites panel ─────────────────────────────────────────────────────

function FavoritesPanel({
  favorites,
  onApply,
  onRemove,
}: {
  favorites: string[];
  onApply: (hex: string) => void;
  onRemove: (hex: string) => void;
}) {
  return (
    <section
      aria-label="Favorite colors"
      className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Heart className="size-4 fill-rose-500 text-rose-500" />
        Favorite colors
        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">
          {favorites.length}
        </span>
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2 list-none">
        {favorites.map((hex) => (
          <li key={hex} className="group relative">
            <button
              type="button"
              onClick={() => onApply(hex)}
              className="block size-9 rounded-lg ring-1 ring-black/10 transition-transform hover:scale-105"
              style={{ background: hex }}
              aria-label={`Apply ${hex}`}
              title={hex}
            />
            <button
              type="button"
              onClick={() => onRemove(hex)}
              aria-label="Remove"
              className="absolute -right-1.5 -top-1.5 hidden size-4 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-opacity group-hover:flex group-hover:opacity-100"
            >
              <Trash2 className="size-2.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Saved palettes panel ────────────────────────────────────────────────

function SavedPalettesPanel({
  palettes,
  onLoad,
  onDelete,
}: {
  palettes: SavedPalette[];
  onLoad: (p: SavedPalette) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section
      aria-label="Saved palettes"
      className="rounded-2xl border border-border/70 bg-card p-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Sparkles className="size-4 text-primary" />
        Saved palettes
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {palettes.length}
        </span>
      </h3>
      <ul className="mt-3 space-y-2 list-none">
        {palettes.map((p) => (
          <li key={p.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-2">
            <button
              type="button"
              onClick={() => onLoad(p)}
              className="flex flex-1 items-center gap-1 overflow-hidden rounded-md"
              aria-label="Load palette"
            >
              {p.colors.map((hex, i) => (
                <span
                  key={i}
                  className="h-8 flex-1 transition-transform hover:scale-105"
                  style={{ background: hex }}
                  title={hex}
                />
              ))}
            </button>
            <span className="font-mono text-[10px] text-muted-foreground capitalize">
              {p.style}
            </span>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              aria-label="Delete palette"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
