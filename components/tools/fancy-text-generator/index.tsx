"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Dices,
  Download,
  Hash,
  Heart,
  Search,
  Sparkles,
  Star,
  Trash2,
  Type,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DECORATIONS,
  FANCY_STYLES,
  STYLE_CATEGORIES,
  SYMBOL_GROUPS,
  generateBio,
  generateUsernames,
  type StyleCategory,
} from "@/lib/tools/text/fancy-text";

const FAV_KEY = "toollyz:fancy-favorites";
const TEXT_KEY = "toollyz:fancy-text";

type Tab = "fonts" | "decorate" | "symbols" | "username" | "bio";
interface Favorite { id: string; text: string }

const SHOWCASE_IDS = ["bold-script", "fraktur", "fullwidth", "double-struck", "small-caps", "circled-neg"];

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function FancyTextGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("Toollyz");
  const [tab, setTab] = React.useState<Tab>("fonts");
  const [search, setSearch] = React.useState("");
  const [cat, setCat] = React.useState<"All" | StyleCategory>("All");
  const [favorites, setFavorites] = React.useState<Favorite[]>([]);
  const [previewStyle, setPreviewStyle] = React.useState("bold-script");
  const [usernames, setUsernames] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState("");
  const [showcaseIdx, setShowcaseIdx] = React.useState(0);
  const [copiedId, setCopiedId] = React.useState("");

  const deferred = React.useDeferredValue(text);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TEXT_KEY);
      if (t !== null) setText(t);
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch { /* noop */ }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => { try { localStorage.setItem(TEXT_KEY, text); } catch { /* noop */ } }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);

  React.useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setShowcaseIdx((i) => (i + 1) % SHOWCASE_IDS.length), 2200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  function persistFav(next: Favorite[]) {
    setFavorites(next);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  async function copy(value: string, id = "") {
    if (!value.trim()) { toast.error("Nothing to copy"); return; }
    try {
      await navigator.clipboard.writeText(value);
      if (id) { setCopiedId(id); window.setTimeout(() => setCopiedId(""), 1200); }
      toast.success("Copied");
    } catch { toast.error("Could not copy"); }
  }
  function toggleFav(value: string) {
    const exists = favorites.find((f) => f.text === value);
    if (exists) persistFav(favorites.filter((f) => f.id !== exists.id));
    else { persistFav([{ id: uid(), text: value }, ...favorites].slice(0, 60)); toast.success("Saved"); }
  }
  const isFav = (value: string) => favorites.some((f) => f.text === value);

  const styles = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return FANCY_STYLES.filter((s) => (cat === "All" || s.category === cat) && (!q || s.label.toLowerCase().includes(q)));
  }, [search, cat]);

  function copyAll() {
    const all = FANCY_STYLES.map((s) => `${s.label}: ${s.transform(text)}`).join("\n");
    copy(all);
    toast.success("All styles copied");
  }
  function exportTxt() {
    if (!text.trim()) { toast.error("Type something first"); return; }
    const content = FANCY_STYLES.map((s) => `${s.label}\n${s.transform(text)}\n`).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fancy-text.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported TXT");
  }
  function randomStyle() {
    const s = FANCY_STYLES[Math.floor(Math.random() * FANCY_STYLES.length)];
    setPreviewStyle(s.id);
    setCat(s.category);
    toast.success(`${s.label} ✨`);
  }

  const previewTransform = FANCY_STYLES.find((s) => s.id === previewStyle)?.transform ?? ((t: string) => t);
  const showcaseStyle = FANCY_STYLES.find((s) => s.id === SHOWCASE_IDS[showcaseIdx]) ?? FANCY_STYLES[0];

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-44 animate-pulse rounded-3xl bg-muted" />
        <div className="h-12 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Fancy text showcase" className="relative overflow-hidden rounded-3xl border border-white/10 p-6 text-center sm:p-10" style={{ background: "linear-gradient(135deg,#1e1b4b,#4c1d95 55%,#831843)" }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(34,211,238,0.25),transparent_55%),radial-gradient(circle_at_90%_120%,rgba(236,72,153,0.25),transparent_55%)]" />
        <div className="relative space-y-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200"><Sparkles className="size-3.5" />100+ Unicode styles</p>
          <div className="grid min-h-[3.5rem] place-items-center">
            <AnimatePresence mode="wait">
              <motion.h2
                key={showcaseIdx}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                transition={{ duration: 0.3 }}
                className="break-all px-4 text-3xl font-bold text-white sm:text-5xl"
              >
                {showcaseStyle.transform(text || "Toollyz")}
              </motion.h2>
            </AnimatePresence>
          </div>
          <p className="text-sm text-fuchsia-100/80">{showcaseStyle.label} · type below to style your own text</p>
        </div>
      </section>

      {/* Input */}
      <div className="space-y-3">
        <div className="relative">
          <Type className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your text…" aria-label="Text to style" className="h-14 rounded-2xl pl-12 text-lg" />
          {text && <button type="button" onClick={() => setText("")} aria-label="Clear" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-5" /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={randomStyle}><Dices className="size-4" />Surprise me</Button>
          <Button type="button" size="sm" variant="outline" onClick={copyAll}><Copy className="size-4" />Copy all</Button>
          <Button type="button" size="sm" variant="outline" onClick={exportTxt}><Download className="size-4" />Export</Button>
        </div>
      </div>

      {/* Social preview */}
      <SocialPreview text={text || "username"} transform={previewTransform} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} reduceMotion={!!reduceMotion} />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-card p-1.5">
        <TabBtn active={tab === "fonts"} onClick={() => setTab("fonts")} icon={<Wand2 className="size-4" />} label="Fonts" />
        <TabBtn active={tab === "decorate"} onClick={() => setTab("decorate")} icon={<Sparkles className="size-4" />} label="Decorate" />
        <TabBtn active={tab === "symbols"} onClick={() => setTab("symbols")} icon={<Hash className="size-4" />} label="Symbols" />
        <TabBtn active={tab === "username"} onClick={() => setTab("username")} icon={<UserRound className="size-4" />} label="Username" />
        <TabBtn active={tab === "bio"} onClick={() => setTab("bio")} icon={<Heart className="size-4" />} label="Bio" />
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        {tab === "fonts" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search styles…" className="h-9 rounded-lg pl-9 text-sm" aria-label="Search styles" />
              </div>
              <div className="flex flex-wrap gap-1">
                <SegBtn active={cat === "All"} onClick={() => setCat("All")} label="All" />
                {STYLE_CATEGORIES.map((c) => <SegBtn key={c} active={cat === c} onClick={() => setCat(c)} label={c} />)}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {styles.map((s) => {
                const out = s.transform(deferred);
                const fav = isFav(out);
                return (
                  <div key={s.id} className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="mt-0.5 line-clamp-2 break-all text-lg leading-snug text-foreground">{out || <span className="text-muted-foreground/50">…</span>}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" onClick={() => copy(out, s.id)} aria-label={`Copy ${s.label}`} className="grid size-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        {copiedId === s.id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                      </button>
                      <button type="button" onClick={() => toggleFav(out)} aria-label="Favorite" className={cn("grid size-8 place-items-center rounded-lg border transition-colors", fav ? "border-amber-400/40 bg-amber-500/10 text-amber-500" : "border-border bg-background text-muted-foreground hover:text-amber-500")}>
                        <Star className={cn("size-4", fav && "fill-current")} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {styles.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No styles match &quot;{search}&quot;.</p>}
            </div>
          </div>
        )}

        {tab === "decorate" && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DECORATIONS.map((d) => {
              const out = d.wrap(deferred || "text");
              return (
                <button key={d.id} type="button" onClick={() => copy(out)} className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-card p-3 text-left transition-colors hover:border-primary/40">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{d.label}</span>
                  <span className="break-all text-base text-foreground">{out}</span>
                </button>
              );
            })}
          </div>
        )}

        {tab === "symbols" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Tap a symbol to add it to your text — or copy it.</p>
            {SYMBOL_GROUPS.map((g) => (
              <section key={g.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold tracking-tight">{g.label}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {g.symbols.map((sym, i) => (
                    <button key={i} type="button" onClick={() => { setText((t) => t + sym); toast.success(`Added ${sym}`); }} onContextMenu={(e) => { e.preventDefault(); copy(sym); }} title="Click to add · right-click to copy" className="grid h-10 min-w-[2.5rem] place-items-center rounded-lg border border-border bg-background px-1 text-lg transition-colors hover:border-primary/40 hover:bg-muted">
                      {sym}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "username" && (
          <div className="space-y-3">
            <Button type="button" onClick={() => setUsernames(generateUsernames(text))}><Dices className="size-4" />Generate usernames</Button>
            {usernames.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">Generate stylish gaming &amp; social usernames from your text.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {usernames.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card p-3">
                    <span className="min-w-0 flex-1 break-all text-base">{u}</span>
                    <button type="button" onClick={() => copy(u)} aria-label="Copy" className="shrink-0 text-muted-foreground hover:text-foreground"><Copy className="size-4" /></button>
                    <button type="button" onClick={() => toggleFav(u)} aria-label="Favorite" className={cn("shrink-0", isFav(u) ? "text-amber-500" : "text-muted-foreground hover:text-amber-500")}><Star className={cn("size-4", isFav(u) && "fill-current")} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "bio" && (
          <div className="space-y-3">
            <Button type="button" onClick={() => setBio(generateBio(text))}><Sparkles className="size-4" />Generate aesthetic bio</Button>
            {bio ? (
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <pre className="whitespace-pre-wrap break-words text-center font-sans text-base leading-relaxed">{bio}</pre>
                <div className="mt-3 flex justify-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => copy(bio)}><Copy className="size-4" />Copy bio</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setBio(generateBio(text))}><Dices className="size-4" />Shuffle</Button>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">Generate a ready-to-paste aesthetic bio with your name.</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <section aria-label="Saved styles" className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Star className="size-4 fill-amber-400 text-amber-400" />Saved <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">{favorites.length}</span></h2>
            <button type="button" onClick={() => persistFav([])} className="text-xs text-muted-foreground hover:text-rose-500"><Trash2 className="mr-1 inline size-3.5" />Clear</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {favorites.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-2.5">
                <span className="min-w-0 flex-1 break-all text-base">{f.text}</span>
                <button type="button" onClick={() => copy(f.text)} aria-label="Copy" className="shrink-0 text-muted-foreground hover:text-foreground"><Copy className="size-4" /></button>
                <button type="button" onClick={() => persistFav(favorites.filter((x) => x.id !== f.id))} aria-label="Remove" className="shrink-0 text-muted-foreground hover:text-rose-500"><X className="size-4" /></button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Social preview ──────────────────────────────────────────────────────────

function SocialPreview({ text, transform, previewStyle, setPreviewStyle, reduceMotion }: { text: string; transform: (t: string) => string; previewStyle: string; setPreviewStyle: (id: string) => void; reduceMotion: boolean }) {
  const styled = transform(text);
  return (
    <section aria-label="Social profile preview" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Sparkles className="size-4 text-primary" />Profile preview</h2>
        <div className="flex flex-wrap gap-1">
          {["bold-script", "fraktur", "fullwidth", "small-caps", "circled-neg"].map((id) => {
            const s = FANCY_STYLES.find((x) => x.id === id)!;
            return <SegBtn key={id} active={previewStyle === id} onClick={() => setPreviewStyle(id)} label={s.label} />;
          })}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewCard platform="Instagram" reduceMotion={reduceMotion}>
          <div className="flex items-center gap-3">
            <span className="size-12 shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]"><span className="block size-full rounded-full bg-card" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{styled}</p><p className="text-xs text-muted-foreground">1.2k followers</p></div>
          </div>
        </PreviewCard>
        <PreviewCard platform="TikTok" reduceMotion={reduceMotion}>
          <div className="flex flex-col items-center text-center">
            <span className="size-12 rounded-full bg-gradient-to-br from-cyan-400 to-rose-500" />
            <p className="mt-1.5 max-w-full truncate text-sm font-semibold">{styled}</p>
            <p className="text-xs text-muted-foreground">@{text.replace(/\s+/g, "").toLowerCase()}</p>
          </div>
        </PreviewCard>
        <PreviewCard platform="Discord" reduceMotion={reduceMotion}>
          <div className="flex items-center gap-2.5">
            <span className="relative size-10 shrink-0 rounded-full bg-indigo-500"><span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-emerald-500" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{styled}</p><p className="text-xs text-emerald-500">● Online</p></div>
          </div>
        </PreviewCard>
      </div>
    </section>
  );
}

function PreviewCard({ platform, children, reduceMotion }: { platform: string; children: React.ReactNode; reduceMotion: boolean }) {
  return (
    <motion.div initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-border/70 bg-card p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{platform}</p>
      {children}
    </motion.div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:flex-none", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
}
function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground/80 hover:bg-muted")}>{label}</button>;
}
