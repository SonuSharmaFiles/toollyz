"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Eraser,
  Keyboard,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  FINGER_COLORS,
  FINGER_LABELS,
  HOME_KEYS,
  LAYOUTS,
  LAYOUTS_META,
  SAMPLE_TEXT,
  analyseLoad,
  fingerAt,
  type LayoutId,
} from "@/lib/tools/text/keyboard-layouts";

const TEXT_KEY = "toollyz:kbd-text";
const LAYOUT_KEY = "toollyz:kbd-layout";

export default function KeyboardLayoutVisualizer() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [layoutId, setLayoutId] = React.useState<LayoutId>("qwerty");
  const [text, setText] = React.useState(SAMPLE_TEXT);

  React.useEffect(() => {
    try {
      setText(localStorage.getItem(TEXT_KEY) ?? SAMPLE_TEXT);
      const l = localStorage.getItem(LAYOUT_KEY);
      if (l === "qwerty" || l === "dvorak" || l === "colemak" || l === "azerty" || l === "workman") setLayoutId(l);
    } catch {
      setText(SAMPLE_TEXT);
    }
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TEXT_KEY, text);
      localStorage.setItem(LAYOUT_KEY, layoutId);
    } catch {
      /* noop */
    }
  }, [text, layoutId, mounted]);

  const layout = LAYOUTS[layoutId];
  const meta = LAYOUTS_META.find((m) => m.id === layoutId)!;
  const home = HOME_KEYS[layoutId];
  const load = React.useMemo(() => analyseLoad(text, layoutId), [text, layoutId]);

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1 col-span-2">
            <div className="text-xs font-medium text-sky-300/70">Layout</div>
            <div className="font-heading text-2xl font-bold tracking-tight text-sky-50 sm:text-3xl">
              {meta.name}
            </div>
            <div className="text-[11px] text-muted-foreground">{meta.region} · {meta.year} · {meta.hint}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Home row %</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={Math.round(load.homeRowPct)} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-300/70">Strong fingers %</div>
            <div className="font-heading text-2xl font-bold tabular-nums text-sky-50 sm:text-3xl">
              <AnimatedNumber value={Math.round(load.strongFingerPct)} reduceMotion={!!reduceMotion} />
              <span className="text-base text-sky-100/40">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Layout picker */}
      <div className="rounded-2xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Keyboard className="size-3.5 text-primary" />
          Layout
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LAYOUTS_META.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setLayoutId(m.id)}
              aria-pressed={layoutId === m.id}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                layoutId === m.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:bg-muted",
              )}
            >
              {m.name}
              <span className="ml-1 text-[10px] opacity-60">{m.region}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard render */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="overflow-x-auto">
          <div className="inline-block space-y-1.5">
            {layout.map((row, rIdx) => (
              <div
                key={rIdx}
                className={cn("flex gap-1", rIdx === 1 && "ml-3", rIdx === 2 && "ml-5", rIdx === 3 && "ml-8")}
              >
                {row.map((ch, cIdx) => {
                  const finger = fingerAt(rIdx, cIdx);
                  const color = finger ? FINGER_COLORS[finger] : "#94a3b8";
                  const isHome = rIdx === 2 && home.includes(ch);
                  return (
                    <div
                      key={cIdx}
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-md border font-mono text-sm transition-transform hover:-translate-y-0.5 sm:h-12 sm:w-12",
                      )}
                      style={{
                        borderColor: color,
                        backgroundColor: `${color}26`,
                        color: "var(--foreground)",
                      }}
                      title={finger ? FINGER_LABELS[finger] : ""}
                    >
                      <div className="text-center">
                        <div className="text-sm">{ch}</div>
                        {isHome && <div className="-mt-1 size-1 mx-auto rounded-full bg-current" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="ml-12 mt-2 grid h-10 w-64 place-items-center rounded-md border border-muted bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground sm:h-12 sm:w-80">
              Space (thumbs)
            </div>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Home row marked with a dot. Key colour = which finger types it. Pinkies are red/pink; indexes are green/cyan; thumbs are gray.
        </p>
      </section>

      {/* Sample text + finger load */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold tracking-tight">Finger load analyser</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder="Type or paste text — we'll count how many keystrokes each finger types on this layout."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setText(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Sparkles className="size-3" />
            Sample
          </button>
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Eraser className="size-3" />
            Clear
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Finger</th>
                <th className="px-3 py-2 text-right">Keystrokes</th>
                <th className="px-3 py-2 text-left">Load</th>
              </tr>
            </thead>
            <tbody>
              {load.perFinger.map((f) => (
                <tr key={f.finger} className="border-t border-border/40">
                  <td className="px-3 py-1.5 font-mono">{FINGER_LABELS[f.finger]}</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">{f.count}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, f.pct)}%`, backgroundColor: FINGER_COLORS[f.finger] }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">{f.pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Keyboard className="size-3" />
        Layout rendering and finger-load analysis run entirely in your browser.
      </p>
    </div>
  );
}
