import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import CompositionSummaryTable from '../components/CompositionSummaryTable'
import RegionCompositionChart from '../components/charts/RegionCompositionChart'
import TaxaBarChart from '../components/charts/TaxaBarChart'
import VariableDescriptions from '../components/VariableDescriptions'
import MunicipalityFilter from '../components/MunicipalityFilter'
import { useI18n } from '../i18n'
import { useFilters } from '../context/FilterContext'
import { interpolateViridis } from 'd3-scale-chromatic'

export default function Composition() {
  const { t } = useI18n()
  const { municipality, setMunicipality } = useFilters()
  const { data: pars, loading: parsLoading } = useData('pars')
  const { data: taxaAggregated, loading: taxaLoading } = useData('taxa_aggregated')
  const { data: municipalTaxa, loading: municipalTaxaLoading } = useData('municipal_taxa')
  const { data: taxaNames } = useData('taxa_names')

  // Local filters for composition charts
  const [regionYear, setRegionYear] = useState<string>('all')
  const [taxaYear, setTaxaYear] = useState<string>(new Date().getFullYear().toString())
  const [taxaMunicipality, setTaxaMunicipality] = useState<string>('National')

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

  const pretitle = pars?.catch?.subtitle?.text ?? ''
  const title = pars?.composition?.title?.text ?? ''
  const percentHeading = pars?.composition?.percent?.heading?.text ?? ''
  const highlightHeading = pars?.composition?.highlight?.heading?.text ?? ''
  const descriptionHeading = pars?.revenue?.description?.heading?.text ?? ''
  const descriptionContent = pars?.revenue?.description?.content?.text ?? ''

  // Generate years for filters (current year back to 2018)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearList = []
    for (let year = currentYear; year >= 2018; year--) {
      yearList.push(year.toString())
    }
    return yearList
  }, [])

  // Get unique municipalities
  const municipalities = useMemo(() => {
    if (!municipalTaxa) return []
    return ['National', ...Array.from(new Set(municipalTaxa.map(d => d.region))).sort()]
  }, [municipalTaxa])

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
                  <div className="page-pretitle">{t(pretitle)}</div>
                  <h2 className="page-title">{t(title)}</h2>
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
            {/* Municipal Summary Table - Full width */}
            <div className="col-12">
              <CompositionSummaryTable />
            </div>

            {/* Region Composition Stacked Bar - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header d-flex align-items-center">
                  <div>
                    <h3 className="card-title fw-bold">{t(percentHeading)}</h3>
                    <div className="card-subtitle">{t('composition.stacked_subtitle', { defaultValue: 'Regional catch distribution by taxa' })}</div>
                  </div>
                  <div className="ms-auto">
                    <select
                      className="form-select"
                      value={regionYear}
                      onChange={(e) => setRegionYear(e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">{t('common.all_data', { defaultValue: 'All data' })}</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  {municipalTaxaLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                      </div>
                    </div>
                  ) : municipalTaxa && municipalTaxa.length > 0 ? (
                    <RegionCompositionChart
                      data={municipalTaxa}
                      taxaNameMap={taxaNameMap}
                      year={regionYear}
                      colors={taxaColors}
                      height={480}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '480px' }}>
                      <span className="text-muted">{t('common.no_data', { defaultValue: 'No data available' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Taxa Bar Highlight Chart - 7 columns */}
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm border-0">
                <div className="card-header d-flex align-items-center">
                  <div>
                    <h3 className="card-title fw-bold">{t(highlightHeading)}</h3>
                  </div>
                  <div className="ms-auto d-flex gap-2">
                    <select
                      className="form-select"
                      value={taxaYear}
                      onChange={(e) => setTaxaYear(e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select
                      className="form-select"
                      value={taxaMunicipality}
                      onChange={(e) => setTaxaMunicipality(e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      {municipalities.map(muni => (
                        <option key={muni} value={muni}>{muni}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  {(taxaLoading || municipalTaxaLoading) ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                      </div>
                    </div>
                  ) : taxaAggregated?.month && taxaAggregated.month.length > 0 ? (
                    <TaxaBarChart
                      data={taxaMunicipality === 'National' ? taxaAggregated.month : (municipalTaxa || [])}
                      taxaNameMap={taxaNameMap}
                      year={taxaYear}
                      municipality={taxaMunicipality === 'National' ? undefined : taxaMunicipality}
                      colors={taxaColors}
                      height={400}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                      <span className="text-muted">{t('common.no_data', { defaultValue: 'No data available' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variable Descriptions - Remaining columns */}
            <div className="col">
              <VariableDescriptions
                variables={['catch', 'landing_weight']}
                heading={t(descriptionHeading)}
                intro={
                  <>
                    <p>{t(descriptionContent)}</p>
                    <div className="hr-text">
                      {t(pars?.revenue?.description?.subheading?.text || 'Variable definitions')}
                    </div>
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
