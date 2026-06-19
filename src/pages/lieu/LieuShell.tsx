import { useState, type ReactNode, type ImgHTMLAttributes } from "react";
import { Link, NavLink } from "react-router-dom";
import type { LieuData } from "../../lib/supabase";
import { lieuImage } from "../../lib/img";

const CREAM_BG = { background: "var(--cream)" } as const;

/** État de chargement plein écran, langage visuel "CM". */
export function LieuLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={CREAM_BG}>
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl text-lg font-extrabold text-white" style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-dark))" }}>CM</span>
        <div className="h-1 w-32 overflow-hidden rounded-full" style={{ background: "var(--peach-pale)" }}>
          <div className="h-full w-1/2 animate-pulse rounded-full" style={{ background: "var(--coral)" }} />
        </div>
      </div>
    </div>
  );
}

/** Lieu introuvable / non publié. */
export function LieuNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" style={CREAM_BG}>
      <div className="flex flex-col items-center gap-4">
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)" }}>Lieu introuvable</h1>
        <p className="lead">Ce lieu n'existe pas, ou son site n'est pas encore publié.</p>
        <Link to="/" className="btn btn-primary mt-2">← Découvrir les lieux Casa Minga</Link>
      </div>
    </div>
  );
}

/**
 * Image avec chargement paresseux (niveau 2 de la stratégie images).
 * Conteneur à ratio fixe attendu par le parent (overflow-hidden).
 */
export function LazyImg({
  src, width = 1200, alt = "", ...rest
}: { src: string | null | undefined; width?: number } & ImgHTMLAttributes<HTMLImageElement>) {
  const resolved = lieuImage(src, width);
  if (!resolved) return null;
  return <img src={resolved} alt={alt} loading="lazy" decoding="async" {...rest} />;
}

interface NavItem { to: string; label: string; end?: boolean }

/**
 * Chrome partagé de la vitrine d'un lieu : header (nom + navigation des
 * pages activées), contenu, footer "propulsé par Casa Minga".
 */
export function LieuShell({
  data, children,
}: { data: LieuData; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { org, content: c } = data;
  const accent = c.accent_color;
  const base = `/${org.slug}`;

  const items: NavItem[] = [
    { to: base, label: "Accueil", end: true },
    ...(c.pages.apropos ? [{ to: `${base}/histoire`, label: "Le lieu" }] : []),
    ...(c.pages.agenda ? [{ to: `${base}/agenda`, label: "Agenda" }] : []),
    ...(c.pages.espaces ? [{ to: `${base}/espaces`, label: "Espaces" }] : []),
    ...(c.pages.soutenir ? [{ to: `${base}/soutenir`, label: "Soutenir" }] : []),
  ];

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    ({ color: isActive ? accent : "var(--black)", fontWeight: isActive ? 700 : 500 }) as const;

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,251,240,0.92)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderColor: "rgba(255,180,162,0.28)" }}
      >
        <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-7 py-3.5">
          <Link to={base} className="flex min-w-0 items-center gap-2.5" style={{ color: "var(--black)" }}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] text-sm font-extrabold text-white" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 70%, #2C2C2C))` }}>
              {org.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="truncate font-extrabold text-[16px] tracking-tight">{org.name}</span>
          </Link>

          {items.length > 1 && (
            <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Navigation du lieu">
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} style={linkStyle} className="text-[13.5px]">
                  {it.label}
                </NavLink>
              ))}
            </nav>
          )}

          <Link
            to="/"
            className={`btn btn-secondary btn-sm ${items.length > 1 ? "hidden md:inline-flex" : "ml-auto"}`}
            title="Réseau Casa Minga"
          >
            ← Casa Minga
          </Link>

          {items.length > 1 && (
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="ml-auto flex size-11 items-center justify-center rounded-[11px] border bg-white text-lg md:hidden"
              style={{ borderColor: "var(--gray-mid)", color: "var(--black)" }}
            >
              {open ? "✕" : "☰"}
            </button>
          )}
        </div>

        {open && items.length > 1 && (
          <div className="border-t px-7 py-3 md:hidden" style={{ borderColor: "var(--gray-mid)", background: "var(--cream)" }}>
            {items.map((it) => (
              <NavLink
                key={it.to} to={it.to} end={it.end} onClick={() => setOpen(false)} style={linkStyle}
                className="flex min-h-[48px] items-center border-b text-[15px]"
              >
                {it.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t" style={{ borderColor: "var(--gray-mid)", background: "var(--cream-warm)" }}>
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-2 px-7 py-10 text-center">
          <div className="font-bold" style={{ color: "var(--black)" }}>{org.name}</div>
          {org.address ? <div className="text-sm" style={{ color: "var(--gray)" }}>{org.address}</div> : null}
          <a href="https://casaminga.com" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--coral-deep)" }}>
            <span className="flex size-5 items-center justify-center rounded-[6px] text-[9px] font-extrabold text-white" style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-dark))" }}>CM</span>
            Propulsé par Casa Minga
          </a>
        </div>
      </footer>
    </>
  );
}
