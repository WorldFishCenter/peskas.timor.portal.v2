import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

export default function Nutrients() {
  const { t } = useI18n()
  const series = [{ name: t('nutrients.rdi'), data: [40, 55, 57, 52, 47, 60] }]
  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [
        t('nutrients.categories.protein'),
        t('nutrients.categories.iron'),
        t('nutrients.categories.zinc'),
        t('nutrients.categories.vita'),
        t('nutrients.categories.omega3'),
        t('nutrients.categories.vitd'),
      ],
    },
  }

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.nutrients')}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('nutrients.highlight')}</h3></div>
                <div className="card-body">
                  <ReactApexChart options={options} series={series} type="bar" height={300} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
