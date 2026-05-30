// Browser introspection for the Toollyz Browser Information Checker. Reads
// only what the browser itself exposes — userAgent, locale, screen,
// permissions, supported web APIs — so nothing leaves the page. Browser-only
// helpers (guarded for SSR).

export interface BrowserIdentity {
  name: string;
  version: string;
  engine: string;
  os: string;
}

export interface BrowserSnapshot extends BrowserIdentity {
  userAgent: string;
  uaPlatform?: string;
  uaMobile?: boolean;
  uaBrands?: string;
  languages: string;
  primaryLanguage: string;
  timezone: string;
  cookiesEnabled: boolean;
  online: boolean;
  dnt: string;
  colorScheme: "dark" | "light";
  reducedMotion: boolean;
  contrast: string;
  innerSize: string;
  outerSize: string;
}

export interface Feature { group: string; name: string; supported: boolean }
export interface PermissionRow { name: string; state: string }

export function detectBrowser(ua: string): BrowserIdentity {
  let os = "Unknown";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.1/.test(ua)) os = "Windows 7";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X ([\d_]+)/.test(ua)) os = "macOS " + (ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, ".") ?? "");
  else if (/Android ([\d.]+)/.test(ua)) os = "Android " + ua.match(/Android ([\d.]+)/)?.[1];
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = "iOS " + (ua.match(/iPhone OS ([\d_]+)/)?.[1].replace(/_/g, ".") ?? "");
  else if (/iPad/.test(ua)) os = "iPadOS";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let name = "Unknown";
  let version = "";
  let engine = "Unknown";
  if (/Edg\/([\d.]+)/.test(ua)) { name = "Microsoft Edge"; version = ua.match(/Edg\/([\d.]+)/)?.[1] ?? ""; engine = "Blink"; }
  else if (/OPR\/([\d.]+)/.test(ua)) { name = "Opera"; version = ua.match(/OPR\/([\d.]+)/)?.[1] ?? ""; engine = "Blink"; }
  else if (/Vivaldi\/([\d.]+)/.test(ua)) { name = "Vivaldi"; version = ua.match(/Vivaldi\/([\d.]+)/)?.[1] ?? ""; engine = "Blink"; }
  else if (/Firefox\/([\d.]+)/.test(ua)) { name = "Firefox"; version = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? ""; engine = "Gecko"; }
  else if (/Chrome\/([\d.]+)/.test(ua) && !/Edg|OPR|Vivaldi/.test(ua)) { name = "Chrome"; version = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? ""; engine = "Blink"; }
  else if (/Safari\/([\d.]+)/.test(ua) && /Version\/([\d.]+)/.test(ua)) { name = "Safari"; version = ua.match(/Version\/([\d.]+)/)?.[1] ?? ""; engine = "WebKit"; }
  return { name, version, engine, os };
}

export function collectBrowser(): BrowserSnapshot {
  const ua = navigator.userAgent;
  const id = detectBrowser(ua);
  const uad = (navigator as unknown as { userAgentData?: { brands?: { brand: string; version: string }[]; mobile?: boolean; platform?: string } }).userAgentData;
  return {
    ...id,
    userAgent: ua,
    uaPlatform: uad?.platform,
    uaMobile: uad?.mobile,
    uaBrands: uad?.brands?.map((b) => `${b.brand} ${b.version}`).join(", "),
    languages: navigator.languages?.join(", ") || navigator.language || "—",
    primaryLanguage: navigator.language || "—",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "—",
    cookiesEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
    dnt: navigator.doNotTrack === "1" ? "Enabled" : navigator.doNotTrack === "0" ? "Disabled" : "Not set",
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    contrast: window.matchMedia("(prefers-contrast: more)").matches ? "More" : window.matchMedia("(prefers-contrast: less)").matches ? "Less" : "No preference",
    innerSize: `${window.innerWidth} × ${window.innerHeight}`,
    outerSize: `${window.outerWidth} × ${window.outerHeight}`,
  };
}

export function featureMatrix(): Feature[] {
  if (typeof window === "undefined") return [];
  const has = (path: string): boolean => {
    try {
      const parts = path.split(".");
      let cur: unknown = window;
      for (const p of parts) cur = (cur as Record<string, unknown>)?.[p];
      return cur !== undefined && cur !== null;
    } catch { return false; }
  };
  const tryWebGL = (version: 1 | 2): boolean => { try { return !!document.createElement("canvas").getContext(version === 2 ? "webgl2" : "webgl"); } catch { return false; } };
  const f: Feature[] = [];
  const add = (group: string, name: string, supported: boolean) => f.push({ group, name, supported });

  add("Storage", "localStorage", has("localStorage"));
  add("Storage", "sessionStorage", has("sessionStorage"));
  add("Storage", "IndexedDB", has("indexedDB"));
  add("Storage", "Cache API", has("caches"));

  add("Workers", "Service Worker", has("navigator.serviceWorker"));
  add("Workers", "Web Workers", has("Worker"));
  add("Workers", "SharedArrayBuffer", has("SharedArrayBuffer"));

  add("Media", "WebRTC", has("RTCPeerConnection"));
  add("Media", "MediaDevices", has("navigator.mediaDevices"));
  add("Media", "Web Audio", has("AudioContext") || has("webkitAudioContext"));
  add("Media", "Media Recorder", has("MediaRecorder"));
  add("Media", "WebGL", tryWebGL(1));
  add("Media", "WebGL 2", tryWebGL(2));
  add("Media", "WebGPU", has("navigator.gpu"));

  add("Network", "Fetch", has("fetch"));
  add("Network", "WebSocket", has("WebSocket"));
  add("Network", "EventSource (SSE)", has("EventSource"));
  add("Network", "WebTransport", has("WebTransport"));

  add("Crypto", "Web Crypto", has("crypto.subtle"));
  add("Crypto", "WebAssembly", has("WebAssembly"));

  add("Device", "Geolocation", has("navigator.geolocation"));
  add("Device", "Notifications", has("Notification"));
  add("Device", "Vibration", has("navigator.vibrate"));
  add("Device", "Battery API", has("navigator.getBattery"));
  add("Device", "Bluetooth", has("navigator.bluetooth"));
  add("Device", "USB", has("navigator.usb"));
  add("Device", "Gamepad", has("navigator.getGamepads"));
  add("Device", "Generic Sensors", has("Accelerometer"));

  add("UI", "Clipboard API", has("navigator.clipboard"));
  add("UI", "Web Share", has("navigator.share"));
  add("UI", "File System Access", has("showOpenFilePicker"));
  add("UI", "Payment Request", has("PaymentRequest"));
  add("UI", "View Transitions", has("document.startViewTransition"));

  return f;
}

const PERMISSION_NAMES = ["geolocation", "notifications", "camera", "microphone", "clipboard-read", "clipboard-write", "persistent-storage"] as const;

export async function queryPermissions(): Promise<PermissionRow[]> {
  if (typeof navigator === "undefined" || !navigator.permissions) return [];
  const out: PermissionRow[] = [];
  for (const name of PERMISSION_NAMES) {
    try {
      const p = await navigator.permissions.query({ name } as unknown as PermissionDescriptor);
      out.push({ name, state: p.state });
    } catch {
      out.push({ name, state: "unsupported" });
    }
  }
  return out;
}

export function snapshotJson(snapshot: BrowserSnapshot, features: Feature[], permissions: PermissionRow[]): string {
  return JSON.stringify({ identity: { name: snapshot.name, version: snapshot.version, engine: snapshot.engine, os: snapshot.os }, snapshot, features, permissions }, null, 2);
}
