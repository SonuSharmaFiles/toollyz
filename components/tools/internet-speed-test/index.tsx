"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Activity, AlertTriangle, ArrowDownToLine, ArrowUpToLine, Gauge, Info, Loader2, Play, RotateCw, Timer, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { isOnline } from "@/lib/tools/shared/net";
import { runSpeedTest, type Phase, type SpeedResult } from "@/lib/tools/net/speed";

const HISTORY_KEY = "toollyz:speed-history";
interface HistoryItem { id: string; download: number; upload: number; ping: number; jitter: number; ts: number }

const PHASES: { id: Phase; label: string }[] = [
  { id: "latency", label: "Ping" },
  { id: "download", label: "Download" },
  { id: "upload", label: "Upload" },
];

export default function InternetSpeedTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [live, setLive] = React.useState<SpeedResult>({ download: 0, upload: 0, ping: 0, jitter: 0 });
  const [result, setResult] = React.useState<SpeedResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try { const h = localStorage.getItem(HISTORY_KEY); if (h) setHistory(JSON.parse(h)); } catch { /* noop */ }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const testing = phase === "latency" || phase === "download" || phase === "upload";
  const shown = result ?? live;

  async function run() {
    if (!isOnline()) { setOnline(false); return; }
    setError(null);
    setResult(null);
    setLive({ download: 0, upload: 0, ping: 0, jitter: 0 });
    setPhase("latency");
    const res = await runSpeedTest({
      onPhase: (p) => setPhase(p),
      onValue: (metric, v) => setLive((prev) => ({ ...prev, [metric]: v })),
    });
    if (res.ok && res.result) {
      setResult(res.result);
      setLive(res.result);
      setPhase("done");
      const item: HistoryItem = { id: Math.random().toString(36).slice(2, 9), ...res.result, ts: Date.now() };
      setHistory((prev) => { const next = [item, ...prev].slice(0, 12); try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ } return next; });
    } else {
      setError(res.error ?? "Speed test failed");
      setPhase("error");
    }
  }

  if (!mounted) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-64 animate-pulse rounded-3xl bg-muted" /><div className="h-16 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero gauges */}
      <section aria-label="Speed test results" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-6 lg:grid-cols-4">
          <Gauge2 label="Download" unit="Mbps" value={shown.download} active={phase === "download"} icon={<ArrowDownToLine className="size-4" />} reduceMotion={!!reduceMotion} primary />
          <Gauge2 label="Upload" unit="Mbps" value={shown.upload} active={phase === "upload"} icon={<ArrowUpToLine className="size-4" />} reduceMotion={!!reduceMotion} />
          <Gauge2 label="Ping" unit="ms" value={shown.ping} active={phase === "latency"} icon={<Activity className="size-4" />} reduceMotion={!!reduceMotion} decimals={0} />
          <Gauge2 label="Jitter" unit="ms" value={shown.jitter} active={false} icon={<Timer className="size-4" />} reduceMotion={!!reduceMotion} decimals={0} />
        </div>

        {/* phase chips */}
        <div className="relative mt-6 flex items-center justify-center gap-2">
          {PHASES.map((p) => {
            const order = ["latency", "download", "upload"];
            const done = (phase === "done") || (order.indexOf(phase) > order.indexOf(p.id) && order.indexOf(phase) >= 0);
            const isActive = phase === p.id;
            return (
              <span key={p.id} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", isActive ? "bg-indigo-400/20 text-indigo-200" : done ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-indigo-300/50")}>
                {isActive && <Loader2 className="size-3 animate-spin" />}{p.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        {online ? (
          <Button type="button" size="lg" onClick={run} disabled={testing} className="min-w-48">
            {testing ? <><Loader2 className="size-4 animate-spin" />Testing…</> : result || error ? <><RotateCw className="size-4" />Test again</> : <><Play className="size-4" />Start speed test</>}
          </Button>
        ) : (
          <p className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400"><WifiOff className="size-4" />You appear to be offline.</p>
        )}
        {error && <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{error}</p>}
      </div>

      {/* Caveats */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Info className="size-4 text-primary" />About these results</h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Gauge className="mt-0.5 size-3.5 shrink-0 text-primary" />Measured in your browser over a single connection to Cloudflare — typically reads a bit lower than multi-connection apps.</li>
          <li className="flex items-start gap-1.5"><Gauge className="mt-0.5 size-3.5 shrink-0 text-primary" />Browser/JS overhead, VPNs, Wi-Fi and your distance to Cloudflare's edge all affect the result.</li>
          <li className="flex items-start gap-1.5"><Gauge className="mt-0.5 size-3.5 shrink-0 text-primary" />Upload is measured as a full round-trip and includes server acknowledgment time.</li>
          <li className="flex items-start gap-1.5"><Gauge className="mt-0.5 size-3.5 shrink-0 text-primary" />It's a one-moment snapshot; shared and wireless connections fluctuate. Toollyz has no server — this runs against speed.cloudflare.com.</li>
        </ul>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Activity className="size-4 text-primary" />Recent tests</h2>
            <button type="button" onClick={() => { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ } }} className="text-xs text-muted-foreground hover:text-rose-500">Clear</button>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-2 font-medium">When</th><th className="px-3 py-2 text-right font-medium">Down</th><th className="px-3 py-2 text-right font-medium">Up</th><th className="px-3 py-2 text-right font-medium">Ping</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(h.ts).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{h.download.toFixed(1)} Mbps</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{h.upload.toFixed(1)} Mbps</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{Math.round(h.ping)} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Gauge2({ label, unit, value, active, icon, reduceMotion, decimals = 1, primary }: { label: string; unit: string; value: number; active: boolean; icon: React.ReactNode; reduceMotion: boolean; decimals?: number; primary?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4 transition-colors", active ? "border-indigo-400/40 bg-indigo-400/10" : "border-white/10 bg-white/[0.03]")}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-300/70"><span className="text-indigo-300">{icon}</span>{label}</div>
      <div className={cn("mt-1 font-heading font-bold tabular-nums text-indigo-50", primary ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} decimals={decimals} />
      </div>
      <div className="text-[11px] text-indigo-300/50">{unit}</div>
    </div>
  );
}
