"use client";

import { motion, useMotionValue } from "motion/react";
import { useEffect } from "react";
import { useFinePointer } from "./hooks";

export default function Cursor() {
  const finePointer = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (!finePointer) return;

    document.documentElement.classList.add("has-custom-cursor");
    return () => document.documentElement.classList.remove("has-custom-cursor");
  }, [finePointer]);

  useEffect(() => {
    if (!finePointer) return;

    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [finePointer, x, y]);

  if (!finePointer) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{ x, y }}
    >
      <div className="absolute -ml-[5px] -mt-[5px] h-[10px] w-[10px] rounded-full bg-white ring-1 ring-white/30 mix-blend-difference" />
    </motion.div>
  );
}
