import { useEffect, useRef, useState } from "react";

export function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden py-32 border-t border-white/[0.06]">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-coral/[0.03] to-transparent" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 size-[600px] rounded-full bg-coral/5 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-16">
        <div className="max-w-4xl">
          <p
            className={`mb-6 text-sm font-medium uppercase tracking-[0.2em] text-white/30 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Notre raison d'être
          </p>
          <h2
            className={`font-heading text-5xl font-extrabold leading-[1.05] text-white transition-all duration-700 delay-100 md:text-7xl text-balance ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Des lieux où l'on{" "}
            <span className="text-coral">fait ensemble.</span>
          </h2>
          <p
            className={`mt-8 text-lg text-white/50 max-w-2xl leading-relaxed transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Casa Minga connecte les tiers-lieux culturels, associatifs et hybrides de France.
            Des espaces qui croient que créer, partager et décider ensemble,
            c'est possible — et nécessaire.
          </p>
          <div
            className={`mt-10 flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <a
              href="#lieux"
              className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Explorer les lieux →
            </a>
            <a
              href="https://admin.casaminga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              Gérer mon lieu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
