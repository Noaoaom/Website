"use client";

import {
  animate,
  motion,
  motionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { carouselRedMaskClip } from "@/lib/introCarouselClip";
import { cropInsetFromVisible, easeZoom } from "@/lib/cropReveal";
import { projects, getProjectMediaProps, type Project } from "@/lib/projects";
import { PROJECT_TRANSITION } from "@/lib/projectTransition";
import {
  SLOT_HEIGHT_VH,
  SLOT_WIDTH_VW,
} from "./intro/useIntroReelMotion";
import MediaCover from "./ui/MediaCover";
import { useUI } from "./Providers";

type CarouselLayerProps = {
  project: Project;
  index: number;
  cropProgress: MotionValue<number>;
  revealVertical: MotionValue<number>;
  isTarget: boolean;
};

function CarouselLayer({
  project,
  index,
  cropProgress,
  revealVertical,
  isTarget,
}: CarouselLayerProps) {
  const clipPath = useTransform(cropProgress, (localT) => {
    const visible = easeZoom(Math.min(Math.max(localT, 0), 1));
    return cropInsetFromVisible(visible);
  });

  const layerOpacity = useTransform(
    [cropProgress, revealVertical],
    ([crop, vert]: number[]) => {
      if (crop <= 0.001) return 0;
      if (isTarget) return 1;
      return vert < 0.08 ? 1 : 0;
    }
  );

  const mediaOpacity = useTransform(revealVertical, (vert) =>
    isTarget ? 1 : vert < 0.15 ? 1 : 0
  );

  const mediaProps = getProjectMediaProps(project);

  return (
    <motion.div
      className="absolute inset-0 will-change-[clip-path,opacity]"
      style={{ opacity: layerOpacity, clipPath, zIndex: index }}
    >
      <motion.div className="absolute inset-0" style={{ opacity: mediaOpacity }}>
        <MediaCover
          image={project.image}
          video={project.video}
          alt={project.title}
          fit={mediaProps.fit}
          portrait={mediaProps.portrait}
          priority
          playOnView
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

function getCarouselProjects(startIndex: number, targetIndex: number): Project[] {
  if (startIndex < 0 || targetIndex < 0) return [];
  if (targetIndex >= startIndex) {
    return projects.slice(startIndex, targetIndex + 1);
  }
  return [projects[startIndex]!, projects[targetIndex]!];
}

export default function ProjectTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const {
    projectTransitionSlug,
    homeTransitionSlug,
    finishProjectTransition,
    finishHomeTransition,
  } = useUI();

  const isForward = Boolean(projectTransitionSlug);
  const isReverse = Boolean(homeTransitionSlug);
  const activeSlug = projectTransitionSlug ?? homeTransitionSlug;

  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [direction, setDirection] = useState<"in" | "out">("in");

  const forwardTargetIndex = projects.findIndex(
    (p) => p.slug === projectTransitionSlug
  );
  const currentIndex = projects.findIndex(
    (p) => pathname === `/project/${p.slug}`
  );
  const forwardStartIndex = currentIndex >= 0 ? currentIndex : 0;
  const reverseTargetIndex = projects.findIndex(
    (p) => p.slug === homeTransitionSlug
  );

  const carouselProjects = isForward
    ? forwardTargetIndex >= 0
      ? getCarouselProjects(forwardStartIndex, forwardTargetIndex)
      : []
    : reverseTargetIndex >= 0
      ? getCarouselProjects(0, reverseTargetIndex)
      : [];

  const mediaCount = Math.max(carouselProjects.length, 1);

  const slotOpen = useRef(motionValue(0)).current;
  const revealHorizontal = useRef(motionValue(0)).current;
  const revealVertical = useRef(motionValue(0)).current;
  const cropProgresses = useCropValues(mediaCount);
  const beatFlash = useRef(motionValue(0)).current;

  const outerHeightVh = useTransform(
    [slotOpen, revealVertical],
    ([slot, vert]: number[]) => {
      if (vert > 0) {
        return SLOT_HEIGHT_VH + easeZoom(vert) * (100 - SLOT_HEIGHT_VH);
      }
      return slot * SLOT_HEIGHT_VH;
    }
  );

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

  const blackFlashOpacity = useTransform(beatFlash, (v) =>
    v > 0 && Math.floor(v) % 2 === 0 ? 1 : 0
  );
  const redFlashOpacity = useTransform(beatFlash, (v) =>
    v > 0 && Math.floor(v) % 2 === 1 ? 1 : 0
  );

  useEffect(() => {
    if (!projectTransitionSlug || forwardTargetIndex < 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      router.push(`/project/${projectTransitionSlug}`);
      finishProjectTransition();
      return;
    }

    setDirection("in");
    setVisible(true);
    setFadingOut(false);
    document.body.style.overflow = "hidden";
    lenis?.stop();

    let cancelled = false;
    let navigated = false;
    const count = carouselProjects.length;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), ms);
      });

    const reset = () => {
      slotOpen.set(0);
      revealHorizontal.set(0);
      revealVertical.set(0);
      beatFlash.set(0);
      cropProgresses.forEach((crop) => crop.set(0));
    };

    const startCrop = (index: number) => {
      const crop = cropProgresses[index];
      crop.set(0);
      return animate(crop, 1, {
        duration: PROJECT_TRANSITION.cropInS,
        ease: PROJECT_TRANSITION.ease,
      });
    };

    const run = async () => {
      reset();
      beatFlash.set(1);
      cropProgresses[0]?.set(1);

      const slotAnimation = animate(slotOpen, 1, {
        duration: PROJECT_TRANSITION.slotOpenS,
        ease: PROJECT_TRANSITION.ease,
      });

      const cropAnimations: ReturnType<typeof animate>[] = [];

      for (let i = 1; i < count; i++) {
        await wait(PROJECT_TRANSITION.projectBeatMs);
        if (cancelled) return;
        beatFlash.set(i + 1);
        cropAnimations.push(startCrop(i));
      }

      await Promise.all([slotAnimation, ...cropAnimations]);
      if (cancelled) return;

      const revealVerticalAnim = animate(revealVertical, 1, {
        duration: PROJECT_TRANSITION.revealS,
        ease: PROJECT_TRANSITION.ease,
      });

      const revealHorizontalAnim = animate(revealHorizontal, 1, {
        duration: PROJECT_TRANSITION.revealS * 0.88,
        ease: PROJECT_TRANSITION.ease,
        delay: PROJECT_TRANSITION.revealHorizontalDelayS,
      });

      const navigateTimer = window.setTimeout(() => {
        if (cancelled || navigated) return;
        navigated = true;
        router.push(`/project/${projectTransitionSlug}`);
      }, PROJECT_TRANSITION.revealS * PROJECT_TRANSITION.navigateAtReveal * 1000);

      await Promise.all([revealVerticalAnim, revealHorizontalAnim]);
      if (cancelled) return;

      window.clearTimeout(navigateTimer);
      if (!navigated) {
        navigated = true;
        router.push(`/project/${projectTransitionSlug}`);
      }

      setFadingOut(true);
      await wait(PROJECT_TRANSITION.overlayFadeMs);
      if (cancelled) return;

      finishProjectTransition();
      setVisible(false);
      setFadingOut(false);
      document.body.style.overflow = "";
      lenis?.start();
      requestAnimationFrame(() => lenis?.resize());
    };

    run();

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [
    projectTransitionSlug,
    forwardTargetIndex,
    carouselProjects.length,
    router,
    finishProjectTransition,
    slotOpen,
    revealHorizontal,
    revealVertical,
    beatFlash,
    cropProgresses,
    lenis,
  ]);

  useEffect(() => {
    if (!homeTransitionSlug || reverseTargetIndex < 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      router.push("/", { scroll: false });
      finishHomeTransition();
      return;
    }

    setDirection("out");
    setVisible(true);
    setFadingOut(false);
    document.body.style.overflow = "hidden";
    lenis?.stop();

    let cancelled = false;
    let navigated = false;
    const count = carouselProjects.length;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), ms);
      });

    const setEndState = () => {
      slotOpen.set(1);
      revealHorizontal.set(1);
      revealVertical.set(1);
      beatFlash.set(Math.max(count, 1));
      cropProgresses.forEach((crop) => crop.set(1));
    };

    const run = async () => {
      setEndState();

      const revealHorizontalAnim = animate(revealHorizontal, 0, {
        duration: PROJECT_TRANSITION.revealS * 0.88,
        ease: PROJECT_TRANSITION.ease,
      });

      const revealVerticalAnim = animate(revealVertical, 0, {
        duration: PROJECT_TRANSITION.revealS,
        ease: PROJECT_TRANSITION.ease,
        delay: PROJECT_TRANSITION.revealHorizontalDelayS,
      });

      const navigateTimer = window.setTimeout(() => {
        if (cancelled || navigated) return;
        navigated = true;
        router.push("/", { scroll: false });
      }, PROJECT_TRANSITION.revealS * PROJECT_TRANSITION.navigateAtReveal * 1000);

      await Promise.all([revealHorizontalAnim, revealVerticalAnim]);
      if (cancelled) return;

      window.clearTimeout(navigateTimer);
      if (!navigated) {
        navigated = true;
        router.push("/", { scroll: false });
      }

      for (let i = count - 1; i >= 1; i--) {
        await wait(PROJECT_TRANSITION.projectBeatMs);
        if (cancelled) return;
        beatFlash.set(i);
        await animate(cropProgresses[i]!, 0, {
          duration: PROJECT_TRANSITION.cropInS,
          ease: PROJECT_TRANSITION.ease,
        });
      }

      await animate(slotOpen, 0, {
        duration: PROJECT_TRANSITION.slotOpenS,
        ease: PROJECT_TRANSITION.ease,
      });
      if (cancelled) return;

      beatFlash.set(0);
      await animate(cropProgresses[0]!, 0, {
        duration: PROJECT_TRANSITION.cropInS * 0.85,
        ease: PROJECT_TRANSITION.ease,
      });
      if (cancelled) return;

      setFadingOut(true);
      await wait(PROJECT_TRANSITION.overlayFadeMs);
      if (cancelled) return;

      finishHomeTransition();
      setVisible(false);
      setFadingOut(false);
      document.body.style.overflow = "";
      lenis?.start();
      requestAnimationFrame(() => lenis?.resize());
    };

    run();

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [
    homeTransitionSlug,
    reverseTargetIndex,
    carouselProjects.length,
    router,
    finishHomeTransition,
    slotOpen,
    revealHorizontal,
    revealVertical,
    beatFlash,
    cropProgresses,
    lenis,
  ]);

  useEffect(() => {
    if (!projectTransitionSlug && !homeTransitionSlug) {
      setVisible(false);
      setFadingOut(false);
    }
  }, [projectTransitionSlug, homeTransitionSlug]);

  if (!visible || !activeSlug || carouselProjects.length === 0) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[4000] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: PROJECT_TRANSITION.overlayFadeMs / 1000, ease: "easeOut" }}
      aria-hidden={fadingOut}
      data-transition-direction={direction}
    >
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: blackFlashOpacity }}
      />
      <motion.div
        className="absolute inset-0 bg-brand-red"
        style={{ opacity: redFlashOpacity }}
      />

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
            style={{ height: innerHeight }}
          >
            {carouselProjects.map((project, index) => (
              <CarouselLayer
                key={project.slug}
                project={project}
                index={index}
                cropProgress={cropProgresses[index]!}
                revealVertical={revealVertical}
                isTarget={index === carouselProjects.length - 1}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
