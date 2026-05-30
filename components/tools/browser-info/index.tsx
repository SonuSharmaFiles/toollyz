"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppWindow, Check, Code2, Copy, Languages, Layers, Lock, RefreshCw, ShieldCheck, Settings2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import {
  collectBrowser,
  featureMatrix,
  queryPermissions,
  snapshotJson,
  type BrowserSnapshot,
  type Feature,
  type PermissionRow,
} from "@/lib/tools/info/browser";

export default function BrowserInfo() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<BrowserSnapshot | null>(null);
  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [perms, setPerms] = React.useState<PermissionRow[]>([]);

  const refresh = React.useCallback(async () => {
    setSnapshot(collectBrowser());
    setFeatures(featureMatrix());
    setPerms(await queryPermissions());
  }, []);

  React.useEffect(() => { setMounted(true); refresh(); }, [refresh]);

  if (!mounted || !snapshot) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-32 animate-pulse rounded-3xl bg-muted" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div></div>;
  }

  const featureGroups = features.reduce<Record<string, Feature[]>>((acc, f) => { (acc[f.group] ??= []).push(f); return acc; }, {});

  async function copyJson() {
    const json = snapshotJson(snapshot!, features, perms);
    try { await navigator.clipboard.writeText(json); toast.success("Snapshot copied"); } catch { toast.error("Could not copy"); }
  }
  function downloadJson() {
    const json = snapshotJson(snapshot!, features, perms);
    downloadText(json, "browser-info.json", "application/json");
    toast.success("Downloaded");
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Browser identity" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-indigo-300/70">You are using</div>
            <div className="font-heading text-3xl font-bold tracking-tight text-indigo-50 sm:text-5xl">{snapshot.name} <span className="text-indigo-300/80">{snapshot.version.split(".")[0]}</span></div>
            <div className="text-sm text-indigo-200/80">on {snapshot.os} · {snapshot.engine}{snapshot.uaMobile !== undefined ? ` · ${snapshot.uaMobile ? "mobile" : "desktop"}` : ""}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={refresh} className="border-white/15 bg-white/5 text-indigo-50 hover:bg-white/10"><RefreshCw className="size-4" />Refresh</Button>
            <Button type="button" size="sm" variant="outline" onClick={copyJson} className="border-white/15 bg-white/5 text-indigo-50 hover:bg-white/10"><Copy className="size-4" />Copy as JSON</Button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Identity" icon={<AppWindow className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Browser">{snapshot.name}</Row>
            <Row label="Version">{snapshot.version || "—"}</Row>
            <Row label="Engine">{snapshot.engine}</Row>
            <Row label="Operating system">{snapshot.os}</Row>
            {snapshot.uaPlatform && <Row label="UA platform">{snapshot.uaPlatform}</Row>}
            {snapshot.uaBrands && <Row label="UA brands">{snapshot.uaBrands}</Row>}
          </dl>
        </Card>

        <Card title="Locale & timezone" icon={<Languages className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Languages">{snapshot.languages}</Row>
            <Row label="Primary">{snapshot.primaryLanguage}</Row>
            <Row label="Timezone">{snapshot.timezone}</Row>
          </dl>
        </Card>

        <Card title="Preferences & state" icon={<Settings2 className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Color scheme">{snapshot.colorScheme}</Row>
            <Row label="Reduced motion">{snapshot.reducedMotion ? "On" : "Off"}</Row>
            <Row label="Contrast">{snapshot.contrast}</Row>
            <Row label="Cookies">{snapshot.cookiesEnabled ? "Enabled" : "Disabled"}</Row>
            <Row label="Do Not Track">{snapshot.dnt}</Row>
            <Row label="Online">{snapshot.online ? "Yes" : "No"}</Row>
          </dl>
        </Card>

        <Card title="Window" icon={<Code2 className="size-4" />}>
          <dl className="space-y-1.5 text-sm">
            <Row label="Inner size">{snapshot.innerSize}</Row>
            <Row label="Outer size">{snapshot.outerSize}</Row>
          </dl>
        </Card>

        <Card title="User agent" icon={<Code2 className="size-4" />} className="sm:col-span-2">
          <button type="button" onClick={() => navigator.clipboard.writeText(snapshot.userAgent).then(() => toast.success("UA copied")).catch(() => {})} className="block w-full overflow-x-auto rounded-lg border border-border/60 bg-background p-3 text-left font-mono text-xs break-all text-foreground/90 hover:text-primary" title="Click to copy">{snapshot.userAgent}</button>
        </Card>

        {perms.length > 0 && (
          <Card title="Permissions" icon={<ShieldCheck className="size-4" />} className="sm:col-span-2">
            <ul className="grid grid-cols-2 gap-1.5 list-none sm:grid-cols-3 lg:grid-cols-4">
              {perms.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background p-2 text-sm">
                  <span className="truncate text-foreground/80">{p.name}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    p.state === "granted" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                    p.state === "denied" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" :
                    p.state === "prompt" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                    "bg-muted text-muted-foreground")}>{p.state}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Feature matrix */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Layers className="size-4 text-primary" />Web API support</h2>
          <Button type="button" size="sm" variant="outline" onClick={downloadJson}><Copy className="size-4" />Download JSON</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(featureGroups).map(([group, list]) => (
            <motion.div key={group} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</h3>
              <ul className="space-y-1 list-none">
                {list.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 text-sm">
                    {f.supported
                      ? <Check className="size-3.5 shrink-0 text-emerald-500" />
                      : <X className="size-3.5 shrink-0 text-rose-500/70" />}
                    <span className={cn(f.supported ? "text-foreground/90" : "text-muted-foreground line-through")}>{f.name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Everything shown here is read in your browser — Toollyz has no server.</p>
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
