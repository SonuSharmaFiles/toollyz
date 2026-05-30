"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Copy,
  Globe,
  Info,
  Loader2,
  Lock,
  Mail,
  Network,
  RefreshCcw,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserCircle,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { isOnline } from "@/lib/tools/shared/net";
import {
  SAMPLE_DOMAINS,
  ageDays,
  daysUntil,
  findEntity,
  findEventDate,
  formatIsoDate,
  lookupDomain,
  type DomainResult,
  type LookupResult,
} from "@/lib/tools/whois/rdap";

const DOMAIN_KEY = "toollyz:whois-domain";

export default function WhoisLookup() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [domain, setDomain] = React.useState("google.com");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<DomainResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [errorKind, setErrorKind] = React.useState<LookupResult extends { ok: false; kind: infer K } ? K : never | null>(null as never);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try {
      const d = localStorage.getItem(DOMAIN_KEY);
      if (d) setDomain(d);
    } catch {
      /* noop */
    }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const run = React.useCallback(async (target?: string) => {
    const d = (target ?? domain).trim();
    if (!d) {
      toast.error("Enter a domain");
      return;
    }
    if (!isOnline()) {
      setOnline(false);
      return;
    }
    if (target) setDomain(target);
    setRunning(true);
    setError(null);
    setErrorKind(null as never);
    setResult(null);
    try {
      localStorage.setItem(DOMAIN_KEY, d);
    } catch {
      /* noop */
    }
    const r = await lookupDomain(d);
    if (r.ok) {
      setResult(r.result);
    } else {
      setError(r.error);
      setErrorKind(r.kind as never);
    }
    setRunning(false);
  }, [domain]);

  // Auto-run once on mount with the saved domain.
  React.useEffect(() => {
    if (mounted) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const registered = result ? findEventDate(result, "registration") : undefined;
  const expires = result ? findEventDate(result, "expiration") : undefined;
  const updated = result ? findEventDate(result, "last changed") ?? findEventDate(result, "last update of RDAP database") : undefined;
  const age = ageDays(registered);
  const expiryDays = daysUntil(expires);
  const registrar = result ? findEntity(result, "registrar") : undefined;
  const registrant = result ? findEntity(result, "registrant") : undefined;
  const admin = result ? findEntity(result, "administrative") : undefined;
  const tech = result ? findEntity(result, "technical") : undefined;
  const abuse = result ? findEntity(result, "abuse") : undefined;

  async function copyJson() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast.success("Copied JSON");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Domain lookup result"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat label="Domain" value={result?.domain ?? domain} mono />
          <HeroStat label="Age (days)" value={age !== null ? <AnimatedNumber value={age} reduceMotion={!!reduceMotion} /> : "—"} accent="text-indigo-300" />
          <HeroStat label="Expires in" value={expiryDays !== null ? <AnimatedNumber value={expiryDays} reduceMotion={!!reduceMotion} suffix=" d" /> : "—"} accent={expiryDays !== null && expiryDays < 30 ? "text-rose-300" : "text-emerald-300"} />
          <HeroStat label="Nameservers" value={result ? <AnimatedNumber value={result.nameservers.length} reduceMotion={!!reduceMotion} /> : "—"} accent="text-sky-300" />
        </div>
      </section>

      {/* Search */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="example.com"
              className="pl-8 font-mono text-sm"
              aria-label="Domain"
            />
          </div>
          <Button type="button" onClick={() => run()} disabled={running}>
            {running ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Looking up…
              </>
            ) : (
              <>
                <SearchCheck className="size-4" />
                Lookup
              </>
            )}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Try:</span>
          {SAMPLE_DOMAINS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => run(d)}
              disabled={running}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              {d}
            </button>
          ))}
        </div>
        {!online && (
          <p className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
            <WifiOff className="size-4" />
            You appear to be offline.
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            {error}
          </p>
        )}
      </section>

      {/* Result */}
      {result && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              RDAP server <code className="font-mono">{result.rdapServer}</code>
              {" · "}
              <CheckCircle2 className="inline size-3 text-emerald-500" />{" "}
              data fetched directly from your browser
            </p>
            <Button type="button" size="sm" variant="ghost" onClick={copyJson}>
              <Copy className="size-3.5" />
              Copy JSON
            </Button>
          </div>

          {/* Dates */}
          <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
            <DateCard
              icon={<CalendarClock className="size-4 text-emerald-500" />}
              label="Registered"
              iso={registered}
            />
            <DateCard
              icon={<CalendarClock className="size-4 text-amber-500" />}
              label="Updated"
              iso={updated}
            />
            <DateCard
              icon={<CalendarClock className="size-4 text-rose-500" />}
              label="Expires"
              iso={expires}
              warning={expiryDays !== null && expiryDays < 30 ? `${expiryDays} day${expiryDays === 1 ? "" : "s"} left` : undefined}
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Registrar */}
            <Card icon={<Building2 className="size-4 text-primary" />} title="Registrar">
              {registrar ? (
                <EntityBlock e={registrar} />
              ) : (
                <Empty>No registrar in the response.</Empty>
              )}
            </Card>

            {/* Registrant */}
            <Card icon={<UserCircle className="size-4 text-primary" />} title="Registrant">
              {registrant ? (
                <EntityBlock e={registrant} />
              ) : (
                <Empty>Registrant details are redacted by the registry — common since GDPR (2018).</Empty>
              )}
            </Card>

            {/* Admin */}
            <Card icon={<UserCircle className="size-4 text-primary" />} title="Administrative contact">
              {admin ? <EntityBlock e={admin} /> : <Empty>Not disclosed.</Empty>}
            </Card>

            {/* Tech */}
            <Card icon={<ServerCog className="size-4 text-primary" />} title="Technical contact">
              {tech ? <EntityBlock e={tech} /> : <Empty>Not disclosed.</Empty>}
            </Card>

            {/* Abuse */}
            {abuse && (
              <Card icon={<Mail className="size-4 text-primary" />} title="Abuse contact">
                <EntityBlock e={abuse} />
              </Card>
            )}

            {/* Statuses */}
            <Card icon={<ShieldCheck className="size-4 text-primary" />} title="Status & security">
              <ul className="space-y-1 list-none">
                {(result.status ?? []).length === 0 && <Empty>No status flags reported.</Empty>}
                {(result.status ?? []).map((s, i) => (
                  <li key={i} className="rounded-md border border-border/60 bg-background px-2 py-1 font-mono text-xs">
                    {s}
                  </li>
                ))}
                {result.secureDNS && (
                  <li className="mt-1 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className={cn("size-3.5", result.secureDNS.delegationSigned ? "text-emerald-500" : "text-muted-foreground")} />
                    {result.secureDNS.delegationSigned ? "DNSSEC signed" : "DNSSEC not enabled"}
                  </li>
                )}
              </ul>
            </Card>
          </div>

          {/* Nameservers */}
          <Card icon={<Network className="size-4 text-primary" />} title={`Nameservers (${result.nameservers.length})`}>
            {result.nameservers.length === 0 ? (
              <Empty>No nameservers in the response.</Empty>
            ) : (
              <ul className="space-y-1.5 list-none">
                {result.nameservers.map((ns, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: reduceMotion ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-border/60 bg-background p-2.5"
                  >
                    <div className="font-mono text-sm">{ns.ldhName}</div>
                    {(ns.ipv4 || ns.ipv6) && (
                      <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                        {ns.ipv4?.map((ip, j) => (
                          <span key={`v4-${j}`} className="rounded bg-muted px-1.5 py-0.5 font-mono">v4 · {ip}</span>
                        ))}
                        {ns.ipv6?.map((ip, j) => (
                          <span key={`v6-${j}`} className="rounded bg-muted px-1.5 py-0.5 font-mono">v6 · {ip}</span>
                        ))}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {/* About */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this lookup
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5">
            <ServerCog className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz uses RDAP — the modern IETF standard that replaces WHOIS. Your browser fetches a per-TLD server list from IANA, then queries that registry directly.
          </li>
          <li className="flex items-start gap-1.5">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Registrant names, emails and phone numbers are usually redacted post-GDPR — that&apos;s a registry policy, not a Toollyz limitation.
          </li>
          <li className="flex items-start gap-1.5">
            <Globe className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Some ccTLDs (.de, .fr, .uk, .ru, …) still rely on port-43 WHOIS or block cross-origin browser requests — those lookups fail with a clear message.
          </li>
          <li className="flex items-start gap-1.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Toollyz has no server in the chain — your browser talks to IANA and the registry directly. Last-queried domain is saved to localStorage.
          </li>
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <RefreshCcw className="size-3" />
          IANA bootstrap is cached for 24 hours so lookups stay fast.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Sparkles className="size-3 text-emerald-500" />
        Lookup runs in your browser — Toollyz has no backend.
      </p>
    </div>
  );
}

function HeroStat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-indigo-50", mono && "font-mono break-all text-xl sm:text-2xl")}>
        {value}
      </div>
    </div>
  );
}

function DateCard({
  icon,
  label,
  iso,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  iso?: string;
  warning?: string;
}) {
  return (
    <div className="space-y-1 rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm font-medium">{formatIsoDate(iso)}</div>
      {warning && <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{warning}</div>}
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function EntityBlock({ e }: { e: { name?: string; org?: string; email?: string; phone?: string; url?: string; roles: string[]; handle?: string } }) {
  return (
    <div className="space-y-1.5 text-xs">
      {e.org && <Row label="Org" value={e.org} mono />}
      {e.name && e.name !== e.org && <Row label="Name" value={e.name} />}
      {e.email && <Row label="Email" value={e.email} mono />}
      {e.phone && <Row label="Phone" value={e.phone} mono />}
      {e.url && <Row label="URL" value={e.url} mono link />}
      {e.handle && <Row label="Handle" value={e.handle} mono muted />}
      {e.roles.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {e.roles.map((r) => (
            <span key={r} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  link,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: boolean;
  muted?: boolean;
}) {
  const inner = link ? (
    <a href={value} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-4 hover:underline">
      {value}
    </a>
  ) : (
    <span className={cn("break-all", muted && "text-muted-foreground")}>{value}</span>
  );
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("flex-1", mono && "font-mono")}>{inner}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/20 p-2.5 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}
