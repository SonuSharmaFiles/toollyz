"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Cog,
  Copy,
  Download,
  Eraser,
  Lock,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_GENERATE_OPTIONS,
  DEFAULT_RULES,
  RULE_TYPES,
  generateHtaccess,
  newRule,
  type GenerateOptions,
  type Rule,
  type RuleType,
} from "@/lib/tools/text/htaccess";

const RULES_KEY = "toollyz:htaccess-rules";
const OPT_KEY = "toollyz:htaccess-opt";

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

export default function HtaccessRedirectGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [rules, setRules] = React.useState<Rule[]>(DEFAULT_RULES);
  const [opt, setOpt] = React.useState<GenerateOptions>(DEFAULT_GENERATE_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const r = localStorage.getItem(RULES_KEY);
      if (r) {
        const parsed = JSON.parse(r);
        if (Array.isArray(parsed)) setRules(parsed);
      }
      const o = localStorage.getItem(OPT_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        if (parsed && typeof parsed === "object") setOpt({ ...DEFAULT_GENERATE_OPTIONS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(RULES_KEY, JSON.stringify(rules));
      localStorage.setItem(OPT_KEY, JSON.stringify(opt));
    } catch {
      /* noop */
    }
  }, [rules, opt, mounted]);

  const output = React.useMemo(() => generateHtaccess(rules, opt), [rules, opt]);

  function update(id: string, patch: Partial<Rule>) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function remove(id: string) {
    setRules((rs) => rs.filter((r) => r.id !== id));
  }
  function move(i: number, d: -1 | 1) {
    setRules((rs) => {
      const next = [...rs];
      const t = i + d;
      if (t < 0 || t >= next.length) return rs;
      [next[i], next[t]] = [next[t], next[i]];
      return next;
    });
  }

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      toast.success("htaccess copied");
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
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(245,158,11,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Rules" value={rules.length} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat
            label="301 (permanent)"
            value={rules.filter((r) => r.status === 301).length}
            reduceMotion={!!reduceMotion}
          />
          <Stat
            label="302 (temporary)"
            value={rules.filter((r) => r.status === 302).length}
            reduceMotion={!!reduceMotion}
          />
          <Stat label="Lines" value={output.split("\n").length} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Cog className="size-4 text-primary" />
            Rules
          </h2>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => setRules((rs) => [...rs, newRule("simple")])}>
              <Plus className="size-3.5" />
              Rule
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRules(DEFAULT_RULES)}>
              <Sparkles className="size-3.5" />
              Sample
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRules([])}>
              <Eraser className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {rules.map((r, i) => {
            const needsHost = r.type === "www-add" || r.type === "www-remove";
            const needsPath = r.type === "simple" || r.type === "wildcard" || r.type === "regex";
            return (
              <div key={r.id} className="space-y-2 rounded-xl border border-border/60 bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={r.type}
                    onChange={(e) => update(r.id, { type: e.target.value as RuleType })}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-primary"
                  >
                    {RULE_TYPES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={r.status}
                    onChange={(e) => update(r.id, { status: parseInt(e.target.value, 10) as Rule["status"] })}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-primary"
                  >
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Temporary</option>
                    <option value={307}>307 Preserve method</option>
                  </select>
                  <Toggle
                    checked={r.preserveQuery}
                    onChange={(v) => update(r.id, { preserveQuery: v })}
                    label="Keep query string"
                  />
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === rules.length - 1}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {RULE_TYPES.find((t) => t.id === r.type)?.hint}
                </p>
                {needsPath && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">From</Label>
                      <Input
                        value={r.from}
                        onChange={(e) => update(r.id, { from: e.target.value })}
                        placeholder="/old-path"
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">To</Label>
                      <Input
                        value={r.to}
                        onChange={(e) => update(r.id, { to: e.target.value })}
                        placeholder="/new-path"
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
                {needsHost && (
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Hostname</Label>
                    <Input
                      value={r.host ?? ""}
                      onChange={(e) => update(r.id, { host: e.target.value })}
                      placeholder="example.com"
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Cog className="size-4 text-primary" />
          Output options
        </h2>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={opt.wrapIfModule}
            onChange={(v) => setOpt((o) => ({ ...o, wrapIfModule: v }))}
            label="Wrap in <IfModule mod_rewrite.c>"
          />
          <Toggle
            checked={opt.addHeader}
            onChange={(v) => setOpt((o) => ({ ...o, addHeader: v }))}
            label="Add comment header"
          />
          <Toggle
            checked={opt.simpleUsesRedirectMatch}
            onChange={(v) => setOpt((o) => ({ ...o, simpleUsesRedirectMatch: v }))}
            label="Use RedirectMatch (anchored regex) for simple rules"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold tracking-tight">.htaccess output</h2>
        <textarea
          value={output}
          readOnly
          rows={18}
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={copy} disabled={!output}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => downloadText(output, ".htaccess")}
            disabled={!output}
          >
            <Download className="size-3.5" />
            Download .htaccess
          </Button>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Cog className="size-3" />
        Rule composition runs entirely in your browser — Toollyz has no server. Always test in a staging
        environment before deploying to production.
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}
