import { Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";

interface EbHeaderProps {
  search: string;
  onSearch: (v: string) => void;
  city: string;
  cities: string[];
  onCityChange: (v: string) => void;
}

export function EbHeader({ search, onSearch, city, cities, onCityChange }: EbHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b bg-white"
      style={{ borderColor: "var(--gray-mid)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="wrap flex h-16 items-center gap-5">
        {/* Logo */}
        <Link
          to="/design-accueil"
          className="shrink-0 text-[18px] font-bold tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--coral-deep)", letterSpacing: "-0.3px" }}
        >
          Casa<span style={{ color: "var(--black)" }}>Minga</span>
        </Link>

        {/* Séparateur vertical */}
        <div className="hidden h-5 w-px bg-gray-200 sm:block" />

        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--gray)" }}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Rechercher un événement, un lieu…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-4 text-sm transition-colors"
            style={{
              borderColor: "var(--gray-mid)",
              color: "var(--black)",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--coral)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gray-mid)")}
          />
        </div>

        {/* Sélecteur de ville */}
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <MapPin size={14} style={{ color: "var(--coral-deep)" }} aria-hidden="true" />
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="border-0 bg-transparent text-sm font-medium"
            style={{ color: "var(--black)", cursor: "pointer" }}
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Lien vers l'espace de gestion (cible réelle du libellé « adhérent »). */}
        <a
          href="https://admin.casaminga.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 rounded-lg border px-4 py-1.5 text-xs font-semibold transition-colors sm:block"
          style={{ borderColor: "var(--gray-mid)", color: "var(--black)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--coral)";
            e.currentTarget.style.color = "var(--coral-deep)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--gray-mid)";
            e.currentTarget.style.color = "var(--black)";
          }}
        >
          Espace adhérent
        </a>
      </div>
    </header>
  );
}
