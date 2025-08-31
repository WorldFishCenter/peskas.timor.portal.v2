import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import { useState } from 'react'
import type { ApexOptions } from 'apexcharts'

export default function Revenue() {
  const { t } = useI18n()
  const municipalities = ['all', 'dili', 'baucau', 'bobonaro']
  const [mun, setMun] = useState<string>('all')
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul']
  const series = [{ name: t('revenue.series_name'), data: [2.1, 2.7, 2.3, 3.1, 2.9, 3.6, 3.2] }]
  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    dataLabels: { enabled: false },
    xaxis: { categories: months.map((m) => t(`common.months_short.${m}`)) },
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
                <div className="dropdown">
                  <a href="#" className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    {t(`common.municipalities.${mun}`)}
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    {municipalities.map((key) => (
                      <a
                        key={key}
                        href="#"
                        className={`dropdown-item${mun === key ? ' active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setMun(key) }}
                      >
                        {t(`common.municipalities.${key}`)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-cards">
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
                  <ReactApexChart options={{ chart: { type: 'treemap' } }} series={[{ data: [{ x: 'A', y: 11 }, { x: 'B', y: 7 }, { x: 'C', y: 5 }] }]} type="treemap" height={320} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
