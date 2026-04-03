import { useI18n } from '../i18n'

type DataScopeCalloutProps = {
  /** Shown below the “Data scope” label (e.g. translated municipality name or national). */
  areaLabel: string
  className?: string
}

/**
 * Highlights whether chart/table data is national or filtered to a municipality.
 */
export default function DataScopeCallout({ areaLabel, className = '' }: DataScopeCalloutProps) {
  const { t } = useI18n()
  return (
    <div
      className={`border-start border-primary border-3 ps-3 py-2 mt-2 bg-light-lt rounded-end ${className}`.trim()}
      role="note"
    >
      <div
        className="text-uppercase text-muted fw-bold"
        style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}
      >
        {t('common.data_scope_label')}
      </div>
      <div className="fw-semibold small text-body mt-1">{areaLabel}</div>
    </div>
  )
}
