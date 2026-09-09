import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, HELLOASSO_ADHESION } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { fetchDiscoveryEvents, fetchPublicOrgs, type PublicEvent, type PublicOrg } from "../lib/supabase";
import { EventCard } from "../components/EventGrid";
import { isToday, isThisWeekend, TYPE_LABELS } from "../lib/event-meta";
import { usePageMeta } from "../lib/seo";

/**
 * Page « Agenda » (item A5 des DIRECTIVES-AD-GRANT.md).
 * Découverte des événements du réseau, ancrée dans la mission de l'association.
 * Filtrage 100 % client (onglets temporels + catégorie), aucune dépendance.
 * État vide rédigé (jamais une page blanche, exigence revue Ad Grant).
 */

type Tab = "tous" | "aujourdhui" | "weekend";

const TABS: { id: Tab; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "weekend", label: "Ce week-end" },
];

export function Agenda() {
  usePageMeta({
    title: "Agenda : les rendez-vous des tiers-lieux Casaminga",
    description:
      "Ateliers, concerts, expositions et chantiers participatifs des lieux animés par La Manufacture des Pays : filtrez par date et catégorie pour trouver le vôtre.",
    canonical: "/agenda",
  });

  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("tous");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    // 400 et non 100 : l'import montpellierain a porte l'agenda a 275 fiches, et
    // le plafond precedent en masquait silencieusement les deux tiers. Le tri et
    // les filtres sont faits cote client, une coupe a la lecture serait invisible.
    Promise.all([fetchDiscoveryEvents(400), fetchPublicOrgs()])
      .then(([e, o]) => { setEvents(e); setOrgs(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const orgMap = useMemo(() => {
    const m = new Map<string, PublicOrg>();
    for (const o of orgs) m.set(o.id, o);
    return m;
  }, [orgs]);

  // Catégories réellement présentes dans les données (pas de filtre vide).
  const cats = useMemo(
    () => Array.from(new Set(events.map((e) => e.type))).filter(Boolean),
    [events]
  );

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (tab === "aujourdhui" && !isToday(e.start_at)) return false;
        if (tab === "weekend" && !isThisWeekend(e.start_at)) return false;
        if (cat && e.type !== cat) return false;
        return true;
      }),
    [events, tab, cat]
  );

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        {/* ── Intro rédigée (ancrage asso) ─────────────────────── */}
        <section className="wrap" style={{ paddingTop: "clamp(48px,7vw,84px)", paddingBottom: "clamp(24px,3vw,36px)" }}>
          <span className="eyebrow">Agenda du réseau</span>
          <h1 style={{ maxWidth: "20ch" }}>Les rendez-vous de La Manufacture des Pays</h1>
          <p className="lead" style={{ marginTop: "18px" }}>
            Cet agenda rassemble les rendez-vous des lieux animés par La Manufacture des Pays et son réseau&nbsp;:
            ateliers de la main, chantiers participatifs, rencontres autour du paysage et du patrimoine,
            expositions et temps de transmission. Chaque événement prolonge la mission de l'association, le Faire,
            le lien social et la co-construction, et la plateforme <strong>Casaminga</strong> les rend visibles et
            accessibles à toutes et tous.
          </p>
          <p className="lead" style={{ marginTop: "12px" }}>
            Filtrez par moment (aujourd'hui, ce week-end) ou par type d'activité, puis ouvrez un événement pour en
            connaître le lieu, l'horaire et les modalités de participation. Les inscriptions et le soutien à
            l'association passent par nos lieux partenaires et par HelloAsso.
          </p>
        </section>

        {/* ── Filtres ──────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "16px" }}>
          <div className="flex flex-wrap items-center gap-2.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`btn btn-sm ${tab === t.id ? "btn-primary" : "btn-secondary"}`}
                aria-pressed={tab === t.id}
              >
                {t.label}
              </button>
            ))}
            {cats.length > 1 && (
              <span style={{ width: 1, height: 22, background: "var(--gray-mid)", margin: "0 6px" }} aria-hidden />
            )}
            {cats.length > 1 && (
              <button
                onClick={() => setCat(null)}
                className={`btn btn-sm ${cat === null ? "btn-primary" : "btn-secondary"}`}
                aria-pressed={cat === null}
              >
                Toutes catégories
              </button>
            )}
            {cats.length > 1 &&
              cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`btn btn-sm ${cat === c ? "btn-primary" : "btn-secondary"}`}
                  aria-pressed={cat === c}
                >
                  {TYPE_LABELS[c] ?? c}
                </button>
              ))}
          </div>
        </section>

        {/* ── Grille / états ───────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(56px,8vw,88px)", paddingTop: "16px" }}>
          {loading ? (
            <p className="lead">Chargement de l'agenda…</p>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "34px" }}>🗓️</div>
              <h2 style={{ fontSize: "22px", marginTop: "12px" }}>
                {events.length === 0
                  ? "Pas d'événement à venir pour le moment"
                  : "Aucun événement pour ce filtre"}
              </h2>
              <p className="lead" style={{ margin: "12px auto 0" }}>
                {events.length === 0
                  ? "Le réseau prépare ses prochains rendez-vous. En attendant, découvrez l'association et ses actions, ou soutenez-la."
                  : "Essayez un autre moment ou une autre catégorie."}
              </p>
              {events.length === 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to="/association" className="btn btn-primary">Découvrir l'association</Link>
                  <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Soutenir l'association
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Même carte que l'accueil (EventCard en est propriétaire) :
                  couverture photo, puis titre, extrait, date et lieu. La page
                  en redéfinissait une, sans image. */}
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} org={orgMap.get(e.organization_id)} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
