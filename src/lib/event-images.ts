// Images thématiques par type d'événement — source Unsplash (licence libre).
// URL stable : https://images.unsplash.com/photo-{ID}?w=800&q=80&fit=crop&auto=format
// Priorité d'affichage : photos[] BDD → keyword title → catégorie → dégradé (fallback).

const BASE = "https://images.unsplash.com/photo-";
const PARAMS = "?w=800&q=80&fit=crop&auto=format";

function u(id: string) { return `${BASE}${id}${PARAMS}`; }

// Image par catégorie (type d'événement)
export const CATEGORY_IMAGES: Record<string, string> = {
  atelier:    u("1565193566173-7a0ee3dbe261"), // mains en poterie
  concert:    u("1514525253161-7a46d19cd819"), // concert salle
  exposition: u("1531243269054-5ebf6f34081e"), // galerie d'art
  conference: u("1540575467063-178a50c2df87"), // salle de conférence
  spectacle:  u("1507924538820-ede94a04019d"), // scène de théâtre
  marche:     u("1488459716781-31db52582fe9"), // marché coloré
  formation:  u("1524178232363-1fb2b075b655"), // atelier / formation
  autre:      u("1511578314322-379afb476865"), // rassemblement
};

// Overrides par mots-clés dans le titre (ordre de priorité, premier match gagne)
const KEYWORD_OVERRIDES: { keywords: string[]; image: string }[] = [
  { keywords: ["poterie", "céramique", "ceramique", "argile"],       image: u("1565193566173-7a0ee3dbe261") },
  { keywords: ["cuisine", "culinaire", "gastronomie", "cook"],       image: u("1556910103-1c02745aae4d") },
  { keywords: ["yoga", "méditation", "meditation", "qi gong", "tai chi"], image: u("1545205597-3d9d02c29597") },
  { keywords: ["danse", "dance", "bal", "chorégraphie"],             image: u("1518611012118-696072aa579a") },
  { keywords: ["peinture", "aquarelle", "dessin", "gravure"],        image: u("1579783901586-d88db74b4fe4") },
  { keywords: ["jazz"],                                               image: u("1415201364774-f6f0bb35f28f") },
  { keywords: ["cirque", "acrobat"],                                  image: u("1499364615650-ec38552f4f34") },
  { keywords: ["jardin", "jardinage", "botanique"],                   image: u("1416879595882-3373a0480b5b") },
  { keywords: ["photo", "photographie"],                              image: u("1452587925148-ce544e77e70d") },
  { keywords: ["théâtre", "theatre", "impro", "improvisation"],      image: u("1507924538820-ede94a04019d") },
];

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=85&fit=crop&auto=format";

/**
 * Résout l'image à afficher pour un événement.
 * Retourne null si photos[0] est une URL BDD (l'appelant l'utilise directement).
 */
export function resolveEventImage(
  type: string,
  title: string,
  dbPhotos?: string[] | null
): string {
  // 1. Photo réelle en BDD
  if (dbPhotos?.[0]?.startsWith("http")) return dbPhotos[0];

  // 2. Override par mot-clé dans le titre
  const titleLower = title.toLowerCase();
  for (const { keywords, image } of KEYWORD_OVERRIDES) {
    if (keywords.some((kw) => titleLower.includes(kw))) return image;
  }

  // 3. Image par catégorie
  return CATEGORY_IMAGES[type] ?? CATEGORY_IMAGES.autre;
}
