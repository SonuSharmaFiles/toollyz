// CSS Animation Generator engine. A user picks an animation preset (or
// designs one from scratch), tunes timing, and gets back a complete
// `@keyframes <name> { … }` block plus the `animation:` shorthand for an
// element. The supported "tracks" cover the properties users actually
// animate day-to-day: translate (x, y), scale, rotate, opacity and
// background-color. Each keyframe is a snapshot of all tracks at a given
// percentage, so the output is one block per preset, no editor required.

export type Timing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier(.34,1.56,.64,1)"
  | "cubic-bezier(.5,0,.5,1)";

export type Direction = "normal" | "reverse" | "alternate" | "alternate-reverse";

export interface KeyframeStop {
  pct: number;
  tx: number;
  ty: number;
  scale: number;
  rotate: number;
  opacity: number;
}

export interface AnimationState {
  name: string;
  duration: number;
  delay: number;
  iteration: number; // -1 = infinite
  timing: Timing;
  direction: Direction;
  stops: KeyframeStop[];
}

export interface AnimationPreset {
  id: string;
  label: string;
  state: AnimationState;
}

function s(pct: number, patch: Partial<KeyframeStop> = {}): KeyframeStop {
  return { pct, tx: 0, ty: 0, scale: 1, rotate: 0, opacity: 1, ...patch };
}

export const PRESETS: AnimationPreset[] = [
  {
    id: "fade-in",
    label: "Fade in",
    state: {
      name: "fadeIn",
      duration: 800,
      delay: 0,
      iteration: 1,
      timing: "ease-out",
      direction: "normal",
      stops: [s(0, { opacity: 0 }), s(100, { opacity: 1 })],
    },
  },
  {
    id: "slide-up",
    label: "Slide up",
    state: {
      name: "slideUp",
      duration: 600,
      delay: 0,
      iteration: 1,
      timing: "cubic-bezier(.5,0,.5,1)",
      direction: "normal",
      stops: [s(0, { ty: 24, opacity: 0 }), s(100, { ty: 0, opacity: 1 })],
    },
  },
  {
    id: "pop",
    label: "Pop",
    state: {
      name: "pop",
      duration: 500,
      delay: 0,
      iteration: 1,
      timing: "cubic-bezier(.34,1.56,.64,1)",
      direction: "normal",
      stops: [s(0, { scale: 0.5, opacity: 0 }), s(100, { scale: 1, opacity: 1 })],
    },
  },
  {
    id: "shake",
    label: "Shake",
    state: {
      name: "shake",
      duration: 600,
      delay: 0,
      iteration: 1,
      timing: "linear",
      direction: "normal",
      stops: [
        s(0),
        s(20, { tx: -8 }),
        s(40, { tx: 8 }),
        s(60, { tx: -6 }),
        s(80, { tx: 6 }),
        s(100),
      ],
    },
  },
  {
    id: "bounce",
    label: "Bounce",
    state: {
      name: "bounce",
      duration: 1000,
      delay: 0,
      iteration: -1,
      timing: "ease-in-out",
      direction: "normal",
      stops: [s(0, { ty: 0 }), s(50, { ty: -16 }), s(100, { ty: 0 })],
    },
  },
  {
    id: "pulse",
    label: "Pulse",
    state: {
      name: "pulse",
      duration: 1500,
      delay: 0,
      iteration: -1,
      timing: "ease-in-out",
      direction: "normal",
      stops: [s(0, { scale: 1 }), s(50, { scale: 1.08 }), s(100, { scale: 1 })],
    },
  },
  {
    id: "spin",
    label: "Spin",
    state: {
      name: "spin",
      duration: 1200,
      delay: 0,
      iteration: -1,
      timing: "linear",
      direction: "normal",
      stops: [s(0, { rotate: 0 }), s(100, { rotate: 360 })],
    },
  },
  {
    id: "wobble",
    label: "Wobble",
    state: {
      name: "wobble",
      duration: 800,
      delay: 0,
      iteration: 1,
      timing: "ease-in-out",
      direction: "normal",
      stops: [
        s(0),
        s(15, { rotate: -8, tx: -8 }),
        s(35, { rotate: 6, tx: 8 }),
        s(55, { rotate: -4, tx: -4 }),
        s(75, { rotate: 2, tx: 2 }),
        s(100),
      ],
    },
  },
];

export const DEFAULT_STATE: AnimationState = PRESETS[2].state;

function stopToTransform(st: KeyframeStop): string {
  const parts: string[] = [];
  if (st.tx !== 0 || st.ty !== 0) parts.push(`translate(${st.tx}px, ${st.ty}px)`);
  if (st.scale !== 1) parts.push(`scale(${st.scale.toFixed(2)})`);
  if (st.rotate !== 0) parts.push(`rotate(${st.rotate}deg)`);
  return parts.join(" ") || "none";
}

export function buildCss(state: AnimationState): string {
  const stops = [...state.stops].sort((a, b) => a.pct - b.pct);
  const keyframes = stops
    .map((st) => `  ${st.pct}% { transform: ${stopToTransform(st)}; opacity: ${st.opacity.toFixed(2)}; }`)
    .join("\n");
  const iter = state.iteration === -1 ? "infinite" : String(state.iteration);
  return `@keyframes ${state.name} {
${keyframes}
}

.animated {
  animation: ${state.name} ${state.duration}ms ${state.timing} ${state.delay}ms ${iter} ${state.direction} both;
}`;
}
