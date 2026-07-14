"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

export type FooterWordmarkMeasure = {
  fontSizePx: number;
  heightPx: number;
};

type FooterWordmarkProps = {
  revealScale: MotionValue<number>;
  onMeasure?: (measure: FooterWordmarkMeasure) => void;
};

const REF_FONT_PX = 100;

export default function FooterWordmark({
  revealScale,
  onMeasure,
}: FooterWordmarkProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;
  const [fitFontSizePx, setFitFontSizePx] = useState(REF_FONT_PX);

  useLayoutEffect(() => {
    const fit = () => {
      const el = ref.current;
      if (!el) return;

      const targetWidth = window.innerWidth;
      el.style.fontSize = `${REF_FONT_PX}px`;

      const widthAtRef = el.offsetWidth;
      if (widthAtRef <= 0 || targetWidth <= 0) return;

      const nextFontSizePx = (targetWidth / widthAtRef) * REF_FONT_PX;
      el.style.fontSize = `${nextFontSizePx}px`;

      const heightPx = el.getBoundingClientRect().height;
      setFitFontSizePx(nextFontSizePx);
      onMeasureRef.current?.({ fontSizePx: nextFontSizePx, heightPx });
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const fontSize = useTransform(revealScale, (scale) => `${fitFontSizePx * scale}px`);

  return (
    <motion.span
      ref={ref}
      className="hero-wordmark-text hero-wordmark-top inline-block origin-top whitespace-nowrap text-center font-ivar uppercase leading-none text-black"
      style={{ fontSize }}
    >
      {site.wordmark.left}
    </motion.span>
  );
}
