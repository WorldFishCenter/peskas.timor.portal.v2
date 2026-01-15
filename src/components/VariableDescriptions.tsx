import { useData } from '../hooks/useData'
import { useI18n } from '../i18n'
import { useMemo } from 'react'

// Simple markdown link parser - converts [text](url) to clickable links
function parseMarkdownLinks(text: string): React.ReactNode {
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Add the link
    parts.push(
      <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

interface VariableDescriptionsProps {
  variables: string[]
  type?: 'catch' | 'revenue'
  heading?: string
  intro?: React.ReactNode
}

interface VariableInfo {
  short_name: string
  description?: string
  methods?: string
  problems?: string
  quality?: 'low' | 'medium' | 'high' | null
}

const getBgQuality = (quality: 'low' | 'medium' | 'high' | null | undefined) => {
  if (!quality) {
    return { normal: 'bg-secondary', light: 'bg-secondary-lt' }
  }

  const colorMap = {
    low: 'red',
    medium: 'yellow',
    high: 'green'
  }

  const color = colorMap[quality]
  return {
    normal: `bg-${color}`,
    light: `bg-${color}-lt`
  }
}

export default function VariableDescriptions({ variables, type, heading, intro }: VariableDescriptionsProps) {
  const { t } = useI18n()
  const { data: pars } = useData('pars')

  const finalHeading = useMemo(() => {
    if (heading) return heading
    if (!type || !pars) return t('common.variable_descriptions', { defaultValue: 'Variable Descriptions' })
    return t(pars[type]?.description?.heading?.text || `${type}.description_heading`)
  }, [heading, type, pars, t])

  const finalIntro = useMemo(() => {
    if (intro) return intro
    if (!type || !pars || !pars[type]?.description?.content?.text) return null
    
    return (
      <>
        <p className="text-secondary">{t(pars[type].description.content.text)}</p>
        {pars[type].description.subheading?.text && (
          <div className="hr-text">{t(pars[type].description.subheading.text)}</div>
        )}
      </>
    )
  }, [intro, type, pars, t])

  const variableInfos = useMemo(() => {
    if (!pars?.vars) return []

    return variables
      .map(varName => {
        const varInfo = pars.vars[varName] as VariableInfo | undefined
        if (!varInfo) return null

        return {
          name: varName,
          ...varInfo
        }
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)
  }, [pars, variables])

  if (!pars) return null

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body markdown">
        {finalHeading && <h3 className="card-title fw-bold mb-0">{finalHeading}</h3>}
        {finalIntro && <div className="mt-3">{finalIntro}</div>}

        <div className="accordion mt-3" id="accordion-variables">
          {variableInfos.map((varInfo, index) => {
            const bg = getBgQuality(varInfo.quality)
            const isLast = index === variableInfos.length - 1
            const itemId = `accordion-${varInfo.name}`

            return (
              <div className="accordion-item" key={varInfo.name}>
                <h2 className="accordion-header" id={`${itemId}-heading`}>
                  <button
                    className={`accordion-button ${isLast ? '' : 'collapsed'}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${itemId}-collapse`}
                    aria-expanded={isLast ? 'true' : 'false'}
                  >
                    <span className={`badge badge-pill me-3 ${bg.normal}`}></span>
                    {t(varInfo.short_name)}
                  </button>
                </h2>
                <div
                  id={`${itemId}-collapse`}
                  className={`accordion-collapse collapse ${isLast ? 'show' : ''}`}
                  data-bs-parent="#accordion-variables"
                >
                  <div className="accordion-body">
                    {varInfo.description && (
                      <div className="mb-3">
                        <p>{parseMarkdownLinks(t(varInfo.description))}</p>
                      </div>
                    )}

                    {varInfo.methods && (
                      <div className="small mb-3">
                        <strong>{t(pars.indicators?.processing?.text || 'Data processing and validation:')}</strong>
                        <p className="mb-0">{parseMarkdownLinks(t(varInfo.methods))}</p>
                      </div>
                    )}

                    {varInfo.problems && (
                      <div className="small mb-3">
                        <strong>{t(pars.indicators?.limitations?.text || 'Known problems and limitations:')}</strong>
                        <p className="mb-0">{parseMarkdownLinks(t(varInfo.problems))}</p>
                      </div>
                    )}

                    {varInfo.quality && (
                      <p className={`badge mb-0 ${bg.light}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-check me-1"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                        {t(pars.indicators?.quality?.text || 'DATA QUALITY:')} {t(varInfo.quality).toUpperCase()}
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
