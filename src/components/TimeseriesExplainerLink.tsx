import { useI18n } from '../i18n'

/** Fragment id for monthly-series Direct / Estimated copy in About the data (VariableDescriptions). */
export const IMPUTED_MONTHS_EXPLAINER_ID = 'imputed-months-explained'

export const IMPUTED_MONTHS_EXPLAINER_HASH = `#${IMPUTED_MONTHS_EXPLAINER_ID}`

export default function TimeseriesExplainerLink({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  return (
    <a
      href={IMPUTED_MONTHS_EXPLAINER_HASH}
      className={`small link-primary text-decoration-underline ${className}`.trim()}
    >
      {t('common.timeseries_explainer_link')}
    </a>
  )
}
