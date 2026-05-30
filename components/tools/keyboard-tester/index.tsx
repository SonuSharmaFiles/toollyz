"use client";

import * as React from "react";
import { Info, Keyboard, Lock, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/animated-number";

interface Key { code: string; label: string; w?: number; sublabel?: string }

const ROWS: Key[][] = [
  [{ code: "Escape", label: "Esc", w: 1.25 }, { code: "F1", label: "F1" }, { code: "F2", label: "F2" }, { code: "F3", label: "F3" }, { code: "F4", label: "F4" }, { code: "F5", label: "F5" }, { code: "F6", label: "F6" }, { code: "F7", label: "F7" }, { code: "F8", label: "F8" }, { code: "F9", label: "F9" }, { code: "F10", label: "F10" }, { code: "F11", label: "F11" }, { code: "F12", label: "F12" }],
  [{ code: "Backquote", label: "`" }, { code: "Digit1", label: "1" }, { code: "Digit2", label: "2" }, { code: "Digit3", label: "3" }, { code: "Digit4", label: "4" }, { code: "Digit5", label: "5" }, { code: "Digit6", label: "6" }, { code: "Digit7", label: "7" }, { code: "Digit8", label: "8" }, { code: "Digit9", label: "9" }, { code: "Digit0", label: "0" }, { code: "Minus", label: "-" }, { code: "Equal", label: "=" }, { code: "Backspace", label: "⌫", w: 2 }],
  [{ code: "Tab", label: "Tab", w: 1.5 }, { code: "KeyQ", label: "Q" }, { code: "KeyW", label: "W" }, { code: "KeyE", label: "E" }, { code: "KeyR", label: "R" }, { code: "KeyT", label: "T" }, { code: "KeyY", label: "Y" }, { code: "KeyU", label: "U" }, { code: "KeyI", label: "I" }, { code: "KeyO", label: "O" }, { code: "KeyP", label: "P" }, { code: "BracketLeft", label: "[" }, { code: "BracketRight", label: "]" }, { code: "Backslash", label: "\\", w: 1.5 }],
  [{ code: "CapsLock", label: "Caps", w: 1.75 }, { code: "KeyA", label: "A" }, { code: "KeyS", label: "S" }, { code: "KeyD", label: "D" }, { code: "KeyF", label: "F" }, { code: "KeyG", label: "G" }, { code: "KeyH", label: "H" }, { code: "KeyJ", label: "J" }, { code: "KeyK", label: "K" }, { code: "KeyL", label: "L" }, { code: "Semicolon", label: ";" }, { code: "Quote", label: "'" }, { code: "Enter", label: "Enter ↵", w: 2.25 }],
  [{ code: "ShiftLeft", label: "⇧ Shift", w: 2.25 }, { code: "KeyZ", label: "Z" }, { code: "KeyX", label: "X" }, { code: "KeyC", label: "C" }, { code: "KeyV", label: "V" }, { code: "KeyB", label: "B" }, { code: "KeyN", label: "N" }, { code: "KeyM", label: "M" }, { code: "Comma", label: "," }, { code: "Period", label: "." }, { code: "Slash", label: "/" }, { code: "ShiftRight", label: "⇧ Shift", w: 2.75 }],
  [{ code: "ControlLeft", label: "Ctrl", w: 1.5 }, { code: "MetaLeft", label: "⌘", w: 1.25 }, { code: "AltLeft", label: "Alt", w: 1.25 }, { code: "Space", label: "Space", w: 6.25 }, { code: "AltRight", label: "Alt", w: 1.25 }, { code: "MetaRight", label: "⌘", w: 1.25 }, { code: "ControlRight", label: "Ctrl", w: 1.5 }],
];

const ARROWS: Key[][] = [
  [{ code: "ArrowUp", label: "↑" }],
  [{ code: "ArrowLeft", label: "←" }, { code: "ArrowDown", label: "↓" }, { code: "ArrowRight", label: "→" }],
];

const KEEP_FOCUS_KEYS = new Set(["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "/"]);

interface LastEvent {
  key: string; code: string; keyCode: number; which?: number; location: number; repeat: boolean;
  ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean; at: number;
}

export default function KeyboardTester() {
  const [pressed, setPressed] = React.useState<Set<string>>(new Set());
  const [ever, setEver] = React.useState<Set<string>>(new Set());
  const [last, setLast] = React.useState<LastEvent | null>(null);
  const [recent, setRecent] = React.useState<LastEvent[]>([]);

  React.useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (KEEP_FOCUS_KEYS.has(e.key) || e.code === "Tab") e.preventDefault();
      const detail: LastEvent = { key: e.key, code: e.code, keyCode: e.keyCode, which: e.which, location: e.location, repeat: e.repeat, ctrlKey: e.ctrlKey, altKey: e.altKey, shiftKey: e.shiftKey, metaKey: e.metaKey, at: Date.now() };
      setPressed((prev) => new Set(prev).add(e.code));
      setEver((prev) => new Set(prev).add(e.code));
      setLast(detail);
      if (!e.repeat) setRecent((prev) => [detail, ...prev].slice(0, 12));
    };
    const onUp = (e: KeyboardEvent) => { setPressed((prev) => { const s = new Set(prev); s.delete(e.code); return s; }); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  function reset() { setEver(new Set()); setLast(null); setRecent([]); setPressed(new Set()); toast.success("Reset"); }

  const totalKeys = ROWS.flat().length + ARROWS.flat().length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section aria-label="Keyboard stats" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Unique keys tested" value={ever.size} />
          <Stat label="Currently held" value={pressed.size} />
          <Stat label="Layout coverage" value={Math.round((ever.size / totalKeys) * 100)} suffix="%" />
          <Stat label="Total events" value={recent.length === 12 ? "12+" : recent.length} />
        </div>
        <p className="relative mt-4 flex items-center gap-1.5 text-[11px] text-indigo-300/70"><Info className="size-3" />Press any key. Tab and arrows are captured so they don&apos;t move focus away.</p>
      </section>

      {/* Last event */}
      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Keyboard className="size-4 text-primary" />Last key event</h2>
        {last ? (
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-border/60 bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">key</div>
              <div className="font-heading text-2xl font-bold">{last.key === " " ? "Space" : last.key}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">code</div>
              <div className="font-mono text-sm font-medium">{last.code}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">keyCode</div>
              <div className="font-mono text-sm font-medium tabular-nums">{last.keyCode}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">location</div>
              <div className="font-mono text-sm font-medium">{["standard", "left", "right", "numpad"][last.location] ?? last.location}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">modifiers</div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {[["Ctrl", last.ctrlKey], ["Alt", last.altKey], ["Shift", last.shiftKey], ["Meta", last.metaKey]].filter(([, v]) => v).map(([n]) => <span key={n as string} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">{n}</span>)}
                {last.repeat && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-amber-600 dark:text-amber-400">repeat</span>}
                {(!last.ctrlKey && !last.altKey && !last.shiftKey && !last.metaKey && !last.repeat) && <span className="text-muted-foreground">none</span>}
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Press any key on your keyboard to see its event details.</p>
        )}
      </section>

      {/* Virtual keyboard */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Keyboard className="size-4 text-primary" />Virtual keyboard</h2>
          <Button type="button" size="sm" variant="outline" onClick={reset}><RotateCw className="size-4" />Reset</Button>
        </div>
        <div className="overflow-x-auto">
          <div className="space-y-1.5 min-w-[800px]">
            {ROWS.map((row, i) => (
              <div key={i} className="flex gap-1.5">
                {row.map((k) => <Cap key={k.code} k={k} pressed={pressed.has(k.code)} ever={ever.has(k.code)} />)}
              </div>
            ))}
            {/* Arrow cluster */}
            <div className="mt-3 flex flex-col items-end gap-1.5">
              <div className="flex gap-1.5"><Cap k={ARROWS[0][0]} pressed={pressed.has("ArrowUp")} ever={ever.has("ArrowUp")} /></div>
              <div className="flex gap-1.5">{ARROWS[1].map((k) => <Cap key={k.code} k={k} pressed={pressed.has(k.code)} ever={ever.has(k.code)} />)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Keyboard className="size-4 text-primary" />Recent events</h2>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-1.5 font-medium">Key</th><th className="px-3 py-1.5 font-medium">Code</th><th className="px-3 py-1.5 text-right font-medium">keyCode</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recent.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 font-medium">{r.key === " " ? "Space" : r.key}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">{r.code}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums">{r.keyCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="size-3" />Everything happens in your browser — keystrokes are never sent anywhere.</p>
    </div>
  );
}

function Cap({ k, pressed, ever }: { k: Key; pressed: boolean; ever: boolean }) {
  const w = k.w ?? 1;
  return (
    <div
      style={{ flex: w, minHeight: 48 }}
      className={cn(
        "flex select-none items-center justify-center rounded-md border text-sm font-medium transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_rgba(99,102,241,0.25)]"
          : ever
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border/60 bg-background text-foreground/70",
      )}
    >
      {k.label}
    </div>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-indigo-300/70">{label}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-indigo-50 sm:text-3xl">
        {typeof value === "number" ? <AnimatedNumber value={value} suffix={suffix} /> : <>{value}{suffix}</>}
      </div>
    </div>
  );
}
