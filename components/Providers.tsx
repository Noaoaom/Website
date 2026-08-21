"use client";

import { ReactLenis, useLenis } from "lenis/react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import MenuOverlay from "./MenuOverlay";
import Cursor from "./Cursor";
import ProjectTransition from "./ProjectTransition";
import VideoPreloadGate from "./VideoPreloadGate";
import type { MenuPanel } from "@/lib/menuPanels";
import {
  syncIntroReelEndState,
  useIntroReelMotion,
  type IntroReelMotion,
} from "./intro/useIntroReelMotion";

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
  mediaPreloadProgress: number;
  setMediaPreloadProgress: (v: number) => void;
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
  startProjectTransition: (slug: string, homeScrollY?: number) => void;
  finishProjectTransition: () => void;
  homeTransitionSlug: string | null;
  finishHomeTransition: () => void;
  returnToHome: () => void;
  reelMotion: IntroReelMotion;
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

    if (!introScrollEnabled) {
      window.scrollTo(0, 0);
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

/** Restores homepage scroll after returning from a project. */
function HomeScrollRestore({
  pendingHomeProjectSlug,
  homeReturnScroll,
  homeTransitionActive,
  onRestored,
}: {
  pendingHomeProjectSlug: string | null;
  homeReturnScroll: number | null;
  homeTransitionActive: boolean;
  onRestored: () => void;
}) {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (
      pathname !== "/" ||
      pendingHomeProjectSlug === null ||
      homeTransitionActive ||
      !lenis
    ) {
      return;
    }

    const slug = pendingHomeProjectSlug;
    const targetScroll = homeReturnScroll;
    let attempts = 0;
    let raf = 0;
    let cancelled = false;

    const restore = () => {
      lenis.resize();

      if (targetScroll != null) {
        lenis.scrollTo(targetScroll, { immediate: true, force: true });
        return Math.abs(lenis.scroll - targetScroll) < 2;
      }

      const el = document.querySelector(
        `[data-project-slug="${slug}"]`
      ) as HTMLElement | null;
      if (!el) return false;

      lenis.scrollTo(el, { immediate: true, force: true, offset: 0 });
      return true;
    };

    const tryRestore = () => {
      if (cancelled) return;

      const done = restore();
      attempts += 1;

      if (done || attempts >= 30) {
        onRestored();
        return;
      }

      raf = requestAnimationFrame(tryRestore);
    };

    tryRestore();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [
    pathname,
    pendingHomeProjectSlug,
    homeReturnScroll,
    homeTransitionActive,
    lenis,
    onRestored,
  ]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reelMotion = useIntroReelMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPanel, setMenuPanel] = useState<MenuPanel | null>(null);
  const [loaderDone, setLoaderDone] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [mediaPreloadProgress, setMediaPreloadProgress] = useState(0);
  const [introScrollEnabled, setIntroScrollEnabled] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introSequenceReady, setIntroSequenceReady] = useState(false);
  const [wordmarkRevealReady, setWordmarkRevealReady] = useState(false);
  const [projectTransitionSlug, setProjectTransitionSlug] = useState<string | null>(null);
  const [homeTransitionSlug, setHomeTransitionSlug] = useState<string | null>(null);
  const [pendingHomeProjectSlug, setPendingHomeProjectSlug] = useState<string | null>(null);
  const [pendingHomeScroll, setPendingHomeScroll] = useState<number | null>(null);
  const homeReturnProjectSlugRef = useRef<string | null>(null);
  const homeReturnScrollRef = useRef<number | null>(null);

  const startProjectTransition = useCallback((slug: string, homeScrollY?: number) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      homeReturnProjectSlugRef.current = slug;
      homeReturnScrollRef.current = homeScrollY ?? null;
    }
    setProjectTransitionSlug(slug);
  }, []);

  const finishProjectTransition = useCallback(() => {
    setProjectTransitionSlug(null);
  }, []);

  const finishHomeTransition = useCallback(() => {
    setHomeTransitionSlug(null);
  }, []);

  const returnToHome = useCallback(() => {
    const slug = homeReturnProjectSlugRef.current;
    setPendingHomeProjectSlug(slug);
    setPendingHomeScroll(homeReturnScrollRef.current);

    if (!slug) {
      router.push("/", { scroll: false });
      return;
    }

    setHomeTransitionSlug(slug);
  }, [router]);

  const clearPendingHomeProject = useCallback(() => {
    setPendingHomeProjectSlug(null);
    setPendingHomeScroll(null);
  }, []);

  useEffect(() => {
    if (!introComplete) return;
    syncIntroReelEndState(reelMotion);
  }, [introComplete, reelMotion]);

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
      mediaPreloadProgress,
      setMediaPreloadProgress,
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
      homeTransitionSlug,
      finishHomeTransition,
      returnToHome,
      reelMotion,
    }),
    [
      menuOpen,
      menuPanel,
      openMenuPanel,
      closeMenuPanel,
      closeMenu,
      loaderDone,
      preloaderActive,
      mediaPreloadProgress,
      introScrollEnabled,
      introComplete,
      introSequenceReady,
      wordmarkRevealReady,
      projectTransitionSlug,
      startProjectTransition,
      finishProjectTransition,
      homeTransitionSlug,
      finishHomeTransition,
      returnToHome,
      reelMotion,
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
        <HomeScrollRestore
          pendingHomeProjectSlug={pendingHomeProjectSlug}
          homeReturnScroll={pendingHomeScroll}
          homeTransitionActive={homeTransitionSlug !== null}
          onRestored={clearPendingHomeProject}
        />
        {children}
      </ReactLenis>
      <Header />
      <MenuOverlay />
      <ProjectTransition />
      <VideoPreloadGate />
      <Cursor />
    </UIContext.Provider>
  );
}
