"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  FileCode,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_DUMP_OPTIONS,
  dumpYaml,
  parseYaml,
  statsOf,
} from "@/lib/tools/text/yaml-json";

const YAML_KEY = "toollyz:yamljson-yaml";
const JSON_KEY = "toollyz:yamljson-json";
const MODE_KEY = "toollyz:yamljson-mode";

const SAMPLE_YAML = `# Sample: GitHub Actions workflow snippet
name: ci
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: pnpm install
      - name: Build
        run: pnpm build
matrix:
  node:
    - 18
    - 20
    - 22
config:
  debug: true
  retries: 3
  notes: |
    Multi-line
    notes here.`;

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function YamlToJson() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"yaml-to-json" | "json-to-yaml">("yaml-to-json");
  const [yaml, setYaml] = React.useState("");
  const [json, setJson] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setYaml(localStorage.getItem(YAML_KEY) ?? SAMPLE_YAML);
      setJson(localStorage.getItem(JSON_KEY) ?? "");
      const m = localStorage.getItem(MODE_KEY);
      if (m === "yaml-to-json" || m === "json-to-yaml") setMode(m);
    } catch {
      setYaml(SAMPLE_YAML);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(YAML_KEY, yaml);
      localStorage.setItem(JSON_KEY, json);
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [yaml, json, mode, mounted]);

  const yamlParsed = React.useMemo(() => parseYaml(yaml), [yaml]);
  const jsonAsYaml = React.useMemo(() => {
    try {
      return dumpYaml(JSON.parse(json || "null"), DEFAULT_DUMP_OPTIONS);
    } catch (e) {
      return e instanceof Error ? `# Invalid JSON: ${e.message}` : "# Invalid JSON";
    }
  }, [json]);
  const yamlAsJson = React.useMemo(
    () => (yamlParsed.ok ? JSON.stringify(yamlParsed.value, null, 2) : `// Error: ${yamlParsed.error}`),
    [yamlParsed],
  );
  const stats = React.useMemo(() => statsOf(yamlParsed, yaml), [yamlParsed, yaml]);

  const output = mode === "yaml-to-json" ? yamlAsJson : jsonAsYaml;

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
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
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Scalars" value={stats.scalars} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Maps" value={stats.maps} reduceMotion={!!reduceMotion} />
          <Stat label="Sequences" value={stats.sequences} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", yamlParsed.ok ? "text-emerald-300" : "text-rose-300")}>
              {yamlParsed.ok ? "Valid YAML" : "Invalid"}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
          <Seg active={mode === "yaml-to-json"} onClick={() => setMode("yaml-to-json")} label="YAML → JSON" />
          <Seg active={mode === "json-to-yaml"} onClick={() => setMode("json-to-yaml")} label="JSON → YAML" />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (mode === "yaml-to-json") {
              setJson(yamlAsJson);
              setMode("json-to-yaml");
            } else {
              setYaml(jsonAsYaml);
              setMode("yaml-to-json");
            }
          }}
        >
          <ArrowLeftRight className="size-3.5" />
          Swap
        </Button>
        <button
          type="button"
          onClick={() => setYaml(SAMPLE_YAML)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample
        </button>
        <button
          type="button"
          onClick={() => {
            setYaml("");
            setJson("");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
      </div>

      {!yamlParsed.ok && mode === "yaml-to-json" && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3.5" />
          {yamlParsed.error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={mode === "yaml-to-json" ? "YAML input" : "JSON input"}>
          <textarea
            value={mode === "yaml-to-json" ? yaml : json}
            onChange={(e) => {
              if (mode === "yaml-to-json") setYaml(e.target.value);
              else setJson(e.target.value);
            }}
            rows={18}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Panel>
        <Panel label={mode === "yaml-to-json" ? "JSON output" : "YAML output"}>
          <textarea
            value={output}
            readOnly
            rows={18}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copy} disabled={!output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                downloadText(
                  output,
                  mode === "yaml-to-json" ? "data.json" : "data.yaml",
                  mode === "yaml-to-json" ? "application/json" : "application/x-yaml",
                )
              }
              disabled={!output}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <FileCode className="size-3" />
        Bidirectional conversion runs entirely in your browser with a from-scratch YAML 1.2 subset
        parser. Anchors and aliases (& *) are not supported.
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

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="mb-2 text-sm font-semibold tracking-tight">{label}</h2>
      {children}
    </section>
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
