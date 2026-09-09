import { Link } from "react-router-dom";
import type { PublicEvent, PublicOrg } from "../lib/supabase";
import { resolveEventImage } from "../lib/event-images";
import { EventCover } from "./EventCover";

const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier", concert: "Concert", exposition: "Exposition",
  conference: "Conférence", spectacle: "Spectacle", marche: "Marché",
  formation: "Formation", autre: "Événement",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function fmtPrice(price: number | null) {
  if (price === null) return null;
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

// Recette de dégradé déterministe PARTAGÉE (dupliquée verbatim dans CategoryRow/
// LieuxRow/TopDestinations) : deux arrêts assombris dérivés de la couleur via
// color-mix (feature CSS native, pas une dépendance npm). Garantit un fond
// suffisamment sombre pour des initiales blanches lisibles QUELLE QUE SOIT la
// teinte de primary_color (golden, peach, blue-soft restent contrastés).
function gradientFromColor(c: string): string {
  return `linear-gradient(135deg, color-mix(in srgb, ${c} 88%, #2C2C2C) 0%, color-mix(in srgb, ${c} 60%, #2C2C2C) 100%)`;
}

/**
 * EventCard : carte événement partagée (PROPRIÉTAIRE = ce fichier).
 * Aucun autre fichier ne doit redéfinir EventCard ; importez-la depuis ici.
 * Couverture photo (photo de la base, sinon image de catégorie), pastille de
 * catégorie, puis titre, extrait, date et lieu.
 */
export function EventCard({ event, org }: { event: PublicEvent; org?: PublicOrg }) {
  const color = org?.primary_color ?? "#FF8A65";
  const orgName = org?.name ?? "Lieu du réseau";
  const price = fmtPrice(event.price);
  const label = TYPE_LABELS[event.type] ?? "Événement";

  const start = new Date(event.start_at);
  const dayNum = start.toLocaleDateString("fr-FR", { day: "numeric" });
  const monthAbbr = start.toLocaleDateString("fr-FR", { month: "short" });

  return (
    <article className="card relative flex flex-col overflow-hidden">
      {/* Lien "stretched" : couvre toute la carte → clic = page détail. */}
      <Link
        to={`/evenement/${event.id}`}
        aria-label={event.title}
        className="absolute inset-0 z-[1]"
      />
      {/* (1) Visuel : affiche entière sur fond flouté (cf. EventCover). */}
      <EventCover
        src={resolveEventImage(event.type, event.title, event.photos)}
        className="aspect-[4/3] w-full"
        fallback={gradientFromColor(color)}
      >
        <span
          className="absolute bottom-2 left-2 z-[2] inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ background: "rgba(255,251,240,0.94)", color: "var(--coral-deep)" }}
        >
          {label}
        </span>
      </EventCover>

      {/* (2) Corps */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-end">
          {price && (
            <span className="text-sm font-bold" style={{ color: price === "Gratuit" ? "#2f8a4c" : "var(--black)" }}>
              {price}
            </span>
          )}
        </div>
        <h3 className="text-[17px] font-bold leading-snug" style={{ color: "var(--black)" }}>{event.title}</h3>
        {event.description && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--gray)" }}>
            {event.description}
          </p>
        )}

        {/* (3) Séparateur + bloc date encadré + heure + lieu */}
        <div className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--gray-mid)" }}>
          <div
            className="shrink-0 rounded-[12px] px-2 py-1 text-center"
            style={{ border: "1px solid var(--gray-mid)" }}
          >
            <div className="text-base font-bold leading-none" style={{ color: "var(--black)" }}>{dayNum}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase leading-none" style={{ color: "var(--coral-deep)" }}>
              {monthAbbr}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs" style={{ color: "var(--gray)" }}>
              <span className="sr-only">{fmtDate(event.start_at)}, </span>{fmtTime(event.start_at)}
            </div>
            <div className="mt-0.5 truncate text-xs font-semibold" style={{ color: "var(--black)" }}>{orgName}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

const EMPTY_MESSAGES: Record<EventGridProps["activeTab"], string> = {
  tous: "Aucun événement à venir pour le moment.",
  aujourdhui: "Aucun événement aujourd'hui.",
  weekend: "Aucun événement ce week-end.",
};

interface EventGridProps {
  events: PublicEvent[];
  orgMap: Map<string, PublicOrg>;
  activeTab: "tous" | "aujourdhui" | "weekend";
  /** Catégorie active (pour proposer une réinitialisation depuis l'état vide). */
  activeCategory?: string | null;
  /** Réinitialise les filtres (catégorie + onglet). */
  onReset?: () => void;
}

/**
 * EventGrid, grille principale d'événements, alimentée par la liste DÉJÀ
 * filtrée fournie par DiscoverySection. Fait le lookup org via orgMap UNE fois
 * et passe org en prop à EventCard. Gère l'état vide contextualisé.
 */
export function EventGrid({ events, orgMap, activeTab, activeCategory = null, onReset }: EventGridProps) {
  if (events.length === 0) {
    const hasActiveFilter = activeCategory !== null || activeTab !== "tous";
    return (
      <div className="card py-16 text-center" style={{ borderStyle: "dashed", color: "var(--gray)" }}>
        <p>{EMPTY_MESSAGES[activeTab]}</p>
        {hasActiveFilter && onReset && (
          <button type="button" onClick={onReset} className="btn btn-secondary btn-sm mt-4">
            Réinitialiser les filtres
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} org={orgMap.get(e.organization_id)} />
      ))}
    </div>
  );
}
