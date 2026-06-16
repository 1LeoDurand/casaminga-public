import type { PublicOrg } from "../../lib/supabase";
import { TYPE_LABELS } from "../../lib/event-meta";

type PriceFilter = "tous" | "gratuit" | "payant";

interface EbFilterBarProps {
  priceFilter: PriceFilter;
  onPriceChange: (v: PriceFilter) => void;
  lieuFilter: string | null;
  onLieuChange: (v: string | null) => void;
  category: string | null;
  onCategoryChange: (v: string | null) => void;
  orgs: PublicOrg[];
  totalCount: number;
}

export function EbFilterBar({
  priceFilter,
  onPriceChange,
  lieuFilter,
  onLieuChange,
  category,
  onCategoryChange,
  orgs,
  totalCount,
}: EbFilterBarProps) {
  const hasActiveFilter =
    priceFilter !== "tous" || lieuFilter !== null || category !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filtre prix */}
      <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "var(--gray-mid)" }}>
        {(["tous", "gratuit", "payant"] as PriceFilter[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPriceChange(p)}
            className="px-4 py-1.5 text-xs font-semibold capitalize transition-colors"
            style={{
              background: priceFilter === p ? "var(--coral)" : "#fff",
              color: priceFilter === p ? "#fff" : "var(--gray)",
            }}
          >
            {p === "tous" ? "Prix : Tous" : p === "gratuit" ? "Gratuit" : "Payant"}
          </button>
        ))}
      </div>

      {/* Filtre lieu */}
      <select
        value={lieuFilter ?? ""}
        onChange={(e) => onLieuChange(e.target.value || null)}
        className="rounded-full border px-4 py-1.5 text-xs font-semibold"
        style={{ borderColor: "var(--gray-mid)", color: lieuFilter ? "var(--coral-deep)" : "var(--gray)" }}
      >
        <option value="">Lieu : Tous</option>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      {/* Filtre catégorie (secondaire, synchronisé avec EbCategoryIcons) */}
      <select
        value={category ?? ""}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        className="rounded-full border px-4 py-1.5 text-xs font-semibold"
        style={{ borderColor: "var(--gray-mid)", color: category ? "var(--coral-deep)" : "var(--gray)" }}
      >
        <option value="">Catégorie : Toutes</option>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {/* Résultats + reset */}
      <span className="ml-auto text-xs" style={{ color: "var(--gray)" }}>
        {totalCount} événement{totalCount !== 1 ? "s" : ""}
      </span>
      {hasActiveFilter && (
        <button
          type="button"
          onClick={() => {
            onPriceChange("tous");
            onLieuChange(null);
            onCategoryChange(null);
          }}
          className="text-xs font-semibold underline"
          style={{ color: "var(--coral-deep)" }}
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
