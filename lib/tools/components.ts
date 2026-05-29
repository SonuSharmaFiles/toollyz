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
  "fancy-text-generator": dynamic(
    () => import("@/components/tools/fancy-text-generator"),
  ),
  "invisible-text-generator": dynamic(
    () => import("@/components/tools/invisible-text-generator"),
  ),
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_COMPONENTS[slug] ?? null;
}
