/**
 * Contenu éditable du site vitrine d'un lieu (miroir de
 * casa-minga-lieux/src/lib/site-public/types.ts, stocké dans
 * public_sites.content_blocks).
 *
 * Sur casaminga.com le thème est volontairement harmonisé "Casa Minga"
 * (crème/corail) — comme côté admin via applyHostTheme. On ne réplique donc
 * PAS le système des 11 thèmes : seuls le contenu, l'accent et les toggles
 * (sections / pages) sont consommés ici.
 */

export interface SiteSections {
  lieu: boolean;
  agenda: boolean;
  adherer: boolean;
  contact: boolean;
}

export interface SitePages {
  apropos: boolean;
  agenda: boolean;
  espaces: boolean;
  soutenir: boolean;
}

export interface SiteContent {
  hero_tagline: string;
  hero_image_url: string | null;
  about_title: string;
  about_text: string;
  gallery_urls: string[];
  accent_color: string;
  sections: SiteSections;
  pages: SitePages;
  soutenir_text: string;
}

export const DEFAULT_ACCENT = "#FF8A65";

/** Fusionne le contenu stocké (potentiellement partiel) avec les valeurs par défaut. */
export function mergeSiteContent(raw: unknown): SiteContent {
  const c = (raw ?? {}) as Partial<SiteContent>;
  return {
    hero_tagline: c.hero_tagline ?? "",
    hero_image_url: c.hero_image_url ?? null,
    about_title: c.about_title || "Découvrir le lieu",
    about_text: c.about_text ?? "",
    gallery_urls: Array.isArray(c.gallery_urls) ? c.gallery_urls : [],
    accent_color: c.accent_color || DEFAULT_ACCENT,
    sections: {
      lieu: c.sections?.lieu ?? true,
      agenda: c.sections?.agenda ?? true,
      adherer: c.sections?.adherer ?? true,
      contact: c.sections?.contact ?? true,
    },
    pages: {
      apropos: c.pages?.apropos ?? false,
      agenda: c.pages?.agenda ?? false,
      espaces: c.pages?.espaces ?? false,
      soutenir: c.pages?.soutenir ?? false,
    },
    soutenir_text: c.soutenir_text ?? "",
  };
}
