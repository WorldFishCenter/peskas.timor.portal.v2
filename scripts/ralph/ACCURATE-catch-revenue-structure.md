# ACCURATE Catch and Revenue Page Structure Analysis

## Catch Page - Exact Shiny Structure

### Layout (from `tab_catch_content.R`):

1. **Header Row:**
   - Municipality dropdown filter (`mun_select`)

2. **Row 1:** `col-lg-8` + `col-lg-4`
   - **Left (col-lg-8):** Time series chart
     - ID: `catch-card-mun`
     - Height: `21rem` (336px)
     - Variable: `catch` (tons)
     - Period: `month`, Last 12 months
   - **Right (col-lg-4):** 3 summary cards (stacked vertically in `row row-cards`)
     - **Card 1:** `mod_summary_card_ui2`
       - Variable: `catch`
       - Shows: Total catch last 12 months with trend
     - **Card 2:** `mod_summary_card_ui3`
       - Variable: `landing_weight`
       - Shows: Average catch per trip with trend
     - **Card 3:** `mod_simple_summary_card_ui`
       - Variable: `n_boats`
       - Shows: Active boats last month with icon trend

3. **Row 2:** `col-12`
   - **Full Width Treemap:** `mod_normalized_treemap_ui`
     - ID: `habitat-catch`
     - Height: `28rem` (448px)
     - Data: `summary_data$catch_habitat`
     - Title: From `pars$catch$treemap$title`
     - Description: From `pars$catch$treemap$description`
     - Format: Habitat: Gear combinations (e.g., "Reef: Spear Gun", "Deep: Hand Line")
     - Y-axis formatter: `,.2f Kg`

4. **Row 3:** `col-lg-7` + `col`
   - **Left (col-lg-7):** Summary Table
     - ID: `catch-card-mun`
     - Variables: `catch`, `recorded_catch`, `landing_weight`, `n_landings_per_boat`
     - Has year dropdown filter
     - Has footer showing totals
   - **Right (col):** Variable Descriptions
     - ID: `catch-info`
     - Variables described: `catch`, `recorded_catch`, `landing_weight`, `n_landings_per_boat`, `n_boats`
     - Heading: From `pars$revenue$description$heading$text`
     - Content: From `pars$revenue$description$content$text`
     - Subheading: From `pars$revenue$description$subheading$text`

---

## Revenue Page - Exact Shiny Structure

### Layout (from `tab_revenue_content.R`):

1. **Header Row:**
   - Municipality dropdown filter (`mun_select`)

2. **Row 1:** `col-lg-8` + `col-lg-4`
   - **Left (col-lg-8):** Time series chart
     - ID: `revenue-card-mun`
     - Height: `21rem` (336px)
     - Variable: `revenue` (millions USD)
     - Period: `month`, Last 12 months
   - **Right (col-lg-4):** 3 summary cards (stacked vertically in `row row-cards`)
     - **Card 1:** `mod_summary_card_ui2`
       - Variable: `landing_revenue`
       - Shows: Total revenue last 12 months with trend
     - **Card 2:** `mod_summary_card_ui3`
       - Variable: `n_landings_per_boat`
       - Shows: Average landings per boat with trend
     - **Card 3:** `mod_simple_summary_card_ui`
       - Variable: `n_boats`
       - Shows: Active boats last month with icon trend

3. **Row 2:** `col-12`
   - **Full Width Treemap:** `mod_normalized_treemap_ui`
     - ID: `habitat-revenue`
     - Height: `28rem` (448px)
     - Data: `summary_data$revenue_habitat`
     - Title: From `pars$revenue$treemap$title`
     - Description: From `pars$revenue$treemap$description`
     - Format: Habitat: Gear combinations (e.g., "Deep: Spear Gun", "Reef: Hand Line")
     - Y-axis formatter: `$,.2f`

4. **Row 3:** `col-lg-7` + `col`
   - **Left (col-lg-7):** Summary Table
     - ID: `revenue-card-mun`
     - Variables: `revenue`, `recorded_revenue`, `landing_revenue`, `n_landings_per_boat`
     - Has year dropdown filter
     - Has footer showing totals/averages
   - **Right (col):** Variable Descriptions
     - ID: `revenue-info`
     - Variables described: `revenue`, `recorded_revenue`, `landing_revenue`, `n_landings_per_boat`, `n_boats`
     - Heading: From `pars$revenue$description$heading$text`
     - Content: From `pars$revenue$description$content$text`
     - Subheading: From `pars$revenue$description$subheading$text`

---

## Current React Implementation Issues

### Catch Page (`src/pages/Catch.tsx`):

**Row 1:** ✅ CORRECT
- col-lg-8 time series + col-lg-4 with 3 cards

**Row 2:** ❌ WRONG
- Current: `col-12` with simple HTML table showing month/catch/trips
- Should be: `col-12` **Treemap** showing habitat-gear combinations

**Row 3:** ❌ MISSING COMPLETELY
- Should have: `col-lg-7` Summary table + `col` Variable descriptions

**Summary Cards Content:** ⚠️ NEEDS VERIFICATION
- Card 1: Shows "Total catch" - ✅ Correct
- Card 2: Shows "Catch per trip" - ✅ Correct (landing_weight)
- Card 3: Shows "Active boats" - ✅ Correct

**Table Content:** ❌ COMPLETELY WRONG
- Current: Simple 3-column table (Month, Catch, Trips) - top 12 rows only
- Should be: Multi-column table with:
  - Period column (Month name, e.g., "January")
  - Catch column (formatted with suffix)
  - Recorded catch column
  - Landing weight column
  - Landings per boat column
  - Year dropdown filter
  - Footer with totals

### Revenue Page (`src/pages/Revenue.tsx`):

**Row 1:** ✅ CORRECT
- col-lg-8 time series + col-lg-4 with 3 cards

**Row 2:** ❌ COMPLETELY WRONG
- Current: `col-lg-6` Radar Chart + `col-lg-6` Treemap
- Should be: `col-12` **Treemap ONLY** (full width, no radar chart)
- **The Radar chart does NOT exist in the Shiny app**

**Row 3:** ❌ WRONG
- Current: `col-12` Summary table (full width)
- Should be: `col-lg-7` Summary table + `col` Variable descriptions

**Summary Cards Content:** ⚠️ NEEDS VERIFICATION
- Card 1: Shows "Total revenue" - Needs to verify metric calculation
- Card 2: Shows "Revenue per trip" - Needs to verify (should be `landing_revenue`)
- Card 3: Shows "Price per kg" - ❌ WRONG (should be `n_boats`)

**Table Content:** ❌ MISSING COLUMNS
- Current: Uses SummaryTable component (need to verify columns)
- Should be: Multi-column table with:
  - Period column
  - Revenue column
  - Recorded revenue column
  - Landing revenue column
  - Landings per boat column
  - Year dropdown filter
  - Footer with totals/averages

---

## Data Requirements

### Catch Habitat Treemap Data:
```json
{
  "catch_habitat": [
    {
      "name": "Reef",
      "data": [
        { "x": "Spear Gun", "y": 4.868 },
        { "x": "Gill Net", "y": 2.273 }
      ]
    },
    {
      "name": "Deep",
      "data": [
        { "x": "Spear Gun", "y": 2.895 },
        { "x": "Hand Line", "y": 2.261 }
      ]
    }
  ]
}
```

Should be flattened to:
```typescript
[
  { x: "Reef: Spear Gun", y: 4.868 },
  { x: "Reef: Gill Net", y: 2.273 },
  { x: "Deep: Spear Gun", y: 2.895 },
  { x: "Deep: Hand Line", y: 2.261 }
]
```

### Revenue Habitat Treemap Data:
Same structure as catch_habitat, but from `revenue_habitat` field.

---

## Critical Differences Summary

### Catch Page:
1. ❌ Treemap is completely missing (has wrong table instead)
2. ❌ Summary table has wrong columns (only 3 instead of 4+)
3. ❌ Variable descriptions section missing
4. ❌ Table has no year filter
5. ❌ Table has no footer with totals

### Revenue Page:
1. ❌ Radar chart should NOT exist (not in Shiny)
2. ❌ Treemap should be full width (col-12), not half width (col-lg-6)
3. ❌ Summary table wrong layout (col-12 instead of col-lg-7)
4. ❌ Variable descriptions section missing
5. ❌ Card 3 shows wrong metric (price_kg instead of n_boats)
6. ❌ Table may have wrong columns (needs verification)

---

## Implementation Priority

1. **Fix Treemaps:**
   - Add full-width treemap to Catch page (remove simple table)
   - Make Revenue treemap full-width (remove radar chart)
   - Ensure correct data flattening (Habitat: Gear format)

2. **Fix Summary Tables:**
   - Implement proper multi-column table for Catch (4 columns + period)
   - Verify/fix Revenue table columns (4 columns + period)
   - Add year dropdown filter
   - Add footer with totals

3. **Add Variable Descriptions:**
   - Create VariableDescriptions component
   - Add to both Catch and Revenue pages as `col` width
   - Pull content from pars.json

4. **Fix Revenue Cards:**
   - Card 3 should show n_boats, not price_kg
   - Verify Card 1 and Card 2 metrics match Shiny exactly

5. **Remove Incorrect Elements:**
   - Remove Radar chart from Revenue page entirely
