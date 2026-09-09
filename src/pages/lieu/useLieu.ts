import { useEffect, useState } from "react";
import { fetchLieuBySlug, type LieuData } from "../../lib/supabase";
import { isImportedOrg } from "../../lib/imported";

export interface LieuState {
  loading: boolean;
  data: LieuData | null;
}

/**
 * Charge la vitrine d'un lieu par slug. Partagé par la page d'accueil du lieu
 * et toutes ses sous-pages (histoire/agenda/espaces/soutenir). Refetch propre
 * à chaque changement de slug, avec garde anti-race.
 */
export function useLieu(slug: string | undefined): LieuState {
  const [state, setState] = useState<LieuState>({ loading: true, data: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, data: null });
    if (!slug) {
      setState({ loading: false, data: null });
      return;
    }
    /**
     * Une organisation moissonnée n'a pas de vitrine.
     *
     * Elle a bien une ligne `public_sites` publiée, sans quoi la règle RLS
     * `orgs_select_public` la rendrait invisible et les événements perdraient
     * le nom de leur lieu. Mais cette ligne est un artefact technique : le lieu
     * n'a rien écrit, rien validé, et souvent ignore que Casaminga existe.
     * Lui fabriquer une page de présentation à son nom serait le présenter
     * comme membre d'un réseau qu'il n'a pas rejoint. La fiche d'événement, qui
     * cite sa source et lui propose de récupérer sa page, reste le seul endroit
     * où il apparaît.
     */
    if (isImportedOrg({ slug })) {
      setState({ loading: false, data: null });
      return;
    }

    fetchLieuBySlug(slug)
      .then((d) => { if (alive) setState({ loading: false, data: d }); })
      .catch(() => { if (alive) setState({ loading: false, data: null }); });
    return () => { alive = false; };
  }, [slug]);

  // Remonte en haut à chaque navigation de lieu.
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Titre, description et canonical : posés par chaque page vitrine via
  // usePageMeta (src/lib/seo.ts), pas ici. Un hook générique sur `slug` ne
  // sait pas distinguer l'accueil du lieu de ses sous-pages (agenda, espaces…).

  return state;
}

/**
 * Description de repli pour les pages vitrine, quand `public_sites.seo_description`
 * n'a pas été renseignée dans l'admin. Priorité à ce qu'un humain a déjà écrit
 * (accroche, description de l'organisation) avant la phrase générique.
 */
export function lieuMetaDescription(data: LieuData): string {
  return (
    data.seoDescription ||
    data.content.hero_tagline ||
    data.org.description ||
    `${data.org.name} fait partie du réseau Casaminga.`
  );
}
