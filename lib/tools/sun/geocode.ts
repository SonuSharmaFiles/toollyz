// Free Open-Meteo geocoder used by the Toollyz Sunrise & Sunset tool. The
// browser hits the public CORS-enabled endpoint directly — Toollyz has no
// backend in the path.

import { fetchWithTimeout } from "@/lib/tools/shared/net";

export interface GeocodeResult {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

interface OpenMeteoResult {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    country_code?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone: string;
    population?: number;
  }>;
}

export async function geocode(query: string, count = 6): Promise<{ ok: true; results: GeocodeResult[] } | { ok: false; error: string }> {
  const trimmed = query.trim();
  if (!trimmed) return { ok: false, error: "Type a city name." };
  const params = new URLSearchParams({
    name: trimmed,
    count: String(Math.max(1, Math.min(20, count))),
    language: "en",
    format: "json",
  });
  const r = await fetchWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    timeoutMs: 8000,
    cache: "no-store",
  });
  if (!r.ok) return { ok: false, error: r.kind === "timeout" ? "Geocoding timed out." : "Couldn't reach the Open-Meteo geocoder." };
  try {
    const data = (await r.response.json()) as OpenMeteoResult;
    if (!data.results) return { ok: true, results: [] };
    return {
      ok: true,
      results: data.results.map((r) => ({
        id: r.id,
        name: r.name,
        country: r.country,
        countryCode: r.country_code,
        admin1: r.admin1,
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone,
        population: r.population,
      })),
    };
  } catch {
    return { ok: false, error: "Open-Meteo returned an unparseable response." };
  }
}
