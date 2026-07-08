"use client";

import Link from "next/link";
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from "react";

type BaseProps = {
  children: string;
  className?: string;
  underline?: boolean;
};

function Char({ char }: { char: string }) {
  return (
    <span className="relative -mx-[0.1em] inline-block overflow-hidden px-[0.1em]">
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {char}
      </span>
      <span className="absolute inset-0 flex translate-y-[150%] items-center justify-center transition-transform duration-300 ease-out group-hover:translate-y-0">
        {char}
      </span>
    </span>
  );
}

function Inner({
  children,
  className = "",
  underline = true,
}: {
  children: string;
  className?: string;
  underline?: boolean;
}) {
  return (
    <span
      className={`group relative isolate -mx-[0.1em] inline-block overflow-hidden px-[0.1em] py-[0.25em] -my-[0.25em] ${className}`}
    >
      <span className="relative flex flex-wrap uppercase leading-none">
        <span className="inline-flex whitespace-nowrap">
          {Array.from(children).map((char, i) => (
            <Char key={`${char}-${i}`} char={char} />
          ))}
        </span>
      </span>
      {underline ? (
        <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
      ) : null}
    </span>
  );
}

export function HoverLink({
  href,
  children,
  className = "",
  underline = true,
  ...rest
}: BaseProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "children">) {
  return (
    <Link href={href} {...rest}>
      <Inner className={className} underline={underline}>
        {children}
      </Inner>
    </Link>
  );
}

export function HoverButton({
  children,
  className = "",
  underline = true,
  onClick,
}: BaseProps & {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button type="button" className={`cursor-pointer ${className}`} onClick={onClick}>
      <Inner className={className} underline={underline}>
        {children}
      </Inner>
    </button>
  );
}

export default HoverLink;
