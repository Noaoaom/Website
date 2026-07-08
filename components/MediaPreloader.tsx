"use client";

import { useEffect } from "react";
import { heroMedia, projects } from "@/lib/projects";

/** Warm browser cache for all showcase media on mount. */
export default function MediaPreloader() {
  useEffect(() => {
    const urls = [heroMedia.image, ...projects.map((p) => p.image)];

    urls.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return null;
}
