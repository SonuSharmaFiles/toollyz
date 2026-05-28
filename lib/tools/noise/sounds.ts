import {
  AudioWaveform,
  CloudRain,
  Coffee,
  Fan,
  Flame,
  HeartPulse,
  Hexagon,
  Music,
  Sparkles,
  Volume2,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

export type SoundCategory = "noise" | "ambient" | "sleep";

export type SoundId =
  | "white"
  | "pink"
  | "brown"
  | "blue"
  | "gray"
  | "rain"
  | "wind"
  | "ocean"
  | "fan"
  | "fireplace"
  | "coffee"
  | "heartbeat"
  | "crickets"
  | "hum";

export interface SoundConfig {
  id: SoundId;
  name: string;
  category: SoundCategory;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes
  description: string;
}

export const SOUNDS: SoundConfig[] = [
  // ─── Noise colors ─────────────────────────────────────────────────────
  {
    id: "white",
    name: "White noise",
    category: "noise",
    icon: AudioWaveform,
    accent: "from-slate-400/30 to-slate-500/20",
    description: "Equal energy across all frequencies. Pure focus.",
  },
  {
    id: "pink",
    name: "Pink noise",
    category: "noise",
    icon: AudioWaveform,
    accent: "from-pink-400/30 to-rose-500/20",
    description: "Warmer than white — softer on the ears.",
  },
  {
    id: "brown",
    name: "Brown noise",
    category: "noise",
    icon: AudioWaveform,
    accent: "from-amber-700/30 to-orange-800/20",
    description: "Deep, rumbly low end. Excellent for sleep.",
  },
  {
    id: "blue",
    name: "Blue noise",
    category: "noise",
    icon: AudioWaveform,
    accent: "from-sky-400/30 to-cyan-500/20",
    description: "Brighter than white — masks high-frequency sounds.",
  },
  {
    id: "gray",
    name: "Gray noise",
    category: "noise",
    icon: AudioWaveform,
    accent: "from-slate-500/30 to-zinc-500/20",
    description: "Equal loudness across the human hearing range.",
  },

  // ─── Ambient ──────────────────────────────────────────────────────────
  {
    id: "rain",
    name: "Gentle rain",
    category: "ambient",
    icon: CloudRain,
    accent: "from-blue-400/30 to-cyan-500/20",
    description: "Soft pattering rain on a quiet evening.",
  },
  {
    id: "wind",
    name: "Wind",
    category: "ambient",
    icon: Wind,
    accent: "from-sky-300/30 to-blue-400/20",
    description: "Slow gusts moving through open space.",
  },
  {
    id: "ocean",
    name: "Ocean waves",
    category: "ambient",
    icon: Waves,
    accent: "from-cyan-400/30 to-teal-500/20",
    description: "Long rolling waves on a calm shore.",
  },
  {
    id: "fan",
    name: "Fan",
    category: "ambient",
    icon: Fan,
    accent: "from-slate-400/30 to-blue-500/20",
    description: "Steady mechanical hum — bedroom favorite.",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    category: "ambient",
    icon: Flame,
    accent: "from-amber-500/30 to-red-500/20",
    description: "Warm crackle of wood embers.",
  },
  {
    id: "coffee",
    name: "Coffee shop",
    category: "ambient",
    icon: Coffee,
    accent: "from-amber-600/30 to-stone-500/20",
    description: "Soft murmur and clinking cups.",
  },

  // ─── Sleep ────────────────────────────────────────────────────────────
  {
    id: "heartbeat",
    name: "Heartbeat",
    category: "sleep",
    icon: HeartPulse,
    accent: "from-rose-500/30 to-pink-500/20",
    description: "Calming, slow steady pulse — like in the womb.",
  },
  {
    id: "crickets",
    name: "Night crickets",
    category: "sleep",
    icon: Sparkles,
    accent: "from-indigo-400/30 to-purple-500/20",
    description: "Chirping crickets under a clear summer sky.",
  },
  {
    id: "hum",
    name: "Soft hum",
    category: "sleep",
    icon: Hexagon,
    accent: "from-violet-400/30 to-indigo-500/20",
    description: "Low constant hum — like a refrigerator at night.",
  },
];

export const CATEGORIES: { id: SoundCategory; label: string; icon: LucideIcon }[] = [
  { id: "noise", label: "Noise colors", icon: AudioWaveform },
  { id: "ambient", label: "Ambient", icon: Music },
  { id: "sleep", label: "Sleep", icon: Volume2 },
];

export const SOUNDS_BY_ID: Record<SoundId, SoundConfig> = Object.fromEntries(
  SOUNDS.map((s) => [s.id, s]),
) as Record<SoundId, SoundConfig>;

// ─── Presets ──────────────────────────────────────────────────────────────
export interface Preset {
  id: string;
  name: string;
  description: string;
  tracks: Partial<Record<SoundId, number>>; // sound id → volume 0..1
}

export const BUILTIN_PRESETS: Preset[] = [
  {
    id: "deep-sleep",
    name: "Deep sleep",
    description: "Brown noise + soft fan for restful nights.",
    tracks: { brown: 0.55, fan: 0.35, hum: 0.2 },
  },
  {
    id: "study-mode",
    name: "Study mode",
    description: "Pink noise + light coffee shop chatter.",
    tracks: { pink: 0.5, coffee: 0.3 },
  },
  {
    id: "focus-flow",
    name: "Focus flow",
    description: "Brown noise alone for deep flow.",
    tracks: { brown: 0.65 },
  },
  {
    id: "relaxing-rain",
    name: "Relaxing rain",
    description: "Gentle rain with distant fireplace.",
    tracks: { rain: 0.6, fireplace: 0.35 },
  },
  {
    id: "ocean-meditation",
    name: "Ocean meditation",
    description: "Long ocean waves with soft hum.",
    tracks: { ocean: 0.7, hum: 0.25 },
  },
];
