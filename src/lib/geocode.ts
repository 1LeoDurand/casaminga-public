interface LatLng { lat: number; lng: number }

const cache = new Map<string, LatLng | null>();

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = address.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
    );
    const json = await res.json();
    const feature = json.features?.[0];
    if (!feature) { cache.set(key, null); return null; }
    const [lng, lat] = feature.geometry.coordinates as [number, number];
    const result: LatLng = { lat, lng };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
