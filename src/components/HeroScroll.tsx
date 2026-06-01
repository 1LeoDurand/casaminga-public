import type { PublicOrg } from "../lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  association: "Association",
  collectif: "Collectif",
  scic: "SCIC",
  scop: "SCOP",
  sarl: "SARL / SAS",
  collectivite: "Collectivité",
  autre: "Tiers-lieu",
};

function OrgChip({ org }: { org: PublicOrg }) {
  const color = org.primary_color || "#FF8A65";
  return (
    <a
      href={`https://admin.casaminga.com/site/${org.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex items-center gap-3 px-4 py-3"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] text-xs font-extrabold text-white" style={{ background: color }}>
        {org.name.slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold" style={{ color: "var(--black)" }}>{org.name}</span>
        <span className="block truncate text-[12px]" style={{ color: "var(--gray)" }}>
          {TYPE_LABELS[org.structure ?? ""] ?? "Tiers-lieu"}{org.address ? ` · ${org.address}` : ""}
        </span>
      </span>
    </a>
  );
}

export function HeroScroll({ orgs }: { orgs: PublicOrg[] }) {
  return (
    <header className="relative overflow-hidden" id="hero" style={{ padding: "clamp(40px,7vw,80px) 0 clamp(60px,8vw,96px)" }}>
      {/* Halo décoratif */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-120px", right: "-160px", width: "560px", height: "560px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,180,162,0.22) 0%, transparent 65%)",
        }}
      />
      <div className="wrap">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr]">
          {/* Contenu */}
          <div className="relative z-10">
            <div className="eyebrow">★ La plateforme des tiers-lieux & lieux collectifs</div>
            <h1 className="mb-5">
              Des lieux où l'on{" "}
              <span style={{ background: "linear-gradient(180deg, transparent 62%, rgba(255,138,101,0.28) 62%, rgba(255,138,101,0.28) 92%, transparent 92%)", padding: "0 4px" }}>
                fait ensemble.
              </span>
            </h1>
            <p className="mb-7" style={{ fontSize: "clamp(15px,1.7vw,18.5px)", color: "var(--gray)", lineHeight: 1.65, maxWidth: "58ch" }}>
              Casa Minga relie les tiers-lieux culturels, associatifs et hybrides de France.
              Trouvez un lieu près de chez vous, participez à un événement, rejoignez une association.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#lieux" className="btn btn-primary btn-lg">Explorer les lieux →</a>
              <a href="#evenements" className="btn btn-secondary btn-lg">Voir les événements</a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3.5 border-t pt-6" style={{ borderColor: "var(--gray-mid)", fontSize: "12.5px", color: "var(--gray)" }}>
              {["Pensé depuis le terrain", "Associations loi 1901", "Sobriété numérique"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full" style={{ background: "var(--mint)" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Liste des lieux (carte vivante) */}
          <div className="card overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
            <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--gray-mid)", background: "var(--cream-warm)" }}>
              <span className="text-[13px] font-bold" style={{ color: "var(--black)" }}>Les lieux du réseau</span>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--mint-pale)", color: "#2f8a4c" }}>
                {orgs.length} lieu{orgs.length > 1 ? "x" : ""}
              </span>
            </div>
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto p-4 no-scrollbar">
              {orgs.slice(0, 8).map((o) => <OrgChip key={o.id} org={o} />)}
              {orgs.length === 0 && (
                <p className="px-3 py-8 text-center text-sm" style={{ color: "var(--gray)" }}>Les lieux apparaîtront ici prochainement.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
