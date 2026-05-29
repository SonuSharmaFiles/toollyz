"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Globe,
  Languages,
  Loader2,
  Lock,
  MapPin,
  Monitor,
  Network,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isOnline } from "@/lib/tools/shared/net";
import { flagEmoji, getIpv6, getLocalIps, lookupIp, type IpInfo, type LocalIps } from "@/lib/tools/net/ip";

interface ConnInfo { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }
interface BrowserInfo { platform: string; languages: string; timezone: string; screen: string; dpr: number; cores?: number; memory?: number; ua: string }

function readConn(): ConnInfo | null {
  if (typeof navigator === "undefined") return null;
  const c = (navigator as unknown as { connection?: ConnInfo }).connection;
  if (!c || (c.effectiveType === undefined && c.downlink === undefined && c.rtt === undefined)) return null;
  return { effectiveType: c.effectiveType, downlink: c.downlink, rtt: c.rtt, saveData: c.saveData };
}
function readBrowser(): BrowserInfo {
  const nav = navigator as unknown as { hardwareConcurrency?: number; deviceMemory?: number; platform?: string };
  return {
    platform: nav.platform ?? "—",
    languages: navigator.languages?.join(", ") || navigator.language || "—",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "—",
    screen: `${window.screen.width} × ${window.screen.height}`,
    dpr: window.devicePixelRatio || 1,
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
    ua: navigator.userAgent,
  };
}

export default function IpAddressFinder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [info, setInfo] = React.useState<IpInfo | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [ipv6, setIpv6] = React.useState<string | null | "pending">("pending");
  const [local, setLocal] = React.useState<LocalIps | null>(null);
  const [conn, setConn] = React.useState<ConnInfo | null>(null);
  const [browser, setBrowser] = React.useState<BrowserInfo | null>(null);
  const [copied, setCopied] = React.useState(false);

  const run = React.useCallback(async () => {
    if (!isOnline()) { setOnline(false); setLoading(false); return; }
    setOnline(true);
    setLoading(true);
    setError(null);
    setIpv6("pending");
    const [res, v6, loc] = await Promise.all([lookupIp(), getIpv6(), getLocalIps()]);
    if (res.ok && res.info) setInfo(res.info); else setError(res.error ?? "Lookup failed");
    setIpv6(v6);
    setLocal(loc);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    setConn(readConn());
    setBrowser(readBrowser());
    run();
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [run]);

  async function copyIp() {
    if (!info?.ip) return;
    try { await navigator.clipboard.writeText(info.ip); setCopied(true); window.setTimeout(() => setCopied(false), 1200); toast.success("IP copied"); } catch { toast.error("Could not copy"); }
  }

  const locationLine = info ? [info.city, info.region, info.country].filter(Boolean).join(", ") : "";

  if (!mounted) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-40 animate-pulse rounded-3xl bg-muted" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero — public IP */}
      <section aria-label="Your public IP" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-300/70"><Globe className="size-3.5" />Your public IP address</span>
            <Button type="button" size="sm" variant="outline" onClick={run} disabled={loading} className="border-white/15 bg-white/5 text-indigo-50 hover:bg-white/10">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Refresh
            </Button>
          </div>
          {!online ? (
            <div className="mt-4 flex items-center gap-2 text-rose-300"><WifiOff className="size-5" />You appear to be offline.</div>
          ) : loading && !info ? (
            <div className="mt-4 h-10 w-64 animate-pulse rounded-lg bg-white/10" />
          ) : error ? (
            <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2 text-rose-300"><AlertTriangle className="size-5" />{error}</p>
              <Button type="button" size="sm" variant="outline" onClick={run} className="border-white/15 bg-white/5 text-indigo-50 hover:bg-white/10"><RefreshCw className="size-4" />Try again</Button>
            </div>
          ) : info ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button type="button" onClick={copyIp} className="group inline-flex items-center gap-2 font-heading text-3xl font-bold tracking-tight text-indigo-50 sm:text-5xl" title="Click to copy">
                {info.ip}
                <span className="text-indigo-300/60 transition-colors group-hover:text-indigo-200">{copied ? <Check className="size-6" /> : <Copy className="size-6" />}</span>
              </button>
              {locationLine && <span className="text-lg text-indigo-200/80">{flagEmoji(info.countryCode)} {locationLine}</span>}
            </div>
          ) : null}
          {info && <p className="relative mt-3 text-[11px] text-indigo-300/60">Looked up via {info.provider}. Toollyz has no server — this request goes directly from your browser.</p>}
        </div>
      </section>

      {/* Detail cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Location & ISP" icon={<MapPin className="size-4" />}>
          {info ? (
            <dl className="space-y-1.5 text-sm">
              <Row label="City">{info.city || "—"}</Row>
              <Row label="Region">{info.region || "—"}</Row>
              <Row label="Country">{info.country ? `${flagEmoji(info.countryCode)} ${info.country}` : "—"}</Row>
              <Row label="ISP">{info.isp || "—"}</Row>
              <Row label="Organization">{info.org || "—"}</Row>
              <Row label="Timezone">{info.timezone || "—"}</Row>
              {info.lat !== undefined && info.lng !== undefined && <Row label="Coordinates">{info.lat.toFixed(3)}, {info.lng.toFixed(3)}</Row>}
            </dl>
          ) : <Muted>{loading ? "Looking up location…" : "Location unavailable."}</Muted>}
        </Card>

        <Card title="IPv6" icon={<Network className="size-4" />}>
          {ipv6 === "pending" ? <Muted>Checking…</Muted> : ipv6 && ipv6.includes(":") ? (
            <button type="button" onClick={() => { navigator.clipboard.writeText(ipv6).then(() => toast.success("IPv6 copied")).catch(() => {}); }} className="break-all text-left font-mono text-sm text-foreground/90 hover:text-primary" title="Click to copy">{ipv6}</button>
          ) : <Muted>No public IPv6 detected — your network is likely IPv4-only or behind CGNAT.</Muted>}
        </Card>

        <Card title="Local IP (this device)" icon={<Server className="size-4" />}>
          {local === null ? <Muted>Detecting…</Muted> : local.addresses.length > 0 ? (
            <div className="space-y-1">
              {local.addresses.map((a) => <div key={a} className="break-all font-mono text-sm text-foreground/90">{a}</div>)}
              <p className="text-[11px] text-muted-foreground">Detected in your browser via WebRTC — never sent anywhere.</p>
            </div>
          ) : local.obscured ? (
            <Muted>Your browser hides your local IP for privacy (it appears as a random <span className="font-mono">.local</span> name). That&apos;s expected and a good thing.</Muted>
          ) : <Muted>Local IP not available in this browser.</Muted>}
        </Card>

        {conn && (
          <Card title="Connection" icon={<Wifi className="size-4" />}>
            <dl className="space-y-1.5 text-sm">
              {conn.effectiveType && <Row label="Effective type">{conn.effectiveType.toUpperCase()}</Row>}
              {conn.downlink !== undefined && <Row label="Downlink (est.)">{conn.downlink} Mbps</Row>}
              {conn.rtt !== undefined && <Row label="Round-trip (est.)">{conn.rtt} ms</Row>}
              {conn.saveData !== undefined && <Row label="Data saver">{conn.saveData ? "On" : "Off"}</Row>}
            </dl>
            <p className="mt-2 text-[11px] text-muted-foreground">Coarse browser estimate. For a real measurement, try the Internet Speed Test.</p>
          </Card>
        )}

        {browser && (
          <Card title="Browser & device" icon={<Monitor className="size-4" />} className={cn(!conn && "sm:col-span-2")}>
            <dl className="space-y-1.5 text-sm">
              <Row label="Platform">{browser.platform}</Row>
              <Row label="Languages"><Languages className="mr-1 inline size-3.5 text-muted-foreground" />{browser.languages}</Row>
              <Row label="Timezone">{browser.timezone}</Row>
              <Row label="Screen">{browser.screen} @ {browser.dpr}×</Row>
              {browser.cores !== undefined && <Row label="CPU cores">{browser.cores}</Row>}
              {browser.memory !== undefined && <Row label="Device memory">{browser.memory} GB</Row>}
            </dl>
          </Card>
        )}
      </div>

      {/* Privacy note */}
      <motion.section initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Lock className="size-4 text-emerald-500" />Privacy</h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Toollyz has no server — your IP is looked up directly from your browser via ipwho.is (fallbacks: ipapi.co, ipify).</li>
          <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Finding your public IP necessarily reveals it to that lookup provider; we store nothing.</li>
          <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />IP-based location is approximate (often your ISP's hub or VPN exit, not your home).</li>
          <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Your local IP is detected in-browser (WebRTC, Google STUN) and never leaves your device.</li>
        </ul>
      </motion.section>
    </div>
  );
}

function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border/70 bg-card p-4", className)}>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><span className="text-primary">{icon}</span>{title}</h2>
      {children}
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-3"><dt className="shrink-0 text-muted-foreground">{label}</dt><dd className="break-all text-right font-medium text-foreground/90">{children}</dd></div>;
}
function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
