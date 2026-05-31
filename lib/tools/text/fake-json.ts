// Fake JSON Data Generator engine. Schema-driven — the user picks a column
// shape (a list of {field, type, options}) and the generator emits an array
// of N objects matching the schema. Cryptographically-strong randomness via
// crypto.getRandomValues with rejection sampling (no modulo bias).
//
// 14 field types cover the workhorse cases: uuid, name, first / last,
// email, username, phone, address, city, country, integer, float, boolean,
// date, lorem, and "literal" for a fixed value.

export type FieldType =
  | "uuid"
  | "name"
  | "first-name"
  | "last-name"
  | "email"
  | "username"
  | "phone"
  | "address"
  | "city"
  | "country"
  | "company"
  | "url"
  | "integer"
  | "float"
  | "boolean"
  | "date"
  | "iso-date"
  | "lorem"
  | "literal";

export interface FieldSpec {
  id: string;
  name: string;
  type: FieldType;
  /** For integer/float — min. */
  min?: number;
  /** For integer/float — max. */
  max?: number;
  /** For lorem — sentence count. */
  count?: number;
  /** For literal — the value. */
  literal?: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function newField(type: FieldType = "name", name = "name"): FieldSpec {
  return { id: uid(), name, type, min: 1, max: 100, count: 1 };
}

// ── Cryptographically strong randomness with rejection sampling ────────────

function getRandomU32(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

function randomInt(lo: number, hi: number): number {
  if (hi <= lo) return lo;
  const range = hi - lo + 1;
  const bound = Math.floor(0xffffffff / range) * range;
  let r = getRandomU32();
  while (r >= bound) r = getRandomU32();
  return lo + (r % range);
}

function randomFloat(lo: number, hi: number, decimals = 2): number {
  const u = getRandomU32() / 0xffffffff;
  const value = lo + u * (hi - lo);
  const factor = Math.pow(10, Math.max(0, Math.min(8, decimals)));
  return Math.round(value * factor) / factor;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// ── Sample data (curated, not generated) ───────────────────────────────────

const FIRST_NAMES = [
  "Ada", "Grace", "Alan", "Margaret", "Katherine", "Linus", "Donald", "Tim",
  "Bjarne", "James", "John", "Anita", "Radia", "Barbara", "Mary", "Jean",
  "Marie", "Tony", "Vint", "Cynthia", "Robert", "Marvin", "Yann", "Andrew",
  "Diana", "Ravi", "Sundar", "Satya", "Susan", "Sheryl", "Sonia", "Pooja",
  "Aarav", "Aisha", "Akira", "Sofia", "Mateo", "Leila", "Jian", "Hina",
];
const LAST_NAMES = [
  "Lovelace", "Hopper", "Turing", "Hamilton", "Johnson", "Torvalds", "Knuth",
  "Berners-Lee", "Stroustrup", "Gosling", "Backus", "Borg", "Perlman",
  "Liskov", "Allen", "Bartik", "Curie", "Hoare", "Cerf", "Solomon", "Dwork",
  "Minsky", "LeCun", "Ng", "Forsyth", "Kumar", "Pichai", "Nadella",
  "Wojcicki", "Sandberg", "Singh", "Tanaka", "Mendoza", "Park", "Khan",
];
const COMPANIES = [
  "Toollyz", "Anthropic", "OpenAI", "Stripe", "Vercel", "Cloudflare", "Notion",
  "Linear", "Figma", "Supabase", "Plaid", "Shopify", "Atlassian", "Twilio",
  "GitHub", "GitLab", "MongoDB", "Datadog", "Snowflake", "PagerDuty",
];
const CITIES = [
  "London", "New York", "San Francisco", "Tokyo", "Berlin", "Sydney", "Mumbai",
  "Lagos", "São Paulo", "Singapore", "Stockholm", "Toronto", "Dubai",
  "Bangkok", "Seoul", "Cairo", "Nairobi", "Mexico City", "Buenos Aires",
  "Auckland", "Lisbon", "Athens", "Vienna", "Helsinki", "Amsterdam",
];
const COUNTRIES = [
  "United Kingdom", "United States", "Japan", "Germany", "Australia", "India",
  "Nigeria", "Brazil", "Singapore", "Sweden", "Canada", "UAE", "Thailand",
  "South Korea", "Egypt", "Kenya", "Mexico", "Argentina", "New Zealand",
  "Portugal", "Greece", "Austria", "Finland", "Netherlands", "Spain",
];
const DOMAINS = [
  "example.com", "test.dev", "fake.io", "demo.app", "sample.net", "mockmail.com",
  "placeholder.org", "fixture.dev", "example.co.uk", "test.com.au",
];
const STREETS = [
  "Main Street", "Oak Avenue", "Park Road", "King Street", "Queen Avenue",
  "High Street", "Cedar Lane", "Maple Drive", "Elm Court", "Pine Way",
];
const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
];

// ── Generators ─────────────────────────────────────────────────────────────

function fakeUuid(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined") crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  // Force version 4 + variant.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function fakeFirstName(): string {
  return pick(FIRST_NAMES);
}

function fakeLastName(): string {
  return pick(LAST_NAMES);
}

function fakeName(): string {
  return `${fakeFirstName()} ${fakeLastName()}`;
}

function fakeUsername(): string {
  const first = fakeFirstName().toLowerCase();
  const last = fakeLastName().toLowerCase();
  const sep = pick([".", "_", "-", ""]);
  const tail = randomInt(0, 9) < 7 ? `${randomInt(1, 99)}` : "";
  return `${first}${sep}${last}${tail}`;
}

function fakeEmail(): string {
  return `${fakeUsername()}@${pick(DOMAINS)}`;
}

function fakePhone(): string {
  return `+${pick(["1", "44", "33", "49", "39", "91", "81"])} ${randomInt(100, 999)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`;
}

function fakeAddress(): string {
  return `${randomInt(1, 9999)} ${pick(STREETS)}`;
}

function fakeCity(): string {
  return pick(CITIES);
}

function fakeCountry(): string {
  return pick(COUNTRIES);
}

function fakeCompany(): string {
  return pick(COMPANIES);
}

function fakeUrl(): string {
  return `https://${pick(DOMAINS)}/${pick(["users", "products", "posts", "items"])}/${randomInt(1, 9999)}`;
}

function fakeLorem(sentences: number): string {
  const out: string[] = [];
  for (let i = 0; i < Math.max(1, sentences); i++) {
    const words: string[] = [];
    const n = randomInt(6, 15);
    for (let j = 0; j < n; j++) words.push(pick(LOREM_WORDS));
    let s = words.join(" ");
    s = s.charAt(0).toUpperCase() + s.slice(1) + ".";
    out.push(s);
  }
  return out.join(" ");
}

function fakeDate(): Date {
  // A date in the last 5 years.
  const now = Date.now();
  const fiveYearsMs = 5 * 365 * 24 * 3600 * 1000;
  return new Date(now - randomInt(0, fiveYearsMs));
}

export interface GenerateOptions {
  count: number;
  schema: FieldSpec[];
}

export const DEFAULT_SCHEMA: FieldSpec[] = [
  { id: "f1", name: "id", type: "uuid" },
  { id: "f2", name: "name", type: "name" },
  { id: "f3", name: "email", type: "email" },
  { id: "f4", name: "company", type: "company" },
  { id: "f5", name: "country", type: "country" },
  { id: "f6", name: "active", type: "boolean" },
  { id: "f7", name: "joined_at", type: "iso-date" },
];

function generateFieldValue(field: FieldSpec): unknown {
  switch (field.type) {
    case "uuid": return fakeUuid();
    case "name": return fakeName();
    case "first-name": return fakeFirstName();
    case "last-name": return fakeLastName();
    case "email": return fakeEmail();
    case "username": return fakeUsername();
    case "phone": return fakePhone();
    case "address": return fakeAddress();
    case "city": return fakeCity();
    case "country": return fakeCountry();
    case "company": return fakeCompany();
    case "url": return fakeUrl();
    case "integer": return randomInt(field.min ?? 0, field.max ?? 100);
    case "float": return randomFloat(field.min ?? 0, field.max ?? 100, 2);
    case "boolean": return Math.random() < 0.5;
    case "date": return fakeDate().toLocaleDateString();
    case "iso-date": return fakeDate().toISOString();
    case "lorem": return fakeLorem(field.count ?? 1);
    case "literal": return field.literal ?? "";
  }
}

export function generate(opt: GenerateOptions): Record<string, unknown>[] {
  const count = Math.max(1, Math.min(10_000, opt.count));
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const obj: Record<string, unknown> = {};
    for (const field of opt.schema) {
      obj[field.name || "field"] = generateFieldValue(field);
    }
    out.push(obj);
  }
  return out;
}

export const FIELD_TYPE_META: { id: FieldType; label: string; group: string }[] = [
  { id: "uuid", label: "UUID v4", group: "Identifiers" },
  { id: "integer", label: "Integer", group: "Numbers" },
  { id: "float", label: "Float", group: "Numbers" },
  { id: "boolean", label: "Boolean", group: "Numbers" },
  { id: "literal", label: "Literal value", group: "Custom" },

  { id: "name", label: "Full name", group: "People" },
  { id: "first-name", label: "First name", group: "People" },
  { id: "last-name", label: "Last name", group: "People" },
  { id: "username", label: "Username", group: "People" },
  { id: "email", label: "Email", group: "People" },
  { id: "phone", label: "Phone", group: "People" },

  { id: "address", label: "Street address", group: "Location" },
  { id: "city", label: "City", group: "Location" },
  { id: "country", label: "Country", group: "Location" },

  { id: "company", label: "Company", group: "Business" },
  { id: "url", label: "URL", group: "Business" },

  { id: "date", label: "Date (locale)", group: "Date" },
  { id: "iso-date", label: "Date (ISO 8601)", group: "Date" },

  { id: "lorem", label: "Lorem ipsum", group: "Text" },
];
