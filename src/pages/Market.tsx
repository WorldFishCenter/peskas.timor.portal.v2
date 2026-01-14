import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import StackedBarChart from '../components/charts/StackedBarChart'
import RadarChart from '../components/charts/RadarChart'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import { SummaryTable } from '../components/SummaryTable'
import { useData } from '../hooks'
import { interpolateViridis } from 'd3-scale-chromatic'
import { useFilters } from '../context/FilterContext'
import { timeSeriesColors, spiderColors } from '../constants/colors'

export default function Market() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: pars } = useData('pars')
  const { data: summaryData, loading: summaryLoading } = useData('summary_data')
  const { data: municipalData, loading: municipalLoading } = useData('municipal_aggregated')
  const { data: aggregated, loading: aggregatedLoading } = useData('aggregated')

  const conservationColors = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => interpolateViridis(i / 4)).map((c) =>
      c.substring(0, 7)
    )
  }, [])

  // Time series chart for price_kg
  const priceChartSeries = useMemo(() => {
    if (!aggregated?.month) return []
    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    return [
      {
        name: t('vars.price_kg.short_name', { defaultValue: 'Price per kg' }),
        data: sortedData.map((row) => ({
          date: row.date_bin_start,
          value: row.price_kg ?? 0,
        })),
      },
    ]
  }, [aggregated, t])

  // Summary metrics with trends
  const metrics = useMemo(() => {
    if (!aggregated?.month || aggregated.month.length < 2) {
      return {
        avgPrice: '0',
        avgWeight: '0',
        avgLandings: '0',
        priceTrend: { value: '0%', direction: 'none' as const },
        weightTrend: { value: '0%', direction: 'none' as const },
        landingsTrend: { value: '0%', direction: 'none' as const },
      }
    }

    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    const last12 = sortedData.slice(-12)
    const prev12 = sortedData.slice(-24, -12)

    // Average price per kg
    const avgPrice = last12.reduce((sum, r) => sum + (r.price_kg ?? 0), 0) / last12.length
    const prevPrice = prev12.length > 0
      ? prev12.reduce((sum, r) => sum + (r.price_kg ?? 0), 0) / prev12.length
      : 0
    const priceChange = prevPrice ? ((avgPrice - prevPrice) / prevPrice) * 100 : 0

    // Average landing weight
    const avgWeight = last12.reduce((sum, r) => sum + (r.landing_weight ?? 0), 0) / last12.length
    const prevWeight = prev12.length > 0
      ? prev12.reduce((sum, r) => sum + (r.landing_weight ?? 0), 0) / prev12.length
      : 0
    const weightChange = prevWeight ? ((avgWeight - prevWeight) / prevWeight) * 100 : 0

    // Landings per boat
    const avgLandings = last12.reduce((sum, r) => sum + (r.n_landings_per_boat ?? 0), 0) / last12.length
    const prevLandings = prev12.length > 0
      ? prev12.reduce((sum, r) => sum + (r.n_landings_per_boat ?? 0), 0) / prev12.length
      : 0
    const landingsChange = prevLandings ? ((avgLandings - prevLandings) / prevLandings) * 100 : 0

    const getTrend = (val: number) => ({
      value: `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`,
      direction: val > 0 ? 'up' as const : val < 0 ? 'down' as const : 'none' as const,
    })

    return {
      avgPrice: avgPrice.toFixed(2),
      avgWeight: avgWeight.toFixed(1),
      avgLandings: avgLandings.toFixed(1),
      priceTrend: getTrend(priceChange),
      weightTrend: getTrend(weightChange),
      landingsTrend: getTrend(landingsChange),
    }
  }, [aggregated])

  // Radar chart data for price by region
  const radarData = useMemo(() => {
    if (!municipalData) return { series: [], categories: [] }

    const regions = [...new Set(municipalData.map(d => d.region))].sort()

    const allTimeMedians: number[] = []
    const latestMedians: number[] = []

    for (const region of regions) {
      const regionData = municipalData.filter(d => d.region === region)
      const prices = regionData.map(d => d.price_kg).filter(p => p > 0).sort((a, b) => a - b)

      if (prices.length > 0) {
        const median = prices[Math.floor(prices.length / 2)]
        allTimeMedians.push(median)
      } else {
        allTimeMedians.push(0)
      }

      const latestData = regionData.slice(-2)
      const latestPrices = latestData.map(d => d.price_kg).filter(p => p > 0).sort((a, b) => a - b)
      if (latestPrices.length > 0) {
        latestMedians.push(latestPrices[Math.floor(latestPrices.length / 2)])
      } else {
        latestMedians.push(0)
      }
    }

    return {
      series: [
        { name: t('market.all_data', { defaultValue: 'All data' }), data: allTimeMedians },
        { name: t('market.latest_month', { defaultValue: 'Latest month' }), data: latestMedians },
      ],
      categories: regions,
    }
  }, [municipalData, t])

  const loading = summaryLoading || municipalLoading || aggregatedLoading

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.market')}</h2>
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
            {/* Time Series Chart - 8 columns */}
            <div className="col-lg-8 col-xl-8">
              <div className="card shadow-sm border-0">
                <div className="card-header d-flex align-items-center">
                  <div>
                    <h3 className="card-title text-muted fw-bold">
                      {t('market.price_series', { defaultValue: 'Price Trends' })}
                    </h3>
                    <div className="card-subtitle">{t('market.price_subtitle', { defaultValue: 'Average price per kilogram in USD' })}</div>
                  </div>
                </div>
                <div className="card-body">
                  {aggregatedLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <TimeSeriesChart
                      series={priceChartSeries}
                      height={350}
                      yAxisTitle={t('market.price_usd', { defaultValue: 'Price (USD/kg)' })}
                      colors={timeSeriesColors}
                      showMean={true}
                      showMax={true}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards - 4 columns */}
            <div className="col-lg-4 col-xl-4">
              <div className="row row-deck row-cards">
                <div className="col-12">
                  <div className="card" >
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.price_kg.short_name', { defaultValue: 'Price per kg' })}</div>
                        <div className="ms-auto text-muted small">{t('common.avg', { defaultValue: 'Avg' })}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : `$${metrics.avgPrice}`}</div>
                        <span
                          className={`ms-2 ${metrics.priceTrend.direction === 'up' ? 'text-green' : metrics.priceTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                        >
                          {metrics.priceTrend.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card" >
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('vars.landing_weight.short_name', { defaultValue: 'Catch per trip' })}</div>
                        <div className="ms-auto text-muted small">{t('common.avg', { defaultValue: 'Avg' })}</div>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : `${metrics.avgWeight} ${t('units.kg', { defaultValue: 'kg' })}`}</div>
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
                  <div className="card" >
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <span
                            className={`avatar ${metrics.landingsTrend.direction === 'up' ? 'bg-green-lt' : metrics.landingsTrend.direction === 'down' ? 'bg-red-lt' : 'bg-secondary-lt'}`}
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
                              {metrics.landingsTrend.direction === 'up' ? (
                                <path d="M17 7l-10 10m0 -5v5h5" />
                              ) : metrics.landingsTrend.direction === 'down' ? (
                                <path d="M7 7l10 10m-5 0h5v-5" />
                              ) : (
                                <path d="M5 12h14" />
                              )}
                            </svg>
                          </span>
                        </div>
                        <div className="col">
                          <div className="d-flex align-items-center">
                            <div className="font-weight-medium">{t('vars.n_landings_per_boat.short_name', { defaultValue: 'Landings/boat' })}</div>
                            <div className="ms-auto lh-1 text-muted small">{t('common.avg', { defaultValue: 'Avg' })}</div>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="h1 mb-0">{loading ? t('common.loading_short', { defaultValue: '...' }) : metrics.avgLandings}</div>
                            <span
                              className={`ms-2 ${metrics.landingsTrend.direction === 'up' ? 'text-green' : metrics.landingsTrend.direction === 'down' ? 'text-red' : 'text-muted'}`}
                            >
                              {metrics.landingsTrend.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart - 6 columns */}
            <div className="col-lg-6 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title text-muted fw-bold">
                      {t('market.price_by_region', { defaultValue: 'Regional Price Comparison' })}
                    </h3>
                    <div className="card-subtitle">{t('market.radar_subtitle', { defaultValue: 'Median price comparison across regions' })}</div>
                  </div>
                </div>
                <div className="card-body">
                  {municipalLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : radarData.categories.length > 0 ? (
                    <RadarChart
                      series={radarData.series}
                      categories={radarData.categories}
                      height={380}
                      colors={spiderColors}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Conservation Stacked Bar - 6 columns */}
            <div className="col-lg-6 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title text-muted fw-bold">
                      {t('market.conservation_title', { defaultValue: 'Fish Conservation' })}
                    </h3>
                    <div className="card-subtitle">{t('market.stacked_subtitle', { defaultValue: 'Preservation methods used by region' })}</div>
                    {pars?.market?.conservation?.region_barplot?.description && (
                      <div className="text-muted small mt-2">{pars.market.conservation.region_barplot.description}</div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {summaryLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : summaryData?.conservation ? (
                    <StackedBarChart
                      data={summaryData.conservation}
                      height={380}
                      colors={conservationColors}
                      yFormatter={(val: number) => `${val}%`}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Summary Table - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <h3 className="card-title text-muted fw-bold">{t('market.summary_table', { defaultValue: 'Market Summary by Municipality' })}</h3>
                </div>
                <div className="card-body">
                  <SummaryTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
