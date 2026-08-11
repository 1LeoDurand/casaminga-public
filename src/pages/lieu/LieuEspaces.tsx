import { useParams } from "react-router-dom";
import { ADMIN_BASE, type LieuSpace } from "../../lib/supabase";
import { useLieu } from "./useLieu";
import { LieuShell, LieuLoading, LieuNotFound, LazyImg } from "./LieuShell";

function tarif(s: LieuSpace): string | null {
  const parts: string[] = [];
  if (s.price_hour) parts.push(`${s.price_hour} €/h`);
  if (s.price_day) parts.push(`${s.price_day} €/jour`);
  if (s.price_person) parts.push(`${s.price_person} €/pers.`);
  return parts.length ? parts.join(" · ") : null;
}

/** Espaces réservables (pages.espaces). Réservation → contact admin. */
export function LieuEspaces() {
  const { lieuSlug } = useParams<{ lieuSlug: string }>();
  const { loading, data } = useLieu(lieuSlug);

  if (loading) return <LieuLoading />;
  if (!data || !data.content.pages.espaces) return <LieuNotFound />;

  const { org, content: c, spaces } = data;
  const accent = c.accent_color;
  const slug = org.slug;

  return (
    <LieuShell data={data}>
      <section className="wrap pb-14 pt-14">
        <h1>Nos espaces</h1>
        <p className="lead mt-3">
          Salles, ateliers et espaces de travail à réserver pour vos activités, réunions et événements.
        </p>

        {spaces.length === 0 ? (
          <div className="card mt-8 px-6 py-12 text-center text-sm" style={{ color: "var(--gray)" }}>
            Aucun espace n'est publié à la réservation en ligne. Écrivez au lieu pour connaître les
            disponibilités et les conditions d'accueil.
            <a
              href={`${ADMIN_BASE}/site/${slug}#contact`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm mt-4 block w-fit mx-auto"
            >
              Contacter le lieu
            </a>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {spaces.map((s) => {
              const t = tarif(s);
              return (
                <div key={s.id} className="card flex flex-col overflow-hidden">
                  {s.photos?.[0] ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <LazyImg src={s.photos[0]} width={700} alt={s.name} className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9]" style={{ background: `${accent}1f` }} />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold">{s.name}</h2>
                    <p className="mt-1 text-[13px]" style={{ color: "var(--gray)" }}>
                      {[s.capacity ? `${s.capacity} pers.` : null, s.area ? `${s.area} m²` : null].filter(Boolean).join(" · ")}
                    </p>
                    {s.description ? <p className="mt-2.5 flex-1 text-sm" style={{ color: "var(--gray)" }}>{s.description}</p> : <div className="flex-1" />}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      {t ? (
                        <span className="text-sm font-bold" style={{ color: accent }}>{t}</span>
                      ) : <span className="text-sm" style={{ color: "var(--gray)" }}>Tarif sur demande</span>}
                      <a
                        href={`${ADMIN_BASE}/site/${slug}#contact`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm text-white"
                        style={{ background: accent, borderColor: accent }}
                      >
                        Demander une réservation
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </LieuShell>
  );
}
