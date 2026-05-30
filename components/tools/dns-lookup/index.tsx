"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Copy, Globe, Info, Loader2, Network, Search, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isOnline } from "@/lib/tools/shared/net";
import { ALL_TYPES, DEFAULT_TYPES, SAMPLE_DOMAIN, TYPE_DESCRIPTIONS, formatTtl, lookupDns, type DnsResult, type RecordType } from "@/lib/tools/net/dns";

const DOMAIN_KEY = "toollyz:dns-domain";
const TYPES_KEY = "toollyz:dns-types";

const POPULAR = ["google.com", "github.com", "cloudflare.com", "wikipedia.org"];

export default function DnsLookup() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [domain, setDomain] = React.useState(SAMPLE_DOMAIN);
  const [types, setTypes] = React.useState<Set<RecordType>>(new Set(DEFAULT_TYPES));
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<DnsResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try {
      const d = localStorage.getItem(DOMAIN_KEY); if (d) setDomain(d);
      const t = localStorage.getItem(TYPES_KEY); if (t) { const arr = JSON.parse(t) as RecordType[]; setTypes(new Set(arr)); }
    } catch { /* noop */ }
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  function toggle(t: RecordType) {
    setTypes((prev) => { const next = new Set(prev); if (next.has(t)) next.delete(t); else next.add(t); return next; });
  }

  async function run(target?: string) {
    const d = target ?? domain;
    if (!isOnline()) { setOnline(false); return; }
    if (!d.trim()) { toast.error("Enter a domain"); return; }
    if (types.size === 0) { toast.error("Pick at least one record type"); return; }
    if (target) setDomain(target);
    setRunning(true); setError(null); setResult(null);
    try { localStorage.setItem(DOMAIN_KEY, d); localStorage.setItem(TYPES_KEY, JSON.stringify([...types])); } catch { /* noop */ }
    const res = await lookupDns(d, [...types]);
    if (res.ok && res.result) setResult(res.result); else setError(res.error ?? "Lookup failed");
    setRunning(false);
  }

  async function copyResult() {
    if (!result) return;
    const text = result.results
      .map((r) => `;; ${r.type}\n${r.records.map((rec) => `${rec.name}\t${rec.ttl}\t${r.type}\t${rec.data}`).join("\n") || (r.nxdomain ? "; NXDOMAIN" : r.error ? `; ${r.error}` : "; no records")}\n`)
      .join("\n");
    try { await navigator.clipboard.writeText(text); toast.success("Records copied"); } catch { toast.error("Could not copy"); }
  }

  if (!mounted) return <div className="space-y-4" aria-hidden="true"><div className="h-28 animate-pulse rounded-3xl bg-muted" /><div className="h-32 animate-pulse rounded-2xl bg-muted" /></div>;

  const totalRecords = result?.results.reduce((s, r) => s + r.records.length, 0) ?? 0;
  const errors = result?.results.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="DNS lookup" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroCell label="Domain" value={result?.domain ?? domain} mono />
          <HeroCell label="Types queried" value={result ? String(result.results.length) : String(types.size)} />
          <HeroCell label="Records found" value={result ? String(totalRecords) : "—"} accent="text-emerald-300" />
          <HeroCell label="Errors" value={result ? String(errors) : "—"} accent={errors > 0 ? "text-rose-300" : undefined} />
        </div>
      </section>

      {/* Controls */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="example.com" className="pl-8 font-mono text-sm" aria-label="Domain" />
          </div>
          <Button type="button" onClick={() => run()} disabled={running}>{running ? <><Loader2 className="size-4 animate-spin" />Looking up…</> : <><Search className="size-4" />Lookup</>}</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => toggle(t)} aria-pressed={types.has(t)} title={TYPE_DESCRIPTIONS[t]} className={cn("rounded-md border px-2 py-1 font-mono text-xs font-medium transition-colors", types.has(t) ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-foreground/70 hover:bg-muted")}>{t}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Try:</span>
          {POPULAR.map((d) => (
            <button key={d} type="button" onClick={() => run(d)} disabled={running} className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-muted disabled:opacity-50">{d}</button>
          ))}
        </div>
        {!online && <p className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400"><WifiOff className="size-4" />You appear to be offline.</p>}
        {error && <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{error}</p>}
      </section>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Button type="button" size="sm" variant="outline" onClick={copyResult}><Copy className="size-4" />Copy results</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.results.map((r) => (
              <motion.section key={r.type} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">{r.type}</span>
                  <span className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[r.type]}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.records.length} record{r.records.length === 1 ? "" : "s"}</span>
                </div>
                {!r.ok ? (
                  <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400"><AlertTriangle className="size-3.5" />{r.error}</p>
                ) : r.nxdomain ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 dark:text-amber-400">NXDOMAIN — no DNS record exists for this name.</p>
                ) : r.records.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-muted/20 p-2.5 text-center text-xs text-muted-foreground">No {r.type} records.</p>
                ) : (
                  <ul className="space-y-1 list-none">
                    {r.records.map((rec, i) => (
                      <li key={i} className="rounded-lg border border-border/60 bg-background p-2.5 font-mono text-xs">
                        <div className="break-all text-foreground/90">{rec.data}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{rec.name}</span><span aria-hidden>·</span><span>TTL {formatTtl(rec.ttl)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Check className="size-3 text-emerald-500" />Resolved via {result.provider} (DNS-over-HTTPS). Toollyz has no server.</p>
        </div>
      )}

      {/* Caveats */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Info className="size-4 text-primary" />About these results</h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Network className="mt-0.5 size-3.5 shrink-0 text-primary" />Records come from Cloudflare's public DNS-over-HTTPS API (the 1.1.1.1 resolver), not your system DNS — results may differ slightly.</li>
          <li className="flex items-start gap-1.5"><Network className="mt-0.5 size-3.5 shrink-0 text-primary" />Pick the record types you want with the chips above. Each is queried in parallel.</li>
          <li className="flex items-start gap-1.5"><Network className="mt-0.5 size-3.5 shrink-0 text-primary" />“NXDOMAIN” means the name doesn't exist for that record type. Caching means TTLs you see may be lower than the authoritative value.</li>
          <li className="flex items-start gap-1.5"><Network className="mt-0.5 size-3.5 shrink-0 text-primary" />Requests go directly from your browser to Cloudflare — Toollyz has no server in the path.</li>
        </ul>
      </section>
    </div>
  );
}

function HeroCell({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-xl font-bold tracking-tight sm:text-2xl break-all", mono && "font-mono", accent ?? "text-indigo-50")}>{value}</div>
    </div>
  );
}
