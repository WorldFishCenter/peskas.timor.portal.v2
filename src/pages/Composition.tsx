import { useState } from 'react'
import { useData } from '../hooks/useData'
import TreemapChart from '../components/charts/TreemapChart'
import type { TreemapDataItem } from '../components/charts/TreemapChart'
import YearFilter from '../components/YearFilter'
import MunicipalityFilter from '../components/MunicipalityFilter'
import { habitatPalette } from '../constants/colors'
import { useI18n } from '../i18n'
import { useFilters } from '../context/FilterContext'

export default function Composition() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const { data: pars, loading: parsLoading } = useData('pars')
  const { data: taxaAggregated, loading: taxaLoading } = useData('taxa_aggregated')
  const { data: taxaNames } = useData('taxa_names')

  // Create taxa name lookup map
  const taxaNameMap: Record<string, string> = {}
  if (taxaNames) {
    taxaNames.forEach((t) => {
      taxaNameMap[t.grouped_taxa] = t.grouped_taxa_names
    })
  }

  // Aggregate taxa data for treemap - sum catch by grouped_taxa, filtered by year
  const treemapData: TreemapDataItem[] = []
  if (taxaAggregated?.month) {
    const catchByTaxa: Record<string, number> = {}
    taxaAggregated.month
      .filter((row) => selectedYear === 'all' || row.year === selectedYear)
      .forEach((row) => {
        const taxa = row.grouped_taxa
        catchByTaxa[taxa] = (catchByTaxa[taxa] || 0) + (row.catch || 0)
      })
    Object.entries(catchByTaxa)
      .sort((a, b) => b[1] - a[1])
      .forEach(([taxa, total]) => {
        const name = taxaNameMap[taxa] || taxa
        treemapData.push({ x: name, y: Math.round(total / 1000) }) // Convert to tons
      })
  }

  const pretitle = pars?.catch?.subtitle?.text ?? ''
  const title = pars?.composition?.title?.text ?? ''
  const percentHeading = pars?.composition?.percent?.heading?.text ?? ''
  const highlightHeading = pars?.composition?.highlight?.heading?.text ?? ''
  const tableHeading = pars?.composition?.table?.heading?.text ?? ''
  const tableFooter = pars?.composition?.table?.footer?.text ?? ''
  const descriptionHeading = pars?.revenue?.description?.heading?.text ?? ''
  const descriptionContent = pars?.revenue?.description?.content?.text ?? ''

  return (
    <>
      {/* Page Header */}
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              {parsLoading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-3"></span>
                </div>
              ) : (
                <>
                  <div className="page-pretitle">{pretitle}</div>
                  <h2 className="page-title">{title}</h2>
                </>
              )}
            </div>
            <div className="col-auto ms-auto d-print-none">
              <div className="btn-list">
                <MunicipalityFilter value={municipality} onChange={setMunicipality} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            {/* Taxa Treemap - Full width */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{tableHeading}</h3>
                  <div className="card-actions">
                    <YearFilter value={selectedYear} onChange={setSelectedYear} />
                  </div>
                </div>
                <div className="card-body">
                  {taxaLoading ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '20rem' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                      </div>
                    </div>
                  ) : (
                    <TreemapChart
                      data={treemapData}
                      title={t('composition.treemap_title')}
                      colors={habitatPalette}
                      height="20rem"
                    />
                  )}
                  <div className="small text-muted mt-2">{tableFooter}</div>
                </div>
              </div>
            </div>

            {/* Region Composition Stacked Bar - Full width */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{percentHeading}</h3>
                  <div className="card-actions">
                    <YearFilter value={selectedYear} onChange={setSelectedYear} />
                  </div>
                </div>
                <div className="card-body" style={{ height: '30rem' }}>
                  {/* TODO: StackedBarChart component for region composition */}
                  <div className="d-flex align-items-center justify-content-center h-100 bg-secondary-lt rounded">
                    <span className="text-muted">{t('composition.placeholder_region')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxa Bar Highlight Chart - 7 columns */}
            <div className="col-12 col-lg-7">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{highlightHeading}</h3>
                </div>
                <div className="card-body">
                  {/* TODO: TaxaBarChart component */}
                  <div className="ratio ratio-4x3 bg-secondary-lt rounded d-flex align-items-center justify-content-center">
                    <span className="text-muted">{t('composition.placeholder_taxa')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Variable Descriptions - Remaining columns */}
            <div className="col-12 col-lg-5">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{descriptionHeading}</h3>
                </div>
                <div className="card-body">
                  <div className="markdown text-muted">
                    {descriptionContent}
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
