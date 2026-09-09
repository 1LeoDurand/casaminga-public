/**
 * Retrait automatique des marges unies d'une image.
 *
 * Le problème observé sur l'import OpenAgenda du 2026-09-09 : les affiches
 * d'associations sont souvent une petite illustration posée au milieu d'une
 * grande zone blanche. Mesuré sur les neuf visuels importés, six portaient
 * de 30 % à 71 % de marge morte, et l'une d'elles (« Biodiversité (In)visible »)
 * arrivait en 400x600 alors que son contenu réel tient en 320x228.
 *
 * Aucun cadrage CSS ne rattrape ça : le vide fait partie de l'image. Il faut
 * la lire pixel par pixel et trouver où le contenu commence.
 *
 * Méthode : on dessine une vignette de l'image dans un canvas, on prend la
 * couleur des quatre coins comme référence de fond, et on cherche la plus
 * petite boîte contenant tout ce qui s'en écarte. On renvoie ses coordonnées,
 * que l'affichage applique en CSS.
 *
 * Prudence volontaire :
 *   - les quatre coins doivent s'accorder, sinon l'image n'a pas de fond uni
 *     et on n'y touche pas ;
 *   - en dessous de 8 % de gain, on garde l'original : réencoder pour rien
 *     dégrade la qualité sans rien apporter ;
 *   - tout échec (CORS fermé, canvas contaminé, décodage impossible) renvoie
 *     `null`, et l'image s'affiche entière. Mal cadrée vaut mieux qu'absente.
 *
 * Le CDN d'OpenAgenda répond `access-control-allow-origin: *`, ce qui rend la
 * lecture des pixels possible. Une source sans CORS retombera simplement sur
 * l'original.
 */

/** Boîte de contenu, en fractions de la largeur et de la hauteur de l'image. */
export interface ContentBox { x: number; y: number; w: number; h: number }

/** Une URL d'origine → sa boîte de contenu (null si l'image n'a pas de marge). */
const cache = new Map<string, Promise<ContentBox | null>>();

/** Taille de la vignette d'analyse. Suffisant pour situer une marge au pixel près. */
const PROBE = 96;
/** Écart au fond, sur 255, au-delà duquel un pixel compte comme du contenu. */
const TOLERANCE = 20;
/** En deçà de ce gain de surface, on ne recadre pas. */
const MIN_GAIN = 0.08;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image illisible"));
    img.src = src;
  });
}

/** Boîte du contenu, en fractions de l'image, ou null si rien à retirer. */
function contentBox(img: HTMLImageElement): ContentBox | null {
  const ratio = img.naturalWidth / img.naturalHeight;
  const pw = ratio >= 1 ? PROBE : Math.max(8, Math.round(PROBE * ratio));
  const ph = ratio >= 1 ? Math.max(8, Math.round(PROBE / ratio)) : PROBE;

  const canvas = document.createElement("canvas");
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, pw, ph);

  const { data } = ctx.getImageData(0, 0, pw, ph);
  const at = (x: number, y: number) => (y * pw + x) * 4;

  // Les quatre coins doivent décrire le même fond, sinon il n'y a pas de marge.
  const corners = [at(0, 0), at(pw - 1, 0), at(0, ph - 1), at(pw - 1, ph - 1)];
  const bg = [0, 1, 2].map((c) => corners.reduce((s, i) => s + data[i + c], 0) / 4);
  const spread = Math.max(
    ...corners.map((i) => Math.max(...[0, 1, 2].map((c) => Math.abs(data[i + c] - bg[c]))))
  );
  if (spread > TOLERANCE) return null;

  let x0 = pw, y0 = ph, x1 = -1, y1 = -1;
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const i = at(x, y);
      const diff = Math.max(
        Math.abs(data[i] - bg[0]),
        Math.abs(data[i + 1] - bg[1]),
        Math.abs(data[i + 2] - bg[2])
      );
      if (diff <= TOLERANCE) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0 || y1 < y0) return null; // image entièrement unie

  // Une frange d'un pixel, pour ne pas mordre sur le contenu à cause de la vignette.
  x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1);
  x1 = Math.min(pw - 1, x1 + 1); y1 = Math.min(ph - 1, y1 + 1);

  const box = { x: x0 / pw, y: y0 / ph, w: (x1 - x0 + 1) / pw, h: (y1 - y0 + 1) / ph };
  return box.w * box.h > 1 - MIN_GAIN ? null : box;
}

/**
 * Renvoie la boîte de contenu de `src`, en fractions, ou `null` si l'image
 * n'a pas de marge unie à retirer, ou si l'analyse échoue.
 *
 * On renvoie des coordonnées, pas une image : le cadrage est ensuite fait en
 * CSS. Réencoder dans un canvas obligerait à repasser la photo en JPEG (perte
 * inutile) et à servir une `blob:`, que certaines politiques de sécurité
 * refusent. Un décalage CSS, lui, marche partout.
 */
export function imageContentBox(src: string): Promise<ContentBox | null> {
  const hit = cache.get(src);
  if (hit) return hit;

  const task = (async () => {
    try {
      return contentBox(await loadImage(src));
    } catch {
      return null; // CORS fermé, canvas contaminé, image absente : on n'insiste pas.
    }
  })();

  cache.set(src, task);
  return task;
}
