"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileImage,
  FileUp,
  ImageDown,
  Image as ImageIcon,
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
import { AnimatedNumber } from "@/components/shared/animated-number";
import { convertImage, downloadBlob, formatBytes, type ConvertResult } from "@/lib/tools/image/convert";

type Format = "auto" | "image/jpeg" | "image/webp" | "image/png";

interface SettingsState {
  format: Format;
  quality: number;
  maxDim: number; // 0 = no resize
}

const DEFAULT_SETTINGS: SettingsState = { format: "auto", quality: 0.78, maxDim: 0 };

const SETTINGS_KEY = "toollyz:image-compressor-settings";

interface QueueItem {
  id: string;
  name: string;
  status: "pending" | "compressing" | "done" | "error";
  file: File;
  original: number;
  originalType: string;
  result?: ConvertResult;
  error?: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function pickMime(file: File, format: Format): string {
  if (format !== "auto") return format;
  // Auto: PNG → PNG (lossless reflow), JPG → JPG, WebP → WebP, else → JPG
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

function extOf(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export default function ImageCompressor() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<SettingsState>(DEFAULT_SETTINGS);
  const [queue, setQueue] = React.useState<QueueItem[]>([]);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SettingsState>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
  }, [settings, mounted]);

  async function processItem(item: QueueItem, s: SettingsState): Promise<ConvertResult | null> {
    const mime = pickMime(item.file, s.format);
    const quality = mime === "image/png" ? undefined : s.quality;
    try {
      return await convertImage(item.file, { mime, quality, maxDimension: s.maxDim > 0 ? s.maxDim : undefined });
    } catch {
      return null;
    }
  }

  async function addFiles(files: FileList) {
    const list = Array.from(files).filter(
      (f) => /\.(png|jpe?g|webp)$/i.test(f.name) || ["image/png", "image/jpeg", "image/webp"].includes(f.type),
    );
    const rejected = files.length - list.length;
    if (rejected > 0) toast.error(`Skipped ${rejected} unsupported file${rejected === 1 ? "" : "s"}`);
    if (list.length === 0) return;
    const items: QueueItem[] = list.map((f) => ({
      id: uid(),
      name: f.name,
      status: "compressing",
      file: f,
      original: f.size,
      originalType: f.type || "image/unknown",
    }));
    setQueue((prev) => [...items, ...prev].slice(0, 30));
    for (const item of items) {
      const result = await processItem(item, settings);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? result
              ? { ...q, status: "done", result }
              : { ...q, status: "error", error: "Couldn't encode this image." }
            : q,
        ),
      );
    }
    const saved = items.length;
    toast.success(`Compressed ${saved} file${saved === 1 ? "" : "s"}`);
  }

  async function rerunAll() {
    if (queue.length === 0) return;
    const items = queue;
    setQueue((prev) => prev.map((q) => ({ ...q, status: "compressing", result: undefined, error: undefined })));
    for (const item of items) {
      const result = await processItem(item, settings);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? result
              ? { ...q, status: "done", result }
              : { ...q, status: "error", error: "Couldn't encode this image." }
            : q,
        ),
      );
    }
    toast.success("Re-compressed with new settings");
  }

  function clearAll() {
    setQueue([]);
  }

  function downloadOne(item: QueueItem) {
    if (!item.result) return;
    const base = item.name.replace(/\.(png|jpe?g|webp|gif|bmp)$/i, "");
    const ext = extOf(item.result.mime);
    downloadBlob(item.result.blob, `${base}.min.${ext}`);
  }

  function downloadAll() {
    queue.filter((q) => q.result).forEach((q) => downloadOne(q));
  }

  const done = queue.filter((q) => q.status === "done");
  const totalOriginal = done.reduce((s, q) => s + q.original, 0);
  const totalNew = done.reduce((s, q) => s + (q.result?.newBytes ?? 0), 0);
  const savedBytes = Math.max(0, totalOriginal - totalNew);
  const savedPct = totalOriginal > 0 ? Math.round((savedBytes / totalOriginal) * 100) : 0;

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
        aria-label="Compression stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(16,185,129,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Files queued" value={queue.length} reduceMotion={!!reduceMotion} />
          <Stat label="Compressed" value={done.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Total saved" value={Math.round(savedBytes / 1024)} suffix=" KB" reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Saved" value={savedPct} suffix="%" reduceMotion={!!reduceMotion} accent="text-emerald-300" />
        </div>
        {done.length > 0 && (
          <p className="relative mt-4 text-[11px] text-emerald-200/80">
            <strong>{formatBytes(totalNew)}</strong> total after compression — {formatBytes(totalOriginal)} before.
          </p>
        )}
      </section>

      {/* Controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ImageDown className="size-4 text-primary" />
          Compression settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="format" className="text-xs font-medium">
              Target format
            </Label>
            <Select
              value={settings.format}
              onValueChange={(v) => v && setSettings((s) => ({ ...s, format: v as Format }))}
            >
              <SelectTrigger id="format" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <span className="font-medium">Auto</span>
                  <span className="text-muted-foreground"> · keep original format</span>
                </SelectItem>
                <SelectItem value="image/webp">
                  <span className="font-medium">WebP</span>
                  <span className="text-muted-foreground"> · smallest, modern browsers</span>
                </SelectItem>
                <SelectItem value="image/jpeg">
                  <span className="font-medium">JPEG</span>
                  <span className="text-muted-foreground"> · universal, no transparency</span>
                </SelectItem>
                <SelectItem value="image/png">
                  <span className="font-medium">PNG</span>
                  <span className="text-muted-foreground"> · lossless</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="quality" className="font-medium">
                Quality
              </Label>
              <span className="font-mono tabular-nums">{Math.round(settings.quality * 100)}%</span>
            </div>
            <Slider
              id="quality"
              value={[settings.quality]}
              onValueChange={(v) => setSettings((s) => ({ ...s, quality: Array.isArray(v) ? v[0] : (v as number) }))}
              min={0.2}
              max={1}
              step={0.01}
            />
            <p className="text-[10px] text-muted-foreground">
              {settings.format === "image/png" || (settings.format === "auto" && false) ? "PNG output ignores quality — it's lossless." : "Ignored for PNG output. 75–85% is a great default for photos."}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxDim" className="text-xs font-medium">
              Max dimension <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="maxDim"
              type="number"
              min={0}
              step={100}
              value={settings.maxDim || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, maxDim: Math.max(0, Math.min(8000, Number(e.target.value) || 0)) }))
              }
              placeholder="e.g. 1920"
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              0 = keep original size. Images larger than this are downscaled (longest edge).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={rerunAll} disabled={queue.length === 0}>
            <RefreshCcw className="size-4" />
            Re-compress all
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setSettings(DEFAULT_SETTINGS)}>
            <Sparkles className="size-4" />
            Reset settings
          </Button>
        </div>
      </section>

      {/* Drop zone */}
      <section
        className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
      >
        <FileUp className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop <strong>JPG, PNG or WebP</strong> files here, or
        </p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />
          Choose images
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">Up to 30 at a time — compressed entirely in your browser.</p>
      </section>

      {/* Queue */}
      {queue.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <ImageIcon className="size-4 text-primary" />
              Queue
            </h2>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={downloadAll} disabled={done.length === 0}>
                <Download className="size-4" />
                Download all
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
          </div>
          <ul className="space-y-2 list-none">
            {queue.map((q) => {
              const delta = q.result ? Math.round(((q.result.newBytes - q.original) / q.original) * 100) : 0;
              const sameOrBigger = q.result && q.result.newBytes >= q.original;
              return (
                <motion.li
                  key={q.id}
                  layout={!reduceMotion}
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2"
                >
                  {q.result ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={q.result.dataUrl} alt={q.name} className="h-12 w-12 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded bg-muted text-muted-foreground">
                      <FileImage className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium" title={q.name}>
                      {q.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatBytes(q.original)}</span>
                      {q.result && (
                        <>
                          <span>→</span>
                          <span className="font-medium text-foreground/80">{formatBytes(q.result.newBytes)}</span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              sameOrBigger ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            )}
                          >
                            {sameOrBigger ? "+" : "−"}
                            {Math.abs(delta)}%
                          </span>
                          <span>·</span>
                          <span>
                            {q.result.width}×{q.result.height}
                          </span>
                          <span>·</span>
                          <span className="font-mono">{q.result.extension}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {q.status === "compressing" && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
                  {q.status === "error" && (
                    <span className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertTriangle className="size-3.5" />
                      {q.error}
                    </span>
                  )}
                  {q.status === "done" && q.result && (
                    <Button type="button" size="sm" variant="outline" onClick={() => downloadOne(q)}>
                      <Download className="size-4" />
                      Save
                    </Button>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Caveats */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          How the compression works
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <ImageDown className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz uses the browser&apos;s native image decoder + canvas re-encode — the same pipeline modern websites use. No upload, no external service.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            JPEG and WebP compression is lossy at the chosen quality. PNG is lossless — the file may shrink because some metadata is dropped, but don&apos;t expect dramatic gains.
          </li>
          <li className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            WebP at 80% quality usually produces the smallest file. Choose JPEG if your downstream tool still doesn&apos;t support WebP.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            EXIF / GPS / camera metadata is stripped during the canvas pass — useful for privacy when sharing photos online.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Files are decoded and re-encoded in your browser — nothing is uploaded.
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
      <div
        className={cn(
          "font-heading text-2xl font-bold tabular-nums sm:text-3xl",
          accent ?? "text-indigo-50",
        )}
      >
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}
