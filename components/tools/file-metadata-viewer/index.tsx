"use client";

import * as React from "react";
import {
  AlertTriangle,
  Clock,
  FileSearch,
  Hash,
  Image as ImageIcon,
  Info,
  Lock,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type FileMeta,
  formatDuration,
  formatHex,
  inspect,
} from "@/lib/tools/text/file-meta";

export default function FileMetadataViewer() {
  const [mounted, setMounted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [meta, setMeta] = React.useState<FileMeta | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const m = await inspect(file);
      setMeta(m);
      toast.success(`Inspected ${file.name}`);
    } catch {
      toast.error("Could not inspect file");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  const extension = meta ? meta.name.split(".").pop()?.toLowerCase() : undefined;
  const mismatch =
    meta && meta.sniffedType && meta.type && meta.sniffedType !== meta.type;

  return (
    <div className="space-y-6">
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
        className={cn(
          "rounded-3xl border-2 border-dashed bg-card p-10 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <FileSearch className="mx-auto size-10 text-primary" />
        <h2 className="mt-3 font-heading text-lg font-bold tracking-tight">
          Pick a file to inspect
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to 50 MB for full SHA-256; larger files inspect headers only.
        </p>
        <div className="mt-4 flex justify-center">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="size-3.5" />
            Pick a file
          </button>
        </div>
        {busy && <p className="mt-3 text-xs text-muted-foreground">Inspecting…</p>}
      </section>

      {meta && (
        <>
          <section className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 text-xs">
            <KV label="Name" value={meta.name} />
            <KV label="Size" value={`${meta.sizeHuman} (${meta.size.toLocaleString()} bytes)`} />
            <KV label="Type (browser)" value={meta.type || "(none)"} />
            <KV label="Type (sniffed)" value={meta.sniffedType ?? "(unknown)"} />
            <KV label="Last modified" value={new Date(meta.lastModified).toLocaleString()} />
            {meta.width && meta.height && (
              <KV label="Dimensions" value={`${meta.width} × ${meta.height} px`} />
            )}
            {meta.duration !== undefined && (
              <KV label="Duration" value={formatDuration(meta.duration)} />
            )}
            {meta.sha256 && <KV label="SHA-256" value={meta.sha256} />}
          </section>

          {mismatch && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mr-1 inline size-3.5" />
              The browser says <code className="font-mono">{meta.type}</code> but the magic bytes look like{" "}
              <code className="font-mono">{meta.sniffedType}</code>. The file may have been renamed or repackaged.
            </div>
          )}

          {extension && meta.type && !meta.type.toLowerCase().includes(extension) && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-700 dark:text-sky-300">
              <Info className="mr-1 inline size-3.5" />
              File extension <code className="font-mono">.{extension}</code> doesn't appear in the browser-reported MIME{" "}
              <code className="font-mono">{meta.type}</code>.
            </div>
          )}

          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Hash className="size-4 text-primary" />
              First 32 bytes
            </h3>
            <pre className="overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px]">
              {formatHex(meta.firstBytes)}
            </pre>
          </section>

          {meta.width !== undefined && meta.height !== undefined && (
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <ImageIcon className="size-4 text-primary" />
                Quick facts
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Aspect ratio: <code className="font-mono">{(meta.width / meta.height).toFixed(3)}</code> ({simplifyRatio(meta.width, meta.height)})</li>
                <li>Megapixels: <code className="font-mono">{((meta.width * meta.height) / 1_000_000).toFixed(2)} MP</code></li>
                <li>Bytes per pixel: <code className="font-mono">{(meta.size / (meta.width * meta.height)).toFixed(2)}</code></li>
              </ul>
            </section>
          )}

          {meta.duration !== undefined && (
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <Clock className="size-4 text-primary" />
                Stream
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Bitrate (avg): <code className="font-mono">{((meta.size * 8) / meta.duration / 1000).toFixed(0)} kbps</code></li>
                <li>Seconds: <code className="font-mono">{meta.duration.toFixed(2)}</code></li>
              </ul>
            </section>
          )}
        </>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        File never leaves your browser — Toollyz has no server.
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="w-32 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="break-all font-mono">{value}</span>
    </div>
  );
}

function simplifyRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}
