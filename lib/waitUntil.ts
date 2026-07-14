/** Resolve once `ready()` is true, or after `maxMs` (never reject). */
export function waitUntil(
  ready: () => boolean,
  maxMs = 12000,
  pollMs = 50
): Promise<void> {
  return new Promise((resolve) => {
    if (ready()) {
      resolve();
      return;
    }

    const started = performance.now();
    const tick = () => {
      if (ready() || performance.now() - started >= maxMs) {
        resolve();
        return;
      }
      window.setTimeout(tick, pollMs);
    };
    tick();
  });
}
