# Shiny to React Conversion Analysis

## Overview

This document maps the Shiny app structure (`peskas.timor.portal/R/`) to React components for the new portal (`peskas.timor.portal.v2/`).

---

## App Structure

### Main Entry Points
- **app_ui.R** - Main UI structure with Tabler page layout
- **app_server.R** - Server logic, data loading, module connections

### Navigation Structure

The app has 7 main tabs (2 are commented out in production):

| Tab ID | Label (i18n key) | Shiny Module | Status |
|--------|------------------|--------------|--------|
| `home` | `pars.header.nav.home.text` | `tab_home_content.R` | Active |
| `catch` | `pars.header.nav.catch.text` | `tab_catch_content.R` | Active |
| `revenue` | `pars.header.nav.revenue.text` | `tab_revenue_content.R` | Active |
| `market` | `pars.header.nav.market.text` | `tab_market_content.R` | Active |
| `catch-composition` | `pars.header.nav.composition.text` | `tab_catch_composition.R` | Active |
| `nutrients` | `pars.header.nav.nutrients.text` | `tab_nutrients_content.R` | Active |
| `about` | `pars.header.nav.about.text` | `timor_about.R` | Active |
| ~~`pds_tracks`~~ | ~~`pars.header.nav.pds_tracks.text`~~ | ~~`tab_tracks_content.R`~~ | Disabled |

---

## Tab Modules Mapping

### 1. Home Tab (`tab_home_content.R`)

**Layout:**
- Intro text with title and content (from `pars.home.intro`)
- Download report button linking to data_report.html
- Grid layout with:
  - Fishing map (hexagon heatmap - DeckGL)
  - 3 donut charts (trips, revenue, fish)
  - Summary table

**Components:**
| Shiny Component | React Component | Data Source |
|-----------------|-----------------|-------------|
| `home_text()` | `HomeIntro` | `pars.home.intro` |
| `fishing_map_ui` | `FishingHeatmap` | `predicted_tracks.json` |
| `apex_summary_ui("donut_trips")` | `DonutChart` | `summary_data.n_surveys` |
| `apex_summary_ui("donut_revenue")` | `DonutChart` | `summary_data.estimated_revenue` |
| `apex_summary_ui("donut_fish")` | `DonutChart` | `summary_data.estimated_tons` |
| `mod_table_react_ui("home_table")` | `HomeTable` | `municipal_aggregated.json` |

**Donut Chart Colors:**
```javascript
// trips & revenue
["#d7eaf3", "#77b5d9", "#14397d"]

// fish (viridis 5)
["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"]
```

---

### 2. Revenue Tab (`tab_revenue_content.R`)

**Layout:**
- Page heading with pretitle and title
- Municipality dropdown filter
- Main chart area (8 cols) with time series + brush
- Side cards (4 cols) with metrics
- Treemap by habitat
- Summary table
- Variable descriptions

**Components:**
| Shiny Component | React Component | Data Source |
|-----------------|-----------------|-------------|
| `mun_select()` | `MunicipalitySelect` | `municipal_aggregated.regions` |
| `mod_highlight_mun_ui` | `TimeSeriesChart` | `aggregated.json` |
| `mod_summary_card_ui2` | `SummaryCard` | `aggregated.json` |
| `mod_summary_card_ui3` | `SummaryCard` | `aggregated.json` |
| `mod_simple_summary_card_ui` | `SimpleCard` | `aggregated.json` |
| `mod_normalized_treemap_ui` | `Treemap` | `summary_data.revenue_habitat` |
| `mod_summary_table_ui` | `SummaryTable` | `aggregated.json` |
| `mod_var_descriptions_ui` | `VariableDescriptions` | `var_dictionary.json` |

**Variables used:** `revenue`, `recorded_revenue`, `landing_revenue`, `n_landings_per_boat`, `n_boats`

---

### 3. Catch Tab (`tab_catch_content.R`)

**Layout:** Same as Revenue tab but with catch-specific variables.

**Variables used:** `catch`, `recorded_catch`, `landing_weight`, `n_landings_per_boat`, `n_boats`

**Treemap data:** `summary_data.catch_habitat`

---

### 4. Market Tab (`tab_market_content.R`)

**Layout:**
- Page heading
- Municipality filter
- Time series chart (8 cols)
- Spider/radar chart + summary cards (4 cols)
- Conservation region stacked bar chart
- Summary table
- Variable descriptions

**Components:**
| Shiny Component | React Component | Data Source |
|-----------------|-----------------|-------------|
| `apex_spider_server` | `RadarChart` | `municipal_aggregated.json` |
| `mod_region_conservation_ui` | `StackedBarChart` | `summary_data.conservation` |

**Variables used:** `price_kg`, `landing_weight`, `n_landings_per_boat`

**Spider chart colors:** `["#c57b57", "#96BDC6"]`

---

### 5. Catch Composition Tab (`tab_catch_composition.R`)

**Layout:**
- Page heading
- Taxa table (reactable)
- Region composition stacked bar
- Taxa bar highlight chart
- Variable descriptions

**Components:**
| Shiny Component | React Component | Data Source |
|-----------------|-----------------|-------------|
| `mod_table_react_ui("taxa-table")` | `TaxaTable` | `taxa_aggregated.json` |
| `mod_region_composition_ui` | `StackedBarChart` | `municipal_taxa.json` |
| `mod_taxa_bar_highlight_ui` | `TaxaBarChart` | `taxa_aggregated.json` |

**Taxa colors (viridis):**
```javascript
// Length based on pars.taxa.to_display (13 items)
viridis(13).map(c => c.substring(0, 7))
```

---

### 6. Nutrients Tab (`tab_nutrients_content.R`)

**Layout:**
- Page heading
- Nutrients highlight card (stacked bar by nutrient)
- Nutrient treemap (average per catch)
- Habitat treemap (by nutrient supply)
- Variable descriptions

**Components:**
| Shiny Component | React Component | Data Source |
|-----------------|-----------------|-------------|
| `mod_nutrients_highlight_card_ui` | `NutrientsStackedBar` | `nutrients_aggregated.json` |
| `mod_nutrient_treemap_ui` | `Treemap` | `summary_data.nutrients_per_catch` |
| `mod_normalized_treemap_ui` | `Treemap` | `summary_data.nutrients_habitat` |

**Nutrient names:** `["Protein", "Zinc", "Vitamin A", "Calcium", "Omega-3", "Iron"]`

---

### 7. Tracks Tab (`tab_tracks_content.R`) - DISABLED

**Layout:**
- Page heading
- Leaflet map with filters
- Variable descriptions

**Components:**
| Shiny Component | React Component | Data Source |
|-----------------|-----------------|-------------|
| `leaflet_map_ui` | `LeafletMap` | `indicators_grid.json` |

**Map settings:**
- Center: `lat: -8.75, lng: 125.7`
- Zoom: `8`
- Provider tiles: `CartoDB.Positron`

---

## Chart Types & Libraries

### ApexCharts (primary visualization library)

| Chart Type | Shiny Function | React Implementation |
|------------|----------------|---------------------|
| Donut | `apex_donut()` | ApexCharts `type: "donut"` |
| Bar | `apex_bar()` | ApexCharts `type: "bar"` |
| Treemap | `apex_treemap()` | ApexCharts `type: "treemap"` |
| Radar/Spider | `apex_spider()` | ApexCharts `type: "radar"` |
| Stacked Bar | `apex_bar_stacked()` | ApexCharts `type: "bar"` with `stacked: true` |
| Time Series | `plot_timeseries()` | ApexCharts `type: "area"` or `"bar"` |

### DeckGL (3D map)

| Component | Shiny Function | React Implementation |
|-----------|----------------|---------------------|
| Hexagon Heatmap | `fishing_map_server()` | `@deck.gl/react` HexagonLayer |

### Leaflet (2D map - disabled)

| Component | Shiny Function | React Implementation |
|-----------|----------------|---------------------|
| Circle Markers Map | `leaflet_map_server()` | `react-leaflet` |

---

## Color Palettes

### 1. Habitat Palette
```javascript
const habitatPalette = [
  "#440154", "#30678D", "#35B778", "#FDE725", 
  "#FCA35D", "#D32F2F", "#67001F"
];
```

### 2. Tab/Table Palette
```javascript
const tabPalette = ["#ffffff", "#f2fbd2", "#c9ecb4", "#93d3ab", "#35b0ab"];
```

### 3. Donut Charts (trips/revenue)
```javascript
const donutBlue = ["#d7eaf3", "#77b5d9", "#14397d"];
```

### 4. Spider/Radar Chart
```javascript
const spiderColors = ["#c57b57", "#96BDC6"];
```

### 5. Viridis (dynamic based on item count)
```javascript
import { viridis } from 'd3-scale-chromatic';
// For fish donut: viridis(5)
// For taxa: viridis(13)
// For conservation: viridis(5)
```

### 6. Heatmap Color Range
```javascript
const heatmapColors = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];
```

---

## Data Files Mapping

| Shiny R Object | JSON File | Usage |
|----------------|-----------|-------|
| `peskas.timor.portal::municipal_aggregated` | `municipal_aggregated.json` | Home table, filters |
| `peskas.timor.portal::summary_data` | `summary_data.json` | Donuts, treemaps, conservation |
| `peskas.timor.portal::taxa_aggregated` | `taxa_aggregated.json` | Composition tab |
| `peskas.timor.portal::municipal_taxa` | `municipal_taxa.json` | Region composition |
| `peskas.timor.portal::nutrients_aggregated` | `nutrients_aggregated.json` | Nutrients stacked bar |
| `peskas.timor.portal::taxa_names` | `taxa_names.json` | Taxa display names |
| `peskas.timor.portal::indicators_grid` | `indicators_grid.json` | Leaflet map (disabled) |
| `peskas.timor.portal::predicted_tracks` | `predicted_tracks.json` | Hexagon heatmap |
| `peskas.timor.portal::label_groups_list` | `label_groups_list.json` | Fish group filters |
| `peskas.timor.portal::var_dictionary` | `var_dictionary.json` | Variable descriptions |
| `peskas.timor.portal::data_last_updated` | `data_last_updated.json` | Footer timestamp |
| `pars` (from `app_params.yml`) | `pars.json` | i18n, config |

---

## Reusable UI Modules

### Card Components
| Shiny Function | Description | React Component |
|----------------|-------------|-----------------|
| `highlight_card()` | Card with heading and chart body | `ChartCard` |
| `highlight_card_narrow()` | Card with heading, subheading, chart | `ChartCardNarrow` |
| `apex_summary_ui()` | Simple card wrapper for ApexChart | `SummaryChartCard` |

### Page Components
| Shiny Function | Description | React Component |
|----------------|-------------|-----------------|
| `page_heading()` | Pretitle + title section | `PageHeading` |
| `page_cards()` | Grid container for cards | `PageCards` (CSS Grid) |
| `mun_select()` | Municipality dropdown | `MunicipalitySelect` |

---

## i18n Keys Structure

All text comes from `pars.json`:

```
pars.header.subtitle.text
pars.header.nav.[tab].text
pars.home.intro.title
pars.home.intro.content
pars.home.report.text
pars.catch.subtitle.text
pars.revenue.title.text
pars.revenue.area_dropdown.text
pars.revenue.table.heading.text
pars.revenue.description.heading.text
pars.revenue.description.content.text
pars.revenue.description.subheading.text
pars.vars.[varname].short_name
pars.vars.[varname].description
pars.footer.update_time.text
pars.footer.nav.code.text
```

---

## React Component Structure (Proposed)

```
src/
├── components/
│   ├── charts/
│   │   ├── DonutChart.tsx
│   │   ├── TimeSeriesChart.tsx
│   │   ├── Treemap.tsx
│   │   ├── RadarChart.tsx
│   │   ├── StackedBarChart.tsx
│   │   └── TaxaBarChart.tsx
│   ├── maps/
│   │   ├── FishingHeatmap.tsx
│   │   └── LeafletMap.tsx
│   ├── cards/
│   │   ├── ChartCard.tsx
│   │   ├── SummaryCard.tsx
│   │   └── SimpleCard.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PageHeading.tsx
│   │   └── TabMenu.tsx
│   ├── filters/
│   │   ├── MunicipalitySelect.tsx
│   │   └── DateRangeSlider.tsx
│   └── tables/
│       ├── HomeTable.tsx
│       ├── TaxaTable.tsx
│       └── SummaryTable.tsx
├── pages/
│   ├── Home.tsx
│   ├── Revenue.tsx
│   ├── Catch.tsx
│   ├── Market.tsx
│   ├── Composition.tsx
│   ├── Nutrients.tsx
│   └── About.tsx
├── hooks/
│   ├── useData.ts
│   └── useI18n.ts
├── types/
│   └── data.ts
├── utils/
│   ├── colors.ts
│   └── formatters.ts
└── data/
    └── (loaded from public/data/)
```

---

## Key Implementation Notes

1. **ApexCharts Config**: Disable animations in production for performance (`animations: { enabled: false }`)

2. **Time Series with Brush**: The revenue/catch/market tabs use a main chart + brush chart pattern. Use ApexCharts' brush feature.

3. **Map Center**: All maps centered on `lat: -8.75, lng: 125.7` with zoom `8`

4. **Number Formatting**: Use `d3-format` for number formatting matching the Shiny patterns:
   - `$,.2r` - currency with 2 significant figures
   - `,.2r` - number with 2 significant figures
   - `.1%` - percentage

5. **Debouncing**: Municipality filter uses 500ms debounce in Shiny

6. **Data Multipliers**: Some variables have multipliers in pars.json (e.g., catch: 0.001 to convert to tons)
