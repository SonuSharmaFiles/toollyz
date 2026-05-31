"use client";

import * as React from "react";
import { Copy, Download, Image as ImageIcon, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_OPTIONS,
  type ImageMode,
  type PlaceholderOptions,
  SIZE_PRESETS,
  render,
} from "@/lib/tools/css/placeholder-image";

const KEY = "toollyz:placeholder-image";

export default function LoremIpsumImageGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [opt, setOpt] = React.useState<PlaceholderOptions>(DEFAULT_OPTIONS);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlaceholderOptions>;
        setOpt({ ...DEFAULT_OPTIONS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(opt));
    } catch {
      /* noop */
    }
  }, [opt, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    const c = canvasRef.current;
    if (!c) return;
    render(c, opt);
  }, [mounted, opt]);

  function update(patch: Partial<PlaceholderOptions>) {
    setOpt((o) => ({ ...o, ...patch }));
  }

  async function copyImage() {
    const c = canvasRef.current;
    if (!c) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("toBlob failed");
      if ("clipboard" in navigator && "write" in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("PNG copied to clipboard");
      } else {
        throw new Error("ClipboardItem unsupported");
      }
    } catch {
      toast.error("Browser blocked clipboard image — use Download.");
    }
  }

  function download(format: "png" | "jpeg") {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Export failed");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `placeholder-${opt.width}x${opt.height}.${format === "jpeg" ? "jpg" : "png"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      format === "jpeg" ? "image/jpeg" : "image/png",
    );
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
      <section className="overflow-auto rounded-3xl border border-border/70 bg-muted/30 p-3">
        <div className="mx-auto max-w-full overflow-x-auto text-center">
          <canvas ref={canvasRef} className="mx-auto max-w-full" />
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Size presets</h2>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update({ width: p.width, height: p.height })}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium",
                opt.width === p.width && opt.height === p.height
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Width (px)</div>
          <Input type="number" value={opt.width} onChange={(e) => update({ width: Math.max(8, parseInt(e.target.value || "0", 10)) })} className="h-9 font-mono" min={8} max={4096} />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Height (px)</div>
          <Input type="number" value={opt.height} onChange={(e) => update({ height: Math.max(8, parseInt(e.target.value || "0", 10)) })} className="h-9 font-mono" min={8} max={4096} />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Background</div>
          <Input type="color" value={opt.background} onChange={(e) => update({ background: e.target.value })} className="h-9 cursor-pointer" />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">{opt.mode === "gradient" ? "Gradient stop 2" : "Accent"}</div>
          <Input type="color" value={opt.background2} onChange={(e) => update({ background2: e.target.value })} className="h-9 cursor-pointer" />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Foreground (label)</div>
          <Input type="color" value={opt.foreground} onChange={(e) => update({ foreground: e.target.value })} className="h-9 cursor-pointer" />
        </label>
        <label className="space-y-1.5 text-xs">
          <div className="font-medium text-muted-foreground">Mode</div>
          <select
            value={opt.mode}
            onChange={(e) => update({ mode: e.target.value as ImageMode })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
            <option value="stripes">Diagonal stripes</option>
            <option value="dots">Dots</option>
          </select>
        </label>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs sm:col-span-2">
          <div className="font-medium text-muted-foreground">Custom label (optional)</div>
          <Input
            value={opt.customLabel ?? ""}
            onChange={(e) => update({ customLabel: e.target.value })}
            placeholder={`Default: ${opt.width} × ${opt.height}`}
            className="h-9"
          />
        </label>
        <Slider label={`Font size (${opt.fontSize}%)`} value={opt.fontSize} min={2} max={20} onChange={(v) => update({ fontSize: v })} />
        <Slider label={`Noise (${opt.noise}%)`} value={opt.noise} min={0} max={100} onChange={(v) => update({ noise: v })} />
        <label className="flex items-end gap-2 text-xs sm:col-span-2">
          <input type="checkbox" checked={opt.showLabel} onChange={(e) => update({ showLabel: e.target.checked })} className="size-4 rounded border-input" />
          Show dimensions label
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <ImageIcon className="size-4 text-primary" />
            Export
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copyImage}>
              <Copy className="size-3.5" />
              Copy PNG
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => download("jpeg")}>
              <Download className="size-3.5" />
              JPG
            </Button>
            <Button type="button" size="sm" onClick={() => download("png")}>
              <Download className="size-3.5" />
              PNG
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          The canvas renders at devicePixelRatio for crisp Retina exports. Output is a real downloadable file — no need to right-click and save.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Image generation runs entirely in your browser — Toollyz has no server.
        <Sparkles className="ml-auto size-3" />
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="space-y-1 text-xs">
      <div className="font-medium text-muted-foreground">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full"
      />
    </label>
  );
}
