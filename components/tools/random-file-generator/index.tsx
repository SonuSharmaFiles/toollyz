"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileQuestion,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  FILE_KINDS,
  MAX_BYTES,
  SIZE_PRESETS,
  formatBytes,
  generate,
  type FileKind,
} from "@/lib/tools/text/random-file";

const KIND_KEY = "toollyz:randfile-kind";
const SIZE_KEY = "toollyz:randfile-size";
const NAME_KEY = "toollyz:randfile-name";

export default function RandomFileGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [kind, setKind] = React.useState<FileKind>("binary");
  const [size, setSize] = React.useState(1024);
  const [name, setName] = React.useState("random");
  const [width, setWidth] = React.useState(512);
  const [height, setHeight] = React.useState(512);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ url: string; bytes: number; digest?: string; mime: string; ext: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const k = localStorage.getItem(KIND_KEY);
      if (k === "text" || k === "lorem" || k === "binary" || k === "zeros" || k === "image") setKind(k);
      const s = parseInt(localStorage.getItem(SIZE_KEY) ?? "1024", 10);
      if (Number.isFinite(s)) setSize(Math.max(1, Math.min(MAX_BYTES, s)));
      setName(localStorage.getItem(NAME_KEY) ?? "random");
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KIND_KEY, kind);
      localStorage.setItem(SIZE_KEY, String(size));
      localStorage.setItem(NAME_KEY, name);
    } catch {
      /* noop */
    }
  }, [kind, size, name, mounted]);

  React.useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await generate({ kind, size, width, height });
      if (!res.ok || !res.blob) {
        setError(res.error ?? "Could not generate");
        setResult(null);
        return;
      }
      const meta = FILE_KINDS.find((k) => k.id === kind)!;
      const url = URL.createObjectURL(res.blob);
      setResult({ url, bytes: res.size, digest: res.digest, mime: res.mime, ext: meta.defaultExt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${name || "random"}.${result.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Saved ${name}.${result.ext}`);
  }

  async function copyDigest() {
    if (!result?.digest) return;
    try {
      await navigator.clipboard.writeText(result.digest);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("SHA-256 copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const meta = FILE_KINDS.find((k) => k.id === kind)!;
  const overLimit = size > MAX_BYTES;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Target bytes" value={size} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Size</div>
            <div className="font-heading text-lg font-bold tracking-tight text-sky-50 sm:text-xl">{formatBytes(size)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Kind</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg">{meta.label}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", busy ? "text-amber-300" : result ? "text-emerald-300" : "text-sky-100")}>
              {busy ? "Generating…" : result ? "Ready" : "Idle"}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Settings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">File kind</Label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as FileKind)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            >
              {FILE_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Size (bytes)</Label>
            <Input
              type="number"
              min={1}
              max={MAX_BYTES}
              value={size}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setSize(Math.max(1, Math.min(MAX_BYTES, n)));
              }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Base filename</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="random"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Extension</Label>
            <Input value={meta.defaultExt} readOnly className="font-mono opacity-60" />
          </div>
          {kind === "image" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Image width (px)</Label>
                <Input
                  type="number"
                  min={1}
                  max={4096}
                  value={width}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isFinite(n)) setWidth(Math.max(1, Math.min(4096, n)));
                  }}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Image height (px)</Label>
                <Input
                  type="number"
                  min={1}
                  max={4096}
                  value={height}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isFinite(n)) setHeight(Math.max(1, Math.min(4096, n)));
                  }}
                  className="font-mono"
                />
              </div>
            </>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">{meta.hint}</p>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.bytes}
              type="button"
              onClick={() => setSize(p.bytes)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
        {overLimit && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            Maximum is {formatBytes(MAX_BYTES)} per file.
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={run} disabled={busy || overLimit}>
          <RefreshCcw className={cn("size-4", busy && "animate-spin")} />
          {busy ? "Generating…" : "Generate"}
        </Button>
        {result && (
          <Button type="button" variant="outline" onClick={download}>
            <Download className="size-4" />
            Download {name}.{result.ext}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3.5" />
          {error}
        </div>
      )}

      {result && (
        <section className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <Check className="size-4" />
            Ready — {formatBytes(result.bytes)}
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <Info label="MIME" value={result.mime} mono />
            <Info label="Filename" value={`${name}.${result.ext}`} mono />
          </div>
          {result.digest && (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs">
              <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">SHA-256</span>
              <code className="min-w-0 flex-1 break-all font-mono">{result.digest}</code>
              <button
                type="button"
                onClick={copyDigest}
                className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          )}
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileQuestion className="size-3" />
        Files are generated using <code className="mx-1 rounded bg-muted px-1 font-mono">crypto.getRandomValues</code>
        in 64 KB chunks and assembled in your browser — Toollyz has no server. 100 MB hard cap.
      </p>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 break-all text-foreground/90", mono && "font-mono")}>{value}</div>
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
