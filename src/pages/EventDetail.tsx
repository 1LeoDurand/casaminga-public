import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarDays, Clock, MapPin, Share2, Ticket, ArrowRight,
} from "lucide-react";
// Chrome institutionnel (liens routeur uniquement), l'ancien Nav/Footer de la
// landing pointait vers des ancres (#lieux, #adhesions…) inexistantes ici.
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { EventCard } from "../components/EventGrid";
import { EbMap } from "../components/eb/EbMap";
import { EventCover } from "../components/EventCover";
import { resolveEventImage } from "../lib/event-images";
import { TYPE_LABELS } from "../lib/event-meta";
import { isImportedOrg, participation, splitImportedNotice, visitorMailto } from "../lib/imported";
import {
  fetchEventById, fetchDiscoveryEvents, fetchPublicEstablishments, fetchPublicOrgs,
  type EventDetailData, type PublicEvent, type PublicOrg, type PublicEstablishment,
} from "../lib/supabase";

/**
 * Fiche événement (`/evenement/:id`).
 *
 * Structure calquée sur l'anatomie d'une page Eventbrite (demande Léo du
 * 2026-09-08), section par section :
 *   1  visuel        4  quand / où           8  lieu + carte
 *   2  titre         5  panneau « Participer » (collant)   10 organisateur
 *   3  lieu éditeur  6  aperçu                10 bis provenance / revendication
 *   7  bon à savoir  11 autres rendez-vous du lieu
 *                    12 dans le réseau · 13 agenda
 *
 * **Sections volontairement absentes**, faute de données en base, une section
 * vide serait un décor : la FAQ et le signalement.
 *
 * Typographie : **Poppins** partout, comme sur tout le site, c'est la seule
 * police du projet, aucune police d'affichage ne vient s'y ajouter.
 */

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

/** Horodatage iCalendar en UTC (`20261018T080000Z`). */
function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
/** Échappement iCalendar : virgule, point-virgule, antislash et sauts de ligne. */
function icsEscape(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
}

const CREAM_BG = { background: "var(--cream)" } as const;

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" style={CREAM_BG}>
      <div className="flex flex-col items-center gap-4">{children}</div>
    </div>
  );
}

/** Titre de section, Poppins, même échelle sur toute la page. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>;
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  /** Sections 8 et 12 : chargées à part, chacune s'efface si elle est vide. */
  const [establishments, setEstablishments] = useState<PublicEstablishment[]>([]);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [networkEvents, setNetworkEvents] = useState<PublicEvent[]>([]);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    let alive = true;
    Promise.all([fetchPublicEstablishments(), fetchPublicOrgs(), fetchDiscoveryEvents(12)])
      .then(([es, or, ev]) => {
        if (!alive) return;
        setEstablishments(es);
        setOrgs(or);
        setNetworkEvents(ev);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Remonte en haut quand on change d'événement.
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const orgMap = useMemo(() => {
    const m = new Map<string, PublicOrg>();
    for (const o of orgs) m.set(o.id, o);
    return m;
  }, [orgs]);

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
        <h1>Événement introuvable</h1>
        <p className="lead">Cet événement n'existe pas ou n'est plus publié.</p>
        <Link to="/agenda" className="btn btn-primary mt-2">← Retour à l'agenda</Link>
      </CenteredState>
    );
  }

  const { event, org, siblings, provenance } = data;
  const color = org?.primary_color ?? "#FF8A65";
  const orgName = org?.name ?? "Lieu du réseau";
  const label = TYPE_LABELS[event.type] ?? "Événement";
  const price = fmtPrice(event.price);
  const duration = formatDuration(event.start_at, event.end_at);
  const structure = STRUCTURE_LABELS[org?.structure ?? ""] ?? "Tiers-lieu";
  const image = resolveEventImage(event.type, event.title, event.photos);
  const vitrineUrl = org ? `https://admin.casaminga.com/site/${org.slug}` : null;
  // Formulaire de contact du lieu (même pattern que les vitrines /:slug) : c'est
  // le canal réel pour demander à participer / réserver une place.
  const contactUrl = vitrineUrl ? `${vitrineUrl}#contact` : null;

  /**
   * Fiche moissonnée : l'organisateur n'a pas de compte, la provenance est
   * consignée en fin de description. On la sort du texte pour l'afficher à sa
   * place, et on ouvre au lieu la possibilité de récupérer sa page.
   */
  const imported = isImportedOrg(org);
  const { body: descriptionBody, sourceUrl: noticeUrl } = splitImportedNotice(event.description);
  /** La table de provenance fait foi ; la description n'est qu'un vestige de l'import. */
  const sourceUrl = provenance?.source_url ?? noticeUrl;

  /** Ce que le visiteur doit faire pour venir, d'après l'organisateur lui-même. */
  const plan = participation(provenance, org);

  /**
   * Revendication : un simple `mailto`, comme la page Contact du site. Le lieu
   * écrit lui-même, donc Casaminga ne stocke rien, n'envoie rien, et ne promet
   * pas une transmission qu'il ne maîtrise pas. Le sujet porte le nom du lieu
   * pour que la demande soit traitable sans aller-retour.
   */
  const claimHref =
    "mailto:manufacturedespays@gmail.com" +
    `?subject=${encodeURIComponent(`Revendication de la page : ${orgName}`)}` +
    `&body=${encodeURIComponent(
      `Bonjour,\n\nJe fais partie de l'équipe de ${orgName} et je souhaite récupérer la page de ce lieu sur Casaminga.\n\nÉvénement concerné : ${event.title}\nPage : ${typeof window === "undefined" ? "" : window.location.href}\n\nMon nom :\nMa fonction :\nTéléphone :\n\nMerci,`
    )}`;

  /** Section 8 : uniquement les établissements géolocalisés de CE lieu. */
  const orgEstablishments = org
    ? establishments.filter((e) => e.organization_id === org.id)
    : [];

  /** Section 12 : rendez-vous à venir des AUTRES lieux du réseau. */
  const elsewhere = networkEvents
    .filter((e) => e.id !== event.id && e.organization_id !== event.organization_id)
    .slice(0, 3);

  /** Ajout au calendrier : fichier .ics fabriqué côté client, sans dépendance. */
  function downloadIcs() {
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Casaminga//FR",
      "BEGIN:VEVENT",
      `UID:${event.id}@casaminga.com`,
      `DTSTAMP:${icsStamp(new Date().toISOString())}`,
      `DTSTART:${icsStamp(event.start_at)}`,
      `DTEND:${icsStamp(event.end_at)}`,
      `SUMMARY:${icsEscape(event.title)}`,
      `LOCATION:${icsEscape([orgName, org?.address ?? ""].filter(Boolean).join(", "))}`,
      `URL:${window.location.href}`,
      event.description ? `DESCRIPTION:${icsEscape(event.description.slice(0, 500))}` : "",
      "END:VEVENT", "END:VCALENDAR",
    ].filter(Boolean);
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Accents retirés AVANT le remplacement, sinon « débutants » devient « d-butants ».
    const slug = event.title
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    a.download = `${slug || "evenement"}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Partage natif si le navigateur le propose, sinon copie du lien. */
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        // Partage refusé ou interrompu : on retombe sur la copie.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Presse-papiers indisponible : on ne prétend pas avoir copié.
    }
  }

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── 1 · Visuel ──────────────────────────────────────────── */}
        {/* L'affiche entière, jamais rognée : en `cover`, un visuel portrait
            perdait son titre et ses visages. Fond flouté tiré de l'image. */}
        <EventCover
          src={image}
          className="h-[clamp(220px,34vw,420px)] w-full"
          fallback={gradientFromColor(color)}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.12) 55%, rgba(0,0,0,0) 100%)" }}
          />
          <div className="wrap absolute inset-x-0 bottom-0 z-[2] pb-5">
            <Link to="/agenda" className="text-sm font-semibold text-white" style={{ opacity: 0.94 }}>
              ← Retour à l'agenda
            </Link>
          </div>
        </EventCover>

        {/*
          `min-w-0` sur les deux colonnes : un enfant de grille refuse par
          défaut de descendre sous la largeur de son contenu, si bien qu'un mot
          insécable élargit toute la page au lieu de se replier. Ici l'adresse
          d'inscription du lieu, longue de 38 caractères, portait la fiche à
          639 px sur un écran de 320.
        */}
        <div className="wrap grid gap-10 py-9 lg:grid-cols-[1.65fr_1fr]">
          {/* ── Colonne principale ───────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-9">
            <div>
              {/* 2 · Titre, et la catégorie qui le situe */}
              <span
                className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "var(--peach-pale)", color: "var(--coral-deep)" }}
              >
                {label}
              </span>
              {/* 20ch cassait les titres longs en quatre lignes : la mesure,
                  pas le corps, faisait paraître le titre énorme. */}
              <h1 className="mt-3" style={{ maxWidth: "26ch" }}>
                {event.title}
              </h1>

              {/* 3 · Lieu éditeur */}
              {org && (
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-[11px] text-sm font-extrabold text-white"
                    style={{ background: gradientFromColor(color) }}
                  >
                    {orgName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 text-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--gray)" }}>
                      Lieu organisateur
                    </div>
                    {vitrineUrl ? (
                      <a href={vitrineUrl} target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: "var(--black)" }}>
                        {orgName}
                      </a>
                    ) : (
                      <span className="font-bold" style={{ color: "var(--black)" }}>{orgName}</span>
                    )}
                  </div>
                </div>
              )}

              {/* 4 · Quand et où */}
              <div className="mt-5 flex flex-col gap-2 text-sm" style={{ color: "var(--black)" }}>
                <span className="flex items-center gap-2.5">
                  <CalendarDays size={17} aria-hidden="true" style={{ color: "var(--coral-deep)" }} />
                  <b className="font-semibold">{fmtFullDate(event.start_at)}</b>
                </span>
                <span className="flex items-center gap-2.5" style={{ color: "var(--gray)" }}>
                  <Clock size={17} aria-hidden="true" style={{ color: "var(--coral-deep)" }} />
                  {fmtTime(event.start_at)} – {fmtTime(event.end_at)}
                  {duration && <> · {duration}</>}
                </span>
                {org?.address && (
                  <span className="flex items-center gap-2.5" style={{ color: "var(--gray)" }}>
                    <MapPin size={17} aria-hidden="true" style={{ color: "var(--coral-deep)" }} />
                    {org.address}
                  </span>
                )}
              </div>
            </div>

            {/* 6 · Aperçu */}
            {descriptionBody && (
              <section>
                <SectionTitle>Aperçu</SectionTitle>
                <p className="lead mt-3" style={{ whiteSpace: "pre-line", maxWidth: "none" }}>
                  {descriptionBody}
                </p>
              </section>
            )}

            {/* 7 · Bon à savoir */}
            <section>
              <SectionTitle>Bon à savoir</SectionTitle>
              <div className="mt-3 flex flex-wrap gap-3">
                {duration && (
                  <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">{duration}</span>
                )}
                <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">En présentiel</span>
                {price && (
                  <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
                    {price === "Gratuit" ? "Entrée gratuite" : price}
                  </span>
                )}
                {event.capacity != null && event.capacity > 0 && (
                  <span className="card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
                    {event.capacity} places
                  </span>
                )}
              </div>
            </section>

            {/* 8 · Lieu, la carte n'apparaît que si le lieu est géolocalisé */}
            <section>
              <SectionTitle>Lieu</SectionTitle>
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
                {orgEstablishments.length > 0 && (
                  <div className="mt-4 overflow-hidden rounded-[14px]">
                    <EbMap establishments={orgEstablishments} orgMap={orgMap} />
                  </div>
                )}
              </div>
            </section>

            {/* 10 · Organisé par */}
            {org && (
              <section>
                <SectionTitle>Organisé par</SectionTitle>
                <div className="card mt-3 p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-[12px] text-sm font-extrabold text-white"
                      style={{ background: gradientFromColor(color) }}
                    >
                      {orgName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-bold" style={{ color: "var(--black)" }}>{orgName}</div>
                      <div className="text-xs" style={{ color: "var(--gray)" }}>{structure}</div>
                    </div>
                  </div>
                  {org.description && (
                    <p className="mt-3 text-sm" style={{ color: "var(--gray)" }}>{org.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {vitrineUrl && (
                      <a href={vitrineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        Voir la page du lieu
                      </a>
                    )}
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        Site web ↗
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/*
              10 bis · Provenance et revendication.
              N'apparaît que sur les fiches moissonnées. Deux choses distinctes :
              le visiteur apprend d'où vient l'information et peut aller la
              vérifier à la source ; le lieu, s'il tombe sur sa propre page,
              trouve le moyen de la récupérer. Volontairement sobre : c'est une
              note de bas de page, pas un appel à l'action de plus.
            */}
            {imported && (
              <section>
                <div
                  className="rounded-[var(--radius-sm)] p-5 text-sm"
                  style={{ background: "var(--gray-light)", color: "var(--gray)" }}
                >
                  <p>
                    Cette fiche a été reprise d'un agenda public ouvert. Elle n'est pas
                    encore tenue par {orgName}, et les modalités d'inscription se règlent
                    directement avec le lieu.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {sourceUrl && (
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold">
                        Voir l'annonce d'origine
                      </a>
                    )}
                    {org?.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="font-semibold">
                        Site du lieu
                      </a>
                    )}
                  </div>
                  <p className="mt-4 pt-4" style={{ borderTop: "1px solid var(--gray-mid)" }}>
                    <strong style={{ color: "var(--black)" }}>Vous organisez cet événement ?</strong>{" "}
                    Cette page est la vôtre, récupérez-la pour la corriger, la compléter et
                    recevoir les demandes des visiteurs.
                  </p>
                  <a href={claimHref} className="btn btn-secondary btn-sm mt-3">
                    Récupérer cette page
                  </a>
                </div>
              </section>
            )}
          </div>

          {/* ── 5 · Panneau « Participer », collant ────────────────── */}
          <aside className="min-w-0">
            <div className="card p-5" style={{ position: "sticky", top: "88px" }}>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--gray)" }}>
                Participer
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="text-[26px] font-extrabold"
                  style={{ color: price === "Gratuit" ? "#2f8a4c" : "var(--black)" }}
                >
                  {price ?? "Tarif à confirmer"}
                </span>
                {event.capacity != null && event.capacity > 0 && (
                  <span className="text-xs" style={{ color: "var(--gray)" }}>
                    · {event.capacity} places
                  </span>
                )}
              </div>

              {/*
                Deux panneaux, et la différence est volontaire.

                Fiche revendiquée : le lieu tient sa page et lit ses demandes,
                donc Casaminga peut promettre une place et porter le bouton
                principal.

                Fiche importée : Casaminga n'a rien à tenir. Le bouton principal
                revient à ce que la page fait vraiment, ajouter à l'agenda, et
                l'inscription est présentée comme une information, avec le canal
                que l'organisateur a lui-même déclaré. L'adresse est écrite en
                clair, pas seulement derrière un lien : un visiteur sans client
                mail configuré doit pouvoir la copier.
              */}
              {imported ? (
                <>
                  {plan.conditions && (
                    <p className="mt-3 text-sm" style={{ color: "var(--black-soft)", whiteSpace: "pre-line" }}>
                      {plan.conditions}
                    </p>
                  )}

                  {plan.needsAction && plan.channels.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--gray)" }}>
                        Inscription auprès du lieu
                      </div>
                      <div className="mt-2 flex flex-col gap-2">
                        {plan.channels.map((c) =>
                          c.kind === "link" ? (
                            <a
                              key={c.value}
                              href={c.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm w-full justify-center"
                            >
                              {c.label}
                            </a>
                          ) : (
                            <a
                              key={c.value}
                              href={
                                c.kind === "email"
                                  ? visitorMailto(c.value, event.title, fmtFullDate(event.start_at))
                                  : c.href
                              }
                              className="text-sm font-semibold"
                              style={{ wordBreak: "break-word" }}
                            >
                              {c.label}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {plan.needsAction && plan.channels.length === 0 && sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm mt-4 w-full justify-center"
                    >
                      Modalités sur l'annonce d'origine
                    </a>
                  )}

                  <div className="mt-5 flex flex-col gap-2">
                    <button type="button" onClick={downloadIcs} className="btn btn-primary w-full justify-center">
                      <CalendarDays size={15} aria-hidden="true" /> Ajouter à mon agenda
                    </button>
                    <button type="button" onClick={share} className="btn btn-ghost btn-sm w-full justify-center">
                      <Share2 size={15} aria-hidden="true" /> {copied ? "Lien copié" : "Partager"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {contactUrl ? (
                    <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 w-full justify-center">
                      <Ticket size={16} aria-hidden="true" /> Demander une place
                    </a>
                  ) : (
                    <Link to="/contact" className="btn btn-primary mt-4 w-full justify-center">
                      Nous écrire
                    </Link>
                  )}
                  <p className="mt-2 text-xs" style={{ color: "var(--gray)" }}>
                    La demande part directement au lieu organisateur, qui vous répond.
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    <button type="button" onClick={downloadIcs} className="btn btn-secondary btn-sm w-full justify-center">
                      <CalendarDays size={15} aria-hidden="true" /> Ajouter à mon agenda
                    </button>
                    <button type="button" onClick={share} className="btn btn-ghost btn-sm w-full justify-center">
                      <Share2 size={15} aria-hidden="true" /> {copied ? "Lien copié" : "Partager"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>

        {/* ── 11 · Autres rendez-vous du même lieu ─────────────────── */}
        {siblings.length > 0 && (
          <section style={{ background: "var(--cream-warm)", padding: "clamp(44px,6vw,68px) 0" }}>
            <div className="wrap">
              <SectionTitle>Autres rendez-vous de {orgName}</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {siblings.map((e) => <EventCard key={e.id} event={e} org={org ?? undefined} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── 12 · Dans le réseau Casaminga ────────────────────────── */}
        {elsewhere.length > 0 && (
          <section className="wrap" style={{ padding: "clamp(44px,6vw,68px) 28px" }}>
            <SectionTitle>Ailleurs dans le réseau</SectionTitle>
            <p className="mt-2 text-sm" style={{ color: "var(--gray)" }}>
              D'autres lieux ouvrent leurs portes ces prochaines semaines.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {elsewhere.map((e) => (
                <EventCard key={e.id} event={e} org={orgMap.get(e.organization_id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── 13 · Poursuivre ──────────────────────────────────────── */}
        <section style={{ background: "var(--peach-pale)", padding: "clamp(36px,5vw,56px) 0" }}>
          <div className="wrap text-center">
            <h2>
              Vous cherchez autre chose près de chez vous ?
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--gray)" }}>
              Parcourez l'agenda du réseau par date, catégorie et ville.
            </p>
            <Link to="/agenda" className="btn btn-primary mt-5">
              Voir tout l'agenda <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
