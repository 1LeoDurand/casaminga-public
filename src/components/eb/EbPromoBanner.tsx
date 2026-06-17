import { HERO_IMAGE } from "../../lib/event-images";
import { ArrowDown } from "lucide-react";

export function EbPromoBanner() {
  return (
    <section className="relative overflow-hidden" style={{ height: "480px" }}>
      {/* Photo de fond */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      {/* Overlay sombre progressif */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(20,16,12,0.72) 0%, rgba(20,16,12,0.40) 60%, rgba(20,16,12,0.18) 100%)",
        }}
      />

      {/* Contenu */}
      <div className="wrap relative flex h-full flex-col justify-center">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          Agenda du réseau
        </p>
        <h1
          className="mb-4 max-w-lg text-4xl font-bold leading-tight sm:text-5xl"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            letterSpacing: "-0.5px",
          }}
        >
          Découvrez ce qui se passe près de chez vous
        </h1>
        <p className="mb-8 max-w-md text-base" style={{ color: "rgba(255,255,255,0.80)" }}>
          Ateliers, concerts, marchés, expositions — tous les événements
          des tiers-lieux du réseau en un seul endroit.
        </p>
        <a
          href="#evenements"
          className="inline-flex w-fit items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all"
          style={{
            background: "var(--coral)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(255,138,101,0.35)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--coral-dark)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--coral)";
            (e.currentTarget as HTMLElement).style.transform = "none";
          }}
        >
          Voir les événements
          <ArrowDown size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
