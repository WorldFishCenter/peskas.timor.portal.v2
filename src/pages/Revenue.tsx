import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import TreemapChart from '../components/charts/TreemapChart'
import RevenueSummaryTable from '../components/RevenueSummaryTable'
import DataScopeCallout from '../components/DataScopeCallout'
import TimeseriesExplainerLink from '../components/TimeseriesExplainerLink'
import VariableDescriptions from '../components/VariableDescriptions'
import MetricCard from '../components/MetricCard'
import { useData, useRevenueRollingMetrics } from '../hooks'
import { useMunicipalData } from '../hooks/useMunicipalData'
import { useFilters } from '../context/FilterContext'
import { getMunicipalityScopeLabel } from '../utils/i18nLabels'
import { revenueBarColors, habitatPalette } from '../constants/colors'
import type { SummaryData } from '../types/data'

export default function Revenue() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: aggregated, loading, error } = useMunicipalData()
  const chartScopeLabel = getMunicipalityScopeLabel(t, municipality)
  const { data: summaryData } = useData('summary_data')
  const metrics = useRevenueRollingMetrics(aggregated)

  const chartSeries = useMemo(() => {
    if (!aggregated?.month) return []
    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    return [
      {
        name: t('revenue.series_name', { defaultValue: 'Revenue' }),
        data: sortedData.map((row) => ({
          date: row.date_bin_start,
          value: (row.revenue ?? 0) / 1000000,
          isImputed: row.is_imputed,
        })),
      },
    ]
  }, [aggregated, t])

  const treemapData = useMemo(() => {
    if (!summaryData) return []
    const data = summaryData as SummaryData
    if (!data.revenue_habitat) return []
    // Keep hierarchical structure for treemap grouping by habitat
    return data.revenue_habitat
  }, [summaryData])

  if (error) {
    return <div className="alert alert-danger">{error.message}</div>
  }

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.revenue')}</h2>
            </div>
            <div className="col-auto ms-auto d-print-none">
              <div className="btn-list">
                <MunicipalityFilter value={municipality} onChange={setMunicipality} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            {/* Row 1: Time series + 3 cards */}
            <div className="col-lg-8 col-xl-8">
              <div className="card shadow-sm border-0">
                <div className="card-header">
                  <div className="d-flex flex-wrap align-items-center column-gap-4 row-gap-2">
                    <div className="min-w-0">
                      <h3 className="card-title fw-bold">
                        {t('revenue.trends', { defaultValue: 'Revenue Trends' })}
                      </h3>
                      <div className="card-subtitle">{t('revenue.trend_subtitle', { defaultValue: 'Monthly revenue in million USD' })}</div>
                      {municipality !== 'all' && (
                        <TimeseriesExplainerLink className="d-inline-block mt-1" />
                      )}
                    </div>
                    <DataScopeCallout areaLabel={chartScopeLabel} className="flex-shrink-0" />
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <TimeSeriesChart
                      series={chartSeries}
                      height={336}
                      yAxisTitle={t('revenue.million_usd', { defaultValue: 'Revenue (M USD)' })}
                      colors={revenueBarColors}
                      showMean={true}
                      showMax={true}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-4">
              <div className="row row-deck row-cards">
                <div className="col-12">
                  <MetricCard
                    label={t('vars.revenue.short_name')}
                    value={loading ? '' : `$${metrics.totalRevenue}${t('units.million_short', { defaultValue: 'M' })}`}
                    trend={metrics.revenueTrend}
                    sparkline={metrics.revenueSparkline}
                    subtitle={t('common.last_12_months')}
                    loading={loading}
                    variant="with-sparkline"
                  />
                </div>
                <div className="col-12">
                  <MetricCard
                    label={t('vars.landing_revenue.short_name', { defaultValue: 'Revenue per trip' })}
                    value={loading ? '' : `$${metrics.avgRevenuePerTrip}`}
                    trend={metrics.tripTrend}
                    sparkline={metrics.tripSparkline}
                    subtitle={t('common.last_12_months')}
                    loading={loading}
                    variant="with-sparkline"
                  />
                </div>
                <div className="col-12">
                  <MetricCard
                    label={t('vars.n_boats.active', { defaultValue: 'Active boats' })}
                    value={metrics.nBoats}
                    loading={loading}
                    icon={
                      <span className="avatar bg-secondary-lt">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </span>
                    }
                    footer={
                      municipality === 'all'
                        ? t('common.national', { defaultValue: 'National' })
                        : t(`common.municipalities.${municipality}`)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Full width treemap */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title fw-bold">
                      {t('revenue.habitat_treemap')}
                    </h3>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                      {t('revenue.treemap_description')}
                    </div>
                    {municipality === 'all' && (
                      <DataScopeCallout areaLabel={t('common.treemap_scope_national_line')} className="mt-2" />
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {municipality !== 'all' && (
                    <div className="alert alert-info mb-3 py-2" role="status">
                      {t('common.habitat_treemap_national_disclaimer')}
                    </div>
                  )}
                  {treemapData.length > 0 ? (
                    <TreemapChart
                      data={treemapData}
                      height={448}
                      colors={habitatPalette}
                      unit="$"
                    />
                  ) : (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Summary table + Variable descriptions */}
            <div className="col-lg-5 col-xl-7 order-lg-last">
              <RevenueSummaryTable />
            </div>
            <div className="col-lg-7 col-xl-5">
              <VariableDescriptions
                variables={['revenue', 'recorded_revenue', 'landing_revenue', 'n_landings_per_boat', 'n_boats']}
                type="revenue"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
