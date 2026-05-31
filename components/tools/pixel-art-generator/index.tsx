"use client";

import * as React from "react";
import { Download, Eraser, Grid3X3, Lock, Paintbrush, PaintBucket, RotateCcw, Sparkles, ShieldCheck, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DEFAULT_PALETTE, SIZE_PRESETS, emptyGrid, renderToCanvas, resizeGrid, type Grid } from "@/lib/tools/css/pixel-art";

const KEY = "toollyz:pixel-art";

type Tool = "paint" | "fill" | "erase";

interface Saved {
  size: number;
  grid: Grid;
  color: string;
  tool: Tool;
  bg: string;
}

const DEFAULTS: Saved = {
  size: 16,
  grid: emptyGrid(16),
  color: "#0ea5e9",
  tool: "paint",
  bg: "#ffffff",
};

const HISTORY_CAP = 30;

export default function PixelArtGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [s, setS] = React.useState<Saved>(DEFAULTS);
  const historyRef = React.useRef<Grid[]>([]);
  const drawingRef = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Saved>;
        const size = parsed.size && SIZE_PRESETS.includes(parsed.size as never) ? parsed.size : DEFAULTS.size;
        setS({
          ...DEFAULTS,
          ...parsed,
          size,
          grid: parsed.grid && parsed.grid.length === size * size ? parsed.grid : emptyGrid(size),
        });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* noop */
    }
  }, [s, mounted]);

  function pushHistory(grid: Grid) {
    historyRef.current.push([...grid]);
    if (historyRef.current.length > HISTORY_CAP) historyRef.current.shift();
  }

  function undo() {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setS((prevS) => ({ ...prevS, grid: prev }));
  }

  function paintAt(idx: number, color: string) {
    setS((prev) => {
      if (prev.grid[idx] === color) return prev;
      const next = [...prev.grid];
      next[idx] = color;
      return { ...prev, grid: next };
    });
  }

  function floodFill(start: number, color: string) {
    setS((prev) => {
      const original = prev.grid[start];
      if (original === color) return prev;
      pushHistory(prev.grid);
      const grid = [...prev.grid];
      const stack = [start];
      const sz = prev.size;
      while (stack.length > 0) {
        const i = stack.pop() as number;
        if (grid[i] !== original) continue;
        grid[i] = color;
        const x = i % sz;
        const y = Math.floor(i / sz);
        if (x > 0) stack.push(i - 1);
        if (x < sz - 1) stack.push(i + 1);
        if (y > 0) stack.push(i - sz);
        if (y < sz - 1) stack.push(i + sz);
      }
      return { ...prev, grid };
    });
  }

  function handleCellPointerDown(idx: number) {
    drawingRef.current = true;
    if (s.tool === "fill") {
      floodFill(idx, s.color);
      return;
    }
    pushHistory(s.grid);
    paintAt(idx, s.tool === "erase" ? "" : s.color);
  }
  function handleCellPointerEnter(idx: number) {
    if (!drawingRef.current) return;
    if (s.tool === "fill") return;
    paintAt(idx, s.tool === "erase" ? "" : s.color);
  }

  React.useEffect(() => {
    function up() {
      drawingRef.current = false;
    }
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  function exportPng(scale: number) {
    const c = canvasRef.current ?? document.createElement("canvas");
    renderToCanvas(c, s.grid, { size: s.size, scale, background: s.bg });
    c.toBlob((blob) => {
      if (!blob) {
        toast.error("Export failed");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixel-art-${s.size}x${s.size}-${scale}x.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function changeSize(size: number) {
    if (size === s.size) return;
    setS((prev) => ({ ...prev, size, grid: resizeGrid(prev.grid, prev.size, size) }));
  }

  function clear() {
    pushHistory(s.grid);
    setS((prev) => ({ ...prev, grid: emptyGrid(prev.size) }));
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl border border-border/70 p-4"
        style={{ background: `repeating-conic-gradient(${s.bg} 0% 25%, #e5e7eb 0% 50%) 50%/24px 24px` }}
      >
        <div
          role="grid"
          aria-label="Pixel grid"
          className="mx-auto grid w-full max-w-[480px] select-none gap-0 overflow-hidden rounded border border-border bg-white shadow-inner dark:bg-zinc-900"
          style={{ gridTemplateColumns: `repeat(${s.size}, 1fr)`, aspectRatio: "1 / 1" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {s.grid.map((c, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={() => handleCellPointerDown(i)}
              onPointerEnter={() => handleCellPointerEnter(i)}
              aria-label={`cell ${i}`}
              className="block aspect-square border border-zinc-200/40 dark:border-zinc-800/40"
              style={{ background: c || "transparent", touchAction: "none" }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Tools</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ToolBtn icon={Paintbrush} label="Paint" active={s.tool === "paint"} onClick={() => setS((p) => ({ ...p, tool: "paint" }))} />
          <ToolBtn icon={PaintBucket} label="Fill" active={s.tool === "fill"} onClick={() => setS((p) => ({ ...p, tool: "fill" }))} />
          <ToolBtn icon={Eraser} label="Erase" active={s.tool === "erase"} onClick={() => setS((p) => ({ ...p, tool: "erase" }))} />
          <Button type="button" size="sm" variant="outline" onClick={undo} disabled={historyRef.current.length === 0}>
            <RotateCcw className="size-3.5" />
            Undo
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={clear}>
            <Square className="size-3.5" />
            Clear
          </Button>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Active colour</div>
          <Input type="color" value={s.color} onChange={(e) => setS((p) => ({ ...p, color: e.target.value }))} className="h-9 cursor-pointer" />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Export background</div>
          <Input type="color" value={s.bg} onChange={(e) => setS((p) => ({ ...p, bg: e.target.value }))} className="h-9 cursor-pointer" />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Grid size</div>
          <div className="flex flex-wrap gap-1.5">
            {SIZE_PRESETS.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => changeSize(sz)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-mono",
                  s.size === sz ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                )}
              >
                {sz}
              </button>
            ))}
          </div>
        </label>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Palette</h2>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setS((p) => ({ ...p, color: c }))}
              className={cn(
                "size-7 rounded-md border-2 transition-transform hover:scale-110",
                s.color === c ? "border-primary scale-110" : "border-border",
              )}
              style={{ background: c }}
              aria-label={c}
              title={c}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Grid3X3 className="size-4 text-primary" />
          Export PNG
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => exportPng(1)}>
            <Download className="size-3.5" />
            1× ({s.size}px)
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => exportPng(8)}>
            <Download className="size-3.5" />
            8× ({s.size * 8}px)
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => exportPng(16)}>
            <Download className="size-3.5" />
            16× ({s.size * 16}px)
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => exportPng(32)}>
            <Download className="size-3.5" />
            32× ({s.size * 32}px)
          </Button>
        </div>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        <p className="text-[11px] text-muted-foreground">
          1× exports at the native grid size — perfect for sprite sheets. Higher scales upscale with nearest-neighbour interpolation so pixels stay crisp.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Painting and PNG export run entirely in your browser — Toollyz has no server.
        <Sparkles className="ml-auto size-3" />
      </p>
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium",
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
