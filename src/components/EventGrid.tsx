import { Link } from "react-router-dom";
import type { PublicEvent, PublicOrg } from "../lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier", concert: "Concert", exposition: "Exposition",
  conference: "Conférence", spectacle: "Spectacle", marche: "Marché",
  formation: "Formation", autre: "Événement",
};

// Glyphe unicode dominant par catégorie (pas d'icônes externes).
const TYPE_GLYPHS: Record<string, string> = {
  atelier: "🛠️", concert: "🎵", exposition: "🖼️", conference: "🎤",
  spectacle: "🎭", marche: "🧺", formation: "📚", autre: "🎟️",
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
 * EventCard — carte événement partagée (PROPRIÉTAIRE = ce fichier).
 * Aucun autre fichier ne doit redéfinir EventCard ; importez-la depuis ici.
 * Rendu 100% typographique : bandeau dégradé dérivé de org.primary_color +
 * glyphe de catégorie + initiales du lieu. Aucune interactivité réelle.
 */
export function EventCard({ event, org }: { event: PublicEvent; org?: PublicOrg }) {
  const color = org?.primary_color ?? "#FF8A65";
  const initials = (org?.name ?? "··").slice(0, 2).toUpperCase();
  const orgName = org?.name ?? "Lieu du réseau";
  const price = fmtPrice(event.price);
  const label = TYPE_LABELS[event.type] ?? "Événement";
  const glyph = TYPE_GLYPHS[event.type] ?? "🎟️";

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
      {/* (1) Couverture typographique */}
      <div
        className="relative h-20 w-full sm:h-24"
        style={{ background: gradientFromColor(color) }}
      >
        {/* Initiales discrètes (texte blanc garanti lisible par le dégradé sombre) */}
        <span
          className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-white opacity-90"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}
          aria-hidden="true"
        >
          {initials}
        </span>
        {/* Mini-pill catégorie (bas-gauche) */}
        <span
          className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold"
          style={{ background: "var(--peach-pale)", color: "var(--coral-deep)", border: "1px solid var(--peach)" }}
        >
          <span aria-hidden="true">{glyph}</span>
          {label}
        </span>
        {/* Favoris : retiré du rendu (non câblé). À réintroduire avec la feature. */}
      </div>

      {/* (2) Corps */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-end">
          {price && (
            <span className="text-sm font-bold" style={{ color: price === "Gratuit" ? "#2f8a4c" : "var(--black)" }}>
              {price}
            </span>
          )}
        </div>
        <h3 className="text-[18px] font-bold leading-snug" style={{ color: "var(--black)" }}>{event.title}</h3>
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
              <span className="sr-only">{fmtDate(event.start_at)} — </span>{fmtTime(event.start_at)}
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
 * EventGrid — grille principale d'événements, alimentée par la liste DÉJÀ
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
