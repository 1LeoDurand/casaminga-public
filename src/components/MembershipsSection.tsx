import type { PublicCampaign, PublicOrg } from "../lib/supabase";

function fmtAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function CampaignCard({ campaign, org }: { campaign: PublicCampaign; org?: PublicOrg }) {
  const color = org?.primary_color ?? "#FF8A65";
  const pct = campaign.max_members && campaign.member_count
    ? Math.min(100, Math.round((campaign.member_count / campaign.max_members) * 100))
    : null;
  const adminUrl = `https://admin.casaminga.com/site/${org?.slug}/adhesions/${campaign.slug}`;

  return (
    <article className="card flex flex-col overflow-hidden" style={{ borderTop: `5px solid ${color}` }}>
      <div className="flex flex-1 flex-col p-6">
        {org && <span className="text-xs" style={{ color: "var(--gray)" }}>{org.name}</span>}
        <h3 className="mt-0.5 text-[20px] font-bold leading-snug" style={{ color: "var(--black)" }}>{campaign.title}</h3>
        {campaign.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--gray)" }}>{campaign.description}</p>
        )}
        {campaign.tiers && campaign.tiers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {campaign.tiers.slice(0, 3).map((t) => (
              <span key={t.id} className="rounded-full px-3 py-1 text-xs" style={{ background: "var(--gray-light)", color: "var(--black)" }}>
                {t.name} — {fmtAmount(t.amount)}
              </span>
            ))}
          </div>
        )}
        {pct !== null && campaign.show_member_count && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs" style={{ color: "var(--gray)" }}>
              <span>{campaign.member_count} membres</span>
              <span>/ {campaign.max_members}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--gray-light)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        )}
        <a href={adminUrl} target="_blank" rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
          style={{ background: color }}>
          Adhérer →
        </a>
      </div>
    </article>
  );
}

export function MembershipsSection({ campaigns, orgs }: { campaigns: PublicCampaign[]; orgs: PublicOrg[] }) {
  const orgMap = new Map(orgs.map((o) => [o.id, o]));
  return (
    <section id="adhesions" style={{ background: "linear-gradient(180deg, var(--cream) 0%, var(--peach-pale) 100%)", padding: "clamp(64px,9vw,108px) 0" }}>
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Rejoindre un lieu</div>
          <h2>Adhésions ouvertes</h2>
          <p className="lead">Soutenez les lieux qui vous ressemblent. Chaque adhésion renforce un projet collectif.</p>
        </div>
        {campaigns.length === 0 ? (
          <div className="card py-16 text-center" style={{ borderStyle: "dashed", color: "var(--gray)" }}>
            Aucune campagne d'adhésion ouverte pour le moment.
          </div>
        ) : (
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} org={orgMap.get(c.organization_id)} />)}
          </div>
        )}
      </div>
    </section>
  );
}
