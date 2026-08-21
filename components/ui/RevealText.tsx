"use client";

import {
  motion,
  useInView,
  type Variants,
} from "motion/react";
import { useRef } from "react";

type RevealTextProps = {
  text: string;
  className?: string;
  /** Delay before the reveal starts (seconds). */
  delay?: number;
  /** Stagger between characters (seconds). */
  stagger?: number;
  /** If true, split on spaces and keep word groups on one line. */
  byWord?: boolean;
  once?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  /** Per-char overflow clip — disable for display/script fonts with tall glyphs. */
  clipChars?: boolean;
};

const charVariants: Variants = {
  hidden: { y: "200%", opacity: 0 },
  visible: { y: "0%", opacity: 1 },
};

export default function RevealText({
  text,
  className = "",
  delay = 0,
  stagger = 0.025,
  byWord = true,
  once = true,
  as: Tag = "span",
  clipChars = true,
}: RevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });

  const words = byWord ? text.split(" ") : [text];

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block">
          <span
            className={
              clipChars
                ? "inline-flex items-baseline whitespace-nowrap overflow-hidden px-[0.1em] -mx-[0.1em] py-[0.35em] -my-[0.35em] leading-[1.1]"
                : "inline-flex items-baseline whitespace-nowrap overflow-visible px-[0.1em] -mx-[0.1em] py-[0.45em] -my-[0.45em] leading-[1.15]"
            }
          >
            {Array.from(word).map((char, ci) => (
              <span
                key={`${wi}-${ci}`}
                className={clipChars ? "inline-block overflow-hidden" : "inline-block overflow-visible"}
              >
                <motion.span
                  className="inline-block will-change-transform"
                  variants={charVariants}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: delay + (wi * word.length + ci) * stagger,
                  }}
                >
                  {char}
                </motion.span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </Tag>
  );
}
