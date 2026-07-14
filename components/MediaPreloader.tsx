"use client";

import { useEffect } from "react";
import { getPreloadVideoUrls } from "@/lib/mediaAssets";
import { heroMedia, projects } from "@/lib/projects";

/** Warm browser cache for showcase images + videos on mount. */
export default function MediaPreloader() {
  useEffect(() => {
    const imageUrls = [heroMedia.image, ...projects.map((p) => p.image)];

    imageUrls.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });

    getPreloadVideoUrls().forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = src;
      document.head.appendChild(link);

      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = src;
      video.load();
    });
  }, []);

  return null;
}
