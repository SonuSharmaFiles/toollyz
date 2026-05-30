"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Eraser,
  Info,
  Lock,
  Pencil,
  Redo2,
  RefreshCcw,
  Signature as SignatureIcon,
  Type,
  Undo2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const CANVAS_W = 1000;
const CANVAS_H = 360;
const SETTINGS_KEY = "toollyz:signature-settings";

interface DrawSettings {
  penColor: string;
  penWidth: number;
  backgroundColor: string; // "transparent" or hex
  trimWhitespace: boolean;
}

interface TypeSettings {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  italic: boolean;
  letterSpacing: number;
}

interface AllSettings {
  draw: DrawSettings;
  type: TypeSettings;
}

const FONT_OPTIONS: { value: string; label: string; sample: string }[] = [
  { value: "'Brush Script MT', 'Segoe Script', cursive", label: "Brush Script", sample: "Signature" },
  { value: "'Lucida Handwriting', 'Apple Chancery', cursive", label: "Lucida Handwriting", sample: "Signature" },
  { value: "'Snell Roundhand', 'Apple Chancery', cursive", label: "Snell Roundhand", sample: "Signature" },
  { value: "'Bradley Hand', 'Segoe Script', cursive", label: "Bradley Hand", sample: "Signature" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans (informal)", sample: "Signature" },
  { value: "cursive", label: "Generic cursive", sample: "Signature" },
];

const DEFAULTS: AllSettings = {
  draw: { penColor: "#0b1020", penWidth: 4, backgroundColor: "transparent", trimWhitespace: true },
  type: {
    text: "Your Name",
    fontFamily: FONT_OPTIONS[0].value,
    fontSize: 120,
    color: "#0b1020",
    italic: true,
    letterSpacing: 0,
  },
};

interface Stroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export default function SignatureGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<AllSettings>(DEFAULTS);
  const [tab, setTab] = React.useState<"draw" | "type">("draw");
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const redoRef = React.useRef<Stroke[]>([]);

  const drawCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const typeCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawingRef = React.useRef<Stroke | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<AllSettings>) });
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

  const redrawDraw = React.useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (settings.draw.backgroundColor !== "transparent") {
      ctx.fillStyle = settings.draw.backgroundColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokes) {
      drawStroke(ctx, s);
    }
    if (drawingRef.current) drawStroke(ctx, drawingRef.current);
  }, [strokes, settings.draw.backgroundColor]);

  React.useEffect(() => {
    if (tab === "draw") redrawDraw();
  }, [redrawDraw, tab]);

  React.useEffect(() => {
    if (tab !== "type") return;
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    const t = settings.type;
    const style = t.italic ? "italic" : "normal";
    ctx.font = `${style} ${t.fontSize}px ${t.fontFamily}`;
    ctx.fillStyle = t.color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    // letterSpacing is a CSS property; for canvas we can simulate by drawing
    // letter-by-letter if requested. Keep it simple if 0.
    if (t.letterSpacing === 0) {
      ctx.fillText(t.text, CANVAS_W / 2, CANVAS_H / 2);
    } else {
      const widths = [...t.text].map((ch) => ctx.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + t.letterSpacing * (t.text.length - 1);
      let x = (CANVAS_W - total) / 2;
      ctx.textAlign = "left";
      for (let i = 0; i < t.text.length; i++) {
        ctx.fillText(t.text[i], x, CANVAS_H / 2);
        x += widths[i] + t.letterSpacing;
      }
    }
  }, [tab, settings.type]);

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    return { x, y };
  }

  function onPenDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = getCanvasPoint(e);
    if (!p) return;
    drawingRef.current = {
      color: settings.draw.penColor,
      width: settings.draw.penWidth,
      points: [p],
    };
    redoRef.current = [];
    redrawDraw();
  }

  function onPenMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const p = getCanvasPoint(e);
    if (!p) return;
    drawingRef.current.points.push(p);
    redrawDraw();
  }

  function onPenUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    if (drawingRef.current.points.length >= 2) {
      setStrokes((prev) => [...prev, drawingRef.current!]);
    }
    drawingRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    redrawDraw();
  }

  function undo() {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    redoRef.current = [...redoRef.current, last];
    setStrokes((prev) => prev.slice(0, -1));
  }
  function redo() {
    if (redoRef.current.length === 0) return;
    const last = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    setStrokes((prev) => [...prev, last]);
  }
  function clearAll() {
    setStrokes([]);
    redoRef.current = [];
    drawingRef.current = null;
  }
  function reset() {
    clearAll();
    setSettings(DEFAULTS);
    toast.success("Reset");
  }

  function activeCanvas(): HTMLCanvasElement | null {
    return tab === "draw" ? drawCanvasRef.current : typeCanvasRef.current;
  }

  function trimAndExport(blob: (b: Blob | null) => void) {
    const canvas = activeCanvas();
    if (!canvas) return;
    const trim = tab === "draw" ? settings.draw.trimWhitespace : true;
    if (!trim) {
      canvas.toBlob((b) => blob(b), "image/png");
      return;
    }
    const out = trimCanvas(canvas);
    out.toBlob((b) => blob(b), "image/png");
  }

  function downloadPng() {
    if (tab === "type" && !settings.type.text.trim()) {
      toast.error("Type your name first");
      return;
    }
    if (tab === "draw" && strokes.length === 0) {
      toast.error("Draw something first");
      return;
    }
    trimAndExport((blob) => {
      if (!blob) {
        toast.error("Couldn't render the PNG");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signature.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded signature.png");
    });
  }

  async function copyDataUrl() {
    const canvas = activeCanvas();
    if (!canvas) return;
    try {
      const url = canvas.toDataURL("image/png");
      await navigator.clipboard.writeText(url);
      toast.success("Copied PNG data URL");
    } catch {
      toast.error("Couldn't copy data URL");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => v && setTab(v as "draw" | "type")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
          <TabsTrigger value="draw">
            <Pencil className="size-3.5" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type">
            <Type className="size-3.5" />
            Type
          </TabsTrigger>
        </TabsList>

        {/* DRAW */}
        <TabsContent value="draw" className="mt-4 space-y-4">
          <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border border-dashed border-border bg-[conic-gradient(at_50%_50%,_#f8f9fb,_#ffffff,_#f8f9fb)]",
                settings.draw.backgroundColor !== "transparent" && "bg-none",
              )}
              style={settings.draw.backgroundColor !== "transparent" ? { backgroundColor: settings.draw.backgroundColor } : undefined}
            >
              <canvas
                ref={drawCanvasRef}
                className="block aspect-[1000/360] w-full touch-none"
                onPointerDown={onPenDown}
                onPointerMove={onPenMove}
                onPointerUp={onPenUp}
                onPointerCancel={onPenUp}
                role="img"
                aria-label="Drawing canvas"
              />
              {strokes.length === 0 && !drawingRef.current && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                  Sign with your mouse, trackpad or finger
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={undo} disabled={strokes.length === 0}>
                <Undo2 className="size-3.5" />
                Undo
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={redo} disabled={redoRef.current.length === 0}>
                <Redo2 className="size-3.5" />
                Redo
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={clearAll} disabled={strokes.length === 0}>
                <Eraser className="size-3.5" />
                Clear
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                <RefreshCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pen color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.draw.penColor}
                  onChange={(e) => setSettings((s) => ({ ...s, draw: { ...s.draw, penColor: e.target.value } }))}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                  aria-label="Pen color"
                />
                <Input
                  value={settings.draw.penColor}
                  onChange={(e) => setSettings((s) => ({ ...s, draw: { ...s.draw, penColor: e.target.value } }))}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-medium">Pen width</Label>
                <span className="font-mono tabular-nums">{settings.draw.penWidth}px</span>
              </div>
              <Slider
                value={[settings.draw.penWidth]}
                onValueChange={(v) => setSettings((s) => ({ ...s, draw: { ...s.draw, penWidth: Array.isArray(v) ? v[0] : (v as number) } }))}
                min={1}
                max={24}
                step={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Background</Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, draw: { ...s.draw, backgroundColor: "transparent" } }))}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs",
                    settings.draw.backgroundColor === "transparent" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted",
                  )}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, draw: { ...s.draw, backgroundColor: "#ffffff" } }))}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs",
                    settings.draw.backgroundColor === "#ffffff" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted",
                  )}
                >
                  White
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={settings.draw.backgroundColor === "transparent" ? "#ffffff" : settings.draw.backgroundColor}
                    onChange={(e) => setSettings((s) => ({ ...s, draw: { ...s.draw, backgroundColor: e.target.value } }))}
                    className="h-7 w-9 cursor-pointer rounded border border-border p-1"
                    aria-label="Custom background color"
                  />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={settings.draw.trimWhitespace}
                onChange={(e) => setSettings((s) => ({ ...s, draw: { ...s.draw, trimWhitespace: e.target.checked } }))}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Trim empty whitespace before download</span>
            </label>
          </section>
        </TabsContent>

        {/* TYPE */}
        <TabsContent value="type" className="mt-4 space-y-4">
          <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
            <div className="overflow-hidden rounded-xl border border-dashed border-border bg-white">
              <canvas
                ref={typeCanvasRef}
                className="block aspect-[1000/360] w-full"
                role="img"
                aria-label="Typed signature preview"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fonts use system stacks — the rendered look depends on which cursive fonts your OS has installed.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="space-y-1.5">
              <Label htmlFor="sigText" className="text-xs font-medium">
                Name
              </Label>
              <Input
                id="sigText"
                value={settings.type.text}
                onChange={(e) => setSettings((s) => ({ ...s, type: { ...s.type, text: e.target.value } }))}
                placeholder="Your Name"
                className="text-lg"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Font</Label>
                <Select
                  value={settings.type.fontFamily}
                  onValueChange={(v) => v && setSettings((s) => ({ ...s, type: { ...s.type, fontFamily: v } }))}
                >
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <span style={{ fontFamily: f.value }}>{f.sample}</span>
                        <span className="ml-2 text-muted-foreground">· {f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-medium">Font size</Label>
                  <span className="font-mono tabular-nums">{settings.type.fontSize}px</span>
                </div>
                <Slider
                  value={[settings.type.fontSize]}
                  onValueChange={(v) => setSettings((s) => ({ ...s, type: { ...s.type, fontSize: Array.isArray(v) ? v[0] : (v as number) } }))}
                  min={40}
                  max={220}
                  step={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.type.color}
                    onChange={(e) => setSettings((s) => ({ ...s, type: { ...s.type, color: e.target.value } }))}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                    aria-label="Signature color"
                  />
                  <Input
                    value={settings.type.color}
                    onChange={(e) => setSettings((s) => ({ ...s, type: { ...s.type, color: e.target.value } }))}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-medium">Letter spacing</Label>
                  <span className="font-mono tabular-nums">{settings.type.letterSpacing}px</span>
                </div>
                <Slider
                  value={[settings.type.letterSpacing]}
                  onValueChange={(v) => setSettings((s) => ({ ...s, type: { ...s.type, letterSpacing: Array.isArray(v) ? v[0] : (v as number) } }))}
                  min={-10}
                  max={40}
                  step={1}
                />
              </div>
              <label className="flex items-center gap-2 self-end text-xs">
                <input
                  type="checkbox"
                  checked={settings.type.italic}
                  onChange={(e) => setSettings((s) => ({ ...s, type: { ...s.type, italic: e.target.checked } }))}
                  className="size-4 rounded border-border accent-primary"
                />
                <span>Italic</span>
              </label>
              <Button type="button" size="sm" variant="ghost" onClick={reset} className="justify-start">
                <RefreshCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      {/* Export */}
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SignatureIcon className="size-4 text-primary" />
          Export as transparent PNG · 1000 × 360 (trimmed)
        </div>
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={copyDataUrl}>
            <Copy className="size-4" />
            Copy data URL
          </Button>
          <Button type="button" size="sm" onClick={downloadPng}>
            <Download className="size-4" />
            Download PNG
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this signature
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <Pencil className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Draw mode supports mouse, trackpad and touch via Pointer Events — strokes are smoothed by the canvas&apos;s round line cap/join.
          </li>
          <li className="flex items-start gap-1.5">
            <Type className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Type mode uses system cursive fonts. Install Caveat / Pacifico locally for a more &quot;handwritten&quot; look if your OS doesn&apos;t ship one.
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            Export trims empty padding around the strokes (or text) for a crisp transparent PNG ready to paste into Word, Pages, email or a PDF.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no backend — your signature never leaves your device. Last settings saved to localStorage.
          </li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Rendered locally in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke): void {
  if (s.points.length === 0) return;
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.beginPath();
  if (s.points.length === 1) {
    const p = s.points[0];
    ctx.arc(p.x, p.y, s.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
    return;
  }
  ctx.moveTo(s.points[0].x, s.points[0].y);
  for (let i = 1; i < s.points.length - 1; i++) {
    const p = s.points[i];
    const next = s.points[i + 1];
    const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
    ctx.quadraticCurveTo(p.x, p.y, mid.x, mid.y);
  }
  const last = s.points[s.points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function trimCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = source.getContext("2d");
  if (!ctx) return source;
  const w = source.width;
  const h = source.height;
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0 || maxY < 0) return source;
    const pad = 16;
    const x0 = Math.max(0, minX - pad);
    const y0 = Math.max(0, minY - pad);
    const x1 = Math.min(w, maxX + pad);
    const y1 = Math.min(h, maxY + pad);
    const tw = x1 - x0;
    const th = y1 - y0;
    const out = document.createElement("canvas");
    out.width = tw;
    out.height = th;
    const oc = out.getContext("2d");
    if (!oc) return source;
    oc.drawImage(source, x0, y0, tw, th, 0, 0, tw, th);
    return out;
  } catch {
    // getImageData can fail on tainted canvases — fall back to the original.
    return source;
  }
}
