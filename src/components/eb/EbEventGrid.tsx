import type { PublicEvent, PublicOrg } from "../../lib/supabase";
import { EbEventCard } from "./EbEventCard";

interface EbEventGridProps {
  events: PublicEvent[];
  orgMap: Map<string, PublicOrg>;
  loading: boolean;
}

export function EbEventGrid({ events, orgMap, loading }: EbEventGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-72 animate-pulse" style={{ background: "var(--gray-light)" }} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div
        className="card py-20 text-center"
        style={{ borderStyle: "dashed", color: "var(--gray)" }}
      >
        <p className="text-lg font-semibold">Aucun événement pour ces critères.</p>
        <p className="mt-2 text-sm">Essaie de modifier les filtres ou de revenir à « Tout ».</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((e) => (
        <EbEventCard key={e.id} event={e} org={orgMap.get(e.organization_id)} />
      ))}
    </div>
  );
}
