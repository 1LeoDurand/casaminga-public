import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Bannière d'accueil : carte arrondie plein cadre, vidéo de fond, accroche en
 * blocs surlignés et bouton pastille. Gabarit demandé par Léo (2026-09-06),
 * repris du bandeau Eventbrite, dans la palette Casaminga.
 *
 * Trois paliers, comme le modèle :
 *   ≥ lg  : carte détachée (marges latérales), accroche centrée verticalement
 *   sm→lg : carte pleine largeur, texte réduit
 *   < sm  : carte plus courte, accroche en bas à gauche, sujet visible en haut
 *
 * La vidéo est décorative : muette, en boucle, sans contrôle, `aria-hidden`.
 * Elle ne porte aucune information — tout le sens est dans le texte au-dessus.
 */

/** Surlignage des lignes d'accroche : dégradé chaud, texte noir. */
const HIGHLIGHT = "linear-gradient(90deg, var(--peach-soft) 0%, var(--peach) 55%, var(--coral) 100%)";

export function HeroBanner() {
  /**
   * `prefers-reduced-motion` : on sert l'image fixe au lieu de la vidéo. Le
   * réglage est lu côté client, donc l'image est aussi ce qui s'affiche au
   * premier rendu — elle sert alors de poster.
   */
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section className="px-0 pt-0 lg:px-8 lg:pt-6" aria-labelledby="hero-titre">
      <div
        className="relative isolate mx-auto w-full max-w-[1560px] overflow-hidden rounded-[20px] lg:rounded-[28px]"
        style={{ background: "var(--black)" }}
      >
        {/* Média de fond, purement décoratif. */}
        <div className="absolute inset-0 -z-10">
          {animate ? (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/hero-casaminga.jpg"
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src="/hero-casaminga.webm" type="video/webm" />
              <source src="/hero-casaminga.mp4" type="video/mp4" />
            </video>
          ) : (
            <img src="/hero-casaminga.jpg" alt="" className="h-full w-full object-cover" />
          )}
          {/*
            Voile de lisibilité. Sur mobile le texte est en bas : le dégradé part
            du bas. À partir de sm il est à gauche : le dégradé part de la gauche.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 sm:hidden"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.1) 100%)" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden sm:block"
            style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.08) 78%)" }}
          />
        </div>

        <div className="flex min-h-[300px] items-end px-6 py-8 sm:min-h-[380px] sm:items-center sm:px-10 lg:min-h-[480px] lg:px-16">
          <div className="max-w-full">
            <span
              className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] sm:text-[13px]"
              style={{ background: HIGHLIGHT, color: "var(--black)" }}
            >
              Entrez, c'est ouvert
            </span>

            {/*
              Deux lignes surlignées séparément, comme le modèle : chaque ligne
              est un bloc de fond qui épouse sa propre longueur. `w-fit` + un
              élément par ligne, plutôt qu'un box-decoration-break, pour un
              rendu identique sur tous les navigateurs.
            */}
            <h1 id="hero-titre" className="mt-1.5 font-extrabold leading-[1.06]">
              <span
                className="block w-fit whitespace-nowrap px-2.5 py-0.5 text-[clamp(21px,6.2vw,26px)] uppercase tracking-tight sm:text-[clamp(28px,4.6vw,40px)] lg:text-[52px]"
                style={{ background: HIGHLIGHT, color: "var(--black)" }}
              >
                Des ateliers du matin
              </span>
              <span
                className="mt-1 block w-fit whitespace-nowrap px-2.5 py-0.5 text-[clamp(21px,6.2vw,26px)] uppercase tracking-tight sm:text-[clamp(28px,4.6vw,40px)] lg:text-[52px]"
                style={{ background: HIGHLIGHT, color: "var(--black)" }}
              >
                aux concerts du soir
              </span>
            </h1>

            <Link
              to="/lieux"
              className="mt-5 inline-flex items-center rounded-full px-6 py-3 text-[15px] font-semibold sm:mt-7 sm:text-base"
              style={{ background: "var(--white)", color: "var(--black)" }}
            >
              Découvrir les lieux
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
