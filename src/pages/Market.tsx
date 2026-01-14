import { useI18n } from '../i18n'
import { useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import StackedBarChart from '../components/charts/StackedBarChart'
import RadarChart from '../components/charts/RadarChart'
import { useData } from '../hooks'
import { interpolateViridis } from 'd3-scale-chromatic'
import { useFilters } from '../context/FilterContext'

export default function Market() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: summaryData, loading } = useData('summary_data')
  const { data: municipalData, loading: municipalLoading } = useData('municipal_aggregated')

  const conservationColors = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => interpolateViridis(i / 4)).map((c) =>
      c.substring(0, 7)
    )
  }, [])

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
        { name: t('market.all_data'), data: allTimeMedians },
        { name: t('market.latest_month'), data: latestMedians },
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
            <div className="col-12">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('market.price_per_kg')}</h3></div>
                <div className="card-body">
                  {municipalLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : radarData.categories.length > 0 ? (
                    <RadarChart
                      series={radarData.series}
                      categories={radarData.categories}
                      height="21rem"
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('market.conservation_title')}</h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : summaryData?.conservation ? (
                    <StackedBarChart
                      data={summaryData.conservation}
                      height="20rem"
                      colors={conservationColors}
                      yFormatter={(val: number) => `${val}%`}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
