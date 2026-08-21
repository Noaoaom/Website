"use client";

import { useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getPreloadVideoUrls } from "@/lib/mediaAssets";
import { preloadImages, preloadVideosWithProgress } from "@/lib/preloadVideos";
import { heroMedia, projects } from "@/lib/projects";
import { useUI } from "./Providers";

const PRELOAD_MAX_WAIT_MS = 20000;

/** Buffers showcase videos while the intro wordmarks show load progress. */
export default function VideoPreloadGate() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const {
    introComplete,
    setMediaPreloadProgress,
    setIntroSequenceReady,
  } = useUI();

  useEffect(() => {
    if (pathname !== "/" || introComplete) {
      setMediaPreloadProgress(100);
      setIntroSequenceReady(true);
      return;
    }

    if (reducedMotion) {
      setMediaPreloadProgress(100);
      setIntroSequenceReady(true);
      return;
    }

    let cancelled = false;

    const run = async () => {
      preloadImages([heroMedia.image, ...projects.map((p) => p.image)]);

      const videoUrls = getPreloadVideoUrls();
      if (videoUrls.length === 0 || !window.matchMedia("(pointer: fine)").matches) {
        if (!cancelled) {
          setMediaPreloadProgress(100);
          setIntroSequenceReady(true);
        }
        return;
      }

      setMediaPreloadProgress(0);

      await preloadVideosWithProgress(
        videoUrls,
        (percent) => {
          if (!cancelled) setMediaPreloadProgress(percent);
        },
        PRELOAD_MAX_WAIT_MS
      );

      if (cancelled) return;

      setMediaPreloadProgress(100);
      setIntroSequenceReady(true);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    introComplete,
    reducedMotion,
    setMediaPreloadProgress,
    setIntroSequenceReady,
  ]);

  return null;
}
