import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import TreemapChart from '../components/charts/TreemapChart'
import RegionCompositionChart from '../components/charts/RegionCompositionChart'
import TaxaBarChart from '../components/charts/TaxaBarChart'
import type { TreemapDataItem } from '../components/charts/TreemapChart'
import YearFilter from '../components/YearFilter'
import MunicipalityFilter from '../components/MunicipalityFilter'
import { habitatPalette } from '../constants/colors'
import { useI18n } from '../i18n'
import { useFilters } from '../context/FilterContext'
import { interpolateViridis } from 'd3-scale-chromatic'

export default function Composition() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const { data: pars, loading: parsLoading } = useData('pars')
  const { data: taxaAggregated, loading: taxaLoading } = useData('taxa_aggregated')
  const { data: municipalTaxa, loading: municipalTaxaLoading } = useData('municipal_taxa')
  const { data: taxaNames } = useData('taxa_names')

  // Generate viridis colors for taxa
  const taxaColors = useMemo(() => {
    if (!taxaAggregated?.month) return []
    const allTaxa = [...new Set(taxaAggregated.month.map(r => r.grouped_taxa))]
    return Array.from({ length: allTaxa.length }, (_, i) =>
      interpolateViridis(i / Math.max(allTaxa.length - 1, 1))
    ).map(c => c.substring(0, 7))
  }, [taxaAggregated])

  // Create taxa name lookup map
  const taxaNameMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}
    if (taxaNames) {
      taxaNames.forEach((t) => {
        map[t.grouped_taxa] = t.grouped_taxa_names
      })
    }
    return map
  }, [taxaNames])

  // Aggregate taxa data for treemap - sum catch by grouped_taxa, filtered by year and municipality
  const treemapData: TreemapDataItem[] = useMemo(() => {
    const result: TreemapDataItem[] = []
    
    // Use municipal_taxa when filtering by municipality, otherwise use taxa_aggregated
    if (municipality !== 'all' && municipalTaxa) {
      const catchByTaxa: Record<string, number> = {}
      municipalTaxa
        .filter((row) => {
          const regionMatch = row.region.toLowerCase() === municipality.toLowerCase()
          const yearMatch = selectedYear === 'all' || row.year === selectedYear
          return regionMatch && yearMatch
        })
        .forEach((row) => {
          const taxa = row.grouped_taxa
          catchByTaxa[taxa] = (catchByTaxa[taxa] || 0) + (row.catch || 0)
        })
      Object.entries(catchByTaxa)
        .sort((a, b) => b[1] - a[1])
        .forEach(([taxa, total]) => {
          const name = taxaNameMap[taxa] || taxa
          result.push({ x: name, y: Math.round(total / 1000) })
        })
    } else if (taxaAggregated?.month) {
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
          result.push({ x: name, y: Math.round(total / 1000) })
        })
    }
    
    return result
  }, [taxaAggregated, municipalTaxa, taxaNameMap, selectedYear, municipality])

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
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title text-muted fw-bold">{tableHeading}</h3>
                    <div className="card-subtitle">{t('composition.treemap_subtitle', { defaultValue: 'Catch volume by fish group' })}</div>
                    {tableFooter && <div className="text-muted small mt-2">{tableFooter}</div>}
                  </div>
                  <div className="card-actions ms-auto">
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
                      colors={habitatPalette}
                      height={450}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Region Composition Stacked Bar - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title text-muted fw-bold">{percentHeading}</h3>
                    <div className="card-subtitle">{t('composition.stacked_subtitle', { defaultValue: 'Regional catch distribution by taxa' })}</div>
                  </div>
                  <div className="card-actions ms-auto">
                    <YearFilter value={selectedYear} onChange={setSelectedYear} />
                  </div>
                </div>
                <div className="card-body">
                  {municipalTaxaLoading ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '28rem' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                      </div>
                    </div>
                  ) : municipalTaxa && municipalTaxa.length > 0 ? (
                    <RegionCompositionChart
                      data={municipalTaxa}
                      taxaNameMap={taxaNameMap}
                      year={selectedYear}
                      colors={taxaColors}
                      height={450}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-secondary-lt rounded" style={{ height: '28rem' }}>
                      <span className="text-muted">{t('common.no_data', { defaultValue: 'No data available' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Taxa Bar Highlight Chart - 7 columns */}
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <h3 className="card-title text-muted fw-bold">{highlightHeading}</h3>
                </div>
                <div className="card-body">
                  {taxaLoading ? (
                    <div className="ratio ratio-4x3 bg-secondary-lt rounded d-flex align-items-center justify-content-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                      </div>
                    </div>
                  ) : taxaAggregated?.month && taxaAggregated.month.length > 0 ? (
                    <TaxaBarChart
                      data={taxaAggregated.month}
                      taxaNameMap={taxaNameMap}
                      year={selectedYear}
                      colors={taxaColors}
                      height={400}
                    />
                  ) : (
                    <div className="ratio ratio-4x3 bg-secondary-lt rounded d-flex align-items-center justify-content-center">
                      <span className="text-muted">{t('common.no_data', { defaultValue: 'No data available' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variable Descriptions - Remaining columns */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <h3 className="card-title text-muted fw-bold">{descriptionHeading}</h3>
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
