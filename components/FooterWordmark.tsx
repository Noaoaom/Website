"use client";

import { motion, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

export type FooterWordmarkMeasure = {
  fontSizePx: number;
  heightPx: number;
  topInsetPx: number;
};

type FooterWordmarkProps = {
  revealScale: MotionValue<number>;
  onMeasure?: (measure: FooterWordmarkMeasure) => void;
};

const REF_FONT_PX = 100;
const wordmarkClass =
  "hero-wordmark-text hero-wordmark-top hero-title-stroke font-ivar uppercase text-black";

export default function FooterWordmark({
  revealScale,
  onMeasure,
}: FooterWordmarkProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;
  const [fitFontSizePx, setFitFontSizePx] = useState(REF_FONT_PX);

  useLayoutEffect(() => {
    const fit = () => {
      const el = measureRef.current;
      if (!el) return;

      const targetWidth = window.innerWidth;
      el.style.fontSize = `${REF_FONT_PX}px`;

      const widthAtRef = el.offsetWidth;
      if (widthAtRef <= 0 || targetWidth <= 0) return;

      const nextFontSizePx = (targetWidth / widthAtRef) * REF_FONT_PX;
      el.style.fontSize = `${nextFontSizePx}px`;

      const topInsetPx = nextFontSizePx * 0.08;
      const heightPx = el.getBoundingClientRect().height + topInsetPx;
      setFitFontSizePx(nextFontSizePx);
      onMeasureRef.current?.({ fontSizePx: nextFontSizePx, heightPx, topInsetPx });
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <>
      <span
        ref={measureRef}
        aria-hidden
        className={`${wordmarkClass} pointer-events-none invisible absolute left-0 top-0 inline-block whitespace-nowrap text-center`}
        style={{ fontSize: fitFontSizePx, lineHeight: 0.9 }}
      >
        {site.wordmark.left}
      </span>

      <motion.span
        className={`${wordmarkClass} inline-block origin-top text-center will-change-transform`}
        style={{
          fontSize: fitFontSizePx,
          lineHeight: 0.9,
          scale: revealScale,
        }}
      >
        {site.wordmark.left}
      </motion.span>
    </>
  );
}
