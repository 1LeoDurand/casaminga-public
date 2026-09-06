import { useState, useEffect, useMemo } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { fetchDiscoveryEvents, fetchPublicOrgs, fetchPublicEstablishments } from "../lib/supabase";
import type { PublicEvent, PublicOrg, PublicEstablishment } from "../lib/supabase";
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

/**
 * MAQUETTE HORS ROUTING — la route /design-accueil a été retirée de main.tsx :
 * son contenu (découverte d'événements + lieux + carte) est désormais servi par
 * src/pages/AccueilPortail.tsx sur « / ». Ce fichier est conservé comme
 * référence de composition ; il n'est importé par aucun module rendu.
 * Ses liens internes vers /design-accueil ne sont donc jamais servis — les
 * réactiver imposerait de recréer la route.
 */
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
  const [establishments, setEstablishments] = useState<PublicEstablishment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [tab, setTab] = useState<TabId>("tous");
  const [category, setCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<"tous" | "gratuit" | "payant">("tous");
  const [lieuFilter, setLieuFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"liste" | "carte">("liste");

  useEffect(() => {
    Promise.all([fetchDiscoveryEvents(100), fetchPublicOrgs(), fetchPublicEstablishments()])
      .then(([ev, or, es]) => { setEvents(ev); setOrgs(or); setEstablishments(es); })
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
    for (const e of events) m.set(e.organization_id, (m.get(e.organization_id) ?? 0) + 1);
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
    if (city) {
      const lc = city.toLowerCase();
      const ids = new Set(orgs.filter((o) => o.address?.toLowerCase().includes(lc)).map((o) => o.id));
      result = result.filter((e) => ids.has(e.organization_id));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || orgMap.get(e.organization_id)?.name.toLowerCase().includes(q)
      );
    }
    if (tab === "aujourdhui") result = result.filter((e) => isToday(e.start_at));
    else if (tab === "weekend") result = result.filter((e) => isThisWeekend(e.start_at));
    if (category) result = result.filter((e) => e.type === category);
    if (priceFilter === "gratuit") result = result.filter((e) => !e.price || e.price === 0);
    else if (priceFilter === "payant") result = result.filter((e) => !!e.price && e.price > 0);
    if (lieuFilter) result = result.filter((e) => e.organization_id === lieuFilter);
    return result;
  }, [events, orgs, orgMap, city, search, tab, category, priceFilter, lieuFilter]);

  function resetFilters() {
    setSearch(""); setCity(""); setTab("tous");
    setCategory(null); setPriceFilter("tous"); setLieuFilter(null);
  }

  const toggleBtn = (active: boolean) => ({
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    padding: "7px 14px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .15s",
    background: active ? "var(--black)" : "#fff",
    color: active ? "#fff" : "var(--gray)",
    borderColor: active ? "var(--black)" : "var(--gray-mid)",
  });

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <EbHeader search={search} onSearch={setSearch} city={city} cities={cities} onCityChange={setCity} />
      <EbPromoBanner />
      <EbCategoryIcons
        activeCategory={category}
        onCategoryChange={setCategory}
        counts={events.reduce<Record<string, number>>((m, e) => ({ ...m, [e.type]: (m[e.type] ?? 0) + 1 }), {})}
      />

      <main id="evenements" className="wrap py-10">
        {/* Titre */}
        <p className="mb-5 text-xl font-bold" style={{ color: "var(--black)" }}>
          {city ? `Événements à ${city}` : "Tous les événements"}
        </p>

        {/* Onglets */}
        <div className="mb-5">
          <EbTabs active={tab} onTabChange={setTab} />
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <EbFilterBar
            priceFilter={priceFilter} onPriceChange={setPriceFilter}
            lieuFilter={lieuFilter} onLieuChange={setLieuFilter}
            category={category} onCategoryChange={setCategory}
            orgs={orgs} totalCount={filteredEvents.length}
          />
        </div>

        {/* Toggle Liste / Carte */}
        <div className="mb-6 flex gap-2">
          <button type="button" onClick={() => setViewMode("liste")} style={toggleBtn(viewMode === "liste")}>
            <List size={14} aria-hidden="true" /> Liste
          </button>
          <button type="button" onClick={() => setViewMode("carte")} style={toggleBtn(viewMode === "carte")}>
            <MapIcon size={14} aria-hidden="true" /> Carte
          </button>
        </div>

        {viewMode === "liste" ? (
          <EbEventGrid events={filteredEvents} orgMap={orgMap} loading={loading} />
        ) : (
          <EbMap establishments={establishments} orgMap={orgMap} />
        )}

        {!loading && filteredEvents.length === 0 && viewMode === "liste" && (
          <div className="mt-6 text-center">
            <button type="button" onClick={resetFilters} className="btn btn-secondary btn-sm">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      {/* Lieux */}
      <div className="border-t" style={{ borderColor: "var(--gray-mid)" }}>
        <EbLieuxTiles orgs={orgs} eventCounts={eventCounts} />
      </div>

      {/* Encart cross-sell asso — discret */}
      <div className="border-t" style={{ borderColor: "var(--gray-mid)", background: "var(--gray-light)" }}>
        <div className="wrap flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--black)" }}>
              Vous êtes une association ou un tiers-lieu ?
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "var(--gray)" }}>
              Gérez vos membres, événements et financements en un seul outil.
            </p>
          </div>
          <a
            href="https://admin.casaminga.com"
            className="shrink-0 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ borderColor: "var(--gray-mid)", color: "var(--black)", background: "#fff" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Découvrir le logiciel →
          </a>
        </div>
      </div>

      {/* Footer grand public */}
      <footer className="border-t py-10" style={{ borderColor: "var(--gray-mid)", background: "#fff" }}>
        <div className="wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className="mb-1 text-lg font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: "var(--black)" }}
              >
                CasaMinga
              </p>
              <p className="text-sm" style={{ color: "var(--gray)" }}>
                L'agenda des tiers-lieux près de chez vous.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm" style={{ color: "var(--gray)" }}>
              <a href="/" style={{ color: "var(--gray)" }}>Accueil</a>
              <a href="/design-accueil" style={{ color: "var(--gray)" }}>Événements</a>
              <a href="https://admin.casaminga.com" style={{ color: "var(--gray)" }} target="_blank" rel="noopener noreferrer">
                Espace adhérent
              </a>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-xs" style={{ borderColor: "var(--gray-mid)", color: "var(--gray)" }}>
            © {new Date().getFullYear()} CasaMinga · Photos : Unsplash (licence libre)
          </div>
        </div>
      </footer>
    </div>
  );
}
