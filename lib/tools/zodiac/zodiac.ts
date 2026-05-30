// Western & Chinese zodiac engine for the Toollyz Zodiac Sign Finder.
// Pure data + lookup; no DOM, no fetch. The Chinese New Year table covers
// 1900–2050; for years outside that range the engine falls back to an
// approximate "≥ Feb 4" rule (the rough solar boundary the lunisolar calendar
// hovers near) and the caller surfaces a note about the approximation.

export interface WesternSign {
  id: string;
  name: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  /** Date range as [startMonth(1-12), startDay, endMonth, endDay] — wraps for Capricorn. */
  start: [number, number];
  end: [number, number];
  traits: string[];
  compatibleWith: string[];
}

export const WESTERN: WesternSign[] = [
  { id: "aries", name: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", rulingPlanet: "Mars", start: [3, 21], end: [4, 19], traits: ["Energetic", "Courageous", "Direct", "Impatient"], compatibleWith: ["Leo", "Sagittarius", "Gemini"] },
  { id: "taurus", name: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", rulingPlanet: "Venus", start: [4, 20], end: [5, 20], traits: ["Patient", "Sensual", "Reliable", "Stubborn"], compatibleWith: ["Virgo", "Capricorn", "Cancer"] },
  { id: "gemini", name: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", rulingPlanet: "Mercury", start: [5, 21], end: [6, 20], traits: ["Curious", "Witty", "Sociable", "Restless"], compatibleWith: ["Libra", "Aquarius", "Aries"] },
  { id: "cancer", name: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", rulingPlanet: "Moon", start: [6, 21], end: [7, 22], traits: ["Nurturing", "Intuitive", "Loyal", "Moody"], compatibleWith: ["Scorpio", "Pisces", "Taurus"] },
  { id: "leo", name: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", rulingPlanet: "Sun", start: [7, 23], end: [8, 22], traits: ["Charismatic", "Generous", "Bold", "Proud"], compatibleWith: ["Aries", "Sagittarius", "Gemini"] },
  { id: "virgo", name: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", rulingPlanet: "Mercury", start: [8, 23], end: [9, 22], traits: ["Analytical", "Practical", "Detail-oriented", "Worrying"], compatibleWith: ["Taurus", "Capricorn", "Cancer"] },
  { id: "libra", name: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", rulingPlanet: "Venus", start: [9, 23], end: [10, 22], traits: ["Diplomatic", "Charming", "Fair-minded", "Indecisive"], compatibleWith: ["Gemini", "Aquarius", "Leo"] },
  { id: "scorpio", name: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", rulingPlanet: "Pluto / Mars", start: [10, 23], end: [11, 21], traits: ["Passionate", "Magnetic", "Determined", "Intense"], compatibleWith: ["Cancer", "Pisces", "Virgo"] },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", rulingPlanet: "Jupiter", start: [11, 22], end: [12, 21], traits: ["Adventurous", "Optimistic", "Honest", "Tactless"], compatibleWith: ["Aries", "Leo", "Libra"] },
  { id: "capricorn", name: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", rulingPlanet: "Saturn", start: [12, 22], end: [1, 19], traits: ["Disciplined", "Ambitious", "Patient", "Reserved"], compatibleWith: ["Taurus", "Virgo", "Scorpio"] },
  { id: "aquarius", name: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", rulingPlanet: "Uranus / Saturn", start: [1, 20], end: [2, 18], traits: ["Inventive", "Independent", "Humanitarian", "Aloof"], compatibleWith: ["Gemini", "Libra", "Sagittarius"] },
  { id: "pisces", name: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", rulingPlanet: "Neptune / Jupiter", start: [2, 19], end: [3, 20], traits: ["Imaginative", "Empathetic", "Gentle", "Escapist"], compatibleWith: ["Cancer", "Scorpio", "Capricorn"] },
];

export function westernFromDate(date: Date): WesternSign {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const sign of WESTERN) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (sm === 12) {
      // Capricorn spans Dec 22 → Jan 19
      if ((m === 12 && d >= sd) || (m === 1 && d <= ed)) return sign;
    } else {
      if ((m === sm && d >= sd) || (m === em && d <= ed)) return sign;
    }
  }
  return WESTERN[0];
}

// ───────────────────────────────────────────────────────────────────────────
// Chinese zodiac
// ───────────────────────────────────────────────────────────────────────────

export interface ChineseSign {
  id: string;
  animal: string;
  symbol: string;
  traits: string[];
  compatibleWith: string[];
}

export const CHINESE_ANIMALS: ChineseSign[] = [
  { id: "rat", animal: "Rat", symbol: "🐀", traits: ["Resourceful", "Quick-witted", "Versatile", "Charming"], compatibleWith: ["Dragon", "Monkey", "Ox"] },
  { id: "ox", animal: "Ox", symbol: "🐂", traits: ["Diligent", "Patient", "Honest", "Strong-willed"], compatibleWith: ["Snake", "Rooster", "Rat"] },
  { id: "tiger", animal: "Tiger", symbol: "🐅", traits: ["Brave", "Confident", "Charismatic", "Impulsive"], compatibleWith: ["Horse", "Dog", "Pig"] },
  { id: "rabbit", animal: "Rabbit", symbol: "🐇", traits: ["Gentle", "Empathetic", "Elegant", "Cautious"], compatibleWith: ["Goat", "Pig", "Dog"] },
  { id: "dragon", animal: "Dragon", symbol: "🐉", traits: ["Charismatic", "Confident", "Lucky", "Proud"], compatibleWith: ["Rat", "Monkey", "Rooster"] },
  { id: "snake", animal: "Snake", symbol: "🐍", traits: ["Intuitive", "Wise", "Mysterious", "Reserved"], compatibleWith: ["Ox", "Rooster", "Monkey"] },
  { id: "horse", animal: "Horse", symbol: "🐎", traits: ["Energetic", "Sociable", "Free-spirited", "Impatient"], compatibleWith: ["Tiger", "Dog", "Goat"] },
  { id: "goat", animal: "Goat", symbol: "🐐", traits: ["Gentle", "Artistic", "Compassionate", "Indecisive"], compatibleWith: ["Rabbit", "Horse", "Pig"] },
  { id: "monkey", animal: "Monkey", symbol: "🐒", traits: ["Clever", "Curious", "Witty", "Mischievous"], compatibleWith: ["Rat", "Dragon", "Snake"] },
  { id: "rooster", animal: "Rooster", symbol: "🐓", traits: ["Observant", "Confident", "Hard-working", "Critical"], compatibleWith: ["Ox", "Snake", "Dragon"] },
  { id: "dog", animal: "Dog", symbol: "🐕", traits: ["Loyal", "Sincere", "Protective", "Anxious"], compatibleWith: ["Tiger", "Horse", "Rabbit"] },
  { id: "pig", animal: "Pig", symbol: "🐖", traits: ["Generous", "Sincere", "Easy-going", "Trusting"], compatibleWith: ["Rabbit", "Goat", "Tiger"] },
];

export type ChineseElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
export type ChinesePolarity = "Yang" | "Yin";

/** Chinese New Year dates 1900–2050 stored as month*100 + day. */
const CNY_TABLE: Record<number, number> = {
  1900: 131, 1901: 219, 1902: 208, 1903: 129, 1904: 216, 1905: 204, 1906: 125, 1907: 213, 1908: 202, 1909: 122,
  1910: 210, 1911: 130, 1912: 218, 1913: 206, 1914: 126, 1915: 214, 1916: 203, 1917: 123, 1918: 211, 1919: 201,
  1920: 220, 1921: 208, 1922: 128, 1923: 216, 1924: 205, 1925: 124, 1926: 213, 1927: 202, 1928: 123, 1929: 210,
  1930: 130, 1931: 217, 1932: 206, 1933: 126, 1934: 214, 1935: 204, 1936: 124, 1937: 211, 1938: 131, 1939: 219,
  1940: 208, 1941: 127, 1942: 215, 1943: 205, 1944: 125, 1945: 213, 1946: 202, 1947: 122, 1948: 210, 1949: 129,
  1950: 217, 1951: 206, 1952: 127, 1953: 214, 1954: 203, 1955: 124, 1956: 212, 1957: 131, 1958: 218, 1959: 208,
  1960: 128, 1961: 215, 1962: 205, 1963: 125, 1964: 213, 1965: 202, 1966: 121, 1967: 209, 1968: 130, 1969: 217,
  1970: 206, 1971: 127, 1972: 215, 1973: 203, 1974: 123, 1975: 211, 1976: 131, 1977: 218, 1978: 207, 1979: 128,
  1980: 216, 1981: 205, 1982: 125, 1983: 213, 1984: 202, 1985: 220, 1986: 209, 1987: 129, 1988: 217, 1989: 206,
  1990: 127, 1991: 215, 1992: 204, 1993: 123, 1994: 210, 1995: 131, 1996: 219, 1997: 207, 1998: 128, 1999: 216,
  2000: 205, 2001: 124, 2002: 212, 2003: 201, 2004: 122, 2005: 209, 2006: 129, 2007: 218, 2008: 207, 2009: 126,
  2010: 214, 2011: 203, 2012: 123, 2013: 210, 2014: 131, 2015: 219, 2016: 208, 2017: 128, 2018: 216, 2019: 205,
  2020: 125, 2021: 212, 2022: 201, 2023: 122, 2024: 210, 2025: 129, 2026: 217, 2027: 206, 2028: 126, 2029: 213,
  2030: 203, 2031: 123, 2032: 211, 2033: 131, 2034: 219, 2035: 208, 2036: 128, 2037: 215, 2038: 204, 2039: 124,
  2040: 212, 2041: 201, 2042: 122, 2043: 210, 2044: 130, 2045: 217, 2046: 206, 2047: 126, 2048: 214, 2049: 202,
  2050: 123,
};

function chineseNewYear(year: number): { month: number; day: number; approximate: boolean } {
  const entry = CNY_TABLE[year];
  if (entry !== undefined) {
    return { month: Math.floor(entry / 100), day: entry % 100, approximate: false };
  }
  // Fallback: approximate Feb 4 (a rough solar boundary).
  return { month: 2, day: 4, approximate: true };
}

export interface ChineseResult {
  year: number; // Chinese zodiac year (may be different from gregorian if before CNY)
  animal: ChineseSign;
  element: ChineseElement;
  polarity: ChinesePolarity;
  newYear: { month: number; day: number; approximate: boolean };
}

const ELEMENT_BY_LAST_DIGIT: Record<number, ChineseElement> = {
  0: "Metal", 1: "Metal",
  2: "Water", 3: "Water",
  4: "Wood", 5: "Wood",
  6: "Fire", 7: "Fire",
  8: "Earth", 9: "Earth",
};

export function chineseFromDate(date: Date): ChineseResult {
  let year = date.getFullYear();
  const cny = chineseNewYear(year);
  const beforeNewYear =
    date.getMonth() + 1 < cny.month || (date.getMonth() + 1 === cny.month && date.getDate() < cny.day);
  if (beforeNewYear) year -= 1;
  // Animal: (year - 4) mod 12, where 0=Rat.
  const animalIdx = ((year - 4) % 12 + 12) % 12;
  const animal = CHINESE_ANIMALS[animalIdx];
  const element = ELEMENT_BY_LAST_DIGIT[year % 10];
  const polarity: ChinesePolarity = year % 2 === 0 ? "Yang" : "Yin";
  return {
    year,
    animal,
    element,
    polarity,
    newYear: cny,
  };
}
