import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `About me | ${site.name}`,
  description: `About ${site.name} — direction, video and production.`,
};

export default function Page() {
  return <AboutPage />;
}
