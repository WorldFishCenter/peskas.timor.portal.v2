import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Municipality } from '../constants'

interface DateRange {
  start?: string
  end?: string
}

interface FilterContextValue {
  municipality: Municipality
  setMunicipality: (mun: Municipality) => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  resetFilters: () => void
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined)

interface FilterProviderProps {
  children: ReactNode
}

const DEFAULT_MUNICIPALITY: Municipality = 'all'
const DEFAULT_DATE_RANGE: DateRange = {}

export function FilterProvider({ children }: FilterProviderProps) {
  const [municipality, setMunicipality] = useState<Municipality>(DEFAULT_MUNICIPALITY)
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE)

  const resetFilters = () => {
    setMunicipality(DEFAULT_MUNICIPALITY)
    setDateRange(DEFAULT_DATE_RANGE)
  }

  return (
    <FilterContext.Provider
      value={{
        municipality,
        setMunicipality,
        dateRange,
        setDateRange,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
