import type { PublicEvent, PublicOrg } from "../lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier", concert: "Concert", exposition: "Exposition",
  conference: "Conférence", spectacle: "Spectacle", marche: "Marché",
  formation: "Formation", autre: "Événement",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtPrice(price: number | null) {
  if (price === null) return null;
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

function EventCard({ event, org }: { event: PublicEvent; org?: PublicOrg }) {
  const color = org?.primary_color ?? "#e8614a";
  const price = fmtPrice(event.price);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] transition-all hover:border-white/15 hover:bg-white/[0.06]">
      {/* Bandeau couleur org */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/50">
            {TYPE_LABELS[event.type] ?? "Événement"}
          </span>
          {price && (
            <span className={`text-sm font-semibold ${price === "Gratuit" ? "text-emerald-400" : "text-white/80"}`}>
              {price}
            </span>
          )}
        </div>
        <h3 className="font-heading text-lg font-bold text-white leading-snug group-hover:text-coral transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed flex-1">
            {event.description}
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-xs text-white/40">{fmtDate(event.start_at)}</div>
            {org && <div className="text-xs font-medium text-white/60 mt-0.5">{org.name}</div>}
          </div>
          <span className="text-white/30 text-sm group-hover:text-coral transition-colors">→</span>
        </div>
      </div>
    </article>
  );
}

export function EventsSection({ events, orgs }: { events: PublicEvent[]; orgs: PublicOrg[] }) {
  const orgMap = new Map(orgs.map((o) => [o.id, o]));

  return (
    <section id="evenements" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        {/* En-tête */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-white/30">
              À venir dans les lieux
            </p>
            <h2 className="font-heading text-4xl font-extrabold text-white md:text-5xl">
              Événements
            </h2>
          </div>
          <a href="#" className="hidden text-sm text-white/40 underline underline-offset-4 hover:text-white md:block">
            Voir tout →
          </a>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-white/30">
            Aucun événement à venir pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} org={orgMap.get(e.organization_id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
