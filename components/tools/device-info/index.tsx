"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Activity, Copy, Cpu, Gauge, Lock, MemoryStick, Monitor, MonitorSmartphone, Network, RefreshCw, Smartphone, Tablet, Usb } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import { collectDevice, snapshotJson, type DeviceSnapshot } from "@/lib/tools/info/device";

export default function DeviceInfo() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [snap, setSnap] = React.useState<DeviceSnapshot | null>(null);

  const refresh = React.useCallback(() => setSnap(collectDevice()), []);

  React.useEffect(() => {
    setMounted(true);
    refresh();
    const onResize = () => refresh();
    window.addEventListener("resize", onResize);
    window.screen.orientation?.addEventListener("change", onResize);
    return () => { window.removeEventListener("resize", onResize); window.screen.orientation?.removeEventListener("change", onResize); };
  }, [refresh]);

  if (!mounted || !snap) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-32 animate-pulse rounded-3xl bg-muted" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div></div>;
  }

  void reduceMotion;
  const TypeIcon = snap.type === "Mobile phone" ? Smartphone : snap.type === "Tablet" ? Tablet : Monitor;
  async function copyJson() { try { await navigator.clipboard.writeText(snapshotJson(snap!)); toast.success("Snapshot copied"); } catch { toast.error("Could not copy"); } }
  function downloadJson() { downloadText(snapshotJson(snap!), "device-info.json", "application/json"); toast.success("Downloaded"); }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Device identity" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">This device looks like</div>
            <div className="flex items-center gap-3">
              <TypeIcon className="size-10 text-sky-200" />
              <div>
                <div className="font-heading text-3xl font-bold tracking-tight text-sky-50 sm:text-5xl">{snap.type}</div>
                <div className="text-sm text-sky-200/80">{snap.os}{snap.platform !== "—" ? ` · ${snap.platform}` : ""}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={refresh} className="border-white/15 bg-white/5 text-sky-50 hover:bg-white/10"><RefreshCw className="size-4" />Refresh</Button>
            <Button type="button" size="sm" variant="outline" onClick={copyJson} className="border-white/15 bg-white/5 text-sky-50 hover:bg-white/10"><Copy className="size-4" />Copy JSON</Button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Identity" icon={<MonitorSmartphone className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Type">{snap.type}</Row>
            <Row label="Operating system">{snap.os}</Row>
            <Row label="Platform">{snap.platform}</Row>
          </dl>
        </Card>

        <Card title="Processor & memory" icon={<Cpu className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="CPU cores">{snap.cpuCores ?? "—"}</Row>
            <Row label="Device memory">{snap.memoryGb !== undefined ? `${snap.memoryGb} GB` : "—"}</Row>
            <Row label="Touch points">{snap.maxTouchPoints}</Row>
            <Row label="Pointer">{snap.pointer}{snap.hover ? " · hover" : ""}</Row>
          </dl>
        </Card>

        <Card title="Screen" icon={<Monitor className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Resolution">{snap.screen.width} × {snap.screen.height}</Row>
            <Row label="Available">{snap.screen.availWidth} × {snap.screen.availHeight}</Row>
            <Row label="Pixel ratio">{snap.screen.dpr}×</Row>
            <Row label="Color depth">{snap.screen.colorDepth}-bit</Row>
            <Row label="Orientation">{snap.screen.orientation}</Row>
          </dl>
        </Card>

        <Card title="Viewport" icon={<Gauge className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Inner size">{snap.viewport.width} × {snap.viewport.height}</Row>
            {snap.viewport.visualScale !== undefined && <Row label="Visual scale">{snap.viewport.visualScale.toFixed(2)}×</Row>}
          </dl>
        </Card>

        {snap.gpu && (
          <Card title="GPU" icon={<MemoryStick className="size-4" />} className="sm:col-span-2">
            <dl className="space-y-1.5 text-sm">
              <Row label="Renderer">{snap.gpu.renderer || "—"}</Row>
              <Row label="Vendor">{snap.gpu.vendor || "—"}</Row>
              <Row label="WebGL">{snap.gpu.webglVersion}</Row>
            </dl>
            <p className="mt-2 text-[11px] text-muted-foreground">Some browsers obscure the GPU vendor/renderer for privacy; what you see is what your browser exposes.</p>
          </Card>
        )}

        {snap.connection && (
          <Card title="Connection" icon={<Network className="size-4" />}>
            <dl className="space-y-1.5 text-sm">
              {snap.connection.effectiveType && <Row label="Effective type">{snap.connection.effectiveType.toUpperCase()}</Row>}
              {snap.connection.type && <Row label="Type">{snap.connection.type}</Row>}
              {snap.connection.downlink !== undefined && <Row label="Downlink (est.)">{snap.connection.downlink} Mbps</Row>}
              {snap.connection.rtt !== undefined && <Row label="Round-trip (est.)">{snap.connection.rtt} ms</Row>}
              {snap.connection.saveData !== undefined && <Row label="Data saver">{snap.connection.saveData ? "On" : "Off"}</Row>}
            </dl>
            <p className="mt-2 text-[11px] text-muted-foreground">Browser estimate. For real numbers try the Internet Speed Test.</p>
          </Card>
        )}

        <Card title="Capabilities" icon={<Activity className="size-4" />} className={cn(!snap.connection && "sm:col-span-2")}>
          <ul className="grid grid-cols-2 gap-1.5 list-none">
            <Cap label="Battery API" on={snap.battery} icon={<Activity className="size-3.5" />} />
            <Cap label="Bluetooth" on={snap.bluetooth} icon={<Activity className="size-3.5" />} />
            <Cap label="USB" on={snap.usb} icon={<Usb className="size-3.5" />} />
            <Cap label="Gamepads" on={snap.gamepads} icon={<Activity className="size-3.5" />} />
            <Cap label="Vibration" on={snap.vibration} icon={<Activity className="size-3.5" />} />
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="outline" onClick={downloadJson}><Copy className="size-4" />Download JSON</Button>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Everything is read in your browser — Toollyz has no server.</span>
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
function Cap({ label, on, icon }: { label: string; on: boolean; icon: React.ReactNode }) {
  return <li className={cn("flex items-center justify-between gap-2 rounded-lg border p-2 text-sm", on ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 bg-background")}>
    <span className="flex items-center gap-1.5 text-foreground/80">{icon}{label}</span>
    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase", on ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{on ? "yes" : "no"}</span>
  </li>;
}
