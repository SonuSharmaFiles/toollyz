"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  v1 as uuidV1,
  v4 as uuidV4,
  v6 as uuidV6,
  v7 as uuidV7,
  validate as uuidValidate,
  version as uuidVersion,
} from "uuid";
import {
  Check,
  Copy,
  Download,
  Fingerprint,
  Hash,
  Repeat,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type UuidVersion = "v1" | "v4" | "v6" | "v7";

const VERSION_OPTIONS: {
  value: UuidVersion;
  label: string;
  description: string;
}[] = [
  { value: "v1", label: "v1", description: "Time + MAC based" },
  { value: "v4", label: "v4", description: "Random (recommended)" },
  { value: "v6", label: "v6", description: "Reordered v1, sortable" },
  { value: "v7", label: "v7", description: "Unix-time prefixed" },
];

const QUANTITY_OPTIONS = [1, 5, 10, 25, 50, 100];

const VERSION_GENERATORS: Record<UuidVersion, () => string> = {
  v1: uuidV1,
  v4: uuidV4,
  v6: uuidV6,
  v7: uuidV7,
};

function generateUuids(v: UuidVersion, count: number): string[] {
  const gen = VERSION_GENERATORS[v];
  const out = new Array<string>(count);
  for (let i = 0; i < count; i++) out[i] = gen();
  return out;
}

function formatUuid(raw: string, uppercase: boolean, stripHyphens: boolean) {
  let out = raw;
  if (stripHyphens) out = out.replace(/-/g, "");
  return uppercase ? out.toUpperCase() : out;
}

export default function UuidGenerator() {
  const [version, setVersion] = React.useState<UuidVersion>("v4");
  const [quantity, setQuantity] = React.useState<number>(5);
  const [uppercase, setUppercase] = React.useState(false);
  const [stripHyphens, setStripHyphens] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [results, setResults] = React.useState<string[]>(() =>
    generateUuids("v4", 5),
  );
  const [isPending, startTransition] = React.useTransition();

  const formattedResults = React.useMemo(
    () => results.map((r) => formatUuid(r, uppercase, stripHyphens)),
    [results, uppercase, stripHyphens],
  );

  const generate = React.useCallback(() => {
    startTransition(() => {
      setResults(generateUuids(version, quantity));
    });
  }, [version, quantity]);

  React.useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      setResults(generateUuids(version, quantity));
    }, 1500);
    return () => window.clearInterval(id);
  }, [autoRefresh, version, quantity]);

  async function copyAll() {
    if (!formattedResults.length) return;
    try {
      await navigator.clipboard.writeText(formattedResults.join("\n"));
      toast.success(`Copied ${formattedResults.length} UUIDs to clipboard`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  function downloadTxt() {
    if (!formattedResults.length) return;
    const blob = new Blob([formattedResults.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-uuids-${version}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${formattedResults.length} UUIDs`);
  }

  function clearResults() {
    setResults([]);
    toast.info("Cleared");
  }

  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="generate" className="gap-2">
          <Sparkles className="size-3.5" />
          Generate
        </TabsTrigger>
        <TabsTrigger value="validate" className="gap-2">
          <ShieldCheck className="size-3.5" />
          Validate
        </TabsTrigger>
      </TabsList>

      {/* ─── GENERATE TAB ──────────────────────────────────────────── */}
      <TabsContent value="generate" className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>UUID Version</Label>
              <Select
                value={version}
                onValueChange={(v) => setVersion(v as UuidVersion)}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERSION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="font-medium">UUID {opt.label}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {opt.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Select
                value={String(quantity)}
                onValueChange={(v) => setQuantity(Number(v))}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUANTITY_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "UUID" : "UUIDs"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:self-end">
            <Button
              type="button"
              size="lg"
              onClick={generate}
              disabled={isPending}
              className="flex-1 lg:flex-none"
            >
              <Repeat className="size-4" />
              Generate
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleChip
            active={uppercase}
            onClick={() => setUppercase((v) => !v)}
            label="UPPERCASE"
          />
          <ToggleChip
            active={stripHyphens}
            onClick={() => setStripHyphens((v) => !v)}
            label="Remove hyphens"
          />
          <ToggleChip
            active={autoRefresh}
            onClick={() => setAutoRefresh((v) => !v)}
            label="Auto-refresh"
            tooltip="Regenerate every 1.5s"
          />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Fingerprint className="size-4 text-primary" />
            <span>
              <span className="font-medium text-foreground">
                {formattedResults.length}
              </span>{" "}
              {formattedResults.length === 1 ? "UUID" : "UUIDs"} generated
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyAll}
              disabled={!formattedResults.length}
            >
              <Copy className="size-3.5" />
              Copy all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTxt}
              disabled={!formattedResults.length}
            >
              <Download className="size-3.5" />
              Download
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearResults}
              disabled={!formattedResults.length}
            >
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>

        {/* Results list */}
        {formattedResults.length === 0 ? (
          <EmptyState onGenerate={generate} />
        ) : (
          <ol
            aria-label="Generated UUIDs"
            className="space-y-2 list-none"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {formattedResults.map((value, idx) => (
                <motion.li
                  key={`${value}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.01, 0.15) }}
                >
                  <UuidRow value={value} index={idx + 1} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </TabsContent>

      {/* ─── VALIDATE TAB ──────────────────────────────────────────── */}
      <TabsContent value="validate" className="space-y-5">
        <UuidValidator />
      </TabsContent>
    </Tabs>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function UuidRow({ value, index }: { value: string; index: number }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("UUID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40">
      <span
        aria-hidden="true"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground tabular-nums"
      >
        {String(index).padStart(2, "0")}
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground/90">
        {value}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        aria-label={`Copy UUID ${index}`}
        className="opacity-60 transition-opacity group-hover:opacity-100"
      >
        {copied ? (
          <Check className="text-emerald-500" />
        ) : (
          <Copy />
        )}
      </Button>
    </div>
  );
}

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  tooltip?: string;
}

function ToggleChip({ active, onClick, label, tooltip }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-1.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted-foreground/40",
        )}
      />
      {label}
    </button>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Fingerprint className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">No UUIDs yet</p>
        <p className="text-xs text-muted-foreground">
          Hit Generate to create UUIDs — they appear here instantly.
        </p>
      </div>
      <Button type="button" size="sm" onClick={onGenerate}>
        <Sparkles className="size-3.5" />
        Generate now
      </Button>
    </div>
  );
}

// ─── Validator ────────────────────────────────────────────────────────────

interface ValidationResult {
  raw: string;
  normalized: string;
  isValid: boolean;
  version: number | null;
  isNil: boolean;
  isMax: boolean;
}

function analyzeUuid(input: string): ValidationResult {
  const trimmed = input.trim();
  // Auto-insert hyphens if user pastes raw 32-char form
  let normalized = trimmed.toLowerCase();
  if (/^[0-9a-f]{32}$/.test(normalized)) {
    normalized = `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;
  }

  const isValid = uuidValidate(normalized);
  let v: number | null = null;
  if (isValid) {
    try {
      v = uuidVersion(normalized);
    } catch {
      v = null;
    }
  }

  return {
    raw: trimmed,
    normalized,
    isValid,
    version: v,
    isNil: normalized === "00000000-0000-0000-0000-000000000000",
    isMax: normalized.toLowerCase() === "ffffffff-ffff-ffff-ffff-ffffffffffff",
  };
}

function UuidValidator() {
  const [input, setInput] = React.useState("");
  const result = React.useMemo(() => (input.trim() ? analyzeUuid(input) : null), [input]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="uuid-validate-input">Paste a UUID</Label>
        <Input
          id="uuid-validate-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
          className="h-12 rounded-xl font-mono text-base"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="uuid-validate-help"
        />
        <p id="uuid-validate-help" className="text-xs text-muted-foreground">
          Hyphens optional — uppercase, lowercase and mixed case all work.
        </p>
      </div>

      {!result ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          Paste any UUID above to validate it and reveal its version.
        </div>
      ) : (
        <div
          aria-live="polite"
          className={cn(
            "space-y-4 rounded-2xl border p-5 transition-colors",
            result.isValid
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                result.isValid
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-destructive/15 text-destructive",
              )}
              aria-hidden="true"
            >
              {result.isValid ? (
                <ShieldCheck className="size-4" />
              ) : (
                <ShieldAlert className="size-4" />
              )}
            </span>
            <div className="space-y-0.5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  result.isValid ? "text-emerald-700 dark:text-emerald-400" : "text-destructive",
                )}
              >
                {result.isValid ? "Valid UUID" : "Invalid UUID"}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.isValid
                  ? result.isNil
                    ? "This is the Nil UUID (all zeros)."
                    : result.isMax
                      ? "This is the Max UUID (all ones)."
                      : `Detected as UUID version ${result.version}.`
                  : "This string does not match the UUID format. Check length, characters and hyphens."}
              </p>
            </div>
          </div>

          {result.isValid && (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Version" value={result.version != null ? `v${result.version}` : "—"} icon={<Hash className="size-3.5" />} />
              <Detail label="Variant" value="RFC 4122" icon={<Shield className="size-3.5" />} />
              <Detail label="Normalized" value={result.normalized} mono icon={<Fingerprint className="size-3.5" />} />
              <Detail
                label="Length"
                value={`${result.normalized.length} chars · 128 bits`}
                icon={<Hash className="size-3.5" />}
              />
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

interface DetailProps {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}

function Detail({ label, value, mono, icon }: DetailProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm text-foreground break-all",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
