"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Clock,
  Copy,
  Dices,
  Download,
  Frame,
  Image as ImageIcon,
  Images,
  Maximize2,
  Minus,
  Plus,
  Shuffle,
  Sparkles,
  Square,
  Trash2,
  Type,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FILL_CHARS,
  FRAME_STYLES,
  GALLERY,
  RAMPS,
  RAMP_BY_ID,
  STYLE_BY_ID,
  TEXT_STYLES,
  applyBrightnessContrast,
  asciiToSvg,
  escapeHtml,
  gridToText,
  makeFrame,
  pixelsToAscii,
  type TextStyle,
} from "@/lib/tools/ascii/ascii-art";

const SETTINGS_KEY = "toollyz:ascii-settings";
const HISTORY_KEY = "toollyz:ascii-history";

type Tab = "text" | "image" | "frames";

const FONT_FAMILIES: { id: string; label: string; css: string }[] = [
  { id: "sans", label: "Sans", css: "Arial, Helvetica, sans-serif" },
  { id: "rounded", label: "Rounded", css: "'Trebuchet MS', Verdana, sans-serif" },
  { id: "serif", label: "Serif", css: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Mono", css: "'Courier New', monospace" },
  { id: "impact", label: "Impact", css: "Impact, 'Arial Black', sans-serif" },
];

const FG_PRESETS = [
  { id: "green", label: "Matrix", color: "#22c55e" },
  { id: "cyan", label: "Cyan", color: "#22d3ee" },
  { id: "amber", label: "Amber", color: "#fbbf24" },
  { id: "magenta", label: "Neon", color: "#e879f9" },
  { id: "white", label: "White", color: "#e2e8f0" },
];

interface HistoryItem { id: string; label: string; ascii: string }

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Canvas rasterisation (client-only) ──
function textLineToGrid(text: string, heightRows: number, family: string): boolean[][] {
  if (typeof document === "undefined" || !text) return [];
  const px = 100;
  const canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  if (!ctx) return [];
  const font = `bold ${px}px ${family}`;
  ctx.font = font;
  const w = Math.max(1, Math.ceil(ctx.measureText(text).width) + 24);
  const h = Math.ceil(px * 1.35);
  canvas.width = w;
  canvas.height = h;
  ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const cols = Math.max(1, Math.min(240, Math.round((heightRows * (w / h)) / 0.55)));
  const cellW = w / cols;
  const cellH = h / heightRows;
  const grid: boolean[][] = [];
  for (let r = 0; r < heightRows; r++) {
    const row: boolean[] = [];
    const y0 = Math.floor(r * cellH);
    const y1 = Math.min(h, Math.ceil((r + 1) * cellH));
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cellW);
      const x1 = Math.min(w, Math.ceil((c + 1) * cellW));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y += 2)
        for (let x = x0; x < x1; x += 2) {
          sum += data[(y * w + x) * 4];
          count++;
        }
      row.push(count > 0 && sum / count > 60);
    }
    grid.push(row);
  }
  return grid;
}

function renderTextArt(text: string, style: TextStyle, fill: string, heightRows: number, family: string): string {
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : gridToText(textLineToGrid(line, heightRows, family), style, fill)))
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

interface ImageResult { ascii: string; colorGrid: string[][] | null }
function imageToAscii(
  img: HTMLImageElement,
  opts: { width: number; ramp: string; invert: boolean; brightness: number; contrast: number; color: boolean },
): ImageResult {
  const cols = opts.width;
  const rows = Math.max(1, Math.round(cols * (img.naturalHeight / img.naturalWidth) * 0.5));
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const lum: number[][] = [];
  const colorGrid: string[][] | null = opts.color ? [] : null;
  for (let r = 0; r < rows; r++) {
    const lrow: number[] = [];
    const crow: string[] = [];
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4;
      const R = data[i], G = data[i + 1], B = data[i + 2], A = data[i + 3];
      let g = A < 128 ? 255 : 0.299 * R + 0.587 * G + 0.114 * B;
      g = applyBrightnessContrast(g, opts.brightness, opts.contrast);
      lrow.push(g);
      if (colorGrid) crow.push(`rgb(${R} ${G} ${B})`);
    }
    lum.push(lrow);
    if (colorGrid) colorGrid.push(crow);
  }
  return { ascii: pixelsToAscii(lum, opts.ramp, opts.invert), colorGrid };
}

export default function AsciiArtGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("text");

  // text
  const [text, setText] = React.useState("Toollyz");
  const [styleId, setStyleId] = React.useState("block");
  const [fill, setFill] = React.useState("");
  const [family, setFamily] = React.useState("sans");
  const [height, setHeight] = React.useState(8);
  const [styleCat, setStyleCat] = React.useState<"All" | TextStyle["category"]>("All");

  // image
  const [imgSrc, setImgSrc] = React.useState("");
  const [imgEl, setImgEl] = React.useState<HTMLImageElement | null>(null);
  const [imgUrl, setImgUrl] = React.useState("");
  const [width, setWidth] = React.useState(80);
  const [rampId, setRampId] = React.useState("standard");
  const [customRamp, setCustomRamp] = React.useState("");
  const [invert, setInvert] = React.useState(false);
  const [brightness, setBrightness] = React.useState(0);
  const [contrast, setContrast] = React.useState(0);
  const [color, setColor] = React.useState(false);

  // frames
  const [frameText, setFrameText] = React.useState("Hello\nToollyz");
  const [frameStyleId, setFrameStyleId] = React.useState("double");
  const [padding, setPadding] = React.useState(1);

  // preview / shared
  const [zoom, setZoom] = React.useState(13);
  const [fg, setFg] = React.useState("#22d3ee");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [dragOver, setDragOver] = React.useState(false);

  React.useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (p.styleId && STYLE_BY_ID[p.styleId]) setStyleId(p.styleId);
        if (p.family) setFamily(p.family);
        if (p.fg) setFg(p.fg);
        if (typeof p.height === "number") setHeight(p.height);
      }
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch { /* noop */ }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ styleId, family, fg, height })); } catch { /* noop */ }
  }, [styleId, family, fg, height, mounted]);

  // image loading
  React.useEffect(() => {
    if (!imgSrc) { setImgEl(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImgEl(img);
    img.onerror = () => toast.error("Couldn't load image (CORS-blocked URLs won't work — upload instead).");
    img.src = imgSrc;
  }, [imgSrc]);

  const deferredText = React.useDeferredValue(text);
  const style = STYLE_BY_ID[styleId] ?? TEXT_STYLES[0];
  const familyCss = FONT_FAMILIES.find((f) => f.id === family)?.css ?? FONT_FAMILIES[0].css;
  const rampChars = customRamp.trim().length >= 2 ? customRamp : RAMP_BY_ID[rampId].chars;

  const textArt = React.useMemo(
    () => (mounted ? renderTextArt(deferredText, style, fill, height, familyCss) : ""),
    [mounted, deferredText, style, fill, height, familyCss],
  );
  const imageResult = React.useMemo(
    () => (mounted && imgEl ? imageToAscii(imgEl, { width, ramp: rampChars, invert, brightness, contrast, color }) : null),
    [mounted, imgEl, width, rampChars, invert, brightness, contrast, color],
  );
  const frameArt = React.useMemo(
    () => makeFrame(frameText, FRAME_STYLES.find((f) => f.id === frameStyleId) ?? FRAME_STYLES[0], padding),
    [frameText, frameStyleId, padding],
  );

  // style gallery previews (fixed sample, computed once)
  const stylePreviews = React.useMemo(() => {
    if (!mounted) return {} as Record<string, string>;
    const out: Record<string, string> = {};
    for (const s of TEXT_STYLES) out[s.id] = renderTextArt("Aa", s, "", 5, familyCss);
    return out;
  }, [mounted, familyCss]);

  const output = tab === "text" ? textArt : tab === "image" ? imageResult?.ascii ?? "" : frameArt;
  const colorGrid = tab === "image" ? imageResult?.colorGrid ?? null : null;

  function persistHistory(next: HistoryItem[]) {
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }
  function saveArt() {
    if (!output.trim()) { toast.error("Nothing to save"); return; }
    const label = tab === "text" ? text.slice(0, 24) : tab === "frames" ? frameText.split("\n")[0].slice(0, 24) : "Image art";
    persistHistory([{ id: uid(), label: label || "Untitled", ascii: output }, ...history].slice(0, 24));
    toast.success("Saved to history");
  }

  async function copyOut(value = output) {
    if (!value.trim()) { toast.error("Nothing to copy"); return; }
    try { await navigator.clipboard.writeText(value); toast.success("Copied"); } catch { toast.error("Could not copy"); }
  }

  function colorHtml(): string {
    if (colorGrid) {
      const lines = output.split("\n");
      return lines
        .map((line, r) => [...line].map((ch, c) => `<span style="color:${colorGrid[r]?.[c] ?? fg}">${escapeHtml(ch)}</span>`).join(""))
        .join("\n");
    }
    return `<span style="color:${fg}">${escapeHtml(output)}</span>`;
  }
  function exportHtml() {
    if (!output.trim()) { toast.error("Nothing to export"); return; }
    const doc = `<!doctype html><meta charset="utf-8"><title>ASCII art</title><pre style="font:14px/1.1 ui-monospace,Menlo,Consolas,monospace;background:#0b1020;padding:20px;color:${fg};white-space:pre">${colorHtml()}</pre>`;
    downloadBlob(doc, "ascii-art.html", "text/html;charset=utf-8");
    toast.success("Exported HTML");
  }
  function exportSvg() {
    if (!output.trim()) { toast.error("Nothing to export"); return; }
    downloadBlob(asciiToSvg(output, { fg, bg: "#0b1020", fontSize: 14 }), "ascii-art.svg", "image/svg+xml");
    toast.success("Exported SVG");
  }
  function exportPng() {
    if (!output.trim()) { toast.error("Nothing to export"); return; }
    const lines = output.split("\n");
    const cols = Math.max(...lines.map((l) => [...l].length), 1);
    const fs = 14;
    const cw = fs * 0.6;
    const lh = fs * 1.15;
    const scale = 2;
    const W = Math.ceil(cols * cw + 24);
    const H = Math.ceil(lines.length * lh + 24);
    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${fs}px ui-monospace, Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    lines.forEach((line, r) => {
      const y = 12 + r * lh;
      if (colorGrid) {
        [...line].forEach((ch, c) => {
          ctx.fillStyle = colorGrid[r]?.[c] ?? fg;
          ctx.fillText(ch, 12 + c * cw, y);
        });
      } else {
        ctx.fillStyle = fg;
        ctx.fillText(line, 12, y);
      }
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, "ascii-art.png", "image/png");
      toast.success("Exported PNG");
    }, "image/png");
  }
  function exportTxt() {
    if (!output.trim()) { toast.error("Nothing to export"); return; }
    downloadBlob(output, "ascii-art.txt", "text/plain;charset=utf-8");
    toast.success("Exported TXT");
  }

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImgSrc(String(reader.result)); setTab("image"); };
    reader.readAsDataURL(file);
  }
  function randomStyle() {
    const s = TEXT_STYLES[Math.floor(Math.random() * TEXT_STYLES.length)];
    const f = FILL_CHARS[Math.floor(Math.random() * FILL_CHARS.length)];
    setStyleId(s.id);
    setFill(s.mode === "fill" ? f : "");
    toast.success(`${s.label} style`);
  }

  const galleryStyles = styleCat === "All" ? TEXT_STYLES : TEXT_STYLES.filter((s) => s.category === styleCat);
  const lineCount = output ? output.split("\n").length : 0;
  const charCount = output.length;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const previewBlock = (
    <PreviewPane
      output={output}
      colorGrid={colorGrid}
      fg={fg}
      zoom={zoom}
      reduceMotion={!!reduceMotion}
      colorHtml={colorGrid ? colorHtml() : null}
    />
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="ASCII output summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_90%_120%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat label="Lines" value={lineCount} reduceMotion={!!reduceMotion} />
          <HeroStat label="Characters" value={charCount} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-cyan-300/70">Mode</div>
            <div className="font-heading text-xl font-bold capitalize text-cyan-50 sm:text-2xl">{tab}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-cyan-300/70">Style</div>
            <div className="truncate font-heading text-xl font-bold text-cyan-50 sm:text-2xl">{tab === "text" ? style.label : tab === "frames" ? "Frame" : "Image"}</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-card p-1.5">
        <TabBtn active={tab === "text"} onClick={() => setTab("text")} icon={<Type className="size-4" />} label="Text" />
        <TabBtn active={tab === "image"} onClick={() => setTab("image")} icon={<ImageIcon className="size-4" />} label="Image" />
        <TabBtn active={tab === "frames"} onClick={() => setTab("frames")} icon={<Frame className="size-4" />} label="Frames" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* Controls */}
        <div className="space-y-4">
          {tab === "text" && (
            <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
              <div className="space-y-1.5">
                <Label>Your text</Label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Type a word or name…" aria-label="Text to convert" className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={randomStyle}><Dices className="size-4" />Random style</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setText("Toollyz"); setStyleId("block"); setFill(""); }}><Shuffle className="size-4" />Reset</Button>
              </div>
              <div className="space-y-1.5">
                <Label>Font family</Label>
                <div className="grid grid-cols-3 gap-1">
                  {FONT_FAMILIES.map((f) => (
                    <SegBtn key={f.id} active={family === f.id} onClick={() => setFamily(f.id)} label={f.label} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Height · {height} rows</Label>
                <input type="range" min={5} max={14} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-primary" aria-label="Height" />
              </div>
              <div className="space-y-1.5">
                <Label>Fill character</Label>
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => setFill("")} className={cn("grid h-8 w-9 place-items-center rounded-md border font-mono text-sm", fill === "" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted")} title="Style default">Aa</button>
                  {FILL_CHARS.map((ch) => (
                    <button key={ch} type="button" onClick={() => setFill(ch)} className={cn("grid h-8 w-9 place-items-center rounded-md border font-mono text-base", fill === ch ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted")}>{ch}</button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "image" && (
            <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
                className={cn("grid place-items-center rounded-xl border-2 border-dashed p-6 text-center transition-colors", dragOver ? "border-primary bg-primary/5" : "border-border")}
              >
                <Upload className="mb-2 size-6 text-muted-foreground" />
                <p className="text-sm font-medium">Drag &amp; drop an image</p>
                <p className="mb-2 text-xs text-muted-foreground">PNG, JPG, WEBP, GIF</p>
                <label className="cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
                  Browse
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
                </label>
              </div>
              <div className="flex gap-2">
                <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="…or paste image URL" className="h-9 rounded-lg text-sm" aria-label="Image URL" />
                <Button type="button" size="sm" variant="outline" onClick={() => imgUrl.trim() && setImgSrc(imgUrl.trim())}>Load</Button>
              </div>
              {imgSrc && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc} alt="source" className="size-12 rounded-lg border border-border object-cover" />
                  <span className="text-xs text-muted-foreground">Source image</span>
                  <button type="button" onClick={() => { setImgSrc(""); setImgUrl(""); }} className="ml-auto text-muted-foreground hover:text-rose-500"><X className="size-4" /></button>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Width · {width} chars</Label>
                <input type="range" min={30} max={200} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-primary" aria-label="Width" />
              </div>
              <div className="space-y-1.5">
                <Label>Character set</Label>
                <div className="grid grid-cols-2 gap-1">
                  {RAMPS.map((r) => (
                    <SegBtn key={r.id} active={!customRamp.trim() && rampId === r.id} onClick={() => { setCustomRamp(""); setRampId(r.id); }} label={r.label} />
                  ))}
                </div>
                <Input value={customRamp} onChange={(e) => setCustomRamp(e.target.value)} placeholder="Custom set (dark→light)" className="mt-1 h-8 rounded-lg font-mono text-xs" aria-label="Custom character set" />
              </div>
              <div className="space-y-1.5">
                <Label>Brightness · {brightness}</Label>
                <input type="range" min={-100} max={100} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-primary" aria-label="Brightness" />
              </div>
              <div className="space-y-1.5">
                <Label>Contrast · {contrast}</Label>
                <input type="range" min={-100} max={100} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-primary" aria-label="Contrast" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Toggle active={invert} onClick={() => setInvert((v) => !v)} label="Invert" />
                <Toggle active={color} onClick={() => setColor((v) => !v)} label="Color mode" />
              </div>
            </section>
          )}

          {tab === "frames" && (
            <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
              <div className="space-y-1.5">
                <Label>Text inside frame</Label>
                <textarea value={frameText} onChange={(e) => setFrameText(e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" aria-label="Frame text" />
              </div>
              <div className="space-y-1.5">
                <Label>Border style</Label>
                <div className="grid grid-cols-2 gap-1">
                  {FRAME_STYLES.map((f) => (
                    <SegBtn key={f.id} active={frameStyleId === f.id} onClick={() => setFrameStyleId(f.id)} label={`${f.tl}${f.h}${f.tr} ${f.label}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Padding · {padding}</Label>
                <input type="range" min={0} max={4} value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-primary" aria-label="Padding" />
              </div>
            </section>
          )}

          {/* Terminal color (preview) */}
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <Label>Terminal color</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FG_PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => setFg(p.color)} aria-label={p.label} className={cn("size-7 rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110", fg === p.color && "ring-2 ring-foreground")} style={{ background: p.color }} />
              ))}
              {color && tab === "image" && <span className="self-center text-[11px] text-muted-foreground">Using image colors</span>}
            </div>
          </section>
        </div>

        {/* Preview + export */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-auto flex items-center gap-1">
              <button type="button" onClick={() => setZoom((z) => Math.max(7, z - 1))} aria-label="Zoom out" className="grid size-8 place-items-center rounded-lg border border-border bg-card hover:bg-muted"><Minus className="size-4" /></button>
              <span className="w-10 text-center text-xs tabular-nums text-muted-foreground"><ZoomIn className="mr-0.5 inline size-3" />{zoom}</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(28, z + 1))} aria-label="Zoom in" className="grid size-8 place-items-center rounded-lg border border-border bg-card hover:bg-muted"><Plus className="size-4" /></button>
              <button type="button" onClick={() => setFullscreen(true)} aria-label="Fullscreen" className="ml-1 grid size-8 place-items-center rounded-lg border border-border bg-card hover:bg-muted"><Maximize2 className="size-4" /></button>
            </div>
            <Button type="button" size="sm" onClick={() => copyOut()}><Copy className="size-4" />Copy</Button>
            <Button type="button" size="sm" variant="outline" onClick={saveArt}><Square className="size-4" />Save</Button>
          </div>

          {previewBlock}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={exportTxt}><Download className="size-4" />TXT</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportPng}><ImageIcon className="size-4" />PNG</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportSvg}><Download className="size-4" />SVG</Button>
            <Button type="button" variant="outline" size="sm" onClick={exportHtml}><Download className="size-4" />HTML</Button>
          </div>

          {/* Style gallery (text mode) */}
          {tab === "text" && (
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Sparkles className="size-4 text-primary" />Style gallery</h2>
                <div className="flex gap-1">
                  {(["All", "Solid", "Outline", "Effect"] as const).map((cat) => (
                    <SegBtn key={cat} active={styleCat === cat} onClick={() => setStyleCat(cat)} label={cat} />
                  ))}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {galleryStyles.map((s) => (
                  <button key={s.id} type="button" onClick={() => { setStyleId(s.id); setFill(""); }} className={cn("overflow-hidden rounded-xl border p-2 text-left transition-colors", styleId === s.id ? "border-primary bg-primary/5" : "border-border/60 bg-background hover:border-primary/40")}>
                    <pre className="h-12 overflow-hidden whitespace-pre text-[5px] leading-[1.05] text-primary">{stylePreviews[s.id]}</pre>
                    <p className="mt-1 text-xs font-medium">{s.label}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Ready-made gallery */}
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Images className="size-4 text-primary" />Ready-made art</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {GALLERY.map((g) => (
                <button key={g.id} type="button" onClick={() => copyOut(g.art)} title="Click to copy" className="overflow-hidden rounded-xl border border-border/60 bg-[#0b1020] p-2 text-left transition-transform hover:-translate-y-0.5">
                  <pre className="grid h-16 place-items-center overflow-hidden whitespace-pre text-center text-[7px] leading-[1.1] text-cyan-300">{g.art}</pre>
                  <p className="mt-1 text-center text-[11px] font-medium text-muted-foreground">{g.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* History */}
          {history.length > 0 && (
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Clock className="size-4 text-primary" />History</h2>
                <button type="button" onClick={() => persistHistory([])} className="text-xs text-muted-foreground hover:text-rose-500"><Trash2 className="mr-1 inline size-3.5" />Clear</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((h) => (
                  <div key={h.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-[#0b1020] p-2">
                    <pre className="h-12 overflow-hidden whitespace-pre text-[6px] leading-[1.1] text-cyan-300">{h.ascii}</pre>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="truncate text-[11px] text-muted-foreground">{h.label}</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => copyOut(h.ascii)} aria-label="Copy" className="text-muted-foreground hover:text-foreground"><Copy className="size-3.5" /></button>
                        <button type="button" onClick={() => persistHistory(history.filter((x) => x.id !== h.id))} aria-label="Delete" className="text-muted-foreground hover:text-rose-500"><X className="size-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col bg-[#0b1020]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="text-sm font-medium text-cyan-200">ASCII preview</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => copyOut()} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-cyan-100 hover:bg-white/20"><Copy className="mr-1 inline size-3.5" />Copy</button>
                <button type="button" onClick={() => setFullscreen(false)} aria-label="Close" className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-cyan-100 hover:bg-white/20"><X className="size-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {colorGrid ? (
                <pre className="whitespace-pre font-mono leading-[1.1]" style={{ fontSize: zoom }} dangerouslySetInnerHTML={{ __html: colorHtml() }} />
              ) : (
                <pre className="whitespace-pre font-mono leading-[1.1]" style={{ fontSize: zoom, color: fg }}>{output}</pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Preview pane ─────────────────────────────────────────────────────────────

function PreviewPane({ output, colorGrid, fg, zoom, reduceMotion, colorHtml }: { output: string; colorGrid: string[][] | null; fg: string; zoom: number; reduceMotion: boolean; colorHtml: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="size-2.5 rounded-full bg-rose-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-[11px] text-slate-400">ascii — toollyz</span>
      </div>
      <div className="max-h-[460px] overflow-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={`${output.length}-${zoom}`} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {output.trim() ? (
              colorGrid && colorHtml ? (
                <pre className="w-max whitespace-pre font-mono leading-[1.1]" style={{ fontSize: zoom }} dangerouslySetInnerHTML={{ __html: colorHtml }} />
              ) : (
                <pre className="w-max whitespace-pre font-mono leading-[1.1]" style={{ fontSize: zoom, color: fg }}>{output}</pre>
              )
            ) : (
              <p className="py-12 text-center font-mono text-sm text-slate-500">Your ASCII art will appear here…</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function HeroStat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-cyan-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-cyan-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
    </div>
  );
}

function AnimatedNumber({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  React.useEffect(() => {
    const to = value;
    const from = fromRef.current;
    if (from === to) { setDisplay(to); return; }
    if (reduceMotion || typeof document === "undefined" || document.visibilityState !== "visible") { setDisplay(to); fromRef.current = to; return; }
    const start = performance.now();
    const dur = 350;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick); else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    const fallback = window.setTimeout(() => { setDisplay(to); fromRef.current = to; }, dur + 120);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(fallback); };
  }, [value, reduceMotion]);
  return <>{display.toLocaleString()}</>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>;
}
function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:flex-none", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
}
function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground/80 hover:bg-muted")}>{label}</button>;
}
function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors", active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted")}><span className={cn("inline-block size-1.5 rounded-full", active ? "bg-primary" : "bg-muted-foreground/40")} />{label}</button>;
}
