export type TabId = "tous" | "pourVous" | "aujourdhui" | "weekend";

const TABS: { id: TabId; label: string }[] = [
  { id: "tous",      label: "Tout" },
  { id: "pourVous",  label: "Pour vous" },
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "weekend",   label: "Ce week-end" },
];

interface EbTabsProps {
  active: TabId;
  onTabChange: (t: TabId) => void;
}

export function EbTabs({ active, onTabChange }: EbTabsProps) {
  return (
    <div className="flex gap-0 overflow-x-auto border-b no-scrollbar" style={{ borderColor: "var(--gray-mid)" }} role="tablist">
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className="relative shrink-0 px-5 pb-3 pt-1 text-sm font-semibold transition-colors"
            style={{ color: isActive ? "var(--black)" : "var(--gray)", background: "none", border: "none" }}
          >
            {label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--coral)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
