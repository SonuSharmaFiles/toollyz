// Gradient Mesh Generator engine. A "mesh gradient" in CSS = a stack of
// `radial-gradient(... at x% y%)` layers, each a soft colour blob with a
// transparent outer radius. Stacking ~3-6 produces the iOS / Stripe /
// Linear marketing-page look. Output is one `background` line.

export interface MeshStop {
  id: string;
  x: number; // 0-100 %
  y: number; // 0-100 %
  /** Soft radius — 30-80% of the smaller container side reads well. */
  size: number;
  color: string;
}

export interface MeshState {
  /** Underlying base colour beneath the radial blobs. */
  base: string;
  stops: MeshStop[];
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function newStop(partial: Partial<MeshStop> = {}): MeshStop {
  return {
    id: uid(),
    x: 50,
    y: 50,
    size: 50,
    color: "#a855f7",
    ...partial,
  };
}

export const PRESETS: { id: string; label: string; state: MeshState }[] = [
  {
    id: "sunset",
    label: "Sunset",
    state: {
      base: "#1e1b4b",
      stops: [
        { id: uid(), x: 20, y: 25, size: 60, color: "#fb923c" },
        { id: uid(), x: 80, y: 75, size: 55, color: "#db2777" },
        { id: uid(), x: 50, y: 50, size: 45, color: "#7c3aed" },
      ],
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    state: {
      base: "#0c4a6e",
      stops: [
        { id: uid(), x: 20, y: 30, size: 50, color: "#06b6d4" },
        { id: uid(), x: 80, y: 80, size: 55, color: "#14b8a6" },
        { id: uid(), x: 60, y: 20, size: 45, color: "#0ea5e9" },
        { id: uid(), x: 30, y: 80, size: 40, color: "#22d3ee" },
      ],
    },
  },
  {
    id: "forest",
    label: "Forest",
    state: {
      base: "#064e3b",
      stops: [
        { id: uid(), x: 30, y: 30, size: 55, color: "#22c55e" },
        { id: uid(), x: 75, y: 70, size: 50, color: "#f59e0b" },
        { id: uid(), x: 50, y: 50, size: 40, color: "#84cc16" },
      ],
    },
  },
  {
    id: "candy",
    label: "Candy",
    state: {
      base: "#fef3c7",
      stops: [
        { id: uid(), x: 25, y: 30, size: 55, color: "#f0abfc" },
        { id: uid(), x: 75, y: 70, size: 55, color: "#fbcfe8" },
        { id: uid(), x: 50, y: 50, size: 40, color: "#fcd34d" },
      ],
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    state: {
      base: "#0f172a",
      stops: [
        { id: uid(), x: 25, y: 25, size: 55, color: "#6366f1" },
        { id: uid(), x: 75, y: 75, size: 55, color: "#ec4899" },
        { id: uid(), x: 50, y: 50, size: 45, color: "#a855f7" },
      ],
    },
  },
  {
    id: "stripe",
    label: "Stripe",
    state: {
      base: "#0f172a",
      stops: [
        { id: uid(), x: 30, y: 30, size: 55, color: "#0ea5e9" },
        { id: uid(), x: 70, y: 70, size: 55, color: "#a855f7" },
        { id: uid(), x: 50, y: 50, size: 45, color: "#22d3ee" },
      ],
    },
  },
];

export function toCss(state: MeshState): string {
  const layers = state.stops
    .map(
      (s) => `radial-gradient(circle at ${s.x}% ${s.y}%, ${s.color} 0%, transparent ${s.size}%)`,
    )
    .join(",\n  ");
  return `background-color: ${state.base};
background-image:
  ${layers};`;
}

export const DEFAULT_STATE: MeshState = PRESETS[0].state;
