import { Link } from "react-router-dom";
import { SiteHeader, HELLOASSO_ADHESION } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

/**
 * Page « L'association » (item A1 des DIRECTIVES-AD-GRANT.md).
 * Cœur E-A-T pour la revue Google Ad Grant : mission, histoire, valeurs,
 * Bernard Kohn, ancrage Lodève / Saint-Mandé, et pourquoi Casaminga.
 * Contenu repris de SOURCE-MANUFACTURE-DES-PAYS.md (verbatim).
 */
export function Association() {
  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingTop: "clamp(48px,7vw,84px)", paddingBottom: "clamp(28px,4vw,48px)" }}>
          <span className="eyebrow">L'association · loi 1901</span>
          <h1 style={{ maxWidth: "18ch" }}>La Manufacture des Pays</h1>
          <p className="lead" style={{ marginTop: "20px" }}>
            La Manufacture des Pays réunit des bénévoles de formation, de disciplines et de métiers très divers —
            architectes, artisans, éducateurs, artistes, écologues, formateurs, actifs et retraités — qui
            partagent une même ambition&nbsp;: aborder les questions liées à l'éducation, l'architecture,
            l'urbanisme, le paysage et le patrimoine par une approche transversale. Ses mots-clés&nbsp;:
            <strong> le Faire, la co-construction, l'intelligence collective, le lien social, la citoyenneté
            et la transmission.</strong>
          </p>
        </section>

        {/* ── Héritage ─────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(32px,5vw,56px)" }}>
          <div className="grid items-start gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <span className="eyebrow mint">Notre histoire</span>
              <h2>Héritière de quatorze années d'expérience</h2>
              <p className="lead" style={{ marginTop: "16px", maxWidth: "none" }}>
                La Manufacture des Pays prolonge les savoir-faire développés pendant quatorze ans au sein de la
                <strong> Manufacture des Paysages</strong>. De cette aventure, elle conserve une conviction&nbsp;:
                ni une accumulation de connaissances ni une pensée strictement linéaire ne suffisent à préparer
                les générations qui viennent. L'intelligence n'est pas unidimensionnelle — multiples sont les
                intelligences d'expression et de création, où s'entrecroisent les logiques scientifiques,
                verbales, musicales, artistiques, sensibles et manuelles.
              </p>
              <p className="lead" style={{ marginTop: "14px", maxWidth: "none" }}>
                Face à la disparition des travaux manuels, l'association ne défend pas une opposition de
                pédagogies, mais une <strong>nouvelle complémentarité</strong> entre l'esprit et la pratique,
                capable de « parler » à celles et ceux que l'enseignement réducteur laisse de côté.
              </p>
              <figure style={{ margin: "24px 0 0", paddingLeft: "20px", borderLeft: "3px solid var(--coral)" }}>
                <blockquote style={{ fontStyle: "italic", color: "var(--black-soft)", fontSize: "17px", lineHeight: 1.6 }}>
                  « Proposer aux jeunes des activités leur permettant de s'engager, et de trouver là une place
                  dans un groupe et un sens à leur existence… »
                </blockquote>
                <figcaption style={{ marginTop: "8px", fontSize: "13px", color: "var(--gray)" }}>— Philippe Meirieu</figcaption>
              </figure>
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

        {/* ── Les deux familles d'ateliers ─────────────────────── */}
        <section style={{ background: "var(--cream-warm)", borderTop: "1px solid var(--gray-mid)", borderBottom: "1px solid var(--gray-mid)" }}>
          <div className="wrap" style={{ padding: "clamp(48px,7vw,80px) 28px" }}>
            <div className="grid gap-8 md:grid-cols-2">
              <article className="card" style={{ padding: "30px" }}>
                <h3>Les ateliers de la main</h3>
                <p className="lead" style={{ marginTop: "12px", maxWidth: "none" }}>
                  L'animation de groupes pour favoriser le développement des potentialités créatrices de chacun,
                  par la mise en pratique des intelligences multiples que sollicite l'activité manuelle. Au sein
                  d'écoles, de collèges, de lycées ou dans nos locaux&nbsp;: travail du bois, modelage de la terre,
                  tissage. L'atelier de tissage de La Distillerie se tient ainsi chaque jeudi après-midi depuis
                  l'été 2021.
                </p>
              </article>
              <article className="card" style={{ padding: "30px" }}>
                <h3>Les ateliers de ville</h3>
                <p className="lead" style={{ marginTop: "12px", maxWidth: "none" }}>
                  L'animation de groupes d'habitants pour une co-construction éco-responsable du patrimoine de
                  demain et du cadre de vie&nbsp;: construire un autre regard sur un quartier, rendre les habitants
                  force de proposition, renforcer le maillage entre quartiers, ville et espaces naturels. Des
                  méthodes participatives et reproductibles, issues de dix ans de pratique de terrain.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Ancrage + Bernard Kohn ───────────────────────────── */}
        <section className="wrap" style={{ padding: "clamp(48px,7vw,80px) 28px" }}>
          <span className="eyebrow blue">Nos lieux</span>
          <h2>De Lodève à Saint-Mandé</h2>
          <p className="lead" style={{ marginTop: "16px", maxWidth: "70ch" }}>
            Le siège de l'association est installé à l'<strong>atelier Bernard Kohn</strong>, à La Distillerie,
            tiers-lieu en Lodévois. En janvier 2026, l'association a ouvert un établissement secondaire&nbsp;: le
            <strong> tiers-lieu Bernard Kohn à Saint-Mandé</strong>, aménagé dans l'ancienne maison et atelier de
            l'architecte. Figure tutélaire de l'association, Bernard Kohn inspire une architecture participative,
            attentive au vivant et au lien entre les êtres et les lieux.
          </p>
        </section>

        {/* ── Pourquoi Casaminga (le mix des deux marques) ─────── */}
        <section style={{ background: "var(--peach-pale)", borderTop: "1px solid var(--peach)", borderBottom: "1px solid var(--peach)" }}>
          <div className="wrap" style={{ padding: "clamp(48px,7vw,80px) 28px" }}>
            <span className="eyebrow">Notre plateforme</span>
            <h2 style={{ maxWidth: "20ch" }}>Pourquoi La Manufacture des Pays a créé Casaminga</h2>
            <p className="lead" style={{ marginTop: "16px", maxWidth: "70ch" }}>
              Toute la vie d'un réseau de lieux — ateliers, rencontres, chantiers participatifs, campagnes
              d'adhésion — reste trop souvent invisible, enfermée dans des outils de gestion. Pour y remédier,
              l'association a créé <strong>Casaminga</strong>&nbsp;: le site qui rend cette vie
              <strong> publique, lisible et actionnable</strong>. On y découvre l'agenda, on y adhère, on y
              soutient les initiatives qui font vivre les territoires.
            </p>
            <p className="lead" style={{ marginTop: "14px", maxWidth: "70ch" }}>
              Dans le prolongement de la mission d'entraide de La Manufacture des Pays, Casaminga a vocation à
              devenir une plateforme de <strong>soutien aux associations et aux tiers-lieux</strong>&nbsp;:
              mutualiser les outils, donner de la visibilité aux initiatives locales et renforcer le lien entre
              les lieux habités.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/nos-actions" className="btn btn-primary">Découvrir nos actions</Link>
              <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Soutenir et adhérer
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
