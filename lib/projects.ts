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
  /** Client / brand name shown in the top curtain. */
  client: string;
  /** Two digit index shown in the side curtain. */
  number: string;
  /** Poster image — replace with your own artwork (any aspect, it is cropped full-bleed). */
  image: string;
  /** Optional looping preview video (mp4/webm). Leave undefined to use the image only. */
  video?: string;
  /** Section background: curtains + frame color alternate between black and red. */
  theme: "black" | "red";
  credits: Credit[];
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    subtitle: "A short film tagline",
    client: "Client One",
    number: "01",
    image: "/placeholders/project-1.svg",
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
    title: "Project Two",
    subtitle: "Another project tagline",
    client: "Client Two",
    number: "02",
    image: "/placeholders/project-2.svg",
    theme: "red",
    credits: [
      { role: "Director", name: "Name Surname" },
      { role: "DOP", name: "Name Surname" },
      { role: "Production", name: "Studio Name" },
    ],
  },
  {
    slug: "project-three",
    title: "The Third Chapter",
    subtitle: "A defining fashion film",
    client: "Client Three",
    number: "03",
    image: "/placeholders/project-3.svg",
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
