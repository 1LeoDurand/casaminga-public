import { Link } from "react-router-dom";

/**
 * Footer éditeur global (item F des DIRECTIVES-AD-GRANT.md).
 * Affiche l'identité légale de l'éditeur (exigence Google Ad Grant) et rappelle
 * le lien Casaminga ↔ La Manufacture des Pays. Présent sur toutes les pages.
 *
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t" style={{ borderColor: "var(--gray-mid)", background: "#fff" }}>
      <div className="wrap" style={{ padding: "48px 28px" }}>
        <p style={{ fontWeight: 700, color: "var(--black)" }}>La Manufacture des Pays</p>
        <p style={{ fontSize: "13px", color: "var(--gray)", marginTop: "6px", maxWidth: "64ch", lineHeight: 1.7 }}>
          Site édité par l'association <strong>La Manufacture des Pays</strong>, association loi 1901,
          RNA W342002465, SIREN 824&nbsp;820&nbsp;856. Siège : atelier Bernard Kohn,
          La Distillerie, 10 rue de la sous-préfecture, 34700 Lodève. <strong>Casaminga</strong> est la
          plateforme numérique de l'association.
        </p>
        <nav
          className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
          style={{ color: "var(--gray)" }}
          aria-label="Liens de pied de page"
        >
          <Link to="/association" style={{ color: "var(--gray)" }}>L'association</Link>
          <Link to="/nos-actions" style={{ color: "var(--gray)" }}>Nos actions</Link>
          <Link to="/agenda" style={{ color: "var(--gray)" }}>Agenda</Link>
          {/* « Les lieux » manquait ici alors qu'il est dans la navigation
              principale : un pied de page qui n'offre pas les mêmes chemins
              que le menu envoie le visiteur dans une impasse. */}
          <Link to="/lieux" style={{ color: "var(--gray)" }}>Les lieux</Link>
          <Link to="/contact" style={{ color: "var(--gray)" }}>Contact</Link>
          <a href="mailto:manufacturedespays@gmail.com" style={{ color: "var(--gray)" }}>
            manufacturedespays@gmail.com
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100088089259165"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--gray)" }}
          >
            Facebook
          </a>
        </nav>
        {/* Les pages légales vivent ici, au dernier rang : elles doivent être
            accessibles depuis chaque page du site, sans concurrencer la
            navigation utile. */}
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--gray)" }}>
          <span>© {year} La Manufacture des Pays · Casaminga</span>
          <Link to="/mentions-legales" style={{ color: "var(--gray)" }}>Mentions légales</Link>
          <Link to="/confidentialite" style={{ color: "var(--gray)" }}>Confidentialité</Link>
        </p>
      </div>
    </footer>
  );
}
