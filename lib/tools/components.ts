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
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_COMPONENTS[slug] ?? null;
}
