"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlignJustify,
  BookOpen,
  Clock,
  Copy,
  Check,
  Download,
  FileText,
  Hash,
  Pilcrow,
  Repeat,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  generateIpsum,
  computeStats,
  type IpsumUnit,
  type IpsumFormat,
} from "@/lib/tools/lorem/generator";
import { MODE_LIST, type IpsumMode } from "@/lib/tools/lorem/vocab";

const UNIT_OPTIONS: { value: IpsumUnit; label: string; icon: React.ElementType }[] = [
  { value: "paragraphs", label: "Paragraphs", icon: Pilcrow },
  { value: "sentences", label: "Sentences", icon: AlignJustify },
  { value: "words", label: "Words", icon: Type },
  { value: "characters", label: "Characters", icon: Hash },
];

const FORMAT_OPTIONS: { value: IpsumFormat; label: string }[] = [
  { value: "plain", label: "Plain text" },
  { value: "html", label: "HTML <p>" },
  { value: "markdown", label: "Markdown" },
];

const QUANTITY_PRESETS = [1, 3, 5, 10, 20];

export default function LoremIpsumGenerator() {
  const [mode, setMode] = React.useState<IpsumMode>("classic");
  const [unit, setUnit] = React.useState<IpsumUnit>("paragraphs");
  const [quantity, setQuantity] = React.useState(3);
  const [startWithLorem, setStartWithLorem] = React.useState(true);
  const [includeCommas, setIncludeCommas] = React.useState(true);
  const [lineBreaks, setLineBreaks] = React.useState(false);
  const [format, setFormat] = React.useState<IpsumFormat>("plain");
  const [output, setOutput] = React.useState("");

  const quantityRanges: Record<IpsumUnit, { min: number; max: number; step: number }> = {
    paragraphs: { min: 1, max: 50, step: 1 },
    sentences: { min: 1, max: 100, step: 1 },
    words: { min: 5, max: 1000, step: 5 },
    characters: { min: 50, max: 5000, step: 50 },
  };
  const range = quantityRanges[unit];

  const generate = React.useCallback(() => {
    const result = generateIpsum({
      mode,
      unit,
      quantity,
      startWithLorem,
      includeCommas,
      lineBreaks,
      format,
    });
    setOutput(result);
  }, [mode, unit, quantity, startWithLorem, includeCommas, lineBreaks, format]);

  React.useEffect(() => {
    generate();
    // intentionally only on mount + when generate identity changes
  }, [generate]);

  // Clamp quantity when unit changes
  React.useEffect(() => {
    if (quantity < range.min) setQuantity(range.min);
    if (quantity > range.max) setQuantity(range.max);
  }, [unit, range.min, range.max, quantity]);

  const stats = React.useMemo(() => computeStats(output), [output]);

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  function downloadOutput() {
    if (!output) return;
    const ext = format === "html" ? "html" : format === "markdown" ? "md" : "txt";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-ipsum-${mode}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }

  function clearOutput() {
    setOutput("");
    toast.info("Cleared");
  }

  return (
    <div className="space-y-6">
      {/* ─── Controls ───────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Generation type</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as IpsumUnit)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <Icon className="text-muted-foreground" />
                      {opt.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ipsum mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as IpsumMode)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_LIST.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground"> · {m.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Output format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as IpsumFormat)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ipsum-quantity">
              Quantity — <span className="text-foreground tabular-nums">{quantity}</span>
              <span className="text-muted-foreground"> {unit}</span>
            </Label>
            <div className="flex flex-wrap items-center gap-1">
              {QUANTITY_PRESETS.filter((n) => n >= range.min && n <= range.max).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuantity(n)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    quantity === n
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Slider
            id="ipsum-quantity"
            value={[quantity]}
            onValueChange={(v) => setQuantity(Array.isArray(v) ? v[0] : v)}
            min={range.min}
            max={range.max}
            step={range.step}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {mode === "classic" && (
            <ToggleChip
              active={startWithLorem}
              onClick={() => setStartWithLorem((v) => !v)}
              label='Start with "Lorem ipsum…"'
            />
          )}
          <ToggleChip
            active={includeCommas}
            onClick={() => setIncludeCommas((v) => !v)}
            label="Insert commas"
          />
          <ToggleChip
            active={lineBreaks}
            onClick={() => setLineBreaks((v) => !v)}
            label="Line breaks between sentences"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" onClick={generate}>
            <Repeat className="size-4" />
            Regenerate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={copyOutput}
            disabled={!output}
          >
            <Copy className="size-4" />
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={downloadOutput}
            disabled={!output}
          >
            <Download className="size-4" />
            Download
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={clearOutput}
            disabled={!output}
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* ─── Stats row ──────────────────────────────────────────────── */}
      <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Type className="size-4" />}
          label="Words"
          value={stats.words.toLocaleString()}
        />
        <StatCard
          icon={<Hash className="size-4" />}
          label="Characters"
          value={stats.characters.toLocaleString()}
          hint={`${stats.charactersNoSpaces.toLocaleString()} no spaces`}
        />
        <StatCard
          icon={<AlignJustify className="size-4" />}
          label="Sentences"
          value={stats.sentences.toLocaleString()}
        />
        <StatCard
          icon={<Pilcrow className="size-4" />}
          label="Paragraphs"
          value={stats.paragraphs.toLocaleString()}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Reading time"
          value={`${stats.readingMinutes} min`}
        />
      </ul>

      {/* ─── Output ─────────────────────────────────────────────────── */}
      {!output ? (
        <EmptyState onGenerate={generate} />
      ) : (
        <motion.div
          key={output.slice(0, 30)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-border/70 bg-card"
        >
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="size-3.5 text-primary" />
              <span>
                {MODE_LIST.find((m) => m.id === mode)?.label} ipsum · {format.toUpperCase()}
              </span>
            </div>
            <InlineCopy value={output} />
          </div>
          <div className="max-h-[480px] overflow-auto p-5 sm:p-7">
            {format === "html" ? (
              <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/90">
                {output}
              </pre>
            ) : (
              <article className="space-y-4 text-[15px] leading-[1.75] text-foreground/90">
                {output.split(/\n\s*\n/).map((paragraph, i) => (
                  <p key={i} className="text-pretty whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </article>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function ToggleChip({ active, onClick, label }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}

function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <li className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </li>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BookOpen className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">No placeholder text yet</p>
        <p className="text-xs text-muted-foreground">
          Pick a mode and quantity, then hit Regenerate.
        </p>
      </div>
      <Button type="button" size="sm" onClick={onGenerate}>
        <Sparkles className="size-3.5" />
        Generate now
      </Button>
    </div>
  );
}

function InlineCopy({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted"
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}
