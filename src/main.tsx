import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react'
import './index.css'
// The Peskas logo's colours, light and dark (synced from peskas-context/brand).
import './components/peskas-logo.css'
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
  window.verifyTranslations = () => verifyTranslations(DICTS as Record<'en' | 'tet' | 'pt', Record<string, unknown>>)
}

// PostHog (EU cloud, the project the WIO dashboards share): page views, clicks,
// session replays and crashes. Off where the token is unset, as in local dev and previews.
const posthogToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
if (posthogToken) {
  posthog.init(posthogToken, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    defaults: '2026-08-30',
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      {/* No fallback: a crash leaves the page blank as before, but now reaches PostHog */}
      <PostHogErrorBoundary>
        <I18nProvider>
          <App />
        </I18nProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
)
