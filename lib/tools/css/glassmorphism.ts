// Glassmorphism Generator engine. Glassmorphism is a thin tint + heavy
// `backdrop-filter: blur()` + low-alpha background + a 1-px white border.
// The recipe depends on what's behind the glass — colourful gradients show
// off the blur, plain backgrounds make it disappear. We offer 6 background
// presets and a state describing the glass card itself.

export interface GlassState {
  /** rgba background of the card. */
  background: string;
  /** Blur in px (10–30 is the sweet spot). */
  blur: number;
  /** Saturation multiplier (1.0 = unchanged, 1.6 ≈ vivid). */
  saturation: number;
  /** Border radius in px. */
  radius: number;
  /** Inner border color (rgba). */
  border: string;
  /** Border width in px. */
  borderWidth: number;
  /** Optional drop shadow strength (0–1). */
  shadow: number;
}

export interface BackgroundPreset {
  id: string;
  label: string;
  /** CSS background — gradients usually. */
  background: string;
}

export const BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "sunset",
    label: "Sunset",
    background:
      "radial-gradient(circle at 20% 20%, #fb923c 0%, transparent 50%), radial-gradient(circle at 80% 80%, #db2777 0%, transparent 50%), linear-gradient(135deg, #7c3aed, #db2777)",
  },
  {
    id: "ocean",
    label: "Ocean",
    background:
      "radial-gradient(circle at 30% 30%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 70% 70%, #14b8a6 0%, transparent 50%), linear-gradient(135deg, #1e3a8a, #0c4a6e)",
  },
  {
    id: "forest",
    label: "Forest",
    background:
      "radial-gradient(circle at 25% 25%, #22c55e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f59e0b 0%, transparent 50%), linear-gradient(135deg, #064e3b, #422006)",
  },
  {
    id: "candy",
    label: "Candy",
    background:
      "radial-gradient(circle at 20% 30%, #f0abfc 0%, transparent 55%), radial-gradient(circle at 80% 70%, #fde68a 0%, transparent 55%), linear-gradient(135deg, #a78bfa, #ec4899)",
  },
  {
    id: "midnight",
    label: "Midnight",
    background:
      "radial-gradient(circle at 50% 0%, #6366f1 0%, transparent 60%), radial-gradient(circle at 50% 100%, #ec4899 0%, transparent 60%), linear-gradient(135deg, #0f172a, #1e1b4b)",
  },
  {
    id: "frost",
    label: "Frost",
    background:
      "radial-gradient(circle at 30% 20%, #bae6fd 0%, transparent 50%), radial-gradient(circle at 70% 80%, #c7d2fe 0%, transparent 50%), linear-gradient(135deg, #f8fafc, #e0e7ff)",
  },
];

export const DEFAULT_STATE: GlassState = {
  background: "rgba(255, 255, 255, 0.18)",
  blur: 18,
  saturation: 1.6,
  radius: 24,
  border: "rgba(255, 255, 255, 0.32)",
  borderWidth: 1,
  shadow: 0.35,
};

export function toCss(state: GlassState): string {
  return [
    `background: ${state.background};`,
    `backdrop-filter: blur(${state.blur}px) saturate(${state.saturation});`,
    `-webkit-backdrop-filter: blur(${state.blur}px) saturate(${state.saturation});`,
    `border: ${state.borderWidth}px solid ${state.border};`,
    `border-radius: ${state.radius}px;`,
    `box-shadow: 0 8px 32px rgba(0, 0, 0, ${state.shadow.toFixed(2)});`,
  ].join("\n");
}
