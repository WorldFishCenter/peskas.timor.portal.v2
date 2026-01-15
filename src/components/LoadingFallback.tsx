import { useI18n } from '../i18n'

interface LoadingFallbackProps {
  /** Optional custom message */
  message?: string
  /** Full page loading (centered) or inline */
  fullPage?: boolean
}

/**
 * Loading fallback component for Suspense boundaries
 * Provides consistent loading UI across the application
 */
export default function LoadingFallback({ message, fullPage = true }: LoadingFallbackProps) {
  const { t } = useI18n()
  const displayMessage = message || t('common.loading', { defaultValue: 'Loading...' })

  if (fullPage) {
    return (
      <div className="page">
        <div className="page-body">
          <div className="container-xl">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">{displayMessage}</span>
                </div>
                <div className="text-muted">{displayMessage}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">{displayMessage}</span>
        </div>
        <div className="text-muted small">{displayMessage}</div>
      </div>
    </div>
  )
}
