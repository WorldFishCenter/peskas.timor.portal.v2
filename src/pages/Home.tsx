import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import SummaryTable from '../components/SummaryTable'

export default function Home() {
  const { t } = useI18n()

  const donut = {
    series: [44, 33, 23],
    options: {
      chart: { type: 'donut' },
      labels: ['Trips', 'Revenue', 'Catch'],
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
      L.marker([-8.56, 125.56]).addTo(mapRef.current).bindPopup('Peskas Timor-Leste')
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
                <div className="card-header"><h3 className="card-title">Fishing map</h3></div>
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
                <div className="card-header"><h3 className="card-title">Summary table</h3></div>
                <div className="card-body">
                  <div className="table-responsive">
                    <SummaryTable />
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
