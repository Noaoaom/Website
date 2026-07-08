"use client";

import { useLayoutEffect, useRef } from "react";
import { site } from "@/lib/site";
import { HERO_WORDMARK } from "./heroWordmarkLayout";

const WORDMARK_CLASS =
  "hero-wordmark-text hero-title-stroke m-0 whitespace-nowrap p-0 font-ivar uppercase text-black";

type HeroWordmarksProps = {
  className?: string;
};

export default function HeroWordmarks({ className = "" }: HeroWordmarksProps) {
  const dickRef = useRef<HTMLSpanElement>(null);
  const studioRef = useRef<HTMLSpanElement>(null);
  const studioWrapRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const applyStudioScale = () => {
      const dick = dickRef.current;
      const studio = studioRef.current;
      const studioWrap = studioWrapRef.current;
      if (!dick || !studio || !studioWrap) return;

      studioWrap.style.transform = "scaleX(1)";

      const targetWidth = dick.getBoundingClientRect().width;
      const naturalWidth = studio.getBoundingClientRect().width;

      if (targetWidth <= 0 || naturalWidth <= 0) {
        studioWrap.style.visibility = "visible";
        return;
      }

      studioWrap.style.transform = `scaleX(${targetWidth / naturalWidth})`;
      studioWrap.style.visibility = "visible";
    };

    applyStudioScale();
    window.addEventListener("resize", applyStudioScale);
    void document.fonts.ready.then(applyStudioScale);

    const observer = new ResizeObserver(applyStudioScale);
    if (dickRef.current) observer.observe(dickRef.current);
    if (studioRef.current) observer.observe(studioRef.current);

    return () => {
      window.removeEventListener("resize", applyStudioScale);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[196] overflow-visible ${className}`}
    >
      <div
        className="absolute text-center"
        style={{
          left: HERO_WORDMARK.edgeMargin,
          right: HERO_WORDMARK.edgeMargin,
          top: HERO_WORDMARK.top,
        }}
      >
        <span
          ref={dickRef}
          className={WORDMARK_CLASS}
          style={{ fontSize: HERO_WORDMARK.fontSize }}
        >
          {site.wordmark.left}
        </span>
      </div>

      <div
        className="absolute text-center"
        style={{
          left: HERO_WORDMARK.edgeMargin,
          right: HERO_WORDMARK.edgeMargin,
          bottom: HERO_WORDMARK.bottom,
        }}
      >
        <span
          ref={studioWrapRef}
          className="inline-block origin-center"
          style={{ visibility: "hidden", lineHeight: 1 }}
        >
          <span
            ref={studioRef}
            className={WORDMARK_CLASS}
            style={{ fontSize: HERO_WORDMARK.fontSize }}
          >
            {site.wordmark.right}
          </span>
        </span>
      </div>
    </div>
  );
}
