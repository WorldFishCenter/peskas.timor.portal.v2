import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import RadarChart from '../components/charts/RadarChart'
import TreemapChart from '../components/charts/TreemapChart'
import { SummaryTable } from '../components/SummaryTable'
import { useData } from '../hooks'
import { useFilters } from '../context/FilterContext'
import { revenueBarColors, spiderColors, habitatPalette } from '../constants/colors'
import type { MunicipalAggregatedRecord, SummaryData } from '../types/data'

export default function Revenue() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: aggregated, loading, error } = useData('aggregated')
  const { data: municipalAggregated } = useData('municipal_aggregated')
  const { data: summaryData } = useData('summary_data')

  const chartSeries = useMemo(() => {
    if (!aggregated?.month) return []
    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    return [
      {
        name: t('revenue.series_name'),
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
        pricePerKg: '0',
        revenueTrend: { value: '0%', direction: 'none' as const },
        tripTrend: { value: '0%', direction: 'none' as const },
        priceTrend: { value: '0%', direction: 'none' as const },
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

    const avgPrice =
      last12.reduce((sum, r) => sum + (r.price_kg ?? 0), 0) / last12.length
    const prevPrice =
      prev12.length > 0
        ? prev12.reduce((sum, r) => sum + (r.price_kg ?? 0), 0) / prev12.length
        : 0
    const priceChange = prevPrice ? ((avgPrice - prevPrice) / prevPrice) * 100 : 0

    const getTrend = (val: number) => ({
      value: `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`,
      direction: val > 0 ? 'up' as const : val < 0 ? 'down' as const : 'none' as const,
    })

    return {
      totalRevenue: (totalRevenue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }),
      avgRevenuePerTrip: avgTrip.toFixed(1),
      pricePerKg: avgPrice.toFixed(2),
      revenueTrend: getTrend(revenueChange),
      tripTrend: getTrend(tripChange),
      priceTrend: getTrend(priceChange),
    }
  }, [aggregated])

  const radarData = useMemo(() => {
    if (!municipalAggregated || !Array.isArray(municipalAggregated)) {
      return { series: [], categories: [] }
    }
    const data = municipalAggregated as MunicipalAggregatedRecord[]

    const regions = [...new Set(data.map((d) => d.region))].sort()

    const allDataByRegion = regions.map((region) => {
      const regionData = data.filter((d) => d.region === region)
      const prices = regionData.map((d) => d.price_kg).filter((p) => p != null && p > 0)
      if (prices.length === 0) return 0
      prices.sort((a, b) => a - b)
      const mid = Math.floor(prices.length / 2)
      return prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2
    })

    const latestByRegion = regions.map((region) => {
      const regionData = data
        .filter((d) => d.region === region)
        .sort((a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime())
      const latest = regionData.slice(-2)
      const prices = latest.map((d) => d.price_kg).filter((p) => p != null && p > 0)
      if (prices.length === 0) return 0
      prices.sort((a, b) => a - b)
      const mid = Math.floor(prices.length / 2)
      return prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2
    })

    return {
      series: [
        { name: t('revenue.all_data', { defaultValue: 'All data' }), data: allDataByRegion.map((v) => Math.round(v * 100) / 100) },
        { name: t('revenue.latest_month', { defaultValue: 'Latest month' }), data: latestByRegion.map((v) => Math.round(v * 100) / 100) },
      ],
      categories: regions,
    }
  }, [municipalAggregated, t])

  const treemapData = useMemo(() => {
    if (!summaryData) return []
    const data = summaryData as SummaryData
    if (!data.revenue_habitat) return []
    // Flatten treemap data: each habitat's gear types
    return data.revenue_habitat.flatMap((habitat) =>
      habitat.data.map((item) => ({
        x: `${habitat.name}: ${item.x}`,
        y: item.y,
      }))
    )
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
            <div className="col-lg-8 col-xl-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('vars.revenue.short_name')}</h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <TimeSeriesChart
                      series={chartSeries}
                      height="21rem"
                      yAxisTitle={t('revenue.million_usd', { defaultValue: 'Revenue (M USD)' })}
                      colors={revenueBarColors}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-4">
              <div className="row row-deck row-cards">
                <div className="col-12">
                  <div className="card" style={{ minHeight: '8rem' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.total_revenue', { defaultValue: 'Total revenue' })}</div>
                        <div className="ms-auto text-muted small">{t('common.last_12_months')}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? '...' : `$${metrics.totalRevenue}M`}</div>
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
                  <div className="card" style={{ minHeight: '8rem' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.revenue_per_trip', { defaultValue: 'Revenue per trip' })}</div>
                        <div className="ms-auto text-muted small">{t('common.avg')}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? '...' : `$${metrics.avgRevenuePerTrip}`}</div>
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
                  <div className="card" style={{ minHeight: '4rem' }}>
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <span
                            className={`avatar ${metrics.priceTrend.direction === 'up' ? 'bg-green-lt' : metrics.priceTrend.direction === 'down' ? 'bg-red-lt' : 'bg-secondary-lt'}`}
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
                              {metrics.priceTrend.direction === 'up' ? (
                                <path d="M17 7l-10 10m0 -5v5h5" />
                              ) : metrics.priceTrend.direction === 'down' ? (
                                <path d="M7 7l10 10m-5 0h5v-5" />
                              ) : (
                                <path d="M5 12h14" />
                              )}
                            </svg>
                          </span>
                        </div>
                        <div className="col">
                          <div className="d-flex align-items-center">
                            <div className="font-weight-medium">{t('vars.price_kg', { defaultValue: 'Price per kg' })}</div>
                            <div className="ms-auto lh-1 text-muted small">{t('common.avg')}</div>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="h1 mb-0">{loading ? '...' : `$${metrics.pricePerKg}`}</div>
                            <span
                              className={`ms-2 ${metrics.priceTrend.direction === 'up' ? 'text-green' : metrics.priceTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                            >
                              {metrics.priceTrend.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('revenue.price_by_region', { defaultValue: 'Price per Kg by Region' })}</h3>
                </div>
                <div className="card-body">
                  {radarData.categories.length > 0 ? (
                    <RadarChart
                      series={radarData.series}
                      categories={radarData.categories}
                      height="22rem"
                      colors={spiderColors}
                    />
                  ) : (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('revenue.by_habitat', { defaultValue: 'Revenue by Habitat & Gear' })}</h3>
                </div>
                <div className="card-body">
                  {treemapData.length > 0 ? (
                    <TreemapChart
                      data={treemapData}
                      height="22rem"
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
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('revenue.summary_table', { defaultValue: 'Revenue Summary by Municipality' })}</h3>
                </div>
                <div className="card-body">
                  <SummaryTable municipality={municipality} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
