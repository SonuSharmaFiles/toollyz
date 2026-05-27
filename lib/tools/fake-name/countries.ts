export interface CountryConfig {
  code: string; // ISO 3166-1 alpha-2 (or generic like AR)
  name: string;
  flag: string;
  locale: string; // faker locale key
  timezone: string;
  cities?: string[];
}

export const COUNTRIES: CountryConfig[] = [
  { code: "US", name: "United States", flag: "🇺🇸", locale: "en_US", timezone: "America/New_York" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", locale: "en_GB", timezone: "Europe/London" },
  { code: "IN", name: "India", flag: "🇮🇳", locale: "en_IN", timezone: "Asia/Kolkata" },
  {
    code: "NP",
    name: "Nepal",
    flag: "🇳🇵",
    locale: "en_NP_custom",
    timezone: "Asia/Kathmandu",
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
    ],
  },
  { code: "JP", name: "Japan", flag: "🇯🇵", locale: "ja", timezone: "Asia/Tokyo" },
  { code: "CN", name: "China", flag: "🇨🇳", locale: "zh_CN", timezone: "Asia/Shanghai" },
  { code: "DE", name: "Germany", flag: "🇩🇪", locale: "de", timezone: "Europe/Berlin" },
  { code: "FR", name: "France", flag: "🇫🇷", locale: "fr", timezone: "Europe/Paris" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", locale: "pt_BR", timezone: "America/Sao_Paulo" },
  { code: "RU", name: "Russia", flag: "🇷🇺", locale: "ru", timezone: "Europe/Moscow" },
  {
    code: "AR",
    name: "Arabic-speaking",
    flag: "🇸🇦",
    locale: "ar",
    timezone: "Asia/Riyadh",
  },
];

export const COUNTRY_BY_CODE: Record<string, CountryConfig> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

export const NEPAL_NAMES = {
  maleFirst: [
    "Aarav", "Sundar", "Bibek", "Rajesh", "Sunil", "Prakash", "Hari", "Krishna",
    "Bishal", "Sagar", "Saurav", "Ramesh", "Suresh", "Dipesh", "Anil", "Nirajan",
    "Ujjwal", "Sanjay", "Manoj", "Niraj",
  ],
  femaleFirst: [
    "Sita", "Gita", "Sushma", "Anita", "Pooja", "Priya", "Reshma", "Sabina",
    "Sushila", "Aastha", "Sneha", "Nisha", "Sarita", "Asmita", "Maya", "Sushmita",
    "Bina", "Sajita", "Diksha", "Karuna",
  ],
  last: [
    "Sharma", "Adhikari", "Thapa", "Karki", "Shrestha", "Maharjan", "Gurung",
    "Tamang", "Rai", "Limbu", "Magar", "Pun", "Bhattarai", "Khadka", "Acharya",
    "Pandey", "Pokharel", "Joshi", "KC", "Lamichhane",
  ],
};
