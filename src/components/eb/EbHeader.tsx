import { Link } from "react-router-dom";

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
      className="sticky top-0 z-50 border-b"
      style={{ background: "#fff", borderColor: "var(--gray-mid)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="wrap flex items-center gap-4 py-3">
        {/* Logo */}
        <Link
          to="/design-accueil"
          className="shrink-0 text-xl font-extrabold tracking-tight"
          style={{ color: "var(--coral-deep)", letterSpacing: "-0.5px" }}
        >
          Casa<span style={{ color: "var(--black)" }}>Minga</span>
        </Link>

        {/* Barre de recherche */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--gray)" strokeWidth="2.5" strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher un événement, un lieu…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-full border py-2 pl-9 pr-4 text-sm"
            style={{
              borderColor: "var(--gray-mid)",
              background: "var(--gray-light)",
              color: "var(--black)",
              outline: "none",
            }}
          />
        </div>

        {/* Sélecteur de ville */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--coral-deep)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="border-0 bg-transparent text-sm font-semibold"
            style={{ color: "var(--black)", cursor: "pointer" }}
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Lien adhérent */}
        <Link
          to="/"
          className="hidden shrink-0 text-sm font-semibold sm:block"
          style={{ color: "var(--coral-deep)" }}
        >
          Espace adhérent
        </Link>
      </div>
    </header>
  );
}
