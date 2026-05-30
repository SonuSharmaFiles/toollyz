// NOAA Solar Position Algorithm for the Toollyz Sunrise & Sunset Time tool.
// Computes sunrise, sunset, solar noon and the three twilight bands for any
// (latitude, longitude, date) — entirely offline, no API call needed for the
// solar math itself. Algorithm reference:
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export const ZENITH = {
  /** Geometric sunrise/sunset (sun at horizon, refraction-adjusted). */
  official: 90.833,
  /** Civil twilight — sun 6° below the horizon. */
  civil: 96,
  /** Nautical twilight — sun 12° below the horizon. */
  nautical: 102,
  /** Astronomical twilight — sun 18° below the horizon. */
  astronomical: 108,
} as const;

interface JulianResult { jd: number; jc: number }

function julian(date: Date): JulianResult {
  const ms = date.getTime();
  const jd = ms / 86400000 + 2440587.5;
  const jc = (jd - 2451545) / 36525;
  return { jd, jc };
}

function geomMeanLongSun(jc: number): number {
  return modDeg(280.46646 + jc * (36000.76983 + jc * 0.0003032));
}

function geomMeanAnomSun(jc: number): number {
  return 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
}

function eccentEarthOrbit(jc: number): number {
  return 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
}

function sunEqOfCenter(jc: number): number {
  const m = geomMeanAnomSun(jc) * DEG;
  return (
    Math.sin(m) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * jc) +
    Math.sin(3 * m) * 0.000289
  );
}

function sunTrueLong(jc: number): number {
  return geomMeanLongSun(jc) + sunEqOfCenter(jc);
}

function sunAppLong(jc: number): number {
  const o = sunTrueLong(jc);
  const omega = 125.04 - 1934.136 * jc;
  return o - 0.00569 - 0.00478 * Math.sin(omega * DEG);
}

function meanObliqEcliptic(jc: number): number {
  const seconds = 21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813));
  return 23 + (26 + seconds / 60) / 60;
}

function obliqueCorr(jc: number): number {
  const e0 = meanObliqEcliptic(jc);
  const omega = 125.04 - 1934.136 * jc;
  return e0 + 0.00256 * Math.cos(omega * DEG);
}

function sunDeclination(jc: number): number {
  const e = obliqueCorr(jc);
  const lambda = sunAppLong(jc);
  return Math.asin(Math.sin(e * DEG) * Math.sin(lambda * DEG)) * RAD;
}

function eqOfTime(jc: number): number {
  const epsilon = obliqueCorr(jc);
  const l0 = geomMeanLongSun(jc);
  const e = eccentEarthOrbit(jc);
  const m = geomMeanAnomSun(jc);
  let y = Math.tan((epsilon / 2) * DEG);
  y *= y;
  const sin2l0 = Math.sin(2 * l0 * DEG);
  const sinm = Math.sin(m * DEG);
  const cos2l0 = Math.cos(2 * l0 * DEG);
  const sin4l0 = Math.sin(4 * l0 * DEG);
  const sin2m = Math.sin(2 * m * DEG);
  const Etime =
    y * sin2l0 -
    2 * e * sinm +
    4 * e * y * sinm * cos2l0 -
    0.5 * y * y * sin4l0 -
    1.25 * e * e * sin2m;
  return Etime * 4 * RAD; // minutes of time
}

function modDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export interface SunResult {
  noonUTC: Date | null;
  sunriseUTC: Date | null;
  sunsetUTC: Date | null;
  civilDawnUTC: Date | null;
  civilDuskUTC: Date | null;
  nauticalDawnUTC: Date | null;
  nauticalDuskUTC: Date | null;
  astroDawnUTC: Date | null;
  astroDuskUTC: Date | null;
  /** Day length in seconds (sunrise → sunset). */
  dayLengthSec: number;
  /** Sun is always above the horizon on this date at this latitude. */
  alwaysDay: boolean;
  /** Sun is always below the horizon on this date at this latitude. */
  alwaysNight: boolean;
}

/**
 * Compute sunrise/sunset/twilights for a date (treated as the local noon at
 * the given longitude) at a given latitude.
 */
export function sunTimes(date: Date, latitude: number, longitude: number): SunResult {
  // Anchor at solar noon (12:00 local-mean-time at the given longitude) so the
  // hour-angle math is stable.
  const tNoonGuess = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    12,
    0,
    0,
  ));
  const { jc } = julian(tNoonGuess);
  const eq = eqOfTime(jc); // minutes
  const decl = sunDeclination(jc); // degrees

  // Solar noon as minutes-from-UTC-midnight:
  const noonMinutes = 720 - 4 * longitude - eq;

  function eventMinutes(zenith: number, morning: boolean): number | null {
    const cosH =
      (Math.cos(zenith * DEG) - Math.sin(latitude * DEG) * Math.sin(decl * DEG)) /
      (Math.cos(latitude * DEG) * Math.cos(decl * DEG));
    if (cosH > 1) return null; // sun never reaches this zenith — always night
    if (cosH < -1) return null; // always above this zenith — always day
    const hourAngle = Math.acos(cosH) * RAD;
    return noonMinutes + (morning ? -hourAngle : hourAngle) * 4;
  }

  function asDate(minutesFromMidnight: number | null): Date | null {
    if (minutesFromMidnight === null) return null;
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      Math.round(minutesFromMidnight),
      0,
    ));
  }

  const sunriseMin = eventMinutes(ZENITH.official, true);
  const sunsetMin = eventMinutes(ZENITH.official, false);
  const civilDawn = eventMinutes(ZENITH.civil, true);
  const civilDusk = eventMinutes(ZENITH.civil, false);
  const nauticalDawn = eventMinutes(ZENITH.nautical, true);
  const nauticalDusk = eventMinutes(ZENITH.nautical, false);
  const astroDawn = eventMinutes(ZENITH.astronomical, true);
  const astroDusk = eventMinutes(ZENITH.astronomical, false);

  const alwaysDay = sunriseMin === null && sunsetMin === null && latitude * decl > 0;
  const alwaysNight = sunriseMin === null && sunsetMin === null && latitude * decl < 0;

  return {
    noonUTC: asDate(noonMinutes),
    sunriseUTC: asDate(sunriseMin),
    sunsetUTC: asDate(sunsetMin),
    civilDawnUTC: asDate(civilDawn),
    civilDuskUTC: asDate(civilDusk),
    nauticalDawnUTC: asDate(nauticalDawn),
    nauticalDuskUTC: asDate(nauticalDusk),
    astroDawnUTC: asDate(astroDawn),
    astroDuskUTC: asDate(astroDusk),
    dayLengthSec: sunriseMin === null || sunsetMin === null ? 0 : Math.round((sunsetMin - sunriseMin) * 60),
    alwaysDay,
    alwaysNight,
  };
}

export function formatDayLength(seconds: number): string {
  if (seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}
