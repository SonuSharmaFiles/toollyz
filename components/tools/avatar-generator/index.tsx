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

// Curated seed samples for the "try seeds" comparison row. Picked to
// produce visibly distinct outputs across all four styles.
const SEED_SAMPLES = ["Alex", "Maria", "Sam", "Jordan", "Casey", "Riley"];

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

  const palette = PALETTES.find((p) => p.id === opts.paletteId)?.colors ?? PALETTES[0].colors;
  const accent = palette[0];

  return (
    <div className="space-y-6">
      {/* Big preview + redesigned style preview section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        {/* Ambient brand glow keyed to the palette */}
        <div
          className="pointer-events-none absolute -inset-px opacity-60"
          style={{
            background: `radial-gradient(circle at 12% 8%, ${accent}22 0%, transparent 50%), radial-gradient(circle at 92% 92%, ${palette[2] ?? palette[1]}1a 0%, transparent 55%)`,
          }}
          aria-hidden
        />

        <div className="relative grid gap-6 sm:grid-cols-[auto_1fr]">
          {/* Big live preview */}
          <div className="grid place-items-center">
            <div className="relative">
              <div
                className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-40"
                style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
                aria-hidden
              />
              <div
                className="block size-44 rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-lg shadow-black/30 sm:size-56"
                dangerouslySetInnerHTML={{ __html: buildSvg({ ...opts, size: 220 }) }}
              />
            </div>
          </div>

          {/* Right-hand control column */}
          <div className="space-y-5">
            {/* Section header with current seed badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300/80">Style preview</span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent sm:w-8 sm:flex-none" aria-hidden />
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-indigo-100/80">
                <span className="text-indigo-300/60">seed</span>
                <span className="max-w-[140px] truncate text-white">{opts.seed || "—"}</span>
                <button
                  type="button"
                  onClick={shuffleSeed}
                  className="ml-1 rounded-full p-0.5 text-indigo-200/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Shuffle seed"
                  title="Shuffle seed"
                >
                  <Dices className="size-3" />
                </button>
              </div>
            </div>

            {/* Style cards — fixed clip-path bug means each thumb now renders correctly */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {STYLE_OPTIONS.map((s) => {
                const isActive = opts.style === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => patch("style", s.id as Style)}
                    aria-pressed={isActive}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-3 text-center transition-all duration-200",
                      isActive
                        ? "border-emerald-400/70 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
                    )}
                  >
                    {/* Selected halo */}
                    {isActive && (
                      <div
                        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
                        style={{ background: `radial-gradient(circle at 50% 30%, ${accent}55 0%, transparent 70%)` }}
                        aria-hidden
                      />
                    )}

                    {/* Thumbnail */}
                    <div
                      className={cn(
                        "block size-20 rounded-xl border border-white/10 bg-white/5 p-1.5 transition-transform duration-200",
                        !isActive && "group-hover:scale-105",
                        isActive && "scale-105",
                      )}
                      dangerouslySetInnerHTML={{ __html: buildSvg({ ...opts, style: s.id as Style, size: 88 }) }}
                    />

                    {/* Label */}
                    <div className="space-y-1">
                      <span className={cn(
                        "block text-[11px] font-medium leading-tight transition-colors",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white/90",
                      )}>
                        {s.label}
                      </span>
                      <span className={cn(
                        "block text-[9px] font-mono uppercase tracking-wider transition-colors",
                        isActive ? "text-emerald-300" : "text-white/30",
                      )}>
                        {isActive ? "● Active" : "Select"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Try-different-seeds row — same style, different inputs */}
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300/70">
                  Try seeds · {STYLE_OPTIONS.find((s) => s.id === opts.style)?.label}
                </span>
                <button
                  type="button"
                  onClick={shuffleSeed}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-indigo-100/80 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Dices className="size-3" />
                  Random
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {SEED_SAMPLES.map((seedName) => {
                  const isCurrent = seedName === opts.seed;
                  return (
                    <button
                      key={seedName}
                      type="button"
                      onClick={() => patch("seed", seedName)}
                      title={`Use seed: ${seedName}`}
                      className={cn(
                        "group flex flex-col items-center gap-1 rounded-xl border bg-white/[0.02] p-1.5 transition-all",
                        isCurrent
                          ? "border-emerald-400/70 bg-emerald-500/10"
                          : "border-transparent hover:border-white/20 hover:bg-white/5",
                      )}
                    >
                      <div
                        className="size-10 rounded-lg border border-white/10 bg-white/5 p-0.5"
                        dangerouslySetInnerHTML={{ __html: buildSvg({ ...opts, seed: seedName, size: 44 }) }}
                      />
                      <span className={cn(
                        "block w-full truncate font-mono text-[9px] transition-colors",
                        isCurrent ? "text-emerald-200" : "text-white/50 group-hover:text-white/80",
                      )}>
                        {seedName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action bar */}
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
