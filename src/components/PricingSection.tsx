import { useState } from "react";

interface Plan {
  name: string; tagline: string; monthly: number;
  features: string[]; highlight?: boolean; cta: string; color: string;
}

const PLANS: Plan[] = [
  { name: "Gratuit", tagline: "Pour démarrer", monthly: 0, cta: "Commencer", color: "var(--mint)",
    features: ["Demandes & contacts", "Adhésions en ligne (HelloAsso)", "1 administrateur", "Site public du lieu"] },
  { name: "Essentiel", tagline: "Pour gérer au quotidien", monthly: 19, cta: "Choisir Essentiel", highlight: true, color: "var(--coral)",
    features: ["Tout le plan Gratuit", "Finances & subventions", "Événements & réservations", "Équipe illimitée", "Résidences d'artistes"] },
  { name: "Pro", tagline: "Pour les réseaux", monthly: 49, cta: "Choisir Pro", color: "#6E7A93",
    features: ["Tout le plan Essentiel", "Multi-lieux / fédération", "Reporting d'impact avancé", "Automatisations illimitées", "Support prioritaire"] },
];

const ASSO_DISCOUNT = 0.3;

export function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const [asso, setAsso] = useState(false);

  function priceFor(plan: Plan): { display: string; sub: string } {
    if (plan.monthly === 0) return { display: "0 €", sub: "pour toujours" };
    let m = plan.monthly;
    if (asso) m = m * (1 - ASSO_DISCOUNT);
    if (annual) m = m * 0.8;
    return { display: `${Math.round(m)} €`, sub: annual ? "/mois · facturé annuellement" : "/mois" };
  }

  return (
    <section id="tarifs" style={{ background: "var(--white)", padding: "clamp(64px,9vw,108px) 0" }}>
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow gold">Tarifs</div>
          <h2>Un prix juste, pensé pour l'ESS</h2>
          <p className="lead">Sans engagement. Essai gratuit 30 jours sur tous les plans payants.</p>
        </div>

        {/* Toggles */}
        <div className="mb-12 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-1 rounded-full border p-1" style={{ borderColor: "var(--gray-mid)", background: "var(--cream-warm)" }}>
            <button onClick={() => setAnnual(false)} className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all" style={!annual ? { background: "var(--coral)", color: "#fff" } : { color: "var(--gray)" }}>Mensuel</button>
            <button onClick={() => setAnnual(true)} className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all" style={annual ? { background: "var(--coral)", color: "#fff" } : { color: "var(--gray)" }}>Annuel <span className="text-[11px] opacity-80">−20%</span></button>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <span className="text-sm" style={{ color: "var(--gray)" }}>Je suis une association loi 1901</span>
            <button onClick={() => setAsso((v) => !v)} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: asso ? "var(--mint)" : "var(--gray-mid)" }}>
              <span className="absolute top-0.5 size-5 rounded-full bg-white transition-transform" style={{ transform: asso ? "translateX(20px)" : "translateX(2px)" }} />
            </button>
            {asso && <span className="text-xs font-bold" style={{ color: "#2f8a4c" }}>−30% appliqué</span>}
          </label>
        </div>

        {/* Plans */}
        <div className="grid gap-[18px] md:grid-cols-3">
          {PLANS.map((plan) => {
            const { display, sub } = priceFor(plan);
            return (
              <div key={plan.name} className="card relative flex flex-col p-7"
                style={{ borderTop: `5px solid ${plan.color}`, ...(plan.highlight ? { boxShadow: "var(--shadow-lg)", transform: "scale(1.02)" } : {}) }}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: "var(--coral)" }}>Le plus choisi</span>
                )}
                <h3 className="text-[20px] font-bold" style={{ color: "var(--black)" }}>{plan.name}</h3>
                <p className="mb-4 text-sm" style={{ color: "var(--gray)" }}>{plan.tagline}</p>
                <div className="mb-6">
                  <span className="text-[40px] font-extrabold" style={{ color: "var(--black)" }}>{display}</span>
                  <span className="mt-1 block text-xs" style={{ color: "var(--gray)" }}>{sub}</span>
                </div>
                <ul className="mb-8 flex flex-1 list-none flex-col gap-2.5 p-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--black)" }}>
                      <span style={{ color: "var(--coral-deep)" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="https://admin.casaminga.com" target="_blank" rel="noopener noreferrer"
                  className={plan.highlight ? "btn btn-primary" : "btn btn-secondary"}>{plan.cta}</a>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: "var(--gray)" }}>
          Besoin d'un plan multi-sites ou collectivité ? <a href="mailto:contact@casaminga.com">Contactez-nous</a>
        </p>
      </div>
    </section>
  );
}
