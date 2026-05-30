"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Copy, Gauge, Lock, Monitor, RotateCw, Square, Tv2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { collectScreen, estimateRefreshRate, type ScreenSnapshot } from "@/lib/tools/info/screen";

export default function ScreenResolution() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [snap, setSnap] = React.useState<ScreenSnapshot | null>(null);
  const [refresh, setRefresh] = React.useState<number | null>(null);

  const refreshSnap = React.useCallback(() => setSnap(collectScreen()), []);

  React.useEffect(() => {
    setMounted(true);
    refreshSnap();
    estimateRefreshRate().then(setRefresh);
    const onResize = () => refreshSnap();
    window.addEventListener("resize", onResize);
    window.screen.orientation?.addEventListener("change", onResize);
    return () => { window.removeEventListener("resize", onResize); window.screen.orientation?.removeEventListener("change", onResize); };
  }, [refreshSnap]);

  if (!mounted || !snap) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-32 animate-pulse rounded-3xl bg-muted" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div></div>;
  }

  const hwW = Math.round(snap.width * snap.dpr);
  const hwH = Math.round(snap.height * snap.dpr);
  const innerScale = Math.min(1, 480 / snap.width);

  async function copyAll() {
    const text = `Screen: ${snap!.width}×${snap!.height} (CSS) / ${hwW}×${hwH} (hardware)\nViewport: ${snap!.innerWidth}×${snap!.innerHeight}\nDPR: ${snap!.dpr}×\nColor depth: ${snap!.colorDepth}-bit\nOrientation: ${snap!.orientation}\nAspect: ${snap!.aspect}\nRefresh rate: ${refresh ?? "?"} Hz`;
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { toast.error("Could not copy"); }
  }
  function downloadJson() {
    downloadText(JSON.stringify({ ...snap, refreshRateHz: refresh, hardwarePixels: `${hwW}×${hwH}` }, null, 2), "screen-info.json", "application/json");
    toast.success("Downloaded");
  }

  return (
    <div className="space-y-6">
      {/* Hero — big resolution */}
      <section aria-label="Screen summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1.5 text-xs font-medium text-sky-300/70"><Monitor className="size-3.5" />Your screen</div>
          <div className="font-heading text-5xl font-bold tracking-tight text-sky-50 sm:text-7xl">
            <AnimatedNumber value={snap.width} reduceMotion={!!reduceMotion} /> × <AnimatedNumber value={snap.height} reduceMotion={!!reduceMotion} />
          </div>
          <div className="text-sm text-sky-200/80">CSS pixels · {hwW}×{hwH} hardware · {snap.dpr}× DPR · {snap.aspect} aspect</div>
        </div>

        {/* Window-in-screen overlay */}
        <div className="relative mt-8 mx-auto" style={{ width: 480 }}>
          <div className="relative overflow-hidden rounded-lg border-2 border-white/15 bg-white/[0.03]" style={{ aspectRatio: `${snap.width}/${snap.height}` }}>
            <div className="absolute top-0 left-0 rounded-md border border-emerald-400/70 bg-emerald-400/20" style={{ width: `${(snap.innerWidth / snap.width) * 100}%`, height: `${(snap.innerHeight / snap.height) * 100}%` }} />
            <div className="absolute bottom-1 left-1 text-[10px] text-sky-200/80">screen {snap.width}×{snap.height}</div>
            <div className="absolute right-1 top-1 text-[10px] text-emerald-200">viewport {snap.innerWidth}×{snap.innerHeight}</div>
          </div>
          <p className="mt-2 text-center text-[11px] text-sky-300/60">Visual overlay (not to scale: {(innerScale * 100).toFixed(0)}%) — green is your browser viewport inside the screen.</p>
        </div>
      </section>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Screen" icon={<Tv2 className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Resolution (CSS)">{snap.width} × {snap.height}</Row>
            <Row label="Resolution (hardware)">{hwW} × {hwH}</Row>
            <Row label="Available">{snap.availWidth} × {snap.availHeight}</Row>
            <Row label="Aspect ratio">{snap.aspect}</Row>
            <Row label="Orientation">{snap.orientation}</Row>
          </dl>
        </Card>

        <Card title="Pixels & color" icon={<Square className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Device pixel ratio">{snap.dpr}×</Row>
            <Row label="Color depth">{snap.colorDepth}-bit</Row>
            <Row label="Pixel depth">{snap.pixelDepth}-bit</Row>
            <Row label="Refresh rate">{refresh !== null ? `${refresh} Hz` : "Measuring…"}</Row>
          </dl>
        </Card>

        <Card title="Viewport" icon={<Gauge className="size-4" />} className="sm:col-span-2">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Row label="Inner size">{snap.innerWidth} × {snap.innerHeight}</Row>
            <Row label="Outer size">{snap.outerWidth} × {snap.outerHeight}</Row>
            {snap.visualScale !== undefined && <Row label="Visual scale">{snap.visualScale.toFixed(2)}×</Row>}
            <Row label="Chrome (top bar)">{Math.max(0, snap.outerHeight - snap.innerHeight)} px</Row>
          </dl>
          <p className="mt-2 text-[11px] text-muted-foreground">Resize this window or rotate your device — the numbers update live.</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={refreshSnap}><RotateCw className="size-4" />Refresh</Button>
          <Button type="button" size="sm" variant="outline" onClick={copyAll}><Copy className="size-4" />Copy</Button>
          <Button type="button" size="sm" variant="outline" onClick={downloadJson}><Copy className="size-4" />JSON</Button>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Read in your browser — Toollyz has no server.</span>
      </div>
    </div>
  );
}

function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-border/70 bg-card p-4", className)}><h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><span className="text-primary">{icon}</span>{title}</h2>{children}</section>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-3"><dt className="shrink-0 text-muted-foreground">{label}</dt><dd className="break-all text-right font-medium text-foreground/90">{children}</dd></div>;
}
