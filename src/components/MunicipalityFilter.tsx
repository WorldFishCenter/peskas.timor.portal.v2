import { useI18n } from '../i18n'
import { MUNICIPALITIES, type Municipality } from '../constants'

type MunicipalityFilterProps = {
  value: Municipality
  onChange: (municipality: Municipality) => void
}

export default function MunicipalityFilter({ value, onChange }: MunicipalityFilterProps) {
  const { t } = useI18n()

  return (
    <div className="dropdown">
      <a href="#" className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
        {t(`common.municipalities.${value}`)}
      </a>
      <div className="dropdown-menu dropdown-menu-end">
        {MUNICIPALITIES.map((key) => (
          <a
            key={key}
            href="#"
            className={`dropdown-item${value === key ? ' active' : ''}`}
            onClick={(e) => { e.preventDefault(); onChange(key) }}
          >
            {t(`common.municipalities.${key}`)}
          </a>
        ))}
      </div>
    </div>
  )
}
