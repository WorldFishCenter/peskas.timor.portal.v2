# Missing Features Analysis - React vs Shiny

## Home Page
**Current State:**
- ✅ Intro text and download button
- ❌ **CRITICAL: Map is Leaflet, should be DeckGL hexagon heatmap** (like Tracks page)
- ❌ **Donut charts exist but may not be visible/styled correctly**
- ✅ Summary table exists

**What Needs to be Fixed:**
1. Replace FishingMap component with DeckGL HexagonLayer (reuse Tracks page implementation)
2. Load predicted_tracks.json for hexagon heatmap
3. Verify donut charts display correctly with proper colors
4. Apply viridis colors to fish donut (not donutBlue)

## Catch Page
**Current State:**
- ✅ Page structure and header
- ✅ Time series chart component exists
- ✅ Metric cards exist
- ✅ Summary table exists

**What Might Be Missing:**
- Time series chart may not be loading real data
- Metric cards may not show correct calculations
- Need to verify all visualizations display correctly

## Revenue Page
**Current State:**
- ✅ Page structure exists
- ❌ **Only has placeholder radar chart with dummy data**
- ❌ **Missing actual revenue time series chart**
- ❌ **Missing revenue breakdown visualizations**
- ❌ **Missing spider/radar chart with real data**
- ❌ **Missing summary cards and table**

**What Needs to be Built:**
1. Revenue time series chart (similar to Catch page)
2. Spider/radar chart with municipal_aggregated data
3. Revenue metric cards
4. Revenue summary table
5. Apply spiderColors palette

## Market Page
**Current State:**
- ✅ Page structure exists
- ❌ **Only has placeholder radar chart with dummy data**
- ✅ Conservation stacked bar chart added (recent)
- ❌ **Missing actual spider/radar chart with price_kg data**
- ❌ **Missing market summary cards**
- ❌ **Missing market table**

**What Needs to be Built:**
1. Spider/radar chart with real municipal_aggregated data (price_kg, landing_weight, n_landings_per_boat)
2. Market summary cards showing key metrics
3. Market summary table
4. Variable descriptions card

## Composition Page
**Current State:**
- ✅ Treemap chart with taxa data
- ❌ **Region composition stacked bar chart - placeholder only**
- ❌ **Taxa bar highlight chart - placeholder only**
- ✅ Variable descriptions card

**What Needs to be Built:**
1. Region composition stacked bar chart (municipal_taxa data)
2. Taxa bar highlight chart with hover interactions
3. Apply viridis colors to taxa visualizations

## Nutrients Page
**Current State:**
- ✅ Horizontal bar chart showing nutrients
- ✅ Proper data loading and aggregation

**Status:** Appears mostly complete, needs verification

## Tracks Page
**Current State:**
- ✅ DeckGL hexagon heatmap with predicted_tracks data
- ✅ Year filter added
- ✅ Proper heatmap colors applied

**Status:** Complete (this is the correct implementation for Home page map!)

## About Page
**Current State:**
- ✅ Basic structure with placeholder text
- ✅ Harvard Dataverse iframe embedded

**What Might Be Missing:**
- Need to verify content loads from pars.json correctly
- May need additional content sections

---

## Critical Issues Summary

### 1. HOME PAGE MAP (Highest Priority)
The Home page currently uses a basic Leaflet map but should use DeckGL hexagon heatmap (same as Tracks page). This is the most visible issue.

**Fix:** Replace `<FishingMap>` component with DeckGL HexagonLayer visualization from Tracks page.

### 2. REVENUE PAGE (High Priority)
Currently only has a placeholder radar chart. Needs complete rebuild with:
- Time series chart for revenue over time
- Spider/radar chart for multi-dimensional analysis
- Summary cards and tables

### 3. MARKET PAGE (High Priority)
Has placeholder radar chart. Needs:
- Real spider/radar chart with municipal data
- Summary cards
- Summary table

### 4. COMPOSITION PAGE (Medium Priority)
Missing 2 out of 3 main visualizations:
- Region composition stacked bar
- Taxa bar highlight chart

### 5. CATCH PAGE (Low Priority - Verify)
Appears mostly complete but needs verification that:
- Time series chart loads real data correctly
- Metrics calculate correctly
- Table displays properly

### 6. DONUT CHARTS (Verify)
User reports donut charts not visible on Home page. Need to verify:
- Charts render correctly
- Data loads properly
- Colors applied correctly (trips/revenue use donutBlue, fish uses viridis)
