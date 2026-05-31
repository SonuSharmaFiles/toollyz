"use client";

import * as React from "react";
import { Code, Copy, Download, Image as ImageIcon, Lock, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type Lang,
  LANGS,
  SAMPLE_CODE,
  THEMES,
  type Token,
  tokenize,
} from "@/lib/tools/css/code-screenshot";

const KEY = "toollyz:code-screenshot";

interface Saved {
  code: string;
  lang: Lang;
  themeId: string;
  windowTitle: string;
  showLineNumbers: boolean;
  paddingX: number;
  paddingY: number;
  fontSize: number;
}

const DEFAULTS: Saved = {
  code: SAMPLE_CODE,
  lang: "typescript",
  themeId: "midnight",
  windowTitle: "debounce.ts",
  showLineNumbers: true,
  paddingX: 48,
  paddingY: 48,
  fontSize: 16,
};

export default function CodeScreenshotGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<Saved>(DEFAULTS);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Saved>;
        setState({ ...DEFAULTS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  const theme = React.useMemo(
    () => THEMES.find((t) => t.id === state.themeId) ?? THEMES[0],
    [state.themeId],
  );

  const lines = React.useMemo(
    () => tokenize(state.code, state.lang),
    [state.code, state.lang],
  );

  // ── Canvas render ────────────────────────────────────────────────────────
  const render = React.useCallback(
    (scale = 2) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const fontFamily =
        "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace";
      const fontSize = state.fontSize;
      const lineHeight = Math.round(fontSize * 1.6);
      const padX = state.paddingX;
      const padY = state.paddingY;
      const titleH = 36;
      const innerPadX = 24;
      const innerPadY = 20;

      // Measure widest line.
      ctx.font = `${fontSize}px ${fontFamily}`;
      const widths = lines.map((toks) => {
        const text = toks.map((t) => t.text).join("");
        return ctx.measureText(text).width;
      });
      const lineNumWidth = state.showLineNumbers
        ? ctx.measureText(String(lines.length)).width + 24
        : 0;
      const maxLineWidth = Math.max(...widths, ctx.measureText("// empty").width);

      const codeAreaW = innerPadX * 2 + lineNumWidth + maxLineWidth;
      const codeAreaH = innerPadY * 2 + titleH + lineHeight * lines.length;
      const cssW = Math.max(420, Math.ceil(codeAreaW + padX * 2));
      const cssH = Math.max(240, Math.ceil(codeAreaH + padY * 2));

      canvas.width = cssW * scale;
      canvas.height = cssH * scale;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;

      // Background gradient.
      const grad = ctx.createLinearGradient(0, 0, cssW, cssH);
      // Parse `linear-gradient(135deg,#a,#b)` → just take the two hex colours.
      const colors = theme.gradient.match(/#[0-9a-fA-F]{3,8}/g) ?? ["#0f172a", "#1e3a8a"];
      grad.addColorStop(0, colors[0] ?? "#0f172a");
      grad.addColorStop(1, colors[colors.length - 1] ?? "#1e3a8a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssW, cssH);

      // Window with shadow.
      const winX = padX;
      const winY = padY;
      const winW = cssW - padX * 2;
      const winH = cssH - padY * 2;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;
      ctx.fillStyle = theme.window;
      roundRect(ctx, winX, winY, winW, winH, 14);
      ctx.fill();
      ctx.restore();

      // Title bar (slightly darker than window).
      ctx.save();
      ctx.fillStyle = mix(theme.window, "#000000", 0.15);
      roundRect(ctx, winX, winY, winW, titleH, 14, { tl: true, tr: true, bl: false, br: false });
      ctx.fill();
      ctx.restore();

      // Window chrome dots.
      const dotR = 6;
      const dotY = winY + titleH / 2;
      const dotXs = [winX + 18, winX + 38, winX + 58];
      [theme.dot1, theme.dot2, theme.dot3].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(dotXs[i], dotY, dotR, 0, Math.PI * 2);
        ctx.fill();
      });

      // Window title (filename).
      if (state.windowTitle) {
        ctx.fillStyle = mix(theme.fg, theme.window, 0.4);
        ctx.font = `13px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.windowTitle, winX + winW / 2, dotY);
      }

      // Code.
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const codeOriginX = winX + innerPadX;
      const codeOriginY = winY + titleH + innerPadY + fontSize;

      lines.forEach((toks, lineIdx) => {
        const y = codeOriginY + lineIdx * lineHeight;
        if (state.showLineNumbers) {
          ctx.fillStyle = mix(theme.fg, theme.window, 0.6);
          ctx.fillText(
            String(lineIdx + 1).padStart(String(lines.length).length, " "),
            codeOriginX,
            y,
          );
        }
        let x = codeOriginX + lineNumWidth;
        for (const tok of toks) {
          ctx.fillStyle = tokenColor(theme, tok);
          ctx.fillText(tok.text, x, y);
          x += ctx.measureText(tok.text).width;
        }
      });
    },
    [lines, state.fontSize, state.paddingX, state.paddingY, state.showLineNumbers, state.windowTitle, theme],
  );

  React.useEffect(() => {
    render(2);
  }, [render]);

  async function copyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("toBlob failed");
      if ("clipboard" in navigator && "write" in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Image copied to clipboard");
      } else {
        throw new Error("ClipboardItem unsupported");
      }
    } catch {
      toast.error("Browser blocked clipboard image — use Download.");
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(state.code);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Could not export PNG");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(state.windowTitle || "code").replace(/[^A-Za-z0-9._-]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Palette className="size-4 text-primary" />
          Theme
        </h2>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setState((s) => ({ ...s, themeId: t.id }))}
              className={cn(
                "rounded-xl border-2 p-1.5 transition-all",
                state.themeId === t.id ? "border-primary scale-105" : "border-transparent hover:scale-105",
              )}
              aria-pressed={state.themeId === t.id}
            >
              <div
                className="h-10 w-20 rounded-lg shadow-inner"
                style={{ background: t.gradient }}
                aria-hidden
              />
              <div className="mt-1 text-[10px] font-medium">{t.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <Field label="Window title (filename)">
          <Input
            value={state.windowTitle}
            onChange={(e) => setState((s) => ({ ...s, windowTitle: e.target.value }))}
            className="h-9 font-mono text-xs"
            placeholder="example.ts"
          />
        </Field>
        <Field label="Language">
          <select
            value={state.lang}
            onChange={(e) => setState((s) => ({ ...s, lang: e.target.value as Lang }))}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Font size (${state.fontSize}px)`}>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={state.fontSize}
            onChange={(e) => setState((s) => ({ ...s, fontSize: parseInt(e.target.value, 10) }))}
            className="w-full"
          />
        </Field>
        <Field label={`Padding (${state.paddingX}px)`}>
          <input
            type="range"
            min={16}
            max={96}
            step={4}
            value={state.paddingX}
            onChange={(e) =>
              setState((s) => ({ ...s, paddingX: parseInt(e.target.value, 10), paddingY: parseInt(e.target.value, 10) }))
            }
            className="w-full"
          />
        </Field>
        <label className="flex items-center gap-2 text-xs sm:col-span-2">
          <input
            type="checkbox"
            checked={state.showLineNumbers}
            onChange={(e) => setState((s) => ({ ...s, showLineNumbers: e.target.checked }))}
            className="size-4 rounded border-input"
          />
          Show line numbers
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Code className="size-4 text-primary" />
          Code
        </h2>
        <textarea
          value={state.code}
          onChange={(e) => setState((s) => ({ ...s, code: e.target.value }))}
          rows={10}
          spellCheck={false}
          placeholder="Paste your code here…"
          className="w-full resize-y rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, code: SAMPLE_CODE, lang: "typescript", windowTitle: "debounce.ts" }))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Sparkles className="size-3" />
            Sample
          </button>
          <Button type="button" size="sm" variant="ghost" onClick={copyCode}>
            <Copy className="size-3.5" />
            Copy code
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <ImageIcon className="size-4 text-primary" />
            Preview
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copyImage}>
              <Copy className="size-3.5" />
              Copy PNG
            </Button>
            <Button type="button" size="sm" onClick={download}>
              <Download className="size-3.5" />
              Download PNG
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-2">
          <canvas ref={canvasRef} className="max-w-full rounded-lg" />
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Rendering and download happen entirely in your browser — Toollyz never sees your code.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  corners: { tl: boolean; tr: boolean; bl: boolean; br: boolean } = { tl: true, tr: true, bl: true, br: true },
) {
  const tl = corners.tl ? r : 0;
  const tr = corners.tr ? r : 0;
  const br = corners.br ? r : 0;
  const bl = corners.bl ? r : 0;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

function tokenColor(theme: { fg: string; comment: string; keyword: string; string: string; number: string; function: string; type: string; punctuation: string }, t: Token): string {
  switch (t.color) {
    case "comment":
      return theme.comment;
    case "keyword":
      return theme.keyword;
    case "string":
      return theme.string;
    case "number":
      return theme.number;
    case "function":
      return theme.function;
    case "type":
      return theme.type;
    case "punctuation":
      return theme.punctuation;
    default:
      return theme.fg;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 * (1 - t) + r2 * t);
  const g = Math.round(g1 * (1 - t) + g2 * t);
  const bb = Math.round(b1 * (1 - t) + b2 * t);
  return `rgb(${r}, ${g}, ${bb})`;
}
