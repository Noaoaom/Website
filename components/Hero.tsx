"use client";

import {
  motion,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { heroMedia } from "@/lib/projects";
import { useUI } from "./Providers";
import MediaCover from "./ui/MediaCover";

type HeroContentProps = {
  y?: MotionValue<string>;
  scale?: MotionValue<number>;
};

export default function HeroContent({ y, scale }: HeroContentProps) {
  const { introComplete } = useUI();
  const ref = useRef<HTMLElement>(null);

  return (
    <section ref={ref} className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0 will-change-[transform,opacity]"
        style={{ y, scale, opacity: introComplete ? 1 : 0 }}
      >
        <MediaCover
          image={heroMedia.image}
          video={heroMedia.video}
          priority
          alt="Hero reel"
          handoffId="hero-reel"
        />
      </motion.div>
    </section>
  );
}
