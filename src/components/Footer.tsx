export function Footer() {
  return (
    <footer style={{ background: "#1A1A1A", color: "rgba(255,255,255,0.7)", padding: "60px 0 28px", fontSize: "13px" }}>
      <div className="wrap">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] sm:grid-cols-2">
          {/* Brand */}
          <div>
            <div className="mb-3.5 flex items-center gap-2.5 text-[17px] font-extrabold text-white">
              <span className="flex size-9 items-center justify-center rounded-[11px] text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-dark))" }}>CM</span>
              Casa Minga
            </div>
            <p style={{ lineHeight: 1.6, maxWidth: "34ch", color: "rgba(255,255,255,0.65)" }}>
              La plateforme des tiers-lieux culturels, associatifs et hybrides de France. Des lieux où l'on fait ensemble.
            </p>
          </div>

          {/* Découvrir */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">Découvrir</h4>
            <ul className="flex list-none flex-col gap-2 p-0">
              {[
                { label: "Les lieux", href: "#lieux" },
                { label: "Événements", href: "#evenements" },
                { label: "Adhésions", href: "#adhesions" },
                { label: "Tarifs", href: "#tarifs" },
              ].map((l) => (
                <li key={l.href}><a href={l.href} style={{ color: "rgba(255,255,255,0.65)" }}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Gérer */}
          <div>
            <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">Pour les lieux</h4>
            <ul className="flex list-none flex-col gap-2 p-0">
              <li><a href="https://admin.casaminga.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.65)" }}>Espace admin</a></li>
              <li><a href="mailto:contact@casaminga.com" style={{ color: "rgba(255,255,255,0.65)" }}>Nous contacter</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-between gap-3.5 border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.1)", fontSize: "11.5px", color: "rgba(255,255,255,0.5)" }}>
          <span>© {new Date().getFullYear()} Casa Minga — Des lieux où l'on fait ensemble</span>
          <span>Pensé depuis le terrain · Sobriété numérique</span>
        </div>
      </div>
    </footer>
  );
}
