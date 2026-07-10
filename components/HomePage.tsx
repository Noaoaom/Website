"use client";

import { useScroll, useTransform } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { heroMedia, projects } from "@/lib/projects";
import { useUI } from "./Providers";
import Footer from "./Footer";
import HeroContent from "./Hero";
import HeroWordmarks from "./HeroWordmarks";
import IntroCurtain, { type IntroMediaItem } from "./IntroCurtain";
import { useIntroReelMotion } from "./intro/useIntroReelMotion";
import MediaPreloader from "./MediaPreloader";
import ProjectSection, { HERO_OVERLAP_VH } from "./ProjectSection";

/** Extra scroll while hero stays pinned before projects take over. */
const HERO_PIN_EXTRA_VH = HERO_OVERLAP_VH;

const introMedia: IntroMediaItem[] = [
  ...projects.map((project) => ({
    id: project.slug,
    image: project.image,
    video: project.video,
    alt: project.title,
  })),
  {
    id: "hero",
    image: heroMedia.image,
    video: heroMedia.video,
    alt: "Hero reel",
    isHero: true,
  },
];

export default function HomePage() {
  const {
    setLoaderDone,
    setIntroScrollEnabled,
    setIntroComplete,
    setPreloaderActive,
  } = useUI();
  const pinRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  const reelMotion = useIntroReelMotion();
  const reelMotionRef = useRef(reelMotion);
  reelMotionRef.current = reelMotion;

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  const handleTextReady = useCallback(() => {
    setLoaderDone(true);
  }, [setLoaderDone]);

  const handleIntroComplete = useCallback(() => {
    setIntroScrollEnabled(true);
    setIntroComplete(true);
    setPreloaderActive(false);

    const rm = reelMotionRef.current;
    rm.slotOpen.set(1);
    rm.revealHorizontal.set(1);
    rm.revealVertical.set(1);

    requestAnimationFrame(() => {
      const introVideo = document.querySelector(
        '[data-handoff-id="intro-hero"] video'
      ) as HTMLVideoElement | null;
      const heroVideo = document.querySelector(
        '[data-handoff-id="hero-reel"] video'
      ) as HTMLVideoElement | null;

      if (introVideo && heroVideo) {
        heroVideo.currentTime = introVideo.currentTime;
        if (!introVideo.paused) {
          heroVideo.play().catch(() => undefined);
        }
      }

      requestAnimationFrame(() => {
        setShowIntro(false);
      });
    });
  }, [setIntroScrollEnabled, setIntroComplete, setPreloaderActive]);

  return (
    <main className="relative bg-black">
      <MediaPreloader />
      <div
        ref={pinRef}
        className="relative z-[1]"
        style={{
          height: `calc(100dvh + ${HERO_PIN_EXTRA_VH}vh)`,
        }}
      >
        <div className="sticky top-0 h-dvh w-full">
          <HeroContent y={heroY} scale={heroScale} />
          <HeroWordmarks reelMotion={reelMotion} />
          {showIntro ? (
            <IntroCurtain
              media={introMedia}
              reelMotion={reelMotion}
              onTextReady={handleTextReady}
              onComplete={handleIntroComplete}
            />
          ) : null}
        </div>
      </div>

      <div className="relative z-[2]">
        {projects.map((project, index) => (
          <ProjectSection
            key={project.slug}
            project={project}
            index={index}
            overlapPrevious={index === 0 ? HERO_PIN_EXTRA_VH : 0}
          />
        ))}
      </div>

      <Footer theme="red" />
    </main>
  );
}
