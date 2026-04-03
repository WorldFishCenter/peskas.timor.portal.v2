import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { en, tet, pt } from './locales'

export type Lang = 'en' | 'tet' | 'pt'

type Dict = Record<string, unknown>
type I18nParams = { defaultValue?: string } & Record<string, string | number>

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
  t: (key: string, params?: I18nParams) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

const DICTS: Record<Lang, Dict> = { en, tet, pt }

// Export for verification utility
export { DICTS }

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
    return (key: string, params?: I18nParams) => {
      const { defaultValue, ...interpolations } = params ?? {}
      const raw = (get(dict, key) as string)
        ?? (get(DICTS.en, key) as string)
        ?? defaultValue
        ?? key
      return typeof raw === 'string' ? interpolate(raw, interpolations) : String(raw)
    }
  }, [lang])

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
