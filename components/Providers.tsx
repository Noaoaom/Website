"use client";

import { ReactLenis, useLenis } from "lenis/react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Header from "./Header";
import MenuOverlay from "./MenuOverlay";
import Cursor from "./Cursor";
import ProjectTransition from "./ProjectTransition";
import type { MenuPanel } from "@/lib/menuPanels";

type UIState = {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  menuPanel: MenuPanel | null;
  openMenuPanel: (panel: MenuPanel) => void;
  closeMenuPanel: () => void;
  closeMenu: () => void;
  loaderDone: boolean;
  setLoaderDone: (v: boolean) => void;
  preloaderActive: boolean;
  setPreloaderActive: (v: boolean) => void;
  introScrollEnabled: boolean;
  setIntroScrollEnabled: (v: boolean) => void;
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;
  /** Hero/intro media buffered — intro animation waits for this. */
  introSequenceReady: boolean;
  setIntroSequenceReady: (v: boolean) => void;
  /** Final hero typography active before the fullscreen reveal starts. */
  wordmarkRevealReady: boolean;
  setWordmarkRevealReady: (v: boolean) => void;
  /** Slug of project currently in carousel transition. */
  projectTransitionSlug: string | null;
  startProjectTransition: (slug: string) => void;
  finishProjectTransition: () => void;
};

const UIContext = createContext<UIState | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <Providers>");
  return ctx;
}

function LenisScrollBridge() {
  useLenis(() => {
    // Keeps scroll-driven Motion hooks in sync with Lenis.
  });
  return null;
}

/** Blocks scroll until the intro animation finished, then allows scroll. */
function LenisIntroLock() {
  const { introScrollEnabled } = useUI();
  const lenis = useLenis();

  useEffect(() => {
    if (introScrollEnabled) return;

    const blockScroll = (event: Event) => {
      event.preventDefault();
    };

    const blockKeys = (event: KeyboardEvent) => {
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(event.key)) event.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeys);

    return () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [introScrollEnabled]);

  useEffect(() => {
    if (!lenis) return;

    window.scrollTo(0, 0);

    if (!introScrollEnabled) {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
      return;
    }

    lenis.start();
    requestAnimationFrame(() => {
      lenis.resize();
    });
  }, [lenis, introScrollEnabled]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPanel, setMenuPanel] = useState<MenuPanel | null>(null);
  const [loaderDone, setLoaderDone] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [introScrollEnabled, setIntroScrollEnabled] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introSequenceReady, setIntroSequenceReady] = useState(false);
  const [wordmarkRevealReady, setWordmarkRevealReady] = useState(false);
  const [projectTransitionSlug, setProjectTransitionSlug] = useState<string | null>(null);

  const startProjectTransition = useCallback((slug: string) => {
    setProjectTransitionSlug(slug);
  }, []);

  const finishProjectTransition = useCallback(() => {
    setProjectTransitionSlug(null);
  }, []);

  const openMenuPanel = useCallback((panel: MenuPanel) => {
    setMenuPanel(panel);
  }, []);

  const closeMenuPanel = useCallback(() => {
    setMenuPanel(null);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuPanel(null);
  }, []);

  const value = useMemo(
    () => ({
      menuOpen,
      setMenuOpen,
      menuPanel,
      openMenuPanel,
      closeMenuPanel,
      closeMenu,
      loaderDone,
      setLoaderDone,
      preloaderActive,
      setPreloaderActive,
      introScrollEnabled,
      setIntroScrollEnabled,
      introComplete,
      setIntroComplete,
      introSequenceReady,
      setIntroSequenceReady,
      wordmarkRevealReady,
      setWordmarkRevealReady,
      projectTransitionSlug,
      startProjectTransition,
      finishProjectTransition,
    }),
    [
      menuOpen,
      menuPanel,
      openMenuPanel,
      closeMenuPanel,
      closeMenu,
      loaderDone,
      preloaderActive,
      introScrollEnabled,
      introComplete,
      introSequenceReady,
      wordmarkRevealReady,
      projectTransitionSlug,
      startProjectTransition,
      finishProjectTransition,
    ]
  );

  return (
    <UIContext.Provider value={value}>
      <ReactLenis
        root
        options={{
          lerp: 0.12,
          smoothWheel: true,
          wheelMultiplier: 0.72,
          touchMultiplier: 1,
          syncTouch: true,
          syncTouchLerp: 0.12,
          touchInertiaExponent: 1.8,
        }}
      >
        <LenisScrollBridge />
        <LenisIntroLock />
        {children}
      </ReactLenis>
      <Header />
      <MenuOverlay />
      <ProjectTransition />
      <Cursor />
    </UIContext.Provider>
  );
}
