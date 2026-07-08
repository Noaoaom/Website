"use client";

import { site } from "@/lib/site";
import { HERO_WORDMARK } from "./heroWordmarkLayout";

const STUDIO_SCALE_X = 1.752095;

type HeroWordmarksProps = {
  className?: string;
};

export default function HeroWordmarks({ className = "" }: HeroWordmarksProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[196] overflow-visible ${className}`}
      style={{
        fontSize: HERO_WORDMARK.fontSize,
        paddingInline: HERO_WORDMARK.insetInline,
      }}
    >
      <span
        className="hero-wordmark-text hero-wordmark-top hero-title-stroke absolute inset-x-0 top-0 block text-center font-ivar uppercase text-black"
        style={{ paddingTop: HERO_WORDMARK.insetBlockStart, lineHeight: 0.9 }}
      >
        {site.wordmark.left}
      </span>

      <span
        className="hero-wordmark-text hero-wordmark-bottom hero-title-stroke absolute inset-x-0 bottom-0 block origin-center text-center font-ivar uppercase text-black"
        style={{
          paddingBottom: HERO_WORDMARK.insetBlockEnd,
          lineHeight: 0.3,
          transform: `scaleX(${STUDIO_SCALE_X})`,
        }}
      >
        {site.wordmark.right}
      </span>
    </div>
  );
}
