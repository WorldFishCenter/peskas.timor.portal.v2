# Data Mapping: Shiny R Objects to TypeScript Types

This document maps the Shiny R data objects to their corresponding JSON files and TypeScript interfaces.

## Data Files Overview

| JSON File | Shiny R Object | TypeScript Type | Description |
|-----------|----------------|-----------------|-------------|
| `aggregated.json` | `aggregated` | `AggregatedData` | National-level time series with landings, catch, revenue by day/week/month/year |
| `municipal_aggregated.json` | `region_aggregated` | `MunicipalAggregatedRecord[]` | Municipal-level time series data |
| `taxa_aggregated.json` | `taxa_aggregated` | `TaxaAggregatedData` | Catch by taxa over time |
| `municipal_taxa.json` | `municipal_taxa` | `MunicipalTaxaRecord[]` | Municipal catch by taxa |
| `nutrients_aggregated.json` | `nut_aggregated` | `NutrientsAggregatedData` | Nutrient supply and RDI data |
| `summary_data.json` | Multiple R objects | `SummaryData` | Pre-computed summary statistics |
| `indicators_grid.json` | `track_grid` | `IndicatorsGridRecord[]` | Fishing indicators on geographic grid |
| `predicted_tracks.json` | `predicted_tracks` | `PredictedTrackRecord[]` | GPS track points for map |
| `taxa_names.json` | `taxa_list` | `TaxaName[]` | Taxa code to name mapping |
| `label_groups_list.json` | `labels_group_list` | `LabelGroupsList` | Fish groups and their species |
| `var_dictionary.json` | `vars` | `VarDictionary` | Variable metadata and formatting |
| `pars.json` | `pars` | `ParsData` | App parameters, i18n text, configurations |
| `data_last_updated.json` | `data_last_updated` | `string` | Timestamp of last data update |

## Detailed Type Mappings

### aggregated.json → AggregatedData

Structure: Object with `day`, `week`, `month`, `year` arrays

| R Field | TS Field | Type | Description |
|---------|----------|------|-------------|
| `date_bin_start` | `date_bin_start` | `string` | ISO date string |
| `n_landings` | `n_landings` | `number` | Number of surveyed landings |
| `prop_landings_woman` | `prop_landings_woman` | `number?` | Proportion with women |
| `fuel` | `fuel` | `number?` | Average fuel used |
| `n_tracks` | `n_tracks` | `number` | Number of GPS tracks |
| `n_matched` | `n_matched` | `number` | Matched tracks count |
| `prop_matched` | `prop_matched` | `number` | Proportion matched |
| `recorded_revenue` | `recorded_revenue` | `number?` | Recorded revenue in USD |
| `recorded_catch` | `recorded_catch` | `number?` | Recorded catch in kg |
| `n_boats` | `n_boats` | `number` | Total boats |
| `day/week/month` | `day/week/month` | `string?` | Formatted date label |

### municipal_aggregated.json → MunicipalAggregatedRecord[]

| R Field | TS Field | Type | Description |
|---------|----------|------|-------------|
| `region` | `region` | `string` | Municipality name |
| `is_imputed` | `is_imputed` | `boolean` | Whether data is imputed |
| `n_landings_per_boat` | `n_landings_per_boat` | `number` | Trips per boat |
| `landing_revenue` | `landing_revenue` | `number` | Average trip value |
| `landing_weight` | `landing_weight` | `number` | Average catch per trip |
| `price_kg` | `price_kg` | `number` | Price per kg |
| `revenue` | `revenue` | `number` | Total estimated revenue |
| `catch` | `catch` | `number` | Total estimated catch |

### summary_data.json → SummaryData

Pre-computed summary statistics for home page:

| Section | TS Type | Description |
|---------|---------|-------------|
| `n_surveys` | `SurveyCountByArea[]` | Survey counts by area |
| `estimated_tons` | `EstimatedTonsByGroup[]` | Catch by fish group |
| `estimated_revenue` | `EstimatedRevenueByArea[]` | Revenue by area |
| `catch_habitat` | `HabitatSeries[]` | Catch treemap data |
| `revenue_habitat` | `HabitatSeries[]` | Revenue treemap data |
| `regional_revenue_donut` | `RegionalDonut[]` | Revenue donut chart |
| `regional_catch_donut` | `RegionalDonut[]` | Catch donut chart |
| `regional_landings_donut` | `RegionalDonut[]` | Landings donut chart |
| `habitat_radar` | `HabitatRadar[]` | Radar chart data |
| `conservation_methods` | `ConservationMethods[]` | Fish storage methods |
| `portfolio_data` | `PortfolioData[]` | Catch/revenue portfolio |
| `map_center` | `[number, number][]?` | Map center coordinates |

### pars.json → ParsData

App configuration and i18n text:

| Section | Description |
|---------|-------------|
| `vars` | Variable definitions with formatting |
| `taxa` | Taxa codes and display names |
| `conservation` | Conservation method names |
| `header` | Header navigation text |
| `footer` | Footer text and links |
| `home` | Home page text content |
| `revenue` | Revenue page text |
| `catch` | Catch page text |
| `composition` | Composition page text |
| `market` | Market page text |
| `pds_tracks` | Tracks page text |
| `nutrients` | Nutrients page text |
| `indicators` | Indicators metadata text |
| `settings` | Settings modal text |
| `about` | About page markdown |

## Data Loading Utilities

### Basic fetch (async function)

```typescript
import { fetchData } from '../utils/dataLoader';

async function loadData() {
  const aggregated = await fetchData('aggregated');
  // Type: AggregatedData - automatically inferred from file name
  console.log(aggregated.month.length); // Type-safe access
}
```

### React hook - Single file

```typescript
import { useData } from '../hooks';

function MyComponent() {
  const { data, loading, error, refetch } = useData('aggregated');
  
  if (loading) return <div className="spinner-border" />;
  if (error) return <div className="alert alert-danger">{error.message}</div>;
  
  // data is AggregatedData - type-safe!
  return <Chart data={data.month} />;
}
```

### React hook - Multiple files

```typescript
import { useMultipleData } from '../hooks';

function HomePage() {
  const { data, loading, error, refetch } = useMultipleData([
    'summary_data',
    'pars',
    'aggregated'
  ]);
  
  if (loading) return <div className="spinner-border" />;
  if (error) return <div className="alert alert-danger">{error.message}</div>;
  
  // All data is type-safe
  const { summary_data, pars, aggregated } = data;
  // summary_data is SummaryData
  // pars is ParsData  
  // aggregated is AggregatedData
}
```

### Complete Example Component

See [src/components/DataTest.tsx](file:///Users/lore/Desktop/work/wf_projects/peskas.timor.portal.v2/src/components/DataTest.tsx) for a complete working example that:
- Loads data from 4 different JSON files (aggregated, summary_data, pars, taxa_names)
- Shows loading spinner while fetching
- Handles errors with retry button
- Displays data in a type-safe manner
- Uses Tabler UI components

Access the test page at `/data-test` in the development server.

## Value Formatting

Use `pars.vars[varName]` for formatting metadata:

```typescript
const formatValue = (varName: string, value: number, pars: ParsData) => {
  const config = pars.vars[varName];
  if (!config) return String(value);
  
  let result = value;
  if (config.multiplier) result *= config.multiplier;
  
  // Apply d3-format using config.format
  const formatted = d3Format(config.format)(result);
  
  return config.suffix ? `${formatted}${config.suffix}` : formatted;
};
```

## Multipliers (from pars.json)

| Variable | Multiplier | Suffix | Note |
|----------|------------|--------|------|
| `catch` | 0.001 | ` t` | kg → tonnes |
| `recorded_catch` | 0.001 | ` t` | kg → tonnes |
| `nut_supply` | 0.001 | ` Kg` | g → kg |
| `nut_rdi` | 0.001 | ` k` | → thousands |

## Map Configuration

From progress.txt and pars.json:
- **Center**: `lat: -8.75, lng: 125.7`
- **Zoom**: `8`
