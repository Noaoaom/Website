"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { endVideoHandoff, getVideoHandoffTime } from "@/lib/videoHandoff";
import { useFinePointer } from "../hooks";

type MediaCoverProps = {
  image: string;
  alt?: string;
  video?: string;
  priority?: boolean;
  className?: string;
  playOnView?: boolean;
  fit?: "cover" | "contain";
  /** Portrait (9:16) — sharp contain foreground + blurred cover fill. */
  portrait?: boolean;
  /** Start loading before the section enters the viewport. */
  preloadMargin?: string;
  /** Pairs intro/hero videos for seamless playback handoff. */
  handoffId?: string;
  /**
   * Pick up a running click-in handoff instead of starting at 0:
   * "continue" while the handoff is still in flight, "finish" to end it.
   */
  videoHandoff?: "continue" | "finish";
};

function mediaClass(fit: "cover" | "contain") {
  return fit === "contain" ? "object-contain" : "object-cover";
}

export default function MediaCover({
  image,
  video,
  alt = "",
  priority = false,
  className = "",
  playOnView = true,
  fit = "cover",
  portrait = false,
  preloadMargin = "1200px 0px",
  handoffId,
  videoHandoff,
}: MediaCoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blurVideoRef = useRef<HTMLVideoElement>(null);
  const finePointer = useFinePointer();
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [videoReady, setVideoReady] = useState(false);
  const isSvg = image.endsWith(".svg");
  const foregroundFit = portrait ? "contain" : fit;
  const foregroundClass = mediaClass(foregroundFit);
  const backgroundClass = mediaClass("cover");

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
        blurVideoRef.current?.play().catch(() => undefined);
      };

      el.addEventListener("loadeddata", markReady);
      el.addEventListener("canplay", markReady);
      el.addEventListener("canplay", tryPlay);

      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        markReady();
        tryPlay();
      }

      return () => {
        el.removeEventListener("loadeddata", markReady);
        el.removeEventListener("canplay", markReady);
        el.removeEventListener("canplay", tryPlay);
      };
    }
  }, [video, shouldLoad, priority]);

  useEffect(() => {
    if (!video || !shouldLoad || !videoHandoff) return;
    const el = videoRef.current;
    if (!el) return;

    const seek = () => {
      const time = getVideoHandoffTime(video);
      if (time !== null && Number.isFinite(el.duration) && el.duration > 0) {
        const target = time % el.duration;
        el.currentTime = target;
        if (blurVideoRef.current) blurVideoRef.current.currentTime = target;
      }
      if (videoHandoff === "finish") endVideoHandoff(video);
    };

    if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seek();
      return;
    }
    el.addEventListener("loadedmetadata", seek, { once: true });
    return () => el.removeEventListener("loadedmetadata", seek);
  }, [video, shouldLoad, videoHandoff]);

  useEffect(() => {
    if (!video || !playOnView || !shouldLoad || priority) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const el = videoRef.current;
        const blurEl = blurVideoRef.current;
        if (!el) return;
        if (entry.isIntersecting) {
          el.play().catch(() => undefined);
          blurEl?.play().catch(() => undefined);
        } else {
          el.pause();
          blurEl?.pause();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [video, playOnView, shouldLoad, priority]);

  const showVideo = Boolean(video) && finePointer && videoReady;
  const showImage = shouldLoad && (!video || !showVideo);
  const poster = video && portrait ? undefined : image;

  const renderImage = (layerClass: string) =>
    showImage ? (
      isSvg ? (
        <img
          src={image}
          alt={alt}
          decoding="async"
          className={`absolute inset-0 h-full w-full ${layerClass}`}
        />
      ) : (
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`absolute inset-0 h-full w-full ${layerClass}`}
        />
      )
    ) : null;

  const renderVideo = (
    layerClass: string,
    videoElRef: RefObject<HTMLVideoElement | null>,
    options?: { blur?: boolean }
  ) =>
    video && shouldLoad ? (
      options?.blur ? (
        <div
          className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        >
          <div className="absolute inset-0 scale-[1.35] blur-[48px] brightness-[0.5]">
            <video
              ref={videoElRef}
              src={video}
              poster={poster}
              muted
              loop
              playsInline
              autoPlay={priority}
              preload={priority ? "auto" : "metadata"}
              onCanPlay={() => setVideoReady(true)}
              className={`absolute inset-0 h-full w-full ${layerClass}`}
            />
          </div>
        </div>
      ) : (
        <video
          ref={videoElRef}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay={priority}
          preload={priority ? "auto" : "metadata"}
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full ${layerClass} transition-opacity duration-300 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      )
    ) : null;

  return (
    <div
      ref={ref}
      className={`relative h-full w-full ${className}`}
      {...(handoffId ? { "data-handoff-id": handoffId } : {})}
    >
      {portrait ? (
        <>
          <div className="absolute inset-0 overflow-hidden bg-black">
            {video ? renderVideo(backgroundClass, blurVideoRef, { blur: true }) : renderImage(backgroundClass)}
          </div>
          <div className="absolute inset-0 z-[1]">
            {video ? renderVideo(foregroundClass, videoRef) : renderImage(foregroundClass)}
          </div>
        </>
      ) : (
        <>
          {renderImage(foregroundClass)}
          {renderVideo(foregroundClass, videoRef)}
        </>
      )}

      {!portrait && fit === "cover" ? (
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      ) : null}
      {portrait ? (
        <div className="pointer-events-none absolute inset-0 z-[2] bg-black/10" />
      ) : null}
    </div>
  );
}
