import { TYPE_LABELS, TYPE_GLYPHS } from "../../lib/event-meta";

const CATEGORY_COLORS: Record<string, string> = {
  atelier: "#FFD54F",
  concert: "#FF8A65",
  exposition: "#B3D4DE",
  conference: "#81C784",
  spectacle: "#CE93D8",
  marche: "#FFCC80",
  formation: "#80DEEA",
  autre: "#EF9A9A",
};

const CATEGORIES = Object.keys(TYPE_LABELS);

interface EbCategoryIconsProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}

export function EbCategoryIcons({ activeCategory, onCategoryChange }: EbCategoryIconsProps) {
  return (
    <section className="border-b py-5" style={{ borderColor: "var(--gray-mid)" }}>
      <div className="wrap">
        <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
          {/* Bouton "Tout" */}
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all"
              style={{
                background: activeCategory === null ? "var(--peach-soft)" : "var(--gray-light)",
                border: activeCategory === null ? "2.5px solid var(--coral)" : "2px solid transparent",
                boxShadow: activeCategory === null ? "var(--shadow-md)" : "none",
              }}
            >
              ✨
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: activeCategory === null ? "var(--coral-deep)" : "var(--gray)" }}
            >
              Tout
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(isActive ? null : cat)}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all"
                  style={{
                    background: isActive
                      ? CATEGORY_COLORS[cat] ?? "var(--peach-soft)"
                      : "var(--gray-light)",
                    border: isActive ? `2.5px solid ${CATEGORY_COLORS[cat] ?? "var(--coral)"}` : "2px solid transparent",
                    boxShadow: isActive ? "var(--shadow-md)" : "none",
                    filter: isActive ? "none" : "grayscale(0.2)",
                  }}
                >
                  {TYPE_GLYPHS[cat] ?? "🎟️"}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: isActive ? "var(--black)" : "var(--gray)" }}
                >
                  {TYPE_LABELS[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
