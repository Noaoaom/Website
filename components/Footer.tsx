"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { easeZoom } from "@/lib/cropReveal";
import { site } from "@/lib/site";
import FooterWordmark, { type FooterWordmarkMeasure } from "./FooterWordmark";
import HoverLink from "./ui/HoverLink";

type FooterProps = {
  theme?: "black" | "red";
  /** Match scroll layer of the page content above the footer. */
  spacerClassName?: string;
};

/** Contacts / social band. */
export const FOOTER_CONTENT_DVH = 22;
/** Copyright + credits band below the wordmark. */
export const FOOTER_META_DVH = 5;
/** Fallback title band before wordmark measurement. */
export const FOOTER_TITLE_FALLBACK_DVH = 24;

/** Full footer height fallback — also the scroll distance that reveals it. */
export const FOOTER_TOTAL_DVH =
  FOOTER_CONTENT_DVH + FOOTER_TITLE_FALLBACK_DVH + FOOTER_META_DVH;

const WORDMARK_SCALE_START = 0.72;
const CONTACTS_OFFSET_PX = 96;
const META_ROW_OFFSET_VH = 12;

function useFooterRevealMotion(scrollYProgress: MotionValue<number>) {
  const vhPxRef = useRef(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  const eased = useTransform(scrollYProgress, (p) =>
    easeZoom(Math.min(Math.max(p, 0), 1))
  );

  const metaEased = useTransform(scrollYProgress, (p) => {
    const clamped = Math.min(Math.max(p, 0), 1);
    const metaP = Math.min(Math.max((clamped - 0.15) / 0.85, 0), 1);
    return easeZoom(metaP);
  });

  const wordmarkScale = useTransform(
    eased,
    (t) => WORDMARK_SCALE_START + t * (1 - WORDMARK_SCALE_START)
  );

  const contactsY = useTransform(
    eased,
    (t) => (1 - t) * -CONTACTS_OFFSET_PX
  );

  const metaRowY = useTransform(metaEased, (t) => {
    const offset = (META_ROW_OFFSET_VH / 100) * vhPxRef.current;
    return (1 - t) * offset;
  });

  return { wordmarkScale, contactsY, metaRowY, vhPxRef };
}

function buildFooterHeight(titleBandHeightPx: number) {
  if (titleBandHeightPx <= 0) {
    return `${FOOTER_TOTAL_DVH}dvh`;
  }

  return `calc(${FOOTER_CONTENT_DVH}dvh + ${titleBandHeightPx}px + ${FOOTER_META_DVH}dvh)`;
}

export default function Footer({
  theme = "red",
  spacerClassName = "relative z-[2]",
}: FooterProps) {
  const isRed = theme === "red";
  const bg = isRed ? "#D60001" : "#000000";
  const fg = isRed ? "#000000" : "#D60001";
  const revealRef = useRef<HTMLDivElement>(null);
  const [titleBandHeightPx, setTitleBandHeightPx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "end end"],
  });

  const { wordmarkScale, contactsY, metaRowY, vhPxRef } =
    useFooterRevealMotion(scrollYProgress);
  const footerHeight = buildFooterHeight(titleBandHeightPx);

  const handleWordmarkMeasure = useCallback((measure: FooterWordmarkMeasure) => {
    setTitleBandHeightPx(Math.ceil(measure.heightPx));
  }, []);

  useLayoutEffect(() => {
    const syncViewport = () => {
      vhPxRef.current = window.innerHeight;
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, [vhPxRef]);

  return (
    <>
      <div
        ref={revealRef}
        className={`pointer-events-none ${spacerClassName}`}
        style={{ height: footerHeight }}
        aria-hidden
      />

      <footer
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-0 flex w-full flex-col overflow-x-hidden px-6 transition-colors duration-700 lg:px-12"
        style={{
          height: footerHeight,
          maxHeight: footerHeight,
          backgroundColor: bg,
          color: fg,
        }}
      >
        <motion.div
          className="flex shrink-0 flex-col justify-center py-8"
          style={{ height: `${FOOTER_CONTENT_DVH}dvh`, y: contactsY }}
        >
          <div className="flex w-full flex-col items-center justify-around gap-8 md:flex-row md:items-start">
            <div className="flex flex-col gap-2 text-center md:gap-4">
              <span className="block font-ivar text-[32px] uppercase leading-none md:text-[45px]">
                Contacts
              </span>
              <HoverLink
                href={`mailto:${site.email}`}
                className="font-helvetica text-[15px] uppercase md:text-[21px]"
              >
                {site.email}
              </HoverLink>
            </div>

            <div className="flex flex-col gap-2 text-center md:gap-4">
              <span className="block font-ivar text-[32px] uppercase leading-none md:text-[45px]">
                Social
              </span>
              <HoverLink
                href={site.instagram.url}
                className="font-helvetica text-[15px] uppercase md:text-[21px]"
              >
                {site.instagram.handle}
              </HoverLink>
            </div>
          </div>
        </motion.div>

        <div
          className="relative flex w-screen max-w-[100vw] shrink-0 items-start justify-center overflow-visible pt-[0.06em]"
          style={{
            height:
              titleBandHeightPx > 0
                ? `${titleBandHeightPx}px`
                : `${FOOTER_TITLE_FALLBACK_DVH}dvh`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          aria-hidden
        >
          <FooterWordmark
            revealScale={wordmarkScale}
            onMeasure={handleWordmarkMeasure}
          />
        </div>

        <motion.div className="w-full shrink-0" style={{ y: metaRowY }}>
          <div
            className="flex w-full flex-row items-center justify-between gap-3 pb-5 pt-1 text-left"
            style={{ minHeight: `${FOOTER_META_DVH}dvh` }}
          >
            <p className="font-helvetica text-[15px] uppercase leading-normal tracking-widest md:text-[18px]">
              {site.copyright}
            </p>
            <Link
              href={site.credits.url}
              className="font-helvetica text-[15px] uppercase leading-normal tracking-widest transition-opacity hover:opacity-70 md:text-[18px]"
            >
              {site.credits.label}
            </Link>
          </div>
        </motion.div>
      </footer>
    </>
  );
}
