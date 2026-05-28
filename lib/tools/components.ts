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
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_COMPONENTS[slug] ?? null;
}
