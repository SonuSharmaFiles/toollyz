import {
  QrCode,
  Binary,
  Link2,
  Braces,
  AlignLeft,
  TextCursorInput,
  AlignJustify,
  Palette,
  Hash,
  KeyRound,
  ImageDown,
  FileCode,
  CaseSensitive,
  Fingerprint,
  Tags,
  Bot,
  Clock,
  Regex,
  ShieldCheck,
  FileMinus,
  ScanLine,
  MapPin,
  UserCircle,
  AtSign,
  Wifi,
  LockKeyhole,
  Volume2,
  Waves,
  Shuffle,
  Coins,
  Grid3x3,
  CircleDot,
  HelpCircle,
  Ticket,
  Smile,
  Lightbulb,
  Laugh,
  Quote,
  Calendar,
  Stars,
  Barcode,
  Pilcrow,
  NotebookPen,
  FileType,
  SquareCode,
  Sparkle,
  EyeOff,
  CodeXml,
  Code,
  FileCode2,
  Lock,
  Clipboard,
  Gauge,
  Activity,
  Globe,
  Network,
  AppWindow,
  MonitorSmartphone,
  Battery,
  Monitor,
  Keyboard,
  MousePointer,
  Mic,
  Webcam,
  Pipette,
  Paintbrush,
  Image as ImageIcon,
  FileImage,
  Speaker,
  AudioLines,
  Banknote,
  Link as LinkIcon,
  BarChart3,
  SearchCheck,
  Brush,
  Scaling,
  PartyPopper,
  Signature,
  FilePlus,
  Scissors,
  FileOutput,
  FileInput,
  Camera,
  FileUser,
  Receipt,
  TimerReset,
  MousePointerClick,
  Move,
  SquareAsterisk,
  Timer,
  AlarmClock,
  Hourglass,
  Cake,
  CalendarDays,
  Sunrise,
  Wallet,
  Landmark,
  Percent,
  Fuel,
  HeartPulse,
  Flame,
  Droplet,
  Heart,
  Star,
  DollarSign,
  // ─── Added in second batch ───
  GitCompareArrows,
  ListMinus,
  ArrowDownAZ,
  FileLock2,
  Cookie,
  Key,
  KeySquare,
  ShieldHalf,
  CalendarClock,
  Database,
  FileCog,
  DatabaseZap,
  Terminal,
  ServerCog,
  ListChecks,
  FileQuestion,
  FileSearch,
  ScanSearch,
  BadgeCheck,
  FileX,
  Search,
  DatabaseBackup,
  Files,
  Cog,
  ArrowRightLeft,
  Smartphone,
  ShieldAlert,
  Map,
  MailCheck,
  MailSearch,
  MailX,
  Mailbox,
  ContactRound,
  Contact,
  UserCircle2,
  ImagePlus,
  RadioTower,
  SignalHigh,
  Languages,
  Layers,
  Layers2,
  Layers3,
  Box,
  Boxes,
  Frame,
  Spline,
  Globe2,
  BookImage,
  FileSpreadsheet,
  Package,
  BookText,
  Megaphone,
  MessagesSquare,
  MessageCircle,
  Tv,
  Tv2,
  Film,
  Highlighter,
  Wand2,
  WandSparkles,
  BookOpenText,
  Link2Off,
} from "lucide-react";
import type { Tool } from "./types";

export const tools: Tool[] = [
  // ─── GENERATORS ──────────────────────────────────────────────────────────
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    tagline: "Generate QR codes for any text or URL — download as PNG.",
    description:
      "Create high-quality, fully customizable QR codes in seconds. Choose size, error correction, colors, and download as a crisp PNG ready for print or web.",
    categoryId: "generators",
    icon: QrCode,
    status: "live",
    featured: true,
    keywords: ["qr", "qr code", "qr generator", "barcode", "scan", "url to qr"],
    seo: {
      title: "Free QR Code Generator — Create & Download QR Codes Instantly",
      description:
        "Generate custom QR codes for any text or URL. Pick size, colors and error correction, then download as PNG. 100% free, private and instant.",
      what:
        "A QR Code Generator turns any text, link, Wi-Fi credential or contact information into a scannable Quick Response (QR) code. Modern phones can read these codes from any camera app, making them perfect for sharing links, menus, payment details, or product info.",
      how: [
        "Type or paste your text, URL or any other content into the input field.",
        "Adjust the size, foreground and background colors, and error-correction level to match your use case.",
        "Click 'Download PNG' to save a high-resolution image you can use anywhere.",
      ],
      benefits: [
        "100% client-side — your data never leaves your browser.",
        "High-resolution PNG export ready for print or web.",
        "Customizable colors, sizing and error correction (L/M/Q/H).",
        "Works for URLs, Wi-Fi credentials, plain text, vCards and more.",
        "No signup, no watermark, completely free.",
      ],
      faqs: [
        {
          q: "Is the QR Code Generator free to use?",
          a: "Yes — Toollyz QR Code Generator is 100% free with no usage limits, no signup, and no watermark on the generated images.",
        },
        {
          q: "Where is my data processed?",
          a: "All QR generation happens in your browser. Your input never reaches our servers, making this tool completely private.",
        },
        {
          q: "What error-correction level should I use?",
          a: "L (Low) ~7% recovery, M (Medium) ~15%, Q (Quartile) ~25%, H (High) ~30%. Use H if you plan to add a logo or print on materials that could get damaged.",
        },
        {
          q: "Can I customize the colors of my QR code?",
          a: "Yes — pick any foreground and background color. Make sure to keep enough contrast so the code remains scannable.",
        },
        {
          q: "What image format does the download use?",
          a: "QR codes are downloaded as high-resolution PNG files with a transparent-friendly background option.",
        },
      ],
    },
  },
  {
    slug: "qr-code-scanner",
    name: "QR Code Scanner",
    tagline: "Scan and decode QR codes from your camera or an uploaded image.",
    description:
      "Scan QR codes directly from your webcam or by uploading an image. Instantly decode URLs, text, Wi-Fi credentials and more — all in your browser.",
    categoryId: "generators",
    icon: ScanLine,
    status: "coming-soon",
    keywords: ["qr", "qr scanner", "decode", "camera", "barcode scanner"],
  },
  {
    slug: "wifi-qr-code-generator",
    name: "WiFi QR Code Generator",
    tagline:
      "Create scannable WiFi QR codes and printable cards — guests join in one tap.",
    description:
      "Generate WiFi QR codes that connect guests to your network in a single scan. Customize colors, pick from four printable card templates (Minimal, Café, Office, Home), and export as PNG, SVG or JPG.",
    categoryId: "generators",
    icon: Wifi,
    status: "live",
    featured: true,
    keywords: [
      "wifi qr code generator",
      "wifi qr code",
      "share wifi",
      "wifi card",
      "guest wifi",
      "wpa qr",
      "scannable wifi",
      "hidden network qr",
      "cafe wifi",
      "restaurant wifi",
    ],
    seo: {
      title:
        "WiFi QR Code Generator — Create WiFi QR Codes Online Free | Toollyz",
      description:
        "Generate WiFi QR codes instantly. Create scannable QR codes for any WiFi network, customize colors, pick printable card templates and download as PNG, SVG or JPG — 100% free.",
      what:
        "A WiFi QR Code is a special QR code that, when scanned by a phone's camera, automatically connects the device to a WiFi network — no typing required. Toollyz WiFi QR Code Generator produces standard-compliant codes (the same format Android and iOS use natively), with customizable colors, four printable card templates, and built-in print and download in PNG, SVG and JPG.",
      how: [
        "Enter your network name (SSID) and password, then pick the security type (WPA, WEP or open).",
        "Customize the QR size, margin, foreground and background colors — or pick a preset palette.",
        "Pick a printable card template (Minimal, Café, Office or Home) for a polished poster-ready design.",
        "Download as PNG, SVG or JPG, copy the WiFi details, or print a card directly with one click.",
      ],
      benefits: [
        "Standard-compliant WiFi QR format — scans natively on iPhone, Android and most QR apps.",
        "Four premium printable card templates: Minimal, Café, Office, Home.",
        "Full color customization with 5 curated presets plus custom hex picker.",
        "Multiple output formats: PNG, SVG (lossless print) and JPG.",
        "Print a beautifully formatted card directly from your browser.",
        "Hidden network support with one toggle.",
        "Recent networks + favourites saved locally in your browser — never on any server.",
        "100% client-side — your WiFi password never leaves your device.",
      ],
      relatedSlugs: [
        "qr-code-generator",
        "barcode-generator",
        "password-generator",
        "secure-notes",
      ],
      faqs: [
        {
          q: "What is a WiFi QR code?",
          a: "A WiFi QR code is a QR code that encodes the network name (SSID), password and security type using the standard 'WIFI:T:...;S:...;P:...;;' format. When scanned by a phone's camera, the phone offers to join the network automatically — no typing required.",
        },
        {
          q: "How do I scan a WiFi QR code?",
          a: "Open your phone's camera app and point it at the QR code. Both iOS (13+) and Android (10+) recognize WiFi codes natively and offer a 'Connect to network' prompt. Older devices may need a dedicated QR scanner app.",
        },
        {
          q: "Are WiFi QR codes secure?",
          a: "The WiFi password is encoded directly inside the QR code, so anyone with line-of-sight to the printed code can read it with a scanner. Treat a WiFi QR code like a printed password — only display it where you'd be comfortable showing the password.",
        },
        {
          q: "Can iPhones scan WiFi QR codes?",
          a: "Yes — iOS 13 and newer can scan WiFi QR codes natively from the Camera app. The phone will show a banner offering to join the network. No app installation required.",
        },
        {
          q: "Do Android phones support WiFi QR codes?",
          a: "Yes — Android 10 and newer scan WiFi QR codes natively from the camera. You can also generate them from the WiFi settings on most modern Android devices.",
        },
        {
          q: "Can I create a QR code for a hidden network?",
          a: "Yes — toggle the 'Hidden network' option. This adds H:true to the QR string, telling phones to add the network even if it's not broadcasting its SSID.",
        },
        {
          q: "What security types are supported?",
          a: "WPA / WPA2 / WPA3 (the modern standard), WEP (legacy, deprecated — only use if you must), and open networks with no password. WPA3 networks scan correctly using the WPA setting since the QR format doesn't distinguish between WPA generations.",
        },
        {
          q: "Can I print WiFi QR codes?",
          a: "Yes — Toollyz includes four printable card templates. Click 'Print card' to open a clean, print-ready version with your QR code, network name, password and connection instructions, then print directly or save as PDF.",
        },
        {
          q: "Are my WiFi passwords stored or transmitted?",
          a: "No — Toollyz generates everything in your browser using the Web's built-in crypto. Your SSID and password never reach our servers. The optional 'Save' button stores recent networks only in your browser's localStorage, on your device.",
        },
        {
          q: "Is this WiFi QR generator free?",
          a: "Yes — completely free with no signup, no usage limits and no watermark on any output. Use it as often as you like for personal, café, restaurant, office or commercial purposes.",
        },
      ],
    },
  },
  {
    slug: "barcode-generator",
    name: "Barcode Generator",
    tagline: "Generate barcodes in EAN, UPC, Code 128 and more.",
    description:
      "Create scannable barcodes in every popular standard. Customize size, format and download as PNG or SVG.",
    categoryId: "generators",
    icon: Barcode,
    status: "coming-soon",
    keywords: ["barcode", "ean", "upc", "code 128", "isbn"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    tagline: "Generate v1, v4, v6 and v7 UUIDs in bulk — validate any UUID instantly.",
    description:
      "Generate universally unique identifiers (UUIDs) for any version — v1, v4, v6 or v7. Bulk-generate, copy, download or paste in a UUID to validate it and reveal its version.",
    categoryId: "generators",
    icon: Fingerprint,
    status: "live",
    featured: true,
    keywords: [
      "uuid",
      "uuid generator",
      "guid",
      "guid generator",
      "uuid v4",
      "uuid v1",
      "uuid v7",
      "uuid v6",
      "uuid validator",
      "unique identifier",
      "rfc 4122",
    ],
    seo: {
      title: "UUID Generator — Generate UUID v1, v4, v6 & v7 Online Free | Toollyz",
      description:
        "Generate secure UUIDs instantly. Create UUID v1, v4, v6 and v7 identifiers, validate UUIDs, copy bulk UUIDs and download results — 100% free, private and instant.",
      what:
        "A Universally Unique Identifier (UUID) is a 128-bit value used to uniquely identify items across distributed systems without coordination. Toollyz UUID Generator creates RFC 4122-compliant UUIDs in your browser — supporting versions 1, 4, 6 and 7, plus a validator that detects the version of any UUID you paste in.",
      how: [
        "Pick the UUID version you need — v4 is the safe default for most apps.",
        "Choose how many UUIDs to generate (1 to 100) and toggle uppercase or remove hyphens if needed.",
        "Click Generate to create UUIDs instantly. Copy individual UUIDs, copy all, or download as a TXT file.",
        "Switch to the Validate tab and paste any UUID to verify it and reveal its version.",
      ],
      benefits: [
        "100% client-side — UUIDs are generated in your browser and never sent to any server.",
        "Supports every modern UUID version: v1, v4 (random), v6 (sortable v1) and v7 (Unix-time prefixed).",
        "Bulk-generate up to 100 UUIDs at once — copy all or download as TXT in one click.",
        "Built-in validator that detects version and surfaces UUID structure.",
        "Formatting controls — UPPERCASE and hyphen-stripped output for any system.",
        "Auto-refresh mode for live regeneration when you need quick variety.",
        "Cryptographically random v4 UUIDs powered by the Web Crypto API.",
      ],
      relatedSlugs: [
        "password-generator",
        "hash-generator",
        "base64-encoder-decoder",
        "json-formatter",
      ],
      faqs: [
        {
          q: "What is a UUID?",
          a: "A UUID (Universally Unique Identifier) is a 128-bit value formatted as 36 characters (32 hex + 4 hyphens) used to uniquely identify resources across systems without a central coordinator. UUIDs follow the RFC 4122 specification.",
        },
        {
          q: "Is UUID v4 truly random?",
          a: "Yes — UUID v4 takes 122 random bits from a cryptographically strong random number generator (the Web Crypto API in browsers). The remaining 6 bits encode the version (4) and variant (RFC 4122).",
        },
        {
          q: "Are UUIDs guaranteed to be unique?",
          a: "Not strictly guaranteed, but the probability of a v4 collision is so small it can be treated as zero in practice. You'd need to generate billions of UUIDs every second for centuries to have any meaningful collision risk.",
        },
        {
          q: "Can UUIDs collide?",
          a: "Theoretically yes, but the odds are vanishingly small for v4. A single collision in v4 would require roughly 2.71 × 10¹⁸ generated UUIDs before reaching a 50% chance of one collision — far beyond any realistic workload.",
        },
        {
          q: "Which UUID version should I use?",
          a: "Use v4 for most general-purpose IDs. Use v7 for database primary keys that benefit from time-ordering (indexes stay tight). Use v6 when you need v1-like time data but in a sortable order. Use v1 only when you specifically need MAC + timestamp embedding.",
        },
        {
          q: "Are UUIDs secure?",
          a: "v4 UUIDs are unpredictable and safe to use as IDs — but they are not secrets. Don't use UUIDs as authentication tokens, session keys or to authorize access. For those, use a dedicated cryptographically-random token instead.",
        },
        {
          q: "How long is a UUID?",
          a: "A UUID is 128 bits (16 bytes). In its canonical text form it's 36 characters: 32 hex digits plus 4 hyphens. Stripped of hyphens it's 32 characters.",
        },
        {
          q: "Why use UUIDs instead of auto-increment IDs?",
          a: "UUIDs can be generated anywhere — on the client, across distributed services, or offline — without coordinating with a database. They also avoid leaking row counts and don't reveal creation order (except for v6/v7, which intentionally do for sortability).",
        },
        {
          q: "What's the difference between UUID v1 and v4?",
          a: "v1 encodes a 60-bit timestamp and the generating machine's MAC address — useful for sorting by creation time but slightly reveals where it was generated. v4 is purely random with no embedded data — privacy-safer and the most common choice.",
        },
        {
          q: "What is UUID v7 and why is it popular?",
          a: "UUID v7 prefixes the value with a 48-bit Unix timestamp (millisecond precision), making UUIDs sortable in time order. This is ideal for database indexes — they pack tightly and stay in B-tree order, dramatically improving insert performance compared to random v4 IDs.",
        },
      ],
    },
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    tagline:
      "Generate placeholder text in 6 styles — classic, tech, startup, marketing, minimal or funny.",
    description:
      "Produce paragraphs, sentences, words or exact character counts of placeholder text. Pick from six themed vocabularies, control formatting, and copy or download instantly.",
    categoryId: "generators",
    icon: AlignJustify,
    status: "live",
    featured: true,
    keywords: [
      "lorem ipsum",
      "lorem ipsum generator",
      "placeholder text",
      "dummy text",
      "filler text",
      "mock content",
      "design copy",
      "tech ipsum",
      "startup ipsum",
      "random paragraphs",
    ],
    seo: {
      title:
        "Lorem Ipsum Generator — Generate Placeholder Text Online Free | Toollyz",
      description:
        "Generate Lorem Ipsum placeholder text instantly. Create paragraphs, sentences, words, or custom-length placeholder text in 6 styles for websites, UI mockups, apps and design projects.",
      what:
        "Lorem Ipsum is scrambled placeholder text used in design and publishing to fill space before real content is available. Toollyz Lorem Ipsum Generator goes further — it produces classic Latin filler plus five modern themed vocabularies (tech, startup, marketing, minimal, funny) so your mockups feel closer to the actual product.",
      how: [
        "Pick what to generate — paragraphs, sentences, words or exact character count.",
        "Choose an ipsum mode (Classic, Tech, Startup, Marketing, Minimal, or Funny) to set the vocabulary.",
        "Dial in quantity using the slider or a preset, and toggle commas, line breaks or the classic opening line.",
        "Pick an output format — Plain text, HTML <p> tags, or Markdown — then copy or download.",
      ],
      benefits: [
        "Six themed vocabularies — classic Latin, tech, startup, marketing, minimal and funny.",
        "Generate by paragraphs, sentences, words or exact character count.",
        "Live word, character, sentence, paragraph and reading-time stats.",
        "Output as plain text, HTML <p> tags or Markdown — copy or download as TXT/HTML/MD.",
        "Toggle commas, line breaks and the classic Lorem ipsum opener.",
        "100% client-side — no signup, no usage limits, no watermark.",
      ],
      relatedSlugs: [
        "case-converter",
        "character-counter",
        "word-counter",
        "markdown-editor",
      ],
      faqs: [
        {
          q: "What is Lorem Ipsum?",
          a: "Lorem Ipsum is dummy placeholder text used by the printing and design industries since the 1500s. It's deliberately meaningless so readers focus on the visual layout rather than the content. The traditional version is scrambled Latin from Cicero's 'De finibus bonorum et malorum' written in 45 BC.",
        },
        {
          q: "Why do designers use Lorem Ipsum?",
          a: "Real copy distracts reviewers — they end up critiquing the writing instead of the layout. Lorem Ipsum has the rough word-length and rhythm of real English, so a design looks finished without anyone getting hooked on the words.",
        },
        {
          q: "What does Lorem Ipsum actually mean?",
          a: "It doesn't mean anything coherent. It comes from a scrambled passage of Cicero — the original Latin includes 'Dolorem ipsum quia dolor sit amet...' which roughly means 'pain itself, because pain is...'. Modern Lorem Ipsum is a typographic descendant of that text.",
        },
        {
          q: "Is Lorem Ipsum copyrighted?",
          a: "No. Lorem Ipsum is over 2,000 years old in its original form and the modern scrambled version has been in the public domain for centuries. You can use it freely in any project.",
        },
        {
          q: "Can I use Lorem Ipsum commercially?",
          a: "Yes — Lorem Ipsum is free to use in any commercial, personal or open-source project. There are no licensing requirements.",
        },
        {
          q: "How many words are in the standard Lorem Ipsum?",
          a: "The classic passage that begins 'Lorem ipsum dolor sit amet…' is about 70 words. The full traditional Lipsum library contains roughly 200 unique words shuffled into endless variations.",
        },
        {
          q: "Is Lorem Ipsum SEO friendly?",
          a: "Not in production. Search engines see Lorem Ipsum as low-quality, non-original content. Always replace placeholder text with your real copy before launching a page publicly.",
        },
        {
          q: "Can Lorem Ipsum hurt my SEO?",
          a: "Yes if it ships to production. Google can detect placeholder text and may demote pages that contain it. Use Lorem Ipsum only during design and development, never on indexed live pages.",
        },
        {
          q: "What's the best Lorem Ipsum generator?",
          a: "A good generator gives you control — paragraphs vs sentences vs character counts, multiple vocabularies for different design moods, easy copy/download, and clean output formats. Toollyz combines all of those with six themed vocabularies and a real stats panel.",
        },
        {
          q: "How do I generate random paragraphs?",
          a: "Pick 'Paragraphs' as the generation type, dial in how many you need with the slider or preset, choose a mode, and click Regenerate. Each click reshuffles the words for a fresh layout-friendly block.",
        },
      ],
    },
  },
  {
    slug: "fake-address-generator",
    name: "Fake Address Generator",
    tagline:
      "Generate realistic fake addresses, names, phones and emails from 10 countries.",
    description:
      "Generate believable fake postal addresses with full identity-style data from the US, UK, Canada, Australia, Germany, France, India, Nepal, Japan and Brazil. Export as TXT, CSV or JSON — perfect for testing, mockups and demos.",
    categoryId: "generators",
    icon: MapPin,
    status: "live",
    featured: true,
    keywords: [
      "fake address generator",
      "fake address",
      "test address",
      "dummy address",
      "random address",
      "mock data",
      "test data generator",
      "fake name",
      "fake phone",
      "fake email",
      "fake identity",
      "qa testing",
    ],
    seo: {
      title:
        "Fake Address Generator — Generate Random Addresses Online | Toollyz",
      description:
        "Generate realistic fake addresses, names, phones and emails from 10+ countries. Export as TXT, CSV or JSON for testing, development and educational purposes — 100% free.",
      what:
        "A Fake Address Generator produces realistic-looking but entirely fictional postal addresses, names, contact details and identity data for use in testing and development. Toollyz Fake Address Generator covers ten countries with locale-aware formats — addresses look right for the United States, United Kingdom, Canada, Australia, Germany, France, India, Nepal, Japan and Brazil. Generated data is never real and must never be used to deceive anyone.",
      how: [
        "Pick a country (or choose Random) and how many addresses you want — 1, 5, 10, 25 or 50.",
        "Toggle which fields to include: phone, email, company and geo coordinates.",
        "Optionally filter by gender and age group for more realistic test personas.",
        "Click Generate, then copy individual fields, copy all, or export as TXT, CSV or JSON.",
      ],
      benefits: [
        "Ten country-specific locales with correct address, phone and postal-code formats.",
        "Bulk generate up to 50 addresses with a single click and paginate through them cleanly.",
        "Per-card copy, copy-all, plus three export formats (TXT, CSV, JSON) for any downstream tool.",
        "Optional geo coordinates within each country's actual bounding box, with timezone.",
        "Gender and age-group filters for realistic test personas.",
        "100% client-side — your generated data never touches a server.",
      ],
      relatedSlugs: [
        "fake-name-generator",
        "username-generator",
        "password-generator",
        "qr-code-generator",
      ],
      faqs: [
        {
          q: "What is a fake address generator?",
          a: "It's a tool that produces realistic-looking but completely fictional postal addresses — including streets, cities, postal codes, names, phone numbers and emails — for use in development, QA, design mockups and education. The data is invented, not pulled from any real database.",
        },
        {
          q: "Are the generated addresses real?",
          a: "No. Addresses are constructed from country-appropriate format rules and randomized name/street tokens. They look real because they follow the right patterns, but the specific combinations almost certainly don't exist.",
        },
        {
          q: "Is it legal to use fake addresses?",
          a: "Yes — for development, testing, education and design mockups. It is not legal to use fake addresses to deceive a service, commit fraud, evade verification, sign up for accounts that require real identity, or impersonate someone. Use them honestly.",
        },
        {
          q: "Why do developers use fake addresses?",
          a: "Real customer data shouldn't sit in dev or staging environments — that's a privacy risk. Fake addresses let teams seed databases, test forms, exercise validation rules, demo UIs to clients and run QA scripts without ever touching real personal data.",
        },
        {
          q: "Are the phone numbers real?",
          a: "No. They follow each country's standard formatting pattern (so they look like real numbers) but the digits are randomized. Calling them is not recommended — you may reach an actual unrelated person.",
        },
        {
          q: "Are the email addresses real?",
          a: "Generated emails combine fake names with real provider domains (gmail.com, outlook.com, etc.) but the local part is random. In rare cases, someone could happen to own that exact address — never send anything important to a generated email.",
        },
        {
          q: "How are fake addresses generated?",
          a: "Toollyz uses locale-aware data via faker — real city names, real state/province names and country-correct postal-code formats are combined with randomized street numbers and randomized identity tokens. Geo coordinates are randomized within each country's actual lat/long bounds.",
        },
        {
          q: "Can I generate addresses by country?",
          a: "Yes — ten countries are supported with correct formatting: US, UK, Canada, Australia, Germany, France, India, Nepal, Japan and Brazil. There is also a Random option that picks a country at random for each address.",
        },
        {
          q: "Can I export generated addresses?",
          a: "Yes — copy individual fields, copy the whole list as plain text, or download as TXT, CSV or JSON. The CSV opens directly in Excel, Google Sheets and any spreadsheet tool. The JSON is ready to seed any database or API.",
        },
        {
          q: "Is the fake address generator free?",
          a: "Yes — completely free with no signup, no usage limits and no watermark. Generation runs entirely in your browser, so we never see your data either.",
        },
      ],
    },
  },
  {
    slug: "fake-name-generator",
    name: "Fake Name Generator",
    tagline:
      "Generate realistic fake identities from 11 cultures — names, usernames, emails, jobs and more.",
    description:
      "Generate believable fictional identity profiles from 11 cultures and languages. Each identity includes full name, username, nickname, email, phone, occupation, age and location. Export TXT, CSV or JSON.",
    categoryId: "generators",
    icon: UserCircle,
    status: "live",
    featured: true,
    keywords: [
      "fake name generator",
      "random name generator",
      "fake identity",
      "test data generator",
      "mock identity",
      "fake username",
      "fake person",
      "name generator by country",
      "fake email",
      "qa testing",
      "demo data",
    ],
    seo: {
      title: "Fake Name Generator — Generate Random Names & Identities | Toollyz",
      description:
        "Generate realistic fake names and full identity profiles from 11 cultures. Names, usernames, emails, phones, occupations and birthdates for testing, development and creative projects — 100% free.",
      what:
        "A Fake Name Generator produces realistic-looking but entirely fictional identity profiles for use in development, QA, design mockups and creative writing. Toollyz Fake Name Generator covers eleven cultures — the United States, United Kingdom, India, Nepal, Japan, China, Germany, France, Brazil, Russia and Arabic-speaking countries — generating culturally-accurate names alongside usernames, emails, phone numbers, occupations and locations. All data is invented and must never be used to deceive anyone.",
      how: [
        "Pick a country / culture, or choose Random global to mix all 11 in one batch.",
        "Filter by gender (any / female / male) and age range (any / young / adult / senior).",
        "Toggle which fields each identity should include: username, email, phone, occupation, company, birthdate, middle name.",
        "Generate 1, 5, 10, 25, 50 or 100 identities and copy / download as TXT, CSV or JSON.",
      ],
      benefits: [
        "Eleven culture-accurate locales — Latin, Cyrillic, Arabic, Chinese and Japanese scripts.",
        "Full identity profiles — name, username, nickname, email, phone, occupation, company, age, birthdate, city.",
        "Smart username generation that derives ASCII handles even from non-Latin name scripts.",
        "Gender and age-range filters for realistic test personas.",
        "Bulk export TXT, CSV, JSON — CSV opens directly in spreadsheets.",
        "Per-card copy-as-text and copy-as-JSON, plus per-field hover-to-copy.",
        "100% client-side — generated identities never leave your browser.",
      ],
      relatedSlugs: [
        "fake-address-generator",
        "username-generator",
        "password-generator",
        "qr-code-generator",
      ],
      faqs: [
        {
          q: "What is a fake name generator?",
          a: "A tool that produces realistic-looking but completely fictional identity profiles — name, username, email, phone, occupation, location — for use in development, QA, design mockups, fiction and education. Every value is invented; no real person's data is used.",
        },
        {
          q: "Are the generated names real?",
          a: "No. Names are built from culturally-appropriate pools of first names and last names, randomly combined. The specific combinations almost certainly don't belong to any real person.",
        },
        {
          q: "Can I use fake names for testing?",
          a: "Yes — that's exactly what they're for. Real customer data shouldn't live in dev or staging environments because of privacy risk. Fake identities let you seed databases, demo UIs, write tests and exercise validation without ever touching real personal information.",
        },
        {
          q: "Is using fake names legal?",
          a: "Yes for development, testing, education, fiction and design mockups. It is not legal to use fake identities to deceive a service, commit fraud, evade verification, impersonate a real person, or sign up for accounts that require real identity. Use them honestly.",
        },
        {
          q: "Can I generate names by country?",
          a: "Yes — eleven cultures are supported with locale-aware datasets: US, UK, India, Nepal, Japan, China, Germany, France, Brazil, Russia and Arabic-speaking countries. There's also a Random global option that picks a culture per identity.",
        },
        {
          q: "How are fake usernames generated?",
          a: "Toollyz combines the generated first and last name into common username patterns — first.last, first_last, first[0]last, firstLast{number}, last.first[0], the{first}, first{year} — then normalizes non-Latin scripts to ASCII so the username works on any platform.",
        },
        {
          q: "Are the email addresses real?",
          a: "Emails combine the fake name with a real provider domain (gmail.com, outlook.com, etc.) but the local part is random. In rare cases a generated address might happen to belong to a real person, so never send anything important to one.",
        },
        {
          q: "Are the phone numbers real?",
          a: "No — they follow each country's standard format (so they look real) but the digits are randomized. Calling them isn't recommended; you may reach an unrelated person who happens to have that number.",
        },
        {
          q: "Can I export generated identities?",
          a: "Yes — copy single fields, copy a full profile as text or JSON, or bulk-export the whole batch as TXT, CSV or JSON. The CSV opens directly in Excel and Google Sheets; the JSON is ready to seed any database.",
        },
        {
          q: "Is this fake name generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Generation happens entirely in your browser, so we never see or store the identities you generate.",
        },
      ],
    },
  },
  {
    slug: "username-generator",
    name: "Username Generator",
    tagline:
      "Generate 10 styles of usernames — gaming, aesthetic, professional, brandable and more.",
    description:
      "Create unique, memorable usernames in 10 distinct styles. Filter by length and separator, save favorites locally, and instantly preview availability on Instagram, X, TikTok and GitHub.",
    categoryId: "generators",
    icon: AtSign,
    status: "live",
    featured: true,
    keywords: [
      "username generator",
      "username",
      "handle",
      "gamer tag",
      "screen name",
      "aesthetic usernames",
      "brandable username",
      "social media handle",
      "instagram username",
      "twitter handle",
      "tiktok handle",
    ],
    seo: {
      title: "Username Generator — Generate Cool & Unique Usernames | Toollyz",
      description:
        "Generate unique usernames instantly. 10 styles — gaming, aesthetic, professional, tech, brandable, funny, social media and more. Save favorites and check availability on Instagram, X, TikTok and GitHub.",
      what:
        "A Username Generator produces unique handles for online identities — social media, gaming, forums, developer accounts, brands and businesses. Toollyz Username Generator uses curated word lists, smart pattern logic and pronounceable algorithms to produce ten distinct styles of usernames you can actually use.",
      how: [
        "Pick a style — Random, Name-based, Gaming, Aesthetic, Professional, Tech, Brandable, Funny, Social media or Short.",
        "Optionally provide a seed (your name, nickname or favourite keyword) for personalized results.",
        "Adjust length, separator, casing and toggles for numbers, special characters and pronounceability.",
        "Generate, save favourites with the heart icon, then click the small platform badge to check availability on Instagram, X, TikTok or GitHub.",
      ],
      benefits: [
        "Ten generation styles — from edgy gaming handles to clean professional aliases.",
        "Smart pattern logic produces names that read like real usernames, not random gibberish.",
        "Pronounceable mode builds brandable usernames using consonant/vowel alternation.",
        "Length control with quick 4–6 / 6–10 / 10–15 presets and dual sliders.",
        "Save unlimited favorites — persisted locally in your browser, never sent to a server.",
        "One-click availability checks on Instagram, X, TikTok and GitHub.",
        "Export TXT or CSV for bulk use in spreadsheets and onboarding flows.",
      ],
      relatedSlugs: [
        "fake-name-generator",
        "password-generator",
        "fake-address-generator",
        "qr-code-generator",
      ],
      faqs: [
        {
          q: "What is a username generator?",
          a: "A username generator is a tool that produces creative, unique handles for online identities — gaming, social media, work accounts, forums or brands. Good generators combine real words, smart patterns and customizable rules so the output feels like something a person would actually pick.",
        },
        {
          q: "How do I create a unique username?",
          a: "Combine two unrelated concepts (a colour + an animal, a feeling + an object), add a number or short suffix, and check it across the platforms you care about. Toollyz does this automatically — generate a batch, save a few favourites, then click the platform icons to see what's still available.",
        },
        {
          q: "What makes a good username?",
          a: "Short enough to remember, easy to type, hard to misspell, and ideally pronounceable. Avoid lookalike characters (0/O, 1/l), excessive numbers, and underscores at the start. Aim for 6–14 characters and pick something that scales across platforms.",
        },
        {
          q: "Can I generate gaming usernames?",
          a: "Yes. The Gaming mode uses an aggressive vocabulary (shadow, reaper, voidwalker, kraken) and patterns like X_Username_X, name+number and prefixed handles. Combine with the Numbers toggle for classic gamer-tag energy.",
        },
        {
          q: "Can I create aesthetic usernames?",
          a: "Yes — Aesthetic mode pulls from a soft, dreamy vocabulary (lunar, velvet, moonbeam, lullaby, gossamer). Combine with the dot separator and lowercase casing for the classic minimalist look.",
        },
        {
          q: "Are generated usernames unique?",
          a: "Each batch is deduplicated locally, so you won't see the same username twice. Across the global pool, usernames are not guaranteed to be unique — that's why we add availability checks. Use the platform badges to quickly see if a handle is taken.",
        },
        {
          q: "Can I check username availability?",
          a: "Toollyz provides one-click availability previews — click the small Instagram, X, TikTok or GitHub badge on any card and the platform opens with that handle. A 404 means the handle is free. We don't store or transmit your generated usernames anywhere.",
        },
        {
          q: "How long should a username be?",
          a: "6–14 characters is the sweet spot for most platforms. Twitter/X allows up to 15, Instagram up to 30, TikTok up to 24, Discord 32. Shorter is easier to remember and type, but the shorter you go the harder availability gets.",
        },
        {
          q: "What usernames work best for branding?",
          a: "Brandable usernames are short, made-up, pronounceable, and have no negative meaning in major languages. Toollyz's Brandable mode generates these using consonant/vowel alternation — think 'zenova', 'byteflux', 'kavora'. They sound like real product names.",
        },
        {
          q: "Is this username generator free?",
          a: "Yes — completely free with no signup, no usage limits and no watermark. Generation runs entirely in your browser, and your saved favourites live only in your browser's localStorage. We never see your data.",
        },
      ],
    },
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    tagline:
      "Create strong, secure passwords in 6 modes — with live entropy and crack-time analysis.",
    description:
      "Generate cryptographically secure passwords using the Web Crypto API. Six modes: Random, Memorable, Passphrase, PIN, WiFi and API Key — each with real-time entropy, strength rating and crack-time estimate.",
    categoryId: "generators",
    icon: KeyRound,
    status: "live",
    featured: true,
    keywords: [
      "password generator",
      "secure password",
      "strong password",
      "random password",
      "passphrase generator",
      "pin generator",
      "api key generator",
      "password strength",
      "password entropy",
      "wifi password",
    ],
    seo: {
      title: "Password Generator — Create Strong Secure Passwords | Toollyz",
      description:
        "Generate strong secure passwords instantly. Six modes — Random, Memorable, Passphrase, PIN, WiFi, API Key — with live entropy analysis. 100% client-side, never stored or transmitted.",
      what:
        "A Password Generator produces unpredictable strings of characters that resist brute-force, dictionary and credential-stuffing attacks. Toollyz Password Generator uses the browser's cryptographically secure Web Crypto API (window.crypto.getRandomValues) — the same source modern operating systems trust for key generation — and analyzes every result for entropy and estimated crack time. Six modes cover everything from random alphanumeric passwords to memorable passphrases, PINs, WiFi credentials and API keys.",
      how: [
        "Pick a mode — Random, Memorable, Passphrase, PIN, WiFi or API Key — based on what you'll use the password for.",
        "Adjust length and toggle character classes (lowercase, uppercase, numbers, symbols) plus advanced rules like exclude-similar, avoid-repeats and avoid-sequential.",
        "Click Generate. The strength meter updates instantly with entropy in bits, a category badge and an estimated crack time.",
        "Copy, save to favourites, or download bulk batches as TXT/CSV. Recent results stay in your browser only.",
      ],
      benefits: [
        "Cryptographically secure — built on window.crypto.getRandomValues, never Math.random.",
        "Six purpose-built modes: Random, Memorable, Passphrase, PIN, WiFi, API Key.",
        "Real-time strength analysis with entropy (in bits) and crack-time estimate at 100 billion guesses/sec.",
        "Advanced filters: exclude similar characters (i/l/1/L/o/0/O), exclude ambiguous symbols, avoid repeats, avoid sequences.",
        "Passphrase mode uses a curated dictionary of common English words with capitalization and separator controls.",
        "Bulk generation (1–50) with copy-all, TXT and CSV (including strength column) export.",
        "Local-only history and favourites — passwords never touch a server or network.",
      ],
      relatedSlugs: [
        "username-generator",
        "wifi-qr-code-generator",
        "uuid-generator",
        "secure-notes",
      ],
      faqs: [
        {
          q: "What is a password generator?",
          a: "A password generator is a tool that produces unpredictable strings of characters to use as account credentials. A good generator uses a cryptographically secure source of randomness so each password is statistically impossible to guess — even with massive computing power.",
        },
        {
          q: "How secure are these generated passwords?",
          a: "Toollyz generates every password using the Web Crypto API — the same standard cryptography modern browsers use for TLS keys, web authentication and signing. Combined with a long character pool, even a 20-character random password takes centuries to crack with today's hardware.",
        },
        {
          q: "Are generated passwords stored or transmitted?",
          a: "No. Every password is generated locally in your browser — no network request leaves your device. Recent passwords are only saved in your browser's localStorage on your own machine, and only if you click Generate. We never see, log or transmit any password.",
        },
        {
          q: "What is password entropy?",
          a: "Entropy is a measure of how unpredictable a password is, expressed in bits. Each bit doubles the number of possible passwords an attacker must try. A 60-bit password takes a million times more guesses than a 40-bit one. Generally: <40 bits is weak, 65+ is strong, 90+ is very strong, 128+ is excellent.",
        },
        {
          q: "What makes a strong password?",
          a: "Length first, randomness second, character diversity third. A 20-character random password from a full alphanumeric+symbol pool yields about 130 bits of entropy — beyond reach for any realistic brute-force attack. Avoid personal info, common words and reused passwords.",
        },
        {
          q: "Are passphrases safer than passwords?",
          a: "For memorability they're often better. A 5-word random passphrase (e.g. 'velvet-rain-trumpet-river-onion') has around 65 bits of entropy — strong, hard to brute-force and far easier to type than a random symbol soup. Use a passphrase for your password manager master key.",
        },
        {
          q: "Should I use symbols in passwords?",
          a: "Yes when the site allows them — they roughly double the per-character pool size and add bits of entropy per character. But length matters more: a 24-character alphanumeric password is stronger than a 12-character one with symbols. Use both when you can.",
        },
        {
          q: "How long should my passwords be?",
          a: "For most accounts, aim for 16+ characters. For high-value accounts (email, banking, password manager), aim for 20+ random characters or a 6+ word passphrase. Length compounds entropy faster than complexity.",
        },
        {
          q: "Can hackers crack generated passwords?",
          a: "Not realistically. A 16-character random password from the full keyboard pool has ~104 bits of entropy. Even at a trillion guesses per second (well beyond current real-world attacks), it would take longer than the age of the universe to brute-force.",
        },
        {
          q: "Is this password generator free?",
          a: "Yes — completely free with no signup, no usage limits and no watermark. Generation, strength analysis and history all run in your browser; nothing is uploaded.",
        },
      ],
    },
  },
  {
    slug: "otp-generator",
    name: "OTP Generator",
    tagline:
      "Generate secure one-time codes — numeric, alphanumeric, PIN, verification or backup recovery.",
    description:
      "Generate cryptographically secure OTPs and verification codes in six formats with optional countdown timer, auto-refresh, and TXT/CSV/JSON export. 100% client-side — codes never leave your browser.",
    categoryId: "generators",
    icon: LockKeyhole,
    status: "live",
    featured: true,
    keywords: [
      "otp generator",
      "one time password",
      "verification code generator",
      "pin generator",
      "backup recovery codes",
      "alphanumeric otp",
      "hex code",
      "2fa testing",
      "auth code",
    ],
    seo: {
      title: "OTP Generator — Generate Secure One-Time Passwords | Toollyz",
      description:
        "Generate secure OTPs instantly. Six formats — numeric, alphanumeric, hex, PIN, verification, backup recovery — with countdown timer, auto-refresh and TXT/CSV/JSON export. 100% client-side.",
      what:
        "An OTP (One-Time Password) is a short code that's valid for a single login attempt or a brief time window. They're the backbone of two-factor authentication (2FA), email/SMS verification flows, account recovery, and short-lived API tokens. Toollyz OTP Generator produces six formats — numeric, alphanumeric, hex, PIN, verification, and backup recovery codes — using the browser's cryptographically secure Web Crypto API. Use it to test 2FA flows, seed verification systems, or generate one-off codes you'll consume yourself.",
      how: [
        "Pick an OTP type — Numeric, Alphanumeric, Hex, PIN, Verification, or Backup recovery.",
        "Adjust length and quantity. Each type has sensible bounds (4–10 for PIN, 8–24 for backup codes, etc.).",
        "Optionally set an expiration timer (30s, 60s, 2min, 5min) and enable auto-refresh to keep a fresh code rotating.",
        "Copy a single code, copy all, or download as TXT, CSV or JSON. Save favorites for reuse — everything stays in your browser.",
      ],
      benefits: [
        "Cryptographically secure — every code generated via window.crypto.getRandomValues.",
        "Six purpose-built formats: numeric, alphanumeric, hex, PIN, verification, backup recovery.",
        "Optional expiration timer with animated circular countdown and auto-refresh on expiry.",
        "Bulk-generate up to 100 codes with deduplication where the pool allows.",
        "Backup-recovery format produces grouped codes (xxxx-xxxx-…) ready to print and store offline.",
        "Exclude-ambiguous toggle drops 0/O/1/l/I so codes are readable in any font.",
        "Avoid-repeats option for cleaner PINs and verification codes.",
        "Local-only history and favorites — codes never reach our servers.",
      ],
      relatedSlugs: [
        "password-generator",
        "uuid-generator",
        "secure-notes",
        "wifi-qr-code-generator",
      ],
      faqs: [
        {
          q: "What is an OTP?",
          a: "An OTP — One-Time Password — is a short code that's only valid for a single use or a brief time window (typically 30 seconds to 5 minutes). They're widely used as a second factor in 2FA, in email/SMS verification, and in account-recovery flows. Once consumed or expired, the code can never be reused.",
        },
        {
          q: "How does OTP authentication work?",
          a: "In a real OTP flow, a server generates a short code, sends it via SMS/email/authenticator app, then validates it on the next login attempt. Time-based OTPs (TOTP) regenerate every 30 seconds; HOTP codes increment with each use. The strength comes from short validity windows, not code complexity.",
        },
        {
          q: "Are these generated OTPs secure?",
          a: "Yes — every code is generated using the browser's cryptographically secure Web Crypto API with proper modulo-bias rejection. The codes themselves are statistically indistinguishable from true random. Security in production OTP systems comes from the surrounding flow (expiry, single-use) — use this tool for testing and personal use, not as a replacement for a real auth backend.",
        },
        {
          q: "Can OTPs expire automatically?",
          a: "Yes — set the expiration timer to 30s, 60s, 2min or 5min. A circular countdown displays the time remaining; when it hits zero the code shows an Expired state. Enable Auto-refresh to generate a fresh code as soon as the timer ends.",
        },
        {
          q: "What's the difference between an OTP and a password?",
          a: "A password is a long-lived secret you reuse across logins; an OTP is single-use and short-lived. OTPs are weaker individually (they're shorter) but stronger in practice because they can't be reused if intercepted or leaked. The two work together: password for identification, OTP for verification.",
        },
        {
          q: "What are backup recovery codes?",
          a: "When you enable 2FA on a service, the service usually shows a list of long one-time codes (Google, GitHub, etc. give ~10 of these). If you lose access to your authenticator, any one of these unlocks your account. Toollyz Backup mode generates grouped 8/16-char codes you can print and store offline.",
        },
        {
          q: "Can I generate multiple OTPs at once?",
          a: "Yes — set the Quantity to 5, 10, 25, 50 or 100. Bulk generation includes deduplication where the character pool allows (4-digit PINs only have 10,000 combinations, so duplicates are tolerated for very short codes).",
        },
        {
          q: "Are my OTPs stored or transmitted?",
          a: "No. Generation runs entirely in your browser via the Web Crypto API. Recent codes are saved only in your browser's localStorage, on your device. We don't log, transmit or sync any code you generate.",
        },
        {
          q: "Why are OTPs important for security?",
          a: "Even if your password leaks in a data breach, an attacker still can't log in without your OTP. That's the whole point of two-factor authentication — adding a layer of proof that you, not just the password, are present. Enable 2FA wherever it's offered.",
        },
        {
          q: "Is this OTP generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Generation, history and favorites all stay in your browser.",
        },
      ],
    },
  },
  {
    slug: "audio-volume-booster",
    name: "Audio Volume Booster",
    tagline:
      "Boost MP3, WAV and OGG audio volume safely — with live waveform, A/B preview and clipping warnings.",
    description:
      "Increase the volume of any audio file beyond 100% with the Web Audio API. Live waveform, A/B preview between original and boosted, soft limiter to prevent clipping, optional bass and voice enhancements, lossless WAV export.",
    categoryId: "generators",
    icon: Volume2,
    status: "live",
    featured: true,
    keywords: [
      "audio volume booster",
      "boost audio volume",
      "increase mp3 volume",
      "louder audio",
      "amplify audio",
      "audio normalizer",
      "podcast volume",
      "wav volume booster",
      "audio gain",
    ],
    seo: {
      title: "Audio Volume Booster — Increase Audio Volume Online Free | Toollyz",
      description:
        "Boost audio volume online instantly with Toollyz Audio Volume Booster. Increase MP3, WAV and OGG loudness, normalize audio, prevent clipping, preview live and download lossless WAV — 100% client-side.",
      what:
        "An Audio Volume Booster increases the perceived loudness of a quiet recording by applying gain — a mathematical multiplier on every sample. Toollyz Audio Volume Booster runs entirely in your browser using the Web Audio API. Your file never leaves your device. You get a live waveform, A/B preview against the original, real-time clipping prediction, a soft-limiter to keep boosted audio clean, plus optional bass and voice-clarity enhancements baked into the export.",
      how: [
        "Drag and drop an MP3, WAV, OGG, M4A or AAC file (up to 100 MB), or click to browse.",
        "Use the boost slider or presets (100% – 400%). Toggle A/B preview to compare original vs boosted in real time.",
        "Optionally enable Normalize, Reduce clipping (soft limiter), Bass enhancement, Voice clarity or Stereo width.",
        "Click Download WAV — the rendered file matches exactly what you hear in the boosted preview.",
      ],
      benefits: [
        "100% client-side — your audio is decoded, processed and exported entirely in your browser. Never uploaded.",
        "Live waveform visualization that responds to boost level and shows clipping risk.",
        "A/B preview toggle — instantly compare original vs boosted while playing.",
        "Predicted post-boost peak in dBFS with traffic-light risk indicator (safe / medium / clipping).",
        "Soft limiter (tanh-based WaveShaper) keeps loud peaks clean instead of harshly clipping.",
        "Optional normalize, bass enhancement (+6 dB lowshelf) and voice clarity (+4 dB presence band).",
        "Lossless WAV export at the original sample rate — exact preview-matches-export rendering.",
        "Works on mobile, desktop, and supports MP3, WAV, OGG, M4A and AAC inputs.",
      ],
      relatedSlugs: [
        "qr-code-generator",
        "wifi-qr-code-generator",
        "white-noise-generator",
        "image-compressor",
      ],
      faqs: [
        {
          q: "What is an audio volume booster?",
          a: "An audio volume booster takes a quiet audio file and multiplies every sample by a gain factor to make it louder. Modern boosters also include a limiter to prevent the boosted signal from clipping past 0 dBFS, which would otherwise cause harsh digital distortion.",
        },
        {
          q: "Can I increase MP3 volume online?",
          a: "Yes — Toollyz decodes MP3, WAV, OGG, M4A and AAC files in your browser using the Web Audio API, applies your chosen gain plus optional enhancements, and lets you download a boosted WAV. Your MP3 never leaves your device.",
        },
        {
          q: "Will boosting audio reduce quality?",
          a: "Boosting itself is lossless — it's just multiplication. Quality only degrades if (a) the boost pushes peaks above 0 dBFS (clipping), or (b) the file is re-encoded to a lossy format. Toollyz exports as lossless WAV and includes a soft limiter to prevent clipping.",
        },
        {
          q: "What is audio clipping?",
          a: "Clipping happens when sample values exceed the maximum representable level (±1.0 in floating-point, or 0 dBFS). Anything beyond that is hard-truncated to the maximum, which creates harsh harmonic distortion. The clipping indicator predicts this before you export.",
        },
        {
          q: "Is audio processing done locally?",
          a: "Yes — entirely in your browser. Toollyz uses the Web Audio API (AudioContext + OfflineAudioContext) for decoding, real-time preview and offline rendering. No file is uploaded, no audio is transmitted to any server.",
        },
        {
          q: "Can I boost podcast audio?",
          a: "Yes — for podcast voice, 200% (+6 dB) boost combined with Voice clarity and Normalize is usually ideal. Enable Reduce clipping to keep loud syllables clean. Avoid heavy bass enhancement on voice-only content.",
        },
        {
          q: "Which file formats are supported?",
          a: "Input: MP3, WAV, OGG, M4A and AAC (anything your browser can decode via the Web Audio API). Output: lossless WAV at the original sample rate.",
        },
        {
          q: "How much can I boost volume safely?",
          a: "It depends on your file's original peak level. If your original peak is −12 dB, you can boost up to about 4× (400%) before clipping. If your original is already at −1 dB, even 110% will clip. Toollyz predicts the post-boost peak in real time so you always know.",
        },
        {
          q: "Does this tool work on mobile?",
          a: "Yes — the player, waveform and controls are mobile-optimized. Tap to seek, swipe to scrub. Web Audio works in iOS Safari, Android Chrome and every modern mobile browser.",
        },
        {
          q: "Is this audio volume booster free?",
          a: "Yes — completely free with no signup, no usage limits and no watermark. Processing runs entirely in your browser so there's no infrastructure cost to pass on.",
        },
      ],
    },
  },
  {
    slug: "white-noise-generator",
    name: "White Noise Generator",
    tagline:
      "Mix calming sounds for sleep, focus and meditation — 14 sounds, presets and a sleep timer.",
    description:
      "Mix white, pink, brown, blue and gray noise with ambient sounds like rain, ocean, wind and fireplace. All sounds are synthesized live in your browser — no uploads, no streaming, no signup. Includes a sleep timer with smooth fade-out.",
    categoryId: "generators",
    icon: Waves,
    status: "live",
    featured: true,
    keywords: [
      "white noise generator",
      "white noise",
      "pink noise",
      "brown noise",
      "ambient sound generator",
      "rain sounds",
      "ocean sounds",
      "sleep sounds",
      "focus sounds",
      "study sounds",
      "meditation sounds",
      "sleep timer",
    ],
    seo: {
      title:
        "White Noise Generator — Relaxing Ambient Sounds Online Free | Toollyz",
      description:
        "Listen to white noise, brown noise, rain sounds, ocean waves and ambient audio. Mix multiple sounds, save your favorites, set a sleep timer — 100% client-side, no signup.",
      what:
        "A white noise generator produces a constant calming sound that masks distracting noises, helping you sleep, focus or relax. Toollyz White Noise Generator synthesizes every sound live in your browser using the Web Audio API — five noise colors (white, pink, brown, blue, gray), eight ambient sounds (rain, wind, ocean, fan, fireplace, coffee shop, crickets, heartbeat) and a soft hum, all mixable with individual volume controls.",
      how: [
        "Tap any sound card to start it. Tap again to pause. Multiple sounds can play at once.",
        "Adjust each sound's volume with its slider, or use the master volume in the top bar.",
        "Pick a built-in preset (Deep sleep, Study mode, Focus flow, Relaxing rain, Ocean meditation) or save your own mix.",
        "Set a sleep timer (15 / 30 / 60 / 120 minutes) and the audio fades out smoothly when the timer ends.",
      ],
      benefits: [
        "100% client-side — every sound synthesized in your browser, nothing streamed or uploaded.",
        "14 distinct sounds across noise colors, ambient and sleep categories.",
        "Multi-track mixer with per-sound volume sliders, fade-in/out, and instant transitions.",
        "Five built-in presets (Deep sleep, Study mode, Focus flow, Relaxing rain, Ocean meditation) + unlimited custom presets stored locally.",
        "Sleep timer with 8-second fade-out — perfect for drifting off without abrupt cuts.",
        "Calming ambient background with subtle animated gradient orbs.",
        "Works offline once the page loads (no streaming required).",
        "Favorites stored in your browser, never on any server.",
      ],
      relatedSlugs: [
        "audio-volume-booster",
        "pomodoro-timer",
        "alarm-clock",
        "stopwatch",
      ],
      faqs: [
        {
          q: "What is white noise?",
          a: "White noise contains equal energy at every audible frequency. It sounds like a steady, even hiss — similar to TV static — and is excellent at masking other sounds because it covers the full hearing range uniformly.",
        },
        {
          q: "What's the difference between white, pink and brown noise?",
          a: "White noise has equal energy across all frequencies. Pink noise has more energy in lower frequencies (−3 dB per octave) and sounds warmer and more natural. Brown noise has even more low end (−6 dB per octave) and sounds like a deep waterfall or wind — many people find it the most relaxing.",
        },
        {
          q: "Does white noise help sleep?",
          a: "For many people, yes. White and pink noise mask sudden sounds (traffic, voices, creaks) that wake light sleepers. Brown noise is often preferred for deep sleep because of its low rumble. Combine with the sleep timer for a fade-out as you drift off.",
        },
        {
          q: "Can white noise improve focus?",
          a: "Steady ambient noise can help — research shows pink noise and constant background sound improve concentration for some people by stabilizing the auditory environment. Try the 'Study mode' preset (pink noise + coffee shop chatter).",
        },
        {
          q: "Is white noise safe for babies?",
          a: "Many pediatricians recommend white noise to soothe infants because it mimics womb sounds. Keep volume low — under 50 dB at the crib — and place the device at least 2 metres away. Don't run it 24/7; use it for sleep only.",
        },
        {
          q: "Can I mix multiple ambient sounds?",
          a: "Yes — Toollyz is built as a multi-track mixer. Start any combination of sounds simultaneously, tune each one's volume independently, and save your blend as a custom preset for later.",
        },
        {
          q: "Does this work offline?",
          a: "Yes — once the page is loaded, all audio is synthesized in your browser using the Web Audio API. No network is required. You can disconnect and the sounds keep playing.",
        },
        {
          q: "Are the sounds processed locally?",
          a: "Completely. Toollyz doesn't stream recordings or upload your preferences. Every sound is generated on the fly using oscillators, noise buffers and audio filters — all running locally on your device.",
        },
        {
          q: "Can I use this on mobile?",
          a: "Yes — mobile browsers fully support Web Audio. The controls are touch-friendly and responsive. Keep the tab open while playing (browsers may pause audio if the tab is closed).",
        },
        {
          q: "Is this white noise generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. All processing runs in your browser, so there's no cost to deliver.",
        },
      ],
    },
  },
  {
    slug: "random-color-generator",
    name: "Random Color Generator",
    tagline:
      "Generate beautiful random palettes, gradients and design-ready colors with live UI preview.",
    description:
      "Generate random colors and palettes in 10 styles (analogous, complementary, triadic, pastel, neon, earthy, dark, minimal and more), apply hue/saturation/lightness adjustments, check WCAG contrast, see colors in a live UI preview, and export as CSS, SCSS, Tailwind config, JSON or PNG.",
    categoryId: "generators",
    icon: Shuffle,
    status: "live",
    featured: true,
    keywords: [
      "random color generator",
      "color palette generator",
      "hex color generator",
      "gradient generator",
      "tailwind colors",
      "css color palette",
      "design palette",
      "ui color scheme",
      "wcag contrast",
      "complementary colors",
      "triadic palette",
    ],
    seo: {
      title:
        "Random Color Generator — Generate Beautiful Color Palettes | Toollyz",
      description:
        "Generate random colors, gradients and stunning color palettes instantly. Export HEX, RGB, HSL, CSS, SCSS, Tailwind config, JSON or PNG. Live UI preview, WCAG contrast checking, and 10 palette styles.",
      what:
        "A Random Color Generator helps designers and developers explore color combinations they wouldn't pick on their own. Toollyz Random Color Generator produces colors using ten harmony styles — random, monochromatic, analogous, complementary, triadic, pastel, neon, earthy, dark and minimal — with built-in WCAG contrast checking, real-time UI preview and exports for CSS, SCSS, Tailwind, JSON and PNG. Lock the colors you like, hit space to regenerate the rest.",
      how: [
        "Pick a palette style (random, complementary, triadic, etc.) and how many colors you want (2, 3, 5 or 10).",
        "Press Generate or hit the spacebar to roll a new palette. Lock any color you want to keep and re-roll the rest.",
        "Adjust hue, saturation or lightness globally, or fine-tune any single color with the per-card controls.",
        "Preview the palette in a live UI mockup, build a gradient from it, then export as CSS variables, SCSS, Tailwind config, JSON or a PNG swatch sheet.",
      ],
      benefits: [
        "10 harmony styles — random, monochromatic, analogous, complementary, triadic, pastel, neon, earthy, dark mode and minimal.",
        "Lock individual colors and re-roll only the unlocked slots — perfect for refining a palette.",
        "WCAG contrast checker on every card showing AA / AA-large / Fail with the actual contrast ratio.",
        "Live UI preview shows your palette in a nav bar, hero card, button and accent components.",
        "Build linear, radial or conic gradients straight from the palette with copyable CSS.",
        "Built-in EyeDropper (where supported) to sample any color from your screen.",
        "Spacebar shortcut to instantly re-roll the palette.",
        "5 export formats: CSS variables, SCSS variables, Tailwind config, JSON and a PNG swatch sheet.",
        "Favorites and saved palettes persist locally in your browser — never on any server.",
      ],
      relatedSlugs: [
        "color-picker",
        "gradient-generator",
        "meta-tag-generator",
        "css-animation-generator",
      ],
      faqs: [
        {
          q: "What is a random color generator?",
          a: "A random color generator produces colors algorithmically — either pure random samples or curated harmonies (complementary, triadic, etc.). They help designers explore combinations beyond personal habits and quickly prototype branding, UI themes and design systems.",
        },
        {
          q: "How do I generate color palettes?",
          a: "Pick a style (Analogous, Complementary, Triadic, Pastel, Neon, Earthy, Dark mode or Minimal), set how many colors you want (2, 3, 5 or 10), then click Generate or press the spacebar. Lock any color you love to keep it across rolls.",
        },
        {
          q: "What is the difference between HEX and RGB?",
          a: "HEX is a 6-character hexadecimal representation (e.g. #4F46E5) of the same three values RGB uses (e.g. rgb(79, 70, 229)). They store identical data. HSL (Hue / Saturation / Lightness) is a different model that's more intuitive for human-friendly color adjustments.",
        },
        {
          q: "How do I create accessible color combinations?",
          a: "Use the contrast badge on each color card. AA-passing combinations have at least 4.5:1 contrast for normal text. Aim for 7:1 (AAA) for body text. The card auto-picks black or white text and shows the exact ratio.",
        },
        {
          q: "Can I export Tailwind colors?",
          a: "Yes — click Tailwind in the Export section to download a ready-to-paste tailwind.config.ts snippet with your palette mapped to semantic names (primary, secondary, accent, etc.). Drop it into your project and you're done.",
        },
        {
          q: "What are complementary colors?",
          a: "Complementary colors sit opposite each other on the color wheel — like blue and orange, or red and green. They create high visual contrast and are great for accent / call-to-action pairings, but can feel intense if both are at full saturation.",
        },
        {
          q: "How do gradients work?",
          a: "A gradient blends one color into another across an angle or shape. Toollyz builds linear, radial and conic gradients from your palette automatically — you can change the angle (for linear and conic), reverse the order, and copy the production-ready CSS.",
        },
        {
          q: "Can I save generated palettes?",
          a: "Yes — the Save palette button stores the current palette in your browser's localStorage. Open the Saved palettes panel below to reload any past palette in one click. Up to 12 palettes are kept locally.",
        },
        {
          q: "Does this tool work on mobile?",
          a: "Yes — the layout adapts down to a single column. Tap any color to copy, long-press to drag (where supported), and the picker, sliders and exports all work the same way as desktop.",
        },
        {
          q: "Is this random color generator free?",
          a: "Yes — completely free with no signup, no usage limits and no watermark. Generation, exports, favorites and saved palettes all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "coin-flip-simulator",
    name: "Coin Flip Simulator",
    tagline:
      "Flip a realistic 3D coin with stats, streaks and decision modes.",
    description:
      "Flip a fair, animated 3D coin in your browser. Choose from five coin styles, flip 1 or up to 100 at once, track heads/tails stats and streaks, switch to Yes/No or Truth/Dare modes, and export your results.",
    categoryId: "generators",
    icon: Coins,
    status: "live",
    featured: true,
    keywords: [
      "coin flip simulator",
      "coin flip",
      "flip a coin",
      "heads or tails",
      "virtual coin toss",
      "online coin flip",
      "random decision maker",
      "coin toss probability",
    ],
    seo: {
      title: "Coin Flip Simulator — Flip a Virtual Coin Online Free | Toollyz",
      description:
        "Flip a virtual coin instantly. Realistic 3D animation, heads/tails statistics, streak tracking, probability charts, multi-flip modes and customizable coin styles — free, no signup.",
      what:
        "A Coin Flip Simulator is a digital coin toss — a fast, fair way to make 50/50 decisions, settle debates, pick teams, or demonstrate probability. Toollyz Coin Flip Simulator uses your browser's cryptographic random generator for true fairness, wrapped in a realistic 3D flip animation with five coin styles, live statistics, streak tracking and decision modes like Yes/No and Truth/Dare.",
      how: [
        "Tap Flip coin (or press the spacebar) to toss a single coin with a realistic 3D animation.",
        "Pick a coin style — classic gold, silver, minimal, casino chip or neon — and a decision mode (Heads/Tails, Yes/No, Truth/Dare, Team picker).",
        "Use the multi-flip buttons (5–100×) to run many tosses instantly and watch the distribution converge toward 50/50.",
        "Track heads/tails percentages and streaks in the dashboard, then export your full history as CSV.",
      ],
      benefits: [
        "Cryptographically fair — each flip uses window.crypto.getRandomValues, a true 50/50.",
        "Realistic 3D coin animation with physics-inspired easing, shadow and landing motion.",
        "Five coin styles: classic gold, silver, minimal, casino chip and neon.",
        "Decision modes — Heads/Tails, Yes/No, Truth/Dare and Team picker — relabel the coin for any choice.",
        "Live statistics: totals, heads/tails percentages, current streak and longest streak.",
        "Multi-flip up to 100 tosses at once with an animated distribution bar.",
        "Confetti and a celebratory toast when you hit a 5+ streak.",
        "Spacebar shortcut, reduced-motion support and synthesized flip/landing sounds you can mute.",
        "History and settings saved locally — export results as CSV anytime.",
      ],
      relatedSlugs: [
        "spin-wheel",
        "decision-maker",
        "lucky-draw",
        "password-generator",
      ],
      faqs: [
        {
          q: "What is a coin flip simulator?",
          a: "A coin flip simulator is an online tool that recreates a physical coin toss. You tap a button, a virtual coin spins, and it lands on heads or tails. It's used for quick decisions, settling bets, picking who goes first, or teaching probability.",
        },
        {
          q: "Is the coin toss random?",
          a: "Yes — Toollyz uses the browser's cryptographic random number generator (window.crypto.getRandomValues), the same source trusted for security keys. Each flip is an independent, unbiased 50/50 event.",
        },
        {
          q: "What are the odds of heads or tails?",
          a: "Exactly 50% each on every flip. The coin has no memory — even after ten heads in a row, the next flip is still 50/50. (Real physical coins have a tiny bias toward the side facing up at launch, but a digital coin is perfectly fair.)",
        },
        {
          q: "Can I flip multiple coins at once?",
          a: "Yes — use the multi-flip buttons to toss 5, 10, 25, 50 or 100 coins instantly. The results are added to your history and the distribution bar updates so you can watch the percentages converge toward 50/50.",
        },
        {
          q: "Does this tool work on mobile?",
          a: "Yes — the coin, controls and stats are fully responsive and touch-friendly. Tap the flip button or the coin to toss. It works in every modern mobile browser.",
        },
        {
          q: "Are the results truly random?",
          a: "As random as software gets. Cryptographic random number generators are designed to be unpredictable and statistically uniform — far more so than a hurried human coin toss, which can be biased by technique.",
        },
        {
          q: "Can I export coin flip results?",
          a: "Yes — click Export CSV to download your entire flip history with the result and timestamp of every toss. Useful for classroom probability exercises or keeping a record of decisions.",
        },
        {
          q: "Is the coin toss fair?",
          a: "Completely. There's no hidden bias, no 'house edge', and no weighting toward either side. Both heads and tails have an identical 50% chance on every single flip.",
        },
        {
          q: "Can I customize the coin?",
          a: "Yes — pick from five coin styles (gold, silver, minimal, casino chip, neon) and four decision modes that relabel the two sides (Heads/Tails, Yes/No, Truth/Dare, Team A/B).",
        },
        {
          q: "Is this coin flip simulator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Everything runs in your browser, including the randomness, statistics and history.",
        },
      ],
    },
  },
  {
    slug: "bingo-card-generator",
    name: "Bingo Card Generator",
    tagline: "Create custom printable Bingo cards.",
    description:
      "Generate one or many custom Bingo cards with your own words or numbers. Print or save as PDF for your event.",
    categoryId: "generators",
    icon: Grid3x3,
    status: "coming-soon",
    keywords: ["bingo", "card generator", "party", "printable"],
  },
  {
    slug: "spin-wheel",
    name: "Spin Wheel Generator",
    tagline: "Create a custom spin-the-wheel for any decision.",
    description:
      "Build a colorful spin wheel with your own options. Spin to randomly pick a winner — great for games, prizes and choices.",
    categoryId: "generators",
    icon: CircleDot,
    status: "coming-soon",
    keywords: ["spin wheel", "wheel of names", "random picker", "raffle"],
  },
  {
    slug: "decision-maker",
    name: "Decision Maker Wheel",
    tagline: "Can't decide? Let the wheel choose for you.",
    description:
      "Add your options, spin, and let chance decide. Perfect for resolving small dilemmas — from dinner to what to watch.",
    categoryId: "generators",
    icon: HelpCircle,
    status: "coming-soon",
    keywords: ["decision maker", "choose for me", "random picker", "yes or no"],
  },
  {
    slug: "lucky-draw",
    name: "Lucky Draw Generator",
    tagline: "Pick random winners from a list of participants.",
    description:
      "Paste a list of names or entries, then pick winners at random for giveaways, raffles and contests.",
    categoryId: "generators",
    icon: Ticket,
    status: "coming-soon",
    keywords: ["lucky draw", "raffle", "giveaway", "random winner"],
  },
  {
    slug: "random-emoji",
    name: "Random Emoji Generator",
    tagline: "Generate random emojis from every category.",
    description:
      "Pull one or many random emojis from any category. Great for content, captions, or just for fun.",
    categoryId: "generators",
    icon: Smile,
    status: "coming-soon",
    keywords: ["emoji", "random emoji", "emoji picker"],
  },
  {
    slug: "random-fact",
    name: "Random Fact Generator",
    tagline: "Discover a surprising new fact every time.",
    description:
      "Generate random fascinating facts about science, history, animals, space and more — perfect for trivia and small talk.",
    categoryId: "generators",
    icon: Lightbulb,
    status: "coming-soon",
    keywords: ["random fact", "trivia", "did you know", "fun fact"],
  },
  {
    slug: "random-joke",
    name: "Random Joke Generator",
    tagline: "Get a fresh joke whenever you need a laugh.",
    description:
      "Generate random jokes across categories — clean, dad jokes, programming, and more. Share instantly.",
    categoryId: "generators",
    icon: Laugh,
    status: "coming-soon",
    keywords: ["joke", "random joke", "dad joke", "funny"],
  },
  {
    slug: "random-quote",
    name: "Random Quote Generator",
    tagline: "Inspirational, funny and famous quotes at random.",
    description:
      "Pull random quotes from authors, scientists, athletes and more. Perfect for daily inspiration, social posts or content.",
    categoryId: "generators",
    icon: Quote,
    status: "coming-soon",
    keywords: ["quote", "random quote", "inspirational", "famous quotes"],
  },
  {
    slug: "calendar-generator",
    name: "Calendar Generator",
    tagline: "Generate printable calendars for any year or month.",
    description:
      "Create clean, printable calendars for any year, month or custom date range. Multiple layouts and color themes.",
    categoryId: "generators",
    icon: Calendar,
    status: "coming-soon",
    keywords: ["calendar", "printable", "planner", "monthly"],
  },
  {
    slug: "horoscope-generator",
    name: "Horoscope Generator",
    tagline: "Daily, weekly and monthly horoscopes by sign.",
    description:
      "Get personalized horoscopes for your zodiac sign. Daily, weekly and monthly readings on love, work and wellness.",
    categoryId: "generators",
    icon: Stars,
    status: "coming-soon",
    keywords: ["horoscope", "zodiac", "astrology", "daily"],
  },

  // ─── TEXT ────────────────────────────────────────────────────────────────
  {
    slug: "word-counter",
    name: "Word Counter",
    tagline: "Count words, characters, sentences and paragraphs.",
    description:
      "Instant text statistics including word count, character count, reading time and keyword density — perfect for writers, students and SEOs.",
    categoryId: "text",
    icon: AlignLeft,
    status: "coming-soon",
    keywords: ["word count", "character count", "text statistics", "reading time"],
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    tagline: "Live character count with limits for tweets and bios.",
    description:
      "Count characters in real-time with built-in presets for Twitter/X, Instagram bios, meta descriptions and more.",
    categoryId: "text",
    icon: Pilcrow,
    status: "coming-soon",
    keywords: ["character count", "twitter", "bio", "meta description"],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    tagline: "Switch text between camelCase, snake_case, kebab-case and more.",
    description:
      "Convert text between every common case style — including title case, sentence case, alternating case and more.",
    categoryId: "text",
    icon: CaseSensitive,
    status: "coming-soon",
    keywords: ["case", "camelcase", "snake_case", "kebab-case", "uppercase"],
  },
  {
    slug: "slugify",
    name: "Slugify",
    tagline: "Convert any string into a URL-friendly slug.",
    description:
      "Turn titles and phrases into clean, URL-safe slugs. Handles unicode, accents, custom separators and casing.",
    categoryId: "text",
    icon: TextCursorInput,
    status: "coming-soon",
    keywords: ["slug", "slugify", "url", "permalink", "seo"],
  },
  {
    slug: "online-notepad",
    name: "Online Notepad",
    tagline: "A distraction-free, auto-saving online notepad.",
    description:
      "Write, save and access your notes from any device. Auto-save, dark mode and markdown support — no signup required.",
    categoryId: "text",
    icon: NotebookPen,
    status: "coming-soon",
    keywords: ["notepad", "notes", "scratch pad", "writing"],
  },
  {
    slug: "markdown-editor",
    name: "Markdown Editor & Previewer",
    tagline: "Write Markdown with a live, side-by-side preview.",
    description:
      "A clean Markdown editor with live preview, syntax highlighting, table support and export options.",
    categoryId: "text",
    icon: FileType,
    status: "coming-soon",
    keywords: ["markdown", "editor", "preview", "md"],
  },
  {
    slug: "ascii-art-generator",
    name: "ASCII Art Generator",
    tagline: "Turn text into stylized ASCII art.",
    description:
      "Generate ASCII art banners and text. Pick from dozens of fonts and styles, then copy or download.",
    categoryId: "text",
    icon: SquareCode,
    status: "coming-soon",
    keywords: ["ascii", "ascii art", "text banner", "figlet"],
  },
  {
    slug: "fancy-text-generator",
    name: "Fancy Text Generator",
    tagline: "Turn plain text into fancy Unicode styles.",
    description:
      "Convert your text into bold, italic, cursive, bubble, retro and other Unicode styles — perfect for bios and social posts.",
    categoryId: "text",
    icon: Sparkle,
    status: "coming-soon",
    keywords: ["fancy text", "unicode", "bold text", "italic text", "stylish"],
  },
  {
    slug: "invisible-text-generator",
    name: "Invisible Text Generator",
    tagline: "Generate invisible/blank Unicode characters.",
    description:
      "Produce invisible Unicode characters useful for blank usernames, hidden messages or empty social fields.",
    categoryId: "text",
    icon: EyeOff,
    status: "coming-soon",
    keywords: ["invisible text", "blank character", "hidden text", "unicode"],
  },

  // ─── DEVELOPER ───────────────────────────────────────────────────────────
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Format, validate and minify JSON in one click.",
    description:
      "Beautify messy JSON, validate structure, and minify for production. Syntax highlighting and error pointers included.",
    categoryId: "developer",
    icon: Braces,
    status: "coming-soon",
    featured: true,
    keywords: ["json", "format", "beautify", "validate", "minify"],
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    tagline: "Format and validate XML documents.",
    description:
      "Beautify, validate and minify XML. Catch syntax errors with clear messages and highlighting.",
    categoryId: "developer",
    icon: CodeXml,
    status: "coming-soon",
    keywords: ["xml", "format", "beautify", "validate"],
  },
  {
    slug: "html-minifier",
    name: "HTML Minifier",
    tagline: "Minify HTML to reduce file size.",
    description:
      "Remove whitespace, comments and redundant attributes from HTML — preview output side-by-side.",
    categoryId: "developer",
    icon: Code,
    status: "coming-soon",
    keywords: ["html", "minify", "compress", "optimize"],
  },
  {
    slug: "javascript-minifier",
    name: "JavaScript Minifier",
    tagline: "Minify JavaScript for production-ready output.",
    description:
      "Compress JavaScript by removing whitespace, comments and mangling names — ship smaller, faster scripts.",
    categoryId: "developer",
    icon: FileCode2,
    status: "coming-soon",
    keywords: ["javascript", "js", "minify", "compress"],
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    tagline: "Minify CSS to ship smaller, faster stylesheets.",
    description:
      "Compress CSS by removing whitespace, comments and redundant rules — preview output side-by-side.",
    categoryId: "developer",
    icon: FileMinus,
    status: "coming-soon",
    keywords: ["css", "minify", "compress", "optimize"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    tagline: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes.",
    description:
      "Hash any string with industry-standard algorithms. Useful for checksums, fingerprints and integrity checks.",
    categoryId: "developer",
    icon: Hash,
    status: "coming-soon",
    keywords: ["hash", "md5", "sha256", "sha512", "checksum"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    tagline: "Test, debug and learn regular expressions in real time.",
    description:
      "Build and test regular expressions against sample text with live highlighting, capture groups and explanations.",
    categoryId: "developer",
    icon: Regex,
    status: "coming-soon",
    keywords: ["regex", "regular expression", "test", "debug"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Decode and inspect JSON Web Tokens.",
    description:
      "Paste any JWT to view its header, payload and signature. Verify expiration and issuer claims locally.",
    categoryId: "developer",
    icon: ShieldCheck,
    status: "coming-soon",
    keywords: ["jwt", "decode", "token", "auth"],
  },
  {
    slug: "secure-notes",
    name: "Secure Notes Tool",
    tagline: "Write notes encrypted in your browser.",
    description:
      "Create end-to-end encrypted notes that stay in your browser. Set a password — only you can decrypt.",
    categoryId: "developer",
    icon: Lock,
    status: "coming-soon",
    keywords: ["secure notes", "encrypted", "private notes", "password"],
  },
  {
    slug: "clipboard-manager",
    name: "Clipboard Manager",
    tagline: "Track and re-use your recent clipboard history.",
    description:
      "Keep a quick history of recently copied text snippets. Re-copy with one click — all kept locally in your browser.",
    categoryId: "developer",
    icon: Clipboard,
    status: "coming-soon",
    keywords: ["clipboard", "copy history", "paste manager"],
  },
  {
    slug: "internet-speed-test",
    name: "Internet Speed Test",
    tagline: "Measure your download, upload and ping speeds.",
    description:
      "Test your internet connection — download, upload, latency and jitter — straight from your browser.",
    categoryId: "developer",
    icon: Gauge,
    status: "coming-soon",
    keywords: ["speed test", "internet speed", "bandwidth", "ping"],
  },
  {
    slug: "ping-test",
    name: "Ping Test Tool",
    tagline: "Check latency to any server or domain.",
    description:
      "Measure the round-trip latency to any domain or IP. Useful for diagnosing slow or unstable connections.",
    categoryId: "developer",
    icon: Activity,
    status: "coming-soon",
    keywords: ["ping", "latency", "network test"],
  },
  {
    slug: "ip-address-finder",
    name: "IP Address Finder",
    tagline: "See your public IP, location and ISP at a glance.",
    description:
      "Find your public IP address along with location, ISP and network details — all in one quick view.",
    categoryId: "developer",
    icon: Globe,
    status: "coming-soon",
    keywords: ["ip address", "what is my ip", "location", "isp"],
  },
  {
    slug: "dns-lookup",
    name: "DNS Lookup Tool",
    tagline: "Look up A, AAAA, MX, TXT, CNAME records and more.",
    description:
      "Resolve DNS records for any domain. Inspect A, AAAA, MX, TXT, CNAME, NS and SOA records instantly.",
    categoryId: "developer",
    icon: Network,
    status: "coming-soon",
    keywords: ["dns", "lookup", "mx records", "txt records", "nameserver"],
  },
  {
    slug: "browser-info",
    name: "Browser Information Checker",
    tagline: "Inspect your browser, user-agent and capabilities.",
    description:
      "See detailed info about your browser, OS, screen, language and supported web APIs — useful for testing and support.",
    categoryId: "developer",
    icon: AppWindow,
    status: "coming-soon",
    keywords: ["browser info", "user agent", "what browser"],
  },
  {
    slug: "device-info",
    name: "Device Information Checker",
    tagline: "Detect device type, OS, screen and hardware specs.",
    description:
      "Inspect your device profile — type, OS, screen, GPU, memory and more. Great for support tickets and testing.",
    categoryId: "developer",
    icon: MonitorSmartphone,
    status: "coming-soon",
    keywords: ["device info", "system info", "hardware"],
  },
  {
    slug: "battery-status",
    name: "Battery Status Checker",
    tagline: "View your laptop's battery level and charging state.",
    description:
      "Check your laptop or tablet's battery level, charging status and remaining time — straight from your browser.",
    categoryId: "developer",
    icon: Battery,
    status: "coming-soon",
    keywords: ["battery", "charge", "laptop battery"],
  },
  {
    slug: "screen-resolution",
    name: "Screen Resolution Checker",
    tagline: "Detect your screen size, DPR and color depth.",
    description:
      "Find your screen resolution, viewport size, pixel density and color depth — useful for design and bug reports.",
    categoryId: "developer",
    icon: Monitor,
    status: "coming-soon",
    keywords: ["screen resolution", "viewport", "dpr", "pixel ratio"],
  },
  {
    slug: "keyboard-tester",
    name: "Keyboard Tester",
    tagline: "Test every key on your keyboard for hardware issues.",
    description:
      "Press any key to verify it registers correctly. Detect stuck, ghosted or non-responsive keys in seconds.",
    categoryId: "developer",
    icon: Keyboard,
    status: "coming-soon",
    keywords: ["keyboard test", "key tester", "stuck key", "hardware test"],
  },
  {
    slug: "mouse-click-tester",
    name: "Mouse Click Tester",
    tagline: "Test left, right, middle and scroll-wheel clicks.",
    description:
      "Diagnose your mouse — left, right, middle and side buttons, plus scroll-wheel direction tests.",
    categoryId: "developer",
    icon: MousePointer,
    status: "coming-soon",
    keywords: ["mouse test", "click test", "button test"],
  },
  {
    slug: "mic-test",
    name: "Mic Test Tool",
    tagline: "Quickly check if your microphone is working.",
    description:
      "See your microphone input level in real time and verify it's working before joining a call or recording.",
    categoryId: "developer",
    icon: Mic,
    status: "coming-soon",
    keywords: ["mic test", "microphone test", "audio input"],
  },
  {
    slug: "webcam-test",
    name: "Webcam Test Tool",
    tagline: "Preview your webcam to make sure it's working.",
    description:
      "Test your webcam, framerate and resolution. Verify everything works before a meeting or recording.",
    categoryId: "developer",
    icon: Webcam,
    status: "coming-soon",
    keywords: ["webcam test", "camera test", "video"],
  },

  // ─── CONVERTERS ──────────────────────────────────────────────────────────
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    tagline: "Encode and decode Base64 strings instantly.",
    description:
      "Convert text and files to and from Base64 — perfect for embedding images, debugging APIs, or moving binary data through text-only channels.",
    categoryId: "converters",
    icon: Binary,
    status: "coming-soon",
    keywords: ["base64", "encode", "decode", "binary", "encoding"],
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    tagline: "Percent-encode or decode URLs and query strings.",
    description:
      "Safely encode special characters for URLs and decode percent-encoded strings back into readable text.",
    categoryId: "converters",
    icon: Link2,
    status: "coming-soon",
    keywords: ["url", "encode", "decode", "percent", "query string"],
  },
  {
    slug: "markdown-to-html",
    name: "Markdown to HTML",
    tagline: "Convert Markdown into clean HTML instantly.",
    description:
      "Paste Markdown and get production-ready HTML — supports GitHub-flavored syntax, tables, and code blocks.",
    categoryId: "converters",
    icon: FileCode,
    status: "coming-soon",
    keywords: ["markdown", "html", "convert", "md"],
  },
  {
    slug: "hex-to-rgb",
    name: "HEX to RGB Converter",
    tagline: "Convert HEX colors to RGB / RGBA values.",
    description:
      "Instantly convert HEX color codes to RGB and RGBA, with a live preview and copy-ready output.",
    categoryId: "converters",
    icon: Pipette,
    status: "coming-soon",
    keywords: ["hex to rgb", "color converter", "rgba"],
  },
  {
    slug: "rgb-to-hex",
    name: "RGB to HEX Converter",
    tagline: "Convert RGB / RGBA color values to HEX.",
    description:
      "Turn RGB or RGBA color values into HEX codes. Preview the result and copy the value with one click.",
    categoryId: "converters",
    icon: Paintbrush,
    status: "coming-soon",
    keywords: ["rgb to hex", "color converter", "hex code"],
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    tagline: "Convert JPG images to lossless PNG.",
    description:
      "Convert JPEG images to PNG with transparency support. Batch convert and download all files at once.",
    categoryId: "converters",
    icon: ImageIcon,
    status: "coming-soon",
    keywords: ["jpg to png", "convert image", "transparency"],
  },
  {
    slug: "png-to-webp",
    name: "PNG to WebP Converter",
    tagline: "Convert PNG to WebP for smaller, faster images.",
    description:
      "Convert PNG to modern WebP for dramatically smaller file sizes with no visible quality loss.",
    categoryId: "converters",
    icon: FileImage,
    status: "coming-soon",
    keywords: ["png to webp", "image converter", "optimize"],
  },
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    tagline: "Convert any text into natural-sounding speech.",
    description:
      "Turn written text into spoken audio with multiple voices, languages and speeds. Download as MP3.",
    categoryId: "converters",
    icon: Speaker,
    status: "coming-soon",
    keywords: ["text to speech", "tts", "voice", "audio"],
  },
  {
    slug: "speech-to-text",
    name: "Speech to Text",
    tagline: "Transcribe spoken audio into accurate text.",
    description:
      "Speak into your mic or upload an audio file — get a clean, editable transcript in seconds.",
    categoryId: "converters",
    icon: AudioLines,
    status: "coming-soon",
    keywords: ["speech to text", "transcribe", "stt", "voice to text"],
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    tagline: "Live exchange rates between 150+ currencies.",
    description:
      "Convert between major and minor world currencies with live rates. Supports historical rates and bulk conversion.",
    categoryId: "converters",
    icon: Banknote,
    status: "coming-soon",
    keywords: ["currency converter", "exchange rate", "forex"],
  },

  // ─── SEO ─────────────────────────────────────────────────────────────────
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    tagline: "Generate Open Graph, Twitter and SEO meta tags.",
    description:
      "Generate complete `<head>` markup including Open Graph, Twitter cards, canonical and standard SEO tags.",
    categoryId: "seo",
    icon: Tags,
    status: "coming-soon",
    featured: true,
    keywords: ["meta tags", "open graph", "twitter card", "seo"],
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    tagline: "Build a robots.txt with allow, disallow and sitemap rules.",
    description:
      "Visually build a robots.txt with allow/disallow rules, sitemap links and user-agent targeting.",
    categoryId: "seo",
    icon: Bot,
    status: "coming-soon",
    keywords: ["robots.txt", "seo", "crawler", "sitemap"],
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    tagline: "Shorten long URLs into clean, shareable links.",
    description:
      "Turn long URLs into short, branded links. Track clicks and copy with one tap.",
    categoryId: "seo",
    icon: LinkIcon,
    status: "coming-soon",
    keywords: ["url shortener", "short link", "tinyurl"],
  },
  {
    slug: "utm-link-generator",
    name: "UTM Link Generator",
    tagline: "Build UTM-tagged URLs for campaign tracking.",
    description:
      "Generate UTM-tagged URLs to track campaign source, medium and content in Google Analytics and other tools.",
    categoryId: "seo",
    icon: BarChart3,
    status: "coming-soon",
    keywords: ["utm", "campaign tracking", "google analytics", "marketing"],
  },
  {
    slug: "whois-lookup",
    name: "WHOIS Domain Lookup",
    tagline: "Check who owns any domain and when it expires.",
    description:
      "Look up WHOIS records for any domain — registrar, owner, creation date, expiration and nameservers.",
    categoryId: "seo",
    icon: SearchCheck,
    status: "coming-soon",
    keywords: ["whois", "domain lookup", "owner", "registrar"],
  },

  // ─── IMAGE ───────────────────────────────────────────────────────────────
  {
    slug: "color-picker",
    name: "Color Picker",
    tagline: "Pick colors and convert between HEX, RGB, HSL and OKLCH.",
    description:
      "An interactive color picker with conversion between major color formats and accessibility contrast checks.",
    categoryId: "image",
    icon: Palette,
    status: "coming-soon",
    keywords: ["color", "picker", "hex", "rgb", "hsl", "oklch"],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Compress JPG, PNG and WebP without losing quality.",
    description:
      "Reduce image file size in your browser. Adjustable compression with a live preview before download.",
    categoryId: "image",
    icon: ImageDown,
    status: "coming-soon",
    keywords: ["compress", "image", "jpg", "png", "webp"],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    tagline: "Resize images to exact dimensions or by percentage.",
    description:
      "Resize JPG, PNG and WebP images to any width and height. Keep aspect ratio or set custom dimensions.",
    categoryId: "image",
    icon: Scaling,
    status: "coming-soon",
    keywords: ["image resize", "scale image", "resize photo"],
  },
  {
    slug: "gradient-generator",
    name: "Gradient Generator",
    tagline: "Create beautiful CSS gradients with live preview.",
    description:
      "Design linear, radial and conic gradients with intuitive color stops. Copy ready-to-use CSS in one click.",
    categoryId: "image",
    icon: Brush,
    status: "coming-soon",
    keywords: ["gradient", "css gradient", "linear gradient", "radial"],
  },
  {
    slug: "meme-generator",
    name: "Meme Generator",
    tagline: "Create classic memes with top and bottom text.",
    description:
      "Pick from popular meme templates or upload your own, then add top/bottom text. Download as PNG or share.",
    categoryId: "image",
    icon: PartyPopper,
    status: "coming-soon",
    keywords: ["meme", "meme generator", "image macro"],
  },
  {
    slug: "signature-generator",
    name: "Signature Generator",
    tagline: "Create a handwritten or typed digital signature.",
    description:
      "Draw or type your signature, customize the style, then download as a transparent PNG for documents and emails.",
    categoryId: "image",
    icon: Signature,
    status: "coming-soon",
    keywords: ["signature", "digital signature", "sign document"],
  },

  // ─── PDF ─────────────────────────────────────────────────────────────────
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    tagline: "Combine multiple PDFs into a single file.",
    description:
      "Merge multiple PDFs into one in any order. Drag-and-drop to reorder pages before download.",
    categoryId: "pdf",
    icon: FilePlus,
    status: "coming-soon",
    featured: true,
    keywords: ["pdf merge", "combine pdf", "join pdf"],
  },
  {
    slug: "pdf-splitter",
    name: "PDF Splitter",
    tagline: "Split a PDF into single pages or page ranges.",
    description:
      "Extract individual pages or split a PDF into multiple files by page ranges — all without uploading to a server.",
    categoryId: "pdf",
    icon: Scissors,
    status: "coming-soon",
    keywords: ["pdf split", "extract pages", "separate pdf"],
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image Converter",
    tagline: "Convert PDF pages into JPG or PNG images.",
    description:
      "Turn each page of a PDF into a high-resolution JPG or PNG. Choose pages, resolution and format.",
    categoryId: "pdf",
    icon: FileOutput,
    status: "coming-soon",
    keywords: ["pdf to image", "pdf to jpg", "pdf to png"],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF Converter",
    tagline: "Combine images into a single PDF document.",
    description:
      "Stitch JPG, PNG and WebP images together into a single PDF. Reorder pages and set page size before download.",
    categoryId: "pdf",
    icon: FileInput,
    status: "coming-soon",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf"],
  },
  {
    slug: "screenshot-to-pdf",
    name: "Screenshot to PDF",
    tagline: "Combine screenshots into a single shareable PDF.",
    description:
      "Drop screenshots, reorder them and export a single, clean PDF — perfect for bug reports and walkthroughs.",
    categoryId: "pdf",
    icon: Camera,
    status: "coming-soon",
    keywords: ["screenshot to pdf", "bug report", "walkthrough"],
  },
  {
    slug: "resume-pdf-generator",
    name: "Resume PDF Generator",
    tagline: "Build a clean, professional resume as a PDF.",
    description:
      "Fill in your details, pick a polished template, and download a print-ready PDF resume in minutes.",
    categoryId: "pdf",
    icon: FileUser,
    status: "coming-soon",
    keywords: ["resume", "cv", "pdf resume", "resume builder"],
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    tagline: "Create professional invoices and download as PDF.",
    description:
      "Build clean invoices with line items, taxes, currency and your branding — download as PDF, ready to send.",
    categoryId: "pdf",
    icon: Receipt,
    status: "coming-soon",
    keywords: ["invoice", "pdf invoice", "billing", "freelance"],
  },

  // ─── CALCULATORS ─────────────────────────────────────────────────────────
  {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    tagline: "Convert between Unix timestamps and human-readable dates.",
    description:
      "Convert epoch timestamps to ISO dates, local time and back — supports seconds and milliseconds.",
    categoryId: "calculators",
    icon: Clock,
    status: "coming-soon",
    keywords: ["unix", "timestamp", "epoch", "date converter"],
  },
  {
    slug: "typing-speed-test",
    name: "Typing Speed Test",
    tagline: "Measure your typing speed in WPM and accuracy.",
    description:
      "Test your typing speed and accuracy with timed sessions. Track WPM, errors and history across attempts.",
    categoryId: "calculators",
    icon: TimerReset,
    status: "coming-soon",
    keywords: ["typing test", "wpm", "typing speed", "accuracy"],
  },
  {
    slug: "cps-test",
    name: "CPS Test (Clicks Per Second)",
    tagline: "Measure your clicking speed in clicks per second.",
    description:
      "Click as fast as you can in a fixed time window. Track CPS, total clicks and best score.",
    categoryId: "calculators",
    icon: MousePointerClick,
    status: "coming-soon",
    keywords: ["cps test", "clicks per second", "click speed"],
  },
  {
    slug: "drag-click-test",
    name: "Drag Click Test",
    tagline: "Test your drag-click speed for gaming and benchmarks.",
    description:
      "Measure how fast you can drag-click. See your CPS history and improve your timing.",
    categoryId: "calculators",
    icon: Move,
    status: "coming-soon",
    keywords: ["drag click", "click test", "gaming"],
  },
  {
    slug: "spacebar-counter",
    name: "Spacebar Counter",
    tagline: "Count how many times you can hit space in a window.",
    description:
      "Hit the spacebar as many times as you can in a fixed time window. Track and share your high scores.",
    categoryId: "calculators",
    icon: SquareAsterisk,
    status: "coming-soon",
    keywords: ["spacebar counter", "space test", "tap test"],
  },
  {
    slug: "reaction-time-test",
    name: "Reaction Time Test",
    tagline: "Measure your reaction time in milliseconds.",
    description:
      "Test your reflexes — click when the signal changes and see how fast you react. Track best and average times.",
    categoryId: "calculators",
    icon: Timer,
    status: "coming-soon",
    keywords: ["reaction time", "reflex test", "reaction"],
  },
  {
    slug: "stopwatch",
    name: "Stopwatch",
    tagline: "A precise online stopwatch with lap times.",
    description:
      "Start, stop, lap and reset — a clean online stopwatch precise to the millisecond.",
    categoryId: "calculators",
    icon: Timer,
    status: "coming-soon",
    keywords: ["stopwatch", "timer", "laps"],
  },
  {
    slug: "alarm-clock",
    name: "Alarm Clock",
    tagline: "Set browser-based alarms that ring on time.",
    description:
      "Set one or more alarms with custom labels and tones. Keep the tab open and they'll ring on time.",
    categoryId: "calculators",
    icon: AlarmClock,
    status: "coming-soon",
    keywords: ["alarm clock", "online alarm", "timer"],
  },
  {
    slug: "pomodoro-timer",
    name: "Pomodoro Timer",
    tagline: "Focus with 25-minute work and 5-minute break cycles.",
    description:
      "A clean Pomodoro timer to boost focus. Customize work and break durations, track sessions, and stay deep.",
    categoryId: "calculators",
    icon: Hourglass,
    status: "coming-soon",
    keywords: ["pomodoro", "focus timer", "productivity"],
  },
  {
    slug: "age-difference-calculator",
    name: "Age Difference Calculator",
    tagline: "Calculate the precise age difference between two dates.",
    description:
      "Get the exact difference between two dates — years, months, weeks, days, hours and minutes.",
    categoryId: "calculators",
    icon: Cake,
    status: "coming-soon",
    keywords: ["age calculator", "date difference", "years"],
  },
  {
    slug: "business-days-calculator",
    name: "Business Days Calculator",
    tagline: "Count working days between two dates.",
    description:
      "Calculate the number of business days between two dates — skipping weekends and optional holidays.",
    categoryId: "calculators",
    icon: CalendarDays,
    status: "coming-soon",
    keywords: ["business days", "working days", "weekday counter"],
  },
  {
    slug: "leap-year-checker",
    name: "Leap Year Checker",
    tagline: "Check if any year is a leap year.",
    description:
      "Find out which years are leap years and view a list of past and upcoming leap years.",
    categoryId: "calculators",
    icon: Calendar,
    status: "coming-soon",
    keywords: ["leap year", "year checker", "calendar"],
  },
  {
    slug: "sunrise-sunset",
    name: "Sunrise & Sunset Time",
    tagline: "Find sunrise, sunset and daylight times by location.",
    description:
      "Get sunrise, sunset, solar noon and daylight duration for any city or coordinates on any date.",
    categoryId: "calculators",
    icon: Sunrise,
    status: "coming-soon",
    keywords: ["sunrise", "sunset", "daylight", "solar"],
  },
  {
    slug: "world-clock",
    name: "World Clock",
    tagline: "Track time across multiple cities at a glance.",
    description:
      "See current time in cities around the world side-by-side. Perfect for remote teams and travel planning.",
    categoryId: "calculators",
    icon: Globe,
    status: "coming-soon",
    keywords: ["world clock", "time zones", "city time"],
  },
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    tagline: "Calculate monthly EMI for any loan amount.",
    description:
      "Estimate your monthly EMI by entering loan amount, interest rate and tenure. See full amortization schedule.",
    categoryId: "calculators",
    icon: Wallet,
    status: "coming-soon",
    keywords: ["emi", "loan emi", "monthly payment"],
  },
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    tagline: "Estimate loan payments, interest and total cost.",
    description:
      "Calculate total loan cost, interest paid and monthly payments for any loan. Compare scenarios side-by-side.",
    categoryId: "calculators",
    icon: Landmark,
    status: "coming-soon",
    keywords: ["loan", "interest", "payment calculator"],
  },
  {
    slug: "gst-vat-calculator",
    name: "GST / VAT Calculator",
    tagline: "Add or remove GST/VAT from any amount.",
    description:
      "Quickly add or remove GST, VAT or sales tax from any price. Supports multiple regions and custom rates.",
    categoryId: "calculators",
    icon: Percent,
    status: "coming-soon",
    keywords: ["gst", "vat", "sales tax", "tax calculator"],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    tagline: "Split bills and calculate tips effortlessly.",
    description:
      "Calculate tips by percentage and split the total across any number of people — with rounding options.",
    categoryId: "calculators",
    icon: DollarSign,
    status: "coming-soon",
    keywords: ["tip calculator", "bill split", "gratuity"],
  },
  {
    slug: "fuel-cost-calculator",
    name: "Fuel Cost Calculator",
    tagline: "Estimate the fuel cost of any trip.",
    description:
      "Plan your trip cost based on distance, mileage and fuel price. Compare vehicles and routes.",
    categoryId: "calculators",
    icon: Fuel,
    status: "coming-soon",
    keywords: ["fuel cost", "trip cost", "mileage"],
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    tagline: "Calculate Body Mass Index in metric or imperial.",
    description:
      "Find your BMI from height and weight. See your category and ideal-weight range — supports kg/cm and lb/in.",
    categoryId: "calculators",
    icon: HeartPulse,
    status: "coming-soon",
    keywords: ["bmi", "body mass index", "health"],
  },
  {
    slug: "calorie-calculator",
    name: "Calorie Calculator",
    tagline: "Estimate daily calorie needs based on activity.",
    description:
      "Calculate your daily calorie requirements based on age, gender, weight, height and activity level.",
    categoryId: "calculators",
    icon: Flame,
    status: "coming-soon",
    keywords: ["calorie", "tdee", "bmr", "diet"],
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake Calculator",
    tagline: "Find your ideal daily water intake.",
    description:
      "Calculate how much water you should drink each day based on your weight, activity and climate.",
    categoryId: "calculators",
    icon: Droplet,
    status: "coming-soon",
    keywords: ["water intake", "hydration", "health"],
  },
  {
    slug: "love-compatibility-calculator",
    name: "Love Compatibility Calculator",
    tagline: "A fun compatibility score between two names.",
    description:
      "Just for fun — enter two names and get a love-compatibility percentage with a playful breakdown.",
    categoryId: "calculators",
    icon: Heart,
    status: "coming-soon",
    keywords: ["love calculator", "compatibility", "fun"],
  },
  {
    slug: "zodiac-sign-finder",
    name: "Zodiac Sign Finder",
    tagline: "Find your zodiac sign by date of birth.",
    description:
      "Enter your birth date to discover your Western and Chinese zodiac signs, traits and element.",
    categoryId: "calculators",
    icon: Star,
    status: "coming-soon",
    keywords: ["zodiac", "horoscope", "astrology"],
  },

  // ════════════════════════════════════════════════════════════════════════
  // SECOND BATCH (102 tools)
  // ════════════════════════════════════════════════════════════════════════

  // ─── GENERATORS (batch 2) ────────────────────────────────────────────────
  {
    slug: "random-password-phrase-generator",
    name: "Random Password Phrase Generator",
    tagline: "Generate memorable passphrases like correct-horse-battery-staple.",
    description:
      "Generate human-friendly passphrases that are easier to remember and harder to crack than random character strings.",
    categoryId: "generators",
    icon: KeyRound,
    status: "coming-soon",
    keywords: ["passphrase", "password", "diceware", "xkcd"],
  },
  {
    slug: "email-signature-generator",
    name: "Email Signature Generator",
    tagline: "Build a clean, professional email signature.",
    description:
      "Design a polished email signature with logo, social icons and brand colors. Export HTML ready to paste.",
    categoryId: "generators",
    icon: Mailbox,
    status: "coming-soon",
    keywords: ["email signature", "signature generator", "html signature"],
  },
  {
    slug: "disposable-password-generator",
    name: "Disposable Password Generator",
    tagline: "Single-use passwords that expire after viewing.",
    description:
      "Generate one-time passwords that auto-expire after a set time or first view — perfect for sharing credentials safely.",
    categoryId: "generators",
    icon: KeySquare,
    status: "coming-soon",
    keywords: ["disposable password", "one-time password", "secure share"],
  },
  {
    slug: "favicon-from-text",
    name: "Favicon Generator from Text",
    tagline: "Create a favicon from a letter, emoji or word.",
    description:
      "Generate a clean favicon set from any text, letter or emoji. Export PNG and ICO sizes ready for production.",
    categoryId: "generators",
    icon: ImagePlus,
    status: "coming-soon",
    keywords: ["favicon", "icon generator", "site icon"],
  },
  {
    slug: "mac-address-generator",
    name: "MAC Address Generator",
    tagline: "Generate random or vendor-specific MAC addresses.",
    description:
      "Create random MAC addresses, with optional OUI prefixes for specific hardware vendors — useful for network testing.",
    categoryId: "generators",
    icon: RadioTower,
    status: "coming-soon",
    keywords: ["mac address", "network", "oui", "ethernet"],
  },
  {
    slug: "vcard-generator",
    name: "VCard Generator",
    tagline: "Build a downloadable .vcf contact card.",
    description:
      "Create a vCard with name, phone, email, address and notes. Download as a .vcf file or share via QR code.",
    categoryId: "generators",
    icon: ContactRound,
    status: "coming-soon",
    keywords: ["vcard", "vcf", "contact card", "contacts"],
  },
  {
    slug: "digital-business-card",
    name: "Digital Business Card Creator",
    tagline: "Build a shareable digital business card.",
    description:
      "Create a beautiful digital business card with your photo, contact details and social links. Share via link or QR.",
    categoryId: "generators",
    icon: Contact,
    status: "coming-soon",
    keywords: ["business card", "digital card", "networking"],
  },
  {
    slug: "avatar-generator",
    name: "Avatar Generator",
    tagline: "Generate unique avatars from names or seeds.",
    description:
      "Create unique, deterministic avatars from any seed string — great for placeholder profile pictures.",
    categoryId: "generators",
    icon: UserCircle2,
    status: "coming-soon",
    keywords: ["avatar", "profile picture", "identicon"],
  },
  {
    slug: "qr-menu-generator",
    name: "QR Menu Generator for Restaurants",
    tagline: "Create QR-code menus for restaurants and cafés.",
    description:
      "Build a digital restaurant menu with categories, prices and images, then generate a QR code customers can scan at the table.",
    categoryId: "generators",
    icon: QrCode,
    status: "coming-soon",
    keywords: ["qr menu", "restaurant menu", "digital menu"],
  },
  {
    slug: "temporary-email-generator",
    name: "Temporary Email Generator",
    tagline: "Get a disposable inbox to avoid spam.",
    description:
      "Generate a temporary email address that auto-expires. Read incoming messages in your browser without signing up.",
    categoryId: "generators",
    icon: MailX,
    status: "coming-soon",
    keywords: ["temporary email", "disposable email", "throwaway", "spam"],
  },
  {
    slug: "ai-prompt-enhancer",
    name: "AI Prompt Enhancer",
    tagline: "Rewrite vague prompts into clear, effective ones.",
    description:
      "Improve your prompts for ChatGPT, Claude, Gemini and other LLMs. Add structure, context and constraints automatically.",
    categoryId: "generators",
    icon: WandSparkles,
    status: "coming-soon",
    featured: true,
    keywords: ["ai prompt", "prompt engineering", "chatgpt", "claude"],
  },

  // ─── TEXT (batch 2) ──────────────────────────────────────────────────────
  {
    slug: "text-reverser",
    name: "Text Reverser",
    tagline: "Reverse any text character-by-character or by word.",
    description:
      "Flip text backwards — by character, word or line. Useful for designs, puzzles and just plain fun.",
    categoryId: "text",
    icon: ArrowRightLeft,
    status: "coming-soon",
    keywords: ["reverse text", "backwards text", "flip text"],
  },
  {
    slug: "duplicate-word-finder",
    name: "Duplicate Word Finder",
    tagline: "Find and highlight duplicate words in any text.",
    description:
      "Identify repeated words in your writing. Highlights, counts and suggests synonyms for variety.",
    categoryId: "text",
    icon: Highlighter,
    status: "coming-soon",
    keywords: ["duplicate words", "repeated words", "writing tool"],
  },
  {
    slug: "ai-text-humanizer",
    name: "AI Text Humanizer",
    tagline: "Make AI-generated text sound more human.",
    description:
      "Rewrite robotic AI text into a more natural, human tone — perfect for posts, emails and essays.",
    categoryId: "text",
    icon: Bot,
    status: "coming-soon",
    keywords: ["ai humanizer", "rewrite ai", "natural text"],
  },
  {
    slug: "sentence-rewriter",
    name: "Sentence Rewriter",
    tagline: "Rephrase sentences while preserving meaning.",
    description:
      "Get multiple high-quality rewrites of any sentence. Adjust tone — formal, casual, persuasive — instantly.",
    categoryId: "text",
    icon: Wand2,
    status: "coming-soon",
    keywords: ["paraphrase", "rewriter", "rephrase"],
  },
  {
    slug: "emoji-translator",
    name: "Emoji Translator",
    tagline: "Translate text to emoji and back.",
    description:
      "Convert plain text into expressive emoji-rich messages, or decode emoji-only text back to plain language.",
    categoryId: "text",
    icon: Smile,
    status: "coming-soon",
    keywords: ["emoji translator", "emoji decode", "fun text"],
  },
  {
    slug: "youtube-tag-extractor",
    name: "YouTube Tag Extractor",
    tagline: "Pull tags from any YouTube video.",
    description:
      "Extract the tags used on any public YouTube video. Great for competitive analysis and inspiration.",
    categoryId: "text",
    icon: Tv,
    status: "coming-soon",
    keywords: ["youtube tags", "video tags", "yt seo"],
  },
  {
    slug: "youtube-timestamp-link",
    name: "YouTube Timestamp Link Generator",
    tagline: "Generate links that jump to a specific moment in a video.",
    description:
      "Create shareable YouTube links that start at an exact second. Add multiple timestamps to chapter a video.",
    categoryId: "text",
    icon: Film,
    status: "coming-soon",
    keywords: ["youtube timestamp", "video link", "yt chapter"],
  },
  {
    slug: "social-post-formatter",
    name: "Social Media Post Formatter",
    tagline: "Format posts with line breaks, bold and emoji.",
    description:
      "Format social posts with proper spacing, bold Unicode text and emoji decorations — preview before posting.",
    categoryId: "text",
    icon: Megaphone,
    status: "coming-soon",
    keywords: ["social media", "post formatter", "twitter format"],
  },
  {
    slug: "tweet-character-counter",
    name: "Tweet Character Counter",
    tagline: "Count tweets and threads against the X/Twitter limit.",
    description:
      "Live character count for tweets with limit indicator, thread splitting and inline preview.",
    categoryId: "text",
    icon: Pilcrow,
    status: "coming-soon",
    keywords: ["tweet counter", "twitter character", "x character limit"],
  },
  {
    slug: "linkedin-post-formatter",
    name: "LinkedIn Post Formatter",
    tagline: "Add bold, italic and line-breaks to LinkedIn posts.",
    description:
      "Format LinkedIn posts with bold, italic Unicode characters and clean line breaks for higher engagement.",
    categoryId: "text",
    icon: BookText,
    status: "coming-soon",
    keywords: ["linkedin", "post formatter", "bold linkedin"],
  },
  {
    slug: "instagram-caption-formatter",
    name: "Instagram Caption Formatter",
    tagline: "Format captions with line breaks that actually display.",
    description:
      "Format Instagram captions with proper line breaks, hashtag spacing and fancy text styles.",
    categoryId: "text",
    icon: Camera,
    status: "coming-soon",
    keywords: ["instagram caption", "caption formatter", "ig line break"],
  },
  {
    slug: "discord-timestamp-generator",
    name: "Discord Timestamp Generator",
    tagline: "Generate dynamic timestamps for Discord messages.",
    description:
      "Create Discord-flavored timestamps (relative, short, long, full) that auto-localize for each viewer.",
    categoryId: "text",
    icon: MessagesSquare,
    status: "coming-soon",
    keywords: ["discord", "timestamp", "discord bot"],
  },
  {
    slug: "whatsapp-link-generator",
    name: "WhatsApp Link Generator",
    tagline: "Create wa.me links with pre-filled messages.",
    description:
      "Generate WhatsApp click-to-chat links with phone number and pre-filled message — great for support and sales.",
    categoryId: "text",
    icon: MessageCircle,
    status: "coming-soon",
    keywords: ["whatsapp", "wa.me", "click to chat"],
  },

  // ─── DEVELOPER (batch 2) ─────────────────────────────────────────────────
  {
    slug: "text-diff-checker",
    name: "Text Diff Checker",
    tagline: "Compare two texts side-by-side with highlighted differences.",
    description:
      "Spot every change between two pieces of text. Line and word-level diff with green/red highlighting.",
    categoryId: "developer",
    icon: GitCompareArrows,
    status: "coming-soon",
    keywords: ["diff", "compare text", "text difference"],
  },
  {
    slug: "duplicate-line-remover",
    name: "Duplicate Line Remover",
    tagline: "Remove duplicate lines from any text or list.",
    description:
      "Strip duplicate lines from any text or list. Optionally trim whitespace and ignore case.",
    categoryId: "developer",
    icon: ListMinus,
    status: "coming-soon",
    keywords: ["dedupe", "remove duplicates", "unique lines"],
  },
  {
    slug: "line-sorter",
    name: "Line Sorter",
    tagline: "Sort lines alphabetically, numerically or randomly.",
    description:
      "Sort lines A-Z, Z-A, by number, by length or shuffled. Case-sensitive options included.",
    categoryId: "developer",
    icon: ArrowDownAZ,
    status: "coming-soon",
    keywords: ["sort lines", "alphabetize", "line sorter"],
  },
  {
    slug: "secure-file-shredder",
    name: "Secure File Shredder",
    tagline: "Overwrite files in your browser before deleting.",
    description:
      "Overwrite the contents of a file with random data before downloading the shredded version — entirely client-side.",
    categoryId: "developer",
    icon: FileLock2,
    status: "coming-soon",
    keywords: ["file shredder", "secure delete", "data wipe"],
  },
  {
    slug: "session-id-generator",
    name: "Session ID Generator",
    tagline: "Generate secure random session IDs.",
    description:
      "Generate cryptographically random session tokens with custom length and encoding (hex, base64, base64url).",
    categoryId: "developer",
    icon: Cookie,
    status: "coming-soon",
    keywords: ["session id", "token", "random id"],
  },
  {
    slug: "api-key-generator",
    name: "API Key Generator",
    tagline: "Generate secure, random API keys.",
    description:
      "Create production-ready API keys with custom prefixes, length and entropy. Copy or download for safe storage.",
    categoryId: "developer",
    icon: Key,
    status: "coming-soon",
    keywords: ["api key", "secret key", "token generator"],
  },
  {
    slug: "encryption-key-generator",
    name: "Encryption Key Generator",
    tagline: "Generate AES, RSA and ECDSA keys in your browser.",
    description:
      "Generate secure cryptographic keys for AES, RSA, ECDSA and more — all client-side via the Web Crypto API.",
    categoryId: "developer",
    icon: ShieldHalf,
    status: "coming-soon",
    keywords: ["encryption key", "aes", "rsa", "crypto"],
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    tagline: "Sign and generate JSON Web Tokens.",
    description:
      "Build and sign JWTs with custom header, payload and secret. Supports HS256, HS512, RS256 and more.",
    categoryId: "developer",
    icon: Key,
    status: "coming-soon",
    keywords: ["jwt", "sign jwt", "token generator"],
  },
  {
    slug: "cron-time-translator",
    name: "Cron Time Translator",
    tagline: "Translate cron expressions into plain English.",
    description:
      "Paste any cron expression to see its next run times and a human-readable description.",
    categoryId: "developer",
    icon: CalendarClock,
    status: "coming-soon",
    keywords: ["cron", "crontab", "schedule"],
  },
  {
    slug: "cron-job-expression-generator",
    name: "Cron Job Expression Generator",
    tagline: "Build cron expressions with a visual editor.",
    description:
      "Pick minutes, hours, days and months from a friendly UI — get a valid cron expression back.",
    categoryId: "developer",
    icon: Cog,
    status: "coming-soon",
    keywords: ["cron expression", "schedule generator", "crontab builder"],
  },
  {
    slug: "regex-generator",
    name: "Regex Generator",
    tagline: "Build regular expressions from natural language.",
    description:
      "Describe what you want to match, get a working regex — with live test cases and explanation.",
    categoryId: "developer",
    icon: Regex,
    status: "coming-soon",
    keywords: ["regex builder", "regex generator", "regular expression"],
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    tagline: "Beautify SQL queries with proper indentation.",
    description:
      "Format messy SQL into readable, indented queries. Supports MySQL, PostgreSQL, SQL Server, SQLite and more.",
    categoryId: "developer",
    icon: Database,
    status: "coming-soon",
    keywords: ["sql formatter", "sql beautifier", "format query"],
  },
  {
    slug: "sql-query-beautifier",
    name: "SQL Query Beautifier",
    tagline: "Indent and color-highlight long SQL queries.",
    description:
      "Beautify and syntax-highlight long SQL queries for review. Side-by-side input/output with copy controls.",
    categoryId: "developer",
    icon: DatabaseZap,
    status: "coming-soon",
    keywords: ["sql beautifier", "sql format", "query highlight"],
  },
  {
    slug: "toml-formatter",
    name: "TOML Formatter",
    tagline: "Format and validate TOML configuration files.",
    description:
      "Beautify, validate and convert TOML configuration. Catch syntax errors with clear, line-pointing messages.",
    categoryId: "developer",
    icon: FileCog,
    status: "coming-soon",
    keywords: ["toml", "format", "config"],
  },
  {
    slug: "code-screenshot-generator",
    name: "Code Screenshot Generator",
    tagline: "Turn code into beautiful shareable images.",
    description:
      "Paste code, pick a theme and language, then download a polished screenshot — perfect for blogs and tweets.",
    categoryId: "developer",
    icon: Code,
    status: "coming-soon",
    keywords: ["carbon", "code image", "code screenshot"],
  },
  {
    slug: "terminal-cheatsheet",
    name: "Terminal Command Cheat Sheet",
    tagline: "Quick reference of common shell commands.",
    description:
      "A searchable cheat sheet of common Bash, Zsh and Git commands with examples and flags.",
    categoryId: "developer",
    icon: Terminal,
    status: "coming-soon",
    keywords: ["terminal", "cheat sheet", "bash", "git"],
  },
  {
    slug: "keyboard-shortcut-generator",
    name: "Keyboard Shortcut Generator",
    tagline: "Design and visualize keyboard shortcuts.",
    description:
      "Build keyboard shortcut graphics for docs and tutorials. Pick keys, choose a layout and export as PNG.",
    categoryId: "developer",
    icon: Keyboard,
    status: "coming-soon",
    keywords: ["keyboard shortcut", "keymap", "hotkey"],
  },
  {
    slug: "api-response-viewer",
    name: "API Response Viewer",
    tagline: "Pretty-print and explore JSON API responses.",
    description:
      "Paste an API response — JSON, XML or text — to explore it with a collapsible tree, search and copy.",
    categoryId: "developer",
    icon: ServerCog,
    status: "coming-soon",
    keywords: ["api response", "json viewer", "api inspector"],
  },
  {
    slug: "http-header-checker",
    name: "HTTP Header Checker",
    tagline: "Inspect HTTP response headers for any URL.",
    description:
      "Look up HTTP response headers, security headers and CORS for any public URL.",
    categoryId: "developer",
    icon: ListChecks,
    status: "coming-soon",
    keywords: ["http headers", "response headers", "cors"],
  },
  {
    slug: "mime-type-checker",
    name: "MIME Type Checker",
    tagline: "Find the MIME type of any file or URL.",
    description:
      "Upload a file or paste a URL to detect its true MIME type — useful when extensions lie or are missing.",
    categoryId: "developer",
    icon: FileQuestion,
    status: "coming-soon",
    keywords: ["mime type", "content type", "file type"],
  },
  {
    slug: "website-source-viewer",
    name: "Website Source Code Viewer",
    tagline: "View the raw HTML source of any URL.",
    description:
      "Fetch and pretty-print the raw HTML of any public URL — even mobile pages and SSR sites.",
    categoryId: "developer",
    icon: FileSearch,
    status: "coming-soon",
    keywords: ["view source", "html source", "website code"],
  },
  {
    slug: "mac-address-lookup",
    name: "MAC Address Lookup",
    tagline: "Find the vendor for any MAC address OUI.",
    description:
      "Look up the hardware vendor (OUI) for any MAC address. Identify network devices instantly.",
    categoryId: "developer",
    icon: ScanSearch,
    status: "coming-soon",
    keywords: ["mac lookup", "oui", "vendor"],
  },
  {
    slug: "uuid-validator",
    name: "UUID Validator",
    tagline: "Verify and identify the version of any UUID.",
    description:
      "Check if a UUID is valid and detect its version (v1, v3, v4, v5, v7). Bulk-validate lists too.",
    categoryId: "developer",
    icon: BadgeCheck,
    status: "coming-soon",
    keywords: ["uuid validator", "uuid version", "guid check"],
  },
  {
    slug: "ssl-certificate-checker",
    name: "SSL Certificate Checker",
    tagline: "Inspect any site's SSL certificate details.",
    description:
      "Look up SSL certificate issuer, validity, chain and supported protocols for any HTTPS site.",
    categoryId: "developer",
    icon: ShieldCheck,
    status: "coming-soon",
    keywords: ["ssl", "certificate", "https check"],
  },
  {
    slug: "duplicate-file-cleaner",
    name: "Duplicate File Name Cleaner",
    tagline: "Find and rename duplicate file names in a list.",
    description:
      "Paste a list of file names to find duplicates, suggest unique alternatives, or batch-rename with counters.",
    categoryId: "developer",
    icon: Files,
    status: "coming-soon",
    keywords: ["duplicate files", "rename files", "file list"],
  },
  {
    slug: "file-metadata-viewer",
    name: "File Metadata Viewer",
    tagline: "Inspect a file's metadata, EXIF and more.",
    description:
      "Upload any file to view EXIF, IPTC, MIME, size and creation metadata — all in your browser.",
    categoryId: "developer",
    icon: FileSearch,
    status: "coming-soon",
    keywords: ["file metadata", "exif viewer", "file info"],
  },
  {
    slug: "exif-data-remover",
    name: "EXIF Data Remover",
    tagline: "Strip EXIF and location data from photos.",
    description:
      "Remove EXIF, GPS and other identifying metadata from JPG and HEIC images before sharing.",
    categoryId: "developer",
    icon: FileX,
    status: "coming-soon",
    keywords: ["exif remover", "metadata strip", "privacy"],
  },
  {
    slug: "unicode-character-finder",
    name: "Unicode Character Finder",
    tagline: "Search any Unicode character by name or code.",
    description:
      "Search the Unicode database for any character — by name, code point or visual style. Copy with one click.",
    categoryId: "developer",
    icon: Search,
    status: "coming-soon",
    keywords: ["unicode", "character finder", "code point"],
  },
  {
    slug: "keyboard-layout-visualizer",
    name: "Keyboard Layout Visualizer",
    tagline: "Visualize QWERTY, Dvorak, Colemak and custom layouts.",
    description:
      "See and compare keyboard layouts — QWERTY, Dvorak, Colemak, AZERTY and more — interactively.",
    categoryId: "developer",
    icon: Keyboard,
    status: "coming-soon",
    keywords: ["keyboard layout", "dvorak", "colemak"],
  },
  {
    slug: "fake-json-data-generator",
    name: "Fake JSON Data Generator",
    tagline: "Generate realistic JSON test data on demand.",
    description:
      "Define a schema and generate fake JSON arrays with names, emails, IDs and more — perfect for API mocking.",
    categoryId: "developer",
    icon: Database,
    status: "coming-soon",
    keywords: ["fake json", "mock data", "test data"],
  },
  {
    slug: "sql-dummy-data-generator",
    name: "SQL Dummy Data Generator",
    tagline: "Generate INSERT statements with realistic data.",
    description:
      "Define columns and generate ready-to-run SQL INSERT statements with fake-but-believable data.",
    categoryId: "developer",
    icon: DatabaseBackup,
    status: "coming-soon",
    keywords: ["sql dummy", "fake data", "mock database"],
  },
  {
    slug: "random-file-generator",
    name: "Random File Generator",
    tagline: "Create random files of any size and type.",
    description:
      "Generate random files (text, binary, image) of any size for upload testing, storage benchmarks and demos.",
    categoryId: "developer",
    icon: FileQuestion,
    status: "coming-soon",
    keywords: ["random file", "test file", "dummy file"],
  },

  // ─── CONVERTERS (batch 2) ────────────────────────────────────────────────
  {
    slug: "csv-to-json",
    name: "CSV to JSON Converter",
    tagline: "Convert CSV files into clean JSON arrays.",
    description:
      "Parse CSV (auto-detect delimiter and headers) into JSON arrays or objects. Download or copy the result.",
    categoryId: "converters",
    icon: FileSpreadsheet,
    status: "coming-soon",
    keywords: ["csv to json", "csv parser", "convert csv"],
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV Converter",
    tagline: "Turn JSON arrays into spreadsheet-ready CSV.",
    description:
      "Convert JSON arrays of objects into clean CSV — auto-flatten nested fields and pick the columns you want.",
    categoryId: "converters",
    icon: FileSpreadsheet,
    status: "coming-soon",
    keywords: ["json to csv", "csv export", "convert json"],
  },
  {
    slug: "yaml-to-json",
    name: "YAML to JSON Converter",
    tagline: "Convert YAML to JSON and back.",
    description:
      "Convert between YAML and JSON in either direction. Validate as you type with clear error messages.",
    categoryId: "converters",
    icon: FileCode,
    status: "coming-soon",
    keywords: ["yaml to json", "json to yaml", "convert"],
  },
  {
    slug: "html-to-markdown",
    name: "HTML to Markdown",
    tagline: "Convert HTML content into clean Markdown.",
    description:
      "Paste HTML and get clean GitHub-flavored Markdown back. Preserves tables, code blocks and links.",
    categoryId: "converters",
    icon: FileType,
    status: "coming-soon",
    keywords: ["html to markdown", "convert", "md"],
  },
  {
    slug: "binary-to-decimal",
    name: "Binary to Decimal",
    tagline: "Convert binary numbers to decimal in one click.",
    description:
      "Convert binary numbers to decimal (base 10) or back. Supports negative numbers and large values.",
    categoryId: "converters",
    icon: Binary,
    status: "coming-soon",
    keywords: ["binary to decimal", "base 2", "number converter"],
  },
  {
    slug: "decimal-to-binary",
    name: "Decimal to Binary",
    tagline: "Convert decimal numbers to binary.",
    description:
      "Convert decimal numbers to binary (base 2). Step-by-step conversion is shown so you can learn the method.",
    categoryId: "converters",
    icon: Binary,
    status: "coming-soon",
    keywords: ["decimal to binary", "base 2", "number converter"],
  },
  {
    slug: "hexadecimal-converter",
    name: "Hexadecimal Converter",
    tagline: "Convert between hex, decimal, binary and octal.",
    description:
      "Convert any number between hex, decimal, binary and octal — supports arbitrary precision and negatives.",
    categoryId: "converters",
    icon: Hash,
    status: "coming-soon",
    keywords: ["hex converter", "hexadecimal", "base 16"],
  },
  {
    slug: "roman-numeral-converter",
    name: "Roman Numeral Converter",
    tagline: "Convert Arabic numbers to Roman numerals and back.",
    description:
      "Convert standard numbers to Roman numerals (and back). Supports numbers 1 through 3,999,999.",
    categoryId: "converters",
    icon: BookOpenText,
    status: "coming-soon",
    keywords: ["roman numerals", "number converter"],
  },
  {
    slug: "morse-code-translator",
    name: "Morse Code Translator",
    tagline: "Translate text to Morse code and back.",
    description:
      "Convert text to Morse code (and back). Includes audio playback at adjustable speed.",
    categoryId: "converters",
    icon: SignalHigh,
    status: "coming-soon",
    keywords: ["morse code", "morse translator", "decode morse"],
  },
  {
    slug: "braille-translator",
    name: "Braille Translator",
    tagline: "Translate text to Unicode Braille characters.",
    description:
      "Convert text to and from Braille (Grade 1) using Unicode Braille characters.",
    categoryId: "converters",
    icon: Languages,
    status: "coming-soon",
    keywords: ["braille", "translator", "accessibility"],
  },
  {
    slug: "nato-alphabet-converter",
    name: "NATO Alphabet Converter",
    tagline: "Spell text using the NATO phonetic alphabet.",
    description:
      "Convert text into the NATO phonetic alphabet — Alpha, Bravo, Charlie — perfect for clear voice communication.",
    categoryId: "converters",
    icon: RadioTower,
    status: "coming-soon",
    keywords: ["nato alphabet", "phonetic", "spell"],
  },

  // ─── SEO (batch 2) ───────────────────────────────────────────────────────
  {
    slug: "broken-link-checker",
    name: "Broken Link Checker",
    tagline: "Find dead links on any page.",
    description:
      "Scan any URL for broken internal and external links. Get a clean report with status codes and redirects.",
    categoryId: "seo",
    icon: Link2Off,
    status: "coming-soon",
    keywords: ["broken link", "dead link", "link checker"],
  },
  {
    slug: "meta-tag-analyzer",
    name: "Meta Tag Analyzer",
    tagline: "Audit a page's title, description and meta tags.",
    description:
      "Pull and analyze a page's title, description, OG and Twitter tags. Catch missing tags and length issues.",
    categoryId: "seo",
    icon: Tags,
    status: "coming-soon",
    keywords: ["meta tag analyzer", "seo audit", "page analyzer"],
  },
  {
    slug: "open-graph-preview",
    name: "Open Graph Preview",
    tagline: "Preview how your URL looks when shared on social.",
    description:
      "See exactly how any URL renders when shared on Facebook, X, LinkedIn, Slack and more.",
    categoryId: "seo",
    icon: BookImage,
    status: "coming-soon",
    featured: true,
    keywords: ["open graph", "og preview", "social preview"],
  },
  {
    slug: "htaccess-redirect-generator",
    name: "htaccess Redirect Generator",
    tagline: "Build Apache .htaccess redirect rules visually.",
    description:
      "Generate clean .htaccess redirect rules from a simple form — 301s, 302s and regex-based rewrites.",
    categoryId: "seo",
    icon: Cog,
    status: "coming-soon",
    keywords: ["htaccess", "redirect", "apache"],
  },
  {
    slug: "redirect-chain-checker",
    name: "Redirect Chain Checker",
    tagline: "Trace every hop in a URL's redirect chain.",
    description:
      "Follow a URL through every redirect to its final destination — see status codes, timing and chain length.",
    categoryId: "seo",
    icon: ArrowRightLeft,
    status: "coming-soon",
    keywords: ["redirect chain", "301 chain", "http redirect"],
  },
  {
    slug: "canonical-url-checker",
    name: "Canonical URL Checker",
    tagline: "Check the canonical URL set by any page.",
    description:
      "Inspect a page's canonical tag, alternate hreflangs and duplicate-content signals.",
    categoryId: "seo",
    icon: LinkIcon,
    status: "coming-soon",
    keywords: ["canonical url", "rel canonical", "seo"],
  },
  {
    slug: "mobile-friendly-test",
    name: "Mobile-Friendly Test",
    tagline: "See how mobile-friendly any URL is.",
    description:
      "Render a URL in a mobile viewport with checks for tap targets, viewport meta tag and readable font sizes.",
    categoryId: "seo",
    icon: Smartphone,
    status: "coming-soon",
    keywords: ["mobile friendly", "mobile test", "responsive"],
  },
  {
    slug: "website-cache-checker",
    name: "Website Cache Checker",
    tagline: "Check Google's cached version of any URL.",
    description:
      "View Google's cached version of any page and its last cache timestamp.",
    categoryId: "seo",
    icon: DatabaseBackup,
    status: "coming-soon",
    keywords: ["cache checker", "google cache", "cached version"],
  },
  {
    slug: "cdn-checker",
    name: "CDN Checker",
    tagline: "Detect which CDN a site is using.",
    description:
      "Identify the CDN powering any website — Cloudflare, Fastly, Akamai, BunnyCDN and more.",
    categoryId: "seo",
    icon: Globe2,
    status: "coming-soon",
    keywords: ["cdn checker", "cdn detect", "cloudflare"],
  },
  {
    slug: "ssl-expiry-reminder",
    name: "SSL Expiry Reminder",
    tagline: "Track SSL certificate expiry across your domains.",
    description:
      "Add domains and get reminders before their SSL certificate expires — avoid surprise outages.",
    categoryId: "seo",
    icon: ShieldAlert,
    status: "coming-soon",
    keywords: ["ssl expiry", "certificate expiry", "ssl reminder"],
  },
  {
    slug: "website-uptime-monitor",
    name: "Website Uptime Monitor",
    tagline: "Monitor a URL and get alerts when it goes down.",
    description:
      "Track the uptime of any URL with a public status timeline and downtime alerts.",
    categoryId: "seo",
    icon: Activity,
    status: "coming-soon",
    keywords: ["uptime monitor", "site monitor", "downtime"],
  },
  {
    slug: "sitemap-validator",
    name: "Sitemap Validator",
    tagline: "Validate any sitemap.xml against the spec.",
    description:
      "Check the structure, encoding and URL count of any sitemap.xml — spot errors before submitting to Google.",
    categoryId: "seo",
    icon: Map,
    status: "coming-soon",
    keywords: ["sitemap validator", "sitemap.xml", "seo"],
  },
  {
    slug: "domain-age-checker",
    name: "Domain Age Checker",
    tagline: "Find out how old any domain is.",
    description:
      "Look up the registration date of any domain and see how long it's been live.",
    categoryId: "seo",
    icon: Globe,
    status: "coming-soon",
    keywords: ["domain age", "domain history", "registration"],
  },
  {
    slug: "email-header-analyzer",
    name: "Email Header Analyzer",
    tagline: "Parse and inspect raw email headers.",
    description:
      "Paste raw email headers to inspect SPF, DKIM, DMARC results, delivery path and timing.",
    categoryId: "seo",
    icon: MailSearch,
    status: "coming-soon",
    keywords: ["email header", "email analyzer", "deliverability"],
  },
  {
    slug: "spf-record-checker",
    name: "SPF Record Checker",
    tagline: "Validate a domain's SPF record.",
    description:
      "Look up and validate any domain's SPF record — check authorized senders and lookups.",
    categoryId: "seo",
    icon: MailCheck,
    status: "coming-soon",
    keywords: ["spf", "spf check", "email"],
  },
  {
    slug: "dkim-record-checker",
    name: "DKIM Record Checker",
    tagline: "Look up and verify DKIM records.",
    description:
      "Fetch and validate the DKIM record for any domain and selector — verify your email authentication setup.",
    categoryId: "seo",
    icon: MailCheck,
    status: "coming-soon",
    keywords: ["dkim", "email auth", "deliverability"],
  },
  {
    slug: "dmarc-record-checker",
    name: "DMARC Record Checker",
    tagline: "Inspect a domain's DMARC policy.",
    description:
      "Check the DMARC policy of any domain — see policy, alignment and reporting addresses.",
    categoryId: "seo",
    icon: MailCheck,
    status: "coming-soon",
    keywords: ["dmarc", "email auth", "deliverability"],
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    tagline: "See keyword frequency on any page or text.",
    description:
      "Analyze keyword frequency and density on any URL or text. Spot over-optimization and ranking opportunities.",
    categoryId: "seo",
    icon: Hash,
    status: "coming-soon",
    keywords: ["keyword density", "seo analysis", "keyword frequency"],
  },
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    tagline: "Generate trending hashtags from any keyword.",
    description:
      "Find trending and relevant hashtags for Instagram, X, TikTok and LinkedIn from any seed keyword.",
    categoryId: "seo",
    icon: Hash,
    status: "coming-soon",
    keywords: ["hashtag generator", "trending hashtags", "instagram"],
  },
  {
    slug: "website-screenshot-generator",
    name: "Website Screenshot Generator",
    tagline: "Capture a full-page screenshot of any URL.",
    description:
      "Generate full-page or above-the-fold screenshots of any public URL — desktop and mobile viewports.",
    categoryId: "seo",
    icon: Camera,
    status: "coming-soon",
    keywords: ["screenshot", "site screenshot", "page capture"],
  },

  // ─── IMAGE (batch 2) ─────────────────────────────────────────────────────
  {
    slug: "gradient-mesh-generator",
    name: "Gradient Mesh Generator",
    tagline: "Create modern mesh gradients with multiple colors.",
    description:
      "Build complex mesh gradients with multiple color stops. Export as SVG, PNG or CSS background-image.",
    categoryId: "image",
    icon: Spline,
    status: "coming-soon",
    keywords: ["mesh gradient", "background", "design"],
  },
  {
    slug: "svg-shape-generator",
    name: "SVG Shape Generator",
    tagline: "Generate clean SVG shapes for design and code.",
    description:
      "Generate SVG circles, polygons, stars and custom shapes — copy SVG markup or export PNG.",
    categoryId: "image",
    icon: Box,
    status: "coming-soon",
    keywords: ["svg shape", "svg generator", "vector"],
  },
  {
    slug: "css-animation-generator",
    name: "CSS Animation Generator",
    tagline: "Build CSS animations with a live editor.",
    description:
      "Design CSS keyframe animations visually. Preview, tweak and export ready-to-use CSS in seconds.",
    categoryId: "image",
    icon: Sparkle,
    status: "coming-soon",
    keywords: ["css animation", "keyframes", "css generator"],
  },
  {
    slug: "box-shadow-generator",
    name: "Box Shadow Generator",
    tagline: "Build CSS box-shadows visually.",
    description:
      "Tune blur, spread, offset and color to design CSS box shadows with a live preview. Layered shadows supported.",
    categoryId: "image",
    icon: Layers,
    status: "coming-soon",
    keywords: ["box shadow", "css shadow", "depth"],
  },
  {
    slug: "glassmorphism-generator",
    name: "Glassmorphism Generator",
    tagline: "Design glassmorphic UI elements with CSS.",
    description:
      "Tune blur, opacity, border and saturation to build glassmorphism cards. Copy production-ready CSS.",
    categoryId: "image",
    icon: Layers2,
    status: "coming-soon",
    keywords: ["glassmorphism", "glass effect", "css generator"],
  },
  {
    slug: "neumorphism-generator",
    name: "Neumorphism Generator",
    tagline: "Generate soft, neumorphic CSS styles.",
    description:
      "Design neumorphic buttons and cards with adjustable depth, distance and intensity. Export CSS instantly.",
    categoryId: "image",
    icon: Layers3,
    status: "coming-soon",
    keywords: ["neumorphism", "soft ui", "css generator"],
  },
  {
    slug: "css-clip-path-generator",
    name: "CSS Clip-Path Generator",
    tagline: "Visually craft CSS clip-path shapes.",
    description:
      "Design polygon and circle clip-paths visually. Drag points to reshape and copy CSS — great for hero shapes.",
    categoryId: "image",
    icon: Scissors,
    status: "coming-soon",
    keywords: ["clip path", "css clip", "polygon"],
  },
  {
    slug: "svg-blob-generator",
    name: "SVG Blob Generator",
    tagline: "Generate organic SVG blob shapes.",
    description:
      "Create unique, randomized organic SVG blob shapes for hero sections, illustrations and backgrounds.",
    categoryId: "image",
    icon: Spline,
    status: "coming-soon",
    keywords: ["svg blob", "shape generator", "design"],
  },
  {
    slug: "pattern-background-generator",
    name: "Pattern Background Generator",
    tagline: "Generate seamless patterns for backgrounds.",
    description:
      "Create seamless tileable backgrounds — dots, stripes, geometric — with adjustable color and density.",
    categoryId: "image",
    icon: Grid3x3,
    status: "coming-soon",
    keywords: ["pattern", "background", "seamless"],
  },
  {
    slug: "noise-texture-generator",
    name: "Noise Texture Generator",
    tagline: "Add subtle noise textures to designs.",
    description:
      "Generate subtle, tweakable noise textures — perfect for adding warmth and depth to modern designs.",
    categoryId: "image",
    icon: Boxes,
    status: "coming-soon",
    keywords: ["noise texture", "grain", "design"],
  },
  {
    slug: "pixel-art-generator",
    name: "Pixel Art Generator",
    tagline: "Draw pixel art in a clean grid editor.",
    description:
      "Create pixel art in your browser — pick a palette, draw, export as PNG or SVG.",
    categoryId: "image",
    icon: Frame,
    status: "coming-soon",
    keywords: ["pixel art", "pixel editor", "8 bit"],
  },
  {
    slug: "lorem-ipsum-image-generator",
    name: "Lorem Ipsum Image Generator",
    tagline: "Generate placeholder images at any size.",
    description:
      "Create placeholder images at any size with custom text, colors and aspect ratios — perfect for mockups.",
    categoryId: "image",
    icon: ImageIcon,
    status: "coming-soon",
    keywords: ["placeholder image", "dummy image", "mockup"],
  },
  {
    slug: "thumbnail-downloader",
    name: "Thumbnail Downloader",
    tagline: "Download high-quality thumbnails from YouTube videos.",
    description:
      "Paste any YouTube URL to instantly download its thumbnail in every available resolution.",
    categoryId: "image",
    icon: Tv2,
    status: "coming-soon",
    keywords: ["thumbnail downloader", "youtube thumbnail", "yt"],
  },

  // ─── PDF (batch 2) ───────────────────────────────────────────────────────
  {
    slug: "receipt-generator",
    name: "Receipt Generator",
    tagline: "Generate clean receipts as printable PDF.",
    description:
      "Build a printable receipt with items, taxes, totals and your branding. Download as PDF or print directly.",
    categoryId: "pdf",
    icon: Receipt,
    status: "coming-soon",
    keywords: ["receipt", "pdf receipt", "expense"],
  },
  {
    slug: "packing-slip-generator",
    name: "Packing Slip Generator",
    tagline: "Create packing slips for orders and shipments.",
    description:
      "Build clean packing slips with order items, addresses and SKUs. Export as PDF ready to print.",
    categoryId: "pdf",
    icon: Package,
    status: "coming-soon",
    keywords: ["packing slip", "shipping", "order"],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
  return tools.filter((t) => t.categoryId === categoryId);
}

export function getLiveTools(): Tool[] {
  return tools.filter((t) => t.status === "live");
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((t) => t.featured);
}

export function getRelatedTools(slug: string, limit = 4): Tool[] {
  const current = getToolBySlug(slug);
  if (!current) return [];

  const explicit = current.seo?.relatedSlugs ?? [];
  if (explicit.length) {
    const pinned = explicit
      .map((s) => getToolBySlug(s))
      .filter((t): t is Tool => Boolean(t) && t!.slug !== slug);
    if (pinned.length >= limit) return pinned.slice(0, limit);
    const fillers = tools
      .filter(
        (t) =>
          t.categoryId === current.categoryId &&
          t.slug !== slug &&
          !pinned.some((p) => p.slug === t.slug),
      )
      .slice(0, limit - pinned.length);
    return [...pinned, ...fillers];
  }

  return tools
    .filter((t) => t.categoryId === current.categoryId && t.slug !== slug)
    .slice(0, limit);
}

export function countToolsInCategory(categoryId: string): {
  total: number;
  live: number;
} {
  const all = getToolsByCategory(categoryId);
  return {
    total: all.length,
    live: all.filter((t) => t.status === "live").length,
  };
}
