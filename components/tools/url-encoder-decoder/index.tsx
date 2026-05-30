"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeftRight, ArrowUpDown, Check, Copy, Eraser, Link2, Lock, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";

type Mode = "encode" | "decode";
type Scope = "component" | "uri";

const INPUT_KEY = "toollyz:url-input";
const MODE_KEY = "toollyz:url-mode";
const SCOPE_KEY = "toollyz:url-scope";

const SAMPLE = "https://toollyz.com/tools/url-encoder-decoder?q=hello world&lang=en#section/Top";

function transform(input: string, mode: Mode, scope: Scope): { ok: true; output: string } | { ok: false; error: string } {
  try {
    if (mode === "encode") {
      return { ok: true, output: scope === "component" ? encodeURIComponent(input) : encodeURI(input) };
    }
    return { ok: true, output: scope === "component" ? decodeURIComponent(input) : decodeURI(input) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input" };
  }
}

interface ParsedUrl { protocol: string; host: string; hostname: string; port: string; pathname: string; search: string; hash: string; params: { key: string; value: string }[] }

function parseUrl(value: string): ParsedUrl | null {
  try {
    const u = new URL(value.trim());
    const params: { key: string; value: string }[] = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return { protocol: u.protocol, host: u.host, hostname: u.hostname, port: u.port, pathname: u.pathname, search: u.search, hash: u.hash, params };
  } catch { return null; }
}

export default function UrlEncoderDecoder() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("encode");
  const [scope, setScope] = React.useState<Scope>("component");
  const [input, setInput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setInput(localStorage.getItem(INPUT_KEY) ?? SAMPLE);
      const m = localStorage.getItem(MODE_KEY); if (m === "encode" || m === "decode") setMode(m);
      const s = localStorage.getItem(SCOPE_KEY); if (s === "component" || s === "uri") setScope(s);
    } catch { setInput(SAMPLE); }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(INPUT_KEY, input); localStorage.setItem(MODE_KEY, mode); localStorage.setItem(SCOPE_KEY, scope); } catch { /* noop */ } }, [input, mode, scope, mounted]);

  const deferred = React.useDeferredValue(input);
  const result = React.useMemo(() => transform(deferred, mode, scope), [deferred, mode, scope]);
  const output = result.ok ? result.output : "";
  const parsed = React.useMemo(() => (mode === "encode" ? parseUrl(input) : parseUrl(output)), [input, output, mode]);

  const inChars = input.length;
  const outChars = output.length;
  const delta = outChars - inChars;

  async function copy(value: string, label = "Copied") {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1200); toast.success(label); } catch { toast.error("Could not copy"); }
  }
  function swap() {
    if (!result.ok) { toast.error("Fix the error before swapping"); return; }
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  }

  if (!mounted) return <div className="space-y-4" aria-hidden="true"><div className="h-24 animate-pulse rounded-3xl bg-muted" /><div className="h-72 animate-pulse rounded-2xl bg-muted" /></div>;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="URL summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Input chars" value={inChars} reduceMotion={!!reduceMotion} />
          <Stat label="Output chars" value={outChars} reduceMotion={!!reduceMotion} />
          <Stat label={delta >= 0 ? "Added" : "Saved"} value={Math.abs(delta)} reduceMotion={!!reduceMotion} accent={delta > 0 ? "text-amber-300" : delta < 0 ? "text-emerald-300" : undefined} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Mode</div>
            <div className="font-heading text-xl font-bold tracking-tight text-sky-50 sm:text-2xl">{mode === "encode" ? "Encode" : "Decode"}</div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Mode">
          <SegBtn active={mode === "encode"} onClick={() => setMode("encode")} label="Encode" />
          <SegBtn active={mode === "decode"} onClick={() => setMode("decode")} label="Decode" />
        </div>
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Scope">
          <SegBtn active={scope === "component"} onClick={() => setScope("component")} label="Component" title="encodeURIComponent / decodeURIComponent — encodes all reserved characters" />
          <SegBtn active={scope === "uri"} onClick={() => setScope("uri")} label="Full URI" title="encodeURI / decodeURI — preserves ://?&= etc." />
        </div>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolBtn onClick={() => setInput(SAMPLE)} icon={<Sparkles className="size-3.5" />} label="Sample" />
        <ToolBtn onClick={() => setInput("")} icon={<Eraser className="size-3.5" />} label="Clear" />
        <ToolBtn onClick={swap} icon={<ArrowUpDown className="size-3.5" />} label="Swap" />
      </div>

      {/* I/O */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={mode === "encode" ? "Input" : "Encoded input"} subtitle={`${inChars.toLocaleString()} chars`}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} spellCheck={false} aria-label="Input" placeholder={mode === "encode" ? "Type or paste raw text or a URL…" : "Paste an encoded string to decode…"} className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => copy(input, "Input copied")}><Copy className="size-4" />Copy input</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setInput("")}><Trash2 className="size-3.5" />Clear</Button>
          </div>
        </Panel>

        <Panel label={mode === "encode" ? "Encoded output" : "Decoded output"} subtitle={result.ok ? `${outChars.toLocaleString()} chars` : "error"}>
          {result.ok ? (
            <textarea value={output} readOnly rows={10} aria-label="Output" className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none" />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{result.error}</div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => copy(output, "Output copied")} disabled={!result.ok || !output}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}Copy output</Button>
            <Button type="button" size="sm" variant="outline" onClick={swap} disabled={!result.ok}><ArrowLeftRight className="size-4" />Use as input</Button>
          </div>
        </Panel>
      </div>

      {/* URL parser */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Link2 className="size-4 text-primary" />URL parts</h2>
        {parsed ? (
          <div className="space-y-3">
            <dl className="grid gap-y-1.5 text-sm sm:grid-cols-2 sm:gap-x-6">
              <Row label="Protocol"><span className="text-primary">{parsed.protocol}</span></Row>
              <Row label="Host">{parsed.host}</Row>
              <Row label="Hostname">{parsed.hostname}</Row>
              <Row label="Port">{parsed.port || "(default)"}</Row>
              <Row label="Pathname"><span className="break-all">{parsed.pathname || "/"}</span></Row>
              <Row label="Search">{parsed.search || "—"}</Row>
              <Row label="Hash">{parsed.hash || "—"}</Row>
            </dl>
            {parsed.params.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Query parameters ({parsed.params.length})</div>
                <ul className="space-y-1 list-none">
                  {parsed.params.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2 font-mono text-xs">
                      <span className="shrink-0 text-primary">{p.key}</span>
                      <span className="text-muted-foreground">=</span>
                      <span className="min-w-0 break-all text-foreground/90">{p.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Paste a full URL (starting with http:// or https://) to see its components.</p>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Encoding and parsing happen in your browser — Toollyz has no server.</p>
    </div>
  );
}

function Stat({ label, value, reduceMotion, accent }: { label: string; value: number; reduceMotion: boolean; accent?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
    </div>
  );
}
function Panel({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold tracking-tight">{label}</h2>{subtitle && <span className="text-xs text-muted-foreground tabular-nums">{subtitle}</span>}</div>
      {children}
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-3 font-mono text-xs"><dt className="shrink-0 text-muted-foreground uppercase">{label}</dt><dd className="text-right text-foreground/90">{children}</dd></div>;
}
function SegBtn({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return <button type="button" onClick={onClick} title={title} aria-pressed={active} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{label}</button>;
}
function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted">{icon}{label}</button>;
}
