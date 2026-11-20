/** Viewport rect the click-in window grows from (the clicked media panel). */
export type TransitionOrigin = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Top of the full-size media layer, so the video stays put while growing. */
  mediaTop: number;
};

/** Visible rect of a clip-path `inset(...%)` media layer, in viewport px. */
export function measureClippedMedia(el: HTMLElement): TransitionOrigin {
  const rect = el.getBoundingClientRect();
  const inset = (el.style.clipPath.match(/-?[\d.]+(?=%)/g) ?? []).map(Number);
  const [t = 0, r = t, b = t, l = r] = inset;
  return {
    left: rect.left + (rect.width * l) / 100,
    top: rect.top + (rect.height * t) / 100,
    width: rect.width * (1 - (l + r) / 100),
    height: rect.height * (1 - (t + b) / 100),
    mediaTop: rect.top,
  };
}

export const PROJECT_TRANSITION = {
  /** Snappier timings for the click into a project (red window → video). */
  forward: {
    slotOpenS: 0.35,
    cropInS: 0.35,
    /** Red-only beat before the clicked video crops in. */
    videoDelayS: 0.2,
    revealS: 0.7,
    revealHorizontalDelayS: 0.04,
  },
  slotOpenS: 0.65,
  projectBeatMs: 45,
  cropInS: 0.55,
  revealS: 0.8,
  revealHorizontalDelayS: 0.22,
  navigateAtReveal: 0.55,
  overlayFadeMs: 350,
  /** Max wait for the project page video before the overlay fades anyway. */
  pageReadyMaxWaitMs: 2500,
  /** MediaCover's own video fade-in, waited out before the overlay fades. */
  pageVideoFadeMs: 320,
  ease: [0.22, 1, 0.36, 1] as const,
} as const;
