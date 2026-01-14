import { useI18n } from '../i18n'

interface YearFilterProps {
  value: string
  onChange: (year: string) => void
  startYear?: number
  endYear?: number
}

export default function YearFilter({ 
  value, 
  onChange, 
  startYear = 2018,
  endYear = new Date().getFullYear() 
}: YearFilterProps) {
  const { t } = useI18n()
  const years: string[] = ['all']
  for (let y = endYear; y >= startYear; y--) {
    years.push(y.toString())
  }

  return (
    <select
      className="form-select form-select-sm"
      style={{ width: 'auto' }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year === 'all' ? t('common.all_data', { defaultValue: 'All data' }) : year}
        </option>
      ))}
    </select>
  )
}
