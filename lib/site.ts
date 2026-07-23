import type { MenuPanel } from "./menuPanels";

/**
 * Central site configuration — edit everything brand-related here.
 */
export const site = {
  wordmark: {
    left: "Dickhausen",
    right: "Studio",
  },
  /** Wordmark text used in metadata and footer. */
  name: "Dickhausen Studio",
  /** Small tagline shown in metadata. */
  tagline: "Industrial Cinema 2.0",
  menu: {
    links: [
      { label: "About me", href: "/about", panel: "about" as MenuPanel },
      { label: "Contacts", href: "/contacts", panel: "contacts" as MenuPanel },
      { label: "Impressum", href: "/impressum", panel: "impressum" as MenuPanel },
    ],
  },
  email: "studio@dickhausen.de",
  instagram: {
    handle: "@noaoaom",
    url: "https://www.instagram.com/noaoaom/",
  },
  copyright: "\u00A92026 \u2014 Dickhausen Studio",
  impressum: {
    label: "Impressum",
    url: "/impressum",
  },
};
