/** Slow start (first 80% scroll), accelerated finish (last 20%). */
export function easeZoom(t: number): number {
  const split = 0.8;

  if (t <= split) {
    const p = t / split;
    return p * p * p * 0.62;
  }

  const p = (t - split) / (1 - split);
  return 0.62 + Math.pow(p, 0.75) * 0.38;
}

export function cropInsetFromVisible(visible: number): string {
  const clamped = Math.min(Math.max(visible, 0), 1);
  const inset = ((1 - clamped) / 2) * 100;
  return `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
}

/** Vertical-only crop (full width, height controlled by visible fraction). */
export function cropInsetVertical(visibleHeight: number): string {
  const clamped = Math.min(Math.max(visibleHeight, 0), 1);
  const insetY = ((1 - clamped) / 2) * 100;
  return `inset(${insetY}% 0% ${insetY}% 0%)`;
}

/** Horizontal-only crop (full height, width controlled by visible fraction). */
export function cropInsetHorizontal(visibleWidth: number): string {
  const clamped = Math.min(Math.max(visibleWidth, 0), 1);
  const insetX = ((1 - clamped) / 2) * 100;
  return `inset(0% ${insetX}% 0% ${insetX}%)`;
}
