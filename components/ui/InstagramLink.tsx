import Link from "next/link";
import { site } from "@/lib/site";
import InstagramIcon from "./InstagramIcon";

type InstagramLinkProps = {
  className?: string;
};

export default function InstagramLink({ className = "" }: InstagramLinkProps) {
  return (
    <Link
      href={site.instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram ${site.instagram.handle}`}
      className={`inline-flex items-center justify-start transition-opacity hover:opacity-70 ${className}`}
    >
      <InstagramIcon className="size-[1em]" />
    </Link>
  );
}
