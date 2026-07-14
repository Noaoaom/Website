"use client";

import {
  animate,
  motion,
  motionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";
import {
  cropInsetFromVisible,
  easeZoom,
} from "@/lib/cropReveal";
import type { IntroReelMotion } from "./intro/useIntroReelMotion";
import { SLOT_HEIGHT_VH, SLOT_WIDTH_VW } from "./intro/useIntroReelMotion";
import { WORDMARK_INTRO_TOTAL_MS } from "./heroWordmarkLayout";
import { carouselRedMaskClip } from "@/lib/introCarouselClip";
import { waitUntil } from "@/lib/waitUntil";
import MediaCover from "./ui/MediaCover";
import { useUI } from "./Providers";

const EASE = [0.22, 1, 0.36, 1] as const;
const RED_HOLD_MS = WORDMARK_INTRO_TOTAL_MS;
const POST_TEXT_READY_MS = 100;
const SLOT_OPEN_S = 0.95;
const PROJECT_BEAT_MS = 50;
const CROP_IN_S = 0.75;
const REVEAL_S = 0.95;
const REVEAL_HORIZONTAL_DELAY_S = 0.28;
/** Max wait for hero video buffer before intro starts anyway. */
const INTRO_MEDIA_MAX_WAIT_MS = 12000;

export type IntroMediaItem = {
  id: string;
  image: string;
  video?: string;
  alt: string;
  isHero?: boolean;
};

type IntroCurtainProps = {
  media: IntroMediaItem[];
  reelMotion: IntroReelMotion;
  onTextReady: () => void;
  onComplete: () => void;
};

type IntroMediaLayerProps = {
  item: IntroMediaItem;
  index: number;
  cropProgress: MotionValue<number>;
  revealVertical: MotionValue<number>;
};

function IntroMediaLayer({
  item,
  index,
  cropProgress,
  revealVertical,
}: IntroMediaLayerProps) {
  const clipPath = useTransform(cropProgress, (localT) => {
    const visible = easeZoom(Math.min(Math.max(localT, 0), 1));
    return cropInsetFromVisible(visible);
  });

  const layerOpacity = useTransform(
    [cropProgress, revealVertical],
    ([crop, vert]: number[]) => {
      if (crop <= 0.001) return 0;
      if (item.isHero) return 1;
      return vert < 0.12 ? 1 : 0;
    }
  );

  const mediaOpacity = useTransform(revealVertical, (vert) =>
    item.isHero ? 1 : vert < 0.2 ? 1 : 0
  );

  return (
    <motion.div
      className="absolute inset-0 will-change-[clip-path,opacity]"
      style={{
        opacity: layerOpacity,
        clipPath,
        zIndex: index,
      }}
    >
      <motion.div className="absolute inset-0" style={{ opacity: mediaOpacity }}>
        <MediaCover
          image={item.image}
          video={item.video}
          alt={item.alt}
          fit="cover"
          priority
          playOnView
          handoffId={item.isHero ? "intro-hero" : undefined}
        />
      </motion.div>
    </motion.div>
  );
}

function useCropValues(count: number) {
  const ref = useRef<MotionValue<number>[] | null>(null);

  if (!ref.current || ref.current.length !== count) {
    ref.current = Array.from({ length: count }, () => motionValue(0));
  }

  return ref.current;
}

export default function IntroCurtain({
  media,
  reelMotion,
  onTextReady,
  onComplete,
}: IntroCurtainProps) {
  const mediaCount = media.length;
  const cropProgresses = useCropValues(mediaCount);
  const { introSequenceReady } = useUI();
  const introSequenceReadyRef = useRef(introSequenceReady);
  introSequenceReadyRef.current = introSequenceReady;

  const { slotOpen, revealHorizontal, revealVertical, outerHeightVh } =
    reelMotion;

  const outerWidthVw = useTransform(
    [slotOpen, revealHorizontal],
    ([slot, horiz]: number[]) => {
      if (horiz > 0) {
        return SLOT_WIDTH_VW + easeZoom(horiz) * (100 - SLOT_WIDTH_VW);
      }
      return slot * SLOT_WIDTH_VW;
    }
  );

  const windowWidth = useTransform(outerWidthVw, (w) => `${w}vw`);
  const windowHeight = useTransform(outerHeightVh, (h) => `${h}dvh`);

  const isWindowAnchored = useTransform(slotOpen, (slot) => (slot > 0 ? 1 : 0));

  const windowPosition = useTransform(isWindowAnchored, (active) =>
    active > 0 ? "fixed" : "relative"
  );

  const windowLeft = useTransform(isWindowAnchored, (active) =>
    active > 0 ? "50%" : "auto"
  );

  const windowX = useTransform(isWindowAnchored, (active) =>
    active > 0 ? "-50%" : "0%"
  );

  const windowTop = useTransform(
    [slotOpen, outerHeightVh],
    ([slot, heightVh]: number[]) => {
      if (slot <= 0) return "auto";
      return `calc(50dvh - ${heightVh / 2}dvh)`;
    }
  );

  const windowZIndex = useTransform(isWindowAnchored, (active) =>
    active > 0 ? 195 : 1
  );

  const innerHeight = useTransform(slotOpen, (slot) =>
    slot > 0 ? "100dvh" : `${SLOT_HEIGHT_VH}dvh`
  );

  const redMaskClip = useTransform(
    [slotOpen, outerHeightVh, outerWidthVw],
    ([slot, hVh, wVw]: number[]) => {
      if (slot <= 0.001) return "none";
      return carouselRedMaskClip(hVh, wVw);
    }
  );

  const onTextReadyRef = useRef(onTextReady);
  const onCompleteRef = useRef(onComplete);
  onTextReadyRef.current = onTextReady;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (revealVertical.get() >= 1) {
      return;
    }

    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), ms);
      });

    const startCrop = (index: number) => {
      const crop = cropProgresses[index];
      crop.set(0);
      return animate(crop, 1, { duration: CROP_IN_S, ease: EASE });
    };

    const run = async () => {
      slotOpen.set(0);
      revealHorizontal.set(0);
      revealVertical.set(0);
      cropProgresses.forEach((crop) => crop.set(0));

      await waitUntil(
        () => introSequenceReadyRef.current,
        INTRO_MEDIA_MAX_WAIT_MS
      );
      if (cancelled) return;

      await wait(RED_HOLD_MS);
      if (cancelled) return;

      onTextReadyRef.current();

      await wait(POST_TEXT_READY_MS);
      if (cancelled) return;

      cropProgresses[0]?.set(1);

      const slotAnimation = animate(slotOpen, 1, {
        duration: SLOT_OPEN_S,
        ease: EASE,
      });

      const cropAnimations: ReturnType<typeof animate>[] = [];

      for (let i = 1; i < mediaCount; i++) {
        await wait(PROJECT_BEAT_MS);
        if (cancelled) return;
        cropAnimations.push(startCrop(i));
      }

      await Promise.all([slotAnimation, ...cropAnimations]);
      if (cancelled) return;

      await Promise.all([
        animate(revealVertical, 1, {
          duration: REVEAL_S,
          ease: EASE,
        }),
        animate(revealHorizontal, 1, {
          duration: REVEAL_S * 0.88,
          ease: EASE,
          delay: REVEAL_HORIZONTAL_DELAY_S,
        }),
      ]);
      if (cancelled) return;

      onCompleteRef.current();
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    slotOpen,
    revealHorizontal,
    revealVertical,
    cropProgresses,
    mediaCount,
  ]);

  return (
    <motion.div className="pointer-events-none absolute inset-0 z-[180] overflow-hidden">
      {/* Roter Vorhang mit Loch — Hero-Video darunter wird beim Reveal sichtbar */}
      <motion.div
        className="absolute inset-0 z-[185] bg-brand-red will-change-[clip-path]"
        style={{ clipPath: redMaskClip }}
      />
      <div className="absolute inset-0 z-[190] flex items-center justify-center">
        <motion.div
          className="relative shrink-0 overflow-hidden will-change-[width,height,top,left,transform]"
          style={{
            position: windowPosition,
            left: windowLeft,
            top: windowTop,
            x: windowX,
            zIndex: windowZIndex,
            height: windowHeight,
            width: windowWidth,
          }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 w-[100vw] -translate-x-1/2 -translate-y-1/2 will-change-[height]"
            style={{
              height: innerHeight,
            }}
          >
            {media.map((item, index) => (
              <IntroMediaLayer
                key={item.id}
                item={item}
                index={index}
                cropProgress={cropProgresses[index]!}
                revealVertical={revealVertical}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
