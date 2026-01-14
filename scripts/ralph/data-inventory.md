# Data Files Inventory

All Shiny RDA data files have been converted to JSON and are available in `public/data/`.

## Available Data Files

| Shiny RDA File | JSON File | Size | Description |
|----------------|-----------|------|-------------|
| `data/aggregated.rda` | `aggregated.json` | 981K | Main aggregated fisheries data |
| `data/var_dictionary.rda` | `data_last_updated.json` | 22B | Last data update timestamp |
| - | `indicators_grid.json` | 573K | Grid of indicators for display |
| - | `label_groups_list.json` | 867B | Label groupings |
| - | `municipal_aggregated.json` | 414K | Municipality-level aggregated data |
| - | `municipal_taxa.json` | 2.7M | Taxa data by municipality |
| - | `nutrients_aggregated.json` | 123K | Nutrient composition data |
| - | `pars.json` | 28K | Parameters and configuration |
| `data/predicted_tracks.rda` | `predicted_tracks.json` | 6.5M | Fishing vessel track predictions |
| - | `summary_data.json` | 2.7M | Summary statistics |
| - | `taxa_aggregated.json` | 340K | Aggregated taxa data |
| - | `taxa_names.json` | 1.0K | Taxa name mappings |
| `data/var_dictionary.rda` | `var_dictionary.json` | 3.4K | Variable dictionary/metadata |

## Total Data Size
~15MB total

## Next Steps for Ralph

1. In US-002, Ralph should:
   - Sample each JSON file to understand structure
   - Create TypeScript interfaces matching the JSON structure
   - Create data loading utilities (hooks/functions)
   - Map Shiny data variable names to React usage

2. Key files to analyze in Shiny app:
   - `R/data_*.R` files show how data is loaded/processed
   - Look for variable transformations and filters
   - Note any data aggregations done in R

## Notes
- Data files were converted from R's RDA format to JSON
- Check if any data transformations need to be replicated in TypeScript
- Verify data types (dates, numbers, strings) are correctly formatted in JSON
