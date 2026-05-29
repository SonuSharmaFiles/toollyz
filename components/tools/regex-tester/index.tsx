"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Braces,
  Check,
  Copy,
  Library,
  Regex,
  Replace,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FLAGS,
  PATTERN_LIBRARY,
  SAMPLE_FLAGS,
  SAMPLE_PATTERN,
  SAMPLE_TEXT,
  highlightMatches,
  lintPattern,
  replacePreview,
  runRegex,
  type RunResult,
} from "@/lib/tools/regex/regex-tools";

const PATTERN_KEY = "toollyz:regex-pattern";
const FLAGS_KEY = "toollyz:regex-flags";
const TEXT_KEY = "toollyz:regex-text";

type Tab = "matches" | "replace" | "library";
const MARK_TOKENS =
  "[&_mark]:rounded-sm [&_mark]:px-px [&_mark]:text-inherit [&_.rx-a]:bg-amber-400/40 [&_.rx-b]:bg-emerald-400/40";

export default function RegexTester() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [pattern, setPattern] = React.useState("");
  const [flags, setFlags] = React.useState("g");
  const [text, setText] = React.useState("");
  const [replacement, setReplacement] = React.useState("[$<domain>]");
  const [tab, setTab] = React.useState<Tab>("matches");

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const backRef = React.useRef<HTMLPreElement>(null);

  const dPattern = React.useDeferredValue(pattern);
  const dFlags = React.useDeferredValue(flags);
  const dText = React.useDeferredValue(text);

  const result: RunResult = React.useMemo(() => runRegex(dPattern, dFlags, dText), [dPattern, dFlags, dText]);
  const highlighted = React.useMemo(() => highlightMatches(dText, result.matches), [dText, result.matches]);
  const lint = React.useMemo(() => lintPattern(dPattern), [dPattern]);
  const replaced = React.useMemo(() => (tab === "replace" ? replacePreview(dPattern, dFlags, dText, replacement) : null), [tab, dPattern, dFlags, dText, replacement]);

  React.useEffect(() => {
    try {
      const p = localStorage.getItem(PATTERN_KEY);
      const f = localStorage.getItem(FLAGS_KEY);
      const t = localStorage.getItem(TEXT_KEY);
      setPattern(p ?? SAMPLE_PATTERN);
      setFlags(f ?? SAMPLE_FLAGS);
      setText(t ?? SAMPLE_TEXT);
    } catch { setPattern(SAMPLE_PATTERN); setFlags(SAMPLE_FLAGS); setText(SAMPLE_TEXT); }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; try { localStorage.setItem(PATTERN_KEY, pattern); localStorage.setItem(FLAGS_KEY, flags); localStorage.setItem(TEXT_KEY, text); } catch { /* noop */ } }, [pattern, flags, text, mounted]);

  function toggleFlag(f: string) { setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f)); }
  function syncScroll() { if (taRef.current && backRef.current) { backRef.current.scrollTop = taRef.current.scrollTop; backRef.current.scrollLeft = taRef.current.scrollLeft; } }
  function loadLibrary(p: string, f: string, sample: string) { setPattern(p); setFlags(f); setText(sample); setTab("matches"); toast.success("Pattern loaded"); }
  async function copy(value: string, label: string) { if (!value) return; try { await navigator.clipboard.writeText(value); toast.success(`${label} copied`); } catch { toast.error("Could not copy"); } }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-3xl bg-muted" />
        <div className="h-14 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-2"><div className="h-80 animate-pulse rounded-2xl bg-muted" /><div className="h-80 animate-pulse rounded-2xl bg-muted" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Regex summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(245,158,11,0.18),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat label="Matches" value={result.ok ? result.count : 0} reduceMotion={!!reduceMotion} />
          <HeroStat label="Groups" value={result.groupCount} reduceMotion={!!reduceMotion} />
          <div className="space-y-1">
            <div className="text-xs font-medium text-amber-300/70">Test size</div>
            <div className="font-heading text-2xl font-bold text-amber-50 sm:text-3xl tabular-nums">{text.length.toLocaleString()}<span className="text-base text-amber-300/50"> ch</span></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-amber-300/70">Pattern</div>
            <div className={cn("flex items-center gap-1.5 font-heading text-xl font-bold sm:text-2xl", result.ok ? "text-emerald-400" : "text-rose-400")}>
              {result.ok ? <><Check className="size-5" />Valid</> : <><AlertTriangle className="size-5" />Invalid</>}
            </div>
          </div>
        </div>
      </section>

      {/* Pattern bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b1020] px-3 py-2.5 font-mono text-sm">
          <span className="select-none text-slate-500">/</span>
          <input value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} aria-label="Regular expression" placeholder="pattern" className="min-w-0 flex-1 bg-transparent text-emerald-300 caret-white outline-none placeholder:text-slate-600" />
          <span className="select-none text-slate-500">/</span>
          <span className="text-amber-300">{flags || " "}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FLAGS.map((f) => (
            <button key={f.key} type="button" onClick={() => toggleFlag(f.key)} title={f.description} aria-pressed={flags.includes(f.key)} className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs font-medium transition-colors", flags.includes(f.key) ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground/70 hover:bg-muted")}>{f.label}</button>
          ))}
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <button type="button" onClick={() => { setPattern(SAMPLE_PATTERN); setFlags(SAMPLE_FLAGS); setText(SAMPLE_TEXT); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"><Sparkles className="size-3.5" />Sample</button>
          <button type="button" onClick={() => { setPattern(""); setText(""); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"><Trash2 className="size-3.5" />Clear</button>
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{result.ok ? `${result.count} match${result.count === 1 ? "" : "es"}` : "invalid"}</span>
        </div>
        {!result.ok && result.error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{result.error}</div>
        )}
        {lint && result.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400"><AlertTriangle className="size-4" />{lint}</div>
        )}
        {result.truncated && (
          <p className="text-[11px] text-muted-foreground">Test string is large — only the first 100,000 characters are matched.</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Test string editor */}
        <div className="min-w-0 space-y-2">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test string</span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">{text.split("\n").length} lines · {text.length.toLocaleString()} ch</span>
            </div>
            <div className="relative h-[420px]">
              <pre ref={backRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-6 text-foreground", MARK_TOKENS)} dangerouslySetInnerHTML={{ __html: highlighted }} />
              <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} onScroll={syncScroll} spellCheck={false} aria-label="Test string" placeholder="Type or paste text to test against…" className="absolute inset-0 resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-3 font-mono text-[13px] leading-6 text-transparent caret-foreground outline-none" />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="min-w-0 space-y-3">
          <div className="flex gap-1 rounded-xl border border-border/70 bg-card p-1">
            <TabBtn active={tab === "matches"} onClick={() => setTab("matches")} icon={<Braces className="size-4" />} label="Matches" badge={result.ok ? result.count : undefined} />
            <TabBtn active={tab === "replace"} onClick={() => setTab("replace")} icon={<Replace className="size-4" />} label="Replace" />
            <TabBtn active={tab === "library"} onClick={() => setTab("library")} icon={<Library className="size-4" />} label="Library" />
          </div>

          {tab === "matches" && (
            <section className="rounded-2xl border border-border/70 bg-card p-3">
              {!result.ok ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Fix the pattern to see matches.</p>
              ) : result.matches.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No matches{pattern ? " — try adjusting your pattern or flags." : " yet — enter a pattern above."}</p>
              ) : (
                <ul className="max-h-[380px] space-y-2 overflow-auto list-none">
                  {result.matches.map((m, i) => (
                    <li key={i} className="rounded-lg border border-border/60 bg-background p-2.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono font-semibold text-primary">#{i + 1}</span>
                        <span className="text-muted-foreground">index {m.index}–{m.end}</span>
                      </div>
                      <div className="mt-1 break-all font-mono text-sm text-foreground">{m.match || "(empty match)"}</div>
                      {m.groups.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 border-t border-border/50 pt-1.5">
                          {m.groups.map((g, gi) => (
                            <div key={gi} className="flex gap-2 font-mono text-xs">
                              <span className="shrink-0 text-muted-foreground">group {gi + 1}{namedFor(m.namedGroups, g) ? ` (${namedFor(m.namedGroups, g)})` : ""}:</span>
                              <span className="break-all text-emerald-600 dark:text-emerald-400">{g === undefined ? "undefined" : g || "(empty)"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === "replace" && (
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-3">
              <div className="space-y-1.5">
                <label htmlFor="rep" className="text-xs font-medium text-muted-foreground">Replacement (use $1, $&lt;name&gt;, $&amp; …)</label>
                <Input id="rep" value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="$1" className="h-9 rounded-lg font-mono text-sm" />
              </div>
              {replaced && !replaced.ok ? (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{replaced.error}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{replaced?.count ?? 0} replacement{(replaced?.count ?? 0) === 1 ? "" : "s"}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => copy(replaced?.result ?? "", "Result")}><Copy className="size-4" />Copy</Button>
                  </div>
                  <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-background p-3 font-mono text-[13px] leading-6">{replaced?.result || " "}</pre>
                </>
              )}
            </section>
          )}

          {tab === "library" && (
            <section className="rounded-2xl border border-border/70 bg-card p-3">
              <ul className="space-y-1.5 list-none">
                {PATTERN_LIBRARY.map((p) => (
                  <li key={p.name}>
                    <button type="button" onClick={() => loadLibrary(p.pattern, p.flags, p.sample)} className="w-full rounded-lg border border-border/60 bg-background p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted">
                      <div className="flex items-center gap-2"><Regex className="size-3.5 text-primary" /><span className="text-sm font-medium">{p.name}</span><span className="ml-auto font-mono text-[10px] text-muted-foreground">/{p.flags}</span></div>
                      <div className="mt-1 truncate font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{p.pattern}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function namedFor(named: Record<string, string | undefined>, value: string | undefined): string | null {
  for (const [k, v] of Object.entries(named)) if (v === value && value !== undefined) return k;
  return null;
}

function HeroStat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-amber-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-amber-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
    </div>
  );
}

function AnimatedNumber({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  React.useEffect(() => {
    const to = value;
    const from = fromRef.current;
    if (from === to) { setDisplay(to); return; }
    if (reduceMotion || typeof document === "undefined" || document.visibilityState !== "visible") { setDisplay(to); fromRef.current = to; return; }
    const start = performance.now();
    const dur = 350;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick); else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    const fallback = window.setTimeout(() => { setDisplay(to); fromRef.current = to; }, dur + 120);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(fallback); };
  }, [value, reduceMotion]);
  return <>{display.toLocaleString()}</>;
}

function TabBtn({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>
      {icon}{label}
      {badge !== undefined && <span className={cn("rounded-full px-1.5 text-[10px] font-semibold tabular-nums", active ? "bg-primary-foreground/20" : "bg-muted-foreground/15")}>{badge}</span>}
    </button>
  );
}
