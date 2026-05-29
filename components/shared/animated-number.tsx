"use client";

import * as React from "react";

/**
 * Eased count-up number used across tool dashboards. Respects reduced motion
 * and pauses when the tab is hidden. Supports decimals and a unit suffix.
 */
export function AnimatedNumber({
  value,
  reduceMotion,
  decimals = 0,
  suffix = "",
  duration = 400,
}: {
  value: number;
  reduceMotion?: boolean;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);

  React.useEffect(() => {
    const to = value;
    const from = fromRef.current;
    if (from === to) { setDisplay(to); return; }
    if (reduceMotion || typeof document === "undefined" || document.visibilityState !== "visible") {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (nowT: number) => {
      const p = Math.min(1, (nowT - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    const fallback = window.setTimeout(() => { setDisplay(to); fromRef.current = to; }, duration + 120);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(fallback); };
  }, [value, reduceMotion, duration]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();
  return <>{formatted}{suffix}</>;
}
