import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n'

type ThemeMode = 'light' | 'dark'

export default function RootLayout() {
  const location = useLocation()
  const isActive = (to: string) => (location.pathname === to ? ' active' : '')
  // Theme toggle
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    return (window.localStorage.getItem('tablerTheme') as ThemeMode) || 'light'
  })

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

  return (
    <div className="page">
      {/* Top header */}
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            <a href=".">
              <span className="ms-2 d-none d-lg-inline-block">
                <span className="fw-bold">{t('brand.title')}</span>
                <span className="d-block text-muted text-sm">{t('brand.subtitle')}</span>
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
              <a href="#" className="nav-link" aria-label={t('actions.toggle_language')} title={t('actions.toggle_language')} onClick={(e) => { e.preventDefault(); setLang(lang === 'en' ? 'tet' : 'en') }}>{lang === 'en' ? 'EN' : 'TET'}</a>
            </div>
            {/* User menu placeholder */}
            <div className="nav-item dropdown">
              <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label="Open user menu">
                <span className="avatar avatar-sm" style={{backgroundImage: "url(https://preview.tabler.io/static/avatars/000m.jpg)"}}></span>
                <div className="d-none d-xl-block ps-2">
                  <div>Jane Pearson</div>
                  <div className="mt-1 small text-muted">UI Designer</div>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                <a href="#" className="dropdown-item">{t('user_menu.profile')}</a>
                <a href="#" className="dropdown-item">{t('user_menu.settings')}</a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item">{t('user_menu.logout')}</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary navbar + tabs */}
      <header className="navbar-expand-md">
        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar">
            <div className="container-xl">
              <ul className="navbar-nav">
                <li className={`nav-item${isActive('/home')}`}>
                  <NavLink to="/home" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.home')}</span>
                  </NavLink>
                </li>
                <li className={`nav-item${isActive('/catch')}`}>
                  <NavLink to="/catch" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M7 10l5 -6l5 6" /><path d="M7 14l5 6l5 -6" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.catch')}</span>
                  </NavLink>
                </li>
                <li className={`nav-item${isActive('/revenue')}`}>
                  <NavLink to="/revenue" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 9l4 0" /><path d="M3 9l12 0" /><path d="M7 12l-4 0" /><path d="M21 12l-12 0" /><path d="M17 15l4 0" /><path d="M3 15l12 0" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.revenue')}</span>
                  </NavLink>
                </li>
                <li className={`nav-item${isActive('/market')}`}>
                  <NavLink to="/market" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 -6l5 6" /><path d="M5 10h14v10a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.market')}</span>
                  </NavLink>
                </li>
                <li className={`nav-item${isActive('/composition')}`}>
                  <NavLink to="/composition" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3v18" /><path d="M3 12h18" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.composition')}</span>
                  </NavLink>
                </li>
                <li className={`nav-item${isActive('/nutrients')}`}>
                  <NavLink to="/nutrients" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18z" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.nutrients')}</span>
                  </NavLink>
                </li>
                <li className={`nav-item${isActive('/about')}`}>
                  <NavLink to="/about" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}> 
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h8" /><path d="M8 13h6" /><path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /></svg>
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
                  <li className="list-inline-item">{t('footer.last_updated')}: <span className="text-muted">2025-01-01 00:00</span></li>
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
