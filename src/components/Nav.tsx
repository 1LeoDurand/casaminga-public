import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-night/95 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="flex size-8 items-center justify-center rounded-lg bg-coral font-heading text-xs font-extrabold text-white">
            CM
          </span>
          <span className="font-heading text-[15px] font-bold text-white">
            Casa Minga
          </span>
        </a>

        {/* Liens */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Les lieux", href: "#lieux" },
            { label: "Événements", href: "#evenements" },
            { label: "Rejoindre", href: "#adhesions" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://admin.casaminga.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 transition-all hover:border-white/40 hover:text-white md:flex"
        >
          Espace admin
          <span className="text-white/40">→</span>
        </a>
      </div>
    </nav>
  );
}
