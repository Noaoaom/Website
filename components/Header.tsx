"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useUI } from "./Providers";
import LogoText from "./LogoText";
import HoverLink, { HoverButton } from "./ui/HoverLink";

const navTextClass =
  "font-ivar text-[21px] uppercase leading-none md:text-[30px]";

/**
 * Die erste Projekt-Section bedeckt beim Scrollen genau `scrollY` Pixel des
 * Viewports — 0.7 = Nav erscheint, wenn sie ~70% des Bildschirms einnimmt
 * und der Dickhausen-Titel verdeckt ist.
 */
const SCROLL_REVEAL_VH = 0.7;

export default function Header() {
  const { loaderDone, menuOpen, setMenuOpen } = useUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * SCROLL_REVEAL_VH);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Contacts/Menu erst beim Scrollen einblenden, damit sie den Hero-Titel
  // nicht überlappen; bei offenem Menü muss "close" sichtbar bleiben.
  const navVisible = loaderDone && (scrolled || menuOpen);

  const enterTransition = {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <header className="pointer-events-none fixed left-0 top-[20px] z-[150] w-full lg:top-[40px]">
      <div className="relative grid w-full grid-cols-[1fr_auto_1fr] items-start px-4 lg:px-12">
        <div
          className={`justify-self-start overflow-hidden ${
            navVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: navVisible ? 0 : "-100%" }}
            transition={{ ...enterTransition, delay: navVisible ? 0 : 0.1 }}
          >
            <HoverLink href={`mailto:${site.email}`} className={navTextClass}>
              contacts
            </HoverLink>
          </motion.div>
        </div>

        <div className="pointer-events-auto justify-self-center overflow-hidden">
          <motion.div
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
        </div>

        <div
          className={`justify-self-end overflow-hidden ${
            navVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: navVisible ? 0 : "-100%" }}
            transition={{ ...enterTransition, delay: navVisible ? 0.08 : 0 }}
          >
            <HoverButton
              className={`cursor-pointer ${navTextClass}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "close" : "menu"}
            </HoverButton>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
