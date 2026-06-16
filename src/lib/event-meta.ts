// Constantes partagées entre EventGrid.tsx (original) et les composants eb/.
// EventGrid.tsx n'est PAS modifié — il duplique ces valeurs intentionnellement.

export const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier",
  concert: "Concert",
  exposition: "Exposition",
  conference: "Conférence",
  spectacle: "Spectacle",
  marche: "Marché",
  formation: "Formation",
  autre: "Événement",
};

export const TYPE_GLYPHS: Record<string, string> = {
  atelier: "🛠️",
  concert: "🎵",
  exposition: "🖼️",
  conference: "🎤",
  spectacle: "🎭",
  marche: "🧺",
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
