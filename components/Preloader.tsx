"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useUI } from "./Providers";
import LogoText from "./LogoText";

export default function Preloader() {
  const { setLoaderDone } = useUI();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const doneTimer = window.setTimeout(() => setLoaderDone(true), 2300);
    const hideTimer = window.setTimeout(() => setVisible(false), 3200);
    return () => {
      window.clearTimeout(doneTimer);
      window.clearTimeout(hideTimer);
    };
  }, [setLoaderDone]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-red"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          exit={{ y: "-100%" }}
          transition={{ delay: 1.35, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-[min(70vw,520px)]"
            style={{ aspectRatio: "624 / 145" }}
          >
            <LogoText color="#000000" className="h-full w-full" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
