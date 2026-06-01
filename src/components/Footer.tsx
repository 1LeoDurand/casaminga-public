export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-coral font-heading text-xs font-extrabold text-white">
              CM
            </span>
            <div>
              <div className="font-heading text-sm font-bold text-white">Casa Minga</div>
              <div className="text-[11px] text-white/30">Des lieux où l'on fait ensemble</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-white/30">
            <a href="#lieux" className="hover:text-white transition-colors">Les lieux</a>
            <a href="#evenements" className="hover:text-white transition-colors">Événements</a>
            <a href="#adhesions" className="hover:text-white transition-colors">Adhésions</a>
            <a href="https://admin.casaminga.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Espace admin</a>
          </div>

          <div className="text-xs text-white/20">
            © {new Date().getFullYear()} Casa Minga
          </div>
        </div>
      </div>
    </footer>
  );
}
