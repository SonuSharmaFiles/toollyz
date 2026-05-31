"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Clock,
  Copy,
  Download,
  Eraser,
  FileQuestion,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  VARIANT_INFO,
  VERSION_INFO,
  parse,
  parseBulk,
} from "@/lib/tools/text/uuid-validator";

const SINGLE_KEY = "toollyz:uuidv-single";
const BULK_KEY = "toollyz:uuidv-bulk";

const SAMPLE_BULK = `f47ac10b-58cc-4372-a567-0e02b2c3d479
00000000-0000-0000-0000-000000000000
3c4d7d3b-4ec8-6f3e-91d2-fbf6b58e9c01
not-a-uuid-here
018e3aa3-43b6-7c52-9ac1-92e64203abce
urn:uuid:6ba7b810-9dad-11d1-80b4-00c04fd430c8
{c3da3025-bfaa-3e80-9a83-7b3eed0f8a78}`;

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function UuidValidator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"single" | "bulk">("single");
  const [single, setSingle] = React.useState("f47ac10b-58cc-4372-a567-0e02b2c3d479");
  const [bulk, setBulk] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setSingle(localStorage.getItem(SINGLE_KEY) ?? "f47ac10b-58cc-4372-a567-0e02b2c3d479");
      setBulk(localStorage.getItem(BULK_KEY) ?? SAMPLE_BULK);
    } catch {
      setBulk(SAMPLE_BULK);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SINGLE_KEY, single);
      localStorage.setItem(BULK_KEY, bulk);
    } catch {
      /* noop */
    }
  }, [single, bulk, mounted]);

  const singleResult = React.useMemo(() => parse(single), [single]);
  const bulkResults = React.useMemo(() => parseBulk(bulk), [bulk]);
  const summary = React.useMemo(() => {
    const total = bulkResults.length;
    const valid = bulkResults.filter((r) => r.result.valid).length;
    return { total, valid, invalid: total - valid };
  }, [bulkResults]);

  async function copy(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
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
        aria-label="Validation summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(244,63,94,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {mode === "single" ? (
            <>
              <div className="space-y-1 col-span-2">
                <div className="text-xs font-medium text-sky-300/70">Status</div>
                <div className={cn("font-heading text-2xl font-bold tracking-tight sm:text-3xl", singleResult.valid ? "text-emerald-300" : "text-rose-300")}>
                  {singleResult.valid ? "Valid UUID" : "Invalid"}
                </div>
                {singleResult.error && (
                  <div className="text-[11px] text-rose-300/80">{singleResult.error}</div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-sky-300/70">Version</div>
                <div className="font-heading text-2xl font-bold text-sky-50 sm:text-3xl">
                  {singleResult.version ? `v${singleResult.version}` : "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-sky-300/70">Variant</div>
                <div className="font-heading text-base font-bold text-sky-50 sm:text-lg">
                  {singleResult.variant ? VARIANT_INFO[singleResult.variant].name : "—"}
                </div>
              </div>
            </>
          ) : (
            <>
              <Stat label="Lines" value={summary.total} reduceMotion={!!reduceMotion} />
              <Stat label="Valid" value={summary.valid} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
              <Stat label="Invalid" value={summary.invalid} reduceMotion={!!reduceMotion} accent="text-rose-300" />
              <div className="space-y-1">
                <div className="text-xs font-medium text-sky-300/70">Pass rate</div>
                <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
                  <AnimatedNumber value={summary.total === 0 ? 0 : Math.round((summary.valid / summary.total) * 100)} reduceMotion={!!reduceMotion} />
                  <span className="text-base text-sky-100/40">%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Mode picker */}
      <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
        <Seg active={mode === "single"} onClick={() => setMode("single")} label="Single UUID" />
        <Seg active={mode === "bulk"} onClick={() => setMode("bulk")} label="Bulk (one per line)" />
      </div>

      {mode === "single" ? (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <BadgeCheck className="size-4 text-primary" />
            Validate one UUID
          </h2>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">UUID input</Label>
            <Input
              value={single}
              onChange={(e) => setSingle(e.target.value)}
              placeholder="f47ac10b-58cc-4372-a567-0e02b2c3d479"
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              Accepts hyphenated (8-4-4-4-12), braced {`{…}`}, urn:uuid: prefix or bare 32-char hex.
            </p>
          </div>

          {singleResult.valid && (
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <Info label="Canonical" value={singleResult.canonical} mono />
              <Info label="Hex (no hyphens)" value={singleResult.hex} mono />
              <Info
                label="Version"
                value={singleResult.version ? `${VERSION_INFO[singleResult.version].name}` : "—"}
                description={singleResult.version ? VERSION_INFO[singleResult.version].hint : undefined}
              />
              <Info
                label="Variant"
                value={singleResult.variant ? VARIANT_INFO[singleResult.variant].name : "—"}
                description={singleResult.variant ? VARIANT_INFO[singleResult.variant].hint : undefined}
              />
              {singleResult.timestampMs && (
                <Info
                  label="Embedded timestamp"
                  value={new Date(singleResult.timestampMs).toISOString()}
                  description={`${Math.round((Date.now() - singleResult.timestampMs) / 1000)}s ago`}
                  icon={<Clock className="size-3" />}
                />
              )}
              {(singleResult.isNil || singleResult.isMax) && (
                <Info
                  label="Special"
                  value={singleResult.isNil ? "Nil UUID (all zeros)" : "Max UUID (all ones, RFC 9562)"}
                />
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => copy(singleResult.canonical)} disabled={!singleResult.valid}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy canonical
            </Button>
            <ToolBtn
              onClick={() => setSingle("f47ac10b-58cc-4372-a567-0e02b2c3d479")}
              icon={<Sparkles className="size-3.5" />}
              label="Sample v4"
            />
            <ToolBtn onClick={() => setSingle("")} icon={<Eraser className="size-3.5" />} label="Clear" />
          </div>
        </section>
      ) : (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <BadgeCheck className="size-4 text-primary" />
            Bulk validate
          </h2>
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder="One UUID per line — accepts any common form."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <div className="flex flex-wrap gap-2">
            <ToolBtn onClick={() => setBulk(SAMPLE_BULK)} icon={<Sparkles className="size-3.5" />} label="Sample" />
            <ToolBtn onClick={() => setBulk("")} icon={<Eraser className="size-3.5" />} label="Clear" />
            <ToolBtn
              onClick={() => {
                const csv = ["Line\tValid\tVersion\tVariant\tCanonical", ...bulkResults.map((b) =>
                  [b.line, b.result.valid ? "yes" : "no", b.result.version ?? "", b.result.variant ?? "", b.result.canonical].join("\t"),
                )].join("\n");
                downloadText(csv, "uuid-validation.tsv");
              }}
              icon={<Download className="size-3.5" />}
              label="Download TSV"
            />
          </div>
          {bulkResults.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Input</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Version</th>
                    <th className="px-3 py-2 text-left">Variant</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.slice(0, 200).map((b, i) => (
                    <tr key={i} className="border-t border-border/40">
                      <td className="px-3 py-1.5 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-3 py-1.5 font-mono break-all">{b.line}</td>
                      <td className="px-3 py-1.5">
                        {b.result.valid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3.5" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <X className="size-3.5" />
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-mono">{b.result.version ? `v${b.result.version}` : "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{b.result.variant ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Version reference */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <FileQuestion className="size-4 text-primary" />
          UUID version reference
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.entries(VERSION_INFO) as Array<[string, { name: string; hint: string }]>).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border/60 bg-background p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">v{k}</span>
                <span className="text-xs font-semibold">{v.name}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{v.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <AlertTriangle className="size-3" />
        Parsing and version detection run entirely in your browser — Toollyz has no server.
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

function Info({
  label,
  value,
  description,
  mono,
  icon,
}: {
  label: string;
  value: string;
  description?: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={cn("mt-0.5 break-all text-foreground/90", mono && "font-mono")}>{value}</div>
      {description && <div className="mt-1 text-[10px] text-muted-foreground">{description}</div>}
    </div>
  );
}

function Seg({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
    >
      {icon}
      {label}
    </button>
  );
}
