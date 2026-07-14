"use client";

import { useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { heroMedia } from "@/lib/projects";
import { useUI } from "./Providers";

const INTRO_MEDIA_MAX_WAIT_MS = 12000;

/** Skip or time out the hero-video buffer gate before the intro sequence starts. */
export default function IntroSequenceBootstrap() {
  const reducedMotion = useReducedMotion();
  const { setIntroSequenceReady } = useUI();

  useEffect(() => {
    if (reducedMotion) {
      setIntroSequenceReady(true);
      return;
    }

    if (!heroMedia.video) {
      setIntroSequenceReady(true);
      return;
    }

    if (!window.matchMedia("(pointer: fine)").matches) {
      setIntroSequenceReady(true);
      return;
    }

    const fallback = window.setTimeout(() => {
      setIntroSequenceReady(true);
    }, INTRO_MEDIA_MAX_WAIT_MS);

    return () => window.clearTimeout(fallback);
  }, [reducedMotion, setIntroSequenceReady]);

  return null;
}
