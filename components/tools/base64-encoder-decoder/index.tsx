"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeftRight, Binary, Check, Copy, Download, Eraser, FileUp, Image, Lock, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { base64ToBytes, base64UrlToBytes, bytesToBase64, bytesToBase64Url, decodeUtf8, encodeUtf8 } from "@/lib/tools/shared/base64";

type Mode = "encode" | "decode";
type Variant = "standard" | "url";
type Tab = "text" | "file";

const INPUT_KEY = "toollyz:b64-input";
const MODE_KEY = "toollyz:b64-mode";
const VARIANT_KEY = "toollyz:b64-variant";
const SAMPLE = "Hello, Toollyz! 👋 Encode me into Base64.";

function encodeText(text: string, variant: Variant): string {
  const bytes = encodeUtf8(text);
  return variant === "url" ? bytesToBase64Url(bytes) : bytesToBase64(bytes);
}
function decodeText(b64: string, variant: Variant): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const bytes = variant === "url" ? base64UrlToBytes(b64.trim()) : base64ToBytes(b64.trim().replace(/\s+/g, ""));
    return { ok: true, output: decodeUtf8(bytes) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid Base64 input" };
  }
}

interface FileResult { name: string; bytes: number; mime: string; base64: string; dataUri: string }

export default function Base64EncoderDecoder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("text");
  const [mode, setMode] = React.useState<Mode>("encode");
  const [variant, setVariant] = React.useState<Variant>("standard");
  const [input, setInput] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [file, setFile] = React.useState<FileResult | null>(null);

  React.useEffect(() => {
    try {
      setInput(localStorage.getItem(INPUT_KEY) ?? SAMPLE);
      const m = localStorage.getItem(MODE_KEY); if (m === "encode" || m === "decode") setMode(m);
      const v = localStorage.getItem(VARIANT_KEY); if (v === "standard" || v === "url") setVariant(v);
    } catch { setInput(SAMPLE); }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(INPUT_KEY, input); localStorage.setItem(MODE_KEY, mode); localStorage.setItem(VARIANT_KEY, variant); } catch { /* noop */ } }, [input, mode, variant, mounted]);

  const deferred = React.useDeferredValue(input);
  const textResult = React.useMemo(() => {
    if (!deferred) return { ok: true as const, output: "" };
    if (mode === "encode") return { ok: true as const, output: encodeText(deferred, variant) };
    return decodeText(deferred, variant);
  }, [deferred, mode, variant]);

  const output = textResult.ok ? textResult.output : "";
  const inBytes = encodeUtf8(input).length;
  const outBytes = encodeUtf8(output).length;
  const delta = outBytes - inBytes;

  async function copy(value: string, label = "Copied") {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1200); toast.success(label); } catch { toast.error("Could not copy"); }
  }
  function swap() {
    if (!textResult.ok) return;
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  }
  function downloadOutput() {
    if (!textResult.ok || !output) return;
    downloadText(output, mode === "encode" ? "encoded.txt" : "decoded.txt", "text/plain");
  }

  async function loadFile(f: File) {
    const buf = await f.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const base64 = variant === "url" ? bytesToBase64Url(bytes) : bytesToBase64(bytes);
    const mime = f.type || "application/octet-stream";
    setFile({ name: f.name, bytes: f.size, mime, base64, dataUri: `data:${mime};base64,${variant === "url" ? bytesToBase64(bytes) : base64}` });
    toast.success(`Encoded ${f.name}`);
  }
  function downloadDecodedFile() {
    if (!textResult.ok || !output) return;
    try {
      const bytes = variant === "url" ? base64UrlToBytes(input.trim()) : base64ToBytes(input.trim().replace(/\s+/g, ""));
      const ab = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(ab).set(bytes);
      const blob = new Blob([ab], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "decoded.bin"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success("Downloaded");
    } catch { toast.error("Couldn't decode to a file"); }
  }

  const isImage = file?.mime.startsWith("image/");

  if (!mounted) return <div className="space-y-4" aria-hidden="true"><div className="h-24 animate-pulse rounded-3xl bg-muted" /><div className="h-72 animate-pulse rounded-2xl bg-muted" /></div>;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Base64 summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Input bytes" value={inBytes} reduceMotion={!!reduceMotion} />
          <Stat label="Output bytes" value={outBytes} reduceMotion={!!reduceMotion} />
          <Stat label={delta >= 0 ? "Added" : "Saved"} value={Math.abs(delta)} reduceMotion={!!reduceMotion} accent={delta > 0 ? "text-amber-300" : delta < 0 ? "text-emerald-300" : undefined} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-indigo-300/70">Variant</div>
            <div className="font-heading text-xl font-bold tracking-tight text-indigo-50 sm:text-2xl">{variant === "standard" ? "Standard" : "URL-safe"}</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1">
        <TabBtn active={tab === "text"} onClick={() => setTab("text")} label="Text" />
        <TabBtn active={tab === "file"} onClick={() => setTab("file")} label="File" />
      </div>

      {/* Toolbar */}
      {tab === "text" && (
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Mode">
            <SegBtn active={mode === "encode"} onClick={() => setMode("encode")} label="Encode" />
            <SegBtn active={mode === "decode"} onClick={() => setMode("decode")} label="Decode" />
          </div>
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Variant">
            <SegBtn active={variant === "standard"} onClick={() => setVariant("standard")} label="Standard" />
            <SegBtn active={variant === "url"} onClick={() => setVariant("url")} label="URL-safe" />
          </div>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <ToolBtn onClick={() => setInput(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
          <ToolBtn onClick={() => setInput("")} icon={<Eraser className="size-3.5" />} label="Clear" />
          <ToolBtn onClick={swap} icon={<ArrowLeftRight className="size-3.5" />} label="Swap" />
        </div>
      )}

      {tab === "text" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel label={mode === "encode" ? "Input text" : "Base64 input"} subtitle={`${inBytes.toLocaleString()} bytes`}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} spellCheck={false} aria-label="Input" placeholder={mode === "encode" ? "Type or paste text to encode…" : "Paste a Base64 string to decode…"} className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => copy(input, "Input copied")}><Copy className="size-4" />Copy input</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setInput("")}><Trash2 className="size-3.5" />Clear</Button>
            </div>
          </Panel>

          <Panel label={mode === "encode" ? "Base64 output" : "Decoded text"} subtitle={textResult.ok ? `${outBytes.toLocaleString()} bytes` : "error"}>
            {textResult.ok ? (
              <textarea value={output} readOnly rows={10} aria-label="Output" className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none" />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{textResult.error}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => copy(output, "Output copied")} disabled={!textResult.ok || !output}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}Copy output</Button>
              <Button type="button" size="sm" variant="outline" onClick={downloadOutput} disabled={!textResult.ok || !output}><Download className="size-4" />Download .txt</Button>
              {mode === "decode" && <Button type="button" size="sm" variant="outline" onClick={downloadDecodedFile} disabled={!textResult.ok}><Download className="size-4" />Download as file</Button>}
            </div>
          </Panel>
        </div>
      )}

      {tab === "file" && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Binary className="size-4 text-primary" />Encode a file to Base64</h2>
          <div
            className="rounded-xl border-2 border-dashed border-border bg-background p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
          >
            <FileUp className="mx-auto mb-2 size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop a file here, or</p>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
              <FileUp className="size-4" />Choose file
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            </label>
            <p className="mt-2 text-[11px] text-muted-foreground">Files are read in your browser — nothing is uploaded.</p>
          </div>
          {file && (
            <div className="space-y-3">
              <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3">
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Name</dt><dd className="break-all font-medium">{file.name}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Size</dt><dd className="font-medium">{file.bytes.toLocaleString()} bytes</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">MIME</dt><dd className="font-mono text-xs">{file.mime}</dd></div>
              </dl>
              {isImage && (
                <div className="rounded-lg border border-border/60 bg-background p-2"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Image aria-hidden className="size-3.5" />Preview from data URI</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.dataUri} alt="Decoded preview" className="mt-2 max-h-64 rounded" /></div>
              )}
              <Panel label="Base64" subtitle={`${file.base64.length.toLocaleString()} chars`}>
                <textarea value={file.base64} readOnly rows={6} className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-[11px] outline-none" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => copy(file.base64, "Base64 copied")}><Copy className="size-4" />Copy Base64</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => copy(file.dataUri, "Data URI copied")}><Copy className="size-4" />Copy data URI</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setFile(null)}><Trash2 className="size-3.5" />Clear</Button>
                </div>
              </Panel>
            </div>
          )}
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Encoding happens in your browser — Toollyz has no server.</p>
    </div>
  );
}

function Stat({ label, value, reduceMotion, accent }: { label: string; value: number; reduceMotion: boolean; accent?: string }) {
  return (<div className="space-y-1"><div className="text-xs font-medium text-indigo-300/70">{label}</div><div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div></div>);
}
function Panel({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border/70 bg-card p-4"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold tracking-tight">{label}</h2>{subtitle && <span className="text-xs text-muted-foreground tabular-nums">{subtitle}</span>}</div>{children}</section>;
}
function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{label}</button>;
}
function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{label}</button>;
}
function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted">{icon}{label}</button>;
}
