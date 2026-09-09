/**
 * Fiches importées : repérage et provenance.
 *
 * Une partie de l'agenda ne vient pas des lieux eux-mêmes. Les événements
 * moissonnés sur OpenAgenda (Licence Ouverte) sont publiés sans que
 * l'organisateur en sache rien : il n'a pas de compte, pas de tableau de bord,
 * et personne chez lui ne lira une demande envoyée depuis Casaminga.
 *
 * Le site doit donc savoir distinguer les deux, pour deux raisons :
 *   - dire d'où vient l'information, et renvoyer le visiteur à la source ;
 *   - proposer au lieu de récupérer sa page.
 *
 * **Comment on les reconnaît.** Faute de colonnes `source` et `claim_status`
 * en base, on s'appuie sur le préfixe de `slug`, qui est l'invariant réel de
 * l'import du 2026-09-09 : les cinq organisations créées ce jour-là, et elles
 * seules, portent `import-`. C'est un repère, pas un modèle de données. Le jour
 * où l'admin expose une vraie colonne de provenance, cette fonction devient son
 * seul point de bascule.
 */

/** Préfixe de slug donné aux organisations créées par moissonnage. */
const IMPORT_SLUG_PREFIX = "import-";

/** Séparateur écrit par le script d'import avant la mention de provenance. */
const NOTICE_SEPARATOR = "\n···\n";

export interface ImportedNotice {
  /** La description, débarrassée de la mention technique de provenance. */
  body: string;
  /** Page d'origine de l'événement, si le script l'a consignée. */
  sourceUrl: string | null;
}

/** Vrai si la fiche vient d'un moissonnage et n'a pas d'organisateur inscrit. */
export function isImportedOrg(org: { slug?: string | null } | null | undefined): boolean {
  return !!org?.slug?.startsWith(IMPORT_SLUG_PREFIX);
}

/**
 * Sépare la description de sa mention de provenance.
 *
 * Le script d'import colle la provenance en fin de texte, ce qui la fait lire
 * comme la dernière phrase de l'événement. On la sort d'ici pour l'afficher
 * comme ce qu'elle est : une note de bas de page, et un lien utile.
 */
export function splitImportedNotice(description: string | null | undefined): ImportedNotice {
  const text = description ?? "";
  const cut = text.indexOf(NOTICE_SEPARATOR);
  if (cut === -1) return { body: text, sourceUrl: null };

  const notice = text.slice(cut + NOTICE_SEPARATOR.length);
  const match = notice.match(/https?:\/\/\S+/);
  return { body: text.slice(0, cut).trimEnd(), sourceUrl: match ? match[0] : null };
}
