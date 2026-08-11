import { useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../lib/supabase";
import { useLieu } from "./useLieu";
import { LieuShell, LieuLoading, LieuNotFound } from "./LieuShell";
import { EventCard, monthLabel } from "./lieuUi";
import type { PublicEvent } from "../../lib/supabase";

/** Agenda complet, groupé par mois (pages.agenda). */
export function LieuAgenda() {
  const { lieuSlug } = useParams<{ lieuSlug: string }>();
  const { loading, data } = useLieu(lieuSlug);

  if (loading) return <LieuLoading />;
  if (!data || !data.content.pages.agenda) return <LieuNotFound />;

  const { org, content: c, events } = data;
  const accent = c.accent_color;
  const slug = org.slug;

  const byMonth = new Map<string, PublicEvent[]>();
  for (const e of events) {
    const key = monthLabel(e.start_at);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  }

  return (
    <LieuShell data={data}>
      <section className="wrap pb-14 pt-14">
        <h1>Agenda</h1>
        <p className="lead mt-3">Tous les rendez-vous à venir du lieu.</p>

        {/* Abonnement iCal (Google Agenda, Apple, Outlook…) — servi par l'admin. */}
        <a
          href={`${ADMIN_BASE}/site/${slug}/agenda.ics`}
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
          style={{ border: `1px solid ${accent}40`, color: "var(--gray)" }}
        >
          📅 S'abonner à l'agenda (iCal)
        </a>

        {events.length === 0 ? (
          <div className="card mt-8 px-6 py-12 text-center text-sm" style={{ color: "var(--gray)" }}>
            Aucun événement n'est programmé à cette date. Écrivez au lieu pour connaître sa prochaine programmation.
            <a
              href={`${ADMIN_BASE}/site/${slug}#contact`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm mt-4 block w-fit mx-auto"
            >
              Contacter le lieu
            </a>
          </div>
        ) : (
          [...byMonth.entries()].map(([month, list]) => (
            <div key={month} className="mt-10">
              <h2 className="mb-4">{month}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => <EventCard key={e.id} slug={slug} event={e} accent={accent} />)}
              </div>
            </div>
          ))
        )}
      </section>
    </LieuShell>
  );
}
