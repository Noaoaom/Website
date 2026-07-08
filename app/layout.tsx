import type { Metadata, Viewport } from "next";
import { siteFont } from "./fonts";
import { site } from "@/lib/site";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} - ${site.tagline}`,
  description: `${site.name} — ${site.tagline}. Direction, video and production for fashion, art and culture.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${siteFont.variable} lenis`}>
      <body className={`${siteFont.className} relative bg-black font-sans text-brand-red antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
