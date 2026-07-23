"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { MENU_CURTAIN_TRANSITION } from "@/lib/menuPanels";
import { site } from "@/lib/site";
import MenuPanelView from "./menu/MenuPanelView";
import { useUI } from "./Providers";
import { HoverButton } from "./ui/HoverLink";
import RevealText from "./ui/RevealText";

const itemMotion = (index: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: 0.08 * index + 0.15,
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

export default function MenuOverlay() {
  const {
    menuOpen,
    menuPanel,
    openMenuPanel,
    closeMenuPanel,
    closeMenu,
    introScrollEnabled,
  } = useUI();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || !menuOpen) return;

    lenis.stop();
    return () => {
      if (introScrollEnabled) lenis.start();
    };
  }, [lenis, menuOpen, introScrollEnabled]);

  useEffect(() => {
    if (!menuOpen || menuPanel === "impressum") return;

    const blockScroll = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
  }, [menuOpen, menuPanel]);

  return (
    <AnimatePresence>
      {menuOpen ? (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[3000] overflow-hidden bg-black text-brand-red"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={MENU_CURTAIN_TRANSITION}
        >
          <div className="flex h-dvh flex-col overflow-hidden px-4 pb-12 pt-[100px] md:pt-[120px] lg:px-12">
            <HoverButton
              className="mb-6 font-helvetica text-[15px] uppercase md:mb-8 md:text-[21px]"
              underline={false}
              onClick={closeMenu}
            >
              Back
            </HoverButton>

            <div className="mb-8 flex flex-col md:mb-10">
              <RevealText
                as="h2"
                text={site.wordmark.left}
                className="font-ivar text-[48px] uppercase leading-[0.85] md:text-[64px] lg:text-[72px]"
              />
              <RevealText
                as="span"
                text={site.wordmark.right}
                className="font-ivar text-[48px] uppercase leading-[0.3] md:text-[64px] lg:text-[72px]"
                delay={0.18}
              />
            </div>

            <ul className="flex flex-col gap-1 md:gap-2">
              {site.menu.links.map((link, index) => (
                <motion.li key={link.panel} {...itemMotion(index)}>
                  <button
                    type="button"
                    className="group flex w-full flex-col gap-2 border-t border-brand-red/20 py-3 text-left transition-colors hover:border-brand-red md:flex-row md:items-end md:justify-between md:py-4"
                    onClick={() => openMenuPanel(link.panel)}
                  >
                    <span className="font-helvetica text-[15px] uppercase md:text-[21px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-ivar text-[32px] uppercase leading-none transition-transform duration-500 group-hover:translate-x-2 md:text-[48px] lg:text-[52px]">
                      {link.label}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>

          <AnimatePresence>
            {menuPanel ? (
              <motion.div
                key={menuPanel}
                data-lenis-prevent
                className="absolute inset-0 z-10 overflow-hidden bg-brand-red text-black pointer-events-auto"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={MENU_CURTAIN_TRANSITION}
              >
                <div
                  className={`h-full px-4 pb-12 pt-[100px] md:pt-[120px] lg:px-12 ${
                    menuPanel === "impressum"
                      ? "overflow-y-auto overscroll-contain no-scrollbar"
                      : "overflow-hidden"
                  }`}
                >
                  <MenuPanelView panel={menuPanel} onBack={closeMenuPanel} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
