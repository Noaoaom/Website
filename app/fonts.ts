import localFont from "next/font/local";

/** Helvetica Neue LT Pro 55 Roman — site-wide typeface. */
export const siteFont = localFont({
  src: "../public/fonts/HelveticaNeueLTPro55Roman.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-site",
  display: "swap",
  preload: true,
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});
