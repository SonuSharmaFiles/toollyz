"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Dices,
  Download,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
  UserCircle2,
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
  DEFAULT_OPTIONS,
  PALETTES,
  STYLE_OPTIONS,
  buildSvg,
  svgToPng,
  type AvatarOptions,
  type Style,
} from "@/lib/tools/avatar/avatar";

const STORAGE_KEY = "toollyz:avatar-options";

const EXPORT_SIZES = [64, 128, 256, 512];

export default function AvatarGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [opts, setOpts] = React.useState<AvatarOptions>(DEFAULT_OPTIONS);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOpts({ ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<AvatarOptions>) });
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

  const svg = React.useMemo(() => buildSvg(opts), [opts]);

  function patch<K extends keyof AvatarOptions>(k: K, v: AvatarOptions[K]) {
    setOpts((o) => ({ ...o, [k]: v }));
  }

  async function copySvg() {
    try {
      await navigator.clipboard.writeText(svg);
      toast.success("SVG copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar-${safe(opts.seed)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Saved SVG");
  }

  async function downloadPng(size: number) {
    try {
      const blob = await svgToPng(svg, size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avatar-${safe(opts.seed)}-${size}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Saved ${size}×${size} PNG`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PNG export failed");
    }
  }

  function shuffleSeed() {
    const rand = Math.random().toString(36).slice(2, 8);
    patch("seed", rand);
  }

  function reset() {
    setOpts(DEFAULT_OPTIONS);
    toast.success("Reset to defaults");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Big preview + style grid */}
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="grid place-items-center">
          <div
            className="block size-44 rounded-lg bg-white/5 p-2 sm:size-56"
            dangerouslySetInnerHTML={{ __html: buildSvg({ ...opts, size: 220 }) }}
          />
        </div>
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-indigo-300/80">Style preview</div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => patch("style", s.id as Style)}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-xl border bg-white/5 p-2 transition-colors hover:bg-white/10",
                  opts.style === s.id ? "border-emerald-400" : "border-transparent",
                )}
              >
                <div
                  className="size-16 rounded-lg bg-white/10 p-1"
                  dangerouslySetInnerHTML={{ __html: buildSvg({ ...opts, style: s.id as Style, size: 64 }) }}
                />
                <span className="text-[10px] text-white/80">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" onClick={shuffleSeed}>
              <Dices className="size-3.5" />
              Shuffle seed
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={copySvg} className="bg-white/5 text-white">
              <Copy className="size-3.5" />
              Copy SVG
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={downloadSvg} className="bg-white/5 text-white">
              <Download className="size-3.5" />
              SVG
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white">
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Seed + style controls */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <UserCircle2 className="size-4 text-primary" />
          Inputs
        </h2>
        <Field label="Seed (name, email, ID — anything stable)">
          <Input value={opts.seed} onChange={(e) => patch("seed", e.target.value)} placeholder="alex@example.com" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Palette">
            <Select value={opts.paletteId} onValueChange={(v) => v && patch("paletteId", v)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PALETTES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="mr-2 inline-flex gap-0.5">
                      {p.colors.slice(0, 4).map((c) => (
                        <span key={c} className="inline-block size-3 rounded-sm" style={{ background: c }} />
                      ))}
                    </span>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Shape">
            <Select value={opts.square ? "square" : "circle"} onValueChange={(v) => v && patch("square", v === "square")}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle (default)</SelectItem>
                <SelectItem value="square">Rounded square</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Preview size">
            <Input
              type="number"
              min={32}
              max={1024}
              value={opts.size}
              onChange={(e) => patch("size", Math.max(32, Math.min(1024, Number(e.target.value) || 256)))}
              className="font-mono"
            />
          </Field>
        </div>
      </section>

      {/* Export */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Download className="size-4 text-primary" />
          Download PNG sizes
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {EXPORT_SIZES.map((s) => (
            <Button key={s} type="button" size="sm" variant="outline" onClick={() => downloadPng(s)}>
              {s}×{s}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Every avatar is derived from the seed via FNV-1a hash → Mulberry32 PRNG → palette pick → shape layout. Same seed = same avatar, always.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Identicon and Pixel styles use left-right symmetry — the recognisable &quot;GitHub avatar&quot; look.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Output is vector SVG. PNG export rasterises via canvas — works in every modern browser without a backend.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Seed + settings save to localStorage on this device only.</li>
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

function safe(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "avatar";
}
