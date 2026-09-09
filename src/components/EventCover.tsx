import { useEffect, useState } from "react";
import { imageContentBox, type ContentBox } from "../lib/trim-image";

/**
 * Visuel d'un événement, traitement dit « lettre-boîte floutée ».
 *
 * Le problème : les affiches d'événements arrivent dans tous les formats,
 * carrées, portrait, panoramiques. Les cadrer en `object-fit: cover` rogne
 * l'affiche, et c'est précisément là que se trouve l'information (le titre,
 * la date, les visages). Une affiche recadrée devient illisible.
 *
 * La solution, reprise d'Eventbrite (demande Léo du 2026-09-09) : l'affiche
 * est affichée ENTIÈRE, et le vide autour d'elle est comblé par une copie de
 * la même image, agrandie et floutée. Le cadre garde ses proportions,
 * l'affiche reste intacte, et les bords prolongent ses couleurs au lieu
 * d'ouvrir deux barres blanches.
 *
 * S'y ajoute le retrait des marges unies de l'affiche elle-même (voir
 * lib/trim-image). Beaucoup d'affiches associatives sont une petite
 * illustration au milieu d'une grande zone blanche : sans ce retrait,
 * l'habillage flouté est correct mais l'affiche reste presque vide.
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

  /**
   * Marges unies de l'affiche, mesurées une fois puis mises en cache. Tant que
   * l'analyse tourne, l'image s'affiche entière : mieux vaut un cadrage
   * imparfait pendant un instant qu'un cadre vide.
   */
  const [box, setBox] = useState<ContentBox | null>(null);

  /**
   * Réalignement pendant le rendu, et non dans un effet : remettre l'état à
   * zéro depuis un effet provoque un rendu en cascade, avec un instant où
   * l'ancienne image reste affichée sous la nouvelle URL.
   */
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setBox(null);
    setFailed(false);
  }

  useEffect(() => {
    let alive = true;
    imageContentBox(src).then((b) => { if (alive) setBox(b); }).catch(() => {});
    return () => { alive = false; };
  }, [src]);

  /**
   * Cadrage de la zone utile, en CSS. L'image est agrandie de `1/largeur` et
   * décalée de `-x/largeur`, dans une boîte qui a le rapport de cette zone :
   * on obtient l'effet d'une image recoupée, sans la recouper réellement.
   */
  const cropped = box
    ? {
        wrapper: { aspectRatio: `${box.w} / ${box.h}` } as React.CSSProperties,
        image: {
          position: "absolute" as const,
          width: `${100 / box.w}%`,
          height: `${100 / box.h}%`,
          left: `${(-box.x / box.w) * 100}%`,
          top: `${(-box.y / box.h) * 100}%`,
          maxWidth: "none",
        },
      }
    : null;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: fallback }}>
      {!failed && (
        <>
          {/*
            Fond : l'image ENTIÈRE, agrandie et floutée. Volontairement pas
            recadrée : en `cover`, elle est déjà rognée depuis son centre,
            donc ce sont ses couleurs vives qui remplissent les côtés, jamais
            sa marge blanche.
          */}
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
          {/* L'affiche, sans ses marges. */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-500${
              hoverZoom ? " group-hover:scale-105" : ""
            }`}
          >
            {cropped ? (
              <div
                className="relative max-h-full max-w-full overflow-hidden"
                style={{ ...cropped.wrapper, height: "100%" }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  onError={() => setFailed(true)}
                  style={cropped.image}
                />
              </div>
            ) : (
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={() => setFailed(true)}
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </>
      )}
      {children}
    </div>
  );
}
