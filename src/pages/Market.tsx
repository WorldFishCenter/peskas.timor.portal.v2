import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import StackedBarChart from '../components/charts/StackedBarChart'
import RadarChart from '../components/charts/RadarChart'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import MarketSummaryTable from '../components/MarketSummaryTable'
import VariableDescriptions from '../components/VariableDescriptions'
import { useData } from '../hooks'
import { useMunicipalData } from '../hooks/useMunicipalData'
import { interpolateViridis } from 'd3-scale-chromatic'
import { useFilters } from '../context/FilterContext'
import { timeSeriesColors, spiderColors } from '../constants/colors'

export default function Market() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: summaryData, loading: summaryLoading } = useData('summary_data')
  const { data: municipalData, loading: municipalLoading } = useData('municipal_aggregated')
  const { data: aggregated, loading: aggregatedLoading } = useMunicipalData()

  // Always use translations - translations are the single source of truth
  const pagePretitle = t('catch.subtitle')
  const pageTitle = t('market.title')
  const priceCardTitle = t('vars.price_kg.short_name')
  const conservationTitle = t('market.conservation_title')
  const conservationSubtitle = t('market.conservation_description')
  const descriptionHeading = t('revenue.description_heading')
  const descriptionContent = t('revenue.description_content')
  const descriptionSubheading = t('revenue.description_subheading')

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

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{pagePretitle}</div>
              <h2 className="page-title">{pageTitle}</h2>
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
                    <h3 className="card-title fw-bold">
                      {priceCardTitle}
                    </h3>
                    <div className="card-subtitle">{t('market.trend_subtitle', { defaultValue: 'Monthly price per kilogram' })}</div>
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
                      height={336}
                      yAxisTitle={t('market.price_usd', { defaultValue: 'Price (USD/kg)' })}
                      colors={timeSeriesColors}
                      showMean={true}
                      showMax={true}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Spider Chart - 4 columns */}
            <div className="col-lg-4 col-xl-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  {municipalLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : radarData.categories.length > 0 ? (
                    <RadarChart
                      series={radarData.series}
                      categories={radarData.categories}
                      height={352}
                      colors={spiderColors}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Conservation Stacked Bar - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header d-flex align-items-center">
                  <div>
                    <h3 className="card-title fw-bold">
                      {conservationTitle}
                    </h3>
                    {conservationSubtitle && (
                      <div className="card-subtitle">
                        {conservationSubtitle}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {summaryLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : summaryData?.conservation && summaryData.conservation.length > 0 ? (
                    <StackedBarChart
                      data={summaryData.conservation}
                      height={320}
                      colors={conservationColors}
                      yFormatter={(val: number) => `${val}%`}
                    />
                    ) : (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '320px' }}>
                      <div className="text-muted small">{t('common.no_conservation_data', { defaultValue: 'No conservation data available' })}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Table - 7 columns */}
            <div className="col-lg-7 col-xl-auto order-lg-last">
              <MarketSummaryTable />
            </div>

            {/* Variable Descriptions - Remaining columns */}
              <div className="col">
                <VariableDescriptions
                  type="revenue"
                  variables={['price_kg']}
                  heading={descriptionHeading}
                  intro={
                    <>
                      {descriptionContent && <p>{descriptionContent}</p>}
                      <div className="hr-text">
                        {descriptionSubheading}
                      </div>
                    </>
                  }
                />
              </div>
          </div>
        </div>
      </div>
    </>
  )
}
