"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "../hooks";

type MediaCoverProps = {
  image: string;
  alt?: string;
  video?: string;
  priority?: boolean;
  className?: string;
  playOnView?: boolean;
  fit?: "cover" | "contain";
  /** Start loading before the section enters the viewport. */
  preloadMargin?: string;
  /** Pairs intro/hero videos for seamless playback handoff. */
  handoffId?: string;
};

export default function MediaCover({
  image,
  video,
  alt = "",
  priority = false,
  className = "",
  playOnView = true,
  fit = "cover",
  preloadMargin = "1200px 0px",
  handoffId,
}: MediaCoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finePointer = useFinePointer();
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [videoReady, setVideoReady] = useState(false);
  const isSvg = image.endsWith(".svg");
  const objectClass = fit === "contain" ? "object-contain" : "object-cover";

  useEffect(() => {
    if (priority || shouldLoad) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: preloadMargin, threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, preloadMargin, shouldLoad]);

  useEffect(() => {
    if (!video || !playOnView || !shouldLoad) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const el = videoRef.current;
        if (!el) return;
        if (entry.isIntersecting) {
          el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [video, playOnView, shouldLoad]);

  const showVideo = Boolean(video) && finePointer && videoReady;

  return (
    <div
      ref={ref}
      className={`relative h-full w-full ${className}`}
      {...(handoffId ? { "data-handoff-id": handoffId } : {})}
    >
      {shouldLoad ? (
        isSvg ? (
          // SVG placeholders: skip next/image rasterization (much faster).
          <img
            src={image}
            alt={alt}
            decoding="async"
            className={`absolute inset-0 h-full w-full ${objectClass}`}
          />
        ) : (
          <Image
            src={image}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            className={`absolute inset-0 h-full w-full ${objectClass}`}
          />
        )
      ) : null}

      {video && shouldLoad ? (
        <video
          ref={videoRef}
          src={video}
          poster={image}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full ${objectClass} transition-opacity duration-300 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      {fit === "cover" ? (
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      ) : null}
    </div>
  );
}
