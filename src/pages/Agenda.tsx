import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, HELLOASSO_ADHESION } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { fetchDiscoveryEvents, fetchPublicOrgs, type PublicEvent, type PublicOrg } from "../lib/supabase";
import { fmtDate, fmtTime, fmtPrice, isToday, isThisWeekend, TYPE_GLYPHS, TYPE_LABELS } from "../lib/event-meta";

/**
 * Page « Agenda » (item A5 des DIRECTIVES-AD-GRANT.md).
 * Découverte des événements du réseau, ancrée dans la mission de l'association.
 * Filtrage 100 % client (onglets temporels + catégorie) — aucune dépendance.
 * État vide rédigé (jamais une page blanche, exigence revue Ad Grant).
 */

type Tab = "tous" | "aujourdhui" | "weekend";

const TABS: { id: Tab; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "weekend", label: "Ce week-end" },
];

export function Agenda() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("tous");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDiscoveryEvents(100), fetchPublicOrgs()])
      .then(([e, o]) => { setEvents(e); setOrgs(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name ?? null;

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
            expositions et temps de transmission. Chaque événement prolonge la mission de l'association — le Faire,
            le lien social et la co-construction — et la plateforme <strong>Casaminga</strong> les rend visibles et
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
                  {TYPE_GLYPHS[c] ?? TYPE_GLYPHS.autre} {TYPE_LABELS[c] ?? c}
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
              {filtered.map((e) => {
                const lieu = orgName(e.organization_id);
                const price = fmtPrice(e.price);
                return (
                  <Link key={e.id} to={`/evenement/${e.id}`} className="card" style={{ padding: "22px", display: "block" }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                      <span style={{ fontSize: "26px" }}>{TYPE_GLYPHS[e.type] ?? TYPE_GLYPHS.autre}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gray)" }}>
                        {TYPE_LABELS[e.type] ?? "Événement"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--coral-deep)", marginBottom: "4px" }}>
                      {fmtDate(e.start_at)} · {fmtTime(e.start_at)}
                    </div>
                    <div style={{ fontWeight: 600, lineHeight: 1.3, color: "var(--black)" }}>{e.title}</div>
                    {lieu && <div style={{ fontSize: "13px", color: "var(--gray)", marginTop: "6px" }}>{lieu}</div>}
                    {price && (
                      <div style={{ fontSize: "13px", fontWeight: 600, color: price === "Gratuit" ? "#2f8a4c" : "var(--black)", marginTop: "8px" }}>
                        {price}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
