export function ManifestoSection() {
  return (
    <section style={{ background: "var(--cream-warm)", padding: "clamp(64px,9vw,108px) 0" }}>
      <div className="wrap">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="eyebrow mint">Notre raison d'être</div>
            <h2 className="mb-4">Des lieux où l'on fait ensemble.</h2>
            <p className="mb-3.5" style={{ fontSize: "16px", color: "var(--black-soft)", lineHeight: 1.75, maxWidth: "60ch" }}>
              Casa Minga connecte les tiers-lieux culturels, associatifs et hybrides de France.
              Des espaces qui croient que créer, partager et décider ensemble, c'est possible — et nécessaire.
            </p>
            <p style={{ fontSize: "16px", color: "var(--black-soft)", lineHeight: 1.75, maxWidth: "60ch" }}>
              Chaque lieu garde son identité, ses couleurs, sa communauté. Casa Minga les relie sans les uniformiser.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#lieux" className="btn btn-primary">Explorer les lieux →</a>
              <a href="https://admin.casaminga.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Gérer mon lieu</a>
            </div>
          </div>
          <div
            className="rounded-[18px] p-6"
            style={{ background: "linear-gradient(135deg, var(--peach-pale) 0%, var(--cream) 100%)", borderLeft: "4px solid var(--coral)", borderRadius: "0 18px 18px 0" }}
          >
            <p className="italic" style={{ fontSize: "18px", color: "var(--black)", lineHeight: 1.65 }}>
              <span style={{ color: "var(--coral)", fontWeight: 700, fontStyle: "normal" }}>« </span>
              Le lieu nous parlait, mais nous n'avions pas d'outil pour l'écouter.
              Casa Minga, c'est notre façon de lui répondre.
              <span style={{ color: "var(--coral)", fontWeight: 700, fontStyle: "normal" }}> »</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
