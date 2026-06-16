export type TabId = "tous" | "pourVous" | "aujourdhui" | "weekend";

const TABS: { id: TabId; label: string }[] = [
  { id: "tous", label: "Tout" },
  { id: "pourVous", label: "Pour vous" },
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "weekend", label: "Ce week-end" },
];

interface EbTabsProps {
  active: TabId;
  onTabChange: (t: TabId) => void;
}

export function EbTabs({ active, onTabChange }: EbTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all"
            style={{
              background: isActive ? "var(--coral)" : "transparent",
              color: isActive ? "#fff" : "var(--gray)",
              border: isActive ? "none" : "1.5px solid var(--gray-mid)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
