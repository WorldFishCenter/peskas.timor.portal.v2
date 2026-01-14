import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { useData } from '../hooks'
import { useFilters } from '../context/FilterContext'
import MunicipalityFilter from '../components/MunicipalityFilter'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { habitatPalette } from '../constants/colors'

export default function Nutrients() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: nutrientsData, loading } = useData('nutrients_aggregated')
  const { data: pars } = useData('pars')

  // Aggregate nutrient data by nutrient type
  const chartData = useMemo(() => {
    if (!nutrientsData?.month) return { categories: [], series: [] }

    const nutrientTotals: Record<string, { supply: number; rdi: number }> = {}
    
    nutrientsData.month.forEach((row) => {
      if (!nutrientTotals[row.nutrient]) {
        nutrientTotals[row.nutrient] = { supply: 0, rdi: 0 }
      }
      nutrientTotals[row.nutrient].supply += row.nut_supply || 0
      nutrientTotals[row.nutrient].rdi += row.nut_rdi || 0
    })

    // Get display order from pars
    const displayOrder = pars?.nutrients?.to_display || Object.keys(nutrientTotals)
    
    const categories = displayOrder.map((nutrient) => {
      const nutrientConfig = pars?.nutrients?.nutrients?.[nutrient]
      return nutrientConfig?.short_name || nutrient
    })

    const data = displayOrder.map((nutrient) => {
      const total = nutrientTotals[nutrient]
      // Convert to thousands of people meeting RDI
      return total ? Math.round(total.rdi / 1000) : 0
    })

    return {
      categories,
      series: [{ name: t('nutrients.rdi'), data }],
    }
  }, [nutrientsData, pars, t])

  const options: ApexOptions = {
    chart: { 
      type: 'bar', 
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: habitatPalette,
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 4,
      },
    },
    dataLabels: { 
      enabled: true,
      formatter: (val: number) => `${val.toLocaleString()}k`,
    },
    legend: { show: false },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: t('nutrients.people_count'),
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()}k people`,
      },
    },
  }

  const pageTitle = pars?.nutrients?.title?.text ?? t('nav.nutrients')
  const treemapTitle = pars?.nutrients?.treemap_average?.title ?? t('nutrients.highlight')

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
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
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{treemapTitle}</h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <ReactApexChart 
                      options={options} 
                      series={chartData.series} 
                      type="bar" 
                      height={450} 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
