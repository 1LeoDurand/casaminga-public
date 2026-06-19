/**
 * Niveau 2 de la stratégie images — livraison responsive.
 *
 * Le niveau 1 (compression à l'upload : resize ~2000px + WebP) est fait côté
 * admin (casa-minga-lieux). Ici, côté affichage, on sert l'image à la bonne
 * taille selon l'usage.
 *
 * ⚠️ La transformation d'image Supabase (endpoint /render/image/) est une
 * fonctionnalité du plan Pro+. Le projet est actuellement en plan FREE → on
 * NE peut PAS redimensionner à la volée. Le helper renvoie donc l'URL telle
 * quelle, et la performance repose sur :
 *   - le niveau 1 (image déjà légère à l'upload),
 *   - loading="lazy" + decoding="async" (cf. <LazyImg>),
 *   - les conteneurs à ratio fixe (pas de reflow).
 *
 * Le jour du passage en Pro : passer SUPABASE_IMAGE_TRANSFORM à true — toutes
 * les images Supabase seront alors servies redimensionnées + WebP q75, sans
 * autre changement de code.
 */

const SUPABASE_IMAGE_TRANSFORM = false;

const STORAGE_PUBLIC = "/storage/v1/object/public/";
const STORAGE_RENDER = "/storage/v1/render/image/public/";

/**
 * Renvoie l'URL d'une image Supabase à la largeur souhaitée.
 * Sur plan Pro : URL de rendu (?width=&quality=75&resize=cover).
 * Sur plan Free (actuel) : URL d'origine inchangée.
 */
export function lieuImage(url: string | null | undefined, width: number): string {
  if (!url) return "";
  if (!SUPABASE_IMAGE_TRANSFORM) return url;
  if (!url.includes(STORAGE_PUBLIC)) return url;
  const rendered = url.replace(STORAGE_PUBLIC, STORAGE_RENDER);
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}width=${width}&quality=75&resize=cover`;
}
