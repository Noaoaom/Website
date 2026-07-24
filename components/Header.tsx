"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useUI } from "./Providers";
import LogoText from "./LogoText";
import HoverLink, { HoverButton } from "./ui/HoverLink";

const navTextClass =
  "font-ivar text-[21px] uppercase leading-tight md:text-[30px] md:leading-none";

/**
 * Die erste Projekt-Section bedeckt beim Scrollen genau `scrollY` Pixel des
 * Viewports — 0.7 = Nav erscheint, wenn sie ~70% des Bildschirms einnimmt
 * und der Dickhausen-Titel verdeckt ist.
 */
const SCROLL_REVEAL_VH = 0.7;

const navClipClass = "overflow-hidden py-3 -my-3 md:py-2 md:-my-2";

export default function Header() {
  const { loaderDone, menuOpen, setMenuOpen, closeMenu } = useUI();
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
    <header className="pointer-events-none fixed left-0 top-0 z-[150] w-full pt-[max(20px,env(safe-area-inset-top,0px))] lg:pt-[max(40px,env(safe-area-inset-top,0px))]">
      <div className="relative grid w-full grid-cols-[1fr_auto_1fr] items-start px-4 lg:px-12">
        <div
          className={`justify-self-start ${navClipClass} ${
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

        <div className={`pointer-events-auto justify-self-center ${navClipClass}`}>
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
          className={`justify-self-end ${navClipClass} ${
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
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            >
              {menuOpen ? "close" : "menu"}
            </HoverButton>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
