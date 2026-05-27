export interface CountryConfig {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string; // emoji
  locale: string; // faker locale key
  timezone: string;
  latBounds: [number, number];
  lngBounds: [number, number];
  phoneFormat?: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    locale: "en_US",
    timezone: "America/New_York",
    latBounds: [25, 49],
    lngBounds: [-125, -67],
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    locale: "en_GB",
    timezone: "Europe/London",
    latBounds: [49.9, 58.7],
    lngBounds: [-8, 1.7],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    locale: "en_CA",
    timezone: "America/Toronto",
    latBounds: [42, 60],
    lngBounds: [-141, -53],
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    locale: "en_AU",
    timezone: "Australia/Sydney",
    latBounds: [-43, -10],
    lngBounds: [113, 153],
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    locale: "de",
    timezone: "Europe/Berlin",
    latBounds: [47.3, 55],
    lngBounds: [5.9, 15],
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    locale: "fr",
    timezone: "Europe/Paris",
    latBounds: [42, 51],
    lngBounds: [-5, 8],
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    locale: "en_IN",
    timezone: "Asia/Kolkata",
    latBounds: [8, 35],
    lngBounds: [68, 97],
  },
  {
    code: "NP",
    name: "Nepal",
    flag: "🇳🇵",
    locale: "en_NP_custom",
    timezone: "Asia/Kathmandu",
    latBounds: [26.3, 30.4],
    lngBounds: [80.0, 88.2],
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    locale: "ja",
    timezone: "Asia/Tokyo",
    latBounds: [24, 45.5],
    lngBounds: [122, 146],
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    locale: "pt_BR",
    timezone: "America/Sao_Paulo",
    latBounds: [-33, 5],
    lngBounds: [-74, -34],
  },
];

export const COUNTRY_BY_CODE: Record<string, CountryConfig> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

// Nepal-specific data (faker has no ne_NP locale)
export const NEPAL = {
  cities: [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Pokhara",
    "Biratnagar",
    "Birgunj",
    "Janakpur",
    "Nepalgunj",
    "Hetauda",
    "Dharan",
    "Butwal",
    "Itahari",
    "Bharatpur",
    "Damak",
    "Tulsipur",
    "Dhangadhi",
    "Birendranagar",
    "Siddharthanagar",
  ],
  provinces: [
    "Koshi",
    "Madhesh",
    "Bagmati",
    "Gandaki",
    "Lumbini",
    "Karnali",
    "Sudurpashchim",
  ],
  postalCodes: ["44600", "44700", "33700", "44811", "56700", "32900", "45200", "32500", "44107", "45100"],
  streets: [
    "Durbar Marg",
    "New Road",
    "Putalisadak",
    "Maitighar",
    "Thapathali",
    "Jawalakhel",
    "Pulchowk",
    "Lazimpat",
    "Boudha Marg",
    "Lakeside",
    "Damside",
    "Mahendrapool",
    "Tinkune",
    "Baluwatar",
    "Sankhamul",
  ],
};
