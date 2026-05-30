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
        "WiFi QR Code Generator — Create WiFi QR Codes Online Free",
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
    tagline: "EAN, UPC, Code 128, Code 39, ITF and 9 more — SVG and 2× PNG.",
    description:
      "Generate scannable 1D barcodes in 14 popular formats — EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF-14, ITF, MSI, Pharmacode, Codabar — with live preview, custom colors and sizing, plus SVG and 2× PNG export. Free, private, browser-only.",
    categoryId: "generators",
    icon: Barcode,
    status: "live",
    featured: true,
    keywords: [
      "barcode generator",
      "barcode generator online",
      "ean 13 generator",
      "ean 8 generator",
      "upc a generator",
      "upc e generator",
      "code 128 generator",
      "code 39 generator",
      "itf 14 generator",
      "pharmacode generator",
      "msi plessey generator",
      "codabar generator",
      "barcode svg",
      "barcode png download",
    ],
    seo: {
      title: "Barcode Generator — EAN, UPC, Code 128, ITF (Free, SVG + PNG)",
      description:
        "Make scannable 1D barcodes in 14 popular formats with Toollyz Barcode Generator — EAN-13, EAN-8, UPC-A/E, Code 128, Code 39, ITF-14, Pharmacode, Codabar and more. Live preview, custom colours and SVG / 2× PNG export, all in your browser.",
      what:
        "A barcode generator turns a text or numeric value into a scannable 1D barcode using a published encoding (Code 128, EAN-13, Code 39 and so on). Toollyz Barcode Generator runs the encoding inside your browser using the open-source JsBarcode library, which supports 14 production-grade formats: Code 128 (auto / A / B / C variants), Code 39, EAN-13, EAN-8, UPC-A, UPC-E, ITF-14 and ITF (Interleaved 2 of 5), MSI Plessey, Pharmacode and Codabar. Live preview updates as you tweak the value, format, foreground / background colour, bar width, height, margin, font size, custom caption and flat-bottom toggle. Export the result as a crisp SVG (vector, scales to any size) or a 2× PNG (rasterised at double resolution for clean prints). A built-in per-format hint (\"EAN-13 needs 12 or 13 digits\", \"ITF needs an even number of digits\") helps you avoid invalid input before JsBarcode rejects it. Toollyz has no backend — settings save to localStorage so refreshes don't lose your work.",
      how: [
        "Pick a format from the grouped Retail / Logistics / Industrial / Pharma / Generic list — the sample value pre-fills.",
        "Type or paste the value you want to encode. Format-specific hints tell you the expected length and character set.",
        "Adjust colours, bar width, height, margin and text size — the preview updates live.",
        "Click SVG (copy/download) for vector output or PNG 2× for a high-resolution raster.",
      ],
      benefits: [
        "14 supported 1D barcode formats — every common retail, logistics, industrial and pharma standard.",
        "Live SVG preview with custom foreground, background, bar width, height, margin and font size.",
        "Optional custom caption that overrides the default \"show encoded value\" text.",
        "Format-specific lint that catches obvious input mistakes before JsBarcode rejects them.",
        "SVG export (copy markup or download .svg) — vector, infinitely scalable.",
        "PNG 2× export (rasterised at double resolution) for crisp printable barcodes.",
        "Flat-bottom toggle to drop the EAN/UPC guard bars when you don't need them.",
        "100% private — Toollyz has no backend, settings saved to localStorage.",
      ],
      relatedSlugs: [
        "qr-code-generator",
        "wifi-qr-code-generator",
        "qr-code-scanner",
        "uuid-generator",
      ],
      faqs: [
        {
          q: "Which library does this use?",
          a: "The open-source JsBarcode library (production-grade encoders for 14 popular 1D barcode formats). The barcode is drawn into an inline SVG, which you can copy as markup or download as a file. The PNG export rasterises the SVG via a canvas at 2× for crisp prints.",
        },
        {
          q: "Which format should I pick?",
          a: "Use EAN-13 or UPC-A for retail products with a GS1 prefix. Code 128 is the safest general-purpose pick for serial numbers, tracking codes and labels. Code 39 is common in automotive and defence. ITF-14 is the case-level shipping barcode. Pharmacode is for pharma packaging. The format picker is grouped by industry to make this easier.",
        },
        {
          q: "Why won't my value scan?",
          a: "Most scan failures are either an invalid value for the chosen format (wrong length, wrong characters), too-narrow bars relative to the scanner's optics, or insufficient quiet-zone margin. Toollyz lints common mistakes before rendering; bump the bar width or margin if scans still fail.",
        },
        {
          q: "Can I make a QR code or Data Matrix?",
          a: "Not from this tool — QR, Data Matrix, PDF417 and Aztec are 2D codes and need different encoders. Use Toollyz QR Code Generator for QR codes. Data Matrix and Aztec may land in future updates.",
        },
        {
          q: "What does the flat-bottom toggle do?",
          a: "EAN and UPC barcodes traditionally have longer guard bars on each side and at the centre. Flat bottom removes those guards, giving a uniform-height barcode — useful when the barcode is a small detail in a larger design and you don't need the visual marker.",
        },
        {
          q: "Can I add a custom caption?",
          a: "Yes — use the Custom caption field to override the auto-generated text below the bars. Leave it blank to show the encoded value (or hide the caption entirely with the Show text checkbox).",
        },
        {
          q: "Are EAN and UPC check digits added automatically?",
          a: "Yes. EAN-13 (12 digits in), EAN-8 (7 digits in), UPC-A (11 digits in) and ITF-14 (13 digits in) all have a check digit appended by JsBarcode. If you paste the full code including a check digit, it's validated rather than recomputed.",
        },
        {
          q: "Does the PNG export include the caption?",
          a: "Yes — the PNG rasterises the entire SVG including the caption, foreground, background and margin. The SVG export is also self-contained.",
        },
        {
          q: "Are my barcodes uploaded?",
          a: "No. Toollyz has no backend — JsBarcode runs in your browser and the SVG / PNG is created locally. Settings save to localStorage; the barcode itself is never persisted anywhere.",
        },
        {
          q: "Is this Barcode Generator free?",
          a: "Completely free with no signup and no limits. Generate as many barcodes as you like — privately in your browser.",
        },
      ],
    },
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
      title: "UUID Generator — Generate UUID v1, v4, v6 & v7 Online Free",
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
        "Lorem Ipsum Generator — Generate Placeholder Text Online Free",
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
        "markdown-editor-previewer",
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
        "Fake Address Generator — Generate Random Addresses Online",
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
      title: "Fake Name Generator — Generate Random Names & Identities",
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
      title: "Username Generator — Generate Cool & Unique Usernames",
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
      title: "Password Generator — Create Strong Secure Passwords",
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
      title: "OTP Generator — Generate Secure One-Time Passwords",
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
      title: "Audio Volume Booster — Increase Audio Volume Online Free",
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
        "White Noise Generator — Relaxing Ambient Sounds Online Free",
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
        "Random Color Generator — Generate Beautiful Color Palettes",
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
      title: "Coin Flip Simulator — Flip a Virtual Coin Online Free",
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
        "spin-wheel-generator",
        "decision-maker-wheel",
        "lucky-draw-generator",
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
    tagline:
      "Create custom printable bingo cards with 9 themes, a live caller and bulk export.",
    description:
      "Generate beautiful printable bingo cards for classrooms, parties and events. Pick a grid size (3×3 to 6×6), fill with numbers, emoji, words or your own list, choose from nine themes, then print, save as PDF or download as PNG. Includes a built-in caller mode.",
    categoryId: "generators",
    icon: Grid3x3,
    status: "live",
    featured: true,
    keywords: [
      "bingo card generator",
      "printable bingo cards",
      "custom bingo cards",
      "classroom bingo",
      "party bingo",
      "bingo maker",
      "emoji bingo",
      "bingo caller",
      "bingo template",
    ],
    seo: {
      title: "Bingo Card Generator — Create Printable Bingo Cards",
      description:
        "Generate printable bingo cards instantly. Create custom bingo for classrooms, parties and events with 9 themes, grid sizes 3×3–6×6, a live caller mode and PDF/PNG export — free.",
      what:
        "A Bingo Card Generator turns a list of items — numbers, words, emoji or your own custom entries — into randomized, printable bingo cards. Toollyz Bingo Card Generator creates classroom games, party activities, team-building icebreakers and trivia rounds, with nine visual themes, grid sizes from 3×3 to 6×6, a free-space toggle, bulk generation up to 100 cards, and a built-in caller for hosting live games.",
      how: [
        "Choose your content — classic numbers, emoji, animals, party words, classroom vocab, or paste your own list (or upload a .txt/.csv).",
        "Pick a grid size (3×3, 4×4, 5×5 or 6×6), a theme, a card title, and whether to include a free center space.",
        "Set how many unique cards to generate (1–100) and click Generate — each card is randomized independently.",
        "Print to PDF (2 cards per page), download a card as PNG, or open Caller mode to host a live game.",
      ],
      benefits: [
        "Nine printable themes — minimal, classroom, neon, birthday, Christmas, Halloween, corporate, kids, retro.",
        "Grid sizes from 3×3 to 6×6 with optional customizable free center space.",
        "Six content sources plus custom paste and .txt/.csv upload.",
        "Bulk-generate up to 100 independently randomized cards from one pool.",
        "Print-ready PDF layout (2 cards per page) with exact color reproduction.",
        "High-resolution PNG export drawn on canvas at 2× retina scale.",
        "Built-in caller mode with shuffle, call history, auto-call and spoken/beep announcements.",
        "Settings saved locally — your theme, grid and content persist between visits.",
      ],
      relatedSlugs: [
        "coin-flip-simulator",
        "spin-wheel-generator",
        "lucky-draw-generator",
        "random-color-generator",
      ],
      faqs: [
        {
          q: "What is a bingo card generator?",
          a: "It's a tool that creates randomized bingo cards from a set of items — numbers, words or emoji. Instead of drawing grids by hand, you pick content and a theme and instantly get printable, unique cards for your game.",
        },
        {
          q: "Can I create custom bingo cards?",
          a: "Yes — select 'Custom list', paste your own entries (one per line or comma-separated), or upload a .txt/.csv file. Great for vocabulary words, team names, inside jokes, product features or any theme you like.",
        },
        {
          q: "Can I print bingo cards?",
          a: "Yes — click Print / PDF to open a print-ready layout with two cards per page and exact theme colors. From the print dialog you can print directly or save as a PDF.",
        },
        {
          q: "How many unique cards can I generate?",
          a: "Up to 100 at once. Each card is randomized independently from your content pool, so they differ. (With a small pool and many cards, some overlap is mathematically unavoidable — add more entries for greater variety.)",
        },
        {
          q: "Can I upload my own words?",
          a: "Yes — paste a list into the custom field or drop a .txt or .csv file onto it. Entries can be separated by new lines or commas, and duplicates are removed automatically.",
        },
        {
          q: "Does this tool work for classrooms?",
          a: "Absolutely — it's built for it. Use the Classroom vocab preset or your own spelling/math/topic words, pick the friendly Classroom or Kids theme, and print a class set in seconds. Caller mode lets you host the round.",
        },
        {
          q: "Can I export bingo cards as PDF?",
          a: "Yes — the Print / PDF button generates a clean printable sheet. Choose 'Save as PDF' as the destination in your browser's print dialog to get a PDF file. You can also export a single card as a PNG image.",
        },
        {
          q: "Is there a free space option?",
          a: "Yes — toggle the free center space on or off and customize its text (default 'FREE'). It applies to odd-sized grids (3×3, 5×5) which have a true center cell.",
        },
        {
          q: "Can I use this on mobile?",
          a: "Yes — the generator, live preview and caller are fully responsive. Generate and preview on your phone, then print from any connected printer or save the PDF.",
        },
        {
          q: "Is this bingo card generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Generation, theming, caller mode and exports all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "spin-wheel-generator",
    name: "Spin Wheel Generator",
    tagline:
      "Build a customizable spinning wheel with 10 themes, elimination mode and a winner reveal.",
    description:
      "Create colorful spinning wheels for giveaways, classrooms, raffles, team selection and random decisions. Add your own entries, pick from ten themes, spin with physics-inspired motion, and reveal winners with confetti. Elimination mode, sound effects and PNG/JSON export included.",
    categoryId: "generators",
    icon: CircleDot,
    status: "live",
    featured: true,
    keywords: [
      "spin wheel generator",
      "spin the wheel",
      "wheel of names",
      "random picker wheel",
      "prize wheel",
      "giveaway wheel",
      "decision wheel",
      "team picker",
      "raffle wheel",
      "classroom spinner",
    ],
    seo: {
      title: "Spin Wheel Generator — Create Random Spinning Wheels",
      description:
        "Create customizable spinning wheels instantly. Perfect for giveaways, classrooms, raffles, team selection and random choices — 10 themes, elimination mode, confetti winner reveal, free.",
      what:
        "A Spin Wheel Generator turns a list of options into an interactive spinning wheel — give it a spin and it randomly lands on one. Toollyz Spin Wheel Generator is built for giveaways, classroom activities, raffles, team selection, prize draws and everyday decisions. Add your own entries, choose from ten vibrant themes, and enjoy physics-inspired spin motion, a celebratory winner reveal with confetti, optional elimination mode and PNG/JSON export — all running in your browser.",
      how: [
        "Add entries one at a time, paste a list, or import a .txt/.csv file. Shuffle or de-duplicate with one click.",
        "Pick a theme and spin duration, then spin by clicking the wheel, the center hub, or the Spin button.",
        "The wheel decelerates with realistic easing and reveals the winner in a celebratory modal with confetti.",
        "Turn on elimination mode to remove each winner automatically — perfect for tournaments and progressive draws.",
      ],
      benefits: [
        "Ten vibrant wheel themes — neon, casino, classroom, corporate, minimal, birthday, gaming, retro, luxury gold, dark mode.",
        "Crisp SVG wheel that scales to any screen with auto-contrast segment labels.",
        "Cryptographically fair winner selection (window.crypto) — the visual always matches the true result.",
        "Physics-inspired spin with decelerating tick sounds and a confetti winner reveal.",
        "Elimination mode removes winners automatically for tournaments and raffles.",
        "Entry management: add, paste, import .txt/.csv, shuffle, de-duplicate, inline edit.",
        "Adjustable spin duration (quick / normal / dramatic) and a reduced-motion mode.",
        "Export the wheel as PNG or your full setup as JSON. Winner history kept locally.",
      ],
      relatedSlugs: [
        "coin-flip-simulator",
        "bingo-card-generator",
        "lucky-draw-generator",
        "decision-maker-wheel",
      ],
      faqs: [
        {
          q: "What is a spin wheel generator?",
          a: "It's an interactive tool that turns a list of options into a spinning wheel. You give it a spin and it randomly lands on one entry — great for giveaways, picking teams, choosing what to eat, classroom games or any random decision.",
        },
        {
          q: "Is the wheel spin random?",
          a: "Yes — the winner is chosen using your browser's cryptographic random generator (window.crypto.getRandomValues) before the animation starts, then the wheel is rotated precisely so it lands on that result. Every entry has an equal chance.",
        },
        {
          q: "Can I customize the wheel colors?",
          a: "Yes — choose from ten built-in themes (neon, casino, classroom, corporate, minimal, birthday, gaming, retro, luxury gold, dark mode). Each theme has its own coordinated segment palette, pointer and center hub.",
        },
        {
          q: "Can I save multiple wheels?",
          a: "Your current entries, theme and settings are saved automatically in your browser, so the wheel is exactly as you left it next time. You can also export any setup as JSON to keep or share, and re-import the entries later.",
        },
        {
          q: "Can I remove winners automatically?",
          a: "Yes — enable Elimination mode. After each spin the winner is removed from the wheel, which is ideal for tournaments, progressive raffles or 'last one standing' games.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the wheel, entry manager and winner modal are fully responsive and touch-friendly. Tap the wheel or the Spin button to spin. It works in every modern mobile browser.",
        },
        {
          q: "Can I export my wheel?",
          a: "Yes — download the wheel as a PNG image, or export your full setup (entries, theme and winner history) as a JSON file. You can also import entries from .txt or .csv files.",
        },
        {
          q: "How many entries can I add?",
          a: "As many as you like. The wheel automatically resizes label text as you add more entries. For readability, 2–24 entries display best, but there's no hard limit.",
        },
        {
          q: "Are the results fair?",
          a: "Completely. There's no weighting toward any segment and no hidden bias — each entry has exactly the same probability of being selected on every spin, backed by a cryptographic random source.",
        },
        {
          q: "Is this spin wheel generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Spinning, theming, elimination mode and exports all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "decision-maker-wheel",
    name: "Decision Maker Wheel",
    tagline:
      "Can't decide? Spin the wheel — with 10 ready-made templates and a winner reveal.",
    description:
      "Make decisions the fun way. Load a ready-made template (lunch, movie, workout, travel and more) or add your own options, spin a physics-inspired wheel, and reveal the winner with confetti. Includes elimination mode, themes, sound and PNG/JSON export.",
    categoryId: "generators",
    icon: HelpCircle,
    status: "live",
    featured: true,
    keywords: [
      "decision maker wheel",
      "decision wheel",
      "what should i eat",
      "random decision",
      "choose for me",
      "yes or no wheel",
      "picker wheel",
      "spin to decide",
      "random choice generator",
    ],
    seo: {
      title: "Decision Maker Wheel — Spin the Wheel Online",
      description:
        "Make random decisions instantly. Spin a customizable wheel for food choices, movies, teams, workouts and more — 10 ready templates, elimination mode, confetti reveal. Free, no signup.",
      what:
        "A Decision Maker Wheel takes the agonizing out of small choices. Type your options (or load a ready-made template like 'What should I eat?'), give the wheel a spin, and let chance decide — complete with a satisfying physics-inspired spin and a celebratory winner reveal. Toollyz Decision Maker Wheel includes ten instant templates, ten themes, elimination mode for tournaments, sound effects and PNG/JSON export, all running locally in your browser.",
      how: [
        "Tap a quick-decision template (Lunch, Movie night, Workout, Travel…) to instantly load options and a matching theme.",
        "Or add your own options — type and press Enter, paste a list, then shuffle or de-duplicate.",
        "Spin by clicking the wheel, the center button, or pressing the spacebar.",
        "The winner is revealed in a celebratory modal — copy it, spin again, or enable elimination mode to remove it and keep going.",
      ],
      benefits: [
        "Ten ready-made templates — lunch, movie night, yes/no, truth or dare, workout, study, team picker, date ideas, travel, weekend plans.",
        "Cryptographically fair selection — the wheel always lands on the genuinely-chosen option.",
        "Ten coordinated themes, physics-inspired spin, decelerating tick sounds and a confetti winner reveal.",
        "Elimination mode for tournaments and progressive 'last one standing' rounds.",
        "Full option management — add, paste, shuffle, de-duplicate, inline edit.",
        "Spacebar to spin, reduced-motion support and touch-friendly controls.",
        "Export the wheel as PNG or your setup as JSON; recent decisions saved locally.",
        "100% in your browser — nothing uploaded, no signup, no limits.",
      ],
      relatedSlugs: [
        "spin-wheel-generator",
        "coin-flip-simulator",
        "bingo-card-generator",
        "lucky-draw-generator",
      ],
      faqs: [
        {
          q: "What is a decision maker wheel?",
          a: "It's an interactive spinning wheel that picks a random option for you. Add your choices — restaurants, movies, tasks, names — spin, and the wheel lands on one. It turns indecision into a fun, gamified moment.",
        },
        {
          q: "Is the wheel spin random?",
          a: "Yes — the winning option is selected with your browser's cryptographic random generator before the spin, then the wheel rotates exactly so it lands on that option. Every choice has an equal chance.",
        },
        {
          q: "Can I customize the wheel colors?",
          a: "Yes — pick from ten themes (minimal, neon, luxury gold, gaming, classroom, casino, corporate, birthday, retro, dark mode), each with its own coordinated palette. Quick-decision templates also auto-select a fitting theme.",
        },
        {
          q: "Can I remove options after spinning?",
          a: "Yes — turn on Elimination mode and each winning option is removed after it's chosen. It's ideal for tournaments, raffles and narrowing a list down to a final answer.",
        },
        {
          q: "Can I save my wheels?",
          a: "Your options, theme and recent decisions are saved automatically in your browser. You can also export the full setup as a JSON file to keep or re-import later.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the wheel, templates and winner modal are fully responsive and touch-friendly. Tap the wheel or the spin button to decide. Works in every modern mobile browser.",
        },
        {
          q: "Can I share wheel results?",
          a: "Yes — copy the winner to your clipboard from the result modal, or export the wheel as a PNG image to share the setup with friends or a class.",
        },
        {
          q: "How many options can I add?",
          a: "As many as you like. Label text resizes automatically as you add more. For easy reading, 2–24 options look best on the wheel, but there's no hard cap.",
        },
        {
          q: "Is the wheel fair?",
          a: "Completely — there's no weighting or bias toward any option. Each choice has an identical probability on every spin, backed by a cryptographic random source.",
        },
        {
          q: "Is this decision maker wheel free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Spinning, templates, themes, elimination mode and exports all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "lucky-draw-generator",
    name: "Lucky Draw Generator",
    tagline:
      "Run fair lucky draws with a slot-machine reveal, multi-winner podium and templates.",
    description:
      "Pick random winners for giveaways, raffles, classrooms and contests. Add participants or load a template, choose how many winners, then watch the animated name reel land on the winners with confetti. Multi-winner podium, elimination mode and CSV/winner-card export included.",
    categoryId: "generators",
    icon: Ticket,
    status: "live",
    featured: true,
    keywords: [
      "lucky draw generator",
      "random winner picker",
      "giveaway picker",
      "raffle generator",
      "random name picker",
      "contest winner",
      "classroom picker",
      "instagram giveaway picker",
      "youtube giveaway",
    ],
    seo: {
      title: "Lucky Draw Generator — Random Winner Picker Online",
      description:
        "Run fair random lucky draws instantly. Pick giveaway, raffle, classroom and contest winners with an animated reel reveal, multi-winner podium, templates and export — free, no signup.",
      what:
        "A Lucky Draw Generator randomly selects one or more winners from a list of participants. It's the fair, transparent way to run giveaways, raffles, classroom picks, team selections and contest draws. Toollyz Lucky Draw Generator features an exciting slot-machine name reel that flickers through participants before landing on the winners, a multi-winner podium with medal tiers, six ready-made templates, elimination mode, sound effects, and CSV / winner-card export — all powered by your browser's cryptographic random generator.",
      how: [
        "Load a template (classroom, giveaway, raffle, team, tournament, party) or add your own participants — type, paste, or import a .txt/.csv.",
        "Choose how many winners to draw (1, 3, 5, 10 or custom) and set a draw title and prize label.",
        "Click Start lucky draw — the name reel flickers and decelerates to a dramatic winner reveal with confetti.",
        "Winners appear on a medal podium. Copy them, download a winner card image or CSV, and optionally remove winners for the next round.",
      ],
      benefits: [
        "Cryptographically fair selection — every participant has an equal chance, backed by window.crypto.",
        "Exciting slot-machine reel reveal with decelerating flicker, drumroll ticks and a confetti finale.",
        "Pick 1, 3, 5, 10 or a custom number of winners, shown on a medal podium (🥇 🥈 🥉).",
        "Six ready templates — classroom, giveaway, team, raffle, tournament and party.",
        "Participant management: add, paste, import .txt/.csv, shuffle, de-duplicate.",
        "Elimination mode removes winners so you can run multiple rounds from one list.",
        "Export winners as CSV or a branded winner-card image; recent draws saved locally.",
        "Sound effects, spacebar to draw, reduced-motion support and full mobile optimization.",
      ],
      relatedSlugs: [
        "spin-wheel-generator",
        "decision-maker-wheel",
        "coin-flip-simulator",
        "bingo-card-generator",
      ],
      faqs: [
        {
          q: "What is a lucky draw generator?",
          a: "It's a tool that randomly picks winners from a list of participants. You add names (or import them), choose how many winners you need, and the tool fairly selects them — perfect for giveaways, raffles, classroom picks and contests.",
        },
        {
          q: "Is the winner selection random?",
          a: "Yes — winners are chosen using your browser's cryptographic random generator (window.crypto.getRandomValues), which is unbiased and unpredictable. The animated reel is purely for excitement; the result is decided fairly the moment you start the draw.",
        },
        {
          q: "Can I pick multiple winners?",
          a: "Yes — draw 1, 3, 5, 10 or a custom number of winners at once. They're revealed on a medal podium with 1st, 2nd and 3rd place badges, and you can export them all together.",
        },
        {
          q: "Can I upload participant lists?",
          a: "Yes — paste a multiline list directly, or import a .txt or .csv file. Entries can be separated by new lines or commas. You can also start from one of the six built-in templates.",
        },
        {
          q: "Does the tool remove duplicate entries?",
          a: "Yes — click Dedupe to remove duplicate participants in one click, with a count of how many were removed. This keeps your draw fair so no one gets multiple entries by accident.",
        },
        {
          q: "Can I save previous draws?",
          a: "Yes — every draw is saved to your browser's local history with its winners, title and timestamp. You can review past draws and clear the history anytime. Nothing is uploaded to a server.",
        },
        {
          q: "Can I export winner results?",
          a: "Yes — download winners as a CSV file, or generate a branded winner-card image (PNG) to share on social media or post at your event. You can also copy the winners to your clipboard.",
        },
        {
          q: "Is the draw fair?",
          a: "Completely. There's no weighting or bias — each participant has exactly the same probability of being drawn, and the selection uses a cryptographically secure random source. Turn on elimination mode to prevent the same person winning twice.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the participant manager, draw stage and winner podium are fully responsive and touch-friendly. Tap Start lucky draw to run it. Works in every modern mobile browser.",
        },
        {
          q: "Is this lucky draw generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Drawing, templates, history and exports all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "random-emoji-generator",
    name: "Random Emoji Generator",
    tagline:
      "Generate random emojis, aesthetic packs and themed combos for bios, chats and socials.",
    description:
      "Generate random emojis by category or curated vibe — soft aesthetic, kawaii, gamer, dark, TikTok and Instagram-bio modes. Search 400+ emojis, build packs, save favorites, preview in chat/bio mockups, and copy or export with one tap.",
    categoryId: "generators",
    icon: Smile,
    status: "live",
    featured: true,
    keywords: [
      "random emoji generator",
      "emoji generator",
      "aesthetic emojis",
      "emoji combinations",
      "emoji pack",
      "kawaii emojis",
      "instagram bio emojis",
      "tiktok emojis",
      "emoji search",
      "cute emoji combos",
    ],
    seo: {
      title:
        "Random Emoji Generator — Generate Fun Emoji Combinations",
      description:
        "Generate random emojis, aesthetic emoji packs, cute combos and social-media emoji sets instantly. Filter by category or vibe, search 400+ emojis, save favorites — free, no signup.",
      what:
        "A Random Emoji Generator produces random emojis or curated emoji combinations for messages, bios, captions, usernames and design inspiration. Toollyz Random Emoji Generator goes beyond a basic picker — generate by Unicode category (smileys, animals, food, symbols, hearts and more) or by curated vibe (soft aesthetic, kawaii, gamer, dark aesthetic, TikTok, Instagram bio), search 400+ named emojis instantly, save favorites locally, and preview your pack inside chat, Instagram-bio, TikTok-caption and Discord mockups.",
      how: [
        "Choose how many emojis to generate (1–50) and pick a category, or switch to a style mode like Soft aesthetic or Gamer pack.",
        "Hit Generate (or press the spacebar) to roll a fresh set. Tap any emoji to copy it instantly.",
        "Search by keyword — type 'fire', 'heart' or 'pizza' to find exactly what you need.",
        "Save favorites, copy the whole pack, download as TXT, or preview it in a chat / bio / caption mockup.",
      ],
      benefits: [
        "400+ named emojis across 9 Unicode categories plus 8 curated vibe modes.",
        "Style modes — soft aesthetic, kawaii, gamer, dark aesthetic, TikTok, Instagram bio, minimal combos and chaos.",
        "Instant keyword search across emoji names — find 'fire', 'cat', 'sparkle' in a tap.",
        "Tap-to-copy anywhere, copy the full pack, or download as TXT.",
        "Social previews show your pack inside chat bubbles, Instagram bios, TikTok captions and Discord names.",
        "Per-emoji name and Unicode codepoint metadata, plus generate-similar from the same category.",
        "Save unlimited favorites locally — copy them all in one click.",
        "Floating emoji animations, spacebar reroll and reduced-motion support.",
      ],
      relatedSlugs: [
        "username-generator",
        "random-color-generator",
        "case-converter",
        "spin-wheel-generator",
      ],
      faqs: [
        {
          q: "What is a random emoji generator?",
          a: "It's a tool that randomly produces emojis or emoji combinations. Instead of scrolling through a giant picker, you generate a fresh set instantly — by category or by curated aesthetic — for chats, bios, captions and design inspiration.",
        },
        {
          q: "Can I generate aesthetic emojis?",
          a: "Yes — switch to the Soft aesthetic, Kawaii or Dark aesthetic style modes for curated, on-trend emoji vibes. There are also TikTok and Instagram-bio modes tuned to how those platforms use emojis.",
        },
        {
          q: "Can I copy emoji packs?",
          a: "Yes — tap any single emoji to copy it, or use Copy pack to copy the whole generated set at once. You can also download the pack as a TXT file or copy all your saved favorites together.",
        },
        {
          q: "How do I use emojis in my bio?",
          a: "Generate a small set (3–5) in Instagram-bio or aesthetic mode, copy the pack, and paste it into your bio. The built-in Instagram-bio preview shows roughly how it'll look before you paste.",
        },
        {
          q: "Can I search emojis by keyword?",
          a: "Yes — type a keyword like 'heart', 'fire', 'cat' or 'pizza' into the search box and matching emojis appear instantly. Tap any result to copy it.",
        },
        {
          q: "Are emojis supported on all devices?",
          a: "Standard Unicode emojis render on virtually all modern phones, computers and browsers, though the exact artwork differs by platform (Apple, Google, Microsoft, etc.). Very new emojis may not appear on older devices.",
        },
        {
          q: "Can I save favorite emojis?",
          a: "Yes — tap the heart on any emoji card to save it. Favorites are stored locally in your browser and shown in a dedicated panel where you can copy them all at once.",
        },
        {
          q: "Can I generate emoji combinations?",
          a: "Yes — set the quantity to 3, 5 or 10 and generate a combination at once, or use a style mode to get a themed combo (e.g. kawaii or gamer). The 'generate similar' button swaps one emoji for another in the same category.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the generator, search and previews are fully responsive and touch-friendly. Tap to copy, swipe through results. It works in every modern mobile browser.",
        },
        {
          q: "Is this emoji generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Generation, search, favorites and exports all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "random-fact-generator",
    name: "Random Fact Generator",
    tagline:
      "Discover surprising facts across 18 categories — with a daily fact, search and favorites.",
    description:
      "Generate interesting, verified facts about science, space, history, psychology, animals and more. Filter by category, search 140+ facts, enjoy a fresh Fact of the Day, save favorites, and explore endlessly in discovery mode.",
    categoryId: "generators",
    icon: Lightbulb,
    status: "live",
    featured: true,
    keywords: [
      "random fact generator",
      "fun facts",
      "interesting facts",
      "did you know",
      "fact of the day",
      "trivia facts",
      "weird facts",
      "mind blowing facts",
      "facts for kids",
      "educational facts",
    ],
    seo: {
      title: "Random Fact Generator — Fun & Interesting Facts Online",
      description:
        "Discover fun, weird, educational and mind-blowing facts instantly. Explore science, space, history, psychology, animals and more — with a daily fact, search and favorites. Free.",
      what:
        "A Random Fact Generator surfaces interesting, bite-sized pieces of knowledge on demand. Toollyz Random Fact Generator pulls from a hand-curated collection of verified facts across 18 categories — science, space, technology, history, psychology, animals, the human body, geography, food, movies, gaming, internet culture, business, nature, weird, funny, mind-blowing and kids. Generate a single fact or a pack, get a fresh Fact of the Day, search by keyword, save your favorites, and explore endlessly in discovery mode.",
      how: [
        "Pick a category (or leave it on All) and choose how many facts to generate — 1, 5 or 10.",
        "Hit Generate (or press the spacebar) to add facts to your discovery feed. Tap Surprise me for a random category.",
        "Search by keyword to jump straight to facts about space, the brain, honey — anything.",
        "Save favorites with the heart, copy or share any fact, and turn on Endless discovery for a continuous stream.",
      ],
      benefits: [
        "140+ hand-curated, verified facts across 18 categories.",
        "A deterministic Fact of the Day that refreshes daily for everyone.",
        "Discovery feed that stacks new facts as you generate — plus an Endless mode.",
        "Keyword search across every fact and a Surprise-me random-category button.",
        "Each fact card shows its category, an estimated reading time, and copy/share/save/similar actions.",
        "Save unlimited favorites locally and export them as a TXT file.",
        "Spacebar shortcut, reduced-motion support and clean, highly readable typography.",
        "100% in your browser — no signup, no tracking of what you read.",
      ],
      relatedSlugs: [
        "random-emoji-generator",
        "spin-wheel-generator",
        "decision-maker-wheel",
        "lucky-draw-generator",
      ],
      faqs: [
        {
          q: "What is a random fact generator?",
          a: "It's a tool that shows you interesting facts at random. Instead of searching for trivia, you click a button and discover something new — across science, history, animals, space and many more topics.",
        },
        {
          q: "Are the facts accurate?",
          a: "Yes — every fact in Toollyz is hand-curated and verified against reliable sources, and we deliberately bust a few popular myths (like 'the Great Wall is visible from space'). We avoid disputed or exaggerated claims.",
        },
        {
          q: "Can I generate facts by category?",
          a: "Yes — choose from 18 categories including science, space, psychology, animals, food, gaming, weird and kids, or leave it on 'All categories' for a mix. The Surprise-me button picks a random category for you.",
        },
        {
          q: "Can I save favorite facts?",
          a: "Yes — tap the heart on any fact to save it. Favorites are stored locally in your browser and shown in a dedicated panel where you can export them all as a text file.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the feed, search and cards are fully responsive and touch-friendly, with large readable text. It works in every modern mobile browser.",
        },
        {
          q: "Can kids use this tool?",
          a: "Absolutely — there's a dedicated 'Kids' category with simple, fun, age-appropriate facts, and all content is family-friendly. It's great for classrooms and curious young learners.",
        },
        {
          q: "Can I share facts on social media?",
          a: "Yes — each fact has a share button (using your device's native share sheet where available) and a copy button, so you can post facts to any platform or message them to friends.",
        },
        {
          q: "How are facts selected?",
          a: "Facts are chosen using your browser's secure random generator, optionally filtered by the category you pick. The Fact of the Day is deterministic — everyone sees the same one on a given day.",
        },
        {
          q: "Are new facts added regularly?",
          a: "The curated collection grows over time as we add and verify new facts across categories. Because everything is client-side, updates appear automatically when you reload.",
        },
        {
          q: "Is this random fact generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Generation, search, favorites and export all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "random-joke-generator",
    name: "Random Joke Generator",
    tagline:
      "Laugh on demand — clean jokes across 15 categories with reactions, a daily joke and favorites.",
    description:
      "Generate funny, family-friendly jokes across 15 categories — dad jokes, programming, puns, knock-knocks, one-liners and more. React with emojis, save favorites, get a fresh Joke of the Day, and share anywhere. 100% clean and free.",
    categoryId: "generators",
    icon: Laugh,
    status: "live",
    featured: true,
    keywords: [
      "random joke generator",
      "funny jokes",
      "dad jokes",
      "programming jokes",
      "one liners",
      "puns",
      "knock knock jokes",
      "joke of the day",
      "clean jokes",
      "jokes for kids",
    ],
    seo: {
      title: "Random Joke Generator — Funny Jokes Online",
      description:
        "Generate funny random jokes instantly. Explore dad jokes, programming jokes, one-liners, puns, knock-knocks and meme humor — all clean and family-friendly. React, save and share. Free.",
      what:
        "A Random Joke Generator delivers a laugh on demand. Toollyz Random Joke Generator pulls from a hand-curated collection of clean, family-friendly jokes across 15 categories — dad jokes, programming, tech, school, animals, knock-knocks, one-liners, puns, gaming, meme humor, office, relationships, food, kids and science. Every joke is safe-for-work by design. React with emojis, save your favorites, enjoy a fresh Joke of the Day, and share to any platform.",
      how: [
        "Pick a category (or leave it on All) and choose how many jokes to generate.",
        "Hit 'Make me laugh' (or press the spacebar) to add jokes to your feed. Tap Surprise me for a random category.",
        "React with 😂 / 😐 / 🤯 / ❤️, copy, share, or save jokes you love.",
        "Search by keyword, turn on Endless feed for a continuous stream, and enjoy a new Joke of the Day daily.",
      ],
      benefits: [
        "120+ hand-curated jokes across 15 categories — all clean and family-friendly.",
        "Setup-and-punchline formatting for dad jokes and knock-knocks, plus snappy one-liners and puns.",
        "Emoji reaction bar (😂 😐 🤯 ❤️) with a fun floating-emoji burst, saved locally.",
        "A deterministic Joke of the Day that refreshes daily for everyone.",
        "Discovery feed with an Endless mode that auto-streams new jokes.",
        "Keyword search, Surprise-me random category, copy, native share and TXT export.",
        "Save unlimited favorites locally and revisit them anytime.",
        "Spacebar shortcut, reduced-motion support and clean readable typography.",
      ],
      relatedSlugs: [
        "random-fact-generator",
        "random-emoji-generator",
        "spin-wheel-generator",
        "coin-flip-simulator",
      ],
      faqs: [
        {
          q: "What is a random joke generator?",
          a: "It's a tool that gives you a funny joke at random. Instead of searching for something to make you laugh, you click a button and instantly get a joke — across dad jokes, puns, programming humor and many more categories.",
        },
        {
          q: "Can I generate programming jokes?",
          a: "Yes — there's a dedicated Programming category full of developer humor (think dark mode, bugs, and SQL joins), plus a Tech category for gadget-related laughs.",
        },
        {
          q: "Are the jokes family-friendly?",
          a: "Yes — every joke in Toollyz is hand-curated to be clean and safe-for-work by design. You can confidently use it in classrooms, with kids, at the office or anywhere.",
        },
        {
          q: "Can I save favorite jokes?",
          a: "Yes — tap the heart on any joke (or react with ❤️) to save it. Favorites are stored locally in your browser and shown in a dedicated panel where you can export them all as a text file.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the feed, reactions, search and cards are fully responsive and touch-friendly with large readable text. It works in every modern mobile browser.",
        },
        {
          q: "Can I share jokes on social media?",
          a: "Yes — each joke has a share button (using your device's native share sheet where available) and a copy button, so you can post jokes anywhere or message them to friends.",
        },
        {
          q: "Are jokes updated regularly?",
          a: "The curated collection grows over time as we add and review new jokes across categories. Because everything runs client-side, new jokes appear automatically when you reload.",
        },
        {
          q: "Can I search jokes by category?",
          a: "Yes — filter by any of the 15 categories, search jokes by keyword, or hit Surprise me to jump to a random category. You can also generate packs of 5 or 10 at once.",
        },
        {
          q: "Is dark humor optional?",
          a: "Toollyz keeps every joke clean and family-friendly by design — we don't include offensive or NSFW content, so it's safe to share with anyone, anywhere.",
        },
        {
          q: "Is this random joke generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark. Generation, reactions, favorites, search and export all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "random-quote-generator",
    name: "Random Quote Generator",
    tagline:
      "Inspiring quotes across 12 categories — filter by author, export aesthetic images, save favorites.",
    description:
      "Generate inspirational, motivational, philosophical and famous quotes from great thinkers. Filter by category or author, get a fresh Quote of the Day, export aesthetic quote images in six themes, save favorites and share anywhere.",
    categoryId: "generators",
    icon: Quote,
    status: "live",
    featured: true,
    keywords: [
      "random quote generator",
      "inspirational quotes",
      "motivational quotes",
      "famous quotes",
      "quote of the day",
      "stoic quotes",
      "quote image maker",
      "quotes for instagram",
      "wisdom quotes",
      "success quotes",
    ],
    seo: {
      title:
        "Random Quote Generator — Inspirational Quotes Online",
      description:
        "Generate inspirational, motivational, philosophical and famous quotes instantly. Filter by author, export aesthetic quote images, save favorites — explore wisdom, success and happiness. Free.",
      what:
        "A Random Quote Generator surfaces meaningful quotes on demand for motivation, reflection and content creation. Toollyz Random Quote Generator draws from a curated collection of quotes by great thinkers — Marcus Aurelius, Steve Jobs, Maya Angelou, Lao Tzu, Einstein and many more — across 12 categories from motivation and stoicism to creativity and mindfulness. Filter by author, get a fresh Quote of the Day, export beautiful shareable quote images in six gradient themes, and save the ones that resonate.",
      how: [
        "Pick a category and optionally a specific author, then choose how many quotes to generate.",
        "Hit Generate (or press the spacebar) to add quotes to your inspiration feed. Tap Inspire me for a random category.",
        "Choose an image theme and download an aesthetic, social-ready quote image for any quote.",
        "Search by keyword or author, save favorites, and share quotes to any platform.",
      ],
      benefits: [
        "Curated quotes from renowned thinkers across 12 categories.",
        "Filter by author — browse only Marcus Aurelius, Steve Jobs, Rumi, Einstein and more.",
        "Export aesthetic 1080×1080 quote images in six gradient themes, perfect for Instagram and Pinterest.",
        "A deterministic Quote of the Day that refreshes daily for everyone, themed to your chosen palette.",
        "Inspiration feed with an Endless mode plus an Inspire-me random-category button.",
        "Keyword and author search, native sharing, copy and TXT export.",
        "Save unlimited favorites locally and revisit them anytime.",
        "Elegant editorial typography, spacebar shortcut and reduced-motion support.",
      ],
      relatedSlugs: [
        "random-fact-generator",
        "random-joke-generator",
        "random-emoji-generator",
        "decision-maker-wheel",
      ],
      faqs: [
        {
          q: "What is a random quote generator?",
          a: "It's a tool that shows you a meaningful quote at random. Instead of searching for inspiration, you click a button and discover wisdom from great thinkers — across motivation, philosophy, success, happiness and more.",
        },
        {
          q: "Can I generate motivational quotes?",
          a: "Yes — choose the Motivation or Success categories for an uplifting boost, or explore Stoicism, Leadership and Self-improvement-style wisdom. The Inspire-me button surfaces a random category each time.",
        },
        {
          q: "Can I search quotes by author?",
          a: "Yes — use the author filter to generate quotes only from a specific person, like Marcus Aurelius, Steve Jobs, Rumi or Einstein. You can also search by author name in the search box.",
        },
        {
          q: "Can I save favorite quotes?",
          a: "Yes — tap the heart on any quote to save it. Favorites are stored locally in your browser and shown in a dedicated panel where you can export them all as a text file.",
        },
        {
          q: "Can I export quote images?",
          a: "Yes — pick one of six gradient themes and download a beautiful 1080×1080 quote image, ready to post on Instagram, Pinterest or anywhere. The image renders entirely in your browser.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes — the feed, search, themes and image export are fully responsive and touch-friendly with elegant, readable typography. It works in every modern mobile browser.",
        },
        {
          q: "Are quotes updated regularly?",
          a: "The curated collection grows over time as we add and verify quotes across categories and authors. Because everything runs client-side, new quotes appear automatically when you reload.",
        },
        {
          q: "Can I use quotes on social media?",
          a: "Absolutely — copy the text, use the native share button, or download a styled quote image. The built-in Instagram and X previews show how your quote will look before you post.",
        },
        {
          q: "Can I customize quote cards?",
          a: "Yes — choose from six gradient image themes (Indigo night, Sunset, Ocean, Forest, Mono dark, Rose gold) that style both the on-page daily card and your exported quote images.",
        },
        {
          q: "Is this random quote generator free?",
          a: "Yes — completely free with no signup, no limits and no watermark on text. Generation, image export, favorites and search all run in your browser.",
        },
      ],
    },
  },
  {
    slug: "calendar-generator",
    name: "Calendar Generator",
    tagline: "Generate printable calendars for any year or month.",
    description:
      "Create clean, printable calendars for any year or month with seven color themes, holidays, custom events and a built-in planner. Export to PDF, PNG or ICS — completely free.",
    categoryId: "generators",
    icon: Calendar,
    status: "live",
    featured: true,
    keywords: [
      "calendar",
      "calendar generator",
      "printable calendar",
      "monthly calendar",
      "yearly calendar",
      "2025 calendar",
      "2026 calendar",
      "calendar maker",
      "custom calendar",
      "calendar with holidays",
      "calendar template",
      "planner",
      "blank calendar",
      "calendar pdf",
    ],
    seo: {
      title:
        "Calendar Generator — Create Printable Calendars Online",
      description:
        "Free online calendar generator. Make printable monthly or yearly calendars for any year with seven themes, holidays, custom events and a planner. Export to PDF, PNG or ICS — no signup.",
      what:
        "A Calendar Generator builds clean, customizable calendars you can view, personalize and print for any month or year. Toollyz Calendar Generator lets you switch between a detailed monthly layout and a full-year overview, choose from seven design themes (from minimal and corporate to pastel, classroom and printable black-and-white), start the week on Sunday or Monday, highlight weekends, and overlay public holidays for the US, UK, India or international dates. Add color-coded custom events with emojis, keep a to-do list and notes alongside your calendar, then export everything as a print-ready PDF, a high-resolution PNG image, or an ICS file you can import into Google Calendar, Apple Calendar or Outlook.",
      how: [
        "Pick Month or Year view, then navigate to the year and month you want with the arrows or the Today button.",
        "Choose a theme, holiday region, week start day and whether to highlight weekends.",
        "Click any day to add color-coded events with emojis, and jot to-dos and notes in the side planner.",
        "Export your calendar as PDF, PNG or ICS — or hit Print for a ready-to-pin paper copy.",
      ],
      benefits: [
        "Monthly and full-year layouts that update instantly as you customize.",
        "Seven polished themes including a true black-and-white printable design that saves ink.",
        "Built-in public holidays for the US, UK, India and international dates, for any year.",
        "Add unlimited color-coded events with emojis, plus a to-do list and notes planner.",
        "Export to print-ready PDF, high-resolution PNG, or ICS for Google, Apple and Outlook calendars.",
        "Choose a Sunday or Monday week start and toggle weekend highlighting.",
        "Works for any year — generate 2025, 2026 or any past or future calendar.",
        "100% private: events, notes and exports stay in your browser and are saved locally.",
      ],
      relatedSlugs: [
        "world-clock",
        "pomodoro-timer",
        "business-days-calculator",
        "age-difference-calculator",
      ],
      faqs: [
        {
          q: "What is a calendar generator?",
          a: "A calendar generator is a free online tool that creates customizable, printable calendars for any month or year. You choose the layout, theme, holidays and events, then download or print the result — no software to install.",
        },
        {
          q: "Can I make a calendar for any year?",
          a: "Yes — use the navigation arrows or the Today button to move to any year, past or future. Holidays are calculated automatically for whatever year you select, so you can build a 2025, 2026 or 2030 calendar in seconds.",
        },
        {
          q: "Can I create both monthly and yearly calendars?",
          a: "Yes. Switch between a detailed Month view, which shows day numbers, holidays and event dots, and a Year view that displays all twelve months at a glance. Click any month in the year view to open it in detail.",
        },
        {
          q: "How do I add my own events?",
          a: "Click any day on the calendar (or pick a date in the sidebar), type a title, choose a color and an emoji, and press Add event. Your events appear as colored dots on the calendar and are listed in the sidebar.",
        },
        {
          q: "Can I export the calendar as a PDF?",
          a: "Yes. Press Save PDF (or Print) and choose 'Save as PDF' in your browser's print dialog. The calendar is rendered at high resolution so it stays crisp on paper or screen.",
        },
        {
          q: "Can I download a PNG image of the calendar?",
          a: "Yes — the PNG button exports the current view as a high-resolution image. In Month view you get a single month; in Year view you get a composite image of all twelve months.",
        },
        {
          q: "Can I import events into Google or Apple Calendar?",
          a: "Yes. The ICS button downloads a standard .ics file containing your custom events. Import it into Google Calendar, Apple Calendar, Outlook or any app that supports the iCalendar format.",
        },
        {
          q: "Does it include public holidays?",
          a: "Yes — choose International, United States, United Kingdom or India, and the matching public holidays are highlighted on the calendar for the selected year. You can also turn holidays off entirely.",
        },
        {
          q: "Can the week start on Monday?",
          a: "Yes. Toggle the week to start on Sunday or Monday, and optionally highlight weekends. The choice applies to every view and is remembered for your next visit.",
        },
        {
          q: "Is my data private?",
          a: "Completely. The Calendar Generator runs entirely in your browser — your events, to-dos and notes are saved only in your device's local storage and never uploaded to any server. The tool is free with no signup.",
        },
      ],
    },
  },
  {
    slug: "horoscope-generator",
    name: "Horoscope Generator",
    tagline: "Daily, weekly and monthly horoscopes by sign.",
    description:
      "Get personalized daily, weekly, monthly and yearly horoscopes for every zodiac sign, plus love compatibility, lucky numbers and shareable astrology cards — all free.",
    categoryId: "generators",
    icon: Stars,
    status: "live",
    featured: true,
    keywords: [
      "horoscope",
      "horoscope generator",
      "daily horoscope",
      "zodiac",
      "astrology",
      "zodiac compatibility",
      "love horoscope",
      "weekly horoscope",
      "monthly horoscope",
      "zodiac signs",
      "star sign",
      "lucky numbers",
      "compatibility checker",
      "astrology reading",
    ],
    seo: {
      title:
        "Horoscope Generator — Daily Zodiac Predictions Online",
      description:
        "Generate personalized daily, weekly, monthly and yearly horoscopes, zodiac compatibility reports, lucky numbers and shareable astrology cards instantly with Toollyz. Free, no signup.",
      what:
        "A Horoscope Generator creates personalized astrology readings for your zodiac sign on demand. Toollyz Horoscope Generator delivers daily, weekly, monthly and yearly predictions across love, career, health, finance and friendship, complete with a mood indicator, energy meters, lucky numbers, lucky colors and the signs most compatible with you today. An interactive zodiac wheel lets you pick your sign (or find it from your birth date), a compatibility checker compares any two signs with an animated match score and relationship insights, and a discovery mode lets you explore all twelve zodiac personalities by element. Every reading is rendered as a beautiful, shareable cosmic card you can download or post — all generated privately in your browser for entertainment and self-reflection.",
      how: [
        "Tap your sign on the animated zodiac wheel, or enter your birth date to find it automatically.",
        "Choose a time frame — daily, weekly, monthly or yearly — and a focus like love, career or health.",
        "Read your personalized prediction with mood, energy meters, lucky numbers and compatible signs.",
        "Check compatibility with another sign, then copy, download or share your astrology card.",
      ],
      benefits: [
        "Daily, weekly, monthly and yearly horoscopes for all twelve zodiac signs.",
        "Focus readings for love, career, health, finance and friendship in one place.",
        "Interactive zodiac wheel plus a birth-date finder to identify your sign.",
        "Compatibility checker with an animated match score and emotional, communication, trust and passion breakdowns.",
        "Lucky numbers, lucky colors, lucky time and the signs most compatible with you today.",
        "Five cosmic card themes and downloadable, social-ready astrology images.",
        "Discovery mode to explore every zodiac personality, strength and element.",
        "Save favorite readings and compatibility reports locally — 100% private, no signup.",
      ],
      relatedSlugs: [
        "zodiac-sign-finder",
        "love-compatibility-calculator",
        "random-quote-generator",
        "age-difference-calculator",
      ],
      faqs: [
        {
          q: "What is a horoscope generator?",
          a: "A horoscope generator is a tool that creates personalized astrology readings for your zodiac sign. Toollyz generates daily, weekly, monthly and yearly predictions across love, career, health and more, along with lucky numbers and compatibility — instantly and for free.",
        },
        {
          q: "How does zodiac compatibility work?",
          a: "Our compatibility checker compares two signs using their elements (Fire, Earth, Air, Water), modalities and positions on the zodiac wheel to produce a match score, plus breakdowns for emotional connection, communication, trust, passion and long-term outlook — with notes on strengths and possible conflicts.",
        },
        {
          q: "Can I generate daily horoscopes?",
          a: "Yes. Pick your sign and choose the Daily time frame to get a fresh reading for today. You can also switch to weekly, monthly or yearly horoscopes at any time.",
        },
        {
          q: "Are horoscope readings personalized?",
          a: "Each reading is tailored to your specific sign, time frame and chosen focus (love, career, health, finance or friendship), and stays consistent for that period — so your daily horoscope is the same each time you check it that day.",
        },
        {
          q: "Can I compare two zodiac signs?",
          a: "Yes — open the Compatibility tab, pick any two signs, and get an animated match score with detailed relationship insights covering emotional, communication, trust, passion and long-term compatibility.",
        },
        {
          q: "Does this work on mobile?",
          a: "Absolutely. The zodiac wheel, readings, compatibility checker and discovery cards are fully responsive and touch-friendly, with reduced-motion support for comfortable viewing on any device.",
        },
        {
          q: "Can I save horoscope readings?",
          a: "Yes. Tap the heart to save any reading or compatibility report. Saved items are stored locally in your browser and shown in a dedicated panel you can revisit anytime.",
        },
        {
          q: "Can I export astrology cards?",
          a: "Yes — download a beautiful 1080×1080 astrology card in one of five cosmic themes, copy your horoscope as text, or export it as a TXT file. The built-in Instagram and Story previews show how it will look before you share.",
        },
        {
          q: "Are all zodiac signs supported?",
          a: "Yes, all twelve signs are included — Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius and Pisces — each with full personality profiles, elements and ruling planets.",
        },
        {
          q: "Is this horoscope generator free?",
          a: "Completely free with no signup and no limits. Everything runs in your browser for entertainment and self-reflection, and your saved readings never leave your device. Horoscopes are for fun and inspiration, not professional advice.",
        },
      ],
    },
  },

  // ─── TEXT ────────────────────────────────────────────────────────────────
  {
    slug: "word-counter",
    name: "Word Counter",
    tagline: "Count words, characters, sentences and paragraphs.",
    description:
      "Analyze text in real time — word count, character count, sentences, reading time, readability scores and keyword density — with a distraction-free editor and PDF reports. Free and private.",
    categoryId: "text",
    icon: AlignLeft,
    status: "live",
    featured: true,
    keywords: [
      "word counter",
      "word count",
      "character counter",
      "character count",
      "count words",
      "reading time calculator",
      "keyword density",
      "readability checker",
      "flesch reading ease",
      "sentence counter",
      "paragraph counter",
      "text analysis",
      "essay word count",
      "writing tool",
    ],
    seo: {
      title: "Word Counter — Count Words, Characters & Reading Time",
      description:
        "Analyze text instantly with Toollyz Word Counter. Count words, characters, sentences, paragraphs, reading time, keyword density and readability scores online — free and private.",
      what:
        "A Word Counter is a writing tool that analyzes your text in real time and reports detailed statistics as you type. Toollyz Word Counter goes far beyond a basic textbox: it counts words, characters (with and without spaces), sentences, paragraphs and lines; estimates reading and speaking time; calculates readability scores like Flesch Reading Ease, Flesch-Kincaid Grade and the Gunning Fog Index; and surfaces keyword density, repeated words, unique-word counts and lexical diversity. A distraction-free editor with focus and fullscreen modes, built-in text-cleaning tools, file import, writing goals, a session timer and one-click PDF reports make it a complete writing-productivity workspace — and because everything runs in your browser, your text is never uploaded.",
      how: [
        "Type or paste your text into the editor — or drag and drop a .txt file to import it.",
        "Watch the live dashboard update word count, characters, reading time, readability and keyword density instantly.",
        "Use the text tools to clean spaces, change case or remove duplicate lines, and set a word goal to track progress.",
        "Copy your text or export a TXT summary or a formatted PDF analysis report.",
      ],
      benefits: [
        "Real-time counts for words, characters, sentences, paragraphs, lines, reading and speaking time.",
        "Readability scores — Flesch Reading Ease, Flesch-Kincaid Grade and Gunning Fog — with an estimated education level.",
        "Keyword density for single words and two-word phrases, with overuse warnings for SEO.",
        "Advanced stats: unique words, lexical diversity, average word and sentence length, and passive-voice estimates.",
        "Distraction-free editor with focus mode, fullscreen, in-text search and repeated-word highlighting.",
        "One-click text cleaning, case conversion, undo and drag-and-drop file import.",
        "Writing goals with a progress ring, a session timer, typing speed and achievement badges.",
        "Export a TXT summary or a polished PDF report — 100% private, with auto-saved drafts in your browser.",
      ],
      relatedSlugs: [
        "character-counter",
        "case-converter",
        "keyword-density-checker",
        "duplicate-word-finder",
      ],
      faqs: [
        {
          q: "What is a word counter?",
          a: "A word counter is an online tool that analyzes your text and reports statistics like the number of words, characters, sentences and paragraphs, plus reading time, readability and keyword density. Toollyz Word Counter updates every metric in real time as you type.",
        },
        {
          q: "How does word count work?",
          a: "Words are counted by splitting your text on spaces and line breaks, so each run of non-space characters counts as one word. The tool recalculates instantly with every keystroke, so the count is always accurate and up to date.",
        },
        {
          q: "Can I count characters without spaces?",
          a: "Yes. The tool shows both the total character count and the character count excluding spaces — useful for social media limits, meta descriptions and assignments with strict character rules.",
        },
        {
          q: "Does this tool calculate reading time?",
          a: "Yes. Reading time is estimated at about 200 words per minute and speaking time at about 130 words per minute, so you can quickly gauge how long an article, script or speech will take.",
        },
        {
          q: "Can I analyze keyword density?",
          a: "Yes. The keyword density panel lists your most-used words and two-word phrases with their frequency and percentage, and warns you when any keyword exceeds about 6% so you can avoid keyword stuffing.",
        },
        {
          q: "Does it measure readability?",
          a: "Yes. It calculates the Flesch Reading Ease score, the Flesch-Kincaid Grade level and the Gunning Fog Index, then translates them into a clear label and estimated education level so you know how easy your writing is to read.",
        },
        {
          q: "Does this work on mobile?",
          a: "Absolutely. The editor and analytics dashboard are fully responsive and touch-friendly, with a focus mode for distraction-free writing on phones and tablets.",
        },
        {
          q: "Can I upload text files?",
          a: "Yes. You can drag and drop or browse for plain-text files such as .txt and .md, and the content loads straight into the editor for analysis. For Word documents, copy and paste the text in.",
        },
        {
          q: "Is my text stored online?",
          a: "No. All analysis happens entirely in your browser — your text is never uploaded to any server. Drafts and your word goal are saved only in your device's local storage.",
        },
        {
          q: "Can I export analysis reports?",
          a: "Yes. You can copy your text, download a TXT analysis summary, or generate a polished PDF report containing your full statistics, readability scores and top keywords.",
        },
        {
          q: "Is this word counter free?",
          a: "Completely free with no signup and no limits. Every feature — real-time counts, readability, keyword density, exports and drafts — is available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    tagline: "Live character count with limits for tweets and bios.",
    description:
      "Count characters, spaces, words and lines in real time with platform limit trackers for Twitter/X, Instagram, SEO titles and SMS, plus live social previews and PDF reports. Free and private.",
    categoryId: "text",
    icon: Pilcrow,
    status: "live",
    featured: true,
    keywords: [
      "character counter",
      "character count",
      "count characters",
      "letter counter",
      "characters with spaces",
      "characters without spaces",
      "twitter character counter",
      "meta description length",
      "seo title length",
      "sms character count",
      "byte counter",
      "text length",
      "caption length",
      "social media character limit",
    ],
    seo: {
      title: "Character Counter — Count Characters, Spaces & Text Length",
      description:
        "Count characters, spaces, words, lines and bytes instantly with Toollyz Character Counter. Track social media and SEO limits, preview posts, and optimize content — free and private.",
      what:
        "A Character Counter is a real-time tool that measures the length of your text down to each character. Toollyz Character Counter shows characters with and without spaces, words, sentences, lines, byte size and a full character breakdown (letters, digits, punctuation, symbols, emoji and uppercase/lowercase ratio) as you type. It tracks platform-specific limits for Twitter/X, Instagram, TikTok, Facebook, LinkedIn, YouTube, Google title tags, meta descriptions and SMS, with progress bars and over-limit warnings, and renders live previews of how your text will appear as a tweet, Instagram caption, Google search result, LinkedIn post or SMS. With built-in text-cleaning tools, file import, character targets, a session timer and one-click TXT and PDF reports, it's a complete content-optimization workspace — and everything runs privately in your browser.",
      how: [
        "Type or paste your text into the editor, or drag and drop a .txt file to import it.",
        "Watch the live counters update characters, spaces, words, bytes and a full character breakdown instantly.",
        "Open the Limits tab to track Twitter, SEO and SMS limits, and the Preview tab to see live social and search snippets.",
        "Set a character target, clean up your text, then copy it or export a TXT summary or PDF report.",
      ],
      benefits: [
        "Real-time character count with and without spaces, plus words, sentences, lines and byte size.",
        "Detailed breakdown: letters, digits, punctuation, symbols, emoji and uppercase/lowercase ratio.",
        "Platform limit trackers for Twitter/X, Instagram, TikTok, Facebook, LinkedIn, YouTube, Google and SMS.",
        "Live previews for tweets, Instagram captions, Google search snippets, LinkedIn posts and SMS messages.",
        "SEO helpers for title-tag and meta-description length with ideal-range guidance.",
        "Text-cleaning tools, case conversion, in-text search highlighting and drag-and-drop file import.",
        "Character targets with a progress ring, session timer, typing speed and achievement badges.",
        "Export a TXT summary or polished PDF report — 100% private, with auto-saved drafts in your browser.",
      ],
      relatedSlugs: [
        "word-counter",
        "tweet-character-counter",
        "case-converter",
        "keyword-density-checker",
      ],
      faqs: [
        {
          q: "What is a character counter?",
          a: "A character counter is an online tool that counts the number of characters in your text in real time, along with spaces, words, lines and more. Toollyz Character Counter also tracks social media and SEO limits and previews how your text will look on each platform.",
        },
        {
          q: "Does this count spaces?",
          a: "Yes. The tool shows the total character count including spaces, and separately reports a dedicated space count, so you always know exactly how whitespace affects your length.",
        },
        {
          q: "Can I count characters without spaces?",
          a: "Yes. Alongside the total, the counter shows characters excluding spaces — useful for limits and assignments that don't count whitespace.",
        },
        {
          q: "Does it work for social media captions?",
          a: "Absolutely. The Limits tab tracks Twitter/X, Instagram, TikTok, Facebook, LinkedIn and YouTube limits with progress bars and warnings, and the Preview tab shows live tweet, caption, LinkedIn and SMS previews.",
        },
        {
          q: "Can I optimize SEO titles and meta descriptions?",
          a: "Yes. The tool flags the ideal length for Google title tags (about 50–60 characters) and meta descriptions (about 120–160 characters), and a live Google search-snippet preview shows how your title and description will appear in results.",
        },
        {
          q: "Does it count bytes and emoji?",
          a: "Yes. It reports the UTF-8 byte size of your text and counts emoji separately, which is helpful for databases, APIs and platforms that measure length in bytes.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes. The editor, analytics tabs, limit trackers and previews are fully responsive and touch-friendly, with a focus mode for distraction-free writing on any device.",
        },
        {
          q: "Can I upload text files?",
          a: "Yes. Drag and drop or browse for plain-text files such as .txt and .md and the content loads straight into the editor. For Word documents, copy and paste the text in.",
        },
        {
          q: "Is my text stored online?",
          a: "No. All analysis happens entirely in your browser — your text is never uploaded to any server. Drafts and your target are saved only in your device's local storage.",
        },
        {
          q: "Can I export analysis reports?",
          a: "Yes. Copy your text, download a TXT analysis summary, or generate a polished PDF report with your full character breakdown and platform-limit status.",
        },
        {
          q: "Is this character counter free?",
          a: "Completely free with no signup and no limits. Every feature — real-time counts, platform trackers, previews, exports and drafts — is available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    tagline: "Switch text between camelCase, snake_case, kebab-case and more.",
    description:
      "Instantly convert text into UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case and 15+ styles, with live preview, developer formats and text utilities. Free and private.",
    categoryId: "text",
    icon: CaseSensitive,
    status: "live",
    featured: true,
    keywords: [
      "case converter",
      "text case converter",
      "uppercase to lowercase",
      "title case converter",
      "sentence case",
      "camelcase converter",
      "snake_case converter",
      "kebab-case",
      "pascalcase",
      "constant case",
      "alternating case",
      "change text case",
      "capitalize text",
      "convert text case online",
    ],
    seo: {
      title: "Case Converter — Convert Text Cases Instantly Online",
      description:
        "Convert text instantly with Toollyz Case Converter. Transform text into UPPERCASE, lowercase, camelCase, snake_case, PascalCase, title case, kebab-case and more with real-time preview.",
      what:
        "A Case Converter is a tool that instantly transforms your text into different letter cases and formatting styles. Toollyz Case Converter supports 15+ styles — UPPERCASE, lowercase, Title Case, Sentence case, Capitalized Case, aLtErNaTiNg and InVeRsE for writing, plus developer formats like camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case and Header-Case. It shows the original and converted text side by side with a live preview, applies developer formats per line so you can batch-convert lists, and includes handy utilities like reverse text, sort lines, strip symbols and normalize spacing. Live statistics, favorites, history and one-click copy or download make it a complete text-formatting workspace — and everything runs privately in your browser.",
      how: [
        "Type or paste your text into the editor, or drag and drop a .txt file.",
        "Pick a case style from the conversion panel — the converted result updates instantly beside your text.",
        "Copy the result, download it as TXT, or apply it back to your source. Star your favorite styles for quick access.",
        "Use the utilities to reverse, sort, strip symbols or normalize spacing before converting.",
      ],
      benefits: [
        "15+ case styles for writing and code, applied in real time.",
        "Side-by-side original and converted preview with smooth transitions.",
        "Developer formats (camelCase, snake_case, kebab-case and more) applied per line for bulk lists.",
        "A developer-formats comparison card showing every naming convention at once.",
        "Text utilities: reverse, sort A→Z, strip special characters, normalize spacing and clean whitespace.",
        "Live character, word, line and reading-time stats, plus SEO title and meta length awareness.",
        "Favorite presets, recent-text history, in-text search highlighting, focus and fullscreen modes.",
        "One-click copy, TXT download and share — 100% private, with auto-save in your browser.",
      ],
      relatedSlugs: [
        "word-counter",
        "character-counter",
        "text-reverser",
        "duplicate-word-finder",
      ],
      faqs: [
        {
          q: "What is a case converter?",
          a: "A case converter is an online tool that transforms your text into different letter cases and formatting styles, such as UPPERCASE, lowercase, Title Case, camelCase and snake_case. Toollyz Case Converter updates the result instantly as you type.",
        },
        {
          q: "Can I convert text to uppercase and lowercase?",
          a: "Yes. Click UPPERCASE to capitalize every letter or lowercase to make everything small. The original and converted versions are shown side by side so you can compare instantly.",
        },
        {
          q: "What is camelCase?",
          a: "camelCase joins words with no spaces and capitalizes the first letter of each word except the first — for example, 'helloWorld'. It's widely used for variable and function names in JavaScript and many other languages.",
        },
        {
          q: "What is the difference between camelCase and PascalCase?",
          a: "Both remove spaces and capitalize word boundaries, but camelCase keeps the first letter lowercase ('helloWorld') while PascalCase capitalizes it too ('HelloWorld'). PascalCase is common for class and component names.",
        },
        {
          q: "What is snake_case used for?",
          a: "snake_case joins lowercase words with underscores ('hello_world'). It's popular for variable names, database fields and file names in languages like Python and Ruby. kebab-case is the hyphenated version ('hello-world'), often used for URLs and CSS classes.",
        },
        {
          q: "Can I convert large text blocks?",
          a: "Yes. Paste long articles, lists or paragraphs and convert them in one click. Developer formats are applied per line, so a list of items each becomes its own camelCase, snake_case or kebab-case value.",
        },
        {
          q: "Does this work on mobile?",
          a: "Absolutely. The editor, conversion panel and preview are fully responsive and touch-friendly, with a focus mode for distraction-free editing on any device.",
        },
        {
          q: "Is my text stored online?",
          a: "No. All conversions happen entirely in your browser — your text is never uploaded to any server. Your recent text and favorite styles are saved only in your device's local storage.",
        },
        {
          q: "Can I copy converted text instantly?",
          a: "Yes. Use the Copy button to copy the converted result in one click, download it as a TXT file, or apply it back to your source text. You can also star your most-used styles for quick access.",
        },
        {
          q: "Does it support developer formatting?",
          a: "Yes. Alongside writing cases it supports camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case and Header-Case, with a comparison card that shows your text in every naming convention at once.",
        },
        {
          q: "Is this case converter free?",
          a: "Completely free with no signup and no limits. Every style and utility is available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "slugify",
    name: "Slugify",
    tagline: "Convert any string into a URL-friendly slug.",
    description:
      "Turn titles into clean, SEO-friendly URL slugs in real time — with Unicode transliteration, custom separators, bulk generation, an SEO score and developer formats. Free and private.",
    categoryId: "text",
    icon: TextCursorInput,
    status: "live",
    featured: true,
    keywords: [
      "slugify",
      "slug generator",
      "url slug",
      "seo friendly url",
      "permalink generator",
      "url generator",
      "wordpress slug",
      "kebab case url",
      "text to slug",
      "blog url generator",
      "clean url",
      "transliterate to slug",
      "bulk slug generator",
      "filename slug",
    ],
    seo: {
      title: "Slugify Tool — Generate SEO-Friendly URL Slugs Online",
      description:
        "Convert text into SEO-friendly URL slugs instantly with Toollyz Slugify. Generate clean blog URLs, WordPress slugs, route names and developer-safe identifiers — with bulk mode and Unicode support.",
      what:
        "Slugify turns any title or phrase into a clean, SEO-friendly URL slug in real time. Toollyz Slugify lowercases text, replaces spaces with your chosen separator, strips symbols and emojis, and transliterates accented and non-Latin characters (Latin diacritics, Cyrillic and Greek) into URL-safe ASCII — or preserves Unicode letters when you prefer. It supports multiple formats (standard URL slug, snake_case, dot.case, path/case, camelCase and PascalCase), bulk conversion of multiple lines with duplicate detection and CSV/TXT export, a live URL preview, an SEO readability score with actionable tips, and ready-made developer outputs for WordPress, Next.js routes, API endpoints, database fields and filenames. Everything runs privately in your browser.",
      how: [
        "Type a title — or paste multiple lines to bulk-generate slugs — into the editor.",
        "Pick a separator, case and format preset, and toggle cleanup options like removing stop words or numbers.",
        "Preview the live URL, check the SEO score and tips, and copy the slug or full URL in one click.",
        "Export bulk slugs as TXT or CSV, or grab a ready-made WordPress, Next.js or database identifier.",
      ],
      benefits: [
        "Real-time, SEO-friendly slug generation as you type.",
        "Unicode transliteration for accented Latin, Cyrillic and Greek — or keep Unicode letters intact.",
        "Multiple formats: URL slug, snake_case, dot.case, path/case, camelCase and PascalCase.",
        "Custom separator (hyphen, underscore, dot, slash), case and max-length control.",
        "Bulk mode: convert many lines at once with duplicate detection, auto-numbering and CSV/TXT export.",
        "SEO score with practical tips on length, stop words, hyphens vs underscores and casing.",
        "Developer & CMS outputs for WordPress, Next.js routes, API endpoints, DB fields and filenames.",
        "Cleanup toggles for stop words, numbers and emojis — 100% private, with history and auto-save.",
      ],
      relatedSlugs: [
        "case-converter",
        "meta-tag-generator",
        "word-counter",
        "character-counter",
      ],
      faqs: [
        {
          q: "What is a slug?",
          a: "A slug is the part of a URL that identifies a specific page in a readable way — for example, the “my-first-post” in example.com/blog/my-first-post. A good slug is short, lowercase, hyphen-separated and describes the page content.",
        },
        {
          q: "Why are URL slugs important for SEO?",
          a: "Clean, keyword-rich slugs help search engines and users understand what a page is about, can improve click-through rates, and create tidy, shareable links. Short lowercase slugs with hyphens are the search-engine-friendly standard.",
        },
        {
          q: "Can I generate slugs for multiple lines?",
          a: "Yes. Paste multiple lines and Slugify switches to bulk mode, generating a slug for each line with duplicate detection and optional auto-numbering. You can copy them all or export as TXT or CSV.",
        },
        {
          q: "Does this support Unicode and accented characters?",
          a: "Yes. In transliterate mode it converts accented Latin characters, Cyrillic and Greek into URL-safe ASCII. In keep-Unicode mode it preserves non-Latin letters (useful for languages like Hindi, Arabic, Chinese or Japanese) while still cleaning spaces and symbols.",
        },
        {
          q: "Can I customize the separator?",
          a: "Yes. Choose a hyphen (-), underscore (_), dot (.) or slash (/) as the word separator, and set the case to lowercase, UPPERCASE or Title Case. Format presets configure these for you instantly.",
        },
        {
          q: "What is the difference between hyphens and underscores in URLs?",
          a: "Search engines treat hyphens as word separators but underscores as word joiners, so 'my-blog-post' is read as three words while 'my_blog_post' may be read as one. Hyphens are recommended for SEO-friendly URLs.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes. The editor, settings, live preview and bulk table are fully responsive and touch-friendly, with a focus mode for distraction-free use on any device.",
        },
        {
          q: "Can I export slug lists?",
          a: "Yes. In bulk mode you can copy all slugs at once, download them as a TXT file, or export an original-to-slug mapping as a CSV ready for spreadsheets or a CMS import.",
        },
        {
          q: "Can I generate WordPress-friendly slugs?",
          a: "Yes. The developer panel shows a ready-made WordPress permalink slug, plus Next.js route paths, API endpoints, snake_case database fields and SEO-friendly filenames generated from your text.",
        },
        {
          q: "Is my text stored online?",
          a: "No. All slug generation happens entirely in your browser — your text is never uploaded. Your recent titles and settings are saved only in your device's local storage.",
        },
        {
          q: "Is this Slugify tool free?",
          a: "Completely free with no signup and no limits. Real-time generation, bulk mode, Unicode support, SEO scoring and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "online-notepad",
    name: "Online Notepad",
    tagline: "A distraction-free, auto-saving online notepad.",
    description:
      "A distraction-free online notepad with auto-save, multiple notes, Markdown formatting and live preview, word goals, a focus timer and TXT/MD/HTML/PDF/DOC export. Free, private and offline-ready.",
    categoryId: "text",
    icon: NotebookPen,
    status: "live",
    featured: true,
    keywords: [
      "online notepad",
      "notepad online",
      "free notepad",
      "browser notepad",
      "online text editor",
      "notes online",
      "markdown editor",
      "distraction free writing",
      "auto save notes",
      "scratch pad",
      "online notes app",
      "write online",
      "note taking",
      "offline notepad",
    ],
    seo: {
      title: "Online Notepad — Free Browser-Based Text Editor",
      description:
        "Write, edit, save and organize notes instantly with Toollyz Online Notepad. Distraction-free writing with auto-save, Markdown support, live preview, exports and productivity tools — free and private.",
      what:
        "An Online Notepad is a browser-based writing space where you can jot down notes, draft documents and organize ideas without installing anything. Toollyz Online Notepad is a premium, distraction-free workspace that auto-saves every keystroke to your browser, so your notes are always there when you return — even offline. Manage multiple notes in a searchable sidebar with pinning and duplication, write in plain text or Markdown with a floating formatting toolbar and a live split-screen preview, and track your progress with live word and character counts, a word goal, a focus timer and writing streak badges. Find & replace, undo/redo, font and layout customization, focus and fullscreen modes, and one-click export to TXT, Markdown, HTML, PDF or DOC make it a complete lightweight editor. Everything stays private in your browser — no account, no upload.",
      how: [
        "Start typing in the editor — your note auto-saves to your browser instantly.",
        "Create and organize multiple notes in the sidebar; pin, duplicate, search or delete them.",
        "Turn on Markdown to format with the toolbar and see a live preview in split-screen.",
        "Set a word goal, run the focus timer, then export your note as TXT, Markdown, HTML, PDF or DOC.",
      ],
      benefits: [
        "Auto-saves everything locally — pick up exactly where you left off, even offline.",
        "Multiple notes with a searchable sidebar, pinning, duplication and quick switching.",
        "Markdown formatting with a floating toolbar and live split-screen preview.",
        "Live word, character, sentence, paragraph and reading-time analytics.",
        "Word goals, a focus timer, typing speed and writing achievement badges.",
        "Find & replace, undo/redo, and font, size, line-height and width customization.",
        "Focus and fullscreen distraction-free writing modes with light and dark themes.",
        "Export to TXT, Markdown, HTML, PDF and DOC — 100% private, no signup.",
      ],
      relatedSlugs: [
        "markdown-editor-previewer",
        "word-counter",
        "character-counter",
        "text-diff-checker",
      ],
      faqs: [
        {
          q: "What is an online notepad?",
          a: "An online notepad is a web-based text editor you can use straight from your browser to write and save notes without installing software. Toollyz Online Notepad adds auto-save, multiple notes, Markdown formatting, analytics and exports on top of a clean, distraction-free writing experience.",
        },
        {
          q: "Does the notepad auto-save?",
          a: "Yes. Every change is saved automatically to your browser's local storage within moments, and a save indicator confirms it. When you come back later, your notes are exactly as you left them.",
        },
        {
          q: "Can I use this offline?",
          a: "Yes. Because everything is stored locally in your browser, you can keep writing without an internet connection. Your notes persist between sessions on the same device and browser.",
        },
        {
          q: "Can I export my notes?",
          a: "Yes. Export any note as a plain-text TXT, a Markdown .md file, a styled HTML page, a Word-compatible DOC, or a PDF via the print dialog. You can also copy the text or print it directly.",
        },
        {
          q: "Does this support Markdown?",
          a: "Yes. Toggle Markdown mode to use a formatting toolbar (bold, italic, headings, lists, quotes, code and more) and see a live, GitHub-style preview in split-screen — including syntax-styled code blocks.",
        },
        {
          q: "Can I create multiple notes?",
          a: "Yes. Use the sidebar to create, rename, duplicate, pin, search and delete as many notes as you like. Pinned notes stay at the top, and the most recently edited notes are listed first.",
        },
        {
          q: "Can I upload text files?",
          a: "Yes. Drag and drop or browse for plain-text and Markdown files (.txt, .md and similar) and they'll open as a new note ready to edit. For Word documents, paste the text in.",
        },
        {
          q: "Is my data stored online?",
          a: "No. Your notes never leave your device — they're saved only in your browser's local storage. There's no account and nothing is uploaded to a server, so your writing stays completely private.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor, sidebar, toolbar and preview are fully responsive and touch-friendly, with a focus mode for comfortable, distraction-free writing on phones and tablets.",
        },
        {
          q: "Can I print my notes?",
          a: "Yes. The Print / PDF option opens a clean, formatted version of your note in a new window so you can print it or save it as a PDF from your browser's print dialog.",
        },
        {
          q: "Is this online notepad free?",
          a: "Completely free with no signup and no limits. Auto-save, multiple notes, Markdown, analytics, productivity tools and all export formats are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "markdown-editor-previewer",
    name: "Markdown Editor & Previewer",
    tagline: "Write Markdown with a live, side-by-side preview.",
    description:
      "A premium live Markdown editor with real-time GitHub-Flavored preview, syntax highlighting, tables, task lists, an outline panel, templates and TXT/MD/HTML/PDF/DOC export. Free and private.",
    categoryId: "text",
    icon: FileType,
    status: "live",
    featured: true,
    keywords: [
      "markdown editor",
      "markdown previewer",
      "live markdown editor",
      "online markdown editor",
      "markdown preview",
      "github flavored markdown",
      "gfm editor",
      "markdown to html",
      "md editor online",
      "markdown live preview",
      "readme editor",
      "markdown table generator",
      "markdown syntax highlighting",
      "free markdown editor",
    ],
    seo: {
      title: "Markdown Editor & Previewer — Live Markdown Editor Online",
      description:
        "Write, preview and export Markdown instantly with Toollyz Markdown Editor & Previewer. Real-time GitHub-Flavored rendering, syntax highlighting, templates, an outline, analytics and exports.",
      what:
        "A Markdown Editor & Previewer is a writing tool that renders Markdown into formatted HTML in real time as you type. Toollyz Markdown Editor & Previewer is a premium, distraction-free documentation workspace with a split-screen live preview that supports GitHub-Flavored Markdown — headings, bold, italic, strikethrough, tables, task lists, blockquotes, links, images, emoji shortcodes and syntax-highlighted code blocks. A formatting toolbar and keyboard shortcuts speed up writing, an automatic document outline lets you jump between sections, and a template library gives you ready-made README, blog, documentation, changelog and project-plan scaffolds. Live analytics count words, headings, links, images and more; everything auto-saves to your browser with version snapshots and undo/redo; and you can view the generated HTML or export to Markdown, HTML, PDF, DOC or plain text — all completely private and free.",
      how: [
        "Type Markdown in the editor and watch the formatted preview update instantly in split-screen.",
        "Use the toolbar or keyboard shortcuts for bold, headings, lists, tables, code blocks and links.",
        "Load a template, navigate with the outline panel, and search with find & replace.",
        "View the generated HTML, then export your document as Markdown, HTML, PDF, DOC or TXT.",
      ],
      benefits: [
        "Real-time GitHub-Flavored Markdown preview with tables, task lists and emoji.",
        "Beautiful syntax highlighting for code blocks across many languages.",
        "Edit, Split and Preview modes plus focus and fullscreen distraction-free writing.",
        "Automatic document outline for quick navigation of long documents.",
        "Eight ready-made templates: README, blog, docs, meeting notes, changelog and more.",
        "Live analytics: words, characters, reading time, headings, links, images, code blocks and tables.",
        "Auto-save with version snapshots, undo/redo, find & replace and a Markdown cheat sheet.",
        "View the generated HTML and export to MD, HTML, PDF, DOC or TXT — 100% private, no signup.",
      ],
      relatedSlugs: [
        "online-notepad",
        "markdown-to-html",
        "word-counter",
        "text-diff-checker",
      ],
      faqs: [
        {
          q: "What is a Markdown editor?",
          a: "A Markdown editor lets you write in Markdown — a lightweight, plain-text formatting syntax — and see it rendered as formatted HTML. Toollyz Markdown Editor & Previewer shows a live side-by-side preview so you can see exactly how your document will look as you type.",
        },
        {
          q: "What is Markdown used for?",
          a: "Markdown is widely used for README files, documentation, blog posts, notes, chat messages and anywhere you want clean formatting without writing HTML. It's the standard on GitHub, GitLab, Reddit, Discord and most static-site generators.",
        },
        {
          q: "Does this support GitHub Flavored Markdown?",
          a: "Yes. It supports GitHub-Flavored Markdown (GFM) including tables, task lists (checkboxes), strikethrough, fenced code blocks with syntax highlighting and automatic links, plus emoji shortcodes like :rocket:.",
        },
        {
          q: "Can I export Markdown as PDF?",
          a: "Yes. Use Print / PDF to open a cleanly formatted version of your document and save it as a PDF from your browser's print dialog. You can also export to Markdown, HTML, DOC or plain text.",
        },
        {
          q: "Can I preview Markdown in real time?",
          a: "Yes. The split-screen mode renders your Markdown instantly as you type. You can also switch to editor-only or preview-only, and toggle a raw HTML view to see the generated code.",
        },
        {
          q: "Does it have templates?",
          a: "Yes. The template library includes ready-made README, blog post, documentation, meeting notes, changelog, project plan, technical guide and knowledge-base scaffolds you can load with one click.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes. The editor, preview, toolbar and outline are fully responsive and touch-friendly, with a focus mode for distraction-free writing on phones and tablets.",
        },
        {
          q: "Can I upload Markdown files?",
          a: "Yes. Drag and drop or browse for .md, .markdown and .txt files and they'll open in the editor instantly. You can also import plain-text notes to format as Markdown.",
        },
        {
          q: "Is my content stored online?",
          a: "No. All editing and rendering happen entirely in your browser — your document is never uploaded. Your work and version snapshots are saved only in your device's local storage.",
        },
        {
          q: "Can I export HTML?",
          a: "Yes. Toggle the HTML view to see and copy the generated HTML, or export a complete, self-styled HTML document ready to publish.",
        },
        {
          q: "Is this Markdown editor free?",
          a: "Completely free with no signup and no limits. Live preview, syntax highlighting, templates, analytics, the outline and all export formats are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "ascii-art-generator",
    name: "ASCII Art Generator",
    tagline: "Turn text into stylized ASCII art.",
    description:
      "Convert text and images into ASCII art instantly — with stylized banner fonts, image-to-ASCII conversion, color mode, frames and TXT/PNG/SVG/HTML export. Free and private.",
    categoryId: "text",
    icon: SquareCode,
    status: "live",
    featured: true,
    keywords: [
      "ascii art generator",
      "text to ascii",
      "image to ascii",
      "ascii art",
      "ascii banner",
      "text art generator",
      "ascii font",
      "figlet generator",
      "ascii text",
      "terminal banner",
      "ascii image converter",
      "ascii art maker",
      "ansi art",
      "ascii generator online",
    ],
    seo: {
      title: "ASCII Art Generator — Convert Text & Images to ASCII Online",
      description:
        "Create stunning ASCII art instantly with Toollyz ASCII Art Generator. Convert text and images into creative ASCII designs, terminal banners, color ASCII and downloadable artwork online.",
      what:
        "An ASCII Art Generator turns text and images into pictures made of characters. Toollyz ASCII Art Generator does both: type any word or name and render it as a stylized banner in over a dozen styles — block, shade, outline, banner, shadow, 3D, slant and more — with adjustable height, font family and a custom fill character; or upload an image and convert it to ASCII with control over width, character set (density), brightness, contrast, invert and full-color mode. A frame generator wraps text in decorative borders, a live terminal-style preview offers zoom and fullscreen, and you can copy or export your art as TXT, PNG, SVG or HTML. A built-in style gallery and ready-made art help you start fast — and everything runs privately in your browser, so uploaded images never leave your device.",
      how: [
        "Choose a mode: Text to ASCII, Image to ASCII, or the Frame generator.",
        "For text, type your words and pick a style, height and fill character; for images, upload or drop a file and tune width, character set, brightness and color.",
        "Preview your art live in the terminal window, with zoom and fullscreen.",
        "Copy the result or export it as TXT, PNG, SVG or HTML.",
      ],
      benefits: [
        "Text-to-ASCII with 14 banner styles, adjustable height, font family and custom fill characters.",
        "Image-to-ASCII conversion for PNG, JPG, WEBP and GIF with width and density control.",
        "Brightness, contrast, invert and seven character ramps for fine-tuned image art.",
        "Full-color ASCII mode that samples your image's real colors.",
        "Decorative frame generator with single, double, rounded, bold and ASCII borders.",
        "Live terminal-style preview with zoom, fullscreen and pick-your-color output.",
        "Export to TXT, PNG, SVG and HTML, plus a style gallery and ready-made art.",
        "Saved history and favorites — 100% private, your images never leave your browser.",
      ],
      relatedSlugs: [
        "qr-code-generator",
        "online-notepad",
        "markdown-editor-previewer",
        "random-emoji-generator",
      ],
      faqs: [
        {
          q: "What is ASCII art?",
          a: "ASCII art is a graphic design technique that uses printable text characters to create pictures and stylized text. It dates back to early computers and typewriters and is still popular for terminal banners, code comments, social media and retro aesthetics.",
        },
        {
          q: "How does ASCII art generation work?",
          a: "For text, Toollyz renders your words to an invisible canvas and samples the shapes into a grid of characters, then styles them as block, outline, shadow or 3D art. For images, it scales the picture down and maps each cell's brightness to a character from light to dark.",
        },
        {
          q: "Can I convert images to ASCII art?",
          a: "Yes. Upload, drag and drop, or paste an image URL, then adjust the width, character set, brightness, contrast and invert to get the look you want. PNG, JPG, WEBP and GIF (first frame) are supported.",
        },
        {
          q: "Can I customize the character set?",
          a: "Yes. Choose from seven built-in ramps — standard, detailed, blocks, shades, minimal, binary and dots — or type your own custom character set ordered from dark to light. For text art you can pick any fill character.",
        },
        {
          q: "Can I export ASCII art as PNG?",
          a: "Yes. Export your art as a PNG image, an SVG vector, an HTML file or plain TXT. You can also copy it to the clipboard with one click to paste anywhere.",
        },
        {
          q: "Does this support colored ASCII?",
          a: "Yes. Turn on color mode when converting an image and the ASCII characters keep the colors sampled from your photo. You can also pick a terminal color (green, cyan, amber, neon or white) for text art.",
        },
        {
          q: "Can I create terminal banners and frames?",
          a: "Yes. The text mode is perfect for terminal and README banners, and the Frame generator wraps any text in decorative borders — single, double, rounded, bold, ASCII, stars or dotted.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes. The generator, controls, live preview and galleries are fully responsive and touch-friendly, with zoom and fullscreen for comfortable viewing on any device.",
        },
        {
          q: "Is my uploaded image stored online?",
          a: "No. All conversion happens entirely in your browser using a canvas — your images are never uploaded to any server. Your saved art and settings stay in your device's local storage.",
        },
        {
          q: "Is this ASCII art generator free?",
          a: "Completely free with no signup and no limits. Text art, image conversion, color mode, frames and all export formats are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "fancy-text-generator",
    name: "Fancy Text Generator",
    tagline: "Turn plain text into fancy Unicode styles.",
    description:
      "Turn plain text into 100+ stylish Unicode fonts — bold, cursive, gothic, bubble, aesthetic and more — plus symbols, decorations, stylish usernames and bios. Free and instant.",
    categoryId: "text",
    icon: Sparkle,
    status: "live",
    featured: true,
    keywords: [
      "fancy text generator",
      "stylish text generator",
      "unicode text",
      "cool fonts copy paste",
      "instagram fonts",
      "discord fonts",
      "cursive text generator",
      "bold text generator",
      "aesthetic text",
      "gaming username generator",
      "nickname generator",
      "stylish name",
      "fancy fonts",
      "text symbols",
    ],
    seo: {
      title: "Fancy Text Generator — Stylish Fonts & Unicode Text Online",
      description:
        "Generate stylish fancy text instantly with Toollyz Fancy Text Generator. Create aesthetic fonts, gaming usernames, Instagram bios, TikTok profiles, Discord nicknames and decorative Unicode text.",
      what:
        "A Fancy Text Generator turns ordinary text into eye-catching Unicode styles you can copy and paste anywhere. Toollyz Fancy Text Generator transforms what you type — in real time — into 100+ variations including bold, italic, script, cursive, gothic Fraktur, double-struck, monospace, small caps, circled, squared, bubble, vaporwave (full-width), upside-down, strikethrough and glitch styles. Because the output is real Unicode (not images or fonts), it works directly in Instagram bios, TikTok and Discord names, gaming profiles, WhatsApp, YouTube and more. Beyond fonts, it includes a decoration system for fancy frames like ꧁ text ꧂, a searchable symbol library, a stylish username and nickname generator, an aesthetic bio builder, live social-profile previews, and one-click copy with saved favorites — all running privately in your browser.",
      how: [
        "Type your text in the input box — every style updates instantly.",
        "Browse the font styles, decorations and symbols; search or filter by category.",
        "Tap copy on any style, or generate a stylish username or aesthetic bio.",
        "Preview your text in Instagram, TikTok and Discord mockups, and save your favorites.",
      ],
      benefits: [
        "100+ Unicode font styles generated live as you type.",
        "Works on Instagram, TikTok, Discord, gaming profiles and most apps — it's real Unicode.",
        "Decoration frames (꧁ ꧂, ★, ♡, 『』) and a searchable symbol library with one-click insert.",
        "Stylish username and nickname generator for gaming and social profiles.",
        "Aesthetic bio builder you can paste straight into your profile.",
        "Live Instagram, TikTok and Discord profile previews.",
        "Search and category filters to find the perfect style fast.",
        "One-click copy, saved favorites and TXT export — 100% free and private.",
      ],
      relatedSlugs: [
        "ascii-art-generator",
        "case-converter",
        "username-generator",
        "random-emoji-generator",
      ],
      faqs: [
        {
          q: "What is a fancy text generator?",
          a: "A fancy text generator converts normal text into stylish, decorative letters using special Unicode characters. You can copy the result and paste it into social media bios, usernames, captions and messages to make your text stand out.",
        },
        {
          q: "How does fancy Unicode text work?",
          a: "Unicode includes thousands of letter-like symbols — such as bold, italic, script and circled characters — that look different but are still text. The generator maps each letter you type to its styled Unicode equivalent, so the output is copy-paste text, not an image.",
        },
        {
          q: "Can I use fancy text on Instagram?",
          a: "Yes. The styles are real Unicode characters, so they work in Instagram bios, captions, comments and usernames (where allowed). Bold, script and aesthetic styles are especially popular for bios.",
        },
        {
          q: "Does this work on TikTok and Discord?",
          a: "Yes. Fancy text works in TikTok profiles and captions and in Discord usernames, nicknames and messages. Use the built-in profile previews to see how it will look before you post.",
        },
        {
          q: "Can I create gaming usernames?",
          a: "Yes. The username generator combines stylish fonts with decorative prefixes, symbols and frames to create unique names for Free Fire, PUBG, Roblox, Twitch, Discord and more — just enter a name and generate.",
        },
        {
          q: "Are all styles Unicode compatible?",
          a: "Most styles work almost everywhere, but some apps and older devices may not render every glyph (combining effects like strikethrough or glitch are the most variable). If a style doesn't show correctly somewhere, try a simpler one like bold or italic.",
        },
        {
          q: "Can I copy fancy text instantly?",
          a: "Yes. Every style has a one-click copy button, and you can copy all styles at once or export them as a TXT file. A confirmation appears each time you copy.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes. The generator, style gallery, symbol library and previews are fully responsive and touch-friendly, so you can create and copy fancy text on any phone or tablet.",
        },
        {
          q: "Can I save favorite styles?",
          a: "Yes. Tap the star on any style or username to save it. Favorites are stored locally in your browser and shown in a dedicated panel for quick reuse.",
        },
        {
          q: "Is this fancy text generator free?",
          a: "Completely free with no signup and no limits. All 100+ styles, decorations, symbols, the username and bio generators and exports are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "invisible-text-generator",
    name: "Invisible Text Generator",
    tagline: "Generate invisible/blank Unicode characters.",
    description:
      "Generate invisible Unicode characters and blank text for usernames, empty messages and social fields, with platform compatibility, a hidden-character analyzer and developer info. Free and instant.",
    categoryId: "text",
    icon: EyeOff,
    status: "live",
    featured: true,
    keywords: [
      "invisible text generator",
      "blank text",
      "invisible character",
      "zero width space",
      "blank username",
      "empty character copy paste",
      "invisible space",
      "hidden text",
      "blank message",
      "invisible name",
      "unicode invisible",
      "whitespace character",
      "blank discord name",
      "invisible character detector",
    ],
    seo: {
      title: "Invisible Text Generator — Copy Blank Unicode Characters Online",
      description:
        "Generate invisible text, blank characters and hidden Unicode spaces instantly with Toollyz Invisible Text Generator. Create blank usernames, empty messages and invisible profile text — free.",
      what:
        "An Invisible Text Generator produces real Unicode characters that take up space (or none) but render as nothing visible, so you can copy and paste 'empty' text anywhere. Toollyz Invisible Text Generator lets you pick from several invisible characters — Zero Width Space, Zero Width Joiner/Non-Joiner, Word Joiner, the Hangul Filler and the Braille blank — choose how many to generate, and copy the result in one click. It includes ready-made presets for blank usernames, empty messages and invisible bios, a platform-compatibility dashboard showing where invisible text works (Instagram, TikTok, Discord, WhatsApp and games like Free Fire and PUBG), a built-in analyzer that detects and reveals hidden characters inside any pasted text, and a developer panel with the exact code point, UTF-8/UTF-16 bytes and JS/HTML/CSS escapes. Everything runs privately in your browser.",
      how: [
        "Pick an invisible character type — Hangul Filler or Braille blank are most reliable for blank usernames.",
        "Choose how many characters to generate, or tap a preset like “Blank username”.",
        "Copy the invisible text in one click and paste it into your profile, name or message.",
        "Use the Analyzer to detect hidden characters in any text, or the Developer tab for Unicode details.",
      ],
      benefits: [
        "Multiple invisible character types with usage and width guidance.",
        "Ready-made presets for blank usernames, empty messages and invisible bios.",
        "Platform compatibility dashboard for social, messaging and gaming apps.",
        "Built-in analyzer that detects, counts and reveals hidden Unicode characters.",
        "A Reveal mode so you can see exactly what your invisible text contains.",
        "Developer panel with code point, UTF-8/UTF-16 hex and JS/HTML/CSS escapes.",
        "One-click copy with feedback, saved history and TXT export of the full set.",
        "100% free, no signup — everything runs privately in your browser.",
      ],
      relatedSlugs: [
        "fancy-text-generator",
        "username-generator",
        "ascii-art-generator",
        "random-emoji-generator",
      ],
      faqs: [
        {
          q: "What is invisible text?",
          a: "Invisible text is made of special Unicode characters that display as nothing — either taking up no width (like the Zero Width Space) or a blank space (like the Hangul Filler). It looks empty but is still real, copy-paste-able text.",
        },
        {
          q: "How does an invisible text generator work?",
          a: "It inserts invisible Unicode code points such as U+200B (Zero Width Space) or U+3164 (Hangul Filler) into a string. You choose the character and how many, then copy the result and paste it wherever you need 'empty' text.",
        },
        {
          q: "Can I create blank usernames?",
          a: "Yes. Use the Blank username preset — the Hangul Filler and Braille blank are the most reliable because they occupy real width and survive platforms that trim pure zero-width characters.",
        },
        {
          q: "Does invisible text work on Instagram?",
          a: "Yes. Blank characters work in Instagram bios, names and captions. Some platforms trim leading or trailing zero-width characters, so the blank-width characters tend to be the most dependable.",
        },
        {
          q: "Can I use invisible text in games?",
          a: "Often, yes. Games like Free Fire, PUBG/BGMI, Discord and Steam commonly accept invisible names, while a few (like Fortnite) restrict them. The compatibility dashboard shows what to expect.",
        },
        {
          q: "What is a Zero Width Space?",
          a: "The Zero Width Space (U+200B) is an invisible character with no width. It's used to allow line breaks or to separate text invisibly, but many platforms strip it — which is why blank-width characters are better for usernames.",
        },
        {
          q: "Can I send blank messages?",
          a: "Yes. Use the Blank message preset to copy an invisible character and send an 'empty' message on apps like WhatsApp, Discord or Telegram that won't accept a truly empty input.",
        },
        {
          q: "Does this work on mobile?",
          a: "Yes. The generator, presets, compatibility dashboard and analyzer are fully responsive and touch-friendly, with one-tap copy on any device.",
        },
        {
          q: "Is invisible text detectable?",
          a: "Yes — by tools like the built-in Analyzer, which reveals every hidden character and its Unicode code. Paste any text to check for invisible characters before using or trusting it.",
        },
        {
          q: "Is this invisible text generator free?",
          a: "Completely free with no signup and no limits. Generation, presets, the analyzer, developer info and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },

  // ─── DEVELOPER ───────────────────────────────────────────────────────────
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Format, validate and minify JSON in one click.",
    description:
      "Format, validate, beautify, minify and analyze JSON in an IDE-style editor with precise error messages, an interactive tree explorer, diff comparison and TXT/JSON/CSV export. Free and private.",
    categoryId: "developer",
    icon: Braces,
    status: "live",
    featured: true,
    keywords: [
      "json formatter",
      "json validator",
      "json beautifier",
      "json minifier",
      "format json",
      "validate json",
      "json viewer",
      "json tree viewer",
      "json pretty print",
      "json diff",
      "json editor online",
      "json parser",
      "json to csv",
      "json lint",
    ],
    seo: {
      title: "JSON Formatter — Format, Validate & Beautify JSON Online",
      description:
        "Format, validate, beautify, minify and analyze JSON instantly with Toollyz JSON Formatter. Explore JSON trees, validate with precise errors, compare JSON files and export formatted data.",
      what:
        "A JSON Formatter is a developer tool that turns messy or minified JSON into clean, readable, validated data. Toollyz JSON Formatter is a full JSON workspace: an IDE-style editor with syntax highlighting and line numbers, real-time validation that pinpoints the exact line, column and reason for every error (with fix hints), one-click beautify and minify with 2-space, 4-space or tab indentation, key sorting, and escape/unescape utilities. An interactive tree explorer lets you expand, collapse, search and copy the path of any node, a statistics dashboard summarizes objects, arrays, keys, depth and size, and a diff view compares two JSON documents and highlights every added, removed and changed value. Import files by drag-and-drop and export to JSON, minified JSON or CSV — all running privately in your browser, so your data is never uploaded.",
      how: [
        "Paste, type or drop a JSON file into the editor — it validates as you type.",
        "Click Format to beautify (or Minify to compress), and choose your indentation.",
        "Explore the structure in the tree view, check the statistics, or search for any key or value.",
        "Compare against a second JSON in the Diff tab, then copy or export to JSON, minified or CSV.",
      ],
      benefits: [
        "Real-time validation with the exact line, column, message and a fix hint for every error.",
        "IDE-style editor with JSON syntax highlighting, line numbers and code-style typography.",
        "One-click beautify and minify with 2-space, 4-space or tab indentation.",
        "Interactive tree explorer: expand/collapse, search keys and values, and copy any JSON path.",
        "Statistics dashboard — objects, arrays, keys, depth, node count, size and a health score.",
        "JSON diff to compare two documents with added, removed and changed highlights.",
        "Sort keys, escape/unescape, undo/redo and saved-session history.",
        "Import by drag-and-drop and export to JSON, minified JSON or CSV — 100% private, no upload.",
      ],
      relatedSlugs: [
        "json-to-csv",
        "base64-encoder-decoder",
        "xml-formatter",
        "yaml-to-json",
      ],
      faqs: [
        {
          q: "What is a JSON formatter?",
          a: "A JSON formatter takes raw JSON and reformats it into a clean, indented, human-readable structure. Toollyz JSON Formatter also validates the data, visualizes it as a tree, reports errors precisely and lets you minify, sort, diff and export it.",
        },
        {
          q: "How does JSON validation work?",
          a: "As you type, the tool parses your JSON with a strict parser. If something is wrong — a missing comma, an unclosed bracket, a trailing comma or invalid quotes — it shows the exact line and column, a clear message and a hint on how to fix it, with a Jump button to take you there.",
        },
        {
          q: "Can I beautify JSON instantly?",
          a: "Yes. Click Format (or press Ctrl/⌘ S) to pretty-print your JSON with your chosen indentation — 2 spaces, 4 spaces or tabs. Formatting happens entirely in your browser, so it's instant even for large documents.",
        },
        {
          q: "Can I minify JSON?",
          a: "Yes. The Minify button strips all whitespace to produce the smallest valid JSON for production or transport. You can also download the minified version directly.",
        },
        {
          q: "Can I upload JSON files?",
          a: "Yes. Drag and drop a .json or .txt file onto the editor, or use the Import button. The contents load straight into the editor for formatting and inspection.",
        },
        {
          q: "Does this support large JSON files?",
          a: "Yes. Parsing, formatting and statistics run efficiently in your browser, and the tree explorer loads nodes on demand so you can navigate large, deeply nested documents smoothly.",
        },
        {
          q: "Can I compare two JSON documents?",
          a: "Yes. Open the Diff tab and paste a second JSON document. The tool highlights every added, removed and changed value with its path, so you can spot API or data differences at a glance.",
        },
        {
          q: "Is my JSON stored online?",
          a: "No. All formatting, validation and analysis happen entirely in your browser — your JSON is never uploaded to any server. Saved sessions are kept only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor, validation, tree explorer, statistics and diff are fully responsive and touch-friendly, so you can format and inspect JSON on any device.",
        },
        {
          q: "Is this JSON formatter free?",
          a: "Completely free with no signup and no limits. Formatting, validation, the tree viewer, diff, statistics and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    tagline: "Format and validate XML documents.",
    description:
      "Format, validate, beautify and minify XML in an IDE-style editor with precise errors, a tree explorer, XPath testing, XML-to-JSON conversion, diff and export. Free and private.",
    categoryId: "developer",
    icon: CodeXml,
    status: "live",
    featured: true,
    keywords: [
      "xml formatter",
      "xml validator",
      "xml beautifier",
      "xml minifier",
      "format xml",
      "validate xml",
      "xml viewer",
      "xml tree viewer",
      "xml pretty print",
      "xpath tester",
      "xml to json",
      "xml diff",
      "xml editor online",
      "xml parser",
    ],
    seo: {
      title: "XML Formatter — Format, Validate & Beautify XML Online",
      description:
        "Format, validate, beautify, minify and analyze XML instantly with Toollyz XML Formatter. Explore XML trees, test XPath, convert XML to JSON, compare documents and export formatted XML.",
      what:
        "An XML Formatter turns messy or minified XML into clean, readable, well-formed markup. Toollyz XML Formatter is a complete XML workspace: an IDE-style editor with syntax highlighting and line numbers, real-time well-formedness validation that pinpoints the exact line, column and reason for every error (with fix hints), and one-click beautify and minify with 2-space, 4-space or tab indentation. An interactive tree explorer lets you expand, collapse, search and copy the path of any element or attribute; an XPath tester runs queries against your document and highlights matching nodes; an XML-to-JSON converter previews the equivalent JSON; a diff view compares two documents line by line; and a statistics dashboard summarizes elements, attributes, namespaces, depth and size. Import files by drag-and-drop and export to XML, minified XML or JSON — all running privately in your browser, so your data is never uploaded.",
      how: [
        "Paste, type or drop an XML file into the editor — it validates as you type.",
        "Click Format to beautify (or Minify to compress), and choose your indentation.",
        "Explore the structure in the tree view, run XPath queries, or convert to JSON.",
        "Compare against a second document in the Diff tab, then copy or export your XML or JSON.",
      ],
      benefits: [
        "Real-time well-formedness validation with the exact line, column, message and a fix hint.",
        "IDE-style editor with XML syntax highlighting, line numbers and code-style typography.",
        "One-click beautify and minify with 2-space, 4-space or tab indentation.",
        "Interactive tree explorer: expand/collapse, search tags, attributes and text, and copy paths.",
        "Built-in XPath tester that runs queries and shows matching nodes.",
        "XML-to-JSON conversion with a copyable, exportable preview.",
        "Statistics dashboard — elements, attributes, namespaces, depth, node count and size.",
        "XML diff, sort attributes, remove empty nodes, escape/unescape and export — 100% private.",
      ],
      relatedSlugs: [
        "json-formatter",
        "yaml-to-json",
        "base64-encoder-decoder",
        "json-to-csv",
      ],
      faqs: [
        {
          q: "What is an XML formatter?",
          a: "An XML formatter takes raw XML and reformats it into clean, indented, readable markup. Toollyz XML Formatter also validates well-formedness, visualizes the structure as a tree, reports errors precisely and lets you minify, run XPath, convert to JSON, diff and export.",
        },
        {
          q: "How does XML validation work?",
          a: "As you type, the tool parses your XML with a strict well-formedness parser. If something is wrong — a missing or mismatched closing tag, an unquoted attribute, improper nesting or multiple root elements — it shows the exact line and column, a clear message and a hint, with a Jump button to take you there.",
        },
        {
          q: "Can I beautify XML instantly?",
          a: "Yes. Click Format (or press Ctrl/⌘ S) to pretty-print your XML with your chosen indentation — 2 spaces, 4 spaces or tabs. Formatting happens entirely in your browser, so it is instant.",
        },
        {
          q: "Can I minify XML?",
          a: "Yes. The Minify button removes insignificant whitespace between tags to produce the most compact valid XML for transport or storage, and you can download the minified version directly.",
        },
        {
          q: "Can I convert XML to JSON?",
          a: "Yes. The JSON tab converts your XML into an equivalent JSON structure — attributes become @-prefixed keys, repeated elements become arrays — which you can copy or export as a .json file.",
        },
        {
          q: "Can I test XPath expressions?",
          a: "Yes. The XPath tab lets you run XPath queries against your document using your browser's native engine and lists every matching element, attribute or value, with handy example queries to get started.",
        },
        {
          q: "Does this support large XML files?",
          a: "Yes. Parsing, formatting and statistics run efficiently in your browser, and the tree explorer loads nodes on demand so you can navigate large, deeply nested documents like SOAP responses, RSS feeds and sitemaps smoothly.",
        },
        {
          q: "Is my XML stored online?",
          a: "No. All formatting, validation, XPath and conversion happen entirely in your browser — your XML is never uploaded to any server. Saved sessions are kept only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor, validation, tree explorer, XPath, JSON view and diff are fully responsive and touch-friendly, so you can format and inspect XML on any device.",
        },
        {
          q: "Is this XML formatter free?",
          a: "Completely free with no signup and no limits. Formatting, validation, the tree viewer, XPath, XML-to-JSON, diff, statistics and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "html-minifier",
    name: "HTML Minifier",
    tagline: "Minify, optimize and validate HTML in one workspace.",
    description:
      "Compress, beautify, validate and analyze HTML in an IDE-style editor with granular minification controls, live before/after comparison, performance analytics, inline CSS/JS minification, bulk processing and export. Free and private.",
    categoryId: "developer",
    icon: Code,
    status: "live",
    featured: true,
    keywords: [
      "html minifier",
      "minify html",
      "html compressor",
      "compress html",
      "html optimizer",
      "optimize html",
      "html beautifier",
      "html formatter",
      "html validator",
      "minify html online",
      "html minify tool",
      "shrink html",
      "reduce html size",
      "inline css minifier",
    ],
    seo: {
      title: "HTML Minifier — Compress & Optimize HTML Code Online",
      description:
        "Minify and optimize HTML instantly with Toollyz HTML Minifier. Reduce file size, improve page speed, validate markup, analyze performance gains, and export optimized HTML code online — 100% in your browser.",
      what:
        "An HTML Minifier removes everything a browser doesn't need — extra whitespace, line breaks, comments and redundant attributes — so your pages download and render faster without changing how they look. Toollyz HTML Minifier is a complete optimization workspace, not just a compressor: an IDE-style editor with syntax highlighting and line numbers, granular minification controls (collapse whitespace, remove comments while preserving conditional comments, drop redundant and empty attributes, collapse boolean attributes, remove optional tags) plus one-click Safe, Maximum and Conservative presets. It minifies inline CSS and JavaScript, beautifies and cleans up messy markup, validates your HTML for unclosed tags, deprecated elements and accessibility gaps, and shows a live before/after comparison with a full analytics dashboard — bytes saved, compression percentage, an optimization score and estimated load-time savings. You can also batch-process multiple files at once and export optimized HTML — all entirely in your browser, so your code is never uploaded.",
      how: [
        "Paste, type or drop an HTML file into the editor — it minifies and validates as you type.",
        "Pick a preset (Safe, Maximum or Conservative) or fine-tune each option in the Settings tab.",
        "Review the live output, before/after comparison and the analytics dashboard for size savings.",
        "Copy the minified HTML or download it — or drop several files into the Bulk tab to optimize them together.",
      ],
      benefits: [
        "Real-time minification with a live before/after comparison and bytes-saved breakdown.",
        "Granular controls plus Safe, Maximum and Conservative presets for one-click optimization.",
        "IDE-style editor with HTML syntax highlighting, line numbers and code-style typography.",
        "Inline CSS and JavaScript minification, attribute cleanup and optional-tag removal.",
        "Validation that flags unclosed tags, deprecated elements, missing alt text and duplicate ids.",
        "Analytics dashboard — size reduction, compression percentage, optimization score and load-time savings.",
        "Bulk processing for multiple files with per-file savings and one-click multi-file export.",
        "100% private — everything runs in your browser, with undo/redo, saved sessions and instant export.",
      ],
      relatedSlugs: [
        "css-minifier",
        "javascript-minifier",
        "json-formatter",
        "xml-formatter",
      ],
      faqs: [
        {
          q: "What is an HTML minifier?",
          a: "An HTML minifier is a tool that strips everything a browser doesn't need to render a page — extra whitespace, line breaks, comments and redundant attributes — to produce a smaller file. Toollyz HTML Minifier goes further with presets, inline CSS/JS minification, validation, a before/after comparison and a full analytics dashboard.",
        },
        {
          q: "How does HTML minification work?",
          a: "The tool parses your markup into tokens, then re-emits it without the bytes that don't affect rendering: it collapses runs of whitespace, removes comments, drops default and empty attributes, collapses boolean attributes and can remove optional tags. You choose exactly how aggressive to be with presets or individual toggles.",
        },
        {
          q: "Will minification break my HTML?",
          a: "The default Safe preset is designed never to change how your page renders — whitespace inside <pre> and <textarea> is preserved and only redundant bytes are removed. The Maximum preset is more aggressive (it removes optional tags and empty attributes), so use the live comparison and validation to confirm the result before shipping.",
        },
        {
          q: "Can I beautify HTML again after minifying?",
          a: "Yes. Click Beautify to pretty-print minified or messy HTML with clean, consistent indentation (2 spaces, 4 spaces or tabs). You can switch between minify and beautify as often as you like, and undo/redo is always available.",
        },
        {
          q: "Does this minify inline CSS?",
          a: "Yes. With “Minify inline CSS” enabled, the tool compresses both your <style> blocks and style=\"…\" attributes — removing comments, collapsing whitespace and trimming redundant semicolons — while leaving string values intact.",
        },
        {
          q: "Does this minify inline JavaScript?",
          a: "Yes. Enable “Minify inline JavaScript” (included in the Maximum preset) to strip comments and indentation from <script> blocks. It uses a safe, string- and regex-aware pass that preserves line breaks so your code keeps working.",
        },
        {
          q: "Can I upload or batch-process HTML files?",
          a: "Yes. Drag a single file onto the editor to load it, or drop several files into the Bulk tab to minify them all at once with your current settings. You'll see per-file savings and can download each optimized file or all of them together.",
        },
        {
          q: "Does it validate my HTML?",
          a: "Yes. The Validate tab reports unclosed and mismatched tags, deprecated elements and attributes, missing image alt text, duplicate ids and a missing doctype or lang attribute — with line numbers and fix hints. Validation is advisory, so minification still works even if warnings appear.",
        },
        {
          q: "Is my HTML code stored online?",
          a: "No. All parsing, minification, validation and analysis happen entirely in your browser — your HTML is never uploaded to any server. Saved sessions are kept only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor, settings, analytics, validation, comparison and bulk tools are fully responsive and touch-friendly, so you can optimize HTML on any device.",
        },
        {
          q: "Is this HTML minifier free?",
          a: "Completely free with no signup and no limits. Minification, beautifying, validation, analytics, comparison, inline CSS/JS minification, bulk processing and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "javascript-minifier",
    name: "JavaScript Minifier",
    tagline: "Minify, beautify and analyze JavaScript safely.",
    description:
      "Compress, beautify, validate and analyze JavaScript in an IDE-style editor with safe minification, optimization presets, bundle analysis, before/after comparison, performance insights, bulk processing and export. Free and private.",
    categoryId: "developer",
    icon: FileCode2,
    status: "live",
    featured: true,
    keywords: [
      "javascript minifier",
      "minify javascript",
      "js minifier",
      "javascript compressor",
      "compress javascript",
      "minify js online",
      "javascript optimizer",
      "javascript beautifier",
      "js beautifier",
      "javascript validator",
      "reduce js size",
      "shrink javascript",
      "minify js file",
      "remove console logs",
    ],
    seo: {
      title: "JavaScript Minifier — Compress & Optimize JS Code Online",
      description:
        "Minify and optimize JavaScript instantly with Toollyz JavaScript Minifier. Reduce file size, improve website performance, validate code, analyze bundle savings, and export optimized JS online — 100% in your browser.",
      what:
        "A JavaScript Minifier removes everything an engine doesn't need to run your code — comments, whitespace, indentation and line breaks — so scripts download and parse faster. Toollyz JavaScript Minifier is a full optimization workspace, not just a compressor: an IDE-style editor with ES6+/ESNext syntax highlighting and line numbers, safe token-based minification, and Safe, Aggressive, Production and Debug-friendly presets. It can remove console and debugger statements, preserve /*! license */ banners, optimize booleans, beautify minified code back into readable form, and validate your JavaScript for unterminated strings, mismatched brackets and syntax errors with line numbers. A live before/after comparison, an analytics dashboard (bytes saved, compression percentage, optimization score, estimated parse and load-time savings) and a bundle analysis (functions, declarations, complexity) give you real insight, and bulk processing optimizes many files at once. Crucially, it never renames your variables or functions — so unlike obfuscators, it can't change how your program behaves — and everything runs in your browser, so your code is never uploaded.",
      how: [
        "Paste, type or drop a JavaScript file into the editor — it minifies and validates as you type.",
        "Pick a preset (Safe, Aggressive, Production or Debug-friendly) or fine-tune each option in Settings.",
        "Review the live output, before/after comparison, bundle analysis and size savings.",
        "Copy the minified JavaScript or download it — or drop several files into the Bulk tab to optimize them together.",
      ],
      benefits: [
        "Safe token-based minification that never renames identifiers, so it can't break your code.",
        "Full ES6+/ESNext support — arrow functions, classes, async/await, template literals, optional chaining and more.",
        "Safe, Aggressive, Production and Debug-friendly presets for one-click optimization.",
        "Remove console & debugger statements, preserve license banners and optimize booleans.",
        "Beautify minified code back to readable form with 2-space, 4-space or tab indentation.",
        "Validation for unterminated strings, mismatched brackets and syntax errors with line numbers.",
        "Analytics & bundle analysis — size reduction, optimization score, parse/load savings, function counts.",
        "Before/after comparison, diff, bulk processing and instant export — 100% private in your browser.",
      ],
      relatedSlugs: [
        "html-minifier",
        "css-minifier",
        "json-formatter",
        "base64-encoder-decoder",
      ],
      faqs: [
        {
          q: "What is a JavaScript minifier?",
          a: "A JavaScript minifier removes characters that aren't needed to run your code — comments, whitespace, indentation and unnecessary line breaks — to produce a smaller file that downloads and parses faster. Toollyz JavaScript Minifier also validates, beautifies, compares and analyzes your code.",
        },
        {
          q: "How does JavaScript minification work?",
          a: "The tool tokenizes your code with a full ES6+ lexer, then re-emits it with the shortest safe spacing between tokens, dropping comments and collapsing whitespace. It preserves line breaks only where automatic semicolon insertion (ASI) requires them, so the output behaves exactly like your original.",
        },
        {
          q: "Will minification break my code?",
          a: "No. This is safe minification — it never renames variables or functions and never reorders statements, and it keeps the line breaks that ASI depends on. That makes it impossible for the minifier to change your program's behavior, unlike aggressive obfuscators.",
        },
        {
          q: "Can I beautify JavaScript again?",
          a: "Yes. Click Beautify to pretty-print minified or messy code with clean indentation (2 spaces, 4 spaces or tabs). You can toggle between minify and beautify freely, with full undo/redo.",
        },
        {
          q: "Does this support ES6+ syntax?",
          a: "Yes. The tokenizer fully understands modern JavaScript — arrow functions, classes, async/await, destructuring, template literals, optional chaining (?.), nullish coalescing (??), BigInt, numeric separators and private class fields all minify correctly.",
        },
        {
          q: "Can I remove console.log statements?",
          a: "Yes. Enable “Remove console statements” (included in the Aggressive and Production presets) to strip standalone console.log/info/warn/… calls, and “Remove debugger” to drop debugger statements before shipping.",
        },
        {
          q: "What's the difference between minification and obfuscation?",
          a: "Minification shrinks file size while keeping the code readable-ish and behaviorally identical. Obfuscation deliberately makes code hard to understand, often by mangling names and restructuring logic. This tool does safe minification, not obfuscation — for name mangling, pair it with a bundler like esbuild or Terser.",
        },
        {
          q: "Can I upload or batch-process JavaScript files?",
          a: "Yes. Drag a single file onto the editor to load it, or drop several files into the Bulk tab to minify them all at once with your current settings, with per-file savings and one-click download.",
        },
        {
          q: "Is my code stored online?",
          a: "No. All tokenizing, minification, validation and analysis happen entirely in your browser — your JavaScript is never uploaded to any server. Saved sessions live only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor, settings, analytics, validation, comparison and bulk tools are fully responsive and touch-friendly, so you can optimize JavaScript on any device.",
        },
        {
          q: "Is this JavaScript minifier free?",
          a: "Completely free with no signup and no limits. Minification, beautifying, validation, analytics, bundle analysis, comparison, bulk processing and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    tagline: "Minify, beautify and analyze CSS safely.",
    description:
      "Compress, beautify, validate and analyze CSS in an IDE-style editor with safe minification, optimization presets, stylesheet analysis, before/after comparison, performance insights, bulk processing and export. Free and private.",
    categoryId: "developer",
    icon: FileMinus,
    status: "live",
    featured: true,
    keywords: [
      "css minifier",
      "minify css",
      "css compressor",
      "compress css",
      "css optimizer",
      "css beautifier",
      "css formatter",
      "minify css online",
      "reduce css size",
      "shrink css",
      "css minify tool",
      "optimize stylesheet",
      "css validator",
      "clean css",
    ],
    seo: {
      title: "CSS Minifier — Compress & Optimize CSS Code Online",
      description:
        "Minify and optimize CSS instantly with Toollyz CSS Minifier. Reduce file size, improve page speed, validate and analyze your stylesheet, compare before/after, and export optimized CSS online — 100% in your browser.",
      what:
        "A CSS Minifier removes everything a browser doesn't need to apply your styles — comments, whitespace, indentation and redundant characters — so stylesheets download and parse faster without changing how the page looks. Toollyz CSS Minifier is a complete optimization workspace, not just a compressor: an IDE-style editor with CSS syntax highlighting and line numbers, safe minification, and Safe, Aggressive and Conservative presets. It can lowercase and shorten hex colors (#ffffff → #fff), strip units from zero values, remove empty rules and preserve /*! license */ banners, beautify minified CSS back into readable form, and validate your stylesheet for unbalanced braces and unterminated comments or strings. A live before/after comparison, an analytics dashboard (bytes saved, compression percentage, optimization score, estimated load-time savings) and a stylesheet analysis (rules, selectors, declarations, media queries, colors) give real insight, plus bulk processing for many files at once. Crucially, the minifier never collapses a descendant-combinator space or alters calc() spacing, so it can't break your layout — and everything runs in your browser, so your code is never uploaded.",
      how: [
        "Paste, type or drop a CSS file into the editor — it minifies and validates as you type.",
        "Pick a preset (Safe, Aggressive or Conservative) or fine-tune each option in the Settings tab.",
        "Review the live output, before/after comparison, stylesheet analysis and size savings.",
        "Copy the minified CSS or download it — or drop several files into the Bulk tab to optimize them together.",
      ],
      benefits: [
        "Safe minification that never breaks layout — descendant combinators and calc() spacing are preserved.",
        "Safe, Aggressive and Conservative presets for one-click optimization.",
        "IDE-style editor with CSS syntax highlighting, line numbers and code-style typography.",
        "Lowercase & shorten hex colors, strip zero units, remove empty rules and keep license banners.",
        "Beautify minified CSS back to readable form with 2-space, 4-space or tab indentation.",
        "Validation for unbalanced braces and unterminated comments or strings, with line numbers.",
        "Analytics & stylesheet analysis — size reduction, optimization score, rules, selectors, colors.",
        "Before/after comparison, diff, bulk processing and instant export — 100% private in your browser.",
      ],
      relatedSlugs: [
        "html-minifier",
        "javascript-minifier",
        "json-formatter",
        "base64-encoder-decoder",
      ],
      faqs: [
        {
          q: "What is a CSS minifier?",
          a: "A CSS minifier removes characters that aren't needed to render styles — comments, whitespace, indentation and redundant punctuation — to produce a smaller stylesheet that downloads and parses faster. Toollyz CSS Minifier also beautifies, validates, compares and analyzes your CSS.",
        },
        {
          q: "How does CSS minification work?",
          a: "The tool scans your stylesheet and re-emits it without unnecessary bytes: it collapses whitespace, drops comments, removes the last semicolon before a closing brace and can shorten colors and zero units. You choose how aggressive to be with presets or individual toggles.",
        },
        {
          q: "Will minifying break my CSS?",
          a: "No. The minifier is whitespace-aware: it never removes the space in a descendant combinator (.a .b is kept distinct from .a.b) and never alters the operator spacing inside calc(). The Safe preset only removes bytes that don't affect rendering; the Aggressive preset adds opt-in transforms you can preview before shipping.",
        },
        {
          q: "Can I beautify CSS again after minifying?",
          a: "Yes. Click Beautify to pretty-print minified or messy CSS with clean, consistent indentation (2 spaces, 4 spaces or tabs) and one declaration per line. You can switch between minify and beautify freely, with full undo/redo.",
        },
        {
          q: "Does it shorten hex colors and remove units?",
          a: "Yes. Enable “Shorten hex colors” to collapse #ffffff to #fff (only when safe) and “Lowercase hex colors” to normalize them. The Aggressive preset also strips units from zero values (0px → 0) for length units outside calc().",
        },
        {
          q: "Can I keep license comments?",
          a: "Yes. With “Preserve license comments” on (the default), /*! … */ and @license banners are kept even while all other comments are removed — so legal notices survive minification.",
        },
        {
          q: "Can I upload or batch-process CSS files?",
          a: "Yes. Drag a single file onto the editor to load it, or drop several files into the Bulk tab to minify them all at once with your current settings, with per-file savings and one-click download.",
        },
        {
          q: "Does it validate my CSS?",
          a: "It performs structural validation — flagging unbalanced braces or parentheses and unterminated comments or strings with line numbers — so you can catch the mistakes that most often break a stylesheet before you ship it.",
        },
        {
          q: "Is my CSS stored online?",
          a: "No. All scanning, minification, validation and analysis happen entirely in your browser — your CSS is never uploaded to any server. Saved sessions live only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor, settings, analytics, validation, comparison and bulk tools are fully responsive and touch-friendly, so you can optimize CSS on any device.",
        },
        {
          q: "Is this CSS minifier free?",
          a: "Completely free with no signup and no limits. Minification, beautifying, validation, analytics, comparison, bulk processing and exports are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    tagline: "MD5 + SHA-1/256/384/512 of text or file, with HMAC support.",
    description:
      "Hash any text or file with MD5, SHA-1, SHA-256, SHA-384 and SHA-512 in one click. Optional HMAC secret switches every algorithm to HMAC-<alg>. Compare against an expected hash for instant integrity checks. Free, private, browser-only.",
    categoryId: "developer",
    icon: Hash,
    status: "live",
    featured: true,
    keywords: [
      "hash generator",
      "md5 hash generator",
      "sha256 hash",
      "sha512 hash",
      "sha-1 hash",
      "file hash online",
      "hmac generator",
      "checksum calculator",
      "browser hash generator",
      "free hash generator",
      "private hash generator",
      "verify hash",
      "compare hash",
      "subtle crypto hash",
    ],
    seo: {
      title: "Hash Generator — MD5, SHA-1, SHA-256/384/512 + HMAC (Free)",
      description:
        "Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes for any text or file in your browser with Toollyz Hash Generator. Optional HMAC mode, hash comparison and copy on every value — Toollyz has no backend.",
      what:
        "A hash generator computes a fixed-length \"fingerprint\" of any input using a published one-way function. Toollyz Hash Generator runs five algorithms — MD5, SHA-1, SHA-256, SHA-384 and SHA-512 — entirely in your browser. SHA-1 / 256 / 384 / 512 use the browser's built-in Web Crypto SubtleCrypto (`crypto.subtle.digest`), which is fast, FIPS-180 compliant and implemented in native code. MD5 uses the open-source spark-md5 library because Web Crypto deliberately omits MD5 (it's broken for cryptographic use). An optional HMAC secret transparently switches every algorithm to HMAC-&lt;alg&gt; (HMAC-MD5 implemented locally per RFC 2104; HMAC-SHA-* via `crypto.subtle.sign`). A Compare to field lets you paste an expected hash and get instant case-insensitive \"OK\" / \"≠\" badges next to matching rows. Switch to the File tab to drop in a file — MD5 streams in 2 MB chunks via spark-md5 (so very large files don't blow the JS heap), SHA-* reads the whole file into memory and digests it in one shot. Output casing is toggleable between lowercase (default) and UPPER CASE. Toollyz has no server in the path — your text, key and files never leave your browser.",
      how: [
        "Switch between the Text and File tabs depending on what you want to hash.",
        "(Optional) Add an HMAC secret to switch every algorithm to its HMAC variant, or paste an expected hash into Compare to.",
        "Watch the five hashes update live as you type (Text) or click Hash all / Compute (File).",
        "Click the copy icon on any row to grab the hex digest.",
      ],
      benefits: [
        "Five algorithms in one place: MD5, SHA-1, SHA-256, SHA-384, SHA-512.",
        "HMAC mode that transparently switches all five algorithms to HMAC-&lt;alg&gt;.",
        "File hashing with a 2 MB-chunked MD5 streamer and SubtleCrypto for SHA-*.",
        "Compare-to field with case-insensitive OK / ≠ badges for instant integrity checks.",
        "UPPER CASE toggle for environments that expect uppercase hex.",
        "Live recompute (debounced 120 ms) as you type — no Compute button for text.",
        "Honest warnings — MD5 and SHA-1 are flagged as cryptographically broken in the UI.",
        "100% private — Toollyz has no backend, text and files stay on your device.",
      ],
      relatedSlugs: [
        "jwt-decoder",
        "base64-encoder-decoder",
        "secure-notes",
        "uuid-generator",
      ],
      faqs: [
        {
          q: "Which algorithm should I use?",
          a: "For security (passwords, tokens, signatures) use SHA-256 or stronger — and for password storage specifically, use a slow hash like Argon2 or bcrypt rather than a raw SHA. For file integrity (\"did this download arrive intact?\") SHA-256 is the modern standard. MD5 and SHA-1 are still fine for non-security checksums (deduplication, cache keys) but should never be used for security.",
        },
        {
          q: "Why is MD5 considered broken?",
          a: "Cryptographers have known how to find MD5 collisions since 2004; in 2008 collisions were used to forge a CA-signed TLS certificate. Any attacker can produce two different inputs with the same MD5. MD5 also has practical pre-image weaknesses. It's fine for accidental-corruption checksums but not for security.",
        },
        {
          q: "What about SHA-1?",
          a: "SHA-1 collisions became practical in 2017 (Google's SHAttered attack). Browsers and Git have been migrating away. Don't use SHA-1 for new security-sensitive work; SHA-256 is a direct replacement.",
        },
        {
          q: "How does HMAC mode work?",
          a: "HMAC (RFC 2104) is a keyed hash: HMAC(key, msg) = H((key⊕opad) ∥ H((key⊕ipad) ∥ msg)). Toollyz calls `crypto.subtle.sign({ name: 'HMAC', hash: alg })` for SHA-* and implements the construction directly for MD5. The result is a hex digest in the same length as the underlying algorithm.",
        },
        {
          q: "How big a file can it hash?",
          a: "MD5 streams in 2 MB chunks via spark-md5, so multi-gigabyte files are fine in modern browsers. SHA-* reads the whole file into memory first; that works comfortably up to a few hundred megabytes on desktop and somewhat less on mobile, depending on RAM. For large SHA-256 jobs, prefer a dedicated tool.",
        },
        {
          q: "What does Compare to do?",
          a: "Paste the expected hash for the current input (from a download page, manifest file or a teammate). Each matching algorithm gets a green OK badge; rows with a different hash get a ≠. Useful for verifying downloads without leaving the page.",
        },
        {
          q: "Is the hashing constant-time?",
          a: "For SHA-* via Web Crypto, the timing characteristics are whatever the browser's native crypto library provides — typically constant-time. MD5 via spark-md5 is a normal JS implementation; for non-security uses that's fine. Don't use this tool for side-channel-sensitive comparisons.",
        },
        {
          q: "Is my text or file uploaded?",
          a: "No. Toollyz has no backend — every byte is hashed locally in your browser. Your draft (text and casing preference) saves to localStorage; the HMAC secret and any file never persist.",
        },
        {
          q: "What encoding does the text hash use?",
          a: "UTF-8 — the standard for web text. The exact bytes are produced by `TextEncoder.encode(text)`. Two strings that look the same but encode to different bytes (e.g. NFC vs NFD Unicode normalisation) will hash differently.",
        },
        {
          q: "Is this Hash Generator free?",
          a: "Completely free with no signup and no limits. Compute as many hashes as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    tagline: "Test, debug and build regular expressions in real time.",
    description:
      "Test JavaScript regular expressions against your text with live match highlighting, capture and named groups, a replace preview and a library of common patterns. Free, fast and private.",
    categoryId: "developer",
    icon: Regex,
    status: "live",
    featured: true,
    keywords: [
      "regex tester",
      "regular expression tester",
      "regex test online",
      "regex debugger",
      "regex match",
      "javascript regex",
      "test regex",
      "regex replace",
      "regex groups",
      "regex playground",
      "regex validator",
      "regex tool",
      "pattern matching",
      "regex cheatsheet",
    ],
    seo: {
      title: "Regex Tester — Test & Debug Regular Expressions Online",
      description:
        "Test and debug regular expressions instantly with Toollyz Regex Tester. Live match highlighting, capture and named groups, a replace preview and a library of common patterns — 100% in your browser.",
      what:
        "A Regex Tester lets you write a regular expression and immediately see what it matches in your text. Toollyz Regex Tester uses the same JavaScript regex engine your code runs on, so what you test is exactly what you get. As you type, it highlights every match in the test string, lists each match with its position, capture groups and named groups, and shows whether your pattern is valid (with the engine's error message if not). Toggle the g, i, m, s, u and y flags, preview replacements with $1 and $<name> backreferences, and load ready-made patterns for emails, URLs, IPv4 addresses, hex colors, dates and more from the built-in library. It runs entirely in your browser — your patterns and text are never uploaded — with built-in guardrails (input limits, iteration caps and a zero-length-match guard) that keep the page responsive and warn you about patterns prone to catastrophic backtracking.",
      how: [
        "Type a regular expression in the pattern bar and toggle the flags you need (g, i, m, …).",
        "Enter or paste your test string — matches highlight live as you type.",
        "Open the Matches tab to inspect each match's capture and named groups.",
        "Use the Replace tab to preview substitutions, or load a ready-made pattern from the Library.",
      ],
      benefits: [
        "Live match highlighting using the real JavaScript RegExp engine.",
        "Capture groups and named groups listed for every match.",
        "All six flags (g, i, m, s, u, y) as one-click toggles with explanations.",
        "Replace preview with $1, $<name> and $& backreferences plus a match count.",
        "Clear, inline error messages for invalid patterns.",
        "A library of common patterns — email, URL, IPv4, hex color, date, phone and more.",
        "ReDoS guardrails — input limits, iteration caps and a catastrophic-backtracking warning.",
        "100% private — patterns and text never leave your browser, and your work autosaves.",
      ],
      relatedSlugs: [
        "javascript-minifier",
        "json-formatter",
        "html-minifier",
        "jwt-decoder",
      ],
      faqs: [
        {
          q: "What is a regex tester?",
          a: "A regex tester is a tool for writing and debugging regular expressions. You enter a pattern and some text, and it shows you exactly what matches — including capture groups — so you can refine the pattern before using it in your code.",
        },
        {
          q: "Which regex flavor does this use?",
          a: "It uses the JavaScript (ECMAScript) regular expression engine built into your browser — the same one used by Node.js and front-end code. Patterns you test here behave identically in your JavaScript and TypeScript projects.",
        },
        {
          q: "What do the flags g, i, m, s, u and y mean?",
          a: "g finds all matches (not just the first), i ignores case, m makes ^ and $ match at line breaks, s lets . match newlines (dotAll), u enables full Unicode handling, and y (sticky) matches only from the current position. Toggle them above the pattern.",
        },
        {
          q: "Does it support capture and named groups?",
          a: "Yes. The Matches tab lists every numbered capture group and any named groups (e.g. (?<year>\\d{4})) for each match, so you can confirm your groups capture exactly what you expect.",
        },
        {
          q: "Can I test find-and-replace?",
          a: "Yes. The Replace tab previews substitutions using standard backreferences — $1 for numbered groups, $<name> for named groups and $& for the whole match — and shows how many replacements were made.",
        },
        {
          q: "Will a complex pattern freeze the page?",
          a: "The tester caps the test-string size and the number of matches it iterates, guards against infinite zero-length-match loops, and runs matching off the main typing path. It also warns when a pattern nests quantifiers (like (a+)+), which can cause catastrophic backtracking on large inputs.",
        },
        {
          q: "Is my pattern or text stored online?",
          a: "No. All matching, grouping and replacing happen entirely in your browser — nothing is uploaded. Your last pattern, flags and test string are saved only in your device's local storage.",
        },
        {
          q: "Do I need to escape the slashes in my pattern?",
          a: "No. You type the pattern body only (the part between the slashes), so a literal slash is just /. Backslashes work exactly as in a normal regex, e.g. \\d for a digit or \\. for a literal dot.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The pattern bar, flag toggles, highlighted test area, match list, replace preview and pattern library are all responsive and touch-friendly.",
        },
        {
          q: "Is this regex tester free?",
          a: "Completely free with no signup and no limits. Testing, groups, replace preview and the pattern library are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Decode, inspect and verify JSON Web Tokens.",
    description:
      "Decode any JWT to read its header, payload and claims, humanize expiry dates, spot unsafe tokens and verify HS256 signatures — all locally in your browser. Free and private.",
    categoryId: "developer",
    icon: ShieldCheck,
    status: "live",
    featured: true,
    keywords: [
      "jwt decoder",
      "decode jwt",
      "json web token",
      "jwt parser",
      "jwt debugger",
      "jwt viewer",
      "jwt verify",
      "decode token online",
      "jwt claims",
      "jwt expiration",
      "hs256 verify",
      "bearer token decoder",
      "jwt inspector",
      "auth token decoder",
    ],
    seo: {
      title: "JWT Decoder — Decode & Verify JSON Web Tokens Online",
      description:
        "Decode and inspect JSON Web Tokens instantly with Toollyz JWT Decoder. Read the header and payload, humanize exp/iat claims, detect unsafe tokens, and verify HS256 signatures — 100% in your browser.",
      what:
        "A JWT Decoder splits a JSON Web Token into its three parts — header, payload and signature — and base64url-decodes the first two so you can read what a token actually contains. Toollyz JWT Decoder is a full inspection workspace: it pretty-prints the header and payload with syntax highlighting, lists every claim with a plain-English description, and humanizes the registered date claims (exp, iat, nbf) into readable timestamps with relative times and an at-a-glance status — active, expired or not-yet-valid. It flags unsafe tokens (alg: none), malformed structures and empty signatures, and can verify HS256 signatures right in your browser using the Web Crypto API when you paste the secret. RS256/ES256 tokens are decoded for inspection (verifying those requires the issuer's public key). Everything — decoding, claim analysis and signature verification — happens entirely on your device, so your tokens and secrets are never uploaded.",
      how: [
        "Paste a JWT (header.payload.signature) into the token box — it decodes as you type.",
        "Read the colour-coded header and payload, and review every claim with its meaning.",
        "Check the status badge to see whether the token is active, expired or not yet valid.",
        "For HS256 tokens, paste the secret and click Verify to confirm the signature locally.",
      ],
      benefits: [
        "Instant, UTF-8-correct base64url decoding of the header and payload.",
        "Syntax-highlighted, pretty-printed header and payload with one-click copy.",
        "Every claim explained, with exp/iat/nbf humanized into readable dates and relative times.",
        "Clear status — active, expired or not-yet-valid — plus warnings for alg: none and malformed tokens.",
        "HS256 signature verification in your browser via the Web Crypto API.",
        "RS256/ES256 tokens decoded for inspection with a clear note on public-key verification.",
        "Works with bearer tokens, ID tokens and access tokens from any provider.",
        "100% private — tokens and secrets never leave your browser, with autosave for your last token.",
      ],
      relatedSlugs: [
        "json-formatter",
        "base64-encoder-decoder",
        "secure-notes",
        "regex-tester",
      ],
      faqs: [
        {
          q: "What is a JWT decoder?",
          a: "A JWT decoder reads a JSON Web Token and shows you what's inside it. A JWT has three base64url-encoded parts — header, payload and signature — and the decoder reveals the header and payload as readable JSON, along with the claims and their meaning.",
        },
        {
          q: "How does JWT decoding work?",
          a: "The token is split on its two dots into header, payload and signature. The header and payload are base64url-decoded (URL-safe base64 without padding) and parsed as JSON. Toollyz then humanizes the standard date claims and surfaces the algorithm, type and validity status.",
        },
        {
          q: "Does decoding a JWT verify it?",
          a: "No — decoding just reads the contents, which anyone can do. Verifying proves the token hasn't been tampered with and was signed by a trusted party. This tool can verify HS256 signatures when you supply the secret; for RS256/ES256 you'd need the issuer's public key.",
        },
        {
          q: "Can I verify the signature?",
          a: "Yes, for HS256 tokens. Paste the HMAC secret and click Verify — the check runs in your browser with the Web Crypto API and tells you whether the signature matches. RS256 and ES256 tokens are decoded for inspection but not verified, since that requires the issuer's public key.",
        },
        {
          q: "Is it safe to paste my token here?",
          a: "Yes. Everything happens locally in your browser — your token and any secret you enter are never sent to a server. That said, treat real production tokens carefully and avoid pasting them into tools you don't trust; this one is fully client-side and open to inspection.",
        },
        {
          q: "How do I read the expiry (exp) claim?",
          a: "JWT dates are NumericDate values (seconds since 1970). The decoder converts exp, iat and nbf into human-readable timestamps with a relative time (e.g. “in 2 days” or “3 hours ago”) and shows whether the token is active, expired or not yet valid.",
        },
        {
          q: "What does “alg: none” mean?",
          a: "It means the token is unsigned. Such tokens carry no cryptographic guarantee and must never be trusted in production — the decoder shows a clear warning when it sees alg: none.",
        },
        {
          q: "Does it support modern tokens with Unicode?",
          a: "Yes. Decoding is UTF-8 aware, so claims containing accented characters, emoji or non-Latin scripts (common in name and email fields) display correctly.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The token input, decoded panels, claims table and signature verification are fully responsive and touch-friendly, so you can inspect tokens on any device.",
        },
        {
          q: "Is this JWT decoder free?",
          a: "Completely free with no signup and no limits. Decoding, claim analysis and HS256 verification are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "secure-notes",
    name: "Secure Notes Tool",
    tagline: "Password-encrypted notes that never leave your browser.",
    description:
      "Keep a password-locked vault of AES-256-encrypted notes in your browser, and share self-contained encrypted notes with a passphrase. Zero-knowledge, offline-ready and 100% private.",
    categoryId: "developer",
    icon: Lock,
    status: "live",
    featured: true,
    keywords: [
      "secure notes",
      "encrypted notes",
      "private notes",
      "password protected notes",
      "encrypted notepad",
      "aes encryption",
      "end to end encrypted notes",
      "zero knowledge notes",
      "encrypt text",
      "encrypt note",
      "secure notepad",
      "offline notes",
      "private notepad",
      "encrypted journal",
    ],
    seo: {
      title: "Secure Notes — Password-Encrypted Notes in Your Browser",
      description:
        "Write password-protected, AES-256-encrypted notes that stay in your browser with Toollyz Secure Notes. Keep a private vault and share self-contained encrypted notes — zero-knowledge and 100% offline.",
      what:
        "Secure Notes is a private, encrypted notebook that runs entirely in your browser. It gives you two things: a password-locked vault — a list of notes encrypted at rest with AES-256-GCM using a key derived from your master password (PBKDF2-SHA-256, 250,000 iterations) — and a share mode that encrypts any note with a passphrase into a single self-contained string you can send to someone, who decrypts it here with the same passphrase. Because it's zero-knowledge, nothing is ever uploaded: your notes, your password and your passphrases all stay on your device. The vault auto-locks when idle, stores only ciphertext in local storage, never keeps your password, and uses a fresh random salt and initialization vector for every encryption. The trade-off of true client-side encryption is that there's no password recovery — if you forget your master password, the notes genuinely cannot be decrypted by anyone, including us.",
      how: [
        "Create a vault and choose a master password (there's no reset, so keep it safe).",
        "Write notes — they're encrypted and saved to your browser automatically as you type.",
        "Lock the vault when you step away; unlock it later with your password.",
        "Use the Share tab to encrypt a note with a passphrase, then send the encrypted text and passphrase separately.",
      ],
      benefits: [
        "AES-256-GCM encryption with a PBKDF2-SHA-256-derived key (250,000 iterations).",
        "A password-locked vault of multiple notes, encrypted at rest in your browser.",
        "Share mode: encrypt a note into a self-contained string anyone can decrypt with the passphrase.",
        "Zero-knowledge and offline — nothing is ever uploaded and no account is needed.",
        "Auto-lock on inactivity, with the decryption key held only in memory.",
        "Only ciphertext is written to local storage; your password is never stored.",
        "Fresh random salt and IV for every encryption, with a versioned, future-proof format.",
        "Change your master password any time — your notes are transparently re-encrypted.",
      ],
      relatedSlugs: [
        "online-notepad",
        "password-generator",
        "jwt-decoder",
        "base64-encoder-decoder",
      ],
      faqs: [
        {
          q: "How are my notes encrypted?",
          a: "With AES-256-GCM, a strong authenticated encryption standard. The key is derived from your master password using PBKDF2-SHA-256 with 250,000 iterations and a random salt, so the same password produces a strong, unique key.",
        },
        {
          q: "Where are my notes stored?",
          a: "Only in your own browser's local storage, and only as encrypted ciphertext. Nothing is ever sent to a server — the tool works completely offline once the page has loaded.",
        },
        {
          q: "What happens if I forget my master password?",
          a: "There is no recovery. Because the encryption key comes from your password and is never stored, forgetting the password means the notes cannot be decrypted by anyone, including us. Choose a password you'll remember or store it in a password manager.",
        },
        {
          q: "How does the share feature work?",
          a: "Share mode encrypts a single note with a passphrase into one self-contained string (starting with TLZ1.). Send that string to someone and tell them the passphrase separately; they paste it into the Decrypt box here to read it. The string contains everything needed to decrypt except the passphrase.",
        },
        {
          q: "Is this truly zero-knowledge?",
          a: "Yes. Encryption and decryption happen in your browser with the Web Crypto API. Your password, passphrases and plaintext never leave the page, so there's nothing on any server to leak.",
        },
        {
          q: "Does the vault lock automatically?",
          a: "Yes. After a period of inactivity the vault locks and the decryption key is dropped from memory, so you'll need your password again. It also locks whenever you close or refresh the tab.",
        },
        {
          q: "Can I change my master password?",
          a: "Yes. While the vault is unlocked, open the Password panel to set a new master password — your notes are re-encrypted with a freshly derived key and saved.",
        },
        {
          q: "Is it safe to share the encrypted string publicly?",
          a: "The string is encrypted, but its safety depends entirely on the strength and secrecy of the passphrase. Use a strong, unique passphrase and share it through a different channel than the encrypted text.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. Creating and unlocking the vault, editing notes, and the encrypt/decrypt share tools are all responsive and touch-friendly.",
        },
        {
          q: "Is this secure notes tool free?",
          a: "Completely free with no signup and no limits. The encrypted vault, sharing and all encryption features are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "clipboard-manager",
    name: "Clipboard Manager",
    tagline: "Save, search and re-use your clipboard history.",
    description:
      "Keep a private history of copied text snippets, pin the ones you reuse, search them and re-copy with one click — all stored locally in your browser. Free and private.",
    categoryId: "developer",
    icon: Clipboard,
    status: "live",
    featured: true,
    keywords: [
      "clipboard manager",
      "clipboard history",
      "copy history",
      "paste manager",
      "clipboard tool",
      "save clipboard",
      "clipboard organizer",
      "snippet manager",
      "copy paste history",
      "online clipboard",
      "clipboard history online",
      "manage clipboard",
      "text snippets",
      "clipboard board",
    ],
    seo: {
      title: "Clipboard Manager — Save & Re-use Clipboard History Online",
      description:
        "Keep a private clipboard history with Toollyz Clipboard Manager. Save copied text snippets, pin favorites, search them and re-copy with one click — 100% in your browser, nothing uploaded.",
      what:
        "A Clipboard Manager remembers the things you copy so you can paste any of them again later, instead of only the single most-recent item your system clipboard holds. Toollyz Clipboard Manager keeps a running history of text snippets you save: paste or type something and click Save, or pull the current system clipboard in with one button. Each entry shows a preview, character count and when you saved it; click any entry to copy it straight back to your clipboard. You can pin the snippets you reuse most so they stay at the top, search your whole history instantly, and delete entries or clear everything in one go. Everything is stored only in your browser's local storage — there's no account and nothing is ever uploaded — so it works offline and your snippets stay completely private to your device.",
      how: [
        "Type or paste text into the box and click Save (or press ⌘/Ctrl + Enter).",
        "Or click “Paste from clipboard” to pull in whatever you last copied.",
        "Click any saved item to copy it back to your clipboard instantly.",
        "Pin the snippets you reuse, search your history, and delete what you don't need.",
      ],
      benefits: [
        "A searchable history of everything you save — no more losing the thing you copied two copies ago.",
        "One-click re-copy of any saved snippet.",
        "Pin frequently used snippets so they stay at the top.",
        "Pull in the current system clipboard with a single button.",
        "Instant search and filtering across your whole history.",
        "Works offline — no account, no signup, no limits.",
        "100% private: snippets are stored only in your browser and never uploaded.",
        "Automatic de-duplication and a generous history cap keep the list tidy.",
      ],
      relatedSlugs: [
        "online-notepad",
        "word-counter",
        "case-converter",
        "slugify",
      ],
      faqs: [
        {
          q: "What is a clipboard manager?",
          a: "A clipboard manager keeps a history of the things you copy, so you can paste any earlier item rather than only the most recent one. Toollyz Clipboard Manager stores your saved snippets in your browser and lets you re-copy, pin, search and organize them.",
        },
        {
          q: "Does it automatically capture everything I copy?",
          a: "No — browsers don't allow web pages to silently watch your system clipboard, which is good for your privacy. Instead you add snippets deliberately: paste or type them and click Save, or use the “Paste from clipboard” button to pull in the current clipboard on demand.",
        },
        {
          q: "Where is my clipboard history stored?",
          a: "Entirely in your browser's local storage on this device. Nothing is uploaded to any server, so your snippets stay private and the tool keeps working offline.",
        },
        {
          q: "Why does “Paste from clipboard” ask for permission?",
          a: "Reading the system clipboard requires your explicit permission for security reasons. If you allow it, the tool reads the current clipboard once; if you block it, just paste into the box manually instead — both work.",
        },
        {
          q: "How do I re-copy a saved snippet?",
          a: "Click the snippet (or its copy icon) and it's written straight back to your system clipboard, ready to paste anywhere. Reused items also jump back to the top of the list.",
        },
        {
          q: "Can I keep important snippets from disappearing?",
          a: "Yes. Pin any snippet and it stays at the top of your history and is kept even as older unpinned items age out. The history is capped to stay fast, with the most recent and pinned items retained.",
        },
        {
          q: "Will my history survive a page refresh?",
          a: "Yes. Your snippets are saved to local storage, so they persist across refreshes and browser restarts on the same device. Clearing your browser data or using a different device/browser starts fresh.",
        },
        {
          q: "Is my data private?",
          a: "Completely. Everything happens locally in your browser — there is no server, no account and no tracking of your snippets. You can clear your entire history at any time.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. Saving, searching, pinning and re-copying are all responsive and touch-friendly, though clipboard read/write permissions vary by mobile browser.",
        },
        {
          q: "Is this clipboard manager free?",
          a: "Completely free with no signup and no limits. Saving, pinning, searching and re-copying are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "internet-speed-test",
    name: "Internet Speed Test",
    tagline: "Measure your download, upload, ping and jitter.",
    description:
      "Test your internet connection's download and upload speed, ping and jitter straight from your browser, with live gauges and a history of past runs. Free and private.",
    categoryId: "developer",
    icon: Gauge,
    status: "live",
    featured: true,
    keywords: [
      "internet speed test",
      "speed test",
      "wifi speed test",
      "bandwidth test",
      "download speed test",
      "upload speed test",
      "broadband speed test",
      "check internet speed",
      "network speed test",
      "mbps test",
      "ping test",
      "connection speed",
      "test my internet",
      "speed test online",
    ],
    seo: {
      title: "Internet Speed Test — Check Download, Upload & Ping",
      description:
        "Test your internet speed with Toollyz Internet Speed Test. Measure download and upload in Mbps, plus ping and jitter, with live gauges — run directly in your browser against Cloudflare's network.",
      what:
        "An Internet Speed Test measures how fast your connection is right now: how quickly it downloads data, how quickly it uploads, and how responsive it is (latency). Toollyz Internet Speed Test runs entirely in your browser against Cloudflare's public speed endpoints — the same network many speed tests use. It first measures latency (ping) and jitter with a series of tiny requests, then measures download by streaming data and timing a steady-state window (discarding the initial ramp-up for a stable number), then measures upload by sending data back. Results appear live on animated gauges in megabits per second (Mbps). Because it's a single-stream, browser-based test, the numbers read a little lower than dedicated multi-connection apps — but they're a reliable, repeatable measure of your connection, and nothing is uploaded to Toollyz (there is no Toollyz server; the test talks directly to Cloudflare).",
      how: [
        "Click Start speed test — keep the tab focused for the most accurate result.",
        "Watch ping and jitter measure first, then download, then upload, live on the gauges.",
        "Read your speeds in Mbps and latency in milliseconds when the test finishes.",
        "Run it again any time, and compare against your recent-test history below.",
      ],
      benefits: [
        "Download and upload speed in Mbps, plus ping and jitter.",
        "Live animated gauges that update as each phase runs.",
        "Accurate download measurement using a steady-state window (slow-start discarded).",
        "Runs against Cloudflare's global network — no Toollyz server in the middle.",
        "A history of past runs so you can compare over time or between locations.",
        "Honest methodology notes about single-stream, browser-based measurement.",
        "Works on any device, no app or signup required.",
        "Free and private — results stay in your browser.",
      ],
      relatedSlugs: [
        "ping-test",
        "ip-address-finder",
        "dns-lookup",
        "json-formatter",
      ],
      faqs: [
        {
          q: "How does this speed test work?",
          a: "It runs in your browser against Cloudflare's public speed endpoints. It times a streamed download over a steady-state window, times an upload of raw data, and measures ping/jitter with small requests. Speeds are reported in megabits per second (Mbps).",
        },
        {
          q: "Why is my speed lower than my plan or another speed test?",
          a: "This is a single-stream, browser-based test, so it typically reads a bit lower than dedicated apps that open many parallel connections. Browser/JS overhead, Wi-Fi, VPNs, other devices on your network, and your distance to Cloudflare's nearest edge all affect the number.",
        },
        {
          q: "What do download, upload, ping and jitter mean?",
          a: "Download is how fast you receive data (streaming, browsing); upload is how fast you send it (calls, backups, posting). Ping is round-trip latency — lower is more responsive — and jitter is how much that latency varies, which matters for calls and gaming.",
        },
        {
          q: "What's a good internet speed?",
          a: "It depends on use: ~25 Mbps download handles HD streaming, 100+ Mbps suits busy households and 4K, and low ping (under ~50 ms) matters for video calls and gaming. Upload of 10+ Mbps is comfortable for calls and uploads.",
        },
        {
          q: "Is my data sent to Toollyz?",
          a: "No. Toollyz has no server — the test transfers data directly between your browser and Cloudflare's speed endpoints purely to measure throughput. Your results are stored only in your browser's local storage.",
        },
        {
          q: "Why should I keep the tab focused during the test?",
          a: "Browsers throttle timers and network in background tabs to save resources, which can skew the measurement. Keeping the tab active gives the most accurate result.",
        },
        {
          q: "Does the test use a lot of data?",
          a: "It transfers a modest amount — enough to measure steady-state throughput for a few seconds each way. On very fast connections that's some tens of megabytes; be mindful if you're on a metered or capped mobile plan.",
        },
        {
          q: "Why is upload sometimes lower or slower to measure?",
          a: "Most connections are asymmetric — upload is slower than download by design. Upload here is measured as a full round-trip (including the server's acknowledgment), and the tool sizes the test to your connection so it doesn't take too long.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The gauges and controls are fully responsive, so you can test Wi-Fi or mobile data on any device. Keep the tab in the foreground for accuracy.",
        },
        {
          q: "Is this internet speed test free?",
          a: "Completely free with no signup and no limits. Download, upload, ping and jitter testing are available to everyone, directly from your browser.",
        },
      ],
    },
  },
  {
    slug: "ping-test",
    name: "Ping Test Tool",
    tagline: "Measure round-trip latency to any host from your browser.",
    description:
      "Check the HTTP(S) round-trip latency, jitter and packet loss to any domain or host, with live per-request results and handy presets — straight from your browser. Free and private.",
    categoryId: "developer",
    icon: Activity,
    status: "live",
    featured: true,
    keywords: [
      "ping test",
      "latency test",
      "ping tool",
      "network latency",
      "ping online",
      "check latency",
      "round trip time",
      "jitter test",
      "packet loss test",
      "ping website",
      "host latency",
      "connection test",
      "rtt test",
      "ping domain",
    ],
    seo: {
      title: "Ping Test — Measure Latency, Jitter & Packet Loss Online",
      description:
        "Measure round-trip latency, jitter and packet loss to any host with Toollyz Ping Test. Live per-request results and one-click presets, run entirely from your browser — free and private.",
      what:
        "A Ping Test measures how long it takes a request to travel to a server and back — your latency. Because browsers cannot send real ICMP ping packets, Toollyz Ping Test measures HTTP(S) round-trip time instead: it times repeated requests to the host you choose and reports the minimum, average, median and maximum latency, plus jitter (how much latency varies) and packet loss. A DNS/TLS warm-up request is discarded so the numbers reflect steady-state latency, and unreachable attempts count as lost packets. The requests go directly from your browser to the host (or fall back to an image load) — there is no Toollyz server in the middle. Because it's HTTP-based, the numbers are higher than a terminal ICMP ping and include the web server's response time, so it's best used to compare hosts and spot instability rather than as an absolute ping value.",
      how: [
        "Type a domain or host (or pick a preset like Cloudflare or Google).",
        "Click Ping — the tool sends several requests and times each round trip.",
        "Watch the live latency bars, then read min, average, jitter and packet loss.",
        "Compare different hosts, or re-run any host from your recent history.",
      ],
      benefits: [
        "Min, average, median and max round-trip latency for any host.",
        "Jitter and packet-loss measurement to spot unstable connections.",
        "Live per-request latency bars as the test runs.",
        "One-click HTTPS presets (Cloudflare, Google, GitHub) plus a custom host field.",
        "A discarded DNS/TLS warm-up so results reflect steady-state latency.",
        "Recent-test history you can re-run with one click.",
        "Runs directly from your browser — no Toollyz server in the path.",
        "Honest methodology: clearly labeled HTTP(S) latency, not ICMP ping.",
      ],
      relatedSlugs: [
        "internet-speed-test",
        "ip-address-finder",
        "dns-lookup",
        "json-formatter",
      ],
      faqs: [
        {
          q: "What is a ping test?",
          a: "A ping test measures latency — the round-trip time for a request to reach a server and come back. Lower is better. This tool reports min/avg/median/max latency along with jitter and packet loss for the host you choose.",
        },
        {
          q: "Is this a real ICMP ping?",
          a: "No. Browsers cannot send ICMP echo packets, so this measures HTTP(S) round-trip time to the host instead. It's a reliable relative measure of latency, but the absolute numbers are higher than a terminal `ping` because they include TLS and web-server response time.",
        },
        {
          q: "Why are my numbers higher than command-line ping?",
          a: "Command-line ping uses ICMP, which a server answers almost instantly at the network layer. A browser request goes through HTTPS and the web server's application layer, adding overhead. Use this tool to compare hosts and detect jitter/instability, not as an exact ICMP value.",
        },
        {
          q: "What are jitter and packet loss?",
          a: "Jitter is how much your latency varies between requests — high jitter causes choppy calls and games even when average latency looks fine. Packet loss is the percentage of requests that got no response; anything above 0% on a stable host warrants attention.",
        },
        {
          q: "Why must the host use HTTPS?",
          a: "This page is served over HTTPS, and browsers block insecure (http://) requests from a secure page (mixed content). The tool automatically upgrades hosts to https://. A host that doesn't support HTTPS will show up as packet loss.",
        },
        {
          q: "Why do the presets use hostnames instead of raw IPs like 8.8.8.8?",
          a: "Browsers require a valid TLS certificate for the address you connect to. Many raw IPs don't present a browser-valid certificate, so they'd appear as 100% loss. The presets use HTTPS hostnames (like 1.1.1.1 and dns.google) that do.",
        },
        {
          q: "Can I test any website?",
          a: "Yes — enter any domain. Some hosts block or rate-limit automated requests, which can show as higher latency or loss; that reflects how that host treats browser requests, not a fault in the tool.",
        },
        {
          q: "Is my data sent to a server?",
          a: "No. Toollyz has no server — the timing requests go directly from your browser to the host you choose. Your recent-test history is stored only in your browser's local storage.",
        },
        {
          q: "How many requests does it send?",
          a: "It sends a warm-up request (discarded) followed by about a dozen timed requests with a short gap between them, then aggregates the results. This balances accuracy with speed.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The host input, presets, live latency bars and results are fully responsive, so you can test latency from any device.",
        },
        {
          q: "Is this ping test free?",
          a: "Completely free with no signup and no limits. Latency, jitter and packet-loss testing are available to everyone, directly from your browser.",
        },
      ],
    },
  },
  {
    slug: "ip-address-finder",
    name: "IP Address Finder",
    tagline: "See your public IP, location, ISP and network details.",
    description:
      "Find your public IPv4 and IPv6 address along with approximate location, ISP, timezone, local IP and connection details — looked up directly from your browser. Free and private.",
    categoryId: "developer",
    icon: Globe,
    status: "live",
    featured: true,
    keywords: [
      "ip address finder",
      "what is my ip",
      "my ip address",
      "find my ip",
      "ip lookup",
      "public ip",
      "ip location",
      "ipv6 address",
      "isp lookup",
      "check my ip",
      "whats my ip",
      "ip geolocation",
      "my ip location",
      "ip checker",
    ],
    seo: {
      title: "IP Address Finder — What Is My IP, Location & ISP",
      description:
        "Instantly find your public IPv4/IPv6 address, approximate location, ISP, timezone, local IP and connection details with Toollyz IP Address Finder — looked up directly from your browser.",
      what:
        "An IP Address Finder tells you the public IP address your internet connection presents to the websites you visit, along with the details that can be inferred from it. Toollyz IP Address Finder shows your public IPv4 (and IPv6, if your network has one), an approximate location (city, region, country), your ISP and organization, your timezone, and — detected entirely in your browser — your local/private IP and connection estimate. Because this site has no server of its own, the lookup is made directly from your browser to a reputable public API (ipwho.is, with ipapi.co and ipify as fallbacks); finding your public IP necessarily reveals it to that one provider, but Toollyz never sees or stores it. Your local IP is discovered in-browser via WebRTC and never leaves your device, and the browser/connection details come straight from your own browser.",
      how: [
        "Open the tool — it automatically looks up your public IP and details.",
        "Read your public IP, location, ISP and timezone, with IPv6 if available.",
        "Check your in-browser local IP and connection estimate below.",
        "Click your IP to copy it, or press Refresh to look it up again.",
      ],
      benefits: [
        "Your public IPv4 and IPv6 (when your network supports it), with one-click copy.",
        "Approximate location — city, region, country — plus ISP, organization and timezone.",
        "Local/private IP discovered in your browser via WebRTC, never uploaded.",
        "Connection estimate (type, downlink, RTT) where the browser exposes it.",
        "Browser & device details: platform, languages, timezone, screen and CPU.",
        "Sequential provider chain so your IP is revealed to at most one lookup service.",
        "Clear privacy notes — no Toollyz server, nothing stored.",
        "Free, instant and works on any device.",
      ],
      relatedSlugs: [
        "internet-speed-test",
        "ping-test",
        "dns-lookup",
        "jwt-decoder",
      ],
      faqs: [
        {
          q: "What is my IP address?",
          a: "Your IP address is the unique number your network presents to the internet so servers know where to send responses. This tool shows your public IP (the one websites see) plus, when available, your IPv6 address and your device's local IP.",
        },
        {
          q: "What's the difference between my public and local IP?",
          a: "Your public IP is assigned by your ISP and shared by every device on your network — it's what websites see. Your local (private) IP, like 192.168.x.x, identifies your device inside your home/office network. This tool shows both when your browser allows it.",
        },
        {
          q: "How accurate is the location?",
          a: "IP-based geolocation is approximate. It often points to your ISP's regional hub rather than your exact address and can be off by tens of miles. If you use a VPN or proxy, it shows that server's location instead of yours.",
        },
        {
          q: "Is my IP sent to Toollyz?",
          a: "No — Toollyz has no server. The lookup is made directly from your browser to a public API (ipwho.is, with ipapi.co/ipify as fallbacks). Finding your public IP unavoidably reveals it to that one provider, but Toollyz never receives or stores it.",
        },
        {
          q: "Why don't I see an IPv6 address?",
          a: "Many home connections are still IPv4-only or use carrier-grade NAT, so there's no public IPv6 to show. If your network supports IPv6, it appears in its own card; otherwise the tool says it isn't available.",
        },
        {
          q: "Why is my local IP shown as a .local name?",
          a: "Modern browsers deliberately hide your real local IP behind a random “.local” address for privacy (mDNS obfuscation). That's expected and a good thing — when it happens, the tool says so rather than showing a private address.",
        },
        {
          q: "Why is the connection card missing in my browser?",
          a: "The connection estimate uses the Network Information API, which only Chromium-based browsers implement. On Safari and Firefox the card is hidden because the data isn't available. For a real measurement, use the Internet Speed Test.",
        },
        {
          q: "Can I hide or change my IP address?",
          a: "Yes — a VPN or proxy routes your traffic through another server, so websites (and this tool) see that server's IP and location instead of yours. Run the finder with your VPN on and off to see the difference.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The lookup and all detail cards are fully responsive, though local-IP detection and the connection card depend on what your mobile browser exposes.",
        },
        {
          q: "Is this IP address finder free?",
          a: "Completely free with no signup. Looking up your IP, location, ISP and network details is available to everyone, directly from your browser.",
        },
      ],
    },
  },
  {
    slug: "dns-lookup",
    name: "DNS Lookup Tool",
    tagline: "Resolve A, AAAA, MX, TXT, CNAME, NS, SOA and CAA records.",
    description:
      "Look up DNS records for any domain — A, AAAA, CNAME, MX, TXT, NS, SOA and CAA — directly from your browser via DNS-over-HTTPS. Free and private.",
    categoryId: "developer",
    icon: Network,
    status: "live",
    featured: true,
    keywords: [
      "dns lookup",
      "dns checker",
      "dns records",
      "mx records",
      "txt records",
      "cname lookup",
      "ns records",
      "soa record",
      "caa record",
      "dns over https",
      "doh lookup",
      "nslookup online",
      "dig online",
      "dns resolver",
    ],
    seo: {
      title: "DNS Lookup — A, AAAA, MX, TXT, CNAME, NS, SOA & CAA Records",
      description:
        "Look up DNS records for any domain — A, AAAA, CNAME, MX, TXT, NS, SOA and CAA — instantly with Toollyz DNS Lookup. Uses DNS-over-HTTPS from your browser; no Toollyz server.",
      what:
        "A DNS Lookup Tool resolves the records that map a domain to IP addresses, mail servers, name servers and configuration metadata. Toollyz DNS Lookup uses DNS-over-HTTPS (DoH) directly from your browser against Cloudflare's public 1.1.1.1 resolver, so there's no Toollyz server in the path. Pick which record types you want — A and AAAA for IPv4/IPv6 addresses, CNAME for aliases, MX for mail, TXT for SPF/DKIM/verification, NS for name servers, SOA for zone metadata and CAA for certificate authority authorization — and each is queried in parallel. Results show every record with its data and TTL, plus a clear NXDOMAIN state when a record doesn't exist. Because DoH bypasses your system resolver, results reflect the authoritative zone via Cloudflare and may differ slightly from your local DNS, which is useful for debugging caching and propagation issues.",
      how: [
        "Type a domain (no http:// needed) and pick the record types you want.",
        "Click Lookup — every type is queried in parallel from your browser.",
        "Read each record's data and TTL. NXDOMAIN means that record doesn't exist.",
        "Try one of the suggested popular domains, or copy the results in dig-style format.",
      ],
      benefits: [
        "All the common record types: A, AAAA, CNAME, MX, TXT, NS, SOA and CAA.",
        "Parallel queries for every selected type — fast even for big lookups.",
        "Clean per-record display with TTL and a clear NXDOMAIN state when missing.",
        "Bypasses your system DNS via DNS-over-HTTPS, useful for caching/propagation checks.",
        "Domain normalization — paste a URL and it strips the protocol/path for you.",
        "Popular-domain shortcuts to compare zones quickly.",
        "Copy the results in a dig-style text format for tickets or notes.",
        "100% private — requests go directly to Cloudflare's 1.1.1.1 from your browser.",
      ],
      relatedSlugs: [
        "ip-address-finder",
        "ping-test",
        "internet-speed-test",
        "jwt-decoder",
      ],
      faqs: [
        {
          q: "What is DNS?",
          a: "DNS (Domain Name System) maps human-readable domains like toollyz.com to the IP addresses servers use to talk to each other. Different record types carry different mappings — addresses (A/AAAA), mail (MX), text (TXT) and more.",
        },
        {
          q: "What does this tool query?",
          a: "It queries Cloudflare's public DNS-over-HTTPS (DoH) API at cloudflare-dns.com for whichever record types you've selected. Each type is fetched in parallel and the results are normalized into a common table.",
        },
        {
          q: "Why use DNS-over-HTTPS from the browser?",
          a: "A browser can't talk to your system DNS resolver directly, so DoH is the standard way to do DNS in the browser. It also makes results consistent: you see what Cloudflare's authoritative-side resolver returns, regardless of any DNS caching on your machine or network.",
        },
        {
          q: "Why might my results differ from “nslookup” or “dig”?",
          a: "Your system tools use whatever resolver your OS is configured for (often your ISP or router), which can return cached or filtered results. This tool always goes through Cloudflare 1.1.1.1 via DoH, which is closer to the authoritative answer.",
        },
        {
          q: "What does NXDOMAIN mean?",
          a: "NXDOMAIN is the DNS code for “this name does not exist” — at least for the record type you asked about. It's normal for some types (a domain may have A records but no MX, for example).",
        },
        {
          q: "What is a TTL?",
          a: "Time-to-live: how long a resolver should cache the record (in seconds). Lower TTL means changes propagate faster but more frequent lookups; higher TTL is the opposite.",
        },
        {
          q: "Why are TXT records sometimes split with quotes?",
          a: "Long TXT records are returned as multiple quoted strings concatenated. The tool unquotes and joins them so you see the actual value used by mail filters and verification tools.",
        },
        {
          q: "Can I look up reverse DNS (PTR)?",
          a: "Not yet — this tool focuses on the most common forward-zone record types (A, AAAA, CNAME, MX, TXT, NS, SOA, CAA). Reverse DNS uses a different lookup format that's a separate feature.",
        },
        {
          q: "Is my domain or query sent to Toollyz?",
          a: "No. Toollyz has no server — the DoH request goes directly from your browser to Cloudflare. Your last domain and selected types are saved only in your browser's local storage.",
        },
        {
          q: "Is this DNS lookup tool free?",
          a: "Completely free with no signup and no limits. Looking up records is available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "browser-info",
    name: "Browser Information Checker",
    tagline: "See your browser, locale, permissions and web-API support.",
    description:
      "Inspect everything your browser reveals to a website — version, engine, OS, user-agent, locale, preferences, permissions and supported web APIs. Read entirely in your browser. Free and private.",
    categoryId: "developer",
    icon: AppWindow,
    status: "live",
    featured: true,
    keywords: [
      "browser information",
      "browser info checker",
      "what browser am i using",
      "user agent checker",
      "browser version",
      "browser capabilities",
      "web api support",
      "browser features",
      "browser detect",
      "user agent string",
      "browser test",
      "feature detection",
      "browser fingerprint",
      "browser identification",
    ],
    seo: {
      title: "Browser Information Checker — Version, UA & Web-API Support",
      description:
        "See what your browser tells websites about itself: name, version, engine, OS, user-agent, locale, permissions and supported web APIs — read entirely in your browser with Toollyz Browser Information Checker.",
      what:
        "A Browser Information Checker shows you everything your browser exposes to the websites you visit. Toollyz Browser Information Checker reads it locally in your tab and groups it into clear sections: which browser and version you're running (with engine and operating system), the full user-agent string, your locale (languages, timezone, primary language), your preferences (color scheme, reduced motion, contrast, Do Not Track, cookies, online status), your current window and screen sizes, the Permissions API states for geolocation, notifications, camera, microphone and clipboard, and a comprehensive web-API support matrix covering storage, workers, media, networking, crypto, devices and UI features. You can copy the full snapshot as JSON or download it — useful for support tickets, compatibility debugging or just satisfying curiosity. Nothing is ever uploaded.",
      how: [
        "Open the tool — your browser details load instantly.",
        "Read your browser identity, locale and current preferences.",
        "Check the web-API support matrix to see which features your browser implements.",
        "Click Copy as JSON to share the full snapshot, or download it for a support ticket.",
      ],
      benefits: [
        "Browser name, version, engine, OS and platform at a glance.",
        "Full user-agent string with click-to-copy.",
        "Languages, timezone and primary language from your browser.",
        "Preferences: color scheme, reduced motion, contrast, Do Not Track, cookies, online.",
        "Permissions API states for geolocation, notifications, camera, microphone and clipboard.",
        "30+ web-API checks grouped by category (storage, workers, media, network, crypto, device, UI).",
        "Export everything as a clean JSON snapshot for tickets or testing.",
        "100% private — read in your browser, nothing uploaded.",
      ],
      relatedSlugs: [
        "device-info",
        "battery-status",
        "ip-address-finder",
        "dns-lookup",
      ],
      faqs: [
        {
          q: "What does this browser information checker show?",
          a: "Everything your browser exposes to a website: name, version, engine, OS, user-agent, languages, timezone, preferences (dark mode, reduced motion, etc.), Permissions API states and a matrix of which web APIs your browser supports.",
        },
        {
          q: "What is a user agent string?",
          a: "The user agent (UA) is a string your browser sends with every request telling servers what browser and OS you're using. It looks something like “Mozilla/5.0 (…) Chrome/120 Safari/537.36” — the tool shows yours and parses out the readable parts.",
        },
        {
          q: "Why might my browser version look wrong?",
          a: "Modern browsers freeze parts of the UA string for privacy and use newer APIs (userAgentData) to expose the real version. If the UA shows an older minor version, check the “UA brands” row — it reflects the live version.",
        },
        {
          q: "What is feature detection?",
          a: "Checking whether a specific web API exists before using it. The support matrix on this page is exactly that: it asks your browser whether each API is available so you can confirm capabilities for testing and compatibility work.",
        },
        {
          q: "What do the permission states mean?",
          a: "“granted” means the site can use that capability now; “denied” means you've blocked it; “prompt” means you haven't decided yet and the browser will ask. The tool shows the current state without triggering a prompt.",
        },
        {
          q: "Is my user agent or any other data sent to a server?",
          a: "No. Toollyz has no server — everything is read directly in your browser and never uploaded. You can copy or download a JSON snapshot, but only if you choose to.",
        },
        {
          q: "Why does my browser identify itself as “Safari” in Chrome?",
          a: "For historical compatibility, every Chromium browser's UA string still contains “Safari” and “KHTML, like Gecko”. The tool isolates the real browser name; the “User agent” card shows the unparsed string for reference.",
        },
        {
          q: "Can sites really see all this?",
          a: "Most of it, yes — UA, languages, timezone, screen and supported APIs are all observable by any page you visit. Permissions states require the Permissions API and are not directly readable by sites; you read them here in your own context.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The same details are read from mobile browsers, with mobile/desktop indicators where modern UA-Client-Hints are available.",
        },
        {
          q: "Is this browser checker free?",
          a: "Completely free with no signup. Browser info, permissions and the web-API support matrix are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "device-info",
    name: "Device Information Checker",
    tagline: "Detect device type, OS, screen, GPU and hardware specs.",
    description:
      "See your device profile: type (phone/tablet/desktop), OS, screen resolution, pixel ratio, viewport, CPU cores, memory, GPU and connection. Read in your browser, free and private.",
    categoryId: "developer",
    icon: MonitorSmartphone,
    status: "live",
    featured: true,
    keywords: [
      "device information",
      "device info checker",
      "system info",
      "hardware info",
      "screen resolution",
      "device specs",
      "what device",
      "device type",
      "cpu cores",
      "device memory",
      "gpu info",
      "pixel ratio",
      "device fingerprint",
      "device test",
    ],
    seo: {
      title: "Device Information Checker — Type, Screen, CPU, GPU & More",
      description:
        "Inspect what your device exposes to the browser: type, OS, screen resolution, pixel ratio, viewport, CPU cores, memory, GPU and connection — entirely in your browser with Toollyz.",
      what:
        "A Device Information Checker shows the hardware-side details a website can read about your device. Toollyz Device Information Checker classifies the device as a phone, tablet or desktop/laptop, reports the operating system and platform, screen and available resolution with pixel-density (DPR) and color depth, current viewport size, processor cores, device memory, touch points and pointer/hover capabilities, and — where the browser allows — the GPU renderer and vendor (via WebGL) and a connection estimate. It also surfaces which device-level web APIs are available (Battery, Bluetooth, USB, Gamepads, Vibration). Everything is read locally; nothing is uploaded.",
      how: [
        "Open the tool — your device profile loads instantly.",
        "Read your device type, OS, screen and processor information.",
        "Inspect GPU, connection and which device APIs your browser supports.",
        "Copy or download the snapshot as JSON for support or testing.",
      ],
      benefits: [
        "Device type detection (phone, tablet, desktop/laptop).",
        "OS, platform and the browser-reported user-agent platform.",
        "Screen resolution, available area, color depth and device pixel ratio.",
        "Viewport size that updates as you resize or rotate.",
        "Processor cores, device memory and touch capability.",
        "GPU renderer & vendor via WebGL where the browser exposes them.",
        "Connection estimate (effective type, downlink, RTT) where supported.",
        "Battery / Bluetooth / USB / Gamepad / Vibration API availability at a glance.",
      ],
      relatedSlugs: [
        "browser-info",
        "battery-status",
        "internet-speed-test",
        "ip-address-finder",
      ],
      faqs: [
        {
          q: "How does the tool know what device I'm on?",
          a: "It combines your user-agent string with browser capabilities — touch points, screen size, pointer/hover support — to classify the device as a phone, tablet or desktop/laptop. It only uses what the browser exposes.",
        },
        {
          q: "Why does my screen resolution look different from my display?",
          a: "Browsers report the OS-side resolution divided by your device pixel ratio (DPR). A 2560×1600 screen at DPR 2 reports 1280×800 — the “CSS pixels” the browser draws in. The tool shows both the resolution and the DPR.",
        },
        {
          q: "What is device pixel ratio (DPR)?",
          a: "It's the multiplier between CSS pixels and the actual hardware pixels on your screen. High-DPI displays (Retina, modern phones) typically have a DPR of 2 or 3, so each CSS pixel covers more physical pixels for crisper rendering.",
        },
        {
          q: "Why is my GPU shown as “Apple GPU” or a generic name?",
          a: "Browsers can obscure the unmasked GPU renderer/vendor for privacy. What you see is what your browser exposes — sometimes a generic identifier rather than the exact chip name.",
        },
        {
          q: "Why don't I see CPU cores or device memory?",
          a: "Some browsers (notably Safari) don't expose hardwareConcurrency or deviceMemory for privacy. The tool shows “—” when the value isn't available rather than guessing.",
        },
        {
          q: "Why is the connection card missing in some browsers?",
          a: "The Network Information API is only implemented in Chromium-based browsers. On Safari and Firefox the card is omitted because the data isn't available.",
        },
        {
          q: "Will it update if I resize or rotate?",
          a: "Yes — the viewport and orientation update live as you resize the window or rotate the device, so you can see the values change.",
        },
        {
          q: "Is any of this data sent to Toollyz?",
          a: "No. Toollyz has no server — everything is read directly in your browser and never uploaded. You can copy or download a JSON snapshot, but only if you choose to.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The same details are read from mobile browsers, including touch points and orientation.",
        },
        {
          q: "Is this device info tool free?",
          a: "Completely free with no signup. Device detection, screen, hardware and GPU info are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "battery-status",
    name: "Battery Status Checker",
    tagline: "See your battery level, charging state and remaining time.",
    description:
      "Check your laptop or tablet's battery level, charging status and time to full or empty live in your browser — using the Battery Status API. Free and private.",
    categoryId: "developer",
    icon: Battery,
    status: "live",
    featured: true,
    keywords: [
      "battery status",
      "battery checker",
      "battery percentage",
      "laptop battery",
      "battery level",
      "charging status",
      "battery time remaining",
      "battery api",
      "check battery online",
      "browser battery",
      "battery health",
      "battery monitor",
      "how much battery left",
      "battery info",
    ],
    seo: {
      title: "Battery Status Checker — Level, Charging & Time Remaining",
      description:
        "Check your laptop, tablet or phone battery level, charging status and time to full or empty — live in your browser with Toollyz Battery Status Checker. Free and 100% private.",
      what:
        "A Battery Status Checker reads your device's current battery state via the browser. Toollyz Battery Status Checker uses the Battery Status API to show your battery level as a live percentage, whether you're currently charging, and the estimated time until full (when charging) or until empty (when discharging). The hero updates live as your charging state changes — plug or unplug your charger and watch the numbers move. The Battery Status API is implemented in Chromium-based browsers (Chrome, Edge, Opera, Brave, Arc); Firefox and Safari have removed it for privacy, and the tool shows a clear notice in those browsers. Nothing is uploaded — everything is read directly in your tab.",
      how: [
        "Open the tool — your battery level and charging state load instantly.",
        "Watch the percentage and time-remaining update live as your charging state changes.",
        "Plug or unplug the charger to see “time to full” and “time remaining” switch.",
        "Use it as a quick reference while working, or to verify your battery is charging.",
      ],
      benefits: [
        "Live battery percentage with a big, easy-to-read display.",
        "Charging status and an animated battery indicator.",
        "Time to full (when charging) and time remaining (when on battery).",
        "Updates live as you plug or unplug your charger.",
        "Clear “not supported” state for Firefox and Safari users.",
        "Works on laptops, tablets and many phones that expose battery info.",
        "Read in your browser — nothing uploaded, no server involved.",
        "Free and instant — no signup required.",
      ],
      relatedSlugs: [
        "device-info",
        "browser-info",
        "internet-speed-test",
        "ip-address-finder",
      ],
      faqs: [
        {
          q: "How does this read my battery?",
          a: "It uses the browser's Battery Status API (navigator.getBattery), which reports the battery level, charging state, time to full and time remaining. Everything is read locally — Toollyz has no server.",
        },
        {
          q: "Why is it showing “not available” in my browser?",
          a: "Firefox and Safari no longer expose the Battery Status API to protect against fingerprinting. The tool works in Chromium-based browsers — Chrome, Edge, Opera, Brave, Arc — on devices with a battery.",
        },
        {
          q: "Why does “time remaining” say “Calculating…”?",
          a: "The browser sometimes reports Infinity for time-to-full or time-remaining when it can't estimate yet (right after plugging or unplugging). Wait a moment and the number will appear.",
        },
        {
          q: "Does it update live when I plug or unplug the charger?",
          a: "Yes. The tool listens for the levelchange, chargingchange, chargingtimechange and dischargingtimechange events, so the display updates immediately as your charging state and level change.",
        },
        {
          q: "Does it work on a desktop without a battery?",
          a: "It will report 100% and “charging” (the desktop never runs on battery). The tool is most useful on laptops, tablets and phones that actually have a battery.",
        },
        {
          q: "Does this affect my battery life?",
          a: "No. It only reads the battery state your browser already exposes; it doesn't keep anything running in the background and there's no extra polling beyond the browser's own events.",
        },
        {
          q: "Is the data sent anywhere?",
          a: "No. Toollyz has no server — the battery info is read in your browser and never uploaded. Close the tab and nothing remains.",
        },
        {
          q: "Why doesn't it show battery health or cycle count?",
          a: "Browsers only expose the current level, charging state and time estimates. They deliberately don't expose battery health, cycle count or hardware model — those require OS-level access.",
        },
        {
          q: "Does it work on mobile?",
          a: "On mobile browsers that implement the Battery Status API (typically Chrome and other Chromium-based browsers on Android), yes. iOS Safari does not expose it.",
        },
        {
          q: "Is this battery checker free?",
          a: "Completely free with no signup. The level, charging state and time estimates are all available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "screen-resolution",
    name: "Screen Resolution Checker",
    tagline: "Detect screen size, viewport, DPR, color depth and refresh rate.",
    description:
      "Find your screen resolution (CSS and hardware pixels), viewport, device pixel ratio, color depth, refresh rate and orientation — live as you resize. Free and private.",
    categoryId: "developer",
    icon: Monitor,
    status: "live",
    featured: true,
    keywords: [
      "screen resolution",
      "screen resolution checker",
      "what is my screen resolution",
      "viewport size",
      "device pixel ratio",
      "dpr",
      "color depth",
      "refresh rate",
      "screen size",
      "monitor resolution",
      "display info",
      "screen test",
      "aspect ratio",
      "screen orientation",
    ],
    seo: {
      title: "Screen Resolution Checker — Size, DPR, Color Depth & Refresh Rate",
      description:
        "Find your screen resolution in CSS and hardware pixels, viewport, device pixel ratio, color depth, refresh rate, aspect ratio and orientation — updated live as you resize. Free and private.",
      what:
        "A Screen Resolution Checker tells you the dimensions and capabilities of the display you're looking at. Toollyz Screen Resolution Checker shows both the CSS-pixel resolution (what the browser draws) and the hardware-pixel resolution (CSS × device pixel ratio), the current viewport, the device pixel ratio, color depth, aspect ratio and orientation. It also estimates your monitor's refresh rate live by counting browser animation frames. A visual overlay shows your browser window inside the screen so you can see how much real-estate you're using, and the numbers update as you resize the window or rotate your device. Everything is read in your browser; nothing is uploaded.",
      how: [
        "Open the tool — your screen and viewport sizes load instantly.",
        "See both CSS-pixel and hardware-pixel resolutions, plus DPR, color depth and refresh rate.",
        "Resize the window or rotate your device — the values update live.",
        "Copy the summary or download it as JSON for bug reports and design specs.",
      ],
      benefits: [
        "Screen resolution in CSS and hardware pixels with live updates.",
        "Device pixel ratio (DPR), color depth and pixel depth.",
        "Live refresh-rate estimate by counting animation frames.",
        "Aspect ratio computed automatically (16:9, 16:10, 3:2 …).",
        "Visual overlay showing your browser viewport inside the screen.",
        "Window chrome (toolbars / address bar) height calculation.",
        "Updates as you resize the window or rotate the device.",
        "Copy the summary or download it as JSON for tickets.",
      ],
      relatedSlugs: [
        "device-info",
        "browser-info",
        "battery-status",
        "ip-address-finder",
      ],
      faqs: [
        {
          q: "What's the difference between CSS pixels and hardware pixels?",
          a: "CSS pixels are what your browser uses to lay out the page — at DPR 2 a “100 px” square actually covers 200 hardware pixels for crisper rendering. The tool shows both: CSS resolution and the underlying hardware resolution (CSS × DPR).",
        },
        {
          q: "What is device pixel ratio (DPR)?",
          a: "The ratio between CSS pixels and physical screen pixels. Retina laptops and modern phones typically have a DPR of 2 or 3 so each CSS pixel is rendered at higher density.",
        },
        {
          q: "How is the refresh rate measured?",
          a: "By counting how many requestAnimationFrame callbacks your browser fires in one second. That number closely tracks your display's refresh rate (60 Hz, 90 Hz, 120 Hz…). Background tabs throttle this, so keep the tab focused.",
        },
        {
          q: "Why does my reported resolution change after I zoom?",
          a: "Browser zoom changes the device pixel ratio — at 110% zoom, CSS pixels are remapped, so the “viewport” shrinks relative to hardware pixels. The values you see always reflect the current zoom level.",
        },
        {
          q: "What's the “window chrome” line?",
          a: "It's the height of your browser's toolbars (address bar, tabs, etc.). The tool computes outerHeight − innerHeight so you can see how much vertical space the browser UI takes from your screen.",
        },
        {
          q: "Does it work on multi-monitor setups?",
          a: "Yes — it reports the screen the window is on. Move the window to a different monitor and click Refresh to pick up the new screen's dimensions and DPR.",
        },
        {
          q: "Why is aspect ratio shown as something like 1280:800?",
          a: "If width and height share no convenient common factor, the simplest integer ratio is shown. Common monitors reduce to 16:9 or 16:10; some unusual sizes don't.",
        },
        {
          q: "Is my screen data sent to a server?",
          a: "No. Toollyz has no server — everything is read in your browser and never uploaded. Use the Copy or JSON buttons if you want a snapshot.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. Mobile browsers report screen and viewport sizes; the orientation row updates live when you rotate your device.",
        },
        {
          q: "Is this screen resolution checker free?",
          a: "Completely free with no signup. Resolution, DPR, color depth, refresh rate and viewport info are available to everyone, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "keyboard-tester",
    name: "Keyboard Tester",
    tagline: "Test every key on your keyboard — instantly, in the browser.",
    description:
      "Press any key to verify it registers correctly. See live event details (key, code, keyCode, modifiers), a visual keyboard that highlights what you've tested, and a recent-events log. Free and private.",
    categoryId: "developer",
    icon: Keyboard,
    status: "live",
    featured: true,
    keywords: [
      "keyboard tester",
      "key tester",
      "test keyboard online",
      "online keyboard test",
      "stuck key",
      "key not working",
      "keyboard checker",
      "test my keyboard",
      "key event tester",
      "keycode",
      "key code",
      "keyboard diagnostic",
      "verify keyboard",
      "keyboard hardware test",
    ],
    seo: {
      title: "Keyboard Tester — Check Every Key in Your Browser",
      description:
        "Test every key on your keyboard live with Toollyz Keyboard Tester. See key, code, keyCode and modifiers for each press, plus a visual keyboard that highlights what you've tested — 100% in your browser.",
      what:
        "A Keyboard Tester verifies that each key on your physical keyboard registers correctly — useful for diagnosing stuck, ghosted or non-responsive keys after a spill, replacement or before a return. Toollyz Keyboard Tester captures every keydown and keyup event in your browser and shows live details: the typed character (key), the physical button (code), the legacy numeric keyCode, the location (left/right/numpad/standard) and any held modifiers (Ctrl/Alt/Shift/Meta). A virtual QWERTY layout highlights the keys you've pressed in green and lights up the one currently held in indigo, so you can scan for keys that never register. A recent-events log records the last twelve presses with their codes, and Tab/arrows are captured so they don't move focus away. Nothing is uploaded — this is purely an event monitor in your browser.",
      how: [
        "Click anywhere on the page, then start pressing keys — events register instantly.",
        "Watch the live event details for the last key (key, code, keyCode, location, modifiers).",
        "Check the virtual keyboard — green keys are ones you've tested.",
        "Use Reset to clear the highlights and try again, or run through every key methodically.",
      ],
      benefits: [
        "Live event details for every keypress: key, code, keyCode, location, modifiers.",
        "Visual QWERTY layout that highlights pressed and tested keys.",
        "Detects stuck keys, missing keys and ghosting before you ship.",
        "Layout-coverage percentage to track your progress through every key.",
        "Recent-events log of the last 12 keypresses.",
        "Tab and arrow keys are captured so they don't move focus away.",
        "Works for any physical keyboard the OS hands the browser.",
        "100% private — keystrokes are never sent anywhere.",
      ],
      relatedSlugs: [
        "mouse-click-tester",
        "mic-test",
        "device-info",
        "browser-info",
      ],
      faqs: [
        {
          q: "What does this keyboard tester check?",
          a: "Whether each key on your keyboard produces a keydown event. If a key never lights up the virtual layout, your browser (and therefore any app on this system) isn't receiving it — typically a hardware or driver issue.",
        },
        {
          q: "What's the difference between “key” and “code”?",
          a: "“key” is the typed character or named key (e.g. “A”, “Enter”, “ArrowUp”) — it varies with layout and modifiers. “code” is the physical button on the keyboard (e.g. “KeyA”, “Enter”, “ArrowUp”) — the same code fires regardless of layout, which makes it ideal for games and shortcuts.",
        },
        {
          q: "Why is keyCode deprecated but still shown?",
          a: "keyCode is the legacy numeric value (65 for “A”, 13 for Enter). It's deprecated in favor of key/code, but the tool still shows it because plenty of older code and reference material relies on those numbers.",
        },
        {
          q: "Why doesn't my Caps Lock light up while held?",
          a: "Caps Lock fires a single keydown when toggled — it doesn't repeat or stay “held” like a letter. The tester records that one event; if you press it twice you should see it fire each time.",
        },
        {
          q: "How can I detect a stuck key?",
          a: "Press the suspected key once. If it keeps appearing in the recent-events log without you holding it, or if the virtual key stays highlighted as “pressed” after release, that's a stuck switch — common after a spill or with worn keyboards.",
        },
        {
          q: "What about media keys, function keys and Fn?",
          a: "Most F1–F12 keys are captured normally. Media and special keys (volume, brightness, Fn combos) are often handled by the OS before the browser sees them and may not appear here — that's normal.",
        },
        {
          q: "Does Tab move focus when I press it?",
          a: "No — the tool calls preventDefault on Tab, arrows, Space and Backspace so they don't move focus away or scroll the page while you're testing.",
        },
        {
          q: "Why does Shift+A show key “A” but code “KeyA”?",
          a: "“A” is what would be typed (Shift makes it uppercase); “KeyA” is the physical button. The Shift modifier appears in the “modifiers” badge at the same time.",
        },
        {
          q: "Does it work on mobile?",
          a: "It detects keypresses from a connected Bluetooth/USB keyboard on a phone or tablet. On-screen virtual keyboards on phones don't typically fire the same keydown/keyup events.",
        },
        {
          q: "Is this keyboard tester free?",
          a: "Completely free with no signup. Press as many keys as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "mouse-click-tester",
    name: "Mouse Click Tester",
    tagline: "Test every mouse button, double-click, scroll and CPS.",
    description:
      "Click anywhere in the test area to verify left, right, middle, back and forward buttons, double-clicks, scroll-wheel and clicks-per-second — with live counters and visual ripples. Free and private.",
    categoryId: "developer",
    icon: MousePointer,
    status: "live",
    featured: true,
    keywords: [
      "mouse tester",
      "mouse click test",
      "click test",
      "double click test",
      "scroll test",
      "mouse button test",
      "right click test",
      "middle click test",
      "cps test",
      "clicks per second",
      "mouse diagnostic",
      "test my mouse",
      "mouse not working",
      "verify mouse",
    ],
    seo: {
      title: "Mouse Click Tester — Buttons, Double-Click, Scroll & CPS",
      description:
        "Test every mouse button, double-click, scroll-wheel and clicks-per-second with Toollyz Mouse Click Tester. Visual ripples, live counts and event details — 100% in your browser.",
      what:
        "A Mouse Click Tester verifies that every button on your mouse — left, right, middle, back and forward — registers correctly and at the speed you'd expect. Toollyz Mouse Click Tester gives you a focused test area that captures pointer-down and pointer-up events, the wheel, double-clicks and pointer movement. Each click renders a color-coded ripple at the exact cursor position, the button counts increment live for left/right/middle/back/forward, a rolling clicks-per-second meter shows your click cadence, and the wheel-tick counter tracks scroll input. The right-click context menu is suppressed inside the test area so right-click testing actually works, and Pointer Events handle both mice and stylus/touch with the same API. Everything is read in your browser — your clicks are never sent anywhere.",
      how: [
        "Click anywhere in the test area to register a press — left, right, middle, back or forward.",
        "Watch the button counts increment and ripples appear at your cursor.",
        "Click twice quickly to detect a double-click; scroll the wheel to count ticks.",
        "Use Reset to clear counters, then run through every button to confirm your mouse is healthy.",
      ],
      benefits: [
        "Live counts for left, right, middle, back and forward buttons.",
        "Visual ripples at the cursor for every click, color-coded by button.",
        "Double-click detection with a clear indicator.",
        "Clicks-per-second (CPS) meter over a 5-second rolling window.",
        "Scroll-wheel tick counter to verify your wheel.",
        "Cursor coordinates inside the test area for precision checks.",
        "Right-click context menu suppressed so right-click testing actually works.",
        "100% private — clicks stay in your browser.",
      ],
      relatedSlugs: [
        "keyboard-tester",
        "mic-test",
        "device-info",
        "browser-info",
      ],
      faqs: [
        {
          q: "What does this mouse tester check?",
          a: "Whether every button on your mouse fires events, how fast you can click (CPS), whether your double-click registers, and whether the scroll wheel produces ticks. It's the quickest way to catch a dying switch, a stuck button or a misbehaving wheel.",
        },
        {
          q: "Why doesn't my right-click open the browser menu?",
          a: "The test area calls preventDefault on contextmenu so right-click registers cleanly without showing the browser's menu. Right-click outside the area to bring the menu back.",
        },
        {
          q: "How are back/forward (side) buttons detected?",
          a: "If your mouse fires button 3 (back) or button 4 (forward) — most gaming and many office mice do — they show up in their own counters. If they never appear, your mouse may not expose them or your OS/driver is intercepting them.",
        },
        {
          q: "What is CPS (clicks per second)?",
          a: "How many clicks you registered in the last second, sampled with a short rolling window. Useful for testing gaming mice, mechanical switches and your own click cadence.",
        },
        {
          q: "Why is double-click sometimes missed?",
          a: "Operating systems treat two clicks as a double-click only when they happen within a configured window (often 300–500 ms). Click faster, or check your OS's mouse-speed setting.",
        },
        {
          q: "Does it work with a trackpad or touch?",
          a: "Yes. The tool uses Pointer Events, which cover mice, trackpads, pens and touch. Three-finger taps and gestures may not generate button events the way a physical mouse does.",
        },
        {
          q: "Why doesn't my scroll wheel count when I scroll quickly?",
          a: "Most wheels send multiple wheel events per spin; the counter increments per event. If you see no events at all, either the wheel hardware isn't sending input or the OS is consuming it (zoom shortcuts, gestures, etc.).",
        },
        {
          q: "What about back/forward navigation in the browser?",
          a: "The test area handles back/forward as plain buttons (3 and 4) and does not navigate. Outside the area, those buttons still control browser history as normal.",
        },
        {
          q: "Does it work on mobile?",
          a: "On a touch device, taps are treated as left-button clicks and ripples render at the touch point. Right-click, middle-click and scroll-wheel are mouse-specific and won't be available without a connected mouse.",
        },
        {
          q: "Is this mouse tester free?",
          a: "Completely free with no signup. Click as much as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "mic-test",
    name: "Mic Test Tool",
    tagline: "Live mic level, waveform and quick record-and-playback.",
    description:
      "Check your microphone in seconds: live volume meter, dBFS readout, real-time waveform, device picker and a short record/playback test. Free and private — audio never leaves your browser.",
    categoryId: "developer",
    icon: Mic,
    status: "live",
    featured: true,
    keywords: [
      "mic test",
      "microphone test",
      "test microphone online",
      "mic checker",
      "audio input test",
      "is my mic working",
      "microphone level",
      "voice test",
      "headset mic test",
      "webcam mic test",
      "record and playback",
      "mic not working",
      "verify microphone",
      "browser mic test",
    ],
    seo: {
      title: "Mic Test — Live Volume, Waveform & Record/Playback",
      description:
        "Test your microphone in your browser with Toollyz Mic Test. Live volume meter, dBFS, real-time waveform, device picker and a quick record-and-playback — entirely in your browser, no uploads.",
      what:
        "A Mic Test verifies that your microphone is connected, selected and producing usable sound. Toollyz Mic Test uses the browser's getUserMedia and Web Audio APIs to read your mic stream entirely in your tab: it shows a live RMS volume meter as a percentage, a dBFS readout, a real-time waveform on a canvas and a peak-hold marker so you can see whether your levels are too quiet or clipping. A device picker lets you switch between input devices, and a quick record-and-playback step lets you confirm what you actually sound like before joining a call. Audio is processed and recorded in your browser only — there is no Toollyz server, nothing is uploaded, and recorded clips are discarded as soon as you leave the page.",
      how: [
        "Click Start mic and grant the browser permission when prompted.",
        "Talk into your microphone and watch the level and waveform respond.",
        "If you have more than one mic, switch with the device picker.",
        "Hit Start recording, say something, stop, and play it back to hear yourself.",
      ],
      benefits: [
        "Live volume meter and dBFS readout for instant level checks.",
        "Real-time waveform canvas so silence is obvious at a glance.",
        "Peak-hold marker that shows your loudest recent level.",
        "Device picker for switching between connected microphones.",
        "Quick record-and-playback to hear yourself before a call.",
        "Color-tuned meter — green for healthy, amber for hot, red for clipping.",
        "Graceful states for unsupported, denied or missing-mic scenarios.",
        "100% private — audio stays in your browser, nothing is uploaded.",
      ],
      relatedSlugs: [
        "device-info",
        "browser-info",
        "keyboard-tester",
        "mouse-click-tester",
      ],
      faqs: [
        {
          q: "How does this mic test work?",
          a: "It requests access to your microphone with the browser's getUserMedia API, feeds the audio stream into a Web Audio AnalyserNode, and reads the time-domain samples to compute a live level and draw a waveform. Everything happens in your browser.",
        },
        {
          q: "Will it record or upload my voice?",
          a: "No — it only listens for the meter. If you click Start recording, the clip is held in your browser as a Blob and offered for playback; it's discarded when you reload or leave the page, and is never uploaded.",
        },
        {
          q: "Why does the browser ask for permission?",
          a: "Microphone access is sensitive, so browsers always require your explicit permission. Click “Allow” when prompted; you can revoke it any time from the lock icon in your address bar.",
        },
        {
          q: "Why is the meter flat / nothing happens?",
          a: "Either your mic is muted (hardware switch or OS), the wrong input is selected (try the device picker), the browser blocked permission, or the device isn't producing sound. Check the lock icon, your OS sound settings, and try a different input.",
        },
        {
          q: "What is dBFS?",
          a: "Decibels relative to full-scale. 0 dBFS is the maximum digital level your audio can reach; anything below is shown as a negative number. Speak normally and you'd typically see −20 to −10 dBFS for a healthy signal.",
        },
        {
          q: "What does the colored level mean?",
          a: "Green means a healthy signal, amber means it's getting hot, and red means you're close to clipping. Aim for green-to-low-amber when you talk normally.",
        },
        {
          q: "Can I switch between my laptop mic and a headset?",
          a: "Yes — once you've granted permission, the device picker lists every input the browser sees. Pick the one you want and the test restarts on that device.",
        },
        {
          q: "Why doesn't my Bluetooth headset show up?",
          a: "Bluetooth audio devices have to be paired and selected at the OS level for the browser to see them as inputs. Make sure your headset is connected and set as the default input in your sound settings, then refresh.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes, on browsers that implement getUserMedia (most modern mobile browsers do). The browser will ask for permission once per site.",
        },
        {
          q: "Is this mic test free?",
          a: "Completely free with no signup. Run as many checks as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "webcam-test",
    name: "Webcam Test Tool",
    tagline: "Live webcam preview with resolution, FPS, snapshots and record.",
    description:
      "Test your webcam in seconds: live preview, real-time resolution and frame-rate readout, device picker, mirror toggle, PNG snapshots and a quick video recording — all in your browser. Free and private.",
    categoryId: "developer",
    icon: Webcam,
    status: "live",
    featured: true,
    keywords: [
      "webcam test",
      "camera test",
      "test webcam online",
      "webcam checker",
      "camera preview",
      "is my webcam working",
      "webcam fps",
      "webcam resolution",
      "online camera test",
      "browser webcam test",
      "webcam snapshot",
      "webcam record",
      "webcam diagnostic",
      "verify camera",
    ],
    seo: {
      title: "Webcam Test — Live Preview, Resolution, FPS & Snapshots",
      description:
        "Test your webcam with Toollyz Webcam Test Tool. Live preview, real-time resolution and FPS, mirror toggle, PNG snapshots and a short recording — entirely in your browser, no uploads.",
      what:
        "A Webcam Test Tool verifies that your camera is connected, selected and producing usable video. Toollyz Webcam Test Tool uses the browser's getUserMedia API to read your camera stream entirely in your tab: it shows a live preview at the camera's negotiated resolution, reads the actual frame rate (via requestVideoFrameCallback where available), lists every connected camera in a device picker and lets you toggle a mirror view for a natural “look at yourself” preview. You can capture PNG snapshots into a gallery and download any of them, or hit Record to capture a short WebM video and play it back in place. Video is processed only in your browser — there's no Toollyz server, nothing is uploaded, and snapshots and recordings are discarded as soon as you leave the page.",
      how: [
        "Click Start camera and grant permission when prompted.",
        "Check the live preview, resolution and FPS in the hero.",
        "Switch cameras with the device picker, or toggle mirror to flip the view.",
        "Capture a snapshot to download as PNG, or hit Record for a quick WebM clip.",
      ],
      benefits: [
        "Instant live preview at the camera's negotiated resolution.",
        "Real-time frame-rate readout via requestVideoFrameCallback.",
        "Device picker for switching between built-in and external cameras.",
        "Mirror toggle for a natural left/right preview.",
        "PNG snapshots into an in-page gallery with one-click download.",
        "Short WebM recording and inline playback.",
        "Graceful states for unsupported, denied or missing-camera scenarios.",
        "100% private — video stays in your browser, nothing is uploaded.",
      ],
      relatedSlugs: [
        "mic-test",
        "device-info",
        "browser-info",
        "screen-resolution",
      ],
      faqs: [
        {
          q: "How does this webcam test work?",
          a: "It uses the browser's getUserMedia API to open a video stream from your camera and renders it in a <video> element. Resolution and frame rate are read from the live track; snapshots are drawn to a canvas and offered as PNGs. Everything stays in your browser.",
        },
        {
          q: "Why does the browser ask for permission?",
          a: "Camera access is sensitive, so browsers always require explicit permission. Click “Allow” when prompted; you can revoke it any time from the lock icon in your address bar.",
        },
        {
          q: "Why is my preview just black?",
          a: "Either your camera is muted (physical privacy shutter or OS switch), the wrong input is selected (try the device picker), the browser blocked permission, or another app is holding the camera. Close other camera apps and try again.",
        },
        {
          q: "What resolution and frame rate will I see?",
          a: "The browser negotiates a stream with the camera; you'll see the actual resolution your camera chose (commonly 720p or 1080p) and a live frame-rate readout, typically 24–30 FPS for laptops, higher for some external cameras.",
        },
        {
          q: "Why is the FPS sometimes lower than my camera's spec?",
          a: "Lighting (cameras drop FPS in low light to expose longer), other apps using the camera, background CPU pressure or browser throttling on background tabs all reduce frame rate. Keep the tab focused for the most accurate reading.",
        },
        {
          q: "What does the mirror toggle do?",
          a: "It flips the preview horizontally so your movement matches what you'd see in a mirror — most video-call apps do this by default. Snapshots respect the current mirror state.",
        },
        {
          q: "Are snapshots and recordings uploaded?",
          a: "No. Snapshots are Base64 PNGs held in your tab; recordings are WebM Blobs created by your browser. Nothing is sent to Toollyz, and everything is discarded when you reload or leave the page.",
        },
        {
          q: "Why doesn't recording work on Safari?",
          a: "MediaRecorder support for video has historically been incomplete on Safari (it's better in recent versions). If recording fails or no codec is available, snapshots still work in any modern browser.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes, on mobile browsers that implement getUserMedia (most modern ones do). The browser will ask for permission, and the device picker lets you switch between the front and back cameras.",
        },
        {
          q: "Is this webcam test free?",
          a: "Completely free with no signup. Test, snapshot and record as much as you like — privately in your browser.",
        },
      ],
    },
  },

  // ─── CONVERTERS ──────────────────────────────────────────────────────────
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    tagline: "Encode and decode Base64 — text and files, standard or URL-safe.",
    description:
      "Convert text and files to and from Base64 instantly — pick standard or URL-safe variants, preview image data URIs and copy or download in one click. Free and private.",
    categoryId: "converters",
    icon: Binary,
    status: "live",
    featured: true,
    keywords: [
      "base64",
      "base64 encoder",
      "base64 decoder",
      "encode base64",
      "decode base64",
      "base64 to text",
      "text to base64",
      "base64url",
      "file to base64",
      "image to base64",
      "data uri encoder",
      "base64 converter",
      "base64 tool",
      "encode binary",
    ],
    seo: {
      title: "Base64 Encoder / Decoder — Text & File, Standard or URL-Safe",
      description:
        "Encode or decode Base64 for text and files with Toollyz Base64 Encoder/Decoder — UTF-8 aware, standard or URL-safe variants, image data-URI preview. 100% in your browser.",
      what:
        "Base64 is an encoding that represents arbitrary bytes using a 64-character alphabet, so binary data can travel through text-only channels like JSON, URLs, emails or HTML. Toollyz Base64 Encoder/Decoder converts both ways — UTF-8 aware text in or out — and also handles whole files: drop any file in and get its Base64 plus a ready-to-paste data URI; if it's an image, you'll see a live preview rendered from that data URI. You can switch between standard Base64 and URL-safe Base64 (`base64url`, using `-` and `_` with no padding — the variant used by JWT, OAuth and many APIs). Decoding catches malformed input and shows the exact error. Files are read in your browser; nothing is uploaded.",
      how: [
        "Pick the Text or File tab.",
        "For text, choose Encode or Decode and pick Standard or URL-safe Base64.",
        "Type or paste your input — the result appears instantly in the output box.",
        "For files, drop one in to get the Base64 and a copy-ready data URI (with image preview when applicable).",
      ],
      benefits: [
        "Instant, live conversion as you type (UTF-8 aware).",
        "Standard or URL-safe (base64url) variants with one click.",
        "File mode for any file — text, JSON, image, PDF — directly in the browser.",
        "Image data-URI preview rendered from the encoded Base64.",
        "Download decoded Base64 back to a binary file.",
        "Clear error message when Base64 input is malformed.",
        "Swap input and output to chain conversions.",
        "100% private — files and text never leave your browser.",
      ],
      relatedSlugs: [
        "url-encoder-decoder",
        "jwt-decoder",
        "json-formatter",
        "html-minifier",
      ],
      faqs: [
        {
          q: "What is Base64?",
          a: "Base64 is a way of encoding any byte sequence as text using 64 printable characters (A–Z, a–z, 0–9, +, /). It's used wherever binary data has to travel through text — JSON, JWTs, email attachments, HTML data URIs.",
        },
        {
          q: "What's the difference between Base64 and Base64URL?",
          a: "Standard Base64 uses + and / and may end with =. URL-safe Base64 (base64url) replaces + with - and / with _ and drops the = padding, so the string is safe to put in URLs and JWTs. Pick whichever your downstream consumer expects.",
        },
        {
          q: "Why is the encoded output longer than my input?",
          a: "Base64 needs 4 characters to represent every 3 bytes, so output is roughly 4/3 the size of input — about 33% larger. The tool shows the exact byte delta so you can plan around it.",
        },
        {
          q: "Is Base64 encryption?",
          a: "No. Base64 is just a way to represent bytes as text — anyone can decode it instantly. Use it for transport, not for hiding secrets. If you need privacy, encrypt the data first (e.g. with our Secure Notes tool).",
        },
        {
          q: "Why did decoding fail?",
          a: "Standard Base64 accepts only A–Z, a–z, 0–9, +, /, =. A space, a stray hyphen or a missing character will throw. The tool surfaces the engine's exact error so you can fix it.",
        },
        {
          q: "Can I encode files like images and PDFs?",
          a: "Yes. Switch to the File tab and drop any file in — you'll get its Base64 plus a ready-to-paste data URI. For images, a live preview confirms it round-trips correctly.",
        },
        {
          q: "What's a data URI?",
          a: "A data URI like `data:image/png;base64,…` lets you embed a file directly into HTML, CSS or JSON without a separate request. The tool prepares one with the correct MIME type for any file you drop in.",
        },
        {
          q: "Does it work with Unicode and emoji?",
          a: "Yes — text is UTF-8 encoded before Base64 encoding (and decoded back from UTF-8), so accented characters, emoji and non-Latin scripts round-trip correctly.",
        },
        {
          q: "Is my data sent anywhere?",
          a: "No. Toollyz has no server — all encoding and decoding happens in your browser. The file mode reads files locally and discards them when you leave the page.",
        },
        {
          q: "Is this Base64 tool free?",
          a: "Completely free with no signup and no limits. Encode or decode as much text or as many files as you like, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    tagline: "Percent-encode or decode URLs, with a URL parts inspector.",
    description:
      "Encode special characters for URLs or decode percent-encoded strings back into readable text — with component vs full-URI scopes and a built-in URL parts inspector. Free and private.",
    categoryId: "converters",
    icon: Link2,
    status: "live",
    featured: true,
    keywords: [
      "url encoder",
      "url decoder",
      "percent encoding",
      "encode url",
      "decode url",
      "urlencode",
      "urldecode",
      "query string encoder",
      "encode uri",
      "url parser",
      "url components",
      "url escape",
      "url unescape",
      "url tool",
    ],
    seo: {
      title: "URL Encoder & Decoder — Percent-Encode and Parse URLs",
      description:
        "Encode special characters for URLs and decode percent-encoded strings back to readable text with Toollyz URL Encoder/Decoder — plus a URL parts inspector. 100% in your browser.",
      what:
        "A URL Encoder/Decoder converts strings to and from percent-encoding so they're safe to use inside URLs. Toollyz URL Encoder/Decoder handles both directions instantly and lets you switch between component scope (encodeURIComponent — encodes every reserved character, ideal for query values and path segments) and full-URI scope (encodeURI — preserves `://?&=` so a whole URL stays valid). Decoding catches malformed percent escapes and surfaces a clear error. A live URL parts inspector breaks any pasted full URL into its protocol, host, port, pathname, search and hash, and lists each query parameter individually. Everything is computed in your browser — nothing is uploaded.",
      how: [
        "Paste a URL or text into the input box.",
        "Pick Encode or Decode, and choose Component or Full URI scope.",
        "Read the result live in the output box and copy it with one click.",
        "Scroll to the URL parts inspector to see protocol, host, path, query parameters and hash.",
      ],
      benefits: [
        "Instant, live encoding or decoding as you type.",
        "Component vs full-URI scopes for query values vs whole URLs.",
        "Clear error message when a percent-encoded input is malformed.",
        "Swap input and output with one click to chain conversions.",
        "Char-count delta showing how many bytes encoding adds (or decoding saves).",
        "URL parts inspector with protocol, host, port, pathname, search and hash.",
        "Query parameter table that handles duplicates and special characters.",
        "100% private — encoding happens in your browser, nothing uploaded.",
      ],
      relatedSlugs: [
        "base64-encoder-decoder",
        "json-formatter",
        "html-minifier",
        "regex-tester",
      ],
      faqs: [
        {
          q: "What is URL encoding?",
          a: "Also called percent-encoding, it replaces characters that are unsafe or reserved in URLs (spaces, slashes, &, =, ?, …) with a % followed by their hex code. Spaces become %20, & becomes %26 and so on — so the URL travels intact through the web.",
        },
        {
          q: "What's the difference between Component and Full URI?",
          a: "Component (encodeURIComponent / decodeURIComponent) encodes every reserved character — use it for query values, path segments and anything you embed inside a URL. Full URI (encodeURI / decodeURI) preserves :, /, ?, &, = and others — use it when you have a whole URL and want to keep its structure.",
        },
        {
          q: "Which one do I want for query string values?",
          a: "Component. If a value contains & or = or spaces, encodeURIComponent makes sure they don't break your query string. Use it once per value, not once on the whole URL.",
        },
        {
          q: "Why did I get an error decoding?",
          a: "decodeURIComponent throws if it sees a percent sign that isn't followed by two hex digits (a malformed %ZZ). The tool surfaces the exact error message; check for stray % characters or incomplete sequences.",
        },
        {
          q: "Does it handle Unicode characters like emoji?",
          a: "Yes. encodeURIComponent and decodeURIComponent are UTF-8 aware, so non-ASCII characters and emoji round-trip correctly.",
        },
        {
          q: "Why does my % sign keep encoding as %25?",
          a: "% is itself a reserved character — to represent a literal percent in a URL, it's encoded as %25. Encoding an already-encoded string a second time produces this kind of double-encoding; if you don't want that, decode first.",
        },
        {
          q: "Can it parse a URL into components?",
          a: "Yes. Paste a full URL into the input and the URL parts panel shows protocol, host, hostname, port, pathname, search and hash, plus a table of every query parameter.",
        },
        {
          q: "What about + signs for spaces?",
          a: "In query strings, both %20 and + are commonly used for spaces. encodeURIComponent uses %20 (the strict standard); some servers also accept +. Use Component encoding for safety.",
        },
        {
          q: "Is anything sent to a server?",
          a: "No. Toollyz has no server — encoding, decoding and parsing all happen in your browser. Your last input is saved only in your device's local storage.",
        },
        {
          q: "Is this URL encoder/decoder free?",
          a: "Completely free with no signup and no limits. Encode or decode as many strings as you like, privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "markdown-to-html",
    name: "Markdown to HTML",
    tagline: "Convert Markdown to clean HTML with live preview and templates.",
    description:
      "Paste Markdown and get production-ready HTML — headings, lists, code blocks, tables and more — with a live preview, ready-made templates, copy, and a full-document download. Free and private.",
    categoryId: "converters",
    icon: FileCode,
    status: "live",
    featured: true,
    keywords: [
      "markdown to html",
      "md to html",
      "markdown converter",
      "markdown parser",
      "convert markdown",
      "render markdown",
      "markdown preview",
      "github flavored markdown",
      "gfm to html",
      "markdown viewer",
      "markdown online",
      "markdown to webpage",
      "markdown export",
      "md file converter",
    ],
    seo: {
      title: "Markdown to HTML — Live Preview, Templates & Clean Export",
      description:
        "Convert Markdown to clean HTML with Toollyz Markdown to HTML. Live preview, ready-made templates (README, blog post), copy and full-document download — entirely in your browser.",
      what:
        "A Markdown to HTML converter turns Markdown — the lightweight syntax used by GitHub, Notion, Discord and countless static-site generators — into the HTML a browser actually renders. Toollyz Markdown to HTML shows your Markdown on one side and the rendered preview on the other, updating live as you type. Switch to HTML view to read the source, or use Split for both at once. It supports headings, paragraphs, bold/italic, lists (ordered, unordered, nested), inline code and fenced code blocks, blockquotes, links, images, tables and horizontal rules. Pick a ready-made template — README, blog post, changelog — to start from a known-good structure, then copy the rendered HTML fragment or download a full standalone .html document with sensible default styles. Conversion happens entirely in your browser — Markdown and the HTML output never leave the page.",
      how: [
        "Paste or type Markdown in the editor (or pick a template).",
        "See the rendered HTML preview update live in Split or Preview view.",
        "Switch to HTML view to inspect the generated source.",
        "Copy the HTML fragment, or download a full standalone .html document.",
      ],
      benefits: [
        "Live, instant preview as you type.",
        "Three views — Split, Preview and HTML source — for any workflow.",
        "Full GFM-style support: tables, fenced code, task lists, links, images.",
        "Ready-made templates (README, blog post, changelog) to start fast.",
        "Copy a clean HTML fragment, or download a full standalone .html document.",
        "Outline view of all your headings to navigate long documents.",
        "Char counts for Markdown and HTML and a word count for the rendered output.",
        "100% private — Markdown and HTML stay in your browser.",
      ],
      relatedSlugs: [
        "html-minifier",
        "url-encoder-decoder",
        "base64-encoder-decoder",
        "json-formatter",
      ],
      faqs: [
        {
          q: "What Markdown features are supported?",
          a: "Headings, paragraphs, bold/italic/strike, inline and fenced code, blockquotes, lists (ordered, unordered, nested, task), links, images, tables and horizontal rules. The renderer follows common GitHub-flavored Markdown conventions.",
        },
        {
          q: "Does it support code-block syntax highlighting?",
          a: "Code blocks render with monospaced styling and the language label, but full color tokenization isn't applied in this view — for syntax-highlighted source, save the .html and add a highlighter like Prism or highlight.js, or use a static-site generator.",
        },
        {
          q: "How does the “Full .html” download differ from the fragment?",
          a: "The fragment is just the rendered <h1>/<p>/<ul>… markup, ready to paste into an existing page. The full document is a complete .html file with <html>, <head> (title, charset, viewport, basic CSS) and your content inside <body> — open it directly in a browser.",
        },
        {
          q: "Why does my Markdown look different from GitHub?",
          a: "GitHub adds its own CSS and a few non-standard extensions. The tool covers the core GFM features and a sensible default style; for an exact GitHub look, embed the rendered HTML and apply GitHub's CSS (github-markdown.css).",
        },
        {
          q: "Are tables supported?",
          a: "Yes. Use the standard pipe syntax (`| col | col |`) with a separator row (`| --- | --- |`); the tool renders them as styled <table>s.",
        },
        {
          q: "Can I include raw HTML in my Markdown?",
          a: "Raw HTML is allowed where standard Markdown permits it (paragraphs, divs). The renderer escapes content inside code blocks; outside them, recognized inline HTML passes through.",
        },
        {
          q: "Is the HTML output safe?",
          a: "Toollyz renders Markdown locally and sanitizes obvious attack vectors (e.g. event handlers, script tags) typical of safe Markdown engines. If you accept Markdown from untrusted users in your own app, always run it through a dedicated sanitizer before injecting it.",
        },
        {
          q: "Is anything uploaded?",
          a: "No. Toollyz has no server — Markdown is parsed and rendered entirely in your browser. Your last document is saved only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The editor and preview are responsive — Split shows side-by-side on wide screens and stacks vertically on phones.",
        },
        {
          q: "Is this Markdown to HTML converter free?",
          a: "Completely free with no signup and no limits. Convert as much Markdown as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "hex-to-rgb",
    name: "HEX to RGB Converter",
    tagline: "Convert HEX colors to RGB, RGBA, HSL, HSV and CMYK.",
    description:
      "Paste a HEX color (with or without alpha) to instantly see RGB, RGBA, HSL, HSLA and CMYK values, with a live preview, color picker and per-channel breakdown. Free and private.",
    categoryId: "converters",
    icon: Pipette,
    status: "live",
    featured: true,
    keywords: [
      "hex to rgb",
      "hex to rgba",
      "hex color converter",
      "hex to hsl",
      "hex to cmyk",
      "color converter",
      "hexadecimal to rgb",
      "color code converter",
      "hex code",
      "hex color picker",
      "convert hex color",
      "hex to rgb online",
      "color value converter",
      "alpha channel",
    ],
    seo: {
      title: "HEX to RGB Converter — RGBA, HSL, CMYK with Live Preview",
      description:
        "Convert any HEX color code to RGB, RGBA, HSL, HSLA and CMYK with Toollyz HEX to RGB Converter. Live preview, alpha support and per-channel breakdown — 100% in your browser.",
      what:
        "A HEX to RGB Converter turns the hexadecimal color code you find in CSS, design tools and brand guidelines into the RGB triplets and other formats your code can compute with. Toollyz HEX to RGB Converter accepts 3, 4, 6 or 8-digit HEX (with or without the leading #) and instantly shows the parsed RGB and alpha channels, a large color preview, plus every common output format: RGB, RGBA, HSL, HSLA, CMYK and a ready-to-paste CSS custom property. A color picker lets you sample any color visually, and a per-channel breakdown shows R, G, B and alpha as both numbers and proportional bars. Everything is parsed in your browser; nothing is uploaded.",
      how: [
        "Paste a HEX color (e.g. `#6366F1` or `6366F1`) — 3, 4, 6 or 8 digits all work.",
        "See the live preview update and the parsed R/G/B/A values appear.",
        "Read every common format — RGB, RGBA, HSL, CMYK — in the All formats list.",
        "Click any row to copy the value, or use the color picker to sample new colors.",
      ],
      benefits: [
        "Accepts 3, 4, 6 and 8-digit HEX with or without the leading #.",
        "Live preview with automatic contrast text for readability.",
        "Alpha channel parsed from 8-digit HEX (#RRGGBBAA).",
        "Outputs RGB, RGBA, HSL, HSLA and CMYK in one click.",
        "Per-channel breakdown with proportional bars.",
        "Built-in color picker and popular brand presets.",
        "CSS custom property snippet ready to paste into a stylesheet.",
        "100% private — colors stay in your browser.",
      ],
      relatedSlugs: [
        "rgb-to-hex",
        "css-minifier",
        "random-color-generator",
        "html-minifier",
      ],
      faqs: [
        {
          q: "What is a HEX color code?",
          a: "A 6 or 8-character hexadecimal value preceded by a # that represents an RGB color (plus optional alpha). For example #FF0000 is pure red — FF, 00 and 00 are the R, G and B channels in base 16.",
        },
        {
          q: "What does the 8-digit HEX form mean?",
          a: "Eight digits add an alpha channel: #RRGGBBAA. So #6366F180 is the brand purple at ~50% opacity. The tool parses this directly and shows the alpha value.",
        },
        {
          q: "Can I paste a HEX without the #?",
          a: "Yes — `6366F1` works just like `#6366F1`. The tool also accepts 3-digit shorthand (`#F00`) and 4-digit shorthand with alpha (`#F00A`).",
        },
        {
          q: "How does alpha map between hex and decimal?",
          a: "HEX alpha is a byte 00–FF (0–255); CSS rgba() uses 0–1. The tool converts between them — for example `80` in hex is 128, which is ~0.502 in CSS.",
        },
        {
          q: "What's the difference between HSL and HSV?",
          a: "Both are cylindrical color models with hue + saturation, but they differ on the third axis: HSL uses lightness (mid is most saturated), HSV uses value (max is most saturated). HSL is more common in CSS; HSV is common in pickers.",
        },
        {
          q: "What is CMYK and when do I need it?",
          a: "CMYK (Cyan/Magenta/Yellow/Key) is the subtractive color model used in print. The displayed value is a CSS-style approximation — for accurate print proofs, calibrate via your printer's ICC profile.",
        },
        {
          q: "Why is the converted output color slightly different?",
          a: "Conversions between models round at every step and HSL/HSV/CMYK are not lossless representations of RGB. The HEX/RGB pair is exact; HSL and CMYK are good approximations.",
        },
        {
          q: "Can I sample a color with a picker?",
          a: "Yes — click the small color swatch next to the HEX input to open your browser's native color picker, or click any preset/random button to load a sample.",
        },
        {
          q: "Is any data sent to a server?",
          a: "No. Toollyz has no server — parsing and converting happen in your browser. Your last HEX is saved only in your device's local storage.",
        },
        {
          q: "Is this HEX to RGB converter free?",
          a: "Completely free with no signup. Convert as many colors as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "rgb-to-hex",
    name: "RGB to HEX Converter",
    tagline: "Convert RGB / RGBA to HEX with live preview and sliders.",
    description:
      "Type or slide RGB / RGBA values to instantly get HEX, HSL, HSLA and CMYK — with a live color preview, channel sliders and a built-in color picker. Free and private.",
    categoryId: "converters",
    icon: Paintbrush,
    status: "live",
    featured: true,
    keywords: [
      "rgb to hex",
      "rgba to hex",
      "rgb color converter",
      "rgb to hsl",
      "rgb to hex code",
      "color picker",
      "color converter",
      "convert rgb",
      "rgb to hex online",
      "rgba to hex code",
      "color value to hex",
      "hex from rgb",
      "css color converter",
      "color tool",
    ],
    seo: {
      title: "RGB to HEX Converter — RGBA, HSL & CMYK with Live Preview",
      description:
        "Convert RGB or RGBA values to HEX (and HSL, CMYK) with Toollyz RGB to HEX Converter. Live preview, channel sliders, a color picker and copy-ready outputs — 100% in your browser.",
      what:
        "An RGB to HEX Converter takes the RGB triplets used in code or design tools and produces the HEX code most commonly used in CSS and brand guidelines. Toollyz RGB to HEX Converter accepts a wide range of inputs — `rgb(99, 102, 241)`, `rgba(99, 102, 241, 0.5)`, plain `99, 102, 241`, space-separated `99 102 241`, or percentage values — and instantly shows the matching HEX with alpha (where applicable), along with HSL, HSLA, CMYK and a Tailwind-friendly arbitrary-value snippet. A live preview adjusts the background and chooses readable text automatically, and four channel sliders let you fine-tune R, G, B and alpha visually. Everything happens in your browser; nothing is uploaded.",
      how: [
        "Type or paste RGB values — `rgb(...)`, `rgba(...)` or comma/space separated.",
        "Watch the live preview update and the HEX appear at the top.",
        "Drag the R, G, B and Alpha sliders to fine-tune the color.",
        "Click any row in All formats to copy that value.",
      ],
      benefits: [
        "Flexible input — rgb(), rgba(), plain numbers, percentages and spaces.",
        "Live preview with automatic contrast text for readability.",
        "R, G, B and Alpha sliders for visual fine-tuning.",
        "Outputs HEX, HEX-with-alpha, RGB, RGBA, HSL, HSLA, CMYK and Tailwind arbitrary.",
        "Built-in color picker and named presets.",
        "Alpha channel preserved end-to-end (alpha → #RRGGBBAA).",
        "Clear error message when input can't be parsed.",
        "100% private — colors stay in your browser.",
      ],
      relatedSlugs: [
        "hex-to-rgb",
        "random-color-generator",
        "css-minifier",
        "html-minifier",
      ],
      faqs: [
        {
          q: "What input formats does it accept?",
          a: "Standard CSS rgb()/rgba(), plain comma-separated (`99, 102, 241`), space-separated (`99 102 241`), and percentages (`39%, 40%, 95%`). Alpha can be a decimal between 0 and 1 or a percentage.",
        },
        {
          q: "How does alpha map to HEX?",
          a: "Alpha 0–1 becomes a hex byte 00–FF appended to the color. So `rgba(99, 102, 241, 0.5)` becomes #6366F180 (the 80 is ~0.502 in 0–1 space).",
        },
        {
          q: "Should I include alpha in my HEX?",
          a: "Only when you actually need transparency. The tool shows both forms — six-digit HEX without alpha and eight-digit HEX with alpha — so you can pick whichever your stylesheet expects.",
        },
        {
          q: "What's a Tailwind arbitrary value?",
          a: "Tailwind lets you use any color via bracket syntax like `bg-[#6366F1]`. The tool generates this snippet for you so you can paste it straight into a className.",
        },
        {
          q: "Why does my color look slightly different in HSL?",
          a: "HSL is a perceptual model with rounded integer channels, so converting RGB → HSL → RGB rarely round-trips byte-for-byte. The HEX/RGB pair is exact; HSL is a close approximation.",
        },
        {
          q: "Can I use the channel sliders to find a nearby color?",
          a: "Yes — drag any slider to nudge R, G, B or alpha. The HEX, HSL and CMYK outputs all update in real time, so it's great for tweaking a brand color.",
        },
        {
          q: "Does it work with percentages?",
          a: "Yes. `rgb(39%, 40%, 95%)` parses correctly and gets converted to byte values internally.",
        },
        {
          q: "What's the difference between rgb() and rgba()?",
          a: "rgba() adds a fourth alpha channel. CSS now also accepts modern syntax like `rgb(99 102 241 / 0.5)` — the tool handles both.",
        },
        {
          q: "Is any data sent to a server?",
          a: "No. Toollyz has no server — parsing and conversion happen in your browser. Your last input is saved only in your device's local storage.",
        },
        {
          q: "Is this RGB to HEX converter free?",
          a: "Completely free with no signup. Convert as many colors as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    tagline: "Batch-convert JPG to lossless PNG in your browser.",
    description:
      "Drop one or many JPG files to convert them to lossless PNG with full transparency support — entirely in your browser, batch-friendly, one-click download. Free and private.",
    categoryId: "converters",
    icon: ImageIcon,
    status: "live",
    featured: true,
    keywords: [
      "jpg to png",
      "jpeg to png",
      "convert jpg to png",
      "jpg to png converter",
      "batch jpg to png",
      "image converter",
      "jpg to lossless png",
      "online image converter",
      "browser image converter",
      "transparent png from jpg",
      "jpg to png free",
      "convert image online",
      "png from jpeg",
      "image format converter",
    ],
    seo: {
      title: "JPG to PNG Converter — Batch, Lossless, In Your Browser",
      description:
        "Convert JPG to lossless PNG with Toollyz JPG to PNG Converter. Drag-drop batch conversion, per-file size comparison and one-click download — entirely in your browser, no uploads.",
      what:
        "A JPG to PNG Converter takes JPEG photos and re-encodes them as PNG — a lossless format that supports transparency and crisp edges. Toollyz JPG to PNG Converter runs entirely in your browser: drop one or many JPGs onto the page (up to 30 at a time) and each is decoded with the browser's native image pipeline, drawn to a canvas and exported as a PNG Blob. You can compare each file's original JPG size and new PNG size, download any single result, or grab everything at once. Because PNG is lossless and JPG is compressed, the PNG output is often larger than the input — that's expected and the price of editability, transparency and a clean alpha channel. No file ever leaves your browser.",
      how: [
        "Drag one or more JPG files onto the drop zone, or click Choose JPG files.",
        "Each file is decoded and re-encoded as PNG entirely in your browser.",
        "Review per-file size, dimensions and a thumbnail of the result.",
        "Click PNG to download a single file or Download all to grab the batch.",
      ],
      benefits: [
        "Drag-and-drop batch conversion — up to 30 files at a time.",
        "Per-file thumbnail, dimensions and before/after size.",
        "Visible delta (+/−%) so you can see if PNG is bigger or smaller.",
        "Lossless output suitable for editing, transparency and crisp graphics.",
        "One-click per-file download or Download all in one go.",
        "Handles large images using the browser's native decoder.",
        "Clear empty / error / done states for each file.",
        "100% private — files are decoded and saved locally, nothing uploaded.",
      ],
      relatedSlugs: [
        "png-to-webp",
        "html-minifier",
        "base64-encoder-decoder",
        "css-minifier",
      ],
      faqs: [
        {
          q: "Why convert JPG to PNG?",
          a: "PNG is lossless and supports transparency, so it's better for editing, screenshots, UI graphics and anywhere you need a clean alpha channel. JPG, in contrast, is compressed and discards detail.",
        },
        {
          q: "Will the converted PNG be smaller than the JPG?",
          a: "Usually not. JPG is lossy and very efficient for photos; PNG is lossless and bigger. You gain quality and transparency support, not file-size savings.",
        },
        {
          q: "Does the conversion lose any quality?",
          a: "PNG is lossless, so the conversion preserves every pixel the browser decoded from the JPG. You can't recover detail JPG already discarded, but you won't lose any more.",
        },
        {
          q: "Can I batch-convert many files at once?",
          a: "Yes — drop or pick up to 30 JPGs at a time. Each file converts independently and is available for download as soon as it finishes.",
        },
        {
          q: "Will it work on huge images?",
          a: "It uses your browser's native decoder and a canvas, which works for typical photos (tens of megapixels). On very tall/wide images, browsers have a maximum canvas size — if you hit that limit, the tool reports an error rather than corrupting the output.",
        },
        {
          q: "Will it preserve transparency?",
          a: "JPGs don't carry transparency (they're always fully opaque), so the converted PNGs will be opaque too. PNG transparency only matters if your source has an alpha channel.",
        },
        {
          q: "Does it strip EXIF metadata?",
          a: "Yes. The conversion re-encodes raw pixels through a canvas, so EXIF, GPS and other metadata are dropped — useful for privacy when sharing screenshots or photos.",
        },
        {
          q: "Are my files uploaded anywhere?",
          a: "No. Toollyz has no server — the conversion is entirely in your browser. Dropped files and converted PNGs never leave the page and are discarded when you reload or close the tab.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. Pick files from your camera roll or files app; the conversion works on mobile browsers just like on desktop.",
        },
        {
          q: "Is this JPG to PNG converter free?",
          a: "Completely free with no signup and no limits. Convert as many images as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "png-to-webp",
    name: "PNG to WebP Converter",
    tagline: "Batch-convert PNG (or JPG) to WebP with quality control.",
    description:
      "Drop PNG (or JPG) files to convert them to modern WebP with a quality slider, live size savings and one-click download — entirely in your browser. Free and private.",
    categoryId: "converters",
    icon: FileImage,
    status: "live",
    featured: true,
    keywords: [
      "png to webp",
      "convert png to webp",
      "webp converter",
      "image to webp",
      "optimize images",
      "compress png",
      "batch png to webp",
      "webp encoder",
      "jpg to webp",
      "image optimizer",
      "smaller images",
      "web performance images",
      "online webp converter",
      "image format converter",
    ],
    seo: {
      title: "PNG to WebP Converter — Batch with Quality Control",
      description:
        "Convert PNG (or JPG) to modern WebP with Toollyz PNG to WebP Converter. Quality slider, drag-drop batch, live size savings and one-click download — entirely in your browser.",
      what:
        "A PNG to WebP Converter re-encodes images into WebP — a modern format that produces dramatically smaller files than PNG at similar (or better) visual quality, supports transparency and is widely supported by browsers. Toollyz PNG to WebP Converter runs entirely in your browser: drop PNG or JPG files (up to 30 at a time), pick a quality from 20–100% with the slider, and each image is decoded with the browser's native pipeline, drawn to a canvas and exported as a WebP Blob. You'll see the original PNG size, the new WebP size and the percentage saved, and you can re-encode the whole queue with a new quality setting in one click. No file is ever uploaded.",
      how: [
        "Drop one or more PNG (or JPG) files onto the drop zone.",
        "Adjust the quality slider — 80–90% is a great default for photos.",
        "Review per-file savings, dimensions and thumbnails.",
        "Click WebP to download a single file, or Download all in one go.",
      ],
      benefits: [
        "Drag-and-drop batch conversion — up to 30 files at a time.",
        "Quality slider from 20% to 100% with a Re-encode all action.",
        "Per-file thumbnail, dimensions and before/after size with a savings delta.",
        "Aggregate savings across the batch shown at the top.",
        "Supports both PNG and JPG inputs.",
        "Strips EXIF and other metadata as a side effect — privacy bonus.",
        "Uses the browser's native WebP encoder so quality matches Chrome / Firefox / Edge / Safari.",
        "100% private — files are decoded and saved locally, nothing uploaded.",
      ],
      relatedSlugs: [
        "jpg-to-png",
        "html-minifier",
        "css-minifier",
        "base64-encoder-decoder",
      ],
      faqs: [
        {
          q: "Why convert PNG to WebP?",
          a: "WebP typically gives 25–35% smaller files than PNG (and 25–34% smaller than JPG for photos) at visually similar quality. Modern browsers all support it, so it's the easiest way to make pages load faster without losing quality.",
        },
        {
          q: "What does the quality slider do?",
          a: "WebP is a lossy format (with a lossless mode that's still smaller than PNG). The slider controls how much detail is preserved versus how small the file gets. 80–90% is usually indistinguishable from the original for photos.",
        },
        {
          q: "Will it preserve transparency?",
          a: "Yes — if your PNG has an alpha channel, the WebP output keeps it. Set the quality high (90%+) for transparent UI assets where edge fidelity matters.",
        },
        {
          q: "Why is my WebP not smaller than the PNG?",
          a: "Very small images (icons, tiny screenshots) sometimes encode larger as WebP because of overhead. Try a lower quality, or accept that for small assets PNG can be competitive.",
        },
        {
          q: "What's the difference between lossy and lossless WebP?",
          a: "Lossy WebP discards detail to shrink the file (controlled by the quality slider). Lossless WebP keeps every pixel and is still typically 25% smaller than PNG. Modern browsers handle both transparently.",
        },
        {
          q: "Do all browsers support WebP?",
          a: "Yes. Every modern desktop and mobile browser supports WebP. If you need to support very old browsers, keep a PNG fallback.",
        },
        {
          q: "Can I also convert JPG to WebP?",
          a: "Yes — drop a JPG and it converts the same way. WebP is usually significantly smaller than JPG at the same perceived quality.",
        },
        {
          q: "Does it strip EXIF metadata?",
          a: "Yes. The conversion re-encodes raw pixels through a canvas, so EXIF, GPS and other metadata are dropped — useful for privacy when sharing photos online.",
        },
        {
          q: "Are my files uploaded anywhere?",
          a: "No. Toollyz has no server — the conversion is entirely in your browser. Dropped files and converted WebPs never leave the page and are discarded when you reload.",
        },
        {
          q: "Is this PNG to WebP converter free?",
          a: "Completely free with no signup and no limits. Convert as many images as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    tagline: "Live rates between 160+ currencies, with caching and history.",
    description:
      "Convert between 160+ world currencies with live mid-market rates from public providers, a multi-currency snapshot table, smart caching and saved-conversions history. Free and private — no signup, no server.",
    categoryId: "converters",
    icon: Banknote,
    status: "live",
    featured: true,
    keywords: [
      "currency converter",
      "exchange rate",
      "forex",
      "live exchange rate",
      "usd to eur",
      "usd to inr",
      "eur to usd",
      "gbp to usd",
      "money converter",
      "fx converter",
      "real-time exchange rate",
      "free currency converter",
      "browser currency converter",
      "150 currencies",
    ],
    seo: {
      title: "Currency Converter — Live Rates for 160+ Currencies (Free)",
      description:
        "Convert any amount between 160+ world currencies with live mid-market rates from Open Exchange Rates and the European Central Bank. Multi-currency snapshot, saved conversions, smart caching — entirely in your browser.",
      what:
        "A Currency Converter takes an amount in one currency (the base) and returns the equivalent in another using a current exchange rate. Toollyz Currency Converter fetches live mid-market rates directly from your browser using a chain of free public providers: open.er-api.com (160+ currencies) with a fallback to api.frankfurter.app (the European Central Bank reference rates for 30 majors). Rates are cached in localStorage for 30 minutes per base currency so re-conversions are instant, with a Refresh button to force a fresh fetch. The hero animates between values, the result panel shows the unit rate (1 USD = X EUR) and the rate's age and provider, a Quick to row jumps between popular currencies, a multi-currency snapshot converts your amount into 9 popular currencies at once, and you can save individual conversions to a history list. Toollyz has no server — your browser talks directly to the providers, nothing passes through us.",
      how: [
        "Type or paste the amount, then pick the From and To currencies (use the swap button to flip them).",
        "The result, unit rate and rate timestamp update live; tap Refresh to bypass the 30-minute cache.",
        "Use Quick to or the multi-currency snapshot to jump between popular currencies in one click.",
        "Save useful conversions to the history list, copy the result string, or just keep scrolling.",
      ],
      benefits: [
        "Live mid-market rates from open.er-api.com with a European Central Bank fallback.",
        "Supports 160+ currencies with full names and flag emojis.",
        "Animated result with smart decimal precision (4 decimals for sub-unit values).",
        "Multi-currency snapshot — converts your amount into 9 popular currencies at once.",
        "Quick-pick row and one-click swap between From and To.",
        "Saved conversions history with timestamp and provider for each entry.",
        "30-minute localStorage cache so re-conversions are instant; Refresh forces a fresh fetch.",
        "100% browser-side — Toollyz has no server, no signup, no tracking.",
      ],
      relatedSlugs: [
        "ip-address-finder",
        "internet-speed-test",
        "calendar-generator",
        "hashtag-generator",
      ],
      faqs: [
        {
          q: "Where do the exchange rates come from?",
          a: "Your browser fetches them directly from public providers. The primary source is open.er-api.com (Open Exchange Rates' free tier with 160+ currencies); if that's unreachable, Toollyz falls back to api.frankfurter.app, which serves the European Central Bank's reference rates for 30 major currencies. Toollyz itself has no server in the chain.",
        },
        {
          q: "Are these the rates I'll actually get from my bank?",
          a: "No — these are mid-market reference rates, the midpoint between the buy and sell prices on currency markets. Banks, card networks and money-transfer apps charge a spread on top, so the rate you actually receive is typically 0.5–3% worse than the mid-market rate shown here.",
        },
        {
          q: "How often are rates updated?",
          a: "Providers refresh rates roughly hourly during weekdays (the ECB publishes once per business day). Toollyz caches each base currency for 30 minutes in your browser's localStorage so re-conversions are instant; the Refresh button bypasses the cache to fetch fresh data.",
        },
        {
          q: "Does it work offline?",
          a: "If you've used the converter recently, the last fetched rates are cached for 30 minutes and will keep working briefly while offline. New base currencies or rate refreshes need an internet connection.",
        },
        {
          q: "How many currencies are supported?",
          a: "When open.er-api.com responds, the converter exposes 160+ currencies including all G20 majors and most emerging-market currencies. With only the Frankfurter fallback you get 30 major currencies (USD, EUR, GBP, JPY, CHF, AUD, CAD, CNY, INR, BRL and 20 others).",
        },
        {
          q: "What currencies are in the multi-currency snapshot?",
          a: "USD, EUR, GBP, JPY, INR, AUD, CAD, CHF, CNY and BRL — the ten most-traded world currencies. The snapshot excludes whichever one you currently have selected as the From currency.",
        },
        {
          q: "Is my data sent to Toollyz?",
          a: "No. Toollyz has no server — your browser talks directly to open.er-api.com and api.frankfurter.app. Your conversion history and last-used currencies are stored only in your device's localStorage.",
        },
        {
          q: "Does it support historical rates?",
          a: "Not currently — Toollyz Currency Converter focuses on live mid-market rates. The underlying providers do support historical lookups, so historical support may land in a future update.",
        },
        {
          q: "Why does the result animate between values?",
          a: "The hero uses an eased count-up animation so changing the amount or currency feels responsive. The animation respects your OS reduced-motion preference and pauses when the tab is hidden.",
        },
        {
          q: "Is this Currency Converter free?",
          a: "Completely free with no signup and no limits. Convert as many amounts as you like — privately in your browser.",
        },
      ],
    },
  },

  // ─── SEO ─────────────────────────────────────────────────────────────────
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    tagline: "Open Graph, Twitter and SEO meta with live previews.",
    description:
      "Generate a complete `<head>` snippet — title, description, robots, Open Graph, Twitter Card, canonical and theme color — with live Google, Facebook and Twitter previews and an SEO check. Free and private.",
    categoryId: "seo",
    icon: Tags,
    status: "live",
    featured: true,
    keywords: [
      "meta tag generator",
      "open graph generator",
      "og tag generator",
      "twitter card generator",
      "social meta tags",
      "seo meta tags",
      "html head generator",
      "canonical url tag",
      "facebook preview generator",
      "twitter preview generator",
      "site preview generator",
      "html title and description",
      "og image meta",
      "page meta builder",
    ],
    seo: {
      title: "Meta Tag Generator — Open Graph, Twitter & SEO Tags Online",
      description:
        "Build SEO-friendly meta tags with Toollyz Meta Tag Generator. Live Google, Facebook and Twitter previews, Open Graph & Twitter Card support, SEO checklist and one-click copy — entirely in your browser.",
      what:
        "A Meta Tag Generator builds the contents of your HTML `<head>` from a structured form: page title, meta description, Open Graph tags (og:title, og:description, og:image, og:url, og:type, og:locale, og:site_name), Twitter Card tags (twitter:card, twitter:site, twitter:creator, twitter:title, twitter:description, twitter:image), canonical link, robots directive, theme color, charset, viewport and favicon. Toollyz Meta Tag Generator updates the output in real time, shows accurate Google SERP, Facebook/LinkedIn and Twitter/X preview cards as you type, and runs lightweight SEO checks — title/description length, missing og:image, malformed URLs, @-prefixed Twitter handles — to produce a 0–100 score. Copy the snippet straight into your page, download it as `head.html`, or refine it until every issue is gone. Nothing leaves your browser; your draft is saved locally so a refresh never wipes your work.",
      how: [
        "Fill out the Basic, Open Graph, Twitter and Advanced tabs — the previews update live.",
        "Watch the title and description length bars stay inside the green band (50–60 and 150–160 chars).",
        "Add an og:image URL (1200×630) so links shared on Facebook, LinkedIn and Slack render as rich cards.",
        "Resolve the issues in the SEO checklist, then Copy or Download the generated `<head>` snippet.",
      ],
      benefits: [
        "Live Google SERP, Facebook/LinkedIn and Twitter/X preview cards as you type.",
        "Full Open Graph and Twitter Card support, with smart fallbacks to the base title/description/image.",
        "Title and description length bars matched to Google's truncation thresholds.",
        "SEO checklist with errors, warnings and a 0–100 score — no guesswork.",
        "Standards-conformant HTML output, ready to paste into any framework.",
        "One-click Copy or Download as `head.html` for handing off to a developer.",
        "Saves your draft to localStorage — refresh-safe, no signup, no cloud.",
        "100% private — every tag is generated in your browser, nothing uploaded.",
      ],
      relatedSlugs: [
        "slugify",
        "robots-txt-generator",
        "url-shortener",
        "json-formatter",
      ],
      faqs: [
        {
          q: "What are meta tags?",
          a: "Meta tags are HTML elements in the `<head>` of a page that describe it to search engines, social networks and browsers. The most important ones are the page title and meta description, plus Open Graph and Twitter Card tags that control how the page looks when shared on social media.",
        },
        {
          q: "How long should my title and description be?",
          a: "Aim for a title of 50–60 characters and a description of 150–160 characters. Beyond those lengths, Google may truncate them with an ellipsis in search results. The length bars in this tool match those thresholds exactly.",
        },
        {
          q: "What is Open Graph?",
          a: "Open Graph is a protocol started by Facebook that lets you control how your link looks when shared — title, description, image, type, locale and site name. LinkedIn, Slack, WhatsApp, Discord and many others honor it too, which is why og:image is so high-impact.",
        },
        {
          q: "What is a Twitter Card?",
          a: "Twitter Cards are Twitter/X's equivalent of Open Graph. `summary_large_image` is the big-image card you usually want; `summary` is the small-thumbnail fallback. If you don't set Twitter-specific tags, Twitter falls back to Open Graph automatically.",
        },
        {
          q: "What size should my og:image be?",
          a: "Use 1200×630 pixels (a 1.91:1 aspect ratio) as a PNG or JPG under ~5 MB. Facebook, LinkedIn, Slack and Twitter all crop to that ratio, so anything else risks awkward cropping. Make sure key text and logos stay inside the safe area.",
        },
        {
          q: "Do I need a canonical URL?",
          a: "Yes — setting `<link rel=\"canonical\">` to the preferred version of the page tells search engines which URL to index when the same content is reachable via multiple paths (www/non-www, with/without trailing slash, tracking parameters). It avoids duplicate-content issues.",
        },
        {
          q: "What does the SEO score mean?",
          a: "It's a 0–100 health check based on title and description length, Open Graph image presence, canonical URL, Twitter handle format and viewport/charset declarations. Errors weigh more than warnings. It's a guide, not a guarantee — but a 100 score means your meta tags are well-formed and complete.",
        },
        {
          q: "Are my tags or text uploaded anywhere?",
          a: "No. Every tag is generated entirely in your browser. The form is saved to localStorage so a refresh doesn't lose your work, but nothing is sent to Toollyz or any other server.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The form, previews and output panel are fully responsive and touch-friendly. You can build a complete `<head>` snippet on a phone or tablet.",
        },
        {
          q: "Is this Meta Tag Generator free?",
          a: "Completely free with no signup and no limits. Generate, preview and download as many `<head>` snippets as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    tagline: "Visual rule blocks, AI-bot presets and a live path tester.",
    description:
      "Build a standards-conformant robots.txt with multiple User-agent blocks, sitemap URLs, AI-crawler blocking presets and a live path tester. Free, private, generated entirely in your browser.",
    categoryId: "seo",
    icon: Bot,
    status: "live",
    featured: true,
    keywords: [
      "robots.txt generator",
      "robots.txt builder",
      "robots.txt online",
      "crawler rules",
      "user-agent rules",
      "sitemap meta",
      "block gptbot",
      "block claude",
      "block ai crawlers",
      "disallow seo",
      "wordpress robots",
      "next.js robots",
      "robots.txt tester",
      "robots tester",
    ],
    seo: {
      title: "Robots.txt Generator — Visual Rules, AI-Bot Presets, Live Tester",
      description:
        "Generate a complete robots.txt with Toollyz Robots.txt Generator. Visual rule blocks, presets for WordPress, Next.js and blocking AI crawlers (GPTBot, ClaudeBot, Google-Extended), sitemap support and a live path tester — entirely in your browser.",
      what:
        "A robots.txt Generator is a tool that builds a /robots.txt file from a structured editor instead of hand-edited text. Toollyz Robots.txt Generator models your file as a list of rule blocks — each with one or more User-agent lines, Allow/Disallow paths and an optional Crawl-delay — plus a flat list of Sitemap URLs at the bottom. It ships with one-click presets (Allow everything, Disallow everything, WordPress, Next.js App Router, Shopify, generic e-commerce, and a Block all AI crawlers preset that adds GPTBot, ChatGPT-User, OAI-SearchBot, anthropic-ai, ClaudeBot, Google-Extended, PerplexityBot, CCBot, Bytespider and more) and an integrated path tester that uses Google's longest-match rule to tell you exactly which Allow or Disallow line decides a given URL for a given agent. The output is rendered in real time, validated for common mistakes (paths that don't start with /, sitemap URLs that aren't absolute) and ready to copy or download as robots.txt — generated entirely in your browser.",
      how: [
        "Pick a preset (or start from scratch) and edit User-agent, Allow and Disallow lines per block.",
        "Add sitemap URLs at the bottom — one absolute URL per line.",
        "Use the path tester to verify a real URL against a real bot (Googlebot, Bingbot, GPTBot, …).",
        "Copy the generated robots.txt or download it and upload to the root of your domain.",
      ],
      benefits: [
        "Visual rule-block editor — no manual `User-agent:` / `Disallow:` formatting.",
        "One-click presets for WordPress, Next.js, Shopify, e-commerce, allow-all and disallow-all.",
        "Block AI crawlers preset covers 19 known LLM/training agents in a single click.",
        "Live path tester using the official longest-match rule honored by Google and Bing.",
        "Sitemap section with absolute-URL validation.",
        "Real-time validation for paths, agents, crawl-delay range and empty blocks.",
        "One-click Copy or Download as robots.txt — ready to deploy.",
        "100% private — generated in your browser, draft saved to localStorage.",
      ],
      relatedSlugs: [
        "meta-tag-generator",
        "url-shortener",
        "slugify",
        "dns-lookup",
      ],
      faqs: [
        {
          q: "What is a robots.txt file?",
          a: "robots.txt is a plain-text file at the root of your domain (e.g. https://example.com/robots.txt) that tells well-behaved web crawlers which URLs they may or may not request. It uses a simple User-agent / Disallow / Allow grammar standardized by Google and Bing.",
        },
        {
          q: "Where do I upload the file?",
          a: "Place it at the root of your domain so a request to /robots.txt returns it. On most hosts that means uploading it to /public, /static or the document root; on Next.js you can put it at app/robots.ts or public/robots.txt. It must be reachable over HTTPS without redirects.",
        },
        {
          q: "Does robots.txt actually stop a page from being indexed?",
          a: "Not directly. robots.txt only stops crawling — it tells bots not to fetch the URL. If other sites link to a disallowed URL, Google may still index it as a link with no snippet. To completely de-index, use a noindex meta tag (or X-Robots-Tag header) on an allowed page.",
        },
        {
          q: "How do I block AI crawlers like GPTBot or ClaudeBot?",
          a: "Use the “Block AI crawlers” preset — it adds a block listing GPTBot, ChatGPT-User, OAI-SearchBot, anthropic-ai, ClaudeBot, Google-Extended, PerplexityBot, CCBot, FacebookBot, Bytespider, Amazonbot and others, all with Disallow: /. You can edit the list to add or remove agents as new ones appear.",
        },
        {
          q: "Why is there an Allow rule? Doesn't Disallow do the work?",
          a: "Allow lets you carve exceptions out of broader Disallow rules. For example, WordPress sites commonly disallow /wp-admin/ but allow /wp-admin/admin-ajax.php, because that endpoint is needed by some plugins on the public site.",
        },
        {
          q: "What does the path tester do?",
          a: "It applies your rules to a given URL path for a given User-agent using the same longest-match algorithm Google and Bing use. It tells you whether the URL is Allowed or Disallowed and which exact rule decided it — handy for debugging tricky cases before you ship.",
        },
        {
          q: "What about Crawl-delay?",
          a: "Crawl-delay is honored by Bing, Yahoo Slurp and Yandex; Google ignores it. To rate-limit Googlebot, use Google Search Console's crawl-rate setting instead.",
        },
        {
          q: "Should I list my sitemap in robots.txt?",
          a: "Yes — both Google and Bing recommend listing one or more Sitemap: URLs in robots.txt as a backup discovery mechanism in addition to submitting sitemaps in their respective Search Consoles.",
        },
        {
          q: "Is my data sent anywhere?",
          a: "No. The generator runs entirely in your browser. Your draft is saved in localStorage so a refresh doesn't lose work, but nothing is uploaded to Toollyz or anywhere else.",
        },
        {
          q: "Is this Robots.txt Generator free?",
          a: "Completely free with no signup and no limits. Build, test and download as many robots.txt files as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    tagline: "Free short links via TinyURL or is.gd — with optional alias.",
    description:
      "Shorten long URLs with public services (TinyURL with is.gd fallback). Optional custom alias, one-click copy, savings stats and a local history of your recent short links. Free, private, no signup.",
    categoryId: "seo",
    icon: LinkIcon,
    status: "live",
    featured: true,
    keywords: [
      "url shortener",
      "short link generator",
      "tinyurl",
      "is.gd",
      "shorten url",
      "shorten link",
      "custom alias short link",
      "free url shortener",
      "no signup url shortener",
      "link shortener",
      "free short link",
      "shorten long link",
      "tweet link shortener",
      "marketing short link",
    ],
    seo: {
      title: "URL Shortener — Free Short Links via TinyURL & is.gd",
      description:
        "Shorten any URL with Toollyz URL Shortener. Optional custom alias, smart fallback between TinyURL and is.gd, copy-savings stats and local history — entirely in your browser, no signup, no tracking.",
      what:
        "A URL shortener takes a long URL and gives you a much shorter one that redirects to it — ideal for tweets, slides, signage, QR codes and SMS. Toollyz is a static site with no backend of its own, so the actual short link is minted by public providers your browser talks to directly: TinyURL (tinyurl.com/api-create.php) and is.gd (is.gd/create.php). Pick one explicitly or use Auto mode, which tries TinyURL first and falls back to is.gd. Both providers support an optional custom alias (3–30 characters, letters/numbers/hyphen/underscore) — the form validates the alias locally before the request and shows the provider's error if the alias is already taken. Each result shows the original URL, the short URL, characters saved and the provider host. Recent links are kept in localStorage so you can re-copy them, but they're never uploaded to Toollyz. Toollyz has no server in the chain.",
      how: [
        "Paste a long https:// URL into the input — the form auto-prefixes https:// if you forget.",
        "(Optional) type a custom alias and pick a provider, or leave Auto to fall back automatically.",
        "Click Shorten — the result appears in the hero with the savings count and provider tag.",
        "Copy the short link, open it in a new tab, or pick another from the recent-links history.",
      ],
      benefits: [
        "Two reputable public providers (TinyURL + is.gd) with automatic failover.",
        "Optional custom alias with local validation so you don't waste a round-trip.",
        "Per-link savings stats (original length, short length, characters saved).",
        "Recent-links history saved in localStorage — never uploaded to Toollyz.",
        "URL auto-prefixing — paste example.com and the tool adds https:// for you.",
        "Honest error messages from the underlying provider if an alias is taken or the URL is rejected.",
        "Offline detection + clear error states.",
        "100% private — Toollyz has no server, your browser talks directly to the providers.",
      ],
      relatedSlugs: [
        "meta-tag-generator",
        "robots-txt-generator",
        "qr-code-generator",
        "slugify",
      ],
      faqs: [
        {
          q: "How does Toollyz shorten links without a server?",
          a: "Toollyz is a static site — every page runs in your browser. Your browser POSTs the long URL directly to TinyURL (tinyurl.com/api-create.php) or is.gd (is.gd/create.php); whatever short link those services return is the link you see. Toollyz never sees the URL.",
        },
        {
          q: "Which provider should I pick?",
          a: "Auto mode (the default) tries TinyURL first and falls back to is.gd if TinyURL is unreachable or rejects the request. If you want a stable host for branding — tinyurl.com vs is.gd — pick the provider explicitly instead.",
        },
        {
          q: "Can I use a custom alias?",
          a: "Yes. Add a 3–30 character alias (letters, numbers, hyphens and underscores). Aliases aren't reserved by anyone, so the request can fail if someone else already claimed the alias on that provider — you'll see the provider's exact error in that case.",
        },
        {
          q: "Are these links permanent?",
          a: "TinyURL and is.gd have been around for years and both treat links as effectively permanent, but neither makes a written guarantee. For mission-critical links, also save the original URL somewhere — Toollyz keeps it in your local history.",
        },
        {
          q: "Can I track clicks?",
          a: "Not from this tool. is.gd lets you append `+` to any short link to see a basic stats page; TinyURL offers stats only on paid plans. For real campaign tracking, build UTM-tagged URLs first (the UTM Link Generator is coming soon) and then shorten the long version.",
        },
        {
          q: "Is shortening a URL safe?",
          a: "Shortened links hide the destination, so be wary of clicking unknown short links. The tool is safe to use, but never shorten URLs that contain passwords, tokens or other sensitive data — short links are public by nature and can be guessed or shared.",
        },
        {
          q: "Where is my history stored?",
          a: "Only in your browser, in localStorage. Up to 30 recent short links with their original URLs, providers and timestamps — purely client-side. Clearing your browser data wipes the history; Toollyz can't recover it.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The input, provider picker, copy buttons and history list are all responsive and touch-friendly. The Enter key submits, and tapping a short link opens it in a new tab.",
        },
        {
          q: "Why does the URL get https:// added?",
          a: "TinyURL and is.gd reject URLs without a scheme. If you paste example.com, the tool prefixes https:// automatically. If you specifically need http://, paste it with the scheme already in place.",
        },
        {
          q: "Is this URL Shortener free?",
          a: "Completely free with no signup and no limits. The underlying TinyURL and is.gd APIs are free too. Shorten as many URLs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "utm-link-generator",
    name: "UTM Link Generator",
    tagline: "Build UTM-tagged URLs with 16 platform presets and a checklist.",
    description:
      "Generate UTM-tagged URLs for Google Analytics, GA4 and any analytics tool. 16 platform presets (Google Ads, Meta, LinkedIn, X, TikTok, email, podcast, QR), live validation, history and instant shorten-link handoff. Free, private, no server.",
    categoryId: "seo",
    icon: BarChart3,
    status: "live",
    featured: true,
    keywords: [
      "utm link generator",
      "utm builder",
      "campaign url builder",
      "google analytics utm",
      "ga4 utm",
      "utm parameters",
      "marketing campaign tracking",
      "utm source",
      "utm medium",
      "utm campaign",
      "utm content",
      "utm term",
      "utm id",
      "campaign tracking",
    ],
    seo: {
      title: "UTM Link Generator — Free Campaign URL Builder with Presets",
      description:
        "Build UTM-tagged URLs for Google Analytics and GA4 with Toollyz UTM Link Generator. 16 platform presets, live validation, save-to-history and direct shorten-link handoff — entirely in your browser.",
      what:
        "A UTM Link Generator builds the campaign-tracked URLs marketers paste into ads, emails, QR codes, podcast show notes and partner links. The five (now six in GA4) `utm_*` query parameters — `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` and `utm_id` — tell analytics tools where a click came from so the resulting session is grouped under the right campaign. Toollyz UTM Link Generator merges those parameters onto your base URL with full WHATWG `URL` percent-encoding (so existing query strings and hash fragments are preserved), supports 16 one-click platform presets that pre-fill the canonical source + medium (google/cpc, facebook/cpc, instagram/cpc, linkedin/cpc, x/cpc, tiktok/cpc, youtube/cpc, reddit/cpc, newsletter/email, lifecycle/email, blog/referral, pr/referral, qr/offline, podcast/audio, partner/affiliate and Google organic), runs a live validation checklist (missing required params, unsafe characters, suspiciously long campaign names) and offers two normalization toggles for consistency: lowercase parameter values and convert spaces to underscores. Save useful URLs to a 30-entry localStorage history, copy with one click, or hand the result off to the Toollyz URL Shortener for a clean, shareable short link. Nothing is uploaded; the form is saved to localStorage so a refresh never wipes your draft.",
      how: [
        "Paste your destination URL into Base URL — the form auto-adds https:// if you forget.",
        "Click a platform preset to pre-fill utm_source + utm_medium, then fill in the campaign name and any optional params.",
        "Watch the live URL preview and the validation checklist — green means ready to ship.",
        "Copy the link, save it to history, or hand it off to the URL Shortener for a tinyurl.com / is.gd short link.",
      ],
      benefits: [
        "16 platform presets cover every major paid and organic channel.",
        "Full GA4-compatible parameters including `utm_id` for cross-system attribution.",
        "Strict WHATWG URL building — existing query strings and hash fragments are preserved.",
        "Optional lowercase + spaces-to-underscores normalization for consistent reporting.",
        "Live checklist: missing required params, unsafe characters, oversized campaign names.",
        "Save-to-history: 30 most recent UTM URLs in localStorage, tagged with source / medium / campaign.",
        "One-click handoff to the Toollyz URL Shortener.",
        "100% private — built in your browser, draft saved locally, no signup or tracking.",
      ],
      relatedSlugs: [
        "url-shortener",
        "meta-tag-generator",
        "qr-code-generator",
        "slugify",
      ],
      faqs: [
        {
          q: "What are UTM parameters?",
          a: "UTM parameters (named after the long-retired Urchin Tracking Module) are five — now six in GA4 — query-string keys you append to a URL: utm_source, utm_medium, utm_campaign, utm_term, utm_content and utm_id. Analytics tools read them on landing to attribute the session to a specific marketing source, channel and campaign.",
        },
        {
          q: "Which UTM parameters are required?",
          a: "Most analytics tools (including GA4) need at least utm_source and utm_medium to recognize a session as a campaign visit. utm_campaign is strongly recommended for grouping. utm_term, utm_content and utm_id are optional but powerful — use utm_term for paid keywords, utm_content to distinguish ad variants and utm_id (GA4-specific) to tie URLs to a campaign in your ad platform.",
        },
        {
          q: "What does a platform preset do?",
          a: "It pre-fills utm_source and utm_medium with the canonical values used in the industry — e.g. Google Ads → google/cpc, Facebook Ads → facebook/cpc, email newsletter → newsletter/email. You still write the campaign name, content and term yourself; the preset just stops you from accidentally typing 'Google' vs 'google' across campaigns.",
        },
        {
          q: "Why does the tool lowercase and replace spaces?",
          a: "Most analytics tools treat 'Summer Launch' and 'summer_launch' as different campaigns, which fragments your reports. The default normalization keeps you consistent. Both toggles are optional — turn them off if you have a different convention.",
        },
        {
          q: "Will it break existing query strings on my URL?",
          a: "No. The tool uses the browser's WHATWG URL API to merge utm_* params onto your base URL, which preserves any existing query string and hash fragment. Existing keys are kept as-is; only utm_* keys are overwritten (and only if you set them).",
        },
        {
          q: "Does it support GA4's utm_id?",
          a: "Yes. utm_id is a first-class field — it's the GA4-specific parameter that ties a URL to a campaign object inside Google Analytics for cross-platform attribution. Leave it blank if you don't use GA4.",
        },
        {
          q: "Can I shorten the resulting URL?",
          a: "Yes — click the Shorten this link button to hand it off to the Toollyz URL Shortener, which talks directly to TinyURL or is.gd from your browser. UTM parameters survive shortening; they live on the destination URL once the redirect happens.",
        },
        {
          q: "Where is my data stored?",
          a: "Only in your browser, in localStorage. The form (so a refresh doesn't wipe your draft) and up to 30 recent UTM URLs. Toollyz has no server, so nothing is uploaded.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The form, presets, checklist and history list are fully responsive and touch-friendly.",
        },
        {
          q: "Is this UTM Link Generator free?",
          a: "Completely free with no signup and no limits. Build as many campaign URLs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "whois-lookup",
    name: "WHOIS Domain Lookup",
    tagline: "Modern RDAP lookup — registrar, dates, nameservers and DNSSEC.",
    description:
      "Look up any domain using RDAP (the modern IETF standard that replaces WHOIS). See registrar, registration / expiration dates, nameservers, DNSSEC and statuses — fetched directly from the registry by your browser.",
    categoryId: "seo",
    icon: SearchCheck,
    status: "live",
    featured: true,
    keywords: [
      "whois lookup",
      "domain lookup",
      "domain owner",
      "rdap",
      "domain registrar lookup",
      "domain expiration check",
      "domain age",
      "dnssec check",
      "nameserver lookup",
      "iana rdap",
      "whois alternative",
      "domain info",
      "who owns this domain",
      "free whois",
    ],
    seo: {
      title: "WHOIS Domain Lookup — Modern RDAP Lookup (Free, In Browser)",
      description:
        "Check who owns any domain, when it expires and where it's hosted. Toollyz WHOIS Domain Lookup uses RDAP — the modern standard that replaces WHOIS — fetched directly from the IANA bootstrap and the registry, with no Toollyz server in the chain.",
      what:
        "WHOIS is the traditional plain-text protocol (port 43) that lets you ask a domain registry who owns a given domain, when it was registered, when it expires and which nameservers it uses. Browsers can't speak port 43, so the IETF standardized RDAP (Registration Data Access Protocol) — the modern HTTP+JSON replacement for WHOIS that the major registries (Verisign, Identity Digital, Nominet, Public Interest Registry, etc.) all run today. Toollyz WHOIS Domain Lookup makes RDAP usable from a static website: your browser first fetches the IANA RDAP bootstrap file (a small JSON index of which RDAP server handles each TLD, cached locally for 24 hours), then sends your query directly to the correct registry server. The structured response is parsed into a tidy view — domain age, expiration countdown (red when under 30 days), registrar, registrant, admin/tech/abuse contacts (where disclosed), the full status list, DNSSEC delegation state and every nameserver with its IPv4/IPv6 glue. Some ccTLDs (.de, .fr, .uk, .ru) still rely on traditional WHOIS or block cross-origin browser requests; those failures surface with a clear, honest message. Toollyz never sees your query.",
      how: [
        "Type a domain (with or without scheme) and press Enter or click Lookup.",
        "Your browser pulls the IANA RDAP bootstrap once, picks the right registry server, then queries it directly.",
        "Inspect registration / expiration dates, the registrar, contacts, statuses, DNSSEC and nameservers with glue IPs.",
        "Copy the full RDAP JSON for the response if you need raw data — last domain is remembered locally.",
      ],
      benefits: [
        "Uses RDAP, the modern IETF replacement for WHOIS — same data, structured JSON, CORS-friendly.",
        "Pulls the IANA RDAP bootstrap so the correct registry is queried for any TLD — no hardcoded lists.",
        "Honest, distinct error states for input errors, missing RDAP server, CORS blocks, timeouts and NXDOMAIN.",
        "Surfaces age in days, expiry countdown (red <30 days), DNSSEC delegation state and full status flags.",
        "Parses registrar, registrant, admin/tech/abuse contacts from RDAP entities + vCards.",
        "Shows every nameserver with IPv4/IPv6 glue and a one-click Copy JSON of the full response.",
        "24-hour localStorage cache for the bootstrap so subsequent lookups are fast.",
        "100% browser-side — Toollyz has no server in the chain, ever.",
      ],
      relatedSlugs: [
        "dns-lookup",
        "ip-address-finder",
        "ping-test",
        "url-shortener",
      ],
      faqs: [
        {
          q: "What is RDAP and how is it different from WHOIS?",
          a: "RDAP (Registration Data Access Protocol) is the IETF-standardized HTTP+JSON replacement for the old port-43 WHOIS protocol. The data is identical — registrar, registrant, dates, nameservers, statuses — but RDAP is structured (no text-parsing), authenticated (HTTPS) and CORS-friendly, which is the only way a static site can query it directly from your browser.",
        },
        {
          q: "How does Toollyz query RDAP without a server?",
          a: "Your browser first fetches the IANA RDAP bootstrap (data.iana.org/rdap/dns.json), a tiny static JSON file that maps each TLD to its RDAP server. Toollyz caches that bootstrap for 24 hours, then sends your domain query straight to the correct registry's RDAP endpoint over HTTPS.",
        },
        {
          q: "Why is the registrant blank or redacted?",
          a: "Since GDPR (2018) and similar laws around the world, most registries redact registrant names, emails and phone numbers from public RDAP/WHOIS responses by default. That's a registry policy, not a Toollyz limitation. Some registries expose contacts behind an authenticated API for legitimate requesters.",
        },
        {
          q: "Why did my .de / .fr / .uk lookup fail?",
          a: "Some ccTLDs (.de, .fr, .uk, .ru, .nl, …) still use port-43 WHOIS or run an RDAP server that doesn't enable CORS for browsers. Toollyz surfaces a clear error so you know whether to try the registry's own website or a server-side WHOIS tool.",
        },
        {
          q: "What does the expiration countdown mean?",
          a: "It's the number of days from today until the registry's expiration date. Toollyz turns the number red when it's under 30 days — domains that lapse usually enter a 30-day grace + 30-day redemption period before being deleted, so red means it's time to act.",
        },
        {
          q: "What does DNSSEC signed mean?",
          a: "DNSSEC (DNS Security Extensions) cryptographically signs DNS responses so resolvers can verify they haven't been tampered with. A DNSSEC-signed domain is harder to hijack via cache poisoning. RDAP reports whether the parent zone holds a signed delegation for the domain.",
        },
        {
          q: "Can I look up an IP or an ASN?",
          a: "Not yet. This tool focuses on domain RDAP. IP and ASN RDAP are also IETF-standard and may land in a future update; today, Toollyz IP Address Finder gives you the high-level WHOIS-style ISP/AS info for an IP.",
        },
        {
          q: "Is my query stored anywhere?",
          a: "No. Toollyz has no server — the query goes from your browser straight to IANA and the registry. Only the last domain you typed is saved in localStorage so you don't lose it on refresh.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The search bar, hero, contact cards and nameserver list are fully responsive and touch-friendly.",
        },
        {
          q: "Is this WHOIS Domain Lookup free?",
          a: "Completely free with no signup and no limits. Look up as many domains as the registry servers will allow you to (most are quite generous for casual use).",
        },
      ],
    },
  },

  // ─── IMAGE ───────────────────────────────────────────────────────────────
  {
    slug: "color-picker",
    name: "Color Picker",
    tagline: "9 color formats, WCAG contrast, harmonies and an eyedropper.",
    description:
      "Interactive color picker with HEX, RGB, RGBA, HSL, HSLA, HSV, HWB, OKLCH and CMYK output, live WCAG contrast checks, tints/shades/complementary harmonies, an EyeDropper API integration and saved palettes — entirely in your browser.",
    categoryId: "image",
    icon: Palette,
    status: "live",
    featured: true,
    keywords: [
      "color picker",
      "hex color picker",
      "rgb to hsl",
      "oklch color picker",
      "wcag contrast checker",
      "color converter",
      "color harmonies",
      "complementary colors",
      "tints and shades",
      "eyedropper",
      "design color tool",
      "color palette",
      "hwb color",
      "css colors",
    ],
    seo: {
      title: "Color Picker — 9 Formats, WCAG Contrast & Harmonies (Free)",
      description:
        "Pick any color and convert it to HEX, RGB, RGBA, HSL, HSLA, HSV, HWB, OKLCH or CMYK. Live WCAG contrast checker, tints / shades / complementary harmonies, EyeDropper, favorites and recent history — entirely in your browser.",
      what:
        "A color picker lets you pick or type a color and read it back in every format your design system needs. Toollyz Color Picker outputs nine formats in real time — HEX, RGB, RGBA, HSL, HSLA, HSV, HWB, OKLCH and CMYK — and gives you a native browser color input, draggable HSL and RGB sliders, an alpha slider, a one-click random color, ten preset palette swatches, and the modern Chromium EyeDropper API (where available) to pick any color from anywhere on your screen. A live WCAG contrast section compares your color against a compare color (white, black, Toollyz dark or any custom HEX) and grades the ratio against AA Large / AA Normal / AAA Normal thresholds with foreground-on-background and background-on-foreground preview swatches. A harmonies panel auto-generates three tints, three shades, the complementary, two triadic and two analogous companions — click any chip to make it the new active color. Favorites and 18-item recent history persist in localStorage. Nothing leaves your browser.",
      how: [
        "Drag the native color picker, type a HEX, or hit Random — every format updates instantly.",
        "Fine-tune with the HSL or RGB sliders, then drop the alpha slider for transparent variants.",
        "Check WCAG contrast against white, black, Toollyz dark or any custom color — and read the AA / AAA grades.",
        "Pin colors to Favorites, click a harmony chip to navigate, or use EyeDropper to pick from your screen.",
      ],
      benefits: [
        "9 output formats: HEX, RGB, RGBA, HSL, HSLA, HSV, HWB, OKLCH and CMYK.",
        "Live alpha channel propagates to RGBA, HSLA, HWB and OKLCH.",
        "WCAG 2.1 contrast ratio with AA Large / AA Normal / AAA Normal grading and preview swatches.",
        "Tints, shades, complementary, triadic and analogous harmonies — clickable to set the active color.",
        "EyeDropper API support on Chromium browsers (Chrome, Edge, Brave, Opera).",
        "10 curated preset swatches and one-click Random.",
        "Favorites palette (up to 24) and 18-item recent history saved to localStorage.",
        "100% private — Toollyz has no backend, no signup, no tracking.",
      ],
      relatedSlugs: [
        "hex-to-rgb",
        "rgb-to-hex",
        "fancy-text-generator",
        "meta-tag-generator",
      ],
      faqs: [
        {
          q: "What is OKLCH and why should I use it?",
          a: "OKLCH is a modern color space (Lightness · Chroma · Hue) based on Björn Ottosson's OKLab. It's perceptually uniform — meaning equal numeric steps look equally different to the eye — so OKLCH gradients, palettes and lightness ramps look more natural than HSL ones. CSS Color Level 4 supports it natively (color: oklch(60% 0.2 250)).",
        },
        {
          q: "What's the difference between HSL, HSV and HWB?",
          a: "All three are cylindrical color spaces with the same hue axis. HSL uses Saturation + Lightness; HSV (also called HSB) uses Saturation + Value; HWB uses Whiteness + Blackness. HSL is the most common in CSS; HSV/HSB matches what most design tools show; HWB is intuitive for tinting/shading by mixing in white or black.",
        },
        {
          q: "What does the WCAG contrast ratio mean?",
          a: "It's the ratio between the relative luminances of two colors, defined in WCAG 2.1. To pass AA for normal body text you need ≥ 4.5:1; AAA needs ≥ 7:1. Large text (18pt or 14pt bold) only needs ≥ 3:1 for AA. The number above reflects the standard sRGB luminance formula.",
        },
        {
          q: "Does the Eyedropper actually work?",
          a: "Yes, when your browser supports the EyeDropper API — that's Chrome, Edge, Brave, Opera and other Chromium browsers as of 2022+. Firefox and Safari don't ship the API yet; in those browsers the Eyedropper button is hidden and a note explains why.",
        },
        {
          q: "Can I copy any of the formats?",
          a: "Yes — every row in the Formats panel has a copy button. Plus the hero swatch has a one-tap HEX copy at the top.",
        },
        {
          q: "How do tints, shades and harmonies work?",
          a: "Tints add lightness in 10/20/30% steps; shades subtract lightness. Complementary rotates the HSL hue by 180°; triadic by 120°/240°; analogous by ±30°. Click any chip to make it the new active color — perfect for exploring palette directions.",
        },
        {
          q: "Are my favorites saved?",
          a: "Yes, in your browser's localStorage. Toollyz has no backend, so they live only on your device. Up to 24 favorites and 18 recent colors are tracked.",
        },
        {
          q: "What's CMYK for?",
          a: "CMYK (Cyan, Magenta, Yellow, Key/Black) is the subtractive color model used in print. The tool shows a screen-approximation conversion — for accurate print output, use your printer's ICC profile and let your DTP software do the proper separation.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the picker, sliders, format list, contrast section and palettes are all responsive and touch-friendly. The native color input opens the OS color picker on most phones.",
        },
        {
          q: "Is this Color Picker free?",
          a: "Completely free with no signup and no limits. Pick, convert and save as many colors as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Batch compress JPG, PNG and WebP — auto-pick the best format.",
    description:
      "Compress JPG, PNG and WebP images in your browser with an adjustable quality slider, optional max-dimension resize and a per-file before/after view. Batch up to 30 at a time, choose the output format or let Auto pick. Free and private.",
    categoryId: "image",
    icon: ImageDown,
    status: "live",
    featured: true,
    keywords: [
      "image compressor",
      "compress image online",
      "jpg compressor",
      "png compressor",
      "webp compressor",
      "batch image compressor",
      "image optimizer",
      "shrink image size",
      "reduce image file size",
      "browser image compressor",
      "free image compressor",
      "image compression online",
      "tinypng alternative",
      "compress photos for web",
    ],
    seo: {
      title: "Image Compressor — Batch Compress JPG / PNG / WebP (Free)",
      description:
        "Compress JPG, PNG and WebP images in your browser with Toollyz Image Compressor. Quality slider, optional max-dimension resize, batch of 30 and a per-file before/after view — everything runs locally, nothing is uploaded.",
      what:
        "An Image Compressor takes a photo or graphic and re-encodes it at a lower file size by lowering quality (lossy) and/or downscaling its dimensions. Toollyz Image Compressor uses your browser's native image decoder + canvas re-encode (the same path the Toollyz JPG-to-PNG and PNG-to-WebP converters use), so no file ever leaves your device and there's no install or signup. Drop up to 30 JPG, PNG or WebP files; pick a target format (Auto keeps the source format, or force JPEG / WebP / PNG); slide the quality from 20% to 100% (ignored for PNG output, which is lossless); optionally set a maximum longest-edge dimension to downscale huge originals before re-encoding. Each file shows the original size, the compressed size, the delta with a green badge for smaller / amber for larger, the output dimensions and the chosen format. Total stats (files compressed, KB saved, percent saved) live in the hero. Re-compress all instantly with new settings — original files are kept until you clear the queue. EXIF and other metadata are dropped during the canvas pass, which is a privacy win when sharing photos.",
      how: [
        "Pick your target format (Auto keeps the source), the quality and an optional max-dimension cap.",
        "Drop one or many JPG / PNG / WebP files onto the drop zone — up to 30 at a time.",
        "Review the per-file before/after, then click Save on a row or Download all.",
        "Adjust quality or dimensions and hit Re-compress all to rebuild every file with the new settings.",
      ],
      benefits: [
        "Batch up to 30 files at a time with a thumbnail and per-file size delta.",
        "Auto format keeps the source format; force JPEG / WebP / PNG when you need a specific target.",
        "Quality slider (20–100%) for JPEG and WebP — ignored for PNG since PNG is lossless.",
        "Optional max-dimension downscale for huge originals before re-encoding.",
        "Aggregate stats: files compressed, total KB saved and percent saved across the batch.",
        "Re-compress all with new settings without re-dropping files.",
        "Strips EXIF / GPS / camera metadata during the canvas pass — privacy bonus.",
        "100% private — files are decoded and re-encoded in your browser, nothing is uploaded.",
      ],
      relatedSlugs: [
        "png-to-webp",
        "jpg-to-png",
        "image-resizer",
        "color-picker",
      ],
      faqs: [
        {
          q: "How does the compressor actually shrink files?",
          a: "Your browser decodes the source image, draws it onto an off-screen canvas, then calls canvas.toBlob with your chosen MIME type and quality. For JPEG and WebP the quality slider controls how aggressively the encoder discards detail (lossy); PNG is always lossless. If you set a max dimension the canvas is created at the resized size, which is the single biggest win for huge originals.",
        },
        {
          q: "Which output format should I pick?",
          a: "WebP at 75–85% quality is almost always the best choice for the web — it's 25–35% smaller than JPEG at the same visual quality, supports transparency and is supported by every modern browser. Pick JPEG if your downstream tool still doesn't accept WebP. PNG is best for graphics with sharp edges, transparency or text, but won't shrink as dramatically.",
        },
        {
          q: "Why did a PNG get larger, not smaller?",
          a: "Canvas PNG output uses a single, conservative encoder setting. If the source PNG was already heavily optimized (e.g. by pngcrush / oxipng / TinyPNG), re-encoding it from a canvas can produce a larger file. Try the WebP format instead — it's lossless when you keep quality at 100% but typically smaller than PNG.",
        },
        {
          q: "What does Auto mode do?",
          a: "Auto keeps the source format — PNG → PNG, JPEG → JPEG, WebP → WebP. Pick a specific format if you want to convert as part of compression (e.g. force WebP to maximize savings, or force JPEG for legacy compatibility).",
        },
        {
          q: "Will quality below 100% degrade the image?",
          a: "Yes, but usually invisibly above 75%. JPEG and WebP are perceptual codecs designed to throw away detail your eyes don't notice first. 80% is a great default for photography; 60–70% for thumbnails. Drop to 40–50% for ultra-light placeholder images.",
        },
        {
          q: "How does max dimension work?",
          a: "If the longest edge of the original is bigger than the value you set, the canvas is created at the downscaled size (longest edge = max dimension, aspect ratio preserved). 1920 px is a great cap for web hero images; 800 px for thumbnails; 0 (the default) keeps the original size.",
        },
        {
          q: "Are EXIF / GPS metadata kept?",
          a: "No. The canvas pass only carries pixels, so EXIF tags, GPS coordinates and camera metadata are dropped. That's a privacy win when sharing photos online, but if you need the metadata back, keep the original file.",
        },
        {
          q: "Is there a file-size limit?",
          a: "Practically, it's whatever your browser's canvas can handle — typically tens of megapixels. Very large originals may fail with a canvas error; in that case set a max dimension to downscale before encoding.",
        },
        {
          q: "Are my images uploaded anywhere?",
          a: "No. Toollyz has no server — all compression happens entirely in your browser via the native decoder + canvas API. Your files never leave your device.",
        },
        {
          q: "Is this Image Compressor free?",
          a: "Completely free with no signup and no limits. Compress as many images as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    tagline: "Pixel or percent resize with 16 social presets and 3 fit modes.",
    description:
      "Resize JPG, PNG and WebP images to exact pixel dimensions or by percentage, with 16 social-media presets, three fit modes (contain / cover / stretch), aspect-ratio lock, batch up to 30 and instant re-render — entirely in your browser.",
    categoryId: "image",
    icon: Scaling,
    status: "live",
    featured: true,
    keywords: [
      "image resizer",
      "resize image online",
      "image scaler",
      "resize jpg",
      "resize png",
      "resize webp",
      "batch image resize",
      "instagram image resize",
      "facebook cover resize",
      "youtube thumbnail size",
      "free image resizer",
      "browser image resizer",
      "image crop resize",
      "scale image online",
    ],
    seo: {
      title: "Image Resizer — Pixel / Percent + 16 Social Presets (Free)",
      description:
        "Resize JPG, PNG and WebP images to exact pixel dimensions or by percentage. 16 social-media presets, three fit modes, aspect-ratio lock and batch of 30 — Toollyz runs everything in your browser, nothing is uploaded.",
      what:
        "An Image Resizer takes a source image and produces a new one at the dimensions you specify. Toollyz Image Resizer uses your browser's native decoder + a 2D canvas to resize JPG, PNG and WebP images locally — no upload, no signup. Switch between Pixels mode (set exact W × H, with an optional aspect-ratio lock keyed off the first dropped image) and Percent mode (scale every image to a percentage of its own original size, always preserving aspect). Pick one of 16 built-in social and video presets — Instagram square / portrait / story / landscape, Facebook post and cover, X/Twitter post and header, LinkedIn post and cover, YouTube thumbnail and channel art, TikTok video, 720p, 1080p and 4K. Choose a fit mode: Contain letterboxes the image with a configurable background color (or transparency for PNG/WebP); Cover crops to fill; Stretch ignores aspect ratio. Pick an output format (Auto keeps the source format, or force JPEG / PNG / WebP) and a quality from 30–100% (ignored for PNG since PNG is lossless). Batch up to 30 files, see per-file before/after with new dimensions and size delta, then download each individually or all at once. EXIF and other metadata are dropped during the canvas pass — a privacy bonus when sharing online.",
      how: [
        "Pick Pixels for an exact size or Percent to scale by ratio — then dial in a preset, fit and format.",
        "Drop one or many JPG / PNG / WebP files onto the page (up to 30).",
        "Review the per-file thumbnail, new dimensions and size delta.",
        "Change settings and click Re-render all, or download each result individually.",
      ],
      benefits: [
        "Pixels mode with optional aspect-ratio lock (keyed off the first dropped image).",
        "Percent mode that scales each image relative to its own original size.",
        "16 social and video presets covering Instagram, Facebook, X, LinkedIn, YouTube, TikTok, 720p, 1080p and 4K.",
        "Three fit modes: Contain (letterbox), Cover (crop) and Stretch.",
        "Format selector with Auto / JPEG / PNG / WebP, plus a quality slider for lossy outputs.",
        "Configurable letterbox background — supports transparent for PNG and WebP.",
        "Batch up to 30 files with per-file before/after, size delta and Save buttons.",
        "100% private — Toollyz has no server, the canvas pass strips EXIF and GPS automatically.",
      ],
      relatedSlugs: [
        "image-compressor",
        "png-to-webp",
        "jpg-to-png",
        "color-picker",
      ],
      faqs: [
        {
          q: "How does the resizer work?",
          a: "Your browser decodes the source image, draws it onto an off-screen canvas at the target dimensions and exports the result as a Blob with canvas.toBlob. There's no upload — every byte stays on your device.",
        },
        {
          q: "What's the difference between Contain, Cover and Stretch?",
          a: "Contain preserves the entire image and adds letterbox bars when the source aspect ratio differs from the target (background color is configurable; PNG/WebP can stay transparent). Cover crops the source to fill the target exactly — typical for social-media cards. Stretch ignores aspect ratio and forces the image to the target W × H, which usually distorts it.",
        },
        {
          q: "Will it lose quality?",
          a: "Resizing always interpolates pixels. Downscaling typically looks great. Upscaling can't add new detail — pixels are interpolated using your browser's built-in algorithm (typically bilinear), so big enlargements look softer than the original. For ultra-high-quality enlargements, use a dedicated AI upscaler.",
        },
        {
          q: "What does the aspect-ratio lock do?",
          a: "When the lock is on (Pixels mode), Toollyz uses the aspect ratio of the first image you dropped to derive height from width (and vice versa) as you edit. Turn it off if you're targeting a social-preset size that doesn't match your source.",
        },
        {
          q: "Can I resize many images at once?",
          a: "Yes — drop or pick up to 30 JPGs, PNGs or WebPs at a time. Each runs sequentially through the canvas pipeline, with per-file thumbnails and size deltas in the queue.",
        },
        {
          q: "Why is the output larger than the original?",
          a: "Three common reasons: (1) you're upscaling; (2) you re-encoded a heavily-compressed JPG as PNG, which is lossless and almost always bigger; (3) the source had aggressive non-canvas optimization (TinyPNG / oxipng / mozjpeg) that the canvas re-encode can't match. Try WebP for the most consistent size savings.",
        },
        {
          q: "Are EXIF / GPS metadata kept?",
          a: "No. The canvas pass only carries pixels, so EXIF tags, GPS coordinates and camera metadata are dropped. Useful when sharing photos online.",
        },
        {
          q: "Is there a maximum size?",
          a: "Up to 8192 × 8192 pixels (one of the largest reliable canvas sizes across browsers). Very large source images may fail to decode in some browsers; in that case, downscale first.",
        },
        {
          q: "Are my images uploaded?",
          a: "No — every resize happens entirely in your browser. Toollyz has no server in the path, so files never leave your device.",
        },
        {
          q: "Is this Image Resizer free?",
          a: "Completely free with no signup and no limits. Resize as many images as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "gradient-generator",
    name: "Gradient Generator",
    tagline: "Linear, radial & conic CSS gradients with draggable stops.",
    description:
      "Design CSS Color Level 4 linear, radial and conic gradients with a draggable-stops editor, 16 curated presets, random generator, repeating mode, SVG export and four copy-ready CSS formats. Free and private.",
    categoryId: "image",
    icon: Brush,
    status: "live",
    featured: true,
    keywords: [
      "gradient generator",
      "css gradient generator",
      "linear gradient",
      "radial gradient",
      "conic gradient",
      "css gradient maker",
      "gradient builder",
      "css backgrounds",
      "gradient css copy",
      "gradient color stops",
      "tailwind gradient",
      "svg gradient",
      "repeating gradient",
      "gradient picker",
    ],
    seo: {
      title: "Gradient Generator — Linear, Radial & Conic CSS Gradients",
      description:
        "Design CSS gradients with Toollyz Gradient Generator. Draggable color stops, linear/radial/conic types, 16 presets, random generator, repeating mode, SVG export and four copy-ready CSS formats — entirely in your browser.",
      what:
        "A CSS gradient is a smooth blend between two or more colors used as a `background-image` (or any property that accepts an image). CSS Color Level 4 standardizes three gradient functions — `linear-gradient` (angled or directional), `radial-gradient` (elliptical or circular halo) and `conic-gradient` (rotated like a pie chart) — plus their `repeating-*` variants. Toollyz Gradient Generator gives you a draggable color-stops editor (click the bar to add a stop, drag to move, arrow-key to nudge, Delete to remove), 16 curated presets (Dawn, Ocean, Forest, Sunset, Aurora, Plum, Graphite, Nordic, Citrus, Rose, two radial designs and two conic designs), a Random generator that picks pleasant HSL hues, type-specific controls (angle for linear; shape and center for radial; from-angle and center for conic), a Repeating toggle for stripe patterns, four copy-ready outputs (the function call, the `background-image:` declaration, the full shorthand with a fallback color, and a Tailwind-arbitrary class) and SVG export for linear and radial gradients (with a note that conic isn't yet in the SVG spec). Your last gradient and the 12 most recent edits persist in localStorage. Toollyz has no backend — every preview is just CSS.",
      how: [
        "Pick a preset or hit Random for an instant starting point, then drag stops or click the bar to add more.",
        "Switch between Linear, Radial and Conic to swap the geometry — angle, center and shape controls update accordingly.",
        "Toggle Repeating for stripe patterns, or click Reverse to flip the stop order.",
        "Copy the function, declaration, shorthand or Tailwind class — or download an SVG file for linear/radial gradients.",
      ],
      benefits: [
        "Three CSS Color Level 4 gradient types (linear, radial, conic) with full control of angle, shape and center.",
        "Draggable color stops with keyboard nudge (arrows), Delete to remove and a one-click Reverse.",
        "16 curated presets across light, dark, vibrant and minimal styles.",
        "Smart Random gradient that picks pleasant HSL hues 30°+ apart for tasteful results.",
        "Repeating mode for stripe patterns; configurable from a single toggle.",
        "Four output formats: function call, `background-image:` declaration, shorthand with fallback and Tailwind-arbitrary class.",
        "SVG export at 1200 × 600 for linear and radial gradients (with a note that SVG doesn't standardize conic).",
        "100% private — Toollyz has no backend, draft and history saved to localStorage.",
      ],
      relatedSlugs: [
        "color-picker",
        "hex-to-rgb",
        "rgb-to-hex",
        "meta-tag-generator",
      ],
      faqs: [
        {
          q: "What's the difference between linear, radial and conic?",
          a: "Linear gradients blend colors along a straight line at a given angle (0° points up, 90° points right). Radial gradients emit from a center point in an ellipse or circle. Conic gradients sweep around a center like a clock face — perfect for pie charts and rainbow swirls. All three are standard CSS today.",
        },
        {
          q: "How do I add or move a color stop?",
          a: "Click anywhere on the gradient bar to add a stop at that position; drag a stop with the mouse or finger to move it; use the arrow keys for ±1% nudging once a stop is focused; press Delete to remove it.",
        },
        {
          q: "What's a repeating gradient?",
          a: "Adding `repeating-` to any gradient function tiles the stop pattern across the element. Useful for stripes — set two stops a few percent apart and the pattern repeats for the rest of the canvas.",
        },
        {
          q: "Can I export to SVG?",
          a: "Yes for linear and radial gradients — the export builds a real SVG file with a `<linearGradient>` or `<radialGradient>` paint server. Conic gradients aren't in the SVG spec yet, so the export falls back to a flat color and the UI says so.",
        },
        {
          q: "Which CSS format should I copy?",
          a: "Use the Property (`background-image: …`) when you want to layer over a solid color; Shorthand (`background: <fallback>; background-image: …;`) when you also want a fallback for very old browsers; Function (`linear-gradient(…)`) inside CSS variables or other properties; Tailwind class for arbitrary-value Tailwind projects.",
        },
        {
          q: "Will it work in older browsers?",
          a: "Linear and radial gradients work in every browser shipped since 2013. Conic gradients are supported by all modern engines (Chrome 69+, Firefox 83+, Safari 12.1+). For very old browsers, the Shorthand output includes a fallback solid color.",
        },
        {
          q: "Can I use OKLCH or other modern colors in a stop?",
          a: "Yes — paste any CSS color string into a stop's color field (HEX, RGB, HSL, OKLCH, color keywords). Modern browsers (Chrome 121+, Safari 16.4+, Firefox 113+) interpolate between OKLCH stops in OKLab for smoother, more perceptually-uniform blends.",
        },
        {
          q: "Are my gradients saved?",
          a: "Yes — the active gradient and the 12 most recent ones live in your browser's localStorage. Toollyz has no backend, so nothing is uploaded.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the bar, stops and controls are touch-friendly. Drag stops with your finger; tap a stop to focus it and use the inline editor below the bar for precision adjustments.",
        },
        {
          q: "Is this Gradient Generator free?",
          a: "Completely free with no signup and no limits. Design as many gradients as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "meme-generator",
    name: "Meme Generator",
    tagline: "Upload an image, add top/bottom text, export as PNG.",
    description:
      "Build classic image-macro memes in your browser. Upload any image (or pick a blank template), add top/middle/bottom text layers with full font, color and stroke control, then download as PNG. No watermark, no signup.",
    categoryId: "image",
    icon: PartyPopper,
    status: "live",
    featured: true,
    keywords: [
      "meme generator",
      "image macro generator",
      "meme maker",
      "meme creator",
      "free meme generator",
      "meme maker online",
      "impact font meme",
      "top bottom text meme",
      "meme caption maker",
      "browser meme maker",
      "no watermark meme generator",
      "meme template",
      "custom meme",
      "instagram meme",
    ],
    seo: {
      title: "Meme Generator — Upload, Caption & Download (Free, No Watermark)",
      description:
        "Make image-macro memes in your browser. Upload your own image (or pick a blank template), add top/bottom/middle text with full font, color and stroke control, then download as a PNG — no signup, no watermark, fully private.",
      what:
        "A meme generator turns an image plus a caption into the classic image-macro everybody knows from social media. Toollyz Meme Generator runs entirely in your browser using an HTML canvas: upload a JPG, PNG or WebP image (or pick one of six blank coloured backgrounds for testing), add one or more text layers anchored to the top, middle or bottom, control every layer's text, font (Impact, Arial Black, Helvetica, Comic Sans MS, Georgia or Courier — all system fonts), font size, fill color, stroke color and stroke width, with an optional UPPERCASE toggle for the classic Impact style. Long captions wrap automatically inside the canvas padding. Render at a canvas width from 480 to 2048 pixels, then download a transparent-background-friendly PNG with no watermark, no signup and no uploads. Toollyz doesn't bundle copyrighted meme templates — upload your own image for the real thing — but the blank templates make it easy to test the engine, build mock layouts or design original macros.",
      how: [
        "Upload your meme image (or pick a blank template to test the editor).",
        "Add up to as many text layers as you need — each anchored to top, middle or bottom with its own alignment.",
        "Dial in font, size, fill, stroke and the UPPERCASE toggle for that classic image-macro look.",
        "Click Download PNG — the file is rendered and saved entirely in your browser.",
      ],
      benefits: [
        "Multiple text layers, each anchored top / middle / bottom with left / center / right alignment.",
        "Six fonts including Impact (classic meme), Arial Black, Helvetica, Comic Sans, Georgia and Courier.",
        "Per-layer fill color, stroke color and stroke width (the classic black outline goes from 0 to 20 px).",
        "Auto word-wrap inside a configurable canvas padding.",
        "Canvas width slider from 480 to 2048 pixels — fits Instagram, Twitter/X, Discord and beyond.",
        "Six blank background templates for layout experimentation when you don't have an image yet.",
        "PNG export with no watermark, no signup, no upload.",
        "100% private — your image never leaves your device, settings saved to localStorage.",
      ],
      relatedSlugs: [
        "image-resizer",
        "image-compressor",
        "fancy-text-generator",
        "gradient-generator",
      ],
      faqs: [
        {
          q: "Why don't you bundle famous meme templates?",
          a: "Most well-known meme images (Drake, Distracted Boyfriend, Doge, etc.) are copyrighted stock photos or artworks. Toollyz doesn't host them. The built-in templates are simple coloured backgrounds for layout testing — for a real meme, upload your own image (or a copy you have a license for).",
        },
        {
          q: "Why does my Impact-font meme look wrong on this device?",
          a: "Fonts use system stacks. If Impact isn't installed (rare on Linux and some mobile devices), the browser falls back to Anton or another bold sans-serif. The Anton fallback ships with many Linux distros and looks similar.",
        },
        {
          q: "Can I have more than two text layers?",
          a: "Yes — click Layer to add as many as you want. Each layer has its own text, position (top/middle/bottom), alignment, font and color settings.",
        },
        {
          q: "How big can the meme be?",
          a: "The canvas width slider goes from 480 to 2048 pixels — height is derived from the source image's aspect ratio (or the chosen blank template). For maximum quality, set the width close to your source image's original width.",
        },
        {
          q: "Does the text wrap?",
          a: "Yes — long captions wrap automatically inside the canvas padding. Increase the padding for more breathing room at the edges; decrease it to push the text out.",
        },
        {
          q: "Is there a watermark?",
          a: "No — exported PNGs are clean. Toollyz never adds a logo to your output.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The image picker uses your phone's camera roll; the canvas, layer controls and sliders are all touch-friendly; downloads save to your phone's normal downloads folder.",
        },
        {
          q: "Is my image uploaded anywhere?",
          a: "No. The image goes from your file system into an HTML Image element to a 2D canvas, all in memory in your browser. Toollyz has no server in the path — nothing is uploaded.",
        },
        {
          q: "Where are my settings saved?",
          a: "Only in your browser's localStorage. Clearing site data wipes them; Toollyz can't recover them because they were never on a server.",
        },
        {
          q: "Is this Meme Generator free?",
          a: "Completely free with no signup and no limits. Make as many memes as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "signature-generator",
    name: "Signature Generator",
    tagline: "Draw or type a signature, export as a transparent PNG.",
    description:
      "Create a digital signature in your browser — draw with mouse, trackpad or finger, or type your name in a cursive font. Customize pen color and width, undo/redo, trim whitespace, then download as a transparent PNG ready to paste into Word, Pages, email or a PDF. Free and private.",
    categoryId: "image",
    icon: Signature,
    status: "live",
    featured: true,
    keywords: [
      "signature generator",
      "digital signature",
      "online signature maker",
      "sign document",
      "handwritten signature",
      "typed signature",
      "free signature generator",
      "transparent signature png",
      "signature for word",
      "signature for pdf",
      "draw signature online",
      "cursive signature generator",
      "esignature maker",
      "browser signature",
    ],
    seo: {
      title: "Signature Generator — Draw or Type Your Signature (Free, PNG)",
      description:
        "Create a digital signature in your browser with Toollyz Signature Generator. Draw with mouse/trackpad/finger or type your name in a cursive font, customize pen color and width, then download a transparent PNG — entirely private.",
      what:
        "A digital-signature generator is the easiest way to produce a transparent PNG of your signature to drop into PDFs, Word documents, emails, contracts or signup forms. Toollyz Signature Generator runs entirely in your browser using a 2D canvas: in Draw mode you sign with your mouse, trackpad or finger using Pointer Events (so it works the same on desktop, phone and Wacom tablets), with full pen-color and width control, a smoothed line (quadratic-curve interpolation between captured points, with round line cap and join), Undo / Redo and a Clear button. In Type mode you type your name in one of six system cursive fonts (Brush Script, Lucida Handwriting, Snell Roundhand, Bradley Hand, Comic Sans or generic `cursive`), with font size, fill color, letter spacing and an italic toggle. Both modes export a transparent PNG that's automatically trimmed (with a 16-pixel padding) for a clean placement in your document. Settings persist in localStorage; nothing is uploaded.",
      how: [
        "Pick Draw to sign with your mouse, trackpad or finger — or Type to render your name in a cursive font.",
        "Tweak pen / font color, pen width or font size and italic, and (Draw mode) the background colour or transparent.",
        "Use Undo, Redo and Clear to iterate; the canvas is responsive on mobile.",
        "Click Download PNG — the image is trimmed and saved with a transparent background.",
      ],
      benefits: [
        "Draw mode with smoothed strokes via Pointer Events — works on mouse, trackpad, finger and stylus.",
        "Type mode with six system cursive fonts, font-size 40–220 px, italic toggle and letter-spacing control.",
        "Pen color and width controls, optional background (transparent / white / custom hex).",
        "Undo, Redo and Clear with full history while you iterate.",
        "Auto-trim around the strokes / text with a 16-px padding for a tidy transparent PNG.",
        "Copy as a data URL for inline `<img src=\"…\">` embedding.",
        "Last settings saved to localStorage — refresh-safe and offline-friendly.",
        "100% private — Toollyz has no server, your signature never leaves your device.",
      ],
      relatedSlugs: [
        "fancy-text-generator",
        "image-resizer",
        "image-compressor",
        "meme-generator",
      ],
      faqs: [
        {
          q: "Is a typed or drawn signature legally binding?",
          a: "In most jurisdictions (US E-SIGN Act, EU eIDAS, UK Electronic Communications Act) a typed or drawn signature image is considered a valid electronic signature for everyday contracts, provided both parties intend it to be a signature and it can be reliably attributed. For higher-value transactions (real estate, wills, court filings) check the specific rules where you live and consider a qualified e-signature service that records audit metadata. Toollyz produces the image; the legal context is on you.",
        },
        {
          q: "Can I sign on my phone?",
          a: "Yes — Draw mode uses Pointer Events, so it works with mouse, trackpad, finger and Apple Pencil / Wacom / Surface Pen. The canvas is responsive and prevents accidental scrolling while you sign.",
        },
        {
          q: "Why does my typed signature look different on another device?",
          a: "The cursive fonts are system stacks — your OS may not ship every option (e.g. Snell Roundhand is Apple-only). For a consistent look across devices, install Caveat / Pacifico / Dancing Script locally, or use Draw mode and ship the resulting PNG.",
        },
        {
          q: "What is the trim option?",
          a: "The export trims rows/columns of fully-transparent pixels around the strokes (with a 16-px padding) so the PNG is sized tightly to your signature. Useful when pasting into Word, Pages, email or a PDF — the signature drops in at the right scale without extra whitespace.",
        },
        {
          q: "Does the PNG have a transparent background?",
          a: "Yes by default (Draw mode background = transparent). Switch to a white or custom-color background in Draw mode if you want a solid backdrop (e.g. for signing on top of a colored document).",
        },
        {
          q: "How do I undo a stray line?",
          a: "Click Undo (or use the toolbar). Redo brings it back. Clear wipes everything. There's no limit on how many strokes you can undo in the current session.",
        },
        {
          q: "Can I add my signature to a Word document?",
          a: "Yes — download the PNG, then in Word use Insert → Pictures → This Device. Right-click the image and choose Wrap Text → In Front of Text so you can drag it over the signature line. The transparent background means the document's underline stays visible.",
        },
        {
          q: "Can I add it to a PDF?",
          a: "Yes — open the PDF in Preview (macOS), Acrobat or any PDF editor and paste the PNG as an image annotation. The transparent background blends with the page.",
        },
        {
          q: "Is my signature uploaded?",
          a: "No. Toollyz has no server in the path — the entire generator runs in your browser. The PNG is created and downloaded locally; the settings are saved in localStorage.",
        },
        {
          q: "Is this Signature Generator free?",
          a: "Completely free with no signup and no limits. Create as many signatures as you like — privately in your browser.",
        },
      ],
    },
  },

  // ─── PDF ─────────────────────────────────────────────────────────────────
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    tagline: "Combine PDFs in your browser — pages preserved exactly.",
    description:
      "Merge up to 30 PDFs into a single file with one-click download. Re-order files, see per-file page counts and sizes, and keep fonts, images and layout intact. Free, private, browser-only.",
    categoryId: "pdf",
    icon: FilePlus,
    status: "live",
    featured: true,
    keywords: [
      "pdf merger",
      "merge pdf",
      "combine pdf",
      "join pdf",
      "pdf joiner",
      "free pdf merger",
      "browser pdf merger",
      "online pdf combiner",
      "pdf concatenate",
      "private pdf merger",
      "no upload pdf merger",
      "merge multiple pdfs",
      "pdf merge order",
      "pdf merge reorder",
    ],
    seo: {
      title: "PDF Merger — Combine PDFs in Your Browser (Free, No Upload)",
      description:
        "Merge up to 30 PDFs into a single file with Toollyz PDF Merger. Re-order files, preserve fonts and images, one-click download — entirely in your browser, no upload, no signup.",
      what:
        "A PDF Merger combines multiple PDF files into one. Toollyz PDF Merger runs the merge inside your browser using the open-source pdf-lib library — your files are read with FileReader, parsed in-memory, every page is copied (preserving fonts, embedded images, vector graphics and layout) into a fresh PDF, and the result is downloaded as a single file. Nothing is uploaded to Toollyz or any other server; we don't have one. You can queue up to 30 PDFs at a time, see the page count and size of each, re-order them with Up/Down buttons before merging, and remove any single file from the queue. The merged file is named `toollyz-merged.pdf` and includes every page from every input in the order shown. Toollyz reads encrypted PDFs with `ignoreEncryption: true` for metadata, but heavily-protected PDFs may still refuse to merge — that's a property of those specific files, not the merger.",
      how: [
        "Drop one or many PDFs onto the page, or click Choose PDFs.",
        "Re-order with the Up/Down buttons and remove anything that doesn't belong.",
        "Click Merge & download — the combined PDF is built and saved entirely in your browser.",
        "Verify the result; everything stays on your device unless you choose to share it.",
      ],
      benefits: [
        "Up to 30 PDFs queued, with per-file page count and size.",
        "Up/Down buttons to re-order before merging — easier than dragging on mobile.",
        "Pages are copied with pdf-lib so fonts, images and vector graphics are preserved.",
        "One-click Merge & download produces a single `toollyz-merged.pdf` file.",
        "Reads metadata from encrypted PDFs with `ignoreEncryption: true` where possible.",
        "Clear stats: PDFs queued, total pages and combined size in the hero.",
        "Honest error reporting — broken or unreadable PDFs are skipped with a toast.",
        "100% private — Toollyz has no server in the path, files never leave your device.",
      ],
      relatedSlugs: [
        "pdf-splitter",
        "pdf-to-image",
        "image-to-pdf",
        "screenshot-to-pdf",
      ],
      faqs: [
        {
          q: "How does the merger work without a server?",
          a: "Toollyz is a static site. Your browser reads each PDF into memory, the pdf-lib library copies pages between PDFDocument objects and the result is serialized as a Blob and downloaded — all client-side. Nothing is uploaded to Toollyz; we don't operate any backend.",
        },
        {
          q: "Is there a file-count or size limit?",
          a: "The queue is capped at 30 files. There's no hard size limit, but the browser has to hold every PDF in memory while copying pages, so very large merges (hundreds of MB total) may struggle on low-memory devices. If a merge fails for memory reasons, split the input into smaller batches.",
        },
        {
          q: "Does it preserve fonts, images and links?",
          a: "Yes — pdf-lib copies pages with their content stream and embedded resources intact, so fonts, images and vector graphics survive. Links and form fields are preserved when copyPages is able to round-trip them; some advanced interactive elements may not.",
        },
        {
          q: "Can it merge password-protected PDFs?",
          a: "Toollyz opens encrypted PDFs in read-only mode (ignoreEncryption: true) for metadata. Many user-password-protected PDFs will merge fine; some heavily-encrypted or owner-password-locked PDFs will refuse to copy pages — the merger will show an error and you'll need to remove the protection first.",
        },
        {
          q: "How do I re-order the PDFs?",
          a: "Use the Up and Down buttons on each item in the queue. The final merged PDF stacks pages in the order shown — top-to-bottom in the queue.",
        },
        {
          q: "Are my files saved anywhere?",
          a: "No. Files are loaded into memory while the page is open and discarded on reload. Toollyz has no server, so nothing is ever uploaded.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the picker uses your phone's file system, the queue scrolls, and merging works in any modern mobile browser. Very large files may strain mobile memory; if a merge fails, retry with fewer files.",
        },
        {
          q: "What's the output filename?",
          a: "By default `toollyz-merged.pdf`. You can rename it from your browser's download manager before saving.",
        },
        {
          q: "Will the merged file be smaller than the sum of inputs?",
          a: "Usually slightly smaller — pdf-lib enables object streams which compress the structure. Image and font data inside pages isn't re-compressed, though, so the savings are modest. For aggressive size cuts, run the merged PDF through a separate PDF compressor.",
        },
        {
          q: "Is this PDF Merger free?",
          a: "Completely free with no signup and no limits. Merge as many PDFs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "pdf-splitter",
    name: "PDF Splitter",
    tagline: "Extract page ranges or split into single pages.",
    description:
      "Split a PDF into multiple files by page ranges (e.g. 1-3, 5, 8-10) or break it into single-page PDFs — entirely in your browser. Page count is detected automatically and ranges are validated as you type. Free and private.",
    categoryId: "pdf",
    icon: Scissors,
    status: "live",
    featured: true,
    keywords: [
      "pdf splitter",
      "split pdf",
      "extract pdf pages",
      "pdf page extractor",
      "separate pdf pages",
      "split pdf online",
      "pdf range extractor",
      "free pdf splitter",
      "browser pdf splitter",
      "no upload pdf splitter",
      "pdf page ranges",
      "single page pdf",
      "private pdf splitter",
      "pdf extractor",
    ],
    seo: {
      title: "PDF Splitter — Extract Pages or Split by Ranges (Free, No Upload)",
      description:
        "Split a PDF into page ranges (1-3, 5, 8-10) or into single pages with Toollyz PDF Splitter. Range parser with live validation, per-output download — entirely in your browser, no upload, no signup.",
      what:
        "A PDF Splitter takes one PDF and produces multiple smaller PDFs, each containing the pages you ask for. Toollyz PDF Splitter runs the split inside your browser using the open-source pdf-lib library: drop a PDF, the page count is detected automatically, then choose between By ranges (type an expression like `1-3, 5, 8-10` — each comma-separated chunk produces one output PDF) or Every page (split into N single-page PDFs, one per page). The range parser validates as you type and reports per-chunk errors (\"exceeds 12 pages\", \"reverses start/end\"). Each output is named `<source>_pX-Y.pdf` so the order in the destination folder matches the source. You can save outputs one at a time or use Download all for batch saves staggered 120 ms apart so the browser doesn't block them. Nothing is uploaded — Toollyz has no server.",
      how: [
        "Drop a PDF onto the page (or click Choose PDF) — the page count is detected instantly.",
        "Pick By ranges and type `1-3, 5, 8-10`, or pick Every page to split into single pages.",
        "Click Split & list — each output appears with its page count and size.",
        "Download outputs individually or click Download all.",
      ],
      benefits: [
        "Range parser validates as you type (`1-3, 5, 8-10`) with per-chunk error messages.",
        "Every-page mode for one-PDF-per-page extraction in one click.",
        "Each output named `<source>_pX-Y.pdf` so destinations sort naturally.",
        "Per-output page count and size in the list, with Save and Download all actions.",
        "Pages copied with pdf-lib so fonts, images and vector graphics are preserved.",
        "Reads metadata from encrypted PDFs with `ignoreEncryption: true` where possible.",
        "Source PDF stats in the hero: source pages, output files, total pages out.",
        "100% private — Toollyz has no server in the path, files never leave your device.",
      ],
      relatedSlugs: [
        "pdf-merger",
        "pdf-to-image",
        "image-to-pdf",
        "screenshot-to-pdf",
      ],
      faqs: [
        {
          q: "How does the splitter work?",
          a: "Toollyz reads your PDF into memory, pdf-lib parses the PDF tree, and for each range you specified a fresh PDFDocument is created and the source pages are copied into it. The new PDFs are serialized as Blobs and offered for download — all client-side. Toollyz has no backend.",
        },
        {
          q: "What range syntax does it accept?",
          a: "Single pages (`5`) and inclusive ranges (`1-3` or `8-10`), separated by commas or newlines. Page numbers are 1-based. Whitespace inside ranges is ignored.",
        },
        {
          q: "Are pages copied losslessly?",
          a: "Yes — pdf-lib copies pages with their content stream and embedded resources intact, so fonts, images and vector graphics survive. Annotations and form fields are preserved when copyPages is able to round-trip them; some advanced interactive elements may not.",
        },
        {
          q: "What's the difference between By ranges and Every page?",
          a: "By ranges produces one PDF per range expression — `1-3, 5, 8-10` outputs three PDFs (pages 1-3, page 5, pages 8-10). Every page produces one PDF per page — a 12-page input becomes 12 single-page PDFs.",
        },
        {
          q: "Can I split a password-protected PDF?",
          a: "Toollyz reads encrypted PDFs in read-only mode (ignoreEncryption: true) for metadata. Many user-password-protected PDFs split fine; some heavily-encrypted or owner-password-locked PDFs refuse to copy pages. Remove the protection first and retry.",
        },
        {
          q: "Why are downloads staggered when I click Download all?",
          a: "Browsers block more than a few rapid downloads triggered from a single click. The 120 ms stagger lets the browser process each download cleanly. For very large splits, allow multiple downloads in your browser settings.",
        },
        {
          q: "Is there a page-count limit?",
          a: "There's no hard limit — the queue can be as long as your browser's memory allows. A 500-page split into single pages is fine on a desktop browser; very low-memory devices may struggle.",
        },
        {
          q: "Are my files saved anywhere?",
          a: "No. Files are loaded into memory while the page is open and discarded on reload. Toollyz has no server, so nothing is ever uploaded.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the picker uses your phone's file system, the queue scrolls, and splitting works in any modern mobile browser. For very large PDFs, watch for memory pressure on low-end devices.",
        },
        {
          q: "Is this PDF Splitter free?",
          a: "Completely free with no signup and no limits. Split as many PDFs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image Converter",
    tagline: "Render PDF pages to PNG or JPG at 1×–4× DPI in your browser.",
    description:
      "Turn each PDF page into a PNG or JPEG image using Mozilla's PDF.js — entirely in your browser. Choose page ranges, scale (1×–4×, up to 288 DPI), JPEG quality and background. Free, private, no upload.",
    categoryId: "pdf",
    icon: FileOutput,
    status: "live",
    featured: true,
    keywords: [
      "pdf to image",
      "pdf to jpg",
      "pdf to png",
      "pdf page extractor",
      "pdf to image converter",
      "pdf page to png",
      "pdf page to jpg",
      "pdf rasterizer",
      "extract images from pdf",
      "convert pdf to png",
      "free pdf to image",
      "browser pdf to image",
      "no upload pdf to image",
      "high dpi pdf to image",
    ],
    seo: {
      title: "PDF to Image Converter — PDF → PNG / JPG at 1×–4× DPI (Free)",
      description:
        "Convert PDF pages to PNG or JPEG with Toollyz PDF to Image Converter. Choose page ranges, scale (1×–4× DPI), JPEG quality and background — rendered by Mozilla's PDF.js entirely in your browser.",
      what:
        "A PDF to Image Converter takes a PDF and renders each page as a raster image (PNG or JPEG). Toollyz PDF to Image Converter uses Mozilla's PDF.js library — the same engine Firefox uses to render PDFs — running entirely in your browser. Drop a PDF, the page count is detected, then pick a range (`1-3, 5, 8-10`) or All pages, a format (PNG keeps transparency; JPEG flattens onto a configurable background colour with a quality slider) and a scale from 0.5× to 4× (1× = 72 DPI, 2× = 144 DPI for screens, 3× = 216 DPI for print, 4× = 288 DPI for high-density work). Each page is rasterised on a 2D canvas at the chosen scale and exported with the browser's native PNG / JPEG encoder. The PDF.js worker is served as a static asset from `/pdfjs/pdf.worker.min.mjs` — Toollyz has no server in the path.",
      how: [
        "Drop a PDF onto the page — Page count is detected instantly.",
        "Pick By ranges (`1-3, 5, 8-10`) or All pages, choose PNG or JPEG, dial in scale and quality.",
        "Click Render — progress is shown live, thumbnails fill the grid as each page completes.",
        "Save individual images, or click Download all (staggered 120 ms so the browser doesn't block).",
      ],
      benefits: [
        "Mozilla PDF.js rendering — the same engine that ships in Firefox.",
        "PNG (lossless, transparent) or JPEG (smaller, configurable background).",
        "Scale 0.5×–4× covers 36 DPI thumbnails to 288 DPI print-ready output.",
        "Range selector (1-3, 5, 8-10) or All pages.",
        "Live progress bar plus thumbnail grid as pages complete.",
        "Per-image filename = `<source>_pX.png` so destinations sort naturally.",
        "Worker served from `/pdfjs/pdf.worker.min.mjs` — no third-party CDN required.",
        "100% private — Toollyz has no server in the path, files never leave your device.",
      ],
      relatedSlugs: [
        "image-to-pdf",
        "pdf-merger",
        "pdf-splitter",
        "screenshot-to-pdf",
      ],
      faqs: [
        {
          q: "Which library does this use?",
          a: "Mozilla PDF.js (pdfjs-dist), the same open-source library that powers PDF rendering in Firefox. Pages are turned into a 2D canvas at the requested scale and exported with the browser's native canvas.toBlob.",
        },
        {
          q: "What does the scale slider mean?",
          a: "1× corresponds to 72 DPI (the PDF spec's native resolution). 2× gives 144 DPI (great for screens), 3× gives 216 DPI (print-quality for most uses) and 4× gives 288 DPI (high-density retina or large prints). Higher scales produce sharper images and larger files.",
        },
        {
          q: "Why does JPEG need a background colour?",
          a: "JPEG can't carry an alpha channel, so anything transparent in the source page would otherwise appear black. The background colour (default white) fills behind the page before the JPEG is encoded. Use PNG if you need true transparency.",
        },
        {
          q: "Can it handle password-protected PDFs?",
          a: "PDF.js prompts for a password by default. Toollyz currently doesn't expose that prompt — if your PDF requires a password, remove the protection first and retry. We may add a password prompt in a future update.",
        },
        {
          q: "Is there a page limit?",
          a: "No hard limit, but each rendered page lives in memory until you reload — large PDFs at high DPI can exhaust browser memory. Render in batches if a job fails for memory reasons.",
        },
        {
          q: "What's the output filename?",
          a: "`<source>_pX.png` or `.jpg`. For example a 12-page file called `report.pdf` rendered at every page produces `report_p1.png`, `report_p2.png`, … `report_p12.png`.",
        },
        {
          q: "Does it work offline?",
          a: "Once the page (and the PDF.js worker) is cached by your browser, yes — rendering is entirely local. The first visit needs an internet connection to fetch the JS bundle and the worker file.",
        },
        {
          q: "Are my files uploaded?",
          a: "No. Toollyz has no server in the path — PDF.js runs in your browser, rendering happens on a local canvas and the resulting images are downloaded directly. Nothing leaves your device.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The picker uses your phone's file system; the renderer works in mobile browsers. High-DPI renders on phones can be slow because of memory limits — consider 1× or 2× scale.",
        },
        {
          q: "Is this PDF to Image Converter free?",
          a: "Completely free with no signup and no limits. Convert as many PDFs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF Converter",
    tagline: "Stitch JPG, PNG and WebP into one PDF — A4, Letter, A3, custom.",
    description:
      "Combine up to 30 JPG, PNG or WebP images into a single PDF with A4 / A3 / Letter / Legal / custom or auto page sizes, Fit / Fill / Stretch layout, configurable margin and background. Built entirely in your browser with pdf-lib. Free and private.",
    categoryId: "pdf",
    icon: FileInput,
    status: "live",
    featured: true,
    keywords: [
      "image to pdf",
      "jpg to pdf",
      "png to pdf",
      "webp to pdf",
      "photo to pdf",
      "images to pdf",
      "image to pdf converter",
      "stitch images pdf",
      "merge images pdf",
      "free image to pdf",
      "browser image to pdf",
      "no upload image to pdf",
      "pdf builder",
      "a4 image pdf",
    ],
    seo: {
      title: "Image to PDF Converter — JPG/PNG/WebP → 1 PDF (Free, No Upload)",
      description:
        "Combine JPG, PNG and WebP images into a single PDF with Toollyz Image to PDF Converter. A4 / A3 / Letter / custom / auto page sizes, Fit / Fill / Stretch layout, margin and background controls — entirely in your browser.",
      what:
        "An Image to PDF Converter takes a list of images and produces a single PDF, one image per page. Toollyz Image to PDF Converter runs the build inside your browser using the open-source pdf-lib library: drop up to 30 JPG, PNG or WebP files, re-order them with Up/Down buttons, then pick a page size (A4 595×842 pt, A3 842×1191 pt, US Letter 612×792 pt, US Legal 612×1008 pt, a custom W×H in PDF points, or Auto which matches each image's pixel dimensions), orientation (portrait/landscape, not used in Auto), Fit mode (Fit preserves aspect with letterbox, Fill preserves aspect inside the usable area, Stretch ignores aspect), margin (0–120 pt) and page background colour. JPGs and PNGs are embedded natively; WebP is re-encoded to PNG via a canvas first because the PDF spec doesn't carry WebP. The PDF is built locally and downloaded on click — Toollyz has no server in the path.",
      how: [
        "Drop or pick JPG, PNG or WebP images — up to 30. Re-order with Up/Down buttons.",
        "Pick a page size (or Auto), orientation, Fit mode, margin and background colour.",
        "Set a filename and click Build PDF — the file is created and saved entirely in your browser.",
        "Open in your preferred viewer; nothing was uploaded to Toollyz.",
      ],
      benefits: [
        "Six page-size options: A4, A3, Letter, Legal, Custom (in PDF points) and Auto (matches each image).",
        "Portrait or landscape orientation with one click — not applicable in Auto.",
        "Three Fit modes (Fit / Fill / Stretch) and a 0–120 pt margin slider.",
        "Configurable page background colour for letterbox bars.",
        "Native JPG and PNG embedding via pdf-lib; WebP is re-encoded to PNG transparently.",
        "Up/Down re-order buttons and per-image thumbnail, size and dimensions.",
        "Output filename input — set whatever you want before downloading.",
        "100% private — Toollyz has no server, images stay in your browser.",
      ],
      relatedSlugs: [
        "pdf-to-image",
        "pdf-merger",
        "pdf-splitter",
        "screenshot-to-pdf",
      ],
      faqs: [
        {
          q: "How does the converter work?",
          a: "Each image is read into memory with FileReader, pdf-lib creates a fresh PDFDocument, adds a page at the requested size and embeds the image (drawImage). JPGs and PNGs are embedded natively; WebP is re-encoded to PNG via a canvas first because PDF doesn't carry WebP. The PDF is then serialized as a Blob and downloaded.",
        },
        {
          q: "What's the difference between Fit, Fill and Stretch?",
          a: "Fit preserves the image's aspect ratio and lets bars of the background colour fill the rest (letterbox). Fill also preserves aspect but sizes the image to the larger usable dimension (so it touches the margins on at least two sides). Stretch ignores aspect and forces the image to fill the entire usable area, usually distorting it.",
        },
        {
          q: "What does Auto page size do?",
          a: "Each page is sized to match its image's pixel dimensions 1:1 (treating pixels as points). Useful when you want zero scaling — every image appears at native size in the PDF. Orientation is ignored in Auto.",
        },
        {
          q: "Why is WebP re-encoded?",
          a: "The PDF specification supports JPEG and PNG image streams (via DCT and Flate filters) but not WebP. Toollyz transparently decodes WebP via a 2D canvas and embeds it as PNG. The result is identical visually; the file size is slightly larger than the original WebP.",
        },
        {
          q: "How big can the PDF be?",
          a: "There's no hard cap. The browser must hold every image (decoded to a canvas for WebP, raw bytes for JPG/PNG) in memory, then the merged PDF. Very large batches at high resolution may exhaust mobile memory; if a build fails, retry with fewer images or smaller resolutions.",
        },
        {
          q: "Does it work with HEIC photos?",
          a: "Not directly. iPhone HEIC photos need to be converted to JPG or PNG first (most macOS and iOS apps do this automatically when sharing or exporting). Toollyz's PNG/WebP converters can also help.",
        },
        {
          q: "Are my files saved anywhere?",
          a: "No. Files are loaded into memory while the page is open and discarded on reload. Toollyz has no server, so nothing is ever uploaded.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the file picker uses your phone's camera roll, the queue scrolls and building works in any modern mobile browser. For large batches, watch for memory pressure on low-end devices.",
        },
        {
          q: "Can I rotate images before adding them?",
          a: "Not yet — the build respects each image's own orientation. Rotate the source images first (Toollyz Image Resizer's Fit modes can help) or rotate the PDF after building with the PDF Merger in a future release.",
        },
        {
          q: "Is this Image to PDF Converter free?",
          a: "Completely free with no signup and no limits. Build as many PDFs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "screenshot-to-pdf",
    name: "Screenshot to PDF",
    tagline: "Stitch screenshots with captions, cover page and page numbers.",
    description:
      "Combine PNG / JPG / WebP screenshots into a single shareable PDF — every page hugs the screenshot exactly, with optional cover title/subtitle/date, per-page captions and page numbers. Free, private, browser-only.",
    categoryId: "pdf",
    icon: Camera,
    status: "live",
    featured: true,
    keywords: [
      "screenshot to pdf",
      "screenshots to pdf",
      "bug report pdf",
      "walkthrough pdf",
      "combine screenshots pdf",
      "screenshots pdf converter",
      "screenshot report builder",
      "qa screenshot pdf",
      "pdf from screenshots",
      "free screenshot pdf",
      "browser screenshot to pdf",
      "no upload screenshot pdf",
      "private screenshot pdf",
      "screenshot caption pdf",
    ],
    seo: {
      title: "Screenshot to PDF — Bug Reports & Walkthroughs (Free, Captions)",
      description:
        "Combine PNG/JPG/WebP screenshots into a single PDF with Toollyz Screenshot to PDF. Cover title/subtitle/date, per-page captions, page numbers — entirely in your browser, no upload.",
      what:
        "A screenshot-to-PDF tool stitches multiple screenshots into one shareable PDF — the easiest way to ship a bug report, design walkthrough or step-by-step guide. Toollyz Screenshot to PDF runs everything in your browser using the open-source pdf-lib library. Drop up to 30 PNG, JPG or WebP screenshots; each becomes a page sized exactly to the image (pixels are treated as PDF points so there's zero scaling). Add a 2-line caption under each screenshot — it word-wraps to the page width — and a footer page number (\"Page n / N\") that includes the optional cover page in the count. The cover page can have a title (Helvetica Bold 32pt), subtitle (16pt) and today's date (11pt). Configure the page background colour, text colour and outer margin. WebP screenshots are transparently re-encoded to PNG since the PDF spec doesn't carry WebP. The final PDF downloads with whatever filename you set; nothing is uploaded.",
      how: [
        "Drop your screenshots in the order you want them — re-order with Up/Down per item.",
        "(Optional) Add a cover title, subtitle and today's date for a polished first page.",
        "Add per-page captions, choose background / text colours, set the outer margin and filename.",
        "Click Build PDF — the file is generated and saved entirely in your browser.",
      ],
      benefits: [
        "Each page sizes itself to the screenshot — no scaling, no quality loss.",
        "Optional cover page with title (Helvetica Bold 32pt), subtitle (16pt) and today's date.",
        "Per-screenshot caption that word-wraps to a maximum of two lines under the image.",
        "Footer page numbers in the format \"Page n / N\" (counts the cover page if present).",
        "Configurable page background, text colour and 0–80 pt outer margin.",
        "Up to 30 screenshots per PDF, with Up/Down re-order and individual remove buttons.",
        "WebP screenshots transparently re-encoded to PNG (PDF spec doesn't carry WebP).",
        "100% private — Toollyz has no backend, files stay in your browser.",
      ],
      relatedSlugs: [
        "image-to-pdf",
        "pdf-merger",
        "pdf-splitter",
        "pdf-to-image",
      ],
      faqs: [
        {
          q: "How does this differ from the regular Image to PDF tool?",
          a: "Image to PDF lets you pick A4 / A3 / Letter / Legal / Custom / Auto page sizes and Fit / Fill / Stretch layout — useful for printable photo books. Screenshot to PDF is opinionated: every page hugs the screenshot exactly (no scaling), and it adds a cover page, per-page captions and page numbers that are perfect for bug reports and walkthroughs.",
        },
        {
          q: "How are the page sizes calculated?",
          a: "Image pixels are treated as PDF points (1 pt = 1/72 in). A 1280×800 screenshot becomes a 1280×800 pt page (plus margin, caption and footer space). The resulting PDF reads at native size in most viewers.",
        },
        {
          q: "How long can a caption be?",
          a: "Captions word-wrap to two lines under each screenshot. If your caption needs more, drop a separate text screenshot or shorten it; this tool is intentionally minimal to keep reports skimmable.",
        },
        {
          q: "Does the cover page count toward the page numbers?",
          a: "Yes — if you set a cover title (or subtitle or date), the cover is page 1, the first screenshot is page 2, and so on. The footer reads \"Page n / N\" with N including the cover.",
        },
        {
          q: "Why are my WebP screenshots re-encoded?",
          a: "The PDF specification supports JPEG and PNG image streams (DCT and Flate filters) but not WebP. Toollyz transparently decodes WebP via a 2D canvas and embeds the result as PNG. Visually identical; the encoded size is slightly larger than the original WebP.",
        },
        {
          q: "What if my screenshot is very wide?",
          a: "The page becomes that wide — most PDF viewers handle ultra-wide pages by fitting to width. If the resulting page is wider than 2048 pt, consider resizing the source screenshot first (Toollyz Image Resizer can do this).",
        },
        {
          q: "Can I export a Word document instead?",
          a: "Not from this tool — the PDF output is the goal. You can drag the PDF into Word's \"Insert as Object\" or rasterise pages first via the PDF to Image Converter.",
        },
        {
          q: "Are my files saved anywhere?",
          a: "No. Toollyz has no backend — screenshots are loaded into memory while the page is open and discarded on reload. Settings save to localStorage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The picker uses your phone's camera roll, the queue scrolls and building works in any modern mobile browser. Very large screenshot batches may strain mobile memory; if a build fails, retry with fewer.",
        },
        {
          q: "Is this Screenshot to PDF tool free?",
          a: "Completely free with no signup and no limits. Build as many reports as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "resume-pdf-generator",
    name: "Resume PDF Generator",
    tagline: "Two layouts × three fonts, drawn by pdf-lib in your browser.",
    description:
      "Fill out a structured form (header, summary, experience, education, skills, projects, languages, certifications) and download a print-ready PDF resume. Two layouts (Classic / Modern), three standard PDF fonts and a theme colour — built entirely in your browser.",
    categoryId: "pdf",
    icon: FileUser,
    status: "live",
    featured: true,
    keywords: [
      "resume builder",
      "cv builder",
      "pdf resume",
      "resume generator",
      "resume maker online",
      "free resume builder",
      "resume pdf download",
      "cv pdf builder",
      "resume template pdf",
      "browser resume builder",
      "no signup resume",
      "private resume builder",
      "ats friendly resume",
      "single column resume",
    ],
    seo: {
      title: "Resume PDF Generator — Free Print-Ready CV (No Signup)",
      description:
        "Build a clean, print-ready resume PDF with Toollyz Resume PDF Generator. Two layouts (Classic / Modern), three standard PDF fonts, theme colour and structured sections for experience, education, skills, projects, languages and certifications — entirely in your browser.",
      what:
        "A resume PDF generator turns a structured form into a polished, print-ready CV. Toollyz Resume PDF Generator runs everything inside your browser using the open-source pdf-lib library: it lays out a single-column A4 portrait page (with automatic overflow onto extra pages) using the standard 14 PDF fonts so there are no font-embedding licensing concerns. The form covers every section a recruiter looks for: a header with name, title, email, phone, location and three optional links (Website, LinkedIn, GitHub); a free-form Summary; a list of Experience entries (role, company, location, start/end and a multi-line bullet block); Education entries (school, degree, location, start/end, details); Skills as a comma-, pipe- or newline-separated list rendered with middle-dot separators; Projects (name, link, description); Languages (name and CEFR level / native / fluent); and Certifications (name, issuer, date). Pick the Classic template (centred header, full-width sections with a fine rule under each heading) or Modern (left-aligned header with a 80 × 2.4 pt coloured accent rule); pick Helvetica, Times Roman or Courier; pick a theme colour. Empty sections hide themselves automatically so a minimal resume stays minimal.",
      how: [
        "Pick a template (Classic / Modern), font and theme colour in the hero.",
        "Fill out the tabs — Header, Summary, Experience, Education, Skills, Other (Projects / Languages / Certifications).",
        "Set a filename and click Download PDF — the file is built and saved entirely in your browser.",
        "Open in any PDF viewer or send straight to a recruiter.",
      ],
      benefits: [
        "Two layouts: Classic (centred header, ruled sections) and Modern (left-aligned with accent rule).",
        "Three font choices — Helvetica, Times Roman, Courier — using the standard 14 PDF fonts (no licensing concerns).",
        "Configurable theme colour for accents, title and section headings.",
        "A4 portrait with automatic overflow onto additional pages.",
        "Skills, projects, languages and certifications hide their headers automatically when empty.",
        "Experience and project bullets accept one-per-line input and render as bullet lists.",
        "Form data saves to localStorage so a refresh doesn't lose your work.",
        "100% private — Toollyz has no backend, everything runs in your browser.",
      ],
      relatedSlugs: [
        "invoice-generator",
        "image-to-pdf",
        "pdf-merger",
        "meta-tag-generator",
      ],
      faqs: [
        {
          q: "Is the PDF ATS-friendly?",
          a: "Yes for most ATS systems. Toollyz produces a single-column A4 PDF with selectable text (not images of text) and standard PDF fonts. ATS parsers handle this layout well. For maximum compatibility, leave the icons and complex formatting out — the Classic template is the safest pick.",
        },
        {
          q: "What's the difference between Classic and Modern?",
          a: "Classic centres your name and uses full-width sections with a fine rule under each section heading — a traditional layout that works well in conservative industries. Modern left-aligns the name, adds a coloured accent rule under it and uses the theme colour for section headings — a bit more contemporary.",
        },
        {
          q: "Why these three fonts?",
          a: "Helvetica, Times Roman and Courier are part of the standard 14 PDF fonts — they're embedded in every PDF viewer, so the PDF size stays tiny and there are no font licensing concerns. Custom fonts can be added in a future update once we tackle font embedding properly.",
        },
        {
          q: "Can I add a photo?",
          a: "Not yet. Many modern hiring guides recommend against photos on resumes (bias risk, ATS issues), so Toollyz keeps it off by default. If you need one, generate the PDF, then add the photo in a separate editor.",
        },
        {
          q: "How do I write good bullet points?",
          a: "Use one bullet per line in the form — the engine wraps long lines automatically. Lead with an action verb, include a result or metric when possible, and keep each bullet to one or two lines for readability.",
        },
        {
          q: "Does it support multiple pages?",
          a: "Yes — long resumes overflow onto additional A4 pages automatically. The page break happens between sections or after a complete entry whenever possible.",
        },
        {
          q: "What if I have no LinkedIn / GitHub / website?",
          a: "Leave those fields blank. The header joins only the filled fields with middle dots, so missing links don't leave a gap.",
        },
        {
          q: "Are my details uploaded?",
          a: "No. Toollyz has no backend — the PDF is built in your browser and downloaded directly. Your form data saves to localStorage so a refresh keeps your draft; clearing site data wipes it.",
        },
        {
          q: "Can I customise the section order?",
          a: "Not in this release. The order is fixed: Header → Summary → Experience → Education → Skills → Projects → Languages → Certifications. We may add a re-orderable list in a future version.",
        },
        {
          q: "Is this Resume PDF Generator free?",
          a: "Completely free with no signup and no limits. Build as many resumes as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    tagline: "Line items, tax, discount, logo, 20 currencies → PDF.",
    description:
      "Build a clean, print-ready invoice PDF with line items, tax, discount, 20 ISO 4217 currencies, your logo and a theme colour. Drawn with pdf-lib using built-in Helvetica — no font-embedding licensing concerns. Free and private.",
    categoryId: "pdf",
    icon: Receipt,
    status: "live",
    featured: true,
    keywords: [
      "invoice generator",
      "free invoice generator",
      "invoice maker",
      "pdf invoice",
      "create invoice online",
      "online invoice generator",
      "freelance invoice",
      "small business invoice",
      "invoice template pdf",
      "browser invoice generator",
      "no signup invoice generator",
      "private invoice maker",
      "intl currency invoice",
      "invoice with tax discount",
    ],
    seo: {
      title: "Invoice Generator — Free PDF Invoices With Logo, Tax & Discount",
      description:
        "Build a clean PDF invoice with Toollyz Invoice Generator. Line items, tax, discount, 20 ISO 4217 currencies, your logo and a theme colour — drawn entirely in your browser, no signup, no upload.",
      what:
        "An Invoice Generator turns a structured form (sender, recipient, line items, totals) into a polished, print-ready invoice PDF. Toollyz Invoice Generator builds the PDF inside your browser using the open-source pdf-lib library. The form has every field a freelancer or small business needs: From and Bill-to addresses (name + email + freeform multi-line address), invoice number, issue date and due date, currency (20 popular ISO 4217 codes — USD, EUR, GBP, JPY, INR, AUD, CAD, CHF, CNY, BRL, SGD, HKD, NZD, KRW, MXN, SEK, NOK, DKK, PLN, AED), tax percentage and a flat discount amount in the chosen currency, free-form Notes and Payment terms text, plus a theme colour that paints the accent bar and total, and an optional logo (PNG or JPG up to 1.5 MB) that's drawn in the top-right corner. The PDF is A4 portrait with Helvetica + Helvetica Bold (the 14 standard PDF fonts, so there are no font-embedding licensing concerns) and line items overflow to additional pages automatically. Currency formatting uses your browser's `Intl.NumberFormat` — symbols, separators and decimal places follow your locale.",
      how: [
        "Fill in From and Bill-to addresses, invoice number, dates and currency.",
        "Add line items (description, quantity, rate) — totals update live in the hero.",
        "Set tax %, discount, theme colour, notes and payment terms; optionally upload a logo.",
        "Click Generate PDF — the file is built and downloaded entirely in your browser.",
      ],
      benefits: [
        "Live total in the hero with subtotal, discount, tax breakdown and theme-colored accent.",
        "Line items with auto-calculated amount (qty × rate) and remove buttons.",
        "20 ISO 4217 currencies formatted via `Intl.NumberFormat` for proper locale display.",
        "Tax percentage and flat discount, both applied before the total.",
        "PNG or JPG logo (up to 1.5 MB) drawn in the top-right corner of the PDF.",
        "Customizable theme colour for the accent bar, INVOICE title and total line.",
        "Built-in Helvetica + Helvetica Bold via pdf-lib — no font-embedding licensing concerns.",
        "100% private — Toollyz has no backend, form values saved to localStorage (without the logo bytes).",
      ],
      relatedSlugs: [
        "currency-converter",
        "screenshot-to-pdf",
        "resume-pdf-generator",
        "pdf-merger",
      ],
      faqs: [
        {
          q: "How does the Invoice Generator work without a server?",
          a: "Toollyz is a static site. Your browser uses the open-source pdf-lib library to construct a PDF document in memory from the form data and then offers it for download. There's no upload — every byte stays on your device.",
        },
        {
          q: "Can I include my logo?",
          a: "Yes — upload a PNG or JPG up to 1.5 MB. It's embedded in the top-right corner of the PDF and capped at 64 pt on the longest edge so it doesn't dominate the header. The logo bytes aren't saved to localStorage; the rest of the form is.",
        },
        {
          q: "Does it support taxes?",
          a: "Yes — a single tax percentage applied after the discount. For more complex tax setups (multiple rates, per-line taxes) you'd need to bake the tax into each line's rate or extend the tool. Many freelancers find a single rate sufficient.",
        },
        {
          q: "Which currencies are supported?",
          a: "20 ISO 4217 currencies — USD, EUR, GBP, JPY, INR, AUD, CAD, CHF, CNY, BRL, SGD, HKD, NZD, KRW, MXN, SEK, NOK, DKK, PLN, AED. Symbols, separators and decimals follow your browser locale via `Intl.NumberFormat`. Need a different currency? Pick the closest match and edit the resulting PDF in a viewer that supports it.",
        },
        {
          q: "What page size is the invoice?",
          a: "A4 portrait (595.28 × 841.89 pt). Line items automatically continue onto additional pages if they overflow. US Letter support and configurable sizes are on the roadmap.",
        },
        {
          q: "Is the PDF accessible?",
          a: "pdf-lib produces a tagged-content-stream PDF — readable in Acrobat, Preview, Firefox, Chrome, etc., and printable. Full Section 508 / WCAG tagging requires structure trees we don't add yet. For high-stakes accessibility, run the result through a dedicated tagger.",
        },
        {
          q: "What happens to my data after I close the page?",
          a: "Form values save to localStorage so a refresh doesn't lose your draft. The logo bytes don't (they're often too big and contain image data); you'll need to re-upload after a refresh. Clearing site data wipes everything; Toollyz can't recover it.",
        },
        {
          q: "Can I edit the PDF after downloading?",
          a: "Yes — open it in any PDF editor (Acrobat, PDFgear, PDFescape, Preview's markup tools). The pdf-lib output uses standard fonts and a simple structure that's friendly to editors.",
        },
        {
          q: "Does it support tax-exclusive vs tax-inclusive pricing?",
          a: "The line-item rate is taken as tax-exclusive: subtotal + discount adjustment + tax = total. If you need tax-inclusive prices (the EU consumer model), bake VAT into each rate and leave the tax field at 0.",
        },
        {
          q: "Is this Invoice Generator free?",
          a: "Completely free with no signup and no limits. Generate as many invoices as you like — privately in your browser.",
        },
      ],
    },
  },

  // ─── CALCULATORS ─────────────────────────────────────────────────────────
  {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    tagline: "Epoch ↔ ISO/UTC/local, with live clock and 16 timezones.",
    description:
      "Convert Unix timestamps to ISO 8601, UTC, local, RFC 2822 and 16 timezones — with a live ticking clock, auto seconds/ms detection and copy-to-clipboard on every value. Free, private, browser-only.",
    categoryId: "calculators",
    icon: Clock,
    status: "live",
    featured: true,
    keywords: [
      "unix timestamp converter",
      "epoch converter",
      "unix to date",
      "date to unix",
      "epoch time",
      "iso 8601 converter",
      "utc converter",
      "rfc 2822",
      "timestamp converter online",
      "free timestamp converter",
      "browser timestamp converter",
      "epoch milliseconds",
      "epoch seconds",
      "timezone converter",
    ],
    seo: {
      title: "Unix Timestamp Converter — Epoch ↔ ISO / UTC / Local (Free)",
      description:
        "Convert Unix timestamps to ISO 8601, UTC, local time, RFC 2822 and 16 popular timezones with Toollyz Unix Timestamp Converter. Live clock, auto seconds/ms detection — runs entirely in your browser.",
      what:
        "A Unix Timestamp Converter turns the number of seconds (or milliseconds) since the Unix epoch (1 Jan 1970 UTC) into a human-readable date — and back. Toollyz Unix Timestamp Converter shows a live ticking clock with the current epoch in both seconds and milliseconds plus the ISO 8601 and UTC strings, then lets you paste any timestamp (seconds, milliseconds or a relaxed ISO/RFC date string) and see it expressed in twelve formats at once: epoch seconds, epoch milliseconds, ISO 8601, UTC (`Date.toUTCString`), local long, local short, UTC readable, RFC 2822, date-only, time-only, weekday + month + day-of-year + ISO week, and a relative phrase (`in 3 minutes`, `2 hours ago`) computed by `Intl.RelativeTimeFormat`. Switch to the Timezones tab to see the same moment in sixteen popular zones (UTC, America/Los_Angeles, America/New_York, Europe/London, Europe/Berlin, Asia/Dubai, Asia/Kolkata, Asia/Tokyo, Australia/Sydney and more) — every formatter respects your browser's built-in IANA tz database, so leap-seconds and DST transitions match the OS. Every value has a one-click copy button. Auto-detect treats 10-digit and shorter integers as seconds and 13-digit positive integers as milliseconds.",
      how: [
        "Watch the live hero for the current epoch and ISO time, ticking once per second.",
        "Paste any timestamp or date into the input — choose Auto / Seconds / Milliseconds for numeric input.",
        "Read off the formats panel; click the copy icon on any value to grab it.",
        "Switch to Timezones to see the same instant in 16 popular zones.",
      ],
      benefits: [
        "Live ticking clock with the current epoch in seconds, milliseconds, ISO 8601 and UTC.",
        "Auto-detection between seconds and milliseconds based on integer length.",
        "Twelve output formats including ISO, UTC, local, RFC 2822, date-only, time-only and ISO week.",
        "Relative time formatting via `Intl.RelativeTimeFormat` for natural-language deltas.",
        "16 common IANA timezones in a dedicated tab, formatted with `Intl.DateTimeFormat`.",
        "One-click copy on every value.",
        "Accepts relaxed date strings via `Date.parse` (most ISO 8601 and RFC 2822 work).",
        "100% private — Toollyz has no backend, draft saved to localStorage.",
      ],
      relatedSlugs: [
        "calendar-generator",
        "json-formatter",
        "jwt-decoder",
        "regex-tester",
      ],
      faqs: [
        {
          q: "What is a Unix timestamp?",
          a: "A Unix timestamp is the number of seconds that have elapsed since 00:00:00 UTC on Thursday, 1 January 1970, the so-called Unix epoch. Many APIs, log files and databases store time as an epoch integer because it's compact, unambiguous and easy to compare.",
        },
        {
          q: "How do I know if my number is seconds or milliseconds?",
          a: "Seconds are 10 digits or fewer through year 2286; milliseconds are 13 digits today. Toollyz auto-detects: it treats 10-digit and shorter integers as seconds and 13-digit positive integers as milliseconds. You can override with the Unit selector.",
        },
        {
          q: "What date formats does the input accept?",
          a: "Numeric Unix timestamps (seconds or milliseconds), ISO 8601 (`2026-05-30T14:00:00Z`) and most RFC 2822 variants. Anything `Date.parse` understands works; if a string fails, you'll see an error in the input panel.",
        },
        {
          q: "Where do the timezone names come from?",
          a: "They're official IANA timezone identifiers (the `tz database`). Your browser's `Intl` API ships its own copy of the database; Toollyz simply asks it to format the date in each requested zone.",
        },
        {
          q: "Does it handle daylight-saving time?",
          a: "Yes — `Intl.DateTimeFormat` applies the correct DST offset for each timezone at the requested instant. If your OS's tz database is out of date, the displayed time may be off; install OS updates to fix.",
        },
        {
          q: "What's the relative-time line?",
          a: "It uses `Intl.RelativeTimeFormat` to express the difference between the parsed timestamp and the current moment as a natural-language phrase like \"in 3 minutes\" or \"2 days ago\". It updates as the clock ticks.",
        },
        {
          q: "Does it work offline?",
          a: "Yes — once the page is loaded, every conversion runs in your browser without any network call. The live clock updates each second from `Date.now`.",
        },
        {
          q: "Is my input uploaded?",
          a: "No. Toollyz has no backend. Your current input is saved to localStorage so a refresh doesn't lose it, but nothing is sent to a server.",
        },
        {
          q: "What is ISO week and day-of-year?",
          a: "ISO week is the 1–53 week number per ISO 8601 (week starting Monday; the week containing 4 Jan is week 1). Day-of-year is 1–366. Both are useful for project planning and astronomy.",
        },
        {
          q: "Is this Unix Timestamp Converter free?",
          a: "Completely free with no signup and no limits. Convert as many timestamps as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "typing-speed-test",
    name: "Typing Speed Test",
    tagline: "Live char-by-char WPM, accuracy and 30-run history.",
    description:
      "Time yourself typing a passage (15/30/60/120 s) with live char-by-char highlighting, WPM, accuracy and error counts. Six built-in passages or paste-your-own — and a 30-run history with per-duration best scores. Free, private, browser-only.",
    categoryId: "calculators",
    icon: TimerReset,
    status: "live",
    featured: true,
    keywords: [
      "typing speed test",
      "wpm test",
      "typing test online",
      "typing accuracy test",
      "free typing speed test",
      "typing practice",
      "words per minute",
      "typing exercise",
      "online wpm test",
      "browser typing test",
      "private typing test",
      "code typing test",
      "pangram typing",
      "type test 60 seconds",
    ],
    seo: {
      title: "Typing Speed Test — Live WPM, Accuracy & Errors (Free)",
      description:
        "Measure your WPM, raw WPM and accuracy with Toollyz Typing Speed Test. Live char-by-char highlighting, six built-in passages, paste-your-own and a 30-run history with per-duration best scores — entirely in your browser.",
      what:
        "A typing speed test measures how fast and accurately you can type a known passage. Toollyz Typing Speed Test runs entirely in your browser: pick a duration (15, 30, 60 or 120 seconds), pick a passage (Pangram Drills, Alice in Wonderland excerpt, Moby-Dick opening, a TypeScript code snippet, digits of π or a Common-English-words drill) or paste your own paragraph, and start typing. The text renders character by character — correct keystrokes turn emerald, mistakes are highlighted in rose and the current target glows with a primary underline. WPM is calculated as the standard 5-character word convention (correct chars ÷ 5 ÷ minutes elapsed), Raw WPM ignores errors and Accuracy is correct ÷ total typed. The test ends when the timer hits zero or you reach the end of the passage, whichever comes first. The 30 most recent runs save to localStorage, with per-duration best scores surfaced in the controls. Toollyz has no backend — every keystroke stays on your device.",
      how: [
        "Pick a duration (15 / 30 / 60 / 120 seconds) and a passage — or paste your own text.",
        "Start typing in the input — the timer begins automatically.",
        "Watch live WPM, raw WPM, accuracy, errors and time remaining in the hero.",
        "When the timer hits zero (or you finish the passage), the run lands in the History list.",
      ],
      benefits: [
        "Four duration presets (15 / 30 / 60 / 120 seconds) with auto-start when you type the first character.",
        "Live char-by-char highlighting — correct in emerald, mistakes in rose, current target underlined.",
        "Five live stats: WPM, raw WPM, accuracy %, error count and time remaining.",
        "Six built-in passages plus paste-your-own (pangrams, classic literature, code, digits, common-word drills).",
        "30-run history with per-duration best score surfaced alongside the controls.",
        "Random passage button to shuffle between built-ins.",
        "Standard WPM formula (correct chars ÷ 5 ÷ minutes elapsed) plus an honest \"raw WPM\" upper bound.",
        "100% private — Toollyz has no backend, keystrokes and history stay in your browser.",
      ],
      relatedSlugs: [
        "cps-test",
        "spacebar-counter",
        "reaction-time-test",
        "keyboard-tester",
      ],
      faqs: [
        {
          q: "How is WPM calculated?",
          a: "WPM = correct characters ÷ 5 ÷ minutes elapsed. The 5-character convention is the standard used by virtually every typing test (Monkeytype, 10FastFingers, traditional CPM-based scoring). Raw WPM ignores errors and uses all typed characters — it's a speed upper bound.",
        },
        {
          q: "What counts as an error?",
          a: "Every keystroke that lands at a position where the typed character doesn't match the expected character increments the error counter. Backspacing and re-typing correctly still counts as one mistake — typists are scored for both speed and one-shot accuracy.",
        },
        {
          q: "Is paste cheating?",
          a: "Pasting fills the textarea instantly so your effective WPM would be implausibly high. The tool doesn't actively block paste because it sometimes helps people set up custom passages, but pasting during a run will look obvious in the result.",
        },
        {
          q: "Why does the timer start when I press a key?",
          a: "Auto-start removes the \"3, 2, 1, go\" overhead so you can warm up by skimming the passage and start the moment you're ready. The clock begins at the first keystroke and ends when the duration expires.",
        },
        {
          q: "Can I bring my own passage?",
          a: "Yes — pick \"Paste your own…\" in the Passage selector and drop in any text. The pasted text stays on your device; Toollyz has no backend.",
        },
        {
          q: "What does Raw WPM mean?",
          a: "Raw WPM is WPM that ignores correctness — total chars typed ÷ 5 ÷ minutes. It's a speed ceiling. A big gap between Raw WPM and WPM means you're typing fast but making mistakes; close the gap by slowing down and focusing on accuracy.",
        },
        {
          q: "Is my history saved across devices?",
          a: "No — it's stored in your browser's localStorage on this device. Toollyz has no server, so syncing is out of scope. Clearing site data wipes the history.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the live highlighting, stats and history all work on mobile. Typing speed on a touchscreen is naturally lower than on a physical keyboard; the test doesn't differentiate.",
        },
        {
          q: "What's a good WPM?",
          a: "Average is around 40 WPM; touch-typists hit 60–80; professional transcriptionists land 80–120; the world record (Stella Pajunas, 1946) was 216 WPM on an IBM Electric typewriter. Don't compare to the records; focus on improving against your own best.",
        },
        {
          q: "Is this Typing Speed Test free?",
          a: "Completely free with no signup and no limits. Run as many tests as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "cps-test",
    name: "CPS Test (Clicks Per Second)",
    tagline: "Live CPS counter with 1/5/10/30/60 s windows and history.",
    description:
      "Measure your clicks per second over a 1, 5, 10, 30 or 60-second window. Live CPS as you click, best-score-per-duration in the hero and a 30-run history. Free, private, browser-only.",
    categoryId: "calculators",
    icon: MousePointerClick,
    status: "live",
    featured: true,
    keywords: [
      "cps test",
      "clicks per second test",
      "click speed test",
      "cps counter",
      "fastest click test",
      "10 second cps test",
      "5 second cps test",
      "free cps test",
      "browser cps test",
      "online cps test",
      "click speed counter",
      "click test",
      "minecraft cps test",
      "cps measurement",
    ],
    seo: {
      title: "CPS Test — Free Clicks Per Second Test (1 / 5 / 10 / 30 / 60 s)",
      description:
        "Measure your clicks per second with Toollyz CPS Test. Five duration windows, live CPS as you click, best score per duration surfaced in the hero and a 30-run history — entirely in your browser.",
      what:
        "A CPS test measures how many times you can click a target in a fixed time window. Toollyz CPS Test runs entirely in your browser using a `requestAnimationFrame` countdown that starts the moment you click the big target button. Pick a window (1, 5, 10, 30 or 60 seconds), click as fast as you can and watch the live count, live CPS (events ÷ seconds elapsed) and time remaining update in real time. When the timer hits zero the final CPS is recorded in a 30-run history alongside its duration and timestamp; the best CPS for the current duration surfaces in the hero so you always know what to beat. Each click on the target button dispatches a single `click` event — autoclickers obviously work but that's between you and the rules of whatever game or benchmark you're warming up for. Toollyz has no backend, so every click stays on your device.",
      how: [
        "Pick a duration (1 / 5 / 10 / 30 / 60 seconds).",
        "Click the big target — the timer begins on the first click.",
        "Keep clicking; the live count, CPS and time remaining update each frame.",
        "When time runs out, the result lands in the History list with the per-duration best surfaced in the hero.",
      ],
      benefits: [
        "Five duration windows (1 / 5 / 10 / 30 / 60 s) covering burst tests and endurance.",
        "rAF-based countdown for accurate elapsed time with no setInterval jitter.",
        "Live CPS calculated as events ÷ seconds elapsed and updated every frame.",
        "Best-score-per-duration surfaced in the hero so you always know your target.",
        "30-run history with timestamp, count and CPS.",
        "Animated number counters that respect reduced-motion preferences.",
        "Big touch-friendly target works equally well on desktop and mobile.",
        "100% private — Toollyz has no backend, clicks stay in your browser.",
      ],
      relatedSlugs: [
        "drag-click-test",
        "spacebar-counter",
        "reaction-time-test",
        "mouse-click-tester",
      ],
      faqs: [
        {
          q: "What's a good CPS?",
          a: "For a 10-second test on a regular mouse, 6–8 CPS is solid; 10+ is excellent; 15+ usually means jitter clicking or butterfly clicking (rapid alternating fingers). Top performers reach 20+ CPS for short bursts. Don't compare to autoclicker scores; those don't reflect human speed.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the big target button is touch-friendly and each tap counts as a click. Touchscreen CPS is naturally lower than mouse CPS; the test doesn't differentiate.",
        },
        {
          q: "Why does the timer start with the first click?",
          a: "Auto-start removes the \"3, 2, 1, go\" overhead so your reaction time doesn't taint the result. The first click begins the timer; subsequent clicks contribute to the count.",
        },
        {
          q: "Is autoclicking detected?",
          a: "No. The tool counts every browser `click` event regardless of how it was generated. If you're testing for a game or benchmark with rules, this is between you and the judge.",
        },
        {
          q: "What's the difference between this and the Drag Click Test?",
          a: "CPS counts discrete clicks (mousedown + mouseup pairs). The Drag Click Test counts mousedown events that occur while the cursor is moving — it's a different mouse technique aimed at gaming benchmarks (notably Minecraft PvP). Toollyz Drag Click Test is honest about the fact it approximates the technique through Pointer Events.",
        },
        {
          q: "Why are the numbers showing decimals?",
          a: "CPS is a rate (events per second), so it's reported with two decimal places (e.g. 7.42 CPS = 74 clicks in 10 seconds). The total click count itself is always a whole number.",
        },
        {
          q: "Is the test fair across browsers?",
          a: "Mostly. Event dispatch is fast enough that browser differences are within a few percent for human-scale tests. Some browsers throttle background tabs aggressively, so keep this tab focused for the most accurate result.",
        },
        {
          q: "Will rapid clicks ever be missed?",
          a: "Browsers can throttle very fast click sequences (often above ~25 events/second), so extreme autoclicker rates may report lower than the underlying hardware. For human speeds (≤20 CPS) every click is registered.",
        },
        {
          q: "Is my history shared?",
          a: "No. History is saved only in your browser's localStorage. Toollyz has no backend — nothing is uploaded, nothing is shared across devices.",
        },
        {
          q: "Is this CPS Test free?",
          a: "Completely free with no signup and no limits. Run as many tests as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "drag-click-test",
    name: "Drag Click Test",
    tagline: "Counts clicks while the cursor is moving — honest browser approximation.",
    description:
      "Approximate a drag-click run in your browser — rapid clicks while the cursor is in motion. Five duration windows, live CPS, rejection count for stationary clicks and a 30-run history. Toollyz is honest that real drag clicking is a hardware technique; this tool counts pointer-down events during movement.",
    categoryId: "calculators",
    icon: Move,
    status: "live",
    featured: true,
    keywords: [
      "drag click test",
      "drag clicking test",
      "minecraft drag click",
      "drag click cps",
      "gaming click test",
      "drag click counter",
      "browser drag click test",
      "free drag click test",
      "drag click practice",
      "fast drag click",
      "drag click bench",
      "click while moving",
      "pointer drag click",
      "click during drag",
    ],
    seo: {
      title: "Drag Click Test — Honest Browser Drag-Click Approximation (Free)",
      description:
        "Count rapid clicks while moving the cursor with Toollyz Drag Click Test. Five duration windows, live CPS, a stationary-click rejection counter and a 30-run history — entirely in your browser.",
      what:
        "Drag clicking in games like Minecraft uses friction between your finger and a specific mouse-button shape to produce dozens of clicks per drag — it's a hardware technique that can't be replicated 1-to-1 in a browser. Toollyz Drag Click Test is an honest approximation: it counts every pointer-down event that arrives while the cursor is in motion (defined as ≥ 4 px of cumulative movement in the last 220 ms) and rejects clicks that arrive while the cursor is stationary. Pick a duration (1, 5, 10, 30 or 60 seconds), click and drag on the target — the first pointer-down arms the test, subsequent ones contribute to the count if you're moving, otherwise they land in the rejected counter. Live CPS, time remaining, the best score for the chosen duration and a 30-run history all surface in the UI. Toollyz is up-front that this is not a hardware drag-click detector; it's the closest the browser can get with Pointer Events.",
      how: [
        "Pick a duration (1 / 5 / 10 / 30 / 60 seconds).",
        "Press the target with the mouse to arm — the first pointer-down begins the timer.",
        "Keep clicking while you drag the cursor across the target — non-moving clicks land in the rejected counter.",
        "When the timer runs out the result is saved to the History list with per-duration best surfaced in the hero.",
      ],
      benefits: [
        "Honest approximation of the technique — clicks-while-moving counted, stationary clicks rejected with a visible counter.",
        "Pointer Events (single code path for mouse, trackpad, touch and stylus).",
        "Five duration windows: 1, 5, 10, 30 and 60 seconds.",
        "Live CPS, time remaining and best-per-duration in the hero.",
        "30-run history with per-run count and CPS.",
        "Configurable movement parameters in source — 4 px / 220 ms thresholds documented in the UI.",
        "Touch friendly — `touch-action: none` on the target prevents accidental scroll.",
        "100% private — Toollyz has no backend, every event stays in your browser.",
      ],
      relatedSlugs: [
        "cps-test",
        "mouse-click-tester",
        "spacebar-counter",
        "reaction-time-test",
      ],
      faqs: [
        {
          q: "Is this a real drag-click detector?",
          a: "No. Real drag clicking depends on the physical mouse hardware (a sharp mouse-button edge plus friction tape) and the OS interpreting the resulting chatter as separate clicks. Browsers see only the click events the OS forwards. Toollyz approximates the technique by counting pointer-down events that arrive while the cursor is in motion — a useful warmup, not a hardware benchmark.",
        },
        {
          q: "What counts as moving?",
          a: "≥ 4 px of cumulative pointer movement in the last 220 ms before the click. If you click while the cursor is stationary, the click lands in the rejected counter (visible in the hero) rather than the score.",
        },
        {
          q: "Why is my rejected count high?",
          a: "Either you stopped moving mid-drag (the cursor needs continuous motion) or your hardware is producing chatter-clicks the browser can't space out. Try moving more steadily and clicking only while the cursor is travelling.",
        },
        {
          q: "Does it work on touch?",
          a: "Yes — Pointer Events unify mouse, trackpad, touch and stylus. On a phone, swipe across the target while tapping rapidly. Touchscreen drag-click is naturally lower than mouse drag-click.",
        },
        {
          q: "How does this compare to the CPS Test?",
          a: "The CPS Test counts every discrete click without checking for movement — a pure clicks-per-second benchmark. The Drag Click Test only counts clicks during movement, modelling the gaming technique. Most people score lower on Drag Click than on CPS for the same duration.",
        },
        {
          q: "Will autoclickers be detected?",
          a: "No — the tool counts browser click events and doesn't try to distinguish autoclicks from human ones. If you're testing for a game or benchmark with rules, this is between you and the judge.",
        },
        {
          q: "Why does the page disable scroll on the target?",
          a: "`touch-action: none` on the target prevents your finger swipes from scrolling the page on mobile, so every drag stays on the target.",
        },
        {
          q: "What's a good score?",
          a: "There's no universal benchmark because real drag-click rates depend on hardware. In-browser, anywhere from 12 to 30 CPS in a 5-second window is impressive for human input. Don't chase 100 CPS scores from autoclickers.",
        },
        {
          q: "Is my history saved?",
          a: "Yes — the 30 most recent runs save to localStorage on this device only. Toollyz has no backend; nothing is uploaded or shared.",
        },
        {
          q: "Is this Drag Click Test free?",
          a: "Completely free with no signup and no limits. Run as many tests as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "spacebar-counter",
    name: "Spacebar Counter",
    tagline: "Press Space as fast as you can — auto-repeats ignored.",
    description:
      "Count how many times you can press the Space bar in 1, 5, 10, 30 or 60 seconds. OS auto-repeats are detected and skipped, live presses-per-second updates each frame, and the 30 most recent runs save to local history. Free, private, browser-only.",
    categoryId: "calculators",
    icon: SquareAsterisk,
    status: "live",
    featured: true,
    keywords: [
      "spacebar counter",
      "space bar counter",
      "spacebar test",
      "spacebar click test",
      "fastest spacebar",
      "spacebar counter online",
      "free spacebar test",
      "browser spacebar test",
      "spacebar tap test",
      "spacebar speed test",
      "spacebar press test",
      "keyboard tap test",
      "space test",
      "spacebar 10 seconds",
    ],
    seo: {
      title: "Spacebar Counter — Free Space-Press Test (Auto-Repeats Ignored)",
      description:
        "Count Space presses in 1 / 5 / 10 / 30 / 60-second windows with Toollyz Spacebar Counter. OS auto-repeats are detected and skipped, live presses-per-second updates each frame, 30-run history — entirely in your browser.",
      what:
        "A spacebar counter measures how many times you can press the Space bar in a fixed time window. Toollyz Spacebar Counter runs entirely in your browser using `keydown` listeners on the window. Pick a duration (1, 5, 10, 30 or 60 seconds), click the focusable pad to capture keyboard focus, then start pressing Space — the first press arms the timer and subsequent presses contribute to the count. Crucially, the counter checks `event.repeat` on every keydown so that OS-level auto-repeats (which fire when you hold a key down) don't pollute the score; rejected auto-repeats are surfaced in a small counter beside the main stats so you know exactly what's happening. Live presses-per-second, time remaining and the best score for the chosen duration update each frame; the 30 most recent runs save to localStorage. Toollyz has no backend — every press stays on your device.",
      how: [
        "Pick a duration (1 / 5 / 10 / 30 / 60 seconds).",
        "Click the spacebar pad once to give the page keyboard focus.",
        "Press Space as fast as you can — the first press starts the timer, the rest count toward the score.",
        "When the timer hits zero, the result lands in History with per-duration best surfaced in the hero.",
      ],
      benefits: [
        "Five duration windows: 1 / 5 / 10 / 30 / 60 s.",
        "OS auto-repeats detected via `event.repeat` and shown in a separate counter — only fresh presses score.",
        "Live presses-per-second updated every frame via requestAnimationFrame.",
        "30-run history with timestamp, count and per-second rate.",
        "Per-duration best score surfaced in the hero so you always know your target.",
        "Page consumes the Space keypress to prevent accidental scroll while you tap.",
        "Touch-friendly via the focusable pad — works on tablets with a connected keyboard.",
        "100% private — Toollyz has no backend, presses stay in your browser.",
      ],
      relatedSlugs: [
        "cps-test",
        "drag-click-test",
        "typing-speed-test",
        "keyboard-tester",
      ],
      faqs: [
        {
          q: "Why are some presses ignored?",
          a: "When you hold Space down, the operating system generates auto-repeat keydown events. Toollyz detects these via the `event.repeat` flag and skips them so the score reflects actual finger taps, not key holds. Skipped auto-repeats are shown in a counter so you can see what's being filtered.",
        },
        {
          q: "Why do I have to click the pad first?",
          a: "Browsers only deliver keyboard events to focused elements. The pad is a focusable element so clicking it captures keyboard input; before that, the keystrokes might trigger scroll or shortcuts in the page itself.",
        },
        {
          q: "Why doesn't the page scroll when I press Space?",
          a: "Toollyz calls `event.preventDefault()` on the Space keydown so the browser's default scroll is suppressed while the test runs. The rest of the page still scrolls with the wheel, trackpad or arrow keys.",
        },
        {
          q: "Does the test work with a touchscreen keyboard?",
          a: "Yes, but mobile soft keyboards often suppress auto-repeats and report each press cleanly — so your effective rate on a phone is whatever you can tap. The score still counts.",
        },
        {
          q: "How does this differ from the Typing Speed Test?",
          a: "Typing Speed Test scores correct characters typed against a target passage and produces WPM. Spacebar Counter only watches the Space key and reports raw presses per second. They measure different things.",
        },
        {
          q: "What's the highest possible score?",
          a: "Most humans top out around 8–10 Space presses per second; sustained 12+ requires unusual hand muscle. Hardware (some membrane keyboards have higher key-actuation delays) and the OS's key-repeat thresholds set a practical ceiling.",
        },
        {
          q: "Are auto-clickers / macros counted?",
          a: "Any keyboard event the browser delivers as a fresh keydown counts. If a macro releases the key cleanly between presses, the tool sees normal keydowns; if the macro holds the key, those become auto-repeats and get rejected.",
        },
        {
          q: "Is my history saved across devices?",
          a: "No — only on this device, in localStorage. Toollyz has no backend; nothing is uploaded or synced.",
        },
        {
          q: "Does the test penalise mistakes?",
          a: "No — there's no \"wrong\" Space press, so every fresh keydown counts. Use the Typing Speed Test if you want accuracy in addition to speed.",
        },
        {
          q: "Is this Spacebar Counter free?",
          a: "Completely free with no signup and no limits. Run as many tests as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "reaction-time-test",
    name: "Reaction Time Test",
    tagline: "Click when the screen turns green — millisecond accuracy.",
    description:
      "Measure your visual reaction time in milliseconds. Random 1.5–5 s wait, early-click detection, latest / best / 5-trial average / median in the hero and a 30-run history with categorical labels. Free, private, browser-only.",
    categoryId: "calculators",
    icon: Timer,
    status: "live",
    featured: true,
    keywords: [
      "reaction time test",
      "reflex test",
      "reaction time online",
      "human reaction time",
      "visual reaction time",
      "reaction speed test",
      "reaction time milliseconds",
      "free reaction time test",
      "browser reaction test",
      "online reflex test",
      "ms reaction test",
      "reaction time benchmark",
      "click when green test",
      "reaction average",
    ],
    seo: {
      title: "Reaction Time Test — Free Visual Reflex Test in Milliseconds",
      description:
        "Measure your reaction time with Toollyz Reaction Time Test. Random delay, early-click detection, latest / best / 5-trial average / median stats and a 30-run history with categorical labels — entirely in your browser.",
      what:
        "A reaction time test measures how fast you can respond to a visual signal. Toollyz Reaction Time Test runs entirely in your browser: click the big pad to arm, the background turns amber while the test waits a random 1.5–5 seconds, then it snaps to emerald with a giant \"CLICK!\" prompt. The moment you click, the elapsed time from the green flash is recorded using `performance.now()` (sub-millisecond resolution per your browser). Early clicks during the amber wait are detected and shown as \"Too soon!\" so anticipation can't game the score. The hero surfaces four live stats — latest, best ever, average of the last 5 runs and median across all runs — and each result earns a categorical label (Lightning &lt; 180 ms, Excellent &lt; 220 ms, Quick &lt; 280 ms, Average &lt; 340 ms, Slow &lt; 420 ms, Sluggish above that). The 30 most recent runs save to localStorage so you can track improvement over time. Toollyz has no backend — every measurement stays on your device.",
      how: [
        "Click the big pad to arm the test — the background turns amber.",
        "Wait for the random 1.5–5 second delay; clicking during the wait counts as \"Too soon!\".",
        "When the background turns emerald with the CLICK! prompt, tap as fast as you can.",
        "Your time and category land in the hero and the History list — click anywhere to go again.",
      ],
      benefits: [
        "Sub-millisecond timing via `performance.now()` — accuracy is whatever your browser exposes (typically 0.1–1 ms).",
        "Random 1.5–5 s wait so you can't anticipate the signal.",
        "Early-click detection — anticipating clicks during the amber wait counts as \"Too soon!\".",
        "Four live hero stats: latest, best ever, average of the last 5 runs, median across all runs.",
        "Six categorical labels (Lightning / Excellent / Quick / Average / Slow / Sluggish) keyed to standard human reaction benchmarks.",
        "30-run history with timestamp and label per entry.",
        "Mobile-friendly — the big pad works equally well with mouse, trackpad and touch.",
        "100% private — Toollyz has no backend, runs stay in your browser.",
      ],
      relatedSlugs: [
        "cps-test",
        "drag-click-test",
        "spacebar-counter",
        "stopwatch",
      ],
      faqs: [
        {
          q: "What is reaction time?",
          a: "Reaction time is the interval between a stimulus (here, the screen turning green) and your motor response (clicking the mouse or tapping the screen). Visual reaction time is bottlenecked by retinal processing (~50 ms), visual cortex routing (~50 ms), motor planning (~50–100 ms) and the click hardware itself (~5–10 ms).",
        },
        {
          q: "What's a good reaction time?",
          a: "Most studies put simple visual reaction time at 200–300 ms for healthy adults, with a typical median around 250 ms. Under 200 ms is fast (or anticipated); under 150 ms is biologically very unlikely. Reaction time degrades a few ms per decade after age 20.",
        },
        {
          q: "Why does the test sometimes say \"Too soon!\"?",
          a: "If you click while the background is amber (during the random wait before the green signal), the test counts it as an early click. This stops people anticipating the signal and gaming the score. The amber → green transition is randomized between 1.5 and 5 seconds.",
        },
        {
          q: "How accurate is the timer?",
          a: "Toollyz uses `performance.now()`, which gives sub-millisecond timestamps but is rounded by your browser for privacy. Chrome and Firefox quantise to 0.1 ms in normal contexts and 1 ms in cross-origin isolation. The result is accurate to roughly ±1 ms.",
        },
        {
          q: "Why is my score worse on mobile?",
          a: "Touchscreens add 10–50 ms of input latency compared to a wired mouse. Bluetooth mice add another 5–15 ms. Wired mouse + LCD monitor with low input lag gives the fastest scores; the rest of your stack imposes a floor.",
        },
        {
          q: "Does input lag affect my reaction time?",
          a: "Yes — the measured time includes the path from your retina to the click handler. A high-refresh-rate display, low-latency mouse and a fast OS event pipeline can shave 10–30 ms off the reported number without your reflexes actually changing.",
        },
        {
          q: "Can I cheat with autoclickers?",
          a: "Sure, but the result is meaningless. The tool counts every click event regardless of source, so any visual stimulus would be hit before a human could process it. Save autoclickers for clicker tests.",
        },
        {
          q: "Why does the median differ from the average?",
          a: "Median is the middle value of all your runs sorted; it's less sensitive to outliers (one really slow run drags up the average). The 5-trial average reflects recent form; the all-time median reflects long-term ability.",
        },
        {
          q: "Is my history shared?",
          a: "No. It's stored only in your browser's localStorage on this device. Toollyz has no backend; nothing is uploaded or synced.",
        },
        {
          q: "Is this Reaction Time Test free?",
          a: "Completely free with no signup and no limits. Run as many tests as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "stopwatch",
    name: "Stopwatch",
    tagline: "Start / stop / lap / reset, sub-millisecond accurate, CSV export.",
    description:
      "Precise online stopwatch with sub-millisecond accuracy via performance.now() + requestAnimationFrame. Up to 200 laps with split times, fastest / slowest highlighted, CSV export and keyboard shortcuts (Space / L / R). Resume preserves elapsed time. Free, private, browser-only.",
    categoryId: "calculators",
    icon: Timer,
    status: "live",
    featured: true,
    keywords: [
      "stopwatch online",
      "online stopwatch",
      "stopwatch with laps",
      "lap timer",
      "precision stopwatch",
      "stopwatch keyboard shortcuts",
      "stopwatch csv export",
      "milliseconds stopwatch",
      "browser stopwatch",
      "free stopwatch",
      "private stopwatch",
      "running stopwatch",
      "race timer",
      "interval stopwatch",
    ],
    seo: {
      title: "Stopwatch — Precise Online Lap Timer With CSV Export (Free)",
      description:
        "Online stopwatch with sub-millisecond accuracy via performance.now(). Up to 200 laps with split times, fastest / slowest highlighted, CSV export and keyboard shortcuts (Space / L / R) — entirely in your browser.",
      what:
        "A stopwatch measures elapsed time from a start command. Toollyz Stopwatch runs entirely in your browser, using `performance.now()` for sub-millisecond resolution and `requestAnimationFrame` to repaint the display at your monitor's refresh rate. Press Start to begin, Stop to pause, Resume to continue, Lap to capture a split and Reset to clear. Each lap stores both its split (since the previous lap) and its elapsed time from start; up to 200 laps are kept. The summary panel surfaces the fastest and slowest splits with subtle background tints and the corresponding rows are highlighted in the list. Keyboard shortcuts give you Space (start/stop), L (lap) and R (reset). Copy the lap list to your clipboard as TSV or export to CSV for a spreadsheet. Laps and the paused elapsed time persist in localStorage between visits so a refresh doesn't lose your data. Toollyz has no backend — the stopwatch runs entirely on your device.",
      how: [
        "Press Start (or Space) to begin — the big display updates every frame.",
        "Press Lap (or L) at any point to capture a split; the list grows from the top.",
        "Press Stop (or Space) to pause; press Resume to continue from exactly where you left off.",
        "Copy laps to your clipboard or export as CSV; press Reset (or R) to clear everything.",
      ],
      benefits: [
        "Sub-millisecond accuracy via `performance.now()` + `requestAnimationFrame`.",
        "Up to 200 laps with both split time and elapsed-from-start.",
        "Fastest / slowest splits highlighted in the lap list and called out in a summary panel.",
        "Copy laps to clipboard as TSV or export as a tidy CSV file.",
        "Keyboard shortcuts: Space (start/stop), L (lap), R (reset).",
        "Resume preserves the accumulated elapsed time — pausing doesn't lose anything.",
        "Laps and paused state persist in localStorage so a refresh doesn't wipe your data.",
        "100% private — Toollyz has no backend, runs stay in your browser.",
      ],
      relatedSlugs: [
        "pomodoro-timer",
        "alarm-clock",
        "reaction-time-test",
        "unix-timestamp-converter",
      ],
      faqs: [
        {
          q: "How accurate is the stopwatch?",
          a: "It uses `performance.now()`, which gives sub-millisecond timestamps but is rounded by the browser for privacy. Chrome and Firefox quantise to 0.1 ms in normal contexts and 1 ms in cross-origin-isolated pages. The on-screen update rate matches your monitor's refresh rate (typically 60 Hz, so ~16.7 ms per frame) — but the underlying timestamp is precise.",
        },
        {
          q: "Does it keep running when the tab is hidden?",
          a: "Browsers throttle `requestAnimationFrame` to roughly 1 Hz when the tab is hidden, so the visual display freezes. But the elapsed time is recalculated from `performance.now()` on every visible frame, so when you switch back, the time jumps to the correct total. Nothing is lost.",
        },
        {
          q: "Can I export the laps?",
          a: "Yes — Copy puts a TSV (tab-separated) version on your clipboard, and the CSV button downloads `stopwatch-laps.csv` with columns lap, split_ms, split, elapsed_ms, elapsed. Both formats include the raw milliseconds for further analysis.",
        },
        {
          q: "What happens if I close the tab while it's running?",
          a: "The running state isn't persisted (only laps and the paused elapsed time are), so reopening will show the stopwatch at the last saved elapsed time and stopped. Trying to persist a \"running\" timer across reloads would be misleading because the timer isn't actually running while the page is closed.",
        },
        {
          q: "What keyboard shortcuts are available?",
          a: "Space toggles start/stop, L records a lap (while running), R resets everything. The shortcuts ignore typing in inputs and textareas so you don't accidentally lap while editing a label.",
        },
        {
          q: "Why are some laps highlighted?",
          a: "The fastest split is highlighted in emerald and the slowest in amber — a quick visual scan reveals your best and worst splits across the run. The summary panel above the list shows both with their formatted times.",
        },
        {
          q: "How many laps can I record?",
          a: "Up to 200 laps. Beyond that, oldest laps are trimmed. For longer training sessions or events, export the laps to CSV partway through to keep the full record.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes — the buttons are touch-friendly. The keyboard shortcuts only work with a physical keyboard; mobile users tap the buttons instead.",
        },
        {
          q: "Is my lap history shared across devices?",
          a: "No — it's stored only in localStorage on this device. Toollyz has no backend; nothing is uploaded or synced. Use the CSV export to share laps with another device.",
        },
        {
          q: "Is this Stopwatch free?",
          a: "Completely free with no signup and no limits. Run as many sessions as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "alarm-clock",
    name: "Alarm Clock",
    tagline: "Multiple alarms, four WebAudio tones, custom days, snooze.",
    description:
      "Set one or many alarms with labels, repeat schedules (once / daily / weekdays / weekends / custom days), four WebAudio tones (bell, chime, beep, buzz) and 5 / 10-minute snooze. Optional desktop notifications. Free, private, browser-only.",
    categoryId: "calculators",
    icon: AlarmClock,
    status: "live",
    featured: true,
    keywords: [
      "alarm clock online",
      "online alarm clock",
      "browser alarm",
      "free alarm clock",
      "multiple alarms",
      "alarm clock with snooze",
      "alarm clock tone",
      "alarm clock notification",
      "alarm clock label",
      "private alarm clock",
      "no-signup alarm clock",
      "web alarm clock",
      "alarm clock weekdays",
      "alarm clock custom days",
    ],
    seo: {
      title: "Alarm Clock — Free Browser Alarms With Snooze & Notifications",
      description:
        "Set one or many alarms with Toollyz Alarm Clock. Labels, repeat schedules, four WebAudio tones, 5 / 10-minute snooze and optional desktop notifications — entirely in your browser, no signup, no upload.",
      what:
        "An online alarm clock fires a tone (and optionally a desktop notification) at a chosen time. Toollyz Alarm Clock runs entirely in your browser using a 1 Hz tick that checks every alarm against the current time. Set as many alarms as you need; each has a 24-hour HH:MM time, a label, an enabled toggle, a repeat schedule (Once, Every day, Weekdays, Weekends or Custom with a per-day bitmask) and a tone — Bell (warm decay), Chime (three-note ascending C-E-G), Beep (two-tone alarm) or Buzz (low pulse) — all synthesised live with WebAudio so there are no audio files and no licensing concerns. When an alarm fires you can snooze for 5 or 10 minutes (creates a one-off alarm in the future) or stop it. Granting browser notification permission lets the alarm pop up an OS notification when it rings — useful for muted tabs. Crucially, browsers can't fire alarms when the page is closed, so Toollyz is honest about this in the UI: keep the tab open. The Toollyz Alarm Clock has no backend; alarms save to localStorage on this device only.",
      how: [
        "Click + Alarm to add one. Set its time, label, enable toggle, repeat schedule and tone.",
        "(Optional) Click Enable notifications in the clock to let your browser pop up desktop alerts.",
        "Keep the tab open — when an alarm hits, a banner appears and the tone plays.",
        "Hit Stop to silence, or + 5 min / + 10 min to snooze; the alarm is rescheduled as a one-off.",
      ],
      benefits: [
        "Multiple alarms with labels, enable toggle, repeat schedule and individual tone.",
        "Repeat options: Once, Every day, Weekdays, Weekends or a custom 7-day bitmask.",
        "Four WebAudio tones (Bell, Chime, Beep, Buzz) — synthesised live, no audio files.",
        "Test button next to each tone selector — listen before you commit.",
        "Snooze + 5 / + 10 minutes creates a one-off alarm in the future.",
        "Optional desktop notifications via the standard `Notification` API.",
        "Live next-fire time and \"in 2 h 4 m\" countdown for every enabled alarm.",
        "100% private — alarms save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "stopwatch",
        "pomodoro-timer",
        "reaction-time-test",
        "unix-timestamp-converter",
      ],
      faqs: [
        {
          q: "Does the alarm ring if I close the tab?",
          a: "No. Browsers don't run JavaScript in a closed tab, and Toollyz has no backend to fire a server-side push. Keep the tab open (pinning it is a good workaround) so the JS interval can detect the firing time.",
        },
        {
          q: "What happens if my computer is asleep when an alarm should fire?",
          a: "While asleep, the JS interval doesn't run, so the alarm is missed. When the system wakes, Toollyz checks against the last 30 seconds and will still fire a recently-due alarm if you wake quickly. For mission-critical wake-ups, use your OS or phone alarm app instead.",
        },
        {
          q: "Are the tones audio files?",
          a: "No — they're synthesised live with the WebAudio API. The Bell is a 660 Hz + 880 Hz sine pair with a 1.4 s decay; Chime is a C5-E5-G5 sine arpeggio; Beep alternates 1200 Hz and 600 Hz sawtooth pulses; Buzz is a 220 Hz square pulse. Nothing is downloaded, nothing is licensed.",
        },
        {
          q: "How does snooze work?",
          a: "Snooze creates a new one-off alarm 5 or 10 minutes from now with the same label (suffixed \"(snooze)\") and tone, and stops the current ring. The original alarm's schedule isn't touched, so a daily 07:00 alarm keeps repeating tomorrow even if you snooze today.",
        },
        {
          q: "Can I customise which days an alarm repeats?",
          a: "Yes — pick \"Custom…\" as the repeat option and toggle the day buttons (Sun, Mon, …, Sat). The alarm fires on whichever days are enabled in the bitmask.",
        },
        {
          q: "Do desktop notifications need permission?",
          a: "Yes — modern browsers ask the user for permission to show notifications. Toollyz exposes an \"Enable notifications\" button in the clock header that calls `Notification.requestPermission()`. You can revoke at any time in browser settings.",
        },
        {
          q: "Can I test a tone without setting an alarm?",
          a: "Yes — every tone selector has a small Test button next to it that plays the tone immediately. Great for previewing before you commit to a setting.",
        },
        {
          q: "What about timezones?",
          a: "Alarms are local to your device's timezone (whatever your browser reports). Travelling? Your alarms automatically retime in the new zone because they're stored as wall-clock HH:MM, not as a UTC timestamp.",
        },
        {
          q: "Are my alarms saved across devices?",
          a: "No — they're stored in localStorage on this device only. Toollyz has no backend; nothing is synced. Set them up once per device.",
        },
        {
          q: "Is this Alarm Clock free?",
          a: "Completely free with no signup and no limits. Set as many alarms as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "pomodoro-timer",
    name: "Pomodoro Timer",
    tagline: "Focus / short / long break cycles with chime and notifications.",
    description:
      "Run Pomodoro cycles in your browser — customisable focus / short / long break durations, configurable long-break interval, auto-advance, WebAudio chime, optional browser notifications and today&apos;s session tally. Free, private, browser-only.",
    categoryId: "calculators",
    icon: Hourglass,
    status: "live",
    featured: true,
    keywords: [
      "pomodoro timer",
      "online pomodoro timer",
      "free pomodoro timer",
      "focus timer",
      "pomodoro technique",
      "productivity timer",
      "25 minute timer",
      "work break timer",
      "pomodoro tracker",
      "browser pomodoro",
      "pomodoro notification",
      "study timer",
      "deep work timer",
      "interval timer",
    ],
    seo: {
      title: "Pomodoro Timer — Focus With 25 / 5 / 15-Minute Cycles (Free)",
      description:
        "Run Pomodoro cycles in your browser with Toollyz Pomodoro Timer. Customisable durations, auto-advance, WebAudio chime, optional desktop notifications and today&apos;s session tally — entirely in your browser, no signup.",
      what:
        "The Pomodoro Technique (Francesco Cirillo, 1980s) breaks focused work into 25-minute \"pomodoros\" separated by 5-minute breaks, with a longer 15-minute break every four pomodoros. Toollyz Pomodoro Timer runs the cycle entirely in your browser. A big circular progress ring shows the current phase (Focus = emerald, Short break = sky, Long break = indigo) with a giant MM:SS countdown beside today&apos;s focus-session count and total focus minutes. Every duration is customisable (focus 1–120 min, short break 1–120 min, long break 1–120 min, long-break interval 2–12 sessions); turn off auto-advance if you want to manually start each phase. When a phase completes the timer can play a WebAudio chime (synthesised live, no audio files) and pop up a desktop notification via the standard `Notification` API. Today&apos;s history shows every completed session with its duration; the tally resets at midnight. Toollyz has no backend — settings and today&apos;s log save to localStorage on this device only.",
      how: [
        "Pick durations and the long-break interval — defaults are 25 / 5 / 15 minutes with a long break every 4 focus sessions.",
        "Click Start to begin a focus session — the circular ring fills as the time elapses.",
        "When the timer hits zero, you hear a chime (and see a notification, if enabled). The next phase queues up automatically when Auto-advance is on, otherwise you start it manually.",
        "Today&apos;s session count and total focus minutes track your progress at the top of the page.",
      ],
      benefits: [
        "Customisable focus / short break / long break durations (1–120 min) and long-break interval (2–12 sessions).",
        "Circular progress ring with per-phase colour (emerald / sky / indigo) and giant MM:SS countdown.",
        "Auto-advance between phases — or pause between to manually start each.",
        "WebAudio chime synthesised live (no audio files) with a Test button.",
        "Optional browser notifications via the standard `Notification` API.",
        "Today&apos;s tally: focus sessions completed and total focus minutes.",
        "Per-session log of phase, duration and time of day; resets at midnight.",
        "100% private — Toollyz has no backend, history saves to localStorage on this device only.",
      ],
      relatedSlugs: [
        "stopwatch",
        "alarm-clock",
        "typing-speed-test",
        "calendar-generator",
      ],
      faqs: [
        {
          q: "What is the Pomodoro Technique?",
          a: "A time-management method by Francesco Cirillo (1980s). Work for 25 focused minutes (one pomodoro), then take a 5-minute break. After every fourth pomodoro, take a longer 15-minute break. The structure helps protect attention and prevent burnout.",
        },
        {
          q: "Can I change the durations?",
          a: "Yes — focus, short break and long break each accept 1–120 minutes. You can also pick how many focus sessions trigger the long break (2–12).",
        },
        {
          q: "Does the timer keep running when the tab is hidden?",
          a: "Browsers throttle `requestAnimationFrame` to roughly 1 Hz when the tab is hidden, so the visual countdown can lag briefly. The underlying logic tracks the wall-clock end time, so on the next visible frame the timer jumps to the correct remaining time — it doesn&apos;t drift.",
        },
        {
          q: "Does it work when my computer is asleep?",
          a: "No — JS doesn&apos;t run while the system sleeps. If you put the machine to sleep mid-focus, the timer pauses (effectively) and resumes when the system wakes. For unattended timing across sleep, use an OS-level timer.",
        },
        {
          q: "What does Auto-advance do?",
          a: "When on, the next phase starts automatically the moment the previous one completes (with a chime). When off, the timer holds at 00:00 until you press Start — useful if you want to physically walk away during the break and start it yourself.",
        },
        {
          q: "Is the chime an audio file?",
          a: "No — it&apos;s synthesised live with the WebAudio API. The work-end chime is a C5-then-E5 sine pair; the break-end chime is a G5-E5-C5 descending triad. Nothing is downloaded, nothing is licensed.",
        },
        {
          q: "What does the Today tally include?",
          a: "Today&apos;s count of completed focus sessions and total focus minutes (skipped sessions don&apos;t count). The session log resets at midnight local time so tomorrow&apos;s tally starts fresh.",
        },
        {
          q: "Can I see history beyond today?",
          a: "Not in this release — only today&apos;s sessions are kept. A long-term history is on the roadmap. For now, jot down each day&apos;s tally manually if you want a streak record.",
        },
        {
          q: "Are my settings shared across devices?",
          a: "No — they live in localStorage on this device only. Toollyz has no backend; nothing is synced. Set them up once per device.",
        },
        {
          q: "Is this Pomodoro Timer free?",
          a: "Completely free with no signup and no limits. Run as many cycles as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "age-difference-calculator",
    name: "Age Difference Calculator",
    tagline: "Precise calendar-correct difference with live update and totals.",
    description:
      "Calculate the exact difference between two dates as years / months / days / hours / minutes / seconds and as a total in every unit (years, months, weeks, days, hours, minutes, seconds, milliseconds). Live mode counts up in real time. Next anniversary helper with Feb 29 handling. Free and private.",
    categoryId: "calculators",
    icon: Cake,
    status: "live",
    featured: true,
    keywords: [
      "age difference calculator",
      "age calculator",
      "date difference calculator",
      "years between dates",
      "months between dates",
      "days between dates",
      "calendar difference",
      "exact age calculator",
      "live age counter",
      "next birthday calculator",
      "feb 29 birthday calculator",
      "browser age calculator",
      "free age calculator",
      "anniversary calculator",
    ],
    seo: {
      title: "Age Difference Calculator — Exact Years / Months / Days (Free)",
      description:
        "Calculate the precise difference between two dates with Toollyz Age Difference Calculator. Calendar-correct breakdown, totals in every unit, live mode and next-anniversary helper — entirely in your browser.",
      what:
        "An age-difference calculator returns the exact gap between two moments in time. Toollyz Age Difference Calculator runs the math entirely in your browser using calendar-correct subtraction — the same convention Day.js&apos;s `.diff` uses, where 30 Jan + 1 month = 28 Feb in a non-leap year. Two `datetime-local` inputs accept the from and to dates down to the minute, and the result is shown two ways: as a six-part breakdown (years, months, days, hours, minutes, seconds) in the hero, and as totals in eight units (decimal years using the Gregorian mean of 365.2425 days/year, months, weeks, days, hours, minutes, seconds and milliseconds). Live mode updates the `To` field once per second so a birthday counter ticks up in real time. The Next Anniversary helper computes the upcoming celebration with Feb-29 handling — in non-leap years the anniversary falls on Feb 28 of that year and snaps back to Feb 29 the following leap year. The current pair persists in localStorage; Toollyz has no backend.",
      how: [
        "Pick your From date (e.g. a birthday) and a To date (defaults to now).",
        "Watch the six-part breakdown and total-in-every-unit panel update.",
        "Leave Live mode on for a real-time counter, or turn it off to compute a fixed gap.",
        "Click Copy summary for a shareable line, or Swap to invert the dates.",
      ],
      benefits: [
        "Calendar-correct breakdown: years / months / days / hours / minutes / seconds in the hero.",
        "Totals in eight units (years, months, weeks, days, hours, minutes, seconds, milliseconds).",
        "Decimal years using the Gregorian mean of 365.2425 days per year.",
        "Live mode updates the To field once per second for a real-time counter.",
        "Next-anniversary helper with explicit Feb 29 handling.",
        "Datetime-local inputs preserve your timezone — no UTC surprises.",
        "Reversed-direction detection — the calculator shows the absolute difference and tells you the dates were swapped.",
        "100% private — Toollyz has no backend, dates save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "business-days-calculator",
        "leap-year-checker",
        "unix-timestamp-converter",
        "calendar-generator",
      ],
      faqs: [
        {
          q: "How does the calendar-correct subtraction work?",
          a: "Toollyz subtracts month-by-month, borrowing days from the prior month when needed. For example, going from 30 Jan 2026 to 28 Feb 2026 is 0 years, 1 month, 0 days (a full calendar month) — not 29 days. This matches what Day.js&apos;s `.diff` and ICU&apos;s relative-time formatters do.",
        },
        {
          q: "Why is decimal years slightly different from `years + months/12`?",
          a: "Pure division ignores leap days. Decimal years uses the Gregorian mean of 365.2425 days per year (the average length when leap years are counted properly), so a span of 1 year and 1 day reports as 1.003 years rather than 1.000.",
        },
        {
          q: "What happens with Feb 29 birthdays?",
          a: "The Next Anniversary helper detects a Feb 29 birthday and bumps it to Feb 28 in non-leap years — the most widely-used convention. The following leap year, it lands on Feb 29 again. Both behaviours match how most calendars handle leap-day birthdays.",
        },
        {
          q: "Does it handle timezones?",
          a: "The inputs are `datetime-local`, which means they're interpreted in your browser&apos;s local timezone. Travelling between timezones doesn&apos;t change the calculation — only the wall-clock values you typed do. For UTC math, paste an ISO string starting with `Z` into the address bar or the Unix Timestamp Converter.",
        },
        {
          q: "What's the maximum precision?",
          a: "The breakdown is to the second; the totals include milliseconds. Browsers&apos; `Date` API is millisecond-precision, so you can&apos;t go finer than that without `performance.now()`-based tools (try the Stopwatch).",
        },
        {
          q: "Why does Live mode tick once per second?",
          a: "A 1 Hz update is enough for a human-readable age counter without churning the CPU. The underlying calculation is millisecond-precise; only the display is throttled.",
        },
        {
          q: "Can I swap the dates?",
          a: "Yes — there's a swap button between the two inputs. If From is later than To, the calculator detects it automatically, computes the absolute difference and shows a banner telling you the order is reversed.",
        },
        {
          q: "Are my dates saved across devices?",
          a: "No — they're stored in localStorage on this device only. Toollyz has no backend; nothing is uploaded or synced.",
        },
        {
          q: "What about the time of day?",
          a: "Both inputs accept hours and minutes. The breakdown and totals account for them — a birthday at 08:30 will show 0 hours when the current time is 08:30, even if the dates haven&apos;t changed.",
        },
        {
          q: "Is this Age Difference Calculator free?",
          a: "Completely free with no signup and no limits. Calculate as many spans as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "business-days-calculator",
    name: "Business Days Calculator",
    tagline: "Working days between dates with custom weekends and holidays.",
    description:
      "Count business days between two dates with configurable weekend rules (Sat-Sun, Sun-only, none) and an arbitrary holiday list. Per-weekday breakdown, holiday parser with comments, and an Add-business-days mode that lands on a real working day. Free and private.",
    categoryId: "calculators",
    icon: CalendarDays,
    status: "live",
    featured: true,
    keywords: [
      "business days calculator",
      "working days calculator",
      "workdays between dates",
      "weekday counter",
      "business days online",
      "working days online",
      "skip weekends holidays",
      "add business days",
      "holiday calculator",
      "browser business days calculator",
      "free business days",
      "private business days",
      "business days with holidays",
      "custom weekend calculator",
    ],
    seo: {
      title: "Business Days Calculator — With Custom Weekends & Holidays (Free)",
      description:
        "Count business days between two dates with Toollyz Business Days Calculator. Custom weekend rules, an arbitrary holiday list (with comments), per-weekday breakdown and an Add-business-days mode — entirely in your browser.",
      what:
        "A business-days calculator counts the working days between two dates and adds working days to a start date. Toollyz Business Days Calculator runs entirely in your browser. Both modes share the same weekend and holiday config: by default Saturday + Sunday are weekends and the holidays list ships with a tiny example (you can paste any number of ISO-format dates with optional `# label` comments). The Count mode shows calendar days, business days, weekend days and excluded holidays in the hero, plus a per-weekday breakdown panel that highlights the configured weekend columns in amber. The Add mode takes a start date and a positive or negative count and lands on the next non-weekend, non-holiday day in that direction. Reverse the dates — the count comes out the same. Toollyz has no backend; the dates, weekend rules and holiday list save to localStorage on this device only.",
      how: [
        "Pick a From and To date — both dates are inclusive.",
        "Edit the weekend toggles (Sat / Sun) for regions where the working week differs.",
        "Paste public-holiday dates one per line in ISO format (`YYYY-MM-DD`) with optional `# label` comments.",
        "Switch to Add business days mode to find the date that's N working days away from a start.",
      ],
      benefits: [
        "Count mode: calendar days, business days, weekend days and holidays excluded in the hero plus a per-weekday breakdown.",
        "Add mode: positive or negative business-day offset that lands on a real working day.",
        "Configurable weekend rules — Sat-Sun, Sun-only or no weekend (for regions where Saturday or Sunday is a working day).",
        "Holiday parser tolerates `# comments` per line and reports invalid input.",
        "Inclusive date math — From and To are each counted as one day if they're working days.",
        "Per-weekday breakdown highlights weekend columns in amber so the visualisation matches the rule.",
        "Reverse the dates and get the same result — direction-agnostic counting.",
        "100% private — Toollyz has no backend, all settings save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "age-difference-calculator",
        "leap-year-checker",
        "calendar-generator",
        "unix-timestamp-converter",
      ],
      faqs: [
        {
          q: "Are From and To inclusive?",
          a: "Yes — both endpoints are counted. If From is Mon 1 Jun and To is Fri 5 Jun, that's 5 calendar days and 5 business days. Pick To = From + 1 day to count a single day.",
        },
        {
          q: "How do I add holidays?",
          a: "Paste them one per line in ISO format (YYYY-MM-DD). You can append a `# label` for documentation; the label is ignored by the parser. The parser tolerates extra whitespace and reports any line it couldn&apos;t parse.",
        },
        {
          q: "What if my weekend isn't Sat-Sun?",
          a: "Toggle the Sat / Sun checkboxes — Toollyz supports Sat-Sun (default), Sat-only, Sun-only and no weekend. For regions like Israel (Fri-Sat) or parts of the Middle East (Fri-only), a future release will expose every day individually.",
        },
        {
          q: "Does it know real-world public holidays?",
          a: "No — Toollyz doesn&apos;t bundle a holiday database. Paste the holidays for your country / year into the list. There are open holiday-data projects (e.g. date-holidays, nager.at) you can copy-paste from.",
        },
        {
          q: "How does Add business days work?",
          a: "It walks the calendar one day at a time, decrementing the remaining count only on non-weekend, non-holiday days. Negative values walk backwards. Adding zero from a weekend or holiday simply returns the same date (it doesn&apos;t advance to the next workday).",
        },
        {
          q: "Are the dates timezone-aware?",
          a: "They&apos;re local-date only (no time-of-day component). Each date is anchored to midnight in your browser&apos;s timezone, so DST transitions don&apos;t skew the count.",
        },
        {
          q: "What happens if I swap From and To?",
          a: "The math is direction-agnostic — Toollyz internally swaps them so the count comes out the same in both orders. The Swap button just flips the input values for readability.",
        },
        {
          q: "Are my settings shared across devices?",
          a: "No — they&apos;re stored in localStorage on this device only. Toollyz has no backend; nothing is uploaded or synced.",
        },
        {
          q: "Is this Business Days Calculator free?",
          a: "Completely free with no signup and no limits. Calculate as many ranges as you like — privately in your browser.",
        },
        {
          q: "How big can the range be?",
          a: "The Count mode iterates day-by-day, so multi-decade spans (~10k days) finish in milliseconds. For huge ranges (centuries), a closed-form calculation would be faster, but the simple version is more flexible with custom weekends and holidays.",
        },
      ],
    },
  },
  {
    slug: "leap-year-checker",
    name: "Leap Year Checker",
    tagline: "Yes/no answer plus the Gregorian rule, ranges and Feb 29 helper.",
    description:
      "Check if any year is a leap year with a big YES/NO answer, the Gregorian rule applied step-by-step, the previous and next 10 leap years, a leap years in a range list and a Feb 29 birthday counter. Free, private, browser-only.",
    categoryId: "calculators",
    icon: Calendar,
    status: "live",
    featured: true,
    keywords: [
      "leap year checker",
      "is leap year",
      "leap year calculator",
      "gregorian leap year",
      "leap year rule",
      "year checker",
      "february 29",
      "feb 29 birthday",
      "leap year list",
      "next leap year",
      "previous leap year",
      "leap years range",
      "free leap year checker",
      "browser leap year checker",
    ],
    seo: {
      title: "Leap Year Checker — Gregorian Rule, Range List & Feb 29 Helper",
      description:
        "Check any year for leap status with Toollyz Leap Year Checker. Big YES/NO answer, step-by-step Gregorian rule, previous and next 10 leap years, range list and a Feb 29 birthday counter — entirely in your browser.",
      what:
        "A leap year has 366 days instead of 365 — February gets a 29th day to keep the calendar synced with Earth&apos;s orbit. The Gregorian rule (since 1582) is: divisible by 4, unless divisible by 100, except when also divisible by 400. Toollyz Leap Year Checker takes a year and shows a big YES/NO answer plus the three-step rule resolved for that year (Is it divisible by 4? By 100? By 400?). It also lists the previous 10 and next 10 leap years (click any to jump to it), the leap years in a custom range and a Feb 29 birthday helper that tells you how many \"real\" Feb 29 birthdays a person has had between two years. Notable century years are flagged in the notes: 1600 and 2000 were leap years (also divisible by 400); 1700, 1800 and 1900 were not. Toollyz has no backend — every check runs in your browser.",
      how: [
        "Type a year into the input or click one of the preset chips.",
        "Read the big YES/NO answer and the three-step rule resolution.",
        "Use the previous / next 10 chips to jump to surrounding leap years.",
        "Set a range to list every leap year in it, or use the Feb 29 counter for birthday math.",
      ],
      benefits: [
        "Big YES/NO answer with emerald/rose colour coding for instant clarity.",
        "Three-step Gregorian rule resolution (divisible by 4, by 100, by 400) with per-step ticks.",
        "Previous 10 and next 10 leap years rendered as clickable chips.",
        "Range list with a custom From/To pair, showing every leap year between.",
        "Feb 29 birthday helper that counts \"real\" birthdays between two years.",
        "Preset chips for current year ±4, year 2000, 1900 and 1582 (Gregorian start).",
        "Notes call out historically tricky century years (1600, 1700, 1800, 1900, 2000).",
        "100% private — Toollyz has no backend, settings save to localStorage.",
      ],
      relatedSlugs: [
        "age-difference-calculator",
        "business-days-calculator",
        "calendar-generator",
        "unix-timestamp-converter",
      ],
      faqs: [
        {
          q: "What's the leap year rule?",
          a: "A year is a leap year if it&apos;s divisible by 4, unless it&apos;s divisible by 100 (a century year), except when it&apos;s also divisible by 400. So 2024 is a leap year (÷ 4), 1900 is not (÷ 100, not ÷ 400), 2000 is (both).",
        },
        {
          q: "Why do we have leap years?",
          a: "Earth&apos;s orbit around the Sun takes about 365.2422 days, not exactly 365. Adding a 29th February every four years (with the century corrections) keeps the calendar within a day of the seasons over thousands of years.",
        },
        {
          q: "What's the difference between Julian and Gregorian leap years?",
          a: "The Julian rule (45 BC) was simpler: every year divisible by 4 is a leap year. That over-counts by ~3 days every 400 years. The Gregorian reform (1582) added the \"divisible by 100 unless 400\" exception to correct the drift. Toollyz uses the Gregorian rule; for years before 1582 you may want the Julian rule instead.",
        },
        {
          q: "Which century years are leap years?",
          a: "Only those divisible by 400. So 1600 yes, 1700 no, 1800 no, 1900 no, 2000 yes, 2100 no, 2200 no, 2300 no, 2400 yes.",
        },
        {
          q: "Why is the Feb 29 birthday counter useful?",
          a: "People born on Feb 29 (\"leaplings\") only have their actual birthday every 4 years (or every 8 across a century skip). The helper counts how many leap years between two dates contain a Feb 29 — a fun way to compute someone&apos;s \"real\" birthday count.",
        },
        {
          q: "Are years before 1582 handled correctly?",
          a: "Toollyz uses the Gregorian rule even for pre-1582 years (the proleptic Gregorian calendar), which is the standard convention in software but not historically accurate. Real-world historians use the Julian calendar for those dates. The notes section calls this out.",
        },
        {
          q: "What's the maximum supported year?",
          a: "9999. The Gregorian rule will keep working for any year beyond that, but `Date` and most date pickers don&apos;t support years above 9999 cleanly.",
        },
        {
          q: "How many leap years are in a typical century?",
          a: "24 — every year divisible by 4 except the century year itself (unless that century is divisible by 400, in which case 25). The 21st century has 25 leap years because 2000 is a multiple of 400.",
        },
        {
          q: "Is my range saved across devices?",
          a: "No — the current year, range and birthday years are saved only in your browser&apos;s localStorage on this device. Toollyz has no backend.",
        },
        {
          q: "Is this Leap Year Checker free?",
          a: "Completely free with no signup and no limits. Check as many years as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "sunrise-sunset",
    name: "Sunrise & Sunset Time",
    tagline: "NOAA solar position offline; civil / nautical / astronomical twilights.",
    description:
      "Get sunrise, sunset, solar noon, day length and civil / nautical / astronomical twilights for any city or coordinates on any date. NOAA Solar Position Algorithm runs offline; city search uses the open-source Open-Meteo geocoder. Free and private.",
    categoryId: "calculators",
    icon: Sunrise,
    status: "live",
    featured: true,
    keywords: [
      "sunrise sunset calculator",
      "sunrise time",
      "sunset time",
      "solar noon",
      "day length calculator",
      "civil twilight",
      "nautical twilight",
      "astronomical twilight",
      "sunrise sunset by city",
      "sunrise sunset by coordinates",
      "polar day polar night",
      "browser sunrise calculator",
      "free sunrise calculator",
      "noaa solar position",
    ],
    seo: {
      title: "Sunrise & Sunset Time — NOAA Solar Position For Any City",
      description:
        "Find sunrise, sunset, solar noon, day length and civil / nautical / astronomical twilights with Toollyz Sunrise & Sunset Time. Browser-side NOAA Solar Position Algorithm; Open-Meteo geocoder for city search — no Toollyz server in the path.",
      what:
        "A sunrise/sunset calculator finds when the sun rises, when it sets, when it&apos;s at its highest point and the durations of the three twilight bands for a given (latitude, longitude, date). Toollyz Sunrise & Sunset Time implements NOAA&apos;s Solar Position Algorithm directly in the browser — the same equations used by gml.noaa.gov/grad/solcalc — so the solar math is offline and entirely client-side. Pick a location by searching a city (we call the open-source Open-Meteo geocoder directly from your browser, no Toollyz server in the path) or by typing latitude and longitude. The hero shows sunrise, solar noon and sunset in the location&apos;s timezone with the UTC time underneath, plus the day length in `Xh Ym Zs`. The twilight panel lists civil (sun 6° below the horizon — \"streetlights start\"), nautical (12° — \"horizon barely visible\") and astronomical (18° — \"true astronomical darkness\") dawns and dusks. At high latitudes the algorithm detects polar day and polar night and surfaces a banner explaining why some events are blank. Refraction is included via the official 90.833° zenith — results are accurate to ±1 minute for typical latitudes.",
      how: [
        "Search for a city (or paste latitude / longitude) and pick a date.",
        "Watch the sunrise / solar noon / sunset cards populate, with the day-length line below.",
        "Scroll to the Twilights panel for civil / nautical / astronomical dawn and dusk.",
        "Tap My location to pull your current coordinates via the browser&apos;s Geolocation API.",
      ],
      benefits: [
        "NOAA Solar Position Algorithm — accurate to ±1 minute for typical latitudes.",
        "Times displayed in the location&apos;s IANA timezone with UTC under each one.",
        "Civil / nautical / astronomical twilight bands, each with dawn and dusk times.",
        "Polar-day / polar-night detection — explicit banner instead of \"00:00\" placeholders.",
        "Open-Meteo geocoder for city search — browser-side direct, no Toollyz server.",
        "Browser Geolocation API for My location with explicit user-permission prompt.",
        "Day length displayed in hours, minutes and seconds.",
        "100% private — solar math runs offline, only city lookups touch the network.",
      ],
      relatedSlugs: [
        "world-clock",
        "calendar-generator",
        "leap-year-checker",
        "age-difference-calculator",
      ],
      faqs: [
        {
          q: "How accurate are the times?",
          a: "Within about ±1 minute for typical latitudes (40°N–40°S). At very high latitudes near the polar circles, the algorithm becomes more sensitive to small altitude and refraction effects and the error can grow to a few minutes. For sub-second astronomical precision, use a dedicated tool with the more elaborate SPA from NREL.",
        },
        {
          q: "Does the solar math need an internet connection?",
          a: "No — the NOAA Solar Position Algorithm runs entirely in your browser using `Math.sin` / `Math.cos`. Only the city search requires a connection; once you have coordinates, switching dates is fully offline.",
        },
        {
          q: "Which geocoder do you use?",
          a: "Open-Meteo (`https://geocoding-api.open-meteo.com`). It&apos;s free, requires no API key, supports CORS and ships with 200k+ cities. Your browser calls it directly; Toollyz has no server in the path.",
        },
        {
          q: "What are civil, nautical and astronomical twilight?",
          a: "Civil twilight is when the sun is 6° below the horizon — bright enough for most outdoor activities without artificial light. Nautical is when the sun is 12° below — the horizon is barely visible at sea. Astronomical is when the sun is 18° below — the sky is truly dark and astronomers can observe faint objects.",
        },
        {
          q: "Why is everything blank for some dates?",
          a: "At high latitudes (above the Arctic / Antarctic circles), there are days when the sun never rises or never sets — polar day and polar night. The calculator detects this and shows a banner explaining what&apos;s happening instead of bogus times.",
        },
        {
          q: "What timezone do I see the times in?",
          a: "The location&apos;s IANA timezone (e.g. America/New_York). The UTC time is shown underneath each card so you can cross-check or convert manually. The date input is interpreted as local-date in the location&apos;s timezone for consistency.",
        },
        {
          q: "Does altitude affect the results?",
          a: "Slightly — the official zenith already includes a small refraction correction for sea level. At significant elevation (>500 m) sunrise comes a minute or two earlier than the default and sunset is correspondingly later. Toollyz doesn&apos;t accept altitude in this release.",
        },
        {
          q: "Can I see times for tomorrow / yesterday?",
          a: "Yes — pick any date in the date input. The algorithm works for any year from ~1900 to ~2100 with the rated accuracy; it&apos;s more imprecise outside that range but still usable.",
        },
        {
          q: "Are my coordinates uploaded?",
          a: "Only when you click Search (the city name goes to Open-Meteo) or use My location (the browser asks for permission to share GPS coordinates with the page, which Toollyz then uses locally). Toollyz has no server, so coordinates never reach us.",
        },
        {
          q: "Is this Sunrise & Sunset tool free?",
          a: "Completely free with no signup and no limits. Look up as many cities and dates as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "world-clock",
    name: "World Clock",
    tagline: "Live multi-city clock with day/night and IANA timezones.",
    description:
      "Live clock for any number of cities — picked from the Open-Meteo geocoder and ticking against your browser&apos;s IANA tz database. Day/night badge computed with the NOAA solar algorithm; 12 / 24-hour toggle, show-seconds toggle, drag-friendly re-order. Free, private, browser-only.",
    categoryId: "calculators",
    icon: Globe,
    status: "live",
    featured: true,
    keywords: [
      "world clock",
      "online world clock",
      "multi timezone clock",
      "time zone clock",
      "city time clock",
      "live world clock",
      "remote team clock",
      "travel timezone clock",
      "city time tracker",
      "day night badge clock",
      "browser world clock",
      "free world clock",
      "private world clock",
      "iana timezones",
    ],
    seo: {
      title: "World Clock — Live Multi-City Clock With Day/Night Badge (Free)",
      description:
        "Track time across multiple cities with Toollyz World Clock. Live tick, IANA timezones, day/night badge via the NOAA solar algorithm, Open-Meteo city search, 12 / 24-hour and show-seconds toggles — entirely in your browser.",
      what:
        "A world clock keeps the current time across multiple cities visible at a glance. Toollyz World Clock ships with 8 default cities (New York, London, Berlin, Dubai, Mumbai, Singapore, Tokyo, Sydney) and lets you add as many more as you want via the open-source Open-Meteo geocoder — your browser hits the geocoder directly, Toollyz has no server in the path. Each city card shows the live time formatted in the city&apos;s IANA timezone (`Intl.DateTimeFormat` uses your browser&apos;s tz database so DST transitions match the OS), the local date and the UTC offset (computed from the actual `formatToParts` output so daylight-saving offsets are correct), plus a day / night badge calculated by running the NOAA Solar Position Algorithm on the city&apos;s coordinates — the card background gradients from amber for daytime cities to indigo for night-time ones. The top hero shows your own location with a Use my location button. Toggle 12 / 24-hour formatting and whether to show seconds (when seconds are off the clock ticks once every 30 seconds to save CPU). Re-order cards with Up / Down buttons. Settings save to localStorage on this device only.",
      how: [
        "Search for a city or tap Use my location to add it.",
        "Re-order the cards with Up / Down buttons so the most important cities appear first.",
        "Toggle 12 / 24-hour and show-seconds; the day/night badge updates as the sun sets in each city.",
        "Remove cards you don&apos;t need with the trash icon.",
      ],
      benefits: [
        "Live tick (1 Hz with seconds, 30 s without) so the cards stay fresh without spinning the CPU.",
        "IANA timezones via `Intl.DateTimeFormat` — DST and historical offsets match your OS.",
        "Day / night badge computed offline via the NOAA solar algorithm using each city&apos;s coordinates.",
        "Card background gradient hints at the day/night state (amber for day, indigo for night).",
        "Open-Meteo geocoder for city search — browser-side direct, no Toollyz server.",
        "Browser Geolocation API for adding your own location at the top of the list.",
        "12 / 24-hour and show-seconds toggles persist per device.",
        "100% private — settings save to localStorage; only city searches leave the browser.",
      ],
      relatedSlugs: [
        "sunrise-sunset",
        "unix-timestamp-converter",
        "alarm-clock",
        "stopwatch",
      ],
      faqs: [
        {
          q: "How accurate is the timezone data?",
          a: "It uses your browser&apos;s built-in IANA tz database (`Intl.DateTimeFormat`). Modern browsers ship a recent copy of the tz database, so DST transitions, historical offsets and political timezone changes match your OS. If a country redefines its timezone tomorrow, you&apos;ll need to update your browser to pick up the new rules.",
        },
        {
          q: "Where do new cities come from?",
          a: "Open-Meteo (`https://geocoding-api.open-meteo.com`). It&apos;s a free, key-less, CORS-enabled geocoder with 200k+ cities. Your browser calls it directly; Toollyz has no server in the path.",
        },
        {
          q: "How is the day / night badge calculated?",
          a: "Each city card runs the NOAA Solar Position Algorithm on its coordinates and the current date. If the current UTC instant is between sunrise and sunset for that city, the badge says Day; otherwise Night. Polar day and polar night are detected explicitly.",
        },
        {
          q: "Why does the seconds toggle change the tick rate?",
          a: "When seconds are shown, the clock has to repaint every second; when they&apos;re hidden, repainting once every 30 seconds is enough. The longer interval saves a bit of CPU and battery on idle tabs.",
        },
        {
          q: "Can the clock tick when the tab is in the background?",
          a: "Browsers throttle `setInterval` to ~1 minute in background tabs. The displayed time may lag briefly when you return to the tab; the very next tick recalculates from `Date.now()` so the lag never accumulates.",
        },
        {
          q: "Why does the UTC offset show the right value across DST?",
          a: "The offset is computed from `Intl.DateTimeFormat.formatToParts` — Toollyz formats the current instant in the target timezone, treats the result as if it were UTC, and subtracts. The difference is the correct DST-aware offset.",
        },
        {
          q: "Does it support timezones without coordinates?",
          a: "The city cards always include coordinates because the day/night badge requires them. If you need to track a bare timezone (no specific city), pick the capital city for that timezone — the time will be identical.",
        },
        {
          q: "Are my cities synced across devices?",
          a: "No — they&apos;re stored in localStorage on this device only. Toollyz has no backend; nothing is uploaded or synced. Add the same list on each device.",
        },
        {
          q: "Can I add my own location?",
          a: "Yes — click Use my location to share your GPS coordinates with the page. The browser asks for permission first; Toollyz uses the coordinates locally and never sends them anywhere.",
        },
        {
          q: "Is this World Clock free?",
          a: "Completely free with no signup and no limits. Track as many cities as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    tagline: "Standard EMI plus a full amortisation schedule and CSV export.",
    description:
      "Calculate your monthly loan EMI from principal, annual interest rate and tenure. See the principal-versus-interest split, a 100% amortisation schedule and download the schedule as CSV. 23 currencies; free and private.",
    categoryId: "calculators",
    icon: Wallet,
    status: "live",
    featured: true,
    keywords: [
      "emi calculator",
      "monthly emi",
      "loan emi calculator",
      "home loan emi",
      "car loan emi",
      "personal loan emi",
      "amortization schedule",
      "loan amortization calculator",
      "interest principal split",
      "browser emi calculator",
      "free emi calculator",
      "emi formula calculator",
      "emi csv export",
      "emi inr",
    ],
    seo: {
      title: "EMI Calculator — Monthly Loan EMI + Full Amortisation (Free)",
      description:
        "Calculate your monthly loan EMI with Toollyz EMI Calculator. Live principal/interest split, full amortisation schedule, CSV export and 23 currencies — entirely in your browser.",
      what:
        "An EMI (Equated Monthly Instalment) calculator works out the fixed monthly payment that pays off a loan in a chosen number of months at a chosen annual interest rate. Toollyz EMI Calculator implements the standard formula P × r × (1+r)ⁿ / ((1+r)ⁿ − 1) — where P is the principal, r is the monthly interest rate and n is the total number of months — entirely in your browser. The hero surfaces the monthly EMI, total interest, total payable and tenure in months alongside a principal-vs-interest split bar. Inputs include sliders + numeric inputs for principal, annual interest rate (0–20%) and tenure (1–30 years), plus a 23-currency selector that drives `Intl.NumberFormat`. The amortisation panel shows opening balance, EMI, principal portion, interest portion and closing balance for every month — by default the first 12 rows; expand to see all. Download the full schedule as CSV with one click. Toollyz has no backend; your draft saves to localStorage.",
      how: [
        "Pick your principal, annual interest rate and tenure with the sliders or numeric inputs.",
        "Watch the EMI, total interest and total payable update live in the hero.",
        "Expand the amortisation panel to see every month&apos;s breakdown.",
        "Click Export amortisation (CSV) for a spreadsheet-ready download.",
      ],
      benefits: [
        "Standard EMI formula: P × r × (1+r)ⁿ / ((1+r)ⁿ − 1).",
        "Live principal-vs-interest split bar with percentage labels.",
        "Full amortisation schedule with month, opening balance, EMI, principal, interest and closing balance.",
        "CSV export so you can analyse the schedule in any spreadsheet.",
        "23 currencies (USD, EUR, GBP, INR, JPY, CNY, AUD, CAD, CHF, SGD, HKD, NZD, KRW, MXN, BRL, ZAR, AED, SAR, TRY, SEK, NOK, DKK, PLN) via `Intl.NumberFormat`.",
        "Combined slider + numeric input so you can dial in big values quickly or pick exact amounts.",
        "Copy a one-line summary for sharing in chats or email.",
        "100% private — Toollyz has no backend, inputs save to localStorage.",
      ],
      relatedSlugs: [
        "loan-calculator",
        "gst-vat-calculator",
        "tip-calculator",
        "currency-converter",
      ],
      faqs: [
        {
          q: "What is EMI?",
          a: "EMI stands for Equated Monthly Instalment — the fixed amount you pay each month to repay a loan. Each instalment consists of two parts: an interest charge (proportional to the remaining balance) and a principal repayment. The interest portion shrinks over time as the balance drops; the principal portion grows.",
        },
        {
          q: "What's the EMI formula?",
          a: "EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where P is the principal (loan amount), r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the total number of monthly instalments. This is the standard formula every bank uses for amortising loans.",
        },
        {
          q: "Does it work for floating-rate loans?",
          a: "It computes the EMI as if the rate is fixed for the full tenure. Real floating-rate loans have an EMI that changes when the reference rate (repo / SOFR / SONIA) moves — you can recompute after each reset using the new outstanding principal and remaining tenure.",
        },
        {
          q: "What about processing fees, GST and insurance?",
          a: "Toollyz EMI Calculator only models the principal-and-interest cost. Banks usually add a one-time processing fee (~1–2%), GST on the interest portion (jurisdiction-dependent) and optional credit life insurance — none of those are included. Add them separately for the true total cost of borrowing.",
        },
        {
          q: "What's the maximum tenure?",
          a: "The slider goes up to 30 years; the numeric input allows up to 40. Most home loans cap out at 30 years; education and personal loans are usually shorter.",
        },
        {
          q: "Can I see the amortisation schedule?",
          a: "Yes — the panel below the inputs shows opening balance, EMI, principal, interest and closing balance for every month. By default it shows the first 12 months; click Show all to expand, or Export amortisation (CSV) for a spreadsheet-ready file.",
        },
        {
          q: "Why does the principal portion grow over time?",
          a: "Each EMI is a fixed total, but the interest part is proportional to the remaining balance. As the balance falls (you&apos;ve paid off some principal), the interest charge falls too — leaving more of each subsequent EMI to pay down principal. The pattern is the heart of amortisation.",
        },
        {
          q: "How accurate are the rounded values?",
          a: "Calculations run in IEEE 754 double precision — accurate to ~15 significant digits, which is well beyond what any bank rounds to. Each cell is displayed to two decimal places (or zero for zero-decimal currencies like JPY); the underlying numbers are unrounded.",
        },
        {
          q: "Are my numbers saved across devices?",
          a: "No — they&apos;re saved in localStorage on this device only. Toollyz has no backend; nothing is uploaded.",
        },
        {
          q: "Is this EMI Calculator free?",
          a: "Completely free with no signup and no limits. Compute as many EMIs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    tagline: "Compare up to 4 scenarios — frequency, rate, term, prepayment.",
    description:
      "Compare up to 4 loan scenarios side-by-side. Vary principal, interest rate, tenure, payment frequency (monthly / biweekly / weekly) and per-period prepayment to see total interest, total paid and months saved at a glance. 23 currencies. Free and private.",
    categoryId: "calculators",
    icon: Landmark,
    status: "live",
    featured: true,
    keywords: [
      "loan calculator",
      "loan payment calculator",
      "compare loan scenarios",
      "biweekly loan calculator",
      "weekly loan calculator",
      "loan with prepayment",
      "loan interest calculator",
      "mortgage calculator",
      "personal loan calculator",
      "car loan calculator",
      "loan amortization compare",
      "browser loan calculator",
      "free loan calculator",
      "loan total cost",
    ],
    seo: {
      title: "Loan Calculator — Compare 4 Scenarios Side-by-Side (Free)",
      description:
        "Compare up to 4 loan scenarios with Toollyz Loan Calculator. Monthly / biweekly / weekly payments, per-period prepayment and total interest in one view — entirely in your browser.",
      what:
        "A loan calculator works out the periodic payment, total interest and total cost for a borrow. Toollyz Loan Calculator goes further and runs up to four scenarios side-by-side, so you can see whether a 15-year fixed beats a 30-year fixed, or whether biweekly payments + a small extra-per-period prepayment beat the standard monthly schedule. The math is the standard amortising formula P × r × (1+r)ⁿ / ((1+r)ⁿ − 1) with r equal to the annual rate divided by periods-per-year (12 for monthly, 26 for biweekly, 52 for weekly). Per-period prepayment is modelled by simulating the schedule — the calculator counts how many fewer months it takes to pay off the loan when you add extra to every period. The card with the lowest total interest gets a green \"Lowest interest\" badge; the rest are easy to compare. Currency formatting uses `Intl.NumberFormat` across 23 ISO 4217 codes. Toollyz has no backend — scenarios save to localStorage on this device only.",
      how: [
        "Start with three default scenarios (30 yr, 15 yr, 30 yr + $200 extra) or click Reset to restore them.",
        "Edit any scenario&apos;s principal, rate, term, frequency or extra payment — the totals update live.",
        "Add up to one more scenario (max 4) or remove ones you don&apos;t need.",
        "Watch the Lowest interest badge move between scenarios as you experiment.",
      ],
      benefits: [
        "Side-by-side comparison of up to 4 scenarios.",
        "Three payment frequencies: Monthly (12/yr), Biweekly (26/yr), Weekly (52/yr).",
        "Per-period prepayment field that simulates the full schedule and reports months saved.",
        "Live total interest, total paid and number of periods per scenario.",
        "Lowest-interest badge highlights the best scenario in the current set.",
        "Editable scenario labels so &quot;30 yr fixed&quot; vs &quot;refinance offer&quot; reads naturally.",
        "23 currencies via `Intl.NumberFormat`.",
        "100% private — Toollyz has no backend, scenarios save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "emi-calculator",
        "gst-vat-calculator",
        "currency-converter",
        "tip-calculator",
      ],
      faqs: [
        {
          q: "How is this different from the EMI Calculator?",
          a: "The EMI Calculator focuses on one loan with a full month-by-month amortisation table and CSV export. The Loan Calculator focuses on comparing up to four scenarios — biweekly vs monthly, with vs without prepayment, different tenures or rates — without showing the full schedule. They share the same underlying math.",
        },
        {
          q: "What does Extra per period do?",
          a: "It adds a constant extra payment on top of every regular instalment. The simulation applies the extra after each interest charge, which accelerates the principal payoff. The Time saved row reports how many fewer months it takes to clear the loan compared with the standard schedule.",
        },
        {
          q: "Why biweekly?",
          a: "Biweekly payment plans (26 payments per year, equivalent to ~13 monthly payments) effectively prepay one full month per year, which can knock years off a mortgage. Toollyz models them as 26 periods at the per-period rate (annual / 26).",
        },
        {
          q: "Why does the &quot;Lowest interest&quot; badge sometimes move?",
          a: "As you change inputs, the scenario with the lowest cumulative interest becomes the best — that&apos;s the badge. It re-evaluates on every keystroke. If two scenarios tie, the first one in the list wins.",
        },
        {
          q: "Does it model fees, taxes or insurance?",
          a: "No — this calculator only models the principal and interest. Banks usually add a one-time processing fee (~1–2% of principal), GST/VAT on the interest portion (jurisdiction-dependent) and optional credit life insurance. Add those separately for the true total cost of borrowing.",
        },
        {
          q: "Can I compare different principals?",
          a: "Yes — every field is editable per scenario. Toollyz doesn&apos;t enforce that the principals match, which is useful when comparing a smaller loan with a tighter rate against a larger one with a longer tenure.",
        },
        {
          q: "What about variable / floating rates?",
          a: "The tool assumes a fixed rate for the whole term. To approximate a floating-rate scenario, recompute partway through with the new outstanding balance, the new rate and the remaining tenure.",
        },
        {
          q: "Why max 4 scenarios?",
          a: "Four scenarios is the sweet spot — enough to compare meaningful variations (rate vs tenure vs prepayment), few enough that the cards fit on most screens without scrolling.",
        },
        {
          q: "Are my scenarios shared across devices?",
          a: "No — they&apos;re stored in localStorage on this device only. Toollyz has no backend; nothing is uploaded or synced.",
        },
        {
          q: "Is this Loan Calculator free?",
          a: "Completely free with no signup and no limits. Compare as many scenarios as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "gst-vat-calculator",
    name: "GST / VAT Calculator",
    tagline: "Add or remove tax with 18 region presets and 23 currencies.",
    description:
      "Add a tax to a net amount or back-calculate the net from a gross. 18 region presets (UK, EU, India GST 5/12/18/28, Australia, NZ, Canada GST/HST/QST, Singapore, South Africa, Japan), 23 currencies and switchable mode. Free and private.",
    categoryId: "calculators",
    icon: Percent,
    status: "live",
    featured: true,
    keywords: [
      "gst calculator",
      "vat calculator",
      "sales tax calculator",
      "tax calculator online",
      "india gst calculator",
      "uk vat calculator",
      "australia gst calculator",
      "remove vat from price",
      "add vat to price",
      "reverse vat calculator",
      "vat from gross",
      "gst rate calculator",
      "hst calculator",
      "qst calculator",
    ],
    seo: {
      title: "GST / VAT Calculator — Add or Remove Tax, 18 Region Presets",
      description:
        "Add or remove GST, VAT or sales tax from any amount with Toollyz GST / VAT Calculator. 18 region presets, 23 currencies, instant mode switching — entirely in your browser.",
      what:
        "A GST / VAT calculator adds a percentage tax to a net amount (gross = net × (1 + r)) or reverses the operation to back-calculate the pre-tax value from a gross price (net = gross ÷ (1 + r)). Toollyz GST / VAT Calculator does both in one tabbed UI and ships with 18 region presets — UK (20% / 5% reduced), Germany (19%), France (20%), Italy (22%), Spain (21%), India GST at 5 / 12 / 18 / 28%, Australia GST 10%, New Zealand GST 15%, Canada federal GST 5%, Canada Ontario HST 13%, Canada Quebec QST + GST 14.975%, Singapore GST 9%, South Africa VAT 15% and Japan consumption tax 10%. Pick a preset and both the tax rate and the display currency snap to that country&apos;s convention; tweak either freely afterwards. The hero shows net (pre-tax), tax amount and gross (incl. tax) in three live cards with the gross / net cells emphasised based on the active mode. A Switch-mode button flips the calculator and carries the result across so you can verify both directions of the math. Toollyz has no backend; the last amount, rate, region and currency save to localStorage on this device only.",
      how: [
        "Pick the mode: Add tax (net → gross) or Remove tax (gross → net).",
        "Type the amount, pick a region preset (or set a custom rate), and pick a display currency.",
        "Read net / tax / gross live in the hero — the highlighted cards depend on the active mode.",
        "Click Switch mode to verify the math by feeding the result back the other way.",
      ],
      benefits: [
        "Two modes — Add tax and Remove tax — in a single tabbed UI.",
        "18 region presets covering UK, EU (DE/FR/IT/ES), India GST tiers, Australia, NZ, Canada GST / HST / QST+GST, Singapore, South Africa, Japan.",
        "Each preset snaps both the tax rate and the display currency to the country&apos;s convention.",
        "23 ISO 4217 currencies via `Intl.NumberFormat` with proper symbols and decimals.",
        "Quick-rate chips for 5 / 10 / 12 / 15 / 18 / 20 / 22 / 25%.",
        "Switch mode flips the calculator and carries the result across to verify both directions.",
        "Copy-summary action for sharing in chat or email.",
        "100% private — Toollyz has no backend, the form saves to localStorage on this device only.",
      ],
      relatedSlugs: [
        "tip-calculator",
        "currency-converter",
        "emi-calculator",
        "invoice-generator",
      ],
      faqs: [
        {
          q: "What's the difference between Add tax and Remove tax?",
          a: "Add tax treats the entered amount as the net (pre-tax) price and adds the tax: gross = net × (1 + r). Remove tax treats the entered amount as the gross (tax-inclusive) price and back-calculates the net: net = gross ÷ (1 + r). The tax amount is the difference in either direction.",
        },
        {
          q: "Why net = gross ÷ (1 + r) rather than gross − (gross × r)?",
          a: "Because the tax is computed on the net, not the gross. If gross = net + net × r = net × (1 + r), then net = gross ÷ (1 + r). Subtracting gross × r would over-deduct the tax — a common spreadsheet bug. Toollyz uses the correct formula.",
        },
        {
          q: "Which regions are included?",
          a: "United Kingdom (20% standard, 5% reduced), Germany (19%), France (20%), Italy (22%), Spain (21%), India GST at 5%, 12%, 18% and 28%, Australia (10% GST), New Zealand (15% GST), Canada federal GST (5%), Canada Ontario HST (13%), Canada Quebec QST + GST combined (14.975%), Singapore (9% GST), South Africa (15% VAT) and Japan (10% consumption tax). For other regions, pick &quot;Custom rate&quot; and type the percentage.",
        },
        {
          q: "Do the rates stay up to date automatically?",
          a: "No — these are static defaults as of mid-2026. Tax rates change occasionally (UK reduced 5%, NZ raised to 15% in 2010, etc.); Toollyz doesn&apos;t auto-update. If a country changes its rate, just type the new percentage into the Tax rate field.",
        },
        {
          q: "Can I model Canadian PST + GST?",
          a: "The QST + GST preset (14.975%) is included for Quebec. Other provinces with PST (BC 7%, Saskatchewan 6%, Manitoba 7%) are not pre-loaded; either pick Canada federal GST 5% and add your PST manually, or set a custom rate to model both at once.",
        },
        {
          q: "How precise is the calculation?",
          a: "Math runs in IEEE 754 double precision — accurate to about 15 significant digits, well beyond any sales-tax need. Output rounds to two decimal places (or zero for zero-decimal currencies like JPY).",
        },
        {
          q: "Why does the currency change when I pick a region?",
          a: "Each region preset includes the country&apos;s usual currency (UK → GBP, India → INR, Australia → AUD, etc.) so the displayed amount matches local convention. You can change the currency manually after picking a preset.",
        },
        {
          q: "Is there an itemised mode for multi-line invoices?",
          a: "Not in this tool — for invoices with multiple line items and per-item taxes, use the Toollyz Invoice Generator. The GST / VAT Calculator is for single-amount conversions.",
        },
        {
          q: "Are my inputs uploaded?",
          a: "No. Toollyz has no backend — the math runs in your browser. Your last amount, rate, region and currency save to localStorage on this device only.",
        },
        {
          q: "Is this GST / VAT Calculator free?",
          a: "Completely free with no signup and no limits. Compute as many tax conversions as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    tagline: "Tip percentage, bill split and round-the-total options.",
    description:
      "Calculate a tip and split the bill across any number of people, with rounding (off / nearest 1 / 5 / 10 / round-up) and quick-percentage chips. 23 currencies, region-aware tipping notes. Free, private, browser-only.",
    categoryId: "calculators",
    icon: DollarSign,
    status: "live",
    featured: true,
    keywords: [
      "tip calculator",
      "bill split calculator",
      "tip percentage calculator",
      "gratuity calculator",
      "restaurant tip calculator",
      "split bill calculator",
      "tip per person",
      "round up tip calculator",
      "free tip calculator",
      "browser tip calculator",
      "tip 15 percent",
      "tip 18 percent",
      "tip 20 percent",
      "tip with split",
    ],
    seo: {
      title: "Tip Calculator — Tip, Bill Split & Rounding (Free, Private)",
      description:
        "Tip and split a restaurant bill with Toollyz Tip Calculator. 9 tip-percentage chips, n-way bill split, 5 rounding modes and 23 currencies — entirely in your browser.",
      what:
        "A tip calculator works out a gratuity by percentage and (optionally) splits the total evenly between diners. Toollyz Tip Calculator runs entirely in your browser. The hero shows four live cards — bill, tip, total and per-person — that update as you change inputs. Sliders and quick-pick chips cover the most common tip rates (0%, 5%, 10%, 15%, 18%, 20%, 22%, 25%, 30%); the slider goes up to 40% for generous tips. Bill split is a numeric input with +/− buttons (1–100 people). The rounding panel offers Off, Nearest 1, Nearest 5, Nearest 10 and Round-up — when rounding is on, the displayed Tip absorbs the rounding (so the rounded total is exactly Bill + Tip rather than Tip + Bill plus an awkward few cents). 23 ISO 4217 currencies are formatted with `Intl.NumberFormat`. The notes panel includes region-specific tipping advice (US, Europe, Asia) — useful when travelling. Toollyz has no backend; the last bill, tip percentage and split persist in localStorage on this device only.",
      how: [
        "Type the bill amount and pick a currency.",
        "Slide the tip percentage or pick one of the common-tip chips (15 / 18 / 20%).",
        "Use +/− buttons to set the number of people splitting the bill.",
        "Pick a rounding mode — the tip absorbs the rounding so the total is clean.",
      ],
      benefits: [
        "Four live hero cells: bill, tip, total, per-person amount.",
        "Quick-tip chips (0 / 5 / 10 / 15 / 18 / 20 / 22 / 25 / 30%) plus a 0–40% slider.",
        "Bill split with +/− buttons (1–100 people) and per-person amount in the hero.",
        "Five rounding modes: off, nearest 1 / 5 / 10, round-up.",
        "Tip absorbs the rounding so Total = Bill + Tip exactly when rounding is on.",
        "23 currencies via `Intl.NumberFormat` with locale-correct symbols.",
        "Region-aware tipping notes (US / Europe / Asia) in the About section.",
        "100% private — Toollyz has no backend, the form saves to localStorage on this device only.",
      ],
      relatedSlugs: [
        "gst-vat-calculator",
        "currency-converter",
        "emi-calculator",
        "fuel-cost-calculator",
      ],
      faqs: [
        {
          q: "How is the tip calculated?",
          a: "Tip = tipPercentage × bill. Total = bill + tip. When rounding is on, the total is rounded first and the tip is recomputed as (rounded total − bill) so the math stays consistent.",
        },
        {
          q: "Why does the tip change when I switch rounding modes?",
          a: "Because the displayed tip absorbs the rounding. If your bill is $42 and the tip is 18% ($7.56), the raw total is $49.56. With Nearest 1 rounding, the total snaps to $50 and the tip becomes $8 — easier to leave in cash without needing change.",
        },
        {
          q: "What's a fair restaurant tip?",
          a: "It depends on the region. The US norm is 15% for adequate service, 18–20% for good and 20%+ for excellent. Many European countries include service in the bill — round up or leave 5–10% on top. Tipping is uncustomary in much of East Asia. Use the Notes panel for a quick guide.",
        },
        {
          q: "Should I tip on the pre-tax amount or the post-tax total?",
          a: "Conventions vary. In the US, tipping on the post-tax total is most common; in the UK and Australia tipping on the net (pre-VAT) value is more usual. Toollyz Tip Calculator tips on whatever you enter as the bill — feed it the value you want.",
        },
        {
          q: "How does bill split work?",
          a: "The total (tip included) is divided by the number of people. Toollyz doesn&apos;t round per person — if the total is $50 split 3 ways, each pays $16.67. To round the per-person amount, set the people count to 1 and split manually with your bank.",
        },
        {
          q: "What does Round-up do?",
          a: "Always rounds the total up to the next whole unit, regardless of how close the cents are to the next integer. Handy when you want to leave a generous tip and pay in cash without dealing with change.",
        },
        {
          q: "Does it support zero-decimal currencies like JPY?",
          a: "Yes — `Intl.NumberFormat` handles those automatically, showing no decimals. ¥4,200 and ₩42,000 display cleanly without trailing zeros.",
        },
        {
          q: "Can I tip more than 40%?",
          a: "The slider tops out at 40% but the input field accepts up to 100. For private services (deliveries, taxis on a generous holiday, exceptional one-off cases) people sometimes tip well above 40% — the calculator doesn&apos;t stop you.",
        },
        {
          q: "Is my data uploaded?",
          a: "No. Toollyz has no backend — calculations run in your browser. The last bill, tip and split save to localStorage on this device only.",
        },
        {
          q: "Is this Tip Calculator free?",
          a: "Completely free with no signup and no limits. Calculate as many tips as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "fuel-cost-calculator",
    name: "Fuel Cost Calculator",
    tagline: "km/L, L/100km, mpg US/UK — per-trip, weekly, monthly, yearly cost.",
    description:
      "Estimate the fuel cost of any trip from distance, fuel efficiency and price. Supports km/L, L/100km, mpg (US) and mpg (UK), kilometres or miles, litre or US/UK gallon pricing, round-trip toggle and per-week / per-month / per-year totals. Free, private, 23 currencies.",
    categoryId: "calculators",
    icon: Fuel,
    status: "live",
    featured: true,
    keywords: [
      "fuel cost calculator",
      "trip fuel calculator",
      "petrol cost calculator",
      "gas cost calculator",
      "mileage calculator",
      "km per litre calculator",
      "l per 100km calculator",
      "mpg calculator",
      "fuel cost per trip",
      "monthly fuel cost",
      "yearly fuel cost",
      "free fuel calculator",
      "browser fuel calculator",
      "round-trip fuel cost",
    ],
    seo: {
      title: "Fuel Cost Calculator — Trip Fuel & Cost in Any Unit (Free)",
      description:
        "Estimate fuel cost from distance, efficiency and price with Toollyz Fuel Cost Calculator. Supports km/L, L/100km, mpg (US), mpg (UK), kilometres / miles, litres / US gallons / UK gallons and 23 currencies — entirely in your browser.",
      what:
        "A fuel cost calculator works out how much fuel a trip consumes and how much that fuel costs. Toollyz Fuel Cost Calculator handles every common unit combination: distance in kilometres or miles, fuel efficiency in km/L, L/100km, mpg (US) or mpg (UK), and fuel price per litre, per US gallon or per UK gallon. Internally everything is normalised to litres per kilometre using exact conversion constants (1 mi = 1.609344 km, 1 US gallon = 3.785411784 L, 1 UK gallon = 4.54609 L), so a US driver entering 30 mpg and \"per US gallon\" gets the same fuel-use rate as a European entering the equivalent L/100 km figure. The hero shows fuel per trip, cost per trip, weekly cost and monthly cost; the conversions panel below shows your efficiency expressed in all four units at once. A round-trip checkbox doubles the distance; a trips-per-week input drives the periodic totals (monthly = weekly × 52 ÷ 12, yearly = weekly × 52). Currency formatting via `Intl.NumberFormat` across 23 ISO 4217 codes. Toollyz has no backend.",
      how: [
        "Type the trip distance and pick km or miles. Tick Round-trip if you&apos;re measuring one-way.",
        "Type the vehicle&apos;s fuel efficiency and pick the matching unit (km/L, L/100km, mpg US or mpg UK).",
        "Type the local fuel price and pick the price unit (per litre, per US gallon, per UK gallon).",
        "(Optional) Type trips per week to see weekly, monthly and yearly totals.",
      ],
      benefits: [
        "Four efficiency units: km/L, L/100km, mpg (US), mpg (UK) with exact conversion constants.",
        "Two distance units: km, miles.",
        "Three fuel-price units: per litre, per US gallon, per UK gallon.",
        "Round-trip checkbox automatically doubles the distance.",
        "Weekly / monthly / yearly totals driven by a trips-per-week input.",
        "Live conversions panel showing your efficiency in all four units side-by-side.",
        "23 currencies via `Intl.NumberFormat`.",
        "100% private — Toollyz has no backend, the form saves to localStorage on this device only.",
      ],
      relatedSlugs: [
        "currency-converter",
        "tip-calculator",
        "gst-vat-calculator",
        "emi-calculator",
      ],
      faqs: [
        {
          q: "Which conversion constants does this use?",
          a: "1 mile = 1.609344 km (the international mile, defined to exactly that in 1959). 1 US gallon = 3.785411784 L (exact, defined since 1893). 1 UK / Imperial gallon = 4.54609 L. Toollyz uses these constants verbatim and runs the math in IEEE 754 double precision.",
        },
        {
          q: "What's the difference between US and UK mpg?",
          a: "A US gallon is 3.785 L and a UK (Imperial) gallon is 4.546 L. So 30 mpg (UK) ≈ 25 mpg (US) — the UK figure looks better because the gallon is larger. Toollyz lets you pick either; the conversions panel shows both values for the same efficiency.",
        },
        {
          q: "Should I use km/L or L/100 km?",
          a: "They&apos;re reciprocals: km/L = 100 ÷ (L/100km). km/L is intuitive (\"how far on a litre\") and is the standard in India and parts of Asia. L/100km is intuitive (\"how much fuel per 100 km\") and is the EU standard. Lower L/100 km = more efficient; higher km/L = more efficient.",
        },
        {
          q: "How is monthly cost calculated?",
          a: "Monthly = weekly × 52 ÷ 12 (assuming a roughly constant week-by-week trip pattern). Yearly = weekly × 52. Both ignore seasonal variation, holidays and one-off trips.",
        },
        {
          q: "Why is real-world fuel use higher than the manufacturer's figure?",
          a: "Manufacturer figures (EPA, WLTP, NEDC) are measured on a dynamometer under controlled conditions. Real-world driving adds traffic, weather, payload, aggressive acceleration and air conditioning — typically 10–20% worse than the spec. For accurate planning, use your own car&apos;s observed fuel economy.",
        },
        {
          q: "Does it model electric vehicles?",
          a: "Not directly. For EVs, swap \"fuel price per litre\" for \"electricity price per kWh\" and \"L/100 km\" for \"kWh/100 km\" mentally. The math is identical: cost = distance × consumption × price. A dedicated EV calculator is on the roadmap.",
        },
        {
          q: "Can I compare two vehicles?",
          a: "Not in a single side-by-side view in this release — run the numbers for one car, copy the summary, then change the inputs for the second. A multi-scenario comparison view (like the Loan Calculator) is on the roadmap.",
        },
        {
          q: "Does it handle tolls or parking?",
          a: "No — fuel only. Add tolls and parking to the cost-per-trip manually for total trip cost.",
        },
        {
          q: "Are my numbers saved across devices?",
          a: "No — they&apos;re stored in localStorage on this device only. Toollyz has no backend; nothing is uploaded.",
        },
        {
          q: "Is this Fuel Cost Calculator free?",
          a: "Completely free with no signup and no limits. Calculate as many trips as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    tagline: "WHO BMI in metric or imperial, with ideal-weight range and honest caveats.",
    description:
      "Calculate your Body Mass Index from weight and height in kg/cm or lb/ft+in. See WHO categories on a colour-coded scale, your ideal-weight range, BMI prime and ponderal index. Free, private, with explicit caveats about what BMI doesn&apos;t measure.",
    categoryId: "calculators",
    icon: HeartPulse,
    status: "live",
    featured: true,
    keywords: [
      "bmi calculator",
      "body mass index calculator",
      "bmi metric",
      "bmi imperial",
      "bmi kg cm",
      "bmi lb in",
      "ideal weight calculator",
      "bmi who classification",
      "bmi prime",
      "ponderal index",
      "healthy weight calculator",
      "browser bmi calculator",
      "free bmi calculator",
      "bmi categories",
    ],
    seo: {
      title: "BMI Calculator — WHO Categories, Ideal Weight, Honest Caveats",
      description:
        "Calculate Body Mass Index with Toollyz BMI Calculator. Metric (kg/cm) or imperial (lb/ft+in), WHO categories on a colour scale, ideal-weight range, BMI prime and ponderal index — entirely in your browser, with honest caveats about what BMI isn&apos;t.",
      what:
        "Body Mass Index (BMI) is weight ÷ height squared — a quick proxy for whether an adult&apos;s body weight is in the WHO healthy range. Toollyz BMI Calculator implements the standard formula BMI = kg ÷ m² entirely in your browser and supports both metric (kg + cm) and imperial (lb + ft + in) inputs. Imperial values are converted with the exact constants 1 lb = 0.45359237 kg and 1 in = 0.0254 m. The hero shows your BMI in big animated digits and a category chip (Severe / Moderate / Mild thinness, Healthy range, Overweight, Obese class I/II/III) coloured to match the WHO scale, plus a banded progress bar from 12 to 40+ with a marker for your position. Three secondary stats are computed: your ideal-weight range (BMI 18.5–24.9 × height² — expressed in your chosen unit), BMI prime (BMI ÷ 25 — 1.0 is the upper end of healthy) and ponderal index (weight ÷ height³ — less sensitive to height than BMI). The Caveats panel is unusually prominent: BMI is a population statistic, not a diagnostic; it doesn&apos;t measure body fat, muscle mass or fat distribution; athletes often land &quot;overweight&quot; despite low body fat; pregnant people, growing children and adolescents need specialised charts. Toollyz has no backend; inputs save to localStorage on this device only.",
      how: [
        "Pick Metric (kg, cm) or Imperial (lb, ft+in) at the top of the form.",
        "Type your weight and height — the BMI updates live as you type.",
        "Read your category, ideal-weight range, BMI prime and ponderal index in the cards below.",
        "Read the &quot;What BMI isn&apos;t&quot; panel before drawing conclusions about health.",
      ],
      benefits: [
        "Metric (kg + cm) and imperial (lb + ft + in) inputs with exact unit conversions.",
        "WHO categories from Severe thinness to Obese class III on a colour-coded scale.",
        "Ideal-weight range for your height in your chosen unit.",
        "BMI prime (BMI ÷ 25 — 1.0 is the upper end of healthy).",
        "Ponderal index (weight ÷ height³) — a less height-sensitive alternative.",
        "Live banded progress bar (sky / emerald / amber / rose) with a marker for your value.",
        "Honest caveats panel about what BMI doesn&apos;t measure.",
        "100% private — Toollyz has no backend, your weight, height and unit choice save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "calorie-calculator",
        "water-intake-calculator",
        "age-difference-calculator",
        "currency-converter",
      ],
      faqs: [
        {
          q: "What's the BMI formula?",
          a: "BMI = weight (kg) ÷ height (m)². Imperial input is converted first — 1 lb is exactly 0.45359237 kg and 1 in is exactly 0.0254 m.",
        },
        {
          q: "What's a &quot;healthy&quot; BMI?",
          a: "The WHO classifies BMI 18.5–24.9 as the healthy range for adults. Anything lower is some degree of thinness; anything higher is overweight or obese. Toollyz uses the WHO bands exactly.",
        },
        {
          q: "Does BMI work for athletes?",
          a: "Often not. Muscle is denser than fat, so well-trained athletes routinely land in the &quot;overweight&quot; or even &quot;obese&quot; band despite very low body-fat percentages. Body composition (DEXA scan, skinfold caliper, bioelectric impedance) gives a much better picture.",
        },
        {
          q: "What about children and teenagers?",
          a: "Adult BMI categories don&apos;t apply. For ages 2–19, paediatricians use BMI-for-age percentiles relative to a sex-specific growth chart. Use a specialised paediatric BMI calculator instead.",
        },
        {
          q: "What's BMI prime?",
          a: "BMI prime = BMI ÷ 25. A value of 1.00 sits at the upper end of the healthy range; 1.20 means you&apos;re 20% above that boundary. It&apos;s a handy way to express how far above/below healthy you are.",
        },
        {
          q: "What's the ponderal index?",
          a: "Weight (kg) ÷ height (m)³. It corrects for the fact that BMI tends to slightly under-classify tall people and over-classify short people. Less common in clinical use but useful when comparing very tall or very short individuals.",
        },
        {
          q: "Does it work for pregnant or breastfeeding people?",
          a: "No — pregnancy and breastfeeding change the math fundamentally. Use a pregnancy weight-tracking tool with your doctor instead.",
        },
        {
          q: "How accurate is the calculation?",
          a: "The math is double-precision floating-point — accurate to ~15 significant digits, far beyond any health relevance. The displayed BMI rounds to one decimal place.",
        },
        {
          q: "Are my measurements uploaded?",
          a: "No. Toollyz has no backend — the math runs in your browser. Your weight, height and unit choice save to localStorage on this device only.",
        },
        {
          q: "Is this BMI Calculator free?",
          a: "Completely free with no signup and no limits. Calculate as many BMIs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "calorie-calculator",
    name: "Calorie Calculator",
    tagline: "Mifflin–St Jeor BMR, TDEE, goal target and macro split.",
    description:
      "Estimate daily calories with the Mifflin–St Jeor equation. Five activity multipliers, six cut/bulk goals, suggested protein / fat / carb split and an expected weekly weight change. Metric and imperial. Free, private, with explicit &quot;not medical advice&quot; caveats.",
    categoryId: "calculators",
    icon: Flame,
    status: "live",
    featured: true,
    keywords: [
      "calorie calculator",
      "tdee calculator",
      "bmr calculator",
      "mifflin st jeor",
      "daily calorie intake",
      "diet calorie calculator",
      "calorie deficit calculator",
      "bulk cut calculator",
      "macro calculator",
      "protein carbs fat calculator",
      "weight loss calorie calculator",
      "weight gain calorie calculator",
      "browser tdee calculator",
      "free tdee calculator",
    ],
    seo: {
      title: "Calorie Calculator — BMR + TDEE + Macros (Mifflin–St Jeor, Free)",
      description:
        "Estimate daily calories with Toollyz Calorie Calculator. Mifflin–St Jeor BMR, five activity multipliers, six cut/bulk goals and a suggested protein / fat / carb split — entirely in your browser. Not medical advice.",
      what:
        "A calorie calculator estimates how many kilocalories you burn in a day and how much to eat for a goal — maintenance, weight loss or weight gain. Toollyz Calorie Calculator uses the Mifflin–St Jeor equation (1990) — the Academy of Nutrition and Dietetics&apos;s preferred BMR formula for healthy adults: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5 (male) or − 161 (female). Multiply by an activity factor (1.20 sedentary, 1.375 light, 1.55 moderate, 1.725 very active, 1.90 extra active) to get TDEE, then apply a goal delta (Aggressive cut −750, Standard cut −500, Mild cut −250, Maintain ±0, Mild bulk +250, Standard bulk +500 kcal/day) to get the target intake. The component supports both metric (kg + cm) and imperial (lb + ft + in) with exact unit conversions (1 lb = 0.45359237 kg, 1 in = 0.0254 m). A live macro panel suggests 1.8 g protein per kg of body weight, 25% of calories from fat and the rest from carbs. The expected weekly weight change uses 7,700 kcal per kg of body fat. The Not Medical Advice panel is prominently displayed: Mifflin–St Jeor estimates a population average with ±10–15% individual variation; the 7,700 kcal/kg rule ignores water, glycogen and lean tissue; pregnant, nursing, ill or athlete users should talk to a clinician. Toollyz has no backend; inputs save to localStorage.",
      how: [
        "Pick Metric or Imperial and fill in sex, age, weight and height.",
        "Choose an activity level (Sedentary → Extra active).",
        "Pick a goal (Aggressive / Standard / Mild cut, Maintain, Mild / Standard bulk) — the target intake updates live.",
        "Read your suggested macros and expected weekly weight change.",
      ],
      benefits: [
        "Mifflin–St Jeor BMR — the most validated equation for the general population.",
        "Five activity multipliers spanning desk workers to heavy training + manual labour.",
        "Six goal presets covering aggressive cuts through standard bulks.",
        "Macro split based on 1.8 g protein per kg, 25% fat, balance carbs.",
        "Weekly weight-change estimate using the 7,700 kcal-per-kg rule of thumb.",
        "Metric (kg + cm) and imperial (lb + ft + in) inputs with exact unit conversions.",
        "Honest &quot;not medical advice&quot; caveats panel — algorithms are population statistics, not diagnostics.",
        "100% private — Toollyz has no backend, inputs save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "bmi-calculator",
        "water-intake-calculator",
        "age-difference-calculator",
        "tip-calculator",
      ],
      faqs: [
        {
          q: "What's BMR?",
          a: "Basal Metabolic Rate — the energy your body burns at complete rest just keeping you alive (organs, ion pumps, basal cell function). Mifflin–St Jeor is the most accurate estimate for healthy adults; Harris–Benedict and Katch–McArdle are older or require body-fat percentage.",
        },
        {
          q: "What's TDEE?",
          a: "Total Daily Energy Expenditure — BMR plus everything else you do (walking, thinking, fidgeting, formal exercise). Toollyz uses the standard activity multipliers from 1.20 (sedentary) to 1.90 (extra active) on top of BMR.",
        },
        {
          q: "What activity level should I pick?",
          a: "Sedentary = desk job, no real exercise. Light = light activity 1–3 days/week (walks, casual yoga). Moderate = 3–5 sessions/week with real intensity. Very active = 6–7 sessions/week or daily training. Extra active = heavy training plus a physical job. People often over-estimate — pick the level below your gut feeling for a more honest target.",
        },
        {
          q: "Why do men and women have different equations?",
          a: "Lean body mass differs on average between sexes, so the equation has a different constant: +5 for males and −161 for females, both in kcal/day. The rest of the formula is identical.",
        },
        {
          q: "How accurate is the BMR estimate?",
          a: "Studies show Mifflin–St Jeor is within ±10% of measured BMR for about 80% of healthy adults. Outliers (very lean, very muscular, very old, very young) can be ±15% or more. Don&apos;t treat the number as gospel — adjust intake based on actual scale weight over 2–3 weeks.",
        },
        {
          q: "What about the &quot;7,700 kcal per kg&quot; rule?",
          a: "It comes from the energy density of human adipose tissue and applies cleanly only to body fat. Real-world weekly weight changes also include water (glycogen + sodium), undigested food, hormonal cycles and the lean tissue you gain during a bulk. Treat the weekly-change number as a long-run average over weeks, not a daily target.",
        },
        {
          q: "Why suggest 1.8 g protein per kg?",
          a: "It&apos;s in the middle of the evidence-based range (1.6–2.2 g/kg for active adults) and supports both muscle retention during a cut and muscle gain during a bulk. People with kidney disease should consult a doctor before going high-protein.",
        },
        {
          q: "Is the macro split a hard rule?",
          a: "No — it&apos;s a starting point. Many people thrive on lower fat / higher carb or vice versa. Toollyz fixes protein and fat (25% calories) and lets carbs fill the rest because that&apos;s a balanced starting point most evidence-based nutrition guides endorse.",
        },
        {
          q: "Can I use this for pregnancy or breastfeeding?",
          a: "No. Pregnancy and lactation change energy needs in ways the standard equations don&apos;t capture. Use a pregnancy-specific calculator with a clinician&apos;s input.",
        },
        {
          q: "Is this Calorie Calculator free?",
          a: "Completely free with no signup and no limits. Compute as many estimates as you like — privately in your browser. Toollyz has no backend.",
        },
      ],
    },
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake Calculator",
    tagline: "30 ml/kg + activity + climate + pregnancy, with a daily schedule.",
    description:
      "Estimate daily water intake from body weight (30 ml/kg baseline), exercise minutes (+350 ml/30min), climate (+500 ml hot, +1 L very hot) and pregnancy / breastfeeding (+300/+700 ml). Output in ml, L, fl oz, glasses and bottles, plus a glass-by-glass schedule. Honest caveats.",
    categoryId: "calculators",
    icon: Droplet,
    status: "live",
    featured: true,
    keywords: [
      "water intake calculator",
      "daily water intake",
      "hydration calculator",
      "how much water should i drink",
      "water per kg",
      "water glasses per day",
      "pregnancy water intake",
      "breastfeeding water intake",
      "hot climate hydration",
      "exercise water intake",
      "browser water calculator",
      "free hydration calculator",
      "water schedule",
      "fluid intake calculator",
    ],
    seo: {
      title: "Water Intake Calculator — Daily Hydration Target & Schedule (Free)",
      description:
        "Estimate daily water intake with Toollyz Water Intake Calculator. Body weight × 30 ml/kg, plus exercise / climate / pregnancy adjustments. Output in ml, fl oz, glasses, bottles and a sip-by-sip schedule — entirely in your browser, with honest caveats.",
      what:
        "A water-intake calculator estimates how much water you should drink each day based on body weight and lifestyle. Toollyz Water Intake Calculator runs entirely in your browser. The baseline is 30 ml per kilogram of body weight — a common evidence-based rule of thumb for healthy adults that lines up well with the Institute of Medicine&apos;s adequate-intake values (2.7 L women, 3.7 L men) for an average-weight person. On top of the baseline it adds +350 ml for every 30 minutes of exercise, +500 ml in hot weather (+1 L in very hot / desert climates), +300 ml during pregnancy and +700 ml when breastfeeding. Output is shown in millilitres, fluid ounces (US), 500 ml bottles and the user-configurable glass size (default 250 ml), with a per-hour rate derived from the user&apos;s awake hours and a visual schedule. The breakdown panel shows where the litres come from as colour-coded segments. The Honest Caveats panel is prominent: individual needs vary widely; food provides ~20% of daily water; chugging far above your need can cause hyponatraemia. Toollyz has no backend; inputs save to localStorage on this device only.",
      how: [
        "Pick Metric (kg) or Imperial (lb) and type your body weight.",
        "Add daily exercise minutes; pick the climate and any pregnancy / breastfeeding status.",
        "Read the total in ml, fl oz, bottles, glasses and per-hour intake in the hero.",
        "Use the schedule panel to space the water across your awake hours.",
      ],
      benefits: [
        "30 ml/kg baseline aligned with IOM adequate-intake guidance.",
        "Adjustments for exercise (+350 ml / 30 min), climate (+500 ml or +1 L) and pregnancy / breastfeeding (+300 or +700 ml).",
        "Hero shows total in ml, L, fl oz, glasses, bottles and per-hour rate.",
        "Configurable glass size (default 250 ml) and awake-hours count for a per-glass schedule.",
        "Stacked breakdown bar so users see where each litre comes from.",
        "Metric (kg) and imperial (lb) inputs with the exact conversion 1 lb = 0.45359237 kg.",
        "Prominent caveats panel — individual needs vary, food provides ~20% of water, hyponatraemia risk noted.",
        "100% private — Toollyz has no backend, inputs save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "bmi-calculator",
        "calorie-calculator",
        "tip-calculator",
        "alarm-clock",
      ],
      faqs: [
        {
          q: "Where does &quot;30 ml per kg&quot; come from?",
          a: "It&apos;s a widely-used clinical rule of thumb (Holliday–Segar for maintenance fluid, adjusted for adults). For a 70 kg adult that&apos;s ~2.1 L of plain water, which lines up well with the Institute of Medicine&apos;s adequate-intake values once food water is factored in.",
        },
        {
          q: "Does this count tea, coffee, juice or food?",
          a: "No — the output is total water-equivalent intake. In a typical Western diet, ~20% comes from food and the rest from beverages. Tea and coffee count too; the mild diuretic effect of caffeine is generally over-stated and doesn&apos;t outweigh the water in the cup.",
        },
        {
          q: "Why +350 ml per 30 minutes of exercise?",
          a: "It approximates the American College of Sports Medicine&apos;s recommendation of 0.4–0.8 L per hour of moderate exercise. For very long endurance sessions (>2 hours) you may need significantly more plus electrolytes.",
        },
        {
          q: "What's hyponatraemia?",
          a: "Low blood sodium caused by drinking far more water than your kidneys can excrete (~0.7–1 L per hour). It&apos;s rare but dangerous and most often hits long-distance runners who over-drink plain water. Trust thirst as a guide; don&apos;t force litres to hit an arbitrary number.",
        },
        {
          q: "What about pregnancy and breastfeeding?",
          a: "Pregnancy adds about 300 ml/day to a non-pregnant baseline; breastfeeding adds about 700 ml/day to replace the water lost in milk. Toollyz uses those constants directly, but check with your OB / midwife — individual needs vary.",
        },
        {
          q: "Why ask about awake hours?",
          a: "To compute a per-hour drinking rate that&apos;s realistic — drinking your full target in the last hour before bed is rough on sleep. If you sleep 8 hours, you have 16 awake hours to space the intake.",
        },
        {
          q: "Does climate really change requirements?",
          a: "Yes — in hot or very hot environments you lose more water through sweat and breathing. The defaults (+500 ml hot, +1 L very hot) are conservative; outdoor work in 35°C+ heat can easily add 1.5–3 L on top.",
        },
        {
          q: "Is the 250 ml glass standard?",
          a: "It&apos;s a common European/Indian glass size. US &quot;cups&quot; are ~240 ml, &quot;tall glasses&quot; 300–350 ml. Adjust the Glass size field to match what you actually drink from for an accurate schedule.",
        },
        {
          q: "Is this medical advice?",
          a: "No. Toollyz Water Intake Calculator is a population-level rule of thumb. If you have kidney disease, heart failure, are on diuretics or have any medical condition that affects fluid balance, follow your doctor&apos;s guidance instead.",
        },
        {
          q: "Is this Water Intake Calculator free?",
          a: "Completely free with no signup and no limits. Calculate as many targets as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "love-compatibility-calculator",
    name: "Love Compatibility Calculator",
    tagline: "Deterministic FLAMES + letter overlap, openly &quot;for fun&quot; only.",
    description:
      "A playful, deterministic love-compatibility score between two names. Blends letter overlap (Jaccard), vowel harmony, length harmony, the classic FLAMES game and a name-based hash into a 0–100% result. Openly framed as entertainment, not real compatibility advice.",
    categoryId: "calculators",
    icon: Heart,
    status: "live",
    featured: true,
    keywords: [
      "love calculator",
      "love compatibility calculator",
      "name compatibility",
      "flames calculator",
      "couple compatibility",
      "fun love calculator",
      "love percentage calculator",
      "romance compatibility",
      "name matcher",
      "love test",
      "browser love calculator",
      "free love calculator",
      "playful relationship calculator",
      "letter overlap love",
    ],
    seo: {
      title: "Love Compatibility Calculator — Playful FLAMES + Letter Score",
      description:
        "Type two names, see a playful 0–100% love-compatibility score plus the classic FLAMES verdict. Deterministic blend of letter overlap, vowel harmony, length harmony and a name-based hash — explicitly for fun.",
      what:
        "A love-compatibility calculator turns two names into a playful percentage. Toollyz Love Compatibility Calculator is openly entertainment-only — it blends four deterministic factors into a single 0–100% score: letter overlap (Jaccard similarity of the two normalised name letter sets), vowel harmony (similarity of vowel counts), length harmony (how close the two names are in length) and a &quot;cosmic vibe&quot; FNV-1a hash of the sorted name pair that adds quirky variation. The same names always produce the same result. On top of the percentage it runs the classic FLAMES schoolyard game (F-riends, L-overs, A-ffectionate, M-arriage, E-nemies, S-iblings) — cancel repeated letters between the two names and cycle the remaining count through the six categories. The hero shows the percentage plus a verdict band (Friend zone → Soulmate vibes) and FLAMES category; the breakdown panel shows each factor as a 0–100 bar with the shared letters listed. The Caveats panel is unusually prominent: this is **not** a real measure of compatibility — real relationships are built on values, communication, respect and effort. Toollyz has no backend; the two names save to localStorage on this device only.",
      how: [
        "Type two names and watch the percentage and FLAMES verdict appear.",
        "Click Swap to flip the names — the result is symmetric, so the percentage doesn&apos;t change.",
        "Scroll to the breakdown to see how letter overlap, vowel harmony, length and cosmic vibe contributed.",
        "Read the &quot;Just for laughs&quot; panel before showing the result to anyone with feelings.",
      ],
      benefits: [
        "Deterministic — same two names always give the same result.",
        "Four-factor blend: letter overlap, vowel harmony, length harmony, FNV-1a cosmic-vibe hash.",
        "Classic FLAMES game (Friends, Lovers, Affectionate, Marriage, Enemies, Siblings) with a meaningful one-liner per outcome.",
        "Five verdict bands from &quot;Friend zone, probably&quot; through &quot;Soulmate vibes&quot;.",
        "Shows the shared letters that drove the letter overlap score.",
        "Symmetric — Swap doesn&apos;t change the result.",
        "Prominent &quot;Just for laughs&quot; caveats so nobody mistakes it for actual compatibility advice.",
        "100% private — Toollyz has no backend, the two names save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "zodiac-sign-finder",
        "fancy-text-generator",
        "random-quote-generator",
        "horoscope-generator",
      ],
      faqs: [
        {
          q: "Is this actually accurate?",
          a: "No. It&apos;s entertainment. The percentage is a deterministic blend of how many letters two names share, how close their vowel counts and lengths are and a hash. None of those map to real-world relationship outcomes; please don&apos;t treat the number as a signal about anything important.",
        },
        {
          q: "Why does the same pair always give the same result?",
          a: "By design. The components are all deterministic — letter overlap is set arithmetic, vowel and length harmony are simple ratios and the &quot;cosmic vibe&quot; uses a fixed FNV-1a hash. There&apos;s no randomness. So showing the result to the same friend twice always works.",
        },
        {
          q: "What is FLAMES?",
          a: "A 1980s–90s schoolyard game popular in India, the Philippines and many other countries. Write both names, cancel letters that appear in both, count what&apos;s left, then cycle through F-L-A-M-E-S — the last letter standing is your &quot;result&quot;. Toollyz runs the classic algorithm.",
        },
        {
          q: "Does swapping the names change the result?",
          a: "No — every component is symmetric. Letter overlap uses set intersection, vowel and length harmonies use absolute differences, and the hash sorts the two names before hashing. Swap is just there for the visual flip.",
        },
        {
          q: "Why so many caveats?",
          a: "Because algorithms that look authoritative on top of arbitrary inputs are easy to mistake for real predictions. A bold caveats panel keeps the framing honest: this is entertainment, not compatibility science.",
        },
        {
          q: "What about non-Latin scripts?",
          a: "The normalisation step only keeps a–z (after lowercasing), so Cyrillic, Devanagari, Han, Arabic etc. characters are stripped. Transliterate first (e.g. &quot;Анна&quot; → &quot;Anna&quot;) for a meaningful result. Future versions could keep Unicode letters.",
        },
        {
          q: "Are diacritics handled?",
          a: "Not specifically — accented letters (é, ñ, ü) are stripped along with the rest of the non-Latin characters. Compare the unaccented form (&quot;María&quot; → &quot;maria&quot;) for a sensible result.",
        },
        {
          q: "Could you add a real relationship-style assessment?",
          a: "There are evidence-based questionnaires (Gottman Method, Sternberg&apos;s Triangular Love Theory) that predict outcomes better than name letters. A real assessment is out of scope for a calculator like this — by design it&apos;s a snack, not a meal.",
        },
        {
          q: "Are my names saved?",
          a: "Only in your browser&apos;s localStorage on this device. Toollyz has no backend; nothing is uploaded. Clear site data to wipe the names.",
        },
        {
          q: "Is this Love Compatibility Calculator free?",
          a: "Completely free with no signup and no limits. Run as many name pairs as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "zodiac-sign-finder",
    name: "Zodiac Sign Finder",
    tagline: "Western sun sign + Chinese animal with proper New Year boundary.",
    description:
      "Enter your birth date to find both your Western (tropical) sun sign and your Chinese (lunisolar) zodiac animal, plus element, polarity, traits and compatible signs. Chinese New Year lookup covers 1900–2050. Honest &quot;for fun, not forecasting&quot; framing.",
    categoryId: "calculators",
    icon: Star,
    status: "live",
    featured: true,
    keywords: [
      "zodiac sign calculator",
      "zodiac sign finder",
      "sun sign calculator",
      "chinese zodiac calculator",
      "western zodiac",
      "horoscope sign finder",
      "what's my zodiac",
      "astrology sign",
      "chinese zodiac year",
      "zodiac element",
      "zodiac compatibility",
      "browser zodiac calculator",
      "free zodiac calculator",
      "lunisolar zodiac",
    ],
    seo: {
      title: "Zodiac Sign Finder — Western Sun Sign + Chinese Animal (Free)",
      description:
        "Enter your birth date and Toollyz Zodiac Sign Finder returns your Western (tropical) sun sign and your Chinese (lunisolar) zodiac animal with element, polarity, traits and compatible signs. Chinese New Year lookup covers 1900–2050.",
      what:
        "A zodiac sign finder converts a birth date to its Western (tropical) sun sign and its Chinese (lunisolar) animal. Toollyz Zodiac Sign Finder ships both engines offline in your browser. The Western engine matches the date against the standard 12 sun-sign ranges (Capricorn wraps Dec 22 → Jan 19) and returns name, glyph, element (Fire / Earth / Air / Water), modality (Cardinal / Fixed / Mutable), ruling planet, four trait words and three popularly-compatible signs. The Chinese engine respects the actual lunisolar boundary — a real Chinese zodiac year starts on Chinese New Year, not Gregorian Jan 1 — so Toollyz ships a lookup table of CNY dates for 1900–2050 and uses the previous year&apos;s animal for dates before that year&apos;s CNY. Animal is computed from (year − 4) mod 12; the element comes from the sexagenary cycle (year mod 10 maps to Wood / Fire / Earth / Metal / Water, two consecutive years per element); polarity (Yang / Yin) from year mod 2. Output includes the animal glyph, the polarity-element pair, traits and compatible animals — and surfaces the actual CNY date used. The Caveats panel is prominently honest: astrology is a cultural tradition, not a predictive science, and &quot;compatible signs&quot; aren&apos;t relationship advice. Toollyz has no backend; the birth date saves to localStorage on this device only.",
      how: [
        "Type or pick your date of birth.",
        "Read your Western sun sign card (with element, modality, ruling planet, traits, compatibility).",
        "Read your Chinese zodiac card (with animal, polarity, element, year, traits, compatibility).",
        "Note the CNY date displayed under the Chinese card — important if you were born in January or early February.",
      ],
      benefits: [
        "Both Western (tropical) and Chinese (lunisolar) zodiac in one tool.",
        "Proper Chinese New Year boundary via a 1900–2050 lookup table — not the Gregorian Jan 1 shortcut most sites use.",
        "Chinese element (Wood / Fire / Earth / Metal / Water) and polarity (Yang / Yin) from the sexagenary cycle.",
        "Western element (Fire / Earth / Air / Water), modality (Cardinal / Fixed / Mutable) and ruling planet.",
        "Four trait words and three popularly-compatible signs for each system.",
        "Surfaces the CNY date used so users know which year their Chinese sign came from.",
        "Honest &quot;for fun, not forecasting&quot; caveats panel explaining astrology is a cultural tradition.",
        "100% private — Toollyz has no backend, birth date saves to localStorage on this device only.",
      ],
      relatedSlugs: [
        "horoscope-generator",
        "love-compatibility-calculator",
        "calendar-generator",
        "age-difference-calculator",
      ],
      faqs: [
        {
          q: "What's the difference between Western and Chinese zodiac?",
          a: "Western (tropical) zodiac is based on the Sun&apos;s apparent path through 12 constellations and is anchored to a 12-month solar year — your sign depends on day-of-year. Chinese zodiac is a 12-year cycle of animals anchored to Chinese New Year (lunisolar), so your sign depends on birth year (and the date relative to that year&apos;s CNY).",
        },
        {
          q: "Why does the Chinese sign sometimes differ from year-divided-by-12?",
          a: "Because the Chinese year boundary is Chinese New Year (between Jan 21 and Feb 20), not Gregorian Jan 1. If you were born in January or early February, your Chinese sign may be from the prior Gregorian year. Toollyz uses a CNY lookup table 1900–2050 to get this right.",
        },
        {
          q: "How accurate is the Western sign for cusp dates?",
          a: "Sun-sign boundaries shift by ±1 day across leap-year cycles because the tropical year isn&apos;t exactly 365 days. Toollyz uses the most commonly published boundary dates — if you were born exactly on a transition, your true sun sign depends on your birth time and place. For precision, use a full birth-chart calculator.",
        },
        {
          q: "What's the Chinese element?",
          a: "The Chinese sexagenary cycle pairs 12 animals with 5 elements (Wood, Fire, Earth, Metal, Water), so the full cycle is 60 years. The element comes from the last digit of the year: 0–1 Metal, 2–3 Water, 4–5 Wood, 6–7 Fire, 8–9 Earth. Even-year Yang, odd-year Yin.",
        },
        {
          q: "Is astrology real?",
          a: "Astrology is a cultural tradition with thousands of years of history, not a predictive science. There&apos;s no peer-reviewed evidence that birth date determines personality or destiny. Toollyz Zodiac Sign Finder is for fun and cultural context, not forecasting.",
        },
        {
          q: "What about ascendant / moon sign?",
          a: "Those need birth time and location, not just date. Toollyz handles only the sun sign (Western) and animal sign (Chinese). For full natal charts, use a specialised astrology service.",
        },
        {
          q: "Why is the CNY lookup capped at 2050?",
          a: "Future Chinese New Year dates require astronomical lunisolar computation; we ship a static table for 1900–2050 (most users) and fall back to an approximate Feb 4 outside that range with a clear note in the UI.",
        },
        {
          q: "Can I see all 12 signs?",
          a: "Yes — the Western signs are all listed below the cards with their date ranges, elements and modalities. Click any of them to scroll the comparison.",
        },
        {
          q: "Are my birth date and sign saved?",
          a: "Only in your browser&apos;s localStorage on this device. Toollyz has no backend; nothing is uploaded.",
        },
        {
          q: "Is this Zodiac Sign Finder free?",
          a: "Completely free with no signup and no limits. Look up as many dates as you like — privately in your browser.",
        },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════════
  // SECOND BATCH (102 tools)
  // ════════════════════════════════════════════════════════════════════════

  // ─── GENERATORS (batch 2) ────────────────────────────────────────────────
  {
    slug: "random-password-phrase-generator",
    name: "Random Password Phrase Generator",
    tagline: "XKCD-style passphrases with live entropy from a 1646-word list.",
    description:
      "Generate memorable XKCD-/Diceware-style passphrases from a curated 1646-word English list with crypto.getRandomValues, rejection-sampled to avoid modulo bias. Configure word count, separator, case style, optional digits and symbols; live entropy meter and 12-phrase history. Free and private.",
    categoryId: "generators",
    icon: KeyRound,
    status: "live",
    featured: true,
    keywords: [
      "passphrase generator",
      "random password phrase",
      "xkcd password",
      "diceware",
      "memorable password",
      "secure passphrase",
      "passphrase entropy",
      "correct horse battery staple",
      "password generator",
      "browser passphrase",
      "free passphrase generator",
      "passphrase with digits",
      "passphrase with symbols",
      "crypto random passphrase",
    ],
    seo: {
      title: "Random Password Phrase Generator — XKCD / Diceware-Style (Free)",
      description:
        "Generate strong, memorable passphrases with Toollyz Random Password Phrase Generator. 1646-word English list, crypto.getRandomValues, live entropy meter, configurable word count, separator, case style, digits and symbols — entirely in your browser.",
      what:
        "A passphrase generator builds passwords from a string of random words instead of random characters. They&apos;re easier to type, easier to remember and — when long enough — stronger than dense gibberish like &quot;Tr0ub4dor&3&quot;. Toollyz Random Password Phrase Generator implements the classic XKCD 936 / Diceware pattern using a curated 1646-word English list (4–8 letter words, no apostrophes or hyphens) with ~10.7 bits of entropy per word. Word selection uses `crypto.getRandomValues` — the same CSPRNG browsers use for HTTPS key generation — with rejection sampling so every word is exactly equally likely (no modulo bias). Configure the word count (2–12), separator (hyphen / period / underscore / space / none), case style (lowercase / Title Case / UPPER CASE / camelCase), optional 0–4 appended digits and an optional appended symbol from a copy-safe set (`!@#$%&*?+-=`). The hero shows the current phrase with a colour-coded entropy band (Weak &lt; 40 bits / Fair &lt; 60 / Strong &lt; 80 / Excellent ≥ 80). Re-roll generates a fresh phrase; the last 12 are kept in localStorage. Toollyz has no backend.",
      how: [
        "Pick how many words you want (5+ recommended for ~53 bits).",
        "Choose separator, case style and optional digits / symbol.",
        "Watch the live entropy band — Strong (≥ 60 bits) is good for most accounts, Excellent (≥ 80 bits) for long-term secrets.",
        "Click Re-roll for a fresh phrase or Copy to grab it.",
      ],
      benefits: [
        "1646-word curated English list (~10.7 bits per word).",
        "crypto.getRandomValues with rejection sampling — no modulo bias, no Math.random fallback.",
        "Live entropy meter with four colour-coded bands (Weak / Fair / Strong / Excellent).",
        "Word count slider 2–12, with 5 as a balanced default (≈ 53 bits).",
        "Five separators (hyphen / period / underscore / space / none) and four case styles (lowercase / Title / UPPER / camelCase).",
        "Optional 0–4 appended digits and a copy-paste-safe symbol for sites that demand them.",
        "12-phrase history kept in localStorage with one-tap copy.",
        "100% private — phrases generated locally, nothing uploaded.",
      ],
      relatedSlugs: [
        "password-generator",
        "disposable-password-generator",
        "hash-generator",
        "uuid-generator",
      ],
      faqs: [
        {
          q: "How is this different from the regular Password Generator?",
          a: "The regular Password Generator builds dense character strings (like &quot;K7q!fX2#&quot;). This Passphrase Generator builds word strings (like &quot;Horse-Battery-Saddle-Pebble-Window&quot;). Both can be strong; passphrases are easier to type and remember, dense passwords are shorter on screen.",
        },
        {
          q: "What does &quot;entropy&quot; mean here?",
          a: "Entropy measures unpredictability in bits. Each bit doubles the number of guesses an attacker would need to brute-force the secret. 60 bits is solid for most accounts; 80+ is excellent. Each word from a 1646-word list adds ~10.7 bits — five words is ~53 bits, six words is ~64 bits.",
        },
        {
          q: "How random is it really?",
          a: "Maximally — it uses `crypto.getRandomValues`, the browser&apos;s cryptographically secure PRNG. The same primitive HTTPS uses. Word selection then uses rejection sampling so no word is more likely than another (a naive `% wordlist.length` would bias the first few words).",
        },
        {
          q: "Why these specific words?",
          a: "All 1646 words are 4–8 lowercase letters with no apostrophes, hyphens or unusual characters — easy to type, easy to remember, easy to dictate. Common English roots that work across English-speaking regions.",
        },
        {
          q: "Should I use digits or symbols?",
          a: "Only if the site requires them. A long enough word phrase is already strong; adding digits and a symbol just makes the phrase harder to type without much real security gain. The toggles exist because many sites still enforce arbitrary character rules.",
        },
        {
          q: "Is &quot;correct horse battery staple&quot; actually safe?",
          a: "Per the XKCD 936 math, four common words give ~44 bits of entropy — fine for casual sites but a bit weak by 2026 standards. Five words at this list&apos;s entropy is ~53 bits, six is ~64. Pick at least five for anything important.",
        },
        {
          q: "Can I customise the wordlist?",
          a: "Not in this release — the curated list is fixed for reproducibility and security. Building your own wordlist is risky: short or unfamiliar words can drop entropy. A future version may support imports.",
        },
        {
          q: "Is the history shared?",
          a: "No. The last 12 phrases save to localStorage on this device only. Toollyz has no backend; nothing is uploaded.",
        },
        {
          q: "Should I memorise these or use a password manager?",
          a: "Use a password manager for every account. Use a single memorised passphrase for the manager itself (and any small set of high-stakes accounts that aren&apos;t in the manager). Toollyz Passphrase Generator is great for that small set.",
        },
        {
          q: "Is this Passphrase Generator free?",
          a: "Completely free with no signup and no limits. Generate as many phrases as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "email-signature-generator",
    name: "Email Signature Generator",
    tagline: "Table-based HTML with inline styles, rich-paste for Gmail / Outlook.",
    description:
      "Design a clean, table-based HTML email signature with photo, social icons, brand colour and optional disclaimer. Outputs Outlook-friendly inline-style HTML and supports rich clipboard paste directly into Gmail and Outlook signature editors. Free and private.",
    categoryId: "generators",
    icon: Mailbox,
    status: "live",
    featured: true,
    keywords: [
      "email signature generator",
      "html email signature",
      "gmail signature generator",
      "outlook signature generator",
      "apple mail signature",
      "professional email signature",
      "brand email signature",
      "email signature with logo",
      "email signature social icons",
      "free email signature",
      "browser email signature",
      "email signature template",
      "html signature builder",
      "company email signature",
    ],
    seo: {
      title: "Email Signature Generator — Gmail / Outlook-Friendly HTML (Free)",
      description:
        "Build a clean table-based HTML email signature with Toollyz Email Signature Generator. Photo, social icons, brand colour, disclaimer — copy as rich or as HTML source. Optimised for Gmail, Outlook and Apple Mail.",
      what:
        "An email-signature generator turns a structured form into the HTML block that appears under every email you send. Toollyz Email Signature Generator outputs **table-based HTML with fully inline styles** — the only layout strategy that survives Outlook&apos;s Word-based renderer intact. Configure four tabs: Identity (name, pronouns, job title, company, photo URL with optional round/square crop), Contact (email, phone, website, address), Social (LinkedIn, X/Twitter, GitHub, Instagram, YouTube — only the ones you fill render), and Style (brand colour for the accent rule and links, optional disclaimer). The hero shows a true live preview rendered with `dangerouslySetInnerHTML` on a white background so you see exactly what the recipient will see. Two copy actions: **Copy rich** uses the Clipboard API&apos;s `ClipboardItem` to put both `text/html` and `text/plain` on your clipboard — paste straight into Gmail&apos;s or Outlook web&apos;s signature editor and the formatting survives. **Copy HTML source** gives the raw string for email clients that need a hand-edited template. Inline SVG social icons mean no external image dependency for the icons themselves (the photo still needs a public URL). Toollyz has no backend; your details save to localStorage on this device only.",
      how: [
        "Fill out the four tabs — Identity, Contact, Social, Style.",
        "Watch the live preview update as you type.",
        "Click Copy rich to paste straight into Gmail / Outlook signature settings.",
        "For Apple Mail or custom templates, use Copy HTML source.",
      ],
      benefits: [
        "Table-based HTML with fully inline styles — the only layout that survives Outlook intact.",
        "Live preview rendered on a white background so you see the recipient&apos;s view exactly.",
        "Five social platforms (LinkedIn, X/Twitter, GitHub, Instagram, YouTube) as inline SVG icons.",
        "Configurable brand colour drives the accent rule, the name link and the social icons.",
        "Optional pronouns, address and disclaimer fields.",
        "Round-avatar / square-logo toggle for the photo.",
        "Copy rich (`ClipboardItem` with text/html + text/plain) and Copy HTML source actions.",
        "100% private — Toollyz has no backend, your details save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "meta-tag-generator",
        "vcard-generator",
        "qr-code-generator",
        "url-shortener",
      ],
      faqs: [
        {
          q: "Will it work in Outlook?",
          a: "Yes — the signature uses `<table>` layout with all styles inline, which is what Outlook&apos;s Word-based renderer expects. Outlook desktop strips some advanced CSS (background images, flexbox); Toollyz avoids those entirely.",
        },
        {
          q: "How do I add this to Gmail?",
          a: "Settings → See all settings → General → scroll to Signature → click Create new → name it → click into the editor → click Copy rich in Toollyz → paste. The formatting carries over. Save changes at the bottom.",
        },
        {
          q: "How do I add it to Outlook for the web?",
          a: "Settings → Mail → Compose and reply → New signature → click into the editor → paste with Copy rich. For Outlook desktop, paste into the signature editor in File → Options → Mail → Signatures.",
        },
        {
          q: "Apple Mail?",
          a: "Apple Mail&apos;s signature editor strips rich-paste. The workaround: click Copy HTML source, save it as `signature.html`, open it in Safari, select all and copy from the rendered page, then paste into Apple Mail&apos;s signature editor. A bit clunky but it&apos;s Apple Mail&apos;s fault, not Toollyz&apos;s.",
        },
        {
          q: "Where should I host the photo?",
          a: "Anywhere publicly reachable over HTTPS — your company CDN, an avatar service, GitHub&apos;s avatar URLs, etc. Recipients&apos; clients fetch the image at view time, so it must be public. 120×120 PNG or JPG renders crisply.",
        },
        {
          q: "Can I add a custom social network?",
          a: "Not in this release — only LinkedIn, X/Twitter, GitHub, Instagram and YouTube have built-in SVG icons. Custom icons would need to be hosted externally and the inline `<img>` swapped in manually (use Copy HTML source then edit).",
        },
        {
          q: "Will images break for some recipients?",
          a: "Some email clients (corporate Outlook, conservative webmail) block remote images by default until the user clicks &quot;Show images&quot;. The signature still reads cleanly without the photo because the text block is on the right.",
        },
        {
          q: "Why inline styles instead of a stylesheet?",
          a: "Email clients strip `<style>` blocks aggressively — even Gmail rewrites them. Inline styles are the only universally-honored option. Toollyz produces fully-inlined HTML so the same string works in every client.",
        },
        {
          q: "Is my data uploaded?",
          a: "No. Toollyz has no backend. Your identity, contact and social links save to localStorage on this device only. The photo URL is rendered into the HTML — the photo file itself is hosted wherever you chose.",
        },
        {
          q: "Is this Email Signature Generator free?",
          a: "Completely free with no signup and no limits. Generate as many signatures as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "disposable-password-generator",
    name: "Disposable Password Generator",
    tagline: "Generate fresh, copy once, auto-clear from the screen.",
    description:
      "Generate strong single-use passwords with crypto.getRandomValues and rejection sampling. Each Generate next produces a fresh one; the displayed password auto-clears from screen 5–300 seconds after you copy it. Toollyz is a static site — honest framing about no server-side expiring link. Free and private.",
    categoryId: "generators",
    icon: KeySquare,
    status: "live",
    featured: true,
    keywords: [
      "disposable password generator",
      "one time password",
      "fresh password generator",
      "single use password",
      "auto-clear password",
      "burner password",
      "crypto random password",
      "password generator",
      "strong password generator",
      "browser password generator",
      "free disposable password",
      "secure password generator",
      "password rejection sampling",
      "ephemeral password",
    ],
    seo: {
      title: "Disposable Password Generator — Fresh, Copy, Auto-Clear (Free)",
      description:
        "Generate single-use passwords with Toollyz Disposable Password Generator. crypto.getRandomValues + rejection sampling, auto-clear from screen 5–300s after copy, honest framing — Toollyz has no backend so no server-side expiring link.",
      what:
        "A disposable password generator produces a fresh, single-use credential each time you ask. Toollyz Disposable Password Generator runs entirely in your browser using `crypto.getRandomValues` — the same cryptographically secure PRNG that backs HTTPS in your browser — with rejection sampling so every character is exactly equally likely. The hero shows the latest password in monospace with a Show/Hide toggle; click Copy and a countdown starts — the password is **cleared from the screen** between 5 and 300 seconds later (configurable). Each Generate next pushes a fresh password to the top and keeps the previous 7 in a recent list, also subject to the auto-clear timer. **Honest framing**: Toollyz is a static site with no backend, so there&apos;s no server-side expiring link. &quot;Disposable&quot; here means *generate fresh, copy once, clear from screen quickly* — for real shared self-destructing secrets across people or devices, use a hosted service like 1Password Items Sharing, Bitwarden Send, OneTimeSecret or PrivateBin. The settings panel covers length (8–64), character classes (uppercase / lowercase / digits / symbols), Avoid confusables (Il1O0 stripped from the alphabet) and Group-with-dashes for readability. Settings save to localStorage; passwords never persist anywhere.",
      how: [
        "Set the length, character classes and (optional) confusable-avoidance / dash grouping.",
        "Set the auto-clear timeout (5–300 seconds) — how long the password stays on screen after you copy it.",
        "Click Generate next or watch the first one appear on load.",
        "Copy, paste into the destination, and the screen clears automatically — keep generating fresh ones as needed.",
      ],
      benefits: [
        "crypto.getRandomValues + rejection sampling — no modulo bias, no Math.random fallback.",
        "Configurable length (8–64), character classes (Aa0!@) and confusable avoidance (Il1O0 stripped).",
        "Group-with-dashes mode for easier dictation and visual structure.",
        "Auto-clear from screen 5–300 seconds after Copy — not a fixed timer, so the countdown only starts once it&apos;s actually copied.",
        "Recent list (last 7) with per-row Copy and the same auto-clear behaviour.",
        "Show / Hide toggle for screen-share scenarios.",
        "Honest framing: settings save to localStorage but passwords <strong>never</strong> persist.",
        "100% private — Toollyz has no backend, all randomness is local.",
      ],
      relatedSlugs: [
        "password-generator",
        "random-password-phrase-generator",
        "hash-generator",
        "secure-notes",
      ],
      faqs: [
        {
          q: "What does &quot;disposable&quot; mean here?",
          a: "Generate fresh, copy once, clear from screen quickly. There is no shareable link with server-side expiry — Toollyz is a static site with no backend. For server-side expiring links, use 1Password Items Sharing, Bitwarden Send, OneTimeSecret or PrivateBin.",
        },
        {
          q: "How is the randomness generated?",
          a: "`crypto.getRandomValues` with rejection sampling. That&apos;s the browser&apos;s cryptographically secure PRNG (same one HTTPS uses), and rejection sampling avoids modulo bias so every character in the configured alphabet is exactly equally likely.",
        },
        {
          q: "Why is the screen clear keyed to Copy and not a fixed timer?",
          a: "If the timer started at generation, you might lose the password before you finished pasting it. The countdown begins the moment you click Copy, giving you the full configured window to use it in the destination.",
        },
        {
          q: "Do the passwords leave my browser?",
          a: "No. They&apos;re generated locally and only ever appear on this page. Toollyz has no backend; nothing is uploaded; nothing persists across reload (only the settings save).",
        },
        {
          q: "How do I share a password with someone else securely?",
          a: "Use a dedicated tool: 1Password Items Sharing, Bitwarden Send, OneTimeSecret or PrivateBin. They handle encryption, server-side expiry and view-count limits. Toollyz Disposable Password Generator focuses on generation, not transport.",
        },
        {
          q: "Why &quot;avoid confusables&quot;?",
          a: "Capital I, lowercase l, digit 1, capital O and digit 0 are easy to misread when dictated or read from a screenshot. Stripping them gives a slightly smaller alphabet (~5 chars less) in exchange for fewer mistakes.",
        },
        {
          q: "Does grouping with dashes weaken the password?",
          a: "No — the underlying characters are still uniformly random. The dashes are visual only, inserted every 4 characters for readability. Most password fields accept them; if a destination strips them, the password still has the same entropy.",
        },
        {
          q: "How long should the password be?",
          a: "20 characters with mixed case + digits gives ~119 bits of entropy — far beyond any practical brute-force attack. 12–16 is fine for casual sites; 24+ is overkill in most scenarios but doesn&apos;t hurt.",
        },
        {
          q: "Why don't symbols default to on?",
          a: "Some destinations (legacy POS systems, older Wi-Fi config UIs) reject symbols. Length + mixed case + digits is plenty strong without them. Toggle symbols on if your site requires them.",
        },
        {
          q: "Is this Disposable Password Generator free?",
          a: "Completely free with no signup and no limits. Generate as many as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "favicon-from-text",
    name: "Favicon Generator from Text",
    tagline: "Letter / emoji favicon with auto-fit, 9 PNG sizes and a hand-rolled .ico.",
    description:
      "Generate a clean favicon set from a letter, emoji or short word. Auto-fits the text on a 512×512 canvas, three shapes (square / rounded / circle), exports PNG at 16/32/48/64/128/180/192/256/512 plus a true Windows .ico (16+32+48) and a paste-ready &lt;head&gt; HTML snippet. Free and private.",
    categoryId: "generators",
    icon: ImagePlus,
    status: "live",
    featured: true,
    keywords: [
      "favicon generator",
      "text favicon generator",
      "letter favicon generator",
      "emoji favicon",
      "favicon ico generator",
      "favicon png generator",
      "apple touch icon",
      "site icon generator",
      "favicon set generator",
      "browser favicon generator",
      "free favicon generator",
      "favicon html snippet",
      "favicon 16x16 32x32",
      "favicon 512",
    ],
    seo: {
      title: "Favicon Generator from Text — PNG + ICO + HTML Snippet (Free)",
      description:
        "Generate a clean favicon set from a letter, emoji or short word with Toollyz Favicon Generator. Auto-fit text, three shapes, 9 PNG sizes plus a hand-rolled Windows .ico and a paste-ready &lt;head&gt; snippet — entirely in your browser.",
      what:
        "A favicon generator turns a short string (letter, digits or emoji) into the icon set every modern website needs. Toollyz Favicon Generator from Text renders onto a 512×512 canvas with three shape options (square / rounded square with a 22% corner radius / circle), configurable background colour, text colour, font (System UI / Inter / Georgia / Courier / Comic Sans), bold and italic toggles, and an auto-fit text engine that starts at 64% of the canvas size and shrinks by 15% per step until the text fits within 86% of the canvas width. The live preview row shows the result at 16, 32, 48, 64 and 180 pixels simultaneously so you can see exactly how it&apos;ll look in a browser tab vs an Apple touch icon. Export options: a quick-pick row downloads any of nine PNG sizes (16, 32, 48, 64, 128, 180, 192, 256, 512), &quot;All PNG sizes&quot; saves the whole set, and **Download favicon.ico** assembles a real Windows .ico file with embedded PNG payloads at 16, 32 and 48 (Vista+ format — much smaller than legacy BMP icons). The HTML snippet section copies a paste-ready `&lt;head&gt;` block with the standard link tags, the apple-touch-icon, theme-color and apple-mobile-web-app-title using your chosen site name. Toollyz has no backend.",
      how: [
        "Type a letter, digit or emoji (1-3 chars works best — the auto-fit shrinks longer words).",
        "Pick a shape (square / rounded / circle) and adjust background and text colours.",
        "Choose a font and the bold / italic toggles. The live preview strip updates instantly.",
        "Click Download favicon.ico for the classic /favicon.ico file, or All PNG sizes for the full set + Copy snippet for the &lt;head&gt; HTML.",
      ],
      benefits: [
        "Auto-fit text engine that scales the font down by 15% per step until it fits within 86% of the canvas width.",
        "Three shapes: square, rounded (22% corner radius), circle.",
        "Five font choices including System UI, Inter, Georgia, Courier and Comic Sans.",
        "Live preview at 16 / 32 / 48 / 64 / 180 pixels simultaneously.",
        "Nine PNG export sizes (16, 32, 48, 64, 128, 180, 192, 256, 512).",
        "Hand-rolled Windows .ico writer with embedded PNG payloads at 16 / 32 / 48 (Vista+ compatible).",
        "Paste-ready &lt;head&gt; HTML snippet with link tags, apple-touch-icon and theme-color.",
        "100% private — Toollyz has no backend, every byte stays in your browser.",
      ],
      relatedSlugs: [
        "meta-tag-generator",
        "qr-code-generator",
        "color-picker",
        "barcode-generator",
      ],
      faqs: [
        {
          q: "How does the auto-fit work?",
          a: "The text starts at 64% of the canvas size, gets measured, and if it overflows 86% of the canvas width, the font shrinks by 15% and is re-measured. After up to 12 iterations the text fits cleanly — usually in 1-3 steps for short labels.",
        },
        {
          q: "Why a 512×512 canvas if 16×16 is the smallest target?",
          a: "Rendering at high resolution and downsampling produces sharper text at every size than rendering directly at 16×16 (where each pixel is huge relative to the glyph). The browser&apos;s native scaler handles the downsample with anti-aliasing.",
        },
        {
          q: "What's special about the .ico file?",
          a: "It&apos;s a true Windows ICO with the standard ICONDIR / ICONDIRENTRY headers and PNG payloads embedded at 16, 32 and 48 pixels. Windows Vista and later accept PNG-payload icons natively — files are much smaller than legacy BMP icons.",
        },
        {
          q: "Will the emoji render the same on every device?",
          a: "Emoji rendering depends on the OS&apos;s emoji font — Apple Color Emoji on macOS / iOS, Segoe UI Emoji on Windows, Twemoji or Noto Color Emoji on Android. They may look slightly different across platforms, but the canvas captures whatever your current OS renders.",
        },
        {
          q: "What does the HTML snippet include?",
          a: "Standard link tags for /favicon.ico, /favicon-16x16.png, /favicon-32x32.png, /favicon-192x192.png and /apple-touch-icon.png (180×180), plus a theme-color meta tag and the apple-mobile-web-app-title meta with your chosen site name. Paste it into your `<head>`.",
        },
        {
          q: "Do I need to host the files?",
          a: "Yes — upload them to your site&apos;s root (or wherever the link tags point). Browsers and search engines fetch them from there. Toollyz only generates the files; you host them.",
        },
        {
          q: "Can I use this for a PWA?",
          a: "Yes — the 192×192 and 512×512 PNGs satisfy the standard PWA manifest icon sizes. You&apos;ll still need to write a `manifest.json` referencing them.",
        },
        {
          q: "Why three shapes?",
          a: "Square is the classic browser-tab shape, rounded is what most modern OSes show on home screens (iOS / iPadOS apply their own clip anyway) and circle works well for character-based avatars. Pick the one that matches your brand.",
        },
        {
          q: "Are my files uploaded?",
          a: "No. Toollyz has no backend — rendering and ICO assembly happen entirely in your browser. Settings save to localStorage on this device only.",
        },
        {
          q: "Is this Favicon Generator free?",
          a: "Completely free with no signup and no limits. Generate as many favicons as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "mac-address-generator",
    name: "MAC Address Generator",
    tagline: "Random or 12 vendor-OUI MACs with proper U/L + I/G bits.",
    description:
      "Generate up to 500 MAC addresses with crypto.getRandomValues. Random mode sets the locally administered bit and clears the multicast bit. Choose from 12 vendor OUI presets (Apple, Cisco, Intel, Dell, HP, Lenovo, Samsung, Microsoft, VMware, Google, Raspberry Pi, Amazon). Four formats (colon / dash / Cisco-dot / plain) and case toggle. Free and private.",
    categoryId: "generators",
    icon: RadioTower,
    status: "live",
    featured: true,
    keywords: [
      "mac address generator",
      "random mac address",
      "vendor mac generator",
      "oui mac generator",
      "apple mac address",
      "cisco mac address",
      "intel mac address",
      "ethernet mac generator",
      "bulk mac generator",
      "network testing mac",
      "browser mac generator",
      "free mac generator",
      "mac address format",
      "cisco dot mac format",
    ],
    seo: {
      title: "MAC Address Generator — Random or 12 Vendor OUIs (Free, Bulk)",
      description:
        "Generate up to 500 valid MAC addresses with Toollyz MAC Address Generator. crypto.getRandomValues, proper locally-administered + unicast bits, 12 vendor OUI presets, four formats — entirely in your browser.",
      what:
        "A MAC (Media Access Control) address generator produces 6-byte hardware identifiers — the unique number every Ethernet, Wi-Fi or Bluetooth interface carries. Toollyz MAC Address Generator runs entirely in your browser using `crypto.getRandomValues`. **Random mode** sets the high two bits of the first byte correctly: the I/G bit (bit 0) is cleared so the address is unicast, and the U/L bit (bit 1) is set so the address is locally administered — meaning it&apos;s guaranteed not to clash with any IEEE-assigned OUI in the wild. **Vendor OUI mode** keeps a real-world 3-byte OUI prefix (Apple, Cisco, Intel, Dell, HP, Lenovo, Samsung, Microsoft, VMware, Google, Raspberry Pi or Amazon — 12 options) and randomises only the last 3 bytes (16.7M combinations per OUI). Output supports four formats: colon (`AA:BB:CC:DD:EE:FF`), dash (`AA-BB-CC-DD-EE-FF`), Cisco dot (`AABB.CCDD.EEFF` — the format Cisco IOS shows in `show interface`) and plain (`AABBCCDDEEFF`). Toggle between UPPER and lowercase. Generate 1–500 at a time, copy individuals or the whole batch, or download as a .txt file. Toollyz has no backend.",
      how: [
        "Pick a count (1–500) and a vendor OUI (or Random for locally administered unicast).",
        "Choose format (colon / dash / Cisco dot / plain) and casing (UPPER / lower).",
        "Click Generate (or it generates on load) and review the list.",
        "Copy individual addresses, Copy all or Download .txt for bulk use.",
      ],
      benefits: [
        "crypto.getRandomValues for true random bytes — no Math.random.",
        "Random mode sets U/L = 1 (locally administered) and clears I/G = 0 (unicast) — the only correct way to randomise.",
        "12 vendor OUI presets (Apple / Cisco / Intel / Dell / HP / Lenovo / Samsung / Microsoft / VMware / Google / Raspberry Pi / Amazon).",
        "Four output formats including Cisco-style `XXXX.XXXX.XXXX` for IOS configs.",
        "Case toggle (UPPER / lower) since vendors and tools differ.",
        "Bulk generation up to 500 addresses with Copy all and Download .txt actions.",
        "Per-row copy button for quickly grabbing a single address.",
        "100% private — Toollyz has no backend, addresses generated locally.",
      ],
      relatedSlugs: [
        "uuid-generator",
        "ip-address-finder",
        "hash-generator",
        "dns-lookup",
      ],
      faqs: [
        {
          q: "What is a MAC address?",
          a: "A 6-byte (48-bit) hardware identifier assigned to a network interface (Ethernet, Wi-Fi, Bluetooth). The first 3 bytes are usually an OUI (Organisationally Unique Identifier) assigned to the device manufacturer; the last 3 bytes are device-specific.",
        },
        {
          q: "What's the locally administered bit?",
          a: "Bit 1 of the first byte (the U/L bit). When 0, the address is universally administered (assigned via the IEEE OUI registry). When 1, the address is locally administered — it&apos;s guaranteed not to clash with any IEEE assignment and is the safe choice for randomly-generated MACs.",
        },
        {
          q: "What's the unicast bit?",
          a: "Bit 0 of the first byte (the I/G bit). When 0, the address is unicast (one recipient). When 1, the address is multicast or broadcast. Toollyz Random mode always clears this bit so every generated address is a valid unicast.",
        },
        {
          q: "Are the OUI presets real?",
          a: "Yes — each preset uses a real-world OUI registered to that vendor. Vendors typically own many OUIs each; these are just one representative each. For exhaustive lookups, use the IEEE&apos;s OUI registry directly.",
        },
        {
          q: "Why Cisco dot format?",
          a: "Cisco IOS displays MAC addresses as `XXXX.XXXX.XXXX` (three groups of four hex digits separated by dots) in `show interface`, `show mac address-table` and configuration output. The format is useful when you&apos;re building or parsing IOS configs.",
        },
        {
          q: "Can I use these on a real network?",
          a: "For testing, lab setups and as fixture data — absolutely. For impersonating other devices in production — that&apos;s typically against the terms of service of any network you don&apos;t own. Use locally administered random MACs for privacy on your own devices.",
        },
        {
          q: "Are vendor-OUI MACs valid?",
          a: "The OUI itself is valid (it&apos;s really assigned to that vendor), but the last 3 bytes are random — they&apos;re very unlikely to collide with a real device but theoretically could. For laboratory and testing purposes, treat them as unique.",
        },
        {
          q: "How does randomness compare with privacy MACs my phone uses?",
          a: "Modern iOS and Android generate per-network locally administered MACs to avoid tracking. They use the same U/L bit trick Toollyz does. The point is the same: a MAC that won&apos;t clash with anyone else&apos;s and won&apos;t reveal your true hardware identity.",
        },
        {
          q: "Are my generated addresses uploaded?",
          a: "No. Toollyz has no backend — every byte is generated in your browser. Settings save to localStorage on this device only.",
        },
        {
          q: "Is this MAC Address Generator free?",
          a: "Completely free with no signup and no limits. Generate as many as you like — privately in your browser.",
        },
      ],
    },
  },
  {
    slug: "vcard-generator",
    name: "VCard Generator",
    tagline: "RFC 2426 vCard 3.0 with QR scan-to-add for iOS / Android.",
    description:
      "Build a compliant vCard 3.0 (.vcf) with multiple phones, emails, websites and addresses, photo URL, birthday and notes. Download the file, copy the source or scan the embedded QR code on any phone to add the contact in one tap. Free and private.",
    categoryId: "generators",
    icon: ContactRound,
    status: "live",
    featured: true,
    keywords: [
      "vcard generator",
      "vcf generator",
      "contact card generator",
      "qr contact card",
      "vcard 3.0",
      "rfc 2426 vcard",
      "ios contact card",
      "android contact card",
      "vcf download",
      "vcard qr code",
      "free vcard generator",
      "browser vcard generator",
      "scan to add contact",
      "rfc 2426",
    ],
    seo: {
      title: "VCard Generator — RFC 2426 vCard 3.0 + QR Scan (Free, Private)",
      description:
        "Build a compliant vCard 3.0 file with Toollyz VCard Generator. Multiple phones, emails, websites and addresses, photo URL, birthday, notes — download the .vcf or scan the embedded QR to add the contact on any phone.",
      what:
        "A vCard generator builds the standard `.vcf` file format used by every mobile contacts app on the planet. Toollyz VCard Generator emits **vCard 3.0** (RFC 2426) — version 3.0 specifically because it has the broadest iOS / Android / Outlook / Google Contacts support. The four-tab form covers Identity (first / last / middle / prefix / suffix / nickname / org / department / title / birthday), Contact (multiple phones, emails and websites with type labels like CELL / WORK / HOME), Addresses (full structured address blocks with type labels) and Extras (photo URL and a free-form note). The output is properly escaped (commas, semicolons and newlines per RFC 2426 §2.1.3), wrapped at 75 octets (RFC 2425 §5.8.1) and includes a fresh `REV` timestamp. The hero shows a live QR code embedding the full .vcf — point any modern phone camera at it and the OS offers &quot;Add to contacts&quot; in one tap. Download as `.vcf`, copy the source for inspection or scan the QR. Toollyz has no backend; your contact details save to localStorage on this device only.",
      how: [
        "Fill the Identity, Contact, Addresses and Extras tabs (most fields are optional).",
        "Watch the live QR code update in the hero — point your phone camera at it to test.",
        "Click Download .vcf to save the file or Download QR PNG for the standalone QR.",
        "Tap Copy text to grab the raw vCard source for emails or wiki entries.",
      ],
      benefits: [
        "vCard 3.0 (RFC 2426) — broadest iOS / Android / Outlook / Google Contacts support.",
        "Multiple phones / emails / websites with type labels (CELL / WORK / HOME / FAX / VOICE / PAGER).",
        "Full structured addresses (street / city / region / postcode / country) per address with type label.",
        "Birthday, photo URL and free-form note fields.",
        "Properly escaped values (commas, semicolons, newlines) per RFC 2426 §2.1.3 — every contacts app parses cleanly.",
        "Lines wrapped at 75 octets per RFC 2425 §5.8.1 — strict parsers accept the output.",
        "Live QR code embedding the full .vcf — point a phone camera, tap Add to contacts.",
        "100% private — Toollyz has no backend, details save to localStorage on this device only.",
      ],
      relatedSlugs: [
        "digital-business-card",
        "qr-code-generator",
        "email-signature-generator",
        "barcode-generator",
      ],
      faqs: [
        {
          q: "What's vCard?",
          a: "vCard is the standard file format for contact information, defined by RFC 2426. Every modern contacts app (iOS Contacts, Google Contacts, Outlook, macOS Contacts, Android Contacts) imports `.vcf` files and offers Add-to-Contacts when scanning a vCard QR code.",
        },
        {
          q: "Why version 3.0 and not 4.0?",
          a: "vCard 4.0 (RFC 6350) added gender, kind and richer language tagging, but support across mobile contacts apps is uneven. vCard 3.0 is the safe interoperable target — every major contacts client parses it cleanly.",
        },
        {
          q: "Will the QR code work on iPhone?",
          a: "Yes. Open the Camera app, point it at the QR code, tap the popup — iOS reads the embedded vCard and offers &quot;Add to Contacts&quot; with all your fields prefilled.",
        },
        {
          q: "How big can the vCard be?",
          a: "QR codes have a maximum capacity (around 4,296 alphanumeric or 2,953 byte characters at level L error correction). Adding many photos, long notes or huge addresses can push past the QR limit — Toollyz shows a warning toast if that happens. The .vcf file itself has no real-world size limit.",
        },
        {
          q: "Does the photo embed in the QR?",
          a: "No — the photo is referenced by URL (`PHOTO;VALUE=URI:…`). The receiving phone fetches the image when it imports the contact. Photo URLs must be publicly reachable over HTTPS.",
        },
        {
          q: "How are special characters handled?",
          a: "Per RFC 2426 §2.1.3, commas (`,`), semicolons (`;`), backslashes (`\\\\`) and newlines (`\\n`) inside values are escaped automatically. Lines longer than 75 octets are folded with a leading space per RFC 2425 §5.8.1.",
        },
        {
          q: "Can I include multiple phones or emails?",
          a: "Yes — the Contact tab has Add buttons for each list. Each entry gets its own type label (CELL / WORK / HOME etc.), and the output emits one `TEL` / `EMAIL` line per entry.",
        },
        {
          q: "What does the REV field do?",
          a: "It&apos;s a timestamp recording when the vCard was last modified. Contacts apps use it to decide whether an incoming vCard is fresher than the one already on file. Toollyz stamps it with the current ISO 8601 time on every export.",
        },
        {
          q: "Is my contact info uploaded?",
          a: "No. Toollyz has no backend. The vCard is built in your browser; your form data saves to localStorage on this device only.",
        },
        {
          q: "Is this VCard Generator free?",
          a: "Completely free with no signup and no limits. Generate as many vCards as you like — privately in your browser.",
        },
      ],
    },
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
    tagline: "Generate relevant hashtags for any topic.",
    description:
      "Turn any keyword into relevant, popular and niche hashtag suggestions for Instagram, TikTok, X, LinkedIn and YouTube, with a broad/niche reach mix, favorites and one-click copy. Free and private.",
    categoryId: "seo",
    icon: Hash,
    status: "live",
    featured: true,
    keywords: [
      "hashtag generator",
      "instagram hashtags",
      "tiktok hashtags",
      "hashtag suggestions",
      "best hashtags",
      "hashtags for reels",
      "hashtag finder",
      "social media hashtags",
      "hashtag tool",
      "youtube hashtags",
      "linkedin hashtags",
      "niche hashtags",
      "hashtag ideas",
      "copy hashtags",
    ],
    seo: {
      title: "Hashtag Generator — Relevant Hashtags for Any Topic",
      description:
        "Generate relevant, popular and niche hashtags for Instagram, TikTok, X, LinkedIn and YouTube with Toollyz Hashtag Generator. Pick a reach mix, save favorites and copy with one click — free and private.",
      what:
        "A Hashtag Generator turns a topic or keyword into a set of relevant hashtags you can add to a post to reach more people. Toollyz Hashtag Generator expands your seed keyword into useful variations and pairs it with curated banks of popular and long-tail tags tuned for each platform — Instagram, TikTok, X, LinkedIn and YouTube — each with its own sensible default count. A reach-mix control lets you lean toward broad, high-volume tags (more reach, more competition) or niche, long-tail tags (smaller audiences that are easier to rank in), and it auto-detects the topic's category (travel, food, fitness, tech and more) to add fitting suggestions. You can shuffle for fresh ideas, save favorites, and copy everything as a ready-to-paste block or one tag per line. Importantly, these are curated, relevance-ranked suggestions generated entirely in your browser — not live trend data scraped from any platform — so nothing you type is ever uploaded.",
      how: [
        "Enter a topic or a few keywords (for example, “vegan recipes”).",
        "Choose your platform and set how many hashtags you want.",
        "Pick a reach mix — broad, balanced or niche — and shuffle for fresh ideas.",
        "Tap any hashtag to copy it, save favorites, or copy the whole set at once.",
      ],
      benefits: [
        "Keyword expansion into relevant, ready-to-use hashtags.",
        "Per-platform tuning for Instagram, TikTok, X, LinkedIn and YouTube.",
        "Broad ↔ niche reach mix to balance audience size and competition.",
        "Automatic topic detection (travel, food, fitness, tech and more) for fitting tags.",
        "Save favorites and copy as a block or one tag per line.",
        "A built-in blocklist avoids commonly banned or spammy tags.",
        "Shuffle for fresh, deterministic variations any time.",
        "100% private — generated in your browser, nothing is uploaded.",
      ],
      relatedSlugs: [
        "fancy-text-generator",
        "username-generator",
        "word-counter",
        "case-converter",
      ],
      faqs: [
        {
          q: "What is a hashtag generator?",
          a: "A hashtag generator suggests relevant hashtags for a topic so your posts can reach a wider, more interested audience. You enter a keyword and it returns a mix of popular and niche tags you can copy into your caption.",
        },
        {
          q: "Are these live trending hashtags?",
          a: "No — and we're upfront about that. A privacy-first tool that runs entirely in your browser can't pull live trend data from platform APIs. Instead it generates curated, relevance-ranked suggestions from your keyword plus well-known popular and long-tail tags. They're a strong starting point you can refine for your audience.",
        },
        {
          q: "How many hashtags should I use?",
          a: "It depends on the platform. Instagram allows up to 30 and many creators use 10–20; TikTok and X do best with just a few highly relevant tags; LinkedIn typically 3–5. The tool sets a sensible default per platform, which you can adjust.",
        },
        {
          q: "What's the difference between broad and niche hashtags?",
          a: "Broad hashtags (like #travel) have huge audiences but enormous competition, so your post is seen briefly. Niche hashtags (like #solotraveltips) reach fewer but more relevant people and are easier to rank in. The reach-mix control lets you balance the two.",
        },
        {
          q: "Which platforms does it support?",
          a: "Instagram, TikTok, X (Twitter), LinkedIn and YouTube. Each platform gets its own default count and a set of platform-appropriate tags mixed into the suggestions.",
        },
        {
          q: "Can I save and reuse hashtags?",
          a: "Yes. Tap the star on any hashtag to save it; your favorites are kept in your browser's local storage and can be copied as a group whenever you need them.",
        },
        {
          q: "Will it avoid banned hashtags?",
          a: "It filters against a built-in blocklist of commonly banned or spammy tags, so they won't appear in your suggestions. Platforms change their rules often, so it's still wise to review tags before posting.",
        },
        {
          q: "Is my topic or keyword stored online?",
          a: "No. All generation happens entirely in your browser — nothing you type is uploaded. Your last topic, platform and saved favorites are kept only in your device's local storage.",
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. The keyword input, platform picker, reach control and hashtag chips are fully responsive and touch-friendly, so you can build hashtag sets on your phone.",
        },
        {
          q: "Is this hashtag generator free?",
          a: "Completely free with no signup and no limits. Generating, shuffling, saving favorites and copying are all available to everyone, privately in your browser.",
        },
      ],
    },
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
