"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Info,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  TestTube2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  AI_AGENTS,
  COMMON_AGENTS,
  PRESETS,
  type PresetId,
  type RobotsInput,
  type RuleBlock,
  buildRobotsTxt,
  emptyBlock,
  stats,
  testPath,
  validate,
} from "@/lib/tools/seo/robots";

const STORAGE_KEY = "toollyz:robots-input";

const DEFAULT_INPUT: RobotsInput = {
  blocks: [
    {
      id: "default-1",
      userAgents: ["*"],
      allow: ["/"],
      disallow: ["/admin/", "/private/"],
    },
  ],
  sitemaps: ["https://example.com/sitemap.xml"],
};

export default function RobotsTxtGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState<RobotsInput>(DEFAULT_INPUT);
  const [testAgent, setTestAgent] = React.useState("Googlebot");
  const [testUrl, setTestUrl] = React.useState("/admin/users");

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RobotsInput;
        if (parsed && Array.isArray(parsed.blocks)) setInput(parsed);
      }
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      /* noop */
    }
  }, [input, mounted]);

  const output = React.useMemo(() => buildRobotsTxt(input), [input]);
  const { errors, warnings } = React.useMemo(() => validate(input), [input]);
  const s = React.useMemo(() => stats(input), [input]);
  const testResult = React.useMemo(() => testPath(input, testAgent, testUrl), [input, testAgent, testUrl]);

  function applyPreset(id: PresetId) {
    const p = PRESETS.find((p) => p.id === id);
    if (!p) return;
    const next = p.build();
    // Carry over existing sitemaps so a preset never erases them.
    setInput({ ...next, sitemaps: input.sitemaps });
    toast.success(`${p.label} preset loaded`);
  }

  function reset() {
    setInput(DEFAULT_INPUT);
    toast.success("Reset to defaults");
  }

  function addBlock() {
    setInput((prev) => ({ ...prev, blocks: [...prev.blocks, emptyBlock()] }));
  }

  function removeBlock(id: string) {
    setInput((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }));
  }

  function updateBlock(id: string, patch: Partial<RuleBlock>) {
    setInput((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function setSitemaps(s: string) {
    setInput((prev) => ({
      ...prev,
      sitemaps: s.split("\n").map((x) => x.trim()).filter(Boolean),
    }));
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied robots.txt to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded robots.txt");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-28 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="Robots.txt stats"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Rule blocks" value={s.blocks} reduceMotion={!!reduceMotion} />
          <Stat label="User-agents" value={s.uniqueAgents} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="Allow rules" value={s.allowRules} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Disallow rules" value={s.disallowRules} reduceMotion={!!reduceMotion} accent="text-rose-300" />
          <Stat label="Sitemaps" value={s.sitemaps} reduceMotion={!!reduceMotion} accent="text-sky-300" />
        </div>
      </section>

      {/* Presets + reset */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Presets
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              title={p.description}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* Rule blocks editor */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Bot className="size-4 text-primary" />
              User-agent rule blocks
            </h2>
            <Button type="button" size="sm" variant="outline" onClick={addBlock}>
              <Plus className="size-3.5" />
              Add block
            </Button>
          </div>

          {input.blocks.map((b, idx) => (
            <BlockEditor
              key={b.id}
              block={b}
              index={idx}
              canRemove={input.blocks.length > 1}
              onChange={(patch) => updateBlock(b.id, patch)}
              onRemove={() => removeBlock(b.id)}
            />
          ))}

          {/* Sitemaps */}
          <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
            <Label htmlFor="sitemaps" className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <FileText className="size-4 text-primary" />
              Sitemaps
            </Label>
            <Textarea
              id="sitemaps"
              value={input.sitemaps.join("\n")}
              onChange={(e) => setSitemaps(e.target.value)}
              placeholder={`https://example.com/sitemap.xml\nhttps://example.com/sitemap-news.xml`}
              className="min-h-[88px] font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">One absolute URL per line. Both Google and Bing recommend listing every sitemap here.</p>
          </div>

          {/* Path tester */}
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <TestTube2 className="size-4 text-primary" />
              Path tester
            </h3>
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
              <Select value={testAgent} onValueChange={(v) => v && setTestAgent(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set(["*", ...COMMON_AGENTS, ...AI_AGENTS])].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="/some/path"
                className="font-mono"
              />
            </div>
            <div
              className={cn(
                "rounded-lg border p-3 text-sm",
                testResult.allowed
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400",
              )}
            >
              <div className="font-semibold">
                {testResult.allowed ? "Allowed" : "Disallowed"}
              </div>
              <div className="mt-0.5 text-xs">
                Matched <code className="rounded bg-background/60 px-1 py-0.5 font-mono">{testResult.matched}</code>
                {testResult.blockIndex >= 0 && ` (block ${testResult.blockIndex + 1})`}
              </div>
            </div>
          </div>
        </section>

        {/* Output + checks */}
        <section className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <FileText className="size-4 text-primary" />
                robots.txt
              </h2>
              <div className="flex gap-1.5">
                <Button type="button" size="sm" variant="outline" onClick={copyOutput}>
                  <Copy className="size-4" />
                  Copy
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={downloadOutput}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="max-h-[420px] overflow-auto rounded-lg border border-border/60 bg-background p-3 text-[12px] leading-relaxed">
              <code className="font-mono">{output}</code>
            </pre>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="size-3" />
              Place this file at the root of your domain: <code className="font-mono">/robots.txt</code>.
            </p>
          </div>

          {(errors.length > 0 || warnings.length > 0) && (
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <CheckCircle2 className="size-4 text-primary" />
                Checks
              </h2>
              <ul className="space-y-1.5 text-xs list-none">
                {errors.map((e, i) => (
                  <li
                    key={`e-${i}`}
                    className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2 text-rose-700 dark:text-rose-400"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{e}</span>
                  </li>
                ))}
                {warnings.map((w, i) => (
                  <li
                    key={`w-${i}`}
                    className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-amber-700 dark:text-amber-400"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Sparkles className="size-3 text-emerald-500" />
        Generated entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function BlockEditor({
  block,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  block: RuleBlock;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<RuleBlock>) => void;
  onRemove: () => void;
}) {
  const [agentInput, setAgentInput] = React.useState("");

  function addAgent(value: string) {
    const v = value.trim();
    if (!v) return;
    if (block.userAgents.includes(v)) {
      setAgentInput("");
      return;
    }
    onChange({ userAgents: [...block.userAgents, v] });
    setAgentInput("");
  }

  function removeAgent(v: string) {
    onChange({ userAgents: block.userAgents.filter((u) => u !== v) });
  }

  function blockAllAi() {
    const next = [...new Set([...block.userAgents, ...AI_AGENTS])];
    onChange({ userAgents: next });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wider text-muted-foreground">
          BLOCK {index + 1}
        </div>
        {canRemove && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">User-agents</Label>
        <div className="flex flex-wrap gap-1.5">
          {block.userAgents.map((ua) => (
            <span
              key={ua}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs"
            >
              {ua}
              <button
                type="button"
                onClick={() => removeAgent(ua)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${ua}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Input
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAgent(agentInput);
              }
            }}
            placeholder="Add user-agent (Enter)"
            className="font-mono text-xs"
            list={`agents-${block.id}`}
          />
          <datalist id={`agents-${block.id}`}>
            {[...COMMON_AGENTS, ...AI_AGENTS].map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <Button type="button" size="sm" variant="outline" onClick={() => addAgent(agentInput)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => addAgent("*")}
            className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:bg-muted"
          >
            + *
          </button>
          <button
            type="button"
            onClick={() => addAgent("Googlebot")}
            className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:bg-muted"
          >
            + Googlebot
          </button>
          <button
            type="button"
            onClick={() => addAgent("Bingbot")}
            className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:bg-muted"
          >
            + Bingbot
          </button>
          <button
            type="button"
            onClick={blockAllAi}
            className="rounded-md border border-rose-500/30 bg-rose-500/5 px-2 py-0.5 text-[11px] text-rose-700 hover:bg-rose-500/10 dark:text-rose-400"
          >
            + All AI bots
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Allow paths</Label>
          <Textarea
            value={block.allow.join("\n")}
            onChange={(e) =>
              onChange({
                allow: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder={`/\n/blog/`}
            className="min-h-[88px] font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-rose-700 dark:text-rose-400">Disallow paths</Label>
          <Textarea
            value={block.disallow.join("\n")}
            onChange={(e) =>
              onChange({
                disallow: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder={`/admin/\n/private/`}
            className="min-h-[88px] font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Crawl-delay (seconds, optional)</Label>
        <Input
          type="number"
          min={0}
          max={86400}
          value={block.crawlDelay ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange({ crawlDelay: v === "" ? undefined : Math.max(0, Number(v) || 0) });
          }}
          placeholder="e.g. 10"
          className="w-32 font-mono text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Honored by Bing, Yandex and Yahoo — Google ignores it. Use Google Search Console for Googlebot rate.
        </p>
      </div>
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
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div
        className={cn(
          "font-heading text-2xl font-bold tabular-nums sm:text-3xl",
          accent ?? "text-indigo-50",
        )}
      >
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}
