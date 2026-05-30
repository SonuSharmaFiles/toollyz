"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Compass,
  Globe,
  Info,
  Loader2,
  Lock,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Trash2,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isOnline } from "@/lib/tools/shared/net";
import { sunTimes } from "@/lib/tools/sun/solar";
import { geocode, type GeocodeResult } from "@/lib/tools/sun/geocode";

const STORAGE_KEY = "toollyz:world-clock";

interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

interface State {
  cities: City[];
  use24h: boolean;
  showSeconds: boolean;
}

const DEFAULTS: City[] = [
  { id: "ny", name: "New York", country: "United States", timezone: "America/New_York", latitude: 40.7128, longitude: -74.006 },
  { id: "lon", name: "London", country: "United Kingdom", timezone: "Europe/London", latitude: 51.5074, longitude: -0.1278 },
  { id: "ber", name: "Berlin", country: "Germany", timezone: "Europe/Berlin", latitude: 52.52, longitude: 13.405 },
  { id: "dub", name: "Dubai", country: "United Arab Emirates", timezone: "Asia/Dubai", latitude: 25.2048, longitude: 55.2708 },
  { id: "ind", name: "Mumbai", country: "India", timezone: "Asia/Kolkata", latitude: 19.076, longitude: 72.8777 },
  { id: "sgp", name: "Singapore", country: "Singapore", timezone: "Asia/Singapore", latitude: 1.3521, longitude: 103.8198 },
  { id: "tok", name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { id: "syd", name: "Sydney", country: "Australia", timezone: "Australia/Sydney", latitude: -33.8688, longitude: 151.2093 },
];

const DEFAULT_STATE: State = {
  cities: DEFAULTS,
  use24h: true,
  showSeconds: true,
};

export default function WorldClock() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const [now, setNow] = React.useState(new Date());
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    setOnline(isOnline());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({ ...DEFAULT_STATE, ...parsed });
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

  React.useEffect(() => {
    if (!mounted) return;
    const tickInterval = state.showSeconds ? 1000 : 30000;
    const id = window.setInterval(() => setNow(new Date()), tickInterval);
    return () => window.clearInterval(id);
  }, [mounted, state.showSeconds]);

  async function runSearch() {
    if (!isOnline()) {
      setOnline(false);
      return;
    }
    setError(null);
    setSearching(true);
    setResults([]);
    const r = await geocode(query);
    setSearching(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    if (r.results.length === 0) {
      setError(`No cities matched "${query}".`);
      return;
    }
    setResults(r.results);
  }

  function addResult(res: GeocodeResult) {
    const id = `c${res.id}-${Math.random().toString(36).slice(2, 5)}`;
    const city: City = {
      id,
      name: res.name,
      country: res.country,
      timezone: res.timezone,
      latitude: res.latitude,
      longitude: res.longitude,
    };
    setState((s) => ({ ...s, cities: [...s.cities, city] }));
    setResults([]);
    setQuery("");
    toast.success(`Added ${res.name}`);
  }

  function addMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const city: City = {
          id: `me-${Math.random().toString(36).slice(2, 6)}`,
          name: "Here",
          country: tz,
          timezone: tz,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setState((s) => ({ ...s, cities: [city, ...s.cities] }));
        toast.success("Added your location at the top");
      },
      (err) => {
        toast.error(`Geolocation denied: ${err.message}`);
      },
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 },
    );
  }

  function remove(id: string) {
    setState((s) => ({ ...s, cities: s.cities.filter((c) => c.id !== id) }));
  }

  function move(id: string, delta: number) {
    setState((s) => {
      const idx = s.cities.findIndex((c) => c.id === id);
      if (idx < 0) return s;
      const newIdx = Math.max(0, Math.min(s.cities.length - 1, idx + delta));
      if (newIdx === idx) return s;
      const next = [...s.cities];
      const [item] = next.splice(idx, 1);
      next.splice(newIdx, 0, item);
      return { ...s, cities: next };
    });
  }

  function reset() {
    setState(DEFAULT_STATE);
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
      {/* Header */}
      <section
        aria-label="World clock"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300/70">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
            <div className="font-mono text-3xl font-bold tabular-nums text-indigo-50 sm:text-4xl">
              {formatTime(now, Intl.DateTimeFormat().resolvedOptions().timeZone, state.use24h, state.showSeconds)}
            </div>
            <div className="text-xs text-indigo-200/80">
              {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-2 text-indigo-100/90">
              <input
                type="checkbox"
                checked={state.use24h}
                onChange={(e) => setState((s) => ({ ...s, use24h: e.target.checked }))}
                className="size-4 rounded border-white/30 accent-emerald-400 bg-white/5"
              />
              24-hour
            </label>
            <label className="flex items-center gap-2 text-indigo-100/90">
              <input
                type="checkbox"
                checked={state.showSeconds}
                onChange={(e) => setState((s) => ({ ...s, showSeconds: e.target.checked }))}
                className="size-4 rounded border-white/30 accent-emerald-400 bg-white/5"
              />
              Show seconds
            </label>
            <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white">
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Search / add */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Globe className="size-4 text-primary" />
          Add a city
        </h2>
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="query" className="text-xs font-medium">Search</Label>
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runSearch();
                }
              }}
              placeholder="Paris, Tokyo, Mexico City…"
            />
          </div>
          <Button type="button" onClick={runSearch} disabled={searching || !query.trim()}>
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
          <Button type="button" variant="outline" onClick={addMyLocation}>
            <Compass className="size-4" />
            My location
          </Button>
        </div>
        {!online && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-sm text-amber-700 dark:text-amber-400">
            <WifiOff className="size-4" />
            City search needs an internet connection. Existing clocks keep ticking offline.
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
                  onClick={() => addResult(res)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-background p-2.5 text-left text-sm hover:bg-muted/40"
                >
                  <span>
                    <strong>{res.name}</strong>
                    <span className="text-muted-foreground"> · {[res.admin1, res.country].filter(Boolean).join(", ")}</span>
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <span>{res.timezone}</span>
                    <Plus className="size-3" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* City grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.cities.map((city, i) => (
          <CityCard
            key={city.id}
            city={city}
            now={now}
            use24h={state.use24h}
            showSeconds={state.showSeconds}
            onRemove={() => remove(city.id)}
            onUp={() => move(city.id, -1)}
            onDown={() => move(city.id, 1)}
            isFirst={i === 0}
            isLast={i === state.cities.length - 1}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this clock
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Globe className="mt-0.5 size-3.5 shrink-0 text-primary" />Times use your browser&apos;s built-in IANA tz database via `Intl.DateTimeFormat`. DST transitions match the OS.</li>
          <li className="flex items-start gap-1.5"><Sun className="mt-0.5 size-3.5 shrink-0 text-amber-500" />The day/night badge is computed offline via the NOAA solar algorithm using each city&apos;s coordinates and the current date.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Cities are added via the open-source Open-Meteo geocoder — your browser hits it directly, Toollyz has no server.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />The city list saves to localStorage on this device only.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        Clocks tick in your browser — only city searches go to Open-Meteo.
      </p>
    </div>
  );
}

function CityCard({
  city,
  now,
  use24h,
  showSeconds,
  onRemove,
  onUp,
  onDown,
  isFirst,
  isLast,
}: {
  city: City;
  now: Date;
  use24h: boolean;
  showSeconds: boolean;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const sun = React.useMemo(() => sunTimes(now, city.latitude, city.longitude), [now, city.latitude, city.longitude]);
  const isDaytime = React.useMemo(() => {
    if (sun.alwaysDay) return true;
    if (sun.alwaysNight) return false;
    if (!sun.sunriseUTC || !sun.sunsetUTC) return null;
    const t = now.getTime();
    return t >= sun.sunriseUTC.getTime() && t < sun.sunsetUTC.getTime();
  }, [sun, now]);
  const offsetMinutes = utcOffsetMinutes(city.timezone, now);
  const offsetLabel = formatOffset(offsetMinutes);
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4",
        isDaytime
          ? "border-amber-200/40 bg-gradient-to-br from-amber-50/40 via-card to-card dark:from-amber-500/10"
          : "border-indigo-300/30 bg-gradient-to-br from-indigo-50/30 via-card to-card dark:from-indigo-500/10",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{city.name}</div>
          <div className="truncate text-[10px] text-muted-foreground">{city.country} · {city.timezone}</div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button type="button" size="icon-xs" variant="outline" onClick={onUp} disabled={isFirst} aria-label="Move up">
            <ArrowUp className="size-3" />
          </Button>
          <Button type="button" size="icon-xs" variant="outline" onClick={onDown} disabled={isLast} aria-label="Move down">
            <ArrowDown className="size-3" />
          </Button>
          <Button type="button" size="icon-xs" variant="ghost" onClick={onRemove} aria-label="Remove">
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <div className="font-mono text-3xl font-bold tabular-nums">
          {formatTime(now, city.timezone, use24h, showSeconds)}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isDaytime
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
          )}
        >
          {isDaytime === null ? "—" : isDaytime ? "Day" : "Night"}
          {isDaytime ? <Sun className="-mt-0.5 ml-1 inline size-3" /> : <Moon className="-mt-0.5 ml-1 inline size-3" />}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {now.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: city.timezone })} · UTC{offsetLabel}
      </div>
    </article>
  );
}

function formatTime(now: Date, tz: string, use24h: boolean, showSeconds: boolean): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24h,
    timeZone: tz,
  };
  if (showSeconds) options.second = "2-digit";
  try {
    return new Intl.DateTimeFormat(undefined, options).format(now);
  } catch {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone: undefined }).format(now);
  }
}

function utcOffsetMinutes(timezone: string, when: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(when).reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour === "24" ? "0" : parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    return Math.round((asUtc - when.getTime()) / 60000);
  } catch {
    return -when.getTimezoneOffset();
  }
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `${sign}${h}` : `${sign}${h}:${String(m).padStart(2, "0")}`;
}
