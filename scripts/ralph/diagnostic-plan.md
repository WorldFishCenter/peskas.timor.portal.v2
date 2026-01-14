# Diagnostic and Fix Plan - Charts Not Displaying

## Problem Statement
User reports:
1. Plots are not showing
2. When they seem to work, hosting cards look squeezed
3. Divergences from Shiny app in tab population

## Investigation Steps

### 1. Check ApexCharts Initialization
- [ ] Verify ApexCharts library loaded correctly
- [ ] Check if chart containers have proper dimensions
- [ ] Verify data is actually reaching the chart components

### 2. Check Card Layout Issues
Possible causes of "squeezed" cards:
- [ ] Missing `minHeight` on card-body elements
- [ ] Charts with `height="20rem"` but card-body collapsing
- [ ] Row/column grid issues
- [ ] Missing padding/spacing

### 3. Compare Shiny vs React Structure Page by Page

#### Home Page Shiny Structure:
```
- Intro text + download button
- Hexagon map (full width card)
- 3 donut charts (col-4 each)
- Summary table (full width)
```

#### Catch Page Shiny Structure:
```
- Time series (col-8) | 3 metric cards (col-4)
- Summary table (full width)
```

#### Revenue Page Shiny Structure:
```
- Time series (col-8) | 3 metric cards (col-4)
- Treemap (col-6) | Radar chart (col-6)
- Summary table (full width)
```

#### Market Page Shiny Structure:
```
- Time series (col-8) | 3 metric cards (col-4)
- Radar chart (col-6) | Conservation stacked bar (col-6)
- Summary table (full width)
```

#### Composition Page Shiny Structure:
```
- Treemap (full width)
- Region stacked bar (full width)
- Taxa bar (col-7) | Variable descriptions (col-5)
```

#### Nutrients Page Shiny Structure:
```
- Horizontal bar chart (full width)
```

## Common Issues to Fix

### Issue 1: Chart Container Height
ApexCharts needs explicit container height. Must ensure:
```tsx
// WRONG
<div className="card-body">
  <ReactApexChart height="20rem" />
</div>

// RIGHT
<div className="card-body" style={{ minHeight: '22rem' }}>
  <ReactApexChart height="20rem" />
</div>
```

### Issue 2: Missing Data Checks
Charts fail silently if data is empty:
```tsx
// Need to check
{data && data.length > 0 ? (
  <Chart data={data} />
) : (
  <div>No data</div>
)}
```

### Issue 3: Grid Layout
Must use proper Tabler grid:
```tsx
<div className="row row-deck row-cards">
  <div className="col-lg-8">...</div>
  <div className="col-lg-4">...</div>
</div>
```

## Fix Plan

### Phase 1: Add Proper Card Heights
- [ ] Add `minHeight` to all card-body elements containing charts
- [ ] Ensure chart height + padding fits within card

### Phase 2: Fix Chart Data Loading
- [ ] Add console.log to verify data is loaded
- [ ] Add proper null/undefined checks
- [ ] Show loading states correctly

### Phase 3: Fix Layout Structure
- [ ] Review each page layout vs Shiny
- [ ] Ensure proper col-* classes
- [ ] Fix any nested row issues

### Phase 4: Debug Specific Charts
- [ ] Donut charts (Home)
- [ ] Time series (Catch, Revenue, Market)
- [ ] Radar charts (Revenue, Market)
- [ ] Treemaps (Revenue, Composition)
- [ ] Stacked bars (Market, Composition)
- [ ] Taxa bar (Composition)

## Testing Checklist

For each page, verify:
- [ ] Data loads (check console)
- [ ] Chart renders (visible on screen)
- [ ] Card has proper height (not collapsed)
- [ ] No console errors
- [ ] Layout matches Shiny
