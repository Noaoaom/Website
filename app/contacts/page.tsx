import type { Metadata } from "next";
import ContactsPage from "@/components/ContactsPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contacts | ${site.name}`,
  description: `Contact ${site.name} — project inquiries and social.`,
};

export default function Page() {
  return <ContactsPage />;
}
