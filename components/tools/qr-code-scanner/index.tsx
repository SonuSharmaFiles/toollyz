"use client";

import * as React from "react";
import jsQR from "jsqr";
import {
  Calendar,
  Camera,
  CameraOff,
  CircleDollarSign,
  Contact,
  Copy,
  Eraser,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Type as TypeIcon,
  Upload,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseQrContent, qrKindLabel, type QrContent } from "@/lib/tools/qr/parse";

const HISTORY_KEY = "toollyz:qr-scan-history";
const HISTORY_CAP = 24;

interface Scan {
  text: string;
  at: number;
  source: "camera" | "file";
}

export default function QrCodeScanner() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const resultRef = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [latest, setLatest] = React.useState<Scan | null>(null);
  const [history, setHistory] = React.useState<Scan[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Scan[];
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, HISTORY_CAP));
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_CAP)));
    } catch {
      /* noop */
    }
  }, [history, mounted]);

  React.useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Confirm-decode feedback: scroll the result card into view, trigger
  // the emerald flash ring, and emit a short vibration on devices that
  // support it. Fires on every new scan (keyed on `latest.at`) so a
  // repeat decode of a different QR also feels live. We respect the
  // user's reduced-motion preference for the scroll easing — the
  // flash class itself disables in the keyframe rule.
  React.useEffect(() => {
    if (!latest) return;
    const node = resultRef.current;
    if (!node) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    // Re-trigger the animation by toggling the class off then on.
    node.classList.remove("animate-scan-flash");
    // Force reflow so the next add restarts the animation.
    void node.offsetWidth;
    node.classList.add("animate-scan-flash");
    try {
      navigator.vibrate?.([35]);
    } catch {
      /* device doesn't support vibration — ignore */
    }
  }, [latest?.at, latest]);

  function stopCamera() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) return;
      v.srcObject = stream;
      await v.play();
      setScanning(true);
      tick();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera failed to start.";
      setError(msg);
      toast.error(msg);
    }
  }

  function recordScan(text: string, source: "camera" | "file") {
    const scan: Scan = { text, at: Date.now(), source };
    setLatest(scan);
    setHistory((h) => {
      // Dedupe consecutive same-text scans.
      if (h[0]?.text === text) return h;
      return [scan, ...h].slice(0, HISTORY_CAP);
    });
  }

  function tick() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !streamRef.current) return;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      const w = v.videoWidth;
      const h = v.videoHeight;
      if (w > 0 && h > 0) {
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h);
          const code = jsQR(data.data, w, h, { inversionAttempts: "dontInvert" });
          if (code && code.data) {
            recordScan(code.data, "camera");
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function handleFile(file: File) {
    setError(null);
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = canvasRef.current ?? document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(data.data, c.width, c.height);
      URL.revokeObjectURL(url);
      if (code && code.data) {
        recordScan(code.data, "file");
        toast.success("QR decoded");
      } else {
        toast.error("No QR code found in image");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read image");
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const parsed = latest ? parseQrContent(latest.text) : null;

  return (
    <div className="space-y-6">
      <section className="space-y-3 overflow-hidden rounded-3xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Camera className="size-4 text-primary" />
            Live camera scan
          </h2>
          <div className="flex gap-2">
            {!scanning ? (
              <Button type="button" size="sm" onClick={startCamera}>
                <Camera className="size-3.5" />
                Start camera
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
                <CameraOff className="size-3.5" />
                Stop
              </Button>
            )}
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-2xl border border-border/60 bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn("h-full w-full object-cover", !scanning && "opacity-30")}
          />
          {!scanning && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
              <ScanLine className="size-12 opacity-70" />
              <p className="mt-2 text-sm">Tap &apos;Start camera&apos; to scan a QR</p>
            </div>
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-3/5 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
            {error} — most likely a permissions denial. Reload and grant camera access, or use the file upload below.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ImageIcon className="size-4 text-primary" />
          Decode from an image file
        </h2>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/50 p-4 text-xs">
          <Upload className="size-4 text-primary" />
          <span className="flex-1">
            Drop a PNG / JPG containing a QR code, or click to pick one — the bytes never leave your browser.
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </label>
      </section>

      {latest && parsed && (
        <ScanResultCard
          ref={resultRef}
          parsed={parsed}
          source={latest.source}
          onCopy={copyText}
        />
      )}

      {history.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">History ({history.length})</h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setHistory([])}>
              <Eraser className="size-3.5" />
              Clear
            </Button>
          </div>
          <ul className="space-y-1 list-none">
            {history.map((s, i) => {
              const p = parseQrContent(s.text);
              return (
                <li
                  key={`${s.at}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/40 p-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <KindIcon kind={p.kind} className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{qrKindLabel(p.kind)}: {shortSummary(p)}</span>
                  </span>
                  <span className="shrink-0 font-mono text-muted-foreground">
                    {new Date(s.at).toLocaleTimeString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Camera frames and uploaded files are decoded entirely in your browser via jsQR — nothing is uploaded.
        <Sparkles className="ml-auto size-3" />
      </p>
    </div>
  );
}

// ---------------- Result card ----------------

interface ScanResultCardProps {
  parsed: QrContent;
  source: "camera" | "file";
  onCopy: (text: string) => void;
}

const ScanResultCard = React.forwardRef<HTMLElement, ScanResultCardProps>(
  function ScanResultCard({ parsed, source, onCopy }, ref) {
    return (
      <section
        ref={ref}
        aria-live="polite"
        className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <KindIcon kind={parsed.kind} className="size-4" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80">
                Scanned {source === "camera" ? "from camera" : "from image"}
              </p>
              <h2 className="text-base font-semibold tracking-tight">
                {qrKindLabel(parsed.kind)}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onCopy(parsed.raw)}>
              <Copy className="size-3.5" />
              Copy raw
            </Button>
            <PrimaryAction parsed={parsed} />
          </div>
        </header>

        <KindBody parsed={parsed} onCopy={onCopy} />
      </section>
    );
  },
);

function PrimaryAction({ parsed }: { parsed: QrContent }) {
  switch (parsed.kind) {
    case "url":
      return (
        <a
          href={parsed.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <ExternalLink className="size-3.5" />
          Open link
        </a>
      );
    case "email":
      return (
        <a
          href={parsed.href}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Mail className="size-3.5" />
          Compose
        </a>
      );
    case "phone":
      return (
        <a
          href={parsed.href}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Phone className="size-3.5" />
          Call
        </a>
      );
    case "sms":
      return (
        <a
          href={parsed.href}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <MessageSquare className="size-3.5" />
          Open SMS
        </a>
      );
    case "geo":
      return (
        <a
          href={parsed.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <MapPin className="size-3.5" />
          Open in Maps
        </a>
      );
    case "upi":
    case "crypto":
      return (
        <a
          href={parsed.href}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <CircleDollarSign className="size-3.5" />
          Open in wallet
        </a>
      );
    case "vcard":
      return <VcardDownload parsed={parsed} />;
    default:
      return null;
  }
}

function VcardDownload({ parsed }: { parsed: Extract<QrContent, { kind: "vcard" }> }) {
  function download() {
    const blob = new Blob([parsed.raw], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(parsed.name || "contact").replace(/\W+/g, "-")}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return (
    <Button type="button" size="sm" onClick={download} className="bg-emerald-600 text-white hover:bg-emerald-700">
      <Contact className="size-3.5" />
      Save contact
    </Button>
  );
}

function KindBody({ parsed, onCopy }: { parsed: QrContent; onCopy: (text: string) => void }) {
  switch (parsed.kind) {
    case "url":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="Domain" value={parsed.host} mono />
          <Row label="Full URL" value={parsed.href} mono wrap />
        </div>
      );
    case "email":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="To" value={parsed.address} mono />
          {parsed.subject && <Row label="Subject" value={parsed.subject} />}
          {parsed.body && <Row label="Body" value={parsed.body} wrap />}
          {parsed.cc && <Row label="Cc" value={parsed.cc} mono />}
          {parsed.bcc && <Row label="Bcc" value={parsed.bcc} mono />}
        </div>
      );
    case "phone":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="Number" value={parsed.number} mono />
        </div>
      );
    case "sms":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="To" value={parsed.number} mono />
          {parsed.message && <Row label="Message" value={parsed.message} wrap />}
        </div>
      );
    case "wifi":
      return <WifiBody parsed={parsed} onCopy={onCopy} />;
    case "vcard":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          {parsed.name && <Row label="Name" value={parsed.name} />}
          {parsed.org && <Row label="Organization" value={parsed.org} />}
          {parsed.title && <Row label="Title" value={parsed.title} />}
          {parsed.phone && <Row label="Phone" value={parsed.phone} mono />}
          {parsed.email && <Row label="Email" value={parsed.email} mono />}
          {parsed.url && <Row label="Website" value={parsed.url} mono />}
          {parsed.address && <Row label="Address" value={parsed.address} wrap />}
        </div>
      );
    case "geo":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="Latitude" value={parsed.lat.toString()} mono />
          <Row label="Longitude" value={parsed.lng.toString()} mono />
        </div>
      );
    case "calendar":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          {parsed.summary && <Row label="Event" value={parsed.summary} />}
          {parsed.start && <Row label="Starts" value={parsed.start} mono />}
          {parsed.end && <Row label="Ends" value={parsed.end} mono />}
          {parsed.location && <Row label="Location" value={parsed.location} />}
          {parsed.description && <Row label="Details" value={parsed.description} wrap />}
        </div>
      );
    case "upi":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="Payee VPA" value={parsed.payee} mono />
          {parsed.name && <Row label="Name" value={parsed.name} />}
          {parsed.amount && <Row label="Amount" value={parsed.amount} mono />}
          {parsed.note && <Row label="Note" value={parsed.note} />}
        </div>
      );
    case "crypto":
      return (
        <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
          <Row label="Network" value={parsed.scheme.toUpperCase()} />
          <Row label="Address" value={parsed.address} mono wrap />
          {parsed.amount && <Row label="Amount" value={parsed.amount} mono />}
        </div>
      );
    case "text":
      return (
        <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/50 p-3 font-mono text-xs whitespace-pre-wrap break-all">
          {parsed.raw}
        </pre>
      );
  }
}

function WifiBody({
  parsed,
  onCopy,
}: {
  parsed: Extract<QrContent, { kind: "wifi" }>;
  onCopy: (text: string) => void;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-3 text-sm">
      <Row label="Network (SSID)" value={parsed.ssid || "(empty)"} mono />
      {parsed.auth && <Row label="Security" value={parsed.auth === "nopass" ? "Open (no password)" : parsed.auth} />}
      {parsed.password && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Password
          </span>
          <span className="flex items-center gap-2 font-mono text-xs">
            <span className="break-all">{show ? parsed.password : "•".repeat(Math.min(parsed.password.length, 14))}</span>
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onCopy(parsed.password!)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Copy password"
            >
              <Copy className="size-3.5" />
            </button>
          </span>
        </div>
      )}
      {parsed.hidden && <Row label="Hidden network" value="Yes" />}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 text-right",
          mono ? "font-mono text-xs" : "text-sm",
          wrap ? "break-all text-left whitespace-pre-wrap" : "truncate",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function KindIcon({ kind, className }: { kind: QrContent["kind"]; className?: string }) {
  const Icon = {
    url: Globe,
    email: Mail,
    phone: Phone,
    sms: MessageSquare,
    wifi: Wifi,
    vcard: Contact,
    geo: MapPin,
    calendar: Calendar,
    upi: CircleDollarSign,
    crypto: CircleDollarSign,
    text: TypeIcon,
  }[kind] ?? LinkIcon;
  return <Icon className={className} aria-hidden />;
}

function shortSummary(parsed: QrContent): string {
  switch (parsed.kind) {
    case "url": return parsed.host;
    case "email": return parsed.address;
    case "phone": return parsed.number;
    case "sms": return parsed.number;
    case "wifi": return parsed.ssid || "(no SSID)";
    case "vcard": return parsed.name || parsed.org || "Contact";
    case "geo": return `${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)}`;
    case "calendar": return parsed.summary || "Event";
    case "upi": return parsed.payee;
    case "crypto": return parsed.address.slice(0, 14) + "…";
    case "text": return parsed.raw.length > 40 ? parsed.raw.slice(0, 40) + "…" : parsed.raw;
  }
}
