"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Camera,
  CheckCircle2,
  Download,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { downloadBytes, formatBytes } from "@/lib/tools/pdf/merge";
import {
  DEFAULT_SETTINGS,
  buildScreenshotPdf,
  readImage,
  type CapturedShot,
  type ScreenshotPageSettings,
} from "@/lib/tools/pdf/screenshot";

const STORAGE_KEY = "toollyz:screenshot-pdf-settings";
const MAX = 30;

export default function ScreenshotToPdf() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<ScreenshotPageSettings>(DEFAULT_SETTINGS);
  const [filename, setFilename] = React.useState("toollyz-screenshots.pdf");
  const [shots, setShots] = React.useState<CapturedShot[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ScreenshotPageSettings>) });
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
    const room = Math.max(0, MAX - shots.length);
    const slice = incoming.slice(0, room);
    const next: CapturedShot[] = [];
    for (const f of slice) {
      try {
        const img = await readImage(f);
        next.push({ image: img, caption: "" });
      } catch (e) {
        toast.error(`Couldn't read ${f.name}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }
    if (next.length > 0) {
      setShots((prev) => [...prev, ...next]);
      toast.success(`Added ${next.length} screenshot${next.length === 1 ? "" : "s"}`);
    }
  }

  function remove(id: string) {
    setShots((prev) => prev.filter((s) => s.image.id !== id));
  }

  function clearAll() {
    setShots([]);
    setError(null);
  }

  function move(id: string, delta: number) {
    setShots((prev) => {
      const idx = prev.findIndex((s) => s.image.id === id);
      if (idx < 0) return prev;
      const newIdx = Math.max(0, Math.min(prev.length - 1, idx + delta));
      if (newIdx === idx) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(newIdx, 0, item);
      return next;
    });
  }

  function updateCaption(id: string, caption: string) {
    setShots((prev) => prev.map((s) => (s.image.id === id ? { ...s, caption } : s)));
  }

  async function build() {
    if (shots.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const result = await buildScreenshotPdf(shots, settings);
      const name = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      downloadBytes(result.bytes, name);
      toast.success(`Built ${result.pageCount}-page PDF · ${formatBytes(result.bytes.byteLength)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Build failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const totalBytes = shots.reduce((s, item) => s + item.image.size, 0);

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
        aria-label="Screenshot PDF stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Screenshots" value={shots.length} reduceMotion={!!reduceMotion} />
          <Stat label="Total size" value={Math.round(totalBytes / 1024)} suffix=" KB" reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Captions" value={shots.filter((s) => s.caption.trim()).length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Max" value={MAX} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Drop */}
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
          Drop screenshots (<strong>PNG</strong> / <strong>JPG</strong> / <strong>WebP</strong>) here, or
        </p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />
          Choose screenshots
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
        <p className="mt-2 text-[11px] text-muted-foreground">Up to {MAX} screenshots — each page hugs the screenshot exactly.</p>
      </section>

      {/* Settings */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Report settings
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSettings(DEFAULT_SETTINGS)}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cover title (optional)</Label>
            <Input
              value={settings.coverTitle ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, coverTitle: e.target.value }))}
              placeholder="Bug report — login flow"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cover subtitle (optional)</Label>
            <Input
              value={settings.coverSubtitle ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, coverSubtitle: e.target.value }))}
              placeholder="Found 30 May 2026 · Build 4.7.1"
            />
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
              max={80}
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Text colour</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => setSettings((s) => ({ ...s, textColor: e.target.value }))}
                className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                aria-label="Text colour"
              />
              <Input
                value={settings.textColor}
                onChange={(e) => setSettings((s) => ({ ...s, textColor: e.target.value }))}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Output filename</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="toollyz-screenshots.pdf"
              className="font-mono"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.pageNumbers}
              onChange={(e) => setSettings((s) => ({ ...s, pageNumbers: e.target.checked }))}
              className="size-4 rounded border-border accent-primary"
            />
            <span>Show page numbers</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showCaptions}
              onChange={(e) => setSettings((s) => ({ ...s, showCaptions: e.target.checked }))}
              className="size-4 rounded border-border accent-primary"
            />
            <span>Show per-page captions</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showDate}
              onChange={(e) => setSettings((s) => ({ ...s, showDate: e.target.checked }))}
              className="size-4 rounded border-border accent-primary"
            />
            <span>Add today&apos;s date to the cover</span>
          </label>
        </div>
        <div>
          <Button type="button" onClick={build} disabled={busy || shots.length === 0}>
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
      {shots.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Camera className="size-4 text-primary" />
              Screenshots ({shots.length})
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ol className="space-y-2 list-none">
            {shots.map((shot, i) => (
              <li
                key={shot.image.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-2"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.image.dataUrl}
                  alt={shot.image.name}
                  className="h-16 w-24 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="truncate text-sm font-medium" title={shot.image.name}>
                    {shot.image.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {shot.image.width}×{shot.image.height} · {formatBytes(shot.image.size)} · {shot.image.type}
                  </div>
                  <Textarea
                    value={shot.caption}
                    onChange={(e) => updateCaption(shot.image.id, e.target.value)}
                    placeholder="Caption (shown under the screenshot, optional)"
                    className="min-h-[44px] text-xs"
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => move(shot.image.id, -1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => move(shot.image.id, 1)} disabled={i === shots.length - 1} aria-label="Move down">
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => remove(shot.image.id)} aria-label="Remove">
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
          About this tool
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Camera className="mt-0.5 size-3.5 shrink-0 text-primary" />Each page is sized to match the screenshot 1:1 (treating image pixels as PDF points), with a configurable margin around it.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Add a cover page with a title/subtitle/date and a footer page number — perfect for bug reports and walkthroughs.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Captions wrap to two lines below each screenshot. Keep them short for readable footers.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every byte stays in your browser. Settings save to localStorage.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Rendered entirely in your browser — nothing is uploaded.
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
