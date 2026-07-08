"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { useUI } from "./Providers";
import HoverLink from "./ui/HoverLink";
import RevealText from "./ui/RevealText";

export default function MenuOverlay() {
  const { menuOpen, setMenuOpen } = useUI();

  return (
    <AnimatePresence>
      {menuOpen ? (
        <motion.div
          className="fixed inset-0 z-[3000] overflow-y-auto overscroll-contain bg-black text-brand-red no-scrollbar"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex min-h-dvh flex-col px-4 pb-20 pt-[120px] lg:px-12">
            <div className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <RevealText
                as="h2"
                text={site.tagline}
                className="font-ivar text-[48px] uppercase leading-[0.85] md:text-[80px] lg:text-[100px]"
              />
              <p className="max-w-md font-helvetica text-[15px] uppercase leading-[1.4] text-brand-red/80 md:text-[21px]">
                Selected work, full archive, and contact details.
              </p>
            </div>

            <ul className="flex flex-col gap-2 md:gap-4">
              {projects.map((project, index) => (
                <motion.li
                  key={project.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08 * index + 0.15,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={`/project/${project.slug}`}
                    className="group flex flex-col gap-2 border-t border-brand-red/20 py-4 transition-colors hover:border-brand-red md:flex-row md:items-end md:justify-between md:py-6"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="font-helvetica text-[15px] uppercase md:text-[21px]">
                      {project.number}
                    </span>
                    <span className="font-ivar text-[32px] uppercase leading-none transition-transform duration-500 group-hover:translate-x-2 md:text-[60px]">
                      {project.title}
                    </span>
                    <span className="font-helvetica text-[15px] uppercase md:text-[21px]">
                      {project.client}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-6 pt-16">
              <HoverLink
                href={`mailto:${site.email}`}
                className="font-helvetica text-[15px] uppercase md:text-[21px]"
              >
                {site.email}
              </HoverLink>
              <HoverLink
                href={site.instagram.url}
                className="font-helvetica text-[15px] uppercase md:text-[21px]"
              >
                {site.instagram.handle}
              </HoverLink>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
