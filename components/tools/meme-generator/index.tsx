"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  Info,
  Lock,
  PartyPopper,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BLANK_TEMPLATES,
  DEFAULT_LAYER,
  FONT_OPTIONS,
  renderMeme,
  type BlankTemplate,
  type FontFamily,
  type TextLayer,
  type TextPosition,
} from "@/lib/tools/image/meme";

const SETTINGS_KEY = "toollyz:meme-settings";

interface SettingsState {
  templateId: string | null; // null = upload
  layers: TextLayer[];
  width: number;
  padding: number;
}

const DEFAULTS: SettingsState = {
  templateId: "indigo",
  layers: [DEFAULT_LAYER("top"), DEFAULT_LAYER("bottom")],
  width: 1080,
  padding: 32,
};

export default function MemeGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<SettingsState>(DEFAULTS);
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = React.useState<HTMLImageElement | null>(null);
  const [activeLayer, setActiveLayer] = React.useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsState;
        // Validate layers shape minimally before adopting
        if (parsed && Array.isArray(parsed.layers) && parsed.layers.length > 0) {
          setSettings({ ...DEFAULTS, ...parsed });
        }
      }
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
  }, [settings, mounted]);

  // (Re)render whenever any input changes.
  React.useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    const template = settings.templateId
      ? BLANK_TEMPLATES.find((t) => t.id === settings.templateId) ?? null
      : null;
    renderMeme({
      canvas: canvasRef.current,
      imageSource: uploadedImage,
      template,
      width: settings.width,
      layers: settings.layers,
      padding: settings.padding,
    });
  }, [mounted, settings, uploadedImage]);

  // Cleanup uploaded blob URL when it changes.
  React.useEffect(() => {
    return () => {
      if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    };
  }, [uploadedImageUrl]);

  function pickFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      toast.error("Pick an image file");
      return;
    }
    const url = URL.createObjectURL(f);
    setUploadedImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setUploadedImage(img);
      setSettings((s) => ({ ...s, templateId: null }));
      toast.success(`Loaded ${f.name}`);
    };
    img.onerror = () => {
      toast.error("Couldn't decode that image");
    };
    img.src = url;
  }

  function clearImage() {
    setUploadedImage(null);
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    setUploadedImageUrl(null);
    setSettings((s) => ({ ...s, templateId: "indigo" }));
  }

  function updateLayer(idx: number, patch: Partial<TextLayer>) {
    setSettings((s) => ({
      ...s,
      layers: s.layers.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));
  }

  function addLayer(position: TextPosition) {
    setSettings((s) => ({
      ...s,
      layers: [...s.layers, { ...DEFAULT_LAYER(position), text: "" }],
    }));
    setActiveLayer(settings.layers.length);
  }

  function removeLayer(idx: number) {
    if (settings.layers.length <= 1) {
      toast.error("Keep at least one text layer (you can clear its text).");
      return;
    }
    setSettings((s) => ({ ...s, layers: s.layers.filter((_, i) => i !== idx) }));
    setActiveLayer((a) => Math.max(0, Math.min(a, settings.layers.length - 2)));
  }

  function reset() {
    setSettings(DEFAULTS);
    clearImage();
  }

  function downloadPng() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        toast.error("Couldn't render the PNG");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "toollyz-meme.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded toollyz-meme.png");
    }, "image/png");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const active = settings.layers[activeLayer] ?? settings.layers[0];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <section
        aria-label="Meme preview"
        className="space-y-2 rounded-3xl border border-white/10 bg-[#0b1020] p-4 sm:p-5"
      >
        <div className="overflow-hidden rounded-2xl bg-white/5">
          <canvas
            ref={canvasRef}
            className="block h-auto w-full"
            role="img"
            aria-label="Meme canvas preview"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-300/70">
          <span>
            {settings.width}px wide · {canvasRef.current?.width ?? 0} × {canvasRef.current?.height ?? 0}
          </span>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={downloadPng}>
              <Download className="size-4" />
              Download PNG
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Image source */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Image
        </h2>
        <div
          className="rounded-2xl border-2 border-dashed border-border bg-card/60 p-5 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) pickFiles(e.dataTransfer.files);
          }}
        >
          <FileUp className="mx-auto mb-1 size-7 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Drop a JPG / PNG / WebP, or</p>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
            <FileUp className="size-4" />
            Choose image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                pickFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {uploadedImage && (
            <div className="mt-3 text-[11px] text-muted-foreground">
              Loaded image · {uploadedImage.naturalWidth} × {uploadedImage.naturalHeight} —{" "}
              <button type="button" onClick={clearImage} className="underline-offset-4 hover:underline">
                clear
              </button>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Or pick a blank template</Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {BLANK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  clearImage();
                  setSettings((s) => ({ ...s, templateId: t.id }));
                }}
                className={cn(
                  "overflow-hidden rounded-lg border ring-offset-background hover:ring-2 hover:ring-primary",
                  settings.templateId === t.id ? "border-primary ring-2 ring-primary" : "border-border",
                )}
                title={t.label}
              >
                <TemplateThumb template={t} />
                <div className="px-2 py-1 text-[10px] font-medium">{t.label}</div>
              </button>
            ))}
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 size-3 shrink-0" />
            Blank templates are simple backgrounds — Toollyz doesn&apos;t bundle copyrighted meme templates. Upload your own image for real memes.
          </p>
        </div>
      </section>

      {/* Layers */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Type className="size-4 text-primary" />
            Text layers
          </h2>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => addLayer("middle")}>
              <Plus className="size-3.5" />
              Layer
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {settings.layers.map((l, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveLayer(i)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                activeLayer === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground/80 hover:bg-muted",
              )}
            >
              {l.position} · {l.text ? truncate(l.allCaps ? l.text.toUpperCase() : l.text, 20) : "(empty)"}
            </button>
          ))}
        </div>

        {active && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Textarea
                value={active.text}
                onChange={(e) => updateLayer(activeLayer, { text: e.target.value })}
                placeholder="Type your meme text…"
                className="min-h-[72px] font-mono"
              />
              <div className="flex flex-col gap-1.5 sm:w-44">
                <Select value={active.position} onValueChange={(v) => v && updateLayer(activeLayer, { position: v as TextPosition })}>
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={active.align} onValueChange={(v) => v && updateLayer(activeLayer, { align: v as TextLayer["align"] })}>
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Align left</SelectItem>
                    <SelectItem value="center">Align center</SelectItem>
                    <SelectItem value="right">Align right</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeLayer(activeLayer)}>
                  <Trash2 className="size-3.5" />
                  Remove layer
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Font</Label>
                <Select value={active.fontFamily} onValueChange={(v) => v && updateLayer(activeLayer, { fontFamily: v as FontFamily })}>
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
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-medium">Font size</Label>
                  <span className="font-mono tabular-nums">{active.fontSize}px</span>
                </div>
                <Slider
                  value={[active.fontSize]}
                  onValueChange={(v) => updateLayer(activeLayer, { fontSize: Array.isArray(v) ? v[0] : (v as number) })}
                  min={20}
                  max={160}
                  step={1}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Fill color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={active.color}
                    onChange={(e) => updateLayer(activeLayer, { color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                    aria-label="Fill color"
                  />
                  <Input
                    value={active.color}
                    onChange={(e) => updateLayer(activeLayer, { color: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Stroke color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={active.strokeColor}
                    onChange={(e) => updateLayer(activeLayer, { strokeColor: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                    aria-label="Stroke color"
                  />
                  <Input
                    value={active.strokeColor}
                    onChange={(e) => updateLayer(activeLayer, { strokeColor: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-medium">Stroke width</Label>
                  <span className="font-mono tabular-nums">{active.strokeWidth}px</span>
                </div>
                <Slider
                  value={[active.strokeWidth]}
                  onValueChange={(v) => updateLayer(activeLayer, { strokeWidth: Array.isArray(v) ? v[0] : (v as number) })}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
              <label className="flex items-center gap-2 self-end text-xs">
                <input
                  type="checkbox"
                  checked={active.allCaps}
                  onChange={(e) => updateLayer(activeLayer, { allCaps: e.target.checked })}
                  className="size-4 rounded border-border accent-primary"
                />
                <span>Uppercase (classic meme style)</span>
              </label>
            </div>
          </div>
        )}

        {/* Canvas-level controls */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Label className="font-medium">Canvas width</Label>
              <span className="font-mono tabular-nums">{settings.width}px</span>
            </div>
            <Slider
              value={[settings.width]}
              onValueChange={(v) => setSettings((s) => ({ ...s, width: Array.isArray(v) ? v[0] : (v as number) }))}
              min={480}
              max={2048}
              step={20}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Label className="font-medium">Padding</Label>
              <span className="font-mono tabular-nums">{settings.padding}px</span>
            </div>
            <Slider
              value={[settings.padding]}
              onValueChange={(v) => setSettings((s) => ({ ...s, padding: Array.isArray(v) ? v[0] : (v as number) }))}
              min={0}
              max={120}
              step={2}
            />
          </div>
        </div>
      </section>

      {/* Caveats */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this generator
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <PartyPopper className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Built-in templates are simple coloured backgrounds, not copyrighted memes. Upload your own image to make a meme from a real template.
          </li>
          <li className="flex items-start gap-1.5">
            <Type className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Fonts use system stacks (Impact, Arial Black, Helvetica, Comic Sans, Georgia, Courier). The look depends on which fonts your OS has installed.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            Long lines wrap automatically inside the padded canvas. Add an inner padding to keep text away from the edges.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no backend — rendering happens entirely in your browser. The last setup is saved to localStorage.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Memes are rendered locally — your image never leaves your device.
      </p>

      {!("toBlob" in HTMLCanvasElement.prototype) && (
        <p className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
          This browser can&apos;t export PNGs from a canvas — try a modern Chromium, Firefox or Safari build.
        </p>
      )}
    </div>
  );
}

function TemplateThumb({ template }: { template: BlankTemplate }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 120;
    c.height = Math.round(120 / template.aspect);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    template.paint(ctx, c.width, c.height);
  }, [template]);
  return <canvas ref={ref} className="block h-14 w-full" />;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
