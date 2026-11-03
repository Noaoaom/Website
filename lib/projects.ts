export type Credit = {
  role: string;
  name: string;
};

export type Project = {
  slug: string;
  /** Big serif headline shown over the media. */
  title: string;
  /** Short tagline shown under the headline. */
  subtitle: string;
  /** Optional link for the subtitle (e.g. Instagram credit). */
  subtitleHref?: string;
  /** Display title in a project-specific face instead of the site sans. */
  titleFont?: "aston-script" | "drowner";
  /** Optional logo shown instead of the title (brand red via CSS mask). */
  titleLogo?: string;
  /** Client / brand name shown in the top curtain. */
  client: string;
  /** Two digit index shown in the side curtain. */
  number: string;
  /** Poster image — replace with your own artwork (any aspect, it is cropped full-bleed). */
  image: string;
  /** Optional looping preview video (mp4/webm). Leave undefined to use the image only. */
  video?: string;
  /** Vertical (9:16) media — shown full-frame with blurred side fill. */
  mediaAspect?: "portrait";
  /** Section background: curtains + frame color alternate between black and red. */
  theme: "black" | "red";
  credits: Credit[];
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Fine Dining",
    subtitle: "with @ZoranPingel",
    subtitleHref: "https://www.instagram.com/zoranpingel/",
    titleFont: "aston-script",
    client: "@zoranpingel",
    number: "01",
    image: "/placeholders/project-1.svg",
    video: "/Videos/Dining-web.mp4",
    theme: "black",
    credits: [
      { role: "Director", name: "Name Surname" },
      { role: "DOP", name: "Name Surname" },
      { role: "Production", name: "Studio Name" },
      { role: "Editing", name: "Name Surname" },
    ],
  },
  {
    slug: "project-two",
    title: "IDC",
    subtitle: "with @youngboypiet",
    subtitleHref: "https://www.instagram.com/youngboypiet/",
    titleFont: "drowner",
    client: "YBP",
    number: "02",
    image: "/placeholders/project-2.svg",
    video: "/Videos/YBP-web.mp4",
    theme: "red",
    credits: [
      { role: "Director", name: "Name Surname" },
      { role: "DOP", name: "Name Surname" },
      { role: "Production", name: "Studio Name" },
    ],
  },
  {
    slug: "project-three",
    title: "Artclub",
    subtitle: "x Amano",
    titleLogo: "/logos/artclub-logo-new-r-light.png",
    client: "Artclub",
    number: "03",
    image: "/placeholders/project-3.svg",
    video: "/Videos/Artclub-web.mp4",
    mediaAspect: "portrait",
    theme: "black",
    credits: [
      { role: "Director", name: "Name Surname" },
      { role: "DOP", name: "Name Surname" },
      { role: "Styling", name: "Name Surname" },
      { role: "Production", name: "Studio Name" },
    ],
  },
  {
    slug: "project-four",
    title: "Quattro",
    subtitle: "Heritage brand film",
    client: "Client Four",
    number: "04",
    image: "/placeholders/project-4.svg",
    theme: "red",
    credits: [
      { role: "Director", name: "Name Surname" },
      { role: "DOP", name: "Name Surname" },
      { role: "Production", name: "Studio Name" },
    ],
  },
  {
    slug: "project-five",
    title: "The Fifth House",
    subtitle: "A campaign story",
    client: "Client Five",
    number: "05",
    image: "/placeholders/project-5.svg",
    theme: "black",
    credits: [
      { role: "Director", name: "Name Surname" },
      { role: "DOP", name: "Name Surname" },
      { role: "Music", name: "Name Surname" },
      { role: "Production", name: "Studio Name" },
    ],
  },
];

export const heroMedia = {
  /** Full-screen reel behind the landing view. */
  image: "/placeholders/hero.svg",
  video: "/Videos/Blitz-web.mp4",
};

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}

export function getProjectMediaProps(
  project: Pick<Project, "mediaAspect">
): { fit: "cover" | "contain"; portrait: boolean } {
  if (project.mediaAspect === "portrait") {
    return { fit: "contain", portrait: true };
  }
  return { fit: "cover", portrait: false };
}

export function getProjectTitleClassName(
  project: Pick<Project, "titleFont">,
  variant: "section" | "detail"
) {
  if (project.titleFont === "aston-script") {
    return variant === "section"
      ? "font-aston text-[56px] normal-case leading-[1.12] text-brand-red md:text-[96px] lg:text-[112px]"
      : "font-aston text-[64px] normal-case leading-[1.12] text-brand-red md:text-[104px] lg:text-[128px]";
  }

  if (project.titleFont === "drowner") {
    return variant === "section"
      ? "font-drowner text-[48px] uppercase leading-[1.05] text-brand-red md:text-[84px] lg:text-[108px]"
      : "font-drowner text-[56px] uppercase leading-[1.05] text-brand-red md:text-[96px] lg:text-[120px]";
  }

  return variant === "section"
    ? "font-ivar text-[40px] uppercase leading-[0.85] text-brand-red md:text-[72px] lg:text-[100px]"
    : "font-ivar text-[48px] uppercase leading-[0.85] text-brand-red md:text-[80px] lg:text-[110px]";
}
