"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import ProjectTitleLogo from "./ProjectTitleLogo";

type ScrollRevealLogoProps = {
  src: string;
  alt: string;
  enterProgress: MotionValue<number>;
  exitProgress: MotionValue<number>;
  className?: string;
  speed?: number;
};

function easeFade(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export default function ScrollRevealLogo({
  src,
  alt,
  enterProgress,
  exitProgress,
  className = "",
  speed = 1.3,
}: ScrollRevealLogoProps) {
  const opacity = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) => {
      const inT = easeFade(Math.min(Math.max(enter / (0.5 * speed), 0), 1));
      const outT = easeFade(Math.min(Math.max(exit / (0.45 * speed), 0), 1));
      return inT * (1 - outT);
    }
  );

  const y = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) => {
      const inT = easeFade(Math.min(Math.max(enter / (0.5 * speed), 0), 1));
      const outT = easeFade(Math.min(Math.max(exit / (0.45 * speed), 0), 1));
      return `${(1 - inT) * 0.35 + outT * -0.25}em`;
    }
  );

  return (
    <motion.div
      className="flex w-full justify-center will-change-[transform,opacity]"
      style={{ opacity, y }}
    >
      <ProjectTitleLogo src={src} alt={alt} className={className} />
    </motion.div>
  );
}
