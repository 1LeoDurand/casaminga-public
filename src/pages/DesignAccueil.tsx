import { useState, useEffect, useMemo } from "react";
import { fetchDiscoveryEvents, fetchPublicOrgs } from "../lib/supabase";
import type { PublicEvent, PublicOrg } from "../lib/supabase";
import { isToday, isThisWeekend } from "../lib/event-meta";
import { EbHeader } from "../components/eb/EbHeader";
import { EbPromoBanner } from "../components/eb/EbPromoBanner";
import { EbCategoryIcons } from "../components/eb/EbCategoryIcons";
import { EbTabs } from "../components/eb/EbTabs";
import type { TabId } from "../components/eb/EbTabs";
import { EbFilterBar } from "../components/eb/EbFilterBar";
import { EbEventGrid } from "../components/eb/EbEventGrid";
import { EbMap } from "../components/eb/EbMap";
import { EbLieuxTiles } from "../components/eb/EbLieuxTiles";

function extractCity(address: string | null): string | null {
  if (!address) return null;
  const match = address.match(/\d{5}\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]+)$/);
  if (match) return match[1].trim();
  const parts = address.split(",");
  const last = parts[parts.length - 1].trim();
  return last || null;
}

export function DesignAccueil() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [tab, setTab] = useState<TabId>("tous");
  const [category, setCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<"tous" | "gratuit" | "payant">("tous");
  const [lieuFilter, setLieuFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"liste" | "carte">("liste");

  useEffect(() => {
    Promise.all([fetchDiscoveryEvents(100), fetchPublicOrgs()])
      .then(([ev, or]) => {
        setEvents(ev);
        setOrgs(or);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const orgMap = useMemo(() => {
    const m = new Map<string, PublicOrg>();
    for (const o of orgs) m.set(o.id, o);
    return m;
  }, [orgs]);

  const eventCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) {
      m.set(e.organization_id, (m.get(e.organization_id) ?? 0) + 1);
    }
    return m;
  }, [events]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const org of orgs) {
      const c = extractCity(org.address);
      if (c) set.add(c);
    }
    return Array.from(set).sort();
  }, [orgs]);

  const filteredEvents = useMemo(() => {
    let result = events;

    // Filtre ville (via org.address)
    if (city) {
      const lc = city.toLowerCase();
      const orgIdsInCity = new Set(
        orgs.filter((o) => o.address?.toLowerCase().includes(lc)).map((o) => o.id)
      );
      result = result.filter((e) => orgIdsInCity.has(e.organization_id));
    }

    // Recherche texte
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          orgMap.get(e.organization_id)?.name.toLowerCase().includes(q)
      );
    }

    // Onglet
    if (tab === "aujourdhui") result = result.filter((e) => isToday(e.start_at));
    else if (tab === "weekend") result = result.filter((e) => isThisWeekend(e.start_at));
    // "pourVous" = same as "tous" (pas d'auth publique)

    // Catégorie
    if (category) result = result.filter((e) => e.type === category);

    // Prix
    if (priceFilter === "gratuit") result = result.filter((e) => !e.price || e.price === 0);
    else if (priceFilter === "payant") result = result.filter((e) => !!e.price && e.price > 0);

    // Lieu
    if (lieuFilter) result = result.filter((e) => e.organization_id === lieuFilter);

    return result;
  }, [events, orgs, orgMap, city, search, tab, category, priceFilter, lieuFilter]);

  function resetFilters() {
    setSearch("");
    setCity("");
    setTab("tous");
    setCategory(null);
    setPriceFilter("tous");
    setLieuFilter(null);
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <EbHeader
        search={search}
        onSearch={setSearch}
        city={city}
        cities={cities}
        onCityChange={setCity}
      />

      <EbPromoBanner />

      <EbCategoryIcons activeCategory={category} onCategoryChange={setCategory} />

      {/* Zone principale */}
      <main id="evenements" className="wrap py-8">
        {/* Titre ville */}
        <p className="mb-4 text-lg font-bold" style={{ color: "var(--black)" }}>
          {city
            ? `Événements à ${city}`
            : "Tous les événements du réseau"}
        </p>

        {/* Onglets */}
        <div className="mb-4">
          <EbTabs active={tab} onTabChange={setTab} />
        </div>

        {/* Filtres secondaires */}
        <div className="mb-6">
          <EbFilterBar
            priceFilter={priceFilter}
            onPriceChange={setPriceFilter}
            lieuFilter={lieuFilter}
            onLieuChange={setLieuFilter}
            category={category}
            onCategoryChange={setCategory}
            orgs={orgs}
            totalCount={filteredEvents.length}
          />
        </div>

        {/* Toggle Liste / Carte */}
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("liste")}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all"
            style={{
              background: viewMode === "liste" ? "var(--black)" : "#fff",
              color: viewMode === "liste" ? "#fff" : "var(--gray)",
              borderColor: viewMode === "liste" ? "var(--black)" : "var(--gray-mid)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Liste
          </button>
          <button
            type="button"
            onClick={() => setViewMode("carte")}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all"
            style={{
              background: viewMode === "carte" ? "var(--black)" : "#fff",
              color: viewMode === "carte" ? "#fff" : "var(--gray)",
              borderColor: viewMode === "carte" ? "var(--black)" : "var(--gray-mid)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Carte
          </button>
        </div>

        {/* Contenu : grille ou carte */}
        {viewMode === "liste" ? (
          <EbEventGrid events={filteredEvents} orgMap={orgMap} loading={loading} />
        ) : (
          <EbMap orgs={orgs} eventCounts={eventCounts} />
        )}

        {/* Message si aucun résultat ET filtres actifs */}
        {!loading && filteredEvents.length === 0 && viewMode === "liste" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </main>

      {/* Tuiles des lieux */}
      <div className="border-t" style={{ borderColor: "var(--gray-mid)" }}>
        <EbLieuxTiles orgs={orgs} eventCounts={eventCounts} />
      </div>

      {/* Footer minimal */}
      <footer
        className="border-t py-8 text-center text-sm"
        style={{ borderColor: "var(--gray-mid)", color: "var(--gray)" }}
      >
        <div className="wrap">
          <p>
            <span className="font-bold" style={{ color: "var(--coral-deep)" }}>CasaMinga</span>
            {" "}— le réseau des tiers-lieux
          </p>
          <p className="mt-1 text-xs">
            <a href="/" style={{ color: "var(--gray)" }}>Retour à l'accueil</a>
            {" · "}
            <a href="https://admin.casaminga.com" style={{ color: "var(--gray)" }}>Espace adhérent</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
