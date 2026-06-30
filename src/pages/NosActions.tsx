import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { fetchUpcomingEvents, fetchPublicOrgs, type PublicEvent, type PublicOrg } from "../lib/supabase";
import { fmtDate, fmtPrice, TYPE_GLYPHS } from "../lib/event-meta";

/**
 * Page « Nos actions » (item A4 des DIRECTIVES-AD-GRANT.md).
 * Contenu original riche (300+ mots) tiré de SOURCE-MANUFACTURE-DES-PAYS.md,
 * structuré par thèmes d'action, relié à l'agenda Casaminga (teaser dynamique
 * masqué si vide).
 */

const THEMES = [
  {
    eyebrow: "Ateliers de la main",
    title: "Transmettre par le geste",
    body: "Travail du bois, modelage de la terre, tissage : nos ateliers de la main développent les potentialités créatrices de chacun par la pratique. L'atelier de tissage de La Distillerie réunit ses participants chaque jeudi après-midi depuis l'été 2021 ; d'autres interventions ont accompagné des jeunes en écoles, collèges et établissements médico-sociaux — comme cette belle réalisation menée avec les jeunes de la MECS Terre Rouge, à Clermont-l'Hérault.",
    color: "mint",
  },
  {
    eyebrow: "Ateliers de ville",
    title: "Co-construire le cadre de vie",
    body: "Avec les habitants, nous construisons un autre regard sur les quartiers et la ville. Concertation autour de la réhabilitation du parc municipal de Lodève, participation au jury citoyen de « Quartiers de Demain », appui à l'habitat participatif et à l'Îlot vert de la Soulondres : autant de démarches participatives, reproductibles, nourries par dix ans de pratique de l'intelligence collective.",
    color: "blue",
  },
  {
    eyebrow: "Pédagogie & transmission",
    title: "Les intelligences multiples",
    body: "Face à une pédagogie parfois réductrice, nous défendons une complémentarité entre l'esprit et la main. Interventions au collège de Saint-André-de-Sangonis sur l'aménagement des cours, mini-conférences, plaidoyer « pour un collège de la tête, du cœur et de la main » : il s'agit de rendre aux jeunes une place, un engagement et un sens.",
    color: "gold",
  },
  {
    eyebrow: "Écologie & réemploi",
    title: "Ménager le vivant et la matière",
    body: "De l'exposition « Matière Grise » sur le réemploi des matériaux à l'inventaire participatif des arbres remarquables du Lodévois-Larzac avec Pays'arbre, en passant par le soutien à l'Abeille Verte et à La Grande Conserve, nos actions tissent un lien concret entre écologie, économie locale et patrimoine.",
    color: "mint",
  },
];

export function NosActions() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);

  useEffect(() => {
    Promise.all([fetchUpcomingEvents(3), fetchPublicOrgs()])
      .then(([e, o]) => { setEvents(e); setOrgs(o); })
      .catch(() => {});
  }, []);

  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name ?? null;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        <section className="wrap" style={{ paddingTop: "clamp(48px,7vw,84px)", paddingBottom: "clamp(28px,4vw,40px)" }}>
          <span className="eyebrow">Nos actions</span>
          <h1 style={{ maxWidth: "20ch" }}>Ce que nous faisons, sur le terrain</h1>
          <p className="lead" style={{ marginTop: "18px" }}>
            La Manufacture des Pays agit là où se croisent l'éducation, l'architecture, le paysage et le lien
            social. Nos actions prennent corps dans des ateliers, des chantiers participatifs et des projets de
            territoire — et c'est sur <strong>Casaminga</strong> que vous en retrouvez les rendez-vous concrets,
            ouverts à toutes et tous.
          </p>
        </section>

        <section className="wrap" style={{ paddingBottom: "clamp(40px,6vw,64px)" }}>
          <div className="grid gap-7 md:grid-cols-2">
            {THEMES.map((t) => (
              <article key={t.title} className="card" style={{ padding: "30px" }}>
                <span className={`eyebrow ${t.color}`}>{t.eyebrow}</span>
                <h2 style={{ fontSize: "24px" }}>{t.title}</h2>
                <p className="lead" style={{ marginTop: "12px", maxWidth: "none" }}>{t.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Teaser agenda Casaminga (masqué si vide) ─────────── */}
        {events.length > 0 && (
          <section style={{ background: "var(--cream-warm)", borderTop: "1px solid var(--gray-mid)" }}>
            <div className="wrap" style={{ padding: "clamp(48px,7vw,80px) 28px" }}>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow gold">À venir sur Casaminga</span>
                  <h2>Passez du texte à l'action</h2>
                </div>
                <Link to="/agenda" className="btn btn-secondary">Voir tout l'agenda →</Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
