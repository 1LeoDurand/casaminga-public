import { useParams } from "react-router-dom";
import { useLieu } from "./useLieu";
import { LieuShell, LieuLoading, LieuNotFound, LazyImg } from "./LieuShell";

/** Page « Le lieu » / histoire (pages.apropos). */
export function LieuApropos() {
  const { lieuSlug } = useParams<{ lieuSlug: string }>();
  const { loading, data } = useLieu(lieuSlug);

  if (loading) return <LieuLoading />;
  if (!data || !data.content.pages.apropos) return <LieuNotFound />;

  const { org, content: c } = data;

  return (
    <LieuShell data={data}>
      <section className="wrap pb-12 pt-14" style={{ maxWidth: 760 }}>
        <h1>{c.about_title || "Le lieu"}</h1>
        {c.about_text ? (
          <div className="lead mt-6 space-y-4" style={{ maxWidth: "none" }}>
            {c.about_text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        ) : (
          <p className="lead mt-6">Présentation à venir.</p>
        )}
        {(org.address || org.hours) ? (
          <p className="mt-8 text-sm" style={{ color: "var(--gray)" }}>
            📍 {[org.address, org.hours].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </section>

      {c.gallery_urls.length > 0 ? (
        <section className="wrap pb-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {c.gallery_urls.map((url, i) => (
              <div key={i} className="aspect-video overflow-hidden rounded-[18px]">
                <LazyImg src={url} width={600} className="size-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </LieuShell>
  );
}
