"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileImage,
  FileText,
  FileUp,
  Info,
  Loader2,
  Lock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { downloadBlob, formatBytes, openPdf, renderPage, type RenderedPage } from "@/lib/tools/pdf/render";
import { parseRanges, eachPageAsRange } from "@/lib/tools/pdf/split";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

type Format = "image/png" | "image/jpeg";
type Mode = "ranges" | "all";

interface Settings {
  format: Format;
  scale: number; // 1 = 72 dpi, 2 = 144 dpi …
  quality: number;
  ranges: string;
  mode: Mode;
  background: string;
}

const DEFAULTS: Settings = {
  format: "image/png",
  scale: 2,
  quality: 0.92,
  ranges: "1-5",
  mode: "ranges",
  background: "#ffffff",
};

const STORAGE_KEY = "toollyz:pdf-to-image-settings";

export default function PdfToImage() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(DEFAULTS);
  const [file, setFile] = React.useState<{ name: string; size: number } | null>(null);
  const [doc, setDoc] = React.useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [rendered, setRendered] = React.useState<RenderedPage[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) });
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

  async function pickFile(files: FileList) {
    setError(null);
    setRendered([]);
    const f = files[0];
    if (!f) return;
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
      toast.error("Pick a PDF file");
      return;
    }
    try {
      const { pageCount: pc, doc: d } = await openPdf(f);
      setFile({ name: f.name, size: f.size });
      setDoc(d);
      setPageCount(pc);
      if (pc <= 5) setSettings((s) => ({ ...s, ranges: `1-${pc}` }));
      toast.success(`Loaded ${f.name} · ${pc} pages`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't read PDF";
      toast.error(msg);
      setError(msg);
    }
  }

  function clearFile() {
    setFile(null);
    setDoc(null);
    setPageCount(0);
    setRendered([]);
    setError(null);
  }

  const targetPages = React.useMemo(() => {
    if (!doc || pageCount === 0) return [] as number[];
    if (settings.mode === "all") return eachPageAsRange(pageCount).map((r) => r.start);
    const { ranges } = parseRanges(settings.ranges, pageCount);
    const set = new Set<number>();
    ranges.forEach((r) => {
      for (let p = r.start; p <= r.end; p++) set.add(p);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [doc, pageCount, settings.mode, settings.ranges]);

  async function runRender() {
    if (!doc || targetPages.length === 0) return;
    setBusy(true);
    setError(null);
    setRendered([]);
    setProgress(0);
    try {
      const out: RenderedPage[] = [];
      for (let i = 0; i < targetPages.length; i++) {
        const p = targetPages[i];
        const r = await renderPage(doc, p, {
          scale: settings.scale,
          mime: settings.format,
          quality: settings.format === "image/jpeg" ? settings.quality : undefined,
          backgroundColor: settings.background,
        });
        out.push(r);
        setProgress(Math.round(((i + 1) / targetPages.length) * 100));
        setRendered([...out]);
      }
      toast.success(`Rendered ${out.length} page${out.length === 1 ? "" : "s"}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Render failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function downloadOne(r: RenderedPage) {
    const ext = settings.format === "image/png" ? "png" : "jpg";
    const base = file?.name.replace(/\.pdf$/i, "") ?? "page";
    downloadBlob(r.blob, `${base}_p${r.pageNumber}.${ext}`);
  }

  function downloadAll() {
    rendered.forEach((r, i) => setTimeout(() => downloadOne(r), i * 120));
    toast.success(`Triggered ${rendered.length} download${rendered.length === 1 ? "" : "s"}`);
  }

  const totalBytes = rendered.reduce((s, r) => s + r.bytes, 0);
  const dpi = Math.round(72 * settings.scale);

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
        aria-label="Render stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Source pages" value={pageCount} reduceMotion={!!reduceMotion} />
          <Stat label="To render" value={targetPages.length} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Rendered" value={rendered.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="At" value={dpi} reduceMotion={!!reduceMotion} suffix=" DPI" accent="text-indigo-300" />
        </div>
        {rendered.length > 0 && (
          <p className="relative mt-4 text-[11px] text-indigo-200/80">
            {rendered.length} image{rendered.length === 1 ? "" : "s"} · {formatBytes(totalBytes)} total
          </p>
        )}
        {busy && (
          <div className="relative mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-emerald-200/80">{progress}% · rendering page {Math.min(rendered.length + 1, targetPages.length)} of {targetPages.length}</p>
          </div>
        )}
      </section>

      {/* Drop / file */}
      {!file ? (
        <section
          className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) void pickFile(e.dataTransfer.files);
          }}
        >
          <FileUp className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop a <strong>PDF</strong> here, or
          </p>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
            <FileUp className="size-4" />
            Choose PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void pickFile(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Rendered by Mozilla&apos;s PDF.js — entirely in your browser.
          </p>
        </section>
      ) : (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <FileText className="size-5 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{file.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {pageCount} page{pageCount === 1 ? "" : "s"} · {formatBytes(file.size)}
            </div>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={clearFile}>
            <Trash2 className="size-3.5" />
            Replace
          </Button>
        </section>
      )}

      {/* Settings */}
      {file && (
        <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
          <Tabs value={settings.mode} onValueChange={(v) => v && setSettings((s) => ({ ...s, mode: v as Mode }))} className="w-full">
            <TabsList className="mb-3 grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
              <TabsTrigger value="ranges">By ranges</TabsTrigger>
              <TabsTrigger value="all">All pages</TabsTrigger>
            </TabsList>
            <TabsContent value="ranges" className="space-y-1.5">
              <Label htmlFor="ranges" className="text-xs font-medium">
                Pages (1-based)
              </Label>
              <Input
                id="ranges"
                value={settings.ranges}
                onChange={(e) => setSettings((s) => ({ ...s, ranges: e.target.value }))}
                placeholder="1-3, 5, 8-10"
                className="font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Comma or newline separated. Each page becomes one PNG/JPG.
              </p>
            </TabsContent>
            <TabsContent value="all">
              <p className="text-xs text-muted-foreground">
                Renders every page from 1 to {pageCount}.
              </p>
            </TabsContent>
          </Tabs>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="format" className="text-xs font-medium">
                Format
              </Label>
              <Select value={settings.format} onValueChange={(v) => v && setSettings((s) => ({ ...s, format: v as Format }))}>
                <SelectTrigger id="format" className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/png">PNG (lossless, transparent)</SelectItem>
                  <SelectItem value="image/jpeg">JPEG (smaller, no transparency)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-medium">Scale</Label>
                <span className="font-mono tabular-nums">{settings.scale}× · {dpi} DPI</span>
              </div>
              <Slider
                value={[settings.scale]}
                onValueChange={(v) => setSettings((s) => ({ ...s, scale: Array.isArray(v) ? v[0] : (v as number) }))}
                min={0.5}
                max={4}
                step={0.5}
              />
              <p className="text-[10px] text-muted-foreground">2× = 144 DPI, good for screens. 3× = 216 DPI, print-ready.</p>
            </div>
            {settings.format === "image/jpeg" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-medium">JPEG quality</Label>
                  <span className="font-mono tabular-nums">{Math.round(settings.quality * 100)}%</span>
                </div>
                <Slider
                  value={[settings.quality]}
                  onValueChange={(v) => setSettings((s) => ({ ...s, quality: Array.isArray(v) ? v[0] : (v as number) }))}
                  min={0.3}
                  max={1}
                  step={0.02}
                />
              </div>
            )}
            {settings.format === "image/jpeg" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">JPEG background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.background}
                    onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                    aria-label="Background color"
                  />
                  <Input
                    value={settings.background}
                    onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))}
                    className="font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button type="button" onClick={runRender} disabled={busy || targetPages.length === 0}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Rendering…
                </>
              ) : (
                <>
                  <FileImage className="size-4" />
                  Render {targetPages.length} page{targetPages.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
            {rendered.length > 1 && (
              <Button type="button" variant="outline" onClick={downloadAll}>
                <Download className="size-4" />
                Download all
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Renders */}
      {rendered.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <FileImage className="size-4 text-primary" />
            Rendered images
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rendered.map((r) => (
              <div key={r.pageNumber} className="space-y-2 rounded-lg border border-border/60 bg-background p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.dataUrl}
                  alt={`Page ${r.pageNumber}`}
                  className="block aspect-auto h-auto w-full rounded border border-border/60"
                />
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono font-semibold text-primary">
                    p{r.pageNumber}
                  </span>
                  <span className="text-muted-foreground">{r.width}×{r.height} · {formatBytes(r.bytes)}</span>
                  <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={() => downloadOne(r)}>
                    <Download className="size-3.5" />
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
            Pages are rasterised by Mozilla&apos;s PDF.js (same engine Firefox uses) into a 2D canvas, then exported with the browser&apos;s native encoder.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            Scale = 1× → 72 DPI, 2× → 144 DPI (screens), 3× → 216 DPI (print). Higher scales produce sharper images and larger files.
          </li>
          <li className="flex items-start gap-1.5">
            <FileImage className="mt-0.5 size-3.5 shrink-0 text-primary" />
            PNG keeps transparency; JPEG flattens onto a configurable background colour (default white).
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no server — every byte stays in your browser. The PDF.js worker is served from <code className="font-mono">/pdfjs/pdf.worker.min.mjs</code>.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Rendering runs entirely in your browser — nothing is uploaded.
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
