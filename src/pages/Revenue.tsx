import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import TreemapChart from '../components/charts/TreemapChart'
import RevenueSummaryTable from '../components/RevenueSummaryTable'
import VariableDescriptions from '../components/VariableDescriptions'
import { useData } from '../hooks'
import { useMunicipalData } from '../hooks/useMunicipalData'
import { useFilters } from '../context/FilterContext'
import { revenueBarColors, habitatPalette } from '../constants/colors'
import type { SummaryData } from '../types/data'

export default function Revenue() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: aggregated, loading, error } = useMunicipalData()
  const { data: summaryData } = useData('summary_data')
  const { data: pars } = useData('pars')

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
        })),
      },
    ]
  }, [aggregated, t])

  const metrics = useMemo(() => {
    if (!aggregated?.month || aggregated.month.length < 2) {
      return {
        totalRevenue: '0',
        avgRevenuePerTrip: '0',
        nBoats: '0',
        revenueTrend: { value: '0%', direction: 'none' as const },
        tripTrend: { value: '0%', direction: 'none' as const },
        boatsTrend: { value: '0%', direction: 'none' as const },
      }
    }
    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    const last12 = sortedData.slice(-12)
    const prev12 = sortedData.slice(-24, -12)

    const totalRevenue = last12.reduce((sum, r) => sum + (r.revenue ?? 0), 0)
    const prevRevenue = prev12.reduce((sum, r) => sum + (r.revenue ?? 0), 0)
    const revenueChange = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    const avgTrip =
      last12.reduce((sum, r) => sum + (r.landing_revenue ?? 0), 0) / last12.length
    const prevTrip =
      prev12.length > 0
        ? prev12.reduce((sum, r) => sum + (r.landing_revenue ?? 0), 0) / prev12.length
        : 0
    const tripChange = prevTrip ? ((avgTrip - prevTrip) / prevTrip) * 100 : 0

    const lastMonthBoats = last12[last12.length - 1]?.n_boats ?? 0
    const prevMonthBoats = last12.length >= 2 ? (last12[last12.length - 2]?.n_boats ?? 0) : 0
    const boatsChange = prevMonthBoats ? ((lastMonthBoats - prevMonthBoats) / prevMonthBoats) * 100 : 0

    const getTrend = (val: number) => ({
      value: `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`,
      direction: val > 0 ? 'up' as const : val < 0 ? 'down' as const : 'none' as const,
    })

    return {
      totalRevenue: (totalRevenue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }),
      avgRevenuePerTrip: avgTrip.toFixed(1),
      nBoats: lastMonthBoats.toLocaleString(),
      revenueTrend: getTrend(revenueChange),
      tripTrend: getTrend(tripChange),
      boatsTrend: getTrend(boatsChange),
    }
  }, [aggregated])

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
                <div className="card-header d-flex align-items-center">
                  <div>
                    <h3 className="card-title text-muted fw-bold">
                      {t('vars.revenue.short_name', { defaultValue: 'Revenue Trends' })}
                    </h3>
                    <div className="card-subtitle">{t('revenue.trend_subtitle', { defaultValue: 'Monthly revenue in million USD' })}</div>
                  </div>
                  <div className="card-actions ms-auto">
                    <span className="badge badge-outline text-blue fw-medium">{t('common.last_3_years', { defaultValue: '3 Year Overview' })}</span>
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
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.total_revenue', { defaultValue: 'Total revenue' })}</div>
                        <div className="ms-auto text-muted small">{t('common.last_12_months')}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : `$${metrics.totalRevenue}${t('units.million_short', { defaultValue: 'M' })}`}</div>
                        <span
                          className={`ms-2 ${metrics.revenueTrend.direction === 'up' ? 'text-green' : metrics.revenueTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                        >
                          {metrics.revenueTrend.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.landing_revenue.short_name', { defaultValue: 'Revenue per trip' })}</div>
                        <div className="ms-auto text-muted small">{t('common.avg')}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : `$${metrics.avgRevenuePerTrip}`}</div>
                        <span
                          className={`ms-2 ${metrics.tripTrend.direction === 'up' ? 'text-green' : metrics.tripTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                        >
                          {metrics.tripTrend.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <span
                            className={`avatar ${metrics.boatsTrend.direction === 'up' ? 'bg-green-lt' : metrics.boatsTrend.direction === 'down' ? 'bg-red-lt' : 'bg-secondary-lt'}`}
                          >
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
                              {metrics.boatsTrend.direction === 'up' ? (
                                <path d="M17 7l-10 10m0 -5v5h5" />
                              ) : metrics.boatsTrend.direction === 'down' ? (
                                <path d="M7 7l10 10m-5 0h5v-5" />
                              ) : (
                                <path d="M5 12h14" />
                              )}
                            </svg>
                          </span>
                        </div>
                        <div className="col">
                          <div className="d-flex align-items-center">
                            <div className="font-weight-medium">{t('vars.n_boats.short_name', { defaultValue: 'Active boats' })}</div>
                            <div className="ms-auto lh-1 text-muted small">{t('common.last_month')}</div>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : metrics.nBoats}</div>
                            <span
                              className={`ms-2 ${metrics.boatsTrend.direction === 'up' ? 'text-green' : metrics.boatsTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                            >
                              {metrics.boatsTrend.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Full width treemap */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title text-muted fw-bold">
                      {pars?.revenue?.treemap?.title ?? t('revenue.habitat_treemap', { defaultValue: 'Revenue Distribution' })}
                    </h3>
                    <div className="card-subtitle">{t('revenue.habitat_subtitle', { defaultValue: 'Economic value by habitat and gear' })}</div>
                  </div>
                </div>
                <div className="card-body">
                  {treemapData.length > 0 ? (
                    <TreemapChart
                      data={treemapData}
                      height={448}
                      colors={habitatPalette}
                    />
                  ) : (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  )}
                </div>
                {pars?.revenue?.treemap?.description && (
                  <div className="card-footer bg-transparent border-0 pt-0">
                    <div className="text-muted small">{pars.revenue.treemap.description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Summary table + Variable descriptions */}
            <div className="col-lg-7 col-xl-auto order-lg-last">
              <RevenueSummaryTable />
            </div>
            <div className="col">
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
