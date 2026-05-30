// UTM Link Generator engine for the Toollyz UTM Link Generator. Pure
// functions, no DOM or fetch. Builds Google Analytics-style UTM URLs by
// appending or replacing utm_* query parameters on a base URL while
// preserving any existing query string, hash fragment and percent-encoding.

export type UtmParamKey = "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content" | "utm_id";

export interface UtmInput {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  id: string;
  // Behavior
  lowercase: boolean;
  spacesToUnderscores: boolean;
}

export const DEFAULT_UTM: UtmInput = {
  baseUrl: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
  id: "",
  lowercase: true,
  spacesToUnderscores: true,
};

export interface PlatformPreset {
  id: string;
  label: string;
  hint: string;
  source: string;
  medium: string;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "google-cpc", label: "Google Ads (CPC)", hint: "Paid search on Google", source: "google", medium: "cpc" },
  { id: "google-organic", label: "Google Organic", hint: "Free Google search referrals", source: "google", medium: "organic" },
  { id: "facebook-cpc", label: "Facebook Ads", hint: "Paid Meta/Facebook campaign", source: "facebook", medium: "cpc" },
  { id: "instagram-cpc", label: "Instagram Ads", hint: "Paid Instagram campaign", source: "instagram", medium: "cpc" },
  { id: "linkedin-cpc", label: "LinkedIn Ads", hint: "Sponsored LinkedIn campaign", source: "linkedin", medium: "cpc" },
  { id: "x-cpc", label: "X (Twitter) Ads", hint: "Promoted post on X", source: "x", medium: "cpc" },
  { id: "tiktok-cpc", label: "TikTok Ads", hint: "Paid TikTok campaign", source: "tiktok", medium: "cpc" },
  { id: "youtube-cpc", label: "YouTube Ads", hint: "TrueView / in-stream ad", source: "youtube", medium: "cpc" },
  { id: "reddit-cpc", label: "Reddit Ads", hint: "Promoted Reddit post", source: "reddit", medium: "cpc" },
  { id: "newsletter", label: "Email newsletter", hint: "Recurring email blast", source: "newsletter", medium: "email" },
  { id: "transactional-email", label: "Transactional email", hint: "Order confirmations, password resets", source: "lifecycle", medium: "email" },
  { id: "blog", label: "Blog post", hint: "Owned blog → website", source: "blog", medium: "referral" },
  { id: "press-release", label: "Press release", hint: "Earned media coverage", source: "pr", medium: "referral" },
  { id: "qr-code", label: "QR code / print", hint: "Scannable code on flyers, packaging", source: "qr", medium: "offline" },
  { id: "podcast", label: "Podcast", hint: "Show notes / audio shoutout", source: "podcast", medium: "audio" },
  { id: "affiliate", label: "Affiliate / partner", hint: "Pay-per-action partner links", source: "partner", medium: "affiliate" },
];

function normalize(v: string, input: Pick<UtmInput, "lowercase" | "spacesToUnderscores">): string {
  let s = v.trim();
  if (!s) return "";
  if (input.lowercase) s = s.toLowerCase();
  if (input.spacesToUnderscores) s = s.replace(/\s+/g, "_");
  return s;
}

const URL_PROTO_RE = /^[a-z][a-z0-9+\-.]*:\/\//i;

export function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(URL_PROTO_RE.test(raw) ? raw : `https://${raw}`);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Build the final UTM-tagged URL. Existing query params are preserved unless
 * they collide with a utm_* key being set, in which case the new value wins.
 * Returns either { ok: true, url } or { ok: false, error }.
 */
export function buildUtmUrl(input: UtmInput): { ok: true; url: string } | { ok: false; error: string } {
  const raw = input.baseUrl.trim();
  if (!raw) return { ok: false, error: "Enter a base URL." };
  const withScheme = URL_PROTO_RE.test(raw) ? raw : `https://${raw}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, error: "URL must use http:// or https://." };
  }
  // Apply utm_* params. URLSearchParams.set replaces any existing value.
  const map: [UtmParamKey, string][] = [
    ["utm_source", normalize(input.source, input)],
    ["utm_medium", normalize(input.medium, input)],
    ["utm_campaign", normalize(input.campaign, input)],
    ["utm_term", normalize(input.term, input)],
    ["utm_content", normalize(input.content, input)],
    ["utm_id", normalize(input.id, input)],
  ];
  for (const [k, v] of map) {
    if (v) u.searchParams.set(k, v);
    else u.searchParams.delete(k);
  }
  // Re-serialize. URL toString() percent-encodes the right things.
  return { ok: true, url: u.toString() };
}

export interface UtmCheck { errors: string[]; warnings: string[]; tips: string[] }

const RESERVED_CHARS_RE = /[<>"`{}\\^]/;

export function analyze(input: UtmInput): UtmCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tips: string[] = [];
  if (!input.baseUrl.trim()) errors.push("Base URL is required.");
  else if (!isValidUrl(input.baseUrl.trim())) errors.push("Base URL must be a valid http:// or https:// link.");
  if (!input.source.trim()) errors.push("utm_source is required — typically the platform name (google, newsletter, etc).");
  if (!input.medium.trim()) errors.push("utm_medium is required — typically the channel (cpc, email, social).");
  if (!input.campaign.trim()) warnings.push("utm_campaign is empty — most analytics tools rely on it to group sessions.");
  if (input.campaign.trim().length > 100) warnings.push("utm_campaign is unusually long — keep it under 100 characters to avoid truncation in reports.");
  const fields: (keyof UtmInput)[] = ["source", "medium", "campaign", "term", "content", "id"];
  for (const k of fields) {
    const v = String(input[k]);
    if (RESERVED_CHARS_RE.test(v)) {
      warnings.push(`${k} contains unsafe characters (< > " { } \\ ^) — they'll be percent-encoded but may break older analytics tools.`);
    }
    if (v && v !== v.toLowerCase() && input.lowercase) {
      tips.push(`${k} will be lowercased automatically.`);
    }
    if (/\s/.test(v) && input.spacesToUnderscores) {
      tips.push(`${k} will have spaces converted to underscores.`);
    }
  }
  // Dedupe tips
  return { errors, warnings, tips: [...new Set(tips)] };
}
