# Proper Fix Plan - Professional React App

## Root Cause Analysis

**Error:** `<rect> attribute height: A negative value is not valid`

This means ApexCharts is rendering in containers with NO HEIGHT or COLLAPSED HEIGHT.

## The Problem with Current Approach

❌ **WRONG:** Using inline `style={{ minHeight: '20rem' }}` everywhere
❌ **WRONG:** Hardcoded pixel heights
❌ **WRONG:** Charts collapsing because card-body has no intrinsic height

## The Professional Solution

### 1. Let Charts Define Their Own Height Dynamically

ApexCharts should handle its own height through the `height` prop. The container should ADAPT to the chart, not the other way around.

**Key insight:** When we pass `height="400"` to ApexChart, it creates an SVG that is 400px tall. The card-body must NOT interfere with this.

### 2. Use Proper ApexCharts Height Pattern

```tsx
// PROFESSIONAL APPROACH
<div className="card">
  <div className="card-body">
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={350}  // Pass NUMBER (pixels), not string
    />
  </div>
</div>
```

### 3. Fix Card Body Padding Issues

The issue is that ApexCharts calculates its internal dimensions based on container size, but card-body has padding that interferes.

**Solution:** Use proper padding configuration in ApexCharts options:

```tsx
grid: {
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
}
```

## Systematic Fixes Required

### Fix 1: Convert All Height Strings to Numbers

**Current (WRONG):**
```tsx
<TimeSeriesChart height="21rem" />
```

**Fixed (RIGHT):**
```tsx
<TimeSeriesChart height={350} />
```

### Fix 2: Remove All Inline minHeight Styles

**Current (WRONG):**
```tsx
<div className="card-body" style={{ minHeight: '22rem' }}>
```

**Fixed (RIGHT):**
```tsx
<div className="card-body">
```

### Fix 3: Ensure Proper Chart Options

All chart components must have:
```tsx
chart: {
  height: 'auto',  // Let ApexCharts control height
  parentHeightOffset: 0,
  toolbar: { show: false },
  animations: { enabled: false },
}
```

### Fix 4: Check Data Before Rendering

ApexCharts fails with empty data. Must check:
```tsx
{data && data.length > 0 && (
  <Chart data={data} height={350} />
)}
```

## Implementation Plan

### Phase 1: Fix All Chart Components (1 hour)

**Files to modify:**
1. `src/components/charts/TimeSeriesChart.tsx`
2. `src/components/charts/DonutChart.tsx`
3. `src/components/charts/RadarChart.tsx`
4. `src/components/charts/TreemapChart.tsx`
5. `src/components/charts/StackedBarChart.tsx`
6. `src/components/charts/RegionCompositionChart.tsx`
7. `src/components/charts/TaxaBarChart.tsx`

**Changes needed:**
- Accept `height` as `number` (not string)
- Add proper `parentHeightOffset: 0`
- Remove any height calculations
- Add proper grid padding

### Phase 2: Fix All Page Layouts (1 hour)

**Files to modify:**
1. `src/pages/Home.tsx`
2. `src/pages/Catch.tsx`
3. `src/pages/Revenue.tsx`
4. `src/pages/Market.tsx`
5. `src/pages/Composition.tsx`
6. `src/pages/Nutrients.tsx`

**Changes needed:**
- Remove all inline `style={{ minHeight }}`
- Pass numeric heights to charts
- Ensure data checks before rendering
- Use proper Tabler grid classes

### Phase 3: Compare with Shiny Structure (1 hour)

For EACH page, verify:
- Layout matches Shiny exactly (column widths)
- Components in correct order
- Filters in correct positions
- No missing visualizations

## Standard Heights (in pixels)

These should be CONSISTENT across the app:

```typescript
const CHART_HEIGHTS = {
  timeSeries: 350,      // Time series charts
  radar: 380,           // Radar/spider charts
  donut: 280,           // Donut charts
  treemap: 450,         // Treemap charts
  stackedBar: 380,      // Stacked bar charts
  horizontalBar: 400,   // Horizontal bars
  taxaBar: 400,         // Taxa bar chart
  map: 420,             // Hexagon maps (Home)
  trackMap: 650,        // Hexagon maps (Tracks)
}
```

## Testing Checklist

After fixes, verify:
- [ ] No console errors about negative heights
- [ ] All charts render with proper dimensions
- [ ] Cards are not collapsed or squeezed
- [ ] Layout is responsive
- [ ] Matches Shiny visually
- [ ] Professional appearance

## Key Principles

1. **Dynamic Layouts:** Use Tabler's responsive grid, not fixed heights
2. **Chart Self-Sizing:** Charts control their own height via props
3. **Clean Code:** No inline styles, no workarounds
4. **Data Validation:** Always check data exists before rendering
5. **Consistency:** Use standard heights across similar chart types

---

## Next Actions

1. Fix ALL chart components to accept numeric heights
2. Remove all inline minHeight hacks from pages
3. Test each page individually
4. Compare with Shiny side-by-side
5. Document final structure
