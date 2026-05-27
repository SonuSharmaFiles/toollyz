import {
  fakerEN_US,
  fakerEN_GB,
  fakerEN_CA,
  fakerEN_AU,
  fakerEN_IN,
  fakerDE,
  fakerFR,
  fakerJA,
  fakerPT_BR,
  fakerEN,
  type Faker,
} from "@faker-js/faker";
import { COUNTRIES, COUNTRY_BY_CODE, NEPAL, type CountryConfig } from "./countries";

const FAKERS: Record<string, Faker> = {
  US: fakerEN_US,
  GB: fakerEN_GB,
  CA: fakerEN_CA,
  AU: fakerEN_AU,
  IN: fakerEN_IN,
  DE: fakerDE,
  FR: fakerFR,
  JA: fakerJA,
  JP: fakerJA,
  BR: fakerPT_BR,
  NP: fakerEN,
};

export type Gender = "male" | "female" | "any";
export type AgeGroup = "any" | "young" | "adult" | "senior";

const AGE_RANGES: Record<AgeGroup, [number, number]> = {
  any: [18, 75],
  young: [18, 30],
  adult: [31, 55],
  senior: [56, 80],
};

export interface AddressProfile {
  id: string;
  name: {
    first: string;
    last: string;
    full: string;
    gender: "male" | "female";
    age: number;
  };
  address: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  contact?: {
    phone: string;
    email: string;
  };
  company?: string;
  geo?: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface GenerateOptions {
  countryCode: string; // "random" or ISO code
  count: number;
  gender: Gender;
  ageGroup: AgeGroup;
  includePhone: boolean;
  includeEmail: boolean;
  includeCompany: boolean;
  includeGeo: boolean;
}

function pickCountry(code: string): CountryConfig {
  if (code === "random") {
    return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  }
  return COUNTRY_BY_CODE[code] ?? COUNTRIES[0];
}

function generateNepalAddress() {
  const f = fakerEN;
  return {
    street: `${f.number.int({ min: 1, max: 999 })} ${f.helpers.arrayElement(NEPAL.streets)}`,
    city: f.helpers.arrayElement(NEPAL.cities),
    state: f.helpers.arrayElement(NEPAL.provinces) + " Province",
    postalCode: f.helpers.arrayElement(NEPAL.postalCodes),
  };
}

function generateNepalPhone() {
  const f = fakerEN;
  // Format: +977 9XX-XXXXXXX
  const carrier = f.helpers.arrayElement(["98", "97", "96"]);
  const rest = f.string.numeric(8);
  return `+977 ${carrier}${rest.slice(0, 1)}-${rest.slice(1)}`;
}

function roundCoord(value: number, decimals = 5) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function generateOne(country: CountryConfig, opts: GenerateOptions): AddressProfile {
  const f = FAKERS[country.code] ?? fakerEN;
  const gender: "male" | "female" =
    opts.gender === "any"
      ? f.helpers.arrayElement(["male", "female"] as const)
      : opts.gender;

  const [minAge, maxAge] = AGE_RANGES[opts.ageGroup];
  const age = f.number.int({ min: minAge, max: maxAge });

  const firstName = f.person.firstName(gender);
  const lastName = f.person.lastName();
  const full = `${firstName} ${lastName}`;

  let street: string;
  let city: string;
  let state: string;
  let postalCode: string;

  if (country.code === "NP") {
    ({ street, city, state, postalCode } = generateNepalAddress());
  } else {
    street = f.location.streetAddress();
    city = f.location.city();
    state = f.location.state();
    postalCode = f.location.zipCode();
  }

  const apartment =
    f.number.int({ min: 0, max: 1 }) === 1
      ? `${f.helpers.arrayElement(["Apt", "Suite", "Unit", "#"])} ${f.number.int({ min: 1, max: 999 })}`
      : undefined;

  const profile: AddressProfile = {
    id: f.string.uuid(),
    name: { first: firstName, last: lastName, full, gender, age },
    address: {
      street,
      apartment,
      city,
      state,
      postalCode,
      country: country.name,
      countryCode: country.code,
    },
  };

  if (opts.includePhone) {
    const phone =
      country.code === "NP"
        ? generateNepalPhone()
        : f.phone.number({ style: "international" });
    profile.contact = profile.contact ?? { phone: "", email: "" };
    profile.contact.phone = phone;
  }

  if (opts.includeEmail) {
    const email = f.internet
      .email({ firstName, lastName, provider: f.helpers.arrayElement(["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "proton.me"]) })
      .toLowerCase();
    profile.contact = profile.contact ?? { phone: "", email: "" };
    profile.contact.email = email;
  }

  if (opts.includeCompany) {
    profile.company = f.company.name();
  }

  if (opts.includeGeo) {
    const [lat1, lat2] = country.latBounds;
    const [lng1, lng2] = country.lngBounds;
    profile.geo = {
      latitude: roundCoord(f.number.float({ min: lat1, max: lat2, fractionDigits: 6 })),
      longitude: roundCoord(f.number.float({ min: lng1, max: lng2, fractionDigits: 6 })),
      timezone: country.timezone,
    };
  }

  return profile;
}

export function generateAddresses(opts: GenerateOptions): AddressProfile[] {
  const out = new Array<AddressProfile>(opts.count);
  for (let i = 0; i < opts.count; i++) {
    out[i] = generateOne(pickCountry(opts.countryCode), opts);
  }
  return out;
}

// ─── Exporters ────────────────────────────────────────────────────────────

export function profileToText(p: AddressProfile): string {
  const lines: string[] = [];
  lines.push(p.name.full);
  if (p.company) lines.push(p.company);
  lines.push(p.address.street + (p.address.apartment ? `, ${p.address.apartment}` : ""));
  lines.push(`${p.address.city}, ${p.address.state} ${p.address.postalCode}`);
  lines.push(p.address.country);
  if (p.contact?.phone) lines.push(`Phone: ${p.contact.phone}`);
  if (p.contact?.email) lines.push(`Email: ${p.contact.email}`);
  if (p.geo) {
    lines.push(
      `Geo: ${p.geo.latitude.toFixed(5)}, ${p.geo.longitude.toFixed(5)} (${p.geo.timezone})`,
    );
  }
  return lines.join("\n");
}

export function profilesToTxt(profiles: AddressProfile[]): string {
  return profiles.map(profileToText).join("\n\n———\n\n");
}

export function profilesToCsv(profiles: AddressProfile[]): string {
  const headers = [
    "first_name",
    "last_name",
    "gender",
    "age",
    "company",
    "street",
    "apartment",
    "city",
    "state",
    "postal_code",
    "country",
    "country_code",
    "phone",
    "email",
    "latitude",
    "longitude",
    "timezone",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = profiles.map((p) =>
    [
      p.name.first,
      p.name.last,
      p.name.gender,
      p.name.age,
      p.company ?? "",
      p.address.street,
      p.address.apartment ?? "",
      p.address.city,
      p.address.state,
      p.address.postalCode,
      p.address.country,
      p.address.countryCode,
      p.contact?.phone ?? "",
      p.contact?.email ?? "",
      p.geo?.latitude ?? "",
      p.geo?.longitude ?? "",
      p.geo?.timezone ?? "",
    ]
      .map(escape)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function profilesToJson(profiles: AddressProfile[]): string {
  return JSON.stringify(profiles, null, 2);
}
