// Device introspection for the Toollyz Device Information Checker. Reads what
// the browser exposes about the underlying hardware and screen — focused on
// device traits (type, OS, screen, GPU, memory, connection) rather than the
// browser identity. Browser-only.

export type DeviceType = "Mobile phone" | "Tablet" | "Desktop / Laptop";

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  dpr: number;
  orientation: string;
}
export interface ViewportInfo { width: number; height: number; visualScale?: number }
export interface ConnectionInfo { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean; type?: string }
export interface GpuInfo { vendor?: string; renderer?: string; webglVersion?: string }

export interface DeviceSnapshot {
  type: DeviceType;
  os: string;
  platform: string;
  cpuCores?: number;
  memoryGb?: number;
  maxTouchPoints: number;
  pointer: "fine" | "coarse" | "none";
  hover: boolean;
  screen: ScreenInfo;
  viewport: ViewportInfo;
  connection: ConnectionInfo | null;
  gpu: GpuInfo | null;
  battery: boolean;
  bluetooth: boolean;
  usb: boolean;
  gamepads: boolean;
  vibration: boolean;
  ts: number;
}

function detectOs(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X ([\d_]+)/.test(ua)) return "macOS " + (ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, ".") ?? "");
  if (/Android ([\d.]+)/.test(ua)) return "Android " + ua.match(/Android ([\d.]+)/)?.[1];
  if (/iPhone OS ([\d_]+)/.test(ua)) return "iOS " + (ua.match(/iPhone OS ([\d_]+)/)?.[1].replace(/_/g, ".") ?? "");
  if (/iPad/.test(ua)) return "iPadOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectType(ua: string, maxTouchPoints: number): DeviceType {
  const isMobileUa = /Mobi|iPhone|Android.*Mobile|IEMobile|BlackBerry/i.test(ua);
  const isTabletUa = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua));
  if (isTabletUa) return "Tablet";
  if (isMobileUa) return "Mobile phone";
  if (maxTouchPoints > 0 && Math.min(window.innerWidth, window.innerHeight) < 900) return "Tablet";
  return "Desktop / Laptop";
}

function readGpu(): GpuInfo | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    let vendor: string | undefined;
    let renderer: string | undefined;
    if (dbg) {
      vendor = gl.getParameter((dbg as unknown as { UNMASKED_VENDOR_WEBGL: number }).UNMASKED_VENDOR_WEBGL) as string;
      renderer = gl.getParameter((dbg as unknown as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL) as string;
    } else {
      vendor = gl.getParameter(gl.VENDOR) as string;
      renderer = gl.getParameter(gl.RENDERER) as string;
    }
    const webglVersion = canvas.getContext("webgl2") ? "WebGL 2" : "WebGL 1";
    return { vendor, renderer, webglVersion };
  } catch { return null; }
}

function readConnection(): ConnectionInfo | null {
  const c = (navigator as unknown as { connection?: ConnectionInfo }).connection;
  if (!c || (c.effectiveType === undefined && c.downlink === undefined && c.rtt === undefined && c.type === undefined)) return null;
  return { effectiveType: c.effectiveType, downlink: c.downlink, rtt: c.rtt, saveData: c.saveData, type: c.type };
}

export function collectDevice(): DeviceSnapshot {
  const ua = navigator.userAgent;
  const nav = navigator as unknown as { hardwareConcurrency?: number; deviceMemory?: number; platform?: string; maxTouchPoints?: number };
  const maxTouchPoints = nav.maxTouchPoints ?? 0;
  const orientation = (screen.orientation?.type ?? (window.innerWidth > window.innerHeight ? "landscape" : "portrait")).replace(/-primary|-secondary/, "");
  const hoverFine = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
  const coarse = window.matchMedia("(any-pointer: coarse)").matches;
  const visualScale = (window as unknown as { visualViewport?: { scale?: number } }).visualViewport?.scale;
  return {
    type: detectType(ua, maxTouchPoints),
    os: detectOs(ua),
    platform: nav.platform ?? "—",
    cpuCores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    maxTouchPoints,
    pointer: hoverFine ? "fine" : coarse ? "coarse" : "none",
    hover: window.matchMedia("(any-hover: hover)").matches,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      dpr: window.devicePixelRatio || 1,
      orientation,
    },
    viewport: { width: window.innerWidth, height: window.innerHeight, visualScale },
    connection: readConnection(),
    gpu: readGpu(),
    battery: "getBattery" in navigator,
    bluetooth: "bluetooth" in navigator,
    usb: "usb" in navigator,
    gamepads: "getGamepads" in navigator,
    vibration: "vibrate" in navigator,
    ts: Date.now(),
  };
}

export function snapshotJson(s: DeviceSnapshot): string {
  return JSON.stringify(s, null, 2);
}
