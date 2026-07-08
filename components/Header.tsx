"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";
import { site } from "@/lib/site";
import { useUI } from "./Providers";
import LogoText from "./LogoText";
import HoverLink, { HoverButton } from "./ui/HoverLink";

const navTextClass =
  "font-ivar text-[21px] uppercase leading-none md:text-[30px]";

export default function Header() {
  const { loaderDone, menuOpen, setMenuOpen } = useUI();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const enterTransition = {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <header className="pointer-events-none fixed left-0 top-[20px] z-[150] w-full lg:top-[40px]">
      <div className="relative grid w-full grid-cols-[1fr_auto_1fr] items-start px-4 lg:px-12">
        <motion.div
          className="pointer-events-auto justify-self-start overflow-hidden"
          initial={{ y: "-100%" }}
          animate={{ y: loaderDone ? 0 : "-100%" }}
          transition={{ ...enterTransition, delay: 0.2 }}
        >
          <HoverLink href={`mailto:${site.email}`} className={navTextClass}>
            contacts
          </HoverLink>
        </motion.div>

        <motion.div
          className="pointer-events-auto justify-self-center overflow-hidden"
          initial={{ y: "-100%" }}
          animate={{ y: loaderDone ? 0 : "-100%" }}
          transition={{ ...enterTransition, delay: 0.28 }}
        >
          <Link href="/" aria-label={site.name} className="block">
            <div className="aspect-[1808/399] h-[21px] md:h-[30px]">
              <LogoText className="h-full w-full" />
            </div>
          </Link>
        </motion.div>

        <motion.div
          className="pointer-events-auto justify-self-end overflow-hidden"
          initial={{ y: "-100%" }}
          animate={{ y: loaderDone ? 0 : "-100%" }}
          transition={{ ...enterTransition, delay: 0.35 }}
        >
          <HoverButton
            className={`cursor-pointer ${navTextClass}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "close" : "menu"}
          </HoverButton>
        </motion.div>
      </div>
    </header>
  );
}
