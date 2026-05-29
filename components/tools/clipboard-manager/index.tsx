"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Clipboard, ClipboardPaste, Copy, Lock, Pin, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  SAMPLE_ITEMS,
  addItem,
  clipStats,
  preview,
  relativeTime,
  sortItems,
  type ClipItem,
} from "@/lib/tools/clipboard/clipboard-tools";

const ITEMS_KEY = "toollyz:clipboard-items";

export default function ClipboardManager() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [items, setItems] = React.useState<ClipItem[]>([]);
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const deferredSearch = React.useDeferredValue(search);
  const stats = React.useMemo(() => clipStats(items), [items]);
  const visible = React.useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const sorted = sortItems(items);
    return q ? sorted.filter((i) => i.text.toLowerCase().includes(q)) : sorted;
  }, [items, deferredSearch]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(ITEMS_KEY);
      setItems(raw ? JSON.parse(raw) : SAMPLE_ITEMS);
    } catch { setItems(SAMPLE_ITEMS); }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); } catch { /* noop */ }
  }, [items, mounted]);

  function save() {
    if (!draft.trim()) { toast.error("Nothing to save"); return; }
    setItems((prev) => addItem(prev, draft));
    setDraft("");
    toast.success("Saved to history");
  }
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) { toast.error("Clipboard is empty"); return; }
      setItems((prev) => addItem(prev, text));
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Clipboard access was blocked — paste into the box instead");
    }
  }
  async function copyItem(item: ClipItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1200);
      // bump to top on reuse
      setItems((prev) => [{ ...item, ts: Date.now() }, ...prev.filter((i) => i.id !== item.id)]);
      toast.success("Copied to clipboard");
    } catch { toast.error("Could not copy"); }
  }
  function togglePin(id: string) { setItems((prev) => prev.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i))); }
  function remove(id: string) { setItems((prev) => prev.filter((i) => i.id !== id)); }
  function clearAll() {
    if (!items.length) return;
    if (!window.confirm("Clear all clipboard history? Pinned items will be removed too.")) return;
    setItems([]);
    toast.success("History cleared");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); save(); }
  }

  if (!mounted) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-24 animate-pulse rounded-3xl bg-muted" /><div className="h-36 animate-pulse rounded-2xl bg-muted" /><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Clipboard summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-3 gap-4">
          <HeroStat label="Saved items" value={stats.items} reduceMotion={!!reduceMotion} />
          <HeroStat label="Pinned" value={stats.pinned} reduceMotion={!!reduceMotion} />
          <HeroStat label="Characters" value={stats.chars} reduceMotion={!!reduceMotion} />
        </div>
        <p className="relative mt-4 flex items-center gap-1.5 text-[11px] text-indigo-300/70"><Lock className="size-3" />Your clipboard history stays in this browser — nothing is ever uploaded.</p>
      </section>

      {/* Capture */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} rows={3} placeholder="Type or paste text to save to your clipboard history… (⌘/Ctrl + Enter to save)" className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" aria-label="New clipboard item" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={save}><Plus className="size-4" />Save</Button>
          <Button type="button" size="sm" variant="outline" onClick={pasteFromClipboard}><ClipboardPaste className="size-4" />Paste from clipboard</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => { setItems(SAMPLE_ITEMS); toast.success("Sample loaded"); }}><Sparkles className="size-4" />Sample</Button>
        </div>
      </section>

      {/* History */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Clipboard className="size-4 text-primary" />History</h2>
          <div className="relative ml-auto min-w-[160px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history…" className="h-8 rounded-lg pl-8 text-sm" aria-label="Search clipboard history" />
          </div>
          <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-rose-500"><Trash2 className="size-3.5" />Clear all</button>
        </div>

        {visible.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card/40 py-12 text-center">
            <Clipboard className="mb-2 size-7 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{items.length === 0 ? "No saved items yet — save something above." : "No items match your search."}</p>
          </div>
        ) : (
          <ul className="space-y-1.5 list-none">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <motion.li key={item.id} layout={!reduceMotion} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}>
                  <div className={cn("group flex items-start gap-2 rounded-xl border p-2.5 transition-colors", item.pinned ? "border-amber-400/40 bg-amber-500/5" : "border-border/60 bg-background hover:bg-muted/50")}>
                    <button type="button" onClick={() => copyItem(item)} className="min-w-0 flex-1 text-left" title="Click to copy">
                      <div className="break-words font-mono text-sm text-foreground/90">{preview(item.text)}</div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{item.text.length} chars</span><span aria-hidden>·</span><span>{relativeTime(item.ts)}</span>
                        {copiedId === item.id && <span className="flex items-center gap-0.5 text-emerald-500"><Check className="size-3" />copied</span>}
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button type="button" onClick={() => copyItem(item)} aria-label="Copy" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Copy className="size-3.5" /></button>
                      <button type="button" onClick={() => togglePin(item.id)} aria-label={item.pinned ? "Unpin" : "Pin"} className={cn("rounded-md p-1 hover:bg-muted", item.pinned ? "text-amber-500" : "text-muted-foreground hover:text-foreground")}><Pin className={cn("size-3.5", item.pinned && "fill-current")} /></button>
                      <button type="button" onClick={() => remove(item.id)} aria-label="Delete" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-rose-500"><X className="size-3.5" /></button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}

function HeroStat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-indigo-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div>
    </div>
  );
}
