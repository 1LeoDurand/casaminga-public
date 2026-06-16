import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { EventDetail } from './pages/EventDetail.tsx'
import { DesignAccueil } from './pages/DesignAccueil.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/evenement/:id" element={<EventDetail />} />
        <Route path="/design-accueil" element={<DesignAccueil />} />
        {/* Toute route inconnue retombe sur l'accueil (SPA). */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
