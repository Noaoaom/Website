"use client";

import {
  motion,
  useTransform,
  type MotionValue,
} from "motion/react";

/** 1.3 = 30% slower transition. */
export const TEXT_TRANSITION_SPEED = 1.3;

type ScrollRevealTextProps = {
  text: string;
  enterProgress: MotionValue<number>;
  exitProgress: MotionValue<number>;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  /** How much of the available delay range is used for stagger (0–1). */
  stagger?: number;
  travelEm?: number;
  speed?: number;
};

function easeFade(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}

function ScrollChar({
  char,
  index,
  total,
  enterProgress,
  exitProgress,
  stagger,
  travelEm,
  speed,
}: {
  char: string;
  index: number;
  total: number;
  enterProgress: MotionValue<number>;
  exitProgress: MotionValue<number>;
  stagger: number;
  travelEm: number;
  speed: number;
}) {
  /** Per-char reveal length — ensures last letter finishes when enter = 1. */
  const enterSpan = 0.38 * speed;
  const exitSpan = 0.32 * speed;
  const maxEnterDelay = Math.max(0, 1 - enterSpan);
  const maxExitDelay = Math.max(0, 1 - exitSpan);
  const enterDelay =
    total <= 1 ? 0 : (index / (total - 1)) * maxEnterDelay * stagger;
  const exitDelay =
    total <= 1 ? 0 : (index / (total - 1)) * maxExitDelay * stagger * 0.75;

  const charState = (enter: number, exit: number) => {
    const inT = easeFade(clamp01((enter - enterDelay) / enterSpan));
    const outT = easeFade(clamp01((exit - exitDelay) / exitSpan));
    return { inT, outT };
  };

  const opacity = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) => {
      const { inT, outT } = charState(enter, exit);
      return inT * (1 - outT);
    }
  );

  const y = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) => {
      const { inT, outT } = charState(enter, exit);
      const enterY = (1 - inT) * travelEm;
      const exitY = outT * -travelEm * 0.65;
      return `${enterY + exitY}em`;
    }
  );

  if (char === " ") {
    return <span>&nbsp;</span>;
  }

  return (
    <span className="inline-block overflow-hidden align-bottom leading-none">
      <motion.span
        className="inline-block will-change-[transform,opacity]"
        style={{ opacity, y }}
      >
        {char}
      </motion.span>
    </span>
  );
}

export default function ScrollRevealText({
  text,
  enterProgress,
  exitProgress,
  className = "",
  as: Tag = "span",
  stagger = 0.72,
  travelEm = 0.38,
  speed = TEXT_TRANSITION_SPEED,
}: ScrollRevealTextProps) {
  const words = text.split(" ").filter(Boolean);
  let charIndex = 0;
  const totalChars = text.replace(/\s/g, "").length;

  return (
    <Tag className={`leading-none ${className}`}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block">
          <span className="inline-flex items-end whitespace-nowrap">
            {Array.from(word).map((char) => {
              const index = charIndex++;
              return (
                <ScrollChar
                  key={`${wi}-${index}`}
                  char={char}
                  index={index}
                  total={totalChars}
                  enterProgress={enterProgress}
                  exitProgress={exitProgress}
                  stagger={stagger}
                  travelEm={travelEm}
                  speed={speed}
                />
              );
            })}
          </span>
          {wi < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </Tag>
  );
}
