import { heroMedia, projects } from "./projects";

/** All showcase video URLs for early browser preload. */
export function getPreloadVideoUrls(): string[] {
  const urls = new Set<string>();
  if (heroMedia.video) urls.add(heroMedia.video);
  for (const project of projects) {
    if (project.video) urls.add(project.video);
  }
  return [...urls];
}
