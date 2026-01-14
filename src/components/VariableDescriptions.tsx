import { useData } from '../hooks/useData'
import { useI18n } from '../i18n'

interface VariableDescriptionsProps {
  variables: string[]
  type: 'catch' | 'revenue'
}

export default function VariableDescriptions({ variables, type }: VariableDescriptionsProps) {
  const { t } = useI18n()
  const { data: pars } = useData('pars')
  const { data: varDictionary } = useData('var_dictionary')

  const heading = pars?.[type]?.description?.heading?.text ?? t(`${type}.description_heading`, { defaultValue: 'Variable Descriptions' })
  const content = pars?.[type]?.description?.content?.text ?? ''
  const subheading = pars?.[type]?.description?.subheading?.text ?? t(`${type}.description_subheading`, { defaultValue: 'Variable Definitions' })

  const getQualityBadgeColor = (quality?: string) => {
    if (!quality) return 'bg-secondary'
    switch (quality.toLowerCase()) {
      case 'low': return 'bg-red'
      case 'medium': return 'bg-yellow'
      case 'high': return 'bg-green'
      default: return 'bg-secondary'
    }
  }

  const getQualityText = (quality?: string) => {
    if (!quality || quality === '') return t('indicators.not_assessed', { defaultValue: 'Not assessed' })
    const normalized = quality.toLowerCase()
    if (normalized === 'low') return t('indicators.quality_low', { defaultValue: 'Low' })
    if (normalized === 'medium') return t('indicators.quality_medium', { defaultValue: 'Medium' })
    if (normalized === 'high') return t('indicators.quality_high', { defaultValue: 'High' })
    return quality.charAt(0).toUpperCase() + quality.slice(1).toLowerCase()
  }

  return (
    <div className="card">
      <div className="card-body markdown">
        <h3 className="card-title mb-0">{heading}</h3>
        {content && (
          <div className="mt-3">
            <p className="text-secondary">{content}</p>
          </div>
        )}

        {subheading && (
          <div className="hr-text">{subheading}</div>
        )}

        <div className="accordion" id={`accordion-variables-${type}`}>
          {variables.map((variable, index) => {
            const varInfo = varDictionary?.[variable]
            if (!varInfo) return null

            const itemId = `accordion-${type}-${variable}`
            const isLast = index === variables.length - 1
            const badgeColor = getQualityBadgeColor(varInfo.quality)
            const badgeLightColor = badgeColor + '-lt'

            return (
              <div className="accordion-item" key={variable}>
                <h2 className="accordion-header" id={`${itemId}-heading`}>
                  <button
                    className={`accordion-button ${!isLast ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${itemId}-collapse`}
                    aria-expanded={isLast ? 'true' : 'false'}
                  >
                    <span className={`badge badge-pill me-3 ${badgeColor}`}></span>
                    {varInfo.short_name || variable}
                  </button>
                </h2>
                <div
                  id={`${itemId}-collapse`}
                  className={`accordion-collapse collapse ${isLast ? 'show' : ''}`}
                  data-bs-parent={`#accordion-variables-${type}`}
                >
                  <div className="accordion-body pt-0">
                    {varInfo.description && (
                      <div className="mb-3">
                        <p>{varInfo.description}</p>
                      </div>
                    )}

                    {varInfo.method && (
                      <div className="small mb-3">
                        <strong>{t('indicators.processing', { defaultValue: 'Data processing and validation:' })}</strong>
                        <p className="mb-0">{varInfo.method}</p>
                      </div>
                    )}

                    {varInfo.problems && (
                      <div className="small mb-3">
                        <strong>{t('indicators.limitations', { defaultValue: 'Known problems and limitations:' })}</strong>
                        <p className="mb-0">{varInfo.problems}</p>
                      </div>
                    )}

                    {varInfo.quality && (
                      <p className={`badge mb-0 ${badgeLightColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-check me-1" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M5 12l5 5l10 -10"></path>
                        </svg>
                        {t('indicators.quality', { defaultValue: 'DATA QUALITY:' })} {getQualityText(varInfo.quality).toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
