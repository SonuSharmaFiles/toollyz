"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Download, FileImage, FileUp, Image as ImageIcon, Loader2, Lock, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { convertImage, downloadBlob, formatBytes, type ConvertResult } from "@/lib/tools/image/convert";

interface QueueItem { id: string; name: string; status: "converting" | "done" | "error"; original: number; result?: ConvertResult; error?: string; file: File }

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function PngToWebp() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [queue, setQueue] = React.useState<QueueItem[]>([]);
  const [quality, setQuality] = React.useState(0.85);
  React.useEffect(() => setMounted(true), []);

  async function convertOne(file: File, q: number): Promise<ConvertResult | null> {
    try { return await convertImage(file, { mime: "image/webp", quality: q }); } catch { return null; }
  }

  async function addFiles(files: FileList) {
    const list = Array.from(files).filter((f) => /\.(png|jpe?g)$/i.test(f.name) || f.type === "image/png" || f.type === "image/jpeg");
    const rejected = files.length - list.length;
    if (rejected > 0) toast.error(`Skipped ${rejected} unsupported file${rejected === 1 ? "" : "s"}`);
    if (list.length === 0) return;
    const items: QueueItem[] = list.map((f) => ({ id: uid(), name: f.name, status: "converting", original: f.size, file: f }));
    setQueue((prev) => [...items, ...prev].slice(0, 30));
    for (const item of items) {
      const result = await convertOne(item.file, quality);
      setQueue((prev) => prev.map((q) => (q.id === item.id ? (result ? { ...q, status: "done", result } : { ...q, status: "error", error: "Couldn't encode as WebP" }) : q)));
    }
    toast.success(`Converted ${list.length} file${list.length === 1 ? "" : "s"}`);
  }

  async function rerunAll() {
    if (queue.length === 0) return;
    setQueue((prev) => prev.map((q) => ({ ...q, status: "converting", result: undefined, error: undefined })));
    for (const item of queue) {
      const result = await convertOne(item.file, quality);
      setQueue((prev) => prev.map((q) => (q.id === item.id ? (result ? { ...q, status: "done", result } : { ...q, status: "error", error: "Couldn't encode as WebP" }) : q)));
    }
    toast.success("Re-encoded with new quality");
  }

  function clearAll() { setQueue([]); }
  function downloadOne(item: QueueItem) {
    if (!item.result) return;
    const base = item.name.replace(/\.(png|jpe?g)$/i, "");
    downloadBlob(item.result.blob, `${base}.webp`);
  }
  function downloadAll() { queue.filter((q) => q.result).forEach((q) => downloadOne(q)); }

  const done = queue.filter((q) => q.status === "done");
  const totalOriginal = done.reduce((s, q) => s + q.original, 0);
  const totalNew = done.reduce((s, q) => s + (q.result?.newBytes ?? 0), 0);
  const savedPct = totalOriginal > 0 ? Math.round(((totalOriginal - totalNew) / totalOriginal) * 100) : 0;

  if (!mounted) return <div className="h-72 animate-pulse rounded-3xl bg-muted" aria-hidden="true" />;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Conversion stats" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Files queued" value={queue.length} reduceMotion={!!reduceMotion} />
          <Stat label="Converted" value={done.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="PNG total" value={Math.round(totalOriginal / 1024)} reduceMotion={!!reduceMotion} suffix=" KB" />
          <Stat label="Saved" value={savedPct} reduceMotion={!!reduceMotion} suffix="%" accent="text-emerald-300" />
        </div>
        {done.length > 0 && (<p className="relative mt-4 text-[11px] text-indigo-300/70">WebP total <strong>{formatBytes(totalNew)}</strong> · {formatBytes(totalOriginal - totalNew)} smaller than the originals.</p>)}
      </section>

      {/* Quality */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="quality" className="text-sm">WebP quality — <span className="font-mono tabular-nums text-foreground">{Math.round(quality * 100)}%</span></Label>
          <Button type="button" size="sm" variant="outline" onClick={rerunAll} disabled={queue.length === 0}><Sparkles className="size-4" />Re-encode all</Button>
        </div>
        <Slider id="quality" value={[quality]} onValueChange={(v) => setQuality(Array.isArray(v) ? v[0] : v)} min={0.2} max={1} step={0.01} />
        <p className="text-[11px] text-muted-foreground">Higher = better quality but larger file. 80–90% is a great default for photos. Slide and hit Re-encode all to apply to existing files.</p>
      </section>

      {/* Drop zone */}
      <section
        className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
      >
        <FileUp className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drop one or more <strong>PNG</strong> (or JPG) files here, or</p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />Choose images
          <input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">Up to 30 at a time — converted entirely in your browser.</p>
      </section>

      {/* Queue */}
      {queue.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><ImageIcon className="size-4 text-primary" />Queue</h2>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={downloadAll} disabled={done.length === 0}><Download className="size-4" />Download all</Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearAll}><Trash2 className="size-3.5" />Clear</Button>
            </div>
          </div>
          <ul className="space-y-2 list-none">
            {queue.map((q) => {
              const delta = q.result ? Math.round(((q.result.newBytes - q.original) / q.original) * 100) : 0;
              return (
                <motion.li key={q.id} layout={!reduceMotion} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2">
                  {q.result ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={q.result.dataUrl} alt={q.name} className="h-12 w-12 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded bg-muted text-muted-foreground"><FileImage className="size-5" /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium" title={q.name}>{q.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatBytes(q.original)}</span>
                      {q.result && (<>
                        <span>→</span>
                        <span className="font-medium text-foreground/80">{formatBytes(q.result.newBytes)}</span>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", delta <= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>{delta <= 0 ? "−" : "+"}{Math.abs(delta)}%</span>
                        <span>·</span><span>{q.result.width}×{q.result.height}</span>
                      </>)}
                    </div>
                  </div>
                  {q.status === "converting" && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
                  {q.status === "error" && <span className="flex items-center gap-1 text-xs text-rose-500"><AlertTriangle className="size-3.5" />{q.error}</span>}
                  {q.status === "done" && q.result && <Button type="button" size="sm" variant="outline" onClick={() => downloadOne(q)}><Download className="size-4" />WebP</Button>}
                </motion.li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" /><Check className="size-3 text-emerald-500" />Files are decoded and re-encoded in your browser — nothing is uploaded.</p>
    </div>
  );
}

function Stat({ label, value, suffix = "", reduceMotion, accent }: { label: string; value: number; suffix?: string; reduceMotion: boolean; accent?: string }) {
  return (<div className="space-y-1"><div className="text-xs font-medium text-indigo-300/70">{label}</div><div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}><AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} /></div></div>);
}
