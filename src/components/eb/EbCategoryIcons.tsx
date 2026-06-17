import {
  LayoutGrid, Hammer, Music, Palette, Mic, Film,
  ShoppingBag, BookOpen, Calendar,
} from "lucide-react";
import { TYPE_LABELS } from "../../lib/event-meta";

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  atelier:    Hammer,
  concert:    Music,
  exposition: Palette,
  conference: Mic,
  spectacle:  Film,
  marche:     ShoppingBag,
  formation:  BookOpen,
  autre:      Calendar,
};

const CATEGORIES = Object.keys(TYPE_LABELS);

interface EbCategoryIconsProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}

export function EbCategoryIcons({ activeCategory, onCategoryChange }: EbCategoryIconsProps) {
  return (
    <section className="border-b bg-white py-5" style={{ borderColor: "var(--gray-mid)" }}>
      <div className="wrap">
        <div className="flex gap-5 overflow-x-auto pb-1 no-scrollbar">
          {/* Tout */}
          <CategoryBtn
            label="Tout"
            icon={LayoutGrid}
            isActive={activeCategory === null}
            onClick={() => onCategoryChange(null)}
          />
          {CATEGORIES.map((cat) => (
            <CategoryBtn
              key={cat}
              label={TYPE_LABELS[cat]}
              icon={CATEGORY_ICONS[cat] ?? Calendar}
              isActive={activeCategory === cat}
              onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>
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
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 flex-col items-center gap-2 transition-opacity hover:opacity-80"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full transition-all"
        style={{
          background: isActive ? "var(--peach-pale)" : "#f8f8f8",
          border: isActive ? "1.5px solid var(--coral)" : "1.5px solid var(--gray-mid)",
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.5}
          style={{ color: isActive ? "var(--coral-deep)" : "var(--gray)" }}
        />
      </span>
      <span
        className="text-[11px] font-semibold"
        style={{ color: isActive ? "var(--coral-deep)" : "var(--gray)" }}
      >
        {label}
      </span>
    </button>
  );
}
