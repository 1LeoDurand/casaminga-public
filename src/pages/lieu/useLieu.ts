import { useEffect, useState } from "react";
import { fetchLieuBySlug, type LieuData } from "../../lib/supabase";

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
    fetchLieuBySlug(slug)
      .then((d) => { if (alive) setState({ loading: false, data: d }); })
      .catch(() => { if (alive) setState({ loading: false, data: null }); });
    return () => { alive = false; };
  }, [slug]);

  // Remonte en haut à chaque navigation de lieu.
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Titre de l'onglet = nom du lieu (SEO de la belle URL). Restauré au démontage.
  useEffect(() => {
    if (!state.data) return;
    const prev = document.title;
    document.title = `${state.data.org.name} — Casa Minga`;
    return () => { document.title = prev; };
  }, [state.data]);

  return state;
}
