import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { PublicEvent, PublicOrg } from "../../lib/supabase";
import { TYPE_LABELS, fmtPrice } from "../../lib/event-meta";
import { resolveEventImage } from "../../lib/event-images";

interface EbEventCardProps {
  event: PublicEvent;
  org?: PublicOrg;
}

export function EbEventCard({ event, org }: EbEventCardProps) {
  const [imgError, setImgError] = useState(false);

  const orgName = org?.name ?? "Lieu du réseau";
  const price = fmtPrice(event.price);
  const label = TYPE_LABELS[event.type] ?? "Événement";

  const resolvedImg = resolveEventImage(event.type, event.title, event.photos);
  const imgSrc = imgError ? null : resolvedImg;

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

      {/* Image 16:9 */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg,
                color-mix(in srgb, ${org?.primary_color ?? "#FF8A65"} 85%, #1a1a1a) 0%,
                color-mix(in srgb, ${org?.primary_color ?? "#FF8A65"} 55%, #1a1a1a) 100%)`,
            }}
          />
        )}

        {/* Badge catégorie */}
        <span
          className="absolute left-3 top-3 z-[2] rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: "rgba(0,0,0,0.48)", color: "#fff", backdropFilter: "blur(4px)" }}
        >
          {label}
        </span>

        {/* Bouton cœur */}
        <button
          type="button"
          aria-label="Sauvegarder"
          className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform hover:scale-110"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
        >
          <Heart size={14} strokeWidth={1.5} style={{ color: "var(--gray)" }} />
        </button>
      </div>

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
          className="mb-1 line-clamp-2 text-[15px] font-bold leading-snug"
          style={{
            fontFamily: "'Playfair Display', serif",
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
            <span className="text-sm" style={{ color: "var(--gray)" }}>—</span>
          )}
        </div>
      </div>
    </article>
  );
}
