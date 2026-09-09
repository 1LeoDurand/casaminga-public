import { useState } from "react";

/**
 * Visuel d'un événement, traitement dit « lettre-boîte floutée ».
 *
 * Le problème : les affiches d'événements arrivent dans tous les formats,
 * carrées, portrait, panoramiques. Les cadrer en `object-fit: cover` rogne
 * l'affiche, et c'est précisément là que se trouve l'information (le titre,
 * la date, les visages). Une affiche recadrée devient illisible.
 *
 * La solution, reprise d'Eventbrite (demande Léo du 2026-09-09) : l'affiche
 * est affichée ENTIÈRE (`contain`), et le vide autour d'elle est comblé par
 * une copie de la même image, agrandie et floutée. Le cadre reste de largeur
 * fixe, l'affiche reste intacte, et les bords prolongent ses couleurs au lieu
 * d'ouvrir deux barres blanches.
 *
 * Le `scale(1.2)` sur le fond n'est pas décoratif : un flou gaussien délave
 * les bords de l'image, ce qui laisserait un liseré translucide sans ce
 * débord.
 */
export function EventCover({
  src,
  className = "",
  fallback,
  hoverZoom = false,
  children,
}: {
  src: string;
  /** Classes de dimensionnement du cadre (hauteur, arrondi…). */
  className?: string;
  /** Fond montré au chargement, et seul rendu si l'image ne répond pas. */
  fallback: string;
  /** Léger zoom de l'affiche au survol (cartes cliquables). */
  hoverZoom?: boolean;
  /** Éléments posés par-dessus : pastille de catégorie, voile, lien retour. */
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: fallback }}>
      {!failed && (
        <>
          {/* Fond : la même image, agrandie et floutée, pour habiller les côtés. */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "blur(26px) saturate(1.2)", transform: "scale(1.2)" }}
          />
          {/* Voile : sans lui, un fond clair et flou avale les bords de
              l'affiche, qui semble alors flotter sans limite. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "rgba(24,20,18,0.26)" }}
          />
          {/* L'affiche, entière. */}
          <img
            src={src}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className={`relative h-full w-full object-contain transition-transform duration-500${
              hoverZoom ? " group-hover:scale-105" : ""
            }`}
          />
        </>
      )}
      {children}
    </div>
  );
}
