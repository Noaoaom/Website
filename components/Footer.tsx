import { site } from "@/lib/site";
import HoverLink from "./ui/HoverLink";

type FooterProps = {
  theme?: "black" | "red";
};

export default function Footer({ theme = "red" }: FooterProps) {
  const isRed = theme === "red";
  const bg = isRed ? "#D60001" : "#000000";
  const fg = isRed ? "#000000" : "#D60001";

  return (
    <footer
      className="relative z-30 mt-[-15dvh] flex h-auto w-full flex-col justify-between overflow-hidden px-6 py-8 transition-colors duration-700 lg:px-12"
      style={{ backgroundColor: bg, color: fg }}
    >
      <div className="flex w-full flex-col items-center justify-around gap-8 md:flex-row md:items-start">
        <div className="flex flex-col gap-2 text-center md:gap-4">
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

        <div className="flex flex-col gap-2 text-center md:gap-4">
          <span className="block font-ivar text-[32px] uppercase leading-none md:text-[45px]">
            Social
          </span>
          <HoverLink
            href={site.instagram.url}
            className="font-helvetica text-[15px] uppercase md:text-[21px]"
          >
            {site.instagram.handle}
          </HoverLink>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <p className="font-helvetica text-[12px] uppercase tracking-widest md:text-[14px]">
          {site.copyright}
        </p>
        <HoverLink
          href={site.credits.url}
          className="font-helvetica text-[12px] uppercase tracking-widest md:text-[14px]"
        >
          {site.credits.label}
        </HoverLink>
      </div>
    </footer>
  );
}
