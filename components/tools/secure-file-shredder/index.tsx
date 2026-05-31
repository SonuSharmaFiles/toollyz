"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Download,
  FileLock2,
  Files,
  HardDrive,
  Lock,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  MAX_SHRED_BYTES,
  PATTERNS,
  formatBytes,
  shredFile,
  type ShredPattern,
} from "@/lib/tools/text/file-shredder";

const PATTERN_KEY = "toollyz:shred-pattern";

function isPattern(s: string | null): s is ShredPattern {
  return s === "random" || s === "dod-3pass" || s === "zeros" || s === "ones";
}

interface JobResult {
  name: string;
  mime: string;
  size: number;
  digest: string;
  passes: number;
  blobUrl: string;
}

export default function SecureFileShredder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [pattern, setPattern] = React.useState<ShredPattern>("dod-3pass");
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState<{ pass: number; total: number } | null>(null);
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<JobResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    try {
      const p = localStorage.getItem(PATTERN_KEY);
      if (isPattern(p)) setPattern(p);
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(PATTERN_KEY, pattern);
    } catch {
      /* noop */
    }
  }, [pattern, mounted]);

  // Revoke the previous blob URL when the result changes / unmounts.
  React.useEffect(() => {
    return () => {
      if (result?.blobUrl) URL.revokeObjectURL(result.blobUrl);
    };
  }, [result]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (f.size > MAX_SHRED_BYTES) {
      toast.error(`File is ${formatBytes(f.size)} — over the ${formatBytes(MAX_SHRED_BYTES)} in-browser limit.`);
      return;
    }
    setFile(f);
    setResult(null);
    setProgress(null);
  }

  async function run() {
    if (!file || running) return;
    setRunning(true);
    setProgress({ pass: 0, total: PATTERNS.find((p) => p.id === pattern)?.passes ?? 1 });
    try {
      const res = await shredFile(file, {
        pattern,
        onPass: (pass, total) => setProgress({ pass, total }),
      });
      const blob = new Blob([new Uint8Array(res.bytes)], { type: res.mime });
      const url = URL.createObjectURL(blob);
      setResult({
        name: res.suggestedName,
        mime: res.mime,
        size: res.size,
        digest: res.digest,
        passes: res.passes,
        blobUrl: url,
      });
      toast.success(`Shredded in ${res.passes} pass${res.passes > 1 ? "es" : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not shred this file");
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }

  function downloadShredded() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.blobUrl;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Shredded file downloaded");
  }

  function reset() {
    setFile(null);
    setResult(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const patternMeta = PATTERNS.find((p) => p.id === pattern)!;
  const ratio = progress ? Math.round((progress.pass / progress.total) * 100) : result ? 100 : 0;

  return (
    <div className="space-y-6">
      {/* Honest framing */}
      <div className="space-y-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldAlert className="size-3.5" />
          What this actually does
        </div>
        <p className="opacity-90">
          Browsers can&apos;t touch files on your disk — the sandbox forbids it. This tool overwrites the
          in-memory copy of a file you pick, then offers the shredded version as a download. You can then
          move it over the original yourself. Useful when you need to share a file&apos;s slot (size + filename)
          without leaking its contents, or to confirm an upload pipeline reads bytes, not file references.
        </p>
      </div>

      {/* Hero */}
      <section
        aria-label="Shred summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,63,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">File</div>
            <div className="font-mono text-sm text-sky-50 truncate">
              {file ? file.name : <span className="text-rose-300/80">Pick a file to begin</span>}
            </div>
            {file && (
              <div className="text-[11px] text-muted-foreground">
                {file.type || "application/octet-stream"} · {formatBytes(file.size)}
              </div>
            )}
          </div>
          <Stat
            label="Passes"
            value={result ? result.passes : patternMeta.passes}
            reduceMotion={!!reduceMotion}
            accent="text-emerald-300"
          />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">{result ? "Done" : running ? "Working" : "Progress"}</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={ratio} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern picker */}
      <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Shred pattern
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={pattern === p.id}
              onClick={() => setPattern(p.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                pattern === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border/60 bg-background hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{p.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.passes} pass{p.passes > 1 ? "es" : ""}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* File picker */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Files className="size-4 text-primary" />
          File picker
        </h2>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {file ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
            <div className="grid size-10 place-items-center rounded-lg bg-muted">
              <FileLock2 className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{formatBytes(file.size)} · {file.type || "application/octet-stream"}</div>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
              <RefreshCcw className="size-3.5" />
              Replace
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <Trash2 className="size-3.5" />
              Reset
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files?.[0]);
            }}
            className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <Upload className="size-5 shrink-0" />
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-foreground">Click or drop a file</div>
              <div className="text-[11px]">Up to {formatBytes(MAX_SHRED_BYTES)} · stays in your browser</div>
            </div>
          </button>
        )}
      </section>

      {/* Action */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={run}
          disabled={!file || running}
          className="bg-rose-600 text-white hover:bg-rose-700"
        >
          <FileLock2 className="size-4" />
          {running ? `Shredding pass ${progress?.pass}/${progress?.total}…` : `Shred with ${patternMeta.label}`}
        </Button>
        {running && progress && (
          <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${Math.round((progress.pass / progress.total) * 100)}%` }}
              />
            </div>
            <span>{Math.round((progress.pass / progress.total) * 100)}%</span>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <section className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <Check className="size-4" />
            Shredded — {result.passes} pass{result.passes > 1 ? "es" : ""} complete
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <Info label="File name" value={result.name} />
            <Info label="Bytes" value={formatBytes(result.size)} />
            <Info label="Pattern" value={patternMeta.label} />
            <Info label="MIME" value={result.mime} />
            <Info label="SHA-256" value={result.digest.slice(0, 16) + "…"} title={result.digest} className="col-span-2 font-mono" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={downloadShredded}>
              <Download className="size-4" />
              Download shredded file
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <Trash2 className="size-3.5" />
              Start over
            </Button>
          </div>
        </section>
      )}

      {!file && !result && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
          <AlertTriangle className="size-3.5" />
          Pick a file above to begin — nothing is sent to a server.
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <HardDrive className="size-3" />
        Overwriting uses <code className="mx-1 rounded bg-muted px-1 font-mono">crypto.getRandomValues</code>{" "}
        in 64 KB chunks. The download replaces the in-memory file copy — your original on disk is untouched.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  title,
  className,
}: {
  label: string;
  value: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-background p-2", className)} title={title}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-all text-foreground/90">{value}</div>
    </div>
  );
}
