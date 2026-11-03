/**
 * Keeps one video running continuously across the click-in transition:
 * panel on the home page → transition overlay → project page. Each new
 * <video> for the same src seeks to where playback would be by now instead
 * of restarting at 0.
 */
type Handoff = { src: string; time: number; at: number };

/** Long enough to cover the transition, short enough not to leak into later visits. */
const MAX_AGE_MS = 6000;

let current: Handoff | null = null;

export function startVideoHandoff(src: string, time = 0) {
  current = { src, time, at: performance.now() };
}

/** Expected playback position (seconds) for `src`, or null if no handoff is active. */
export function getVideoHandoffTime(src: string): number | null {
  if (!current || current.src !== src) return null;
  const age = performance.now() - current.at;
  if (age > MAX_AGE_MS) {
    current = null;
    return null;
  }
  return current.time + age / 1000;
}

export function endVideoHandoff(src: string) {
  if (current?.src === src) current = null;
}
