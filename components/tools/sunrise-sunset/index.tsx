"use client";

import * as React from "react";
import {
  AlertTriangle,
  Calendar,
  Compass,
  Info,
  Loader2,
  Lock,
  MapPin,
  RefreshCcw,
  Search,
  Sparkles,
  Sun,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isOnline } from "@/lib/tools/shared/net";
import { formatDayLength, sunTimes } from "@/lib/tools/sun/solar";
import { geocode, type GeocodeResult } from "@/lib/tools/sun/geocode";

const STORAGE_KEY = "toollyz:sunrise-input";

interface State {
  latitude: number;
  longitude: number;
  timezone: string;
  label: string;
  date: string; // YYYY-MM-DD
  query: string;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATE: State = {
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: "Europe/London",
  label: "London, United Kingdom",
  date: todayISO(),
  query: "London",
};

export default function SunriseSunset() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [online, setOnline] = React.useState(true);
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState((s) => ({ ...s, ...parsed, date: parsed.date ?? todayISO() }));
      }
    } catch {
      /* noop */
    }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, mounted]);

  const dateAtNoonUtc = React.useMemo(() => {
    const [y, m, d] = state.date.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }, [state.date]);

  const result = React.useMemo(() => sunTimes(dateAtNoonUtc, state.latitude, state.longitude), [dateAtNoonUtc, state.latitude, state.longitude]);

  function formatInZone(date: Date | null): string {
    if (!date) return "—";
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: state.timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    }
  }

  function formatUtc(date: Date | null): string {
    if (!date) return "—";
    return date.toISOString().slice(11, 19);
  }

  async function runSearch() {
    if (!isOnline()) {
      setOnline(false);
      return;
    }
    setError(null);
    setSearching(true);
    setResults([]);
    const r = await geocode(state.query);
    setSearching(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    if (r.results.length === 0) {
      setError(`No cities matched "${state.query}".`);
      return;
    }
    setResults(r.results);
  }

  function pickResult(res: GeocodeResult) {
    setState((s) => ({
      ...s,
      latitude: res.latitude,
      longitude: res.longitude,
      timezone: res.timezone,
      label: [res.name, res.admin1, res.country].filter(Boolean).join(", "),
    }));
    setResults([]);
    toast.success(`Loaded ${res.name}`);
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setState((s) => ({
          ...s,
          latitude: Math.round(pos.coords.latitude * 10000) / 10000,
          longitude: Math.round(pos.coords.longitude * 10000) / 10000,
          timezone: tz,
          label: `Your location (${tz})`,
        }));
        toast.success("Loaded your current coordinates");
      },
      (err) => {
        toast.error(`Geolocation denied: ${err.message}`);
      },
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 },
    );
  }

  function reset() {
    setState({ ...DEFAULT_STATE, date: todayISO() });
    setResults([]);
    setError(null);
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
      {/* Hero */}
      <section
        aria-label="Sunrise and sunset"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#0b1020] to-orange-900/30 p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-200/80">{state.timezone}</div>
              <div className="font-heading text-2xl font-bold text-amber-50 sm:text-3xl">{state.label}</div>
              <div className="font-mono text-xs text-amber-200/70">
                {state.latitude.toFixed(4)}, {state.longitude.toFixed(4)} · {state.date}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={useMyLocation} className="bg-white/5 text-white">
                <Compass className="size-3.5" />
                My location
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white">
                <RefreshCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </div>
          {result.alwaysDay && (
            <div className="rounded-lg border border-amber-300/40 bg-amber-300/10 p-3 text-sm text-amber-200">
              The sun never sets at this latitude on this date — polar day.
            </div>
          )}
          {result.alwaysNight && (
            <div className="rounded-lg border border-indigo-400/40 bg-indigo-400/10 p-3 text-sm text-indigo-200">
              The sun never rises at this latitude on this date — polar night.
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <TimeCard label="Sunrise" icon={<SunriseIcon className="size-5 text-amber-300" />} value={formatInZone(result.sunriseUTC)} utc={formatUtc(result.sunriseUTC)} accent="text-amber-200" />
            <TimeCard label="Solar noon" icon={<Sun className="size-5 text-amber-300" />} value={formatInZone(result.noonUTC)} utc={formatUtc(result.noonUTC)} accent="text-amber-100" />
            <TimeCard label="Sunset" icon={<SunsetIcon className="size-5 text-orange-300" />} value={formatInZone(result.sunsetUTC)} utc={formatUtc(result.sunsetUTC)} accent="text-orange-200" />
          </div>
          <div className="rounded-lg border border-amber-200/30 bg-amber-200/5 p-3 text-sm text-amber-100">
            Day length: <strong className="font-mono">{formatDayLength(result.dayLengthSec)}</strong>
          </div>
        </div>
      </section>

      {/* Location search */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <MapPin className="size-4 text-primary" />
          City search
        </h2>
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="query" className="text-xs font-medium">Search for a city</Label>
            <Input
              id="query"
              value={state.query}
              onChange={(e) => setState((s) => ({ ...s, query: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runSearch();
                }
              }}
              placeholder="Paris, Tokyo, San Francisco…"
            />
          </div>
          <Button type="button" onClick={runSearch} disabled={searching || !state.query.trim()}>
            {searching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="size-4" />
                Search
              </>
            )}
          </Button>
        </div>
        {!online && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-sm text-amber-700 dark:text-amber-400">
            <WifiOff className="size-4" />
            You appear to be offline — city search needs an internet connection.
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            {error}
          </p>
        )}
        {results.length > 0 && (
          <ul className="space-y-1.5 list-none">
            {results.map((res) => (
              <li key={res.id}>
                <button
                  type="button"
                  onClick={() => pickResult(res)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-background p-2.5 text-left text-sm hover:bg-muted/40"
                >
                  <span>
                    <strong>{res.name}</strong>
                    <span className="text-muted-foreground"> · {[res.admin1, res.country].filter(Boolean).join(", ")}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {res.latitude.toFixed(2)}, {res.longitude.toFixed(2)} · {res.timezone}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Manual coordinates */}
      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="lat" className="text-xs font-medium">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="0.0001"
            min={-90}
            max={90}
            value={state.latitude}
            onChange={(e) => setState((s) => ({ ...s, latitude: Number(e.target.value) || 0 }))}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lon" className="text-xs font-medium">Longitude</Label>
          <Input
            id="lon"
            type="number"
            step="0.0001"
            min={-180}
            max={180}
            value={state.longitude}
            onChange={(e) => setState((s) => ({ ...s, longitude: Number(e.target.value) || 0 }))}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-medium">Date</Label>
          <Input
            id="date"
            type="date"
            value={state.date}
            onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
            className="font-mono"
          />
        </div>
      </section>

      {/* Twilights */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Twilights
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Civil (sun at 6° below horizon), nautical (12°) and astronomical (18°) — the moments when twilight begins and ends.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <TwilightRow label="Civil twilight" dawn={formatInZone(result.civilDawnUTC)} dusk={formatInZone(result.civilDuskUTC)} tint="from-amber-500/10" />
          <TwilightRow label="Nautical twilight" dawn={formatInZone(result.nauticalDawnUTC)} dusk={formatInZone(result.nauticalDuskUTC)} tint="from-orange-500/10" />
          <TwilightRow label="Astronomical twilight" dawn={formatInZone(result.astroDawnUTC)} dusk={formatInZone(result.astroDuskUTC)} tint="from-indigo-500/10" />
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About the calculation
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Sun className="mt-0.5 size-3.5 shrink-0 text-amber-500" />Uses NOAA&apos;s Solar Position Algorithm — accurate to ±1 minute for typical latitudes. Refraction is accounted for via the official zenith (90.833°).</li>
          <li className="flex items-start gap-1.5"><Calendar className="mt-0.5 size-3.5 shrink-0 text-primary" />Sun math runs offline. City search uses the open-source <strong>Open-Meteo</strong> geocoder; no Toollyz server is in the path.</li>
          <li className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />Polar day / polar night detection: at high latitudes the sun may not rise or set on a given date. The hero shows a banner when that happens.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. Your last location and date save to localStorage on this device only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <Sparkles className="size-3 text-amber-500" />
        Sun math runs in your browser. City lookups go directly from your browser to Open-Meteo.
      </p>
    </div>
  );
}

function TimeCard({ label, icon, value, utc, accent }: { label: string; icon: React.ReactNode; value: string; utc: string; accent: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-200/80">
        {icon}
        {label}
      </div>
      <div className={cn("font-mono text-2xl font-bold tabular-nums", accent)}>{value}</div>
      <div className="font-mono text-[10px] text-amber-100/60">{utc} UTC</div>
    </div>
  );
}

function TwilightRow({ label, dawn, dusk, tint }: { label: string; dawn: string; dusk: string; tint: string }) {
  return (
    <div className={cn("space-y-2 rounded-2xl border border-border/60 bg-gradient-to-br p-3", tint, "to-transparent")}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dawn</div>
          <div className="font-mono">{dawn}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dusk</div>
          <div className="font-mono">{dusk}</div>
        </div>
      </div>
    </div>
  );
}
