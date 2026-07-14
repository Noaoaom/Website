"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "../hooks";
import { useUI } from "../Providers";

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
  const { setIntroSequenceReady } = useUI();
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
    if (!video || !shouldLoad) return;
    const el = videoRef.current;
    if (!el) return;

    if (priority) {
      const markReady = () => setVideoReady(true);
      const tryPlay = () => {
        el.play().catch(() => undefined);
      };
      const signalIntroReady = () => {
        if (handoffId === "hero-reel") {
          setIntroSequenceReady(true);
        }
      };

      el.addEventListener("loadeddata", markReady);
      el.addEventListener("canplay", markReady);
      el.addEventListener("canplay", tryPlay);
      el.addEventListener("canplaythrough", signalIntroReady, { once: true });

      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        markReady();
        tryPlay();
      }
      if (el.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        signalIntroReady();
      }

      return () => {
        el.removeEventListener("loadeddata", markReady);
        el.removeEventListener("canplay", markReady);
        el.removeEventListener("canplay", tryPlay);
        el.removeEventListener("canplaythrough", signalIntroReady);
      };
    }
  }, [video, shouldLoad, priority, handoffId, setIntroSequenceReady]);

  useEffect(() => {
    if (!video || !playOnView || !shouldLoad || priority) return;
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
  }, [video, playOnView, shouldLoad, priority]);

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
          autoPlay={priority}
          preload={priority ? "auto" : "metadata"}
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
