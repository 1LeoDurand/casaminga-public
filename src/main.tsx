import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
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
        <Route path="/" element={<App />} />
        <Route path="/evenement/:id" element={<EventDetail />} />
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
