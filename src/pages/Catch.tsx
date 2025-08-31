import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import { useState } from 'react'
import type { ApexOptions } from 'apexcharts'

export default function Catch() {
  const { t } = useI18n()
  const municipalities = ['all', 'dili', 'baucau', 'bobonaro']
  const [mun, setMun] = useState<string>('all')
  const series = [{ name: t('catch.series_name'), data: [10, 12, 9, 14, 11, 15, 13] }]
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul']
  const options: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { categories: months.map((m) => t(`common.months_short.${m}`)) },
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
                <div className="card-header"><h3 className="card-title">{t('catch.series', { })}</h3></div>
                <div className="card-body">
                  <ReactApexChart options={options} series={series} type="area" height={320} />
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-4">
              <div className="row row-cards">
                <div className="col-12">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('home.trips')}</div>
                        <div className="ms-auto"><div className="h2 mb-0">1,245</div></div>
                      </div>
                      <div className="progress progress-sm"><div className="progress-bar" style={{ width: '64%' }}></div></div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('home.catch')}</div>
                        <div className="ms-auto"><div className="h2 mb-0">42t</div></div>
                      </div>
                      <div className="progress progress-sm"><div className="progress-bar bg-green" style={{ width: '52%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('catch.table', {})}</h3></div>
                <div className="table-responsive">
                  <table className="table table-vcenter">
                    <thead><tr><th>{t('catch.month')}</th><th>{t('catch.catch_t')}</th><th>{t('home.trips')}</th></tr></thead>
                    <tbody>
                      <tr><td>{t('common.months_short.jan')}</td><td>10</td><td>120</td></tr>
                      <tr><td>{t('common.months_short.feb')}</td><td>12</td><td>134</td></tr>
                      <tr><td>{t('common.months_short.mar')}</td><td>9</td><td>101</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
