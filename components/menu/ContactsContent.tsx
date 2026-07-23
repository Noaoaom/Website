import HoverLink, { HoverButton } from "@/components/ui/HoverLink";
import InstagramLink from "@/components/ui/InstagramLink";
import { site } from "@/lib/site";

type ContactsContentProps = {
  variant: "menu" | "page";
  onBack?: () => void;
};

export default function ContactsContent({ variant, onBack }: ContactsContentProps) {
  const isMenu = variant === "menu";

  return (
    <div
      className={`mx-auto flex w-full max-w-3xl flex-col gap-12 ${
        isMenu ? "text-black" : "text-brand-red"
      }`}
    >
      <div className="flex flex-col gap-6">
        {isMenu ? (
          <HoverButton
            className="font-helvetica text-[15px] uppercase md:text-[21px]"
            underline={false}
            onClick={onBack}
          >
            Back
          </HoverButton>
        ) : (
          <HoverLink
            href="/"
            className="font-helvetica text-[15px] uppercase md:text-[21px]"
            underline={false}
          >
            Back
          </HoverLink>
        )}
        <h1 className="font-ivar text-[48px] uppercase leading-[0.85] md:text-[80px]">
          Contacts
        </h1>
      </div>

      <div className="flex flex-col gap-12 md:flex-row md:gap-24">
        <div className="flex flex-col gap-3 md:gap-4">
          <span className="block font-ivar text-[32px] uppercase leading-none md:text-[45px]">
            Contacts
          </span>
          <HoverLink
            href={`mailto:${site.email}`}
            className="font-helvetica text-[15px] uppercase md:text-[21px]"
          >
            {site.email}
          </HoverLink>
        </div>

        <div className="flex flex-col items-start gap-3 md:gap-4">
          <span className="block font-ivar text-[32px] uppercase leading-none md:text-[45px]">
            Social
          </span>
          <InstagramLink className="font-helvetica text-[15px] uppercase md:text-[21px]" />
        </div>
      </div>
    </div>
  );
}
