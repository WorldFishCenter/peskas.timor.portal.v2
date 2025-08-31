import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

export default function Market() {
  const { t } = useI18n()

  const radar = {
    series: [{ name: 'Price', data: [80, 50, 30, 40, 100, 20] }],
    options: {
      chart: { type: 'radar', toolbar: { show: false } },
      xaxis: { categories: ['A', 'B', 'C', 'D', 'E', 'F'] },
    } as ApexOptions,
  }

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.market')}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-cards">
            <div className="col-lg-8 col-xl-8">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('market.price_per_kg')}</h3></div>
                <div className="card-body">
                  <ReactApexChart options={radar.options} series={radar.series} type="radar" height={320} />
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-4">
              <div className="row row-cards">
                <div className="col-12">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">Avg price</div>
                        <div className="ms-auto"><div className="h2 mb-0">$2.8</div></div>
                      </div>
                      <div className="progress progress-sm"><div className="progress-bar" style={{ width: '67%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
