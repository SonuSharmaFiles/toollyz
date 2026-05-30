"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Info,
  Lock,
  Plus,
  QrCode,
  RefreshCcw,
  Sparkles,
  Trash2,
  Upload,
  Utensils,
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
import { CURRENCY_OPTIONS } from "@/lib/tools/finance/money";
import {
  DEFAULT_MENU,
  buildMenuHtml,
  newItem,
  newSection,
  type MenuInput,
  type MenuItem,
  type MenuSection,
} from "@/lib/tools/qr-menu/menu";

const STORAGE_KEY = "toollyz:qr-menu";

export default function QrMenuGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [menu, setMenu] = React.useState<MenuInput>(DEFAULT_MENU);
  const [hostedUrl, setHostedUrl] = React.useState("https://example.com/menu.html");
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMenu({ ...DEFAULT_MENU, ...(JSON.parse(raw) as Partial<MenuInput>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
    } catch {
      /* noop */
    }
  }, [menu, mounted]);

  const html = React.useMemo(() => buildMenuHtml(menu), [menu]);

  React.useEffect(() => {
    if (iframeRef.current) iframeRef.current.srcdoc = html;
  }, [html]);

  React.useEffect(() => {
    if (!mounted || !qrCanvasRef.current) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !qrCanvasRef.current) return;
      const url = hostedUrl.trim() || "https://example.com";
      QRCode.toCanvas(qrCanvasRef.current, url, { errorCorrectionLevel: "M", margin: 2, width: 280 }, () => {});
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, hostedUrl]);

  function patch<K extends keyof MenuInput>(k: K, v: MenuInput[K]) {
    setMenu((m) => ({ ...m, [k]: v }));
  }

  function addSection() {
    setMenu((m) => ({ ...m, sections: [...m.sections, newSection()] }));
  }
  function removeSection(id: string) {
    setMenu((m) => ({ ...m, sections: m.sections.filter((s) => s.id !== id) }));
  }
  function updateSection(id: string, partial: Partial<MenuSection>) {
    setMenu((m) => ({ ...m, sections: m.sections.map((s) => (s.id === id ? { ...s, ...partial } : s)) }));
  }
  function moveSection(id: string, delta: number) {
    setMenu((m) => {
      const idx = m.sections.findIndex((s) => s.id === id);
      const target = idx + delta;
      if (idx < 0 || target < 0 || target >= m.sections.length) return m;
      const sections = [...m.sections];
      const [taken] = sections.splice(idx, 1);
      sections.splice(target, 0, taken);
      return { ...m, sections };
    });
  }
  function addItem(sectionId: string) {
    setMenu((m) => ({
      ...m,
      sections: m.sections.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newItem()] } : s)),
    }));
  }
  function updateItem(sectionId: string, itemId: string, partial: Partial<MenuItem>) {
    setMenu((m) => ({
      ...m,
      sections: m.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...partial } : it)) }
          : s,
      ),
    }));
  }
  function removeItem(sectionId: string, itemId: string) {
    setMenu((m) => ({
      ...m,
      sections: m.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((it) => it.id !== itemId) } : s,
      ),
    }));
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safe(menu.restaurantName)}-menu.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Saved menu HTML");
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML source copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function downloadQrPng() {
    if (!qrCanvasRef.current) return;
    qrCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safe(menu.restaurantName)}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Saved QR PNG");
    }, "image/png");
  }

  function reset() {
    setMenu(DEFAULT_MENU);
    toast.success("Reset to defaults");
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live preview */}
      <section
        aria-label="Menu preview"
        className="space-y-2 rounded-3xl border border-border/70 bg-card p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5"><Eye className="size-3.5" />Live preview</span>
          <span className="font-mono">{Math.round(html.length / 1024)} KB</span>
        </div>
        <iframe
          ref={iframeRef}
          className="block h-[640px] w-full rounded-2xl border border-border/60"
          title="Menu preview"
          sandbox="allow-same-origin"
        />
      </section>

      {/* Restaurant identity */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Utensils className="size-4 text-primary" />
          Restaurant
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><Input value={menu.restaurantName} onChange={(e) => patch("restaurantName", e.target.value)} /></Field>
          <Field label="Tagline"><Input value={menu.tagline} onChange={(e) => patch("tagline", e.target.value)} placeholder="Open daily 7am–4pm" /></Field>
          <Field label="Currency">
            <Select value={menu.currency} onValueChange={(v) => v && patch("currency", v)}>
              <SelectTrigger className="w-full justify-between font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Upload logo (optional)">
            <LogoUpload value={menu.logoUrl} onChange={(v) => patch("logoUrl", v)} />
          </Field>
          <Field label="Brand colour">
            <ColorRow value={menu.brandColor} onChange={(v) => patch("brandColor", v)} />
          </Field>
          <Field label="Page background">
            <ColorRow value={menu.pageBackground} onChange={(v) => patch("pageBackground", v)} />
          </Field>
          <Field label="Footer line"><Input value={menu.footer} onChange={(e) => patch("footer", e.target.value)} /></Field>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Sections &amp; items
          </h2>
          <Button type="button" size="sm" variant="outline" onClick={addSection}>
            <Plus className="size-3.5" />
            Section
          </Button>
        </div>
        <div className="space-y-3">
          {menu.sections.map((section, sIdx) => (
            <div key={section.id} className="space-y-3 rounded-2xl border border-border/60 bg-background p-3">
              <div className="flex items-center gap-2">
                <Input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} className="font-semibold" placeholder="Section title" />
                <Button type="button" size="sm" variant="ghost" onClick={() => moveSection(section.id, -1)} disabled={sIdx === 0}>↑</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => moveSection(section.id, 1)} disabled={sIdx === menu.sections.length - 1}>↓</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeSection(section.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.id} className="grid gap-2 rounded-lg border border-border/60 bg-card p-2 sm:grid-cols-[1fr_120px_24px]">
                    <div className="space-y-1.5">
                      <Input value={item.name} onChange={(e) => updateItem(section.id, item.id, { name: e.target.value })} placeholder="Item name" />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })}
                        placeholder="Short description"
                        className="min-h-[40px]"
                      />
                      <Input
                        value={item.tags.join(", ")}
                        onChange={(e) => updateItem(section.id, item.id, { tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                        placeholder="Tags (vegan, gluten-free, …)"
                      />
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(section.id, item.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                      className="self-start font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(section.id, item.id)}
                      className={cn("grid place-items-center self-start rounded-md border border-border/60 p-1.5 text-muted-foreground hover:bg-muted")}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => addItem(section.id)}>
                  <Plus className="size-3.5" />
                  Item
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Download className="size-4 text-primary" />
            Downloads
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" onClick={downloadHtml}>
              <Download className="size-3.5" />
              menu.html
            </Button>
            <Button type="button" variant="outline" onClick={copyHtml}>
              <Copy className="size-3.5" />
              Copy HTML source
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Toollyz has no backend — host menu.html on your own static service (Netlify Drop, GitHub Pages, your CDN).
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <QrCode className="size-4 text-primary" />
            QR for hosted URL
          </h2>
          <Field label="Where will customers find the menu?">
            <Input value={hostedUrl} onChange={(e) => setHostedUrl(e.target.value)} placeholder="https://example.com/menu.html" />
          </Field>
          <div className="flex items-center gap-3">
            <canvas ref={qrCanvasRef} className="rounded bg-white p-1" />
            <Button type="button" size="sm" variant="outline" onClick={downloadQrPng}>
              <Download className="size-3.5" />
              QR PNG
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          How the QR menu works
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Build the menu visually → download a single standalone HTML file → upload it to any static host (Netlify Drop is the easiest).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Print the QR code on table cards. Customers point their phone camera, the menu opens in their browser — no app, no download.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Prices use <code className="font-mono">Intl.NumberFormat</code> with the chosen currency — symbols and decimals follow the customer&apos;s locale.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — your menu data saves to localStorage on this device only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Generated entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
    </div>
  );
}

function safe(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "menu";
}

const LOGO_MAX_BYTES = 512 * 1024; // 512 KB raw file cap → ~700 KB base64
const ACCEPTED_LOGO_MIME = /^image\/(png|jpe?g|webp|svg\+xml|gif)$/;

function LogoUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  function readFile(file: File) {
    if (!ACCEPTED_LOGO_MIME.test(file.type)) {
      toast.error("Pick a PNG, JPG, WebP, GIF or SVG image.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error(`Logo is ${(file.size / 1024).toFixed(0)} KB — keep it under ${LOGO_MAX_BYTES / 1024} KB so menu.html stays snappy.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setFileName(file.name);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => toast.error("Couldn't read the file.");
    reader.readAsDataURL(file);
  }

  function clear() {
    onChange("");
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function replace() {
    inputRef.current?.click();
  }

  function onPickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) readFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  }

  const hasLogo = value.length > 0;
  // Estimate the embedded byte cost (base64 inflates by ~4/3).
  const sizeKb = hasLogo ? Math.round((value.length * 0.75) / 1024) : 0;

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={onPickerChange}
      />
      {hasLogo ? (
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Logo preview"
            className="size-14 shrink-0 rounded-lg border border-border/60 bg-white object-contain p-1"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="truncate text-xs font-medium text-foreground">{fileName ?? "Embedded logo"}</div>
            <div className="text-[10px] text-muted-foreground">
              ~{sizeKb} KB · embedded inline (no external image dependency)
            </div>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={replace}>
            <Upload className="size-3.5" />
            Replace
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={clear} aria-label="Remove logo">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-background p-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50",
          )}
        >
          <Upload className="size-4 shrink-0" />
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-foreground">Click or drop an image</div>
            <div className="text-[10px] text-muted-foreground">PNG, JPG, WebP, GIF or SVG · up to {LOGO_MAX_BYTES / 1024} KB · embedded as data: URL inside menu.html</div>
          </div>
        </label>
      )}
    </div>
  );
}
