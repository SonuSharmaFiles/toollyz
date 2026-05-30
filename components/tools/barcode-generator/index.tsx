"use client";

import * as React from "react";
import {
  AlertTriangle,
  Barcode as BarcodeIcon,
  CheckCircle2,
  Copy,
  Download,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DEFAULT_OPTIONS,
  FORMATS,
  lint,
  type BarcodeFormat,
  type BarcodeOptions,
} from "@/lib/tools/barcode/barcode";

const STORAGE_KEY = "toollyz:barcode-options";

interface JsBarcodeOptions {
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
  text: string | undefined;
  fontSize: number;
  textMargin: number;
  background: string;
  lineColor: string;
  margin: number;
  flat: boolean;
  valid?: (valid: boolean) => void;
}
type JsBarcodeCall = (element: SVGSVGElement, value: string, opts: JsBarcodeOptions) => void;

export default function BarcodeGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [opts, setOpts] = React.useState<BarcodeOptions>(DEFAULT_OPTIONS);
  const [jsBarcode, setJsBarcode] = React.useState<JsBarcodeCall | null>(null);
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOpts({ ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<BarcodeOptions>) });
    } catch {
      /* noop */
    }
    // Lazy-load JsBarcode to keep the initial chunk small. The default export
    // is the rendering function; we cast through unknown to a typed adapter.
    void import("jsbarcode").then((mod) => {
      const fn = (mod.default ?? mod) as unknown as JsBarcodeCall;
      setJsBarcode(() => fn);
    });
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
    } catch {
      /* noop */
    }
  }, [opts, mounted]);

  // Re-render barcode whenever opts change.
  React.useEffect(() => {
    if (!jsBarcode || !svgRef.current) return;
    const lints = lint(opts.value, opts.format);
    if (lints.length > 0) {
      setRenderError(lints[0]);
      // Clear the svg
      while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild);
      return;
    }
    try {
      let valid = true;
      jsBarcode(svgRef.current, opts.value, {
        format: opts.format,
        width: opts.barWidth,
        height: opts.height,
        displayValue: opts.displayValue,
        text: opts.text || undefined,
        fontSize: opts.fontSize,
        textMargin: opts.textMargin,
        background: opts.bg,
        lineColor: opts.fg,
        margin: opts.margin,
        flat: opts.flat,
        valid: (v: boolean) => {
          valid = v;
        },
      });
      setRenderError(valid ? null : "JsBarcode rejected this value for the chosen format.");
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : "Render failed");
    }
  }, [jsBarcode, opts]);

  function update<K extends keyof BarcodeOptions>(k: K, v: BarcodeOptions[K]) {
    setOpts((prev) => ({ ...prev, [k]: v }));
  }

  function applyFormat(id: BarcodeFormat) {
    const f = FORMATS.find((x) => x.id === id);
    if (!f) return;
    setOpts((prev) => ({ ...prev, format: id, value: f.sample }));
    toast.success(`${f.label} preset`);
  }

  async function copySvgMarkup() {
    if (!svgRef.current) return;
    try {
      const svg = new XMLSerializer().serializeToString(svgRef.current);
      await navigator.clipboard.writeText(svg);
      toast.success("SVG copied");
    } catch {
      toast.error("Couldn't copy SVG");
    }
  }

  function downloadSvg() {
    if (!svgRef.current) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFilename(opts.value)}_${opts.format}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded SVG");
  }

  function downloadPng() {
    if (!svgRef.current) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Render at 2x for crisp output
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = opts.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Couldn't render PNG");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeFilename(opts.value)}_${opts.format}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded PNG (2×)");
      }, "image/png");
    };
    img.onerror = () => toast.error("Couldn't rasterise SVG");
    img.src = `data:image/svg+xml;base64,${svg64}`;
  }

  const grouped = React.useMemo(() => {
    const groups: Record<string, typeof FORMATS> = {};
    for (const f of FORMATS) {
      if (!groups[f.group]) groups[f.group] = [];
      groups[f.group].push(f);
    }
    return groups;
  }, []);

  const activeFormat = FORMATS.find((f) => f.id === opts.format);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <section
        aria-label="Barcode preview"
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="grid place-items-center rounded-2xl p-4" style={{ backgroundColor: opts.bg }}>
          <svg ref={svgRef} className="block max-w-full" role="img" aria-label={`${opts.format} barcode encoding ${opts.value}`} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div>
            <span className="font-mono">{opts.format}</span> · {activeFormat?.description}
          </div>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={copySvgMarkup}>
              <Copy className="size-3.5" />
              SVG
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={downloadSvg}>
              <Download className="size-3.5" />
              SVG
            </Button>
            <Button type="button" size="sm" onClick={downloadPng}>
              <Download className="size-3.5" />
              PNG 2×
            </Button>
          </div>
        </div>
        {renderError && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            {renderError}
          </p>
        )}
      </section>

      {/* Format + value */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <BarcodeIcon className="size-4 text-primary" />
          Format & value
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <div className="space-y-1.5">
            <Label htmlFor="format" className="text-xs font-medium">Format</Label>
            <Select value={opts.format} onValueChange={(v) => v && applyFormat(v as BarcodeFormat)}>
              <SelectTrigger id="format" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {Object.entries(grouped).map(([group, items]) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {items.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value" className="text-xs font-medium">Value to encode</Label>
            <Input
              id="value"
              value={opts.value}
              onChange={(e) => update("value", e.target.value)}
              placeholder={activeFormat?.sample}
              className="font-mono"
            />
            {activeFormat?.hint && (
              <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Info className="mt-0.5 size-3 shrink-0 text-primary" />
                {activeFormat.hint}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Style */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Style
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpts(DEFAULT_OPTIONS)}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorRow label="Foreground (bars)" value={opts.fg} onChange={(v) => update("fg", v)} />
          <ColorRow label="Background" value={opts.bg} onChange={(v) => update("bg", v)} />
          <SliderRow label="Bar width" value={opts.barWidth} min={1} max={6} step={1} suffix="px" onChange={(v) => update("barWidth", v)} />
          <SliderRow label="Height" value={opts.height} min={30} max={220} step={2} suffix="px" onChange={(v) => update("height", v)} />
          <SliderRow label="Margin" value={opts.margin} min={0} max={40} step={1} suffix="px" onChange={(v) => update("margin", v)} />
          <SliderRow label="Text font size" value={opts.fontSize} min={8} max={32} step={1} suffix="px" onChange={(v) => update("fontSize", v)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="caption" className="text-xs font-medium">Custom caption (optional)</Label>
            <Input
              id="caption"
              value={opts.text}
              onChange={(e) => update("text", e.target.value)}
              placeholder="Leave blank to show encoded value"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={opts.displayValue}
                onChange={(e) => update("displayValue", e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Show text below bars</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={opts.flat}
                onChange={(e) => update("flat", e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Flat bottom (no guards)</span>
            </label>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this generator
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><BarcodeIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />Rendered with the open-source JsBarcode library — production-grade encoders for 14 popular 1D formats.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Vector SVG output scales to any size; the PNG button rasterises at 2× for crisp prints.</li>
          <li className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />2D codes (QR, Data Matrix, PDF417, Aztec) need different encoders — use the Toollyz QR Code Generator for QR.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every barcode is rendered in your browser. Settings saved to localStorage.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Generated entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
          aria-label={label}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <Label className="font-medium">{label}</Label>
        <span className={cn("font-mono tabular-nums")}>{value}{suffix}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

function safeFilename(s: string): string {
  return (s || "barcode").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 32) || "barcode";
}
