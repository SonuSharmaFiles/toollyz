"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Globe,
  Info,
  Lock,
  RefreshCcw,
  Share2,
  Sparkles,
  Tags,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { TwitterIcon } from "@/components/shared/social-icons";
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
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  DEFAULT_META,
  OG_TYPE_OPTIONS,
  TWITTER_CARD_OPTIONS,
  analyze,
  counts,
  generateHtml,
  previewHost,
  type MetaInput,
  type OgType,
  type TwitterCardType,
} from "@/lib/tools/seo/meta-tags";

const STORAGE_KEY = "toollyz:meta-tag-input";

function field<K extends keyof MetaInput>(input: MetaInput, k: K, v: MetaInput[K]): MetaInput {
  return { ...input, [k]: v };
}

export default function MetaTagGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [input, setInput] = React.useState<MetaInput>(DEFAULT_META);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...DEFAULT_META, ...(JSON.parse(raw) as Partial<MetaInput>) });
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

  const html = React.useMemo(() => generateHtml(input), [input]);
  const { issues, score } = React.useMemo(() => analyze(input), [input]);
  const { totalTags, ogCount, twitterCount } = React.useMemo(() => counts(input), [input]);

  const titleLen = input.title.length;
  const descLen = input.description.length;
  const titlePct = Math.min(100, (titleLen / 60) * 100);
  const descPct = Math.min(100, (descLen / 160) * 100);

  function reset() {
    setInput(DEFAULT_META);
    toast.success("Reset to Toollyz defaults");
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("Copied meta tags to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "head.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded head.html");
  }

  const scoreColor =
    score >= 85
      ? "text-emerald-300"
      : score >= 60
        ? "text-amber-300"
        : "text-rose-300";

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        aria-label="SEO snapshot"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Tags written" value={totalTags} reduceMotion={!!reduceMotion} />
          <Stat label="Open Graph" value={ogCount} reduceMotion={!!reduceMotion} accent="text-sky-300" />
          <Stat label="Twitter Card" value={twitterCount} reduceMotion={!!reduceMotion} accent="text-indigo-300" />
          <Stat label="SEO score" value={score} reduceMotion={!!reduceMotion} suffix=" / 100" accent={scoreColor} />
        </div>
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <LenBar label="Title" value={titleLen} max={60} pct={titlePct} hint="50–60 chars" />
          <LenBar label="Description" value={descLen} max={160} pct={descPct} hint="150–160 chars" />
        </div>
      </section>

      {/* 2-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* Form */}
        <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Wand2 className="size-4 text-primary" />
              Page details
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="og">Open Graph</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3">
              <FieldRow label="Page title" htmlFor="title" hint="50–60 chars">
                <Input
                  id="title"
                  value={input.title}
                  onChange={(e) => setInput(field(input, "title", e.target.value))}
                  placeholder="Your page title"
                />
              </FieldRow>
              <FieldRow label="Description" htmlFor="description" hint="150–160 chars">
                <Textarea
                  id="description"
                  value={input.description}
                  onChange={(e) => setInput(field(input, "description", e.target.value))}
                  placeholder="A short, action-oriented summary of what this page is about."
                  className="min-h-[88px]"
                />
              </FieldRow>
              <FieldRow label="Keywords" htmlFor="keywords" hint="Comma-separated (optional)">
                <Input
                  id="keywords"
                  value={input.keywords}
                  onChange={(e) => setInput(field(input, "keywords", e.target.value))}
                  placeholder="design tools, online utility"
                />
              </FieldRow>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Author" htmlFor="author">
                  <Input
                    id="author"
                    value={input.author}
                    onChange={(e) => setInput(field(input, "author", e.target.value))}
                    placeholder="Your name or team"
                  />
                </FieldRow>
                <FieldRow label="Canonical URL" htmlFor="canonical">
                  <Input
                    id="canonical"
                    value={input.canonical}
                    onChange={(e) => setInput(field(input, "canonical", e.target.value))}
                    placeholder="https://example.com/page"
                  />
                </FieldRow>
              </div>
            </TabsContent>

            <TabsContent value="og" className="space-y-3">
              <FieldRow label="og:title" htmlFor="ogTitle" hint="Defaults to page title">
                <Input
                  id="ogTitle"
                  value={input.ogTitle}
                  onChange={(e) => setInput(field(input, "ogTitle", e.target.value))}
                  placeholder="Optional override of the page title"
                />
              </FieldRow>
              <FieldRow label="og:description" htmlFor="ogDescription" hint="Defaults to page description">
                <Textarea
                  id="ogDescription"
                  value={input.ogDescription}
                  onChange={(e) => setInput(field(input, "ogDescription", e.target.value))}
                  placeholder="Optional override of the page description"
                  className="min-h-[72px]"
                />
              </FieldRow>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="og:type" htmlFor="ogType">
                  <Select
                    value={input.ogType}
                    onValueChange={(v) => setInput(field(input, "ogType", v as OgType))}
                  >
                    <SelectTrigger id="ogType" className="w-full justify-between">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OG_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="og:locale" htmlFor="ogLocale">
                  <Input
                    id="ogLocale"
                    value={input.ogLocale}
                    onChange={(e) => setInput(field(input, "ogLocale", e.target.value))}
                    placeholder="en_US"
                  />
                </FieldRow>
              </div>
              <FieldRow label="og:image" htmlFor="ogImage" hint="1200×630 PNG/JPG recommended">
                <Input
                  id="ogImage"
                  value={input.ogImage}
                  onChange={(e) => setInput(field(input, "ogImage", e.target.value))}
                  placeholder="https://example.com/og.png"
                />
              </FieldRow>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="og:image:alt" htmlFor="ogImageAlt">
                  <Input
                    id="ogImageAlt"
                    value={input.ogImageAlt}
                    onChange={(e) => setInput(field(input, "ogImageAlt", e.target.value))}
                    placeholder="Describe the image"
                  />
                </FieldRow>
                <FieldRow label="og:site_name" htmlFor="ogSiteName">
                  <Input
                    id="ogSiteName"
                    value={input.ogSiteName}
                    onChange={(e) => setInput(field(input, "ogSiteName", e.target.value))}
                    placeholder="Your brand"
                  />
                </FieldRow>
              </div>
              <FieldRow label="og:url" htmlFor="ogUrl" hint="Defaults to canonical">
                <Input
                  id="ogUrl"
                  value={input.ogUrl}
                  onChange={(e) => setInput(field(input, "ogUrl", e.target.value))}
                  placeholder="https://example.com/page"
                />
              </FieldRow>
            </TabsContent>

            <TabsContent value="twitter" className="space-y-3">
              <FieldRow label="twitter:card" htmlFor="twitterCard">
                <Select
                  value={input.twitterCard}
                  onValueChange={(v) => setInput(field(input, "twitterCard", v as TwitterCardType))}
                >
                  <SelectTrigger id="twitterCard" className="w-full justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TWITTER_CARD_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="twitter:site" htmlFor="twitterSite" hint="@yourbrand">
                  <Input
                    id="twitterSite"
                    value={input.twitterSite}
                    onChange={(e) => setInput(field(input, "twitterSite", e.target.value))}
                    placeholder="@yourbrand"
                  />
                </FieldRow>
                <FieldRow label="twitter:creator" htmlFor="twitterCreator" hint="@author">
                  <Input
                    id="twitterCreator"
                    value={input.twitterCreator}
                    onChange={(e) => setInput(field(input, "twitterCreator", e.target.value))}
                    placeholder="@author"
                  />
                </FieldRow>
              </div>
              <FieldRow label="twitter:title" htmlFor="twitterTitle" hint="Defaults to og:title">
                <Input
                  id="twitterTitle"
                  value={input.twitterTitle}
                  onChange={(e) => setInput(field(input, "twitterTitle", e.target.value))}
                  placeholder="Optional override"
                />
              </FieldRow>
              <FieldRow label="twitter:description" htmlFor="twitterDescription" hint="Defaults to og:description">
                <Textarea
                  id="twitterDescription"
                  value={input.twitterDescription}
                  onChange={(e) => setInput(field(input, "twitterDescription", e.target.value))}
                  placeholder="Optional override"
                  className="min-h-[72px]"
                />
              </FieldRow>
              <FieldRow label="twitter:image" htmlFor="twitterImage" hint="Defaults to og:image">
                <Input
                  id="twitterImage"
                  value={input.twitterImage}
                  onChange={(e) => setInput(field(input, "twitterImage", e.target.value))}
                  placeholder="https://example.com/twitter.png"
                />
              </FieldRow>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="robots" htmlFor="robots" hint="index/follow or noindex/nofollow">
                  <Input
                    id="robots"
                    value={input.robots}
                    onChange={(e) => setInput(field(input, "robots", e.target.value))}
                    placeholder="index, follow"
                  />
                </FieldRow>
                <FieldRow label="theme-color" htmlFor="themeColor" hint="Mobile address bar">
                  <div className="flex items-center gap-2">
                    <Input
                      id="themeColor"
                      type="color"
                      value={input.themeColor || "#000000"}
                      onChange={(e) => setInput(field(input, "themeColor", e.target.value))}
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                    <Input
                      value={input.themeColor}
                      onChange={(e) => setInput(field(input, "themeColor", e.target.value))}
                      placeholder="#0b1020"
                      className="font-mono"
                    />
                  </div>
                </FieldRow>
                <FieldRow label="language" htmlFor="language">
                  <Input
                    id="language"
                    value={input.language}
                    onChange={(e) => setInput(field(input, "language", e.target.value))}
                    placeholder="en"
                  />
                </FieldRow>
                <FieldRow label="favicon" htmlFor="favicon">
                  <Input
                    id="favicon"
                    value={input.favicon}
                    onChange={(e) => setInput(field(input, "favicon", e.target.value))}
                    placeholder="/favicon.ico"
                  />
                </FieldRow>
                <FieldRow label="viewport" htmlFor="viewport">
                  <Input
                    id="viewport"
                    value={input.viewport}
                    onChange={(e) => setInput(field(input, "viewport", e.target.value))}
                    placeholder="width=device-width, initial-scale=1"
                  />
                </FieldRow>
                <FieldRow label="charset" htmlFor="charset">
                  <Input
                    id="charset"
                    value={input.charset}
                    onChange={(e) => setInput(field(input, "charset", e.target.value))}
                    placeholder="UTF-8"
                  />
                </FieldRow>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Previews & output */}
        <section className="space-y-4">
          {/* Google SERP preview */}
          <PreviewCard icon={<Globe className="size-3.5" />} label="Google search result">
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <div className="truncate font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                {previewHost(input.canonical || "https://example.com")}
              </div>
              <div className="mt-0.5 truncate text-base text-[#1a0dab] dark:text-[#8ab4f8]">
                {input.title || "Page title appears here"}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {input.description || "Your page description will appear here in the Google search snippet."}
              </div>
            </div>
          </PreviewCard>

          {/* Facebook / LinkedIn preview */}
          <PreviewCard icon={<Share2 className="size-3.5" />} label="Facebook / LinkedIn / Slack">
            <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
              {input.ogImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={input.ogImage}
                  alt={input.ogImageAlt || ""}
                  className="aspect-[1.91/1] w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="grid aspect-[1.91/1] w-full place-items-center bg-muted text-xs text-muted-foreground">
                  No og:image set
                </div>
              )}
              <div className="space-y-0.5 p-3">
                <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  {previewHost(input.ogUrl || input.canonical || "https://example.com")}
                </div>
                <div className="line-clamp-2 text-sm font-semibold">
                  {input.ogTitle || input.title || "Page title"}
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {input.ogDescription || input.description || "Page description"}
                </div>
              </div>
            </div>
          </PreviewCard>

          {/* Twitter / X preview */}
          <PreviewCard icon={<TwitterIcon className="size-3.5" />} label="Twitter / X card">
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-border/60 bg-background",
                input.twitterCard === "summary_large_image" ? "" : "flex",
              )}
            >
              {(input.twitterImage || input.ogImage) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={input.twitterImage || input.ogImage}
                  alt=""
                  className={cn(
                    "object-cover",
                    input.twitterCard === "summary_large_image" ? "aspect-[2/1] w-full" : "h-[88px] w-[88px] shrink-0",
                  )}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className={cn(
                    "grid place-items-center bg-muted text-[10px] text-muted-foreground",
                    input.twitterCard === "summary_large_image" ? "aspect-[2/1] w-full" : "h-[88px] w-[88px] shrink-0",
                  )}
                >
                  No image
                </div>
              )}
              <div className="space-y-0.5 p-3">
                <div className="truncate text-[10px] text-muted-foreground">
                  {previewHost(input.ogUrl || input.canonical || "https://example.com")}
                </div>
                <div className="line-clamp-2 text-sm font-semibold">
                  {input.twitterTitle || input.ogTitle || input.title || "Page title"}
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {input.twitterDescription || input.ogDescription || input.description || "Page description"}
                </div>
              </div>
            </div>
          </PreviewCard>
        </section>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <CheckCircle2 className="size-4 text-primary" />
            SEO checks
          </h2>
          <ul className="grid gap-1.5 text-xs sm:grid-cols-2 list-none">
            {issues.map((iss, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2",
                  iss.level === "error"
                    ? "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400"
                    : iss.level === "warn"
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                      : "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400",
                )}
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{iss.msg}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Output */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Tags className="size-4 text-primary" />
            Generated HTML
          </h2>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={copyHtml}>
              <Copy className="size-4" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={downloadHtml}>
              <Download className="size-4" />
              Download
            </Button>
          </div>
        </div>
        <pre className="max-h-[420px] overflow-auto rounded-lg border border-border/60 bg-background p-3 text-[12px] leading-relaxed">
          <code className="font-mono">{html}</code>
        </pre>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="size-3" />
          Paste this inside your page&apos;s <code className="font-mono">&lt;head&gt;</code>. Replace existing duplicate tags rather than appending.
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Sparkles className="size-3 text-emerald-500" />
        Everything is generated in your browser — nothing is uploaded.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  reduceMotion,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  reduceMotion: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div
        className={cn(
          "font-heading text-2xl font-bold tabular-nums sm:text-3xl",
          accent ?? "text-indigo-50",
        )}
      >
        <AnimatedNumber value={value} reduceMotion={reduceMotion} suffix={suffix} />
      </div>
    </div>
  );
}

function LenBar({
  label,
  value,
  max,
  pct,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  pct: number;
  hint: string;
}) {
  const over = value > max;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-indigo-200/80">
        <span>{label}</span>
        <span className="font-mono tabular-nums">
          {value} / {max} <span className="text-indigo-300/60">· {hint}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full transition-all", over ? "bg-rose-400" : pct > 70 ? "bg-emerald-400" : "bg-indigo-400")}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function FieldRow({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs font-medium">
          {label}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function PreviewCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </section>
  );
}
