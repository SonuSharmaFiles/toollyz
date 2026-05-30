"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileImage,
  FilePlus,
  FileUp,
  Info,
  Loader2,
  Lock,
  RefreshCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { downloadBytes, formatBytes } from "@/lib/tools/pdf/merge";
import {
  buildPdf,
  readImage,
  type Fit,
  type Orientation,
  type PageSettings,
  type PageSize,
  type SourceImage,
} from "@/lib/tools/pdf/build";

const STORAGE_KEY = "toollyz:image-to-pdf-settings";

const DEFAULTS: PageSettings = {
  size: "A4",
  orientation: "portrait",
  margin: 24,
  background: "#ffffff",
  fit: "fit",
  customWidth: 595,
  customHeight: 842,
};

const MAX_FILES = 30;

export default function ImageToPdf() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<PageSettings>(DEFAULTS);
  const [filename, setFilename] = React.useState("toollyz.pdf");
  const [images, setImages] = React.useState<SourceImage[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<PageSettings>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
  }, [settings, mounted]);

  async function addFiles(list: FileList) {
    setError(null);
    const incoming = Array.from(list).filter(
      (f) => /\.(jpe?g|png|webp)$/i.test(f.name) || ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    );
    const rejected = list.length - incoming.length;
    if (rejected > 0) toast.error(`Skipped ${rejected} unsupported file${rejected === 1 ? "" : "s"}`);
    if (incoming.length === 0) return;
    const room = Math.max(0, MAX_FILES - images.length);
    if (incoming.length > room) toast.error(`Capped at ${MAX_FILES} — only first ${room} added.`);
    const slice = incoming.slice(0, room);
    const next: SourceImage[] = [];
    for (const f of slice) {
      try {
        next.push(await readImage(f));
      } catch (e) {
        toast.error(`Couldn't read ${f.name}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }
    if (next.length > 0) {
      setImages((prev) => [...prev, ...next]);
      toast.success(`Added ${next.length} image${next.length === 1 ? "" : "s"}`);
    }
  }

  function remove(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  function move(id: string, delta: number) {
    setImages((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const newIdx = Math.max(0, Math.min(prev.length - 1, idx + delta));
      if (newIdx === idx) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(newIdx, 0, item);
      return next;
    });
  }

  function clearAll() {
    setImages([]);
    setError(null);
  }

  function reset() {
    setSettings(DEFAULTS);
    toast.success("Reset page settings");
  }

  async function build() {
    if (images.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const result = await buildPdf(images, settings);
      downloadBytes(result.bytes, filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
      toast.success(`Built ${result.pages}-page PDF · ${formatBytes(result.bytes.byteLength)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "PDF build failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const totalBytes = images.reduce((s, i) => s + i.size, 0);

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
        aria-label="Image to PDF stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Images queued" value={images.length} reduceMotion={!!reduceMotion} />
          <Stat label="Total size" value={Math.round(totalBytes / 1024)} suffix=" KB" reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Pages" value={images.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Max" value={MAX_FILES} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Drop zone */}
      <section
        className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
        }}
      >
        <FileUp className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop <strong>JPG, PNG or WebP</strong> images here, or
        </p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />
          Choose images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">Up to {MAX_FILES} images — each becomes one PDF page.</p>
      </section>

      {/* Settings */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Page settings
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="size" className="text-xs font-medium">
              Page size
            </Label>
            <Select value={settings.size} onValueChange={(v) => v && setSettings((s) => ({ ...s, size: v as PageSize }))}>
              <SelectTrigger id="size" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto · match each image</SelectItem>
                <SelectItem value="A4">A4 (595 × 842 pt)</SelectItem>
                <SelectItem value="A3">A3 (842 × 1191 pt)</SelectItem>
                <SelectItem value="Letter">Letter (612 × 792 pt)</SelectItem>
                <SelectItem value="Legal">Legal (612 × 1008 pt)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {settings.size !== "auto" && (
            <div className="space-y-1.5">
              <Label htmlFor="orientation" className="text-xs font-medium">
                Orientation
              </Label>
              <Select value={settings.orientation} onValueChange={(v) => v && setSettings((s) => ({ ...s, orientation: v as Orientation }))}>
                <SelectTrigger id="orientation" className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {settings.size === "custom" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Width (pt)</Label>
                <Input
                  type="number"
                  min={36}
                  max={3000}
                  value={settings.customWidth}
                  onChange={(e) => setSettings((s) => ({ ...s, customWidth: Math.max(36, Number(e.target.value) || 595) }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Height (pt)</Label>
                <Input
                  type="number"
                  min={36}
                  max={3000}
                  value={settings.customHeight}
                  onChange={(e) => setSettings((s) => ({ ...s, customHeight: Math.max(36, Number(e.target.value) || 842) }))}
                  className="font-mono"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="fit" className="text-xs font-medium">
              Fit
            </Label>
            <Select value={settings.fit} onValueChange={(v) => v && setSettings((s) => ({ ...s, fit: v as Fit }))}>
              <SelectTrigger id="fit" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">Fit (preserve aspect, letterbox)</SelectItem>
                <SelectItem value="fill">Fill (preserve aspect, no overflow)</SelectItem>
                <SelectItem value="stretch">Stretch (ignore aspect)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Label className="font-medium">Margin</Label>
              <span className="font-mono tabular-nums">{settings.margin} pt</span>
            </div>
            <Slider
              value={[settings.margin]}
              onValueChange={(v) => setSettings((s) => ({ ...s, margin: Array.isArray(v) ? v[0] : (v as number) }))}
              min={0}
              max={120}
              step={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Page background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.background}
                onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))}
                className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                aria-label="Page background"
              />
              <Input
                value={settings.background}
                onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="filename" className="text-xs font-medium">
              Output filename
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="toollyz.pdf"
              className="font-mono"
            />
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button type="button" onClick={build} disabled={busy || images.length === 0}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Building…
              </>
            ) : (
              <>
                <FilePlus className="size-4" />
                Build PDF
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Queue */}
      {images.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <FileImage className="size-4 text-primary" />
              Images ({images.length})
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ol className="space-y-2 list-none">
            {images.map((img, i) => (
              <li key={img.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" title={img.name}>
                    {img.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{img.width}×{img.height}</span>
                    <span>·</span>
                    <span>{formatBytes(img.size)}</span>
                    <span>·</span>
                    <span className="font-mono">{img.type}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => move(img.id, -1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => move(img.id, 1)} disabled={i === images.length - 1} aria-label="Move down">
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => remove(img.id)} aria-label="Remove">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this converter
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            JPGs and PNGs are embedded natively by pdf-lib. WebP is re-encoded to PNG via a canvas first because PDF doesn&apos;t carry WebP.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            Sizes are in PDF points (1 pt = 1/72 inch). A4 = 595×842 pt, Letter = 612×792 pt. Auto matches each image&apos;s pixel size 1:1.
          </li>
          <li className="flex items-start gap-1.5">
            <FileImage className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Fit preserves aspect ratio with a letterbox; Stretch ignores aspect. Use Fit for portfolio pages; Stretch only when intentional.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no server — your images stay in your browser. The PDF is built locally and downloaded on click.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Built entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}
