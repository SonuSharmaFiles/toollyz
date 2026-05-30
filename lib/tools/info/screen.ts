// Screen introspection for the Toollyz Screen Resolution Checker. Pure
// browser-side reads — screen geometry, viewport, DPR, color depth and
// orientation — plus a quick refresh-rate estimate by counting frames over
// one second via requestAnimationFrame.

export interface ScreenSnapshot {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  dpr: number;
  orientation: string;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  visualScale?: number;
  aspect: string;
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

function aspectRatio(w: number, h: number): string {
  if (!w || !h) return "—";
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

export function collectScreen(): ScreenSnapshot {
  const orientation = (screen.orientation?.type ?? (window.innerWidth > window.innerHeight ? "landscape" : "portrait")).replace(/-primary|-secondary/, "");
  const vv = (window as unknown as { visualViewport?: { scale?: number } }).visualViewport;
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    dpr: window.devicePixelRatio || 1,
    orientation,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    visualScale: vv?.scale,
    aspect: aspectRatio(window.screen.width, window.screen.height),
  };
}

/** Count rAF callbacks for ~1 second and return frames/second. */
export function estimateRefreshRate(sampleMs = 1000): Promise<number> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "function") { resolve(0); return; }
    let frames = 0;
    const start = performance.now();
    const tick = (now: number) => {
      frames++;
      if (now - start >= sampleMs) {
        const seconds = (now - start) / 1000;
        resolve(Math.round(frames / seconds));
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
}
