import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

/**
 * Page 404 (fallback router "*").
 * Sober, fully wired: no placeholder, no dead anchor — only real router links.
 * Replaces the old landing page (App.tsx) as the catch-all so that unknown URLs
 * never surface unwired sections to the Google Ad Grant review.
 */
export function NotFound() {
  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        <section
          className="wrap"
          style={{ paddingTop: "clamp(56px,8vw,96px)", paddingBottom: "clamp(56px,8vw,96px)" }}
        >
          <span className="eyebrow">Erreur 404</span>
          <h1 style={{ maxWidth: "18ch" }}>Cette page n'existe pas</h1>
          <p className="lead" style={{ marginTop: "18px" }}>
            L'adresse demandée est introuvable&nbsp;: elle a peut-être changé, ou le lien que vous avez suivi
            comporte une erreur. Reprenez votre visite depuis l'accueil, l'agenda du réseau ou la page de
            contact&nbsp;— nous répondons à chaque message.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
            <Link to="/agenda" className="btn btn-secondary">Voir l'agenda</Link>
            <Link to="/contact" className="btn btn-ghost">Nous écrire</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
