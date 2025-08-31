import './App.css'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useI18n } from './i18n'

type TabKey = 'home' | 'users' | 'analytics' | 'settings'
type ThemeMode = 'light' | 'dark'

function App() {
  const initialTab: TabKey = useMemo(() => {
    const hash = (typeof window !== 'undefined' ? window.location.hash : '').replace(/^#/, '')
    if (hash === 'users' || hash === 'analytics' || hash === 'settings') return hash
    return 'home'
  }, [])

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem('tablerTheme') as ThemeMode | null
    return stored ?? 'light'
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

  // No auto mode; do not listen to system preference changes

  useEffect(() => {
    // Reflect tab in URL hash for shareable state without a router
    if (typeof window !== 'undefined') {
      const nextHash = `#${activeTab}`
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash)
      }
    }
  }, [activeTab])

  useEffect(() => {
    const parseHash = (): TabKey => {
      const h = (typeof window !== 'undefined' ? window.location.hash : '').replace(/^#/, '')
      if (h === 'users' || h === 'analytics' || h === 'settings') return h
      return 'home'
    }
    const handler = () => setActiveTab(parseHash())
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handler)
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('hashchange', handler)
    }
  }, [])

  const onNavClick = (e: MouseEvent, tab: TabKey) => {
    e.preventDefault()
    setActiveTab(tab)
  }

  const { t, lang, setLang } = useI18n()

  return (
    <div className="page">
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            <a href=".">
              <img src="https://preview.tabler.io/static/logo.svg" width="110" height="32" alt="Tabler" className="navbar-brand-image"/>
            </a>
          </h1>
          <div className="navbar-nav flex-row order-md-last">
            <div className="nav-item me-3">
              <a
                href="#"
                className="nav-link px-0"
                aria-label="Toggle theme"
                title="Toggle theme"
                onClick={(e) => { e.preventDefault(); setTheme((t) => (t === 'light' ? 'dark' : 'light')) }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon hide-theme-dark" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3v2" /><path d="M12 19v2" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="M5.6 5.6l1.4 1.4" /><path d="M17 17l1.4 1.4" /><path d="M5.6 18.4l1.4 -1.4" /><path d="M17 7l1.4 -1.4" /><path d="M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0 -8" /></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon hide-theme-light" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>
              </a>
            </div>
            <div className="nav-item me-3">
              <a
                href="#"
                className="nav-link"
                aria-label="Toggle language"
                title="Toggle language"
                onClick={(e) => { e.preventDefault(); setLang(lang === 'en' ? 'tet' : 'en') }}
              >
                {lang === 'en' ? 'EN' : 'TET'}
              </a>
            </div>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label="Open user menu">
                <span className="avatar avatar-sm" style={{backgroundImage: "url(https://preview.tabler.io/static/avatars/000m.jpg)"}}></span>
                <div className="d-none d-xl-block ps-2">
                  <div>Jane Pearson</div>
                  <div className="mt-1 small text-muted">UI Designer</div>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                <a href="#" className="dropdown-item">Status</a>
                <a href="#" className="dropdown-item">Profile</a>
                <a href="#" className="dropdown-item">Feedback</a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item">Settings</a>
                <a href="#" className="dropdown-item">Logout</a>
              </div>
            </div>
          </div>
        </div>
      </header>
      <header className="navbar-expand-md">
        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar">
            <div className="container-xl">
              <ul className="navbar-nav">
                <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>
                  <a className="nav-link" href="#home" onClick={(e) => onNavClick(e, 'home')}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.home')}</span>
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
                  <a className="nav-link" href="#users" onClick={(e) => onNavClick(e, 'users')}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.users')}</span>
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
                  <a className="nav-link" href="#analytics" onClick={(e) => onNavClick(e, 'analytics')}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.analytics')}</span>
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
                  <a className="nav-link" href="#settings" onClick={(e) => onNavClick(e, 'settings')}>
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
                    </span>
                    <span className="nav-link-title">{t('nav.settings')}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      {activeTab === 'home' && (
        <div className="page-wrapper">
          <div className="page-header d-print-none">
            <div className="container-xl">
              <div className="row g-2 align-items-center">
                <div className="col">
                  <div className="page-pretitle">{t('header.overview')}</div>
                  <h2 className="page-title">{t('header.dashboard')}</h2>
                </div>
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="container-xl">
              <div className="row row-deck row-cards">
                <div className="col-12">
                  <div className="row row-cards">
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-primary text-white avatar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-medium">
                              132 Sales
                            </div>
                            <div className="text-muted">
                              12 waiting payments
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-green text-white avatar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-medium">
                              78% Orders
                            </div>
                            <div className="text-muted">
                              32 completed
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-twitter text-white avatar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-medium">
                              623 Shares
                            </div>
                            <div className="text-muted">
                              16 today
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-facebook text-white avatar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="m0 0h24v24H0z" fill="none"/><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-medium">
                              43 Comments
                            </div>
                            <div className="text-muted">
                              3 today
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">{t('home.recent_activity')}</h3>
                    </div>
                    <div className="card-body">
                      <div className="divide-y">
                      <div>
                        <div className="row">
                          <div className="col-auto">
                            <span className="avatar">JL</span>
                          </div>
                          <div className="col">
                            <div className="text-truncate">
                              <strong>John Doe</strong> created a new project <strong>Dashboard UI</strong>.
                            </div>
                            <div className="text-muted">2 hours ago</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="row">
                          <div className="col-auto">
                            <span className="avatar" style={{backgroundImage: `url(https://preview.tabler.io/static/avatars/000f.jpg)`}}></span>
                          </div>
                          <div className="col">
                            <div className="text-truncate">
                              <strong>Jane Smith</strong> uploaded a new document.
                            </div>
                            <div className="text-muted">4 hours ago</div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="page-wrapper">
          <div className="page-header d-print-none">
            <div className="container-xl">
              <div className="row g-2 align-items-center">
                <div className="col">
                  <div className="page-pretitle">{t('header.directory')}</div>
                  <h2 className="page-title">{t('header.users')}</h2>
                </div>
                <div className="col-auto ms-auto d-print-none">
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="input-icon">
                        <span className="input-icon-addon">
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                        </span>
                        <input type="text" className="form-control" placeholder={t('users.search_placeholder')} />
                      </div>
                    </div>
                    <a href="#" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
                      {t('users.new_user')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="container-xl">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-vcenter">
                    <thead>
                      <tr>
                        <th>{t('users.table.name')}</th>
                        <th>{t('users.table.role')}</th>
                        <th>{t('users.table.status')}</th>
                        <th>{t('users.table.email')}</th>
                        <th className="w-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar me-2" style={{backgroundImage: 'url(https://preview.tabler.io/static/avatars/000m.jpg)'}}></span>
                            <div className="flex-fill">
                              <div className="font-weight-medium">Jane Pearson</div>
                              <div className="text-muted">UI Designer</div>
                            </div>
                          </div>
                        </td>
                        <td>Designer</td>
                        <td><span className="badge bg-green-lt text-green">{t('users.status.active')}</span></td>
                        <td>jane.pearson@example.com</td>
                        <td className="text-end">
                          <a href="#" className="btn btn-ghost-secondary btn-icon" aria-label="Actions">
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l.01 0" /><path d="M12 12l.01 0" /><path d="M19 12l.01 0" /></svg>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar me-2" style={{backgroundImage: 'url(https://preview.tabler.io/static/avatars/010m.jpg)'}}></span>
                            <div className="flex-fill">
                              <div className="font-weight-medium">John Doe</div>
                              <div className="text-muted">Frontend Engineer</div>
                            </div>
                          </div>
                        </td>
                        <td>Engineer</td>
                        <td><span className="badge bg-green-lt text-green">{t('users.status.active')}</span></td>
                        <td>john.doe@example.com</td>
                        <td className="text-end"><a href="#" className="btn btn-ghost-secondary btn-icon" aria-label="Actions"><svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l.01 0" /><path d="M12 12l.01 0" /><path d="M19 12l.01 0" /></svg></a></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar me-2">AS</span>
                            <div className="flex-fill">
                              <div className="font-weight-medium">Alice Summers</div>
                              <div className="text-muted">Data Analyst</div>
                            </div>
                          </div>
                        </td>
                        <td>Analyst</td>
                        <td><span className="badge bg-yellow-lt text-yellow">{t('users.status.pending')}</span></td>
                        <td>alice.summers@example.com</td>
                        <td className="text-end"><a href="#" className="btn btn-ghost-secondary btn-icon" aria-label="Actions"><svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l.01 0" /><path d="M12 12l.01 0" /><path d="M19 12l.01 0" /></svg></a></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar me-2" style={{backgroundImage: 'url(https://preview.tabler.io/static/avatars/002m.jpg)'}}></span>
                            <div className="flex-fill">
                              <div className="font-weight-medium">Brian Taylor</div>
                              <div className="text-muted">QA Engineer</div>
                            </div>
                          </div>
                        </td>
                        <td>QA</td>
                        <td><span className="badge bg-green-lt text-green">{t('users.status.active')}</span></td>
                        <td>brian.taylor@example.com</td>
                        <td className="text-end"><a href="#" className="btn btn-ghost-secondary btn-icon" aria-label="Actions"><svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l.01 0" /><path d="M12 12l.01 0" /><path d="M19 12l.01 0" /></svg></a></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar me-2" style={{backgroundImage: 'url(https://preview.tabler.io/static/avatars/004f.jpg)'}}></span>
                            <div className="flex-fill">
                              <div className="font-weight-medium">Marta Livingston</div>
                              <div className="text-muted">Product Manager</div>
                            </div>
                          </div>
                        </td>
                        <td>PM</td>
                        <td><span className="badge bg-red-lt text-red">{t('users.status.suspended')}</span></td>
                        <td>marta.livingston@example.com</td>
                        <td className="text-end"><a href="#" className="btn btn-ghost-secondary btn-icon" aria-label="Actions"><svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l.01 0" /><path d="M12 12l.01 0" /><path d="M19 12l.01 0" /></svg></a></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar me-2">RS</span>
                            <div className="flex-fill">
                              <div className="font-weight-medium">Robert Smith</div>
                              <div className="text-muted">Support</div>
                            </div>
                          </div>
                        </td>
                        <td>Support</td>
                        <td><span className="badge bg-green-lt text-green">{t('users.status.active')}</span></td>
                        <td>robert.smith@example.com</td>
                        <td className="text-end"><a href="#" className="btn btn-ghost-secondary btn-icon" aria-label="Actions"><svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l.01 0" /><path d="M12 12l.01 0" /><path d="M19 12l.01 0" /></svg></a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer d-flex align-items-center">
                  <p className="m-0 text-muted">{t('users.table.showing', { start: 1, end: 6, total: 42 })}</p>
                  <ul className="pagination m-0 ms-auto">
                    <li className="page-item disabled"><a className="page-link" href="#" tabIndex={-1} aria-disabled="true">{t('users.table.prev')}</a></li>
                    <li className="page-item active"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item"><a className="page-link" href="#">{t('users.table.next')}</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="page-wrapper">
          <div className="page-header d-print-none">
            <div className="container-xl">
              <div className="row g-2 align-items-center">
                <div className="col">
                  <div className="page-pretitle">{t('header.reports')}</div>
                  <h2 className="page-title">{t('header.analytics')}</h2>
                </div>
                <div className="col-auto d-print-none">
                  <a href="#" className="btn btn-outline-primary">{t('analytics.export_csv')}</a>
                </div>
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="container-xl">
              <div className="row row-cards">
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('analytics.kpi.sales')}</div>
                        <div className="ms-auto">
                          <div className="h2 mb-0">$12.3k</div>
                        </div>
                      </div>
                      <div className="progress progress-sm">
                        <div className="progress-bar" style={{width: '64%'}} aria-valuenow={64} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('analytics.kpi.new_users')}</div>
                        <div className="ms-auto">
                          <div className="h2 mb-0">+842</div>
                        </div>
                      </div>
                      <div className="progress progress-sm">
                        <div className="progress-bar bg-green" style={{width: '78%'}} aria-valuenow={78} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('analytics.kpi.active_sessions')}</div>
                        <div className="ms-auto">
                          <div className="h2 mb-0">1,245</div>
                        </div>
                      </div>
                      <div className="progress progress-sm">
                        <div className="progress-bar bg-blue" style={{width: '52%'}} aria-valuenow={52} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('analytics.kpi.conversion')}</div>
                        <div className="ms-auto">
                          <div className="h2 mb-0">4.2%</div>
                        </div>
                      </div>
                      <div className="progress progress-sm">
                        <div className="progress-bar bg-azure" style={{width: '42%'}} aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row row-cards mt-2">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">{t('analytics.traffic_sources')}</h3>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">{t('analytics.channels.organic')}</div>
                      <div className="progress progress-sm mb-3">
                        <div className="progress-bar" style={{width: '55%'}}></div>
                      </div>
                      <div className="mb-2">{t('analytics.channels.direct')}</div>
                      <div className="progress progress-sm mb-3">
                        <div className="progress-bar bg-green" style={{width: '23%'}}></div>
                      </div>
                      <div className="mb-2">{t('analytics.channels.referral')}</div>
                      <div className="progress progress-sm mb-3">
                        <div className="progress-bar bg-azure" style={{width: '12%'}}></div>
                      </div>
                      <div className="mb-2">{t('analytics.channels.social')}</div>
                      <div className="progress progress-sm">
                        <div className="progress-bar bg-yellow" style={{width: '10%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">{t('analytics.top_pages')}</h3>
                    </div>
                    <div className="table-responsive">
                      <table className="table card-table table-vcenter">
                        <thead>
                          <tr>
                            <th>{t('analytics.columns.page')}</th>
                            <th>{t('analytics.columns.views')}</th>
                            <th>{t('analytics.columns.bounce')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>/home</td>
                            <td>8,924</td>
                            <td><span className="text-green">32%</span></td>
                          </tr>
                          <tr>
                            <td>/users</td>
                            <td>5,183</td>
                            <td><span className="text-yellow">44%</span></td>
                          </tr>
                          <tr>
                            <td>/analytics</td>
                            <td>3,156</td>
                            <td><span className="text-red">58%</span></td>
                          </tr>
                          <tr>
                            <td>/settings</td>
                            <td>913</td>
                            <td><span className="text-green">24%</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="page-wrapper">
          <div className="page-header d-print-none">
            <div className="container-xl">
              <div className="row g-2 align-items-center">
                <div className="col">
                  <div className="page-pretitle">{t('header.account')}</div>
                  <h2 className="page-title">{t('header.settings')}</h2>
                </div>
                <div className="col-auto">
                  <a href="#" className="btn btn-primary">{t('settings.save_changes')}</a>
                </div>
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="container-xl">
              <div className="row row-cards">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">{t('settings.profile')}</h3></div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">{t('settings.full_name')}</label>
                        <input type="text" className="form-control" placeholder="Your name" defaultValue="Jane Pearson" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('settings.email')}</label>
                        <input type="email" className="form-control" placeholder="you@company.com" defaultValue="jane.pearson@example.com" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('settings.company')}</label>
                        <input type="text" className="form-control" placeholder="Company" defaultValue="WorldFish" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">{t('settings.notifications')}</h3></div>
                    <div className="card-body">
                      <label className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                        <span className="form-check-label">{t('settings.notify_assign')}</span>
                      </label>
                      <label className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" />
                        <span className="form-check-label">{t('settings.notify_mentions')}</span>
                      </label>
                      <label className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                        <span className="form-check-label">{t('settings.notify_weekly')}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">{t('settings.change_password')}</h3></div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">{t('settings.current_password')}</label>
                        <input type="password" className="form-control" placeholder={t('settings.current_password')} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('settings.new_password')}</label>
                        <input type="password" className="form-control" placeholder={t('settings.new_password')} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('settings.confirm_new_password')}</label>
                        <input type="password" className="form-control" placeholder={t('settings.confirm_new_password')} />
                      </div>
                      <a href="#" className="btn btn-primary">{t('settings.update_password')}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
