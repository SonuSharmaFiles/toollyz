"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Crop,
  Download,
  FileImage,
  FileUp,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Loader2,
  Lock,
  Maximize2,
  RefreshCcw,
  Scaling,
  Sparkles,
  Trash2,
  Unlink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { downloadBlob, formatBytes } from "@/lib/tools/image/convert";
import { resizeImage, SOCIAL_PRESETS, type FitMode, type ResizeResult } from "@/lib/tools/image/resize";

const SETTINGS_KEY = "toollyz:image-resizer-settings";

type Mime = "auto" | "image/jpeg" | "image/png" | "image/webp";

interface Settings {
  mode: "pixels" | "percent";
  width: number;
  height: number;
  percent: number;
  lockRatio: boolean;
  fit: FitMode;
  background: string;
  format: Mime;
  quality: number;
}

const DEFAULT_SETTINGS: Settings = {
  mode: "pixels",
  width: 1920,
  height: 1080,
  percent: 50,
  lockRatio: true,
  fit: "contain",
  background: "#ffffff",
  format: "auto",
  quality: 0.9,
};

interface QueueItem {
  id: string;
  name: string;
  file: File;
  original: number;
  originalDims?: { w: number; h: number };
  status: "pending" | "resizing" | "done" | "error";
  result?: ResizeResult;
  error?: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function pickMime(file: File, choice: Mime): string {
  if (choice !== "auto") return choice;
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

function extOf(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

const FIT_LABEL: Record<FitMode, string> = {
  contain: "Contain (letterbox)",
  cover: "Cover (crop to fill)",
  stretch: "Stretch (ignore ratio)",
};

export default function ImageResizer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [queue, setQueue] = React.useState<QueueItem[]>([]);
  const sourceRatio = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) });
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

  function processItem(item: QueueItem, s: Settings, ratio: number): Promise<ResizeResult> {
    const mime = pickMime(item.file, s.format);
    const quality = mime === "image/png" ? undefined : s.quality;
    let w = s.width;
    let h = s.height;
    if (s.mode === "percent" && item.originalDims) {
      const p = Math.max(1, Math.min(400, s.percent)) / 100;
      w = Math.max(1, Math.round(item.originalDims.w * p));
      h = Math.max(1, Math.round(item.originalDims.h * p));
    } else if (s.mode === "pixels") {
      if (s.lockRatio && item.originalDims) {
        // Re-derive height from the locked source ratio so each image keeps
        // its own aspect rather than blindly using the form's height.
        const r = item.originalDims.w / item.originalDims.h;
        h = Math.max(1, Math.round(w / r));
      }
    }
    // ratio param reserved for future global lock; currently unused per-image
    void ratio;
    return resizeImage(item.file, {
      width: w,
      height: h,
      mime,
      quality,
      fit: s.fit,
      background: s.background,
    });
  }

  async function readDims(file: File): Promise<{ w: number; h: number } | undefined> {
    try {
      const url = URL.createObjectURL(file);
      return await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(undefined);
        };
        img.src = url;
      });
    } catch {
      return undefined;
    }
  }

  async function addFiles(files: FileList) {
    const list = Array.from(files).filter(
      (f) => /\.(png|jpe?g|webp)$/i.test(f.name) || ["image/png", "image/jpeg", "image/webp"].includes(f.type),
    );
    const rejected = files.length - list.length;
    if (rejected > 0) toast.error(`Skipped ${rejected} unsupported file${rejected === 1 ? "" : "s"}`);
    if (list.length === 0) return;
    const items: QueueItem[] = await Promise.all(
      list.map(async (f) => ({
        id: uid(),
        name: f.name,
        file: f,
        original: f.size,
        status: "resizing" as const,
        originalDims: await readDims(f),
      })),
    );
    // Initialize global source ratio from the first dropped image if none yet.
    if (sourceRatio.current === null && items[0]?.originalDims) {
      sourceRatio.current = items[0].originalDims.w / items[0].originalDims.h;
      if (settings.lockRatio && settings.mode === "pixels" && items[0].originalDims) {
        setSettings((s) => ({
          ...s,
          width: items[0].originalDims!.w,
          height: items[0].originalDims!.h,
        }));
      }
    }
    setQueue((prev) => [...items, ...prev].slice(0, 30));
    for (const item of items) {
      try {
        const result = await processItem(item, settings, sourceRatio.current ?? 1);
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done", result } : q)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed";
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "error", error: msg } : q)));
      }
    }
    toast.success(`Resized ${list.length} file${list.length === 1 ? "" : "s"}`);
  }

  async function rerunAll() {
    if (queue.length === 0) return;
    const items = queue;
    setQueue((prev) => prev.map((q) => ({ ...q, status: "resizing", result: undefined, error: undefined })));
    for (const item of items) {
      try {
        const result = await processItem(item, settings, sourceRatio.current ?? 1);
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done", result } : q)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed";
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "error", error: msg } : q)));
      }
    }
    toast.success("Re-rendered with new settings");
  }

  function setWidth(v: number) {
    const w = Math.max(1, Math.min(8192, Math.round(v)));
    setSettings((s) => {
      if (s.lockRatio && sourceRatio.current) {
        return { ...s, width: w, height: Math.max(1, Math.round(w / sourceRatio.current)) };
      }
      return { ...s, width: w };
    });
  }

  function setHeight(v: number) {
    const h = Math.max(1, Math.min(8192, Math.round(v)));
    setSettings((s) => {
      if (s.lockRatio && sourceRatio.current) {
        return { ...s, height: h, width: Math.max(1, Math.round(h * sourceRatio.current)) };
      }
      return { ...s, height: h };
    });
  }

  function applyPreset(id: string) {
    const p = SOCIAL_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setSettings((s) => ({ ...s, width: p.width, height: p.height, mode: "pixels", lockRatio: false }));
    toast.success(`${p.label} (${p.width}×${p.height})`);
  }

  function clearAll() {
    setQueue([]);
    sourceRatio.current = null;
  }

  function downloadOne(item: QueueItem) {
    if (!item.result) return;
    const base = item.name.replace(/\.(png|jpe?g|webp|gif|bmp)$/i, "");
    const ext = extOf(item.result.mime);
    downloadBlob(item.result.blob, `${base}.${item.result.width}x${item.result.height}.${ext}`);
  }

  function downloadAll() {
    queue.filter((q) => q.result).forEach((q) => downloadOne(q));
  }

  const done = queue.filter((q) => q.status === "done");
  const totalOriginal = done.reduce((s, q) => s + q.original, 0);
  const totalNew = done.reduce((s, q) => s + (q.result?.newBytes ?? 0), 0);

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
        aria-label="Resize stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Files queued" value={queue.length} reduceMotion={!!reduceMotion} />
          <Stat label="Resized" value={done.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Target W" value={settings.mode === "pixels" ? settings.width : settings.percent} reduceMotion={!!reduceMotion} suffix={settings.mode === "pixels" ? " px" : "%"} accent="text-indigo-300" />
          <Stat label="Target H" value={settings.mode === "pixels" ? settings.height : settings.percent} reduceMotion={!!reduceMotion} suffix={settings.mode === "pixels" ? " px" : "%"} accent="text-indigo-300" />
        </div>
        {done.length > 0 && (
          <p className="relative mt-4 text-[11px] text-indigo-200/80">
            {formatBytes(totalOriginal)} → <strong>{formatBytes(totalNew)}</strong> total across {done.length} file{done.length === 1 ? "" : "s"}.
          </p>
        )}
      </section>

      {/* Controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Scaling className="size-4 text-primary" />
          Resize settings
        </h2>

        <Tabs value={settings.mode} onValueChange={(v) => v && setSettings((s) => ({ ...s, mode: v as "pixels" | "percent" }))} className="w-full">
          <TabsList className="mb-3 grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
            <TabsTrigger value="pixels">Pixels</TabsTrigger>
            <TabsTrigger value="percent">Percent</TabsTrigger>
          </TabsList>
          <TabsContent value="pixels" className="space-y-3">
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs font-medium">
                  Width (px)
                </Label>
                <Input
                  id="width"
                  type="number"
                  min={1}
                  max={8192}
                  value={settings.width}
                  onChange={(e) => setWidth(Number(e.target.value) || 1)}
                  className="font-mono"
                />
              </div>
              <div className="flex justify-center pb-1.5">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, lockRatio: !s.lockRatio }))}
                  aria-label={settings.lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                    settings.lockRatio ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                  title={settings.lockRatio ? "Aspect ratio locked" : "Aspect ratio free"}
                >
                  {settings.lockRatio ? <LinkIcon className="size-4" /> : <Unlink className="size-4" />}
                </button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs font-medium">
                  Height (px)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min={1}
                  max={8192}
                  value={settings.height}
                  onChange={(e) => setHeight(Number(e.target.value) || 1)}
                  className="font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {settings.lockRatio
                ? "Aspect ratio locked to the first image dropped — changing width adjusts height."
                : "Aspect ratio free — width and height move independently. Fit mode controls cropping vs letterboxing."}
            </p>
          </TabsContent>
          <TabsContent value="percent" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor="percent" className="font-medium">
                  Scale
                </Label>
                <span className="font-mono tabular-nums">{settings.percent}%</span>
              </div>
              <Slider
                id="percent"
                value={[settings.percent]}
                onValueChange={(v) => setSettings((s) => ({ ...s, percent: Array.isArray(v) ? v[0] : (v as number) }))}
                min={5}
                max={200}
                step={1}
              />
              <p className="text-[11px] text-muted-foreground">Each image is scaled to {settings.percent}% of its original size — aspect ratio is always preserved in percent mode.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Presets */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Social & video presets</Label>
          <div className="flex flex-wrap gap-1.5">
            {SOCIAL_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                title={`${p.group} · ${p.width}×${p.height}`}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted"
              >
                {p.label}
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{p.width}×{p.height}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fit & format */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="fit" className="text-xs font-medium">
              Fit mode
            </Label>
            <Select value={settings.fit} onValueChange={(v) => v && setSettings((s) => ({ ...s, fit: v as FitMode }))}>
              <SelectTrigger id="fit" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">{FIT_LABEL.contain}</SelectItem>
                <SelectItem value="cover">{FIT_LABEL.cover}</SelectItem>
                <SelectItem value="stretch">{FIT_LABEL.stretch}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="format" className="text-xs font-medium">
              Output format
            </Label>
            <Select value={settings.format} onValueChange={(v) => v && setSettings((s) => ({ ...s, format: v as Mime }))}>
              <SelectTrigger id="format" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <span className="font-medium">Auto</span>
                  <span className="text-muted-foreground"> · keep source</span>
                </SelectItem>
                <SelectItem value="image/jpeg">JPEG</SelectItem>
                <SelectItem value="image/png">PNG</SelectItem>
                <SelectItem value="image/webp">WebP</SelectItem>
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
              min={0.3}
              max={1}
              step={0.01}
            />
            <p className="text-[10px] text-muted-foreground">Ignored for PNG (lossless).</p>
          </div>
        </div>

        {settings.fit === "contain" && (
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
            <div className="space-y-1.5">
              <Label htmlFor="background" className="text-xs font-medium">
                Letterbox background
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.background === "transparent" ? "#ffffff" : settings.background}
                  onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-background p-1"
                  aria-label="Background color"
                />
                <Input
                  id="background"
                  value={settings.background}
                  onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>
            <p className="self-center text-[11px] text-muted-foreground">
              Used when the source aspect ratio differs from the target (Contain mode). PNG and WebP output can stay transparent — type <code className="font-mono">transparent</code>.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={rerunAll} disabled={queue.length === 0}>
            <RefreshCcw className="size-4" />
            Re-render all
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSettings(DEFAULT_SETTINGS)}>
            <Sparkles className="size-4" />
            Reset
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
        <p className="mt-2 text-[11px] text-muted-foreground">Up to 30 at a time — resized entirely in your browser.</p>
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
              const r = q.result;
              const delta = r ? Math.round(((r.newBytes - q.original) / q.original) * 100) : 0;
              const grew = r && r.newBytes > q.original;
              return (
                <motion.li
                  key={q.id}
                  layout={!reduceMotion}
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2"
                >
                  {r ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={r.dataUrl} alt={q.name} className="h-12 w-12 shrink-0 rounded object-cover" />
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
                      {q.originalDims && (
                        <>
                          <span>·</span>
                          <span>{q.originalDims.w}×{q.originalDims.h}</span>
                        </>
                      )}
                      {r && (
                        <>
                          <span>→</span>
                          <span className="font-medium text-foreground/80">{formatBytes(r.newBytes)}</span>
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            grew ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          )}>
                            {grew ? "+" : "−"}{Math.abs(delta)}%
                          </span>
                          <span>·</span>
                          <span className="font-mono">{r.width}×{r.height}</span>
                          <span>·</span>
                          <span className="font-mono">{r.extension}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {q.status === "resizing" && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
                  {q.status === "error" && (
                    <span className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertTriangle className="size-3.5" />
                      {q.error}
                    </span>
                  )}
                  {q.status === "done" && r && (
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
          How the resize works
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <Maximize2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Resizing uses your browser&apos;s native decoder + a canvas — same pipeline modern sites use. No upload, no install.
          </li>
          <li className="flex items-start gap-1.5">
            <Crop className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Contain preserves the whole image with letterbox; Cover crops to fill; Stretch ignores aspect — pick the one matching your target.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Upscaling beyond the original resolution can&apos;t add new detail — pixels are interpolated, so you may see softness on big enlargements.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            EXIF / GPS / camera metadata is dropped during the canvas pass — a privacy bonus when sharing online.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Resizing runs entirely in your browser — nothing is uploaded.
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
