import { useI18n } from '../i18n'
import { useData } from '../hooks/useData'
import FishingActivityMap from '../components/FishingActivityMap'
import DonutChart from '../components/charts/DonutChart'
import { SummaryTable } from '../components/SummaryTable'
import { donutBlue, viridis5 } from '../constants/colors'

export default function Home() {
  const { t } = useI18n()
  const { data: pars, loading: parsLoading } = useData('pars')
  const { data: summaryData, loading: summaryLoading } = useData('summary_data')

  const loading = parsLoading || summaryLoading

  // Transform summary_data for donut charts
  const tripsData = summaryData?.n_surveys?.map((item) => ({
    label: item.Area,
    value: item.n,
  })) ?? []

  const revenueData = summaryData?.estimated_revenue?.map((item) => ({
    label: item.Area,
    value: item['Estimated revenue'],
  })) ?? []

  const fishData = summaryData?.estimated_tons?.map((item) => ({
    label: item.fish_group,
    value: item.tons,
  })) ?? []

  const introTitle = pars?.home?.intro?.title ?? ''
  const introContent = pars?.home?.intro?.content ?? ''
  const reportText = pars?.home?.report?.text ?? t('home.download_report')
  const tableTitle = pars?.home?.table?.title ?? t('home.summary_table')

  return (
    <>
      {/* Intro Section */}
      <div className="page-body">
        <div className="container-xl">
          <div className="row align-items-center">
            <div className="col-10">
              {loading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                </div>
              ) : (
                <>
                  <h3 className="h1">{introTitle}</h3>
                  <div className="markdown text-muted">
                    {introContent}
                  </div>
                  <div className="mt-3">
                    <a
                      href="https://storage.googleapis.com/public-timor/data_report.html"
                      className="btn btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-download me-1"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                        <path d="M7 11l5 5l5 -5" />
                        <path d="M12 4l0 12" />
                      </svg>
                      {reportText}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            {/* Fishing Map - Full width card */}
            <div className="col-12">
              <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-body p-0">
                  <FishingActivityMap height={650} />
                </div>
              </div>
            </div>

            {/* 3 Donut Charts Row */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <h3 className="card-title text-muted fw-bold">{t('home.trips')}</h3>
                </div>
                <div className="card-body">
                  <DonutChart data={tripsData} colors={donutBlue} height={280} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <h3 className="card-title text-muted fw-bold">{t('home.revenue')}</h3>
                </div>
                <div className="card-body">
                  <DonutChart data={revenueData} colors={donutBlue} height={280} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <h3 className="card-title text-muted fw-bold">{t('home.catch')}</h3>
                </div>
                <div className="card-body">
                  <DonutChart data={fishData} colors={viridis5} height={280} />
                </div>
              </div>
            </div>

            {/* Summary Table - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header">
                  <h3 className="card-title text-muted fw-bold">{tableTitle}</h3>
                </div>
                <div className="card-body">
                  <SummaryTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
