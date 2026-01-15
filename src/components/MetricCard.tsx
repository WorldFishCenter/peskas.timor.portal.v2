import React from 'react'
import { useI18n } from '../i18n'
import SparklineChart from './charts/SparklineChart'

export interface TrendData {
  direction: 'up' | 'down' | 'neutral' | 'none'
  value: string
}

export interface SparklineDataPoint {
  date: string
  value: number
}

interface MetricCardProps {
  /** Main metric label/header */
  label: string
  /** Current metric value */
  value: string | number
  /** Optional trend information */
  trend?: TrendData
  /** Optional sparkline chart data */
  sparkline?: SparklineDataPoint[]
  /** Sparkline color (default: primary blue) */
  sparklineColor?: string
  /** Loading state */
  loading?: boolean
  /** Optional subtitle (e.g., "Last 12 months") */
  subtitle?: string
  /** Optional icon/avatar content */
  icon?: React.ReactNode
  /** Optional footer content */
  footer?: React.ReactNode
  /** Card variant: 'default' or 'with-sparkline' */
  variant?: 'default' | 'with-sparkline'
}

/**
 * Reusable metric card component
 * Displays a metric with optional trend indicator and sparkline chart
 */
function MetricCard({
  label,
  value,
  trend,
  sparkline,
  sparklineColor = '#206bc4',
  loading = false,
  subtitle,
  icon,
  footer,
  variant = sparkline ? 'with-sparkline' : 'default',
}: MetricCardProps) {
  const { t } = useI18n()

  const displayValue = loading ? t('common.loading_short', { defaultValue: '...' }) : value

  const trendColorClass =
    trend?.direction === 'up'
      ? 'text-green'
      : trend?.direction === 'down'
        ? 'text-red'
        : 'text-muted'

  return (
    <div className={`card ${variant === 'with-sparkline' ? 'overflow-hidden' : ''}`}>
      <div className="card-body">
        {(label || subtitle) && (
          <div className="d-flex align-items-center">
            {label && <div className="subheader">{label}</div>}
            {subtitle && <div className="ms-auto text-muted small">{subtitle}</div>}
          </div>
        )}
        {icon ? (
          <div className="row align-items-center">
            <div className="col-auto">{icon}</div>
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="font-weight-medium">{label}</div>
                {footer && <div className="ms-auto lh-1 text-muted small">{footer}</div>}
              </div>
              <div className="d-flex align-items-center">
                <div className="h1 mb-0">{displayValue}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex align-items-baseline">
            <div className="h1 mb-0">{displayValue}</div>
            {trend && (
              <>
                <span className={`ms-2 ${trendColorClass}`}>{trend.value}</span>
                <span className="text-muted small ms-1">
                  {t('common.vs_prev_year', { defaultValue: 'vs prev. year' })}
                </span>
              </>
            )}
          </div>
        )}
      </div>
      {variant === 'with-sparkline' && sparkline && !loading && (
        <div className="mt-auto" style={{ minHeight: '40px', margin: '0 -1px -1px -1px' }}>
          <SparklineChart data={sparkline} color={sparklineColor} height={50} />
        </div>
      )}
    </div>
  )
}

export default React.memo(MetricCard)
