"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type LogoSpriteProps = {
  className?: string;
  color?: string;
};

export default function LogoSprite({
  className = "",
  color = "#D60001",
}: LogoSpriteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 400], [0.6, 1]);
  const opacity = useTransform(scrollY, [0, 120, 400], [0, 1, 1]);
  const y = useTransform(scrollY, [0, 400], ["2dvh", "0dvh"]);

  return (
    <motion.div
      ref={ref}
      className={`fixed left-1/2 top-[2dvh] origin-top ${className}`}
      style={{
        scale,
        opacity,
        y,
        x: "-50%",
      }}
    >
      <div className="group pointer-events-auto relative flex h-full w-full items-center justify-center">
        <div
          className="logo-sprite aspect-[800/512] h-full"
          style={{
            backgroundColor: color,
            WebkitMaskImage: "url(/logo-mark.svg)",
            maskImage: "url(/logo-mark.svg)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>
    </motion.div>
  );
}
