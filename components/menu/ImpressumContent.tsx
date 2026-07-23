import Link from "next/link";
import HoverLink, { HoverButton } from "@/components/ui/HoverLink";
import { impressum } from "@/lib/impressum";
import { site } from "@/lib/site";

type ImpressumContentProps = {
  variant: "menu" | "page";
  onBack?: () => void;
};

export default function ImpressumContent({ variant, onBack }: ImpressumContentProps) {
  const isMenu = variant === "menu";
  const mutedClass = isMenu ? "text-black/70" : "text-brand-red/70";
  const bodyClass = isMenu ? "text-black/90" : "text-brand-red/90";

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
          Impressum
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        {impressum.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2
              className={`font-helvetica text-[12px] uppercase tracking-widest md:text-[15px] ${mutedClass}`}
            >
              {section.title}
            </h2>

            {"lines" in section
              ? section.lines.map((line) => (
                  <p
                    key={line}
                    className="font-helvetica text-[15px] uppercase leading-[1.4] md:text-[21px]"
                  >
                    {line.startsWith("E-Mail:") ? (
                      <>
                        E-Mail:{" "}
                        <Link
                          href={`mailto:${site.email}`}
                          className="transition-opacity hover:opacity-70"
                        >
                          {site.email}
                        </Link>
                      </>
                    ) : (
                      line
                    )}
                  </p>
                ))
              : null}

            {"paragraphs" in section
              ? section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className={`font-helvetica text-[15px] normal-case leading-[1.5] md:text-[18px] ${bodyClass}`}
                  >
                    {paragraph}
                  </p>
                ))
              : null}
          </section>
        ))}
      </div>
    </div>
  );
}
