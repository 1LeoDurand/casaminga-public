import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Accueil } from './pages/Accueil.tsx'
import { Association } from './pages/Association.tsx'
import { NosActions } from './pages/NosActions.tsx'
import { Agenda } from './pages/Agenda.tsx'
import { Contact } from './pages/Contact.tsx'
import { EventDetail } from './pages/EventDetail.tsx'
import { DesignAccueil } from './pages/DesignAccueil.tsx'
import { LieuHome } from './pages/lieu/LieuHome.tsx'
import { LieuApropos } from './pages/lieu/LieuApropos.tsx'
import { LieuAgenda } from './pages/lieu/LieuAgenda.tsx'
import { LieuEspaces } from './pages/lieu/LieuEspaces.tsx'
import { LieuSoutenir } from './pages/lieu/LieuSoutenir.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Accueil institutionnel La Manufacture des Pays (objectif Ad Grant). */}
        <Route path="/" element={<Accueil />} />
        {/* Pages institutionnelles (5 pages Ad Grant). Déclarées AVANT :lieuSlug. */}
        <Route path="/association" element={<Association />} />
        <Route path="/nos-actions" element={<NosActions />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/evenement/:id" element={<EventDetail />} />
        {/* Accueil découverte « Eventbrite » conservé mais mis de côté. */}
        <Route path="/design-accueil" element={<DesignAccueil />} />
        {/* Vitrine d'un lieu : casaminga.com/<slug> (belle URL). Les segments
            statiques ci-dessus l'emportent sur :lieuSlug (ranking react-router). */}
        <Route path="/:lieuSlug" element={<LieuHome />} />
        <Route path="/:lieuSlug/histoire" element={<LieuApropos />} />
        <Route path="/:lieuSlug/agenda" element={<LieuAgenda />} />
        <Route path="/:lieuSlug/espaces" element={<LieuEspaces />} />
        <Route path="/:lieuSlug/soutenir" element={<LieuSoutenir />} />
        {/* Toute route inconnue retombe sur l'accueil (SPA). */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
