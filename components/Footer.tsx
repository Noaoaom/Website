import { site } from "@/lib/site";
import HoverLink from "./ui/HoverLink";

type FooterProps = {
  theme?: "black" | "red";
};

/** Contacts / meta band above the wordmark. */
export const FOOTER_CONTENT_DVH = 35;
/** Dickhausen title band height / font size. */
export const FOOTER_TITLE_DVH = 50;
/** Full footer height — also the scroll distance that reveals it. */
export const FOOTER_TOTAL_DVH = FOOTER_CONTENT_DVH + FOOTER_TITLE_DVH;

export default function Footer({ theme = "red" }: FooterProps) {
  const isRed = theme === "red";
  const bg = isRed ? "#D60001" : "#000000";
  const fg = isRed ? "#000000" : "#D60001";

  return (
    <footer
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-0 flex w-full flex-col overflow-hidden px-6 transition-colors duration-700 lg:px-12"
      style={{
        height: `${FOOTER_TOTAL_DVH}dvh`,
        backgroundColor: bg,
        color: fg,
      }}
    >
      <div
        className="flex shrink-0 flex-col justify-between py-8"
        style={{ height: `${FOOTER_CONTENT_DVH}dvh` }}
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

        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
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
      </div>

      <div
        className="flex w-full shrink-0 items-end justify-center overflow-hidden"
        style={{ height: `${FOOTER_TITLE_DVH}dvh` }}
        aria-hidden
      >
        <span
          className="hero-wordmark-text hero-wordmark-bottom block text-center font-ivar uppercase leading-none text-black"
          style={{ fontSize: `${FOOTER_TITLE_DVH}dvh` }}
        >
          {site.wordmark.left}
        </span>
      </div>
    </footer>
  );
}
