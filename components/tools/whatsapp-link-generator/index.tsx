"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Lock,
  MessageCircle,
  Phone,
  QrCode,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  COUNTRY_CODES,
  build,
  countMessageChars,
  encodedLength,
} from "@/lib/tools/text/whatsapp-link";

const STATE_KEY = "toollyz:wa-state";

interface State {
  callingCode: string;
  phone: string;
  message: string;
  countryIso: string;
}

const DEFAULT_STATE: State = {
  callingCode: "1",
  phone: "415 555 1234",
  message:
    "Hi! I saw your link on the website — is now a good time to chat?",
  countryIso: "US",
};

export default function WhatsAppLinkGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [copied, setCopied] = React.useState<string | null>(null);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setState({ ...DEFAULT_STATE, ...parsed });
        }
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  const out = React.useMemo(
    () => build({ callingCode: state.callingCode, phone: state.phone, message: state.message }),
    [state.callingCode, state.phone, state.message],
  );

  React.useEffect(() => {
    if (!mounted || !qrCanvasRef.current) return;
    let cancelled = false;
    if (!out.url) {
      const ctx = qrCanvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, qrCanvasRef.current.width, qrCanvasRef.current.height);
      return;
    }
    import("qrcode").then((QRCode) => {
      if (cancelled || !qrCanvasRef.current) return;
      QRCode.toCanvas(
        qrCanvasRef.current,
        out.url,
        { errorCorrectionLevel: "M", margin: 2, width: 240 },
        () => {},
      );
    });
    return () => {
      cancelled = true;
    };
  }, [out.url, mounted]);

  function patch<K extends keyof State>(k: K, v: State[K]) {
    setState((s) => ({ ...s, [k]: v }));
  }

  function pickCountry(iso: string) {
    const c = COUNTRY_CODES.find((x) => x.iso === iso);
    if (c) setState((s) => ({ ...s, countryIso: iso, callingCode: c.callingCode }));
  }

  async function copy(value: string, key: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function downloadQrPng() {
    if (!qrCanvasRef.current) return;
    qrCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatsapp-${out.fullPhone || "qr"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("QR PNG saved");
    }, "image/png");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const msgChars = countMessageChars(state.message);
  const msgEncoded = encodedLength(state.message);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="WhatsApp link summary"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Generated link</div>
            <div className="break-all font-mono text-sm text-sky-50">
              {out.url || (
                <span className="text-rose-300/80">Enter a phone number to generate</span>
              )}
            </div>
          </div>
          <Stat label="Phone digits" value={out.fullPhone.length} reduceMotion={!!reduceMotion} accent={out.issues.length === 0 ? "text-emerald-300" : "text-amber-300"} />
          <Stat label="Message chars" value={msgChars} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Form */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Phone className="size-4 text-primary" />
          Recipient details
        </h2>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1.4fr]">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Country</Label>
            <Select value={state.countryIso} onValueChange={(v) => v && pickCountry(v)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((c) => (
                  <SelectItem key={c.iso} value={c.iso}>
                    {c.flag} {c.name} +{c.callingCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Calling code</Label>
            <Input
              value={state.callingCode}
              onChange={(e) => patch("callingCode", e.target.value)}
              placeholder="91"
              inputMode="numeric"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Phone number</Label>
            <Input
              value={state.phone}
              onChange={(e) => patch("phone", e.target.value)}
              placeholder="415 555 1234"
              inputMode="tel"
              className="font-mono"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Pre-filled message <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            value={state.message}
            onChange={(e) => patch("message", e.target.value)}
            placeholder="Hi! …"
            className="min-h-[88px]"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>
              {msgChars.toLocaleString()} characters · URL-encoded length {msgEncoded.toLocaleString()}
            </span>
            {msgEncoded > 1900 && (
              <span className="text-amber-600 dark:text-amber-400">
                Very long messages may misbehave on iOS Safari.
              </span>
            )}
          </div>
        </div>

        {out.issues.length > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5" />
              Issues to fix
            </div>
            <ul className="list-disc space-y-0.5 pl-5 list-inside">
              {out.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Outputs */}
      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <MessageCircle className="size-4 text-primary" />
            Click-to-chat links
          </h2>
          <LinkRow label="wa.me (universal)" url={out.url} copyKey="url" copied={copied} onCopy={copy} />
          <LinkRow label="api.whatsapp.com (web fallback)" url={out.webUrl} copyKey="web" copied={copied} onCopy={copy} />
          <LinkRow label="whatsapp:// (native app)" url={out.apiUrl} copyKey="api" copied={copied} onCopy={copy} />
        </div>
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <QrCode className="size-4 text-primary" />
            QR code
          </h2>
          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={qrCanvasRef}
              className={cn("rounded-lg border border-border/60 bg-white p-1", !out.url && "opacity-30")}
              width={240}
              height={240}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={downloadQrPng}
              disabled={!out.url}
              className="w-full"
            >
              <Download className="size-3.5" />
              Download PNG
            </Button>
          </div>
        </div>
      </section>

      {/* Sample reset */}
      <div className="flex flex-wrap gap-1.5">
        <ToolBtn onClick={() => setState(DEFAULT_STATE)} icon={<Sparkles className="size-3.5" />} label="Reset sample" />
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Globe className="size-3" />
        Links and QR codes are composed entirely in your browser — Toollyz has no server. Phone
        numbers must include the country dial code (no + sign for wa.me).
      </p>
    </div>
  );
}

function LinkRow({
  label,
  url,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  url: string;
  copyKey: string;
  copied: string | null;
  onCopy: (value: string, key: string) => void;
}) {
  return (
    <div className="space-y-1.5 rounded-xl border border-border/60 bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="break-all font-mono text-xs text-foreground/90">{url || "—"}</div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onCopy(url, copyKey)} disabled={!url}>
          {copied === copyKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          Copy
        </Button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-3" />
            Test
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-sky-300/70">{label}</div>
      <div className={cn("font-heading text-2xl font-bold tabular-nums sm:text-3xl", accent ?? "text-sky-50")}>
        <AnimatedNumber value={value} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
    >
      {icon}
      {label}
    </button>
  );
}
