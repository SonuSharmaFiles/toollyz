"use client";

import * as React from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import {
  Check,
  Coffee,
  Copy,
  Download,
  Eye,
  EyeOff,
  Heart,
  Home,
  Lock,
  Printer,
  Repeat,
  Sparkles,
  Star,
  Trash2,
  Wifi,
  WifiOff,
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
import {
  buildShareText,
  buildWifiString,
  type WifiNetwork,
  type WifiSecurity,
} from "@/lib/tools/wifi-qr/format";

type CardTemplate = "minimal" | "cafe" | "office" | "home";

const TEMPLATES: { id: CardTemplate; label: string; icon: React.ElementType }[] = [
  { id: "minimal", label: "Minimal", icon: Sparkles },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "office", label: "Office", icon: Lock },
  { id: "home", label: "Home", icon: Home },
];

const COLOR_PRESETS = [
  { label: "Classic", fg: "#0F172A", bg: "#FFFFFF" },
  { label: "Indigo", fg: "#4338CA", bg: "#EEF2FF" },
  { label: "Forest", fg: "#065F46", bg: "#ECFDF5" },
  { label: "Sunset", fg: "#9A3412", bg: "#FFF7ED" },
  { label: "Mono dark", fg: "#FFFFFF", bg: "#0F172A" },
];

const HISTORY_KEY = "toollyz:wifi-qr-history";
const FAVORITES_KEY = "toollyz:wifi-qr-favorites";

interface StoredNetwork extends WifiNetwork {
  id: string;
  createdAt: number;
}

export default function WifiQrCodeGenerator() {
  // Form state
  const [ssid, setSsid] = React.useState("Toollyz Guest");
  const [password, setPassword] = React.useState("welcome2025");
  const [security, setSecurity] = React.useState<WifiSecurity>("WPA");
  const [hidden, setHidden] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // QR options
  const [size, setSize] = React.useState(320);
  const [margin, setMargin] = React.useState(2);
  const [fg, setFg] = React.useState("#0F172A");
  const [bg, setBg] = React.useState("#FFFFFF");
  const [errorLevel, setErrorLevel] = React.useState<"L" | "M" | "Q" | "H">("M");

  // Template + persistence
  const [template, setTemplate] = React.useState<CardTemplate>("minimal");
  const [history, setHistory] = React.useState<StoredNetwork[]>([]);
  const [favorites, setFavorites] = React.useState<StoredNetwork[]>([]);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cardCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [svgString, setSvgString] = React.useState<string>("");

  const network: WifiNetwork = { ssid, password, security, hidden };
  const wifiString = buildWifiString(network);

  // Load history + favorites
  React.useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {
      /* noop */
    }
  }, []);

  // Live QR rendering
  React.useEffect(() => {
    if (!canvasRef.current || !wifiString) return;
    const opts = {
      errorCorrectionLevel: errorLevel,
      margin,
      width: size,
      color: { dark: fg, light: bg },
    } as const;

    let cancelled = false;
    Promise.all([
      QRCode.toCanvas(canvasRef.current, wifiString, opts),
      QRCode.toDataURL(wifiString, { ...opts, width: Math.max(size * 2, 1024) }),
      QRCode.toString(wifiString, { ...opts, type: "svg" }),
    ])
      .then(([, png, svg]) => {
        if (cancelled) return;
        setDownloadUrl(png);
        setSvgString(svg);
      })
      .catch(() => {
        if (cancelled) return;
        setDownloadUrl(null);
        setSvgString("");
      });

    // Card preview
    if (cardCanvasRef.current) {
      QRCode.toCanvas(cardCanvasRef.current, wifiString, {
        errorCorrectionLevel: errorLevel,
        margin: 1,
        width: 220,
        color: { dark: fg, light: bg },
      }).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [wifiString, size, margin, fg, bg, errorLevel]);

  function saveToHistory() {
    if (!ssid.trim()) return;
    const entry: StoredNetwork = {
      id: crypto.randomUUID(),
      ssid,
      password,
      security,
      hidden,
      createdAt: Date.now(),
    };
    setHistory((prev) => {
      const filtered = prev.filter(
        (h) => !(h.ssid === ssid && h.security === security),
      );
      const next = [entry, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }

  function toggleFavorite(entry: StoredNetwork) {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.ssid === entry.ssid && f.security === entry.security,
      );
      const next = exists
        ? prev.filter((f) => !(f.ssid === entry.ssid && f.security === entry.security))
        : [entry, ...prev].slice(0, 8);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }

  function loadEntry(entry: StoredNetwork) {
    setSsid(entry.ssid);
    setPassword(entry.password);
    setSecurity(entry.security);
    setHidden(entry.hidden);
    toast.success(`Loaded ${entry.ssid}`);
  }

  function deleteHistoryEntry(id: string) {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* noop */
    }
    toast.info("History cleared");
  }

  function applyPreset(p: (typeof COLOR_PRESETS)[number]) {
    setFg(p.fg);
    setBg(p.bg);
  }

  function downloadPng() {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `toollyz-wifi-${ssid || "qr"}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    saveToHistory();
    toast.success("PNG downloaded");
  }

  function downloadSvg() {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-wifi-${ssid || "qr"}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    saveToHistory();
    toast.success("SVG downloaded");
  }

  function downloadJpg() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toollyz-wifi-${ssid || "qr"}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      saveToHistory();
      toast.success("JPG downloaded");
    }, "image/jpeg", 0.95);
  }

  async function copyWifiText() {
    try {
      await navigator.clipboard.writeText(buildShareText(network));
      toast.success("WiFi details copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  async function copyQrImage() {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Could not copy image");
          return;
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const item = new (window as any).ClipboardItem({
            "image/png": blob,
          });
          await navigator.clipboard.write([item]);
          toast.success("QR image copied to clipboard");
        } catch {
          toast.error("Image clipboard not supported");
        }
      }, "image/png");
    } catch {
      toast.error("Could not copy image");
    }
  }

  function printCard() {
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) {
      toast.error("Pop-up blocked — allow pop-ups to print");
      return;
    }
    const qrSvg = svgString || "";
    const safe = (s: string) =>
      s.replace(/[<>&"]/g, (c) =>
        ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c,
      );
    const securityLabel =
      security === "nopass" ? "Open network" : security;
    printWindow.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>WiFi — ${safe(ssid)}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif;
       padding:40px;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f1f5f9;color:#0f172a}
  .card{background:#fff;border-radius:24px;padding:40px;max-width:420px;width:100%;
        box-shadow:0 10px 40px rgba(15,23,42,.08);text-align:center}
  h1{font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:#64748b;margin:0 0 4px}
  h2{font-size:32px;margin:0 0 8px;font-weight:700;letter-spacing:-.02em}
  .qr{margin:24px auto;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;display:inline-block}
  .qr svg{display:block;width:220px;height:220px}
  .meta{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin-top:16px;font-size:13px;color:#475569}
  .meta strong{color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  .footer{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}
  @media print { body{background:#fff} .card{box-shadow:none;border:1px solid #e2e8f0} }
</style></head><body>
<div class="card">
  <h1>WiFi access</h1>
  <h2>${safe(ssid)}</h2>
  <div class="qr">${qrSvg}</div>
  <div class="meta">
    ${security !== "nopass" ? `<div>Password<br/><strong>${safe(password)}</strong></div>` : ""}
    <div>Security<br/><strong>${safe(securityLabel)}</strong></div>
  </div>
  <div class="footer">Scan with your phone camera to connect · Generated by toollyz.com</div>
</div>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300));</script>
</body></html>`);
    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* ─── Form ───────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wifi-ssid">Network name (SSID)</Label>
            <div className="relative">
              <Wifi className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="wifi-ssid"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="MyHomeWiFi"
                className="h-11 pl-10 rounded-xl"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Security</Label>
              <Select
                value={security}
                onValueChange={(v) => v && setSecurity(v as WifiSecurity)}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
                  <SelectItem value="WEP">WEP (legacy)</SelectItem>
                  <SelectItem value="nopass">No password (open)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wifi-password" className={security === "nopass" ? "text-muted-foreground" : ""}>
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="wifi-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={security === "nopass" ? "Not required" : "Your WiFi password"}
                  disabled={security === "nopass"}
                  className="h-11 pl-10 pr-10 rounded-xl font-mono"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={security === "nopass"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToggleChip
              active={hidden}
              onClick={() => setHidden((v) => !v)}
              label="Hidden network"
              icon={<WifiOff className="size-3" />}
            />
          </div>

          <hr className="border-border/60" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wifi-size">Size — {size}px</Label>
              <Slider
                id="wifi-size"
                value={[size]}
                onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
                min={160}
                max={640}
                step={16}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi-margin">Margin — {margin}</Label>
              <Slider
                id="wifi-margin"
                value={[margin]}
                onValueChange={(v) => setMargin(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={8}
                step={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Error correction</Label>
            <Select
              value={errorLevel}
              onValueChange={(v) => v && setErrorLevel(v as "L" | "M" | "Q" | "H")}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low — ~7% recovery</SelectItem>
                <SelectItem value="M">Medium — ~15% recovery</SelectItem>
                <SelectItem value="Q">Quartile — ~25% recovery</SelectItem>
                <SelectItem value="H">High — ~30% recovery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField id="wifi-fg" label="Foreground" value={fg} onChange={setFg} />
            <ColorField id="wifi-bg" label="Background" value={bg} onChange={setBg} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Color presets</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40"
                >
                  <span className="flex">
                    <span
                      className="size-3 rounded-full border border-border"
                      style={{ background: p.fg }}
                    />
                    <span
                      className="-ml-1 size-3 rounded-full border border-border"
                      style={{ background: p.bg }}
                    />
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border/60" />

          <div className="space-y-2">
            <Label>Printable card template</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    aria-pressed={template === t.id}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                      template === t.id
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Preview + actions ───────────────────────────────── */}
        <div className="space-y-4">
          <motion.div
            key={template}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <WifiCardPreview
              template={template}
              ssid={ssid}
              password={password}
              security={security}
              fg={fg}
              bg={bg}
              cardCanvasRef={cardCanvasRef}
            />
          </motion.div>

          {/* Hidden canvas for downloads at requested resolution */}
          <div className="sr-only" aria-hidden="true">
            <canvas ref={canvasRef} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={downloadPng} disabled={!downloadUrl}>
              <Download className="size-3.5" />
              PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSvg}
              disabled={!svgString}
            >
              <Download className="size-3.5" />
              SVG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadJpg}
              disabled={!downloadUrl}
            >
              <Download className="size-3.5" />
              JPG
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={copyWifiText}>
              <Copy className="size-3.5" />
              Copy details
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={copyQrImage}>
              <Copy className="size-3.5" />
              Copy image
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={printCard}>
              <Printer className="size-3.5" />
              Print card
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={saveToHistory}>
              <Repeat className="size-3.5" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Recent + favorites ─────────────────────────────────────── */}
      {(history.length > 0 || favorites.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.length > 0 && (
            <NetworkListPanel
              title="Favorites"
              accent="rose"
              icon={<Heart className="size-4 fill-rose-500 text-rose-500" />}
              entries={favorites}
              onLoad={loadEntry}
              onToggleFavorite={(e) => toggleFavorite(e)}
              isFavorite={() => true}
              onDelete={undefined}
            />
          )}
          {history.length > 0 && (
            <NetworkListPanel
              title="Recent networks"
              accent="primary"
              icon={<Wifi className="size-4 text-primary" />}
              entries={history}
              onLoad={loadEntry}
              onToggleFavorite={(e) => toggleFavorite(e)}
              isFavorite={(e) =>
                favorites.some((f) => f.ssid === e.ssid && f.security === e.security)
              }
              onDelete={deleteHistoryEntry}
              onClearAll={clearHistory}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── WiFi card preview ────────────────────────────────────────────────────

interface WifiCardPreviewProps {
  template: CardTemplate;
  ssid: string;
  password: string;
  security: WifiSecurity;
  fg: string;
  bg: string;
  cardCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function WifiCardPreview({
  template,
  ssid,
  password,
  security,
  fg,
  bg,
  cardCanvasRef,
}: WifiCardPreviewProps) {
  const securityLabel = security === "nopass" ? "Open" : security;

  // Template-specific wrappers
  if (template === "cafe") {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-amber-950 shadow-sm dark:border-amber-800/40 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-50">
        <div className="absolute -top-12 -right-8 size-40 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative space-y-4 text-center">
          <Coffee className="mx-auto size-6 text-amber-700 dark:text-amber-300" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Café WiFi
          </p>
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            {ssid || "Network name"}
          </h3>
          <div className="mx-auto inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-sm dark:bg-amber-950/40">
            <canvas
              ref={cardCanvasRef}
              className="size-[220px]"
              style={{ background: bg }}
            />
          </div>
          {security !== "nopass" && (
            <p className="text-sm">
              Password:{" "}
              <span className="font-mono font-semibold">{password || "—"}</span>
            </p>
          )}
          <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
            Open your camera and point it at the code to connect.
          </p>
        </div>
      </article>
    );
  }

  if (template === "office") {
    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Guest WiFi
            </p>
            <h3 className="mt-1 font-heading text-xl font-semibold tracking-tight">
              {ssid || "Network name"}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
          <div className="flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700">
            <canvas
              ref={cardCanvasRef}
              className="size-[200px]"
              style={{ background: bg }}
            />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 text-sm">
            <Detail label="Network" value={ssid || "—"} />
            {security !== "nopass" && (
              <Detail label="Password" value={password || "—"} mono />
            )}
            <Detail label="Security" value={securityLabel} />
            <p className="mt-2 text-[11px] text-slate-500">
              Scan the QR with your camera or phone settings.
            </p>
          </div>
        </div>
      </article>
    );
  }

  if (template === "home") {
    return (
      <article className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 text-indigo-950 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/30 dark:text-indigo-50">
        <div className="space-y-4 text-center">
          <Home className="mx-auto size-6 text-indigo-600 dark:text-indigo-300" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">
            Welcome home
          </p>
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            {ssid || "Network name"}
          </h3>
          <div className="mx-auto inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
            <canvas
              ref={cardCanvasRef}
              className="size-[220px]"
              style={{ background: bg }}
            />
          </div>
          {security !== "nopass" && (
            <p className="text-sm">
              Password:{" "}
              <span className="font-mono font-semibold">{password || "—"}</span>
            </p>
          )}
          <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
            Hold your camera over the code to join the WiFi.
          </p>
        </div>
      </article>
    );
  }

  // minimal (default)
  return (
    <article className="rounded-3xl border border-border/70 bg-card p-6 text-foreground shadow-sm">
      <div className="space-y-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          WiFi access
        </p>
        <h3 className="font-heading text-2xl font-semibold tracking-tight">
          {ssid || "Network name"}
        </h3>
        <div
          className="mx-auto inline-flex items-center justify-center rounded-2xl border border-border/60 p-3 shadow-sm"
          style={{ background: bg }}
        >
          <canvas
            ref={cardCanvasRef}
            className="size-[220px]"
            style={{ background: bg }}
          />
        </div>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          {security !== "nopass" && (
            <span>
              Password:{" "}
              <span className="font-mono font-semibold text-foreground">
                {password || "—"}
              </span>
            </span>
          )}
          <span>
            Security:{" "}
            <span className="font-medium text-foreground">{securityLabel}</span>
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Scan with your phone's camera to connect.
        </p>
      </div>
    </article>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={cn("text-sm font-medium", mono && "font-mono")}>{value}</div>
    </div>
  );
}

// ─── Color field ──────────────────────────────────────────────────────────

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2 py-1.5">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 cursor-pointer rounded-md border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          aria-label={`${label} color`}
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-mono outline-none"
          aria-label={`${label} hex`}
          maxLength={9}
        />
      </div>
    </div>
  );
}

// ─── Toggle chip ──────────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      {icon ?? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-1.5 rounded-full transition-colors",
            active ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
      )}
      {label}
    </button>
  );
}

// ─── Network list panel ───────────────────────────────────────────────────

interface NetworkListPanelProps {
  title: string;
  accent: "rose" | "primary";
  icon: React.ReactNode;
  entries: StoredNetwork[];
  onLoad: (e: StoredNetwork) => void;
  onToggleFavorite: (e: StoredNetwork) => void;
  isFavorite: (e: StoredNetwork) => boolean;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

function NetworkListPanel({
  title,
  accent,
  icon,
  entries,
  onLoad,
  onToggleFavorite,
  isFavorite,
  onDelete,
  onClearAll,
}: NetworkListPanelProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-2xl border bg-card p-4",
        accent === "rose" ? "border-rose-400/30 bg-rose-500/5" : "border-border/70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          {icon}
          {title}
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {entries.length}
          </span>
        </h3>
        {onClearAll && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
      <ul className="mt-3 space-y-1.5 list-none">
        {entries.map((e) => {
          const fav = isFavorite(e);
          return (
            <li
              key={e.id}
              className="group flex items-center gap-2 rounded-xl border border-border/60 bg-background p-2.5"
            >
              <button
                type="button"
                onClick={() => onLoad(e)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <Wifi className="size-3.5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{e.ssid}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {e.security === "nopass" ? "Open" : e.security} ·{" "}
                    {e.password ? "••••••" : "no password"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(e)}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  fav
                    ? "text-rose-500 hover:bg-rose-500/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Star
                  className={cn("size-3.5", fav && "fill-current")}
                />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(e.id)}
                  aria-label="Delete from history"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
