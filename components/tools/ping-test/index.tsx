"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Activity, AlertTriangle, Info, Loader2, Server, WifiOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { isOnline } from "@/lib/tools/shared/net";
import { PRESETS, SAMPLE_HOST, normalizeHost, pingHost, type PingResult } from "@/lib/tools/net/ping";

const HOST_KEY = "toollyz:ping-host";
const HISTORY_KEY = "toollyz:ping-history";
interface HistoryItem { id: string; host: string; min: number; avg: number; loss: number; ts: number }

export default function PingTest() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [host, setHost] = React.useState(SAMPLE_HOST);
  const [running, setRunning] = React.useState(false);
  const [live, setLive] = React.useState<(number | null)[]>([]);
  const [result, setResult] = React.useState<PingResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  React.useEffect(() => {
    setMounted(true);
    try {
      const h = localStorage.getItem(HOST_KEY);
      if (h) setHost(h);
      const hist = localStorage.getItem(HISTORY_KEY);
      if (hist) setHistory(JSON.parse(hist));
    } catch { /* noop */ }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(isOnline());
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const samples = result ? result.samples : live;
  const rtts = samples.filter((r): r is number => r !== null);
  const sent = samples.length;
  const received = rtts.length;
  const liveMin = rtts.length ? Math.min(...rtts) : 0;
  const liveAvg = rtts.length ? rtts.reduce((a, b) => a + b, 0) / rtts.length : 0;
  const lossPct = result ? result.lossPct : sent ? ((sent - received) / sent) * 100 : 0;
  const maxRtt = rtts.length ? Math.max(...rtts) : 1;

  async function run(target?: string) {
    const h = target ?? host;
    if (!isOnline()) { setOnline(false); return; }
    if (!h.trim()) { toast.error("Enter a host or URL"); return; }
    if (target) setHost(target);
    setRunning(true);
    setError(null);
    setResult(null);
    setLive([]);
    try { localStorage.setItem(HOST_KEY, h); } catch { /* noop */ }
    const res = await pingHost(h, { samples: 14 }, (p) => setLive((prev) => [...prev, p.rtt]));
    if (res.ok && res.result) {
      setResult(res.result);
      const item: HistoryItem = { id: Math.random().toString(36).slice(2, 9), host: normalizeHost(h), min: res.result.min, avg: res.result.avg, loss: res.result.lossPct, ts: Date.now() };
      setHistory((prev) => { const next = [item, ...prev].slice(0, 12); try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ } return next; });
    } else {
      setError(res.error ?? "Ping failed");
    }
    setRunning(false);
  }

  if (!mounted) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-28 animate-pulse rounded-3xl bg-muted" /><div className="h-16 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Latency summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.18),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Min latency" value={Math.round(liveMin)} suffix=" ms" reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Average" value={Math.round(liveAvg)} suffix=" ms" reduceMotion={!!reduceMotion} />
          <Stat label="Jitter" value={Math.round(result?.jitter ?? 0)} suffix=" ms" reduceMotion={!!reduceMotion} />
          <Stat label="Packet loss" value={Math.round(lossPct)} suffix="%" reduceMotion={!!reduceMotion} accent={lossPct > 0 ? "text-rose-300" : "text-emerald-300"} />
        </div>
        {/* live sample bars */}
        <div className="relative mt-5 flex h-16 items-end gap-1">
          {samples.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-indigo-300/50">Run a test to see per-request latency</div>
          ) : (
            samples.map((rtt, i) => (
              <div key={i} className="flex-1" title={rtt === null ? "lost" : `${Math.round(rtt)} ms`}>
                <div className={cn("w-full rounded-sm", rtt === null ? "bg-rose-500/70" : "bg-gradient-to-t from-emerald-500 to-indigo-400")} style={{ height: rtt === null ? "100%" : `${Math.max(8, (rtt / maxRtt) * 100)}%` }} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Honest banner */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>This measures <strong>HTTP(S) round-trip latency</strong>, not ICMP ping — browsers can&apos;t send real ping packets. Expect higher numbers than your terminal&apos;s <code className="rounded bg-amber-500/15 px-1">ping</code>; use it to compare hosts, not as an absolute network ping.</span>
      </div>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={host} onChange={(e) => setHost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="example.com or https://example.com" className="flex-1 font-mono text-sm" aria-label="Host or URL" />
          <Button type="button" onClick={() => run()} disabled={running}>{running ? <><Loader2 className="size-4 animate-spin" />Pinging…</> : <><Zap className="size-4" />Ping</>}</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.url} type="button" onClick={() => run(p.url)} disabled={running} className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted disabled:opacity-50">{p.label}</button>
          ))}
        </div>
        {!online && <p className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400"><WifiOff className="size-4" />You appear to be offline.</p>}
        {error && <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{error}</p>}
      </section>

      {/* Detailed stats */}
      {result && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Activity className="size-4 text-primary" />Results for <span className="font-mono text-xs text-muted-foreground">{normalizeHost(host)}</span></h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Min", value: `${Math.round(result.min)} ms` },
              { label: "Avg", value: `${Math.round(result.avg)} ms` },
              { label: "Median", value: `${Math.round(result.median)} ms` },
              { label: "Max", value: `${Math.round(result.max)} ms` },
              { label: "Jitter", value: `${Math.round(result.jitter)} ms` },
              { label: "Loss", value: `${result.lossPct.toFixed(0)}% (${result.received}/${result.sent})` },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-border/60 bg-background p-3">
                <div className="font-heading text-lg font-bold tabular-nums">{c.value}</div>
                <div className="text-[11px] leading-tight text-muted-foreground">{c.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Server className="size-4 text-primary" />Recent tests</h2>
            <button type="button" onClick={() => { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ } }} className="text-xs text-muted-foreground hover:text-rose-500">Clear</button>
          </div>
          <ul className="space-y-1 list-none">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm">
                <button type="button" onClick={() => run(h.host)} className="min-w-0 flex-1 truncate text-left font-mono text-xs text-foreground/90 hover:text-primary">{h.host}</button>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">min {Math.round(h.min)} ms · avg {Math.round(h.avg)} ms{h.loss > 0 ? ` · ${h.loss.toFixed(0)}% loss` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, suffix, reduceMotion, accent }: { label: string; value: number; suffix: string; reduceMotion: boolean; accent?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}
