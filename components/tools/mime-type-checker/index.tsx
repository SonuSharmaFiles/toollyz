"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  FileQuestion,
  FileSearch,
  Lock,
  RefreshCcw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  TOTAL_SIGNATURES,
  detectFromFile,
  formatHex,
  type DetectionResult,
} from "@/lib/tools/text/mime-sniff";

export default function MimeTypeChecker() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<DetectionResult | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function process(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setBusy(true);
    try {
      const res = await detectFromFile(f);
      setResult(res);
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string, k: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(k);
      window.setTimeout(() => setCopied((c) => (c === k ? null : c)), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
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

  const top = result?.matches[0];
  const mismatch = result && result.matches.length > 0 && !result.extensionMatchesContent;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Detected MIME</div>
            <div className="font-heading text-2xl font-bold tracking-tight text-sky-50 sm:text-3xl">
              {top?.mime ?? (result ? "Unknown" : "—")}
            </div>
            {top && <div className="text-[11px] text-muted-foreground">{top.label}</div>}
          </div>
          <Stat label="Matches" value={result?.matches.length ?? 0} reduceMotion={!!reduceMotion} accent={mismatch ? "text-rose-300" : "text-emerald-300"} />
          <Stat label="Signatures" value={TOTAL_SIGNATURES} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <FileSearch className="size-4 text-primary" />
          Pick a file
        </h2>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => process(e.target.files?.[0] ?? undefined)}
        />
        {file ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
            <div className="grid size-10 place-items-center rounded-lg bg-muted">
              <FileSearch className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{(result?.reportedMime ?? file.type) || "(no type)"} · {file.size.toLocaleString()} bytes</div>
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
              <div className="text-sm font-medium text-foreground">Click or drop any file</div>
              <div className="text-[11px]">We read the first 512 bytes and match against {TOTAL_SIGNATURES} known signatures.</div>
            </div>
          </button>
        )}
        {busy && <p className="text-xs text-muted-foreground">Inspecting…</p>}
      </section>

      {result && (
        <>
          {mismatch && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-3.5 mt-0.5" />
              <span>
                <strong>Extension mismatch.</strong> The reported extension does not match the detected content type — file may be renamed.
              </span>
            </div>
          )}

          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="text-sm font-semibold tracking-tight">Magic-byte matches</h2>
            {result.matches.length === 0 ? (
              <p className="text-xs text-muted-foreground">No known signature matched the first bytes. Could be plain text, an obscure format, or an empty file.</p>
            ) : (
              <ul className="space-y-2 list-none">
                {result.matches.map((m, i) => (
                  <li key={i} className="rounded-xl border border-border/60 bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <code className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">{m.mime}</code>
                      <span className="font-medium">{m.label}</span>
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">.{m.ext}</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Pattern <code>{m.pattern}</code>
                      {m.offset !== undefined && m.offset > 0 && ` at offset ${m.offset}`}
                    </div>
                    {m.notes && <div className="mt-0.5 text-[11px] text-muted-foreground">{m.notes}</div>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="text-sm font-semibold tracking-tight">Header dump (first 32 bytes)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Dump label="Hex" value={formatHex(result.headerHex, 2)} copyKey="hex" copied={copied} onCopy={copy} />
              <Dump label="ASCII" value={result.headerAscii} copyKey="ascii" copied={copied} onCopy={copy} />
            </div>
          </section>

          <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="text-sm font-semibold tracking-tight">Reported (by browser)</h2>
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <Info label="Filename" value={result.reportedName} mono />
              <Info label="MIME type" value={result.reportedMime} mono />
              <Info label="Size" value={`${result.reportedSize.toLocaleString()} bytes`} mono />
            </div>
          </section>
        </>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileQuestion className="size-3" />
        We read only the first 512 bytes of your file — nothing is uploaded.
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

function Dump({
  label,
  value,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyKey: string;
  copied: string | null;
  onCopy: (v: string, k: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() => onCopy(value, copyKey)}
          className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        >
          {copied === copyKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <code className="block break-all rounded-lg border border-border/60 bg-background p-2 font-mono text-xs">{value}</code>
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
