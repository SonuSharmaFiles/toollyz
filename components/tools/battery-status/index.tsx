"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Info, Lock, RefreshCw, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { formatDuration, getBattery, isSupported, levelTone, snapshot, type BatteryInfo, type BatteryManagerLike } from "@/lib/tools/info/battery";

export default function BatteryStatus() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const [info, setInfo] = React.useState<BatteryInfo | null>(null);
  const batteryRef = React.useRef<BatteryManagerLike | null>(null);

  const refresh = React.useCallback(async () => {
    if (!isSupported()) { setSupported(false); return; }
    const b = await getBattery();
    if (!b) { setSupported(false); return; }
    batteryRef.current = b;
    setInfo(snapshot(b));
    const update = () => setInfo(snapshot(b));
    b.addEventListener("levelchange", update);
    b.addEventListener("chargingchange", update);
    b.addEventListener("chargingtimechange", update);
    b.addEventListener("dischargingtimechange", update);
  }, []);

  React.useEffect(() => { setMounted(true); refresh(); }, [refresh]);

  if (!mounted) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-64 animate-pulse rounded-3xl bg-muted" /><div className="h-28 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!supported) return <UnsupportedView />;
  if (!info) return <div className="h-64 animate-pulse rounded-3xl bg-muted" aria-hidden="true" />;

  const pct = Math.round(info.level * 100);
  const tone = levelTone(info.level, info.charging);
  const fillColor = tone === "charging" ? "from-sky-400 to-emerald-400" : tone === "good" ? "from-emerald-400 to-emerald-500" : tone === "warn" ? "from-amber-400 to-amber-500" : "from-rose-400 to-rose-500";
  const StatusIcon = info.charging ? BatteryCharging : pct >= 70 ? BatteryFull : pct >= 30 ? BatteryMedium : BatteryLow;
  const timeLabel = info.charging
    ? Number.isFinite(info.chargingTime) ? `Full in ${formatDuration(info.chargingTime)}` : "Calculating time to full…"
    : Number.isFinite(info.dischargingTime) ? `Empty in ${formatDuration(info.dischargingTime)}` : "Calculating time remaining…";

  return (
    <div className="space-y-6">
      {/* Hero — visual battery */}
      <section aria-label="Battery level" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-emerald-300/80">
            <StatusIcon className="size-5" />
            <span className="text-sm font-medium">{info.charging ? "Charging" : tone === "low" ? "Low battery" : "On battery"}</span>
          </div>
          <div className="font-heading text-6xl font-bold tabular-nums text-emerald-50 sm:text-8xl">
            <AnimatedNumber value={pct} reduceMotion={!!reduceMotion} suffix="%" />
          </div>
          {/* battery shape */}
          <div className="relative flex w-full max-w-md items-center gap-1">
            <div className="relative h-12 flex-1 overflow-hidden rounded-xl border-2 border-white/20 bg-white/[0.03]">
              <motion.div
                className={cn("h-full bg-gradient-to-r", fillColor)}
                initial={false}
                animate={{ width: `${Math.max(2, pct)}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
              />
              {info.charging && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><Zap className="size-6 text-white/90" /></div>
              )}
            </div>
            <div className="h-6 w-2 rounded-r-sm bg-white/20" />
          </div>
          <p className="text-sm text-emerald-200/80">{timeLabel}</p>
        </div>
      </section>

      {/* Detail card */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card icon={<Battery className="size-4" />} label="Level">{(info.level * 100).toFixed(1)}%</Card>
        <Card icon={<Zap className="size-4" />} label="Charging">{info.charging ? "Yes" : "No"}</Card>
        <Card icon={<Timer className="size-4" />} label={info.charging ? "Time to full" : "Time remaining"}>
          {Number.isFinite(info.charging ? info.chargingTime : info.dischargingTime) ? formatDuration(info.charging ? info.chargingTime : info.dischargingTime) : "Calculating…"}
        </Card>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Info className="size-3.5" />Live values — the page updates as your charging state and level change.</span>
        <Button type="button" size="sm" variant="outline" onClick={refresh}><RefreshCw className="size-4" />Refresh</Button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Read in your browser via the Battery Status API — Toollyz has no server.</p>
    </div>
  );
}

function UnsupportedView() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-card p-8 text-center">
      <Battery className="mx-auto mb-3 size-10 text-muted-foreground" />
      <h2 className="font-heading text-2xl font-semibold">Battery status isn&apos;t available in this browser</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Firefox and Safari no longer expose the Battery Status API for privacy reasons. Try this page in a Chromium-based browser (Chrome, Edge, Opera, Brave, Arc) on a device with a battery to see live battery info.
      </p>
    </section>
  );
}

function Card({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"><span className="text-primary">{icon}</span>{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums">{children}</div>
    </section>
  );
}
