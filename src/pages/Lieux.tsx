import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ArrowRight, CalendarDays } from "lucide-react";
import {
  fetchDiscoveryEvents,
  fetchPublicOrgs,
  fetchPublicEstablishments,
} from "../lib/supabase";
import type { PublicEvent, PublicOrg, PublicEstablishment } from "../lib/supabase";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { EbMap } from "../components/eb/EbMap";

/**
 * Page « Les lieux du réseau » (route `/lieux`).
 *
 * Annuaire public des lieux animés par La Manufacture des Pays : carte,
 * liste complète et filtres 100 % client. Chaque carte ouvre la vitrine du
 * lieu (`/<slug>`).
 *
 * Règles de la revue Ad Grant respectées ici :
 * - aucun contrôle inerte (recherche et filtre ville filtrent réellement) ;
 * - aucune liste figée : les villes proposées viennent uniquement des données ;
 * - tous les états sont rédigés (chargement, base vide, Supabase injoignable) ;
 * - aucun lien mort : seules des routes existantes sont référencées.
 */

/**
 * Extrait une ville depuis une adresse postale libre (best effort).
 * Volontairement dupliqué depuis AccueilPortail.tsx : cette page ne doit pas
 * modifier l'accueil, et la fonction reste locale à chaque écran.
 */
function extractCity(address: string | null): string | null {
  if (!address) return null;
  const match = address.match(/\d{5}\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]+)$/);
  if (match) return match[1].trim();
  const parts = address.split(",");
  const last = parts[parts.length - 1].trim();
  return last || null;
}

/** Comparaison insensible à la casse et aux accents. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Tronque un texte sur une frontière de mot (pas de coupe au milieu d'un mot). */
function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

export function Lieux() {
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [establishments, setEstablishments] = useState<PublicEstablishment[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  /** Supabase injoignable : la page reste servie, seuls les contenus manquent. */
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([fetchPublicOrgs(), fetchPublicEstablishments(), fetchDiscoveryEvents(100)])
      .then(([or, es, ev]) => {
        if (!alive) return;
        setOrgs(or);
        setEstablishments(es);
        setEvents(ev);
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

  /** Nombre d'événements à venir par lieu (0 est le cas normal aujourd'hui). */
  const eventCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.organization_id, (m.get(e.organization_id) ?? 0) + 1);
    return m;
  }, [events]);

  /**
   * Ville d'un lieu : celle de son établissement géolocalisé si elle existe,
   * sinon déduite de l'adresse de l'organisation.
   */
  const cityByOrg = useMemo(() => {
    const m = new Map<string, string>();
    for (const est of establishments) {
      const c = est.city?.trim();
      if (c && !m.has(est.organization_id)) m.set(est.organization_id, c);
    }
    for (const org of orgs) {
      if (m.has(org.id)) continue;
      const c = extractCity(org.address);
      if (c) m.set(org.id, c);
    }
    return m;
  }, [orgs, establishments]);

  /** Villes réellement présentes dans les données — jamais de liste figée. */
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const org of orgs) {
      const c = cityByOrg.get(org.id);
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [orgs, cityByOrg]);

  const filteredOrgs = useMemo(() => {
    let result = orgs;
    if (city) result = result.filter((o) => cityByOrg.get(o.id) === city);
    const q = normalize(search.trim());
    if (q) {
      result = result.filter((o) =>
        [o.name, o.structure ?? "", o.description ?? "", cityByOrg.get(o.id) ?? ""]
          .some((field) => normalize(field).includes(q))
      );
    }
    return result;
  }, [orgs, cityByOrg, city, search]);

  const hasFilter = search.trim() !== "" || city !== "";

  function resetFilters() {
    setSearch("");
    setCity("");
  }

  const noOrgsAtAll = !loading && orgs.length === 0;
  const locatedCount = establishments.filter(
    (e) => e.latitude != null && e.longitude != null
  ).length;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        {/* ── (a) Intro rédigée ────────────────────────────────── */}
        <section
          style={{
            background: "linear-gradient(180deg, var(--peach-pale) 0%, var(--cream) 100%)",
            borderBottom: "1px solid var(--gray-mid)",
          }}
        >
          <div className="wrap" style={{ padding: "clamp(40px,6vw,72px) 28px" }}>
            <span className="eyebrow">Annuaire du réseau</span>
            <h1 style={{ maxWidth: "18ch" }}>Les lieux du réseau</h1>
            <p className="lead" style={{ marginTop: "20px" }}>
              Le réseau animé par La Manufacture des Pays rassemble des tiers-lieux, des ateliers
              partagés et des écolieux qui ont un point commun&nbsp;: on y fait des choses
              ensemble. Selon les endroits, on y trouve un atelier bois ou métal, une cuisine
              collective, une salle ouverte aux associations du coin, un jardin, un chantier
              participatif en cours, ou simplement une table où l'on peut s'asseoir et discuter.
            </p>
            <p className="lead" style={{ marginTop: "12px" }}>
              Chaque lieu garde son histoire, son équipe et son rythme&nbsp;: l'association ne les
              uniformise pas, elle les met en lien et rend leur vie publique visible ici. Ouvrez la
              fiche d'un lieu pour découvrir qui l'anime, ce qu'on peut y faire, les espaces
              disponibles et les prochains rendez-vous. Puis poussez la porte — la plupart de ces
              lieux accueillent sans rendez-vous, et personne n'y est de trop.
            </p>
          </div>
        </section>

        {/* ── (b) Carte : uniquement s'il existe un lieu géolocalisé ── */}
        {!loading && locatedCount > 0 && (
          <section
            className="border-b"
            style={{ background: "var(--cream-warm)", borderColor: "var(--gray-mid)" }}
          >
            <div className="wrap" style={{ padding: "clamp(32px,5vw,48px) 28px" }}>
              <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)" }}>Le réseau sur la carte</h2>
              <p className="lead" style={{ marginTop: "10px", marginBottom: "22px" }}>
                {locatedCount === 1
                  ? "Un lieu du réseau est situé sur la carte. Cliquez sur le point pour ouvrir sa fiche."
                  : `${locatedCount} lieux du réseau sont situés sur la carte. Cliquez sur un point pour ouvrir la fiche correspondante.`}
              </p>
              <EbMap establishments={establishments} orgMap={orgMap} />
            </div>
          </section>
        )}

        {/* ── (c)+(d) Annuaire et filtres ──────────────────────── */}
        <section className="wrap" style={{ padding: "clamp(36px,5vw,56px) 28px" }}>
          <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)" }}>
            {city ? `Les lieux à ${city}` : "Tous les lieux"}
          </h2>

          {noOrgsAtAll ? (
            <div
              className="card mt-6"
              style={{
                borderStyle: "dashed",
                padding: "clamp(32px,5vw,56px)",
                textAlign: "center",
              }}
            >
              <p style={{ fontWeight: 600, color: "var(--black)", fontSize: "18px" }}>
                {loadError
                  ? "L'annuaire des lieux n'a pas pu être chargé pour le moment."
                  : "Aucun lieu n'est encore publié dans l'annuaire."}
              </p>
              <p className="lead" style={{ margin: "12px auto 0" }}>
                {loadError
                  ? "Le problème vient de chez nous, pas de vous : réessayez dans quelques minutes. Vous pouvez aussi nous écrire, nous vous orienterons vers le lieu le plus proche."
                  : "Les vitrines des lieux sont en préparation. En attendant, découvrez l'association qui les anime, ou écrivez-nous : nous vous indiquerons le lieu le plus proche de chez vous."}
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
              {/* Filtres : recherche texte + ville. Filtrage client immédiat. */}
              {!loading && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <label className="relative block w-full sm:w-auto sm:min-w-[320px]">
                    <span className="sr-only">Rechercher un lieu</span>
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
                      placeholder="Rechercher un lieu, une ville…"
                      className="w-full rounded-full border py-3 pl-10 pr-4 text-sm"
                      style={{
                        borderColor: "var(--gray-mid)",
                        background: "#fff",
                        color: "var(--black)",
                      }}
                    />
                  </label>

                  {cities.length > 1 && (
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

                  <span className="text-sm" style={{ color: "var(--gray)" }} aria-live="polite">
                    {hasFilter
                      ? `${filteredOrgs.length} lieu${filteredOrgs.length > 1 ? "x" : ""} sur ${orgs.length}`
                      : `${orgs.length} lieu${orgs.length > 1 ? "x" : ""} dans le réseau`}
                  </span>

                  {/* Le même bouton est proposé dans l'état « aucun résultat »
                      ci-dessous : on ne l'affiche ici que si la liste est remplie. */}
                  {hasFilter && filteredOrgs.length > 0 && (
                    <button type="button" onClick={resetFilters} className="btn btn-secondary btn-sm">
                      Réinitialiser
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                /* Squelettes cohérents avec l'accueil portail. */
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-[10px]"
                      style={{ background: "var(--gray-light)" }}
                    />
                  ))}
                </div>
              ) : filteredOrgs.length === 0 ? (
                <div
                  className="card mt-7"
                  style={{ borderStyle: "dashed", padding: "clamp(28px,4vw,44px)", textAlign: "center" }}
                >
                  <p style={{ fontWeight: 600, color: "var(--black)", fontSize: "18px" }}>
                    Aucun lieu ne correspond à cette recherche.
                  </p>
                  <p className="lead" style={{ margin: "12px auto 0" }}>
                    Essayez un autre mot ou affichez de nouveau toutes les villes du réseau.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button type="button" onClick={resetFilters} className="btn btn-secondary btn-sm">
                      Réinitialiser
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOrgs.map((org) => {
                    const orgCity = cityByOrg.get(org.id);
                    const count = eventCounts.get(org.id) ?? 0;
                    return (
                      <Link
                        key={org.id}
                        to={`/${org.slug}`}
                        className="card group flex flex-col"
                        style={{ overflow: "hidden" }}
                      >
                        {/* Bandeau à la couleur du lieu (cohérent avec l'accueil). */}
                        <div
                          className="h-2 w-full shrink-0"
                          style={{ background: org.primary_color ?? "var(--coral)" }}
                        />
                        <div className="flex flex-1 flex-col p-5">
                          <p
                            className="font-semibold leading-snug"
                            style={{ color: "var(--black)", fontSize: "16px" }}
                          >
                            {org.name}
                          </p>
                          {org.structure && (
                            <p className="mt-1 text-xs" style={{ color: "var(--gray)" }}>
                              {org.structure}
                            </p>
                          )}
                          {orgCity && (
                            <p
                              className="mt-2 flex items-center gap-1.5 text-xs font-medium"
                              style={{ color: "var(--coral-deep)" }}
                            >
                              <MapPin size={12} aria-hidden="true" className="shrink-0" />
                              {orgCity}
                            </p>
                          )}
                          {org.description && (
                            <p
                              className="mt-3 line-clamp-4 text-sm"
                              style={{ color: "var(--gray)", lineHeight: 1.6 }}
                            >
                              {truncate(org.description)}
                            </p>
                          )}

                          <div className="mt-auto flex items-center justify-between pt-4">
                            {count > 0 ? (
                              <span
                                className="flex items-center gap-1.5 text-xs font-semibold"
                                style={{ color: "var(--coral-deep)" }}
                              >
                                <CalendarDays size={12} aria-hidden="true" />
                                {count} rendez-vous à venir
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: "var(--gray)" }}>
                                Voir la fiche du lieu
                              </span>
                            )}
                            <ArrowRight
                              size={15}
                              aria-hidden="true"
                              className="shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
                              style={{ color: "var(--coral-deep)" }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── (e) Renvois de fin de page ───────────────────────── */}
        <section
          className="border-t"
          style={{ borderColor: "var(--gray-mid)", background: "var(--cream-warm)" }}
        >
          <div
            className="wrap flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ padding: "28px" }}
          >
            <p className="lead" style={{ margin: 0 }}>
              Ces lieux sont animés par La Manufacture des Pays et ses bénévoles&nbsp;: leurs
              rendez-vous ouverts sont rassemblés dans l'agenda du réseau.
            </p>
            <div className="flex flex-wrap gap-3 sm:shrink-0">
              <Link to="/agenda" className="btn btn-secondary btn-sm">
                Voir les prochains rendez-vous
              </Link>
              <Link to="/association" className="btn btn-secondary btn-sm">
                L'association
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
