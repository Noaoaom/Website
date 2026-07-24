"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { easeZoom } from "@/lib/cropReveal";
import { site } from "@/lib/site";
import FooterWordmark, { type FooterWordmarkMeasure } from "./FooterWordmark";
import HoverLink from "./ui/HoverLink";
import InstagramLink from "./ui/InstagramLink";

type FooterProps = {
  theme?: "black" | "red";
  /** Match scroll layer of the page content above the footer. */
  spacerClassName?: string;
};

/** Contacts / social band (desktop). */
export const FOOTER_CONTENT_DVH = 22;
/** Contacts / social band (mobile — stacked layout needs more room). */
export const FOOTER_CONTENT_MOBILE_DVH = 32;
/** Copyright + credits band below the wordmark. */
export const FOOTER_META_DVH = 5;
/** Fallback title band before wordmark measurement. */
export const FOOTER_TITLE_FALLBACK_DVH = 24;

/** Full footer height fallback — also the scroll distance that reveals it. */
export const FOOTER_TOTAL_DVH =
  FOOTER_CONTENT_MOBILE_DVH + FOOTER_TITLE_FALLBACK_DVH + FOOTER_META_DVH;

const WORDMARK_SCALE_START = 0.72;
const CONTACTS_OFFSET_PX = 96;
const CONTACTS_OFFSET_MOBILE_PX = 40;
const META_ROW_OFFSET_VH = 12;
const FOOTER_TOP_PADDING_MOBILE_PX = 48;

function useFooterLayout() {
  const [layout, setLayout] = useState({
    contentDvh: FOOTER_CONTENT_MOBILE_DVH,
    contactsOffsetPx: CONTACTS_OFFSET_MOBILE_PX,
    topPaddingPx: FOOTER_TOP_PADDING_MOBILE_PX,
  });

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768;
      setLayout({
        contentDvh: mobile ? FOOTER_CONTENT_MOBILE_DVH : FOOTER_CONTENT_DVH,
        contactsOffsetPx: mobile ? CONTACTS_OFFSET_MOBILE_PX : CONTACTS_OFFSET_PX,
        topPaddingPx: mobile ? FOOTER_TOP_PADDING_MOBILE_PX : 0,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return layout;
}

function useFooterRevealMotion(
  scrollYProgress: MotionValue<number>,
  contactsOffsetPx: number
) {
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
    (t) => (1 - t) * -contactsOffsetPx
  );

  const metaRowY = useTransform(
    metaEased,
    (t) => `${(1 - t) * META_ROW_OFFSET_VH}dvh`
  );

  return { wordmarkScale, contactsY, metaRowY };
}

function buildFooterHeight(
  titleBandHeightPx: number,
  contentDvh: number,
  topPaddingPx: number
) {
  const topPad = topPaddingPx > 0 ? `${topPaddingPx}px + ` : "";
  const safeBottom = "env(safe-area-inset-bottom, 0px)";

  if (titleBandHeightPx <= 0) {
    return `calc(${topPad}${contentDvh}dvh + ${FOOTER_TITLE_FALLBACK_DVH}dvh + ${FOOTER_META_DVH}dvh + ${safeBottom})`;
  }

  return `calc(${topPad}${contentDvh}dvh + ${titleBandHeightPx}px + ${FOOTER_META_DVH}dvh + ${safeBottom})`;
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
  const [wordmarkTopInsetPx, setWordmarkTopInsetPx] = useState(0);
  const { contentDvh, contactsOffsetPx, topPaddingPx } = useFooterLayout();

  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "end end"],
  });

  const { wordmarkScale, contactsY, metaRowY } =
    useFooterRevealMotion(scrollYProgress, contactsOffsetPx);
  const footerHeight = buildFooterHeight(
    titleBandHeightPx,
    contentDvh,
    topPaddingPx
  );

  const handleWordmarkMeasure = useCallback((measure: FooterWordmarkMeasure) => {
    setTitleBandHeightPx(Math.ceil(measure.heightPx));
    setWordmarkTopInsetPx(Math.ceil(measure.topInsetPx));
  }, []);

  return (
    <>
      <div
        ref={revealRef}
        className={`pointer-events-none ${spacerClassName}`}
        style={{ height: footerHeight }}
        aria-hidden
      />

      <footer
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-0 flex w-full flex-col overflow-x-hidden px-6 pt-12 transition-colors duration-700 md:pt-0 lg:px-12"
        style={{
          height: footerHeight,
          maxHeight: footerHeight,
          backgroundColor: bg,
          color: fg,
        }}
      >
        <motion.div
          className="footer-contacts-band flex shrink-0 flex-col justify-start py-6 md:justify-center md:py-8"
          style={{ y: contactsY }}
        >
          <div className="flex w-full flex-col items-center justify-start gap-6 md:flex-row md:items-start md:justify-around md:gap-8">
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

            <div className="flex flex-col items-center gap-2 text-center md:gap-4">
              <span className="block font-ivar text-[32px] uppercase leading-none md:text-[45px]">
                Social
              </span>
              <div className="flex w-full justify-center">
                <InstagramLink className="font-helvetica text-[15px] uppercase md:text-[21px]" />
              </div>
            </div>
          </div>
        </motion.div>

        <div
          className="relative -mx-6 flex w-[calc(100%+3rem)] shrink-0 items-start justify-center overflow-x-clip lg:-mx-12 lg:w-[calc(100%+6rem)]"
          style={{
            height:
              titleBandHeightPx > 0
                ? `${titleBandHeightPx}px`
                : `${FOOTER_TITLE_FALLBACK_DVH}dvh`,
            paddingTop: wordmarkTopInsetPx > 0 ? `${wordmarkTopInsetPx}px` : undefined,
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
            className="flex w-full flex-col items-start gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-2 text-left md:flex-row md:items-center md:justify-between md:gap-3 md:pb-5 md:pt-1"
            style={{ minHeight: `${FOOTER_META_DVH}dvh` }}
          >
            <p className="max-w-full font-helvetica text-[13px] uppercase leading-normal tracking-widest md:text-[18px]">
              {site.copyright}
            </p>
            <Link
              href={site.impressum.url}
              className="font-helvetica text-[15px] uppercase leading-normal tracking-widest transition-opacity hover:opacity-70 md:text-[18px]"
            >
              {site.impressum.label}
            </Link>
          </div>
        </motion.div>
      </footer>
    </>
  );
}
