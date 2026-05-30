"use client";

import * as React from "react";
import {
  CheckCircle2,
  Code,
  Copy,
  Download,
  ImagePlus,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FAVICON_SIZES,
  FONT_OPTIONS,
  buildIco,
  htmlSnippet,
  renderToBlob,
  renderToCanvas,
  type FaviconOptions,
  type ShapeId,
} from "@/lib/tools/favicon/favicon";

const STORAGE_KEY = "toollyz:favicon-settings";

const DEFAULT_OPTIONS: FaviconOptions = {
  text: "T",
  background: "#6366F1",
  textColor: "#ffffff",
  shape: "rounded",
  fontFamily: FONT_OPTIONS[0].value,
  bold: true,
  italic: false,
};

const PREVIEW_SIZES = [16, 32, 48, 64, 180];

export default function FaviconFromText() {
  const [mounted, setMounted] = React.useState(false);
  const [opts, setOpts] = React.useState<FaviconOptions>(DEFAULT_OPTIONS);
  const [siteName, setSiteName] = React.useState("Your Site");
  const previewRefs = React.useRef<Record<number, HTMLCanvasElement | null>>({});
  const bigCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOpts({ ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<FaviconOptions>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
    } catch {
      /* noop */
    }
  }, [opts, mounted]);

  // Re-render all preview canvases when opts change.
  React.useEffect(() => {
    if (!mounted) return;
    for (const size of PREVIEW_SIZES) {
      const c = previewRefs.current[size];
      if (c) renderToCanvas(c, size, opts);
    }
    if (bigCanvasRef.current) renderToCanvas(bigCanvasRef.current, 512, opts);
  }, [mounted, opts]);

  function patch<K extends keyof FaviconOptions>(k: K, v: FaviconOptions[K]) {
    setOpts((o) => ({ ...o, [k]: v }));
  }

  async function downloadPng(size: number) {
    const blob = await renderToBlob(size, opts);
    saveBlob(blob, `favicon-${size}x${size}.png`);
    toast.success(`Saved favicon-${size}x${size}.png`);
  }

  async function downloadAllPng() {
    for (const size of FAVICON_SIZES) {
      const blob = await renderToBlob(size, opts);
      saveBlob(blob, `favicon-${size}x${size}.png`);
      await new Promise((r) => setTimeout(r, 80));
    }
    toast.success(`Saved ${FAVICON_SIZES.length} PNGs`);
  }

  async function downloadIco() {
    const blob = await buildIco(opts, [16, 32, 48]);
    saveBlob(blob, "favicon.ico");
    toast.success("Saved favicon.ico (16/32/48)");
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(htmlSnippet(siteName));
      toast.success("HTML snippet copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function reset() {
    setOpts(DEFAULT_OPTIONS);
    toast.success("Reset to defaults");
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
      {/* Big preview + multi-size strip */}
      <section className="grid items-center gap-4 rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex justify-center">
          <canvas
            ref={(el) => {
              bigCanvasRef.current = el;
              if (el) renderToCanvas(el, 512, opts);
            }}
            className="block size-40 rounded-lg bg-white/5 sm:size-52"
            aria-label="Favicon preview"
          />
        </div>
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-indigo-300/80">Live at every size</div>
          <div className="flex flex-wrap items-end gap-3">
            {PREVIEW_SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <canvas
                  ref={(el) => {
                    previewRefs.current[size] = el;
                    if (el) renderToCanvas(el, size, opts);
                  }}
                  width={size}
                  height={size}
                  className="rounded bg-white/5"
                  style={{ width: size, height: size }}
                />
                <span className="text-[10px] text-indigo-200/70">{size}px</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ImagePlus className="size-4 text-primary" />
          Favicon content
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <Field label="Text (letter, digits or emoji — 1-3 chars works best)">
            <Input
              value={opts.text}
              onChange={(e) => patch("text", e.target.value.slice(0, 4))}
              maxLength={4}
              className="text-lg"
            />
          </Field>
          <Field label="Shape">
            <Select value={opts.shape} onValueChange={(v) => v && patch("shape", v as ShapeId)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded">Rounded square</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Background colour">
            <ColorRow value={opts.background} onChange={(v) => patch("background", v)} />
          </Field>
          <Field label="Text colour">
            <ColorRow value={opts.textColor} onChange={(v) => patch("textColor", v)} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
          <Field label="Font">
            <Select value={opts.fontFamily} onValueChange={(v) => v && patch("fontFamily", v)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <label className="flex items-center gap-2 self-end rounded-lg border border-border/60 bg-background p-2 text-xs cursor-pointer">
            <input type="checkbox" checked={opts.bold} onChange={(e) => patch("bold", e.target.checked)} className="size-4 rounded border-border accent-primary" />
            Bold
          </label>
          <label className="flex items-center gap-2 self-end rounded-lg border border-border/60 bg-background p-2 text-xs cursor-pointer">
            <input type="checkbox" checked={opts.italic} onChange={(e) => patch("italic", e.target.checked)} className="size-4 rounded border-border accent-primary" />
            Italic
          </label>
        </div>
      </section>

      {/* Downloads */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Download className="size-4 text-primary" />
          Export
        </h2>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" onClick={downloadIco}>
            <Download className="size-3.5" />
            favicon.ico (16+32+48)
          </Button>
          <Button type="button" variant="outline" onClick={downloadAllPng}>
            <Download className="size-3.5" />
            All PNG sizes
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {FAVICON_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => downloadPng(s)}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono hover:bg-muted"
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </section>

      {/* HTML snippet */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Code className="size-4 text-primary" />
          HTML snippet
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="Site name (used in the apple-mobile-web-app-title meta)">
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </Field>
          <div className="self-end">
            <Button type="button" size="sm" variant="outline" onClick={copySnippet}>
              <Copy className="size-3.5" />
              Copy snippet
            </Button>
          </div>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-[11px]">
          <code>{htmlSnippet(siteName)}</code>
        </pre>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Favicons are rendered on a 512×512 canvas and downsampled to the requested size via the browser&apos;s native scaler — crisp at every standard step.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />The .ico file embeds the three classic sizes (16, 32, 48) as PNG payloads — Vista+ accepts this; very old Windows may need legacy BMP-format ICOs.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Emoji rendering depends on your OS&apos;s emoji font — Mac and Windows use multi-colour fonts; some Linux distros may not.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every byte stays in your browser. Settings save to localStorage on this device only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Generated entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className={cn("font-mono")} />
    </div>
  );
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
