"use client";

import * as React from "react";
import {
  AlertTriangle,
  Camera,
  Copy,
  Download,
  Eraser,
  Image as ImageIcon,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_OPTIONS,
  SAMPLE_HTML,
  type ScreenshotOptions,
  renderHtmlToPng,
} from "@/lib/tools/text/html-screenshot";

const KEY = "toollyz:html-screenshot-html";
const OPT_KEY = "toollyz:html-screenshot-opt";

const SIZE_PRESETS = [
  { id: "og", label: "OG (1200×630)", width: 1200, height: 630 },
  { id: "twitter", label: "Twitter (1600×900)", width: 1600, height: 900 },
  { id: "square", label: "Square (1080×1080)", width: 1080, height: 1080 },
  { id: "hero", label: "Hero (1920×1080)", width: 1920, height: 1080 },
  { id: "blog", label: "Blog (1280×720)", width: 1280, height: 720 },
];

export default function WebsiteScreenshotGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [html, setHtml] = React.useState("");
  const [opt, setOpt] = React.useState<ScreenshotOptions>(DEFAULT_OPTIONS);
  const [rendering, setRendering] = React.useState(false);
  const [preview, setPreview] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    try {
      setHtml(localStorage.getItem(KEY) ?? SAMPLE_HTML);
      const raw = localStorage.getItem(OPT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ScreenshotOptions>;
        setOpt({ ...DEFAULT_OPTIONS, ...parsed });
      }
    } catch {
      setHtml(SAMPLE_HTML);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, html);
      localStorage.setItem(OPT_KEY, JSON.stringify(opt));
    } catch {
      /* noop */
    }
  }, [html, opt, mounted]);

  async function render() {
    setRendering(true);
    setError(undefined);
    try {
      const result = await renderHtmlToPng(html, opt);
      if (!result.ok) {
        setError(result.error ?? "Render failed.");
        toast.error("Render failed");
        return;
      }
      setPreview(result.dataUrl);
      toast.success("Rendered");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Render failed");
    } finally {
      setRendering(false);
    }
  }

  async function copyImage() {
    if (!preview) return;
    try {
      const res = await fetch(preview);
      const blob = await res.blob();
      if ("clipboard" in navigator && "write" in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("PNG copied");
      } else {
        throw new Error("ClipboardItem unsupported");
      }
    } catch {
      toast.error("Browser blocked clipboard image — use Download.");
    }
  }

  function download() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `screenshot-${opt.width}x${opt.height}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function update(patch: Partial<ScreenshotOptions>) {
    setOpt((prev) => ({ ...prev, ...patch }));
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setHtml(SAMPLE_HTML)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
        <button
          type="button"
          onClick={() => setHtml("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
        <Button type="button" size="sm" onClick={render} disabled={rendering}>
          <Camera className="size-3.5" />
          {rendering ? "Rendering…" : "Render"}
        </Button>
      </div>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-4">
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Width</div>
          <Input
            type="number"
            value={opt.width}
            onChange={(e) => update({ width: parseInt(e.target.value || "0", 10) })}
            min={64}
            max={4096}
            className="h-9 font-mono"
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Height</div>
          <Input
            type="number"
            value={opt.height}
            onChange={(e) => update({ height: parseInt(e.target.value || "0", 10) })}
            min={64}
            max={4096}
            className="h-9 font-mono"
          />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Scale</div>
          <select
            value={opt.scale}
            onChange={(e) => update({ scale: parseInt(e.target.value, 10) })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value={1}>1× (native)</option>
            <option value={2}>2× (retina)</option>
            <option value={3}>3× (super-retina)</option>
          </select>
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Background</div>
          <Input
            type="color"
            value={opt.background}
            onChange={(e) => update({ background: e.target.value })}
            className="h-9 w-full cursor-pointer"
          />
        </label>
        <div className="sm:col-span-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Size presets</div>
          <div className="flex flex-wrap gap-1.5">
            {SIZE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update({ width: p.width, height: p.height })}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium",
                  opt.width === p.width && opt.height === p.height
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ImageIcon className="size-4 text-primary" />
          HTML to render
        </h2>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={14}
          spellCheck={false}
          placeholder="Paste a complete HTML fragment with inline styles."
          className="w-full resize-y rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </section>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="mr-1 inline size-3.5" />
          {error}
        </div>
      )}

      {preview && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Preview</h2>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={copyImage}>
                <Copy className="size-3.5" />
                Copy PNG
              </Button>
              <Button type="button" size="sm" onClick={download}>
                <Download className="size-3.5" />
                Download
              </Button>
            </div>
          </div>
          <div className="overflow-auto rounded-xl border border-border/60 bg-muted/30 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Screenshot preview" className="mx-auto max-w-full" />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs text-sky-700 dark:text-sky-300">
        <h2 className="mb-1 flex items-center gap-1.5 font-semibold">
          <Info className="size-4" />
          Caveats of the foreignObject pipeline
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Inline styles only</strong> — external stylesheets and Google Fonts don't load (SVG is sandboxed). Use a <code className="font-mono">&lt;style&gt;</code> block inside your HTML for CSS.</li>
          <li><strong>Cross-origin images taint the canvas</strong> — Toollyz' PNG export then fails. Use data: URLs or same-origin assets.</li>
          <li><strong>JavaScript doesn't run</strong> — the SVG is paint-only. Hydrated UI states need to be inlined first.</li>
          <li><strong>Safari quirks</strong> — Safari &lt; 16 has bugs with foreignObject + transforms. Chrome / Firefox are reliable.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Rendering, canvas export and download all happen in your browser — Toollyz has no server.
      </p>
    </div>
  );
}
