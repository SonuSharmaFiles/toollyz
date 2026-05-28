"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  Heart,
  ImageDown,
  Moon,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ELEMENTS,
  FOCUS_META,
  PERIOD_LABEL,
  SIGN_BY_ID,
  THEMES,
  THEME_BY_ID,
  ZODIAC,
  ZODIAC_FACTS,
  compatibility,
  generateHoroscope,
  horoscopeShareCanvas,
  rankCompatibility,
  readingToText,
  signFromDate,
  signOfTheDay,
  type Compatibility,
  type CosmicTheme,
  type ElementId,
  type HoroscopeFocus,
  type HoroscopePeriod,
  type Reading,
  type SignId,
  type ZodiacSign,
} from "@/lib/tools/horoscope/horoscope";

const SAVE_KEY = "toollyz:horoscope-saved";
const SETTINGS_KEY = "toollyz:horoscope-settings";

type Tab = "horoscope" | "compatibility" | "discover";

interface SavedReading {
  id: string;
  kind: "reading";
  signId: SignId;
  period: HoroscopePeriod;
  focus: HoroscopeFocus;
  dateLabel: string;
  headline: string;
}
interface SavedCompat {
  id: string;
  kind: "compat";
  a: SignId;
  b: SignId;
  score: number;
}
type SavedItem = SavedReading | SavedCompat;

const PERIODS: HoroscopePeriod[] = ["daily", "weekly", "monthly", "yearly"];
const FOCI: HoroscopeFocus[] = ["general", "love", "career", "health", "finance", "friendship"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function HoroscopeGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [tab, setTab] = React.useState<Tab>("horoscope");
  const [sign, setSign] = React.useState<SignId>("aries");
  const [period, setPeriod] = React.useState<HoroscopePeriod>("daily");
  const [focus, setFocus] = React.useState<HoroscopeFocus>("general");
  const [themeId, setThemeId] = React.useState("cosmic");
  const [revealKey, setRevealKey] = React.useState(0);
  const [generating, setGenerating] = React.useState(false);
  const [saved, setSaved] = React.useState<SavedItem[]>([]);

  const theme = THEME_BY_ID[themeId] ?? THEMES[0];

  React.useEffect(() => {
    setNow(new Date());
    setSign(signOfTheDay());
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) setSaved(JSON.parse(s));
      const cfg = localStorage.getItem(SETTINGS_KEY);
      if (cfg) {
        const p = JSON.parse(cfg);
        if (p.themeId) setThemeId(p.themeId);
        if (p.sign) setSign(p.sign);
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ themeId, sign }));
    } catch {
      /* noop */
    }
  }, [themeId, sign, mounted]);

  function persistSaved(next: SavedItem[]) {
    setSaved(next);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  const reading = React.useMemo(
    () => generateHoroscope(sign, period, focus, now),
    [sign, period, focus, now],
  );

  const dayReading = React.useMemo(() => {
    const sod = signOfTheDay(now);
    return { signId: sod, reading: generateHoroscope(sod, "daily", "general", now) };
  }, [now]);

  function regenerate(nextSign?: SignId) {
    if (nextSign) setSign(nextSign);
    setGenerating(true);
    setRevealKey((k) => k + 1);
    window.setTimeout(() => setGenerating(false), 480);
  }

  function saveReading() {
    const item: SavedReading = {
      id: uid(), kind: "reading", signId: sign, period, focus,
      dateLabel: reading.dateLabel, headline: reading.headline,
    };
    persistSaved([item, ...saved].slice(0, 60));
    toast.success("Reading saved");
  }

  function shareImage() {
    const canvas = horoscopeShareCanvas(reading, theme);
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `toollyz-horoscope-${sign}-${reading.key}.png`);
      toast.success("Astrology card downloaded");
    }, "image/png");
  }

  function exportTxt() {
    const blob = new Blob([readingToText(reading)], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `toollyz-horoscope-${sign}.txt`);
    toast.success("Horoscope downloaded");
  }

  if (!mounted) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-12 animate-pulse rounded-2xl bg-muted" />
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section
        aria-label="Cosmic hero"
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-10"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, color: theme.text }}
      >
        <Starfield reduceMotion={!!reduceMotion} />
        <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
          <ZodiacWheel
            selected={sign}
            onSelect={(s) => regenerate(s)}
            theme={theme}
            reduceMotion={!!reduceMotion}
          />
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ background: "rgba(255,255,255,0.12)", color: theme.sub }}
            >
              <Sparkles className="size-3.5" />
              {PERIOD_LABEL.daily} · {dayReading.reading.dateLabel}
            </div>
            <h2 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
              <span style={{ color: theme.accent }}>{SIGN_BY_ID[dayReading.signId].symbol}</span>{" "}
              Cosmic energy favors {SIGN_BY_ID[dayReading.signId].name} today
            </h2>
            <p className="max-w-xl text-pretty text-sm leading-relaxed sm:text-base" style={{ color: theme.sub }}>
              {dayReading.reading.headline}. Choose your sign on the wheel to reveal a personalized
              reading across love, career, health and more.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  regenerate(sign);
                  toast.success("The stars have spoken ✨");
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03]"
                style={{ background: theme.accent, color: "#1a1333" }}
              >
                <Wand2 className="size-4" />
                Reveal my horoscope
              </button>
              <button
                type="button"
                onClick={() => regenerate(signOfTheDay(now))}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.14)", color: theme.text }}
              >
                <Star className="size-4" />
                Sign of the day
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-card p-1.5">
        <TabButton active={tab === "horoscope"} onClick={() => setTab("horoscope")} icon={<Moon className="size-4" />} label="Horoscope" />
        <TabButton active={tab === "compatibility"} onClick={() => setTab("compatibility")} icon={<Heart className="size-4" />} label="Compatibility" />
        <TabButton active={tab === "discover"} onClick={() => setTab("discover")} icon={<Sparkles className="size-4" />} label="Discover" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "horoscope" && (
            <HoroscopeTab
              sign={sign}
              setSign={(s) => regenerate(s)}
              period={period}
              setPeriod={(p) => { setPeriod(p); regenerate(); }}
              focus={focus}
              setFocus={(f) => { setFocus(f); regenerate(); }}
              themeId={themeId}
              setThemeId={setThemeId}
              theme={theme}
              reading={reading}
              revealKey={revealKey}
              generating={generating}
              reduceMotion={!!reduceMotion}
              onRegenerate={() => regenerate()}
              onSave={saveReading}
              onShareImage={shareImage}
              onExportTxt={exportTxt}
              onPickCompatible={(s) => regenerate(s)}
            />
          )}
          {tab === "compatibility" && (
            <CompatibilityTab
              reduceMotion={!!reduceMotion}
              onSave={(c) => {
                const item: SavedCompat = { id: uid(), kind: "compat", a: c.a, b: c.b, score: c.score };
                persistSaved([item, ...saved].slice(0, 60));
                toast.success("Compatibility saved");
              }}
            />
          )}
          {tab === "discover" && <DiscoverTab now={now} reduceMotion={!!reduceMotion} onReadSign={(s) => { setTab("horoscope"); regenerate(s); }} />}
        </motion.div>
      </AnimatePresence>

      {/* ─── Saved ────────────────────────────────────────────────── */}
      {saved.length > 0 && (
        <SavedPanel
          saved={saved}
          onOpen={(it) => {
            if (it.kind === "reading") {
              setTab("horoscope");
              setPeriod(it.period);
              setFocus(it.focus);
              regenerate(it.signId);
            } else {
              setTab("compatibility");
            }
          }}
          onRemove={(id) => persistSaved(saved.filter((s) => s.id !== id))}
          onClear={() => persistSaved([])}
        />
      )}
    </div>
  );
}

// ─── Horoscope tab ──────────────────────────────────────────────────────────

function HoroscopeTab({
  sign, setSign, period, setPeriod, focus, setFocus, themeId, setThemeId, theme,
  reading, revealKey, generating, reduceMotion, onRegenerate, onSave, onShareImage,
  onExportTxt, onPickCompatible,
}: {
  sign: SignId;
  setSign: (s: SignId) => void;
  period: HoroscopePeriod;
  setPeriod: (p: HoroscopePeriod) => void;
  focus: HoroscopeFocus;
  setFocus: (f: HoroscopeFocus) => void;
  themeId: string;
  setThemeId: (id: string) => void;
  theme: CosmicTheme;
  reading: Reading;
  revealKey: number;
  generating: boolean;
  reduceMotion: boolean;
  onRegenerate: () => void;
  onSave: () => void;
  onShareImage: () => void;
  onExportTxt: () => void;
  onPickCompatible: (s: SignId) => void;
}) {
  const signData = SIGN_BY_ID[sign];
  const [bMonth, setBMonth] = React.useState("1");
  const [bDay, setBDay] = React.useState("1");

  function findByBirthday() {
    const s = signFromDate(Number(bMonth), Number(bDay));
    setSign(s.id);
    toast.success(`You're a ${s.name} ${s.symbol}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Your sign</Label>
          <Select value={sign} onValueChange={(v) => v && setSign(v as SignId)}>
            <SelectTrigger className="w-full justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZODIAC.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.symbol} {s.name} · {s.dates}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-3">
          <Label className="text-xs">Or find by birth date</Label>
          <div className="mt-2 flex gap-2">
            <Select value={bMonth} onValueChange={(v) => v && setBMonth(v)}>
              <SelectTrigger className="flex-1 justify-between"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number" min={1} max={31} value={bDay}
              onChange={(e) => setBDay(e.target.value)}
              className="w-20 rounded-lg" aria-label="Birth day"
            />
            <Button type="button" variant="outline" size="icon" onClick={findByBirthday} aria-label="Find my sign">
              <Search className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Time frame</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {PERIODS.map((p) => (
              <Pill key={p} active={period === p} onClick={() => setPeriod(p)} label={p[0].toUpperCase() + p.slice(1)} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Focus</Label>
          <div className="flex flex-wrap gap-1.5">
            {FOCI.map((f) => (
              <Pill key={f} active={focus === f} onClick={() => setFocus(f)} label={`${FOCUS_META[f].emoji} ${FOCUS_META[f].label}`} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Card theme</Label>
          <Select value={themeId} onValueChange={(v) => v && setThemeId(v)}>
            <SelectTrigger className="w-full justify-between"><SelectValue /></SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" className="w-full" onClick={onRegenerate}>
          <RefreshCw className="size-4" />
          Regenerate
        </Button>

        {/* Zodiac mini-profile */}
        <ProfileMini sign={signData} />
      </div>

      {/* Result */}
      <div className="min-w-0 space-y-5">
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-80 animate-pulse rounded-3xl"
              style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, opacity: 0.5 }}
            />
          ) : (
            <motion.div
              key={`reading-${revealKey}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ReadingCard
                reading={reading}
                theme={theme}
                reduceMotion={reduceMotion}
                onSave={onSave}
                onShareImage={onShareImage}
                onExportTxt={onExportTxt}
                onPickCompatible={onPickCompatible}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Life-area guidance */}
        <div className="grid gap-3 sm:grid-cols-2">
          {(["love","career","health","finance","friendship"] as const).map((area) => (
            <div key={area} className="rounded-2xl border border-border/70 bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span>{FOCUS_META[area].emoji}</span>
                {FOCUS_META[area].label}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {reading.sections[area]}
              </p>
            </div>
          ))}
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: `${signData.accent}55`, background: `${signData.accent}12` }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4" style={{ color: signData.accent }} />
              Cosmic advice
            </h3>
            <p className="mt-1.5 text-sm font-medium leading-relaxed">{reading.advice}</p>
          </div>
        </div>

        <SocialPreviews reading={reading} theme={theme} />
      </div>
    </div>
  );
}

// ─── Reading card ───────────────────────────────────────────────────────────

function ReadingCard({
  reading, theme, reduceMotion, onSave, onShareImage, onExportTxt, onPickCompatible,
}: {
  reading: Reading;
  theme: CosmicTheme;
  reduceMotion: boolean;
  onSave: () => void;
  onShareImage: () => void;
  onExportTxt: () => void;
  onPickCompatible: (s: SignId) => void;
}) {
  const sign = SIGN_BY_ID[reading.signId];
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(readingToText(reading));
      setCopied(true);
      toast.success("Horoscope copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title: `${sign.name} horoscope`, text: readingToText(reading) }).catch(() => {});
    } else {
      copy();
    }
  }

  return (
    <article
      className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8"
      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, color: theme.text }}
    >
      <Starfield reduceMotion={reduceMotion} count={40} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-5xl leading-none" style={{ color: theme.accent }}>{sign.symbol}</span>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">{sign.name}</h2>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: theme.sub }}>
                {PERIOD_LABEL[reading.period]} · {reading.dateLabel}
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.14)" }}
          >
            {reading.mood.emoji} {reading.mood.word}
          </span>
        </div>

        <p className="mt-5 font-heading text-xl font-semibold italic leading-snug" style={{ color: theme.accent }}>
          &ldquo;{reading.headline}&rdquo;
        </p>
        <p className="mt-3 text-pretty text-sm leading-relaxed sm:text-base">{reading.main}</p>

        {/* Meters */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Meter label="Energy" value={reading.meters.energy} theme={theme} reduceMotion={reduceMotion} />
          <Meter label="Luck" value={reading.meters.luck} theme={theme} reduceMotion={reduceMotion} />
          <Meter label="Love" value={reading.meters.love} theme={theme} reduceMotion={reduceMotion} />
          <Meter label="Career" value={reading.meters.career} theme={theme} reduceMotion={reduceMotion} />
        </div>

        {/* Lucky elements */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <LuckyBox label="Lucky numbers">
            <div className="flex flex-wrap gap-1.5">
              {reading.lucky.numbers.map((n) => (
                <span key={n} className="grid size-7 place-items-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.16)" }}>
                  {n}
                </span>
              ))}
            </div>
          </LuckyBox>
          <LuckyBox label="Lucky colors">
            <div className="flex items-center gap-2">
              {reading.lucky.colors.map((c) => (
                <span key={c.hex} className="flex items-center gap-1 text-xs">
                  <span className="size-4 rounded-full ring-2 ring-white/30" style={{ background: c.hex }} />
                  {c.name}
                </span>
              ))}
            </div>
          </LuckyBox>
          <LuckyBox label="Lucky time"><span className="text-sm font-semibold">{reading.lucky.time}</span></LuckyBox>
          <LuckyBox label="Lucky day"><span className="text-sm font-semibold">{reading.lucky.day}</span></LuckyBox>
        </div>

        {/* Compatible today */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.sub }}>
            Most compatible today
          </p>
          <div className="flex flex-wrap gap-2">
            {reading.compatibleToday.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onPickCompatible(c)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-transform hover:scale-105"
                style={{ background: "rgba(255,255,255,0.14)" }}
              >
                <span style={{ color: theme.accent }}>{SIGN_BY_ID[c].symbol}</span>
                {SIGN_BY_ID[c].name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <ActionBtn onClick={copy} theme={theme} icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />} label={copied ? "Copied" : "Copy"} />
          <ActionBtn onClick={onShareImage} theme={theme} icon={<ImageDown className="size-4" />} label="Image" />
          <ActionBtn onClick={onExportTxt} theme={theme} icon={<Download className="size-4" />} label="TXT" />
          <ActionBtn onClick={share} theme={theme} icon={<Share2 className="size-4" />} label="Share" />
          <ActionBtn onClick={onSave} theme={theme} icon={<Heart className="size-4" />} label="Save" />
        </div>
      </div>
    </article>
  );
}

function ActionBtn({ onClick, theme, icon, label }: { onClick: () => void; theme: CosmicTheme; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:brightness-110"
      style={{ background: "rgba(255,255,255,0.14)", color: theme.text }}
    >
      {icon}
      {label}
    </button>
  );
}

function LuckyBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      {children}
    </div>
  );
}

function Meter({ label, value, theme, reduceMotion }: { label: string; value: number; theme: CosmicTheme; reduceMotion: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium">
        <span style={{ color: theme.sub }}>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: theme.accent }}
          initial={{ width: reduceMotion ? `${value}%` : 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Zodiac wheel ───────────────────────────────────────────────────────────

function ZodiacWheel({ selected, onSelect, theme, reduceMotion }: {
  selected: SignId;
  onSelect: (s: SignId) => void;
  theme: CosmicTheme;
  reduceMotion: boolean;
}) {
  const sel = SIGN_BY_ID[selected];
  return (
    <div className="relative mx-auto aspect-square w-[260px] shrink-0 sm:w-[320px]">
      {/* rotating decorative rings */}
      <motion.div
        className="absolute inset-2 rounded-full border border-dashed"
        style={{ borderColor: "rgba(255,255,255,0.25)" }}
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 90, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-8 rounded-full border"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
        animate={reduceMotion ? {} : { rotate: -360 }}
        transition={{ duration: 120, ease: "linear", repeat: Infinity }}
      />
      {/* center */}
      <div className="absolute left-1/2 top-1/2 flex size-[44%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center"
        style={{ background: "rgba(0,0,0,0.25)", boxShadow: `0 0 40px ${theme.accent}55` }}>
        <span className="text-4xl sm:text-5xl" style={{ color: theme.accent }}>{sel.symbol}</span>
        <span className="mt-1 text-xs font-semibold" style={{ color: theme.text }}>{sel.name}</span>
      </div>
      {/* signs */}
      {ZODIAC.map((s, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + 43 * Math.cos(angle);
        const y = 50 + 43 * Math.sin(angle);
        const active = s.id === selected;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-label={`Select ${s.name}`}
            aria-pressed={active}
            className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-lg transition-transform hover:scale-125 sm:size-10"
            style={{
              left: `${x}%`, top: `${y}%`,
              background: active ? theme.accent : "rgba(255,255,255,0.12)",
              color: active ? "#1a1333" : theme.text,
              boxShadow: active ? `0 0 18px ${theme.accent}` : "none",
            }}
          >
            {s.symbol}
          </button>
        );
      })}
    </div>
  );
}

function Starfield({ reduceMotion, count = 60 }: { reduceMotion: boolean; count?: number }) {
  const stars = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        dur: 2 + Math.random() * 3,
      })),
    [count],
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ─── Compatibility tab ──────────────────────────────────────────────────────

function CompatibilityTab({ reduceMotion, onSave }: { reduceMotion: boolean; onSave: (c: Compatibility) => void }) {
  const [a, setA] = React.useState<SignId>("aries");
  const [b, setB] = React.useState<SignId>("leo");
  const [result, setResult] = React.useState<Compatibility | null>(() => compatibility("aries", "leo"));

  function check() {
    setResult(compatibility(a, b));
  }

  const sa = SIGN_BY_ID[a];
  const sb = SIGN_BY_ID[b];

  return (
    <div className="space-y-6">
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <Label>First sign</Label>
          <Select value={a} onValueChange={(v) => v && setA(v as SignId)}>
            <SelectTrigger className="w-full justify-between"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ZODIAC.map((s) => <SelectItem key={s.id} value={s.id}>{s.symbol} {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden pb-2 text-center text-2xl sm:block">💞</div>
        <div className="space-y-2">
          <Label>Second sign</Label>
          <Select value={b} onValueChange={(v) => v && setB(v as SignId)}>
            <SelectTrigger className="w-full justify-between"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ZODIAC.map((s) => <SelectItem key={s.id} value={s.id}>{s.symbol} {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="button" size="lg" onClick={check} className="w-full sm:w-auto">
        <Heart className="size-4" />
        Check compatibility
      </Button>

      {result && (
        <motion.div
          key={`${result.a}-${result.b}`}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <SignBubble sign={sa} />
              <ScoreRing score={result.score} reduceMotion={reduceMotion} />
              <SignBubble sign={sb} />
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bandLabel(result.band)}</p>
              <p className="font-heading text-3xl font-bold text-primary">{result.score}%</p>
              <p className="text-sm text-muted-foreground">{sa.name} &amp; {sb.name}</p>
            </div>
          </div>

          <p className="mt-6 text-pretty text-center text-base leading-relaxed">{result.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <CompatMeter label="Emotional" value={result.emotional} reduceMotion={reduceMotion} />
            <CompatMeter label="Communication" value={result.communication} reduceMotion={reduceMotion} />
            <CompatMeter label="Trust" value={result.trust} reduceMotion={reduceMotion} />
            <CompatMeter label="Passion" value={result.passion} reduceMotion={reduceMotion} />
            <CompatMeter label="Long-term" value={result.longTerm} reduceMotion={reduceMotion} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InsightBox tone="good" title="Strengths" text={result.strengths} />
            <InsightBox tone="warn" title="Possible conflicts" text={result.conflicts} />
            <InsightBox tone="neutral" title="Outlook" text={result.outlook} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(`${sa.name} & ${sb.name} compatibility: ${result.score}% — ${result.summary}`);
              toast.success("Compatibility copied");
            }}>
              <Copy className="size-4" /> Copy report
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onSave(result)}>
              <Heart className="size-4" /> Save
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function bandLabel(band: Compatibility["band"]): string {
  return { soulmates: "Cosmic soulmates", great: "Great match", good: "Good match", growth: "Growth match" }[band];
}

function SignBubble({ sign }: { sign: ZodiacSign }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="grid size-14 place-items-center rounded-full text-2xl text-white shadow-md"
        style={{ background: `linear-gradient(135deg, ${sign.gradient[0]}, ${sign.gradient[1]})` }}
      >
        {sign.symbol}
      </span>
      <span className="text-xs font-medium">{sign.name}</span>
    </div>
  );
}

function ScoreRing({ score, reduceMotion }: { score: number; reduceMotion: boolean }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative grid size-24 place-items-center">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted" />
        <motion.circle
          cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
          className="text-primary" strokeDasharray={c}
          initial={{ strokeDashoffset: reduceMotion ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-lg font-bold">{score}%</span>
    </div>
  );
}

function CompatMeter({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="mb-1 flex items-center justify-between text-xs font-medium">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: reduceMotion ? `${value}%` : 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function InsightBox({ tone, title, text }: { tone: "good" | "warn" | "neutral"; title: string; text: string }) {
  const styles = {
    good: "border-emerald-400/30 bg-emerald-500/5",
    warn: "border-amber-400/30 bg-amber-500/5",
    neutral: "border-border/60 bg-muted/30",
  }[tone];
  return (
    <div className={cn("rounded-2xl border p-4", styles)}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

// ─── Discover tab ───────────────────────────────────────────────────────────

function DiscoverTab({ now, reduceMotion, onReadSign }: { now: Date; reduceMotion: boolean; onReadSign: (s: SignId) => void }) {
  const [fact, setFact] = React.useState(() => ZODIAC_FACTS[0]);
  const [elementFilter, setElementFilter] = React.useState<ElementId | "all">("all");

  React.useEffect(() => {
    setFact(ZODIAC_FACTS[Math.floor(Math.random() * ZODIAC_FACTS.length)]);
  }, []);

  const signs = elementFilter === "all" ? ZODIAC : ZODIAC.filter((s) => s.element === elementFilter);

  return (
    <div className="space-y-6">
      {/* Fact */}
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-pretty text-sm font-medium leading-relaxed">
          <Sparkles className="mr-1.5 inline size-4 text-primary" />
          {fact}
        </p>
        <Button
          type="button" variant="outline" size="sm" className="shrink-0"
          onClick={() => setFact(ZODIAC_FACTS[Math.floor(Math.random() * ZODIAC_FACTS.length)])}
        >
          <RefreshCw className="size-4" /> Another fact
        </Button>
      </div>

      {/* Element filter */}
      <div className="flex flex-wrap gap-1.5">
        <Pill active={elementFilter === "all"} onClick={() => setElementFilter("all")} label="All signs" />
        {(Object.keys(ELEMENTS) as ElementId[]).map((el) => (
          <Pill key={el} active={elementFilter === el} onClick={() => setElementFilter(el)} label={`${ELEMENTS[el].emoji} ${ELEMENTS[el].label}`} />
        ))}
      </div>

      {elementFilter !== "all" && (
        <p className="text-sm text-muted-foreground">{ELEMENTS[elementFilter].blurb}</p>
      )}

      {/* Profile cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signs.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reduceMotion ? 0 : i * 0.03 }}
          >
            <ZodiacProfileCard sign={s} now={now} onRead={() => onReadSign(s.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ZodiacProfileCard({ sign, now, onRead }: { sign: ZodiacSign; now: Date; onRead: () => void }) {
  const top = rankCompatibility(sign.id).slice(0, 3).map((c) => SIGN_BY_ID[c.id]);
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="relative p-5 text-white" style={{ background: `linear-gradient(135deg, ${sign.gradient[0]}, ${sign.gradient[1]})` }}>
        <div className="flex items-center justify-between">
          <span className="text-4xl">{sign.symbol}</span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {ELEMENTS[sign.element].emoji} {ELEMENTS[sign.element].label}
          </span>
        </div>
        <h3 className="mt-2 font-heading text-xl font-bold">{sign.name}</h3>
        <p className="text-xs opacity-90">{sign.dates} · {sign.planet}</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {sign.traits.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">{t}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">Strengths</p>
            <p className="text-muted-foreground">{sign.strengths.slice(0, 3).join(", ")}</p>
          </div>
          <div>
            <p className="font-semibold text-amber-600 dark:text-amber-400">Watch for</p>
            <p className="text-muted-foreground">{sign.weaknesses.join(", ")}</p>
          </div>
        </div>
        <div className="text-xs">
          <p className="font-semibold">Best matches</p>
          <p className="text-muted-foreground">{top.map((t) => `${t.symbol} ${t.name}`).join(" · ")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-auto" onClick={onRead}>
          Read {sign.name} horoscope
        </Button>
      </div>
    </div>
  );
}

function ProfileMini({ sign }: { sign: ZodiacSign }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-full text-xl text-white"
          style={{ background: `linear-gradient(135deg, ${sign.gradient[0]}, ${sign.gradient[1]})` }}>
          {sign.symbol}
        </span>
        <div>
          <p className="text-sm font-semibold">{sign.name}</p>
          <p className="text-[11px] text-muted-foreground">{ELEMENTS[sign.element].emoji} {ELEMENTS[sign.element].label} · {sign.planet}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {sign.traits.map((t) => (
          <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Social previews ────────────────────────────────────────────────────────

function SocialPreviews({ reading, theme }: { reading: Reading; theme: CosmicTheme }) {
  const sign = SIGN_BY_ID[reading.signId];
  return (
    <section aria-labelledby="social-heading" className="space-y-3">
      <h3 id="social-heading" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Sparkles className="size-4 text-primary" /> Share preview
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Instagram post</p>
          <div className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-xl p-6 text-center"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, color: theme.text }}>
            <span className="text-5xl" style={{ color: theme.accent }}>{sign.symbol}</span>
            <p className="font-heading text-lg font-bold">{sign.name}</p>
            <p className="line-clamp-3 text-xs italic" style={{ color: theme.accent }}>&ldquo;{reading.headline}&rdquo;</p>
            <p className="text-[10px]" style={{ color: theme.sub }}>{reading.mood.emoji} {reading.mood.word} · {reading.dateLabel}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Story</p>
          <div className="relative mx-auto flex aspect-[9/16] max-h-72 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl p-6 text-center"
            style={{ background: `linear-gradient(160deg, ${theme.from}, ${theme.to})`, color: theme.text }}>
            <span className="text-6xl" style={{ color: theme.accent }}>{sign.symbol}</span>
            <p className="font-heading text-xl font-bold">{sign.name} {PERIOD_LABEL[reading.period]}</p>
            <p className="line-clamp-4 text-xs leading-relaxed">{reading.main}</p>
            <p className="text-[10px]" style={{ color: theme.sub }}>toollyz.com</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Saved panel ────────────────────────────────────────────────────────────

function SavedPanel({ saved, onOpen, onRemove, onClear }: {
  saved: SavedItem[];
  onOpen: (it: SavedItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section aria-label="Saved readings" className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Heart className="size-4 fill-rose-500 text-rose-500" />
          Saved
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">{saved.length}</span>
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="size-3.5" /> Clear
        </Button>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 list-none">
        {saved.map((it) => (
          <li key={it.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-3 text-sm">
            {it.kind === "reading" ? (
              <>
                <span className="text-xl">{SIGN_BY_ID[it.signId].symbol}</span>
                <button type="button" onClick={() => onOpen(it)} className="min-w-0 flex-1 text-left">
                  <span className="font-medium">{SIGN_BY_ID[it.signId].name}</span>{" "}
                  <span className="text-xs text-muted-foreground">· {PERIOD_LABEL[it.period]}</span>
                  <span className="block truncate text-xs italic text-muted-foreground">&ldquo;{it.headline}&rdquo;</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-base">{SIGN_BY_ID[it.a].symbol}{SIGN_BY_ID[it.b].symbol}</span>
                <button type="button" onClick={() => onOpen(it)} className="min-w-0 flex-1 text-left">
                  <span className="font-medium">{SIGN_BY_ID[it.a].name} &amp; {SIGN_BY_ID[it.b].name}</span>
                  <span className="block text-xs text-muted-foreground">Compatibility · {it.score}%</span>
                </button>
              </>
            )}
            <button type="button" onClick={() => onRemove(it.id)} aria-label="Remove" className="shrink-0 text-muted-foreground hover:text-rose-500">
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Small controls ─────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-foreground/80 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
