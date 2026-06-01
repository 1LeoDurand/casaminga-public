import { useState } from "react";

interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  features: string[];
  highlight?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: "Gratuit",
    tagline: "Pour démarrer",
    monthly: 0,
    cta: "Commencer",
    features: [
      "Demandes & contacts",
      "Adhésions en ligne (HelloAsso)",
      "1 administrateur",
      "Site public du lieu",
    ],
  },
  {
    name: "Essentiel",
    tagline: "Pour gérer au quotidien",
    monthly: 19,
    cta: "Choisir Essentiel",
    highlight: true,
    features: [
      "Tout le plan Gratuit",
      "Finances & subventions",
      "Événements & réservations",
      "Équipe illimitée",
      "Résidences d'artistes",
    ],
  },
  {
    name: "Pro",
    tagline: "Pour les réseaux",
    monthly: 49,
    cta: "Choisir Pro",
    features: [
      "Tout le plan Essentiel",
      "Multi-lieux / fédération",
      "Reporting d'impact avancé",
      "Automatisations illimitées",
      "Support prioritaire",
    ],
  },
];

const ASSO_DISCOUNT = 0.3; // -30% pour les associations

function fmt(n: number) {
  return n === 0 ? "0 €" : `${n} €`;
}

export function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const [asso, setAsso] = useState(false);

  function priceFor(plan: Plan): { display: string; sub: string } {
    if (plan.monthly === 0) return { display: "0 €", sub: "pour toujours" };
    let m = plan.monthly;
    if (asso) m = m * (1 - ASSO_DISCOUNT);
    if (annual) m = m * 0.8; // -20% annuel
    return {
      display: fmt(Math.round(m)),
      sub: annual ? "/mois · facturé annuellement" : "/mois",
    };
  }

  return (
    <section id="tarifs" className="relative py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        <div className="text-center mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-white/30">
            Tarifs
          </p>
          <h2 className="font-heading text-4xl font-extrabold text-white md:text-5xl">
            Un prix juste, pensé pour l'ESS
          </h2>
          <p className="mt-3 text-base text-white/40 max-w-xl mx-auto">
            Sans engagement. Essai gratuit 30 jours sur tous les plans payants.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual ? "bg-coral text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual ? "bg-coral text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Annuel <span className="text-[11px] opacity-80">−20%</span>
            </button>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <span className="text-sm text-white/50">Je suis une association loi 1901</span>
            <button
              onClick={() => setAsso((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${asso ? "bg-emerald-500" : "bg-white/15"}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${asso ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-xs text-emerald-400 font-medium">{asso ? "−30% appliqué" : ""}</span>
          </label>
        </div>

        {/* Plans */}
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const { display, sub } = priceFor(plan);
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                  plan.highlight
                    ? "border-coral/40 bg-coral/[0.06] scale-[1.02]"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-[11px] font-bold text-white">
                    Le plus choisi
                  </span>
                )}
                <h3 className="font-heading text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-white/40 mb-4">{plan.tagline}</p>
                <div className="mb-6">
                  <span className="font-heading text-4xl font-extrabold text-white">{display}</span>
                  <span className="block text-xs text-white/40 mt-1">{sub}</span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-coral mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://admin.casaminga.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-coral text-white hover:opacity-90"
                      : "border border-white/15 text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-white/30 mt-8">
          Besoin d'un plan multi-sites ou collectivité ?{" "}
          <a href="mailto:contact@casaminga.com" className="text-coral hover:underline">Contactez-nous</a>
        </p>
      </div>
    </section>
  );
}
