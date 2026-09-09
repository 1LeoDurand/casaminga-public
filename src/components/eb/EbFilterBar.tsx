import { ChevronDown } from "lucide-react";
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
  const hasActiveFilter = priceFilter !== "tous" || lieuFilter !== null || category !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filtre prix, chips */}
      <div
        className="flex overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--gray-mid)" }}
      >
        {(["tous", "gratuit", "payant"] as PriceFilter[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPriceChange(p)}
            className="px-3 py-2.5 text-xs font-medium transition-colors"
            style={{
              background: priceFilter === p ? "var(--black)" : "#fff",
              color: priceFilter === p ? "#fff" : "var(--gray)",
              borderRight: p !== "payant" ? "1px solid var(--gray-mid)" : "none",
            }}
          >
            {p === "tous" ? "Tous les prix" : p === "gratuit" ? "Gratuit" : "Payant"}
          </button>
        ))}
      </div>

      {/*
        Filtre lieu.

        Un `select` se dimensionne sur son option la plus longue, et un élément
        de boîte flexible refuse par défaut de descendre sous cette largeur.
        « Réseau des médiathèques de Montpellier Méditerranée Métropole » suffit
        donc à élargir la page à 446 px, et l'accueil défilait latéralement sur
        tout téléphone. D'où le `min-w-0` qui autorise la compression et le
        `max-w-full` qui borne le menu à la place réellement disponible.
      */}
      <div className="relative min-w-0 max-w-full">
        <select
          value={lieuFilter ?? ""}
          onChange={(e) => onLieuChange(e.target.value || null)}
          className="w-full max-w-full appearance-none truncate rounded-lg border py-2.5 pl-3 pr-8 text-xs font-medium"
          style={{
            borderColor: lieuFilter ? "var(--coral)" : "var(--gray-mid)",
            color: lieuFilter ? "var(--coral-deep)" : "var(--gray)",
            background: "#fff",
          }}
        >
          <option value="">Lieu</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
          style={{ color: "var(--gray)" }}
        />
      </div>

      {/* Filtre catégorie, même contrainte de largeur que le filtre lieu. */}
      <div className="relative min-w-0 max-w-full">
        <select
          value={category ?? ""}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="w-full max-w-full appearance-none truncate rounded-lg border py-2.5 pl-3 pr-8 text-xs font-medium"
          style={{
            borderColor: category ? "var(--coral)" : "var(--gray-mid)",
            color: category ? "var(--coral-deep)" : "var(--gray)",
            background: "#fff",
          }}
        >
          <option value="">Catégorie</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
          style={{ color: "var(--gray)" }}
        />
      </div>

      {/* Compteur + reset */}
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
          className="text-xs font-medium underline underline-offset-2"
          style={{ color: "var(--gray)" }}
        >
          Effacer
        </button>
      )}
    </div>
  );
}
