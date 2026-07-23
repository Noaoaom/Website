import ContactsContent from "@/components/menu/ContactsContent";

export default function ContactsPage() {
  return (
    <main className="relative min-h-dvh overflow-x-clip bg-black px-4 pb-20 pt-[120px] text-brand-red lg:px-12">
      <ContactsContent variant="page" />
    </main>
  );
}
