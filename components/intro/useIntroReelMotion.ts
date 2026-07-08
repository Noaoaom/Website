"use client";

import { useMotionValue, useTransform } from "motion/react";
import { easeZoom } from "@/lib/cropReveal";

export const SLOT_HEIGHT_VH = 16;
export const SLOT_WIDTH_VW = 72;

export function useIntroReelMotion() {
  const slotOpen = useMotionValue(0);
  const revealHorizontal = useMotionValue(0);
  const revealVertical = useMotionValue(0);

  const outerHeightVh = useTransform(
    [slotOpen, revealVertical],
    ([slot, vert]: number[]) => {
      if (vert > 0) {
        return SLOT_HEIGHT_VH + easeZoom(vert) * (100 - SLOT_HEIGHT_VH);
      }
      return slot * SLOT_HEIGHT_VH;
    }
  );

  return {
    slotOpen,
    revealHorizontal,
    revealVertical,
    outerHeightVh,
  };
}

export type IntroReelMotion = ReturnType<typeof useIntroReelMotion>;
