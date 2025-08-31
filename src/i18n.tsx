import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'tet'

type Dict = Record<string, any>

function get(obj: Dict, path: string) {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Dict)?.[key], obj)
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''))
}

export type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

// Dictionaries
const en = {
  brand: {
    title: 'PESKAS Timor-Leste',
    subtitle: 'Fisheries Dashboard',
  },
  nav: {
    home: 'Home',
    catch: 'Catch',
    revenue: 'Revenue',
    market: 'Market',
    composition: 'Composition',
    nutrients: 'Nutrients',
    about: 'About',
    users: 'Users',
    analytics: 'Analytics',
    settings: 'Settings',
  },
  header: {
    overview: 'Overview',
    dashboard: 'Dashboard',
    directory: 'Directory',
    users: 'Users',
    reports: 'Reports',
    analytics: 'Analytics',
    account: 'Account',
    settings: 'Settings',
  },
  footer: {
    licence: 'Licence',
    source: 'Source code',
    last_updated: 'Last updated',
    copyright: '© {year} WorldFish',
  },
  user_menu: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
  },
  actions: {
    toggle_theme: 'Toggle theme',
    toggle_language: 'Toggle language',
  },
  common: {
    municipalities: {
      all: 'All municipalities',
      dili: 'Dili',
      baucau: 'Baucau',
      bobonaro: 'Bobonaro',
    },
    months_short: {
      jan: 'Jan',
      feb: 'Feb',
      mar: 'Mar',
      apr: 'Apr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
    },
  },
  users: {
    search_placeholder: 'Search users',
    new_user: 'New user',
    table: {
      name: 'Name',
      role: 'Role',
      status: 'Status',
      email: 'Email',
      showing: 'Showing {start} to {end} of {total} users',
      prev: 'Prev',
      next: 'Next',
    },
    status: { active: 'Active', pending: 'Pending', suspended: 'Suspended' },
  },
  analytics: {
    export_csv: 'Export CSV',
    kpi: { sales: 'Sales', new_users: 'New Users', active_sessions: 'Active Sessions', conversion: 'Conversion' },
    traffic_sources: 'Traffic Sources',
    top_pages: 'Top Pages',
    columns: { page: 'Page', views: 'Views', bounce: 'Bounce' },
    channels: { organic: 'Organic', direct: 'Direct', referral: 'Referral', social: 'Social' },
  },
  settings: {
    save_changes: 'Save changes',
    profile: 'Profile',
    full_name: 'Full name',
    email: 'Email',
    company: 'Company',
    notifications: 'Notifications',
    notify_assign: 'Email me when someone assigns me',
    notify_mentions: 'Push notifications for mentions',
    notify_weekly: 'Weekly summary email',
    change_password: 'Change Password',
    current_password: 'Current password',
    new_password: 'New password',
    confirm_new_password: 'Confirm new password',
    update_password: 'Update password',
  },
  home: {
    recent_activity: 'Recent Activity',
    fishing_map: 'Fishing map',
    summary_table: 'Summary table',
    indicator: 'Indicator',
    value: 'Value',
    change: 'Change',
    trips: 'Trips',
    revenue: 'Revenue',
    catch: 'Catch',
    marker: 'Peskas Timor-Leste',
  },
  catch: {
    series: 'Catch over time',
    table: 'Catch summary',
    series_name: 'Catch',
    month: 'Month',
    catch_t: 'Catch (t)',
  },
  revenue: { series_name: 'Revenue' },
  market: { price_per_kg: 'Price per kg', avg_price: 'Avg price', series_name: 'Price' },
  composition: {
    percent_heading: 'Species composition (%)',
    highlight_heading: 'Highlights',
    description: 'Description',
    description_text: 'Key notes about composition and methodology.'
  },
  nutrients: {
    highlight: 'Nutrient highlight',
    rdi: 'RDI',
    categories: {
      protein: 'Protein',
      iron: 'Iron',
      zinc: 'Zinc',
      vita: 'Vit A',
      omega3: 'Omega-3',
      vitd: 'Vit D',
    },
  },
  about: { content: 'PESKAS Timor-Leste — data and methods overview.' },
}

// NOTE: Placeholder Tetum (Tetun) values currently mirror English.
// Update these with proper translations as needed.
const tet: typeof en = {
  brand: {
    title: 'PESKAS Timor-Leste',
    subtitle: 'Dashboard Pesca',
  },
  nav: {
    home: 'Uma',
    catch: 'Kaptura',
    revenue: 'Renda',
    market: 'Merkadu',
    composition: 'Kompozisaun',
    nutrients: 'Nutriente',
    about: 'Konaba',
    users: 'Users',
    analytics: 'Analytics',
    settings: 'Settings',
  },
  header: {
    overview: 'Overview',
    dashboard: 'Dashboard',
    directory: 'Directory',
    users: 'Users',
    reports: 'Reports',
    analytics: 'Analytics',
    account: 'Account',
    settings: 'Settings',
  },
  footer: {
    licence: 'Licence',
    source: 'Código fonte',
    last_updated: 'Atualizadu ikus',
    copyright: '© {year} WorldFish',
  },
  user_menu: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Sai',
  },
  actions: {
    toggle_theme: 'Troka tema',
    toggle_language: 'Troka lian',
  },
  common: {
    municipalities: {
      all: 'Municipiu hotu-hotu',
      dili: 'Dili',
      baucau: 'Baukau',
      bobonaro: 'Bobonaru',
    },
    months_short: {
      jan: 'Jan',
      feb: 'Fev',
      mar: 'Mar',
      apr: 'Abr',
      may: 'Mai',
      jun: 'Jun',
      jul: 'Jul',
    },
  },
  users: {
    search_placeholder: 'Search users',
    new_user: 'New user',
    table: {
      name: 'Name',
      role: 'Role',
      status: 'Status',
      email: 'Email',
      showing: 'Hatudu {start} to {end} husi {total} uza-na\'in',
      prev: 'Anterior',
      next: 'Próximu',
    },
    status: { active: 'Ativu', pending: 'Tuir mai', suspended: 'Suspende' },
  },
  analytics: {
    export_csv: 'Export CSV',
    kpi: { sales: 'Vendas', new_users: 'Uza-na\'in foun', active_sessions: 'Sesaun Ativu', conversion: 'Konversaun' },
    traffic_sources: 'Origem Trafiku',
    top_pages: 'Pájina Liu-liu',
    columns: { page: 'Pájina', views: 'Vizualizasaun', bounce: 'Bounce' },
    channels: { organic: 'Orgániku', direct: 'Diretu', referral: 'Referénsia', social: 'Sosiál' },
  },
  settings: {
    save_changes: 'Rai mudansa',
    profile: 'Perfil',
    full_name: 'Naran kompletu',
    email: 'Email',
    company: 'Empreza',
    notifications: 'Notifikasaun',
    notify_assign: 'Email hau bainhira ema hatuun hau',
    notify_mentions: 'Notifikasaun push ba mension',
    notify_weekly: 'Email rezumu semana',
    change_password: 'Troka Senha',
    current_password: 'Senha atual',
    new_password: 'Senha foun',
    confirm_new_password: 'Konfirma senha foun',
    update_password: 'Atualiza senha',
  },
  home: {
    recent_activity: 'Atividade Recenti',
    fishing_map: 'Mapa Peska',
    summary_table: 'Tabela rezumu',
    indicator: 'Indicador',
    value: 'Valor',
    change: 'Mudansa',
    trips: 'Liafuan',
    revenue: 'Renda',
    catch: 'Kaptura',
    marker: 'Peskas Timor-Leste',
  },
  catch: {
    series: 'Kaptura iha tempu',
    table: 'Resumo kaptura',
    series_name: 'Kaptura',
    month: 'Fulan',
    catch_t: 'Kaptura (t)',
  },
  revenue: { series_name: 'Renda' },
  market: { price_per_kg: 'Presu ba kg', avg_price: 'Presu média', series_name: 'Presu' },
  composition: {
    percent_heading: 'Kompozisaun espécie (%)',
    highlight_heading: 'Destaque',
    description: 'Deskrisaun',
    description_text: 'Nota sira kona-ba kompozisaun no metodologia.'
  },
  nutrients: {
    highlight: 'Destaque nutriente',
    rdi: 'RDI',
    categories: {
      protein: 'Proteína',
      iron: 'Ferru',
      zinc: 'Zinku',
      vita: 'Vit A',
      omega3: 'Omega-3',
      vitd: 'Vit D',
    },
  },
  about: { content: 'PESKAS Timor-Leste — dadus no metodu.' },
}

const DICTS: Record<Lang, Dict> = { en, tet }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem('appLang') as Lang | null
    return stored ?? 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') window.localStorage.setItem('appLang', l)
  }

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const t = useMemo(() => {
    const dict = DICTS[lang]
    return (key: string, params?: Record<string, string | number>) => {
      const raw = (get(dict, key) as string) ?? (get(DICTS.en, key) as string) ?? key
      return typeof raw === 'string' ? interpolate(raw, params) : key
    }
  }, [lang])

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
