import { SiteHeader, HELLOASSO_ADHESION } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

/**
 * Page « Contact » + identité légale (item A2 des DIRECTIVES-AD-GRANT.md).
 * Exigence Google Ad Grant : identité de l'éditeur vérifiable (adresse réelle,
 * email, loi 1901, RNA/SIREN). Aucun champ non câblé — contact par email direct.
 */
export function Contact() {
  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        <section className="wrap" style={{ paddingTop: "clamp(48px,7vw,84px)", paddingBottom: "clamp(28px,4vw,48px)" }}>
          <span className="eyebrow">Contact</span>
          <h1 style={{ maxWidth: "16ch" }}>Nous écrire, nous rejoindre</h1>
          <p className="lead" style={{ marginTop: "18px" }}>
            La Manufacture des Pays — association loi 1901, éditrice de la plateforme Casaminga — accueille
            bénévoles, partenaires et curieux. Pour toute question sur l'association, ses ateliers ou Casaminga,
            écrivez-nous&nbsp;: nous répondons à chaque message.
          </p>
        </section>

        <section className="wrap" style={{ paddingBottom: "clamp(48px,7vw,80px)" }}>
          <div className="grid items-start gap-8 md:grid-cols-2">
            {/* Coordonnées */}
            <div className="card" style={{ padding: "30px" }}>
              <h2 style={{ fontSize: "22px" }}>Coordonnées</h2>
              <dl style={{ margin: "20px 0 0", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <dt style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--coral-deep)" }}>Siège</dt>
                  <dd style={{ margin: "4px 0 0", color: "var(--black-soft)" }}>
                    Atelier Bernard Kohn — La Distillerie<br />
                    10 rue de la sous-préfecture, 34700 Lodève
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--coral-deep)" }}>Établissement secondaire</dt>
                  <dd style={{ margin: "4px 0 0", color: "var(--black-soft)" }}>
                    Tiers-lieu Bernard Kohn — Saint-Mandé<br />
                    (ouvert en janvier 2026)
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--coral-deep)" }}>Email</dt>
                  <dd style={{ margin: "4px 0 0" }}>
                    <a href="mailto:manufacturedespays@gmail.com">manufacturedespays@gmail.com</a>
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--coral-deep)" }}>Téléphone</dt>
                  <dd style={{ margin: "4px 0 0", color: "var(--black-soft)" }}>
                    <a href="tel:+33611831112">06 11 83 11 12</a>
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--coral-deep)" }}>Suivre</dt>
                  <dd style={{ margin: "4px 0 0" }}>
                    <a href="https://www.facebook.com/profile.php?id=100088089259165" target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  </dd>
                </div>
              </dl>
              <a href="mailto:manufacturedespays@gmail.com" className="btn btn-primary mt-7">
                Écrire à l'association
              </a>
            </div>

            {/* Identité légale + rejoindre */}
            <div className="flex flex-col gap-8">
              <div className="card" style={{ padding: "30px" }}>
                <h2 style={{ fontSize: "22px" }}>Identité légale</h2>
                <p className="lead" style={{ marginTop: "12px", maxWidth: "none" }}>
                  <strong>La Manufacture des Pays</strong> est une association régie par la loi du 1<sup>er</sup> juillet
                  1901. Elle édite le site <strong>casaminga.com</strong> et gère le tiers-lieu Bernard Kohn.
                </p>
                <dl style={{ margin: "18px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", fontSize: "14px" }}>
                  <dt style={{ color: "var(--gray)" }}>Statut</dt>
                  <dd style={{ margin: 0, color: "var(--black-soft)" }}>Association déclarée (loi 1901)</dd>
                  <dt style={{ color: "var(--gray)" }}>RNA</dt>
                  <dd style={{ margin: 0, color: "var(--black-soft)" }}>W342002465 — inscrite le 12/10/2016</dd>
                  <dt style={{ color: "var(--gray)" }}>SIREN</dt>
                  <dd style={{ margin: 0, color: "var(--black-soft)" }}>824 820 856</dd>
                  <dt style={{ color: "var(--gray)" }}>SIRET (siège)</dt>
                  <dd style={{ margin: 0, color: "var(--black-soft)" }}>824 820 856 00014</dd>
                  <dt style={{ color: "var(--gray)" }}>TVA</dt>
                  <dd style={{ margin: 0, color: "var(--black-soft)" }}>FR49824820856</dd>
                </dl>
              </div>

              <div className="card" style={{ padding: "30px", background: "var(--peach-pale)", borderColor: "var(--peach)" }}>
                <h2 style={{ fontSize: "22px" }}>Nous rejoindre & soutenir</h2>
                <p className="lead" style={{ marginTop: "12px", maxWidth: "none" }}>
                  Adhérer à La Manufacture des Pays, c'est soutenir ses ateliers, ses projets de territoire et la
                  plateforme Casaminga qui les rend visibles. L'adhésion est un <strong>geste de soutien</strong> à
                  la mission de l'association, pas l'achat d'un service.
                </p>
                <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">
                  Adhérer via HelloAsso
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
