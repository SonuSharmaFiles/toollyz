"use client";

import * as React from "react";
import {
  CheckCircle2,
  Code,
  Copy,
  Eye,
  Info,
  Lock,
  Mailbox,
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
  DEFAULT_INPUT,
  renderHtml,
  type SignatureInput,
} from "@/lib/tools/email-sig/signature";

const STORAGE_KEY = "toollyz:email-signature";

export default function EmailSignatureGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState<SignatureInput>(DEFAULT_INPUT);
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...DEFAULT_INPUT, ...(JSON.parse(raw) as Partial<SignatureInput>) });
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

  const html = React.useMemo(() => renderHtml(input), [input]);

  function patch<K extends keyof SignatureInput>(k: K, v: SignatureInput[K]) {
    setInput((s) => ({ ...s, [k]: v }));
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML copied — paste into your email client's source view.");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function copyRich() {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      toast.error("Rich-copy isn't supported here — use Copy HTML and paste into the signature editor.");
      return;
    }
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([buildPlainText(input)], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
      toast.success("Rich signature copied — paste directly into Gmail / Outlook signature settings.");
    } catch {
      toast.error("Rich-copy failed. Try Copy HTML instead.");
    }
  }

  function reset() {
    setInput(DEFAULT_INPUT);
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
        aria-label="Signature preview"
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            Live preview
          </span>
          <span className="font-mono text-muted-foreground">Sample email body</span>
        </div>
        <div
          ref={previewRef}
          className="mt-4 text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
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
            <Field label="Full name"><Input value={input.fullName} onChange={(e) => patch("fullName", e.target.value)} /></Field>
            <Field label="Pronouns (optional)"><Input value={input.pronouns} onChange={(e) => patch("pronouns", e.target.value)} placeholder="she/her" /></Field>
            <Field label="Job title"><Input value={input.jobTitle} onChange={(e) => patch("jobTitle", e.target.value)} /></Field>
            <Field label="Company"><Input value={input.company} onChange={(e) => patch("company", e.target.value)} /></Field>
            <Field label="Photo URL" hint="120×120 PNG/JPG works best. Leave empty to hide.">
              <Input value={input.photoUrl} onChange={(e) => patch("photoUrl", e.target.value)} placeholder="https://…" />
            </Field>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={input.photoRound}
                onChange={(e) => patch("photoRound", e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              Round avatar (use square for logos)
            </label>
          </Section>
        </TabsContent>

        <TabsContent value="contact" className="mt-4 space-y-3">
          <Section title="Contact">
            <Field label="Email"><Input type="email" value={input.email} onChange={(e) => patch("email", e.target.value)} /></Field>
            <Field label="Phone"><Input value={input.phone} onChange={(e) => patch("phone", e.target.value)} /></Field>
            <Field label="Website"><Input value={input.website} onChange={(e) => patch("website", e.target.value)} placeholder="example.com" /></Field>
            <Field label="Address (optional)"><Input value={input.address} onChange={(e) => patch("address", e.target.value)} placeholder="Brooklyn, NY" /></Field>
          </Section>
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-3">
          <Section title="Social">
            <Field label="LinkedIn"><Input value={input.linkedin} onChange={(e) => patch("linkedin", e.target.value)} placeholder="linkedin.com/in/handle" /></Field>
            <Field label="X / Twitter"><Input value={input.twitter} onChange={(e) => patch("twitter", e.target.value)} placeholder="x.com/handle" /></Field>
            <Field label="GitHub"><Input value={input.github} onChange={(e) => patch("github", e.target.value)} placeholder="github.com/handle" /></Field>
            <Field label="Instagram"><Input value={input.instagram} onChange={(e) => patch("instagram", e.target.value)} placeholder="instagram.com/handle" /></Field>
            <Field label="YouTube"><Input value={input.youtube} onChange={(e) => patch("youtube", e.target.value)} placeholder="youtube.com/@channel" /></Field>
          </Section>
        </TabsContent>

        <TabsContent value="style" className="mt-4 space-y-3">
          <Section title="Brand colour">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={input.brandColor}
                onChange={(e) => patch("brandColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-lg border border-border p-1"
                aria-label="Brand colour"
              />
              <Input value={input.brandColor} onChange={(e) => patch("brandColor", e.target.value)} className="font-mono" />
            </div>
          </Section>
          <Section title="Disclaimer (optional)">
            <Textarea
              value={input.disclaimer}
              onChange={(e) => patch("disclaimer", e.target.value)}
              placeholder="Confidentiality notice or legal disclaimer…"
              className="min-h-[80px] font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Rendered in 11 px muted grey below the signature block.</p>
          </Section>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <section className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-card p-4">
        <Button type="button" onClick={copyRich}>
          <Sparkles className="size-4" />
          Copy rich (Gmail / Outlook)
        </Button>
        <Button type="button" variant="outline" onClick={copyHtml}>
          <Code className="size-4" />
          Copy HTML source
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          <RefreshCcw className="size-3.5" />
          Reset
        </Button>
      </section>

      {/* HTML source */}
      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Code className="size-4 text-primary" />
          HTML source
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-[11px]">
          <code>{html}</code>
        </pre>
      </section>

      {/* Tips */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          Tips for setup
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Mailbox className="mt-0.5 size-3.5 shrink-0 text-primary" /><strong>Gmail</strong>: Settings → General → Signature → paste with <strong>Copy rich</strong>.</li>
          <li className="flex items-start gap-1.5"><Mailbox className="mt-0.5 size-3.5 shrink-0 text-primary" /><strong>Outlook (web)</strong>: Settings → Mail → Compose and reply → paste with Copy rich.</li>
          <li className="flex items-start gap-1.5"><Mailbox className="mt-0.5 size-3.5 shrink-0 text-primary" /><strong>Apple Mail</strong>: Preferences → Signatures → drag a temp HTML file (use Copy HTML and save to .html).</li>
          <li className="flex items-start gap-1.5"><Mailbox className="mt-0.5 size-3.5 shrink-0 text-primary" />Photo URL must be publicly hosted — upload to your CDN or use an avatar service like Gravatar.</li>
          <li className="flex items-start gap-1.5"><Mailbox className="mt-0.5 size-3.5 shrink-0 text-primary" />Outlook desktop strips some styles — keep the layout simple and rely on inline CSS (already done).</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — your details save to localStorage on this device only.</li>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function buildPlainText(input: SignatureInput): string {
  void cn;
  const lines: string[] = [];
  const head: string[] = [];
  if (input.fullName) head.push(input.fullName);
  if (input.pronouns) head.push(`(${input.pronouns})`);
  if (head.length) lines.push(head.join(" "));
  const role = [input.jobTitle, input.company].filter(Boolean).join(" · ");
  if (role) lines.push(role);
  const contact: string[] = [];
  if (input.email) contact.push(input.email);
  if (input.phone) contact.push(input.phone);
  if (input.website) contact.push(input.website);
  if (input.address) contact.push(input.address);
  if (contact.length) lines.push(contact.join(" · "));
  return lines.join("\n");
}
