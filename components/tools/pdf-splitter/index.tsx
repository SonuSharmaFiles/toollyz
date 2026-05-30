"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Info,
  Loader2,
  Lock,
  Scissors,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { downloadBytes, formatBytes } from "@/lib/tools/pdf/merge";
import {
  eachPageAsRange,
  parseRanges,
  pdfPageCount,
  splitPdf,
  type SplitOutput,
  type SplitRange,
} from "@/lib/tools/pdf/split";

type Mode = "ranges" | "everyPage";

export default function PdfSplitter() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [file, setFile] = React.useState<{ name: string; size: number; pageCount: number; bytes: Uint8Array } | null>(null);
  const [mode, setMode] = React.useState<Mode>("ranges");
  const [expression, setExpression] = React.useState("1-3, 5");
  const [busy, setBusy] = React.useState(false);
  const [outputs, setOutputs] = React.useState<SplitOutput[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setMounted(true), []);

  async function pickFile(files: FileList) {
    setError(null);
    setOutputs([]);
    const f = files[0];
    if (!f) return;
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
      toast.error("Pick a PDF file");
      return;
    }
    try {
      const { pageCount, bytes } = await pdfPageCount(f);
      setFile({ name: f.name, size: f.size, pageCount, bytes });
      if (pageCount < 5) setExpression(`1-${pageCount}`);
      toast.success(`Loaded ${f.name} · ${pageCount} pages`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't read PDF";
      toast.error(msg);
      setError(msg);
    }
  }

  function clearFile() {
    setFile(null);
    setOutputs([]);
    setError(null);
  }

  const parsed = React.useMemo(() => {
    if (!file) return { ranges: [] as SplitRange[], errors: [] as string[] };
    if (mode === "everyPage") return { ranges: eachPageAsRange(file.pageCount), errors: [] };
    return parseRanges(expression, file.pageCount);
  }, [file, mode, expression]);

  async function runSplit() {
    if (!file) return;
    if (parsed.ranges.length === 0) {
      toast.error("Add at least one page or range");
      return;
    }
    setBusy(true);
    setError(null);
    setOutputs([]);
    try {
      const base = file.name.replace(/\.pdf$/i, "");
      const results = await splitPdf(file.bytes, parsed.ranges, base);
      setOutputs(results);
      toast.success(`Split into ${results.length} file${results.length === 1 ? "" : "s"}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Split failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function downloadOne(out: SplitOutput) {
    downloadBytes(out.bytes, out.name);
  }

  function downloadAll() {
    outputs.forEach((o, i) => {
      setTimeout(() => downloadBytes(o.bytes, o.name), i * 120);
    });
    toast.success(`Triggered ${outputs.length} download${outputs.length === 1 ? "" : "s"}`);
  }

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
        aria-label="Split stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Source pages" value={file?.pageCount ?? 0} reduceMotion={!!reduceMotion} />
          <Stat label="Output files" value={parsed.ranges.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Total pages out" value={parsed.ranges.reduce((s, r) => s + (r.end - r.start + 1), 0)} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Mode" value={mode === "ranges" ? 1 : 2} reduceMotion={!!reduceMotion} suffix={mode === "ranges" ? " · ranges" : " · per-page"} />
        </div>
      </section>

      {/* Drop zone (or file info) */}
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
          <p className="mt-2 text-[11px] text-muted-foreground">Parsed in your browser — never uploaded.</p>
        </section>
      ) : (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <FileText className="size-5 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{file.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {file.pageCount} page{file.pageCount === 1 ? "" : "s"} · {formatBytes(file.size)}
            </div>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={clearFile}>
            <Trash2 className="size-3.5" />
            Replace
          </Button>
        </section>
      )}

      {file && (
        <>
          {/* Mode + expression */}
          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Scissors className="size-4 text-primary" />
              Split mode
            </h2>
            <Tabs value={mode} onValueChange={(v) => v && setMode(v as Mode)} className="w-full">
              <TabsList className="mb-3 grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
                <TabsTrigger value="ranges">By ranges</TabsTrigger>
                <TabsTrigger value="everyPage">Every page</TabsTrigger>
              </TabsList>
              <TabsContent value="ranges" className="space-y-2">
                <Label htmlFor="ranges" className="text-xs font-medium">
                  Pages to extract (1-based)
                </Label>
                <Input
                  id="ranges"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="1-3, 5, 8-10"
                  className="font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Comma or newline separated. Examples: <code className="font-mono">1-3</code>, <code className="font-mono">5</code>, <code className="font-mono">8-10</code>. Each range produces one output PDF.
                </p>
                {parsed.errors.length > 0 && (
                  <ul className="space-y-1 list-none">
                    {parsed.errors.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2 text-xs text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="everyPage" className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Splits the PDF into <strong>{file.pageCount}</strong> single-page files — one per page.
                </p>
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-1.5">
              <Button type="button" onClick={runSplit} disabled={busy || parsed.ranges.length === 0}>
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Splitting…
                  </>
                ) : (
                  <>
                    <Scissors className="size-4" />
                    Split & list
                  </>
                )}
              </Button>
              {outputs.length > 1 && (
                <Button type="button" variant="outline" onClick={downloadAll}>
                  <Download className="size-4" />
                  Download all
                </Button>
              )}
            </div>
          </section>

          {/* Outputs */}
          {outputs.length > 0 && (
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <FileText className="size-4 text-primary" />
                {outputs.length} output file{outputs.length === 1 ? "" : "s"}
              </h2>
              <ul className="space-y-2 list-none">
                {outputs.map((o, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-500/10 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{o.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {o.pageCount} page{o.pageCount === 1 ? "" : "s"} · {formatBytes(o.bytes.byteLength)}
                      </div>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => downloadOne(o)}>
                      <Download className="size-4" />
                      Save
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {error && (
            <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-4" />
              {error}
            </p>
          )}
        </>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this splitter
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Pages are copied with the open-source pdf-lib library — fonts, images and vector content are preserved.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            Page numbers are 1-based. Each comma-separated range produces a separate output file named <code className="font-mono">name_pX-Y.pdf</code>.
          </li>
          <li className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            Heavily-encrypted PDFs may refuse to copy pages even with <code className="font-mono">ignoreEncryption</code>. Remove the protection first.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no server — your PDF stays in your browser. The split files are generated locally and only downloaded when you click Save.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Splitting runs entirely in your browser — nothing is uploaded.
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
