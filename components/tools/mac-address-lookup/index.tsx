"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Eraser,
  Info,
  Lock,
  Radio,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { OUI_DB_SIZE, parseMac, type MacInfo } from "@/lib/tools/text/mac-lookup";

const STATE_KEY = "toollyz:mac-input";

const PRESETS = [
  { label: "Apple iPhone", value: "f8:e9:4e:12:34:56" },
  { label: "Cisco router", value: "00-00-0c-aa-bb-cc" },
  { label: "Raspberry Pi", value: "b827eb112233" },
  { label: "Cisco dot-form", value: "0050.5612.3456" },
  { label: "Locally-administered", value: "02:42:ac:11:00:02" },
  { label: "Broadcast", value: "ff:ff:ff:ff:ff:ff" },
];

export default function MacAddressLookup() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(STATE_KEY) ?? PRESETS[0].value);
    } catch {
      setText(PRESETS[0].value);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STATE_KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  const result = React.useMemo(() => parseMac(text), [text]);

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="MAC lookup summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(168,85,247,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Vendor</div>
            <div className="font-heading text-2xl font-bold tracking-tight text-sky-50 sm:text-3xl truncate">
              {result.valid ? (result.vendor || "Unknown — not in our bundled table") : "—"}
            </div>
            {result.valid && (
              <div className="text-[11px] text-muted-foreground">
                OUI {result.oui.match(/.{2}/g)!.join(":").toUpperCase()} ·{" "}
                <span className="capitalize">{result.kind}</span> ·{" "}
                <span className="capitalize">{result.admin}-administered</span>
              </div>
            )}
          </div>
          <Stat
            label="OUI table"
            value={OUI_DB_SIZE}
            reduceMotion={!!reduceMotion}
            accent="text-emerald-300"
          />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", result.valid ? "text-emerald-300" : "text-rose-300")}>
              {result.valid ? "Valid MAC" : "Invalid"}
            </div>
          </div>
        </div>
      </section>

      {/* Input */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ScanSearch className="size-4 text-primary" />
          MAC address
        </h2>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Paste a MAC in any common format</Label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            className="font-mono"
          />
          <p className="text-[10px] text-muted-foreground">
            Accepts <code className="font-mono">AA:BB:CC:DD:EE:FF</code>,{" "}
            <code className="font-mono">AA-BB-CC-DD-EE-FF</code>,{" "}
            <code className="font-mono">AABB.CCDD.EEFF</code> (Cisco) and bare 12-hex.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setText(p.value)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              <Sparkles className="size-3" />
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Eraser className="size-3" />
            Clear
          </button>
        </div>
        {result.error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {result.error}
          </div>
        )}
      </section>

      {/* Format card */}
      {result.valid && (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Copy className="size-4 text-primary" />
              Format variants
            </h2>
            <div className="space-y-2 text-xs">
              <FormatRow label="Canonical (lower)" value={result.canonical} copyKey="c" copied={copied} onCopy={copy} />
              <FormatRow label="Canonical (UPPER)" value={result.upper} copyKey="u" copied={copied} onCopy={copy} />
              <FormatRow label="Dashed" value={result.dashed} copyKey="d" copied={copied} onCopy={copy} />
              <FormatRow label="Cisco dot-form" value={result.cisco} copyKey="ci" copied={copied} onCopy={copy} />
              <FormatRow label="Bare 12-hex" value={result.bare} copyKey="b" copied={copied} onCopy={copy} />
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Radio className="size-4 text-primary" />
              Classification
            </h2>
            <ClassRow
              icon={<Radio className="size-4" />}
              label="Transmission type"
              value={result.kind === "broadcast" ? "Broadcast (FF:FF:FF:FF:FF:FF)" : result.kind === "multicast" ? "Multicast" : "Unicast"}
              hint={
                result.kind === "broadcast"
                  ? "Targets every device on the local network segment."
                  : result.kind === "multicast"
                  ? "Reaches a group of subscribed receivers. Often used by mDNS, video and gaming."
                  : "Targets a single specific device on the network."
              }
              good={result.kind === "unicast"}
            />
            <ClassRow
              icon={<Info className="size-4" />}
              label="Administration"
              value={result.admin === "universal" ? "Universally administered" : "Locally administered"}
              hint={
                result.admin === "universal"
                  ? "The OUI was assigned by IEEE to a manufacturer — we look it up below."
                  : "Software-set address (Docker, randomised privacy MAC, virtual NIC). No OUI lookup."
              }
              good={result.admin === "universal"}
            />
          </div>
        </section>
      )}

      {/* Vendor table info */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the OUI table
        </h2>
        <p className="text-xs text-muted-foreground">
          Toollyz bundles {OUI_DB_SIZE} hand-curated OUI prefixes covering the manufacturers most
          home networks encounter — Apple, Cisco, Intel, Samsung, Google, Amazon, Microsoft, HP, Dell,
          Lenovo, Asus, Raspberry Pi, Espressif, Sonos, Roku, Sony, Nintendo and friends. We don&apos;t
          ship the full IEEE registry (~50 000 entries, ~5 MB) because most users only need the
          high-traffic prefixes. Locally-administered or virtual NIC addresses won&apos;t have a vendor
          lookup — that&apos;s by design.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ScanSearch className="size-3" />
        Lookup runs entirely in your browser against the bundled OUI table — Toollyz has no server.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function FormatRow({
  label,
  value,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyKey: string;
  copied: string | null;
  onCopy: (v: string, k: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
      <span className="w-32 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground/90">{value}</code>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => onCopy(value, copyKey)}
        className="h-7 px-2"
      >
        {copied === copyKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}

function ClassRow({
  icon,
  label,
  value,
  hint,
  good,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  good: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        good ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-amber-500/30 bg-amber-500/[0.06]",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        {icon}
        {label}
      </div>
      <div className={cn("mt-0.5 text-sm font-medium", good ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>
        {value}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
