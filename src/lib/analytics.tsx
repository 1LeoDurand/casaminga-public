import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Identifiant de la propriété GA4 (la balise est chargée depuis index.html). */
export const GA_MEASUREMENT_ID = 'G-YVESYBCXC6'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Suivi des pages vues côté SPA.
 *
 * Le snippet gtag.js n'envoie un `page_view` qu'au chargement du document : sur
 * une navigation react-router, l'URL change sans rechargement et Analytics ne
 * verrait qu'une seule vue par visite. On désactive donc `send_page_view` dans
 * la config (index.html) et on émet l'événement ici, à chaque changement d'URL.
 *
 * À rendre À L'INTÉRIEUR de <BrowserRouter> (useLocation exige le contexte routeur).
 */
export function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    // gtag.js peut être absent (bloqueur de pub, hors ligne) : ne rien casser.
    if (typeof window.gtag !== 'function') return
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [location.pathname, location.search])

  return null
}
