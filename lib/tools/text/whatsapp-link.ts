// WhatsApp Link Generator engine. Builds a `https://wa.me/...?text=...` URL.
//
// WhatsApp accepts the international format WITHOUT the + sign. The user
// usually pastes "+44 7700 900 123" or "(415) 555-1234 (US)" — we normalise
// by stripping all non-digit characters. We also support an optional ISO
// country code that's prepended when the user's input is missing one.

const E164_MAX_LENGTH = 15; // ITU-T E.164 maximum digit count

export interface CountryCode {
  /** ISO 3166-1 alpha-2 country code (uppercase). */
  iso: string;
  /** Country name in English. */
  name: string;
  /** Calling code, digits only, e.g. "44" for the UK. */
  callingCode: string;
  /** Flag emoji for display. */
  flag: string;
}

// Top-20-ish countries by WhatsApp user base, plus a few request-favourites.
// The list is intentionally small — the UI offers a custom calling-code field.
export const COUNTRY_CODES: CountryCode[] = [
  { iso: "IN", name: "India", callingCode: "91", flag: "🇮🇳" },
  { iso: "BR", name: "Brazil", callingCode: "55", flag: "🇧🇷" },
  { iso: "ID", name: "Indonesia", callingCode: "62", flag: "🇮🇩" },
  { iso: "US", name: "United States", callingCode: "1", flag: "🇺🇸" },
  { iso: "MX", name: "Mexico", callingCode: "52", flag: "🇲🇽" },
  { iso: "PK", name: "Pakistan", callingCode: "92", flag: "🇵🇰" },
  { iso: "NG", name: "Nigeria", callingCode: "234", flag: "🇳🇬" },
  { iso: "GB", name: "United Kingdom", callingCode: "44", flag: "🇬🇧" },
  { iso: "DE", name: "Germany", callingCode: "49", flag: "🇩🇪" },
  { iso: "FR", name: "France", callingCode: "33", flag: "🇫🇷" },
  { iso: "ES", name: "Spain", callingCode: "34", flag: "🇪🇸" },
  { iso: "IT", name: "Italy", callingCode: "39", flag: "🇮🇹" },
  { iso: "TR", name: "Turkey", callingCode: "90", flag: "🇹🇷" },
  { iso: "EG", name: "Egypt", callingCode: "20", flag: "🇪🇬" },
  { iso: "AR", name: "Argentina", callingCode: "54", flag: "🇦🇷" },
  { iso: "CO", name: "Colombia", callingCode: "57", flag: "🇨🇴" },
  { iso: "AE", name: "United Arab Emirates", callingCode: "971", flag: "🇦🇪" },
  { iso: "SA", name: "Saudi Arabia", callingCode: "966", flag: "🇸🇦" },
  { iso: "ZA", name: "South Africa", callingCode: "27", flag: "🇿🇦" },
  { iso: "AU", name: "Australia", callingCode: "61", flag: "🇦🇺" },
  { iso: "CA", name: "Canada", callingCode: "1", flag: "🇨🇦" },
  { iso: "PH", name: "Philippines", callingCode: "63", flag: "🇵🇭" },
  { iso: "VN", name: "Vietnam", callingCode: "84", flag: "🇻🇳" },
  { iso: "BD", name: "Bangladesh", callingCode: "880", flag: "🇧🇩" },
  { iso: "MY", name: "Malaysia", callingCode: "60", flag: "🇲🇾" },
  { iso: "TH", name: "Thailand", callingCode: "66", flag: "🇹🇭" },
  { iso: "KR", name: "South Korea", callingCode: "82", flag: "🇰🇷" },
  { iso: "JP", name: "Japan", callingCode: "81", flag: "🇯🇵" },
  { iso: "CN", name: "China", callingCode: "86", flag: "🇨🇳" },
  { iso: "RU", name: "Russia", callingCode: "7", flag: "🇷🇺" },
  { iso: "NL", name: "Netherlands", callingCode: "31", flag: "🇳🇱" },
  { iso: "PL", name: "Poland", callingCode: "48", flag: "🇵🇱" },
  { iso: "SE", name: "Sweden", callingCode: "46", flag: "🇸🇪" },
  { iso: "CH", name: "Switzerland", callingCode: "41", flag: "🇨🇭" },
  { iso: "NO", name: "Norway", callingCode: "47", flag: "🇳🇴" },
  { iso: "IE", name: "Ireland", callingCode: "353", flag: "🇮🇪" },
  { iso: "NZ", name: "New Zealand", callingCode: "64", flag: "🇳🇿" },
  { iso: "SG", name: "Singapore", callingCode: "65", flag: "🇸🇬" },
  { iso: "HK", name: "Hong Kong", callingCode: "852", flag: "🇭🇰" },
  { iso: "PT", name: "Portugal", callingCode: "351", flag: "🇵🇹" },
];

export interface WhatsAppInput {
  /** Calling code (digits only, no +). When empty, the engine assumes the
   *  user typed an already-internationalised number. */
  callingCode: string;
  /** Local digits. May contain spaces, dashes or parentheses; we strip them. */
  phone: string;
  /** Optional pre-filled message. */
  message: string;
}

export interface WhatsAppOutput {
  /** Full digits-only number (calling code + local), no +. */
  fullPhone: string;
  /** wa.me URL — empty when phone is invalid. */
  url: string;
  /** WhatsApp Web URL — opens directly in the desktop client when installed. */
  webUrl: string;
  /** Click-to-chat API URL (legacy /send?phone=… variant). */
  apiUrl: string;
  /** Validation issues — empty array means the input is valid. */
  issues: string[];
}

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

export function build(input: WhatsAppInput): WhatsAppOutput {
  const issues: string[] = [];
  const localDigits = digitsOnly(input.phone);
  const ccDigits = digitsOnly(input.callingCode);

  let full = "";
  if (!localDigits) {
    issues.push("Enter the recipient's phone number.");
  } else if (localDigits.length < 4) {
    issues.push("The phone number looks too short.");
  } else {
    full = localDigits.startsWith(ccDigits) ? localDigits : `${ccDigits}${localDigits}`;
    if (full.length > E164_MAX_LENGTH) {
      issues.push(`Numbers can be at most ${E164_MAX_LENGTH} digits (E.164 limit).`);
    }
    if (!ccDigits && localDigits.length < 10) {
      issues.push("Add a country dial code so WhatsApp knows where to route the chat.");
    }
  }

  // Always encode the message; an empty string is allowed.
  const encoded = encodeURIComponent(input.message);

  const url = full ? `https://wa.me/${full}${encoded ? `?text=${encoded}` : ""}` : "";
  const webUrl = full ? `https://api.whatsapp.com/send/?phone=${full}${encoded ? `&text=${encoded}` : ""}` : "";
  const apiUrl = full ? `whatsapp://send?phone=${full}${encoded ? `&text=${encoded}` : ""}` : "";

  return { fullPhone: full, url, webUrl, apiUrl, issues };
}

export function countMessageChars(message: string): number {
  // WhatsApp doesn't impose a strict client-side message limit, but the
  // URL encoding makes very long messages unreliable on iOS. We expose the
  // raw character count and the encoded length for the UI.
  return [...message].length;
}

export function encodedLength(message: string): number {
  return encodeURIComponent(message).length;
}
