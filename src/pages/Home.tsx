import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function Home() {
  const { t } = useI18n()

  const donut = {
    series: [44, 33, 23],
    options: {
      chart: { type: 'donut' },
      labels: [t('home.trips'), t('home.revenue'), t('home.catch')],
      legend: { show: true },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
    } as ApexOptions,
  }

  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [-8.5569, 125.5603],
        zoom: 8,
        scrollWheelZoom: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current)
      L.marker([-8.56, 125.56]).addTo(mapRef.current).bindPopup(t('home.marker'))
    }
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.home')}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-cards">
            <div className="col-lg-8 col-xl-8">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('home.fishing_map')}</h3></div>
                <div className="card-body">
                  <div ref={containerRef} style={{ height: 420, width: '100%' }} />
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-4">
              <div className="row row-cards">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <ReactApexChart options={donut.options} series={donut.series} type="donut" height={220} />
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <ReactApexChart options={donut.options} series={donut.series} type="donut" height={220} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('home.summary_table')}</h3></div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-vcenter">
                      <thead>
                        <tr>
                          <th>{t('home.indicator')}</th>
                          <th>{t('home.value')}</th>
                          <th>{t('home.change')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>{t('home.trips')}</td><td>1,245</td><td><span className="text-green">+4.5%</span></td></tr>
                        <tr><td>{t('home.revenue')}</td><td>$12.3k</td><td><span className="text-green">+3.2%</span></td></tr>
                        <tr><td>{t('home.catch')}</td><td>42t</td><td><span className="text-yellow">+0.8%</span></td></tr>
                      </tbody>
                    </table>
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
