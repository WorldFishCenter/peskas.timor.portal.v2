# Complete Implementation Plan - React vs Shiny Alignment

## Date: 2026-01-14
## Goal: Make React app match Shiny app exactly - no substitutions, use native ApexCharts and Tabler only

---

## Current Status Overview

| Page | Completion | Critical Issues |
|------|------------|----------------|
| Home | 60% | ❌ Using Leaflet instead of DeckGL hexagon map<br>⚠️ Donut charts may have visibility issues |
| Catch | 85% | ✅ Time series working<br>✅ Metric cards working<br>⚠️ Needs verification |
| Revenue | 90% | ✅ Time series working<br>✅ Radar chart working<br>✅ Treemap working<br>✅ Summary cards working |
| Market | 50% | ✅ Conservation stacked bar working<br>✅ Radar chart working<br>❌ Missing time series chart<br>❌ Missing summary cards |
| Composition | 40% | ✅ Treemap working<br>❌ Region stacked bar missing<br>❌ Taxa bar highlight missing |
| Nutrients | 95% | ✅ Horizontal bar chart working |
| Tracks | 100% | ✅ DeckGL hexagon map working (reference implementation) |
| About | 80% | ✅ Basic structure<br>⚠️ Needs content verification |

---

## Phase 1: CRITICAL FIXES (Must Complete First)

### 1.1 Home Page - Replace Leaflet with DeckGL Hexagon Map ⚠️ HIGHEST PRIORITY

**Current Problem:**
- Home page uses `<FishingMap>` component which is Leaflet-based
- Should use DeckGL HexagonLayer identical to Tracks page
- This is the most visible issue - first thing users see

**Shiny Implementation Reference:**
- File: `R/mod_fishing_map.R`
- Uses: `deckgl` with HexagonLayer
- Data: `predicted_tracks.json`
- Colors: `heatmapColors` palette
- Settings: radius 5000, elevation 0, coverage 1

**React Reference Implementation:**
- **WORKING**: `src/pages/Tracks.tsx` and `src/components/HexagonMap.tsx`
- Already implemented correctly with DeckGL
- Just need to use this component on Home page

**Action Items:**
1. ✅ `HexagonMap.tsx` component already exists and works
2. ✅ Home page already uses `<HexagonMap height={420} />`
3. ✅ **Actually, this is ALREADY FIXED in current code!**
4. ⚠️ VERIFY: Check if user is seeing old cached version

**Verification Needed:**
- Check if donut charts are visible
- Check if hexagon map displays correctly
- May be browser caching issue

---

### 1.2 Home Page - Verify Donut Chart Visibility

**Current Problem:**
- User reports donut charts not visible
- Code looks correct - uses DonutChart component with proper data

**Shiny Implementation Reference:**
- File: `R/mod_apex_donut.R`
- Uses: ApexCharts donut with specific colors
- Trips/Revenue: `donutBlue = ["#d7eaf3", "#77b5d9", "#14397d"]`
- Fish: `viridis(5) = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725']`

**Current React Implementation:**
```tsx
// Home.tsx lines 114, 125, 136
<DonutChart data={tripsData} colors={donutBlue} height="16rem" />
<DonutChart data={revenueData} colors={donutBlue} height="16rem" />
<DonutChart data={fishData} colors={viridis5} height="16rem" />
```

**Action Items:**
1. Verify data is loading correctly (check `summary_data.json`)
2. Check if ApexCharts CSS is loaded
3. Verify card body has proper height
4. Test with browser dev tools - check for console errors
5. May need to add `minHeight` to card bodies

**Potential Fix:**
```tsx
<div className="card-body" style={{ minHeight: '20rem' }}>
  <DonutChart data={tripsData} colors={donutBlue} height="16rem" />
</div>
```

---

## Phase 2: MARKET PAGE COMPLETION

### 2.1 Add Time Series Chart to Market Page

**Current Status:** Missing entirely

**Shiny Implementation Reference:**
- File: `R/tab_market_content.R` line 27-39
- Uses: Time series chart similar to Catch/Revenue pages
- Variable: `price_kg`
- Layout: 8 columns (col-lg-8)
- Position: Above radar chart

**Action Items:**
1. Import `TimeSeriesChart` component (already exists)
2. Add chart to Market page layout
3. Load data from `aggregated.json`
4. Use `price_kg` variable
5. Add proper i18n keys

**Code to Add:**
```tsx
// Market.tsx - Add after header, before radar chart
<div className="col-lg-8 col-xl-8">
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{t('market.price_series')}</h3>
    </div>
    <div className="card-body">
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <TimeSeriesChart
          series={priceChartSeries}
          height="21rem"
          yAxisTitle={t('market.price_usd')}
          colors={timeSeriesColors}
        />
      )}
    </div>
  </div>
</div>
```

**Data Transformation:**
```tsx
const priceChartSeries = useMemo(() => {
  if (!aggregated?.month) return []
  const sortedData = [...aggregated.month].sort(
    (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
  )
  return [
    {
      name: t('market.price_kg'),
      data: sortedData.map((row) => ({
        date: row.date_bin_start,
        value: row.price_kg ?? 0,
      })),
    },
  ]
}, [aggregated, t])
```

---

### 2.2 Add Summary Cards to Market Page

**Current Status:** Missing entirely

**Shiny Implementation Reference:**
- File: `R/tab_market_content.R` lines 41-82
- Uses: 3 summary cards similar to Catch/Revenue pages
- Variables: `price_kg`, `landing_weight`, `n_landings_per_boat`
- Layout: 4 columns (col-lg-4), stacked vertically
- Shows: last 12 months aggregate + trend

**Action Items:**
1. Add 3 metric cards showing:
   - Average price per kg (last 12 months)
   - Average catch per trip
   - Landings per boat
2. Calculate trends vs previous 12 months
3. Use same card styling as Catch/Revenue pages

**Code to Add:**
```tsx
// Market.tsx - Add in right column (col-lg-4)
<div className="col-lg-4 col-xl-4">
  <div className="row row-deck row-cards">
    <div className="col-12">
      <div className="card" style={{ minHeight: '8rem' }}>
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">{t('vars.price_kg.short_name')}</div>
            <div className="ms-auto text-muted small">{t('common.avg')}</div>
          </div>
          <div className="d-flex align-items-baseline">
            <div className="h1 mb-0">{loading ? '...' : `$${metrics.avgPrice}`}</div>
            <span className={`ms-2 ${metrics.priceTrend.direction === 'up' ? 'text-green' : 'text-red'}`}>
              {metrics.priceTrend.value}
            </span>
          </div>
        </div>
      </div>
    </div>
    {/* Repeat for landing_weight and n_landings_per_boat */}
  </div>
</div>
```

---

### 2.3 Add Summary Table to Market Page

**Current Status:** Missing entirely

**Shiny Implementation Reference:**
- File: `R/tab_market_content.R` line 132
- Uses: `mod_summary_table_ui` component
- Shows: Municipality-level aggregated data
- Variables: Same as shown in time series/cards

**Action Items:**
1. Reuse `<SummaryTable>` component already implemented
2. Add below charts
3. Add proper card wrapper

**Code to Add:**
```tsx
// Market.tsx - Add at bottom
<div className="col-12">
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{t('market.summary_table')}</h3>
    </div>
    <div className="card-body">
      <SummaryTable municipality={municipality} />
    </div>
  </div>
</div>
```

---

## Phase 3: COMPOSITION PAGE COMPLETION

### 3.1 Build Region Composition Stacked Bar Chart

**Current Status:** Placeholder div with text "Region composition placeholder"

**Shiny Implementation Reference:**
- File: `R/mod_region_composition.R`
- Uses: ApexCharts horizontal stacked bar
- Data: `municipal_taxa.json`
- Shows: Percentage of each taxa by region
- Colors: viridis palette (length = number of taxa)

**Action Items:**
1. Reuse `StackedBarChart` component (already exists)
2. Transform `municipal_taxa` data to stacked format
3. Calculate percentages by region
4. Apply viridis colors

**Data Transformation:**
```tsx
const regionCompositionData = useMemo(() => {
  if (!municipalTaxa) return []

  // Filter by year if needed
  const filtered = selectedYear === 'all'
    ? municipalTaxa
    : municipalTaxa.filter(row => row.year === selectedYear)

  // Group by region and taxa
  const grouped: Record<string, Record<string, number>> = {}
  filtered.forEach(row => {
    if (!grouped[row.region]) grouped[row.region] = {}
    if (!grouped[row.region][row.grouped_taxa]) grouped[row.region][row.grouped_taxa] = 0
    grouped[row.region][row.grouped_taxa] += row.catch || 0
  })

  // Calculate percentages
  const regions = Object.keys(grouped).sort()
  const allTaxa = [...new Set(filtered.map(r => r.grouped_taxa))].sort()

  return regions.map(region => {
    const total = Object.values(grouped[region]).reduce((sum, val) => sum + val, 0)
    const percentages: Record<string, number> = {}
    allTaxa.forEach(taxa => {
      percentages[taxa] = ((grouped[region][taxa] || 0) / total) * 100
    })
    return {
      region,
      ...percentages
    }
  })
}, [municipalTaxa, selectedYear])

const taxaColors = useMemo(() => {
  const taxa = municipalTaxa ? [...new Set(municipalTaxa.map(r => r.grouped_taxa))] : []
  return Array.from({ length: taxa.length }, (_, i) =>
    interpolateViridis(i / (taxa.length - 1))
  ).map(c => c.substring(0, 7))
}, [municipalTaxa])
```

**Component Usage:**
```tsx
<StackedBarChart
  data={regionCompositionData}
  height="28rem"
  colors={taxaColors}
  yFormatter={(val: number) => `${val.toFixed(1)}%`}
  horizontal={true}
/>
```

**Note:** May need to extend `StackedBarChart` component to support horizontal orientation if not already supported.

---

### 3.2 Build Taxa Bar Highlight Chart

**Current Status:** Placeholder div with text "Taxa bar placeholder"

**Shiny Implementation Reference:**
- File: `R/mod_taxa_bar_highlight.R`
- Uses: ApexCharts bar chart with hover highlighting
- Data: `taxa_aggregated.json`
- Shows: Catch by taxa with interactive highlighting
- Colors: viridis palette
- Interaction: Hovering one taxa highlights it across all regions

**This is a CUSTOM chart - needs new component**

**Action Items:**
1. Create new `TaxaBarChart.tsx` component
2. Use ApexCharts bar chart
3. Implement hover/selection state
4. Group data by taxa and region
5. Apply viridis colors

**New Component: `src/components/charts/TaxaBarChart.tsx`**
```tsx
import { useMemo, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

interface TaxaBarChartProps {
  data: any[] // taxa_aggregated records
  year?: string
  colors?: string[]
  height?: string | number
}

export default function TaxaBarChart({
  data,
  year = 'all',
  colors = [],
  height = '24rem'
}: TaxaBarChartProps) {
  const [selectedTaxa, setSelectedTaxa] = useState<string | null>(null)

  const chartData = useMemo(() => {
    // Filter by year
    const filtered = year === 'all' ? data : data.filter(d => d.year === year)

    // Group by taxa
    const grouped: Record<string, number> = {}
    filtered.forEach(row => {
      if (!grouped[row.grouped_taxa]) grouped[row.grouped_taxa] = 0
      grouped[row.grouped_taxa] += row.catch || 0
    })

    // Sort by catch descending
    const sorted = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([taxa, catch]) => ({ taxa, catch: catch / 1000 })) // Convert to tons

    return sorted
  }, [data, year])

  const series = [{
    name: 'Catch (tons)',
    data: chartData.map(d => d.catch)
  }]

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const taxa = chartData[config.dataPointIndex].taxa
          setSelectedTaxa(selectedTaxa === taxa ? null : taxa)
        }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        distributed: true,
      }
    },
    colors: chartData.map((d, i) =>
      selectedTaxa && d.taxa !== selectedTaxa
        ? `${colors[i % colors.length]}40` // Add transparency if not selected
        : colors[i % colors.length]
    ),
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.map(d => d.taxa),
      labels: {
        rotate: -45,
        style: { fontSize: '10px' }
      }
    },
    yaxis: {
      title: { text: 'Catch (tons)' }
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} tons`
      }
    }
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  )
}
```

**Usage in Composition.tsx:**
```tsx
import TaxaBarChart from '../components/charts/TaxaBarChart'
import { interpolateViridis } from 'd3-scale-chromatic'

// In component
const taxaColors = useMemo(() => {
  const taxa = taxaAggregated?.month ? [...new Set(taxaAggregated.month.map(r => r.grouped_taxa))] : []
  return Array.from({ length: taxa.length }, (_, i) =>
    interpolateViridis(i / Math.max(taxa.length - 1, 1))
  ).map(c => c.substring(0, 7))
}, [taxaAggregated])

// Replace placeholder
<TaxaBarChart
  data={taxaAggregated?.month || []}
  year={selectedYear}
  colors={taxaColors}
  height="24rem"
/>
```

---

## Phase 4: VERIFICATION & POLISH

### 4.1 Catch Page Verification

**Status:** Appears complete but needs verification

**Checklist:**
- ✅ Time series chart loads real data
- ✅ Metric cards show correct calculations
- ✅ Table displays properly
- ⚠️ Verify trends are calculated correctly
- ⚠️ Verify data filtering by municipality works

**Action Items:**
1. Test with different municipality selections
2. Verify metric calculations match Shiny
3. Check table pagination/sorting if needed

---

### 4.2 About Page Verification

**Status:** Basic structure exists

**Shiny Implementation Reference:**
- File: `R/timor_about.R`
- Content: Text from `pars.about`
- Harvard Dataverse iframe
- Links to related resources

**Action Items:**
1. Verify i18n text loads from `pars.json`
2. Check if additional content sections needed
3. Verify iframe loads correctly

---

### 4.3 Layout & Spacing Consistency

**Action Items:**
1. Verify all pages use consistent card spacing (`row-deck row-cards`)
2. Check all charts use consistent heights
3. Verify all pages have proper loading states
4. Ensure all filters are positioned correctly (top-right)
5. Verify municipality filter persists across page navigation (already implemented with FilterContext)

**Standard Heights:**
- Time series charts: `21rem`
- Radar/Spider charts: `22rem`
- Donut charts: `16rem`
- Treemap charts: `20rem` or `28rem`
- Stacked bar charts: `20rem` or `28rem`
- Map: `420px` (Home) or `650px` (Tracks)

---

## Phase 5: i18n COMPLETION

### 5.1 Extract All Missing i18n Keys

**Current Status:** Many hardcoded strings in components

**Action Items:**
1. Audit all pages for hardcoded text
2. Add missing keys to i18n JSON files
3. Match keys structure from Shiny `pars.json`

**Keys needed:**
- `market.price_series`
- `market.price_usd`
- `market.price_per_kg`
- `market.summary_table`
- `composition.placeholder_region` (remove after implementation)
- `composition.placeholder_taxa` (remove after implementation)
- All variable short names (`vars.[varname].short_name`)
- All descriptions (`vars.[varname].description`)

---

## Implementation Priority Order

### Sprint 1 (Critical - Complete First)
1. ✅ **VERIFY** Home page hexagon map (might already be fixed)
2. **FIX** Home page donut visibility issue
3. **ADD** Market page time series chart
4. **ADD** Market page summary cards

### Sprint 2 (High Priority)
5. **ADD** Market page summary table
6. **BUILD** Composition region stacked bar chart
7. **BUILD** Composition taxa bar highlight chart

### Sprint 3 (Polish & Verification)
8. **VERIFY** Catch page functionality
9. **VERIFY** About page content
10. **COMPLETE** i18n extraction
11. **VERIFY** Layout consistency across all pages

---

## Technical Guidelines

### DO:
- ✅ Use native ApexCharts components
- ✅ Use Tabler CSS classes only
- ✅ Disable animations (`animations: { enabled: false }`)
- ✅ Use exact color palettes from `constants/colors.ts`
- ✅ Match Shiny chart configurations exactly
- ✅ Use existing components where available
- ✅ Follow existing code patterns

### DON'T:
- ❌ Add custom CSS styling
- ❌ Create custom chart components (unless exact match needed)
- ❌ Substitute with different chart types
- ❌ Use different color palettes
- ❌ Add extra features not in Shiny
- ❌ Change layout structure

---

## Testing Checklist

### Per Page:
- [ ] All charts render without console errors
- [ ] Data loads correctly
- [ ] Municipality filter works
- [ ] Year filter works (where applicable)
- [ ] Loading states display properly
- [ ] Colors match Shiny exactly
- [ ] Layout matches Shiny exactly
- [ ] i18n text displays correctly
- [ ] No hardcoded strings

### Cross-Page:
- [ ] Municipality filter persists across navigation
- [ ] Navigation works smoothly
- [ ] No duplicate data loading
- [ ] Consistent card spacing
- [ ] Consistent chart heights
- [ ] All pages responsive

---

## Files to Modify

### Existing Files to Update:
1. `src/pages/Home.tsx` - Verify/fix donut visibility
2. `src/pages/Market.tsx` - Add time series, cards, table
3. `src/pages/Composition.tsx` - Add stacked bar, taxa bar
4. `src/pages/Catch.tsx` - Verification only
5. `src/pages/About.tsx` - Verification only

### New Files to Create:
1. `src/components/charts/TaxaBarChart.tsx` - New custom component

### Files to Reference (Don't Modify):
1. `src/components/HexagonMap.tsx` - Already correct
2. `src/pages/Tracks.tsx` - Reference implementation
3. `src/components/charts/DonutChart.tsx` - Already correct
4. `src/components/charts/TimeSeriesChart.tsx` - Already correct
5. `src/components/charts/RadarChart.tsx` - Already correct
6. `src/components/charts/StackedBarChart.tsx` - Already correct
7. `src/components/charts/TreemapChart.tsx` - Already correct

---

## Success Criteria

The React app will be considered complete when:

1. ✅ Home page shows DeckGL hexagon heatmap (not Leaflet)
2. ✅ All donut charts are visible with correct colors
3. ✅ Market page has all 4 components (time series, radar, cards, table)
4. ✅ Composition page has all 3 charts (treemap, stacked bar, taxa bar)
5. ✅ All pages match Shiny layout exactly
6. ✅ All charts use native ApexCharts (no custom styling)
7. ✅ All colors match defined palettes
8. ✅ All text uses i18n keys (no hardcoded strings)
9. ✅ Municipality filter works and persists
10. ✅ No console errors or warnings

---

## Estimated Effort

| Task | Complexity | Est. Time |
|------|------------|-----------|
| Verify Home page | Low | 30 min |
| Fix donut visibility | Low | 1 hour |
| Market time series | Low | 1 hour |
| Market cards | Medium | 2 hours |
| Market table | Low | 30 min |
| Composition stacked bar | Medium | 2 hours |
| Composition taxa bar | High | 3 hours |
| Verification & testing | Medium | 2 hours |
| i18n extraction | Low | 1 hour |
| **Total** | | **~13 hours** |

---

## Notes

- Home page hexagon map appears to already be using `HexagonMap` component in latest code
- The issue may be user seeing cached version or data loading problem
- DonutChart component implementation looks correct - visibility issue likely CSS or data-related
- Market page has radar chart implemented but missing other components
- StackedBarChart component exists and can be reused
- TaxaBarChart is a custom implementation needed for interactive highlighting
- All color palettes are already defined correctly
- FilterContext is implemented and working
- Main work is adding missing visualizations and verifying existing ones
