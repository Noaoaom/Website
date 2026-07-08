"use client";

import { ReactLenis, useLenis } from "lenis/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Header from "./Header";
import MenuOverlay from "./MenuOverlay";
import Cursor from "./Cursor";

type UIState = {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  loaderDone: boolean;
  setLoaderDone: (v: boolean) => void;
  preloaderActive: boolean;
  setPreloaderActive: (v: boolean) => void;
  introScrollEnabled: boolean;
  setIntroScrollEnabled: (v: boolean) => void;
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;
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
  const [loaderDone, setLoaderDone] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [introScrollEnabled, setIntroScrollEnabled] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const value = useMemo(
    () => ({
      menuOpen,
      setMenuOpen,
      loaderDone,
      setLoaderDone,
      preloaderActive,
      setPreloaderActive,
      introScrollEnabled,
      setIntroScrollEnabled,
      introComplete,
      setIntroComplete,
    }),
    [menuOpen, loaderDone, preloaderActive, introScrollEnabled, introComplete]
  );

  return (
    <UIContext.Provider value={value}>
      <ReactLenis
        root
        options={{
          lerp: 0.03,
          smoothWheel: true,
          wheelMultiplier: 0.38,
          touchMultiplier: 0.72,
          syncTouch: true,
          syncTouchLerp: 0.035,
          touchInertiaExponent: 2.2,
        }}
      >
        <LenisScrollBridge />
        <LenisIntroLock />
        {children}
      </ReactLenis>
      <Header />
      <MenuOverlay />
      <Cursor />
    </UIContext.Provider>
  );
}
