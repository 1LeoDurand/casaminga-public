import {
  LayoutGrid, Hammer, HardHat, Wrench, Sprout, ShoppingBasket,
  Mic, Drama, Image as ImageIcon, MessagesSquare, Calendar,
} from "lucide-react";
import { FILTER_CATEGORIES, TYPE_LABELS } from "../../lib/event-meta";

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;

/**
 * Une icône filaire par catégorie. Jeu lucide-react (déjà installé, licence
 * MIT) : même famille de trait que le modèle. Pour passer aux UIcons de
 * Flaticon, il suffit de remplacer ce dictionnaire — rien d'autre ne bouge.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  atelier: Hammer,
  chantier: HardHat,
  "repair-cafe": Wrench,
  jardin: Sprout,
  marche: ShoppingBasket,
  concert: Mic,
  spectacle: Drama,
  exposition: ImageIcon,
  rencontre: MessagesSquare,
};

interface EbCategoryIconsProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  /**
   * Nombre d'événements par type dans le jeu de données affiché. Seules les
   * catégories réellement représentées sont proposées : une pastille qui ne
   * mène qu'à un écran vide est une promesse non tenue.
   */
  counts: Record<string, number>;
}

/**
 * Rangée de catégories : pastille ronde, icône filaire, libellé dessous.
 * Gabarit demandé par Léo (2026-09-06), repris d'Eventbrite.
 *
 * Responsive : grille de 3 colonnes sur mobile, 5 à partir de sm, tout sur une
 * ligne à partir de lg. Une grille et non un défilement horizontal, pour que
 * rien ne reste caché hors écran.
 */
export function EbCategoryIcons({ activeCategory, onCategoryChange, counts }: EbCategoryIconsProps) {
  const shown = FILTER_CATEGORIES.filter((cat) => (counts[cat] ?? 0) > 0);
  if (shown.length === 0) return null;

  return (
    <section className="border-b bg-white py-6 sm:py-8" style={{ borderColor: "var(--gray-mid)" }}>
      {/* Gouttière plus étroite que `wrap` sous sm : sinon la grille tombe à
          2 colonnes sur un téléphone, ce qui étire la rangée en hauteur. */}
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-7">
        {/*
          Grille auto-ajustée plutôt qu'un nombre de colonnes figé : le nombre
          de catégories varie avec les données, donc la rangée doit s'adapter
          seule — 3 par ligne sur un téléphone, tout sur une ligne au large.
        */}
        <ul
          className="grid gap-x-2.5 gap-y-6 sm:gap-x-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))" }}
        >
          <CategoryBtn
            label="Tout"
            icon={LayoutGrid}
            isActive={activeCategory === null}
            onClick={() => onCategoryChange(null)}
          />
          {shown.map((cat) => (
            <CategoryBtn
              key={cat}
              label={TYPE_LABELS[cat] ?? cat}
              icon={CATEGORY_ICONS[cat] ?? Calendar}
              isActive={activeCategory === cat}
              onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoryBtn({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        className="group flex w-full flex-col items-center gap-2.5 text-center"
      >
        <span
          className="flex h-[68px] w-[68px] items-center justify-center rounded-full transition-colors sm:h-[76px] sm:w-[76px]"
          style={{
            background: isActive ? "var(--peach-pale)" : "var(--white)",
            border: `1.5px solid ${isActive ? "var(--coral)" : "var(--gray-mid)"}`,
          }}
        >
          <Icon
            size={28}
            strokeWidth={1.4}
            style={{ color: isActive ? "var(--coral-deep)" : "var(--black)" }}
          />
        </span>
        <span
          className="text-[13px] font-semibold leading-tight sm:text-[14px]"
          style={{ color: isActive ? "var(--coral-deep)" : "var(--black)" }}
        >
          {label}
        </span>
      </button>
    </li>
  );
}
