"use client";

import * as React from "react";
import {
  CheckCircle2,
  Contact,
  Copy,
  Download,
  Eye,
  Info,
  Lock,
  QrCode,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DEFAULT_BUSINESS_CARD,
  buildBusinessCardHtml,
  type BusinessCardInput,
} from "@/lib/tools/contact/business-card";
import { buildVcard, suggestFilename } from "@/lib/tools/contact/vcard";

const STORAGE_KEY = "toollyz:business-card";

export default function DigitalBusinessCard() {
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState<BusinessCardInput>(DEFAULT_BUSINESS_CARD);
  const [hostedUrl, setHostedUrl] = React.useState("https://example.com/jordan-card.html");
  const previewIframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...DEFAULT_BUSINESS_CARD, ...(JSON.parse(raw) as Partial<BusinessCardInput>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      /* noop */
    }
  }, [input, mounted]);

  const html = React.useMemo(() => buildBusinessCardHtml(input), [input]);
  const vcf = React.useMemo(() => buildVcard(input), [input]);

  React.useEffect(() => {
    if (previewIframeRef.current) {
      previewIframeRef.current.srcdoc = html;
    }
  }, [html]);

  // Render QR for hosted URL.
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
  }, [hostedUrl, mounted]);

  function patch<K extends keyof BusinessCardInput>(k: K, v: BusinessCardInput[K]) {
    setInput((s) => ({ ...s, [k]: v }));
  }

  function updatePhone(idx: number, value: string) {
    setInput((s) => ({ ...s, phones: s.phones.map((p, i) => (i === idx ? { ...p, value } : p)) }));
  }
  function updateEmail(idx: number, value: string) {
    setInput((s) => ({ ...s, emails: s.emails.map((e, i) => (i === idx ? { ...e, value } : e)) }));
  }
  function updateWebsite(idx: number, value: string) {
    setInput((s) => ({ ...s, websites: s.websites.map((w, i) => (i === idx ? { ...w, value } : w)) }));
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base = [input.firstName, input.lastName].map((p) => p.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")).filter(Boolean).join("-") || "card";
    a.download = `${base}-card.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Saved HTML card");
  }

  function downloadVcf() {
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestFilename(input);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Saved .vcf");
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
      a.download = "business-card-qr.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Saved QR PNG");
    }, "image/png");
  }

  function reset() {
    setInput(DEFAULT_BUSINESS_CARD);
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
        aria-label="Live card preview"
        className="space-y-2 rounded-3xl border border-border/70 bg-card p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5"><Eye className="size-3.5" />Live preview</span>
          <span className="font-mono">{Math.round(html.length / 1024)} KB</span>
        </div>
        <iframe
          ref={previewIframeRef}
          className="block h-[620px] w-full rounded-2xl border border-border/60"
          title="Business card preview"
          sandbox="allow-same-origin"
        />
      </section>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-4 space-y-3">
          <Section title="Identity">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name"><Input value={input.firstName} onChange={(e) => patch("firstName", e.target.value)} /></Field>
              <Field label="Last name"><Input value={input.lastName} onChange={(e) => patch("lastName", e.target.value)} /></Field>
              <Field label="Job title"><Input value={input.title} onChange={(e) => patch("title", e.target.value)} /></Field>
              <Field label="Company"><Input value={input.organization} onChange={(e) => patch("organization", e.target.value)} /></Field>
              <Field label="Photo URL"><Input value={input.photoUrl} onChange={(e) => patch("photoUrl", e.target.value)} placeholder="https://…" /></Field>
            </div>
            <Field label="Bio (1-2 sentences)">
              <Textarea value={input.bio} onChange={(e) => patch("bio", e.target.value)} placeholder="Short tagline…" className="min-h-[70px]" />
            </Field>
          </Section>
        </TabsContent>

        <TabsContent value="contact" className="mt-4 space-y-3">
          <Section title="Contact">
            <Field label="Email"><Input type="email" value={input.emails[0]?.value ?? ""} onChange={(e) => updateEmail(0, e.target.value)} /></Field>
            <Field label="Phone"><Input value={input.phones[0]?.value ?? ""} onChange={(e) => updatePhone(0, e.target.value)} /></Field>
            <Field label="Website"><Input value={input.websites[0]?.value ?? ""} onChange={(e) => updateWebsite(0, e.target.value)} placeholder="https://example.com" /></Field>
          </Section>
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-3">
          <Section title="Social links">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="LinkedIn"><Input value={input.linkedin} onChange={(e) => patch("linkedin", e.target.value)} placeholder="linkedin.com/in/handle" /></Field>
              <Field label="X / Twitter"><Input value={input.twitter} onChange={(e) => patch("twitter", e.target.value)} placeholder="x.com/handle" /></Field>
              <Field label="GitHub"><Input value={input.github} onChange={(e) => patch("github", e.target.value)} placeholder="github.com/handle" /></Field>
              <Field label="Instagram"><Input value={input.instagram} onChange={(e) => patch("instagram", e.target.value)} placeholder="instagram.com/handle" /></Field>
              <Field label="YouTube"><Input value={input.youtube} onChange={(e) => patch("youtube", e.target.value)} placeholder="youtube.com/@channel" /></Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="style" className="mt-4 space-y-3">
          <Section title="Brand">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Brand colour">
                <ColorRow value={input.brandColor} onChange={(v) => patch("brandColor", v)} />
              </Field>
              <Field label="Page background">
                <ColorRow value={input.pageBackground} onChange={(v) => patch("pageBackground", v)} />
              </Field>
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      {/* Exports */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Download className="size-4 text-primary" />
            Downloads
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" onClick={downloadHtml}>
              <Download className="size-3.5" />
              card.html
            </Button>
            <Button type="button" variant="outline" onClick={downloadVcf}>
              <Download className="size-3.5" />
              .vcf
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
            Host card.html on your domain — Toollyz has no backend, so you host the page wherever you like (GitHub Pages, Netlify, your CDN).
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <QrCode className="size-4 text-primary" />
            QR for hosted URL
          </h2>
          <Field label="Where will you host card.html?">
            <Input value={hostedUrl} onChange={(e) => setHostedUrl(e.target.value)} placeholder="https://example.com/jordan-card.html" />
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
          How sharing works (honest)
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />card.html is a complete standalone page — open it locally or upload to any host (GitHub Pages, Netlify, S3, your CMS).</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />The page includes a Save-to-contacts button backed by an embedded data:URL .vcf — visitors don&apos;t need to go anywhere else.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />The QR generator points at <em>your</em> hosted URL — Toollyz can&apos;t host a card for you because the site has no backend.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Your form data saves to localStorage on this device only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Contact className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Generated entirely in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
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
      <Input value={value} onChange={(e) => onChange(e.target.value)} className={cn("font-mono")} />
    </div>
  );
}
