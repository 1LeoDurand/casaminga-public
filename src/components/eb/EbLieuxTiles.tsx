import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import type { PublicOrg } from "../../lib/supabase";

interface EbLieuxTilesProps {
  orgs: PublicOrg[];
  eventCounts: Map<string, number>;
}

export function EbLieuxTiles({ orgs, eventCounts }: EbLieuxTilesProps) {
  if (orgs.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="wrap">
        <div className="mb-7 flex items-end justify-between">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--black)" }}
          >
            Explorer par lieu
          </h2>
          <span className="text-sm" style={{ color: "var(--gray)" }}>
            {orgs.length} lieu{orgs.length > 1 ? "x" : ""} dans le réseau
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {orgs.map((org) => {
            const count = eventCounts.get(org.id) ?? 0;
            return (
              <Link
                key={org.id}
                to={`/${org.slug}`}
                className="group flex flex-col overflow-hidden bg-white transition-all"
                style={{
                  borderRadius: "10px",
                  border: "1px solid var(--gray-mid)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--gray)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-mid)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                {/* Bandeau couleur */}
                <div
                  className="h-2 w-full"
                  style={{ background: org.primary_color ?? "var(--coral)" }}
                />

                {/* Corps */}
                <div className="flex flex-1 flex-col p-4">
                  <p
                    className="mb-0.5 font-semibold leading-snug"
                    style={{ color: "var(--black)", fontSize: "14px" }}
                  >
                    {org.name}
                  </p>
                  {org.structure && (
                    <p className="mb-2 text-xs" style={{ color: "var(--gray)" }}>
                      {org.structure}
                    </p>
                  )}
                  {org.address && (
                    <p className="mb-3 flex items-start gap-1 text-xs" style={{ color: "var(--gray)" }}>
                      <MapPin size={11} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{org.address}</span>
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <span
                      className="text-xs font-medium"
                      style={{ color: count > 0 ? "var(--coral-deep)" : "var(--gray)" }}
                    >
                      {count > 0 ? `${count} événement${count > 1 ? "s" : ""}` : "Aucun événement"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--gray)" }}
                    />
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
