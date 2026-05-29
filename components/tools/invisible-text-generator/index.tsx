"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Gamepad2,
  ScanSearch,
  Sparkles,
  Star,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CHAR_BY_ID,
  GAMES,
  INVISIBLE_CHARS,
  PLATFORMS,
  PRESETS,
  analyze,
  codeU,
  encodingInfo,
  generate,
  type Preset,
  type Support,
} from "@/lib/tools/text/invisible-text";

const HISTORY_KEY = "toollyz:invisible-history";
const SETTINGS_KEY = "toollyz:invisible-settings";

type Tab = "compat" | "analyzer" | "developer";
interface HistoryItem { id: string; label: string; text: string }

const COUNT_PRESETS = [1, 5, 10, 50, 100];
const SUPPORT_STYLE: Record<Support, { label: string; cls: string; dot: string }> = {
  works: { label: "Works", cls: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  limited: { label: "Limited", cls: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  strips: { label: "Strips", cls: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
};

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function InvisibleTextGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [charId, setCharId] = React.useState("hangul");
  const [count, setCount] = React.useState(1);
  const [reveal, setReveal] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("compat");
  const [analyzerInput, setAnalyzerInput] = React.useState("");
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [copiedKey, setCopiedKey] = React.useState("");

  const selected = CHAR_BY_ID[charId] ?? INVISIBLE_CHARS[0];
  const generated = React.useMemo(() => generate(charId, count), [charId, count]);
  const enc = React.useMemo(() => encodingInfo(selected.cp), [selected]);
  const deferredAnalyzer = React.useDeferredValue(analyzerInput);
  const analysis = React.useMemo(() => (tab === "analyzer" ? analyze(deferredAnalyzer) : null), [tab, deferredAnalyzer]);

  React.useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) { const p = JSON.parse(s); if (p.charId && CHAR_BY_ID[p.charId]) setCharId(p.charId); if (p.count) setCount(p.count); }
    } catch { /* noop */ }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ charId, count })); } catch { /* noop */ }
  }, [charId, count, mounted]);

  function persistHistory(next: HistoryItem[]) {
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  async function copy(value: string, key = "") {
    try {
      await navigator.clipboard.writeText(value);
      if (key) { setCopiedKey(key); window.setTimeout(() => setCopiedKey(""), 1200); }
      toast.success(value.trim() === "" && value.length > 0 ? `Copied ${value.length} invisible character${value.length === 1 ? "" : "s"}` : "Copied");
    } catch { toast.error("Could not copy"); }
  }

  function copyGenerated() {
    if (!generated.length) { toast.error("Nothing to copy"); return; }
    copy(generated, "gen");
  }
  function saveCurrent() {
    if (!generated.length) return;
    const label = `${count}× ${selected.name}`;
    persistHistory([{ id: uid(), label, text: generated }, ...history.filter((h) => h.label !== label)].slice(0, 24));
    toast.success("Saved to history");
  }
  function applyPreset(p: Preset) {
    setCharId(p.charId);
    setCount(p.count);
    copy(generate(p.charId, p.count));
    toast.success(`${p.label} copied`);
  }
  function exportTxt() {
    const lines = INVISIBLE_CHARS.map((c) => `${c.name} (${codeU(c.cp)}): "${generate(c.id, count)}"`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "invisible-characters.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success("Exported TXT");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]"><div className="h-96 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Invisible text" className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8" style={{ background: "linear-gradient(135deg,#0e1b2e,#0f2a3f 55%,#0b3a47)" }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.2),transparent_55%)]" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200"><EyeOff className="size-3.5" />Invisible Unicode</p>
          <h2 className="max-w-2xl font-heading text-2xl font-bold leading-tight text-cyan-50 sm:text-3xl">Generate blank usernames, empty messages &amp; hidden text</h2>
          <p className="max-w-xl text-sm text-cyan-100/70">Copy real invisible Unicode characters that work across social media, gaming and messaging apps — no signup, 100% in your browser.</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.slice(0, 4).map((p) => (
              <button key={p.id} type="button" onClick={() => applyPreset(p)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-cyan-50 transition-colors hover:bg-white/20"><Sparkles className="size-3.5" />{p.label}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* Generator */}
        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
            <div className="space-y-2">
              <Label>Character type</Label>
              <div className="space-y-1.5">
                {INVISIBLE_CHARS.map((c) => (
                  <button key={c.id} type="button" onClick={() => setCharId(c.id)} className={cn("flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors", charId === c.id ? "border-primary/50 bg-primary/10" : "border-border/60 bg-background hover:bg-muted")}>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium">{c.name}{c.best && <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Best</span>}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{codeU(c.cp)} · {c.width === "zero" ? "zero-width" : "blank width"}</p>
                    </div>
                    {charId === c.id && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
            <p className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">{selected.desc}</p>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center justify-between">
              <Label>How many</Label>
              <Input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} className="h-8 w-24 rounded-lg text-right" aria-label="Character count" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COUNT_PRESETS.map((n) => <SegBtn key={n} active={count === n} onClick={() => setCount(n)} label={String(n)} />)}
            </div>
          </section>
        </div>

        {/* Output + tabs */}
        <div className="min-w-0 space-y-4">
          {/* Output */}
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Wand2 className="size-4 text-primary" />Generated invisible text</h2>
              <button type="button" onClick={() => setReveal((v) => !v)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">{reveal ? <><EyeOff className="size-3.5" />Hide</> : <><Eye className="size-3.5" />Reveal</>}</button>
            </div>
            <div className="relative grid min-h-[72px] place-items-center rounded-xl border border-dashed border-border bg-background p-4">
              {reveal ? (
                <code className="break-all text-center font-mono text-xs text-cyan-600 dark:text-cyan-400">{Array.from({ length: Math.min(count, 60) }, () => `⟦${codeU(selected.cp)}⟧`).join("")}{count > 60 ? `…(${count} total)` : ""}</code>
              ) : (
                <p className="text-center text-sm text-muted-foreground/70">
                  <span aria-hidden="true" className="mb-1 block text-2xl text-muted-foreground/30">⌑</span>
                  <span className="select-all font-mono">{generated}</span>
                  {count} invisible character{count === 1 ? "" : "s"} ready to copy
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={copyGenerated}>{copiedKey === "gen" ? <Check className="size-4" /> : <Copy className="size-4" />}Copy invisible text</Button>
              <Button type="button" size="sm" variant="outline" onClick={saveCurrent}><Star className="size-4" />Save</Button>
              <Button type="button" size="sm" variant="outline" onClick={exportTxt}><Download className="size-4" />Export set</Button>
            </div>
          </section>

          {/* Presets */}
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Sparkles className="size-4 text-primary" />Quick presets</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => applyPreset(p)} className="rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted">
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1">
            <TabBtn active={tab === "compat"} onClick={() => setTab("compat")} icon={<BadgeCheck className="size-4" />} label="Compatibility" />
            <TabBtn active={tab === "analyzer"} onClick={() => setTab("analyzer")} icon={<ScanSearch className="size-4" />} label="Analyzer" />
            <TabBtn active={tab === "developer"} onClick={() => setTab("developer")} icon={<Code2 className="size-4" />} label="Developer" />
          </div>

          <motion.div key={tab} initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            {tab === "compat" && (
              <div className="space-y-3">
                <section className="rounded-2xl border border-border/70 bg-card p-4">
                  <h3 className="mb-3 text-sm font-semibold tracking-tight">Social &amp; messaging apps</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PLATFORMS.map((p) => {
                      const st = SUPPORT_STYLE[p.support];
                      return (
                        <div key={p.id} className="rounded-xl border border-border/60 bg-background p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", st.cls)}><span className={cn("size-1.5 rounded-full", st.dot)} />{st.label}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{p.note}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className="rounded-2xl border border-border/70 bg-card p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Gamepad2 className="size-4 text-primary" />Games</h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {GAMES.map((g) => (
                      <div key={g.id} className="rounded-xl border border-border/60 bg-background p-3">
                        <p className="text-sm font-medium">{g.name}</p>
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{g.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {tab === "analyzer" && (
              <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
                <div className="space-y-1.5">
                  <Label>Paste text to detect hidden characters</Label>
                  <textarea value={analyzerInput} onChange={(e) => setAnalyzerInput(e.target.value)} rows={3} placeholder="Paste any text or a suspicious username here…" className="w-full resize-none rounded-lg border border-input bg-background p-2.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" aria-label="Text to analyze" />
                </div>
                {analysis && analyzerInput.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <Stat label="Total" value={analysis.totalChars} />
                      <Stat label="Visible" value={analysis.visibleChars} />
                      <Stat label="Hidden" value={analysis.hiddenChars} danger={analysis.hiddenChars > 0} />
                    </div>
                    {analysis.hiddenChars > 0 ? (
                      <>
                        <div>
                          <Label>Revealed</Label>
                          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border/60 bg-background p-2.5 font-mono text-xs">{analysis.revealed}</pre>
                        </div>
                        <ul className="space-y-1 list-none">
                          {analysis.hits.map((h) => (
                            <li key={h.cp} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-sm">
                              <span className="font-medium">{h.name}</span>
                              <code className="font-mono text-[11px] text-muted-foreground">{codeU(h.cp)}</code>
                              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">×{h.count}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-600 dark:text-emerald-400"><Check className="mr-1 inline size-4" />No hidden characters detected.</p>
                    )}
                  </>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">Paste text above to reveal any invisible Unicode characters hiding inside.</p>
                )}
              </section>
            )}

            {tab === "developer" && (
              <section className="rounded-2xl border border-border/70 bg-card p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"><Code2 className="size-4 text-primary" />{selected.name} encoding</h3>
                <div className="space-y-1.5">
                  <DevRow label="Code point" value={enc.code} onCopy={() => copy(enc.code, "code")} copied={copiedKey === "code"} />
                  <DevRow label="UTF-16 (hex)" value={enc.hexUtf16} onCopy={() => copy(enc.hexUtf16, "u16")} copied={copiedKey === "u16"} />
                  <DevRow label="UTF-8 bytes" value={enc.hexUtf8} onCopy={() => copy(enc.hexUtf8, "u8")} copied={copiedKey === "u8"} />
                  <DevRow label="JS escape" value={enc.jsEscape} onCopy={() => copy(enc.jsEscape, "js")} copied={copiedKey === "js"} />
                  <DevRow label="HTML entity" value={enc.htmlEntity} onCopy={() => copy(enc.htmlEntity, "html")} copied={copiedKey === "html"} />
                  <DevRow label="CSS escape" value={enc.cssEscape} onCopy={() => copy(enc.cssEscape, "css")} copied={copiedKey === "css"} />
                </div>
              </section>
            )}
          </motion.div>

          {/* History */}
          {history.length > 0 && (
            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Clock className="size-4 text-primary" />History</h2>
                <button type="button" onClick={() => persistHistory([])} className="text-xs text-muted-foreground hover:text-rose-500"><Trash2 className="mr-1 inline size-3.5" />Clear</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{h.label}</span>
                    <button type="button" onClick={() => copy(h.text)} aria-label="Copy" className="shrink-0 text-muted-foreground hover:text-foreground"><Copy className="size-4" /></button>
                    <button type="button" onClick={() => persistHistory(history.filter((x) => x.id !== h.id))} aria-label="Remove" className="shrink-0 text-muted-foreground hover:text-rose-500"><X className="size-3.5" /></button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>;
}
function Stat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3 text-center">
      <div className={cn("font-heading text-xl font-bold tabular-nums", danger && "text-rose-500")}>{value.toLocaleString()}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
function DevRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-xs" title={value}>{value}</code>
      <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="shrink-0 text-muted-foreground hover:text-foreground">{copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}</button>
    </div>
  );
}
function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground/80 hover:bg-muted")}>{label}</button>;
}
function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
}
