import { useState } from "react";
import { Link } from "react-router-dom";
import type { PublicEvent, PublicOrg } from "../../lib/supabase";
import { TYPE_LABELS, TYPE_GLYPHS, gradientFromColor, fmtPrice } from "../../lib/event-meta";

interface EbEventCardProps {
  event: PublicEvent;
  org?: PublicOrg;
}

export function EbEventCard({ event, org }: EbEventCardProps) {
  const [imgError, setImgError] = useState(false);

  const color = org?.primary_color ?? "#FF8A65";
  const initials = (org?.name ?? "··").slice(0, 2).toUpperCase();
  const orgName = org?.name ?? "Lieu du réseau";
  const price = fmtPrice(event.price);
  const label = TYPE_LABELS[event.type] ?? "Événement";
  const glyph = TYPE_GLYPHS[event.type] ?? "🎟️";

  const photoUrl =
    event.photos?.[0] && event.photos[0].startsWith("http")
      ? event.photos[0]
      : null;
  const showImg = photoUrl !== null && !imgError;

  const start = new Date(event.start_at);
  const dayNum = start.toLocaleDateString("fr-FR", { day: "numeric" });
  const monthAbbr = start.toLocaleDateString("fr-FR", { month: "short" });
  const timeStr = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = start.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });

  return (
    <article className="card relative flex flex-col overflow-hidden">
      <Link
        to={`/evenement/${event.id}`}
        aria-label={event.title}
        className="absolute inset-0 z-[1]"
      />

      {/* Image ou dégradé */}
      <div className="relative h-44 w-full overflow-hidden">
        {showImg ? (
          <img
            src={photoUrl!}
            alt=""
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: gradientFromColor(color) }}
          >
            <span
              className="text-4xl font-extrabold text-white opacity-90"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.28)" }}
              aria-hidden="true"
            >
              {initials}
            </span>
          </div>
        )}

        {/* Badge catégorie (bas-gauche) */}
        <span
          className="absolute bottom-2 left-2 z-[2] inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold"
          style={{
            background: "var(--peach-pale)",
            color: "var(--coral-deep)",
            border: "1px solid var(--peach)",
          }}
        >
          <span aria-hidden="true">{glyph}</span>
          {label}
        </span>

        {/* Bouton cœur */}
        <button
          type="button"
          aria-label="Sauvegarder (bientôt)"
          className="absolute right-2 top-2 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 20.5l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41.81 4.5 2.09C11.09 4.81 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 3.78-3.4 6.86-8.55 11.68L12 20.5z"
              stroke="var(--coral-deep)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col p-4">
        {/* Date */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--coral-deep)" }}>
          {dateStr} · {timeStr}
        </p>

        {/* Titre */}
        <h3 className="mb-1 line-clamp-2 text-[15px] font-bold leading-snug" style={{ color: "var(--black)" }}>
          {event.title}
        </h3>

        {/* Organisateur */}
        <p className="mb-3 text-xs" style={{ color: "var(--gray)" }}>
          {orgName}
        </p>

        {/* Footer : date encadrée + prix */}
        <div className="mt-auto flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--gray-mid)" }}>
          <div
            className="flex items-center gap-2 rounded-lg px-2 py-1"
            style={{ background: "var(--gray-light)" }}
          >
            <div className="text-center">
              <div className="text-sm font-extrabold leading-none" style={{ color: "var(--black)" }}>{dayNum}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: "var(--coral-deep)" }}>{monthAbbr}</div>
            </div>
          </div>
          {price && (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: price === "Gratuit" ? "var(--mint-pale)" : "var(--peach-pale)",
                color: price === "Gratuit" ? "#2f8a4c" : "var(--coral-deep)",
              }}
            >
              {price}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
