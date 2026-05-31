"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Eraser,
  Lock,
  Search,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  SAMPLE_JSON,
  SAMPLE_XML,
  parse,
  searchTree,
  type TreeNode,
} from "@/lib/tools/text/api-tree";

const KEY = "toollyz:apitree-input";

export default function ApiResponseViewer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [focused, setFocused] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLE_JSON);
    } catch {
      setText(SAMPLE_JSON);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  const deferred = React.useDeferredValue(text);
  const result = React.useMemo(() => parse(deferred), [deferred]);
  const hits = React.useMemo(() => (result.root && query ? searchTree(result.root, query) : []), [result.root, query]);

  // Expand the top two levels by default whenever the input changes.
  React.useEffect(() => {
    if (!result.root) {
      setExpanded({});
      return;
    }
    const next: Record<string, boolean> = {};
    function walk(n: TreeNode, depth: number) {
      if (depth < 2 && n.children) next[n.path] = true;
      n.children?.forEach((c) => walk(c, depth + 1));
    }
    walk(result.root, 0);
    setExpanded(next);
  }, [result.root]);

  function toggle(path: string) {
    setExpanded((e) => ({ ...e, [path]: !e[path] }));
  }

  function expandAll() {
    if (!result.root) return;
    const next: Record<string, boolean> = {};
    function walk(n: TreeNode) {
      if (n.children) next[n.path] = true;
      n.children?.forEach(walk);
    }
    walk(result.root);
    setExpanded(next);
  }
  function collapseAll() {
    setExpanded({});
  }

  async function copy(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Stat label="Nodes" value={result.stats.nodes} reduceMotion={!!reduceMotion} accent="text-emerald-300" />
          <Stat label="Leaves" value={result.stats.leaves} reduceMotion={!!reduceMotion} />
          <Stat label="Depth" value={result.stats.maxDepth} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Format</div>
            <div className="font-heading text-base font-bold tracking-tight text-sky-50 sm:text-lg uppercase">
              {result.format}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Status</div>
            <div className={cn("font-heading text-lg font-bold tracking-tight sm:text-xl", result.ok ? "text-emerald-300" : "text-rose-300")}>
              {result.ok ? "Parsed" : "Error"}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setText(SAMPLE_JSON)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          JSON sample
        </button>
        <button
          type="button"
          onClick={() => setText(SAMPLE_XML)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          XML sample
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ServerCog className="size-4 text-primary" />
          API response (JSON or XML)
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        {result.error && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5" />
            {result.error}
          </div>
        )}
      </section>

      {result.root && (
        <>
          <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                <Search className="size-4 text-primary" />
                Tree
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search keys or values…"
                  className="h-8 max-w-xs font-mono text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={expandAll}>
                  Expand all
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={collapseAll}>
                  Collapse
                </Button>
              </div>
            </div>
            {hits.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-background p-2">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {hits.length} match{hits.length === 1 ? "" : "es"}
                </div>
                <ul className="max-h-32 space-y-1 overflow-y-auto pr-1 list-none">
                  {hits.slice(0, 100).map((h, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setFocused(h.path)}
                        className="w-full rounded px-1.5 py-0.5 text-left font-mono text-[11px] hover:bg-muted"
                      >
                        <span className="text-primary">{h.path}</span> — {h.preview}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="max-h-[640px] overflow-auto rounded-xl border border-border/60 bg-background p-2">
              <NodeView node={result.root} depth={0} expanded={expanded} onToggle={toggle} onFocus={setFocused} focused={focused} />
            </div>
          </section>

          {focused && (
            <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected path</h3>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
                <code className="min-w-0 flex-1 break-all font-mono text-xs">{focused}</code>
                <Button type="button" size="sm" variant="ghost" onClick={() => copy(focused)} className="h-7 px-2">
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </section>
          )}
        </>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ServerCog className="size-3" />
        Tree parsing uses native JSON.parse for JSON and DOMParser for XML — runs entirely in your browser.
      </p>
    </div>
  );
}

function NodeView({
  node,
  depth,
  expanded,
  onToggle,
  onFocus,
  focused,
}: {
  node: TreeNode;
  depth: number;
  expanded: Record<string, boolean>;
  onToggle: (p: string) => void;
  onFocus: (p: string) => void;
  focused: string | null;
}) {
  const isOpen = expanded[node.path];
  const hasChildren = (node.children?.length ?? 0) > 0 || (node.attributes && Object.keys(node.attributes).length > 0);
  const colorClass =
    node.kind === "string" ? "text-emerald-600 dark:text-emerald-400" :
    node.kind === "number" ? "text-amber-600 dark:text-amber-400" :
    node.kind === "boolean" ? "text-violet-600 dark:text-violet-400" :
    node.kind === "null" ? "text-rose-600 dark:text-rose-400" :
    "text-foreground";

  return (
    <div className="py-0.5" style={{ paddingLeft: depth * 14 }}>
      <div
        className={cn(
          "group flex items-start gap-1 rounded font-mono text-xs leading-relaxed",
          focused === node.path && "bg-primary/10",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.path)}
            className="grid size-4 shrink-0 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onFocus(node.path)}
          className="min-w-0 flex-1 break-all text-left"
        >
          <span className="text-primary">{node.key}</span>
          {node.kind !== "object" && node.kind !== "array" && node.kind !== "element" && (
            <>
              <span className="text-muted-foreground">: </span>
              <span className={colorClass}>
                {node.kind === "string" ? `"${node.scalar}"` : String(node.scalar)}
              </span>
            </>
          )}
          {node.kind === "object" && <span className="text-muted-foreground"> {`{ ${node.children?.length ?? 0} }`}</span>}
          {node.kind === "array" && <span className="text-muted-foreground"> {`[ ${node.children?.length ?? 0} ]`}</span>}
          {node.kind === "element" && (
            <span className="text-muted-foreground">
              {" "}
              {`<${node.key}${node.attributes && Object.keys(node.attributes).length > 0 ? " …" : ""}>`}
            </span>
          )}
        </button>
      </div>
      {isOpen && node.attributes && Object.keys(node.attributes).length > 0 && (
        <div className="ml-6 mt-0.5 space-y-0.5">
          {Object.entries(node.attributes).map(([k, v]) => (
            <div key={k} className="font-mono text-[11px]">
              <span className="text-rose-500">@{k}</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;{v}&quot;</span>
            </div>
          ))}
        </div>
      )}
      {isOpen && node.children?.map((c) => (
        <NodeView
          key={c.path}
          node={c}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onFocus={onFocus}
          focused={focused}
        />
      ))}
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
