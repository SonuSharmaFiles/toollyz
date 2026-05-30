"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  History as HistoryIcon,
  Info,
  Link as LinkIcon,
  Lock,
  RefreshCcw,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_UTM,
  PLATFORM_PRESETS,
  analyze,
  buildUtmUrl,
  type UtmInput,
} from "@/lib/tools/seo/utm";

const SETTINGS_KEY = "toollyz:utm-input";
const HISTORY_KEY = "toollyz:utm-history";
const MAX_HISTORY = 30;

interface HistoryEntry {
  ts: number;
  url: string;
  source: string;
  medium: string;
  campaign: string;
}

function field<K extends keyof UtmInput>(input: UtmInput, k: K, v: UtmInput[K]): UtmInput {
  return { ...input, [k]: v };
}

export default function UtmLinkGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState<UtmInput>(DEFAULT_UTM);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  React.useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setInput({ ...DEFAULT_UTM, ...(JSON.parse(s) as Partial<UtmInput>) });
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as HistoryEntry[]);
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(input));
    } catch {
      /* noop */
    }
  }, [input, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  const build = React.useMemo(() => buildUtmUrl(input), [input]);
  const checks = React.useMemo(() => analyze(input), [input]);

  const generated = build.ok ? build.url : null;
  const utmCount = [input.source, input.medium, input.campaign, input.term, input.content, input.id].filter((s) => s.trim()).length;
  const generatedLen = generated?.length ?? 0;

  function applyPreset(id: string) {
    const p = PLATFORM_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setInput((prev) => ({ ...prev, source: p.source, medium: p.medium }));
    toast.success(`${p.label} preset loaded`);
  }

  function reset() {
    setInput(DEFAULT_UTM);
    toast.success("Form cleared");
  }

  async function copyUrl() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      toast.success("Copied UTM link to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  function saveToHistory() {
    if (!generated) return;
    const entry: HistoryEntry = {
      ts: Date.now(),
      url: generated,
      source: input.source.trim(),
      medium: input.medium.trim(),
      campaign: input.campaign.trim(),
    };
    setHistory((prev) => [entry, ...prev.filter((p) => p.url !== entry.url)].slice(0, MAX_HISTORY));
    toast.success("Saved to history");
  }

  function clearHistory() {
    setHistory([]);
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
        aria-label="UTM link snapshot"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="UTM params" value={utmCount} reduceMotion={!!reduceMotion} />
          <Stat label="URL length" value={generatedLen} suffix=" chars" reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Saved" value={history.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Errors" value={checks.errors.length} reduceMotion={!!reduceMotion} accent={checks.errors.length > 0 ? "text-rose-300" : "text-emerald-300"} />
        </div>
        {generated && (
          <div className="relative mt-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center">
            <Sparkles className="size-4 shrink-0 text-emerald-300" />
            <a
              href={generated}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-sm font-semibold text-emerald-100 underline-offset-4 hover:underline"
            >
              {generated}
            </a>
            <div className="ml-auto flex gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={copyUrl}>
                <Copy className="size-3.5" />
              </Button>
              <a
                href={generated}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open link"
                className="inline-flex h-7 items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Presets */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Platform presets
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Clear
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Click a preset to pre-fill source + medium. Fill in the campaign details below.</p>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORM_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              title={p.hint}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Wand2 className="size-4 text-primary" />
          Campaign details
        </h2>
        <FieldRow label="Base URL" htmlFor="baseUrl" hint="Destination page" required>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="baseUrl"
              value={input.baseUrl}
              onChange={(e) => setInput(field(input, "baseUrl", e.target.value))}
              placeholder="https://example.com/landing"
              className="pl-8 font-mono"
            />
          </div>
        </FieldRow>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="utm_source" htmlFor="source" hint="e.g. google, newsletter, partner" required>
            <Input
              id="source"
              value={input.source}
              onChange={(e) => setInput(field(input, "source", e.target.value))}
              placeholder="google"
              className="font-mono"
            />
          </FieldRow>
          <FieldRow label="utm_medium" htmlFor="medium" hint="e.g. cpc, email, social" required>
            <Input
              id="medium"
              value={input.medium}
              onChange={(e) => setInput(field(input, "medium", e.target.value))}
              placeholder="cpc"
              className="font-mono"
            />
          </FieldRow>
        </div>
        <FieldRow label="utm_campaign" htmlFor="campaign" hint="e.g. summer_launch_2026">
          <Input
            id="campaign"
            value={input.campaign}
            onChange={(e) => setInput(field(input, "campaign", e.target.value))}
            placeholder="summer_launch"
            className="font-mono"
          />
        </FieldRow>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="utm_term" htmlFor="term" hint="Paid keyword (optional)">
            <Input
              id="term"
              value={input.term}
              onChange={(e) => setInput(field(input, "term", e.target.value))}
              placeholder="running_shoes"
              className="font-mono"
            />
          </FieldRow>
          <FieldRow label="utm_content" htmlFor="content" hint="Distinguish ad variants (optional)">
            <Input
              id="content"
              value={input.content}
              onChange={(e) => setInput(field(input, "content", e.target.value))}
              placeholder="banner_top"
              className="font-mono"
            />
          </FieldRow>
        </div>
        <FieldRow label="utm_id" htmlFor="id" hint="Campaign ID for GA4 (optional)">
          <Input
            id="id"
            value={input.id}
            onChange={(e) => setInput(field(input, "id", e.target.value))}
            placeholder="abc-123"
            className="font-mono"
          />
        </FieldRow>

        {/* Options */}
        <div className="flex flex-wrap gap-3 rounded-lg border border-border/60 bg-background/60 p-3 text-xs">
          <Toggle
            label="Lowercase parameter values"
            value={input.lowercase}
            onChange={(v) => setInput(field(input, "lowercase", v))}
          />
          <Toggle
            label="Convert spaces to underscores"
            value={input.spacesToUnderscores}
            onChange={(v) => setInput(field(input, "spacesToUnderscores", v))}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button type="button" onClick={copyUrl} disabled={!generated}>
            <Copy className="size-4" />
            Copy link
          </Button>
          <Button type="button" variant="outline" onClick={saveToHistory} disabled={!generated}>
            <Sparkles className="size-4" />
            Save
          </Button>
          {generated && (
            <a
              href={`/tools/url-shortener/?u=${encodeURIComponent(generated)}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <ArrowUpRight className="size-4" />
              Shorten this link
            </a>
          )}
        </div>
      </section>

      {/* Checks */}
      {(checks.errors.length > 0 || checks.warnings.length > 0 || checks.tips.length > 0) && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <CheckCircle2 className="size-4 text-primary" />
            Link checks
          </h2>
          <ul className="space-y-1.5 text-xs list-none">
            {checks.errors.map((e, i) => (
              <CheckItem key={`e-${i}`} kind="error" text={e} />
            ))}
            {checks.warnings.map((w, i) => (
              <CheckItem key={`w-${i}`} kind="warn" text={w} />
            ))}
            {checks.tips.map((t, i) => (
              <CheckItem key={`t-${i}`} kind="info" text={t} />
            ))}
          </ul>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <HistoryIcon className="size-4 text-primary" />
              Saved links
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={clearHistory}>
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1.5 list-none">
            {history.map((h, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-background p-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-indigo-600 dark:text-indigo-400">{h.source}</span>
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-sky-600 dark:text-sky-400">{h.medium}</span>
                  {h.campaign && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-emerald-600 dark:text-emerald-400">{h.campaign}</span>}
                  <span className="ml-auto text-muted-foreground">{new Date(h.ts).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-mono text-xs text-primary underline-offset-4 hover:underline"
                  >
                    {h.url}
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(h.url);
                        toast.success("Copied");
                      } catch {
                        toast.error("Couldn't copy");
                      }
                    }}
                    className="ml-auto shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Copy link"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reference */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          UTM parameter reference
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><BarChart3 className="mt-0.5 size-3.5 shrink-0 text-primary" /><span><code className="font-mono">utm_source</code> — where the traffic comes from (google, newsletter, partner).</span></li>
          <li className="flex items-start gap-1.5"><BarChart3 className="mt-0.5 size-3.5 shrink-0 text-primary" /><span><code className="font-mono">utm_medium</code> — the channel (cpc, email, social, referral).</span></li>
          <li className="flex items-start gap-1.5"><BarChart3 className="mt-0.5 size-3.5 shrink-0 text-primary" /><span><code className="font-mono">utm_campaign</code> — the name of the campaign (summer_launch).</span></li>
          <li className="flex items-start gap-1.5"><BarChart3 className="mt-0.5 size-3.5 shrink-0 text-primary" /><span><code className="font-mono">utm_term</code> — the paid keyword.</span></li>
          <li className="flex items-start gap-1.5"><BarChart3 className="mt-0.5 size-3.5 shrink-0 text-primary" /><span><code className="font-mono">utm_content</code> — distinguishes ad creatives (banner_top vs banner_bottom).</span></li>
          <li className="flex items-start gap-1.5"><BarChart3 className="mt-0.5 size-3.5 shrink-0 text-primary" /><span><code className="font-mono">utm_id</code> — campaign ID used by GA4 for cross-system attribution.</span></li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Sparkles className="size-3 text-emerald-500" />
        Built entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function FieldRow({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs font-medium">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-border accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div
        className={cn(
          "font-heading text-2xl font-bold tabular-nums sm:text-3xl",
          accent ?? "text-indigo-50",
        )}
      >
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}

function CheckItem({ kind, text }: { kind: "error" | "warn" | "info"; text: string }) {
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-lg border p-2",
        kind === "error" && "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400",
        kind === "warn" && "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
        kind === "info" && "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400",
      )}
    >
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
