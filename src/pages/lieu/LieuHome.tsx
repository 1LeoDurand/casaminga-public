import { useParams, Link } from "react-router-dom";
import { ADMIN_BASE } from "../../lib/supabase";
import { useLieu } from "./useLieu";
import { LieuShell, LieuLoading, LieuNotFound, LazyImg } from "./LieuShell";
import { EventCard } from "./lieuUi";

function fmtEur(n: number): string {
  return Number.isInteger(n) ? `${n} €` : `${n.toFixed(2)} €`;
}

export function LieuHome() {
  const { lieuSlug } = useParams<{ lieuSlug: string }>();
  const { loading, data } = useLieu(lieuSlug);

  if (loading) return <LieuLoading />;
  if (!data) return <LieuNotFound />;

  const { org, content: c, events, campaigns } = data;
  const accent = c.accent_color;
  const slug = org.slug;

  const tagline = c.hero_tagline || org.description || "";
  const meta = [org.address, org.hours].filter(Boolean).join(" · ");

  const showLieu = c.sections.lieu && !c.pages.apropos && (!!c.about_text || c.gallery_urls.length > 0);
  const showAgenda = c.sections.agenda;
  const showAdherer = c.sections.adherer && campaigns.length > 0;
  const showContact = c.sections.contact;
  const previewEvents = events.slice(0, 6);

  return (
    <LieuShell data={data}>
      {/* Hero */}
      <section className="wrap pb-8 pt-14">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            {org.structure ? (
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ background: `${accent}1a`, color: accent }}>
                {org.structure}
              </span>
            ) : null}
            <h1 className="mt-4">{org.name}</h1>
            {tagline ? <p className="lead mt-4">{tagline}</p> : null}
            {meta ? <p className="mt-4 text-sm" style={{ color: "var(--gray)" }}>📍 {meta}</p> : null}
            {(showAdherer || c.pages.soutenir) ? (
              <Link
                to={c.pages.soutenir ? `/${slug}/soutenir` : "#adherer"}
                className="btn btn-primary mt-7"
                style={{ background: accent, borderColor: accent }}
              >
                Soutenir le lieu
              </Link>
            ) : null}
          </div>
          {c.hero_image_url ? (
            <div className="aspect-video overflow-hidden rounded-[18px] md:aspect-[4/3]">
              <LazyImg src={c.hero_image_url} width={1200} alt={org.name} className="size-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video rounded-[18px] md:aspect-[4/3]" style={{ background: `${accent}26` }} />
          )}
        </div>
      </section>

      {/* Le lieu */}
      {showLieu ? (
        <section className="wrap py-10">
          <h2>{c.about_title}</h2>
          {c.about_text ? (
            <div className="lead mt-4 max-w-3xl space-y-3" style={{ maxWidth: "none" }}>
              {c.about_text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ) : null}
          {c.gallery_urls.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {c.gallery_urls.map((url, i) => (
                <div key={i} className="aspect-video overflow-hidden rounded-[18px]">
                  <LazyImg src={url} width={600} className="size-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Agenda — aperçu */}
      {showAgenda ? (
        <section className="wrap py-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2>Agenda</h2>
            {c.pages.agenda && previewEvents.length > 0 ? (
              <Link to={`/${slug}/agenda`} className="text-sm font-semibold" style={{ color: accent }}>
                Tout l'agenda →
              </Link>
            ) : null}
          </div>
          {previewEvents.length === 0 ? (
            <div className="card mt-6 px-6 py-10 text-center text-sm" style={{ color: "var(--gray)" }}>
              Pas d'événement prévu pour l'instant — revenez bientôt&nbsp;!
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewEvents.map((e) => <EventCard key={e.id} slug={slug} event={e} accent={accent} />)}
            </div>
          )}
        </section>
      ) : null}

      {/* Adhérer */}
      {showAdherer ? (
        <section id="adherer" className="wrap py-10">
          <h2>Adhérer</h2>
          <p className="lead mt-2">
            Rejoignez le lieu et soutenez le projet. L'adhésion se fait en ligne, en quelques minutes.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((cp) => {
              const amounts = cp.tiers.map((tr) => Number(tr.amount));
              const minAmt = amounts.length ? Math.min(...amounts) : null;
              const maxAmt = amounts.length ? Math.max(...amounts) : null;
              const range =
                amounts.length === 0 ? null
                : minAmt === maxAmt ? fmtEur(minAmt!)
                : `de ${fmtEur(minAmt!)} à ${fmtEur(maxAmt!)}`;
              return (
                <div key={cp.id} className="card flex flex-col p-6">
                  <h3 className="text-lg font-bold">{cp.title}</h3>
                  {cp.description ? <p className="mt-2 flex-1 text-sm" style={{ color: "var(--gray)" }}>{cp.description}</p> : <div className="flex-1" />}
                  {range ? (
                    <p className="mt-3 text-[13px] font-semibold" style={{ color: accent }}>
                      {cp.tiers.length} formule{cp.tiers.length > 1 ? "s" : ""} · {range}
                    </p>
                  ) : null}
                  <a
                    href={`${ADMIN_BASE}/site/${slug}/adhesion/${cp.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn mt-4 text-white"
                    style={{ background: accent, borderColor: accent }}
                  >
                    Adhérer
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Contact */}
      {showContact ? (
        <section id="contact" className="wrap py-10">
          <div className="card p-8">
            <h2>Nous écrire</h2>
            <p className="lead mt-2">
              Résidence, réservation, partenariat, bénévolat… Votre message arrive directement à l'équipe.
            </p>
            <a
              href={`${ADMIN_BASE}/site/${slug}#contact`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-5"
              style={{ background: accent, borderColor: accent }}
            >
              Ouvrir le formulaire de contact
            </a>
          </div>
        </section>
      ) : null}

      <div className="pb-8" />
    </LieuShell>
  );
}
