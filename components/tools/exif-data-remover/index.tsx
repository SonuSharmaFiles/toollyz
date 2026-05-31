"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Download,
  FileX,
  Lock,
  RefreshCcw,
  Shield,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  deriveCleanName,
  formatBytes,
  stripFile,
  type StripResult,
} from "@/lib/tools/text/exif-strip";

export default function ExifDataRemover() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<StripResult | null>(null);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    return () => {
      if (result?.blob) URL.revokeObjectURL(URL.createObjectURL(result.blob));
    };
  }, [result]);

  async function process(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.name.match(/\.(jpe?g|png|webp|tiff?|gif)$/i)) {
      toast.error("Pick an image file (JPEG, PNG, WebP, GIF or TIFF).");
      return;
    }
    setFile(f);
    setResult(null);
    setBusy(true);
    try {
      const res = await stripFile(f);
      setResult(res);
      if (!res.ok) toast.error(res.error ?? "Could not strip metadata");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result?.blob || !file) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(result.blob);
    a.download = deriveCleanName(file.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast.success(`Saved ${a.download}`);
  }

  function reset() {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(244,63,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">File</div>
            <div className="font-mono text-sm text-sky-50 truncate">
              {file ? file.name : <span className="text-rose-300/80">No file picked</span>}
            </div>
          </div>
          <Stat
            label="Size before"
            value={result?.originalSize ?? file?.size ?? 0}
            reduceMotion={!!reduceMotion}
          />
          <Stat
            label="Size after"
            value={result?.size ?? 0}
            reduceMotion={!!reduceMotion}
            accent={result?.ok ? "text-emerald-300" : undefined}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-xs text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-1.5 font-semibold">
          <Shield className="size-3.5" />
          Why strip EXIF?
        </div>
        <p className="mt-1 opacity-90">
          Photos taken on phones embed location coordinates, device model, camera settings, and capture timestamps in the EXIF, IPTC and ICC segments.
          This is fine for personal albums but leaks data when sharing publicly. Stripping the metadata segments keeps the visible image but removes those fields.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <FileX className="size-4 text-primary" />
          Pick an image
        </h2>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => process(e.target.files?.[0] ?? undefined)}
        />
        {file ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
            <div className="grid size-10 place-items-center rounded-lg bg-muted">
              <FileX className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{file.type || "image"} · {formatBytes(file.size)}</div>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
              <RefreshCcw className="size-3.5" />
              Replace
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
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
              process(e.dataTransfer.files?.[0]);
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <Upload className="size-5 shrink-0" />
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-foreground">Click or drop a JPG / PNG / WebP / GIF</div>
              <div className="text-[11px]">JPEGs use structural strip (lossless). PNG/WebP use canvas re-encode.</div>
            </div>
          </button>
        )}
        {busy && <p className="text-xs text-muted-foreground">Stripping metadata…</p>}
      </section>

      {result?.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3.5" />
          {result.error}
        </div>
      )}

      {result?.ok && (
        <section className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <Check className="size-4" />
            Stripped — {formatBytes(result.size)} ({result.reductionPct.toFixed(1)}% reduction)
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <Info label="Strategy" value={
              result.strategy === "structural" ? "Structural (lossless)" :
              result.strategy === "canvas-png" ? "Canvas re-encode (PNG, lossless)" :
              result.strategy === "canvas-webp" ? "Canvas re-encode (WebP, lossy)" :
              "Canvas re-encode (JPEG, lossy)"
            } />
            <Info label="Output MIME" value={result.mime} mono />
            {result.width && result.height && (
              <Info label="Dimensions" value={`${result.width} × ${result.height}`} mono />
            )}
          </div>
          {result.removedSegments && result.removedSegments.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Removed segments</div>
              <ul className="space-y-1 list-none">
                {result.removedSegments.map((seg, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md border border-border/60 bg-background p-2 text-xs">
                    <code className="font-mono text-rose-500">{seg.marker}</code>
                    <span className="flex-1">{seg.description}</span>
                    <span className="font-mono text-muted-foreground">{seg.sizeBytes.toLocaleString()} bytes</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button type="button" onClick={download}>
            <Download className="size-4" />
            Download cleaned file
          </Button>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileX className="size-3" />
        Stripping runs entirely in your browser — your image is never uploaded.
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
        <span className="text-base text-sky-100/40"> B</span>
      </div>
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
