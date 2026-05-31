// Pattern Background Generator engine. Eight categories of pure-CSS
// repeating backgrounds, each parameterised by two colours + size +
// angle. All recipes use `background-image: repeating-linear-gradient(…)`
// or `linear-gradient + radial-gradient` so the output is one CSS line —
// no images, no SVG.

export type PatternKind =
  | "stripes-diagonal"
  | "stripes-horizontal"
  | "stripes-vertical"
  | "checks"
  | "grid"
  | "dots"
  | "polka"
  | "diagonal-cross";

export interface PatternState {
  kind: PatternKind;
  color1: string;
  color2: string;
  size: number;
  /** Stripe / dot thickness (% of size). */
  thickness: number;
  /** Diagonal angle for stripes (deg). */
  angle: number;
}

export const DEFAULT_STATE: PatternState = {
  kind: "stripes-diagonal",
  color1: "#0f172a",
  color2: "#1e3a8a",
  size: 32,
  thickness: 50,
  angle: 45,
};

export const PRESETS: { id: string; label: string; state: Partial<PatternState> }[] = [
  { id: "diagonal", label: "Diagonal stripes", state: { kind: "stripes-diagonal", angle: 45 } },
  { id: "horizontal", label: "Horizontal", state: { kind: "stripes-horizontal" } },
  { id: "checks", label: "Checks", state: { kind: "checks" } },
  { id: "grid", label: "Grid", state: { kind: "grid", thickness: 5 } },
  { id: "dots", label: "Dots", state: { kind: "dots", thickness: 18 } },
  { id: "polka", label: "Polka dots", state: { kind: "polka", thickness: 24 } },
  { id: "cross", label: "Cross-hatch", state: { kind: "diagonal-cross" } },
];

export function toCss(s: PatternState): string {
  const c1 = s.color1;
  const c2 = s.color2;
  const sz = s.size;
  const t = (s.thickness / 100) * sz;
  switch (s.kind) {
    case "stripes-diagonal":
      return `background-color: ${c2};
background-image: repeating-linear-gradient(${s.angle}deg, ${c1}, ${c1} ${t.toFixed(1)}px, ${c2} ${t.toFixed(1)}px, ${c2} ${sz}px);`;
    case "stripes-horizontal":
      return `background-color: ${c2};
background-image: repeating-linear-gradient(0deg, ${c1}, ${c1} ${t.toFixed(1)}px, ${c2} ${t.toFixed(1)}px, ${c2} ${sz}px);`;
    case "stripes-vertical":
      return `background-color: ${c2};
background-image: repeating-linear-gradient(90deg, ${c1}, ${c1} ${t.toFixed(1)}px, ${c2} ${t.toFixed(1)}px, ${c2} ${sz}px);`;
    case "checks": {
      const half = sz / 2;
      return `background-color: ${c2};
background-image:
  linear-gradient(45deg, ${c1} 25%, transparent 25%),
  linear-gradient(-45deg, ${c1} 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, ${c1} 75%),
  linear-gradient(-45deg, transparent 75%, ${c1} 75%);
background-size: ${sz}px ${sz}px;
background-position: 0 0, 0 ${half}px, ${half}px -${half}px, -${half}px 0;`;
    }
    case "grid":
      return `background-color: ${c2};
background-image:
  linear-gradient(${c1} ${t.toFixed(1)}px, transparent ${t.toFixed(1)}px),
  linear-gradient(90deg, ${c1} ${t.toFixed(1)}px, transparent ${t.toFixed(1)}px);
background-size: ${sz}px ${sz}px;`;
    case "dots":
      return `background-color: ${c2};
background-image: radial-gradient(${c1} ${(t / 2).toFixed(1)}px, transparent ${(t / 2 + 1).toFixed(1)}px);
background-size: ${sz}px ${sz}px;`;
    case "polka": {
      const half = sz / 2;
      return `background-color: ${c2};
background-image:
  radial-gradient(${c1} ${(t / 2).toFixed(1)}px, transparent ${(t / 2 + 1).toFixed(1)}px),
  radial-gradient(${c1} ${(t / 2).toFixed(1)}px, transparent ${(t / 2 + 1).toFixed(1)}px);
background-size: ${sz}px ${sz}px;
background-position: 0 0, ${half}px ${half}px;`;
    }
    case "diagonal-cross":
      return `background-color: ${c2};
background-image:
  repeating-linear-gradient(45deg, ${c1}, ${c1} ${t.toFixed(1)}px, transparent ${t.toFixed(1)}px, transparent ${sz}px),
  repeating-linear-gradient(-45deg, ${c1}, ${c1} ${t.toFixed(1)}px, transparent ${t.toFixed(1)}px, transparent ${sz}px);`;
  }
}
