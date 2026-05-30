"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Info,
  Lock,
  RadioTower,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  OUI_PRESETS,
  describeVendor,
  generate,
  type Casing,
  type Format,
  type MacOptions,
} from "@/lib/tools/mac/mac";

const STORAGE_KEY = "toollyz:mac-options";

const DEFAULT_OPTIONS: MacOptions = {
  count: 5,
  vendor: "random",
  format: "colon",
  casing: "upper",
};

export default function MacAddressGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [opts, setOpts] = React.useState<MacOptions>(DEFAULT_OPTIONS);
  const [results, setResults] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOpts({ ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<MacOptions>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
    } catch {
      /* noop */
    }
  }, [opts, mounted]);

  const make = React.useCallback(() => {
    try {
      setResults(generate(opts));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate");
    }
  }, [opts]);

  React.useEffect(() => {
    if (mounted) make();
  }, [mounted, make]);

  async function copyAll() {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(results.join("\n"));
      toast.success(`Copied ${results.length} address${results.length === 1 ? "" : "es"}`);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function copyOne(addr: string) {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function downloadTxt() {
    const blob = new Blob([results.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-mac-${opts.vendor}-${results.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Saved .txt");
  }

  function reset() {
    setOpts(DEFAULT_OPTIONS);
    toast.success("Reset to defaults");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Generated MAC addresses"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-2 text-xs text-indigo-200/80">
          <span className="uppercase tracking-wider">
            {results.length} address{results.length === 1 ? "" : "es"} · {describeVendor(opts.vendor)} · {opts.format} · {opts.casing}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono">
            crypto.getRandomValues
          </span>
        </div>
        <ul className="relative mt-3 max-h-64 space-y-1 overflow-auto pr-1 list-none">
          {results.map((addr, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-sm text-emerald-100"
            >
              <span className="w-6 shrink-0 text-right text-[10px] text-indigo-200/60">{i + 1}.</span>
              <code className="min-w-0 flex-1 break-all tabular-nums">{addr}</code>
              <button
                type="button"
                onClick={() => copyOne(addr)}
                className="rounded p-1 text-indigo-200/70 hover:bg-white/10 hover:text-white"
                aria-label="Copy"
              >
                <Copy className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <Button type="button" size="sm" onClick={make}>
            <RefreshCcw className="size-3.5" />
            Generate
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={copyAll} disabled={results.length === 0} className="bg-white/5 text-white">
            <Copy className="size-3.5" />
            Copy all
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={downloadTxt} disabled={results.length === 0} className="bg-white/5 text-white">
            <Download className="size-3.5" />
            Download .txt
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white">
            Reset
          </Button>
        </div>
      </section>

      {/* Options */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <RadioTower className="size-4 text-primary" />
          Options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Count">
            <Input
              type="number"
              min={1}
              max={500}
              value={opts.count}
              onChange={(e) => setOpts((o) => ({ ...o, count: Math.max(1, Math.min(500, Number(e.target.value) || 1)) }))}
              className="font-mono"
            />
          </Field>
          <Field label="Vendor (OUI prefix)">
            <Select value={opts.vendor} onValueChange={(v) => v && setOpts((o) => ({ ...o, vendor: v }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Random</SelectLabel>
                  <SelectItem value="random">Random (locally administered, unicast)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Vendor OUI</SelectLabel>
                  {OUI_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label} <span className="ml-2 font-mono text-muted-foreground">{p.prefix}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Format">
            <Select value={opts.format} onValueChange={(v) => v && setOpts((o) => ({ ...o, format: v as Format }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colon"><span>Colon</span><span className="ml-2 font-mono text-muted-foreground">AA:BB:CC:DD:EE:FF</span></SelectItem>
                <SelectItem value="dash"><span>Dash</span><span className="ml-2 font-mono text-muted-foreground">AA-BB-CC-DD-EE-FF</span></SelectItem>
                <SelectItem value="dot"><span>Cisco dot</span><span className="ml-2 font-mono text-muted-foreground">AABB.CCDD.EEFF</span></SelectItem>
                <SelectItem value="none"><span>Plain</span><span className="ml-2 font-mono text-muted-foreground">AABBCCDDEEFF</span></SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Case">
            <Select value={opts.casing} onValueChange={(v) => v && setOpts((o) => ({ ...o, casing: v as Casing }))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upper">UPPERCASE</SelectItem>
                <SelectItem value="lower">lowercase</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <RadioTower className="size-4" />
          What these bits mean
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Random mode sets the <strong>locally administered</strong> bit (bit 1 of byte 0) to 1 — the address won&apos;t collide with any IEEE-assigned OUI.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Random mode also clears the <strong>multicast / group</strong> bit (bit 0 of byte 0) to 0 — every address is a valid unicast.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Vendor presets use a sample real-world OUI for that vendor. Vendors own many OUIs each; these are just one representative each.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0" />Cisco-dot format groups by four hex digits (XXXX.XXXX.XXXX) — the format Cisco IOS uses in show commands.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the randomness
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Bytes come from <code className="font-mono">crypto.getRandomValues</code> — the browser&apos;s cryptographic PRNG.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Vendor-prefixed addresses keep the chosen 3-byte OUI verbatim and randomise only the last 3 bytes (16,777,216 combinations per OUI).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Use for network testing, dev fixtures or generating example data — not for spoofing in production environments.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — addresses are generated in your browser, settings save to localStorage.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Generated entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className={cn("text-xs font-medium")}>{label}</Label>
      {children}
    </div>
  );
}
