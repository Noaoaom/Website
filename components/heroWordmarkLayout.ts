/** Fixed hero end-state for intro wordmarks (transition animates toward this). */
export const HERO_WORDMARK = {
  insetBlockStart: "0.12em",
  insetBlockEnd: "0.12em",
  insetInline: "0.12em",
  fontSize: "clamp(21px, 14vw, 19vw)",
} as const;

/** Preloader: Dickhausen from left, Studio from right → center stack. */
export const WORDMARK_INTRO = {
  slideInDuration: 0.7,
  centerHoldMs: 80,
} as const;

export const WORDMARK_INTRO_TOTAL_MS =
  WORDMARK_INTRO.slideInDuration * 1000 + WORDMARK_INTRO.centerHoldMs;
