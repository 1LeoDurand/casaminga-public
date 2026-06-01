import type { PublicEvent, PublicOrg } from "../lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier", concert: "Concert", exposition: "Exposition",
  conference: "Conférence", spectacle: "Spectacle", marche: "Marché",
  formation: "Formation", autre: "Événement",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function fmtPrice(price: number | null) {
  if (price === null) return null;
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

function EventCard({ event, org }: { event: PublicEvent; org?: PublicOrg }) {
  const color = org?.primary_color ?? "#FF8A65";
  const price = fmtPrice(event.price);
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: color }} />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--peach-pale)", color: "var(--coral-deep)", border: "1px solid var(--peach)" }}>
            {TYPE_LABELS[event.type] ?? "Événement"}
          </span>
          {price && (
            <span className="text-sm font-bold" style={{ color: price === "Gratuit" ? "#2f8a4c" : "var(--black)" }}>{price}</span>
          )}
        </div>
        <h3 className="text-[18px] font-bold leading-snug" style={{ color: "var(--black)" }}>{event.title}</h3>
        {event.description && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--gray)" }}>{event.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--gray-mid)" }}>
          <div>
            <div className="text-xs" style={{ color: "var(--gray)" }}>{fmtDate(event.start_at)}</div>
            {org && <div className="mt-0.5 text-xs font-semibold" style={{ color: "var(--black)" }}>{org.name}</div>}
          </div>
          <span style={{ color: "var(--coral-deep)" }}>→</span>
        </div>
      </div>
    </article>
  );
}

export function EventsSection({ events, orgs }: { events: PublicEvent[]; orgs: PublicOrg[] }) {
  const orgMap = new Map(orgs.map((o) => [o.id, o]));
  return (
    <section id="evenements" style={{ padding: "clamp(64px,9vw,108px) 0" }}>
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow blue">À venir dans les lieux</div>
          <h2>Les prochains événements</h2>
          <p className="lead">Ateliers, concerts, expositions, AG ouvertes — ce qui se vit dans le réseau.</p>
        </div>
        {events.length === 0 ? (
          <div className="card py-16 text-center" style={{ borderStyle: "dashed", color: "var(--gray)" }}>
            Aucun événement à venir pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => <EventCard key={e.id} event={e} org={orgMap.get(e.organization_id)} />)}
          </div>
        )}
      </div>
    </section>
  );
}
