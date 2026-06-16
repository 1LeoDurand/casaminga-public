import { Link } from "react-router-dom";
import type { PublicOrg } from "../../lib/supabase";
import { gradientFromColor } from "../../lib/event-meta";

interface EbLieuxTilesProps {
  orgs: PublicOrg[];
  eventCounts: Map<string, number>;
}

export function EbLieuxTiles({ orgs, eventCounts }: EbLieuxTilesProps) {
  if (orgs.length === 0) return null;

  return (
    <section className="py-10">
      <div className="wrap">
        <h2 className="mb-6 text-xl font-extrabold" style={{ color: "var(--black)" }}>
          Explorer par lieu
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {orgs.map((org) => {
            const count = eventCounts.get(org.id) ?? 0;
            const initials = org.name.slice(0, 2).toUpperCase();

            return (
              <Link
                key={org.id}
                to={`/${org.slug}`}
                className="card group relative flex flex-col overflow-hidden"
              >
                {/* Bandeau couleur */}
                <div
                  className="flex h-20 items-center justify-center"
                  style={{ background: gradientFromColor(org.primary_color ?? "#FF8A65") }}
                >
                  <span
                    className="text-3xl font-extrabold text-white"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
                  >
                    {initials}
                  </span>
                </div>

                {/* Corps */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-bold leading-snug" style={{ color: "var(--black)" }}>
                    {org.name}
                  </p>
                  {org.structure && (
                    <p className="mt-0.5 text-xs" style={{ color: "var(--gray)" }}>
                      {org.structure}
                    </p>
                  )}
                  {org.address && (
                    <p className="mt-1 line-clamp-1 text-xs" style={{ color: "var(--gray)" }}>
                      📍 {org.address}
                    </p>
                  )}
                  <div className="mt-3">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: count > 0 ? "var(--peach-pale)" : "var(--gray-light)",
                        color: count > 0 ? "var(--coral-deep)" : "var(--gray)",
                      }}
                    >
                      {count > 0
                        ? `${count} événement${count > 1 ? "s" : ""} à venir`
                        : "Aucun événement pour l'instant"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
