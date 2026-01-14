import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import TreemapChart from '../components/charts/TreemapChart'
import CatchSummaryTable from '../components/CatchSummaryTable'
import VariableDescriptions from '../components/VariableDescriptions'
import { useData } from '../hooks'
import { useMunicipalData } from '../hooks/useMunicipalData'
import { useFilters } from '../context/FilterContext'
import { habitatPalette } from '../constants/colors'
import type { SummaryData } from '../types/data'

export default function Catch() {
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
        name: t('nav.catch'),
        data: sortedData.map((row) => ({
          date: row.date_bin_start,
          value: (row.catch ?? 0) / 1000,
        })),
      },
    ]
  }, [aggregated, t])

  const metrics = useMemo(() => {
    if (!aggregated?.month || aggregated.month.length < 2) {
      return {
        totalCatch: '0',
        avgLandingWeight: '0',
        nBoats: '0',
        catchTrend: { value: '0%', direction: 'none' as const },
        weightTrend: { value: '0%', direction: 'none' as const },
        boatsTrend: { value: '0%', direction: 'none' as const },
      }
    }
    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    const last12 = sortedData.slice(-12)
    const prev12 = sortedData.slice(-24, -12)

    const totalCatch = last12.reduce((sum, r) => sum + (r.catch ?? 0), 0)
    const prevCatch = prev12.reduce((sum, r) => sum + (r.catch ?? 0), 0)
    const catchChange = prevCatch ? ((totalCatch - prevCatch) / prevCatch) * 100 : 0

    const avgWeight =
      last12.reduce((sum, r) => sum + (r.landing_weight ?? 0), 0) / last12.length
    const prevWeight =
      prev12.length > 0
        ? prev12.reduce((sum, r) => sum + (r.landing_weight ?? 0), 0) / prev12.length
        : 0
    const weightChange = prevWeight ? ((avgWeight - prevWeight) / prevWeight) * 100 : 0

    const lastMonthBoats = last12[last12.length - 1]?.n_boats ?? 0
    const prevMonthBoats = last12.length >= 2 ? (last12[last12.length - 2]?.n_boats ?? 0) : 0
    const boatsChange = prevMonthBoats ? ((lastMonthBoats - prevMonthBoats) / prevMonthBoats) * 100 : 0

    const getTrend = (val: number) => ({
      value: `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`,
      direction: val > 0 ? 'up' as const : val < 0 ? 'down' as const : 'none' as const,
    })

    return {
      totalCatch: (totalCatch / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
      avgLandingWeight: avgWeight.toFixed(1),
      nBoats: lastMonthBoats.toLocaleString(),
      catchTrend: getTrend(catchChange),
      weightTrend: getTrend(weightChange),
      boatsTrend: getTrend(boatsChange),
    }
  }, [aggregated])

  const treemapData = useMemo(() => {
    if (!summaryData) return []
    const data = summaryData as SummaryData
    if (!data.catch_habitat) return []
    // Keep hierarchical structure for treemap grouping by habitat
    return data.catch_habitat
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
              <h2 className="page-title">{t('nav.catch')}</h2>
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
                      {t('vars.catch.short_name', { defaultValue: 'Catch Trends' })}
                    </h3>
                    <div className="card-subtitle">{t('catch.trend_subtitle', { defaultValue: 'Monthly catch volume in tons' })}</div>
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
                      yAxisTitle={t('catch.catch_t', { defaultValue: 'Catch (tons)' })}
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
                        <div className="subheader">{t('vars.catch.short_name', { defaultValue: 'Total catch' })}</div>
                        <div className="ms-auto text-muted small">{t('common.last_12_months')}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : `${metrics.totalCatch} ${t('units.t', { defaultValue: 't' })}`}</div>
                        <span
                          className={`ms-2 ${metrics.catchTrend.direction === 'up' ? 'text-green' : metrics.catchTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                        >
                          {metrics.catchTrend.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.landing_weight.short_name', { defaultValue: 'Catch per trip' })}</div>
                        <div className="ms-auto text-muted small">{t('common.avg')}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : `${metrics.avgLandingWeight} ${t('units.kg', { defaultValue: 'kg' })}`}</div>
                        <span
                          className={`ms-2 ${metrics.weightTrend.direction === 'up' ? 'text-green' : metrics.weightTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                        >
                          {metrics.weightTrend.value}
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
                      {pars?.catch?.treemap?.title ?? t('catch.habitat_treemap', { defaultValue: 'Catch Distribution' })}
                    </h3>
                    {pars?.catch?.treemap?.description && (
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {pars.catch.treemap.description}
                      </div>
                    )}
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
              </div>
            </div>

            {/* Row 3: Summary table + Variable descriptions */}
            <div className="col-lg-7 col-xl-auto order-lg-last">
              <CatchSummaryTable />
            </div>
            <div className="col">
              <VariableDescriptions
                variables={['catch', 'recorded_catch', 'landing_weight', 'n_landings_per_boat', 'n_boats']}
                type="catch"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
