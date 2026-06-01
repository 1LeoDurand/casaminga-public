import { useRef, useEffect, useState } from "react";
import type { PublicOrg } from "../lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  association: "Association",
  collectif: "Collectif",
  scic: "SCIC",
  scop: "SCOP",
  sarl: "SARL / SAS",
  collectivite: "Collectivité",
  autre: "Structure",
};

function OrgCard({ org, index }: { org: PublicOrg; index: number }) {
  const color = org.primary_color || "#e8614a";

  return (
    <div
      className="relative flex h-full w-[340px] shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-8 snap-center transition-transform duration-300 hover:scale-[1.02] md:w-[420px]"
      style={{ backgroundColor: color }}
      onClick={() => window.open(`https://admin.casaminga.com/site/${org.slug}`, "_blank")}
    >
      {/* Numéro */}
      <span className="font-heading text-[80px] font-extrabold leading-none text-white/10 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Contenu */}
      <div>
        <div className="mb-2">
          <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] font-medium text-white/80">
            {TYPE_LABELS[org.structure ?? ""] ?? "Tiers-lieu"}
          </span>
        </div>
        <h3 className="font-heading text-2xl font-bold text-white md:text-3xl">
          {org.name}
        </h3>
        {org.address && (
          <p className="mt-1 text-sm text-white/60">{org.address}</p>
        )}
        {org.description && (
          <p className="mt-3 text-sm leading-relaxed text-white/75 line-clamp-3">
            {org.description}
          </p>
        )}
        <div className="mt-6 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-black/35">
            Découvrir
            <span className="text-white/60">→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroScroll({ orgs }: { orgs: PublicOrg[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStart.current = { x: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = dragStart.current.scrollLeft - (x - dragStart.current.x);
  };
  const stopDrag = () => setIsDragging(false);

  // Track active card
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardW = el.scrollWidth / orgs.length;
      setActiveIndex(Math.round(el.scrollLeft / cardW));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [orgs.length]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = trackRef.current;
      if (!el) return;
      if (e.key === "ArrowRight") el.scrollBy({ left: 440, behavior: "smooth" });
      if (e.key === "ArrowLeft") el.scrollBy({ left: -440, behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="lieux" className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
      {/* Fond dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-night via-[#0d0b1a] to-night" />
      <div className="absolute top-1/4 left-1/3 size-96 rounded-full bg-coral/5 blur-[120px]" />

      <div className="relative z-10">
        {/* Titre */}
        <div className="px-6 md:px-16 mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/30">
            Les lieux du réseau
          </p>
          <h1 className="font-heading text-5xl font-extrabold leading-[1.05] text-white md:text-7xl">
            Des espaces
            <br />
            <span className="text-coral">vivants.</span>
          </h1>
          <p className="mt-4 text-base text-white/50 md:text-lg">
            Faites défiler pour explorer les lieux · ← →
          </p>
        </div>

        {/* Carrousel */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          className={`flex gap-5 overflow-x-auto px-6 md:px-16 pb-8 snap-x snap-mandatory no-scrollbar ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollSnapType: "x mandatory" }}
        >
          {orgs.map((org, i) => (
            <OrgCard key={org.id} org={org} index={i} />
          ))}
          {/* Padding fin */}
          <div className="w-6 shrink-0" />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {orgs.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = trackRef.current;
                if (!el) return;
                const cardW = el.scrollWidth / orgs.length;
                el.scrollTo({ left: cardW * i, behavior: "smooth" });
              }}
              className={`rounded-full transition-all ${
                i === activeIndex
                  ? "w-6 h-1.5 bg-coral"
                  : "size-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
