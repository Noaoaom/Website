"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type MouseEvent } from "react";
import {
  projectDisplayFontClass,
  usesDisplayTitleFont,
} from "@/app/fonts";
import { getProjectMediaProps, getProjectTitleClassName, type Project } from "@/lib/projects";
import Footer from "./Footer";
import { HoverButton } from "./ui/HoverLink";
import MediaCover from "./ui/MediaCover";
import RevealText from "./ui/RevealText";
import ProjectTitleLogo from "./ui/ProjectTitleLogo";
import { startVideoHandoff } from "@/lib/videoHandoff";
import { useUI } from "./Providers";

type ProjectViewProps = {
  project: Project;
  nextProject: Project;
};

export default function ProjectView({ project, nextProject }: ProjectViewProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const { startProjectTransition, projectTransitionSlug, returnToHome } = useUI();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 0.45], [1, 1.04]);

  const handleNextClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (projectTransitionSlug) return;
    if (nextProject.video) startVideoHandoff(nextProject.video);
    startProjectTransition(nextProject.slug);
  };

  const mediaProps = getProjectMediaProps(project);

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
            videoHandoff="finish"
            fit={mediaProps.fit}
            portrait={mediaProps.portrait}
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
              {project.titleLogo ? (
                <ProjectTitleLogo
                  src={project.titleLogo}
                  alt={project.title}
                  className="h-[44px] w-[min(78vw,300px)] md:h-[72px] md:w-[min(60vw,440px)] lg:h-[84px] lg:w-[min(50vw,500px)]"
                />
              ) : (
                <RevealText
                  as="h1"
                  text={project.title}
                  className={`${getProjectTitleClassName(project, "detail")}${
                    projectDisplayFontClass(project.titleFont)
                      ? ` ${projectDisplayFontClass(project.titleFont)}`
                      : ""
                  }`}
                  clipChars={!usesDisplayTitleFont(project.titleFont)}
                />
              )}
              {project.subtitleHref ? (
                <a
                  href={project.subtitleHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto mt-6 font-helvetica text-[15px] uppercase leading-[1.1] text-brand-red transition-opacity hover:opacity-70 md:text-[21px]"
                >
                  {project.subtitle}
                </a>
              ) : (
                <RevealText
                  as="h2"
                  text={project.subtitle}
                  className="mt-6 font-helvetica text-[15px] uppercase leading-[1.1] text-brand-red md:text-[21px]"
                  delay={0.1}
                />
              )}
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

        <div className="pointer-events-none absolute bottom-[10px] left-0 right-0 z-[210] grid grid-cols-[1fr_auto_1fr] items-center px-4 md:bottom-[20px] md:px-12">
          <div className="pointer-events-auto justify-self-start overflow-hidden">
            <HoverButton
              className="font-helvetica text-[15px] uppercase md:text-[21px]"
              underline={false}
              onClick={returnToHome}
            >
              Back
            </HoverButton>
          </div>

          <div className="pointer-events-auto justify-self-center overflow-hidden">
            <HoverButton
              className="font-ivar text-[21px] uppercase leading-none text-brand-red md:text-[30px]"
              onClick={() => setInfoOpen((open) => !open)}
            >
              {infoOpen ? "close" : "info"}
            </HoverButton>
          </div>

          <Link
            href={`/project/${nextProject.slug}`}
            className="pointer-events-auto hidden justify-self-end font-helvetica text-[15px] uppercase text-brand-red transition-opacity hover:opacity-70 md:inline-block md:text-[21px]"
            onClick={handleNextClick}
          >
            Next — {nextProject.title}
          </Link>
        </div>
      </div>

      <Footer theme="black" spacerClassName="relative z-10" />
    </main>
  );
}
