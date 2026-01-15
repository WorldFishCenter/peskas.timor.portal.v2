import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useI18n, type Lang } from '../i18n'

type ThemeMode = 'light' | 'dark'

export default function RootLayout() {
  // Theme toggle
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    return (window.localStorage.getItem('tablerTheme') as ThemeMode) || 'light'
  })

  const [lastUpdated, setLastUpdated] = useState<string>('2025-01-01 00:00')

  useEffect(() => {
    fetch('/data/data_last_updated.json')
      .then(res => res.json())
      .then((timestamp: string) => setLastUpdated(timestamp))
      .catch(() => setLastUpdated('2025-01-01 00:00'))
  }, [])

  const applyTheme = (mode: ThemeMode) => {
    const isDark = mode === 'dark'
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    applyTheme(theme)
    window.localStorage.setItem('tablerTheme', theme)
  }, [theme])

  const { t, lang, setLang } = useI18n()
  const languageCycle: Lang[] = ['en', 'tet', 'pt']
  const languageLabels: Record<Lang, string> = { en: 'EN', tet: 'TET', pt: 'PT' }
  const getNextLanguage = (current: Lang) => {
    const currentIndex = languageCycle.indexOf(current)
    return languageCycle[(currentIndex + 1) % languageCycle.length]
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('brand.title')
    }
  }, [t, lang])

  return (
    <div className="page">
      {/* Top header */}
      <header className="navbar navbar-expand-md sticky-top d-print-none">
        <div className="container-xl">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label={t('actions.toggle_navigation', { defaultValue: 'Toggle navigation' })}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            <a href=".">
              <span className="ms-2 d-none d-lg-inline-block">
                <span className="fw-bold">{t('brand.title')}</span>
                <span className="d-block text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.7' }}>{t('brand.subtitle')}</span>
              </span>
            </a>
          </h1>
          <div className="navbar-nav flex-row order-md-last">
            {/* Theme toggle */}
            <div className="nav-item me-3">
              <a href="#" className="nav-link px-0" aria-label={t('actions.toggle_theme')} title={t('actions.toggle_theme')} onClick={(e) => { e.preventDefault(); setTheme((t) => (t === 'light' ? 'dark' : 'light')) }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon hide-theme-dark" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3v2" /><path d="M12 19v2" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="M5.6 5.6l1.4 1.4" /><path d="M17 17l1.4 1.4" /><path d="M5.6 18.4l1.4 -1.4" /><path d="M17 7l1.4 -1.4" /><path d="M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0 -8" /></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon hide-theme-light" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>
              </a>
            </div>
            {/* Language toggle */}
            <div className="nav-item me-3">
              <a
                href="#"
                className="nav-link"
                aria-label={t('actions.toggle_language')}
                title={t('actions.toggle_language')}
                onClick={(e) => {
                  e.preventDefault()
                  setLang(getNextLanguage(lang))
                }}
              >
                {languageLabels[lang]}
              </a>
            </div>
            {/* User menu placeholder */}
            {/* <div className="nav-item dropdown">
              <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label={t('actions.open_user_menu', { defaultValue: 'Open user menu' })}>
                <span className="avatar avatar-sm" style={{backgroundImage: "url(https://preview.tabler.io/static/avatars/000m.jpg)"}}></span>
                <div className="d-none d-xl-block ps-2">
                  <div>{t('user_menu.name', { defaultValue: 'Jane Pearson' })}</div>
                  <div className="mt-1 small text-muted">{t('user_menu.role', { defaultValue: 'UI Designer' })}</div>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                <a href="#" className="dropdown-item">{t('user_menu.profile')}</a>
                <a href="#" className="dropdown-item">{t('user_menu.settings')}</a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item">{t('user_menu.logout')}</a>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      {/* Secondary navbar + tabs */}
      <header className="navbar-expand-md">
        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar">
            <div className="container-xl">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <NavLink to="/home" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.home')}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/catch" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 20l10 0" /><path d="M6 6l6 -1l6 1" /><path d="M12 3l0 17" /><path d="M9 12l-3 -6l-3 6a3 3 0 0 0 6 0" /><path d="M21 12l-3 -6l-3 6a3 3 0 0 0 6 0" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.catch')}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/revenue" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.revenue')}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/market" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="6" cy="19" r="2" /><circle cx="17" cy="19" r="2" /><path d="M17 17h-11v-14h-2" /><path d="M6 5l14 1l-1 7h-13" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.market')}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/composition" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a0.9 .9 0 0 0 -1 -.8" /><path d="M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.composition')}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/nutrients" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571" /><path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504" /><path d="M18 11v.01" /><path d="M11.5 10.5c-.667 1 -.667 2 0 3" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.nutrients')}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/about" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12.01" y2="8" /><polyline points="11 12 12 12 12 16 13 16" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.about')}</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <div className="page-wrapper">
        <Outlet />
        {/* Footer */}
        <footer className="footer footer-transparent d-print-none">
          <div className="container-xl">
            <div className="row text-center align-items-center flex-row-reverse">
              <div className="col-lg-auto ms-lg-auto">
                <ul className="list-inline list-inline-dots mb-0">
                  <li className="list-inline-item"><a className="link-secondary" href="https://github.com/WorldFishCenter/peskas.timor.portal/blob/main/LICENSE.md">{t('footer.licence')}</a></li>
                  <li className="list-inline-item"><a className="link-secondary" href="https://github.com/WorldFishCenter/peskas.timor.portal">{t('footer.source')}</a></li>
                </ul>
              </div>
              <div className="col-12 col-lg-auto mt-3 mt-lg-0">
                <ul className="list-inline list-inline-dots mb-0">
                  <li className="list-inline-item">{t('footer.last_updated')}: <span className="text-muted">{lastUpdated}</span></li>
                  <li className="list-inline-item">{t('footer.copyright', { year: new Date().getFullYear() })}</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
