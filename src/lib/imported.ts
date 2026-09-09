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

import type { EventImport, PublicOrg } from "./supabase";

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

/* ══════════════════════════════════════════════════════════════
   Comment participer, sur une fiche importée
   ══════════════════════════════════════════════════════════════ */

/**
 * La question du visiteur n'est pas « où je clique », c'est « est-ce que j'ai
 * quelque chose à faire ? ». La source y répond dans deux champs :
 * `conditions`, écrit par l'organisateur, et `registration`, le canal typé par
 * lequel il demande qu'on s'inscrive.
 *
 * On les rend tels quels. Aucune interprétation, aucune reformulation : si
 * l'organisateur a écrit « 12 participants, inscription obligatoire », c'est
 * cette phrase qui s'affiche, pas notre résumé. Le seul jugement porté ici est
 * de savoir s'il faut proposer un canal, et jamais d'en inventer un.
 */
export interface Channel {
  kind: "email" | "link" | "phone";
  /** Adresse, URL ou numéro, tel que déclaré. */
  value: string;
  /** Ce que le visiteur lit et peut copier. */
  label: string;
  /** Destination du lien. */
  href: string;
}

export interface Participation {
  /** Les mots de l'organisateur sur l'accès, ou null s'il n'a rien dit. */
  conditions: string | null;
  /** Canaux d'inscription, dans l'ordre déclaré. Vide si aucun. */
  channels: Channel[];
  /** Vrai quand le lieu attend une démarche du visiteur. */
  needsAction: boolean;
}

/**
 * Les organisateurs décorent volontiers leurs conditions d'émoji (« 🎟 Entrée
 * 3 € », « 🆓 Gratuit pour les moins de 16 ans »). Le site n'en affiche nulle
 * part, on les retire du texte repris.
 */
function stripEmoji(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

/** Indices d'une démarche attendue, quand aucun canal n'est déclaré. */
const ASKS_ACTION = /inscription|inscri|réserv|reserv|sur invitation|places limitées/i;

function toChannel(type: string, raw: string): Channel | null {
  const value = raw.trim();
  if (!value) return null;
  if (type === "email") return { kind: "email", value, label: value, href: `mailto:${value}` };
  if (type === "phone") {
    // Numéros reçus tantôt « 0467163420 », tantôt « 04 67 16 34 20 ».
    const digits = value.replace(/[^\d+]/g, "");
    const label = digits.length === 10 ? digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim() : value;
    return { kind: "phone", value, label, href: `tel:${digits}` };
  }
  if (type === "link" && /^https?:\/\//.test(value)) {
    return { kind: "link", value, label: "Inscription en ligne", href: value };
  }
  return null;
}

/**
 * Ce que le visiteur doit faire pour venir, à partir de la provenance et, à
 * défaut, de l'accueil du lieu.
 *
 * Le repli sur le contact du lieu n'a lieu **que** si l'organisateur a signalé
 * une inscription : proposer d'écrire pour une exposition en entrée libre
 * inventerait une démarche qui n'existe pas.
 */
export function participation(
  provenance: EventImport | null,
  org: PublicOrg | null
): Participation {
  const conditions = provenance?.conditions ? stripEmoji(provenance.conditions) : null;

  const declared = (provenance?.registration ?? [])
    .map((r) => toChannel(r.type, r.value))
    .filter((c): c is Channel => c !== null);

  if (declared.length > 0) return { conditions, channels: declared, needsAction: true };

  const asksAction = !!conditions && ASKS_ACTION.test(conditions);
  if (!asksAction) return { conditions, channels: [], needsAction: false };

  const fallback: Channel[] = [];
  const viaOrg = org?.email ? toChannel("email", org.email) : null;
  if (viaOrg) fallback.push(viaOrg);
  const byPhone = org?.phone ? toChannel("phone", org.phone) : null;
  if (byPhone) fallback.push(byPhone);

  return { conditions, channels: fallback, needsAction: true };
}

/**
 * Brouillon d'email d'un visiteur vers l'organisateur.
 *
 * L'objet parle de l'événement et non de Casaminga : c'est ce qui décide un
 * lieu à ouvrir le message et à le router. La plateforme est nommée en une
 * phrase dans le corps, où elle se lit comme l'explication d'une personne et
 * non comme du démarchage. Le brouillon reste court, un texte long est réécrit
 * ou abandonné, et la mention disparaît avec lui.
 */
export function visitorMailto(to: string, eventTitle: string, dateLabel: string): string {
  const subject = `Inscription : ${eventTitle}`;
  const body = [
    "Bonjour,",
    "",
    `J'ai vu votre événement « ${eventTitle} » (${dateLabel}) sur Casaminga et je souhaiterais y participer.`,
    "",
    "Pouvez-vous me dire s'il reste de la place ?",
    "",
    "Merci,",
  ].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
