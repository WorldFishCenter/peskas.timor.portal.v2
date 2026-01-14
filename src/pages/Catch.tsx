import { useI18n } from '../i18n'
import { useState, useMemo } from 'react'
import MunicipalityFilter from '../components/MunicipalityFilter'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import { useData } from '../hooks'
import type { Municipality } from '../constants'

export default function Catch() {
  const { t } = useI18n()
  const [mun, setMun] = useState<Municipality>('all')
  const { data: aggregated, loading, error } = useData('aggregated')

  const chartSeries = useMemo(() => {
    if (!aggregated?.month) return []
    const sortedData = [...aggregated.month].sort(
      (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
    )
    return [
      {
        name: t('nav.catch'),
        data: sortedData.map((row) => ({
          date: row.date_bin_start,
          value: (row.catch ?? 0) / 1000,
        })),
      },
    ]
  }, [aggregated, t])

  const totals = useMemo(() => {
    if (!aggregated?.month) return { catch: 0, landings: 0 }
    const total = aggregated.month.reduce(
      (acc, row) => ({
        catch: acc.catch + (row.catch ?? 0),
        landings: acc.landings + (row.n_landings ?? 0),
      }),
      { catch: 0, landings: 0 }
    )
    return {
      catch: (total.catch / 1000).toFixed(0),
      landings: total.landings.toLocaleString(),
    }
  }, [aggregated])

  if (error) {
    return <div className="alert alert-danger">{error.message}</div>
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
                <MunicipalityFilter value={mun} onChange={setMun} />
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
                <div className="card-header">
                  <h3 className="card-title">{t('catch.series', {})}</h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <TimeSeriesChart
                      series={chartSeries}
                      height={320}
                      yAxisTitle={t('catch.catch_t')}
                    />
                  )}
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
                        <div className="ms-auto">
                          <div className="h2 mb-0">{loading ? '...' : totals.landings}</div>
                        </div>
                      </div>
                      <div className="progress progress-sm">
                        <div className="progress-bar" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="subheader">{t('home.catch')}</div>
                        <div className="ms-auto">
                          <div className="h2 mb-0">{loading ? '...' : `${totals.catch}t`}</div>
                        </div>
                      </div>
                      <div className="progress progress-sm">
                        <div className="progress-bar bg-green" style={{ width: '52%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('catch.table', {})}</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-vcenter">
                    <thead>
                      <tr>
                        <th>{t('catch.month')}</th>
                        <th>{t('catch.catch_t')}</th>
                        <th>{t('home.trips')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="text-center">
                            <div className="spinner-border spinner-border-sm" />
                          </td>
                        </tr>
                      ) : (
                        aggregated?.month
                          ?.slice(0, 12)
                          .map((row) => (
                            <tr key={row.date_bin_start}>
                              <td>{row.month}</td>
                              <td>{((row.catch ?? 0) / 1000).toFixed(1)}</td>
                              <td>{row.n_landings?.toLocaleString()}</td>
                            </tr>
                          ))
                      )}
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
