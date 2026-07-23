"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import type { Project } from "@/lib/projects";
import Footer from "./Footer";
import HoverLink, { HoverButton } from "./ui/HoverLink";
import MediaCover from "./ui/MediaCover";
import RevealText from "./ui/RevealText";

type ProjectViewProps = {
  project: Project;
  nextProject: Project;
};

export default function ProjectView({ project, nextProject }: ProjectViewProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 0.45], [0.92, 1]);

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-black">
      <div ref={heroRef} className="relative sticky top-0 z-10 h-dvh w-full overflow-hidden">
        <motion.div
          className="relative h-full w-full will-change-transform"
          style={{ scale: mediaScale }}
        >
          <MediaCover
            image={project.image}
            video={project.video}
            alt={project.title}
            priority
            fit="contain"
            className="flex items-center justify-center"
          />
        </motion.div>

        <div
          className={`absolute inset-0 z-[200] overflow-y-auto overscroll-contain transition-opacity duration-500 no-scrollbar ${
            infoOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex min-h-full w-full flex-col px-6 py-[20dvh]">
            <div className="pointer-events-none flex w-full max-w-full flex-1 flex-col items-center justify-center text-center">
              <RevealText
                as="span"
                text={project.client}
                className="mb-6 block font-helvetica text-[15px] uppercase leading-none text-brand-red md:text-[21px]"
              />
              <RevealText
                as="h1"
                text={project.title}
                className="font-ivar text-[48px] uppercase leading-[0.85] text-brand-red md:text-[80px] lg:text-[110px]"
              />
              <RevealText
                as="h2"
                text={project.subtitle}
                className="mt-6 font-helvetica text-[15px] uppercase leading-[1.1] text-brand-red md:text-[21px]"
                delay={0.1}
              />
            </div>

            <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              {project.credits.map((credit) => (
                <div key={`${credit.role}-${credit.name}`} className="text-center md:text-left">
                  <p className="font-helvetica text-[12px] uppercase tracking-widest text-brand-red/70">
                    {credit.role}
                  </p>
                  <p className="font-helvetica text-[15px] uppercase text-brand-red md:text-[21px]">
                    {credit.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[10px] left-0 right-0 z-[210] flex items-center justify-center px-4 md:bottom-[20px] md:justify-between md:px-12">
          <div className="pointer-events-auto overflow-hidden">
            <HoverButton
              className="font-ivar text-[21px] uppercase leading-none text-brand-red md:text-[30px]"
              onClick={() => setInfoOpen((open) => !open)}
            >
              {infoOpen ? "close" : "info"}
            </HoverButton>
          </div>

          <Link
            href={`/project/${nextProject.slug}`}
            className="pointer-events-auto hidden font-helvetica text-[15px] uppercase text-brand-red transition-opacity hover:opacity-70 md:inline-block md:text-[21px]"
          >
            Next — {nextProject.title}
          </Link>
        </div>
      </div>

      <Footer theme="black" spacerClassName="relative z-10" />
    </main>
  );
}
