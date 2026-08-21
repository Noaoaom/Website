const DEFAULT_VIDEO_TIMEOUT_MS = 20000;

function preloadVideoWithProgress(
  src: string,
  onProgress: (ratio: number) => void,
  timeoutMs = DEFAULT_VIDEO_TIMEOUT_MS
): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeEventListener("progress", report);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("canplaythrough", markReady);
      video.removeEventListener("error", finish);
      onProgress(1);
      video.src = "";
      video.load();
      resolve();
    };

    const report = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        onProgress(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? 0.35 : 0);
        return;
      }

      let bufferedEnd = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        bufferedEnd = Math.max(bufferedEnd, video.buffered.end(i));
      }
      onProgress(Math.min(1, bufferedEnd / video.duration));
    };

    const markReady = () => {
      onProgress(1);
      finish();
    };

    const timer = window.setTimeout(finish, timeoutMs);
    video.addEventListener("progress", report);
    video.addEventListener("canplay", markReady, { once: true });
    video.addEventListener("canplaythrough", markReady, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.src = src;
    video.load();
    report();
  });
}

/** Preload images into the browser cache. */
export function preloadImages(urls: string[]) {
  urls.forEach((src) => {
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
  });
}

/** Buffer all videos in parallel and report aggregate progress (0–100). */
export async function preloadVideosWithProgress(
  urls: string[],
  onProgress: (percent: number) => void,
  timeoutMs = DEFAULT_VIDEO_TIMEOUT_MS
) {
  if (urls.length === 0) {
    onProgress(100);
    return;
  }

  const ratios = urls.map(() => 0);
  const publish = () => {
    const avg = ratios.reduce((sum, value) => sum + value, 0) / urls.length;
    onProgress(Math.min(100, Math.round(avg * 100)));
  };

  publish();

  await Promise.all(
    urls.map((src, index) =>
      preloadVideoWithProgress(
        src,
        (ratio) => {
          ratios[index] = ratio;
          publish();
        },
        timeoutMs
      )
    )
  );

  onProgress(100);
}
