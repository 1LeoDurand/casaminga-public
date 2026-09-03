import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { RouteTracker } from './lib/analytics.tsx'
// NOTE : App.tsx (ancienne landing « découverte ») reste dans le repo mais n'est
// plus rendue — elle contenait des contrôles non câblés (recherche désactivée,
// onglet « Pour toi », destinations inertes) incompatibles avec la revue Ad Grant.
// NOTE : Accueil.tsx (accueil institutionnel « Penser collectivement le
// patrimoine de demain ») reste dans le repo mais n'est plus routé — la racine
// sert désormais le portail de découverte. Bascule réversible : réimporter
// Accueil et remettre <Route path="/" element={<Accueil />} /> suffit.
// NOTE : DesignAccueil.tsx (maquette découverte « Eventbrite ») reste également
// dans le repo mais n'est plus routé : son contenu est repris par AccueilPortail.
import { AccueilPortail } from './pages/AccueilPortail.tsx'
import { Association } from './pages/Association.tsx'
import { NosActions } from './pages/NosActions.tsx'
import { Agenda } from './pages/Agenda.tsx'
import { Lieux } from './pages/Lieux.tsx'
import { Contact } from './pages/Contact.tsx'
import { EventDetail } from './pages/EventDetail.tsx'
import { LieuHome } from './pages/lieu/LieuHome.tsx'
import { LieuApropos } from './pages/lieu/LieuApropos.tsx'
import { LieuAgenda } from './pages/lieu/LieuAgenda.tsx'
import { LieuEspaces } from './pages/lieu/LieuEspaces.tsx'
import { LieuSoutenir } from './pages/lieu/LieuSoutenir.tsx'
import { NotFound } from './pages/NotFound.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Mesure GA4 : émet un page_view à chaque changement de route (SPA). */}
      <RouteTracker />
      <Routes>
        {/* Accueil PORTAIL : découverte des événements et des lieux du réseau,
            avec mention visible de l'association éditrice (conformité Ad Grant). */}
        <Route path="/" element={<AccueilPortail />} />
        {/* Pages institutionnelles (5 pages Ad Grant). Déclarées AVANT :lieuSlug. */}
        <Route path="/association" element={<Association />} />
        <Route path="/nos-actions" element={<NosActions />} />
        <Route path="/agenda" element={<Agenda />} />
        {/* Annuaire des lieux du réseau (route fixe, avant :lieuSlug). */}
        <Route path="/lieux" element={<Lieux />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/evenement/:id" element={<EventDetail />} />
        {/* Vitrine d'un lieu : casaminga.com/<slug> (belle URL). Les segments
            statiques ci-dessus l'emportent sur :lieuSlug (ranking react-router). */}
        <Route path="/:lieuSlug" element={<LieuHome />} />
        <Route path="/:lieuSlug/histoire" element={<LieuApropos />} />
        <Route path="/:lieuSlug/agenda" element={<LieuAgenda />} />
        <Route path="/:lieuSlug/espaces" element={<LieuEspaces />} />
        <Route path="/:lieuSlug/soutenir" element={<LieuSoutenir />} />
        {/* Toute route inconnue → page 404 sobre (liens routeur réels). */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
