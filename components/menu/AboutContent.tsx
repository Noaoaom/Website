import HoverLink, { HoverButton } from "@/components/ui/HoverLink";
import { site } from "@/lib/site";

type AboutContentProps = {
  variant: "menu" | "page";
  onBack?: () => void;
};

export default function AboutContent({ variant, onBack }: AboutContentProps) {
  const isMenu = variant === "menu";
  const bodyClass = isMenu
    ? "text-black/90"
    : "text-brand-red/90";

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
          About me
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        <p className={`font-helvetica text-[15px] normal-case leading-[1.5] md:text-[18px] ${bodyClass}`}>
          {site.name} is a Berlin-based studio focused on social media —
          short-form film, campaign content and moving visuals built for
          Instagram, TikTok and brand channels.
        </p>
        <p className={`font-helvetica text-[15px] normal-case leading-[1.5] md:text-[18px] ${bodyClass}`}>
          Led by Markus Noam Dickhausen, the work spans concept, direction
          and production — crafted for feed, stories and platform-native
          formats with a precise, editorial eye.
        </p>
      </div>
    </div>
  );
}
