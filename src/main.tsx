import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@tabler/core/dist/js/tabler.min.js'
import App from './App.tsx'
import { I18nProvider, DICTS } from './i18n'
import { verifyTranslations } from './utils/verifyTranslations'

// Ensure Tabler theme attributes are present early
const rootEl = document.documentElement
if (!rootEl.getAttribute('data-bs-theme-base')) {
  rootEl.setAttribute('data-bs-theme-base', 'zinc')
}
if (!rootEl.getAttribute('data-bs-theme-primary')) {
  rootEl.setAttribute('data-bs-theme-primary', 'cyan')
}
if (!rootEl.getAttribute('data-bs-theme-radius')) {
  rootEl.setAttribute('data-bs-theme-radius', '1.5')
}
// Default theme if not set yet
if (!rootEl.getAttribute('data-bs-theme')) {
  const pref = window.localStorage.getItem('tablerTheme') || 'light'
  rootEl.setAttribute('data-bs-theme', pref)
}

// Verify translations in development
if (import.meta.env.DEV) {
  verifyTranslations(DICTS as Record<'en' | 'tet' | 'pt', Record<string, unknown>>)
  // Make verification available in browser console
  ;(window as any).verifyTranslations = () => verifyTranslations(DICTS as Record<'en' | 'tet' | 'pt', Record<string, unknown>>)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
