"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Info,
  KeySquare,
  Lock,
  RefreshCcw,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  buildAlphabet,
  describeClasses,
  generate,
  type DisposableOptions,
  type DisposableResult,
} from "@/lib/tools/disposable/disposable";

const STORAGE_KEY = "toollyz:disposable-settings";

interface State extends DisposableOptions {
  autoClearSec: number;
}

const DEFAULT_STATE: State = {
  length: 20,
  grouped: true,
  includeUpper: true,
  includeLower: true,
  includeDigits: true,
  includeSymbols: false,
  avoidConfusables: true,
  autoClearSec: 30,
};

interface DisplayEntry {
  id: number;
  password: string;
  entropyBits: number;
  copiedAt: number | null;
  expired: boolean;
}

export default function DisposablePasswordGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [entries, setEntries] = React.useState<DisplayEntry[]>([]);
  const [reveal, setReveal] = React.useState(true);
  const counterRef = React.useRef(0);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      // Don't persist passwords — only the settings.
      const { autoClearSec, ...opts } = state;
      void autoClearSec;
      void opts;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  // Generate the first password on mount.
  React.useEffect(() => {
    if (mounted && entries.length === 0) makeOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Expire passwords after autoClearSec seconds from copy.
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.copiedAt === null || entry.expired) return entry;
          if (now - entry.copiedAt >= state.autoClearSec * 1000) {
            return { ...entry, expired: true };
          }
          return entry;
        }),
      );
    }, 250);
    return () => window.clearInterval(id);
  }, [mounted, state.autoClearSec]);

  function makeOne() {
    try {
      const r: DisposableResult = generate(state);
      const id = ++counterRef.current;
      setEntries((prev) => [{ id, password: r.password, entropyBits: r.entropyBits, copiedAt: null, expired: false }, ...prev].slice(0, 8));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate");
    }
  }

  function clearAll() {
    setEntries([]);
  }

  async function copy(entry: DisplayEntry) {
    if (entry.expired) {
      toast.error("This password has expired — generate a fresh one.");
      return;
    }
    try {
      await navigator.clipboard.writeText(entry.password);
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, copiedAt: performance.now() } : e)));
      toast.success(`Copied · auto-clears from screen in ${state.autoClearSec}s`);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function reset() {
    setState(DEFAULT_STATE);
    setEntries([]);
    toast.success("Reset to defaults");
  }

  const alphabet = React.useMemo(() => buildAlphabet(state), [state]);

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
      {/* Hero — latest password */}
      <section
        aria-label="Latest password"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-2 text-xs text-indigo-200/80">
          <span className="uppercase tracking-wider">{state.length} chars · {alphabet.length}-char alphabet · ~{entries[0]?.entropyBits ?? 0} bits</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5">
            <Timer className="-mt-0.5 mr-1 inline size-3" />
            Auto-clear {state.autoClearSec}s after copy
          </span>
        </div>
        <div className="relative mt-3 font-mono text-2xl font-bold tabular-nums break-words text-emerald-100 sm:text-3xl">
          {entries[0] ? (
            entries[0].expired ? <span className="text-rose-300">[expired — generate a new one]</span> : reveal ? entries[0].password : "•".repeat(Math.min(entries[0].password.length, 32))
          ) : (
            "…"
          )}
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <Button type="button" size="sm" onClick={() => entries[0] && copy(entries[0])} disabled={!entries[0] || entries[0].expired}>
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={makeOne} className="bg-white/5 text-white">
            <RefreshCcw className="size-3.5" />
            Generate next
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setReveal((r) => !r)} className="text-white">
            {reveal ? <><EyeOff className="size-3.5" />Hide</> : <><Eye className="size-3.5" />Show</>}
          </Button>
        </div>
      </section>

      {/* Settings */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <KeySquare className="size-4 text-primary" />
          Password settings
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="font-medium">Length</Label>
            <span className="font-mono tabular-nums">{state.length} chars</span>
          </div>
          <Slider
            value={[state.length]}
            onValueChange={(v) => setState((s) => ({ ...s, length: Math.round(Array.isArray(v) ? v[0] : (v as number)) }))}
            min={8}
            max={64}
            step={1}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <Toggle label="Uppercase A-Z" checked={state.includeUpper} onChange={(v) => setState((s) => ({ ...s, includeUpper: v }))} />
          <Toggle label="Lowercase a-z" checked={state.includeLower} onChange={(v) => setState((s) => ({ ...s, includeLower: v }))} />
          <Toggle label="Digits 0-9" checked={state.includeDigits} onChange={(v) => setState((s) => ({ ...s, includeDigits: v }))} />
          <Toggle label="Symbols !@#$%&amp;*?+−=" checked={state.includeSymbols} onChange={(v) => setState((s) => ({ ...s, includeSymbols: v }))} />
          <Toggle label="Avoid Il1O0" checked={state.avoidConfusables} onChange={(v) => setState((s) => ({ ...s, avoidConfusables: v }))} />
          <Toggle label="Group with dashes" checked={state.grouped} onChange={(v) => setState((s) => ({ ...s, grouped: v }))} />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Alphabet: <code className="font-mono">{alphabet.length}</code> chars — {describeClasses(state)}
          {state.avoidConfusables ? " (Il1O0 excluded)" : ""}.
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Auto-clear from screen ({state.autoClearSec}s)</Label>
          <Slider
            value={[state.autoClearSec]}
            onValueChange={(v) => setState((s) => ({ ...s, autoClearSec: Math.round(Array.isArray(v) ? v[0] : (v as number)) }))}
            min={5}
            max={300}
            step={5}
          />
          <p className="text-[11px] text-muted-foreground">Triggers after Copy. Set higher if you need time to paste into a remote system; lower if you&apos;re sharing your screen.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={clearAll}>
            Clear all
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <RefreshCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>

      {/* Recent batch */}
      {entries.length > 1 && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" />
            Recent ({entries.length})
          </h2>
          <ul className="space-y-1 list-none">
            {entries.slice(1).map((entry) => (
              <li key={entry.id} className={cn("flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2 text-xs", entry.expired && "opacity-50 line-through")}>
                <code className="min-w-0 flex-1 break-all font-mono">{entry.expired ? "[expired]" : reveal ? entry.password : "•".repeat(Math.min(entry.password.length, 32))}</code>
                <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">{entry.entropyBits} bits</span>
                <button
                  type="button"
                  onClick={() => copy(entry)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  aria-label="Copy"
                  disabled={entry.expired}
                >
                  <Copy className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Honest framing */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4" />
          What &quot;disposable&quot; means here
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Shield className="mt-0.5 size-3.5 shrink-0" />Toollyz is a static site — there is <strong>no server-side expiring link</strong>. Disposable here means <em>generate fresh, copy once, clear quickly</em>.</li>
          <li className="flex items-start gap-1.5"><Shield className="mt-0.5 size-3.5 shrink-0" />For real shared self-destructing secrets, use a hosted service like <strong>1Password Items Sharing</strong>, <strong>Bitwarden Send</strong>, <strong>OneTimeSecret</strong> or <strong>PrivateBin</strong>.</li>
          <li className="flex items-start gap-1.5"><Shield className="mt-0.5 size-3.5 shrink-0" />Each Generate next produces a fresh password. The displayed password is cleared {state.autoClearSec}s after you copy it — not after a delay since generation.</li>
          <li className="flex items-start gap-1.5"><Shield className="mt-0.5 size-3.5 shrink-0" />Passwords are never persisted — only the settings save to localStorage. Reloading the page wipes everything.</li>
        </ul>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the math
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Characters drawn with <code className="font-mono">crypto.getRandomValues</code> + rejection sampling — no modulo bias, no Math.random fallback.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Entropy = length × log₂(alphabet size). Avoiding confusables shrinks the alphabet by 5 characters.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Group with dashes adds visual structure but doesn&apos;t change entropy — the underlying chars are random.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — all randomness is local, settings save to localStorage, passwords never persist.</li>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={cn("flex items-center gap-2 rounded-lg border p-2 cursor-pointer", checked ? "border-primary bg-primary/5" : "border-border/60 bg-background")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-border accent-primary" />
      <span>{label}</span>
    </label>
  );
}
