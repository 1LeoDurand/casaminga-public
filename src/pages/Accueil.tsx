import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, HELLOASSO_ADHESION } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import logoManufacture from "../assets/logo-manufacture.jpg";
import { fetchUpcomingEvents, fetchPublicOrgs, type PublicEvent, type PublicOrg } from "../lib/supabase";
import { fmtDate, fmtPrice, TYPE_GLYPHS } from "../lib/event-meta";

/**
 * Accueil institutionnel La Manufacture des Pays (asso loi 1901, éditrice de
 * Casaminga). Page racine `/` — objectif Google Ad Grant : présenter l'asso
 * et sa mission AVANT la découverte d'événements (la grille Eventbrite est
 * « mise de côté » en /agenda). Voir DIRECTIVES-AD-GRANT.md [A3].
 *
 * Header et footer sont les composants partagés SiteHeader / SiteFooter
 * (items NAV et F de la directive).
 */
export function Accueil() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);

  useEffect(() => {
    Promise.all([fetchUpcomingEvents(4), fetchPublicOrgs()])
      .then(([e, o]) => { setEvents(e); setOrgs(o); })
      // Le teaser agenda est facultatif : en cas d'échec, l'encart reste masqué.
      .catch(() => {});
  }, []);

  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name ?? null;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        {/* ── Bandeau logo (hero) — logo officiel de l'association ─ */}
        <section className="wrap" style={{ paddingTop: "clamp(36px,6vw,64px)", textAlign: "center" }}>
          <img
            src={logoManufacture}
            alt="La Manufacture des Pays — deux mains, l'une dessinée d'un plan de ville, l'autre d'un paysage, se tendant l'une vers l'autre"
            style={{ width: "min(500px, 90%)", height: "auto", margin: "0 auto", mixBlendMode: "multiply" }}
          />
        </section>

        {/* ── Hero institutionnel ─────────────────────────────── */}
        <section className="wrap" style={{ paddingTop: "clamp(20px,3vw,36px)", paddingBottom: "clamp(40px,6vw,72px)" }}>
          <span className="eyebrow">Association loi 1901</span>
          <h1 style={{ maxWidth: "16ch" }}>Penser collectivement le patrimoine de demain</h1>
          <p className="lead" style={{ marginTop: "22px" }}>
            La Manufacture des Pays accueille le <strong>tiers-lieu Bernard Kohn à Saint-Mandé</strong>,
            ouvert en janvier 2026 dans l'ancienne maison et atelier de l'architecte. Héritière de quatorze
            années de la Manufacture des Paysages, l'association réunit des bénévoles de tous horizons —
            architectes, artisans, éducateurs, artistes, écologues, formateurs — autour du Faire, de la
            co-construction, de l'intelligence collective, du lien social, de la citoyenneté et de la transmission.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/association" className="btn btn-primary btn-lg">Découvrir l'association</Link>
            <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
              Soutenir et adhérer
            </a>
          </div>
        </section>

        {/* ── Phrase de liaison Casaminga ─────────────────────── */}
        <section style={{ background: "var(--peach-pale)", borderTop: "1px solid var(--peach)", borderBottom: "1px solid var(--peach)" }}>
          <div className="wrap" style={{ padding: "clamp(36px,5vw,56px) 28px", textAlign: "center" }}>
            <p style={{ fontSize: "clamp(18px,2.2vw,24px)", lineHeight: 1.5, maxWidth: "62ch", margin: "0 auto", color: "var(--black-soft)" }}>
              <strong>Casaminga</strong> est le site de La Manufacture des Pays : il rend publique et
              actionnable la vie du réseau de lieux animés par l'association — agenda, ateliers, rencontres et
              chantiers participatifs ouverts à toutes et tous.
            </p>
            <p style={{ fontSize: "clamp(15px,1.7vw,18px)", lineHeight: 1.6, maxWidth: "60ch", margin: "16px auto 0", color: "var(--gray)" }}>
              Dans le prolongement de notre mission d'entraide, Casaminga a vocation à devenir une
              plateforme de <strong>soutien aux associations et aux tiers-lieux</strong> : mutualiser les
              outils, donner de la visibilité aux initiatives locales et renforcer le lien entre les lieux
              qui font vivre les territoires.
            </p>
          </div>
        </section>

        {/* ── Bloc « À propos » court → /association ───────────── */}
        <section className="wrap" style={{ padding: "clamp(48px,7vw,80px) 28px" }}>
          <div className="grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="eyebrow mint">Qui nous sommes</span>
              <h2>Une ambition transversale, ancrée dans le faire</h2>
              <p className="lead" style={{ marginTop: "16px", maxWidth: "none" }}>
                L'association aborde les questions liées à l'éducation, l'architecture, l'urbanisme, le paysage
                et le patrimoine par une approche transversale et participative. Des <strong>ateliers de la main</strong>
                {" "}(tissage, modelage, travail du bois) aux <strong>ateliers de ville</strong> (co-construction
                éco-responsable du cadre de vie avec les habitants), nos actions mobilisent l'intelligence
                collective issue de dix ans de pratique de terrain.
              </p>
              <p className="lead" style={{ marginTop: "14px", maxWidth: "none" }}>
                Notre siège est installé à l'atelier Bernard Kohn, à La Distillerie, tiers-lieu en Lodévois ;
                notre établissement secondaire est le tiers-lieu Bernard Kohn à Saint-Mandé.
              </p>
              <Link to="/association" className="btn btn-ghost mt-5" style={{ paddingLeft: 0 }}>
                En savoir plus sur l'association →
              </Link>
            </div>
            <aside className="card" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "18px" }}>Nos valeurs</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Le Faire", "La co-construction", "L'intelligence collective", "Le lien social", "La citoyenneté", "La transmission"].map((v) => (
                  <li key={v} style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--black-soft)", fontWeight: 500 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />
                    {v}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        {/* ── Teaser agenda (masqué si vide) ──────────────────── */}
        {events.length > 0 && (
          <section style={{ background: "var(--cream-warm)", borderTop: "1px solid var(--gray-mid)" }}>
            <div className="wrap" style={{ padding: "clamp(48px,7vw,80px) 28px" }}>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow gold">À venir</span>
                  <h2>Les prochains rendez-vous du réseau</h2>
                </div>
                <Link to="/agenda" className="btn btn-secondary">Voir tout l'agenda →</Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((e) => {
                  const lieu = orgName(e.organization_id);
                  const price = fmtPrice(e.price);
                  return (
                    <Link key={e.id} to={`/evenement/${e.id}`} className="card" style={{ padding: "20px", display: "block" }}>
                      <div style={{ fontSize: "26px", marginBottom: "10px" }}>{TYPE_GLYPHS[e.type] ?? TYPE_GLYPHS.autre}</div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--coral-deep)", marginBottom: "4px" }}>
                        {fmtDate(e.start_at)}
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
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
