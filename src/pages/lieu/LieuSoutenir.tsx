import { useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../lib/supabase";
import { useLieu } from "./useLieu";
import { LieuShell, LieuLoading, LieuNotFound } from "./LieuShell";

function fmtEur(n: number): string {
  return Number.isInteger(n) ? `${n} €` : `${n.toFixed(2)} €`;
}

/** Page Soutenir : adhésion + don (pages.soutenir). Transactionnel → admin. */
export function LieuSoutenir() {
  const { lieuSlug } = useParams<{ lieuSlug: string }>();
  const { loading, data } = useLieu(lieuSlug);

  if (loading) return <LieuLoading />;
  if (!data || !data.content.pages.soutenir) return <LieuNotFound />;

  const { org, content: c, campaigns } = data;
  const accent = c.accent_color;
  const slug = org.slug;

  return (
    <LieuShell data={data}>
      <section className="wrap pb-4 pt-14 text-center" style={{ maxWidth: 760 }}>
        <h1>Soutenir le lieu</h1>
        <p className="lead mx-auto mt-4">
          {c.soutenir_text ||
            `${org.name} vit grâce à celles et ceux qui le soutiennent. Adhérer ou donner, c'est faire exister un lieu ouvert à toutes et tous.`}
        </p>
      </section>

      {/* Adhésion */}
      {campaigns.length > 0 ? (
        <section className="wrap py-10">
          <h2>Adhérer</h2>
          <p className="lead mt-2">L'adhésion se fait en ligne, en quelques minutes.</p>
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

      {/* Don */}
      <section className="wrap py-10">
        <div className="card p-8">
          <h2>Faire un don</h2>
          <p className="lead mt-3" style={{ maxWidth: "none" }}>
            Votre don finance directement les activités du lieu. Si l'association est d'intérêt
            général, il ouvre droit à une <strong>réduction d'impôt de 66&nbsp;%</strong> (article 200
            du CGI) — un don de 50&nbsp;€ ne vous coûte que 17&nbsp;€, et un reçu fiscal vous est délivré.
          </p>
          <a
            href={`${ADMIN_BASE}/site/${slug}/soutenir`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-5"
            style={{ background: accent, borderColor: accent }}
          >
            Faire un don
          </a>
        </div>
      </section>
    </LieuShell>
  );
}
