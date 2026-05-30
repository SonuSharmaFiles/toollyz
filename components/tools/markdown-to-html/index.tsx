"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Check, Code2, Copy, Download, Eye, FileText, Lock, Sparkles, SplitSquareHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { TEMPLATES, countElements, extractOutline, htmlDocument, renderMarkdown } from "@/lib/tools/text/markdown";

type View = "preview" | "html" | "split";

const TEXT_KEY = "toollyz:md-text";
const VIEW_KEY = "toollyz:md-view";

const DEFAULT_MD = `# Markdown to HTML

Paste **Markdown** on the left, see clean *HTML* on the right.

## Features

- Headings, lists & blockquotes
- Inline \`code\` and fenced blocks
- Tables, images & links

\`\`\`js
function hello(name) {
  return \`Hi, \${name}!\`;
}
\`\`\`

> Tip — click **Templates** to start from a README or blog post.

[Visit Toollyz](https://toollyz.com)
`;

const PROSE = "[&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:my-3 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-[#0b1020] [&_pre]:p-3 [&_pre]:text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-border/60 [&_td]:p-2 [&_hr]:my-6 [&_hr]:border-border [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded";

export default function MarkdownToHtml() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [md, setMd] = React.useState("");
  const [view, setView] = React.useState<View>("split");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      setMd(localStorage.getItem(TEXT_KEY) ?? DEFAULT_MD);
      const v = localStorage.getItem(VIEW_KEY); if (v === "preview" || v === "html" || v === "split") setView(v);
    } catch { setMd(DEFAULT_MD); }
    setMounted(true);
  }, []);
  React.useEffect(() => { if (!mounted) return; const id = window.setTimeout(() => { try { localStorage.setItem(TEXT_KEY, md); localStorage.setItem(VIEW_KEY, view); } catch { /* noop */ } }, 400); return () => window.clearTimeout(id); }, [md, view, mounted]);

  const deferred = React.useDeferredValue(md);
  const html = React.useMemo(() => renderMarkdown(deferred), [deferred]);
  const counts = React.useMemo(() => countElements(deferred), [deferred]);
  const outline = React.useMemo(() => extractOutline(deferred), [deferred]);
  const inChars = md.length;
  const outChars = html.length;

  async function copy(value: string, label: string) {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1200); toast.success(label); } catch { toast.error("Could not copy"); }
  }
  function downloadHtml() {
    const doc = htmlDocument(outline[0]?.text || "Document", html);
    downloadText(doc, "document.html", "text/html");
    toast.success("Downloaded HTML");
  }
  function downloadFragment() {
    downloadText(html, "fragment.html", "text/html");
    toast.success("Downloaded HTML fragment");
  }

  if (!mounted) return <div className="space-y-4" aria-hidden="true"><div className="h-24 animate-pulse rounded-3xl bg-muted" /><div className="grid gap-4 lg:grid-cols-2"><div className="h-96 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div></div>;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Markdown summary" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Markdown chars" value={inChars} reduceMotion={!!reduceMotion} />
          <Stat label="HTML chars" value={outChars} reduceMotion={!!reduceMotion} />
          <Stat label="Headings" value={counts.headings} reduceMotion={!!reduceMotion} />
          <Stat label="Code & tables" value={counts.codeBlocks + counts.tables + counts.images} reduceMotion={!!reduceMotion} />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5" role="group" aria-label="View">
          <SegBtn active={view === "split"} onClick={() => setView("split")} icon={<SplitSquareHorizontal className="size-3.5" />} label="Split" />
          <SegBtn active={view === "preview"} onClick={() => setView("preview")} icon={<Eye className="size-3.5" />} label="Preview" />
          <SegBtn active={view === "html"} onClick={() => setView("html")} icon={<Code2 className="size-3.5" />} label="HTML" />
        </div>
        <details className="relative">
          <summary className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"><Sparkles className="size-3.5" />Templates</summary>
          <div className="absolute left-0 z-10 mt-1 w-64 rounded-lg border border-border bg-card p-1 shadow-lg">
            {TEMPLATES.map((t) => (
              <button key={t.id} type="button" onClick={() => { setMd(t.content); toast.success(`Loaded ${t.label}`); }} className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
                <div className="font-medium">{t.label}</div>
                <div className="text-[11px] text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </details>
        <button type="button" onClick={() => setMd("")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"><Trash2 className="size-3.5" />Clear</button>
        <span className="ml-auto flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => copy(html, "HTML fragment copied")}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}Copy HTML</Button>
          <Button type="button" size="sm" variant="outline" onClick={downloadFragment}><Download className="size-4" />Fragment</Button>
          <Button type="button" size="sm" onClick={downloadHtml}><Download className="size-4" />Full .html</Button>
        </span>
      </div>

      {/* Editor + output */}
      <div className={cn("grid gap-4", view === "split" ? "lg:grid-cols-2" : "")}>
        {(view === "split" || (view !== "preview" && view !== "html")) && (
          <Panel label="Markdown" icon={<FileText className="size-4" />} subtitle={`${inChars.toLocaleString()} chars`}>
            <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={view === "split" ? 18 : 14} spellCheck={false} aria-label="Markdown input" placeholder="Write or paste Markdown…" className="h-full w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
          </Panel>
        )}
        {view === "split" && (
          <Panel label="Preview" icon={<Eye className="size-4" />} subtitle={`${outChars.toLocaleString()} chars`}>
            <div className={cn("max-h-[520px] overflow-auto rounded-xl border border-border/60 bg-background p-4", PROSE)} dangerouslySetInnerHTML={{ __html: html }} />
          </Panel>
        )}
        {view === "preview" && (
          <Panel label="Rendered HTML" icon={<Eye className="size-4" />} subtitle={`${outChars.toLocaleString()} chars`}>
            <div className={cn("rounded-xl border border-border/60 bg-background p-5", PROSE)} dangerouslySetInnerHTML={{ __html: html }} />
          </Panel>
        )}
        {view === "html" && (
          <Panel label="HTML output" icon={<Code2 className="size-4" />} subtitle={`${outChars.toLocaleString()} chars`}>
            <pre className="max-h-[520px] overflow-auto rounded-xl border border-border/60 bg-[#0b1020] p-3 font-mono text-[12px] leading-relaxed text-slate-100 whitespace-pre-wrap break-all">{html}</pre>
          </Panel>
        )}
        {/* Markdown panel for non-split views */}
        {view !== "split" && (
          <Panel label="Markdown" icon={<FileText className="size-4" />} subtitle={`${inChars.toLocaleString()} chars`}>
            <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={14} spellCheck={false} aria-label="Markdown input" placeholder="Write or paste Markdown…" className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
          </Panel>
        )}
      </div>

      {outline.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><FileText className="size-4 text-primary" />Outline</h2>
          <ul className="space-y-0.5 list-none">
            {outline.map((o, i) => (
              <li key={i} className="text-sm" style={{ paddingLeft: `${(o.level - 1) * 1.25}rem` }}><span className="text-muted-foreground">{"#".repeat(o.level)}</span> {o.text}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Markdown is rendered in your browser — Toollyz has no server.</p>
    </div>
  );
}

function Stat({ label, value, reduceMotion }: { label: string; value: number; reduceMotion: boolean }) {
  return (<div className="space-y-1"><div className="text-xs font-medium text-indigo-300/70">{label}</div><div className="font-heading text-2xl font-bold tabular-nums text-indigo-50 sm:text-3xl"><AnimatedNumber value={value} reduceMotion={reduceMotion} /></div></div>);
}
function Panel({ label, icon, subtitle, children }: { label: string; icon?: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border/70 bg-card p-4"><div className="mb-2 flex items-center justify-between"><h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><span className="text-primary">{icon}</span>{label}</h2>{subtitle && <span className="text-xs text-muted-foreground tabular-nums">{subtitle}</span>}</div>{children}</section>;
}
function SegBtn({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>;
}
