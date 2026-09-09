import { Link } from "react-router-dom";
import type { PublicEvent, PublicOrg } from "../../lib/supabase";
import { EventCover } from "../EventCover";
import { TYPE_LABELS, fmtPrice } from "../../lib/event-meta";
import { resolveEventImage } from "../../lib/event-images";

interface EbEventCardProps {
  event: PublicEvent;
  org?: PublicOrg;
}

export function EbEventCard({ event, org }: EbEventCardProps) {
  const orgName = org?.name ?? "Lieu du réseau";
  const price = fmtPrice(event.price);
  const label = TYPE_LABELS[event.type] ?? "Événement";

  const imgSrc = resolveEventImage(event.type, event.title, event.photos);

  const start = new Date(event.start_at);
  const dateStr = start.toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "long",
  });
  const timeStr = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <article
      className="group relative flex flex-col overflow-hidden bg-white transition-all"
      style={{
        borderRadius: "10px",
        border: "1px solid var(--gray-mid)",
        boxShadow: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.09)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      <Link
        to={`/evenement/${event.id}`}
        aria-label={event.title}
        className="absolute inset-0 z-[1]"
      />

      {/* Visuel 16:9, affiche entière sur fond flouté (cf. EventCover). */}
      <EventCover
        src={imgSrc}
        className="aspect-[4/3] w-full"
        fallback={`linear-gradient(135deg,
          color-mix(in srgb, ${org?.primary_color ?? "#FF8A65"} 85%, #1a1a1a) 0%,
          color-mix(in srgb, ${org?.primary_color ?? "#FF8A65"} 55%, #1a1a1a) 100%)`}
        hoverZoom
      >
        <span
          className="absolute left-3 top-3 z-[2] rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: "rgba(0,0,0,0.48)", color: "#fff", backdropFilter: "blur(4px)" }}
        >
          {label}
        </span>
      </EventCover>

      {/* Corps */}
      <div className="flex flex-1 flex-col px-4 py-3">
        {/* Date */}
        <p
          className="mb-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--coral-deep)" }}
        >
          {dateStr} · {timeStr}
        </p>

        {/* Titre */}
        <h3
          className="mb-1 line-clamp-2 text-[16px] font-bold leading-snug"
          style={{
            color: "var(--black)",
            letterSpacing: "-0.2px",
          }}
        >
          {event.title}
        </h3>

        {/* Lieu */}
        <p className="mb-3 text-xs" style={{ color: "var(--gray)" }}>
          {orgName}
        </p>

        {/* Prix */}
        <div className="mt-auto">
          {price ? (
            <span
              className="text-sm font-semibold"
              style={{ color: price === "Gratuit" ? "#2a7c48" : "var(--black)" }}
            >
              {price}
            </span>
          ) : (
            <span className="text-sm" style={{ color: "var(--gray)" }}>·</span>
          )}
        </div>
      </div>
    </article>
  );
}
