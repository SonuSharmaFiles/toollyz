"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Eraser,
  Keyboard,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SAMPLE_SHEET,
  type Shortcut,
  type ShortcutSection,
  type ShortcutSheet,
  newSection,
  newShortcut,
  parseKeys,
  toMarkdown,
  toPlainText,
} from "@/lib/tools/text/kb-shortcuts";

const KEY = "toollyz:kb-shortcuts";

export default function KeyboardShortcutGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [sheet, setSheet] = React.useState<ShortcutSheet>(SAMPLE_SHEET);
  const [copiedMd, setCopiedMd] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ShortcutSheet;
        if (parsed && Array.isArray(parsed.sections)) setSheet(parsed);
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(sheet));
    } catch {
      /* noop */
    }
  }, [sheet, mounted]);

  const md = React.useMemo(() => toMarkdown(sheet), [sheet]);
  const txt = React.useMemo(() => toPlainText(sheet), [sheet]);

  const totalItems = sheet.sections.reduce((sum, s) => sum + s.items.length, 0);

  function updateSection(id: string, patch: Partial<ShortcutSection>) {
    setSheet((s) => ({
      ...s,
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
    }));
  }
  function updateItem(secId: string, idx: number, patch: Partial<Shortcut>) {
    setSheet((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === secId
          ? { ...sec, items: sec.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }
          : sec,
      ),
    }));
  }
  function addItem(secId: string) {
    setSheet((s) => ({
      ...s,
      sections: s.sections.map((sec) => (sec.id === secId ? { ...sec, items: [...sec.items, newShortcut()] } : sec)),
    }));
  }
  function removeItem(secId: string, idx: number) {
    setSheet((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === secId ? { ...sec, items: sec.items.filter((_, i) => i !== idx) } : sec,
      ),
    }));
  }
  function addSection() {
    setSheet((s) => ({ ...s, sections: [...s.sections, newSection()] }));
  }
  function removeSection(id: string) {
    setSheet((s) => ({ ...s, sections: s.sections.filter((sec) => sec.id !== id) }));
  }

  async function copy(value: string, ref?: "md") {
    try {
      await navigator.clipboard.writeText(value);
      if (ref === "md") {
        setCopiedMd(true);
        window.setTimeout(() => setCopiedMd(false), 1200);
      }
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
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
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.20),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Sheet title</div>
            <Input
              value={sheet.title}
              onChange={(e) => setSheet((s) => ({ ...s, title: e.target.value }))}
              className="h-10 border-white/20 bg-white/5 font-heading text-lg font-bold tracking-tight text-white"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Shortcuts</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-emerald-300 sm:text-3xl">
              {totalItems}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSheet(SAMPLE_SHEET)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3" />
          Sample (VS Code)
        </button>
        <button
          type="button"
          onClick={() => setSheet({ title: "Untitled cheat sheet", sections: [] })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
        >
          <Eraser className="size-3" />
          Clear
        </button>
        <Button type="button" size="sm" variant="outline" onClick={addSection}>
          <Plus className="size-3.5" />
          Add section
        </Button>
      </div>

      {/* Live preview / printable cheat sheet */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-5 shadow-inner print:shadow-none">
        <h2 className="font-heading text-xl font-bold tracking-tight">{sheet.title}</h2>
        {sheet.sections.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
            No sections — click 'Add section' or 'Sample'.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {sheet.sections.map((sec) => (
            <div key={sec.id} className="rounded-xl border border-border/60 bg-background/50 p-3">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {sec.title}
              </div>
              <div className="space-y-1.5">
                {sec.items.length === 0 && (
                  <div className="text-[11px] text-muted-foreground/70">No shortcuts.</div>
                )}
                {sec.items.map((it, idx) => (
                  <div key={idx} className="flex items-baseline justify-between gap-3 text-xs">
                    <span>{it.description || <span className="text-muted-foreground/60">(no description)</span>}</span>
                    <span className="shrink-0">
                      {it.keys
                        .split(/\s*\|\s*/)
                        .map((chord, ci) => (
                          <React.Fragment key={ci}>
                            {ci > 0 && <span className="mx-1 text-muted-foreground/70">or</span>}
                            {parseKeys(chord).map((k, ki) => (
                              <React.Fragment key={ki}>
                                {ki > 0 && <span className="mx-0.5 text-muted-foreground/70">+</span>}
                                <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold shadow-sm">
                                  {k}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editor */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold tracking-tight">Editor</h2>
        {sheet.sections.map((sec) => (
          <div key={sec.id} className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex items-center gap-2">
              <Input
                value={sec.title}
                onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                className="h-8 font-semibold"
                placeholder="Section title"
              />
              <Button type="button" size="sm" variant="ghost" onClick={() => addItem(sec.id)}>
                <Plus className="size-3.5" />
                Row
              </Button>
              <button
                type="button"
                onClick={() => removeSection(sec.id)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500"
                aria-label="Remove section"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {sec.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center gap-1.5 text-xs">
                  <Input
                    value={it.description}
                    onChange={(e) => updateItem(sec.id, idx, { description: e.target.value })}
                    placeholder="Action"
                    className="col-span-7 h-8"
                  />
                  <Input
                    value={it.keys}
                    onChange={(e) => updateItem(sec.id, idx, { keys: e.target.value })}
                    placeholder="Cmd+Shift+P or A | B"
                    className="col-span-4 h-8 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(sec.id, idx)}
                    className="col-span-1 ml-auto rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500"
                    aria-label="Remove row"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Keyboard className="size-4 text-primary" />
            Markdown export
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => copy(txt)}>
              <Copy className="size-3.5" />
              Plain text
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(md, "md")}>
              {copiedMd ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copy Markdown
            </Button>
          </div>
        </div>
        <pre className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px]">
          {md}
        </pre>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <ShieldCheck className="size-3" />
        Cheat sheet editing and export run entirely in your browser — Toollyz has no server.
      </p>
    </div>
  );
}
