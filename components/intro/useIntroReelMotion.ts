"use client";

import { useMotionValue, useTransform } from "motion/react";
import { easeZoom } from "@/lib/cropReveal";

export const SLOT_HEIGHT_VH = 16;
export const SLOT_WIDTH_VW = 72;

export function useIntroReelMotion() {
  const slotOpen = useMotionValue(0);
  const revealHorizontal = useMotionValue(0);
  const revealVertical = useMotionValue(0);
  const wordmarkRevealReady = useMotionValue(0);

  const outerHeightVh = useTransform(
    [slotOpen, revealVertical],
    ([slot, vert]: number[]) => {
      if (vert > 0) {
        return SLOT_HEIGHT_VH + easeZoom(vert) * (100 - SLOT_HEIGHT_VH);
      }
      return slot * SLOT_HEIGHT_VH;
    }
  );

  const outerWidthVw = useTransform(
    [slotOpen, revealHorizontal],
    ([slot, horiz]: number[]) => {
      if (horiz > 0) {
        return SLOT_WIDTH_VW + easeZoom(horiz) * (100 - SLOT_WIDTH_VW);
      }
      return slot * SLOT_WIDTH_VW;
    }
  );

  return {
    slotOpen,
    revealHorizontal,
    revealVertical,
    wordmarkRevealReady,
    outerHeightVh,
    outerWidthVw,
  };
}

export type IntroReelMotion = ReturnType<typeof useIntroReelMotion>;
