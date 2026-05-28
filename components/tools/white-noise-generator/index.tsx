"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Heart,
  Pause,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Square,
  Timer,
  Trash2,
  Volume,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NoiseEngine } from "@/lib/tools/noise/engine";
import {
  BUILTIN_PRESETS,
  CATEGORIES,
  SOUNDS,
  SOUNDS_BY_ID,
  type Preset,
  type SoundCategory,
  type SoundId,
} from "@/lib/tools/noise/sounds";

const STORAGE_PRESETS = "toollyz:noise-presets";
const STORAGE_FAVORITES = "toollyz:noise-favorites";

const TIMER_OPTIONS = [
  { value: "off", label: "No timer" },
  { value: "900", label: "15 minutes" },
  { value: "1800", label: "30 minutes" },
  { value: "3600", label: "1 hour" },
  { value: "7200", label: "2 hours" },
] as const;

export default function WhiteNoiseGenerator() {
  const engineRef = React.useRef<NoiseEngine | null>(null);
  const [activeVolumes, setActiveVolumes] = React.useState<
    Partial<Record<SoundId, number>>
  >({});
  const [masterVolume, setMasterVolume] = React.useState(0.7);
  const [favorites, setFavorites] = React.useState<SoundId[]>([]);
  const [presets, setPresets] = React.useState<Preset[]>([]);
  const [presetName, setPresetName] = React.useState("");
  const [timerSec, setTimerSec] = React.useState<string>("off");
  const [timerRemaining, setTimerRemaining] = React.useState<number | null>(null);

  // Initialize engine + load saved state
  React.useEffect(() => {
    engineRef.current = new NoiseEngine();
    try {
      const f = localStorage.getItem(STORAGE_FAVORITES);
      if (f) setFavorites(JSON.parse(f));
      const p = localStorage.getItem(STORAGE_PRESETS);
      if (p) setPresets(JSON.parse(p));
    } catch {
      /* noop */
    }
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  // Live timer countdown
  React.useEffect(() => {
    if (timerRemaining === null) return;
    const id = window.setInterval(() => {
      setTimerRemaining((cur) => {
        if (cur === null) return null;
        if (cur <= 1) {
          // Fire fade-out + stop all
          engineRef.current?.fadeOut(8);
          window.setTimeout(() => {
            engineRef.current?.stopAll(1);
            engineRef.current?.resetFade();
            setActiveVolumes({});
          }, 8500);
          return null;
        }
        return cur - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRemaining]);

  function persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }

  function toggleSound(id: SoundId) {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isPlaying(id)) {
      engine.stop(id);
      setActiveVolumes((v) => {
        const next = { ...v };
        delete next[id];
        return next;
      });
    } else {
      const startVol = 0.5;
      engine.play(id, startVol);
      setActiveVolumes((v) => ({ ...v, [id]: startVol }));
    }
  }

  function setSoundVolume(id: SoundId, vol: number) {
    engineRef.current?.setVolume(id, vol);
    setActiveVolumes((v) => ({ ...v, [id]: vol }));
  }

  function changeMaster(vol: number) {
    setMasterVolume(vol);
    engineRef.current?.setMasterVolume(vol);
  }

  function stopAll() {
    engineRef.current?.stopAll();
    engineRef.current?.resetFade();
    setActiveVolumes({});
    setTimerRemaining(null);
    setTimerSec("off");
    toast.info("All sounds stopped");
  }

  function loadPreset(preset: Preset) {
    const engine = engineRef.current;
    if (!engine) return;
    engine.stopAll(0.2);
    engine.resetFade();
    window.setTimeout(() => {
      const newVols: Partial<Record<SoundId, number>> = {};
      Object.entries(preset.tracks).forEach(([sid, vol]) => {
        const id = sid as SoundId;
        if (vol !== undefined && vol > 0) {
          engine.play(id, vol);
          newVols[id] = vol;
        }
      });
      setActiveVolumes(newVols);
      toast.success(`Loaded "${preset.name}"`);
    }, 250);
  }

  function saveCurrentAsPreset() {
    if (Object.keys(activeVolumes).length === 0) {
      toast.error("Add some sounds first");
      return;
    }
    const name = presetName.trim();
    if (!name) {
      toast.error("Give your preset a name");
      return;
    }
    const preset: Preset = {
      id: crypto.randomUUID(),
      name,
      description: `${Object.keys(activeVolumes).length} sound${Object.keys(activeVolumes).length === 1 ? "" : "s"}`,
      tracks: { ...activeVolumes },
    };
    setPresets((prev) => {
      const next = [preset, ...prev].slice(0, 12);
      persist(STORAGE_PRESETS, next);
      return next;
    });
    setPresetName("");
    toast.success(`Saved "${name}"`);
  }

  function deletePreset(id: string) {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist(STORAGE_PRESETS, next);
      return next;
    });
  }

  function toggleFavorite(id: SoundId) {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id];
      persist(STORAGE_FAVORITES, next);
      return next;
    });
  }

  function startTimer(value: string) {
    setTimerSec(value);
    if (value === "off") {
      setTimerRemaining(null);
      engineRef.current?.resetFade();
    } else {
      setTimerRemaining(Number(value));
      engineRef.current?.resetFade();
      toast.success(
        `Sleep timer set — fades out in ${TIMER_OPTIONS.find((t) => t.value === value)?.label}`,
      );
    }
  }

  function formatTimer(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  const totalActive = Object.keys(activeVolumes).length;

  return (
    <div className="relative space-y-6">
      <AmbientBackground active={totalActive > 0} />

      {/* Privacy + master controls bar */}
      <div className="space-y-3">
        <div
          role="note"
          className="flex items-start gap-3 rounded-xl border border-indigo-400/30 bg-indigo-500/5 p-3.5 text-sm backdrop-blur-sm"
        >
          <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-500 dark:text-indigo-300">
            <ShieldCheck className="size-3.5" />
          </span>
          <p className="text-foreground/90">
            <span className="font-medium">All audio runs in your browser.</span>{" "}
            <span className="text-foreground/70">
              Every sound is synthesized live with the Web Audio API — no recordings
              are streamed, no preferences leave your device.
            </span>
          </p>
        </div>

        {/* Master bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">
                {totalActive === 0
                  ? "Pick a sound to begin"
                  : `${totalActive} sound${totalActive === 1 ? "" : "s"} playing`}
              </p>
              {timerRemaining !== null && (
                <p className="flex items-center gap-1 text-xs text-amber-500">
                  <Timer className="size-3" />
                  Fades out in{" "}
                  <span className="font-mono tabular-nums">
                    {formatTimer(timerRemaining)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMaster(masterVolume > 0 ? 0 : 0.7)}
                aria-label={masterVolume > 0 ? "Mute" : "Unmute"}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {masterVolume === 0 ? (
                  <VolumeX className="size-4" />
                ) : masterVolume < 0.5 ? (
                  <Volume className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
              <Slider
                value={[masterVolume * 100]}
                onValueChange={(v) =>
                  changeMaster((Array.isArray(v) ? v[0] : v) / 100)
                }
                min={0}
                max={100}
                step={1}
                aria-label="Master volume"
                className="w-32"
              />
            </div>

            <Select value={timerSec} onValueChange={(v) => v && startTimer(v)}>
              <SelectTrigger className="w-36">
                <Timer className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMER_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant={totalActive > 0 ? "outline" : "ghost"}
              size="sm"
              onClick={stopAll}
              disabled={totalActive === 0}
            >
              <Square className="size-3.5" />
              Stop all
            </Button>
          </div>
        </div>
      </div>

      {/* Presets section */}
      <section aria-label="Presets" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Quick presets</h2>
          {presets.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {presets.length} saved
            </span>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-2 list-none sm:grid-cols-3 lg:grid-cols-5">
          {BUILTIN_PRESETS.map((preset) => (
            <li key={preset.id}>
              <PresetCard preset={preset} onLoad={() => loadPreset(preset)} />
            </li>
          ))}
        </ul>
        {presets.length > 0 && (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Your mixes
            </p>
            <ul className="grid grid-cols-2 gap-2 list-none sm:grid-cols-3 lg:grid-cols-5">
              {presets.map((preset) => (
                <li key={preset.id} className="relative">
                  <PresetCard
                    preset={preset}
                    onLoad={() => loadPreset(preset)}
                    onDelete={() => deletePreset(preset.id)}
                    custom
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {totalActive > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 p-3 backdrop-blur-sm">
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Name this mix…"
              className="h-9 rounded-lg"
              maxLength={32}
            />
            <Button type="button" size="sm" onClick={saveCurrentAsPreset}>
              <Save className="size-3.5" />
              Save mix
            </Button>
          </div>
        )}
      </section>

      {/* Sound mixer by category */}
      {CATEGORIES.map((cat) => (
        <SoundCategorySection
          key={cat.id}
          categoryId={cat.id}
          label={cat.label}
          activeVolumes={activeVolumes}
          favorites={favorites}
          onToggleSound={toggleSound}
          onChangeVolume={setSoundVolume}
          onToggleFavorite={toggleFavorite}
        />
      ))}

      <BenefitsCards />
    </div>
  );
}

// ─── Ambient background ────────────────────────────────────────────────────

function AmbientBackground({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        animate={{
          opacity: active ? 0.6 : 0.3,
        }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{
            x: ["0%", "20%", "0%"],
            y: ["0%", "10%", "0%"],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 -top-20 size-80 rounded-full bg-indigo-500/15 blur-[100px]"
        />
        <motion.div
          animate={{
            x: ["0%", "-15%", "0%"],
            y: ["0%", "-12%", "0%"],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 top-40 size-96 rounded-full bg-violet-500/15 blur-[120px]"
        />
        <motion.div
          animate={{
            x: ["0%", "10%", "0%"],
            y: ["0%", "15%", "0%"],
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 size-72 rounded-full bg-cyan-500/12 blur-[110px]"
        />
      </motion.div>
    </div>
  );
}

// ─── Preset card ──────────────────────────────────────────────────────────

interface PresetCardProps {
  preset: Preset;
  onLoad: () => void;
  onDelete?: () => void;
  custom?: boolean;
}

function PresetCard({ preset, onLoad, onDelete, custom }: PresetCardProps) {
  return (
    <button
      type="button"
      onClick={onLoad}
      className="group relative flex h-full w-full flex-col gap-1 rounded-xl border border-border/60 bg-card/70 p-3 text-left backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bookmark className="size-3.5" />
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete preset"
            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-semibold tracking-tight">{preset.name}</div>
        <div className="line-clamp-2 text-[11px] text-muted-foreground">
          {preset.description}
        </div>
      </div>
      {custom && (
        <span className="mt-1 inline-flex w-fit items-center rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          Custom
        </span>
      )}
    </button>
  );
}

// ─── Sound category section ──────────────────────────────────────────────

interface SoundCategorySectionProps {
  categoryId: SoundCategory;
  label: string;
  activeVolumes: Partial<Record<SoundId, number>>;
  favorites: SoundId[];
  onToggleSound: (id: SoundId) => void;
  onChangeVolume: (id: SoundId, vol: number) => void;
  onToggleFavorite: (id: SoundId) => void;
}

function SoundCategorySection({
  categoryId,
  label,
  activeVolumes,
  favorites,
  onToggleSound,
  onChangeVolume,
  onToggleFavorite,
}: SoundCategorySectionProps) {
  const sounds = SOUNDS.filter((s) => s.category === categoryId);
  return (
    <section aria-label={label} className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
      <ul className="grid gap-3 list-none sm:grid-cols-2 lg:grid-cols-3">
        {sounds.map((sound) => (
          <li key={sound.id}>
            <SoundCard
              sound={sound}
              isActive={sound.id in activeVolumes}
              volume={activeVolumes[sound.id] ?? 0.5}
              favorited={favorites.includes(sound.id)}
              onToggle={() => onToggleSound(sound.id)}
              onVolumeChange={(v) => onChangeVolume(sound.id, v)}
              onToggleFavorite={() => onToggleFavorite(sound.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Sound card ──────────────────────────────────────────────────────────

interface SoundCardProps {
  sound: typeof SOUNDS[number];
  isActive: boolean;
  volume: number;
  favorited: boolean;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
  onToggleFavorite: () => void;
}

function SoundCard({
  sound,
  isActive,
  volume,
  favorited,
  onToggle,
  onVolumeChange,
  onToggleFavorite,
}: SoundCardProps) {
  const Icon = sound.icon;
  return (
    <motion.div
      layout
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/70 p-4 backdrop-blur-sm transition-colors",
        isActive
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 hover:border-primary/30",
      )}
    >
      {isActive && (
        <motion.div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br opacity-40",
            sound.accent,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6 }}
        />
      )}

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={isActive ? `Pause ${sound.name}` : `Play ${sound.name}`}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl transition-all",
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted/60 text-foreground/80 hover:bg-muted",
          )}
        >
          {isActive ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
        </button>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold tracking-tight">
              {sound.name}
            </h3>
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={favorited ? "Remove favorite" : "Add favorite"}
              className={cn(
                "shrink-0 transition-colors",
                favorited
                  ? "text-rose-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart
                className={cn("size-3.5", favorited && "fill-current")}
              />
            </button>
          </div>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {sound.description}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Icon className="size-3 shrink-0 text-muted-foreground/70" />
            <Slider
              value={[volume * 100]}
              onValueChange={(v) =>
                onVolumeChange((Array.isArray(v) ? v[0] : v) / 100)
              }
              min={0}
              max={100}
              step={1}
              aria-label={`${sound.name} volume`}
              disabled={!isActive}
            />
            <span className="w-8 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Benefits / education ────────────────────────────────────────────────

function BenefitsCards() {
  const cards = [
    {
      title: "Sleep",
      body: "Brown noise + a soft fan masks bedroom sounds and helps you drift off. Use the sleep timer to fade out gradually.",
    },
    {
      title: "Focus",
      body: "Pink noise and ambient chatter keep your brain in a steady state — perfect for deep work or reading.",
    },
    {
      title: "Meditation",
      body: "Slow ocean waves with a low hum create a calm rhythm. Pair with a breathing exercise for best results.",
    },
    {
      title: "Babies",
      body: "Constant white or pink noise mimics the womb. Keep volume low (around 50 dB at the crib) and short distances away.",
    },
  ];
  return (
    <section
      aria-labelledby="noise-uses-heading"
      className="rounded-2xl border border-border/70 bg-card/40 p-5 backdrop-blur-sm"
    >
      <h3
        id="noise-uses-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Sparkles className="size-4 text-primary" />
        How people use it
      </h3>
      <ul className="mt-4 grid gap-3 list-none sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li
            key={c.title}
            className="rounded-xl border border-border/60 bg-background p-4"
          >
            <div className="text-sm font-semibold tracking-tight">{c.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {c.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
