"use client";

import * as React from "react";
import {
  Copy,
  Download,
  ExternalLink,
  Eraser,
  Image as ImageIcon,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { detectAndBuild } from "@/lib/tools/text/thumb-urls";

const KEY = "toollyz:thumb-downloader-input";

const SAMPLES = [
  { label: "YouTube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "Shorts", url: "https://www.youtube.com/shorts/4t2yDM_LFMI" },
  { label: "Vimeo", url: "https://vimeo.com/76979871" },
  { label: "Dailymotion", url: "https://www.dailymotion.com/video/x7tgad0" },
];

export default function ThumbnailDownloader() {
  const [mounted, setMounted] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? SAMPLES[0].url);
    } catch {
      setText(SAMPLES[0].url);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, text);
    } catch {
      /* noop */
    }
  }, [text, mounted]);

  const result = React.useMemo(() => detectAndBuild(text), [text]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function download(url: string, suggestedName: string) {
    // Open in new tab — direct download of cross-origin images requires
    // canvas re-encoding (CORS hits), which YouTube's img CDN allows but
    // Vimeo's doesn't. Easiest: target=_blank + suggested filename via
    // the download attribute.
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ImageIcon className="size-4 text-primary" />
          Video URL or ID
        </h2>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=… or a bare YouTube video ID"
          className="h-9 font-mono text-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setText(s.url)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <Sparkles className="size-3" />
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Eraser className="size-3" />
            Clear
          </button>
        </div>
      </section>

      {result.error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          {result.error}
        </div>
      )}

      {result.thumbs.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight capitalize">
              {result.platform} thumbnails ({result.thumbs.length})
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              ID: {result.videoId}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.thumbs.map((t, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border/60 bg-background/50 p-3">
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.url}
                    alt={t.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold">{t.label}</span>
                    {t.width && t.height && (
                      <span className="font-mono text-muted-foreground">{t.width} × {t.height}</span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground break-all">{t.url}</div>
                  <div className="flex gap-1.5">
                    <Button type="button" size="sm" variant="outline" onClick={() => copy(t.url)}>
                      <Copy className="size-3.5" />
                      Copy URL
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => download(t.url, `${result.platform}-${result.videoId}-${t.label.split(" ")[0].toLowerCase()}.jpg`)}
                    >
                      <Download className="size-3.5" />
                      Open
                    </Button>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" />
                      Tab
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.notes && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-700 dark:text-sky-300">
          <Info className="mr-1 inline size-3.5" />
          {result.notes}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        URL parsing happens in your browser. Image previews load directly from each platform's CDN — no Toollyz server in the middle.
      </p>
    </div>
  );
}

void cn;
