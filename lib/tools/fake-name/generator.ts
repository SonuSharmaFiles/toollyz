import {
  fakerEN_US,
  fakerEN_GB,
  fakerEN_IN,
  fakerJA,
  fakerZH_CN,
  fakerDE,
  fakerFR,
  fakerPT_BR,
  fakerRU,
  fakerAR,
  fakerEN,
  type Faker,
} from "@faker-js/faker";
import {
  COUNTRIES,
  COUNTRY_BY_CODE,
  NEPAL_NAMES,
  type CountryConfig,
} from "./countries";

const FAKERS: Record<string, Faker> = {
  US: fakerEN_US,
  GB: fakerEN_GB,
  IN: fakerEN_IN,
  NP: fakerEN,
  JP: fakerJA,
  CN: fakerZH_CN,
  DE: fakerDE,
  FR: fakerFR,
  BR: fakerPT_BR,
  RU: fakerRU,
  AR: fakerAR,
};

export type Gender = "male" | "female" | "any";
export type AgeRange = "any" | "young" | "adult" | "senior";

const AGE_RANGES: Record<AgeRange, [number, number]> = {
  any: [18, 80],
  young: [18, 30],
  adult: [31, 55],
  senior: [56, 80],
};

export interface IdentityProfile {
  id: string;
  name: {
    first: string;
    middle?: string;
    last: string;
    full: string;
    gender: "male" | "female";
  };
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  age: number;
  birthdate?: string; // ISO date
  occupation?: string;
  company?: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
}

export interface GenerateOptions {
  countryCode: string;
  count: number;
  gender: Gender;
  ageRange: AgeRange;
  includeUsername: boolean;
  includeEmail: boolean;
  includeOccupation: boolean;
  includePhone: boolean;
  includeCompany: boolean;
  includeBirthdate: boolean;
  includeMiddle: boolean;
}

function pickCountry(code: string): CountryConfig {
  if (code === "random") {
    return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  }
  return COUNTRY_BY_CODE[code] ?? COUNTRIES[0];
}

function generateNepalName(gender: "male" | "female"): { first: string; last: string } {
  const f = fakerEN;
  const first = f.helpers.arrayElement(
    gender === "male" ? NEPAL_NAMES.maleFirst : NEPAL_NAMES.femaleFirst,
  );
  const last = f.helpers.arrayElement(NEPAL_NAMES.last);
  return { first, last };
}

function generateNepalPhone() {
  const f = fakerEN;
  const carrier = f.helpers.arrayElement(["98", "97", "96"]);
  const rest = f.string.numeric(8);
  return `+977 ${carrier}${rest.slice(0, 1)}-${rest.slice(1)}`;
}

function generateUsername(faker: Faker, first: string, last: string): string {
  // Use ASCII fallback for non-Latin scripts
  const asciiFirst = first.normalize("NFKD").replace(/[^a-zA-Z]/g, "");
  const asciiLast = last.normalize("NFKD").replace(/[^a-zA-Z]/g, "");
  const baseFirst = asciiFirst || faker.person.firstName().normalize("NFKD").replace(/[^a-zA-Z]/g, "") || "user";
  const baseLast = asciiLast || faker.person.lastName().normalize("NFKD").replace(/[^a-zA-Z]/g, "") || "name";
  const patterns = [
    () => `${baseFirst}.${baseLast}`.toLowerCase(),
    () => `${baseFirst}_${baseLast}`.toLowerCase(),
    () => `${baseFirst[0]}${baseLast}`.toLowerCase(),
    () => `${baseFirst}${baseLast}${faker.number.int({ min: 10, max: 999 })}`.toLowerCase(),
    () => `${baseLast}.${baseFirst[0]}`.toLowerCase(),
    () => `the${baseFirst}`.toLowerCase(),
    () => `${baseFirst}${faker.number.int({ min: 1980, max: 2010 })}`.toLowerCase(),
  ];
  return faker.helpers.arrayElement(patterns)();
}

function generateNickname(faker: Faker, first: string): string {
  const asciiFirst = first.normalize("NFKD").replace(/[^a-zA-Z]/g, "");
  if (!asciiFirst) return faker.word.adjective();
  // Common nickname patterns
  const short = asciiFirst.slice(0, Math.min(4, asciiFirst.length));
  const patterns = [
    () => short.toLowerCase(),
    () => `${short.toLowerCase()}y`,
    () => `${short.toLowerCase()}ie`,
    () => `${asciiFirst.slice(0, 3).toLowerCase()}-${faker.word.adjective().toLowerCase()}`,
  ];
  return faker.helpers.arrayElement(patterns)();
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generateOne(country: CountryConfig, opts: GenerateOptions): IdentityProfile {
  const f = FAKERS[country.code] ?? fakerEN;
  const gender: "male" | "female" =
    opts.gender === "any"
      ? f.helpers.arrayElement(["male", "female"] as const)
      : opts.gender;

  const [minAge, maxAge] = AGE_RANGES[opts.ageRange];
  const age = f.number.int({ min: minAge, max: maxAge });

  let firstName: string;
  let lastName: string;
  if (country.code === "NP") {
    ({ first: firstName, last: lastName } = generateNepalName(gender));
  } else {
    firstName = f.person.firstName(gender);
    lastName = f.person.lastName();
  }
  const middleName = opts.includeMiddle
    ? f.person.firstName(gender)
    : undefined;
  const full = middleName
    ? `${firstName} ${middleName} ${lastName}`
    : `${firstName} ${lastName}`;

  const city =
    country.code === "NP" && country.cities
      ? f.helpers.arrayElement(country.cities)
      : f.location.city();

  // Birthdate from age
  let birthdate: string | undefined;
  if (opts.includeBirthdate) {
    const now = new Date();
    const year = now.getFullYear() - age;
    const month = f.number.int({ min: 0, max: 11 });
    const day = f.number.int({ min: 1, max: 28 });
    birthdate = isoDate(new Date(year, month, day));
  }

  const profile: IdentityProfile = {
    id: f.string.uuid(),
    name: {
      first: firstName,
      middle: middleName,
      last: lastName,
      full,
      gender,
    },
    age,
    birthdate,
    city,
    country: country.name,
    countryCode: country.code,
    timezone: country.timezone,
  };

  if (opts.includeUsername) {
    profile.username = generateUsername(f, firstName, lastName);
    profile.nickname = generateNickname(f, firstName);
  }

  if (opts.includeEmail) {
    const asciiFirst = firstName.normalize("NFKD").replace(/[^a-zA-Z]/g, "") || "user";
    const asciiLast = lastName.normalize("NFKD").replace(/[^a-zA-Z]/g, "") || "name";
    const provider = f.helpers.arrayElement([
      "gmail.com",
      "outlook.com",
      "yahoo.com",
      "icloud.com",
      "proton.me",
    ]);
    profile.email = f.internet
      .email({ firstName: asciiFirst, lastName: asciiLast, provider })
      .toLowerCase();
  }

  if (opts.includePhone) {
    profile.phone =
      country.code === "NP" ? generateNepalPhone() : f.phone.number({ style: "international" });
  }

  if (opts.includeOccupation) {
    profile.occupation = f.person.jobTitle();
  }

  if (opts.includeCompany) {
    profile.company = f.company.name();
  }

  return profile;
}

export function generateIdentities(opts: GenerateOptions): IdentityProfile[] {
  const out = new Array<IdentityProfile>(opts.count);
  for (let i = 0; i < opts.count; i++) {
    out[i] = generateOne(pickCountry(opts.countryCode), opts);
  }
  return out;
}

// ─── Export helpers ───────────────────────────────────────────────────────

export function profileToText(p: IdentityProfile): string {
  const lines: string[] = [p.name.full];
  if (p.username) lines.push(`Username: ${p.username}`);
  if (p.nickname) lines.push(`Nickname: ${p.nickname}`);
  if (p.occupation) lines.push(`Occupation: ${p.occupation}`);
  if (p.company) lines.push(`Company: ${p.company}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  lines.push(`Gender: ${p.name.gender}`);
  lines.push(`Age: ${p.age}`);
  if (p.birthdate) lines.push(`Born: ${p.birthdate}`);
  lines.push(`Location: ${p.city}, ${p.country}`);
  return lines.join("\n");
}

export function profilesToTxt(profiles: IdentityProfile[]): string {
  return profiles.map(profileToText).join("\n\n———\n\n");
}

export function profilesToCsv(profiles: IdentityProfile[]): string {
  const headers = [
    "first_name",
    "middle_name",
    "last_name",
    "full_name",
    "gender",
    "age",
    "birthdate",
    "username",
    "nickname",
    "email",
    "phone",
    "occupation",
    "company",
    "city",
    "country",
    "country_code",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = profiles.map((p) =>
    [
      p.name.first,
      p.name.middle ?? "",
      p.name.last,
      p.name.full,
      p.name.gender,
      p.age,
      p.birthdate ?? "",
      p.username ?? "",
      p.nickname ?? "",
      p.email ?? "",
      p.phone ?? "",
      p.occupation ?? "",
      p.company ?? "",
      p.city,
      p.country,
      p.countryCode,
    ]
      .map(escape)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function profilesToJson(profiles: IdentityProfile[]): string {
  return JSON.stringify(profiles, null, 2);
}
