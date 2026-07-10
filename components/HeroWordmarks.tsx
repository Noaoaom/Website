"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { easeZoom } from "@/lib/cropReveal";
import { site } from "@/lib/site";
import { HERO_WORDMARK, WORDMARK_INTRO } from "./heroWordmarkLayout";
import type { IntroReelMotion } from "./intro/useIntroReelMotion";
import { SLOT_HEIGHT_VH } from "./intro/useIntroReelMotion";
import { useUI } from "./Providers";

const STUDIO_SCALE_X = 1.752095;
const EASE = [0.22, 1, 0.36, 1] as const;
const OFFSCREEN_PAD_PX = 48;

let inkCanvasCtx: CanvasRenderingContext2D | null | undefined;

/**
 * Sichtbare Glyphen-Kanten (Ink-Bounds) eines Wortmarken-Spans in
 * Viewport-Koordinaten. getBoundingClientRect liefert nur die Line-Box, die
 * je nach Font-Metrik ober-/unterhalb der sichtbaren Buchstaben endet — für
 * ein bündiges Andocken am Karussell brauchen wir die echte Tintenkante.
 */
function getInkBounds(el: HTMLElement, text: string) {
  if (inkCanvasCtx === undefined) {
    inkCanvasCtx = document.createElement("canvas").getContext("2d");
  }
  const ctx = inkCanvasCtx;
  if (!ctx) return null;

  // Zero-size inline-block sitzt exakt auf der Baseline der Textzeile.
  const probe = document.createElement("span");
  probe.style.display = "inline-block";
  probe.style.width = "0";
  probe.style.height = "0";
  el.appendChild(probe);
  const baseline = probe.getBoundingClientRect().top;
  probe.remove();

  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const metrics = ctx.measureText(text.toUpperCase());
  // Text-Stroke ist auf der Kontur zentriert und ragt zur Hälfte hinaus.
  const strokeHalf = (parseFloat(cs.webkitTextStrokeWidth) || 0) / 2;

  return {
    top: baseline - metrics.actualBoundingBoxAscent - strokeHalf,
    bottom: baseline + metrics.actualBoundingBoxDescent + strokeHalf,
  };
}

type Measurements = {
  stackLeftY: number;
  stackRightY: number;
  stackLeftBottom: number;
  stackRightTop: number;
  finalLeftBottom: number;
  finalRightTop: number;
  revealLeftStartY: number;
  revealRightStartY: number;
  leftStartX: number;
  rightStartX: number;
};

function getCarouselBounds(heightVh: number, vhPx: number) {
  const heightPx = (heightVh / 100) * vhPx;
  const top = vhPx / 2 - heightPx / 2;
  return { top, bottom: top + heightPx };
}

function computeTopY(
  heightVh: number,
  vhPx: number,
  stackY: number,
  stackBottom: number,
  finalBottom: number
) {
  if (heightVh <= 0.001) return stackY;

  const { top: carouselTop } = getCarouselBounds(heightVh, vhPx);
  if (carouselTop <= finalBottom) return 0;

  return carouselTop - stackBottom;
}

function computeBottomY(
  heightVh: number,
  vhPx: number,
  stackY: number,
  stackTop: number,
  finalTop: number
) {
  if (heightVh <= 0.001) return stackY;

  const { bottom: carouselBottom } = getCarouselBounds(heightVh, vhPx);
  if (carouselBottom >= finalTop) return 0;

  return carouselBottom - stackTop;
}

type HeroWordmarksProps = {
  reelMotion: IntroReelMotion;
  className?: string;
};

type WordmarkLayerProps = {
  measureRef: RefObject<HTMLSpanElement | null>;
  wordClass: string;
  label: string;
  introComplete: boolean;
  style: {
    lineHeight: number;
    x: MotionValue<number>;
    y: MotionValue<number>;
    opacity: number;
    scaleX?: number;
  };
};

const wordmarkTypography =
  "hero-wordmark-text hero-title-stroke font-ivar uppercase";

function WordmarkLayer({
  measureRef,
  wordClass,
  label,
  introComplete,
  style,
}: WordmarkLayerProps) {
  const originClass = style.scaleX !== undefined ? "origin-center" : "";
  const typographyClass = `${wordmarkTypography} ${wordClass}`;
  const colorClass = introComplete ? "text-brand-red" : "text-black";

  return (
    <motion.span
      ref={measureRef}
      className={`${typographyClass} relative inline-block will-change-transform ${colorClass} ${originClass}`}
      style={style}
    >
      {label}
    </motion.span>
  );
}

export default function HeroWordmarks({
  reelMotion,
  className = "",
}: HeroWordmarksProps) {
  const reducedMotion = useReducedMotion();
  const { introComplete } = useUI();
  const { outerHeightVh, revealVertical } = reelMotion;

  const leftMeasureRef = useRef<HTMLSpanElement>(null);
  const rightMeasureRef = useRef<HTMLSpanElement>(null);
  const leftFinalMeasureRef = useRef<HTMLSpanElement>(null);
  const rightFinalMeasureRef = useRef<HTMLSpanElement>(null);
  const stackLeftRef = useRef<HTMLSpanElement>(null);
  const stackRightRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<Measurements | null>(null);
  const vhPxRef = useRef(
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  const atFinalStyleRef = useRef(Boolean(reducedMotion));

  const [visible, setVisible] = useState(Boolean(reducedMotion));
  const [atFinalStyle, setAtFinalStyle] = useState(Boolean(reducedMotion));

  const leftX = useMotionValue(0);
  const rightX = useMotionValue(0);

  const leftY = useTransform(
    [outerHeightVh, revealVertical],
    ([h, vert]: number[]) => {
      const m = measureRef.current;
      if (!m) return 0;

      if (vert > 0.001) {
        return m.revealLeftStartY * (1 - easeZoom(vert));
      }

      return computeTopY(
        h,
        vhPxRef.current,
        m.stackLeftY,
        m.stackLeftBottom,
        m.finalLeftBottom
      );
    }
  );

  const rightY = useTransform(
    [outerHeightVh, revealVertical],
    ([h, vert]: number[]) => {
      const m = measureRef.current;
      if (!m) return 0;

      if (vert > 0.001) {
        return m.revealRightStartY * (1 - easeZoom(vert));
      }

      return computeBottomY(
        h,
        vhPxRef.current,
        m.stackRightY,
        m.stackRightTop,
        m.finalRightTop
      );
    }
  );

  useLayoutEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      setAtFinalStyle(true);
      atFinalStyleRef.current = true;
      return;
    }

    const measure = () => {
      vhPxRef.current = window.innerHeight;

      const leftText = leftMeasureRef.current;
      const rightText = rightMeasureRef.current;
      const leftFinalMeasure = leftFinalMeasureRef.current;
      const rightFinalMeasure = rightFinalMeasureRef.current;
      const stackLeft = stackLeftRef.current;
      const stackRight = stackRightRef.current;
      if (
        !leftText ||
        !rightText ||
        !leftFinalMeasure ||
        !rightFinalMeasure ||
        !stackLeft ||
        !stackRight
      ) {
        return;
      }

      const leftRect = leftText.getBoundingClientRect();
      const rightRect = rightText.getBoundingClientRect();
      const leftFinalRect = leftFinalMeasure.getBoundingClientRect();
      const rightFinalRect = rightFinalMeasure.getBoundingClientRect();
      const stackLeftRect = stackLeft.getBoundingClientRect();
      const stackRightRect = stackRight.getBoundingClientRect();
      const vw = window.innerWidth;

      // Sichtbare Buchstaben-Kanten statt Line-Box, damit die Titel bündig
      // an der Karussell-Kante anliegen.
      const leftInkBottom =
        getInkBounds(leftText, site.wordmark.left)?.bottom ?? leftRect.bottom;
      const rightInkTop =
        getInkBounds(rightText, site.wordmark.right)?.top ?? rightRect.top;

      // Im zentrierten Stapel überlappen sich die sichtbaren Buchstaben
      // (Stroke + Glyphen-Überhang ragen über die Line-Box hinaus). Beide
      // Wörter symmetrisch auseinanderschieben, bis die Inks nur berühren.
      const stackLeftInk = getInkBounds(stackLeft, site.wordmark.left);
      const stackRightInk = getInkBounds(stackRight, site.wordmark.right);
      const stackInkOverlap =
        stackLeftInk && stackRightInk
          ? Math.max(0, stackLeftInk.bottom - stackRightInk.top)
          : 0;

      measureRef.current = {
        stackLeftY: stackLeftRect.top - leftRect.top - stackInkOverlap / 2,
        stackRightY: stackRightRect.top - rightRect.top + stackInkOverlap / 2,
        stackLeftBottom: leftInkBottom,
        stackRightTop: rightInkTop,
        finalLeftBottom: leftFinalRect.bottom,
        finalRightTop: rightFinalRect.top,
        revealLeftStartY: computeTopY(
          SLOT_HEIGHT_VH,
          vhPxRef.current,
          stackLeftRect.top - leftRect.top,
          leftInkBottom,
          leftFinalRect.bottom
        ),
        revealRightStartY: computeBottomY(
          SLOT_HEIGHT_VH,
          vhPxRef.current,
          stackRightRect.top - rightRect.top,
          rightInkTop,
          rightFinalRect.top
        ),
        leftStartX: -leftRect.left - leftRect.width - OFFSCREEN_PAD_PX,
        rightStartX: vw - rightRect.left + OFFSCREEN_PAD_PX,
      };

      if (!visible) {
        leftX.set(measureRef.current.leftStartX);
        rightX.set(measureRef.current.rightStartX);
        setVisible(true);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reducedMotion, leftX, rightX, visible, introComplete]);

  useEffect(() => {
    if (reducedMotion) return;

    const m = measureRef.current;
    if (!m) return;

    let cancelled = false;

    const run = async () => {
      await Promise.all([
        animate(leftX, 0, {
          duration: WORDMARK_INTRO.slideInDuration,
          ease: EASE,
        }),
        animate(rightX, 0, {
          duration: WORDMARK_INTRO.slideInDuration,
          ease: EASE,
        }),
      ]);
      if (cancelled) return;

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, WORDMARK_INTRO.centerHoldMs);
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, leftX, rightX]);

  useEffect(() => {
    if (reducedMotion) return;

    if (introComplete) {
      atFinalStyleRef.current = true;
      setAtFinalStyle(true);
      return;
    }

    const check = (vert: number) => {
      if (atFinalStyleRef.current) return;
      if (vert >= 1) {
        atFinalStyleRef.current = true;
        setAtFinalStyle(true);
      }
    };

    check(revealVertical.get());
    return revealVertical.on("change", check);
  }, [reducedMotion, revealVertical, introComplete]);

  const wordmarkStyle = {
    fontSize: HERO_WORDMARK.fontSize,
    paddingInline: HERO_WORDMARK.insetInline,
  } as const;

  const leftWordClass = atFinalStyle ? "hero-wordmark-top" : "hero-wordmark-stack";
  const rightWordClass = atFinalStyle
    ? "hero-wordmark-bottom"
    : "hero-wordmark-stack";
  const leftLineHeight = atFinalStyle ? 0.9 : 1;
  const rightLineHeight = atFinalStyle ? 0.3 : 1;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[196] overflow-visible ${className}`}
      style={wordmarkStyle}
    >
      <div
        className="pointer-events-none invisible absolute inset-0"
        aria-hidden
      >
        <span
          ref={leftFinalMeasureRef}
          className="hero-wordmark-text hero-wordmark-top absolute inset-x-0 top-0 block text-center font-ivar uppercase text-black hero-title-stroke"
          style={{
            paddingTop: HERO_WORDMARK.insetBlockStart,
            lineHeight: 0.9,
          }}
        >
          {site.wordmark.left}
        </span>
        <span
          ref={rightFinalMeasureRef}
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

      <div
        className="pointer-events-none invisible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-0 leading-none">
          <span
            ref={stackLeftRef}
            className="hero-wordmark-text hero-wordmark-stack hero-title-stroke inline-block font-ivar uppercase text-black"
          >
            {site.wordmark.left}
          </span>
          <span
            ref={stackRightRef}
            className="hero-wordmark-text hero-wordmark-stack hero-title-stroke inline-block font-ivar uppercase text-black"
          >
            {site.wordmark.right}
          </span>
        </div>
      </div>

      <span
        className="absolute inset-x-0 top-0 block text-center"
        style={{ paddingTop: HERO_WORDMARK.insetBlockStart }}
      >
        <WordmarkLayer
          measureRef={leftMeasureRef}
          wordClass={leftWordClass}
          label={site.wordmark.left}
          introComplete={introComplete}
          style={{
            lineHeight: leftLineHeight,
            x: leftX,
            y: leftY,
            opacity: visible ? 1 : 0,
          }}
        />
      </span>

      <span
        className="absolute inset-x-0 bottom-0 block text-center"
        style={{ paddingBottom: HERO_WORDMARK.insetBlockEnd }}
      >
        <WordmarkLayer
          measureRef={rightMeasureRef}
          wordClass={rightWordClass}
          label={site.wordmark.right}
          introComplete={introComplete}
          style={{
            lineHeight: rightLineHeight,
            scaleX: STUDIO_SCALE_X,
            x: rightX,
            y: rightY,
            opacity: visible ? 1 : 0,
          }}
        />
      </span>
    </div>
  );
}
