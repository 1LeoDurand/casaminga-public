import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// Chrome institutionnel (liens routeur uniquement) — l'ancien Nav/Footer de la
// landing pointait vers des ancres (#lieux, #adhesions…) inexistantes ici.
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { EventCard } from "../components/EventGrid";
import { fetchEventById, type EventDetailData } from "../lib/supabase";

// ── Helpers (alignés sur EventGrid / le langage visuel "zéro image") ──────────
const TYPE_LABELS: Record<string, string> = {
  atelier: "Atelier", concert: "Concert", exposition: "Exposition",
  conference: "Conférence", spectacle: "Spectacle", marche: "Marché",
  formation: "Formation", autre: "Événement",
};
const TYPE_GLYPHS: Record<string, string> = {
  atelier: "🛠️", concert: "🎵", exposition: "🖼️", conference: "🎤",
  spectacle: "🎭", marche: "🧺", formation: "📚", autre: "🎟️",
};
const STRUCTURE_LABELS: Record<string, string> = {
  association: "Association", collectif: "Collectif", scic: "SCIC",
  scop: "SCOP", sarl: "SARL / SAS", collectivite: "Collectivité", autre: "Tiers-lieu",
};

function gradientFromColor(c: string): string {
  return `linear-gradient(135deg, color-mix(in srgb, ${c} 88%, #2C2C2C) 0%, color-mix(in srgb, ${c} 62%, #2C2C2C) 100%)`;
}
function fmtFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function fmtPrice(price: number | null) {
  if (price === null) return null;
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}
/** Durée lisible à partir de start/end (ex "3 h", "1 h 30", "45 min"). null si invalide. */
function formatDuration(startIso: string, endIso: string): string | null {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const mins = Math.round((end - start) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m}`;
}

const CREAM_BG = { background: "var(--cream)" } as const;

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" style={CREAM_BG}>
      <div className="flex flex-col items-center gap-4">{children}</div>
    </div>
  );
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setData(null);
    if (!id) {
      setLoading(false);
      return;
    }
    fetchEventById(id)
      .then((d) => { if (alive) setData(d); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  // Remonte en haut quand on change d'événement.
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (loading) {
    return (
      <CenteredState>
        <span className="flex size-12 items-center justify-center rounded-xl text-lg font-extrabold text-white" style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-dark))" }}>CM</span>
        <div className="h-1 w-32 overflow-hidden rounded-full" style={{ background: "var(--peach-pale)" }}>
          <div className="h-full w-1/2 animate-pulse rounded-full" style={{ background: "var(--coral)" }} />
        </div>
      </CenteredState>
    );
  }

  if (!data) {
    return (
      <CenteredState>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)" }}>Événement introuvable</h1>
        <p className="lead">Cet événement n'existe pas ou n'est plus publié.</p>
        <Link to="/agenda" className="btn btn-primary mt-2">← Retour à l'agenda</Link>
      </CenteredState>
    );
  }

  const { event, org, siblings } = data;
  const color = org?.primary_color ?? "#FF8A65";
  const orgName = org?.name ?? "Lieu du réseau";
  const label = TYPE_LABELS[event.type] ?? "Événement";
  const glyph = TYPE_GLYPHS[event.type] ?? "🎟️";
  const price = fmtPrice(event.price);
  const duration = formatDuration(event.start_at, event.end_at);
  const structure = STRUCTURE_LABELS[org?.structure ?? ""] ?? "Tiers-lieu";
  const vitrineUrl = org ? `https://admin.casaminga.com/site/${org.slug}` : null;
  // Formulaire de contact du lieu (même pattern que les vitrines /:slug) : c'est
  // le canal réel pour demander à participer / réserver une place.
  const contactUrl = vitrineUrl ? `${vitrineUrl}#contact` : null;

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero typographique (dégradé dérivé de la couleur du lieu) ── */}
        <header className="relative overflow-hidden" style={{ background: gradientFromColor(color), padding: "clamp(36px,6vw,72px) 0" }}>
          <div className="wrap">
            <Link to="/agenda" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white" style={{ opacity: 0.92 }}>
              ← Retour à l'agenda
            </Link>
            <div className="mt-6 flex flex-col gap-4 text-white">
              <span className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}>
                <span aria-hidden="true">{glyph}</span> {label}
              </span>
              <h1 className="text-white" style={{ maxWidth: "20ch", textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>{event.title}</h1>
              {org && (
                <p className="text-sm" style={{ opacity: 0.95 }}>
                  par{" "}
                  {vitrineUrl ? (
                    <a href={vitrineUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline">{orgName}</a>
                  ) : (
                    <span className="font-semibold">{orgName}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* ── Barre d'action (date / prix / CTA réels) ── */}
        <div style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-mid)" }}>
          <div className="wrap flex flex-wrap items-center justify-between gap-4 py-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: "var(--black)" }}>
              <span className="font-semibold">📅 {fmtFullDate(event.start_at)}</span>
              <span style={{ color: "var(--gray)" }}>🕒 {fmtTime(event.start_at)} – {fmtTime(event.end_at)}</span>
              {price && <span className="font-bold" style={{ color: price === "Gratuit" ? "#2f8a4c" : "var(--black)" }}>{price}</span>}
            </div>
            <div className="flex items-center gap-2">
              {vitrineUrl && (
                <a href={vitrineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Voir le lieu</a>
              )}
              {contactUrl ? (
                <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  Contacter le lieu
                </a>
              ) : (
                <Link to="/agenda" className="btn btn-primary btn-sm">Tous les événements</Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Corps : 2 colonnes (contenu + aside) ── */}
        <div className="wrap grid gap-10 py-12 lg:grid-cols-[1.7fr_1fr]">
          <div className="flex flex-col gap-10">
            {/* À propos */}
            {event.description && (
              <section>
                <h2 style={{ fontSize: "clamp(22px,3vw,28px)" }}>À propos</h2>
                <p className="lead mt-3" style={{ whiteSpace: "pre-line", maxWidth: "none" }}>{event.description}</p>
              </section>
            )}

            {/* Bon à savoir */}
            <section>
              <h2 style={{ fontSize: "clamp(22px,3vw,28px)" }}>Bon à savoir</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {duration && (
                  <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">⏱️ {duration}</span>
                )}
                <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">🧍 En présentiel</span>
                {price && (
                  <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">{price === "Gratuit" ? "🎟️ Entrée gratuite" : `💶 ${price}`}</span>
                )}
              </div>
            </section>

            {/* Lieu */}
            <section>
              <h2 style={{ fontSize: "clamp(22px,3vw,28px)" }}>Lieu</h2>
              <div className="card mt-3 p-5">
                <div className="font-bold" style={{ color: "var(--black)" }}>{orgName}</div>
                {org?.address ? (
                  <div className="mt-1 text-sm" style={{ color: "var(--gray)" }}>{org.address}</div>
                ) : (
                  <>
                    <div className="mt-1 text-sm" style={{ color: "var(--gray)" }}>
                      L'adresse exacte est communiquée par le lieu.
                    </div>
                    {contactUrl && (
                      <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-4">
                        Demander les modalités d'accès
                      </a>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Aside : organisateur */}
          {org && (
            <aside>
              <div className="card p-5" style={{ position: "sticky", top: "88px" }}>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--coral-deep)" }}>Organisé par</div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] text-sm font-extrabold text-white" style={{ background: gradientFromColor(color) }}>
                    {orgName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-bold" style={{ color: "var(--black)" }}>{orgName}</div>
                    <div className="text-xs" style={{ color: "var(--gray)" }}>{structure}</div>
                  </div>
                </div>
                {org.description && (
                  <p className="mt-3 line-clamp-4 text-sm" style={{ color: "var(--gray)" }}>{org.description}</p>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  {vitrineUrl && (
                    <a href={vitrineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-full">Voir la page du lieu</a>
                  )}
                  {org.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm w-full">Site web ↗</a>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* ── Plus d'événements du même lieu ── */}
        {siblings.length > 0 && (
          <section style={{ background: "var(--cream-warm)", padding: "clamp(48px,6vw,72px) 0" }}>
            <div className="wrap">
              <h2 style={{ fontSize: "clamp(22px,3vw,28px)" }}>Plus d'événements de {orgName}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {siblings.map((e) => <EventCard key={e.id} event={e} org={org ?? undefined} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
