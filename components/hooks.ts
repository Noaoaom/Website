"use client";

import { useEffect, useState } from "react";

/** Viewport height in px (fallback 1000 before mount so SSR math stays sane). */
export function useVH() {
  const [vh, setVh] = useState(1000);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return vh;
}

/** True when the device has a fine pointer (mouse/trackpad). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fine;
}

/**
 * Scale factor for a full-width 16:9 box to cover the viewport height.
 * Used to expand cinematic media to full screen while keeping 16:9 source.
 */
export function useFillScale() {
  const [fillScale, setFillScale] = useState(1.15);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const height16x9 = vw * (9 / 16);
      setFillScale(Math.max(vh / height16x9, 1));
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return fillScale;
}
