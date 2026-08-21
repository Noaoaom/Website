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

/** Aston Script Bold — project display titles. */
export const astonScriptFont = localFont({
  src: "../public/fonts/Aston Script.ttf",
  variable: "--font-aston-script",
  display: "swap",
  preload: true,
  fallback: ["cursive", "serif"],
});

/** Drowner — distressed display titles. */
export const drownerFont = localFont({
  src: "../public/fonts/Drowner-Free.otf",
  variable: "--font-drowner",
  display: "swap",
  preload: true,
  fallback: ["Impact", "Arial Black", "sans-serif"],
});

export const projectDisplayFonts = {
  "aston-script": astonScriptFont,
  drowner: drownerFont,
} as const;

export type ProjectTitleFont = keyof typeof projectDisplayFonts;

export function projectDisplayFontClass(titleFont?: ProjectTitleFont) {
  return titleFont ? projectDisplayFonts[titleFont].className : "";
}

export function usesDisplayTitleFont(titleFont?: ProjectTitleFont) {
  return titleFont != null;
}
