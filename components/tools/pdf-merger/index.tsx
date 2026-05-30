"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
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
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { useReducedMotion } from "framer-motion";
import {
  downloadBytes,
  formatBytes,
  mergePdfs,
  readPdfMeta,
  type PdfFileMeta,
} from "@/lib/tools/pdf/merge";

const MAX_FILES = 30;

export default function PdfMerger() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [files, setFiles] = React.useState<PdfFileMeta[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setMounted(true), []);

  async function addFiles(list: FileList) {
    setError(null);
    const incoming = Array.from(list).filter(
      (f) => /\.pdf$/i.test(f.name) || f.type === "application/pdf",
    );
    const rejected = list.length - incoming.length;
    if (rejected > 0) toast.error(`Skipped ${rejected} non-PDF file${rejected === 1 ? "" : "s"}`);
    if (incoming.length === 0) return;
    const room = Math.max(0, MAX_FILES - files.length);
    if (incoming.length > room) toast.error(`Capped at ${MAX_FILES} PDFs — only the first ${room} added.`);
    const slice = incoming.slice(0, room);
    if (slice.length === 0) return;

    const next: PdfFileMeta[] = [];
    for (const f of slice) {
      try {
        next.push(await readPdfMeta(f));
      } catch (e) {
        toast.error(`Couldn't read ${f.name}: ${e instanceof Error ? e.message : "unknown error"}`);
      }
    }
    if (next.length > 0) {
      setFiles((prev) => [...prev, ...next]);
      toast.success(`Added ${next.length} PDF${next.length === 1 ? "" : "s"}`);
    }
  }

  function remove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function clearAll() {
    setFiles([]);
    setError(null);
  }

  function move(id: string, delta: number) {
    setFiles((prev) => {
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

  async function downloadMerged() {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await mergePdfs(files);
      downloadBytes(out, `toollyz-merged.pdf`);
      toast.success(`Merged ${files.length} PDFs · ${formatBytes(out.byteLength)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Merge failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
  const totalBytes = files.reduce((s, f) => s + f.size, 0);

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
        aria-label="Merge stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="PDFs queued" value={files.length} reduceMotion={!!reduceMotion} />
          <Stat label="Total pages" value={totalPages} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Combined size" value={Math.round(totalBytes / 1024)} suffix=" KB" reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Max" value={MAX_FILES} reduceMotion={!!reduceMotion} />
        </div>
        {files.length > 0 && (
          <p className="relative mt-4 text-[11px] text-indigo-200/80">
            {files.length} file{files.length === 1 ? "" : "s"} · {totalPages} page{totalPages === 1 ? "" : "s"} · {formatBytes(totalBytes)}
          </p>
        )}
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
          Drop <strong>PDF</strong> files here, or
        </p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />
          Choose PDFs
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">Up to {MAX_FILES} files — merged entirely in your browser.</p>
      </section>

      {/* Queue */}
      {files.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <FileText className="size-4 text-primary" />
              Queue
              <span className="ml-2 text-xs font-normal text-muted-foreground">drag-friendly via Move buttons</span>
            </h2>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" onClick={downloadMerged} disabled={busy || files.length === 0}>
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Merging…
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    Merge & download
                  </>
                )}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
          </div>
          <ol className="space-y-2 list-none">
            {files.map((f, i) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" title={f.name}>
                    {f.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{f.pageCount} page{f.pageCount === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>{formatBytes(f.size)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => move(f.id, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => move(f.id, 1)}
                    disabled={i === files.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(f.id)}
                    aria-label="Remove"
                  >
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

      {/* Caveats */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this merger
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Pages are copied with the open-source pdf-lib library — fonts, images and vector graphics are preserved as-is.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            The output PDF stacks every input in the order shown above. Re-order with the up/down buttons before merging.
          </li>
          <li className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            Password-protected PDFs are opened with `ignoreEncryption: true` for reading — the merger may fail on heavily-encrypted files.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no server — every byte stays in your browser. Files aren&apos;t saved between sessions.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Merging runs entirely in your browser — nothing is uploaded.
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
