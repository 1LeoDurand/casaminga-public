import type { PublicEvent } from "../../lib/supabase";
import { ADMIN_BASE } from "../../lib/supabase";
import { LazyImg } from "./LieuShell";

// ── Formatage ─────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier", concert: "Concert", exposition: "Exposition",
  conference: "Conférence", spectacle: "Spectacle", marche: "Marché",
  formation: "Formation", reunion: "Réunion", autre: "Événement",
};

export function eventTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? "Événement";
}

export function fmtFullDate(iso: string): string {
  const s = new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function eventRange(startIso: string, endIso: string): string {
  return `${fmtFullDate(startIso)} · ${fmtTime(startIso)} – ${fmtTime(endIso)}`;
}

export function monthLabel(iso: string): string {
  const s = new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function priceLabel(price: number | null): string {
  if (price === 0 || price === null) return "Entrée libre";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

/** URL du détail + inscription d'un événement (transactionnel → admin). */
export function eventAdminUrl(slug: string, id: string): string {
  return `${ADMIN_BASE}/site/${slug}/agenda/${id}`;
}

// ── Carte événement (accueil + agenda) ────────────────────────
export function EventCard({ slug, event, accent }: { slug: string; event: PublicEvent; accent: string }) {
  return (
    <a
      href={eventAdminUrl(slug, event.id)}
      className="card group flex flex-col p-5"
      target="_blank"
      rel="noopener noreferrer"
    >
      {event.photos?.[0] ? (
        <div className="mb-3 aspect-video overflow-hidden rounded-[12px]">
          <LazyImg src={event.photos[0]} width={600} className="size-full object-cover transition group-hover:scale-105" />
        </div>
      ) : null}
      <span
        className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: `${accent}1a`, color: accent }}
      >
        {eventTypeLabel(event.type)}
      </span>
      <h3 className="mt-2.5 text-[15px] font-bold leading-snug" style={{ color: "var(--black)" }}>{event.title}</h3>
      <p className="mt-1.5 text-[13px]" style={{ color: "var(--gray)" }}>{eventRange(event.start_at, event.end_at)}</p>
      {event.description ? (
        <p className="mt-2 line-clamp-2 text-[12.5px]" style={{ color: "var(--gray)" }}>{event.description}</p>
      ) : null}
      <span className="mt-3 text-[12px] font-semibold" style={{ color: accent }}>
        {priceLabel(event.price)} →
      </span>
    </a>
  );
}
