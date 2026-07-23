import type { Metadata } from "next";
import ImpressumPage from "@/components/ImpressumPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Impressum | ${site.name}`,
  description: `Impressum und rechtliche Angaben — ${site.name}.`,
};

export default function Page() {
  return <ImpressumPage />;
}
