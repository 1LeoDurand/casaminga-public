import { useEffect } from "react";

/**
 * Métadonnées par page (SEO).
 *
 * `index.html` ne porte qu'un titre et une description génériques, valables
 * pour le temps très court avant que React ne prenne la main : toutes les
 * pages s'y ressemblaient pour Google, alors qu'un Ad Grant actif leur envoie
 * du trafic réel. Chaque route appelle `usePageMeta` pour écrire les siennes.
 *
 * Les balises posées ici ne sont jamais retirées au démontage : la page
 * suivante appelle systématiquement ce hook et les réécrit aussitôt. Les
 * enlever créerait une fenêtre sans description entre deux navigations.
 */

const SITE_ORIGIN = "https://casaminga.com";

export interface PageMetaOptions {
  title: string;
  description: string;
  /** Chemin ou URL absolue. Par défaut, l'origine du site + le chemin courant. */
  canonical?: string;
  /** Photo à associer au partage (og:image). Omise si absente, jamais inventée. */
  image?: string | null;
  /** Sort la page de l'index Google (ex. 404). */
  noindex?: boolean;
  /** og:type, "website" par défaut, "article" pour une fiche événement. */
  type?: string;
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMetaTag(attr: "name" | "property", key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Pose titre, description, canonical, Open Graph et Twitter Card pour la page courante. */
export function usePageMeta(options: PageMetaOptions): void {
  const { title, description, canonical, image, noindex = false, type = "website" } = options;

  useEffect(() => {
    document.title = title;
    setMetaTag("name", "description", description);

    const canonicalUrl = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${SITE_ORIGIN}${canonical}`
      : `${SITE_ORIGIN}${window.location.pathname}`;
    setLinkTag("canonical", canonicalUrl);

    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", type);
    if (image) {
      setMetaTag("property", "og:image", image);
    } else {
      removeMetaTag("property", "og:image");
    }

    setMetaTag("name", "twitter:card", "summary_large_image");

    if (noindex) {
      setMetaTag("name", "robots", "noindex");
    } else {
      removeMetaTag("name", "robots");
    }
  }, [title, description, canonical, image, noindex, type]);
}

/**
 * Injecte des données structurées JSON-LD pour la page courante (un seul
 * bloc à la fois). La sérialisation en chaîne sert de dépendance d'effet :
 * l'appelant passe souvent un objet littéral recréé à chaque rendu, comparer
 * les chaînes évite de recréer la balise en boucle.
 */
export function useJsonLd(data: Record<string, unknown> | null): void {
  const serialized = data ? JSON.stringify(data) : null;

  useEffect(() => {
    if (!serialized) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = serialized;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [serialized]);
}

/** Tronque un texte sur une frontière de mot, jamais au milieu. */
export function truncateDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}
