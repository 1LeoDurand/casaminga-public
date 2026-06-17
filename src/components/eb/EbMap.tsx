import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import type { PublicEstablishment, PublicOrg } from "../../lib/supabase";

interface EbMapProps {
  establishments: PublicEstablishment[];
  orgMap: Map<string, PublicOrg>;
}

export function EbMap({ establishments, orgMap }: EbMapProps) {
  // Établissements réellement géolocalisés (coordonnées stockées en base).
  const located = establishments.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  const center = located.length > 0
    ? ([located[0].latitude!, located[0].longitude!] as [number, number])
    : ([46.5, 2.5] as [number, number]); // France
  const zoom = located.length > 0 ? 12 : 6;

  return (
    <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: "var(--gray-mid)", height: "500px" }}>
      {located.length === 0 && (
        <div
          className="absolute inset-0 z-[1000] flex items-center justify-center px-6 text-center"
          style={{ background: "rgba(255,251,240,0.92)" }}
        >
          <div className="text-sm" style={{ color: "var(--gray)" }}>
            Aucun lieu géolocalisé pour le moment.
          </div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((e) => {
          const org = orgMap.get(e.organization_id);
          return (
            <CircleMarker
              key={e.id}
              center={[e.latitude!, e.longitude!]}
              radius={12}
              pathOptions={{
                fillColor: org?.primary_color ?? "#FF8A65",
                fillOpacity: 0.85,
                color: "#fff",
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-bold" style={{ color: "var(--black)" }}>{e.name}</p>
                  {e.city && (
                    <p className="mt-1 text-xs" style={{ color: "var(--gray)" }}>{e.city}</p>
                  )}
                  {org && (
                    <Link
                      to={`/${org.slug}`}
                      className="mt-2 inline-block text-xs font-semibold"
                      style={{ color: "var(--coral-deep)" }}
                    >
                      Voir le lieu →
                    </Link>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
