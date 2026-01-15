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

  // Nutrient names mapping - use translations
  const nutrientNames: Record<string, string> = useMemo(() => ({
    protein: t('nutrients.categories.protein'),
    zinc: t('nutrients.categories.zinc'),
    vitaminA: t('nutrients.categories.vita'),
    calcium: t('nutrients.categories.calcium'),
    omega3: t('nutrients.categories.omega3'),
    iron: t('nutrients.categories.iron'),
    vitd: t('nutrients.categories.vitd')
  }), [t])

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
  }, [nutrientsData, pars, nutrientNames])

  // Nutrient treemap (average per catch)
  const nutrientTreemapData: TreemapDataItem[] = useMemo(() => {
    if (!summaryData?.nutrients_per_catch || !pars?.nutrients?.to_display) return []

    const displayOrder = pars.nutrients.to_display
    // Create a reverse map: English display name -> key, and key -> translated name
    const englishToKeyMap = new Map<string, string>()
    const keyToTranslatedMap = new Map<string, string>()
    
    displayOrder.forEach((key: string) => {
      const translatedName = nutrientNames[key] || key
      keyToTranslatedMap.set(key, translatedName)
      // Also map English names from pars if available
      if (pars.nutrients?.nutrients?.[key]?.short_name) {
        const englishName = pars.nutrients.nutrients[key].short_name
        englishToKeyMap.set(englishName, key)
      }
      // Map the key itself
      englishToKeyMap.set(key, key)
    })

    return summaryData.nutrients_per_catch
      .filter((item: any) => {
        // Check if nutrient_names matches a key OR an English display name
        const key = englishToKeyMap.get(item.nutrient_names) || item.nutrient_names
        return displayOrder.includes(key)
      })
      .sort((a: any, b: any) => b.nut_rdi - a.nut_rdi)
      .map((item: any) => {
        // Find the key (either direct match or via English name)
        const key = englishToKeyMap.get(item.nutrient_names) || item.nutrient_names
        // Get translated name for current language
        const displayName = keyToTranslatedMap.get(key) || item.nutrient_names
        return {
          x: displayName,
          y: Math.round(item.nut_rdi)
        }
      })
  }, [summaryData, pars, nutrientNames])

  // Habitat nutrients treemap data
  const habitatNutrientsData = useMemo(() => {
    if (!summaryData?.nutrients_habitat || !pars?.nutrients?.to_display) return []

    const displayOrder = pars.nutrients.to_display
    // Create a reverse map: English display name -> key, and key -> translated name
    const englishToKeyMap = new Map<string, string>()
    const keyToTranslatedMap = new Map<string, string>()
    
    displayOrder.forEach((key: string) => {
      const translatedName = nutrientNames[key] || key
      keyToTranslatedMap.set(key, translatedName)
      // Also map English names from pars if available
      if (pars.nutrients?.nutrients?.[key]?.short_name) {
        const englishName = pars.nutrients.nutrients[key].short_name
        englishToKeyMap.set(englishName, key)
      }
      // Map the key itself
      englishToKeyMap.set(key, key)
    })

    return summaryData.nutrients_habitat
      .filter((item: any) => {
        // Check if name matches a key OR an English display name
        const key = englishToKeyMap.get(item.name) || item.name
        return displayOrder.includes(key)
      })
      .map((item: any) => {
        // Find the key (either direct match or via English name)
        const key = englishToKeyMap.get(item.name) || item.name
        // Get translated name for current language
        const displayName = keyToTranslatedMap.get(key) || item.name
        return {
          ...item,
          name: displayName
        }
      })
  }, [summaryData, pars, nutrientNames])

  // Always use translations - translations are the single source of truth
  const pageTitle = t('nutrients.title')
  const highlightTitle = t('nutrients.highlight')

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
                      {t('nutrients.treemap_average')}
                    </h3>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                      {t('nutrients.treemap_average_description')}
                    </div>
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
                      {t('nutrients.treemap_kg')}
                    </h3>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                      {t('nutrients.treemap_kg_description')}
                    </div>
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
                variables={['nut_rdi']}
                heading={t('revenue.description_heading')}
                intro={
                  <>
                    <p>{t('revenue.description_content')}</p>
                    <div className="hr-text">
                      {t('revenue.description_subheading')}
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
