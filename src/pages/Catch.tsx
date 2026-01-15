import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import TreemapChart from '../components/charts/TreemapChart'
import CatchSummaryTable from '../components/CatchSummaryTable'
import VariableDescriptions from '../components/VariableDescriptions'
import MetricCard from '../components/MetricCard'
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
        catchTrend: { value: '0%', direction: 'neutral' as const },
        weightTrend: { value: '0%', direction: 'neutral' as const },
        boatsTrend: { value: '0%', direction: 'neutral' as const },
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

    const getTrend = (val: number) => ({
      value: `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`,
      direction: (val > 0 ? 'up' : val < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    })

    return {
      totalCatch: (totalCatch / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
      avgLandingWeight: avgWeight.toFixed(1),
      nBoats: lastMonthBoats.toLocaleString(),
      catchTrend: getTrend(catchChange),
      weightTrend: getTrend(weightChange),
      catchSparkline: last12.map(r => ({ date: r.date_bin_start, value: (r.catch ?? 0) / 1000 })),
      weightSparkline: last12.map(r => ({ date: r.date_bin_start, value: r.landing_weight ?? 0 })),
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
                    <h3 className="card-title fw-bold">
                      {t('catch.trends', { defaultValue: 'Catch Trends' })}
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
                  <MetricCard
                    label={t('vars.catch.short_name', { defaultValue: 'Total catch' })}
                    value={loading ? '' : `${metrics.totalCatch} ${t('units.t', { defaultValue: 't' })}`}
                    trend={metrics.catchTrend}
                    sparkline={metrics.catchSparkline}
                    subtitle={t('common.last_12_months')}
                    loading={loading}
                    variant="with-sparkline"
                  />
                </div>
                <div className="col-12">
                  <MetricCard
                    label={t('vars.landing_weight.short_name', { defaultValue: 'Catch per trip' })}
                    value={loading ? '' : `${metrics.avgLandingWeight} ${t('units.kg', { defaultValue: 'kg' })}`}
                    trend={metrics.weightTrend}
                    sparkline={metrics.weightSparkline}
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
                    footer={municipality === 'all' ? t('common.national', { defaultValue: 'National' }) : municipality}
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
                      {t('catch.habitat_treemap')}
                    </h3>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                      {t('catch.treemap_description')}
                    </div>
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
            <div className="col-lg-5 col-xl-7 order-lg-last">
              <CatchSummaryTable />
            </div>
            <div className="col-lg-7 col-xl-5">
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
