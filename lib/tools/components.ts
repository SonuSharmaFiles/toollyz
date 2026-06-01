import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "qr-code-generator": dynamic(
    () => import("@/components/tools/qr-code-generator"),
  ),
  "uuid-generator": dynamic(
    () => import("@/components/tools/uuid-generator"),
  ),
  "lorem-ipsum-generator": dynamic(
    () => import("@/components/tools/lorem-ipsum-generator"),
  ),
  "fake-address-generator": dynamic(
    () => import("@/components/tools/fake-address-generator"),
  ),
  "username-generator": dynamic(
    () => import("@/components/tools/username-generator"),
  ),
  "fake-name-generator": dynamic(
    () => import("@/components/tools/fake-name-generator"),
  ),
  "wifi-qr-code-generator": dynamic(
    () => import("@/components/tools/wifi-qr-code-generator"),
  ),
  "password-generator": dynamic(
    () => import("@/components/tools/password-generator"),
  ),
  "otp-generator": dynamic(
    () => import("@/components/tools/otp-generator"),
  ),
  "audio-volume-booster": dynamic(
    () => import("@/components/tools/audio-volume-booster"),
  ),
  "white-noise-generator": dynamic(
    () => import("@/components/tools/white-noise-generator"),
  ),
  "random-color-generator": dynamic(
    () => import("@/components/tools/random-color-generator"),
  ),
  "coin-flip-simulator": dynamic(
    () => import("@/components/tools/coin-flip-simulator"),
  ),
  "bingo-card-generator": dynamic(
    () => import("@/components/tools/bingo-card-generator"),
  ),
  "spin-wheel-generator": dynamic(
    () => import("@/components/tools/spin-wheel-generator"),
  ),
  "decision-maker-wheel": dynamic(
    () => import("@/components/tools/decision-maker-wheel"),
  ),
  "lucky-draw-generator": dynamic(
    () => import("@/components/tools/lucky-draw-generator"),
  ),
  "random-emoji-generator": dynamic(
    () => import("@/components/tools/random-emoji-generator"),
  ),
  "random-fact-generator": dynamic(
    () => import("@/components/tools/random-fact-generator"),
  ),
  "random-joke-generator": dynamic(
    () => import("@/components/tools/random-joke-generator"),
  ),
  "random-quote-generator": dynamic(
    () => import("@/components/tools/random-quote-generator"),
  ),
  "calendar-generator": dynamic(
    () => import("@/components/tools/calendar-generator"),
  ),
  "horoscope-generator": dynamic(
    () => import("@/components/tools/horoscope-generator"),
  ),
  "word-counter": dynamic(
    () => import("@/components/tools/word-counter"),
  ),
  "character-counter": dynamic(
    () => import("@/components/tools/character-counter"),
  ),
  "case-converter": dynamic(
    () => import("@/components/tools/case-converter"),
  ),
  "slugify": dynamic(
    () => import("@/components/tools/slugify"),
  ),
  "online-notepad": dynamic(
    () => import("@/components/tools/online-notepad"),
  ),
  "markdown-editor-previewer": dynamic(
    () => import("@/components/tools/markdown-editor-previewer"),
  ),
  "ascii-art-generator": dynamic(
    () => import("@/components/tools/ascii-art-generator"),
  ),
  "json-formatter": dynamic(
    () => import("@/components/tools/json-formatter"),
  ),
  "xml-formatter": dynamic(
    () => import("@/components/tools/xml-formatter"),
  ),
  "html-minifier": dynamic(
    () => import("@/components/tools/html-minifier"),
  ),
  "javascript-minifier": dynamic(
    () => import("@/components/tools/javascript-minifier"),
  ),
  "css-minifier": dynamic(
    () => import("@/components/tools/css-minifier"),
  ),
  "jwt-decoder": dynamic(
    () => import("@/components/tools/jwt-decoder"),
  ),
  "regex-tester": dynamic(
    () => import("@/components/tools/regex-tester"),
  ),
  "hashtag-generator": dynamic(
    () => import("@/components/tools/hashtag-generator"),
  ),
  "secure-notes": dynamic(
    () => import("@/components/tools/secure-notes"),
  ),
  "clipboard-manager": dynamic(
    () => import("@/components/tools/clipboard-manager"),
  ),
  "ip-address-finder": dynamic(
    () => import("@/components/tools/ip-address-finder"),
  ),
  "ping-test": dynamic(
    () => import("@/components/tools/ping-test"),
  ),
  "internet-speed-test": dynamic(
    () => import("@/components/tools/internet-speed-test"),
  ),
  "browser-info": dynamic(
    () => import("@/components/tools/browser-info"),
  ),
  "device-info": dynamic(
    () => import("@/components/tools/device-info"),
  ),
  "battery-status": dynamic(
    () => import("@/components/tools/battery-status"),
  ),
  "dns-lookup": dynamic(
    () => import("@/components/tools/dns-lookup"),
  ),
  "screen-resolution": dynamic(
    () => import("@/components/tools/screen-resolution"),
  ),
  "keyboard-tester": dynamic(
    () => import("@/components/tools/keyboard-tester"),
  ),
  "mouse-click-tester": dynamic(
    () => import("@/components/tools/mouse-click-tester"),
  ),
  "mic-test": dynamic(
    () => import("@/components/tools/mic-test"),
  ),
  "url-encoder-decoder": dynamic(
    () => import("@/components/tools/url-encoder-decoder"),
  ),
  "base64-encoder-decoder": dynamic(
    () => import("@/components/tools/base64-encoder-decoder"),
  ),
  "webcam-test": dynamic(
    () => import("@/components/tools/webcam-test"),
  ),
  "markdown-to-html": dynamic(
    () => import("@/components/tools/markdown-to-html"),
  ),
  "hex-to-rgb": dynamic(
    () => import("@/components/tools/hex-to-rgb"),
  ),
  "rgb-to-hex": dynamic(
    () => import("@/components/tools/rgb-to-hex"),
  ),
  "jpg-to-png": dynamic(
    () => import("@/components/tools/jpg-to-png"),
  ),
  "png-to-webp": dynamic(
    () => import("@/components/tools/png-to-webp"),
  ),
  "fancy-text-generator": dynamic(
    () => import("@/components/tools/fancy-text-generator"),
  ),
  "invisible-text-generator": dynamic(
    () => import("@/components/tools/invisible-text-generator"),
  ),
  "meta-tag-generator": dynamic(
    () => import("@/components/tools/meta-tag-generator"),
  ),
  "robots-txt-generator": dynamic(
    () => import("@/components/tools/robots-txt-generator"),
  ),
  "currency-converter": dynamic(
    () => import("@/components/tools/currency-converter"),
  ),
  "url-shortener": dynamic(
    () => import("@/components/tools/url-shortener"),
  ),
  "utm-link-generator": dynamic(
    () => import("@/components/tools/utm-link-generator"),
  ),
  "whois-lookup": dynamic(
    () => import("@/components/tools/whois-lookup"),
  ),
  "color-picker": dynamic(
    () => import("@/components/tools/color-picker"),
  ),
  "image-compressor": dynamic(
    () => import("@/components/tools/image-compressor"),
  ),
  "image-resizer": dynamic(
    () => import("@/components/tools/image-resizer"),
  ),
  "gradient-generator": dynamic(
    () => import("@/components/tools/gradient-generator"),
  ),
  "meme-generator": dynamic(
    () => import("@/components/tools/meme-generator"),
  ),
  "signature-generator": dynamic(
    () => import("@/components/tools/signature-generator"),
  ),
  "pdf-merger": dynamic(
    () => import("@/components/tools/pdf-merger"),
  ),
  "pdf-splitter": dynamic(
    () => import("@/components/tools/pdf-splitter"),
  ),
  "pdf-to-image": dynamic(
    () => import("@/components/tools/pdf-to-image"),
  ),
  "image-to-pdf": dynamic(
    () => import("@/components/tools/image-to-pdf"),
  ),
  "unix-timestamp-converter": dynamic(
    () => import("@/components/tools/unix-timestamp-converter"),
  ),
  "barcode-generator": dynamic(
    () => import("@/components/tools/barcode-generator"),
  ),
  "screenshot-to-pdf": dynamic(
    () => import("@/components/tools/screenshot-to-pdf"),
  ),
  "invoice-generator": dynamic(
    () => import("@/components/tools/invoice-generator"),
  ),
  "resume-pdf-generator": dynamic(
    () => import("@/components/tools/resume-pdf-generator"),
  ),
  "hash-generator": dynamic(
    () => import("@/components/tools/hash-generator"),
  ),
  "typing-speed-test": dynamic(
    () => import("@/components/tools/typing-speed-test"),
  ),
  "cps-test": dynamic(
    () => import("@/components/tools/cps-test"),
  ),
  "drag-click-test": dynamic(
    () => import("@/components/tools/drag-click-test"),
  ),
  "spacebar-counter": dynamic(
    () => import("@/components/tools/spacebar-counter"),
  ),
  "reaction-time-test": dynamic(
    () => import("@/components/tools/reaction-time-test"),
  ),
  "stopwatch": dynamic(
    () => import("@/components/tools/stopwatch"),
  ),
  "alarm-clock": dynamic(
    () => import("@/components/tools/alarm-clock"),
  ),
  "pomodoro-timer": dynamic(
    () => import("@/components/tools/pomodoro-timer"),
  ),
  "age-difference-calculator": dynamic(
    () => import("@/components/tools/age-difference-calculator"),
  ),
  "business-days-calculator": dynamic(
    () => import("@/components/tools/business-days-calculator"),
  ),
  "leap-year-checker": dynamic(
    () => import("@/components/tools/leap-year-checker"),
  ),
  "sunrise-sunset": dynamic(
    () => import("@/components/tools/sunrise-sunset"),
  ),
  "world-clock": dynamic(
    () => import("@/components/tools/world-clock"),
  ),
  "emi-calculator": dynamic(
    () => import("@/components/tools/emi-calculator"),
  ),
  "loan-calculator": dynamic(
    () => import("@/components/tools/loan-calculator"),
  ),
  "gst-vat-calculator": dynamic(
    () => import("@/components/tools/gst-vat-calculator"),
  ),
  "tip-calculator": dynamic(
    () => import("@/components/tools/tip-calculator"),
  ),
  "fuel-cost-calculator": dynamic(
    () => import("@/components/tools/fuel-cost-calculator"),
  ),
  "bmi-calculator": dynamic(
    () => import("@/components/tools/bmi-calculator"),
  ),
  "calorie-calculator": dynamic(
    () => import("@/components/tools/calorie-calculator"),
  ),
  "water-intake-calculator": dynamic(
    () => import("@/components/tools/water-intake-calculator"),
  ),
  "love-compatibility-calculator": dynamic(
    () => import("@/components/tools/love-compatibility-calculator"),
  ),
  "zodiac-sign-finder": dynamic(
    () => import("@/components/tools/zodiac-sign-finder"),
  ),
  "random-password-phrase-generator": dynamic(
    () => import("@/components/tools/random-password-phrase-generator"),
  ),
  "email-signature-generator": dynamic(
    () => import("@/components/tools/email-signature-generator"),
  ),
  "disposable-password-generator": dynamic(
    () => import("@/components/tools/disposable-password-generator"),
  ),
  "favicon-from-text": dynamic(
    () => import("@/components/tools/favicon-from-text"),
  ),
  "mac-address-generator": dynamic(
    () => import("@/components/tools/mac-address-generator"),
  ),
  "vcard-generator": dynamic(
    () => import("@/components/tools/vcard-generator"),
  ),
  "digital-business-card": dynamic(
    () => import("@/components/tools/digital-business-card"),
  ),
  "qr-menu-generator": dynamic(
    () => import("@/components/tools/qr-menu-generator"),
  ),
  "temporary-email-generator": dynamic(
    () => import("@/components/tools/temporary-email-generator"),
  ),
  "text-reverser": dynamic(
    () => import("@/components/tools/text-reverser"),
  ),
  "tweet-character-counter": dynamic(
    () => import("@/components/tools/tweet-character-counter"),
  ),
  "text-diff-checker": dynamic(
    () => import("@/components/tools/text-diff-checker"),
  ),
  "duplicate-line-remover": dynamic(
    () => import("@/components/tools/duplicate-line-remover"),
  ),
  "line-sorter": dynamic(
    () => import("@/components/tools/line-sorter"),
  ),
  "duplicate-word-finder": dynamic(
    () => import("@/components/tools/duplicate-word-finder"),
  ),
  "emoji-translator": dynamic(
    () => import("@/components/tools/emoji-translator"),
  ),
  "youtube-timestamp-link": dynamic(
    () => import("@/components/tools/youtube-timestamp-link"),
  ),
  "discord-timestamp-generator": dynamic(
    () => import("@/components/tools/discord-timestamp-generator"),
  ),
  "whatsapp-link-generator": dynamic(
    () => import("@/components/tools/whatsapp-link-generator"),
  ),
  "ai-prompt-enhancer": dynamic(
    () => import("@/components/tools/ai-prompt-enhancer"),
  ),
  "social-post-formatter": dynamic(
    () => import("@/components/tools/social-post-formatter"),
  ),
  "linkedin-post-formatter": dynamic(
    () => import("@/components/tools/linkedin-post-formatter"),
  ),
  "instagram-caption-formatter": dynamic(
    () => import("@/components/tools/instagram-caption-formatter"),
  ),
  "secure-file-shredder": dynamic(
    () => import("@/components/tools/secure-file-shredder"),
  ),
  "session-id-generator": dynamic(
    () => import("@/components/tools/session-id-generator"),
  ),
  "api-key-generator": dynamic(
    () => import("@/components/tools/api-key-generator"),
  ),
  "uuid-validator": dynamic(
    () => import("@/components/tools/uuid-validator"),
  ),
  "mac-address-lookup": dynamic(
    () => import("@/components/tools/mac-address-lookup"),
  ),
  "duplicate-file-cleaner": dynamic(
    () => import("@/components/tools/duplicate-file-cleaner"),
  ),
  "jwt-generator": dynamic(
    () => import("@/components/tools/jwt-generator"),
  ),
  "cron-time-translator": dynamic(
    () => import("@/components/tools/cron-time-translator"),
  ),
  "cron-job-expression-generator": dynamic(
    () => import("@/components/tools/cron-job-expression-generator"),
  ),
  "toml-formatter": dynamic(
    () => import("@/components/tools/toml-formatter"),
  ),
  "sql-formatter": dynamic(
    () => import("@/components/tools/sql-formatter"),
  ),
  "sentence-rewriter": dynamic(
    () => import("@/components/tools/sentence-rewriter"),
  ),
  "ai-text-humanizer": dynamic(
    () => import("@/components/tools/ai-text-humanizer"),
  ),
  "regex-generator": dynamic(
    () => import("@/components/tools/regex-generator"),
  ),
  "terminal-cheatsheet": dynamic(
    () => import("@/components/tools/terminal-cheatsheet"),
  ),
  "encryption-key-generator": dynamic(
    () => import("@/components/tools/encryption-key-generator"),
  ),
  "csv-to-json": dynamic(
    () => import("@/components/tools/csv-to-json"),
  ),
  "json-to-csv": dynamic(
    () => import("@/components/tools/json-to-csv"),
  ),
  "roman-numeral-converter": dynamic(
    () => import("@/components/tools/roman-numeral-converter"),
  ),
  "morse-code-translator": dynamic(
    () => import("@/components/tools/morse-code-translator"),
  ),
  "nato-alphabet-converter": dynamic(
    () => import("@/components/tools/nato-alphabet-converter"),
  ),
  "html-to-markdown": dynamic(
    () => import("@/components/tools/html-to-markdown"),
  ),
  "hexadecimal-converter": dynamic(
    () => import("@/components/tools/hexadecimal-converter"),
  ),
  "braille-translator": dynamic(
    () => import("@/components/tools/braille-translator"),
  ),
  "unicode-character-finder": dynamic(
    () => import("@/components/tools/unicode-character-finder"),
  ),
  "fake-json-data-generator": dynamic(
    () => import("@/components/tools/fake-json-data-generator"),
  ),
  "yaml-to-json": dynamic(
    () => import("@/components/tools/yaml-to-json"),
  ),
  "sql-dummy-data-generator": dynamic(
    () => import("@/components/tools/sql-dummy-data-generator"),
  ),
  "htaccess-redirect-generator": dynamic(
    () => import("@/components/tools/htaccess-redirect-generator"),
  ),
  "email-header-analyzer": dynamic(
    () => import("@/components/tools/email-header-analyzer"),
  ),
  "keyword-density-checker": dynamic(
    () => import("@/components/tools/keyword-density-checker"),
  ),
  "binary-to-decimal": dynamic(
    () => import("@/components/tools/binary-to-decimal"),
  ),
  "decimal-to-binary": dynamic(
    () => import("@/components/tools/decimal-to-binary"),
  ),
  "keyboard-layout-visualizer": dynamic(
    () => import("@/components/tools/keyboard-layout-visualizer"),
  ),
  "random-file-generator": dynamic(
    () => import("@/components/tools/random-file-generator"),
  ),
  "sitemap-validator": dynamic(
    () => import("@/components/tools/sitemap-validator"),
  ),
  "api-response-viewer": dynamic(
    () => import("@/components/tools/api-response-viewer"),
  ),
  "mime-type-checker": dynamic(
    () => import("@/components/tools/mime-type-checker"),
  ),
  "exif-data-remover": dynamic(
    () => import("@/components/tools/exif-data-remover"),
  ),
  "open-graph-preview": dynamic(
    () => import("@/components/tools/open-graph-preview"),
  ),
  "spf-record-checker": dynamic(
    () => import("@/components/tools/spf-record-checker"),
  ),
  "http-header-checker": dynamic(
    () => import("@/components/tools/http-header-checker"),
  ),
  "code-screenshot-generator": dynamic(
    () => import("@/components/tools/code-screenshot-generator"),
  ),
  "box-shadow-generator": dynamic(
    () => import("@/components/tools/box-shadow-generator"),
  ),
  "glassmorphism-generator": dynamic(
    () => import("@/components/tools/glassmorphism-generator"),
  ),
  "css-clip-path-generator": dynamic(
    () => import("@/components/tools/css-clip-path-generator"),
  ),
  "neumorphism-generator": dynamic(
    () => import("@/components/tools/neumorphism-generator"),
  ),
  "svg-blob-generator": dynamic(
    () => import("@/components/tools/svg-blob-generator"),
  ),
  "css-animation-generator": dynamic(
    () => import("@/components/tools/css-animation-generator"),
  ),
  "pattern-background-generator": dynamic(
    () => import("@/components/tools/pattern-background-generator"),
  ),
  "noise-texture-generator": dynamic(
    () => import("@/components/tools/noise-texture-generator"),
  ),
  "youtube-tag-extractor": dynamic(
    () => import("@/components/tools/youtube-tag-extractor"),
  ),
  "canonical-url-checker": dynamic(
    () => import("@/components/tools/canonical-url-checker"),
  ),
  "gradient-mesh-generator": dynamic(
    () => import("@/components/tools/gradient-mesh-generator"),
  ),
  "pixel-art-generator": dynamic(
    () => import("@/components/tools/pixel-art-generator"),
  ),
  "lorem-ipsum-image-generator": dynamic(
    () => import("@/components/tools/lorem-ipsum-image-generator"),
  ),
  "keyboard-shortcut-generator": dynamic(
    () => import("@/components/tools/keyboard-shortcut-generator"),
  ),
  "website-source-viewer": dynamic(
    () => import("@/components/tools/website-source-viewer"),
  ),
  "meta-tag-analyzer": dynamic(
    () => import("@/components/tools/meta-tag-analyzer"),
  ),
  "svg-shape-generator": dynamic(
    () => import("@/components/tools/svg-shape-generator"),
  ),
  "file-metadata-viewer": dynamic(
    () => import("@/components/tools/file-metadata-viewer"),
  ),
  "sql-query-beautifier": dynamic(
    () => import("@/components/tools/sql-query-beautifier"),
  ),
  "dkim-record-checker": dynamic(
    () => import("@/components/tools/dkim-record-checker"),
  ),
  "dmarc-record-checker": dynamic(
    () => import("@/components/tools/dmarc-record-checker"),
  ),
  "mobile-friendly-test": dynamic(
    () => import("@/components/tools/mobile-friendly-test"),
  ),
  "ssl-certificate-checker": dynamic(
    () => import("@/components/tools/ssl-certificate-checker"),
  ),
  "qr-code-scanner": dynamic(
    () => import("@/components/tools/qr-code-scanner"),
  ),
  "ssl-expiry-reminder": dynamic(
    () => import("@/components/tools/ssl-expiry-reminder"),
  ),
  "thumbnail-downloader": dynamic(
    () => import("@/components/tools/thumbnail-downloader"),
  ),
  "broken-link-checker": dynamic(
    () => import("@/components/tools/broken-link-checker"),
  ),
  "receipt-generator": dynamic(
    () => import("@/components/tools/receipt-generator"),
  ),
  "domain-age-checker": dynamic(
    () => import("@/components/tools/domain-age-checker"),
  ),
  "redirect-chain-checker": dynamic(
    () => import("@/components/tools/redirect-chain-checker"),
  ),
  "cdn-checker": dynamic(
    () => import("@/components/tools/cdn-checker"),
  ),
  "website-cache-checker": dynamic(
    () => import("@/components/tools/website-cache-checker"),
  ),
  "packing-slip-generator": dynamic(
    () => import("@/components/tools/packing-slip-generator"),
  ),
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_COMPONENTS[slug] ?? null;
}
