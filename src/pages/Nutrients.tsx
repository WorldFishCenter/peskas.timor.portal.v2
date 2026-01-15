import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { useData } from '../hooks'
import StackedBarTimeSeriesChart from '../components/charts/StackedBarTimeSeriesChart'
import TreemapChart from '../components/charts/TreemapChart'
import VariableDescriptions from '../components/VariableDescriptions'
import type { TreemapDataItem } from '../components/charts/TreemapChart'
import { habitatPalette } from '../constants/colors'
import { interpolateViridis } from 'd3-scale-chromatic'

export default function Nutrients() {
  const { t } = useI18n()
  const { data: nutrientsData, loading: nutrientsLoading } = useData('nutrients_aggregated')
  const { data: summaryData, loading: summaryLoading } = useData('summary_data')
  const { data: pars } = useData('pars')

  // Nutrient colors (viridis for 6 nutrients)
  const nutrientColors = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => interpolateViridis(i / 5)).map(c => c.substring(0, 7))
  }, [])

  // Nutrient names mapping
  const nutrientNames: Record<string, string> = {
    protein: 'Protein',
    zinc: 'Zinc',
    vitaminA: 'Vitamin A',
    calcium: 'Calcium',
    omega3: 'Omega-3',
    iron: 'Iron'
  }

  // Stacked bar time series for nutrients
  const nutrientTimeSeries = useMemo(() => {
    if (!nutrientsData?.month || !pars?.nutrients?.to_display) return []

    const displayOrder = pars.nutrients.to_display
    const seriesData: Record<string, Array<{ date: string; value: number }>> = {}

    // Initialize series for each nutrient
    displayOrder.forEach((nutrient: string) => {
      seriesData[nutrient] = []
    })

    // Group by date
    const dateMap: Record<string, Record<string, number>> = {}
    nutrientsData.month.forEach((row) => {
      if (!dateMap[row.date_bin_start]) {
        dateMap[row.date_bin_start] = {}
      }
      // Convert to thousands of people
      dateMap[row.date_bin_start][row.nutrient] = (row.nut_rdi || 0) / 1000
    })

    // Sort dates and populate series
    const sortedDates = Object.keys(dateMap).sort()
    sortedDates.forEach((date) => {
      displayOrder.forEach((nutrient: string) => {
        seriesData[nutrient].push({
          date,
          value: dateMap[date][nutrient] || 0
        })
      })
    })

    return displayOrder.map((nutrient: string) => ({
      name: nutrientNames[nutrient] || nutrient,
      data: seriesData[nutrient]
    }))
  }, [nutrientsData, pars])

  // Nutrient treemap (average per catch)
  const nutrientTreemapData: TreemapDataItem[] = useMemo(() => {
    if (!summaryData?.nutrients_per_catch || !pars?.nutrients?.to_display) return []

    const displayOrder = pars.nutrients.to_display
    const displayNames = displayOrder.map((n: string) => nutrientNames[n] || n)

    return summaryData.nutrients_per_catch
      .filter((item: any) => displayNames.includes(item.nutrient_names))
      .sort((a: any, b: any) => b.nut_rdi - a.nut_rdi)
      .map((item: any) => ({
        x: item.nutrient_names,
        y: Math.round(item.nut_rdi)
      }))
  }, [summaryData, pars])

  // Habitat nutrients treemap data
  const habitatNutrientsData = useMemo(() => {
    if (!summaryData?.nutrients_habitat || !pars?.nutrients?.to_display) return []

    const displayOrder = pars.nutrients.to_display
    const displayNames = displayOrder.map((n: string) => nutrientNames[n] || n)

    return summaryData.nutrients_habitat.filter((item: any) =>
      displayNames.includes(item.name)
    )
  }, [summaryData, pars])

  const pageTitle = pars?.nutrients?.title?.text ?? t('nav.nutrients')
  const highlightTitle = pars?.vars?.nut_rdi?.short_name ?? t('nutrients.highlight')

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t(pageTitle)}</h2>
            </div>
            {/* <div className="col-auto ms-auto d-print-none">
              <div className="btn-list">
                <MunicipalityFilter value={municipality} onChange={setMunicipality} />
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            {/* Nutrients Stacked Bar Time Series - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title fw-bold">{t(highlightTitle)}</h3>
                    <div className="card-subtitle">{t('nutrients.subtitle', { defaultValue: 'Number of people meeting RDI over time (thousands)' })}</div>
                  </div>
                </div>
                <div className="card-body">
                  {nutrientsLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <StackedBarTimeSeriesChart
                      series={nutrientTimeSeries}
                      height={400}
                      colors={nutrientColors}
                      yAxisTitle={t('nutrients.people_count', { defaultValue: 'People (thousands)' })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Nutrient Treemap (Average per Catch) - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title fw-bold">
                      {pars?.nutrients?.treemap_average?.title ?? t('nutrients.treemap_average')}
                    </h3>
                    {pars?.nutrients?.treemap_average?.description && (
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {pars.nutrients.treemap_average.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {summaryLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <TreemapChart
                      data={nutrientTreemapData}
                      colors={nutrientColors}
                      height={200}
                      unit="Ind."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Habitat Nutrients Treemap - Full width */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header border-0 pb-0">
                  <div>
                    <h3 className="card-title fw-bold">
                      {pars?.nutrients?.treemap_kg?.title ?? t('nutrients.treemap_kg')}
                    </h3>
                    {pars?.nutrients?.treemap_kg?.description && (
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {pars.nutrients.treemap_kg.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {summaryLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : habitatNutrientsData.length > 0 ? (
                    <TreemapChart
                      data={habitatNutrientsData}
                      colors={habitatPalette}
                      height={450}
                      unit="Ind."
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Variable Descriptions */}
            <div className="col">
              <VariableDescriptions
                variables={['nut_supply', 'nut_rdi']}
                heading={t(pars?.revenue?.description?.heading?.text || 'About this data')}
                intro={
                  <>
                    <p>{t(pars?.revenue?.description?.content?.text || '')}</p>
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
