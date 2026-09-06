// Constantes partagées entre EventGrid.tsx (original) et les composants eb/.
// EventGrid.tsx n'est PAS modifié — il duplique ces valeurs intentionnellement.

export const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier",
  chantier: "Chantier participatif",
  "repair-cafe": "Repair café",
  jardin: "Jardin & permaculture",
  marche: "Marché & troc",
  concert: "Concert",
  spectacle: "Spectacle",
  exposition: "Exposition",
  rencontre: "Rencontre & débat",
  // Types encore portés par des événements existants : conservés pour que ces
  // fiches gardent leur libellé, même s'ils ne sont plus proposés en filtre.
  conference: "Conférence",
  formation: "Formation",
  autre: "Événement",
};

/**
 * Catégories proposées comme filtres, dans l'ordre d'affichage.
 * Volontairement plus court que TYPE_LABELS : un libellé sert à décrire une
 * fiche, un filtre sert à naviguer — les deux listes n'ont pas à coïncider.
 */
export const FILTER_CATEGORIES = [
  "atelier",
  "chantier",
  "repair-cafe",
  "jardin",
  "marche",
  "concert",
  "spectacle",
  "exposition",
  "rencontre",
] as const;

export const TYPE_GLYPHS: Record<string, string> = {
  atelier: "🛠️",
  chantier: "🚧",
  "repair-cafe": "🔧",
  jardin: "🌱",
  marche: "🧺",
  concert: "🎵",
  spectacle: "🎭",
  exposition: "🖼️",
  rencontre: "💬",
  conference: "🎤",
  formation: "📚",
  autre: "🎟️",
};

export function gradientFromColor(c: string): string {
  return `linear-gradient(135deg, color-mix(in srgb, ${c} 88%, #2C2C2C) 0%, color-mix(in srgb, ${c} 60%, #2C2C2C) 100%)`;
}

export function fmtPrice(price: number | null): string | null {
  if (price === null) return null;
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isThisWeekend(iso: string): boolean {
  const d = new Date(iso);
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day !== 0 && day !== 6) return false;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}
