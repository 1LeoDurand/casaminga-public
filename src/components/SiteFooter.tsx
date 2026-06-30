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
          Site édité par l'association <strong>La Manufacture des Pays</strong> — association loi 1901,
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
        <p className="mt-6 text-xs" style={{ color: "var(--gray)" }}>
          © {year} La Manufacture des Pays — Casaminga
        </p>
      </div>
    </footer>
  );
}
