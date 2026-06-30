import { Link, useLocation } from "react-router-dom";

/** Lien d'adhésion HelloAsso (soutien à l'association — pas un service marchand). */
export const HELLOASSO_ADHESION =
  "https://www.helloasso.com/associations/la-manufacture-des-pays/adhesions/bulletin-d-adhesion-2023";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/association", label: "L'association" },
  { to: "/nos-actions", label: "Nos actions" },
  { to: "/agenda", label: "Agenda" },
  { to: "/contact", label: "Contact" },
];

/**
 * Header global du site institutionnel La Manufacture des Pays (× Casaminga).
 * Partagé par toutes les pages (item NAV des DIRECTIVES-AD-GRANT.md).
 * Liens routeur uniquement — aucune ancre morte.
 */
export function SiteHeader() {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,251,240,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderColor: "var(--gray-mid)",
      }}
    >
      <div className="wrap flex h-16 items-center gap-6">
        <Link to="/" className="shrink-0 leading-none" style={{ letterSpacing: "-0.3px" }}>
          <span className="block text-[18px] font-bold tracking-tight" style={{ color: "var(--coral-deep)" }}>
            Casaminga
          </span>
          <span className="block text-[11px] font-medium" style={{ color: "var(--gray)", marginTop: "2px" }}>
            par La Manufacture des Pays
          </span>
        </Link>
        <nav
          className="ml-auto hidden items-center gap-6 text-[13.5px] font-medium md:flex"
          aria-label="Navigation principale"
        >
          {NAV.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive(l.to) ? "page" : undefined}
              style={{ color: isActive(l.to) ? "var(--coral-deep)" : "var(--black)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href={HELLOASSO_ADHESION}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm ml-auto md:ml-0"
        >
          Adhérer
        </a>
      </div>
      {/* Navigation mobile : barre secondaire scrollable (pas de menu masqué = aucun lien caché à la revue). */}
      <nav
        className="no-scrollbar flex items-center gap-5 overflow-x-auto border-t px-7 py-2.5 text-[13px] font-medium md:hidden"
        style={{ borderColor: "var(--gray-mid)" }}
        aria-label="Navigation principale (mobile)"
      >
        {NAV.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            aria-current={isActive(l.to) ? "page" : undefined}
            className="shrink-0"
            style={{ color: isActive(l.to) ? "var(--coral-deep)" : "var(--black)" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
