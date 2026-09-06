import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Heart, Users, Calendar } from "lucide-react";
import {
  fetchDiscoveryEvents,
  fetchPublicOrgs,
  fetchPublicEstablishments,
} from "../lib/supabase";
import type { PublicEvent, PublicOrg, PublicEstablishment } from "../lib/supabase";
import { isToday, isThisWeekend } from "../lib/event-meta";
import { SiteHeader, HELLOASSO_ADHESION } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { HeroBanner } from "../components/HeroBanner";
import { EbCategoryIcons } from "../components/eb/EbCategoryIcons";
import { EbTabs } from "../components/eb/EbTabs";
import type { TabId } from "../components/eb/EbTabs";
import { EbFilterBar } from "../components/eb/EbFilterBar";
import { EbEventGrid } from "../components/eb/EbEventGrid";
import { EbLieuxTiles } from "../components/eb/EbLieuxTiles";
import { EbMap } from "../components/eb/EbMap";

/**
 * Accueil PORTAIL (route `/`) : découverte des événements et des lieux du
 * réseau, façon annuaire public. Remplace l'accueil institutionnel
 * (src/pages/Accueil.tsx, conservé hors routing).
 *
 * Conformité Ad Grant : la mention de l'association éditrice reste visible sur
 * la page (bande « Casaminga est la plateforme de La Manufacture des Pays »)
 * et le SiteFooter porte l'identité légale complète.
 *
 * Tout le filtrage est client (aucune requête au changement de filtre) et
 * chaque contrôle est réellement câblé — aucun bouton inerte, aucun lien mort.
 */

/** Extrait une ville depuis une adresse postale libre (best effort). */
function extractCity(address: string | null): string | null {
  if (!address) return null;
  const match = address.match(/\d{5}\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]+)$/);
  if (match) return match[1].trim();
  const parts = address.split(",");
  const last = parts[parts.length - 1].trim();
  return last || null;
}

export function AccueilPortail() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [establishments, setEstablishments] = useState<PublicEstablishment[]>([]);
  const [loading, setLoading] = useState(true);
  /** Supabase injoignable : la page reste servie, seuls les contenus manquent. */
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [tab, setTab] = useState<TabId>("tous");
  const [category, setCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<"tous" | "gratuit" | "payant">("tous");
  const [lieuFilter, setLieuFilter] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchDiscoveryEvents(100), fetchPublicOrgs(), fetchPublicEstablishments()])
      .then(([ev, or, es]) => {
        if (!alive) return;
        setEvents(ev);
        setOrgs(or);
        setEstablishments(es);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
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
      const ids = new Set(
        orgs.filter((o) => o.address?.toLowerCase().includes(lc)).map((o) => o.id)
      );
      result = result.filter((e) => ids.has(e.organization_id));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          orgMap.get(e.organization_id)?.name.toLowerCase().includes(q)
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
    setSearch("");
    setCity("");
    setTab("tous");
    setCategory(null);
    setPriceFilter("tous");
    setLieuFilter(null);
  }

  const hasFilter =
    search.trim() !== "" ||
    city !== "" ||
    tab !== "tous" ||
    category !== null ||
    priceFilter !== "tous" ||
    lieuFilter !== null;

  /** Aucun événement publié du tout (ou base injoignable) → pas de UI de filtres. */
  /**
   * Nombre d'événements par type, calculé sur TOUS les événements à venir et
   * non sur la liste filtrée : sinon, choisir une catégorie ferait disparaître
   * toutes les autres pastilles.
   */
  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of events) m[e.type] = (m[e.type] ?? 0) + 1;
    return m;
  }, [events]);

  const noEventsAtAll = !loading && events.length === 0;
  const locatedCount = establishments.filter(
    (e) => e.latitude != null && e.longitude != null
  ).length;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        {/* ── (a0) Bannière vidéo ─────────────────────────────── */}
        <HeroBanner />

        {/* ── (a) Hero découverte ─────────────────────────────── */}
        <section
          style={{
            background: "linear-gradient(180deg, var(--peach-pale) 0%, var(--cream) 100%)",
            borderBottom: "1px solid var(--gray-mid)",
          }}
        >
          <div className="wrap" style={{ padding: "clamp(40px,6vw,72px) 28px" }}>
            <span className="eyebrow">L'agenda des lieux du réseau</span>
            {/* h2 : le h1 de la page est porté par la bannière ci-dessus. */}
            <h2 style={{ maxWidth: "18ch", fontSize: "clamp(30px,4.4vw,46px)", lineHeight: 1.08 }}>
              Découvrez et faites vivre les lieux près de chez vous
            </h2>
            <p className="lead" style={{ marginTop: "20px" }}>
              Ateliers de la main, concerts, chantiers participatifs, expositions, rencontres :
              retrouvez ici tous les rendez-vous ouverts des tiers-lieux animés par le réseau
              Casaminga. Poussez la porte de celui qui est le plus proche de chez vous — la
              plupart des rendez-vous sont gratuits et ouverts à toutes et tous.
            </p>

            {/* Recherche + ville : filtrage client immédiat (contrôles câblés). */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <label className="relative block w-full sm:w-auto sm:min-w-[320px]">
                <span className="sr-only">Rechercher un événement ou un lieu</span>
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--gray)" }}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un événement, un lieu…"
                  className="w-full rounded-full border py-3 pl-10 pr-4 text-sm"
                  style={{
                    borderColor: "var(--gray-mid)",
                    background: "#fff",
                    color: "var(--black)",
                  }}
                />
              </label>

              {cities.length > 0 && (
                <label className="relative block">
                  <span className="sr-only">Filtrer par ville</span>
                  <MapPin
                    size={15}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--gray)" }}
                  />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="appearance-none rounded-full border py-3 pl-9 pr-6 text-sm font-medium"
                    style={{
                      borderColor: city ? "var(--coral)" : "var(--gray-mid)",
                      background: "#fff",
                      color: city ? "var(--coral-deep)" : "var(--gray)",
                    }}
                  >
                    <option value="">Toutes les villes</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <a href="#evenements" className="btn btn-primary">
                Voir les événements
              </a>
            </div>
          </div>
        </section>

        {/* ── (b) Découverte d'événements ─────────────────────── */}
        {!noEventsAtAll && (
          <EbCategoryIcons
            activeCategory={category}
            onCategoryChange={setCategory}
            counts={typeCounts}
          />
        )}

        <section id="evenements" className="wrap" style={{ padding: "clamp(32px,5vw,48px) 28px" }}>
          <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)" }}>
            {city ? `Événements à ${city}` : "Les prochains rendez-vous"}
          </h2>

          {noEventsAtAll ? (
            <div
              className="card mt-6"
              style={{ borderStyle: "dashed", padding: "clamp(32px,5vw,56px)", textAlign: "center" }}
            >
              <p style={{ fontWeight: 600, color: "var(--black)", fontSize: "18px" }}>
                {loadError
                  ? "L'agenda n'a pas pu être chargé pour le moment."
                  : "Aucun rendez-vous public n'est programmé pour l'instant."}
              </p>
              <p className="lead" style={{ margin: "12px auto 0" }}>
                {loadError
                  ? "Le problème vient de chez nous, pas de vous : réessayez dans quelques minutes. Vous pouvez aussi nous écrire, nous vous indiquerons les prochains rendez-vous."
                  : "Les lieux du réseau préparent la suite. En attendant, découvrez l'association qui les anime ou écrivez-nous pour être prévenu des prochaines dates."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/association" className="btn btn-primary">
                  Découvrir l'association
                </Link>
                <Link to="/contact" className="btn btn-secondary">
                  Nous contacter
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-5">
                <EbTabs active={tab} onTabChange={setTab} />
              </div>

              <div className="mt-5">
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

              <div className="mt-6">
                {/* EbEventGrid gère lui-même : squelettes (loading) et message
                    « aucun événement pour ces critères » (liste filtrée vide). */}
                <EbEventGrid events={filteredEvents} orgMap={orgMap} loading={loading} />
              </div>

              {!loading && filteredEvents.length === 0 && hasFilter && (
                <div className="mt-6 text-center">
                  <button type="button" onClick={resetFilters} className="btn btn-secondary btn-sm">
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── (c) Lieux du réseau ─────────────────────────────── */}
        <div className="border-t" style={{ borderColor: "var(--gray-mid)" }}>
          {loading ? (
            <section className="bg-white py-12">
              <div className="wrap">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-[10px]"
                      style={{ background: "var(--gray-light)" }}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : orgs.length > 0 ? (
            <EbLieuxTiles orgs={orgs} eventCounts={eventCounts} />
          ) : (
            <section className="bg-white py-12">
              <div className="wrap" style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)" }}>Les lieux du réseau</h2>
                <p className="lead" style={{ margin: "14px auto 0" }}>
                  {loadError
                    ? "La liste des lieux n'a pas pu être chargée. Réessayez dans quelques minutes ou écrivez-nous."
                    : "Les vitrines des lieux arrivent. En attendant, l'association qui les anime se présente sur sa page dédiée."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to="/association" className="btn btn-primary">
                    Découvrir l'association
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Carte : affichée seulement s'il existe au moins un lieu géolocalisé. */}
          {!loading && locatedCount > 0 && (
            <section
              className="border-t"
              style={{ borderColor: "var(--gray-mid)", background: "var(--cream-warm)" }}
            >
              <div className="wrap" style={{ padding: "clamp(32px,5vw,48px) 28px" }}>
                <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)" }}>Le réseau sur la carte</h2>
                <p className="lead" style={{ marginTop: "10px", marginBottom: "22px" }}>
                  Cliquez sur un point pour ouvrir la vitrine du lieu.
                </p>
                <EbMap establishments={establishments} orgMap={orgMap} />
              </div>
            </section>
          )}
        </div>

        {/* ── (d) Agir ────────────────────────────────────────── */}
        <section
          className="border-t"
          style={{ borderColor: "var(--gray-mid)", background: "var(--cream)" }}
        >
          <div className="wrap" style={{ padding: "clamp(40px,6vw,72px) 28px" }}>
            <div className="section-head">
              <span className="eyebrow mint">Participer</span>
              <h2>Trois façons de faire vivre le réseau</h2>
              <p className="lead">
                Casaminga est animé par une association et par des bénévoles. Chaque adhésion,
                chaque coup de main fait tourner les ateliers et garde les lieux ouverts.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <article className="card" style={{ padding: "28px" }}>
                <Heart size={22} aria-hidden="true" style={{ color: "var(--coral-deep)" }} />
                <h3 style={{ fontSize: "20px", marginTop: "14px" }}>Adhérer</h3>
                <p className="lead" style={{ marginTop: "10px", maxWidth: "none" }}>
                  Rejoignez La Manufacture des Pays : l'adhésion soutient l'association et vous
                  ouvre la vie du réseau, ses chantiers et ses assemblées.
                </p>
                <a
                  href={HELLOASSO_ADHESION}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm mt-5"
                >
                  Adhérer sur HelloAsso
                </a>
              </article>

              <article className="card" style={{ padding: "28px" }}>
                <Users size={22} aria-hidden="true" style={{ color: "var(--coral-deep)" }} />
                <h3 style={{ fontSize: "20px", marginTop: "14px" }}>Soutenir</h3>
                <p className="lead" style={{ marginTop: "10px", maxWidth: "none" }}>
                  Découvrez la mission de l'association, ses actions de terrain et les façons de
                  l'accompagner dans la durée.
                </p>
                <Link to="/association" className="btn btn-secondary btn-sm mt-5">
                  Découvrir l'association
                </Link>
              </article>

              <article className="card" style={{ padding: "28px" }}>
                <Calendar size={22} aria-hidden="true" style={{ color: "var(--coral-deep)" }} />
                <h3 style={{ fontSize: "20px", marginTop: "14px" }}>Devenir bénévole</h3>
                <p className="lead" style={{ marginTop: "10px", maxWidth: "none" }}>
                  Un chantier, un atelier, un accueil à tenir : dites-nous ce que vous aimez faire,
                  nous vous mettons en lien avec le lieu le plus proche.
                </p>
                <Link to="/contact" className="btn btn-secondary btn-sm mt-5">
                  Nous écrire
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ── (e) Mention association (obligatoire Ad Grant) ──── */}
        <section
          style={{
            background: "var(--peach-pale)",
            borderTop: "1px solid var(--peach)",
            borderBottom: "1px solid var(--peach)",
          }}
        >
          <div
            className="wrap flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ padding: "24px 28px" }}
          >
            <div>
              <p style={{ fontWeight: 600, color: "var(--black)" }}>
                Casaminga est la plateforme de La Manufacture des Pays, association loi 1901.
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--gray)",
                  marginTop: "4px",
                  maxWidth: "78ch",
                  lineHeight: 1.6,
                }}
              >
                L'association réunit des bénévoles autour du faire, du lien social et de la
                transmission, et rend publique ici la vie des lieux qu'elle anime.
              </p>
            </div>
            <Link to="/association" className="btn btn-secondary btn-sm shrink-0">
              L'association →
            </Link>
          </div>
        </section>

        {/* ── (f) Bandeau pro discret ─────────────────────────── */}
        <div style={{ background: "var(--gray-light)" }}>
          <div className="wrap flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--black)" }}>
                Vous êtes une association ou un tiers-lieu ?
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--gray)" }}>
                Gérez vos membres, vos événements et vos financements dans un seul outil.
              </p>
            </div>
            <a
              href="https://admin.casaminga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ borderColor: "var(--gray-mid)", color: "var(--black)", background: "#fff" }}
            >
              Découvrir l'espace gestion →
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
