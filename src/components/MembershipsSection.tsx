import type { PublicCampaign, PublicOrg } from "../lib/supabase";

function fmtAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function CampaignCard({ campaign, org }: { campaign: PublicCampaign; org?: PublicOrg }) {
  const color = org?.primary_color ?? "#e8614a";
  const pct = campaign.max_members && campaign.member_count
    ? Math.min(100, Math.round((campaign.member_count / campaign.max_members) * 100))
    : null;
  const adminUrl = `https://admin.casaminga.com/site/${org?.slug}/adhesions/${campaign.slug}`;

  return (
    <article className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden transition-all hover:border-white/15">
      {/* Barre couleur */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-1">
          {org && <span className="text-xs text-white/40">{org.name}</span>}
        </div>
        <h3 className="font-heading text-xl font-bold text-white leading-snug">
          {campaign.title}
        </h3>
        {campaign.description && (
          <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        )}

        {/* Tarifs */}
        {campaign.tiers && campaign.tiers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {campaign.tiers.slice(0, 3).map((t) => (
              <span key={t.id} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">
                {t.name} — {fmtAmount(t.amount)}
              </span>
            ))}
          </div>
        )}

        {/* Barre de progression */}
        {pct !== null && campaign.show_member_count && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>{campaign.member_count} membres</span>
              <span>/ {campaign.max_members}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        )}

        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          Adhérer
          <span>→</span>
        </a>
      </div>
    </article>
  );
}

export function MembershipsSection({ campaigns, orgs }: { campaigns: PublicCampaign[]; orgs: PublicOrg[] }) {
  const orgMap = new Map(orgs.map((o) => [o.id, o]));

  return (
    <section id="adhesions" className="relative py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        <div className="mb-12">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-white/30">
            Rejoindre un lieu
          </p>
          <h2 className="font-heading text-4xl font-extrabold text-white md:text-5xl">
            Adhésions ouvertes
          </h2>
          <p className="mt-3 text-base text-white/40 max-w-xl">
            Soutenez les lieux qui vous ressemblent. Chaque adhésion renforce un projet collectif.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-white/30">
            Aucune campagne d'adhésion ouverte pour le moment.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} org={orgMap.get(c.organization_id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
