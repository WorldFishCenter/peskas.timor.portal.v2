import { useI18n } from '../i18n'
import ReactApexChart from 'react-apexcharts'

export default function Composition() {
  const { t } = useI18n()

  const treemapSeries = [{ data: [
    { x: 'Species A', y: 29 },
    { x: 'Species B', y: 11 },
    { x: 'Species C', y: 9 },
    { x: 'Species D', y: 6 },
  ] }]

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.composition')}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-cards">
            <div className="col-12 col-lg-7">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('composition.percent_heading')}</h3></div>
                <div className="card-body">
                  <ReactApexChart options={{ chart: { type: 'treemap' } }} series={treemapSeries} type="treemap" height={360} />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card">
                <div className="card-header"><h3 className="card-title">{t('composition.highlight_heading')}</h3></div>
                <div className="card-body">
                  <div className="ratio ratio-4x3 bg-secondary-lt rounded"></div>
                </div>
              </div>
              <div className="card mt-2">
                <div className="card-header"><h3 className="card-title">{t('composition.description')}</h3></div>
                <div className="card-body text-muted">{t('composition.description_text')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

