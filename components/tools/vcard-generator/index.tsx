"use client";

import * as React from "react";
import {
  CheckCircle2,
  ContactRound,
  Copy,
  Download,
  Info,
  Lock,
  Plus,
  QrCode,
  RefreshCcw,
  Sparkles,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ADDRESS_TYPES,
  DEFAULT_VCARD,
  EMAIL_TYPES,
  PHONE_TYPES,
  URL_TYPES,
  buildVcard,
  emptyAddressEntry,
  emptyContactEntry,
  suggestFilename,
  type AddressEntry,
  type ContactEntry,
  type VCardInput,
} from "@/lib/tools/contact/vcard";

const STORAGE_KEY = "toollyz:vcard-input";

export default function VCardGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState<VCardInput>(DEFAULT_VCARD);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...DEFAULT_VCARD, ...(JSON.parse(raw) as Partial<VCardInput>) });
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

  const vcfText = React.useMemo(() => buildVcard(input), [input]);

  // Render QR when text changes — lazy-load qrcode lib.
  React.useEffect(() => {
    if (!mounted || !qrCanvasRef.current) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !qrCanvasRef.current) return;
      QRCode.toCanvas(
        qrCanvasRef.current,
        vcfText,
        { errorCorrectionLevel: "M", margin: 2, width: 320 },
        (err) => {
          if (err) {
            // vcfText too long for QR — surface gentle warning.
            if (/code length overflow|too long|too big/i.test(err.message)) {
              toast.error("Card too detailed for a QR — remove a field or shorten the note.");
            }
          }
        },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [vcfText, mounted]);

  function patch<K extends keyof VCardInput>(k: K, v: VCardInput[K]) {
    setInput((s) => ({ ...s, [k]: v }));
  }

  function downloadVcf() {
    const blob = new Blob([vcfText], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestFilename(input);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Saved ${suggestFilename(input)}`);
  }

  async function copyVcf() {
    try {
      await navigator.clipboard.writeText(vcfText);
      toast.success("vCard text copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function downloadQrPng() {
    if (!qrCanvasRef.current) return;
    qrCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        toast.error("Couldn't render PNG");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${suggestFilename(input).replace(/\.vcf$/, "")}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Saved QR code PNG");
    }, "image/png");
  }

  function reset() {
    setInput(DEFAULT_VCARD);
    toast.success("Reset to defaults");
  }

  // Helpers for list fields
  function updateList<T>(key: "phones" | "emails" | "websites" | "addresses", idx: number, v: T) {
    setInput((s) => ({ ...s, [key]: (s[key] as T[]).map((x, i) => (i === idx ? v : x)) } as VCardInput));
  }
  function addToList(key: "phones" | "emails" | "websites" | "addresses") {
    setInput((s) => {
      if (key === "addresses") return { ...s, addresses: [...s.addresses, emptyAddressEntry("HOME")] };
      const defType = key === "phones" ? "CELL" : key === "emails" ? "WORK" : "WORK";
      return { ...s, [key]: [...(s[key] as ContactEntry[]), emptyContactEntry(defType)] } as VCardInput;
    });
  }
  function removeFromList(key: "phones" | "emails" | "websites" | "addresses", idx: number) {
    setInput((s) => ({ ...s, [key]: (s[key] as unknown[]).filter((_, i) => i !== idx) } as VCardInput));
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
      {/* Hero: QR + actions */}
      <section
        aria-label="vCard QR preview"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <canvas ref={qrCanvasRef} className="block rounded-lg bg-white p-2" />
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-indigo-300/80">vCard 3.0 · {vcfText.length} bytes</div>
            <h1 className="font-heading text-2xl font-bold text-indigo-50 sm:text-3xl">{[input.firstName, input.lastName].filter(Boolean).join(" ") || "Unnamed Contact"}</h1>
            <div className="text-sm text-indigo-200/80">
              {[input.title, input.organization].filter(Boolean).join(" · ")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" onClick={downloadVcf}>
                <Download className="size-3.5" />
                Download .vcf
              </Button>
              <Button type="button" variant="outline" onClick={downloadQrPng} className="bg-white/5 text-white">
                <QrCode className="size-3.5" />
                Download QR PNG
              </Button>
              <Button type="button" variant="outline" onClick={copyVcf} className="bg-white/5 text-white">
                <Copy className="size-3.5" />
                Copy text
              </Button>
              <Button type="button" variant="ghost" onClick={reset} className="text-white">
                <RefreshCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="address">Addresses</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-4 space-y-3">
          <Section title="Identity">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name"><Input value={input.firstName} onChange={(e) => patch("firstName", e.target.value)} /></Field>
              <Field label="Last name"><Input value={input.lastName} onChange={(e) => patch("lastName", e.target.value)} /></Field>
              <Field label="Middle name"><Input value={input.middleName} onChange={(e) => patch("middleName", e.target.value)} /></Field>
              <Field label="Prefix (Mr / Ms / Dr)"><Input value={input.prefix} onChange={(e) => patch("prefix", e.target.value)} /></Field>
              <Field label="Suffix (PhD / Jr)"><Input value={input.suffix} onChange={(e) => patch("suffix", e.target.value)} /></Field>
              <Field label="Nickname"><Input value={input.nickname} onChange={(e) => patch("nickname", e.target.value)} /></Field>
              <Field label="Organisation"><Input value={input.organization} onChange={(e) => patch("organization", e.target.value)} /></Field>
              <Field label="Department"><Input value={input.department} onChange={(e) => patch("department", e.target.value)} /></Field>
              <Field label="Job title"><Input value={input.title} onChange={(e) => patch("title", e.target.value)} /></Field>
              <Field label="Birthday (YYYY-MM-DD)"><Input type="date" value={input.birthday} onChange={(e) => patch("birthday", e.target.value)} /></Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="contact" className="mt-4 space-y-3">
          <ListSection
            title="Phones"
            entries={input.phones}
            onUpdate={(i, v) => updateList<ContactEntry>("phones", i, v)}
            onAdd={() => addToList("phones")}
            onRemove={(i) => removeFromList("phones", i)}
            typeOptions={PHONE_TYPES}
            placeholder="+1 (555) 123-4567"
          />
          <ListSection
            title="Emails"
            entries={input.emails}
            onUpdate={(i, v) => updateList<ContactEntry>("emails", i, v)}
            onAdd={() => addToList("emails")}
            onRemove={(i) => removeFromList("emails", i)}
            typeOptions={EMAIL_TYPES}
            placeholder="name@example.com"
          />
          <ListSection
            title="Websites"
            entries={input.websites}
            onUpdate={(i, v) => updateList<ContactEntry>("websites", i, v)}
            onAdd={() => addToList("websites")}
            onRemove={(i) => removeFromList("websites", i)}
            typeOptions={URL_TYPES}
            placeholder="https://example.com"
          />
        </TabsContent>

        <TabsContent value="address" className="mt-4 space-y-3">
          <Section title="Addresses" action={<Button type="button" size="sm" variant="outline" onClick={() => addToList("addresses")}><Plus className="size-3.5" />Add</Button>}>
            <div className="space-y-3">
              {input.addresses.length === 0 && <p className="text-xs text-muted-foreground">No addresses yet — click Add.</p>}
              {input.addresses.map((addr, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
                  <div className="flex items-center gap-2">
                    <Select value={addr.type} onValueChange={(v) => v && updateList<AddressEntry>("addresses", i, { ...addr, type: v })}>
                      <SelectTrigger className="w-32 justify-between">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeFromList("addresses", i)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Street" value={addr.street} onChange={(e) => updateList<AddressEntry>("addresses", i, { ...addr, street: e.target.value })} />
                    <Input placeholder="City" value={addr.city} onChange={(e) => updateList<AddressEntry>("addresses", i, { ...addr, city: e.target.value })} />
                    <Input placeholder="Region / State" value={addr.region} onChange={(e) => updateList<AddressEntry>("addresses", i, { ...addr, region: e.target.value })} />
                    <Input placeholder="Postal code" value={addr.postcode} onChange={(e) => updateList<AddressEntry>("addresses", i, { ...addr, postcode: e.target.value })} />
                    <Input placeholder="Country" value={addr.country} onChange={(e) => updateList<AddressEntry>("addresses", i, { ...addr, country: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="extras" className="mt-4 space-y-3">
          <Section title="Extras">
            <Field label="Photo URL (public)">
              <Input value={input.photoUrl} onChange={(e) => patch("photoUrl", e.target.value)} placeholder="https://example.com/photo.jpg" />
            </Field>
            <Field label="Note">
              <Textarea value={input.note} onChange={(e) => patch("note", e.target.value)} placeholder="Internal note attached to the contact card." className="min-h-[80px]" />
            </Field>
          </Section>
        </TabsContent>
      </Tabs>

      {/* VCF source preview */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ContactRound className="size-4 text-primary" />
          vCard source
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-[11px] leading-relaxed">
          <code>{vcfText}</code>
        </pre>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Notes
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Output is vCard 3.0 (RFC 2426) — broadest support across iOS Contacts, macOS, Google Contacts and Outlook.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Long lines fold at 75 octets per spec. Special characters (`,;\\\\n`) are escaped automatically.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />The QR code embeds the full .vcf — scanning on a phone offers an &quot;Add to contacts&quot; dialog.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Your contact data saves to localStorage on this device only.</li>
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

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
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

function ListSection({
  title,
  entries,
  onUpdate,
  onAdd,
  onRemove,
  typeOptions,
  placeholder,
}: {
  title: string;
  entries: ContactEntry[];
  onUpdate: (idx: number, v: ContactEntry) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  typeOptions: string[];
  placeholder: string;
}) {
  return (
    <Section
      title={title}
      action={
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-3.5" />
          Add
        </Button>
      }
    >
      <div className="space-y-2">
        {entries.length === 0 && <p className="text-xs text-muted-foreground">No entries yet.</p>}
        {entries.map((entry, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr_28px] items-center gap-2">
            <Select value={entry.type} onValueChange={(v) => v && onUpdate(i, { ...entry, type: v })}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={entry.value} onChange={(e) => onUpdate(i, { ...entry, value: e.target.value })} placeholder={placeholder} />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className={cn("grid place-items-center rounded-md border border-border/60 bg-background p-1.5 text-muted-foreground hover:bg-muted")}
              aria-label="Remove"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
