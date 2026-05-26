"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Download, Loader2, QrCode, RotateCcw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/shared/copy-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ErrorLevel = "L" | "M" | "Q" | "H";

const ERROR_LEVELS: { value: ErrorLevel; label: string; recovery: string }[] = [
  { value: "L", label: "Low", recovery: "~7% recovery" },
  { value: "M", label: "Medium", recovery: "~15% recovery" },
  { value: "Q", label: "Quartile", recovery: "~25% recovery" },
  { value: "H", label: "High", recovery: "~30% recovery" },
];

const PRESETS = [
  { label: "Classic", fg: "#0F172A", bg: "#FFFFFF" },
  { label: "Indigo", fg: "#4338CA", bg: "#EEF2FF" },
  { label: "Violet", fg: "#6D28D9", bg: "#FAF5FF" },
  { label: "Emerald", fg: "#047857", bg: "#ECFDF5" },
  { label: "Slate", fg: "#1E293B", bg: "#F8FAFC" },
];

const MAX_LENGTH = 2000;

export default function QRCodeGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [text, setText] = React.useState("https://toollyz.com");
  const [size, setSize] = React.useState(320);
  const [margin, setMargin] = React.useState(2);
  const [errorLevel, setErrorLevel] = React.useState<ErrorLevel>("M");
  const [fg, setFg] = React.useState("#0F172A");
  const [bg, setBg] = React.useState("#FFFFFF");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  const trimmed = text.trim();
  const tooLong = text.length > MAX_LENGTH;

  React.useEffect(() => {
    if (!canvasRef.current) return;
    if (!trimmed) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDownloadUrl(null);
      setError(null);
      return;
    }
    if (tooLong) {
      setError(`Input is too long. Max ${MAX_LENGTH.toLocaleString()} characters.`);
      setDownloadUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const opts = {
      errorCorrectionLevel: errorLevel,
      margin,
      width: size,
      color: { dark: fg, light: bg },
    } as const;

    Promise.all([
      QRCode.toCanvas(canvasRef.current, trimmed, opts),
      QRCode.toDataURL(trimmed, { ...opts, width: Math.max(size * 2, 1024) }),
    ])
      .then(([, dataUrl]) => {
        if (cancelled) return;
        setDownloadUrl(dataUrl);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not generate QR code.";
        setError(message);
        setDownloadUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed, tooLong, size, margin, errorLevel, fg, bg]);

  function handleDownload() {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `toollyz-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR code downloaded");
  }

  function handleReset() {
    setText("https://toollyz.com");
    setSize(320);
    setMargin(2);
    setErrorLevel("M");
    setFg("#0F172A");
    setBg("#FFFFFF");
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setFg(preset.fg);
    setBg(preset.bg);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="qr-input">Text or URL</Label>
          <Textarea
            id="qr-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com"
            rows={4}
            className="resize-none rounded-xl"
            maxLength={MAX_LENGTH + 50}
            aria-describedby="qr-input-help"
            aria-invalid={tooLong || undefined}
          />
          <div id="qr-input-help" className="flex justify-between text-xs text-muted-foreground">
            <span>Any text, URL, vCard or Wi-Fi string.</span>
            <span
              className={cn(
                tooLong ? "text-destructive font-medium" : "",
              )}
            >
              {text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="qr-size">Size — {size}px</Label>
            <Slider
              id="qr-size"
              value={[size]}
              onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
              min={128}
              max={1024}
              step={16}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qr-margin">Margin — {margin}</Label>
            <Slider
              id="qr-margin"
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
            onValueChange={(v) => setErrorLevel(v as ErrorLevel)}
          >
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="Choose level" />
            </SelectTrigger>
            <SelectContent>
              {ERROR_LEVELS.map((lvl) => (
                <SelectItem key={lvl.value} value={lvl.value}>
                  <span className="font-medium">{lvl.label}</span>
                  <span className="text-muted-foreground"> · {lvl.recovery}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField id="qr-fg" label="Foreground" value={fg} onChange={setFg} />
          <ColorField id="qr-bg" label="Background" value={bg} onChange={setBg} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Presets</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40"
              >
                <span className="flex">
                  <span
                    className="size-3 rounded-full border border-border"
                    style={{ background: preset.fg }}
                    aria-hidden
                  />
                  <span
                    className="-ml-1 size-3 rounded-full border border-border"
                    style={{ background: preset.bg }}
                    aria-hidden
                  />
                </span>
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!downloadUrl || loading || !!error}
          >
            <Download className="size-4" />
            Download PNG
          </Button>
          <CopyButton
            value={trimmed}
            variant="outline"
            size="default"
            label="Copy input"
            message="Input copied"
          />
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background p-4"
          style={{ background: bg }}
          role="img"
          aria-label={trimmed ? `QR code for ${trimmed}` : "QR code preview"}
        >
          <canvas
            ref={canvasRef}
            className={cn(
              "max-h-full max-w-full rounded-md transition-opacity",
              !trimmed || error ? "opacity-0" : loading ? "opacity-60" : "opacity-100",
            )}
          />
          {!trimmed && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <QrCode className="size-8 opacity-60" />
              <p>Enter text or a URL to generate</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-destructive">
              <ScanLine className="size-8 opacity-60" />
              <p className="font-medium">{error}</p>
            </div>
          )}
          {loading && trimmed && !error && (
            <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur">
              <Loader2 className="size-3 animate-spin" />
              Updating
            </div>
          )}
        </div>
        <p
          aria-live="polite"
          className="text-center text-xs text-muted-foreground"
        >
          {error
            ? "Adjust your input to generate a QR code."
            : trimmed
              ? `QR code · ${size}px · error level ${errorLevel}`
              : "Your QR code will appear here"}
        </p>
      </div>
    </div>
  );
}

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function ColorField({ id, label, value, onChange }: ColorFieldProps) {
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
