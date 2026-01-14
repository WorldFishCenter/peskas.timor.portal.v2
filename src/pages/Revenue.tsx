import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import MunicipalityFilter from '../components/MunicipalityFilter'
import { MONTHS_SHORT } from '../constants'
import { useFilters } from '../context/FilterContext'
import { revenueBarColors, habitatPalette } from '../constants/colors'

export default function Revenue() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const months = MONTHS_SHORT.slice(0, 7)
  const series = [{ name: t('revenue.series_name'), data: [2.1, 2.7, 2.3, 3.1, 2.9, 3.6, 3.2] }]
  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: revenueBarColors,
    dataLabels: { enabled: false },
    xaxis: { categories: months.map((m) => t(`common.months_short.${m}`)) },
  }
  
  const treemapOptions: ApexOptions = {
    chart: { type: 'treemap' },
    colors: habitatPalette,
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
                <div className="card-body">
                  <ReactApexChart options={options} series={series} type="bar" height={320} />
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <ReactApexChart options={treemapOptions} series={[{ data: [{ x: 'A', y: 11 }, { x: 'B', y: 7 }, { x: 'C', y: 5 }] }]} type="treemap" height={320} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
