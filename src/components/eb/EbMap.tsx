import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { PublicOrg } from "../../lib/supabase";
import { geocodeAddress } from "../../lib/geocode";

interface GeoOrg extends PublicOrg {
  lat: number;
  lng: number;
  eventCount: number;
}

interface EbMapProps {
  orgs: PublicOrg[];
  eventCounts: Map<string, number>;
}

export function EbMap({ orgs, eventCounts }: EbMapProps) {
  const [geoOrgs, setGeoOrgs] = useState<GeoOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function geocode() {
      setLoading(true);
      const results: GeoOrg[] = [];
      for (const org of orgs) {
        if (!org.address) continue;
        const pos = await geocodeAddress(org.address);
        if (!pos) continue;
        results.push({
          ...org,
          lat: pos.lat,
          lng: pos.lng,
          eventCount: eventCounts.get(org.id) ?? 0,
        });
      }
      if (!cancelled) {
        setGeoOrgs(results);
        setLoading(false);
      }
    }
    geocode();
    return () => { cancelled = true; };
  }, [orgs, eventCounts]);

  // Centre par défaut sur la France
  const center = geoOrgs.length > 0
    ? ([geoOrgs[0].lat, geoOrgs[0].lng] as [number, number])
    : ([46.5, 2.5] as [number, number]);

  const zoom = geoOrgs.length > 0 ? 12 : 6;

  return (
    <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: "var(--gray-mid)", height: "500px" }}>
      {loading && (
        <div
          className="absolute inset-0 z-[1000] flex items-center justify-center"
          style={{ background: "rgba(255,251,240,0.85)" }}
        >
          <div className="text-sm font-semibold" style={{ color: "var(--coral-deep)" }}>
            Localisation des lieux…
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
        {geoOrgs.map((org) => (
          <CircleMarker
            key={org.id}
            center={[org.lat, org.lng]}
            radius={org.eventCount > 0 ? 14 : 10}
            pathOptions={{
              fillColor: org.primary_color ?? "#FF8A65",
              fillOpacity: 0.85,
              color: "#fff",
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold" style={{ color: "var(--black)" }}>{org.name}</p>
                {org.address && (
                  <p className="mt-1 text-xs" style={{ color: "var(--gray)" }}>{org.address}</p>
                )}
                {org.eventCount > 0 && (
                  <p className="mt-2 text-xs font-semibold" style={{ color: "var(--coral-deep)" }}>
                    {org.eventCount} événement{org.eventCount > 1 ? "s" : ""} à venir
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
