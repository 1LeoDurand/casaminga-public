export function EbPromoBanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--coral-deep) 0%, var(--coral) 50%, var(--peach) 100%)",
        minHeight: "220px",
      }}
    >
      {/* Cercles décoratifs */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-20"
        style={{ background: "#fff" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/3 h-48 w-48 rounded-full opacity-10"
        style={{ background: "var(--golden)" }}
      />

      <div className="wrap relative flex flex-col justify-center py-14 sm:py-16">
        <span
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
          style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}
        >
          🗓️ Agenda du réseau
        </span>
        <h1
          className="mb-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl"
          style={{ color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.18)" }}
        >
          Découvrez ce qui se passe près de chez vous
        </h1>
        <p className="mb-6 max-w-lg text-base" style={{ color: "rgba(255,255,255,0.9)" }}>
          Ateliers, concerts, marchés, expositions… tous les événements des tiers-lieux
          du réseau Casa Minga en un seul endroit.
        </p>
        <a
          href="#evenements"
          className="btn btn-sm w-fit font-bold"
          style={{ background: "#fff", color: "var(--coral-deep)" }}
        >
          Voir les événements ↓
        </a>
      </div>
    </section>
  );
}
