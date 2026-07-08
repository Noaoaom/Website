"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Project } from "@/lib/projects";
import MediaCover from "./ui/MediaCover";
import ScrollRevealText, { TEXT_TRANSITION_SPEED } from "./ui/ScrollRevealText";

/** Overlap for first project entering over the pinned hero. */
export const HERO_OVERLAP_VH = 50;

import { easeZoom } from "@/lib/cropReveal";

function easeFade(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

type ProjectSectionProps = {
  project: Project;
  index: number;
  overlapPrevious?: number;
};

export default function ProjectSection({
  project,
  index,
  overlapPrevious = 0,
}: ProjectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isRedBg = index % 2 === 1;

  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /** Text reveals later on enter; exits later on leave. */
  const textSpeed = TEXT_TRANSITION_SPEED;

  const textEnterProgress = useTransform(enterProgress, (p) =>
    Math.min(Math.max((p - 0.45) / (0.35 * textSpeed), 0), 1)
  );

  const textExitProgress = useTransform(exitProgress, (p) =>
    Math.min(Math.max((p - 0.32) / (0.45 * textSpeed), 0), 1)
  );

  const revealCrop = useTransform(enterProgress, (progress) => {
    const t = easeZoom(Math.min(Math.max(progress, 0), 1));
    const visible = 0.45 + t * 0.55;
    const inset = ((1 - visible) / 2) * 100;
    return `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
  });

  const metaLeftX = useTransform(
    [textEnterProgress, textExitProgress],
    ([enter, exit]: number[]) => {
      const inT = easeFade(Math.min(Math.max(enter / (0.55 * textSpeed), 0), 1));
      const outT = easeFade(Math.min(Math.max(exit / (0.5 * textSpeed), 0), 1));
      return -40 * (1 - inT) - 32 * outT;
    }
  );

  const metaRightX = useTransform(
    [textEnterProgress, textExitProgress],
    ([enter, exit]: number[]) => {
      const inT = easeFade(
        Math.min(Math.max((enter - 0.06) / (0.55 * textSpeed), 0), 1)
      );
      const outT = easeFade(
        Math.min(Math.max((exit - 0.06) / (0.5 * textSpeed), 0), 1)
      );
      return 40 * (1 - inT) + 32 * outT;
    }
  );

  const metaOpacity = useTransform(
    [textEnterProgress, textExitProgress],
    ([enter, exit]: number[]) => {
      const inT = easeFade(Math.min(Math.max(enter / (0.5 * textSpeed), 0), 1));
      const outT = easeFade(Math.min(Math.max(exit / (0.45 * textSpeed), 0), 1));
      return inT * (1 - outT);
    }
  );

  const titleScale = useTransform(
    [textEnterProgress, textExitProgress],
    ([enter, exit]: number[]) => {
      const inT = easeFade(Math.min(Math.max(enter / (0.6 * textSpeed), 0), 1));
      const outT = easeFade(Math.min(Math.max(exit / (0.5 * textSpeed), 0), 1));
      return 0.9 + inT * 0.1 - outT * 0.06;
    }
  );

  return (
    <section
      ref={sectionRef}
      className={`relative h-dvh w-full overflow-hidden ${
        isRedBg ? "bg-brand-red" : "bg-black"
      }`}
      style={{
        marginTop: overlapPrevious ? `-${overlapPrevious}vh` : undefined,
        zIndex: 10 + index,
      }}
    >
      <Link
        href={`/project/${project.slug}`}
        className="group relative block h-full w-full"
      >
        <div className="absolute inset-0 h-dvh w-full overflow-hidden">
          <motion.div
            className="absolute inset-0 h-dvh w-full will-change-[clip-path]"
            style={{ clipPath: revealCrop }}
          >
            <MediaCover
              image={project.image}
              video={project.video}
              alt={project.title}
              fit="cover"
              priority={index <= 1}
            />
          </motion.div>
        </div>

        <motion.div className="pointer-events-none absolute inset-0 z-[25] flex flex-col items-center justify-between px-4 py-[7dvh] md:px-12">
          <div
            className={`flex w-full items-start justify-between font-helvetica text-[15px] uppercase md:text-[21px] ${
              isRedBg ? "text-black" : "text-brand-red"
            }`}
          >
            <motion.span style={{ opacity: metaOpacity, x: metaLeftX }}>
              {project.number}
            </motion.span>
            <motion.span style={{ opacity: metaOpacity, x: metaRightX }}>
              {project.client}
            </motion.span>
          </div>

          <motion.div
            className="flex max-w-[90%] origin-center flex-col items-center gap-4 text-center md:max-w-[70%]"
            style={{ scale: titleScale }}
          >
            <ScrollRevealText
              as="h3"
              text={project.title}
              enterProgress={textEnterProgress}
              exitProgress={textExitProgress}
              className="font-ivar text-[40px] uppercase leading-[0.85] text-brand-red md:text-[72px] lg:text-[100px]"
              stagger={0.75}
              travelEm={0.4}
              speed={textSpeed}
            />
            <ScrollRevealText
              as="h4"
              text={project.subtitle}
              enterProgress={textEnterProgress}
              exitProgress={textExitProgress}
              className="font-helvetica text-[15px] uppercase leading-[1.1] text-brand-red md:text-[21px]"
              stagger={0.68}
              travelEm={0.45}
              speed={textSpeed}
            />
          </motion.div>

          <div aria-hidden className="h-[1px]" />
        </motion.div>
      </Link>
    </section>
  );
}
